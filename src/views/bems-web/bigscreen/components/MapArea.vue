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
          <span class="panel-title">📹 摄像头详情 ({{ currentCameraGroup?.cameraList?.length || 0 }}个)</span>
          <span class="camera-close-btn" @click="cameraPanelVisible = false">✕</span>
        </div>
        <div class="camera-panel-body">
          <div
            v-for="(video, idx) in currentCameraGroup?.cameraList || []"
            :key="idx"
            class="camera-item"
            @click="handleOpenCameraModal(currentCameraGroup!)"
          >
            <div class="camera-item-name">{{ video.name || video.installLocation || '未命名摄像头' }}</div>
            <div class="camera-item-info">
              <span v-if="video.installLocation" class="camera-path">{{ video.installLocation }}</span>
              <span class="camera-status" :class="video.online ? 'online' : 'offline'">
                {{ video.online ? '在线' : '离线' }}
              </span>
            </div>
          </div>
          <div v-if="!currentCameraGroup?.cameraList?.length" class="empty-text">暂无摄像头信息</div>
        </div>
      </div>
    </transition>

    <!-- 摄像头页面级弹窗 -->
    <a-modal
      v-model:open="cameraModalVisible"
      :title="null"
      :footer="null"
      :closable="false"
      width="70%"
      :bodyStyle="{ padding: 0, overflow: 'hidden' }"
      wrapClassName="camera-modal-wrapper"
      @cancel="handleCloseCameraModal"
    >
      <div class="camera-modal-box">
        <div class="camera-modal-top-bar"></div>
        <div class="camera-modal-header">
          <div class="camera-modal-title">📹 摄像头监控 ({{ cameraModalGroup?.cameraList?.length || 0 }}个)</div>
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
      <!-- 照明子按钮：浮动显示，不影响原有布局 -->
      <div v-if="lightingSubVisible" class="lighting-sub-float">
        <div
          class="map-btn sub-btn"
          :class="{ 'is-active': activeLightingMode === 'parcel' }"
          @click="handleLightingSubClick('parcel')"
        >
          <span class="map-btn-text">地块模式</span>
        </div>
        <div
          class="map-btn sub-btn"
          :class="{ 'is-active': activeLightingMode === 'detail' }"
          @click="handleLightingSubClick('detail')"
        >
          <span class="map-btn-text">详情模式</span>
        </div>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="loading" class="map-loading">
      <div class="loading-spinner"></div>
      <span>{{ loadingText }}</span>
    </div>

    <!-- 详情模式控制弹窗 -->
    <DetailMode ref="detailModeRef" />

    <!-- 地块模式控制弹窗 -->
    <ParcelMode ref="parcelModeRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { loadMapScripts } from '/@/components/map/loadMapScripts';
import { mapBtns } from '../data/index';
import { getPersonHeatMap } from '../index.api';
import { getCameraPackageGroup } from '../../safety/security/index.api';
import type { AreaHeatResponseVO, AreaHeatDataItemVO } from '../index.api';
import type { PackageGroup, PackageVideo } from '../../safety/security/index.api';
import { getAllAreaApi, getAllCircuitApi } from '../../northAreaLightingSys/comprehensivePreview/comprehensivePreview.api';
import DetailMode from './DetailMode.vue';
import ParcelMode from './ParcelMode.vue';
import spaceBoundariesData from '../../northAreaLightingSys/bigGis/space-boundaries.json';

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
const currentCameraGroup = ref<{ longitude: number; latitude: number; name: string; cameraList: PackageVideo[] } | null>(null);
/** 摄像头弹窗：页面级弹窗 */
const cameraModalVisible = ref(false);
const cameraModalGroup = ref<{ longitude: number; latitude: number; name: string; cameraList: PackageVideo[] } | null>(null);
const activeCameraTab = ref<string>('');
/** 根据摄像头 indexCode 构建 iframe URL */
const CAMERA_IFRAME_BASE = 'http://10.168.47.23:4000/index.html?id=';
/** 兼容获取摄像头唯一编码：优先 indexCode，其次 systemId（去#），最后 id */
function getCameraKey(v: PackageVideo): string {
  return v.indexCode || (v as any).systemId?.replace(/#/g, '') || String(v.id || '');
}
const cameraIframeUrl = computed(() => {
  const cameraList = cameraModalGroup.value?.cameraList || [];
  const video = cameraList.find((v) => getCameraKey(v) === activeCameraTab.value);
  if (!video) return '';
  const cleanId = getCameraKey(video);
  return CAMERA_IFRAME_BASE + cleanId;
});
/** 摄像头弹窗 tab 列表 */
const cameraTabItems = computed(() => {
  const cameraList = cameraModalGroup.value?.cameraList || [];
  return cameraList.map((v) => ({
    key: getCameraKey(v),
    label: v.name || v.installLocation || '未命名摄像头',
  }));
});

/**
 * 监听 tab 列表变化，在 DOM 渲染后强制将选中 tab 滚动到可视区域，
 * 防止 a-tabs 自动滚动到最后一个 tab 的问题。
 */
watch(
  () => cameraTabItems.value,
  async (items) => {
    if (!items.length || !activeCameraTab.value) return;
    await nextTick();
    // 在 DOM 更新后，手动将 active tab 滚动到可视区域
    const tabNav = document.querySelector('.camera-modal-wrapper .ant-tabs-nav-list');
    if (!tabNav) return;
    const activeTab = tabNav.querySelector('.ant-tabs-tab-active') as HTMLElement | null;
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
    }
  },
);

