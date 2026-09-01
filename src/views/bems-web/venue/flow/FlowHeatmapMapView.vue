<template>
  <div class="heatmap-map-wrapper" :class="{ fullscreen: props.fullscreen }">
    <div id="flowHeatmapContainer" class="map-container"></div>

    <!-- 扫描线动画覆盖层 -->
    <div class="map-overlay">
      <div class="scan-line"></div>
    </div>

    <!-- 缩放控制按钮 -->
    <div class="map-zoom-controls">
      <button class="zoom-btn" title="放大" @click="zoomIn">+</button>
      <button class="zoom-btn" title="缩小" @click="zoomOut">−</button>
    </div>

    <!-- 全屏模式：底部切换按钮 -->
    <div v-if="props.fullscreen" class="map-bottom-btns">
      <div
        class="map-btn"
        :class="{ 'is-active': viewMode === 'heatmap' }"
        @click="switchMode('heatmap')"
      >
        <span class="map-btn-icon">🔥</span>
        <span class="map-btn-text">客流热力</span>
      </div>
      <div
        class="map-btn"
        :class="{ 'is-active': viewMode === 'statistics' }"
        @click="switchMode('statistics')"
      >
        <span class="map-btn-icon">📊</span>
        <span class="map-btn-text">客流统计</span>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="loading" class="map-loading">
      <div class="loading-spinner"></div>
      <span>{{ loadingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, onUnmounted, watch, nextTick, ref } from 'vue'
import type { PropType } from 'vue'
import { loadMapScripts } from '/@/components/map/loadMapScripts'
import type { VenueHeatmapItemVO, VenueInfoVO } from './index.api'
import { getVenueListAll } from './index.api'

const props = defineProps({
  data: { type: Array as PropType<VenueHeatmapItemVO[]>, default: () => [] },
  fullscreen: { type: Boolean, default: false },
})

/** 视图模式：heatmap=客流热力（默认），statistics=客流统计 */
const viewMode = ref<'heatmap' | 'statistics'>('heatmap')
/** 加载状态 */
const loading = ref(false)
const loadingText = ref('加载中...')

// 地图相关状态
let map: any = null
let flid: string | null = null
let mapReady = false
let mapLoadCompleteHandler: (() => Promise<void>) | null = null
const markerArr: any[] = []
/** 客流统计模式标点数组 */
const statisticsMarkerArr: any[] = []
/** 黄色区域覆盖物数组（polygon + polyline） */
const yellowAreaOverlays: any[] = []
let openedInfoEl: HTMLElement | null = null
let mapContainer: HTMLElement | null = null
const mapScrollListeners: Array<{ target: EventTarget; name: string; handler: EventListener }> = []

const destroyMap = () => {
  if (!map) return

  closeAllInfo()
  clearAllMarkers()
  clearStatisticsMarkers()
  clearYellowArea()

  if (map.off && mapLoadCompleteHandler) {
    try {
      map.off('loadComplete', mapLoadCompleteHandler)
    } catch (e) {
      console.warn('[FlowHeatmap] remove loadComplete listener failed', e)
    }
  }

  const underlyingMap = map.g || map.getMapBoxMap?.()
  if (underlyingMap && typeof underlyingMap.remove === 'function') {
    try {
      underlyingMap.remove()
    } catch (e) {
      console.warn('[FlowHeatmap] underlying map remove failed', e)
    }
  } else if (typeof map.remove === 'function') {
    try {
      map.remove()
    } catch (e) {
      console.warn('[FlowHeatmap] map.remove failed', e)
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

  mapContainer = document.getElementById('flowHeatmapContainer')
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
    console.warn('[FlowHeatmap] 楼层ID获取失败，使用默认值:', flid)
  }
  console.log('[FlowHeatmap] 当前楼层ID:', flid)
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

  // 点击的是热力图标点或场馆标点内部，不关闭
  if (target.closest('.heatmap-marker')) return
  if (target.closest('.statistics-marker')) return

  // 点击空白区域：关闭所有信息面板
  closeAllInfo()
}

/** 构建热力图标点 DOM（参考大屏客流渲染样式：大面积模糊边界融合） */
function buildMarkerDom(item: VenueHeatmapItemVO): string {
  const domId = `flow-heatmap-${item.id ?? Math.random().toString(36).slice(2)}`
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
    console.warn('[FlowHeatmap] 标点创建跳过: map或flid为空')
    return null
  }
  const lng = Number(item.lng)
  const lat = Number(item.lat)
  if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
    console.warn('[FlowHeatmap] 标点坐标无效, 跳过:', item.name, 'lng=', item.lng, 'lat=', item.lat)
    return null
  }

  const domId = `flow-heatmap-${item.id ?? Math.random().toString(36).slice(2)}`
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
    console.log('[FlowHeatmap] 标点创建成功:', item.name, `(${lng}, ${lat})`)
    return marker
  } catch (error) {
    console.error('[FlowHeatmap] 标点创建异常:', item.name, `(${lng}, ${lat})`, error)
    return null
  }
}

