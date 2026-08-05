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
import { onMounted, onUnmounted, watch } from 'vue'
import { loadMapScripts } from '/@/components/map/loadMapScripts'
import type { ParkingSpaceStatVO } from './index.api'

const props = defineProps<{
  data: ParkingSpaceStatVO[]
}>()

// 地图相关状态
let map: any = null
let flid: string | null = null
let mapReady = false
const markerArr: any[] = []
let openedInfoEl: HTMLElement | null = null

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
  try {
    const DaxiMap = (window as any).DaxiMap
    map = await new DaxiMap.Map('parkingMapContainer', mapConfig)
    map.on('loadComplete', async () => {
      console.log('[ParkingMap] 地图加载完成')
      // SDK 的 createCanvas 会设置 html.style.overflow = "visible"（内联样式），
      // 覆盖全局 CSS 的 html { overflow: hidden }。
      // 这里不移除它，让当前页面可以滚动。
      // 在 onUnmounted 中再清理，避免影响其他页面。
      map.setZoomLevelRange(10, 23)
      // 默认缩放到 14
      map.setZoom(14)
      await initFloorId()
      mapReady = true
      setTimeout(() => {
        addParkingMarkers()
      }, 800)
    })
    console.log('[ParkingMap] 地图初始化成功')
  } catch (error) {
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

onMounted(async () => {
  // 使用共享的 loadMapScripts（单例，带 AMD define 隔离）
  await loadMapScripts()
  initMap()
  // 点击地图空白时自动关闭信息面板
  document.addEventListener('click', handleDocumentClick, true)
})

onUnmounted(() => {
  // 清除所有标点
  clearAllMarkers()
  if (map) {
    map = null
  }
  // 清理 SDK 在 html 上设置的内联 overflow 样式，
  // 让全局 CSS 的 html { overflow: hidden } 重新生效，
  // 避免影响其他页面的滚动行为。
  document.documentElement.style.removeProperty('overflow')
  // 移除全局点击监听
  document.removeEventListener('click', handleDocumentClick, true)
})
</script>

<style scoped>
.parking-map-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
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