// ==================== 标点存储 ====================
/** 摄像头标点数组 */
let cameraMarkerArr: any[] = [];
/** 摄像头分组数据缓存（供 DOM 事件委托使用） */
let cameraGroupCache: Array<{ longitude: number; latitude: number; name: string; cameraList: PackageVideo[] }> = [];
/** 热力图标点数组 */
let heatMarkerArr: any[] = [];
/** 热力图覆盖物数组（polygon等） */
let heatOverlays: any[] = [];
/** 黄色区域覆盖物数组（polygon + polyline） */
let yellowAreaOverlays: any[] = [];
/** 照明按钮子菜单是否可见 */
const lightingSubVisible = ref(false);
/** 当前激活的照明模式：parcel(地块) / detail(详情) */
const activeLightingMode = ref<'parcel' | 'detail' | ''>('');

// ==================== 详情模式标点 ====================
/** 详情模式弹窗引用 */
const detailModeRef = ref<InstanceType<typeof DetailMode> | null>(null);
/** 照明标点数据存储 */
const lightingData = ref<any[]>([]);
/** 照明标点 DOM 标记数组（用于事件委托） */
let lightingMarkerArr: any[] = [];
/** 照明标点数据加载状态 */
const lightingDataLoaded = ref(false);

// ==================== 照明标点成员列表状态 ====================
/** 当前展开的成员列表元素 */
let openedLightingListEl: HTMLElement | null = null;
/** 展开列表时对应 marker 容器 */
let openedLightingMarkerEl: HTMLElement | null = null;
let openedLightingMarkerOriginalZ = '';

// ==================== 地块模式状态 ====================
/** 地块模式弹窗引用 */
const parcelModeRef = ref<InstanceType<typeof ParcelMode> | null>(null);
/** 地块标点数组 */
let parcelMarkerArr: any[] = [];
/** 地块边界线数组 */
let parcelBoundaryArr: any[] = [];
/** 地块模式绘制缓存标志 */
let parcelModeDrawn = false;

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
  // 同时清除详情模式照明标点及成员列表
  clearLightingMarkers();
  // 同时清除地块模式边界和标点
  clearParcelMode();
  cameraGroupCache = [];
  cameraPanelVisible.value = false;
  cameraModalVisible.value = false;
}

/** 打开摄像头页面级弹窗 */
function handleOpenCameraModal(group: { longitude: number; latitude: number; name: string; cameraList: PackageVideo[] }) {
  cameraModalGroup.value = group;
  // 默认选中第一个摄像头的 tab
  const firstVideo = group.cameraList?.[0];
  activeCameraTab.value = firstVideo ? getCameraKey(firstVideo) : '';
  cameraModalVisible.value = true;
}

/** 关闭摄像头页面级弹窗 */
function handleCloseCameraModal() {
  cameraModalVisible.value = false;
  cameraModalGroup.value = null;
  activeCameraTab.value = '';
}

// ==================== 安防按钮：摄像头标点 ====================

/**
 * 构建摄像头标点 DOM
 */
