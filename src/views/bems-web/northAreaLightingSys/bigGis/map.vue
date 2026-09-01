<template>
  <div id="mapContainer" class="map-container" :class="themeClass"></div>

  <!-- POI 详情弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="currentLight?.name || '详情'"
    width="520px"
    top="5vh"
    :close-on-click-modal="false"
    destroy-on-close
    class="dark-dialog"
  >
    <template v-if="currentLight">
      <div class="detail-body">
        <!-- 视频播放区域（iframe 形式，monitorAdr 作为参数拼接地址） -->
        <div v-if="currentLight.videoUrl" class="video-wrapper">
          <VideoPlayer :url="currentLight.videoUrl" />
        </div>
        <div v-else class="video-placeholder">
          <el-icon :size="48" color="#dcdfe6">
            <VideoCamera />
          </el-icon>
          <p>暂无监控视频</p>
        </div>

        <!-- 设备信息 -->
        <el-descriptions :column="2" border size="small" class="info-table">
          <el-descriptions-item label="地块名称">{{ currentLight.spaceName }}</el-descriptions-item>
          <el-descriptions-item label="区域名称">
              {{ currentLight.areaName }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </template>
    <template #footer>
      <el-button class="btn-dark" @click="dialogVisible = false">关闭</el-button>
      <el-button
        type="primary"
        :loading="lightingLoading"
        @click="toggleLight"
      >
        {{ currentLight?.status === '打开' ? '关灯' : '开灯' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, onMounted, onUnmounted } from 'vue'
import { loadMapScripts } from '/@/components/map/loadMapScripts'
import { getAllAreaApi, getAllCircuitApi, openAreaApi, closeAreaApi } from '../comprehensivePreview/comprehensivePreview.api'
import { getLightingProgramList, getAreaListBySpaceName } from '@/api/equipmentMonitoring';
import { VideoCamera } from '@element-plus/icons-vue'
import VideoPlayer from '../equipmentMonitoring/components/VideoPlayer.vue'
import spaceBoundariesData from './space-boundaries.json'

// 单条标点点击事件：父组件根据当前模式决定打开四页签弹框或原灯光详情弹窗
const emit = defineEmits<{ (e: 'light-marker-single-click', data: any): void }>()

// 监控平台 iframe 地址前缀（与设备监控页面保持一致），monitorAdr 为监控通道编码
const MONITOR_BASE_URL = 'http://10.168.47.23:4000/index.html?id=';
import lightOnImg from '/@/assets/images/lightOn.png'
import lightOffImg from '/@/assets/images/lightOff.png'

const map = ref<any>(null);
// 当前展开的成员列表（点击地图空白时自动关闭）
let openedListEl: HTMLElement | null = null;
// 展开列表时对应 marker 容器的原始 z-index（关闭时还原）
let openedMarkerEl: HTMLElement | null = null;
let openedMarkerOriginalZ: string = '';
// 展开列表的滚轮拦截处理函数（收起时移除）
let openedListWheelHandler: ((e: WheelEvent) => void) | null = null;

/**
 * 关闭当前展开的成员列表
 */
function closeAllMarkerLists() {
  if (openedListEl) {
    // 移除滚轮拦截监听，避免内存泄漏
    if (openedListWheelHandler) {
      openedListEl.removeEventListener('wheel', openedListWheelHandler, true);
      openedListWheelHandler = null;
    }
    openedListEl.style.display = 'none';
    // 清除边界适配残留的内联样式（top/bottom/transform/maxHeight），下次展开重新计算
    openedListEl.style.top = '';
    openedListEl.style.bottom = '';
    openedListEl.style.maxHeight = '';
    openedListEl.style.transform = '';
    openedListEl = null;
  }
  // 还原之前展开的 marker 容器 z-index
  if (openedMarkerEl) {
    openedMarkerEl.style.zIndex = openedMarkerOriginalZ;
    openedMarkerEl = null;
    openedMarkerOriginalZ = '';
  }
  // 清除列表项激活高亮
  document.querySelectorAll('.marker-list-item.is-active').forEach((li) => li.classList.remove('is-active'));
}

/**
 * 列表滚轮拦截：鼠标悬停在列表内滚动时只滚动列表本身，不穿透到地图触发缩放
 * - 捕获阶段拦截，阻止 wheel 事件到达地图容器的监听器
 * - 列表滚动到顶部/底部或无需滚动时，阻止默认行为（防止地图缩放）
 */
function bindListWheelGuard(listEl: HTMLElement) {
  if (openedListWheelHandler) {
    listEl.removeEventListener('wheel', openedListWheelHandler, true);
    openedListWheelHandler = null;
  }
  const handler = (e: WheelEvent) => {
    e.stopPropagation();
    const { scrollTop, scrollHeight, clientHeight } = listEl;
    const canScroll = scrollHeight > clientHeight;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if (!canScroll || (e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
      e.preventDefault();
    }
  };
  listEl.addEventListener('wheel', handler, { passive: false, capture: true });
  openedListWheelHandler = handler;
}

/**
 * 清除成员列表项的激活高亮（列表保持展开展示），供父组件在弹框关闭时调用
 */
const clearMarkerListActive = () => {
  document.querySelectorAll('.marker-list-item.is-active').forEach((li) => li.classList.remove('is-active'));
};

/**
 * 收起当前展开的成员列表（供父组件在非详情模式点击列表项时保持原行为）
 */
const collapseMarkerList = () => {
  closeAllMarkerLists();
};

/**
 * 点击地图空白时自动关闭展开的成员列表（捕获阶段）：
 * - 标点主体/列表项点击不触发（各自处理）
 * - 弹框（含遮罩与 X 关闭按钮，teleport 到 body）点击不触发，弹框打开/关闭期间列表保持展示
 * - 点击地图其他空白区域时收起列表
 */
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  // 点击列表项：由列表项自己处理，不在此关闭
  if (target.closest('.marker-list-item')) return;
  // 点击标点主体：由标点主体自己处理 toggle，不在此关闭
  if (target.closest('.light-marker')) return;
  // 点击弹框内部（.ant-modal-wrap 含遮罩与 X，.el-dialog 为原灯光详情弹窗）：不在此关闭
  if (target.closest('.ant-modal-wrap') || target.closest('.el-dialog')) return;
  closeAllMarkerLists();
}
const buildingInfo = ref<unknown[]>([]);
let flid: string | null = null;
const windowWidth = window.outerWidth;
// 根据屏幕宽度设置初始缩放级别
let zoomNum: number;
if (windowWidth > 1439) {
  zoomNum = 15.0; // 大屏 - 增大初始倍数
} else if (windowWidth > 1200) {
  zoomNum = 14.0; // 中屏 - 增大初始倍数
} else {
  zoomNum = 13.5; // 小屏 - 增大初始倍数
}
console.log(zoomNum);
// 配置参数
const buildingID = "B000A11DMD";
const token = "572d6c0c869b3e2ce85a63ab2a1d5a0a";
const mapConfig = {
  token: token,
  appName: "HelloWorld", //开发者应用名称
  projectPath: "",
  baseMapPath: "/map/",
  spriteUrl: `${window.location.origin}/map/assets/images/default_markers`,
  scenePath: "/data/",
  buildingId: buildingID,
  defaultCenter: { lon: 116.162, lat: 39.912 },
  defaultZoomLevel: zoomNum,
  showOutDoorMap: false,
  mapDataPath: "/data/572d6c0c869b3e2ce85a63ab2a1d5a0a/{{bdid}}/",
};
// 初始化地图
const initMap = async () => {
  // 确保 DaxiMap 已经加载
  const DaxiMapGlobal = (window as Window & { DaxiMap?: any }).DaxiMap;
  if (!DaxiMapGlobal) {
    console.error('大希地图 SDK 未加载');
    return;
  }
  
  try {
    map.value = await new DaxiMapGlobal.Map("mapContainer", mapConfig);
    map.value.on("loadComplete", async () => {
      console.log("地图加载完成");
      // 设置缩放范围：最小10级，最大23级
      map.value.setZoomLevelRange(10, 23);
      // 地图移动/缩放结束后，重新按屏幕 y 排序标点层级（前面的盖住后面的）
      ['moveend', 'dragend', 'zoomend'].forEach((evt) => {
        map.value.on(evt, () => setTimeout(() => sortMarkerZByY(), 50));
      });
      buildingInfo.value = map.value.getBuildingInfo(buildingID);
      // 获取当前楼层ID（标点需绑定楼层场景，flid 为空会导致 SDK addToMap 报错）
      await initFloorId();
      // 等待地图瓦片渲染完成后再添加标点，避免标点先于地图出现
      setTimeout(async () => {
        await loadLightingData();  // 初始化时加载灯光数据
        console.log('灯光数据已加载:', lightingData.value.length, '条');
        // 注意：不在这里自动添加标点，等待用户操作（如点击地块或查看详情）
        // AddLightingMarker();
        // 初始化时聚焦到金安桥
        map.value.easeTo({
          bdid: buildingID,
          lon: 116.15521113890562,
          lat: 39.924386114869634-0.0036,
          floorId: flid,
        });
      }, 800);
    });
    console.log("地图初始化成功");
  } catch (error) {
    console.error("地图初始化失败:", error);
  }
};

/**
 * 获取楼层ID，带重试机制和硬编码兜底
 */
const DEFAULT_FLID = 'DX0003640110100001'; // 首钢园 F1 楼层ID（来自 map.json 配置）

async function initFloorId(retryCount = 0) {
  // 方式1：通过 SDK API 获取
  flid = map.value.getCurrentFloorId();
  console.log(flid, 'flid (getCurrentFloorId)');

  if (!flid) {
    // 方式2：通过楼层列表获取
    const floors = map.value.getCurrentFloorsInfo();
    console.log(floors, 'floors (getCurrentFloorsInfo)');
    flid = floors && floors.length ? floors[0].flid : null;
  }

  if (!flid && retryCount < 3) {
    // 方式3：重试（楼层数据可能还未加载完成）
    console.log(`楼层ID为空，第 ${retryCount + 1} 次重试...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return initFloorId(retryCount + 1);
  }

  if (!flid) {
    // 方式4：硬编码兜底
    flid = DEFAULT_FLID;
    console.warn('楼层ID获取失败，使用默认值:', flid);
  }

  console.log('最终楼层ID:', flid);
}

// ==================== 灯光标点 ====================
const lightingData = ref<any[]>([]);

/** 加载标点数据 */
async function loadLightingData() {
  try {
    const res = await getAllAreaApi();
    console.log('灯光数据:', res);
    const areaList = Array.isArray(res) ? res : [];
    // 后端已去掉 477/478 两条标点数据，这里写死合并（四高炉 / 1号馆）
    const specialAreas = [
      {
        id: 477,
        space: '',
        spaceName: '服贸会',
        areaName: '四高炉',
        areaCode: '107',
        deviceNo: null,
        status: '启用',
        lastOperationTime: null,
        lastOperationBy: null,
        type: '2',
        location: '116.158104,39.916701',
        monitorAdr: "http://10.168.47.23:4000/index.html?id=0096142642007010010193b98d3214a64af5b516d49cfbb97160",
        monitorName: '四高炉',
        remark: null,
        allDuration: null,
        startTime: null,
        closingTime: null,
        openCode: null,
        closeCode: null,
        relName: '四高炉',
        sort: 1,
        longitude: null,
        latitude: null,
        circuitCount: null,
        onlineCount: null,
        todayEnergy: null,
        totalEnergy: null,
        mapLevel: null,
        districtId: 'sigaolu',
        districtCode: 'sigaolu',
        pendingMsgCount: 2,
        districtName: '服贸会',
      },
      {
        id: 478,
        space: '',
        spaceName: '服贸会',
        areaName: '1号馆',
        areaCode: '478',
        deviceNo: null,
        status: '启用',
        lastOperationTime: null,
        lastOperationBy: null,
        type: '2',
        location: '116.158696,39.916911',
        monitorAdr: "http://10.168.47.23:4000/index.html?id=0096142642007010010193b98d3214a64af5b516d49cfbb97160",
        monitorName: '1号馆',
        remark: null,
        allDuration: null,
        startTime: null,
        closingTime: null,
        openCode: null,
        closeCode: null,
        relName: '1号馆',
        sort: 1,
        longitude: null,
        latitude: null,
        circuitCount: null,
        onlineCount: null,
        todayEnergy: null,
        totalEnergy: null,
        mapLevel: null,
        districtId: '1haoguan',
        districtCode: '1haoguan',
        pendingMsgCount: 2,
        districtName: '服贸会',
      },
    ];
    lightingData.value = [...areaList, ...specialAreas];

    // 注意：不在这里自动绘制地块边框，等待用户点击“地块”按钮
  } catch {
    lightingData.value = [];
  }
}
const lightingMarkerArr = ref<any[]>([]);
let markersDrawing: boolean = false; // 标记是否正在绘制
let spaceModeDrawn: boolean = false; // 地块模式绘制缓存标志：已绘制过则重复调用直接返回

/**
 * 获取地块标点坐标：优先使用 space-boundaries.json 中人工配置的 center 字段。
 *
 * center 字段格式为 [经度, 纬度]，由人工在 JSON 中配置，不做自动计算。
 * 无有效 center 时返回 null，由调用方回退到面积质心算法自动计算。
 * （不再回退到旧 lon/lat 字段：该字段部分地块已过时，可能落在区块外）
 */
function getSpaceMarkerCenter(space: any): { centerLon: number; centerLat: number } | null {
  const c = space && space.center;
  if (
    Array.isArray(c) &&
    c.length >= 2 &&
    typeof c[0] === 'number' &&
    typeof c[1] === 'number' &&
    c[0] !== c[1] &&
    isFinite(c[0]) &&
    isFinite(c[1])
  ) {
    return { centerLon: c[0], centerLat: c[1] };
  }
  return null;
}

/**
 * 射线法（PNPoly）判断点是否在多边形内部（顶点坐标 [[lon, lat], ...]，自动闭合）
 */
function isPointInPolygon(lon: number, lat: number, path: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
    const xi = path[i][0], yi = path[i][1];
    const xj = path[j][0], yj = path[j][1];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * 计算多边形顶点的面积质心（多边形重心），比顶点平均更接近视觉中心。
 * 若质心不在多边形内部，则回退到顶点平均；若仍不在内部，使用扫描线中点法兜底。
 * @param path 顶点坐标数组 [[lon, lat], ...]
 * @returns 中心坐标 { centerLon, centerLat }
 */
function calculateCenterPoint(path: number[][]): { centerLon: number; centerLat: number } {
  if (!path || path.length < 3) {
    return { centerLon: 0, centerLat: 0 };
  }
  // 过滤出有效坐标点
  const valid = path.filter((coord) =>
    Array.isArray(coord) &&
    coord.length >= 2 &&
    isFinite(coord[0]) &&
    isFinite(coord[1])
  );
  if (valid.length < 3) return { centerLon: 0, centerLat: 0 };

  // 1. 面积质心（多边形重心）
  let area = 0;
  let sumCx = 0;
  let sumCy = 0;
  for (let i = 0; i < valid.length; i++) {
    const [x1, y1] = valid[i];
    const [x2, y2] = valid[(i + 1) % valid.length];
    const cross = x1 * y2 - x2 * y1;
    area += cross;
    sumCx += (x1 + x2) * cross;
    sumCy += (y1 + y2) * cross;
  }
  area /= 2;
  if (Math.abs(area) > 1e-15) {
    const centroid = { centerLon: sumCx / (6 * area), centerLat: sumCy / (6 * area) };
    if (isPointInPolygon(centroid.centerLon, centroid.centerLat, valid)) {
      return centroid;
    }
  }

  // 2. 顶点平均
  let sumLon = 0;
  let sumLat = 0;
  for (const coord of valid) {
    sumLon += coord[0];
    sumLat += coord[1];
  }
  const avg = { centerLon: sumLon / valid.length, centerLat: sumLat / valid.length };
  if (isPointInPolygon(avg.centerLon, avg.centerLat, valid)) {
    return avg;
  }

  // 3. 扫描线中点兜底：在所有顶点纬度中位数处，取多边形内部最宽区间的中点
  const sortedLat = valid.map((c) => c[1]).sort((a, b) => a - b);
  const midY = sortedLat[Math.floor(sortedLat.length / 2)];
  const crossXs: number[] = [];
  for (let i = 0; i < valid.length; i++) {
    const [x1, y1] = valid[i];
    const [x2, y2] = valid[(i + 1) % valid.length];
    if (y1 > midY !== y2 > midY) {
      crossXs.push(x1 + ((midY - y1) * (x2 - x1)) / (y2 - y1));
    }
  }
  if (crossXs.length >= 2) {
    crossXs.sort((a, b) => a - b);
    let bestStart = crossXs[0];
    let bestEnd = crossXs[1];
    let bestWidth = crossXs[1] - crossXs[0];
    for (let i = 2; i + 1 < crossXs.length; i += 2) {
      const w = crossXs[i + 1] - crossXs[i];
      if (w > bestWidth) {
        bestWidth = w;
        bestStart = crossXs[i];
        bestEnd = crossXs[i + 1];
      }
    }
    return { centerLon: (bestStart + bestEnd) / 2, centerLat: midY };
  }

  // 4. 最终兜底：包围盒中心
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const coord of valid) {
    minLon = Math.min(minLon, coord[0]);
    maxLon = Math.max(maxLon, coord[0]);
    minLat = Math.min(minLat, coord[1]);
    maxLat = Math.max(maxLat, coord[1]);
  }
  return { centerLon: (minLon + maxLon) / 2, centerLat: (minLat + maxLat) / 2 };
}

/**
 * 在地图上绘制所有地块的边框（根据 space-boundaries.json 坐标数据）
 */
function drawAllSpaceBoundaries() {
  if (!map.value || !spaceBoundariesData.length) return;
  
  // 清除之前的边框
  clearAllHighlights();
  
  let drawnCount = 0;
  
  // 遍历 space-boundaries.json 中的数据，为每个地块绘制边框
  spaceBoundariesData.forEach((space: any, index: number) => {
    const { name: spaceName, path } = space;
    
    if (!path || !Array.isArray(path) || path.length < 3) {
      console.warn(`地块 [${spaceName}] 坐标数据不足，至少需要3个点`);
      return;
    }
    
    // 根据不同地块使用不同颜色
    const color = getSpaceBoundaryColor(index);
    highlightOneSpaceFromPath(spaceName, path, color);
    drawnCount++;
  });
  
  console.log(`已绘制 ${drawnCount} 个地块的边框`);
}

/**
 * 绘制所有地块边框（除了首钢园北区）并添加标记点
 * 已绘制过时直接返回（缓存优化，避免重复清空/重建标记）
 */
function drawAllSpacesExceptNorth() {
  // 已绘制过：直接返回（缓存优化）
  if (spaceModeDrawn) {
    console.log('地块模式已绘制过，跳过重复绘制（缓存）');
    return;
  }
  console.log('开始绘制所有地块边框（除首钢园北区）');
  
  if (!map.value || !spaceBoundariesData.length) {
    console.warn('地图或地块数据未加载');
    return;
  }
  
  // 清除之前的绘制
  clearAllHighlights();
  
  let drawnCount = 0;
  let skippedCount = 0;
  let colorIndex = 0; // 独立计数器，确保每个区域都有不同的颜色
  
  // 遍历空间数据，过滤掉首钢园北区
  spaceBoundariesData.forEach((space: any) => {
    const { name: spaceName, path, spaceid } = space;
    
    // 跳过首钢园北区
    if (spaceName === '首钢园北区') {
      skippedCount++;
      console.log(`跳过首钢园北区（总区域）`);
      return;
    }
    
    if (!path || !Array.isArray(path) || path.length < 3) {
      console.warn(`地块 [${spaceName}] 坐标数据不足，至少需要3个点`);
      return;
    }
    
    try {
      // 根据独立计数器获取不同颜色（避免跳过导致的索引重复）
      const color = getSpaceBoundaryColor(colorIndex);
      
      // 直接使用 path 坐标绘制边框
      highlightOneSpaceFromPath(spaceName, path, color);
      
      // 计算中心点并添加标记点（携带 spaceid，点击时用于请求地块场景接口）
      // 优先使用 JSON 中人工配置的 center 字段；缺失时用面积质心算法自动计算
      const manualCenter = getSpaceMarkerCenter(space);
      let centerLon = 0;
      let centerLat = 0;
      if (manualCenter) {
        centerLon = manualCenter.centerLon;
        centerLat = manualCenter.centerLat;
      } else {
        const c = calculateCenterPoint(path);
        centerLon = c.centerLon;
        centerLat = c.centerLat;
      }
      addSpaceMarker(spaceName, centerLon, centerLat, color, spaceid);
      
      drawnCount++;
      colorIndex++; // 只有成功绘制才增加计数
      console.log(`✓ 已绘制地块 [${spaceName}]，颜色索引: ${colorIndex - 1}`);
    } catch (error) {
      console.error(`✗ 绘制地块 [${spaceName}] 失败:`, error);
    }
  });
  
  console.log(`\n=== 绘制完成 ===`);
  console.log(`✅ 成功绘制: ${drawnCount} 个地块`);
  console.log(`⏭️ 跳过: ${skippedCount} 个地块（首钢园北区）`);
  console.log(`📍 标记点: ${drawnCount} 个`);
  spaceModeDrawn = true; // 标记为已绘制，后续重复调用直接返回
}

/**
 * 为地块添加标记点（中心位置）
 * @param spaceName 地块名
 * @param centerLon 中心经度
 * @param centerLat 中心纬度
 * @param color 标记颜色
 * @param spaceid 地块 ID（点击时用于请求地块场景接口）
 */
function addSpaceMarker(spaceName: string, centerLon: number, centerLat: number, color: string, spaceid?: string) {
  if (!map.value) return;
  
  // 标记点：灯泡图标，hover 放大
  // 说明：SDK 以 anchor:'bottom' 创建 marker（外层 translate(-50%,-100%)，底部中心对齐坐标点），
  // 内层容器需 translate(0, 50%) 补偿，使图标视觉中心正好落在坐标点上（否则图标整体偏左上 35px、上 70px，看起来不在地块内）
  const markerHTML = `
    <div class="space-marker" data-space-name="${spaceName}" data-space-id="${spaceid || ''}" style="
      position: relative;
      width: 70px;
      height: 70px;
      cursor: pointer;
      transform: translate(0, 50%);
      pointer-events: none;
    " title="${spaceName}">
      <!-- 灯泡图标：默认熄灭，点击地块模式请求 scenes 接口后按回路状态切换亮/灭 -->
      <img src="${lightOffImg}" style="
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 70px; height: 70px; object-fit: contain;
        pointer-events: auto;
        z-index: 10001;
        filter: drop-shadow(0 0 6px ${color}) drop-shadow(0 2px 6px rgba(0,0,0,0.4));
      " />
    </div>`;
  
  try {
    const marker = customizeMarker(
      markerHTML,
      centerLat.toString(),
      centerLon.toString(),
      spaceName,
      { name: spaceName, spaceid }
    );
    
    if (marker) {
      lightingMarkerArr.value.push(marker);
      console.log(`📍 添加标记点 [${spaceName}] at (${centerLon}, ${centerLat})`);
    }
  } catch (error) {
    console.error(`创建标记点失败 [${spaceName}]:`, error);
  }
}

/**
 * 设置地块标点 active 状态（一级列表展示时标点保持高亮，关闭后恢复）
 * @param spaceName 地块名
 * @param active 是否激活
 */
function setSpaceMarkerActive(spaceName: string, active: boolean) {
  if (!spaceName) return;
  const els = document.querySelectorAll('.space-marker');
  els.forEach((el) => {
    if (el.getAttribute('data-space-name') === spaceName) {
      el.classList.toggle('is-active', active);
    }
  });
}

/**
 * 更新地块标点亮/灭状态（直接操作标点内 img 的 src，避免重建标点导致坐标错乱）
 * @param spaceName 地块名
 * @param isOn true=亮灯（任一回路开启），false=熄灭（全部回路关闭）
 */
function updateSpaceMarkerState(spaceName: string, isOn: boolean) {
  if (!spaceName) return;
  const imgSrc = isOn ? lightOnImg : lightOffImg;
  const els = document.querySelectorAll('.space-marker[data-space-name="' + spaceName + '"]');
  els.forEach((el) => {
    const img = el.querySelector('img');
    if (img && img.getAttribute('src') !== imgSrc) {
      img.setAttribute('src', imgSrc);
    }
  });
}

/**
 * 清除所有绘制（边框和标记点）
 */
/**
 * 清除所有绘制内容
 */
function clearAllDrawings() {
  console.log('\n===== 开始清除所有绘制 =====');
  console.log(`当前 lightingMarkerArr.length: ${lightingMarkerArr.value.length}`);
  
  // 先清除边框和高亮
  console.log('• 清除边框和高亮...');
  clearAllHighlights();
  
  // 再清除所有标记点
  console.log(`• 开始销毁 ${lightingMarkerArr.value.length} 个标记点...`);
  const allMarkers = [...lightingMarkerArr.value];
  lightingMarkerArr.value = [];
  markersDrawing = false;
  spaceModeDrawn = false; // 重置地块模式绘制缓存（下次进入需重新绘制）
  
  let successCount = 0;
  let failCount = 0;
  
  // 遍历销毁副本
  allMarkers.forEach((marker, index) => {
    try {
      // 方法1: 尝试 destroy()
      if (marker.destroy) {
        marker.destroy();
      }
      // 方法2: 尝试 removeFromMap()
      if (marker.removeFromMap) {
        marker.removeFromMap();
      }
      // 方法3: 尝试 setMap(null)
      if (marker.setMap) {
        marker.setMap(null);
      }
      
      // 方法4: 直接操作 DOM，移除地图上的所有标点元素
      const markerElements = document.querySelectorAll('[id^="light-"]');
      markerElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
          console.log(`  ✓ DOM 元素已移除: ${el.id}`);
        }
      });
      
      successCount++;
      console.log(`  ✓ 标记 ${index + 1} 已处理`);
    } catch (e) {
      failCount++;
      console.error(`✗ 标记 ${index + 1} 处理失败:`, e);
    }
  });
  
  console.log(`✓ 清除完成：成功 ${successCount} 个，失败 ${failCount} 个`);
  console.log(`✓ lightingMarkerArr 现在长度: ${lightingMarkerArr.value.length}`);
  
  // 最后再次检查是否还有残留的标点 DOM
  const remainingMarkers = document.querySelectorAll('[id^="light-"]');
  if (remainingMarkers.length > 0) {
    console.warn(`⚠️ 警告：仍有 ${remainingMarkers.length} 个标点 DOM 元素残留！`);
    remainingMarkers.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
        console.log(`  ✓ 清理残留 DOM: ${el.id}`);
      }
    });
  }
  
  console.log('===== 清除结束 =====\n');
}

/**
 * 根据地块索引获取不同颜色
 */
function getSpaceBoundaryColor(index: number): string {
  const colors = [
    'rgba(56, 189, 248, 0.9)',  // 天蓝色 - 首钢园北区
    'rgba(251, 146, 60, 0.9)',  // 橙色 - 大跳台区域
    'rgba(104, 211, 145, 0.9)', // 绿色 - 服贸会区域
    'rgba(245, 158, 11, 0.9)',  // 黄色 - 六工汇区域
    'rgba(167, 139, 250, 0.9)', // 紫色 - 秀池及周边区域
    'rgba(244, 63, 94, 0.9)',   // 玫红色 - 永定河
  ];
  return colors[index % colors.length];
}

/**
 * 根据 space-boundaries.json 中的 path 数组绘制地块边框
 */
function highlightOneSpaceFromPath(spaceName: string, path: number[][], color: string = 'rgba(56, 189, 248, 0.8)') {
  if (!path || path.length < 3) return;
  
  // 使用 path 中的坐标直接创建多边形
  // path 格式: [[lon1, lat1], [lon2, lat2], ...]
  const linePoints = path.map(coord => {
    // 确保是 [经度, 纬度] 格式
    return [coord[0], coord[1]];
  });
  
  // 闭合多边形（如果第一个和最后一个点不同）
  if (linePoints.length > 2 && 
      linePoints[0][0] !== linePoints[linePoints.length - 1][0] || 
      linePoints[0][1] !== linePoints[linePoints.length - 1][1]) {
    linePoints.push([...linePoints[0]]);
  }
  
  // 使用指定的颜色创建线条，线宽从 2 增加到 5
  const polyline = createBaseLine(linePoints, color, 5);
  allHighlightLines.push(polyline);

  // 给地块添加半透明遮罩层（地块模式批量绘制时也显示）
  createSpaceMask(spaceName, linePoints);
  
  console.log(`地块 [${spaceName}] 边框已绘制`, `共 ${path.length} 个顶点`, `颜色: ${color}`, `线宽: 5px`);
}

/**
 * 给地块创建半透明遮罩层（不会盖住边框线，只填充地块内部高亮）
 * @param spaceName 地块名（用于唯一标识）
 * @param linePoints 闭合多边形顶点 [[lon, lat], ...]
 */
function createSpaceMask(spaceName: string, linePoints: number[][]) {
  try {
    if (!map.value || !map.value.createPolygon) return;
    // 蒙层颜色与透明度（可在此统一调整）
    const maskFillColor = '#9ca3af';          // 灰色
    const maskOpacity = 0.4;
    const mask = map.value.createPolygon({
      bdid: buildingID,
      floorId: flid,
      features: [{
        type: 'Feature',
        properties: {
          id: `space-mask-${spaceName}`,
          fillColor: maskFillColor,
          opacity: maskOpacity,
          outlineColor: 'transparent'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[...linePoints.map((p: number[]) => [p[0], p[1]]), linePoints[0]]]
        }
      }],
      fillColor: maskFillColor,              // 半透明绿色填充（兜底）
      opacity: maskOpacity,
      outlineColor: 'transparent',           // 描边透明，避免与边框线冲突
    });
    if (mask) allSpaceMasks.push(mask);
  } catch (error) {
    console.warn(`地块 [${spaceName}] 遮罩层创建失败:`, error);
  }
}

/**
 * 清除所有地块边框
 */
function clearAllHighlights() {
  allHighlightLines.forEach((line: any) => {
    try {
      line.removeFromMap();
    } catch (error) {
      console.warn('移除边框失败:', error);
    }
  });
  allHighlightLines = [];
  // 清除所有地块遮罩层
  allSpaceMasks.forEach((mask: any) => {
    try {
      mask.removeFromMap && mask.removeFromMap();
    } catch (error) {
      console.warn('移除地块遮罩失败:', error);
    }
  });
  allSpaceMasks = [];
}

/**
 * 根据用户选择的地块名称绘制粗红线边框
 */
function highlightSpaceBySelected(spaceName: string) {
  if (!map.value || !spaceName || !spaceBoundariesData.length) return;
  
  // 在 spaceBoundaries.json 中查找该地块
  const spaceData = spaceBoundariesData.find((space: any) => space.name === spaceName);
  
  if (!spaceData || !spaceData.path || spaceData.path.length < 3) {
    console.warn(`未找到地块 [${spaceName}] 的有效坐标数据`);
    return;
  }
  
  // 先清除之前的边框
  clearAllHighlights();
  
  const { path } = spaceData;
  
  // 计算边界框的中心点作为聚焦基点
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  
  path.forEach((coord: number[]) => {
    if (coord[0] < minLon) minLon = coord[0];
    if (coord[0] > maxLon) maxLon = coord[0];
    if (coord[1] < minLat) minLat = coord[1];
    if (coord[1] > maxLat) maxLat = coord[1];
  });
  
  // 计算中心点（经度和纬度的平均值）
  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;
  
  // 使用 path 中的坐标创建多边形
  const linePoints = path.map((coord: number[]) => [
    coord[0],  // 经度
    coord[1]   // 纬度
  ]);
  
  // 闭合多边形（如果第一个和最后一个点不同）
  if (linePoints.length > 2 && 
      (linePoints[0][0] !== linePoints[linePoints.length - 1][0] || 
       linePoints[0][1] !== linePoints[linePoints.length - 1][1])) {
    linePoints.push([...linePoints[0]]);
  }
  
  // 🔴 使用粗红线：宽度为 4px，颜色为鲜红色
  const redColor = 'rgba(255, 0, 0, 1.0)';
  const polyline = createBaseLine(linePoints, redColor, 4);
  allHighlightLines.push(polyline);

  // 🎨 给选中地块添加半透明遮罩层（不会盖住边框线，只填充地块内部高亮）
  createSpaceMask(spaceName, linePoints);

  console.log(`🔴 地块 [${spaceName}] 已用粗红线绘制`, `共 ${path.length} 个顶点`);
  console.log(`🎯 地块中心点: (${centerLon.toFixed(6)}, ${centerLat.toFixed(6)})`);
  
  // 📍 自动聚焦到该地块
  focusOnSpaceBoundary(centerLon, centerLat, spaceName);
}

/**
 * 聚焦到地块区域（根据坐标边界框自动调整视角）
 */
function focusOnSpaceBoundary(centerLon: number, centerLat: number, spaceName: string) {
  if (!map.value) return;
  
  console.log(`📍 聚焦到地块 [${spaceName}]`, { centerLon, centerLat });
  
  // 使用 easeTo 平滑移动到地块中心
  map.value.easeTo({
    bdid: buildingID,
    lon: centerLon,
    lat: centerLat,
    floorId: flid,
  });
  
  // 延迟设置缩放级别，确保移动完成后放大
  setTimeout(() => {
    // 根据屏幕尺寸设置合适的缩放级别（比初始大1-2级）
    const zoomLevel = windowWidth > 1439 
      ? 15.5  // 大屏 - 比初始(14.0)大1.5级
      : windowWidth > 1200 
        ? 14.5  // 中屏 - 比初始(13.0)大1.5级
        : 14.0; // 小屏 - 比初始(12.5)大1.5级
    
    map.value.setZoom(zoomLevel);
    console.log(`🔍 缩放级别: ${zoomLevel}`);
  }, 300);
}

// 存储所有地块边框的折线对象
let allHighlightLines: any[] = [];
// 存储所有地块遮罩层（半透明填充多边形）
let allSpaceMasks: any[] = [];
const dialogVisible = ref(false);
const currentLight = ref<any>(null);
const lightingLoading = ref(false);
const areaOverlayEl = ref<HTMLElement | null>(null);

const clearLightingMarkers = () => {
  console.log(`• clearLightingMarkers: 开始清除 ${lightingMarkerArr.value.length} 个灯光标点...`);
  
  // 立即清空数组并保存副本
  const allMarkers = [...lightingMarkerArr.value];
  lightingMarkerArr.value = [];
  
  // 遍历销毁副本
  allMarkers.forEach((marker, index) => {
    if (marker && marker.destroy) {
      try {
        marker.destroy();
        console.log(`  ✓ 灯光标点 ${index + 1} 已销毁`);
      } catch (error) {
        console.error(`✗ 灯光标点 ${index + 1} 销毁失败:`, error);
      }
    }
  });
  
  console.log('✓ 所有灯光标点已清除');
};

const showAreaOverlay = () => {
  const container = document.getElementById('mapContainer');
  if (!container) return;
  if (!areaOverlayEl.value) {
    const overlay = document.createElement('div');
    overlay.className = 'area-overlay';
    overlay.innerHTML = `
      <div class="area-overlay__box">
        <span>地块区域</span>
      </div>
    `;
    container.appendChild(overlay);
    areaOverlayEl.value = overlay;
  }
  areaOverlayEl.value.style.display = 'block';
};

const hideAreaOverlay = () => {
  if (areaOverlayEl.value) {
    areaOverlayEl.value.style.display = 'none';
  }
};

const showArea = () => {
  clearLightingMarkers();
  showAreaOverlay();
};

const showDetails = () => {
  hideAreaOverlay();
  // 只有点击详情时才插入标点
  AddLightingMarker();
};

// 清除所有标点（用于切换地块等操作）
const clearAllMarkers = () => {
  console.log('正在清除所有标点...');
  // 清除灯光标点
  clearLightingMarkers();
};

// 加载地标数据
const getLightingData = () => {
  return lightingData.value;
};

// 切换标点显示状态
let markersVisible = false;
const toggleMarkers = (show: boolean) => {
  if (show && !markersVisible) {
    AddLightingMarker();
    markersVisible = true;
  } else if (!show) {
    clearLightingMarkers();
    markersVisible = false;
  }
};

// 标记图标：type=1 泛光照明；type!=1 区域照明
// 区域照明暂无专用图标，暂时复用泛光照明图标，后续可替换
const lightOn = lightOnImg;
const lightOff = lightOffImg;
const areaLightOn = lightOnImg;
const areaLightOff = lightOffImg;



/**
 * 成员列表展开时做视口边界适配（避免列表超出屏幕被截断）：
 * - 水平：默认以标点中心水平居中，超出左右视口时整体平移，保证列表完整可见
 * - 垂直：默认在标点上方，上方放不下且下方空间更足时切换到下方
 * - 上方展开时顶部避开固定 header，列表不被 header 遮挡
 * - 下方展开时列表顶边对齐视觉图标（按钮）底部，避免隔着细线+基座区显得离标点太远
 * - 空间不足时压缩 max-height，尽量保证列表主体可见
 */
function adjustMarkerListPosition(el: HTMLElement, listEl: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const MARGIN = 8;
  const GAP = 4;
  // 视觉图标（按钮）约占容器上部 40%（lightOn/lightOff 两图比例一致），其余为细线+基座区
  const ICON_BUTTON_RATIO = 0.4;
  // 顶部安全边距：避开固定 header（实测 60px 高），列表上方展开时不被 header 遮挡
  const headerEl = document.querySelector<HTMLElement>('.ant-layout-header');
  const TOP_SAFE = headerEl ? headerEl.getBoundingClientRect().bottom + 4 : MARGIN;
  // display 已置为 block 后再测量实际尺寸
  const listW = listEl.offsetWidth;
  const listH = listEl.offsetHeight;
  // 滚动阈值：6 条以内完整展示（不出现滚动条），超过 6 条才限高滚动
  const itemEls = listEl.querySelectorAll<HTMLElement>('.marker-list-item');
  const headerH = listEl.querySelector<HTMLElement>('.marker-list-header')?.offsetHeight || 0;
  const itemH = itemEls.length > 0 ? (itemEls[0].offsetHeight || 0) : 0;
  // 内容自然总高：直接用 scrollHeight 实测（含列表底部 padding，避免估算偏矮几像素导致误出滚动条）
  const fullListH = listEl.scrollHeight;

  // 水平偏移（dx > 0 右移、dx < 0 左移，叠加在默认的 -50% 居中之上）
  const centerX = rect.left + rect.width / 2;
  let dx = 0;
  if (centerX - listW / 2 < MARGIN) {
    dx = MARGIN - (centerX - listW / 2);
  } else if (centerX + listW / 2 > vw - MARGIN) {
    dx = vw - MARGIN - (centerX + listW / 2);
  }

  // 垂直：默认上方（bottom: 100%），上方放不下且下方更足时切换下方
  const spaceAbove = rect.top - GAP;
  const spaceBelow = vh - rect.bottom - GAP;
  let maxH = listH;
  let dy = 0;
  if (spaceAbove < listH + TOP_SAFE && spaceBelow > spaceAbove) {
    // 下方展开：上移使列表顶边对齐视觉图标（按钮）底部，紧贴标点
    listEl.style.top = '100%';
    listEl.style.bottom = 'auto';
    dy = -(el.offsetHeight * (1 - ICON_BUTTON_RATIO));
    maxH = Math.min(listH, spaceBelow - MARGIN);
  } else {
    listEl.style.top = 'auto';
    listEl.style.bottom = '100%';
    if (spaceAbove < listH + TOP_SAFE) {
      maxH = Math.min(listH, spaceAbove - TOP_SAFE);
    }
  }
  // 超过 6 条：限制为表头 + 6 行高度（视口更小时按视口），多出的条目滚动查看；
  // 6 条以内：不压缩（完整展示全部条目，即使视口空间不足也不出现滚动条）
  const finalMaxH =
    itemEls.length > 6
      ? Math.min(Math.max(60, maxH - 6), headerH + itemH * 6)
      : Math.max(fullListH, Math.max(60, maxH - 6));
  listEl.style.maxHeight = `${finalMaxH}px`;
  listEl.style.transform = `translate(-50%, ${dy}px) translateX(${dx}px)`;
}

/**
 * 标点主体点击：
 * - 成员数 >1：第一次点击展示成员列表，再次点击收起
 * - 仅 1 条：直接打开详情弹框
 */
const handleMarkerMainClick = (data: any, group: any[]) => {
  // 地块模式标点：携带 spaceid，点击时请求该地块的场景/回路接口
  if (data && data.spaceid) {
    handleSpaceMarkerClick(data);
    return;
  }
  if (group.length > 1) {
    const el = document.getElementById(`light-${String(data.type)}-${String(data.id)}`);
    const listEl = el?.querySelector<HTMLElement>('.marker-list');
    if (listEl) {
      // 关闭其他已展开的列表（同时还原它们的 marker z-index）
      closeAllMarkerLists();
      // 切换当前列表显隐
      const isHidden = listEl.style.display === 'none';
      listEl.style.display = isHidden ? 'block' : 'none';
      openedListEl = isHidden ? listEl : null;
      // 展开时将 marker 容器（含 SDK wrapper）提升到最高层级，确保弹框列表不被其他标点/地图文字遮挡
      if (isHidden && el) {
        const wrapper = (el.parentElement && el.parentElement !== document.body) ? el.parentElement : el;
        openedMarkerEl = wrapper;
        openedMarkerOriginalZ = wrapper.style.zIndex;
        wrapper.style.zIndex = '60000';
        // 拦截列表内滚轮事件，避免穿透到地图触发缩放
        bindListWheelGuard(listEl);
        // 展开后做视口边界适配，避免列表靠近屏幕边缘时被截断
        adjustMarkerListPosition(el, listEl);
      }
    }
    return;
  }
  // 仅 1 条：通知父组件（详情模式打开四页签弹框，其他情况回退原灯光详情弹窗）
  emit('light-marker-single-click', data);
};

/**
 * 自定义标记：基于 DaxiMap.DXMapMarker，支持自定义 DOM
 */
const customizeMarker = (
  elDom: string,
  lat: string,
  lng: string,
  text: string,
  data: any,
  group: any[] = [],
  domId: string = ''
) => {
  if (!map.value) return null;
  const markerInfo = {
    bdid: buildingID, // 楼栋ID
    text,
    lon: parseFloat(lng),
    lat: parseFloat(lat),
    floorId: flid, // 楼层ID（必须有效，否则 SDK addToMap 内部报错）
    dom: elDom,
  };
  if (!flid) {
    console.warn('当前无有效楼层ID，跳过标记:', text);
    return null;
  }
  try {
    const marker = new DaxiMap.DXMapMarker();
    marker.initialize(map.value, markerInfo, {
      anchor: 'bottom',
      onClick: () => handleMarkerMainClick(data, group),
    });
    marker.addToMap();
    // 成员列表项点击：保持列表展开并高亮当前项，通知父组件打开弹框（详情模式四页签弹框，其他情况回退原灯光详情弹窗）
    // （阻止冒泡，避免触发主标点点击逻辑）
    if (domId && group.length) {
      const el = document.getElementById(domId);
      el?.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement)?.closest?.('.marker-list-item');
        if (!li) return;
        e.stopPropagation();
        // 切换激活高亮：弹框打开期间列表保持激活，关闭后由父组件调用 clearMarkerListActive 清除
        const listEl = el.querySelector<HTMLElement>('.marker-list');
        listEl?.querySelectorAll('.marker-list-item.is-active').forEach((o) => o.classList.remove('is-active'));
        li.classList.add('is-active');
        const gid = li.getAttribute('data-id');
        const gtype = li.getAttribute('data-type');
        const target = group.find(
          (g) => String(g.id) === gid && String(g.type) === gtype
        );
        if (target) emit('light-marker-single-click', target);
      });
    }
    return marker;
  } catch (error) {
    console.error('标点创建异常:', text, '坐标:', lng, lat, '数据:', data, '错误:', error);
    return null;
  }
};

/**
 * 根据单个设备数据生成对应的标记 DOM
 * @param forceOff 详情模式下统一先熄灭，亮灭状态随后由 getAllCircuitApi 回路数据驱动（避免双状态源不一致）
 */
function buildMarkerDom(item: any, group: any[] = [], forceOff = false): string {
  let lightIcon: string;
  if (forceOff || item.status === '关闭') {
    lightIcon = item.type == 1 ? lightOff : areaLightOff;
  } else {
    lightIcon = item.type == 1 ? lightOn : areaLightOn;
  }
  // 统一 type/id 为字符串，避免数字与字符串混用导致 DOM id 碰撞
  const domId = `light-${String(item.type)}-${String(item.id)}`;
  // 标点成员列表（点击标点主体时切换展示，点击某一项打开对应设备详情），列表顶部展示“区域名称”表头；
  // 超过 6 条时加 marker-list-many 类（CSS 限高滚动），6 条以内不加（CSS 默认完整展示，不出现滚动条）
  const listItems = group
    .map(
      (g) =>
        `<div class="marker-list-item" data-id="${String(g.id)}" data-type="${String(g.type)}">${g.areaName || '灯光'}</div>`
    )
    .join('');
  const listHtml = listItems
    ? `<div class="marker-list${group.length > 6 ? ' marker-list-many' : ''}" style="display: none;">
      <div class="marker-list-header">区域名称22</div>
      ${listItems}
    </div>`
    : '';
  // 同坐标成员个数徽标（大于 1 时展示）
  const badgeHtml =
    group.length > 1
      ? `<span class="marker-count-badge" style="
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
        ">${group.length}</span>`
      : '';
  return `<div class="light-marker" id="${domId}" style="
    width: 50px;
    height: 100px;
    background-image: url('${lightIcon}');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center top;
    position: relative;
    opacity: 1;
  ">
    ${badgeHtml}
    ${listHtml}
  </div>`;
}

/**
 * 在地图上标记所有灯光点位
 */
async function AddLightingMarker() {
  if (!map.value) return;
  
  console.log('===== AddLightingMarker: 开始添加标点 =====');
  console.log(`• lightingData 中有 ${lightingData.value.length} 条数据`);
  console.log(`• 当前 markingMarkerArr 中有 ${lightingMarkerArr.value.length} 个旧标记`);
  
  // 1. 清除旧标记 - 使用更彻底的清理方式
  console.log('• 正在清除旧标记...');
  lightingMarkerArr.value.forEach((marker, index) => {
    try {
      marker.destroy();
      console.log(`  ✓ 已销毁旧标记 ${index + 1}`);
    } catch (error) {
      console.warn(`销毁标记 ${index + 1} 失败:`, error);
    }
  });
  lightingMarkerArr.value = [];
  console.log('✓ 所有旧标记已清除');

  // 2. 按坐标分组：同坐标的多个标点合并为一个标点，hover 时展示成员列表
  const locGroupMap = new Map<string, any[]>();
  lightingData.value.forEach((item) => {
    if (!item.location) return;
    const [lng, lat] = item.location.split(',');
    if (!lng || !lat || isNaN(parseFloat(lng)) || isNaN(parseFloat(lat))) return;
    const key = String(item.location).trim();
    if (!locGroupMap.has(key)) locGroupMap.set(key, []);
    locGroupMap.get(key)!.push(item);
  });

  // 2.1 坐标点 -> 标点信息映射：同坐标合并后，收集该坐标关联的全部 areaId（用于后续按回路数据点亮标点）
  // 空间复杂度 O(k)（k=有坐标标点数）；标点 DOM id = light-{type}-{id}，其中 id 即 areaId
  const areaIdByMarker = new Map<string, { domId: string; type: any; areaIds: string[] }>();
  locGroupMap.forEach((group, locKey) => {
    const main = group[0];
    const areaIds = new Set<string>();
    group.forEach((g) => {
      if (g.id !== undefined && g.id !== null && g.id !== '') areaIds.add(String(g.id));
    });
    areaIdByMarker.set(locKey, {
      domId: `light-${String(main.type)}-${String(main.id)}`,
      type: main.type,
      areaIds: Array.from(areaIds),
    });
  });

  // 3. 遍历数据，为有经纬度的点位生成标记（同坐标合并为一个标点）
  let markerFail = 0;
  const handledLoc = new Set<string>();
  lightingData.value.forEach((item) => {
    if (!item.location) return;
    const [lng, lat] = item.location.split(',');
    if (!lng || !lat || isNaN(parseFloat(lng)) || isNaN(parseFloat(lat))) return;

    const locKey = String(item.location).trim();
    const group = locGroupMap.get(locKey) || [item];

    // 同坐标只创建一个标点，其余成员合并进 hover 列表
    if (handledLoc.has(locKey)) return;
    handledLoc.add(locKey);

    // 组内第一条作为主标点
    const main = group[0];
    const domId = `light-${String(main.type)}-${String(main.id)}`;

    // 详情模式统一先熄灭：标点亮灭状态由 getAllCircuitApi 的回路数据驱动（避免双状态源不一致）
    const elDom = buildMarkerDom(main, group, true);
    const marker = customizeMarker(elDom, lat, lng, main.areaName || '泛光照明', main, group, domId);
    if (!marker) {
      markerFail++;
      console.warn('标点创建失败:', main.areaName, '坐标:', lng, lat);
    }
    lightingMarkerArr.value.push(marker);
  });
  if (markerFail) console.warn(`标点创建失败 ${markerFail} 条`);

  // 等待标点 DOM 渲染完成后，按屏幕 y 坐标排序层级（前面的盖住后面的）
  setTimeout(() => {
    sortMarkerZByY();
    // 每次进入详情模式重新请求最新回路数据后点亮标点（不做缓存，保证状态最新）
    lightMarkersByCircuitStatus(areaIdByMarker);
  }, 300);
}

/**
 * 按屏幕 y 坐标排序标点层级：
 * - y 越大（越靠下/越靠前）z-index 越高，前面的电线杆盖住后面的
 * - 基数 100 + 排名，远低于布局 header（500），标点不覆盖页面 header/面板
 * - 弹框列表 .marker-list 的 z-index 恒高于所有标点（样式层已设 10000）
 *
 * 重要：DaxiMap SDK 为每个 marker 创建一个外层 wrapper 容器，wrapper 才是真正的
 * 叠放上下文。直接给 .light-marker（内层）设 z-index 容易被外层 wrapper 覆盖，
 * 因此优先操作 wrapper，找不到时退化到 .light-marker 本身。
 */
function sortMarkerZByY() {
  if (!document) return;
  const markers: { el: HTMLElement; y: number }[] = [];
  document.querySelectorAll<HTMLElement>('.light-marker').forEach((el) => {
    // 跳过展开列表中的容器（展开时由 handleMarkerMainClick 提升到 400）
    if (el.style.zIndex === '400') return;
    // 优先取外层 SDK wrapper 容器（如果有），否则用内层
    const parent = el.parentElement as HTMLElement | null;
    const wrapper = parent && parent.contains(el) && parent !== document.body ? parent : el;
    const rect = wrapper.getBoundingClientRect();
    markers.push({ el: wrapper, y: rect.top + rect.height / 2 });
  });
  // 按 y 升序排序，y 大（靠下/前面）→ 分配更高 z-index
  markers.sort((a, b) => a.y - b.y);
  markers.forEach((m, index) => {
    // 基础 100 + 排名，确保前面的（y 大）盖住后面的，且低于 header（500）
    m.el.style.zIndex = String(100 + index);
  });
}

/**
 * 点亮详情模式标点（性能优化）：
 * 1. 每次进入详情模式重新请求最新数据，不做缓存（保证标点状态为最新）；
 * 2. 个性化标点单独判断：id=477 弹框展示节目列表，列表有一条 programState='运行中' → 亮灯；
 *    id=478 弹框展示区域列表，列表有一条 status='开启' → 亮灯（不依赖回路数据）；
 * 3. 其余标点按 getAllCircuitApi 回路数据点亮：单次遍历回路数组（O(m)），用 Set 以 O(1) 收集 areaId -> 是否有开启回路；
 * 4. 遍历坐标标点（O(k)），任一组内 areaId 有开启回路即点亮（some 短路，发现即停）；
 * 5. DOM 用 getElementById O(1) 定位（标点 id 即 areaId），不做全量 DOM 扫描。
 */
async function lightMarkersByCircuitStatus(
  areaIdByMarker: Map<string, { domId: string; type: any; areaIds: string[] }>
) {
  if (!areaIdByMarker.size) return;

  // 0. 个性化标点亮灯状态单独请求（不依赖回路数据）：
  //    标点 id=477：弹框展示节目列表，有一条 programState='运行中' → 亮灯
  //    标点 id=478：弹框展示区域列表，有一条 status='开启' → 亮灯
  //    仅当数据中实际存在对应标点时请求列表接口，避免额外接口开销
  const allAreaIds = Array.from(areaIdByMarker.values()).flatMap((v) => v.areaIds);
  const need477 = allAreaIds.includes('477');
  const need478 = allAreaIds.includes('478');
  const specialLit = new Map<string, boolean>([
    ['477', false],
    ['478', false],
  ]);
  if (need477) {
    try {
      const planData: any = await getLightingProgramList({ pageNo: 1, pageSize: 999 });
      const plans = Array.isArray(planData)
        ? planData
        : (planData?.records || planData?.list || planData?.result || planData?.data || []);
      specialLit.set('477', (plans as any[]).some((p: any) => p.programState === '运行中'));
    } catch (e) {
      console.error('[map] 获取节目列表失败，477 标点保持熄灭:', e);
    }
  }
  if (need478) {
    try {
      const areaData: any = await getAreaListBySpaceName({ id: 1 });
      const areas = Array.isArray(areaData)
        ? areaData
        : (areaData?.records || areaData?.list || areaData?.result || areaData?.data || []);
      specialLit.set(
        '478',
        (areas as any[]).some((a: any) => (a.status || a.state || a.areaState) === '开启')
      );
    } catch (e) {
      console.error('[map] 获取区域列表失败，478 标点保持熄灭:', e);
    }
  }

  // 1. 每次进入详情模式重新请求最新回路状态（不做缓存，保证标点亮灭反映最新数据）
  let circuits: any[] = [];
  try {
    const res: any = await getAllCircuitApi();
    circuits = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error('[map] 获取全部回路数据失败，标点保持熄灭:', e);
  }

  // 2. 单次遍历回路数组，收集“有开启回路”的 areaId 集合（status === '开启'，Set 去重 O(1)）
  const onAreaIds = new Set<string>();
  for (const c of circuits) {
    if (!c || c.status !== '开启') continue;
    const aid = String(c.areaId ?? '');
    if (aid) onAreaIds.add(aid);
  }

  // 3. 遍历坐标标点：组内任一 id 命中个性化标点（477/478）时按个性化规则点亮，其余按回路数据点亮
  areaIdByMarker.forEach(({ domId, type, areaIds }) => {
    // 组内任一 id 命中个性化标点 → 按个性化规则（some 短路，发现即停）
    const spKey = areaIds.find((aid) => specialLit.has(aid));
    const lit = spKey ? specialLit.get(spKey)! : areaIds.some((aid) => onAreaIds.has(aid));
    if (!lit) return;
    const el = document.getElementById(domId);
    if (!el) return;
    const lightIcon = type == 1 ? lightOn : areaLightOn;
    if (el.style.backgroundImage !== `url('${lightIcon}')`) {
      el.style.backgroundImage = `url('${lightIcon}')`;
    }
  });
}

/**
 * 只更新单个设备的标记图标（直接修改 DOM 背景图，不删除重建标点，避免漂移）
 */
function updateSingleMarker(item: any) {
  // 直接通过 DOM 修改标记的背景图片，不触发 SDK 的 remove/add 流程
  const el = document.getElementById(`light-${String(item.type)}-${String(item.id)}`);
  if (el) {
    let lightIcon: string;
    if (item.status === '关闭') {
      lightIcon = item.type == 1 ? lightOff : areaLightOff;
    } else {
      lightIcon = item.type == 1 ? lightOn : areaLightOn;
    }
    el.style.backgroundImage = `url('${lightIcon}')`;
  }
}

/**
 * 地块模式标点点击：场景数据由父组件按需请求
 */
const handleSpaceMarkerClick = (data: any) => {
  const spaceName = data.name || '';
  console.log('点击地块标点:', spaceName);
};

/**
 * 打开灯光详情弹窗
 */
const openLightDetail = (item: any) => {
  const [lng, lat] = (item.location || '').split(',');
  // 直接根据监控通道编码（monitorAdr）拼接 iframe 地址，不再走接口
  const videoUrl = item.monitorAdr ? `${MONITOR_BASE_URL}${item.monitorAdr}` : '';
  currentLight.value = { ...item, lng: lng || '', lat: lat || '', videoUrl };
  dialogVisible.value = true;
};

/**
 * 开灯/关灯控制
 */
const toggleLight = async () => {
  if (!currentLight.value) return;
  const target = currentLight.value.status === '打开' ? '关闭' : '打开';
  lightingLoading.value = true;
  try {
    const item = currentLight.value;
    if (item.status === '打开') {
      await closeAreaApi(item.id);
      message.success('关闭成功');
    } else {
      await openAreaApi(item.id);
      message.success('开启成功');
    }

    // 更新弹窗状态
    currentLight.value.status = target;
    // 同步 lightingData 数据
    const dataItem = lightingData.value.find((i) => i.id === currentLight.value.id);
    if (dataItem) dataItem.status = target;
    // 只更新变化的单个标点，不重建全部（避免漂移）
    if (dataItem) updateSingleMarker(dataItem);
  } catch (error) {
    console.error('灯光控制失败:', error);
  } finally {
    lightingLoading.value = false;
  }
};

/**
 * 根据地块名称聚焦地图到该区域（取该地块下第一个标点作为基点）
 */
function focusToSpace(spaceName: string) {
  if (!map.value || !spaceName) return;
  // 从标点数据中找出属于该地块的第一个有效坐标
  const target = lightingData.value.find(
    (item) => item.spaceName === spaceName && item.location
  );
  if (!target) {
    console.warn('未找到地块对应的标点:', spaceName);
    return;
  }
  const [lng, lat] = target.location.split(',');
  console.log(buildingID, parseFloat(lng), parseFloat(lat) + 0.002, flid)
  if (!lng || !lat) return;
  // 聚焦并放大（纬度微偏，使目标点在视觉上偏上）
  map.value.easeTo({
    bdid: buildingID,
    lon: parseFloat(lng),
    lat: parseFloat(lat),
    floorId: flid,
  });
  setTimeout(() => {
    map.value.setZoom(
      1200 < windowWidth && windowWidth < 1440
        ? 15.5
        : windowWidth > 1439
          ? 16.0
          : 16.5
    );
  }, 300);
}

/**
 * 高亮显示指定地块的边框（旧接口保留兼容）
 */
function highlightSpace(spaceName: string) {
  highlightOneSpaceByQuery(spaceName);
}

/**
 * 根据地块名称查询数据并绘制边框
 */
function highlightOneSpaceByQuery(spaceName: string) {
  if (!spaceName) return;
  
  // 找出属于该地块的所有 location
  const spaceLocations = lightingData.value
    .filter(item => item.spaceName === spaceName && item.location)
    .map(item => item.location);
  
  if (spaceLocations.length === 0) {
    console.warn('未找到地块对应的点位:', spaceName);
    return;
  }
  
  highlightOneSpace(spaceName, spaceLocations);
  
  console.log(`地块 [${spaceName}] 边框已绘制`);
}

/**
 * 清除单个地块边框（旧接口保留兼容）
 */
function clearHighlight() {
  clearAllHighlights();
}

/**
 * 创建折线
 */
const createBaseLine = (linePoints: number[][], color: string, width: number) => {
  const polyline = map.value.createPolyline2({
    bdid: buildingID,
    floorId: flid,
    lineColor: color,
    lineWidth: width,
    wrapperColor: "transparent",
    wrapperWidth: 4,
    linePoints: linePoints,
  });
  return polyline;
};

/**
 * 获取地块列表数据
 */
function getSpaceList(): any[] {
  const spaces = new Map<string, any>();
  lightingData.value.forEach(item => {
    if (item.spaceName) {
      if (!spaces.has(item.spaceName)) {
        spaces.set(item.spaceName, []);
      }
      spaces.get(item.spaceName).push(item);
    }
  });
  
  return Array.from(spaces.keys()).sort();
}

defineExpose({ 
  showArea, 
  showDetails, 
  focusToSpace, 
  clearAllMarkers, 
  getLightingData, 
  toggleMarkers, 
  highlightSpace, 
  clearHighlight, 
  drawAllSpaceBoundaries,
  clearAllHighlights,
  allHighlightLines,
  highlightSpaceBySelected,  // 用户选择地块后绘制粗红线
  isDrawing: { get: () => markersDrawing },  // 获取绘制状态
  clearAllDrawings,  // 清除所有绘制
  clearLightingMarkers,  // 清除灯光标点
  drawAllSpacesExceptNorth,  // 绘制所有地块（除首钢园北区）
  loadLightingData,  // 加载灯光数据
  AddLightingMarker,  // 添加标点
  openLightDetail,  // 灯光详情弹窗（父组件非详情模式回退调用）
  setSpaceMarkerActive,  // 设置地块标点 active 状态
  updateSpaceMarkerState,  // 更新地块标点亮/灭状态（任一回路开启=亮灯）
  clearMarkerListActive,  // 清除成员列表项激活高亮（列表保持展示）
  collapseMarkerList  // 收起成员列表（非详情模式点击列表项时保持原行为）
});

onMounted(async () => {
  await loadMapScripts()
  await initMap()  // 使用 await 确保初始化完成
  // 点击地图空白时自动关闭展开的成员列表（捕获阶段）
  document.addEventListener('click', handleDocumentClick, true);
  // 容器高度随视口变化后，通知 SDK 重新计算 canvas 尺寸，避免底部残留空白
  window.addEventListener('resize', handleWindowResize);
})

/**
 * 窗口尺寸变化时：地图容器高度已随 100vh 自适应，此处通知 SDK 重算 canvas 尺寸
 *（SDK 不会自动感知容器变化，不调用 resize 会导致 canvas 与容器尺寸不一致）
 */
function handleWindowResize() {
  if (map.value && typeof map.value.resize === 'function') {
    map.value.resize();
  }
}

onUnmounted(() => {
  // 清除所有标记
  clearLightingMarkers();
  if (areaOverlayEl.value) {
    areaOverlayEl.value.remove();
    areaOverlayEl.value = null;
  }
  if (map.value) {
    map.value = null
  }
  // 移除全局点击监听
  document.removeEventListener('click', handleDocumentClick, true);
  // 移除窗口尺寸监听
  window.removeEventListener('resize', handleWindowResize);
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;  /* 地图铺满整个视口，底部控制按钮为 absolute 悬浮层，无需预留空间 */
  border-radius: 0.06rem;
  overflow: hidden;
  position: relative;
  /* 隔离大屏页 rem 基准（calc(100vw/192)），地图 UI 保持固定字号不受缩放影响 */
  font-size: 16px;
  /* 修复地图滚动问题：允许鼠标滚轮事件穿透到地图 SDK */
  pointer-events: auto;
}

.area-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: none;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(14, 165, 233, 0.04));
}

.area-overlay__box {
  position: absolute;
  inset: 18% 18% 24% 18%;
  border: 2px dashed rgba(14, 165, 233, 0.9);
  border-radius: 0.16rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e0f2fe;
  font-size: 0.18rem;
  font-weight: 600;
  letter-spacing: 1px;
  background: rgba(2, 6, 23, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* 弹窗样式 */
.detail-body {
  padding: 0 0.04rem;
}

.video-wrapper {
  width: 100%;
  height: 2.6rem;
  border-radius: 0.06rem;
  overflow: hidden;
  margin-bottom: 0.16rem;
  background: #000;
}

.video-wrapper iframe {
  width: 100%;
  height: 100%;
}

.video-wrapper :deep(.video-player-wrap) {
  width: 100%;
  height: 100%;
}

.video-placeholder {
  height: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a2d47;
  border-radius: 0.06rem;
  margin-bottom: 0.16rem;
  color: #8899aa;
  font-size: 0.14rem;
}

.video-placeholder p {
  margin-top: 0.08rem;
}

.info-table {
  margin-top: 0.04rem;
}
</style>

<style>
/* 标点成员列表（点击标点主体时切换展示；标点 DOM 由 SDK 注入到组件作用域外，需全局样式） */
.light-marker .marker-list {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  /* 保底 200px：min-width 用 max() 兜底，根字号异常（<100px，如视口<1920 或 useScreenScale 未生效）时列表宽度也至少 200px；大屏根字号>100px 时仍随屏放大 */
  min-width: max(2rem, 200px);   /* 2rem = 200px @1920，随屏缩放 + 200px 保底 */
  max-width: max(3.4rem, 340px);   /* 340px @1920 */
  /* 6 条以内不设高度限制且 overflow 为 visible：内容完整展示，彻底不出现滚动条；
     超过 6 条由 .marker-list-many 切换为限高滚动 */
  max-height: none;
  overflow-y: visible;
  /* 与地块模式功能浮层（.space-menu）样式保持一致 */
  background: linear-gradient(180deg, rgba(12, 28, 52, 1) 0%, rgba(8, 18, 36, 1) 100%);
  border: 1px solid rgba(0, 200, 255, 0.35);
  border-radius: 0.08rem;
  /* 顶部不设 padding：表头（区域名称）sticky 贴顶时才能完全盖住滚动内容，不留漏缝；底部留足空间避免最后一项被截断 */
  padding: 0 0.04rem 0.08rem;
  /* 列表在 marker 容器内最上层（容器展开时 z-index:50000，列表自身再 +1） */
  z-index: 10000;
  box-shadow: 0 0.12rem 0.4rem rgba(0, 0, 0, 0.6), 0 0 0.2rem rgba(0, 180, 255, 0.15);
  backdrop-filter: blur(0.12rem);
  animation: markerListIn 0.18s ease-out;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 200, 255, 0.45) transparent;
}

/* 超过 6 条：限高滚动，多出的条目滚动查看（300px @1920）；表头 sticky 贴顶盖住滚动内容 */
.light-marker .marker-list.marker-list-many {
  max-height: max(3rem, 300px);
  overflow-y: auto;
}

.light-marker .marker-list.marker-list-many .marker-list-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

/* 列表自定义滚动条（数据多时提示可滚动，避免最后一项“看似截断”） */
.light-marker .marker-list::-webkit-scrollbar {
  width: 0.05rem;
}

.light-marker .marker-list::-webkit-scrollbar-thumb {
  background: rgba(0, 200, 255, 0.45);
  border-radius: 0.03rem;
}

.light-marker .marker-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 217, 255, 0.75);
}

.light-marker .marker-list::-webkit-scrollbar-track {
  background: transparent;
}

/* 列表表头（区域名称）：默认普通流定位（6 条以内不滚动，表头始终在顶部）；
   超过 6 条滚动时由 .marker-list-many 切换为 sticky 固定在列表顶部 */
.light-marker .marker-list-header {
  position: relative;
  padding: 0.08rem 0.14rem;
  font-size: 0.12rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #8fe8ff;
  background: linear-gradient(180deg, rgba(12, 28, 52, 1) 0%, rgba(10, 22, 40, 1) 100%);
  border-bottom: 1px solid rgba(0, 200, 255, 0.35);
  border-radius: 0.06rem 0.06rem 0 0;
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.5);
  pointer-events: none;
}

/* 与地块模式功能浮层一致的入场动画（列表定位依赖 translateX，动画仅用透明度避免位移） */
@keyframes markerListIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.light-marker .marker-list-item {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.1rem 0.14rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.13rem;
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.light-marker .marker-list-item:hover {
  background: rgba(0, 200, 255, 0.15);
  color: #00d9ff;
  padding-left: 0.18rem;
}

/* 列表项激活高亮（点击列表项弹出弹框期间保持），与地块模式功能浮层激活态一致 */
.light-marker .marker-list-item.is-active {
  background: rgba(0, 200, 255, 0.25);
  color: #00d9ff;
  border-left: 0.03rem solid #00d9ff;
  font-weight: 600;
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.6);
}

/* 深色弹窗样式（全局，因为 el-dialog 会 teleport 到 body） */
.dark-dialog.el-dialog {
  background: #0f2035 !important;
  border: 1px solid #1e3a5f !important;
}

.dark-dialog .el-dialog__header {
  background: #0f2035 !important;
  border-bottom: 1px solid #1e3a5f !important;
}

.dark-dialog .el-dialog__title {
  color: #e0e6ed !important;
}

.dark-dialog .el-dialog__body {
  background: #0f2035 !important;
  color: #e0e6ed !important;
}

.dark-dialog .el-dialog__footer {
  background: #0f2035 !important;
  border-top: 1px solid #1e3a5f !important;
}

.dark-dialog .el-descriptions {
  --el-descriptions-table-border: #1e3a5f !important;
}

.dark-dialog .el-descriptions .el-descriptions__content {
  background-color: #0f2035 !important;
  color: #ffffff !important;
}

.dark-dialog .el-descriptions .el-descriptions__label {
  background-color: #152a42 !important;
  color: #8899aa !important;
}

/* 深色主题按钮 */
.dark-dialog .btn-dark {
  background-color: #1e3a5f !important;
  color: #ffffff !important;
  border: 1px solid #2a4a6f !important;
}

.dark-dialog .btn-dark:hover {
  background-color: #2a4a6f !important;
}

/* 地块模式标点 - hover 灯泡放大 */
.space-marker img {
  transition: transform 0.25s ease, filter 0.25s ease;
}

.space-marker img:hover {
  transform: translate(-50%, -50%) scale(1.25) !important;
  filter: drop-shadow(0 0 0.12rem rgba(255, 255, 255, 0.8)) drop-shadow(0 0 0.16rem rgba(0, 200, 255, 0.8)) !important;
}

/* 地块标点 active 状态（一级列表展示时标点保持高亮 + 呼吸发光） */
.space-marker.is-active img {
  transform: translate(-50%, -50%) scale(1.2) !important;
  animation: spaceMarkerActivePulse 1.6s ease-in-out infinite;
  z-index: 10002 !important;
}

@keyframes spaceMarkerActivePulse {
  0%, 100% {
    filter: drop-shadow(0 0 0.1rem rgba(255, 255, 255, 0.85)) drop-shadow(0 0 0.16rem rgba(0, 217, 255, 0.85));
  }
  50% {
    filter: drop-shadow(0 0 0.18rem rgba(255, 255, 255, 1)) drop-shadow(0 0 0.3rem rgba(0, 217, 255, 1));
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped>
.theme-white.map-container {
  width: 100%;
  height: 100vh;  /* 地图铺满整个视口，底部控制按钮为 absolute 悬浮层，无需预留空间 */
  border-radius: 0.06rem;
  overflow: hidden;
  position: relative;
  /* 背景色不设置：与 comprehensivePreview/MapView.vue 一致，使用大希地图 SDK 默认深蓝背景 */
  /* 隔离大屏页 rem 基准（calc(100vw/192)），地图 UI 保持固定字号不受缩放影响 */
  font-size: 16px;
  /* 修复地图滚动问题：允许鼠标滚轮事件穿透到地图 SDK */
  pointer-events: auto;
}.theme-white .area-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: none;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.12), rgba(24, 144, 255, 0.04));
}.theme-white .area-overlay__box {
  position: absolute;
  inset: 18% 18% 24% 18%;
  border: 2px dashed rgba(24, 144, 255, 0.9);
  border-radius: 0.16rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-size: 0.18rem;
  font-weight: 600;
  letter-spacing: 1px;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: inset 0 0 0 1px rgba(24, 144, 255, 0.15);
}.theme-white /* 弹窗样式 */
.detail-body {
  padding: 0 0.04rem;
}.theme-white .video-wrapper {
  width: 100%;
  height: 2.6rem;
  border-radius: 0.06rem;
  overflow: hidden;
  margin-bottom: 0.16rem;
  background: #000;
}.theme-white .video-wrapper iframe {
  width: 100%;
  height: 100%;
}.theme-white .video-wrapper :deep(.video-player-wrap) {
  width: 100%;
  height: 100%;
}.theme-white .video-placeholder {
  height: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 0.06rem;
  margin-bottom: 0.16rem;
  color: #909399;
  font-size: 0.14rem;
}.theme-white .video-placeholder p {
  margin-top: 0.08rem;
}.theme-white .info-table {
  margin-top: 0.04rem;
}
</style>

