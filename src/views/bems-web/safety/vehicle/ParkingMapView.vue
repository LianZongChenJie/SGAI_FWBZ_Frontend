<template>
  <div class="parking-map-wrapper">
    <div id="parkingMapContainer" class="map-container"></div>
    <!-- 缩放控制按钮 -->
    <div class="map-zoom-controls">
      <button class="zoom-btn" title="放大" @click="zoomIn">+</button>
      <button class="zoom-btn" title="缩小" @click="zoomOut">−</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { loadMapScripts } from '/@/components/map/loadMapScripts'
import type { ParkingSpaceStatVO } from './index.api'

const props = defineProps<{
  data: ParkingSpaceStatVO[]
}>()

// 地图相关状态
let map: any = null
let flid: string | null = null
let mapReady = false
let mapLoadCompleteHandler: (() => Promise<void>) | null = null
const markerArr: any[] = []
let openedInfoEl: HTMLElement | null = null
let mapContainer: HTMLElement | null = null
const mapScrollListeners: Array<{ target: EventTarget; name: string; handler: EventListener }> = []
const webglSupported = ref(true)
const mapError = ref<string | null>(null)

const destroyMap = () => {
  if (!map) return

  closeAllInfo()
  clearAllMarkers()

  if (map.off && mapLoadCompleteHandler) {
    try {
      map.off('loadComplete', mapLoadCompleteHandler)
    } catch (e) {
      console.warn('[ParkingMap] remove loadComplete listener failed', e)
    }
  }

  const underlyingMap = map.g || map.getMapBoxMap?.()
  if (underlyingMap && typeof underlyingMap.remove === 'function') {
    try {
      underlyingMap.remove()
    } catch (e) {
      console.warn('[ParkingMap] underlying map remove failed', e)
    }
  } else if (typeof map.remove === 'function') {
    try {
      map.remove()
    } catch (e) {
      console.warn('[ParkingMap] map.remove failed', e)
    }
  }

  removeMapScrollCapture()
  map = null
  mapReady = false
  mapLoadCompleteHandler = null
}

const checkWebGLSupport = (): boolean => {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  const names = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d']
  for (const name of names) {
    try {
      const context = canvas.getContext(name, { failIfMajorPerformanceCaveat: false })
      if (context) {
        if (typeof (context as any).getExtension === 'function') {
          const ext = (context as any).getExtension('WEBGL_lose_context') || (context as any).getExtension('MOZ_WEBGL_lose_context')
          ext?.loseContext?.()
        }
        return true
      }
    } catch (e) {
      // ignore and try next context name
    }
  }
  return false
}

const setupMapScrollCapture = () => {
  if (mapScrollListeners.length > 0) return

  mapContainer = document.getElementById('parkingMapContainer')
  if (!mapContainer) return
  mapContainer.style.setProperty('touch-action', 'pan-y', 'important')
  mapContainer.style.setProperty('-webkit-touch-callout', 'none', 'important')

  // 强制 html/body 可滚动：这些 bems-web 页面没有内部滚动容器，滚动依赖
  // document 通道。地图 SDK createCanvas 也会设置 html/body overflow:auto，
  // 这里再显式设一次，确保页面可滚动。卸载时不移除（见 removeMapScrollCapture）。
  document.documentElement.style.setProperty('overflow', 'auto', 'important')
  document.body.style.setProperty('overflow', 'auto', 'important')

  const stopMapScroll = (event: Event) => {
    if (!(event.target instanceof Node) || !mapContainer?.contains(event.target)) return
    if (event.cancelable) {
      event.stopPropagation()
      event.stopImmediatePropagation()
    }
  }

  const targets: EventTarget[] = [mapContainer, document.documentElement, document.body]
  const eventNames = ['wheel', 'mousewheel', 'DOMMouseScroll', 'touchmove', 'touchstart']

  eventNames.forEach((name) => {
    targets.forEach((target) => {
      target.addEventListener(name, stopMapScroll, { capture: true, passive: false })
      mapScrollListeners.push({ target, name, handler: stopMapScroll })
    })
  })
}