function buildCameraMarkerDom(group: { cameraCount?: number; cameraList?: PackageVideo[] }, idx: number): string {
  const count = group.cameraCount || (group.cameraList?.length || 0);
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

  return `<div class="camera-marker" data-camera-idx="${idx}" style="
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
 * 递归遍历树形分组，收集所有摄像头
 * @param group 分组节点
 * @param cameras 摄像头收集数组
 */
function collectAllCameras(group: PackageGroup, cameras: PackageVideo[]): void {
  // 收集当前分组的直接摄像头
  if (group.videoList && group.videoList.length > 0) {
    cameras.push(...group.videoList);
  }
  // 递归收集子分组的摄像头
  if (group.children && group.children.length > 0) {
    for (const child of group.children) {
      collectAllCameras(child, cameras);
    }
  }
}

/**
 * 按坐标对摄像头进行分组
 * 相同坐标的摄像头归为一个标点
 */
function groupCamerasByCoordinate(cameras: PackageVideo[]): Array<{
  longitude: number;
  latitude: number;
  name: string;
  cameraList: PackageVideo[];
}> {
  const groupMap = new Map<string, {
    longitude: number;
    latitude: number;
    name: string;
    cameraList: PackageVideo[];
  }>();

  for (const cam of cameras) {
    // 只处理有有效坐标的摄像头
    if (cam.longitude == null || cam.latitude == null) continue;
    const lon = Number(cam.longitude);
    const lat = Number(cam.latitude);
    if (isNaN(lon) || isNaN(lat)) continue;

    // 使用坐标作为分组key（保留6位小数精度）
    const key = `${lon.toFixed(6)},${lat.toFixed(6)}`;

    if (groupMap.has(key)) {
      groupMap.get(key)!.cameraList.push(cam);
    } else {
      groupMap.set(key, {
        longitude: lon,
        latitude: lat,
        name: cam.regionName || cam.installLocation || '摄像头位置',
        cameraList: [cam],
      });
    }
  }

  return Array.from(groupMap.values());
}

/**
 * 加载摄像头数据并渲染标点
 * 使用 packageGroup 接口（树形结构）
 * 每个坐标分组渲染一个标点，点击可查看该分组下所有摄像头
 */
async function loadCameraMarkers() {
  if (!mapReady) {
    console.warn('[BigscreenMap] 地图未就绪，无法渲染摄像头标点');
    return;
  }

  loading.value = true;
  loadingText.value = '加载安防数据...';

  try {
    const res = await getCameraPackageGroup();
    const data: PackageGroup[] = res?.result || res?.data || res || [];

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[BigscreenMap] 摄像头数据为空');
      return;
    }

    console.log('[BigscreenMap] 摄像头分组数据:', data.length, '组');

    // 1. 扁平化收集所有摄像头
    const allCameras: PackageVideo[] = [];
    for (const group of data) {
      collectAllCameras(group, allCameras);
    }

    if (allCameras.length === 0) {
      console.warn('[BigscreenMap] 摄像头数据为空');
      return;
    }

    console.log('[BigscreenMap] 摄像头总数:', allCameras.length, '个');

    // 2. 按坐标分组（相同坐标归为一个标点）
    const cameraGroups = groupCamerasByCoordinate(allCameras);

    if (cameraGroups.length === 0) {
      console.warn('[BigscreenMap] 没有有效坐标的摄像头');
      return;
    }

    console.log('[BigscreenMap] 有效摄像头标点:', cameraGroups.length, '个');

    // 清除之前的摄像头标点
    clearMarkers(cameraMarkerArr);
    // 缓存分组数据，供 DOM 事件委托使用
    cameraGroupCache = cameraGroups;

    cameraGroups.forEach((group, idx) => {
      const lon = Number(group.longitude);
      const lat = Number(group.latitude);
      if (isNaN(lon) || isNaN(lat)) {
        console.warn('[BigscreenMap] 摄像头分组坐标无效:', group);
        return;
      }

      const domHtml = buildCameraMarkerDom(group, idx);
      // 不再使用 SDK 的 onClick 回调（存在延迟），改用 DOM 事件委托
      const marker = createDomMarker(
        domHtml,
        lon,
        lat,
        `摄像头分组(${group.cameraList.length})`,
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
 * @returns 颜色对象，包含核心色、中间色、外层色
 */
function getHeatColor(ratio: number): { core: string; mid: string; outer: string; label: string } {
  if (ratio >= 0.6) {
    return { core: 'rgba(180, 0, 0, 1)', mid: 'rgba(200, 10, 10, 0.8)', outer: 'rgba(200, 10, 10, 0.4)', label: '密集' };
  }
  if (ratio >= 0.3) {
    return { core: 'rgba(220, 100, 20, 0.9)', mid: 'rgba(240, 140, 40, 0.65)', outer: 'rgba(240, 140, 40, 0.3)', label: '适中' };
  }
  return { core: 'rgba(60, 200, 120, 0.85)', mid: 'rgba(60, 200, 120, 0.55)', outer: 'rgba(60, 200, 120, 0.25)', label: '稀疏' };
}

/**
 * 构建热力点 DOM —— 模糊边界融合效果
 * 使用大面积径向渐变 + filter:blur，让相邻热力点自然融合
 */
function buildHeatMarkerDom(ratio: number): string {
  const { core, mid, outer } = getHeatColor(ratio);
  // 渲染尺寸：缩小范围，向坐标点聚拢
  const size = 20 + ratio * 40;

  return `<div class="heat-marker" style="
    position: relative;
    width: ${size}px;
    height: ${size}px;
    cursor: default;
    pointer-events: none;
    filter: blur(3px);
  ">
    <!-- 外层渐变（大面积模糊扩散，与相邻点融合） -->
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, ${mid} 0%, ${outer} 40%, transparent 75%);
      border-radius: 50%;
    "></div>
    <!-- 中层渐变（核心区域增强） -->
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50%;
      height: 50%;
      background: radial-gradient(circle, ${core} 0%, ${mid} 50%, transparent 100%);
      border-radius: 50%;
    "></div>
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
      const domHtml = buildHeatMarkerDom(ratio);

      const marker = createDomMarker(
        domHtml,
        lon,
        lat,
        `热力点(${item.count}人)`,
      );

      // 热力点不需要点击事件，创建后不响应交互
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
  // 非照明按钮点击时，隐藏照明子菜单
  if (btnKey !== 'mapLighting') {
    lightingSubVisible.value = false;
    activeLightingMode.value = '';
  }

  // 点击已激活的按钮：取消激活，清除地图覆盖物
  if (activeBtn.value === btnKey) {
    activeBtn.value = '';
    clearAllMapOverlays();
    // 照明按钮取消时，同时隐藏子菜单
    if (btnKey === 'mapLighting') {
      lightingSubVisible.value = false;
      activeLightingMode.value = '';
    }
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
    // 照明按钮：展开子菜单
    lightingSubVisible.value = true;
    activeLightingMode.value = '';
    console.log('[BigscreenMap] 照明按钮点击，展开子菜单');
  }
}

// ==================== 地块模式功能 ====================

/**
 * 绘制服贸会区地块模式（仅灯泡标点，不绘制边界线）
 */