<style lang="less">
.theme-white /* 标点成员列表（点击标点主体时切换展示；标点 DOM 由 SDK 注入到组件作用域外，需全局样式） */
.light-marker .marker-list {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  /* 保底 200px：min-width 用 max() 兜底，根字号异常（<100px，如视口<1920 或 useScreenScale 未生效）时列表宽度也至少 200px；大屏根字号>100px 时仍随屏放大 */
  min-width: max(2rem, 200px);   /* 2rem = 200px @1920，随屏缩放 + 200px 保底 */
  max-width: max(3.4rem, 340px);   /* 340px @1920 */
  /* 6 条以内不设高度限制且 overflow 为 visible：内容完整展示，彻底不出现滚动条；
     超过 6 条由 .marker-list-many 切换为限高滚动 */
  max-height: none;
  overflow-y: visible;
  /* 与地块模式功能浮层（.space-menu）样式保持一致 */
  background: #ffffff;
  border: 1px solid rgba(24, 144, 255, 0.35);
  border-radius: 0.08rem;
  /* 顶部不设 padding：表头（区域名称）sticky 贴顶时才能完全盖住滚动内容，不留漏缝；底部留足空间避免最后一项被截断 */
  padding: 0 0.04rem 0.08rem;
  /* 列表在 marker 容器内最上层（容器展开时 z-index:50000，列表自身再 +1） */
  z-index: 10000;
  box-shadow: 0 0.12rem 0.4rem rgba(0, 0, 0, 0.15), 0 0 0.16rem rgba(24, 144, 255, 0.08);
  backdrop-filter: blur(0.12rem);
  animation: markerListIn 0.18s ease-out;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}.theme-white /* 超过 6 条：限高滚动，多出的条目滚动查看（300px @1920）；表头 sticky 贴顶盖住滚动内容 */
