<template>
  <div class="security-camera-map" :class="{ 'map-fullscreen': fullscreen }">
    <!-- 全屏按钮 -->
    <div class="fullscreen-toggle">
      <button class="fs-btn" @click="toggleFullscreen">
        <FullscreenExitOutlined v-if="fullscreen" />
        <FullscreenOutlined v-else />
      </button>
    </div>

    <div id="securityCameraMapContainer" class="map-container"></div>

    <!-- 摄像头信息面板（点击摄像头标识后显示） -->
    <transition name="slide-fade">
      <div v-if="cameraPanelVisible" class="camera-info-panel">
        <div class="camera-panel-header">
          <span class="panel-title">摄像头详情 ({{ currentCameraGroup?.cameraCount || 0 }}个)</span>
          <span class="camera-close-btn" @click="cameraPanelVisible = false">✕</span>
        </div>
        <div class="camera-panel-body">
          <div
            v-for="(video, idx) in currentCameraGroup?.cameraList || []"
            :key="idx"
            class="camera-item"
            @click="openCameraModal(currentCameraGroup, video)"
          >
            <div class="camera-item-name">
              <VideoCameraOutlined />
              {{ video.name || '未命名摄像头' }}
            </div>
          </div>
          <div v-if="!currentCameraGroup?.cameraList?.length" class="empty-text">暂无摄像头信息</div>
        </div>
      </div>
    </transition>

    <!-- 摄像头播放弹窗 -->
    <a-modal
      v-model:open="cameraModalVisible"
      :title="null"
      :footer="null"
      :closable="false"
      width="60%"
      :bodyStyle="{ padding: 0, overflow: 'hidden' }"
      wrapClassName="camera-modal-wrapper-light"
      @cancel="handleCloseCameraModal"
    >
      <div class="camera-modal-box">
        <div class="camera-modal-header">
          <div class="camera-modal-title">
            <VideoCameraOutlined />
            摄像头监控 ({{ cameraModalGroup?.cameraCount || cameraModalGroup?.cameraList?.length || 0 }}个)
          </div>
          <button class="camera-modal-close" @click="handleCloseCameraModal">✕</button>
        </div>
        <div class="camera-modal-body">
          <a-tabs v-if="cameraTabItems.length" v-model:activeKey="activeCameraTab" type="card" size="small">
            <a-tab-pane
              v-for="tab in cameraTabItems"
              :key="tab.key"
              :tab="tab.label"
            />
          </a-tabs>
          <!-- 只渲染当前选中的摄像头 iframe，切换 tab 时销毁旧 iframe 创建新的 -->
          <div v-if="cameraTabItems.length" class="camera-iframe-wrap">
            <iframe
              v-if="cameraIframeUrl"
              :key="activeCameraTab"
              :src="cameraIframeUrl"
              frameborder="0"
              allow="autoplay; fullscreen; encrypted-media"
              allowfullscreen
              class="camera-iframe"
            />
            <div v-else class="camera-iframe-placeholder">
              <span>暂无视频流</span>
            </div>
          </div>
          <div v-else class="camera-iframe-placeholder">
            <span>暂无摄像头数据</span>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 加载提示 -->
    <div v-if="loading" class="map-loading">
      <div class="loading-spinner"></div>
      <span>{{ loadingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { loadMapScripts } from '/@/components/map/loadMapScripts'
import { getCameraCoordinateGroup } from '../../index.api'
import { FullscreenOutlined, FullscreenExitOutlined, VideoCameraOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'SecurityCameraMap' })

// ==================== 地图基础配置 ====================
const buildingID = 'B000A11DMD'
const token = '572d6c0c869b3e2ce85a63ab2a1d5a0a'
const DEFAULT_FLID = 'DX0003640110100001'

const mapConfig = {
  token,
  appName: 'HelloWorld',
  projectPath: '',
  baseMapPath: '/map/',
  spriteUrl: `${window.location.origin}/map/assets/images/default_markers`,
  scenePath: '/data/',
  buildingId: buildingID,
  defaultCenter: { lon: 116.162, lat: 39.912 },
  defaultZoomLevel: 15.0,
  showOutDoorMap: false,
  mapDataPath: '/data/572d6c0c869b3e2ce85a63ab2a1d5a0a/{{bdid}}/',
}

// ==================== 响应式状态 ====================
let map: any = null
let flid: string | null = null
let mapReady = false

const loading = ref(false)
const loadingText = ref('加载中...')
const cameraPanelVisible = ref(false)
const currentCameraGroup = ref<any | null>(null)
const fullscreen = ref(false)

/** 摄像头弹窗：页面级弹窗 */
const cameraModalVisible = ref(false)
const cameraModalGroup = ref<any | null>(null)
const activeCameraTab = ref<string>('')

/** 根据摄像头 systemId 构建 iframe URL */
const CAMERA_IFRAME_BASE = 'http://10.168.47.23:4000/index.html?id='
const cameraIframeUrl = computed(() => {
  const cameraList = cameraModalGroup.value?.cameraList || []
  const video = cameraList.find((v) => String(v.systemId) === activeCameraTab.value)
  if (!video) return ''
  // 去掉 systemId 中的 # 字符后再拼接
  const cleanId = String(video.systemId).replace(/#/g, '')
  return CAMERA_IFRAME_BASE + cleanId
})

/** 摄像头弹窗 tab 列表 */
const cameraTabItems = computed(() => {
  const cameraList = cameraModalGroup.value?.cameraList || []
  return cameraList.map((v) => ({
    key: String(v.systemId),
    label: v.name || '未命名摄像头',
  }))
})

// ==================== 滚轮事件拦截（参考 FlowHeatmapMapView） ====================
let mapContainer: HTMLElement | null = null
const mapScrollListeners: Array<{ target: EventTarget; name: string; handler: EventListener }> = []

/**
 * 拦截地图容器内的滚轮事件，阻止 SDK 捕获，让页面正常滚动。
 * 同时强制 html/body overflow:auto，避免 SDK 设置 overflow:hidden。
 */
function setupMapScrollCapture() {
  if (mapScrollListeners.length > 0) return

  mapContainer = document.getElementById('securityCameraMapContainer')
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

/** 移除滚轮事件拦截 */
function removeMapScrollCapture() {
  mapScrollListeners.forEach(({ target, name, handler }) => {
    target.removeEventListener(name, handler, { capture: true })
  })
  mapScrollListeners.length = 0
  mapContainer = null
}

// ==================== 标点存储 ====================
let cameraMarkerArr: any[] = []
let cameraGroupCache: any[] = []

// ==================== 楼层ID初始化 ====================
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
    console.warn('[SecurityCameraMap] 楼层ID获取失败，使用默认值:', flid)
  }
  console.log('[SecurityCameraMap] 当前楼层ID:', flid)
}

// ==================== 地图初始化 ====================
async function initMap() {
  const DaxiMap = (window as any).DaxiMap
  if (!DaxiMap) {
    console.error('[SecurityCameraMap] DaxiMap SDK 未加载')
    return
  }

  try {
    map = await new DaxiMap.Map('securityCameraMapContainer', mapConfig)
    map.on('loadComplete', async () => {
      console.log('[SecurityCameraMap] 地图加载完成')
      // 安装滚轮事件拦截，让页面可以正常滚动
      setupMapScrollCapture()
      map.setZoomLevelRange(10, 23)
      await initFloorId()
      mapReady = true
      // 聚焦到首钢园中心区域
      map.easeTo({
        bdid: buildingID,
        lon: 116.15879098007387,
        lat: 39.91596283494254,
        floorId: flid,
      })
      // 加载摄像头标点
      loadCameraMarkers()
    })
    console.log('[SecurityCameraMap] 地图初始化成功')
  } catch (error) {
    console.error('[SecurityCameraMap] 地图初始化失败:', error)
  }
}

// ==================== 通用标点创建 ====================
function createDomMarker(domHtml: string, lon: number, lat: number, text: string) {
  if (!map || !flid) {
    console.warn('[SecurityCameraMap] 标点创建跳过: map或flid为空')
    return null
  }
  if (isNaN(lon) || isNaN(lat)) {
    console.warn('[SecurityCameraMap] 标点坐标无效:', text, 'lon=', lon, 'lat=', lat)
    return null
  }

  const DaxiMap = (window as any).DaxiMap
  const markerInfo = {
    bdid: buildingID,
    text,
    lon,
    lat,
    floorId: flid,
    dom: domHtml,
  }

  try {
    const marker = new DaxiMap.DXMapMarker()
    marker.initialize(map, markerInfo, {
      anchor: 'bottom',
    })
    marker.addToMap()
    return marker
  } catch (error) {
    console.error('[SecurityCameraMap] 标点创建异常:', text, '坐标:', lon, lat, '错误:', error)
    return null
  }
}

function clearMarkers(arr: any[]) {
  arr.forEach((m) => {
    try {
      m?.destroy?.()
    } catch (e) {
      // ignore
    }
    try {
      m?.removeFromMap?.()
    } catch (e) {
      // ignore
    }
  })
  arr.length = 0
}

// ==================== 摄像头标点 ====================

function buildCameraMarkerDom(group: any, idx: number): string {
  const count = group.cameraCount || (group.cameraList?.length || 0)
  const badgeHtml = count > 1
    ? `<span class="camera-badge" style="
        position: absolute;
        top: -4px;
        right: -4px;
        background: #0ea5e9;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        line-height: 16px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        text-align: center;
        box-sizing: border-box;
        z-index: 20;
        border: 1px solid rgba(255,255,255,0.3);
      ">${count}</span>`
    : ''

  return `<div class="security-camera-marker" data-camera-idx="${idx}" style="
    position: relative;
    width: 36px;
    height: 36px;
    cursor: pointer;
  ">
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 28px;
      height: 28px;
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #0ea5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.35);
      transition: transform 0.2s ease;
    ">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0ea5e9" stroke-width="2">
        <path d="M23 7l-7 5 7 5V7z"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    </div>
    ${badgeHtml}
  </div>`
}

async function loadCameraMarkers() {
  if (!mapReady) {
    console.warn('[SecurityCameraMap] 地图未就绪，无法渲染摄像头标点')
    return
  }

  loading.value = true
  loadingText.value = '加载摄像头数据...'

  try {
    const res = await getCameraCoordinateGroup()
    const data: any[] = res?.result || res?.data || res || []

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[SecurityCameraMap] 摄像头数据为空')
      return
    }

    console.log('[SecurityCameraMap] 摄像头分组数据:', data.length, '组')

    clearMarkers(cameraMarkerArr)
    cameraGroupCache = data

    data.forEach((group: any, idx: number) => {
      const lon = Number(group.longitude)
      const lat = Number(group.latitude)
      if (isNaN(lon) || isNaN(lat)) {
        console.warn('[SecurityCameraMap] 摄像头分组坐标无效:', group)
        return
      }

      const domHtml = buildCameraMarkerDom(group, idx)
      const marker = createDomMarker(
        domHtml,
        lon,
        lat,
        `摄像头分组(${group.cameraCount || group.cameraList?.length || 0})`,
      )

      if (marker) {
        cameraMarkerArr.push(marker)
      }
    })

    console.log('[SecurityCameraMap] 摄像头标点渲染完成:', cameraMarkerArr.length, '个')
  } catch (error) {
    console.error('[SecurityCameraMap] 加载摄像头数据失败:', error)
  } finally {
    loading.value = false
  }
}