async function drawParcelMode() {
  if (parcelModeDrawn) {
    console.log('[BigscreenMap] 地块模式已绘制过，跳过重复绘制');
    return;
  }
  if (!map || !spaceBoundariesData.length) {
    console.warn('[BigscreenMap] 地图或地块数据未加载');
    return;
  }

  clearParcelMode();

  // 只渲染服贸会区（spaceid === "8"）
  const sSpace = spaceBoundariesData.find(s => s.spaceid === '8');
  if (!sSpace) {
    console.warn('[BigscreenMap] 未找到服贸会区数据');
    parcelModeDrawn = true;
    return;
  }

  const { name: spaceName, spaceid, center } = sSpace;
  const centerColor = 'rgba(56, 189, 248, 0.9)';

  let centerLon: number;
  let centerLat: number;
  if (center && center.length >= 2) {
    centerLon = center[0];
    centerLat = center[1];
  } else if (sSpace.lon && sSpace.lat) {
    centerLon = sSpace.lon;
    centerLat = sSpace.lat;
  } else {
    console.warn(`[BigscreenMap] 服贸会区中心坐标缺失`);
    parcelModeDrawn = true;
    return;
  }

  // 仅添加灯泡标点，不绘制边界线
  addParcelMarker(spaceName, centerLon, centerLat, centerColor, spaceid);
  parcelModeDrawn = true;
  console.log(`[BigscreenMap] 服贸会区地块模式绘制完成: ${spaceName}`);
}

/**
 * 清除地块模式
 */
function clearParcelMode() {
  console.log('[BigscreenMap] 清除地块模式');

  // 清除标点
  parcelMarkerArr.forEach((marker) => {
    try {
      marker?.destroy?.();
    } catch (e) {
      // ignore
    }
    try {
      marker?.removeFromMap?.();
    } catch (e) {
      // ignore
    }
  });
  parcelMarkerArr = [];

  // 清除边界线
  parcelBoundaryArr.forEach((line) => {
    try {
      line?.destroy?.();
    } catch (e) {
      // ignore
    }
    try {
      line?.removeFromMap?.();
    } catch (e) {
      // ignore
    }
  });
  parcelBoundaryArr = [];

  // 清理 DOM 残留
  document.querySelectorAll('.parcel-marker').forEach((el) => {
    try {
      el.remove();
    } catch (e) {
      // ignore
    }
  });

  parcelModeDrawn = false;
  console.log('[BigscreenMap] 地块模式清除完成');
}

/**
 * 绘制地块边界线
 */
function drawParcelBoundary(path: number[][], color: string) {
  if (!map || path.length < 3) return;

  const linePoints = path.map(coord => [coord[0], coord[1]]);

  // 闭合多边形
  if (linePoints.length > 2 &&
    (linePoints[0][0] !== linePoints[linePoints.length - 1][0] ||
      linePoints[0][1] !== linePoints[linePoints.length - 1][1])) {
    linePoints.push([...linePoints[0]]);
  }

  try {
    const polyline = map.createPolyline2({
      bdid: buildingID,
      floorId: flid,
      lineColor: color,
      lineWidth: 5,
      wrapperColor: 'transparent',
      wrapperWidth: 6,
      linePoints,
    });
    if (polyline) {
      parcelBoundaryArr.push(polyline);
    }
  } catch (error) {
    console.error('[BigscreenMap] 绘制地块边界失败:', error);
  }
}

/**
 * 添加地块标点
 */
function addParcelMarker(spaceName: string, centerLon: number, centerLat: number, color: string, spaceid?: string) {
  if (!map) return;

  const domId = `parcel-${spaceid || spaceName}`;
  const markerHTML = `
    <div class="parcel-marker" id="${domId}" data-space-name="${spaceName}" data-space-id="${spaceid || ''}" style="
      position: relative;
      width: 60px;
      height: 60px;
      cursor: pointer;
      transform: translate(0, 50%);
      pointer-events: none;
    " title="${spaceName}">
      <div style="
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        border-radius: 50%;
        background: rgba(12, 28, 52, 0.8);
        border: 2px solid ${color};
        box-shadow: 0 0 10px ${color}80, 0 0 20px ${color}40;
      ">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="${color}" style="filter: drop-shadow(0 0 4px ${color});">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
          <path d="M9 21h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z" opacity="0.6"/>
        </svg>
      </div>
    </div>
  `;

  const marker = createDomMarker(
    markerHTML,
    parseFloat(String(centerLon)),
    parseFloat(String(centerLat)),
    spaceName,
    () => handleParcelMarkerClick(spaceName, spaceid)
  );

  if (marker) {
    parcelMarkerArr.push(marker);
  }
}

/**
 * 处理地块标点点击 —— 显示功能浮层菜单
 */
function handleParcelMarkerClick(spaceName: string, spaceid?: string) {
  console.log('[BigscreenMap] 地块标点点击:', spaceName, spaceid);
  if (!spaceid) return;
  // 获取地块标点的 DOM 元素，用于计算浮层菜单位置
  const markerEl = document.querySelector<HTMLElement>(`.parcel-marker[data-space-name="${spaceName}"]`);
  if (markerEl) {
    const rect = markerEl.getBoundingClientRect();
    parcelModeRef.value?.showMenu(spaceName, spaceid, rect);
  } else {
    // 兜底：元素未找到时使用屏幕中心
    const fallbackRect = new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
    parcelModeRef.value?.showMenu(spaceName, spaceid, fallbackRect);
  }
}

/**
 * 计算多边形中心点（面积质心算法）
 */