.light-marker .marker-list.marker-list-many {
  max-height: max(3rem, 300px);
  overflow-y: auto;
}.theme-white .light-marker .marker-list.marker-list-many .marker-list-header {
  position: sticky;
  top: 0;
  z-index: 2;
}.theme-white /* 列表自定义滚动条（数据多时提示可滚动，避免最后一项“看似截断”） */
.light-marker .marker-list::-webkit-scrollbar {
  width: 0.05rem;
}.theme-white .light-marker .marker-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.03rem;
}.theme-white .light-marker .marker-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white .light-marker .marker-list::-webkit-scrollbar-track {
  background: transparent;
}.theme-white /* 列表表头（区域名称）：默认普通流定位（6 条以内不滚动，表头始终在顶部）；
   超过 6 条滚动时由 .marker-list-many 切换为 sticky 固定在列表顶部 */
.light-marker .marker-list-header {
  position: relative;
  padding: 0.08rem 0.14rem;
  font-size: 0.12rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #1890ff;
  background: #f5f7fa;
  border-bottom: 1px solid rgba(24, 144, 255, 0.25);
  border-radius: 0.06rem 0.06rem 0 0;
  text-shadow: 0 0 0.08rem rgba(24, 144, 255, 0.3);
  pointer-events: none;
}

