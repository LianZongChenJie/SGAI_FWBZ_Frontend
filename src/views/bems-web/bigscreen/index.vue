<template>
  <div class="bigscreen-wrapper" ref="wrapperRef">
    <div class="bigscreen-inner" :style="innerStyle">
      <BigscreenHeader />
      <div class="main">
        <!-- 左侧面板 -->
        <div class="side-col">
          <SidePanel
            v-for="panel in leftPanels"
            :key="panel.key"
            :data="panel"
            @open="handleOpenModal"
          />
        </div>
        <!-- 中间列：KPI + 地图 -->
        <div class="center-col">
          <KpiBanner :kpiData="kpiData" @open="handleOpenModal" />
          <MapArea @open="handleOpenModal" />
        </div>
        <!-- 右侧面板 -->
        <div class="side-col">
          <SidePanel
            v-for="panel in rightPanels"
            :key="panel.key"
            :data="panel"
            @open="handleOpenModal"
          />
        </div>
      </div>
      <!-- 跑马灯 -->
      <TickerBar :items="tickerData" />
    </div>
    <!-- 详情弹窗 -->
    <DetailModal ref="modalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import BigscreenHeader from './components/BigscreenHeader.vue';
import KpiBanner from './components/KpiBanner.vue';
import SidePanel from './components/SidePanel.vue';
import MapArea from './components/MapArea.vue';
import TickerBar from './components/TickerBar.vue';
import DetailModal from './components/DetailModal.vue';
import { leftPanels as rawLeftPanels, rightPanels as rawRightPanels, kpiData, tickerData } from './data/index';
import { modalData as rawModalData } from './data/modalData';
import {
  getTodayCheckCount,
  getAlarmExceptionCount,
  getAlarmRecordList,
  getAlarmStatistics,
  getAlarmTrendRecently,
  getTodayDataSize,
  getCollectionPointCount,
  getTodayTraffic,
  getCurrentOnSite,
} from './index.api';
import type { CountVO } from './index.api';

defineOptions({ name: 'BigscreenPage' });

const wrapperRef = ref<HTMLElement | null>(null);
const modalRef = ref<InstanceType<typeof DetailModal> | null>(null);
const innerStyle = ref<Record<string, string>>({});

// 左侧面板数据（响应式，便于接口回填）
const leftPanels = reactive(rawLeftPanels);

// 右侧面板数据（响应式，便于接口回填）
const rightPanels = reactive(rawRightPanels);

/** 面板索引 */
const IOT_INDEX = 1;
const ALARM_INDEX = 2;
const EXHIBITION_INDEX = 2; // rightPanels 中的会展服务索引
// 弹窗数据（响应式，便于接口回填）
const modalData = reactive(rawModalData);

/** 索引 */
const ROW_ZERO = 0;  
const ROW_ONE = 1;

/** 解析 "已完成/未完成" 格式，返回 { completed, uncompleted, total, percent } */
function parseContext(ctx: string): { completed: number; uncompleted: number; total: number; percent: string } | null {
  const parts = ctx.split('/');
  if (parts.length === 2) {
    const completed = parseFloat(parts[0]) || 0;
    const uncompleted = parseFloat(parts[1]) || 0;
    const total = completed + uncompleted;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, uncompleted, total, percent: percent + '%' };
  }
  return null;
}

/** 请求今日巡检完成数量并回填面板和弹窗 */
async function fetchTodayCheck() {
  try {
    const res: CountVO = await getTodayCheckCount();
    if (res?.value != null) {
      // 解析 context（已完成/未完成 格式）
      const parsed = res.context ? parseContext(res.context) : null;

      // === 回填面板 ===
      // 今日巡检完成：显示 value
      leftPanels[ROW_ZERO].metricRows[ROW_ZERO].value = res.value;
      // 巡检完成率：显示百分比
      if (parsed) {
        leftPanels[ROW_ZERO].metricCards[ROW_ONE].value = parsed.percent;
      }

      // === 回填弹窗 ===
      const resilienceModal = modalData['resilience'];
      if (resilienceModal) {
        // stats[1] 巡检完成 → value
        resilienceModal.stats[1].value = res.value;
        if (parsed) {
          // stats[2] 待巡检 → 未完成数
          resilienceModal.stats[2].value = String(parsed.uncompleted);
          // stats[3] 完成率 → 百分比
          resilienceModal.stats[3].value = parsed.percent;
        }
      }
    }
  } catch (error) {
    console.error('获取今日巡检完成数量失败:', error);
  }
}

/** 请求待处理告警异常并回填面板和弹窗 */
async function fetchAlarmException() {
  try {
    const res: CountVO = await getAlarmExceptionCount();
    if (res?.value != null) {
      // === 回填面板 ===
      leftPanels[ROW_ZERO].metricRows[ROW_ONE].value = res.value;
    }
  } catch (error) {
    console.error('获取待处理告警异常失败:', error);
  }
}