function calculateCenterPoint(path: number[][]): { centerLon: number; centerLat: number } {
  if (!path || path.length === 0) {
    return { centerLon: 0, centerLat: 0 };
  }

  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  path.forEach(coord => {
    const lon = coord[0];
    const lat = coord[1];
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  return {
    centerLon: (minLon + maxLon) / 2,
    centerLat: (minLat + maxLat) / 2,
  };
}

// ==================== 照明子按钮处理 ====================

/**
 * 处理照明子按钮点击
 * @param mode 'parcel' 地块模式 | 'detail' 详情模式
 */
async function handleLightingSubClick(mode: 'parcel' | 'detail') {
  if (activeLightingMode.value === mode) {
    // 点击已激活的子按钮：取消激活
    activeLightingMode.value = '';
    if (mode === 'detail') {
      clearLightingMarkers();
    } else if (mode === 'parcel') {
      clearParcelMode();
    }
    console.log(`[BigscreenMap] 取消${mode === 'parcel' ? '地块' : '详情'}模式`);
    return;
  }

  activeLightingMode.value = mode;
  if (mode === 'parcel') {
    console.log('[BigscreenMap] 切换到地块模式');
    // 清除详情模式标点和其他覆盖物
    clearAllMapOverlays();
    await drawParcelMode();
  } else if (mode === 'detail') {
    console.log('[BigscreenMap] 切换到详情模式');
    // 清除其他覆盖物
    clearAllMapOverlays();
    await loadLightingDataAndMarkers();
  }
}

// ==================== 详情模式标点功能 ====================

/**
 * 加载照明数据并添加标点
 * 复用 bigGis 的 AddLightingMarker 逻辑
 */
async function loadLightingDataAndMarkers() {
  try {
    // 1. 加载数据（如果未加载）
    if (!lightingDataLoaded.value) {
      const res = await getAllAreaApi();
      // 兼容两种返回格式：直接数组 或 { records: [...], total: ... }
      const list = Array.isArray(res) ? res : (res?.records || res?.list || res?.result || res?.data || []);
      lightingData.value = list;
      lightingDataLoaded.value = true;
    }

    // 2. 清除旧标点
    clearLightingMarkers();

    // 3. 按坐标分组：同坐标的多个标点合并为一个标点
    const locGroupMap = new Map<string, any[]>();
    lightingData.value.forEach((item) => {
      if (!item.location) return;
      const [lng, lat] = item.location.split(',');
      if (!lng || !lat || isNaN(parseFloat(lng)) || isNaN(parseFloat(lat))) return;
      const key = String(item.location).trim();
      if (!locGroupMap.has(key)) locGroupMap.set(key, []);
      locGroupMap.get(key)!.push(item);
    });

    // 4. 为有经纬度的点位生成标点
    const handledLoc = new Set<string>();
    lightingData.value.forEach((item) => {
      if (!item.location) return;
      const [lng, lat] = item.location.split(',');
      if (!lng || !lat || isNaN(parseFloat(lng)) || isNaN(parseFloat(lat))) return;

      const locKey = String(item.location).trim();
      if (handledLoc.has(locKey)) return;
      handledLoc.add(locKey);

      const group = locGroupMap.get(locKey) || [item];
      const main = group[0];

      // 创建标点 DOM
      const elDom = buildLightMarkerDom(main, group);
      const marker = createLightMarker(elDom, lat, lng, main.areaName || '灯光', main, group);
      if (marker) {
        lightingMarkerArr.push(marker);
      }
    });

    console.log(`[BigscreenMap] 详情模式标点已添加，共 ${lightingMarkerArr.length} 个`);

    // 等待标点 DOM 渲染完成后，根据回路状态更新标点亮/灭颜色
    setTimeout(() => {
      updateLightMarkersByCircuitStatus();
    }, 300);
  } catch (error) {
    console.error('[BigscreenMap] 加载照明数据失败:', error);
  }
}

/**
 * 构建灯光标点 DOM
 * 使用 SVG 图标代替图片（lightOn.png/lightOff.png 不存在）
 * 注意：初始状态设为灰色（熄灭），亮灭状态由 updateLightMarkersByCircuitStatus 根据回路数据驱动
 */
function buildLightMarkerDom(item: any, group: any[] = []): string {
  // 默认初始状态为灰色（熄灭），后续由 circuits 数据驱动点亮
  const color = '#64748b';
  const domId = `light-${String(item.type)}-${String(item.id)}`;
  // 同坐标所有成员的 areaId 列表（用于判断亮灭：任一 areaId 有开启回路即点亮）
  const areaIds = group.length > 0 ? group.map((g) => String(g.id)) : [String(item.id)];
  // 同坐标成员个数徽标（大于 1 时展示）
  const badgeHtml =
    group.length > 1
      ? `<span class="marker-count-badge">${group.length}</span>`
      : '';
  // 标点成员列表（点击标点主体时切换展示，点击某一项打开对应设备详情）
  const listItems = group
    .map(
      (g) =>
        `<div class="lighting-marker-list-item" data-id="${String(g.id)}" data-type="${String(g.type)}">${g.areaName || '灯光'}</div>`
    )
    .join('');
  const listHtml = listItems
    ? `<div class="lighting-marker-list${group.length > 6 ? ' lighting-marker-list-many' : ''}" style="display: none;">
  <div class="lighting-marker-list-header">区域名称</div>
  ${listItems}
  </div>`
    : '';
  return `<div class="light-marker" id="${domId}" data-area-ids="${areaIds.join(',')}" style="
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  ">
  <svg viewBox="0 0 24 24" width="28" height="28" fill="${color}" style="filter: drop-shadow(0 0 6px ${color}80);">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
  <path d="M9 21h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z" opacity="0.6"/>
  </svg>
  ${badgeHtml}
  ${listHtml}
  </div>`;
}

/**
 * 根据回路状态更新标点亮/灭颜色
 * 与 bigGis 原文件逻辑一致：circuits 中任一回路 status === '开启' → 点亮（黄色），否则熄灭（灰色）
 */
async function updateLightMarkersByCircuitStatus() {
  try {
    const res = await getAllCircuitApi();
    const circuits = Array.isArray(res) ? res : (res?.records || res?.list || res?.result || res?.data || []);

    // 收集有开启回路的 areaId 集合（仅 status === '开启'，comstat 是通讯状态不是开关状态）
    const areaIdsWithOnCircuit = new Set<string>();
    circuits.forEach((c: any) => {
      if (c.status === '开启' && c.areaId !== undefined && c.areaId !== null) {
        areaIdsWithOnCircuit.add(String(c.areaId));
      }
    });

    // 遍历所有标点 DOM，只要标点关联的任一 areaId 有开启回路就点亮
    const markers = document.querySelectorAll<HTMLElement>('.light-marker');
    markers.forEach((el) => {
      // 从 data-area-ids 获取该标点关联的所有 areaId
      const areaIdsAttr = el.getAttribute('data-area-ids') || '';
      const areaIds = areaIdsAttr.split(',').filter(Boolean);
      // 任一 areaId 有开启回路即点亮
      const isOn = areaIds.some((aid) => areaIdsWithOnCircuit.has(aid));
      const color = isOn ? '#facc15' : '#64748b';
      const svg = el.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', color);
        svg.style.filter = `drop-shadow(0 0 6px ${color}80)`;
      }
    });

    console.log(`[BigscreenMap] 标点状态已更新，有开启回路的 areaId 数量: ${areaIdsWithOnCircuit.size}`);
  } catch (error) {
    console.error('[BigscreenMap] 获取回路数据失败:', error);
  }
}

/**
 * 创建灯光标点
 */
function createLightMarker(
  domHtml: string,
  lat: string,
  lng: string,
  text: string,
  data: any,
  group: any[]
) {
  if (!map) return null;

  const domId = `light-${String(data.type)}-${String(data.id)}`;
  const marker = createDomMarker(
    domHtml,
    parseFloat(lng),
    parseFloat(lat),
    text,
    () => {
      // 点击标点：根据成员数量决定展开列表或直接打开弹窗
      onLightMarkerClick(data, group);
    }
  );

  // 成员列表项点击：保持列表展开并高亮当前项，打开对应设备详情弹窗
  if (marker && domId && group.length > 1) {
    setTimeout(() => {
      const el = document.getElementById(domId);
      el?.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement)?.closest?.('.lighting-marker-list-item');
        if (!li) return;
        e.stopPropagation();
        // 切换激活高亮
        const listEl = el.querySelector<HTMLElement>('.lighting-marker-list');
        listEl?.querySelectorAll('.lighting-marker-list-item.is-active').forEach((o) => o.classList.remove('is-active'));
        li.classList.add('is-active');
        const gid = li.getAttribute('data-id');
        const gtype = li.getAttribute('data-type');
        const target = group.find(
          (g) => String(g.id) === gid && String(g.type) === gtype
        );
        if (target) detailModeRef.value?.openModal(target);
      });
    }, 100);
  }

  return marker;
}