/** 清除所有标点 */
function clearAllMarkers() {
  markerArr.forEach((m) => {
    try {
      m?.removeFromMap?.()
    } catch (e) {
      console.warn('[FlowHeatmap] 移除标点失败:', e)
    }
  })
  markerArr.length = 0
}

/** 清除客流统计模式标点 */
function clearStatisticsMarkers() {
  statisticsMarkerArr.forEach((m) => {
    try {
      m?.removeFromMap?.()
    } catch (e) {
      console.warn('[FlowHeatmap] 移除统计标点失败:', e)
    }
  })
  statisticsMarkerArr.length = 0
}

/**
 * 清除黄色区域覆盖物
 */
function clearYellowArea() {
  yellowAreaOverlays.forEach((o) => {
    try {
      o?.removeFromMap?.()
    } catch (e) {
      // ignore
    }
  })
  yellowAreaOverlays.length = 0
}

/**
 * 在地图上绘制黄色区域多边形遮罩（与 MapArea.vue 相同的坐标和样式）
 */
function drawYellowArea() {
  if (!map || !flid) {
    console.warn('[FlowHeatmap] 绘制黄色区域跳过: map或flid为空')
    return
  }

  // 黄色区域坐标点 [lng, lat] - 与 MapArea.vue 保持一致
  const yellowAreaCoords: number[][] = [
    [116.156697, 39.919386],
    [116.16013, 39.919435],
    [116.160109, 39.91769],
    [116.162512, 39.917707],
    [116.162448, 39.907568],
    [116.158113, 39.907634],
    [116.157963, 39.914432],
  ]

  // 闭合多边形（首尾相连）
  const closedCoords = [...yellowAreaCoords, yellowAreaCoords[0]]

  try {
    // 绘制黄色填充多边形
    const polygon = map.createPolygon({
      bdid: buildingID,
      floorId: flid,
      features: [
        {
          type: 'Feature',
          properties: {
            id: 'yellow-area-polygon',
            fillColor: '#facc15',
            opacity: 0.3,
            outlineColor: '#facc15',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [closedCoords.map((p) => [p[0], p[1]])],
          },
        },
      ],
      fillColor: '#facc15',
      opacity: 0.3,
      outlineColor: '#facc15',
    })
    if (polygon) yellowAreaOverlays.push(polygon)

    // 绘制黄色边框线（线宽3px）
    const polyline = map.createPolyline2({
      bdid: buildingID,
      floorId: flid,
      lineColor: 'rgba(250, 204, 21, 0.9)',
      lineWidth: 3,
      wrapperColor: 'transparent',
      wrapperWidth: 4,
      linePoints: closedCoords,
    })
    if (polyline) yellowAreaOverlays.push(polyline)

    console.log('[FlowHeatmap] 黄色区域已绘制, 坐标点数:', yellowAreaCoords.length)
  } catch (error) {
    console.error('[FlowHeatmap] 绘制黄色区域失败:', error)
  }
}

/** 构建客流统计标点 DOM：默认显示 tag，点击展开详情 */
function buildStatisticsMarkerDom(item: VenueInfoVO): string {
  const domId = `flow-statistics-${item.id ?? Math.random().toString(36).slice(2)}`
  const count = item.currentCount ?? 0
  const capacity = item.capacity ?? 0
  // 根据人数比例确定颜色
  let color = '#52c41a' // 绿色（宽松）
  if (capacity > 0) {
    const ratio = count / capacity
    if (ratio >= 0.8) {
      color = '#ff4d4f'
    } else if (ratio >= 0.5) {
      color = '#faad14'
    }
  }
  const venueName = item.venueName || '场馆'
  return `<div class="statistics-marker" id="${domId}">
    <!-- Tag 标签：默认显示 -->
    <div class="venue-tag" style="border-color: ${color};">
      <span class="venue-tag-dot" style="background: ${color};"></span>
      <span class="venue-tag-text">${venueName}</span>
    </div>
    <!-- 详情面板：默认隐藏，点击 tag 后显示 -->
    <div class="venue-detail-panel" style="display: none;">
      <div class="venue-detail-header">
        <span class="venue-detail-title">${venueName}</span>
      </div>
      <div class="venue-detail-body">
        <div class="venue-detail-item">
          <span class="venue-detail-label">当前在场</span>
          <span class="venue-detail-value" style="color: ${color};">${count} 人</span>
        </div>
        ${capacity ? `
        <div class="venue-detail-item">
          <span class="venue-detail-label">容量上限</span>
          <span class="venue-detail-value">${capacity} 人</span>
        </div>
        <div class="venue-detail-item">
          <span class="venue-detail-label">使用率</span>
          <span class="venue-detail-value" style="color: ${color};">${capacity > 0 ? Math.round((count / capacity) * 100) : 0}%</span>
        </div>
        ` : ''}
      </div>
    </div>
  </div>`
}

