<template>
  <div class="heatmap-map-wrapper">
    <div id="personHeatmapContainer" class="map-container"></div>
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
import type { VenueHeatmapItemVO } from './index.api'

const props = defineProps<{
  data: VenueHeatmapItemVO[]
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
      console.warn('[PersonHeatmap] remove loadComplete listener failed', e)
    }
  }

  const underlyingMap = map.g || map.getMapBoxMap?.()
  if (underlyingMap && typeof underlyingMap.remove === 'function') {
    try {
      underlyingMap.remove()
    } catch (e) {
      console.warn('[PersonHeatmap] underlying map remove failed', e)
    }
  } else if (typeof map.remove === 'function') {
    try {
      map.remove()
    } catch (e) {
      console.warn('[PersonHeatmap] map.remove failed', e)
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

  mapContainer = document.getElementById('personHeatmapContainer')
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

// 地图配置（与 ParkingMapView / FireMapView 保持一致）
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
    console.warn('[PersonHeatmap] 楼层ID获取失败，使用默认值:', flid)
  }
  console.log('[PersonHeatmap] 当前楼层ID:', flid)
}

/** 根据 state 字段获取热力颜色（3档：宽松=绿、适中=黄、拥挤=红） */
function getHeatColorByState(state?: string): { core: string; mid: string; outer: string; label: string } {
  if (state && state.includes('拥挤')) {
    return {
      core: 'rgba(180, 0, 0, 1)',
      mid: 'rgba(200, 10, 10, 0.8)',
      outer: 'rgba(200, 10, 10, 0.4)',
      label: '#ff4d4f',
    }
  }
  if (state && state.includes('适中')) {
    return {
      core: 'rgba(220, 100, 20, 0.9)',
      mid: 'rgba(240, 140, 40, 0.65)',
      outer: 'rgba(240, 140, 40, 0.3)',
      label: '#faad14',
    }
  }
  // 宽松 或默认
  return {
    core: 'rgba(60, 200, 120, 0.85)',
    mid: 'rgba(60, 200, 120, 0.55)',
    outer: 'rgba(60, 200, 120, 0.25)',
    label: '#52c41a',
  }
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
  if (target.closest('.heatmap-marker')) return
  closeAllInfo()
}

/** 构建热力图标点 DOM（参考大屏客流渲染样式：大面积模糊边界融合） */
function buildMarkerDom(item: VenueHeatmapItemVO): string {
  const domId = `heatmap-${item.id ?? Math.random().toString(36).slice(2)}`
  const { core, mid, outer, label } = getHeatColorByState(item.state)
  const rate = item.usageRate ?? item.usedRate ?? 0
  // 光晕尺寸根据使用率增大
  const haloSize = 30 + (rate / 100) * 30
  const used = item.used ?? 0
  const total = item.total ?? 0
  const shengyu = item.shengyu ?? 0
  return `<div class="heatmap-marker" id="${domId}">
    <div class="marker-info-panel">
      <div class="panel-title">${item.name || '场馆'}</div>
      <div>当前在场: <span style="color: ${label}; font-weight: 600;">${used}</span> 人</div>
      <div>容量上限: ${total}</div>
      <div>剩余容量: ${shengyu}</div>
      <div>使用率: ${rate}%</div>
      <div>状态: <span style="color: ${label}; font-weight: 600;">${item.state || '正常'}</span></div>
    </div>
    <div class="heatmap-halo" style="width: ${haloSize}px; height: ${haloSize}px;">
      <div class="heat-outer" style="background: radial-gradient(circle, ${mid} 0%, ${outer} 40%, transparent 75%);"></div>
      <div class="heat-core" style="background: radial-gradient(circle, ${core} 0%, ${mid} 50%, transparent 100%);"></div>
    </div>
  </div>`
}

/** 创建单个标点 */
function customizeMarker(item: VenueHeatmapItemVO) {
  if (!map || !flid) {
    console.warn('[PersonHeatmap] 标点创建跳过: map或flid为空')
    return null
  }
  const lng = Number(item.lng)
  const lat = Number(item.lat)
  if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
    console.warn('[PersonHeatmap] 标点坐标无效, 跳过:', item.name, 'lng=', item.lng, 'lat=', item.lat)
    return null
  }

  const domId = `heatmap-${item.id ?? Math.random().toString(36).slice(2)}`
  const markerInfo = {
    bdid: buildingID,
    text: item.name || '场馆',
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
    console.log('[PersonHeatmap] 标点创建成功:', item.name, `(${lng}, ${lat})`)
    return marker
  } catch (error) {
    console.error('[PersonHeatmap] 标点创建异常:', item.name, `(${lng}, ${lat})`, error)
    return null
  }
}