/**
 * 清除照明标点
 */
function clearLightingMarkers() {
  console.log('[BigscreenMap] 开始清除照明标点，当前数量:', lightingMarkerArr.length);
  closeAllLightingMarkerLists();
  lightingMarkerArr.forEach((marker, index) => {
    try {
      marker?.destroy?.();
      console.log(`[BigscreenMap] 照明标点[${index}] destroy成功`);
    } catch (e) {
      console.warn('[BigscreenMap] 照明标点destroy失败:', e);
    }
    try {
      marker?.removeFromMap?.();
      console.log(`[BigscreenMap] 照明标点[${index}] removeFromMap成功`);
    } catch (e) {
      console.warn('[BigscreenMap] 照明标点removeFromMap失败:', e);
    }
  });
  // 同时清理地图上残留的照明标点 DOM 元素
  document.querySelectorAll('.light-marker').forEach((el) => {
    try {
      el.remove();
    } catch (e) {
      // ignore
    }
  });
  lightingMarkerArr = [];
  console.log('[BigscreenMap] 照明标点清除完成');
}

// ==================== 照明标点成员列表功能 ====================

/**
 * 关闭当前展开的照明标点成员列表
 */
function closeAllLightingMarkerLists() {
  if (openedLightingListEl) {
    openedLightingListEl.style.display = 'none';
    openedLightingListEl.style.top = '';
    openedLightingListEl.style.bottom = '';
    openedLightingListEl.style.maxHeight = '';
    openedLightingListEl.style.transform = '';
    openedLightingListEl = null;
  }
  // 还原之前展开的 marker 容器 z-index
  if (openedLightingMarkerEl) {
    openedLightingMarkerEl.style.zIndex = openedLightingMarkerOriginalZ;
    openedLightingMarkerEl = null;
    openedLightingMarkerOriginalZ = '';
  }
  // 清除列表项激活高亮
  document.querySelectorAll('.lighting-marker-list-item.is-active').forEach((li) => li.classList.remove('is-active'));
}

/**
 * 照明标点主体点击：
 * - 成员数 >1：第一次点击展示成员列表，再次点击收起
 * - 仅 1 条：直接打开详情弹窗
 */