// ==================== 摄像头弹窗（参考大屏 MapArea 实现） ====================

/** 打开摄像头播放弹窗 */
function openCameraModal(group: any, video?: any) {
  cameraModalGroup.value = group
  // 如果指定了某个摄像头，默认选中它；否则选中第一个
  if (video) {
    activeCameraTab.value = String(video.systemId)
  } else {
    const firstVideo = group.cameraList?.[0]
    activeCameraTab.value = firstVideo ? String(firstVideo.systemId) : ''
  }
  cameraModalVisible.value = true
  cameraPanelVisible.value = false
}

/** 关闭摄像头播放弹窗 */
function handleCloseCameraModal() {
  cameraModalVisible.value = false
  cameraModalGroup.value = null
  activeCameraTab.value = ''
}

// ==================== 全屏切换 ====================
function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
}

// 监听全屏状态变化，触发地图 resize
watch(
  () => fullscreen.value,
  async () => {
    await nextTick()
    if (!map) return
    setTimeout(() => {
      try {
        const underlyingMap = map.g || map.getMapBoxMap?.() || map
        if (typeof underlyingMap.resize === 'function') {
          underlyingMap.resize()
        }
      } catch (e) {
        console.warn('[SecurityCameraMap] resize failed:', e)
      }
    }, 300)
  },
)