const removeMapScrollCapture = () => {
  mapScrollListeners.forEach(({ target, name, handler }) => {
    target.removeEventListener(name, handler, { capture: true })
  })
  mapScrollListeners.length = 0

  // 重要：不要移除 html/body 的 overflow。
  // 这些 bems-web 路由页面（含消防管理等）没有内部滚动容器，滚动依赖
  // html/body 的 overflow:auto（由地图 SDK createCanvas 打开，这是项目能滚动的基础）。
  // 若用 removeProperty 移除，html 会回落到全局 CSS 的 overflow:hidden，导致切换后的页面无法滚动。
  // 因此这里只清理滚动事件监听器，保留可滚动的 overflow。
  mapContainer = null
}

// 地图配置（与 comprehensivePreview 保持一致）
const buildingID = 'B000A11DMD'
const token = '572d6c0c869b3e2ce85a63ab2a1d5a0a'
const windowWidth = window.outerWidth
let zoomNum: number
if (windowWidth > 1439) {
  zoomNum = 15.95
} else if (windowWidth > 1200) {
  zoomNum = 14.45
} else {
  zoomNum = 15.95
}

const mapConfig = {
  token,
  appName: 'HelloWorld',
  projectPath: '',
  baseMapPath: '/map/',
  spriteUrl: `${window.location.origin}/map/assets/images/default_markers`,
  scenePath: '/data/',
  buildingId: buildingID,
  defaultCenter: { lon: 116.162, lat: 39.912 },
  defaultZoomLevel: zoomNum,
  showOutDoorMap: false,
  mapDataPath: '/data/572d6c0c869b3e2ce85a63ab2a1d5a0a/{{bdid}}/',
}

const DEFAULT_FLID = 'DX0003640110100001'

/** 获取楼层ID，带重试机制和硬编码兜底 */
async function initFloorId(retryCount = 0) {
  flid = map.getCurrentFloorId()
  if (!flid) {
    const floors = map.getCurrentFloorsInfo()
    flid = floors && floors.length ? floors[0].flid : null
  }
  if (!flid && retryCount < 3) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return initFloorId(retryCount + 1)
  }
  if (!flid) {
    flid = DEFAULT_FLID
    console.warn('[ParkingMap] 楼层ID获取失败，使用默认值:', flid)
  }
  console.log('[ParkingMap] 当前楼层ID:', flid)
}

/** 根据状态获取颜色 */
const getStateColor = (state?: string): string => {
  if (!state) return '#52c41a'
  if (state.includes('拥挤')) return '#ff4d4f'
  if (state.includes('适中')) return '#faad14'
  return '#52c41a'
}

/** 根据使用率获取热力颜色 */
const getHeatColor = (rate: number): string => {
  if (rate >= 80) return '#ff4d4f'
  if (rate >= 60) return '#ff7a45'
  if (rate >= 40) return '#faad14'
  return '#52c41a'
}

/** 关闭当前展开的信息面板 */
function closeAllInfo() {
  if (openedInfoEl) {
    openedInfoEl.style.display = 'none'
    openedInfoEl = null
  }
}

/** 点击地图空白时自动关闭信息面板 */
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.parking-marker')) return
  closeAllInfo()
}