function onLightMarkerClick(data: any, group: any[]) {
  console.log('[BigscreenMap] 灯光标点点击:', data, group);
  if (group.length > 1) {
    const el = document.getElementById(`light-${String(data.type)}-${String(data.id)}`);
    const listEl = el?.querySelector<HTMLElement>('.lighting-marker-list');
    if (listEl) {
      // 关闭其他已展开的列表（同时还原它们的 marker z-index）
      closeAllLightingMarkerLists();
      // 切换当前列表显隐
      const isHidden = listEl.style.display === 'none';
      listEl.style.display = isHidden ? 'block' : 'none';
      openedLightingListEl = isHidden ? listEl : null;
      // 展开时将 marker 容器提升到最高层级，确保弹框列表不被其他标点/地图文字遮挡
      if (isHidden && el) {
        const wrapper = (el.parentElement && el.parentElement !== document.body) ? el.parentElement : el;
        openedLightingMarkerEl = wrapper;
        openedLightingMarkerOriginalZ = wrapper.style.zIndex;
        wrapper.style.zIndex = '60000';
      }
    }
    return;
  }
  // 仅 1 条：直接打开详情弹窗
  detailModeRef.value?.openModal(data);
}

// ==================== 点击地图空白关闭摄像头面板和照明标点列表 ====================
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest('.camera-marker')) return;
  if (target.closest('.camera-info-panel')) return;
  if (target.closest('.camera-modal-wrapper')) return;
  if (target.closest('.ant-modal')) return;
  // 照明标点或列表项点击不触发关闭
  if (target.closest('.light-marker')) return;
  if (target.closest('.lighting-marker-list-item')) return;
  // 地块标点点击不触发关闭
  if (target.closest('.parcel-marker')) return;
  // 点击空白区域关闭照明标点成员列表
  closeAllLightingMarkerLists();
  if (cameraPanelVisible.value) {
    cameraPanelVisible.value = false;
  }
}

// ==================== DOM 级摄像头点击事件委托 ====================
// 绕过 DaxiMap SDK 的 onClick 回调（存在延迟），直接在 DOM 层级监听点击
function handleMapContainerClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const markerEl = target.closest('.camera-marker') as HTMLElement | null;
  if (!markerEl) return;
  const idx = Number(markerEl.getAttribute('data-camera-idx'));
  if (!isNaN(idx) && cameraGroupCache[idx]) {
    // 立即打开弹窗，无延迟
    handleOpenCameraModal(cameraGroupCache[idx]);
    // 阻止事件冒泡，避免触发 handleDocumentClick
    e.stopPropagation();
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await loadMapScripts();
  await initMap();
  document.addEventListener('click', handleDocumentClick, true);
  // 在地图容器上注册 DOM 级点击事件委托，绕过 SDK 延迟
  const mapContainer = document.getElementById('bigscreenMapContainer');
  if (mapContainer) {
    mapContainer.addEventListener('click', handleMapContainerClick);
  }
});