/** 清除所有标点 */
function clearAllMarkers() {
  markerArr.forEach((m) => {
    try {
      m?.removeFromMap?.()
    } catch (e) {
      console.warn('[PersonHeatmap] 移除标点失败:', e)
    }
  })
  markerArr.length = 0
}

/** 在地图上标记所有场馆热力点位 */
function addHeatmapMarkers() {
  if (!map || !flid) {
    console.warn('[PersonHeatmap] addHeatmapMarkers 跳过: map或flid为空')
    return
  }
  clearAllMarkers()

  const data = props.data
  if (!data || !data.length) {
    console.warn('[PersonHeatmap] addHeatmapMarkers: 数据为空')
    return
  }

  console.log('[PersonHeatmap] 开始添加标点, 数据量:', data.length)

  let successCount = 0
  let skipCount = 0
  data.forEach((item) => {
    const lng = Number(item.lng)
    const lat = Number(item.lat)
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      skipCount++
      console.warn('[PersonHeatmap] 跳过无效坐标:', item.name, 'lng=', item.lng, 'lat=', item.lat)
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

  console.log(`[PersonHeatmap] 标点添加完成: 成功 ${successCount} 个, 跳过 ${skipCount} 个`)

  // 聚焦到第一个有坐标的点
  const first = data.find((d) => d.lng && d.lat)
  if (first) {
    try {
      map.easeTo({
        bdid: buildingID,
        lon: Number(first.lng),
        lat: Number(first.lat),
        floorId: flid,
      })
    } catch (e) {
      console.warn('[PersonHeatmap] easeTo 失败:', e)
    }
  }
}

/** 初始化地图 */
const initMap = async () => {
  if (!checkWebGLSupport()) {
    console.warn('[PersonHeatmap] WebGL 不支持，跳过地图初始化')
    return
  }

  try {
    const DaxiMap = (window as any).DaxiMap
    try {
      map = await new DaxiMap.Map('personHeatmapContainer', mapConfig)
    } catch (innerError) {
      console.error('[PersonHeatmap] 地图初始化失败:', innerError)
      return
    }

    mapLoadCompleteHandler = async () => {
      if (!map) return
      console.log('[PersonHeatmap] 地图加载完成')
      setupMapScrollCapture()
      map.setZoomLevelRange(10, 23)
      map.setZoom(14)
      await initFloorId()
      mapReady = true
      setTimeout(() => {
        addHeatmapMarkers()
      }, 800)
    }
    map.on('loadComplete', mapLoadCompleteHandler)
    console.log('[PersonHeatmap] 地图初始化成功')
  } catch (error) {
    console.error('[PersonHeatmap] 地图初始化失败:', error)
  }
}

// 监听数据变化，自动更新标点
watch(
  () => props.data,
  () => {
    if (mapReady) {
      addHeatmapMarkers()
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
    console.warn('[PersonHeatmap] zoomIn 失败:', e)
  }
}

function zoomOut() {
  if (!map) return
  try {
    map.setZoom(map.getZoom() - 1)
  } catch (e) {
    console.warn('[PersonHeatmap] zoomOut 失败:', e)
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
.heatmap-map-wrapper {
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
.heatmap-marker {
  position: relative;
  cursor: pointer;
}

/* 信息面板 */
.heatmap-marker .marker-info-panel {
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
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  font-size:14px;
  color: #e0e6ed;
  white-space: nowrap;
  margin-bottom: 4px;
}
.heatmap-marker .marker-info-panel .panel-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #ffffff;
}

/* 热力光晕层 —— 参考大屏客流渲染：大面积模糊边界融合 */
.heatmap-marker .heatmap-halo {
  position: relative;
  filter: blur(6px);
}

/* 外层渐变（大面积模糊扩散，与相邻标点自然融合） */
.heatmap-marker .heat-outer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

/* 中层渐变（核心区域增强） */
.heatmap-marker .heat-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  border-radius: 50%;
}

.heatmap-marker:hover .heatmap-halo {
  filter: blur(8px);
}
</style>
