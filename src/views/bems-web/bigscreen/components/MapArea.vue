<template>
  <div class="map-area">
    <!-- DaxiMap 地图容器 -->
    <div id="bigscreenMapContainer" class="map-container"></div>

    <!-- 扫描线动画覆盖层 -->
    <div class="map-overlay">
      <div class="scan-line"></div>
    </div>

    <!-- 摄像头信息面板（点击摄像头标识后显示） -->
    <transition name="slide-fade">
      <div v-if="cameraPanelVisible" class="camera-info-panel">
        <div class="camera-panel-header">
          <span class="panel-title">📹 摄像头详情 ({{ currentCameraGroup?.count || 0 }}个)</span>
          <span class="camera-close-btn" @click="cameraPanelVisible = false">✕</span>
        </div>
        <div class="camera-panel-body">
          <div
            v-for="(video, idx) in currentCameraGroup?.videos || []"
            :key="idx"
            class="camera-item"
          >
            <div class="camera-item-name">{{ video.name || video.shortName || '未命名摄像头' }}</div>
            <div class="camera-item-info">
              <span v-if="video.shortName" class="camera-path">{{ video.shortName }}</span>
              <span class="camera-status" :class="video.online ? 'online' : 'offline'">
                {{ video.online ? '在线' : '离线' }}
              </span>
            </div>
          </div>
          <div v-if="!currentCameraGroup?.videos?.length" class="empty-text">暂无摄像头信息</div>
        </div>
      </div>
    </transition>

    <!-- 底部按钮 -->
    <div class="map-bottom-btns">
      <div
        class="map-btn"
        v-for="btn in mapBtns"
        :key="btn.modalKey"
        :class="{ 'is-active': activeBtn === btn.modalKey }"
        @click="handleBtnClick(btn.modalKey)"
      >
        <span class="map-btn-icon">{{ btn.icon }}</span>
        <span class="map-btn-text">{{ btn.text }}</span>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { loadMapScripts } from '/@/components/map/loadMapScripts';
import { mapBtns } from '../data/index';
import { getCameraCoordinateGroup, getPersonHeatMap } from '../index.api';
import type { CameraGroup, AreaHeatResponseVO, AreaHeatDataItemVO } from '../index.api';

defineOptions({ name: 'MapArea' });

// ==================== 地图基础配置 ====================
const buildingID = 'B000A11DMD';
const token = '572d6c0c869b3e2ce85a63ab2a1d5a0a';
const DEFAULT_FLID = 'DX0003640110100001';

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
};

// ==================== 响应式状态 ====================
let map: any = null;
let flid: string | null = null;
let mapReady = false;

/** 当前激活的按钮 */
const activeBtn = ref<string>('');
/** 加载状态 */
const loading = ref(false);
const loadingText = ref('加载中...');
/** 摄像头信息面板 */
const cameraPanelVisible = ref(false);
const currentCameraGroup = ref<CameraGroup | null>(null);

// ==================== 标点存储 ====================
/** 摄像头标点数组 */
let cameraMarkerArr: any[] = [];
/** 热力图标点数组 */
let heatMarkerArr: any[] = [];
/** 热力图覆盖物数组（polygon等） */
let heatOverlays: any[] = [];
/** 黄色区域覆盖物数组（polygon + polyline） */
let yellowAreaOverlays: any[] = [];

// ==================== 楼层ID初始化 ====================
async function initFloorId(retryCount = 0) {
  flid = map.getCurrentFloorId();
  if (!flid) {
    const floors = map.getCurrentFloorsInfo();
    flid = floors && floors.length ? floors[0].flid : null;
  }
  if (!flid && retryCount < 3) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return initFloorId(retryCount + 1);
  }
  if (!flid) {
    flid = DEFAULT_FLID;
    console.warn('[BigscreenMap] 楼层ID获取失败，使用默认值:', flid);
  }
  console.log('[BigscreenMap] 当前楼层ID:', flid);
}

// ==================== 地图初始化 ====================
async function initMap() {
  const DaxiMap = (window as any).DaxiMap;
  if (!DaxiMap) {
    console.error('[BigscreenMap] DaxiMap SDK 未加载');
    return;
  }

  try {
    map = await new DaxiMap.Map('bigscreenMapContainer', mapConfig);
    map.on('loadComplete', async () => {
      console.log('[BigscreenMap] 地图加载完成');
      map.setZoomLevelRange(10, 23);
      await initFloorId();
      mapReady = true;
      // 绘制黄色区域
      drawYellowArea();
      // 聚焦到首钢园中心区域
      map.easeTo({
        bdid: buildingID,
        lon: 116.15879098007387,
        lat: 39.91596283494254,
        floorId: flid,
      });
    });
    console.log('[BigscreenMap] 地图初始化成功');
  } catch (error) {
    console.error('[BigscreenMap] 地图初始化失败:', error);
  }
}