onUnmounted(() => {
  clearAllMapOverlays();
  clearYellowArea();
  document.removeEventListener('click', handleDocumentClick, true);
  const mapContainer = document.getElementById('bigscreenMapContainer');
  if (mapContainer) {
    mapContainer.removeEventListener('click', handleMapContainerClick);
  }
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

/* 照明子按钮浮动容器：绝对定位在照明按钮上方 */
.lighting-sub-float {
  position: absolute;
  bottom: 56px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: fade-slide-up 0.25s ease-out;
}

/* 子按钮样式微缩 */
.sub-btn {
  padding: 8px 20px !important;
}

.sub-btn .map-btn-icon {
  font-size: 16px !important;
}

.sub-btn .map-btn-text {
  font-size: 14px !important;
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
  font-size:16px;
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
  font-size:16px;
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
  font-size:16px;
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
  font-size:14px;
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
  font-size:13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.camera-status {
  font-size:13px;
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
  font-size:14px;
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
  font-size:16px;
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

/* 照明子按钮展开动画 */
@keyframes fade-slide-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
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

/* 摄像头页面级弹窗样式 */
.camera-modal-wrapper .ant-modal {
  top: 40px;
}
.camera-modal-wrapper .ant-modal-content {
  background: transparent !important;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5) !important;
  padding: 0 !important;
  overflow: hidden !important;
}
.camera-modal-wrapper .ant-modal-close {
  display: none;
}
.camera-modal-wrapper .ant-modal-mask {
  background: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(4px);
}
.camera-modal-box {
  background: linear-gradient(135deg, rgba(10, 25, 50, 0.95) 0%, rgba(5, 15, 35, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}
.camera-modal-top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
  z-index: 3;
}
.camera-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.camera-modal-title {
  color: #38bdf8;
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
}
.camera-modal-close {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(8, 20, 40, 0.6);
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.camera-modal-close:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.3);
  color: #f87171;
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
/* tab 导航栏：暗色背景 + 阻止横向滚动跳动 */
.camera-modal-body .ant-tabs-nav {
  background: transparent;
  margin-bottom: 8px;
}
.camera-modal-body .ant-tabs-nav-wrap {
  overflow-x: auto !important;
  overflow-y: hidden !important;
}
/* 未选中的 tab */
.camera-modal-body .ant-tabs-tab {
  color: #94a3b8 !important;
  background: rgba(30, 45, 70, 0.6) !important;
  border: 1px solid rgba(56, 189, 248, 0.15) !important;
  border-radius: 4px 4px 0 0 !important;
  transition: all 0.2s ease !important;
}
.camera-modal-body .ant-tabs-tab:hover {
  color: #e2e8f0 !important;
  background: rgba(56, 189, 248, 0.1) !important;
  border-color: rgba(56, 189, 248, 0.3) !important;
}
/* 选中态 tab：高亮蓝色边框 + 文字 */
.camera-modal-body .ant-tabs-tab-active {
  color: #38bdf8 !important;
  background: rgba(56, 189, 248, 0.15) !important;
  border-color: rgba(56, 189, 248, 0.6) !important;
  border-bottom-color: transparent !important;
  font-weight: 600 !important;
}
.camera-modal-body .ant-tabs-tab-active:hover {
  color: #38bdf8 !important;
  background: rgba(56, 189, 248, 0.2) !important;
}
/* card 类型 tab 的底部 ink 线隐藏（用边框替代） */
.camera-modal-body .ant-tabs-ink-bar {
  display: none !important;
}
/* 更多摄像头时的省略号按钮 */
.camera-modal-body .ant-tabs-nav-more {
  color: #94a3b8 !important;
  font-size: 18px !important;
}
.camera-modal-body .ant-tabs-nav-more:hover {
  color: #38bdf8 !important;
}
.camera-modal-body .ant-tabs-content {
  height: calc(100% - 40px);
}
.camera-modal-body .ant-tabs-tabpane {
  height: 100%;
}
.camera-iframe-wrap {
  width: 100%;
  /* 使用 16:9 宽高比替代固定高度，让视频自适应铺满容器 */
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
  color: rgba(255, 255, 255, 0.4);
  font-size:16px;
}

/* ==================== 灯光标点样式 ==================== */
.light-marker {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}
.light-marker:hover {
  transform: scale(1.05);
  z-index: 100;
}

.marker-count-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #0ea5e9;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  text-align: center;
  box-sizing: border-box;
  z-index: 20;
}

/* ==================== 照明标点成员列表样式 ==================== */
/* 标点成员列表（点击标点主体时切换展示；标点 DOM 由 SDK 注入到组件作用域外，需全局样式） */
.light-marker .lighting-marker-list {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  max-width: 340px;
  /* 6 条以内不设高度限制且 overflow 为 visible：内容完整展示 */
  max-height: none;
  overflow-y: visible;
  background: linear-gradient(180deg, rgba(12, 28, 52, 1) 0%, rgba(8, 18, 36, 1) 100%);
  border: 1px solid rgba(0, 200, 255, 0.35);
  border-radius: 8px;
  padding: 0 4px 8px;
  z-index: 10000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 180, 255, 0.15);
  animation: lightingMarkerListIn 0.18s ease-out;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 200, 255, 0.45) transparent;
}

/* 超过 6 条：限高滚动 */
.light-marker .lighting-marker-list.lighting-marker-list-many {
  max-height: 300px;
  overflow-y: auto;
}

/* 列表表头 */
.light-marker .lighting-marker-list-header {
  position: relative;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #8fe8ff;
  background: linear-gradient(180deg, rgba(12, 28, 52, 1) 0%, rgba(10, 22, 40, 1) 100%);
  border-bottom: 1px solid rgba(0, 200, 255, 0.35);
  border-radius: 6px 6px 0 0;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.5);
  pointer-events: none;
}

/* 超过 6 条滚动时表头 sticky 固定在列表顶部 */
.light-marker .lighting-marker-list.lighting-marker-list-many .lighting-marker-list-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

/* 列表自定义滚动条 */
.light-marker .lighting-marker-list::-webkit-scrollbar {
  width: 5px;
}
.light-marker .lighting-marker-list::-webkit-scrollbar-thumb {
  background: rgba(0, 200, 255, 0.45);
  border-radius: 3px;
}
.light-marker .lighting-marker-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 217, 255, 0.75);
}
.light-marker .lighting-marker-list::-webkit-scrollbar-track {
  background: transparent;
}

/* 列表项 */
.light-marker .lighting-marker-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.light-marker .lighting-marker-list-item:hover {
  background: rgba(0, 200, 255, 0.15);
  color: #00d9ff;
  padding-left: 18px;
}

/* 列表项激活高亮 */
.light-marker .lighting-marker-list-item.is-active {
  background: rgba(0, 200, 255, 0.25);
  color: #00d9ff;
  border-left: 3px solid #00d9ff;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
}

/* 入场动画 */
@keyframes lightingMarkerListIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ==================== 地块模式标点样式 ==================== */

/* 地块标点容器 */
.parcel-marker {
  position: absolute;
  z-index: 55000;
  transition: transform 0.2s ease, filter 0.2s ease;
}

/* 标点 hover 放大效果 */
.parcel-marker:hover {
  transform: translate(0, 50%) scale(1.15);
  filter: brightness(1.2);
}

/* 标点 hover 时增加发光 */
.parcel-marker:hover div {
  box-shadow: 0 0 15px currentColor, 0 0 30px currentColor !important;
}

/* 地块圈标点呼吸动画 */
.parcel-marker.is-active {
  animation: parcelMarkerPulse 1.6s ease-in-out infinite;
}

@keyframes parcelMarkerPulse {
  0%, 100% {
    filter: drop-shadow(0 0 0.1rem rgba(255, 255, 255, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 0.2rem rgba(255, 255, 255, 1));
  }
}</style>
