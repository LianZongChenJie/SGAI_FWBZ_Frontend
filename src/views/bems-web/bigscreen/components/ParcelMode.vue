<template>
  <div class="parcel-mode">
    <!-- 地块功能浮层菜单（点击灯泡标点弹出） -->
    <div
      v-if="menuVisible"
      class="parcel-menu"
      :style="{ top: menuY + 'px', left: menuX + 'px' }"
      @click.stop
    >
      <div class="parcel-menu-item" :class="{ 'is-active': activeMenuItem === 'all' }" @click="handleMenuItemClick('all')">
        一键开关
      </div>
      <div class="parcel-menu-item" :class="{ 'is-active': activeMenuItem === 'scene' }" @click="handleMenuItemClick('scene')">
        场景模式
      </div>
      <div class="parcel-menu-item" :class="{ 'is-active': activeMenuItem === 'video' }" @click="handleMenuItemClick('video')">
        监控视频
      </div>
      <div class="parcel-menu-item" :class="{ 'is-active': activeMenuItem === 'detail' }" @click="handleMenuItemClick('detail')">
        详情
      </div>
    </div>

    <!-- 浮层面板（情景模式/一键开关/回路详情）- 跟随标点位置 -->
    <div
      v-if="panelVisible"
      class="parcel-panel"
      :style="{ top: panelY + 'px', left: panelX + 'px' }"
      @click.stop
    >
      <!-- 面板头部 -->
      <div class="panel-header">
        <span class="panel-title">{{ panelTitle }}</span>
        <span class="panel-close" @click="closePanel">✕</span>
      </div>

      <!-- 一键开关面板 -->
      <div v-if="activeMenuItem === 'all'" class="panel-body">
        <button class="switch-btn switch-on" @click="handleAllOn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 8px;">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          全开
        </button>
        <button class="switch-btn switch-off" @click="handleAllOff">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 8px;">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          全关
        </button>
      </div>

      <!-- 场景模式面板 -->
      <div v-if="activeMenuItem === 'scene'" class="panel-body">
        <a-spin :spinning="loading" size="small">
          <template v-if="sceneList.length">
            <div class="scene-table-wrap">
              <table class="device-table scene-table">
                <thead>
                  <tr>
                    <th width="50">序号</th>
                    <th>场景名称</th>
                    <th width="160">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(scene, idx) in sceneList" :key="scene.id || idx">
                    <td>{{ Number(idx) + 1 }}</td>
                    <td>
                      <div class="scene-cell">
                        <span class="scene-indicator" :style="{ backgroundColor: scene.color || '#38bdf8' }"></span>
                        <span class="scene-name">{{ scene.sceneName || scene.name || '-' }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="scene-btn-group">
                        <button class="scene-btn detail-btn" @click="showSpaceSceneDetail(scene)">详情</button>
                        <button class="scene-btn on-btn" @click="handleSceneOn(scene)">开</button>
                        <button class="scene-btn off-btn" @click="handleSceneOff(scene)">关</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <div v-else class="parcel-empty">暂无场景</div>
        </a-spin>
      </div>

      <!-- 监控视频面板 -->
      <div v-if="activeMenuItem === 'video'" class="panel-body">
        <a-spin :spinning="videoLoading" size="small">
          <template v-if="videoList.length">
            <div class="video-list">
              <div
                v-for="(video, idx) in videoList"
                :key="video.id || idx"
                class="video-item"
                @click="handlePlayVideo(video)"
              >
                <span class="video-index">{{ Number(idx) + 1 }}</span>
                <span class="video-name">{{ video.name || video.cameraName || `监控点${Number(idx) + 1}` }}</span>
                <span class="video-status" :class="video.online ? 'online' : 'offline'">
                  {{ video.online ? '在线' : '离线' }}
                </span>
              </div>
            </div>
          </template>
          <div v-else class="parcel-empty">暂无监控视频</div>
        </a-spin>
        <!-- 视频播放区域 -->
        <div v-if="currentVideoUrl" class="video-player-wrap">
          <video
            v-if="!currentVideoUrl.includes('iframe')"
            :src="currentVideoUrl"
            controls
            autoplay
            style="width: 100%; max-height: 240px; background: #000; border-radius: 4px;"
          ></video>
          <iframe
            v-else
            :src="currentVideoUrl"
            style="width: 100%; height: 240px; border: none; border-radius: 4px;"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <!-- 回路详情面板 -->
      <div v-if="activeMenuItem === 'detail'" class="panel-body">
        <a-spin :spinning="loading" size="small">
          <template v-if="circuitList.length">
            <div class="circuit-table-wrap">
              <table class="device-table circuit-table">
                <thead>
                  <tr>
                    <th width="50">序号</th>
                    <th>回路名称</th>
                    <th width="70">电流</th>
                    <th width="60">状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in circuitList" :key="row._key || idx">
                    <td>{{ Number(idx) + 1 }}</td>
                    <td :title="row.name">{{ row.name }}</td>
                    <td :title="row.electricCurrent">{{ row.electricCurrent }}</td>
                    <td>
                      <span class="circuit-status" :class="row.status === '开启' ? 'is-on' : 'is-off'">
                        {{ row.status || '关闭' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <div v-else class="parcel-empty">暂无回路</div>
        </a-spin>
      </div>
    </div>

    <!-- 统一二次确认弹框 -->
    <ConfirmModal ref="confirmModalRef" />

    <!-- 场景详情弹窗 -->
    <SceneDetailModal ref="sceneDetailModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  getSceneSpaceApi,
  getAllSpaceApi,
  getVideoListBySpaceApi,
  allOnApi,
  allOffApi,
} from '@/views/bems-web/northAreaLightingSys/comprehensivePreview/comprehensivePreview.api';
import { postSceneControlApi, getLightingPlanAPiNew, planDetailApiNew } from '@/api/equipmentMonitoring';
import ConfirmModal from '@/views/bems-web/northAreaLightingSys/equipmentMonitoring/components/ConfirmModal.vue';
import SceneDetailModal from '@/views/bems-web/northAreaLightingSys/bigGis/components/SceneDetailModal.vue';

// ==================== 确认弹窗引用 ====================
const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null);
const sceneDetailModalRef = ref<InstanceType<typeof SceneDetailModal> | null>(null);

// ==================== 浮层菜单状态 ====================
const menuVisible = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const activeMenuItem = ref<string>('');
const currentSpaceName = ref('');
const currentSpaceId = ref('');

// ==================== 浮层面板状态 ====================
const panelVisible = ref(false);
const panelX = ref(0);
const panelY = ref(0);
const panelTitle = ref('');

// ==================== 数据状态 ====================
const loading = ref(false);
const videoLoading = ref(false);
const sceneList = ref<any[]>([]);
const circuitList = ref<any[]>([]);
const videoList = ref<any[]>([]);
const currentVideoUrl = ref('');

// ==================== 常量 ====================
const PANEL_WIDTH = 420;

// ==================== 地块数据缓存 ====================
// 缓存 district/listPage 返回的地块列表（含 spaceIds）
let districtListCache: any[] = [];

// ==================== 浮层菜单控制 ====================

/**
 * 显示地块功能浮层菜单
 */
function showMenu(spaceName: string, spaceId: string, markerRect: DOMRect) {
  currentSpaceName.value = spaceName;
  currentSpaceId.value = spaceId;
  activeMenuItem.value = '';

  // 计算浮层菜单位置（标点右侧）
  let x = Math.round(markerRect.right + 8);
  let y = Math.round(markerRect.top - 40);

  // 边界限制
  const menuWidth = 130;
  const menuHeight = 200;
  if (x + menuWidth > window.innerWidth - 10) {
    x = Math.round(markerRect.left - menuWidth - 8);
  }
  if (y < 10) y = 10;
  if (y + menuHeight > window.innerHeight - 10) y = window.innerHeight - menuHeight - 10;

  menuX.value = x;
  menuY.value = y;
  menuVisible.value = true;

  // 关闭已有的面板
  panelVisible.value = false;
}

/**
 * 关闭浮层菜单
 */
function closeMenu() {
  menuVisible.value = false;
  activeMenuItem.value = '';
}

// ==================== 浮层面板控制 ====================

/**
 * 计算浮层面板位置
 */
function calculatePanelPosition(markerRect?: DOMRect) {
  let x = 0;
  let y = 0;

  if (markerRect) {
    // 面板显示在菜单右侧
    x = Math.round(markerRect.right + 8 + 140);
    y = Math.round(markerRect.top - 40);
  } else {
    // 兜底：屏幕中央
    x = Math.round((window.innerWidth - PANEL_WIDTH) / 2);
    y = 100;
  }

  // 边界限制
  if (x + PANEL_WIDTH > window.innerWidth - 10) {
    x = window.innerWidth - PANEL_WIDTH - 10;
  }
  if (x < 10) x = 10;
  if (y < 10) y = 10;

  return { x, y };
}

/**
 * 显示浮层面板
 */
function showPanel(title: string, markerRect?: DOMRect) {
  const pos = calculatePanelPosition(markerRect);
  panelX.value = pos.x;
  panelY.value = pos.y;
  panelTitle.value = title;
  panelVisible.value = true;
}

/**
 * 关闭浮层面板
 */
function closePanel() {
  panelVisible.value = false;
  activeMenuItem.value = '';
}

// ==================== 菜单项点击处理 ====================

function handleMenuItemClick(key: string) {
  activeMenuItem.value = key;

  // 获取当前标点位置用于面板定位
  const markerEl = document.querySelector<HTMLElement>(`.parcel-marker[data-space-name="${currentSpaceName.value}"]`);
  const markerRect = markerEl?.getBoundingClientRect();

  if (key === 'all') {
    showPanel(`一键开关 - ${currentSpaceName.value}`, markerRect || undefined);
  } else if (key === 'scene') {
    showPanel(`场景模式 - ${currentSpaceName.value}`, markerRect || undefined);
    fetchSceneData();
  } else if (key === 'video') {
    showPanel(`监控视频 - ${currentSpaceName.value}`, markerRect || undefined);
    fetchVideoData();
  } else if (key === 'detail') {
    showPanel(`回路详情 - ${currentSpaceName.value}`, markerRect || undefined);
    fetchCircuitData();
  }
}

// ==================== 数据请求 ====================

/** 按 id 合并去重 */
function mergeById(list: any[], incoming: any[]): any[] {
  const exists = new Set(list.map((item: any) => String(item.id || item.circuitId || '')));
  const result = [...list];
  (incoming || []).forEach((item: any) => {
    const k = String(item.id || item.circuitId || '');
    if (k && !exists.has(k)) {
      result.push(item);
      exists.add(k);
    }
  });
  return result;
}

// 全量场景列表缓存（类似 bigGis 的 allTagScenes）
let allTagScenesCache: any[] = [];
let tagSceneListLoaded = false;

// 取场景的标签 id（兼容 tagId / tagIds 字段）
function getSceneTagId(item: any): any {
  const t = item?.tagId ?? item?.tagIds;
  return t == null || t === '' ? undefined : t;
}

/**
 * 加载全量场景列表（scene/listPage），只保留有 tagId 的场景
 * 与 bigGis 保持一致：场景模式使用 getLightingPlanAPiNew 而非 getSceneSpaceApi
 */
async function fetchTagSceneList(): Promise<any[]> {
  if (tagSceneListLoaded) return allTagScenesCache;
  tagSceneListLoaded = true;
  try {
    const data: any = await getLightingPlanAPiNew({ pageNo: 1, pageSize: 999 });
    const records = Array.isArray(data)
      ? data
      : data?.records || data?.list || data?.result || data?.data || [];
    allTagScenesCache = (records as any[]).filter((item: any) => getSceneTagId(item) != null);
    return allTagScenesCache;
  } catch (error) {
    console.error('[ParcelMode] 查询场景列表失败:', error);
    tagSceneListLoaded = false; // 失败时允许重试
    return [];
  }
}

async function fetchSceneData() {
  if (!currentSpaceName.value) return;
  loading.value = true;
  try {
    const allTagScenes = await fetchTagSceneList();
    // 参考 bigGis：添加名称字段映射，确保 name/sceneName 都能正确渲染
    const defaultColors = ['#52c41a', '#38bdf8', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    sceneList.value = allTagScenes
      .filter((s: any) => String(getSceneTagId(s)) === "8")
      .map((item: any, idx: number) => ({
        ...item,
        id: item.id || item.sceneId || idx,
        // 名称字段兼容：接口字段为 sceneName / planName，统一回退到 name
        name: item.name || item.sceneName || item.planName || '-',
        sceneName: item.sceneName || item.planName || '-',
        color: item.color || defaultColors[idx % defaultColors.length],
      }));
    console.log('[ParcelMode] 场景数据（tagId 过滤）:', sceneList.value.length, '条');
  } catch (error) {
    console.error('[ParcelMode] 获取场景数据失败:', error);
    sceneList.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchCircuitData() {
  if (!currentSpaceName.value) return;
  loading.value = true;
  try {
    // 获取当前地块的 id（district 的 id 用于匹配场景 tagId）
    if (!districtListCache.length) {
      const res = await getAllSpaceApi('8');
      districtListCache = Array.isArray(res?.result) ? res.result : (Array.isArray(res) ? res : []);
    }
    const district = districtListCache.find(
      (d: any) => d.districtName === currentSpaceName.value || d.name === currentSpaceName.value
    );
    const currentSpaceId = district?.id ? String(district.id) : "8";
    console.log('[ParcelMode] 当前地块 id:', currentSpaceId);
    if (!currentSpaceId) {
      circuitList.value = [];
      return;
    }

    // 获取当前地块 tagId 对应的所有场景，再从场景详情中取 spaceIds（与 bigGis 逻辑一致）
    // 这样可以确保使用正确的 spaceId 来调用 getSceneSpaceApi
    let spaceIds: number[] = [];
    if (!allTagScenesCache.length) {
      await fetchTagSceneList();
    }
    const matchedTagScenes = allTagScenesCache.filter(
      (s: any) => String(getSceneTagId(s)) === currentSpaceId
    );

    // 从场景详情中收集 spaceIds
    const spaceIdSet = new Set<number>();
    await Promise.all(
      matchedTagScenes.map(async (scene: any) => {
        try {
          const detail: any = await planDetailApiNew({ id: scene.id });
          const areaList = Array.isArray(detail?.areaList) ? detail.areaList : [];
          areaList.forEach((area: any) => {
            const sid = Number(area?.space);
            if (!isNaN(sid) && sid > 0) spaceIdSet.add(sid);
          });
        } catch (e) {
          // 单个场景详情获取失败不影响整体
        }
      })
    );
    spaceIds = Array.from(spaceIdSet);

    // 兜底：如果没有从详情中获取到 spaceIds，使用 district 原始的 spaceIds 字段
    if (spaceIds.length === 0 && district) {
      const rawIds = district.spaceIds || district.spaceIdList || '';
      if (Array.isArray(rawIds)) {
        rawIds.forEach((id: any) => {
          const n = Number(id);
          if (!isNaN(n) && n > 0) spaceIds.push(n);
        });
      } else if (typeof rawIds === 'string' && rawIds.trim()) {
        rawIds.split(',').forEach((s) => {
          const n = Number(s.trim());
          if (!isNaN(n) && n > 0) spaceIds.push(n);
        });
      }
    }

    if (spaceIds.length === 0) {
      console.warn('[ParcelMode] 无 spaceIds，无法获取回路');
      circuitList.value = [];
      return;
    }

    const merged: any = { scenes: [], circuits: [] };
    const results = await Promise.all(
      spaceIds.map((sid) => getSceneSpaceApi(String(sid)).catch(() => null))
    );
    results.forEach((res: any) => {
      if (!res) return;
      merged.scenes = mergeById(merged.scenes, Array.isArray(res?.scenes) ? res.scenes : []);
      merged.circuits = mergeById(merged.circuits, Array.isArray(res?.circuits) ? res.circuits : []);
    });
    circuitList.value = merged.circuits.map((c: any, idx: number) => ({
      ...c,
      _key: String(c.id || c.circuitId || idx),
      name: c.circuitName || c.name || `回路${idx + 1}`,
    }));
    console.log('[ParcelMode] results:', results, merged)
    console.log('[ParcelMode] 回路数据:', circuitList.value.length, '条，来源 spaceIds:', spaceIds);
  } catch (error) {
    console.error('[ParcelMode] 获取回路数据失败:', error);
    circuitList.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 获取视频监控列表（通过地块名查找 district，再调用视频列表接口）
 */
async function fetchVideoData() {
  if (!currentSpaceName.value) return;
  videoLoading.value = true;
  currentVideoUrl.value = '';
  try {
   
    
    const res: any = await getVideoListBySpaceApi('8');
    videoList.value = Array.isArray(res) ? res : (res?.result || res?.data || []);
    console.log('[ParcelMode] 监控视频:', videoList.value.length, '条');
  } catch (error) {
    console.error('[ParcelMode] 获取监控视频列表失败:', error);
    videoList.value = [];
  } finally {
    videoLoading.value = false;
  }
}

/**
 * 播放视频（使用 videoAddress 完整地址）
 */
function handlePlayVideo(video: any) {
  const url = video?.videoAddress || video?.videoUrl || video?.url || '';
  if (url) {
    currentVideoUrl.value = url;
  }
}

// ==================== 一键开关 ====================

function handleAllOn() {
  
  const matchedScenes = allTagScenesCache.filter(
    (item: any) => String(getSceneTagId(item)) === "8"
  );
  if (matchedScenes.length === 0) {
    console.warn(`[ParcelMode] 地块【${currentSpaceName.value}】无匹配场景，无法执行全开`);
    return;
  }
  showConfirm(
    `确定要 <strong class="tip-action">全开</strong> 地块"${currentSpaceName.value}"的 ${matchedScenes.length} 个场景吗？`,
    async () => {
      try {
        await Promise.all(
          matchedScenes.map((scene: any) =>
            allOnApi({
              operationType: '开启',
              relIds: scene.relIds,
              relType: scene.relType,
              sceneId: scene.id,
            })
          )
        );
        console.log(`[ParcelMode] 地块【${currentSpaceName.value}】全开指令已下发`);
        closePanel();
      } catch (error) {
        console.error('[ParcelMode] 全开失败:', error);
      }
    }
  );
}

function handleAllOff() {
  
  const matchedScenes = allTagScenesCache.filter(
    (item: any) => String(getSceneTagId(item)) === "8"
  );
  if (matchedScenes.length === 0) {
    console.warn(`[ParcelMode] 地块【${currentSpaceName.value}】无匹配场景，无法执行全关`);
    return;
  }
  showConfirm(
    `确定要 <strong class="tip-action">全关</strong> 地块"${currentSpaceName.value}"的 ${matchedScenes.length} 个场景吗？`,
    async () => {
      try {
        await Promise.all(
          matchedScenes.map((scene: any) =>
            allOffApi({
              operationType: '关闭',
              relIds: scene.relIds,
              relType: scene.relType,
              sceneId: scene.id,
            })
          )
        );
        console.log(`[ParcelMode] 地块【${currentSpaceName.value}】全关指令已下发`);
        closePanel();
      } catch (error) {
        console.error('[ParcelMode] 全关失败:', error);
      }
    }
  );
}

// ==================== 场景控制 ====================

// 打开场景详情弹窗（参考 bigGis 的 showSpaceSceneDetail）
function showSpaceSceneDetail(scene: any) {
  sceneDetailModalRef.value?.showDetail?.(scene);
}

function handleSceneOn(scene: any) {
  showConfirm(`确定要 <strong class="tip-action">开启</strong> 场景"${scene.sceneName || scene.name || '-'}"吗？`, () =>
    handleSceneAction(scene, '开启')
  );
}

function handleSceneOff(scene: any) {
  showConfirm(`确定要 <strong class="tip-action">关闭</strong> 场景"${scene.sceneName || scene.name || '-'}"吗？`, () =>
    handleSceneAction(scene, '关闭')
  );
}

async function handleSceneAction(scene: any, action: '开启' | '关闭') {
  const sceneId = scene.id;
  const status = action === '开启' ? 1 : 0;
  try {
    await postSceneControlApi({ sceneId, status });
    console.log(`[ParcelMode] 场景${action}成功:`, scene.sceneName);
    await fetchSceneData();
    await fetchCircuitData();
  } catch (error) {
    console.error(`[ParcelMode] 场景${action}失败:`, error);
  }
}

// ==================== 确认弹窗 ====================

function showConfirm(tipHtml: string, onOk: () => void) {
  confirmModalRef.value?.showModal({
    content: tipHtml,
    okText: '确定',
    onOk,
  });
}

// ==================== 点击外部关闭 ====================

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  // 点击浮层菜单内部不关闭
  if (target.closest?.('.parcel-menu')) return;
  // 点击浮层面板内部不关闭
  if (target.closest?.('.parcel-panel')) return;
  // 点击地块标点不关闭
  if (target.closest?.('.parcel-marker')) return;
  closeMenu();
  closePanel();
}

// ==================== 生命周期 ====================

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// ==================== 暴露方法 ====================
defineExpose({
  showMenu,
  closeMenu,
  closePanel,
});
</script>

<style scoped lang="less">
.parcel-mode {
  position: relative;
}

/* ==================== 浮层菜单 ==================== */
.parcel-menu {
  position: fixed;
  z-index: 95000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  min-width: 130px;
  background: linear-gradient(180deg, rgba(12, 28, 52, 0.95) 0%, rgba(8, 18, 36, 0.95) 100%);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 180, 255, 0.2);
  animation: menuFadeIn 0.15s ease-out;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.parcel-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;

  &:hover {
    background: rgba(56, 189, 248, 0.15);
    color: #fff;
  }

  &.is-active {
    background: rgba(56, 189, 248, 0.25);
    color: #38bdf8;
    font-weight: 600;
  }
}


/* ==================== 监控视频列表 ==================== */
.video-list {
  max-height: 160px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
  color: #d6dee8;
  font-size: 12px;

  &:hover {
    background-color: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
  }
}

.video-index {
  color: #6b8eab;
  min-width: 20px;
}

.video-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-status {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(220, 60, 60, 0.2);
  color: #f87171;

  &.online {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
  }
}

.video-player-wrap {
  margin-top: 8px;
}

/* ==================== 浮层面板 ==================== */
.parcel-panel {
  position: fixed;
  z-index: 95001;
  width: 420px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(12, 28, 52, 0.96) 0%, rgba(8, 18, 36, 0.96) 100%);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 180, 255, 0.15);
  animation: panelFadeIn 0.2s ease-out;
  overflow: hidden;
}

@keyframes panelFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(15, 31, 55, 0.8);
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
}

.panel-title {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
}

.panel-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }
}