/** 请求告警统计数据并回填告警面板，返回原始数据供弹窗使用 */
async function fetchAlarmStatistics(): Promise<any> {
  try {
    const res = await getAlarmStatistics();
    // 接口返回可能嵌套在 data/result 中，解包后使用
    const data = res?.data || res?.result || res;
    if (data) {
      const count = data.count;
      const averageProcessingTime = data.averageProcessingTime;
      const completedCount = data.completedCount;
      const untreatedCount = data.untreatedCount;
      const seriousCount = data.seriousCount;
      // metricCards[0] = 今日告警 → count
      if (count != null) leftPanels[ALARM_INDEX].metricCards[0].value = String(count);
      // metricCards[1] = 响应分钟 → averageProcessingTime
      if (averageProcessingTime != null) leftPanels[ALARM_INDEX].metricCards[1].value = String(averageProcessingTime);
      // metricRows[0] = 已处理 → completedCount
      if (completedCount != null) leftPanels[ALARM_INDEX].metricRows[0].value = String(completedCount);
      // metricRows[1] = 待处理 → untreatedCount
      if (untreatedCount != null) leftPanels[ALARM_INDEX].metricRows[1].value = String(untreatedCount);
      // metricRows[2] = 严重告警 → seriousCount
      if (seriousCount != null) leftPanels[ALARM_INDEX].metricRows[2].value = String(seriousCount);
      // metricRows[3] = 平均处理时长 → averageProcessingTime
      if (averageProcessingTime != null) leftPanels[ALARM_INDEX].metricRows[3].value = String(averageProcessingTime);
    }
    return data;
  } catch (error) {
    console.error('获取告警统计失败:', error);
    return null;
  }
}

/** 请求告警趋势数据，返回原始数据供弹窗使用 */
async function fetchAlarmTrend(): Promise<any> {
  try {
    const res = await getAlarmTrendRecently();
    return res?.data || res?.result || res;
  } catch (error) {
    console.error('获取告警趋势失败:', error);
    return null;
  }
}

/** 请求待处理告警列表，返回记录数组 */
async function fetchAlarmRecords(): Promise<any[]> {
  try {
    const res = await getAlarmRecordList({ pageNo: 1, pageSize: 5, alarmStatus: 1 });
    return res?.result?.records || res?.data?.records || res?.records || [];
  } catch (error) {
    console.error('获取告警记录列表失败:', error);
    return [];
  }
}

async function handleOpenModal(key: string) {
  // 点故障告警面板时先请求告警记录、统计数据和趋势再打开弹窗
  if (key === 'alarm') {
    const [records, stats, trend] = await Promise.all([fetchAlarmRecords(), fetchAlarmStatistics(), fetchAlarmTrend()]);
    modalRef.value?.open(key, modalData, records, stats, trend);
  } else {
    modalRef.value?.open(key, modalData);
  }
}

/** 请求今日数据量并回填（KB → GB） */
async function fetchTodayDataSize() {
  try {
    const res = await getTodayDataSize();
    const val = res?.value ?? res;
    if (val != null) {
      const kb = parseFloat(val) || 0;
      const gb = kb / (1024 * 1024);
      // 保留1位小数
      leftPanels[IOT_INDEX].metricRows[1].value = gb.toFixed(1);
    }
  } catch (error) {
    console.error('获取今日数据量失败:', error);
  }
}

/** 请求数据采集点并回填（千分位） */
async function fetchCollectionPoint() {
  try {
    const res = await getCollectionPointCount();
    const val = res?.value ?? res;
    if (val != null) {
      const num = parseInt(val, 10) || 0;
      leftPanels[IOT_INDEX].metricRows[0].value = num.toLocaleString();
    }
  } catch (error) {
    console.error('获取数据采集点失败:', error);
  }
}

/** 请求今日总客流并回填（千分位） */
async function fetchTodayTraffic() {
  try {
    const res = await getTodayTraffic();
    const val = res?.value ?? res;
    if (val != null) {
      const num = parseInt(val, 10) || 0;
      rightPanels[EXHIBITION_INDEX].metricCards[0].value = num.toLocaleString();
    }
  } catch (error) {
    console.error('获取今日总客流失败:', error);
  }
}

/** 请求当前在场人数并回填（千分位） */
async function fetchCurrentOnSite() {
  try {
    const res = await getCurrentOnSite();
    const val = res?.value ?? res;
    if (val != null) {
      const num = parseInt(val, 10) || 0;
      rightPanels[EXHIBITION_INDEX].metricRows[0].value = num.toLocaleString();
    }
  } catch (error) {
    console.error('获取当前在场人数失败:', error);
  }
}

function calcScale() {
  const targetW = 1920;
  const targetH = 1080;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scaleX = w / targetW;
  const scaleY = h / targetH;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (w - targetW * scale) / 2;
  const offsetY = (h - targetH * scale) / 2;
  innerStyle.value = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: targetW + 'px',
    height: targetH + 'px',
    marginLeft: offsetX + 'px',
    marginTop: offsetY + 'px',
  };
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(calcScale, 100);
}

onMounted(() => {
  nextTick(calcScale);
  window.addEventListener('resize', onResize);
  // 请求韧性安全实时数据
  fetchTodayCheck();
  fetchAlarmException();
  // 请求告警统计数据
  fetchAlarmStatistics();
  // 请求物联网实时数据
  fetchTodayDataSize();
  fetchCollectionPoint();
  // 请求会展服务实时数据
  fetchTodayTraffic();
  fetchCurrentOnSite();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (resizeTimer) clearTimeout(resizeTimer);
});
</script>

<style scoped>
.bigscreen-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #030712;
  position: relative;
}
.bigscreen-wrapper::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}
.bigscreen-inner {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
.main {
  flex: 1;
  display: grid;
  grid-template-columns: 580px 700px 580px;
  gap: 10px;
  padding: 8px 20px;
  min-height: 0;
}
.side-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  min-height: 0;
}
.center-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