/** 加载场馆统计标点（调用 listAll 接口） */
async function loadVenueStatistics() {
  if (!mapReady) {
    console.warn('[FlowHeatmap] 地图未就绪，无法渲染统计标点')
    return
  }

  loading.value = true
  loadingText.value = '加载场馆统计数据...'

  try {
    // 先清除热力图标点和统计标点
    clearAllMarkers()
    clearStatisticsMarkers()

    const res = await getVenueListAll()
    const data: VenueInfoVO[] = res?.result || res?.data || res || []

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[FlowHeatmap] 场馆统计数据为空')
      return
    }

    console.log('[FlowHeatmap] 场馆统计数据:', data.length, '个场馆')

    data.forEach((item: VenueInfoVO) => {
      const lng = Number(item.longitude)
      const lat = Number(item.latitude)
      if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
        console.warn('[FlowHeatmap] 统计标点坐标无效, 跳过:', item.venueName, 'lng=', item.longitude, 'lat=', item.latitude)
        return
      }

      const domId = `flow-statistics-${item.id ?? Math.random().toString(36).slice(2)}`
      const markerInfo = {
        bdid: buildingID,
        text: item.venueName || '场馆',
        lon: lng,
        lat: lat,
        floorId: flid,
        dom: buildStatisticsMarkerDom(item),
      }

      try {
        const DaxiMap = (window as any).DaxiMap
        const marker = new DaxiMap.DXMapMarker()
        marker.initialize(map, markerInfo, {
          anchor: 'bottom',
          onClick: () => {
            const el = document.getElementById(domId)
            const detailEl = el?.querySelector<HTMLElement>('.venue-detail-panel')
            if (detailEl) {
              // 如果当前详情面板已显示，则关闭它
              if (detailEl.style.display === 'block') {
                detailEl.style.display = 'none'
                openedInfoEl = null
              } else {
                // 关闭其他打开的详情面板，显示当前的
                closeAllInfo()
                detailEl.style.display = 'block'
                openedInfoEl = detailEl
              }
            }
          },
        })
        marker.addToMap()
        statisticsMarkerArr.push(marker)
      } catch (error) {
        console.error('[FlowHeatmap] 统计标点创建异常:', item.venueName, `(${lng}, ${lat})`, error)
      }
    })

    console.log('[FlowHeatmap] 统计标点渲染完成:', statisticsMarkerArr.length, '个')

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
        console.warn('[FlowHeatmap] easeTo 失败:', e)
      }
    }
  } catch (error) {
    console.error('[FlowHeatmap] 加载场馆统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

/** 切换视图模式 */
async function switchMode(mode: 'heatmap' | 'statistics') {
  if (viewMode.value === mode) return

  viewMode.value = mode

  if (mode === 'heatmap') {
    // 切换到客流热力：清除统计标点，重新渲染热力图
    clearStatisticsMarkers()
    addHeatmapMarkers()
  } else {
    // 切换到客流统计：清除热力图标点，加载统计数据
    clearAllMarkers()
    await loadVenueStatistics()
  }
}

/** 在地图上标记所有场馆热力点位 */
function addHeatmapMarkers() {
  if (!map || !flid) {
    console.warn('[FlowHeatmap] addHeatmapMarkers 跳过: map或flid为空')
    return
  }
  clearAllMarkers()

  const data = props.data
  if (!data || !data.length) {
    console.warn('[FlowHeatmap] addHeatmapMarkers: 数据为空')
    return
  }

  console.log('[FlowHeatmap] 开始添加标点, 数据量:', data.length)

  let successCount = 0
  let skipCount = 0
  data.forEach((item) => {
    const lng = Number(item.lng)
    const lat = Number(item.lat)
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      skipCount++
      console.warn('[FlowHeatmap] 跳过无效坐标:', item.name, 'lng=', item.lng, 'lat=', item.lat)
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

  console.log(`[FlowHeatmap] 标点添加完成: 成功 ${successCount} 个, 跳过 ${skipCount} 个`)

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
      console.warn('[FlowHeatmap] easeTo 失败:', e)
    }
  }
}

/** 初始化地图 */
const initMap = async () => {
  if (!checkWebGLSupport()) {
    console.warn('[FlowHeatmap] WebGL 不支持，跳过地图初始化')
    return
  }

  try {
    const DaxiMap = (window as any).DaxiMap
    try {
      map = await new DaxiMap.Map('flowHeatmapContainer', mapConfig)
    } catch (innerError) {
      console.error('[FlowHeatmap] 地图初始化失败:', innerError)
      return
    }

    mapLoadCompleteHandler = async () => {
      if (!map) return
      console.log('[FlowHeatmap] 地图加载完成')
      setupMapScrollCapture()
      map.setZoomLevelRange(10, 23)
      map.setZoom(14)
      await initFloorId()
      mapReady = true
      // 绘制黄色区域遮罩层
      drawYellowArea()
      // 聚焦到首钢园中心区域
      map.easeTo({
        bdid: buildingID,
        lon: 116.15879098007387,
        lat: 39.91596283494254,
        floorId: flid,
      })
      setTimeout(() => {
        addHeatmapMarkers()
      }, 800)
    }
    map.on('loadComplete', mapLoadCompleteHandler)
    console.log('[FlowHeatmap] 地图初始化成功')
  } catch (error) {
    console.error('[FlowHeatmap] 地图初始化失败:', error)
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

// 监听全屏状态变化，调整容器高度并触发地图 resize，全屏时放大地图比例
watch(
  () => props.fullscreen,
  async (newVal, oldVal) => {
    // 从全屏切换到小屏时，自动切回客流热力模式
    if (oldVal === true && newVal === false && viewMode.value === 'statistics') {
      switchMode('heatmap')
    }

    await nextTick()
    if (!map) return
    // 等待 DOM 完成高度过渡后再触发 resize
    setTimeout(() => {
      try {
        const underlyingMap = map.g || map.getMapBoxMap?.() || map
        if (typeof underlyingMap.resize === 'function') {
          underlyingMap.resize()
        }
        // 全屏时放大地图到更大的缩放级别
        if (props.fullscreen) {
          map.setZoom(15)
        } else {
          map.setZoom(14)
        }
      } catch (e) {
        console.warn('[FlowHeatmap] resize/zoom failed:', e)
      }
    }, 300)
  },
)

// ===================== 缩放控制 =====================

function zoomIn() {
  if (!map) return
  try {
    map.setZoom(map.getZoom() + 1)
  } catch (e) {
    console.warn('[FlowHeatmap] zoomIn 失败:', e)
  }
}

function zoomOut() {
  if (!map) return
  try {
    map.setZoom(map.getZoom() - 1)
  } catch (e) {
    console.warn('[FlowHeatmap] zoomOut 失败:', e)
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

/* 全屏模式：撑满父容器，让地图 canvas 正确计算尺寸 */
.heatmap-map-wrapper.fullscreen {
  width: 100vw;
  height: calc(100vh - 110px);
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
  top: 12px;
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

/* 全屏模式：底部切换按钮 */
.map-bottom-btns {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 1000;
  pointer-events: auto;
}

.map-btn {
  background: rgba(8, 20, 40, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.map-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
}

.map-btn.is-active {
  background: rgba(56, 189, 248, 0.25);
  border-color: rgba(56, 189, 248, 0.8);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.4);
}

.map-btn-icon {
  font-size: 16px;
}

.map-btn-text {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

/* 加载提示 */
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(8, 20, 40, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 999;
  color: #38bdf8;
  font-size: 16px;
  backdrop-filter: blur(8px);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(56, 189, 248, 0.2);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 扫描线覆盖层 */
.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 2;
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent);
  animation: scan-line 6s ease-in-out infinite;
}

/* 扫描线动画 */
@keyframes scan-line {
  0% {
    top: 0%;
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
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

/* ===================== 客流统计模式标点样式 ===================== */
.statistics-marker {
  position: relative;
  cursor: pointer;
}

/* Tag 标签样式：紧凑型展示 */
.statistics-marker .venue-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(8, 20, 40, 0.92);
  border: 1px solid;
  border-radius: 14px;
  white-space: nowrap;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 100;
}

.statistics-marker .venue-tag:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 12px rgba(56, 189, 248, 0.3);
}

.statistics-marker .venue-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.statistics-marker .venue-tag-text {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.2;
}

/* 详情面板：黑色背景 */
.statistics-marker .venue-detail-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  background: #0a0e17;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 10px;
  z-index: 1001;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 16px rgba(56, 189, 248, 0.15);
  overflow: hidden;
}

.statistics-marker .venue-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(56, 189, 248, 0.1);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}

.statistics-marker .venue-detail-title {
  font-size: 14px;
  font-weight: 700;
  color: #38bdf8;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

.statistics-marker .venue-detail-body {
  padding: 12px 14px;
}

.statistics-marker .venue-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.statistics-marker .venue-detail-item + .venue-detail-item {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.statistics-marker .venue-detail-label {
  font-size: 12px;
  color: #94a3b8;
}

.statistics-marker .venue-detail-value {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
}
</style>