.panel-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  max-height: 430px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(56, 189, 248, 0.4);
    border-radius: 3px;
  }
}

/* ==================== 一键开关面板 ==================== */
.switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 20px;
  margin-bottom: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.switch-on {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.4);

    &:hover {
      background: rgba(34, 197, 94, 0.3);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
    }
  }

  &.switch-off {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.4);

    &:hover {
      background: rgba(239, 68, 68, 0.3);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
    }
  }
}

/* ==================== 表格样式 ==================== */
.scene-table-wrap,
.circuit-table-wrap {
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 6px;
  max-height: 360px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(56, 189, 248, 0.3);
    border-radius: 2px;
  }
}

.device-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      background: rgba(15, 31, 55, 0.9);
      color: #8fe8ff;
      font-weight: 600;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    }
  }

  td {
    padding: 8px 10px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  tr:hover td {
    background: rgba(56, 189, 248, 0.06);
  }
}

/* 场景单元格 */
.scene-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scene-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.scene-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 场景操作按钮组 */
.scene-btn-group {
  display: flex;
  gap: 4px;
}

.scene-btn {
  padding: 3px 10px;
  border: none;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.detail-btn {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;

    &:hover {
      background: rgba(56, 189, 248, 0.3);
    }
  }

  &.on-btn {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;

    &:hover {
      background: rgba(34, 197, 94, 0.3);
    }
  }

  &.off-btn {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;

    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  }
}

/* 回路状态 */
.circuit-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;

  &.is-on {
    color: #4ade80;
    background: rgba(34, 197, 94, 0.1);
  }

  &.is-off {
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.1);
  }
}

/* 空状态 */
.parcel-empty {
  padding: 30px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}
</style>

<style lang="less">
/* 确认弹窗中的动作词高亮 */
.tip-action {
  font-weight: 700;
  color: #38bdf8;
}
</style>