// ==================== DOM 级摄像头点击事件委托 ====================
function handleMapContainerClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const markerEl = target.closest('.security-camera-marker') as HTMLElement | null
  if (!markerEl) return
  const idx = Number(markerEl.getAttribute('data-camera-idx'))
  if (!isNaN(idx) && cameraGroupCache[idx]) {
    currentCameraGroup.value = cameraGroupCache[idx]
    cameraPanelVisible.value = true
    e.stopPropagation()
  }
}

function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.security-camera-marker')) return
  if (target.closest('.camera-info-panel')) return
  if (target.closest('.camera-modal-wrapper-light')) return
  if (target.closest('.ant-modal')) return
  if (target.closest('.fullscreen-toggle')) return
  if (cameraPanelVisible.value) {
    cameraPanelVisible.value = false
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await loadMapScripts()
  await initMap()
  document.addEventListener('click', handleDocumentClick, true)
  const container = document.getElementById('securityCameraMapContainer')
  if (container) {
    container.addEventListener('click', handleMapContainerClick)
  }
})

onUnmounted(() => {
  clearMarkers(cameraMarkerArr)
  cameraGroupCache = []
  cameraPanelVisible.value = false
  cameraModalVisible.value = false
  removeMapScrollCapture()
  document.removeEventListener('click', handleDocumentClick, true)
  const container = document.getElementById('securityCameraMapContainer')
  if (container) {
    container.removeEventListener('click', handleMapContainerClick)
  }
  if (map) {
    map = null
  }
})
</script>

