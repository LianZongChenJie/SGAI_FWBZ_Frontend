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
          <KpiBanner :kpiData="kpiData" :key="kpiKey" @open="handleOpenModal" />
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
import { leftPanels as rawLeftPanels, rightPanels as rawRightPanels, kpiData as rawKpiData, tickerData } from './data/index';
import { modalData as rawModalData } from './data/modalData';
import type { ModalBarData, ModalBarItem, ModalTableData } from './data/modalData';
import { getTodayCheckCount, getAlarmExceptionCount, getAlarmRecordList, getAlarmStatistics, getAlarmTrendRecently, getElectricityInTimePeriod, getEnergyStatistics, getAirConditioningUnitStatistics, getFreshAirStatistics, getPowerStatistics, getEnergyConsumptionPSDElectricity, getElectricityInVenue, getEnergyStructure } from './index.api';
import type { CountVO } from './index.api';

defineOptions({ name: 'BigscreenPage' });

const wrapperRef = ref<HTMLElement | null>(null);
const modalRef = ref<InstanceType<typeof DetailModal> | null>(null);
const innerStyle = ref<Record<string, string>>({});

// 左侧面板数据（响应式，便于接口回填）
const leftPanels = reactive(rawLeftPanels);
// 右侧面板数据（响应式，便于接口回填）
const rightPanels = reactive(rawRightPanels);
// KPI 数据（响应式，便于接口回填）
const kpiData = reactive(rawKpiData);
// KPI 数据索引
const KPI_POWER_INDEX = 0; // 今日用电量 kWh
// KpiBanner 强制重载 key（API 回填后 +1 触发重新动画）
const kpiKey = ref(0);

/** 面板索引 */
const RESILIENCE_INDEX = 0;
const ALARM_INDEX = 2;
/** 右侧面板索引 */
const ENERGY_RIGHT_INDEX = 0; // 节能低碳面板
const AIR_CONDITIONING_ROW = 1; // 空调机组能耗行
const FRESH_AIR_ROW = 2; // 新风机组能耗行
const POWER_ROW = 3; // 配电系统能耗行
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

/** 请求用电分时数据，提取时段数组返回 */
async function fetchElectricityInTimePeriod(): Promise<any[]> {
  try {
    const res = await getElectricityInTimePeriod();
    const data = res?.data || res?.result || res;
    if (Array.isArray(data)) return data;
    return data?.timePeriodList || data?.records || data?.list || data?.rows || [];
  } catch (error) {
    console.error('获取用电分时数据失败:', error);
    return [];
  }
}

/** 请求能耗统计，返回原始数据供弹窗使用 */
async function fetchEnergyStatisticsRaw(): Promise<any> {
  try {
    const res = await getEnergyStatistics();
    return res?.data || res?.result || res;
  } catch (error) {
    console.error('获取能耗统计失败:', error);
    return null;
  }
}

/** 请求近7日用电趋势，返回原始数据供弹窗使用 */
async function fetchEnergyConsumptionPSDElectricityRaw(): Promise<any> {
  try {
    const res = await getEnergyConsumptionPSDElectricity();
    return res?.data || res?.result || res;
  } catch (error) {
    console.error('获取近7日用电趋势失败:', error);
    return null;
  }
}

/** 请求各场馆用电，提取场馆数组返回 */
async function fetchElectricityInVenueRaw(): Promise<any[]> {
  try {
    const res = await getElectricityInVenue();
    const data = res?.data || res?.result || res;
    if (Array.isArray(data)) return data;
    return data?.list || data?.records || data?.rows || [];
  } catch (error) {
    console.error('获取各场馆用电失败:', error);
    return [];
  }
}

/** 请求用能结构分析，返回原始数据供弹窗使用 */
async function fetchEnergyStructureRaw(): Promise<any> {
  try {
    const res = await getEnergyStructure();
    return res?.data || res?.result || res;
  } catch (error) {
    console.error('获取用能结构分析失败:', error);
    return null;
  }
}

/** 初始化时请求能耗统计，回填 kpiData 中今日用电量和右侧面板节能低碳 metricCards */
async function fetchEnergyStatistics() {
  try {
    const res = await getEnergyStatistics();
    const data = res?.data || res?.result || res;
    if (data?.electricCount != null) {
      kpiData[KPI_POWER_INDEX].number = Number(data.electricCount);
      // 强制 KpiBanner 重载以触发数字动画
      kpiKey.value++;
      // 回填右侧面板节能低碳 metricCards 用电kWh
      rightPanels[ENERGY_RIGHT_INDEX].metricCards[0].value = String(data.electricCount);
    }
    if (data?.waterCount != null) {
      // 回填右侧面板节能低碳 metricCards 用水m³
      rightPanels[ENERGY_RIGHT_INDEX].metricCards[1].value = String(data.waterCount);
    }
  } catch (error) {
    console.error('获取能耗统计失败:', error);
  }
}

