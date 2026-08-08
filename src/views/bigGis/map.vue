<template>
  <div id="mapContainer" class="map-container"></div>

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
import { ref, onMounted, onUnmounted } from 'vue'
import { loadMapScripts } from '/@/components/map/loadMapScripts'
import { getAllAreaApi, openAreaApi, closeAreaApi } from '../comprehensivePreview/comprehensivePreview.api'
import { VideoCamera } from '@element-plus/icons-vue'
import VideoPlayer from '../equipmentMonitoring/components/VideoPlayer.vue'
import spaceBoundariesData from './space-boundaries.json'

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

/**
 * 关闭当前展开的成员列表
 */
function closeAllMarkerLists() {
  if (openedListEl) {
    openedListEl.style.display = 'none';
    openedListEl = null;
  }
  // 还原之前展开的 marker 容器 z-index
  if (openedMarkerEl) {
    openedMarkerEl.style.zIndex = openedMarkerOriginalZ;
    openedMarkerEl = null;
    openedMarkerOriginalZ = '';
  }
}

/**
 * 点击地图空白时自动关闭展开的成员列表（捕获阶段，标点主体/列表项点击不触发）
 */
function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  // 点击列表项：由列表项自己处理，不在此关闭
  if (target.closest('.marker-list-item')) return;
  // 点击标点主体：由标点主体自己处理 toggle，不在此关闭
  if (target.closest('.light-marker')) return;
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
    lightingData.value = Array.isArray(res) ? res : [];
    
    // 注意：不在这里自动绘制地块边框，等待用户点击“地块”按钮
  } catch {
    lightingData.value = [];
  }
}
const lightingMarkerArr = ref<any[]>([]);
let highlightLine: any = null; // 地块边框线（保留兼容）
let markersDrawing: boolean = false; // 标记是否正在绘制

/**
 * 计算中心点
 */
function calculateCenterPoint(path: number[][]): { centerLon: number; centerLat: number } {
  if (!path || path.length === 0) {
    return { centerLon: 0, centerLat: 0 };
  }
  
  // 计算边界框
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  
  path.forEach((coord: number[]) => {
    const [lon, lat] = coord;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });
  
  // 计算中心点
  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;
  
  return { centerLon, centerLat };
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
 */
function drawAllSpacesExceptNorth() {
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
  spaceBoundariesData.forEach((space: any, index: number) => {
    const { name: spaceName, path } = space;
    
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
      
      // 计算中心点并添加标记点
      const { centerLon, centerLat } = calculateCenterPoint(path);
      addSpaceMarker(spaceName, centerLon, centerLat, color);
      
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
}

/**
 * 为地块添加标记点（中心位置）
 */
function addSpaceMarker(spaceName: string, centerLon: number, centerLat: number, color: string) {
  if (!map.value) return;
  
  // 创建标记点：发光科技圆点 + 外层脉冲光环，hover 时放大并增强光晕，极具点击感
  const markerHTML = `
    <div class="space-marker" style="
      position: relative;
      width: 44px;
      height: 44px;
      cursor: pointer;
      transform: translate(-50%, -50%);
    " title="${spaceName}">
      <!-- 外层脉冲光环 -->
      <span style="
        position: absolute; inset: 0; border-radius: 50%;
        background: ${color}; opacity: 0.35;
        animation: spaceMarkerPulse 1.8s ease-out infinite;
      "></span>
      <!-- 主圆点 -->
      <span style="
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 22px; height: 22px; border-radius: 50%;
        background: ${color};
        border: 2px solid #fff;
        box-shadow: 0 0 10px ${color}, 0 4px 14px rgba(0,0,0,0.45);
      "></span>
      <!-- 中心小亮点 -->
      <span style="
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 6px; height: 6px; border-radius: 50%;
        background: #fff; box-shadow: 0 0 6px #fff;
      "></span>
    </div>`;
  
  try {
    const marker = customizeMarker(
      markerHTML,
      centerLat.toString(),
      centerLon.toString(),
      spaceName,
      { name: spaceName }
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
    const maskFillColor = '#00e676';          // 科技绿
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
  highlightLine = null;
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
 * 标点主体点击：
 * - 成员数 >1：第一次点击展示成员列表，再次点击收起
 * - 仅 1 条：直接打开详情弹框
 */
const handleMarkerMainClick = (data: any, group: any[]) => {
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
      // 展开时将 marker 容器（含 SDK wrapper）提升到最高层级，确保弹框列表不被其他标点遮挡
      if (isHidden && el) {
        const wrapper = (el.parentElement && el.parentElement !== document.body) ? el.parentElement : el;
        openedMarkerEl = wrapper;
        openedMarkerOriginalZ = wrapper.style.zIndex;
        wrapper.style.zIndex = '50000';
      }
    }
    return;
  }
  openLightDetail(data);
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
    // 成员列表项点击：打开对应设备详情并收起列表（阻止冒泡，避免触发主标点点击逻辑）
    if (domId && group.length) {
      const el = document.getElementById(domId);
      el?.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement)?.closest?.('.marker-list-item');
        if (!li) return;
        e.stopPropagation();
        closeAllMarkerLists();
        const gid = li.getAttribute('data-id');
        const gtype = li.getAttribute('data-type');
        const target = group.find(
          (g) => String(g.id) === gid && String(g.type) === gtype
        );
        if (target) openLightDetail(target);
      });
    }
    return marker;
  } catch (error) {
    console.error('标点创建异常:', text, '坐标:', lng, lat, '数据:', data, '错误:', error);
    return null;
  }
};