<style scoped>
.security-camera-map {
  position: relative;
  width: 100%;
  height: 580px;
  background: #f7f9fc;
  border-radius: 8px;
  overflow: hidden;
}

.security-camera-map.map-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  border-radius: 0;
  background: #fff;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map-fullscreen .map-container {
  border-radius: 0;
}

/* 全屏按钮 */
.fullscreen-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 30;
}

.fs-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fs-btn:hover {
  background: #fff;
}

.fs-btn:active {
  background: #f0f0f0;
}

/* 摄像头信息面板（白色风格） */
.camera-info-panel {
  position: absolute;
  top: 50px;
  right: 12px;
  width: 280px;
  max-height: 360px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 20;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.camera-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-bottom: 1px solid #e2e8f0;
}

.panel-title {
  color: #0ea5e9;
  font-size: 13px;
  font-weight: 600;
}

.camera-close-btn {
  width: 22px;
  height: 22px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #ef4444;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.camera-close-btn:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.camera-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  max-height: 300px;
}

.camera-panel-body::-webkit-scrollbar {
  width: 5px;
}

.camera-panel-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.camera-panel-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.camera-item {
  padding: 8px 10px;
  margin-bottom: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
}

.camera-item:hover {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.camera-item-name {
  color: #1e293b;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 5px;
}

.camera-item-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.camera-path {
  color: #64748b;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.camera-status {
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 3px;
}

.camera-status.online {
  color: #16a34a;
  background: #dcfce7;
}

.camera-status.offline {
  color: #dc2626;
  background: #fee2e2;
}

.empty-text {
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  padding: 20px 0;
}

/* 加载提示 */
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 15;
  color: #0ea5e9;
  font-size: 13px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0f2fe;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 面板过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>

<!-- 全局样式：摄像头标点由 SDK 注入到组件作用域外 -->
<style>
.security-camera-marker:hover > div:first-child {
  transform: translate(-50%, -50%) scale(1.2) !important;
  box-shadow: 0 0 16px rgba(14, 165, 233, 0.6) !important;
  border-color: #0284c7 !important;
}

/* 摄像头播放弹窗 — 白色风格 */
.camera-modal-wrapper-light .ant-modal {
  top: 40px;
}
.camera-modal-wrapper-light .ant-modal-content {
  background: #ffffff !important;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15) !important;
  padding: 0 !important;
  overflow: hidden !important;
  border-radius: 8px !important;
}
.camera-modal-wrapper-light .ant-modal-close {
  display: none;
}
.camera-modal-wrapper-light .ant-modal-mask {
  background: rgba(0, 0, 0, 0.45) !important;
}

.camera-modal-box {
  background: #ffffff;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.camera-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  background: #fafbfc;
}

.camera-modal-title {
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.camera-modal-close {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.camera-modal-close:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.camera-modal-body {
  flex: 1;
  padding: 12px 16px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.camera-modal-body .ant-tabs {
  height: 100%;
}

.camera-modal-body .ant-tabs-tab:not(.ant-tabs-tab-active) {
  color: #64748b !important;
}

.camera-modal-body .ant-tabs-tab:not(.ant-tabs-tab-active):hover {
  color: #0ea5e9 !important;
}

.camera-modal-body .ant-tabs-nav-more {
  color: #64748b !important;
}

.camera-modal-body .ant-tabs-nav-more:hover {
  color: #0ea5e9 !important;
}

.camera-modal-body .ant-tabs-content {
  height: calc(100% - 40px);
}

.camera-modal-body .ant-tabs-tabpane {
  height: 100%;
}

.camera-iframe-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
}

.camera-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.camera-iframe-placeholder {
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
