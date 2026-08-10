<template>
  <div class="fire-map-wrapper">
    <div id="fireMapContainer" class="map-container"></div>
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
import type { VenueDeviceCountVO } from './index.api'

const props = defineProps<{
  data: VenueDeviceCountVO[]
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

const destroyMap = () => {
  if (!map) return

  closeAllInfo()
  clearAllMarkers()

  if (map.off && mapLoadCompleteHandler) {
    try {
      map.off('loadComplete', mapLoadCompleteHandler)
    } catch (e) {
      console.warn('[FireMap] remove loadComplete listener failed', e)
    }
  }

  const underlyingMap = map.g || map.getMapBoxMap?.()
  if (underlyingMap && typeof underlyingMap.remove === 'function') {
    try {
      underlyingMap.remove()
    } catch (e) {
      console.warn('[FireMap] underlying map remove failed', e)
    }
  } else if (typeof map.remove === 'function') {
    try {
      map.remove()
    } catch (e) {
      console.warn('[FireMap] map.remove failed', e)
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

  mapContainer = document.getElementById('fireMapContainer')
  if (!mapContainer) return
  mapContainer.style.setProperty('touch-action', 'pan-y', 'important')
  mapContainer.style.setProperty('-webkit-touch-callout', 'none', 'important')

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
  mapContainer = null
}

// 地图配置（与 ParkingMapView 保持一致）
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
    console.warn('[FireMap] 楼层ID获取失败，使用默认值:', flid)
  }
  console.log('[FireMap] 当前楼层ID:', flid)
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
  if (target.closest('.fire-marker')) return
  closeAllInfo()
}

/** 构建消防设备标点 DOM */
function buildMarkerDom(item: VenueDeviceCountVO): string {
  const domId = `fire-${item.venueName ?? Math.random().toString(36).slice(2)}`
  const count = item.deviceCount ?? 0
  // 统一使用黄色
  const color = '#faad14'
  return `<div class="fire-marker" id="${domId}">
    <div class="marker-info-panel">
      <div class="panel-title">${item.venueName || '场馆'}</div>
      <div>消防设备数量: <span style="color: ${color}; font-weight: 600;">${count}</span> 台</div>
    </div>
    <div class="fire-marker-dot" style="background: radial-gradient(circle, ${color} 0%, ${color}aa 50%, transparent 100%);"></div>
  </div>`
}

/** 创建单个标点 */
function customizeMarker(item: VenueDeviceCountVO) {
  if (!map || !flid) {
    console.warn('[FireMap] 标点创建跳过: map或flid为空')
    return null
  }
  const lng = Number(item.longitude)
  const lat = Number(item.latitude)
  if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
    console.warn('[FireMap] 标点坐标无效, 跳过:', item.venueName, 'lng=', item.longitude, 'lat=', item.latitude)
    return null
  }

  const domId = `fire-${item.venueName ?? Math.random().toString(36).slice(2)}`
  const markerInfo = {
    bdid: buildingID,
    text: item.venueName || '场馆',
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
        const el = document.getElementById(domId)
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
    console.log('[FireMap] 标点创建成功:', item.venueName, `(${lng}, ${lat})`)
    return marker
  } catch (error) {
    console.error('[FireMap] 标点创建异常:', item.venueName, `(${lng}, ${lat})`, error)
    return null
  }
}

/** 清除所有标点 */
function clearAllMarkers() {
  markerArr.forEach((m) => {
    try {
      m?.removeFromMap?.()
    } catch (e) {
      console.warn('[FireMap] 移除标点失败:', e)
    }
  })
  markerArr.length = 0
}

/** 在地图上标记所有消防设备点位 */
function addFireMarkers() {
  if (!map || !flid) {
    console.warn('[FireMap] addFireMarkers 跳过: map或flid为空')
    return
  }
  clearAllMarkers()

  const data = props.data
  if (!data || !data.length) {
    console.warn('[FireMap] addFireMarkers: 数据为空')
    return
  }

  console.log('[FireMap] 开始添加标点, 数据量:', data.length)

  let successCount = 0
  let skipCount = 0
  data.forEach((item) => {
    const lng = Number(item.longitude)
    const lat = Number(item.latitude)
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      skipCount++
      console.warn('[FireMap] 跳过无效坐标:', item.venueName, 'lng=', item.longitude, 'lat=', item.latitude)
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

  console.log(`[FireMap] 标点添加完成: 成功 ${successCount} 个, 跳过 ${skipCount} 个`)

  // 聚焦到第一个有坐标的点
  const first = data.find((d) => d.longitude && d.latitude)
  if (first) {
    try {
      map.easeTo({
        bdid: buildingID,
        lon: Number(first.longitude),
        lat: Number(first.latitude),
        floorId: flid,
      })
    } catch (e) {
      console.warn('[FireMap] easeTo 失败:', e)
    }
  }
}

/** 初始化地图 */
const initMap = async () => {
  if (!checkWebGLSupport()) {
    console.warn('[FireMap] WebGL 不支持，跳过地图初始化')
    return
  }

  try {
    const DaxiMap = (window as any).DaxiMap
    try {
      map = await new DaxiMap.Map('fireMapContainer', mapConfig)
    } catch (innerError) {
      console.error('[FireMap] 地图初始化失败:', innerError)
      return
    }

    mapLoadCompleteHandler = async () => {
      if (!map) return
      console.log('[FireMap] 地图加载完成')
      setupMapScrollCapture()
      map.setZoomLevelRange(10, 23)
      map.setZoom(14)
      await initFloorId()
      mapReady = true
      setTimeout(() => {
        addFireMarkers()
      }, 800)
    }
    map.on('loadComplete', mapLoadCompleteHandler)
    console.log('[FireMap] 地图初始化成功')
  } catch (error) {
    console.error('[FireMap] 地图初始化失败:', error)
  }
}

// 监听数据变化，自动更新标点
watch(
  () => props.data,
  () => {
    if (mapReady) {
      addFireMarkers()
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
    console.warn('[FireMap] zoomIn 失败:', e)
  }
}

function zoomOut() {
  if (!map) return
  try {
    map.setZoom(map.getZoom() - 1)
  } catch (e) {
    console.warn('[FireMap] zoomOut 失败:', e)
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
.fire-map-wrapper {
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

<!-- 非scoped样式：SDK动态创建的DOM标点需要全局样式才能生效 -->
<style>
.fire-marker {
  position: relative;
  cursor: pointer;
}

/* 信息面板 */
.fire-marker .marker-info-panel {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 140px;
  background: rgba(10, 22, 40, 0.95);
  border: 1px solid #2a4a6f;
  border-radius: 6px;
  padding: 8px 12px;
  z-index: 1000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  font-size: 12px;
  color: #e0e6ed;
  white-space: nowrap;
  margin-bottom: 4px;
}
.fire-marker .marker-info-panel .panel-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #ffffff;
}

/* 设备分布标点 */
.fire-marker .fire-marker-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  filter: blur(2px);
}

.fire-marker:hover .fire-marker-dot {
  filter: blur(3px);
  transform: scale(1.15);
  transition: transform 0.2s;
}
</style>