// ==================== 通用标点创建 ====================
/**
 * 创建自定义 DOM 标点
 */
function createDomMarker(domHtml: string, lon: number, lat: number, text: string, onClick?: () => void) {
  if (!map || !flid) {
    console.warn('[BigscreenMap] 标点创建跳过: map或flid为空');
    return null;
  }
  if (isNaN(lon) || isNaN(lat)) {
    console.warn('[BigscreenMap] 标点坐标无效:', text, 'lon=', lon, 'lat=', lat);
    return null;
  }

  const DaxiMap = (window as any).DaxiMap;
  const markerInfo = {
    bdid: buildingID,
    text,
    lon,
    lat,
    floorId: flid,
    dom: domHtml,
  };

  try {
    const marker = new DaxiMap.DXMapMarker();
    marker.initialize(map, markerInfo, {
      anchor: 'bottom',
      onClick: () => onClick?.(),
    });
    marker.addToMap();
    return marker;
  } catch (error) {
    console.error('[BigscreenMap] 标点创建异常:', text, '坐标:', lon, lat, '错误:', error);
    return null;
  }
}

/**
 * 清除指定标点数组中的所有标点
 */
function clearMarkers(arr: any[]) {
  arr.forEach((m) => {
    try {
      m?.destroy?.();
    } catch (e) {
      console.warn('[BigscreenMap] 标点销毁失败:', e);
    }
    try {
      m?.removeFromMap?.();
    } catch (e) {
      // ignore
    }
  });
  arr.length = 0;
}

/**
 * 清除热力图覆盖物
 */
function clearHeatOverlays() {
  heatOverlays.forEach((o) => {
    try {
      o?.removeFromMap?.();
    } catch (e) {
      // ignore
    }
  });
  heatOverlays.length = 0;
}

/**
 * 清除黄色区域覆盖物
 */
function clearYellowArea() {
  yellowAreaOverlays.forEach((o) => {
    try {
      o?.removeFromMap?.();
    } catch (e) {
      // ignore
    }
  });
  yellowAreaOverlays.length = 0;
}

/**
 * 在地图上绘制黄色区域多边形
 */
function drawYellowArea() {
  if (!map || !flid) {
    console.warn('[BigscreenMap] 绘制黄色区域跳过: map或flid为空');
    return;
  }

  // 黄色区域坐标点 [lng, lat]
  const yellowAreaCoords: number[][] = [
    [116.156697, 39.919386],
    [116.16013, 39.919435],
    [116.160109, 39.91769],
    [116.162512, 39.917707],
    [116.162448, 39.907568],
    [116.158113, 39.907634],
    [116.157963, 39.914432],
  ];

  // 闭合多边形（首尾相连）
  const closedCoords = [...yellowAreaCoords, yellowAreaCoords[0]];

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
    });
    if (polygon) yellowAreaOverlays.push(polygon);

    // 绘制黄色边框线（线宽3px）
    const polyline = map.createPolyline2({
      bdid: buildingID,
      floorId: flid,
      lineColor: 'rgba(250, 204, 21, 0.9)',
      lineWidth: 3,
      wrapperColor: 'transparent',
      wrapperWidth: 4,
      linePoints: closedCoords,
    });
    if (polyline) yellowAreaOverlays.push(polyline);

    console.log('[BigscreenMap] 黄色区域已绘制, 坐标点数:', yellowAreaCoords.length);
  } catch (error) {
    console.error('[BigscreenMap] 绘制黄色区域失败:', error);
  }
}

/**
 * 清除所有地图上的标点和覆盖物
 */
function clearAllMapOverlays() {
  clearMarkers(cameraMarkerArr);
  clearMarkers(heatMarkerArr);
  clearHeatOverlays();
  cameraPanelVisible.value = false;
}

// ==================== 安防按钮：摄像头标点 ====================

/**
 * 构建摄像头标点 DOM
 */
function buildCameraMarkerDom(group: CameraGroup): string {
  const count = group.count || (group.videos?.length || 0);
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
    : '';

  return `<div class="camera-marker" style="
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
      background: rgba(8, 20, 40, 0.85);
      border: 2px solid #38bdf8;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
      transition: transform 0.2s ease;
    ">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#38bdf8" stroke-width="2">
        <path d="M23 7l-7 5 7 5V7z"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    </div>
    ${badgeHtml}
  </div>`;
}