/** 构建停车场标点 DOM（含热力光晕 + 圆点标记） */
function buildMarkerDom(item: ParkingSpaceStatVO): string {
  const color = getStateColor(item.state)
  const rate = item.usedRate ?? item.usageRate ?? 0
  const heatColor = getHeatColor(rate)
  const haloSize = 24 + (rate / 100) * 36
  const domId = `parking-${item.id ?? Math.random().toString(36).slice(2)}`
  return `<div class="parking-marker" id="${domId}" style="position: relative; cursor: pointer;">
    <div class="marker-info-panel" style="
      display: none;
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      min-width: 160px;
      background: rgba(10, 22, 40, 0.95);
      border: 1px solid #2a4a6f;
      border-radius: 6px;
      padding: 8px 12px;
      z-index: 1000;
      box-shadow: 0 6px 16px rgba(0,0,0,0.5);
      font-size: 12px;
      color: #e0e6ed;
      white-space: nowrap;
      margin-bottom: 4px;
    ">
      <div style="font-weight: 600; margin-bottom: 4px; color: #ffffff;">${item.name || '停车场'}</div>
      <div>总车位: ${item.total ?? 0}</div>
      <div>已用: ${item.used ?? 0}</div>
      <div>剩余: ${item.shengyu ?? 0}</div>
      <div>使用率: ${rate}%</div>
      <div>状态: <span style="color: ${color}">${item.state || '正常'}</span></div>
    </div>
    <div style="position: relative; width: 16px; height: 16px;">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${haloSize}px;
        height: ${haloSize}px;
        background: radial-gradient(circle, ${heatColor}55 0%, ${heatColor}22 50%, transparent 80%);
        border-radius: 50%;
        pointer-events: none;
      "></div>
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 16px;
        height: 16px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      "></div>
    </div>
  </div>`
}

/** 创建单个标点 */
function customizeMarker(item: ParkingSpaceStatVO) {
  if (!map || !flid) {
    console.warn('[ParkingMap] 标点创建跳过: map或flid为空')
    return null
  }
  const lng = Number(item.lng)
  const lat = Number(item.lat)
  if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
    console.warn('[ParkingMap] 标点坐标无效, 跳过:', item.name, 'lng=', item.lng, 'lat=', item.lat)
    return null
  }

  const markerInfo = {
    bdid: buildingID,
    text: item.name || '停车场',
    lon: lng,
    lat: lat,
    floorId: flid,
    dom: buildMarkerDom(item),
  }

  try {
    const DaxiMap = (window as any).DaxiMap
    const marker = new DaxiMap.DXMapMarker()
    marker.initialize(map, markerInfo, {
      anchor: 'bottom',
      onClick: () => {
        const el = document.getElementById(`parking-${item.id}`)
        const infoEl = el?.querySelector<HTMLElement>('.marker-info-panel')
        if (infoEl) {
          closeAllInfo()
          const isHidden = infoEl.style.display === 'none'
          infoEl.style.display = isHidden ? 'block' : 'none'
          openedInfoEl = isHidden ? infoEl : null
        }
      },
    })
    marker.addToMap()
    console.log('[ParkingMap] 标点创建成功:', item.name, `(${lng}, ${lat})`)
    return marker
  } catch (error) {
    console.error('[ParkingMap] 标点创建异常:', item.name, `(${lng}, ${lat})`, error)
    return null
  }
}

/** 清除所有标点 */
function clearAllMarkers() {
  markerArr.forEach((m) => {
    try {
      m?.removeFromMap?.()
    } catch (e) {
      console.warn('[ParkingMap] 移除标点失败:', e)
    }
  })
  markerArr.length = 0
}

/** 在地图上标记所有停车场点位 */
function addParkingMarkers() {
  if (!map || !flid) {
    console.warn('[ParkingMap] addParkingMarkers 跳过: map或flid为空')
    return
  }
  clearAllMarkers()

  const data = props.data
  if (!data || !data.length) {
    console.warn('[ParkingMap] addParkingMarkers: 数据为空')
    return
  }

  console.log('[ParkingMap] 开始添加标点, 数据量:', data.length)
  console.log('[ParkingMap] 数据样例:', JSON.stringify(data[0]))

  let successCount = 0
  let skipCount = 0
  data.forEach((item) => {
    const lng = Number(item.lng)
    const lat = Number(item.lat)
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      skipCount++
      console.warn('[ParkingMap] 跳过无效坐标:', item.name, 'lng=', item.lng, 'lat=', item.lat)
      return
    }
    const marker = customizeMarker(item)
    if (marker) {
      markerArr.push(marker)
      successCount++
    } else {
      skipCount++
    }
  })

  console.log(`[ParkingMap] 标点添加完成: 成功 ${successCount} 个, 跳过 ${skipCount} 个`)

  // 聚焦到第一个有坐标的停车场，确保标点可见
  const first = data.find((d) => d.lng && d.lat)
  if (first) {
    try {
      map.easeTo({
        bdid: buildingID,
        lon: Number(first.lng),
        lat: Number(first.lat),
        floorId: flid,
      })
      console.log('[ParkingMap] 地图聚焦到:', first.name, `(${first.lng}, ${first.lat})`)
    } catch (e) {
      console.warn('[ParkingMap] easeTo 失败:', e)
    }
  }
}