/**
 * 清除单个标记
 */
const clearMarker = (marker: any) => {
  if (!marker) return;
  try {
    marker.removeFromMap && marker.removeFromMap();
  } catch (error) {
    console.warn('移除标记失败:', error);
  }
};

/**
 * 根据单个设备数据生成对应的标记 DOM
 */
function buildMarkerDom(item: any, group: any[] = []): string {
  let lightIcon: string;
  if (item.status === '关闭') {
    lightIcon = item.type == 1 ? lightOff : areaLightOff;
  } else {
    lightIcon = item.type == 1 ? lightOn : areaLightOn;
  }
  // 统一 type/id 为字符串，避免数字与字符串混用导致 DOM id 碰撞
  const domId = `light-${String(item.type)}-${String(item.id)}`;
  // 标点成员列表（点击标点主体时切换展示，点击某一项打开对应设备详情）
  const listItems = group
    .map(
      (g) =>
        `<div class="marker-list-item" data-id="${String(g.id)}" data-type="${String(g.type)}">${g.areaName || '灯光'}</div>`
    )
    .join('');
  const listHtml = listItems ? `<div class="marker-list" style="display: none;">${listItems}</div>` : '';
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

    const elDom = buildMarkerDom(main, group);
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
  }, 300);
}

/**
 * 按屏幕 y 坐标排序标点层级：
 * - y 越大（越靠下/越靠前）z-index 越高，前面的电线杆盖住后面的
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
    // 跳过展开列表中的容器（展开时由 handleMarkerMainClick 提升到 50000）
    if (el.style.zIndex === '50000') return;
    // 优先取外层 SDK wrapper 容器（如果有），否则用内层
    const parent = el.parentElement as HTMLElement | null;
    const wrapper = parent && parent.contains(el) && parent !== document.body ? parent : el;
    const rect = wrapper.getBoundingClientRect();
    markers.push({ el: wrapper, y: rect.top + rect.height / 2 });
  });
  // 按 y 升序排序，y 大（靠下/前面）→ 分配更高 z-index
  markers.sort((a, b) => a.y - b.y);
  markers.forEach((m, index) => {
    // 基础 2000 + 排名，确保前面的（y 大）盖住后面的
    m.el.style.zIndex = String(2000 + index);
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
    } else {
      await openAreaApi(item.id);
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
  AddLightingMarker  // 添加标点
});

onMounted(async () => {
  await loadMapScripts()
  await initMap()  // 使用 await 确保初始化完成
  // 点击地图空白时自动关闭展开的成员列表（捕获阶段）
  document.addEventListener('click', handleDocumentClick, true);
})

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
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 820px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
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
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e0f2fe;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  background: rgba(2, 6, 23, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* 弹窗样式 */
.detail-body {
  padding: 0 4px;
}

.video-wrapper {
  width: 100%;
  height: 260px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
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
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a2d47;
  border-radius: 6px;
  margin-bottom: 16px;
  color: #8899aa;
  font-size: 14px;
}

.video-placeholder p {
  margin-top: 8px;
}

.info-table {
  margin-top: 4px;
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
  min-width: 130px;
  max-width: 220px;
  max-height: 300px;
  overflow-y: auto;
  background: rgba(10, 22, 40, 0.95);
  border: 1px solid #2a4a6f;
  border-radius: 6px;
  padding: 4px;
  /* 列表在 marker 容器内最上层（容器展开时 z-index:50000，列表自身再 +1） */
  z-index: 10000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.light-marker .marker-list-item {
  padding: 6px 10px;
  color: #e0e6ed;
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 4px;
}

.light-marker .marker-list-item:hover {
  background: rgba(56, 189, 248, 0.18);
  color: #38bdf8;
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

/* 地块模式标点 - 点击提示效果 */
@keyframes spaceMarkerPulse {
  0% {
    transform: scale(1);
    opacity: 0.45;
  }
  70% {
    transform: scale(1.9);
    opacity: 0;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}

.space-marker {
  transition: transform 0.25s ease;
}

.space-marker:hover {
  transform: translate(-50%, -50%) scale(1.25) !important;
  z-index: 10;
}

.space-marker:hover span:nth-child(2) {
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.6), 0 6px 18px rgba(0, 0, 0, 0.5) !important;
}
</style>