/* 与地块模式功能浮层一致的入场动画（列表定位依赖 translateX，动画仅用透明度避免位移） */
@keyframes markerListIn  {
  from  { opacity: 0; }
  to  { opacity: 1; }}.theme-white .light-marker .marker-list-item {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.1rem 0.14rem;
  color: #303133;
  font-size: 0.13rem;
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f2f5;
}.theme-white .light-marker .marker-list-item:hover {
  background: rgba(24, 144, 255, 0.08);
  color: #1890ff;
  padding-left: 0.18rem;
}.theme-white /* 列表项激活高亮（点击列表项弹出弹框期间保持），与地块模式功能浮层激活态一致 */
.light-marker .marker-list-item.is-active {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border-left: 0.03rem solid #1890ff;
  font-weight: 600;
  text-shadow: 0 0 0.08rem rgba(24, 144, 255, 0.35);
}.theme-white /* 浅色弹窗样式（全局，因为 el-dialog 会 teleport 到 body） */
.dark-dialog.el-dialog {
  background: #ffffff !important;
  border: 1px solid #e4e7ed !important;
}.theme-white .dark-dialog .el-dialog__header {
  background: #fafbfc !important;
  border-bottom: 1px solid #e4e7ed !important;
}.theme-white .dark-dialog .el-dialog__title {
  color: #303133 !important;
}.theme-white .dark-dialog .el-dialog__body {
  background: #ffffff !important;
  color: #303133 !important;
}.theme-white .dark-dialog .el-dialog__footer {
  background: #fafbfc !important;
  border-top: 1px solid #e4e7ed !important;
}.theme-white .dark-dialog .el-descriptions {
  --el-descriptions-table-border: #e4e7ed !important;
}.theme-white .dark-dialog .el-descriptions .el-descriptions__content {
  background-color: #ffffff !important;
  color: #303133 !important;
}.theme-white .dark-dialog .el-descriptions .el-descriptions__label {
  background-color: #f5f7fa !important;
  color: #606266 !important;
}.theme-white /* 浅色主题按钮 */
.dark-dialog .btn-dark {
  background-color: #ffffff !important;
  color: #606266 !important;
  border: 1px solid #dcdfe6 !important;
}.theme-white .dark-dialog .btn-dark:hover {
  background-color: #f5f7fa !important;
  color: #1890ff !important;
  border-color: rgba(24, 144, 255, 0.5) !important;
}.theme-white /* 地块模式标点 - hover 灯泡放大 */
.space-marker img {
  transition: transform 0.25s ease, filter 0.25s ease;
}.theme-white .space-marker img:hover {
  transform: translate(-50%, -50%) scale(1.25) !important;
  filter: drop-shadow(0 0 0.12rem rgba(255, 255, 255, 0.6)) drop-shadow(0 0 0.16rem rgba(24, 144, 255, 0.8)) !important;
}.theme-white /* 地块标点 active 状态（一级列表展示时标点保持高亮 + 呼吸发光） */
.space-marker.is-active img {
  transform: translate(-50%, -50%) scale(1.2) !important;
  animation: spaceMarkerActivePulse 1.6s ease-in-out infinite;
  z-index: 10002 !important;
}

@keyframes spaceMarkerActivePulse  {
  0%, 100%  {
    filter: drop-shadow(0 0 0.1rem rgba(255, 255, 255, 0.6)) drop-shadow(0 0 0.16rem rgba(24, 144, 255, 0.85));
  }
  50%  {
    filter: drop-shadow(0 0 0.18rem rgba(255, 255, 255, 0.8)) drop-shadow(0 0 0.3rem rgba(24, 144, 255, 1));
  }}
</style>