/**
 * 加载摄像头数据并渲染标点
 */
async function loadCameraMarkers() {
  if (!mapReady) {
    console.warn('[BigscreenMap] 地图未就绪，无法渲染摄像头标点');
    return;
  }

  loading.value = true;
  loadingText.value = '加载安防数据...';

  try {
    const res = await getCameraCoordinateGroup();
    const data: CameraGroup[] = res?.result || res?.data || res || [];

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[BigscreenMap] 摄像头数据为空');
      return;
    }

    console.log('[BigscreenMap] 摄像头分组数据:', data.length, '组');

    // 清除之前的摄像头标点
    clearMarkers(cameraMarkerArr);

    data.forEach((group: CameraGroup) => {
      const lon = Number(group.longitude);
      const lat = Number(group.latitude);
      if (isNaN(lon) || isNaN(lat)) {
        console.warn('[BigscreenMap] 摄像头分组坐标无效:', group);
        return;
      }

      const domHtml = buildCameraMarkerDom(group);
      const marker = createDomMarker(
        domHtml,
        lon,
        lat,
        `摄像头分组(${group.count || group.videos?.length || 0})`,
        () => {
          // 点击摄像头标识，显示该分组下所有摄像头信息
          currentCameraGroup.value = group;
          cameraPanelVisible.value = true;
        }
      );

      if (marker) {
        cameraMarkerArr.push(marker);
      }
    });

    console.log('[BigscreenMap] 摄像头标点渲染完成:', cameraMarkerArr.length, '个');
  } catch (error) {
    console.error('[BigscreenMap] 加载摄像头数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// ==================== 客流按钮：热力图渲染 ====================

/**
 * 根据权重比例获取热力颜色
 * @param ratio 当前点人数 / 最大权重 (0~1)
 * @returns { color, glowColor } 颜色对象
 */
function getHeatColor(ratio: number): { color: string; glowColor: string; label: string } {
  if (ratio >= 0.85) {
    return { color: 'rgba(255, 50, 50, 0.85)', glowColor: 'rgba(255, 50, 50, 0.35)', label: '极密' };
  }
  if (ratio >= 0.6) {
    return { color: 'rgba(255, 120, 50, 0.8)', glowColor: 'rgba(255, 120, 50, 0.3)', label: '密集' };
  }
  if (ratio >= 0.4) {
    return { color: 'rgba(255, 200, 50, 0.75)', glowColor: 'rgba(255, 200, 50, 0.25)', label: '适中' };
  }
  if (ratio >= 0.2) {
    return { color: 'rgba(50, 220, 120, 0.7)', glowColor: 'rgba(50, 220, 120, 0.2)', label: '稀疏' };
  }
  return { color: 'rgba(50, 150, 255, 0.65)', glowColor: 'rgba(50, 150, 255, 0.15)', label: '极少' };
}

/**
 * 构建热力点 DOM
 */
function buildHeatMarkerDom(item: AreaHeatDataItemVO, ratio: number): string {
  const { color, glowColor } = getHeatColor(ratio);
  const count = item.count || 0;
  // 圆形大小：基础30px + 按比例增长，范围 30~80px
  const size = 30 + ratio * 50;

  return `<div class="heat-marker" style="
    position: relative;
    width: ${size}px;
    height: ${size}px;
    cursor: default;
    pointer-events: none;
  ">
    <!-- 外层光晕 -->
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);
      border-radius: 50%;
    "></div>
    <!-- 主圆点 -->
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60%;
      height: 60%;
      background: ${color};
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 12px ${color};
    "></div>
    <!-- 人数标签 -->
    <div style="
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 11px;
      color: #e2e8f0;
      background: rgba(6, 25, 50, 0.85);
      padding: 1px 6px;
      border-radius: 3px;
      border: 1px solid rgba(56, 189, 248, 0.2);
      font-weight: 600;
    ">${count}人</div>
  </div>`;
}

/**
 * 加载热力图数据并渲染
 */
async function loadHeatMap() {
  if (!mapReady) {
    console.warn('[BigscreenMap] 地图未就绪，无法渲染热力图');
    return;
  }

  loading.value = true;
  loadingText.value = '加载客流数据...';

  try {
    const res = await getPersonHeatMap();
    const data: AreaHeatResponseVO = res?.result || res?.data || res || {};

    const maxWeight = data.maxweight || 1;
    const heatList: AreaHeatDataItemVO[] = data.peopleHeatmapDataList || [];

    if (!heatList.length) {
      console.warn('[BigscreenMap] 热力图数据为空');
      return;
    }

    console.log('[BigscreenMap] 热力图数据:', heatList.length, '个点, 最大权重:', maxWeight);

    // 清除之前的热力图标点
    clearMarkers(heatMarkerArr);
    clearHeatOverlays();

    heatList.forEach((item: AreaHeatDataItemVO) => {
      const lon = Number(item.lon);
      const lat = Number(item.lat);
      if (isNaN(lon) || isNaN(lat)) {
        console.warn('[BigscreenMap] 热力点坐标无效:', item);
        return;
      }

      const ratio = maxWeight > 0 ? (item.count || 0) / maxWeight : 0;
      const domHtml = buildHeatMarkerDom(item, ratio);

      const marker = createDomMarker(
        domHtml,
        lon,
        lat,
        `热力点(${item.count}人)`,
      );

      if (marker) {
        heatMarkerArr.push(marker);
      }
    });

    console.log('[BigscreenMap] 热力图渲染完成:', heatMarkerArr.length, '个点');
  } catch (error) {
    console.error('[BigscreenMap] 加载热力图数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// ==================== 按钮点击处理 ====================

/**
 * 处理按钮点击
 */
async function handleBtnClick(btnKey: string) {
  // 点击已激活的按钮：取消激活，清除地图覆盖物
  if (activeBtn.value === btnKey) {
    activeBtn.value = '';
    clearAllMapOverlays();
    return;
  }

  // 切换按钮：先清除之前的覆盖物
  activeBtn.value = btnKey;
  clearAllMapOverlays();

  // 根据按钮类型调用对应接口
  if (btnKey === 'mapPeople') {
    // 客流按钮：请求 personHeatMap 接口
    await loadHeatMap();
  } else if (btnKey === 'mapSecurity') {
    // 安防按钮：请求 cameraCoordinateGroup 接口
    await loadCameraMarkers();
  } else if (btnKey === 'mapLighting') {
    // 照明按钮：参考 bigGis 功能，清除覆盖物（暂无专用接口）
    console.log('[BigscreenMap] 照明按钮点击，清除地图覆盖物');
  }
}

// ==================== 点击地图空白关闭摄像头面板 ====================
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest('.camera-marker')) return;
  if (target.closest('.camera-info-panel')) return;
  if (cameraPanelVisible.value) {
    cameraPanelVisible.value = false;
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await loadMapScripts();
  await initMap();
  document.addEventListener('click', handleDocumentClick, true);
});

onUnmounted(() => {
  clearAllMapOverlays();
  clearYellowArea();
  document.removeEventListener('click', handleDocumentClick, true);
  if (map) {
    map = null;
  }
});
</script>

<style scoped>
.map-area {
  flex: 1;
  background: rgba(8, 20, 40, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.18);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

/* 地图容器 */
.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
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

/* 底部按钮 */
.map-bottom-btns {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
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
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

/* 摄像头信息面板 */
.camera-info-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 280px;
  max-height: 360px;
  background: rgba(8, 20, 40, 0.92);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.1);
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
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.05));
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}

.panel-title {
  color: #38bdf8;
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
}

.camera-close-btn {
  width: 22px;
  height: 22px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
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
  background: rgba(239, 68, 68, 0.3);
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
  background: rgba(255, 255, 255, 0.05);
}

.camera-panel-body::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.3);
  border-radius: 3px;
}

.camera-item {
  padding: 8px 10px;
  margin-bottom: 4px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 4px;
  transition: background 0.2s;
}

.camera-item:hover {
  background: rgba(56, 189, 248, 0.1);
}

.camera-item-name {
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-item-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.camera-path {
  color: rgba(255, 255, 255, 0.5);
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
  color: #4ade80;
  background: rgba(74, 222, 128, 0.15);
}

.camera-status.offline {
  color: #f87171;
  background: rgba(248, 113, 113, 0.15);
}

.empty-text {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  padding: 20px 0;
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
  z-index: 15;
  color: #38bdf8;
  font-size: 13px;
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

<!-- 全局样式：摄像头标点和热力图标点由 SDK 注入到组件作用域外 -->
<style>
/* 摄像头标点 hover 效果 */
.camera-marker:hover > div:first-child {
  transform: translate(-50%, -50%) scale(1.2) !important;
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.8) !important;
  border-color: #ffffff !important;
}
</style>