/** 初始化地图 */
const initMap = async () => {
  if (!checkWebGLSupport()) {
    webglSupported.value = false
    mapError.value = '当前浏览器或环境不支持 WebGL，地图无法初始化。'
    console.warn('[ParkingMap] WebGL 不支持，跳过地图初始化')
    return
  }

  try {
    const DaxiMap = (window as any).DaxiMap
    try {
      map = await new DaxiMap.Map('parkingMapContainer', mapConfig)
    } catch (innerError) {
      webglSupported.value = false
      mapError.value = '地图初始化失败：WebGL 上下文创建失败。'
      console.error('[ParkingMap] 地图初始化失败:', innerError)
      return
    }

    mapLoadCompleteHandler = async () => {
      if (!map) return
      console.log('[ParkingMap] 地图加载完成')
      // 如果 SDK 拦截了滚轮/触摸事件，页面滚动会失效。
      // 这里在地图容器上先捕获滚动相关事件，避免 SDK 阻断页面滚动。
      setupMapScrollCapture()
      map.setZoomLevelRange(10, 23)
      // 默认缩放到 14
      map.setZoom(14)
      await initFloorId()
      mapReady = true
      setTimeout(() => {
        addParkingMarkers()
      }, 800)
    }
    map.on('loadComplete', mapLoadCompleteHandler)
    console.log('[ParkingMap] 地图初始化成功')
  } catch (error) {
    webglSupported.value = false
    mapError.value = '地图初始化失败，请检查浏览器是否支持 WebGL。'
    console.error('[ParkingMap] 地图初始化失败:', error)
  }
}

// 监听数据变化，自动更新标点
watch(
  () => props.data,
  () => {
    console.log('[ParkingMap] props.data 变化, mapReady=', mapReady, '数据量=', props.data?.length)
    if (mapReady) {
      addParkingMarkers()
    }
  },
  { deep: true },
)

// ===================== 缩放控制 =====================

function zoomIn() {
  if (!map) return
  try {
    map.setZoom(map.getZoom() + 1)
  } catch (e) {
    console.warn('[ParkingMap] zoomIn 失败:', e)
  }
}

function zoomOut() {
  if (!map) return
  try {
    map.setZoom(map.getZoom() - 1)
  } catch (e) {
    console.warn('[ParkingMap] zoomOut 失败:', e)
  }
}

const mountMap = async () => {
  await loadMapScripts()
  await initMap()
  document.addEventListener('click', handleDocumentClick, true)
}

const unmountMap = () => {
  destroyMap()
  removeMapScrollCapture()
  document.removeEventListener('click', handleDocumentClick, true)
}

onMounted(async () => {
  await mountMap()
})

onActivated(async () => {
  if (!mapReady) {
    await mountMap()
  }
})

onDeactivated(() => {
  unmountMap()
})

onUnmounted(() => {
  unmountMap()
})
</script>

<style scoped>
.parking-map-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  touch-action: pan-y;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  touch-action: pan-y;
}

.map-zoom-controls {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 100;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: background 0.2s;
}

.zoom-btn:hover {
  background: #fff;
}

.zoom-btn:active {
  background: #f0f0f0;
}
</style>