/** 初始化时请求空调机组统计，回填右侧面板空调机组能耗 */
async function fetchAirConditioningUnitStatistics() {
  try {
    const res = await getAirConditioningUnitStatistics();
    const data = res?.data || res?.result || res;
    if (data?.energyConsumption != null) {
      rightPanels[ENERGY_RIGHT_INDEX].metricRows[AIR_CONDITIONING_ROW].value = String(data.energyConsumption);
    }
  } catch (error) {
    console.error('获取空调机组统计失败:', error);
  }
}

/** 初始化时请求新风机组统计，回填右侧面板新风机组能耗 */
async function fetchFreshAirStatistics() {
  try {
    const res = await getFreshAirStatistics();
    const data = res?.data || res?.result || res;
    if (data?.energyConsumption != null) {
      rightPanels[ENERGY_RIGHT_INDEX].metricRows[FRESH_AIR_ROW].value = String(data.energyConsumption);
    }
  } catch (error) {
    console.error('获取新风机组统计失败:', error);
  }
}

/** 初始化时请求配电系统统计，回填右侧面板配电系统能耗 */
async function fetchPowerStatistics() {
  try {
    const res = await getPowerStatistics();
    const data = res?.data || res?.result || res;
    if (data?.energyConsumption != null) {
      rightPanels[ENERGY_RIGHT_INDEX].metricRows[POWER_ROW].value = String(data.energyConsumption);
    }
  } catch (error) {
    console.error('获取配电系统统计失败:', error);
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
  } else if (key === 'kpiPower') {
    // 点今日用电量时请求用电分时、各场馆用电、近7日用电趋势和能耗统计
    const [electricityData, venueData, trendData, energyStatsData] = await Promise.all([
      fetchElectricityInTimePeriod(),
      fetchElectricityInVenueRaw(),
      fetchEnergyConsumptionPSDElectricityRaw(),
      fetchEnergyStatisticsRaw(),
    ]);
    // 用电量弹窗：用电分时数据 → stats 峰值kW、平均kW
    if (electricityData && electricityData.length > 0 && modalData.kpiPower) {
      const values = electricityData
        .map((item: any) => Number(item.electricity))
        .filter((v: number) => !isNaN(v));
      if (values.length > 0) {
        modalData.kpiPower.stats[2].value = String(Math.max(...values));
        modalData.kpiPower.stats[3].value = String(Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length));
      }
    }
    modalRef.value?.open(key, modalData, undefined, undefined, undefined, electricityData, energyStatsData, trendData, venueData);
  } else if (key === 'energy') {
    // 点节能低碳时请求近7日能耗趋势、各场馆用电（用于用能结构分析）、能耗统计
    const [trendData, venueData, energyStatsData] = await Promise.all([
      fetchEnergyConsumptionPSDElectricityRaw(),
      fetchElectricityInVenueRaw(),
      fetchEnergyStatisticsRaw(),
    ]);
    // 能耗统计数据赋值给卡片
    if (energyStatsData && modalData.energy) {
      const stats = modalData.energy.stats;
      if (energyStatsData.electricCount != null) stats[0].value = String(energyStatsData.electricCount);
      if (energyStatsData.waterCount != null) stats[1].value = String(energyStatsData.waterCount);
    }
    // 将各场馆用电数据重组成 { name: electricity } 对象后赋值给左面板 ⚡ 用能结构分析
    if (venueData && venueData.length > 0 && modalData.energy?.leftPanel.type === 'bar') {
      // 组装为 { name: electricity } 对象
      const venueMap: Record<string, any> = {};
      venueData.forEach((item: any) => {
        venueMap[item.name ?? ''] = item.electricity ?? '';
      });
      // 赋值给条形图
      const barData = modalData.energy.leftPanel.data as ModalBarData;
      const colorList = ['blue', 'green', 'orange', 'purple', 'cyan', 'red', 'yellow'];
      const entries = Object.entries(venueMap) as [string, any][];
      const total = entries.reduce((sum, [, v]) => sum + Number(v), 0);
      barData.items = entries.map(([key, value], idx): ModalBarItem => ({
        label: key,
        color: colorList[idx % colorList.length],
        percent: total > 0 ? Math.round((Number(value) / total) * 100) : 0,
        value: `${value}`,
      }));
    }
    // 各场馆用电数据赋值给右面板 📊 各场馆能耗对比表格
    if (venueData && venueData.length > 0 && modalData.energy?.rightPanel.type === 'table') {
      const tableData = modalData.energy.rightPanel.data as ModalTableData;
      tableData.rows = venueData.map((item: any) => ({
        name: item.name ?? '',
        electricity: item.electricity ?? '',
        electricityProportion: item.electricityProportion ?? '',
        electricityMoM: typeof item.electricityMoM === 'object' ? item.electricityMoM : { text: item.electricityMoM ?? '', color: '' },
      }));
    }
    modalRef.value?.open(key, modalData, undefined, undefined, undefined, undefined, undefined, trendData);
  } else {
    modalRef.value?.open(key, modalData);
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
  // 请求能耗统计，回填 KPI 数据
  fetchEnergyStatistics();
  // 请求空调机组统计，回填右侧面板
  fetchAirConditioningUnitStatistics();
  // 请求新风机组统计，回填右侧面板
  fetchFreshAirStatistics();
  // 请求配电系统统计，回填右侧面板
  fetchPowerStatistics();
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
