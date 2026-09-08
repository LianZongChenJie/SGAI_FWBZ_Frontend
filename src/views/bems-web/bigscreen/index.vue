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
import { leftPanels as rawLeftPanels, rightPanels as rawRightPanels, kpiData as rawKpiData, tickerData as rawTickerData } from './data/index';
import { modalData as rawModalData } from './data/modalData';
import {
  getTodayCheckCount,
  getAlarmRecordList,
  getAlarmStatistics,
  getAlarmTrendRecently,
  getParkingLotStatus,
  getCurrentEntryCount,
  getCurrentOnVehicle,
  getRemainingParkingSpace,
  getOnlineCamera,
  getTotalCamera,
  getCameraPackageGroup,
  getAcsDeviceList,
  getDoorList,
  getVenueVisitorFlowList,
  getVenueVisitorFlowTrend,
  getAccessDevice,
  getSystemDocking,
  getOnlineRate,
  getDeviceStatusStatistics,
  getCurrentOnSiteCount,
  getTodayActivityCount,
  getTodayVisitorCount,
  getPendingActivity,
  getTodayAlarm,
  getAccessControl,
  getFireDevice,
  getAccessDeviceTotal,
  getAccessPointTotal,
  getPeakFlow,
  getActivityCount,
  getTodayCollectionAmount,
  getDataCompleteRate,
  getPendingCount,
  getCurrentExhibition,
  getPreparationCompleteRate,
  getPendingSummaryExhibition,
  getSummarizedExhibition,
  getDeviceException,
  getElectricityInTimePeriod,
  getEnergyStatistics,
  getAirConditioningUnitStatistics,
  getFreshAirStatistics,
  getPowerStatistics,
  getEnergyConsumptionPSDElectricity,
  getElectricityInVenue,
  getEnergyStructure,
  getInterfaceStatusList,
  getProtocolTypeList,
  getSecuritySummary,
  getAccessControlSummary,
  getPatrolPlanList,
  getExhibitionList,
  getVenueInfoList,
} from './index.api';
import {
  getFlowSummary,
  getFlowList,
  getFlowTrend,
} from '../venue/flow/index.api';
import type { PatrolPlan, DaySchedule, VenueItem } from './index.api';
import type { CountVO, ParkingSpaceStatVO, DeviceTypeStatusVO, StatusCountVO, InterfaceInfo, CameraPackageGroup, AcsDeviceListVO, DoorListVO, VenueFlowVO } from './index.api';
import type { ModalBarData, ModalBarItem, ModalTableData } from './data/modalData';

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
const KPI_PEOPLE_INDEX = 1; // 今日客流 人次
const KPI_ONSITE_INDEX = 2; // 当前在场 人次
const KPI_PEAK_INDEX = 3; // 峰值人数
// KpiBanner 强制重载 key（API 回填后 +1 触发重新动画）
const kpiKey = ref(0);

/** 面板索引 */
const IOT_INDEX = 1;
const ALARM_INDEX = 2;
const VENUE_INDEX = 1;       // rightPanels 中的场馆运营索引
const EXHIBITION_INDEX = 2; // rightPanels 中的会展服务索引
/** 右侧面板索引 */
const ENERGY_RIGHT_INDEX = 0; // 节能低碳面板
const AIR_CONDITIONING_ROW = 1; // 空调机组能耗行
const FRESH_AIR_ROW = 2; // 新风机组能耗行
const POWER_ROW = 3; // 配电系统能耗行
// 弹窗数据（响应式，便于接口回填）
const modalData = reactive(rawModalData);
// 跑马灯数据（响应式，便于接口回填）
const tickerData = reactive(rawTickerData);

/** 索引 */
const ROW_ZERO = 0;  
const ROW_ONE = 1;

/** 韧性安全 metricRows 索引 */
const RES_PEOPLE_IDX = 0;    // 当前在场人数
const RES_VEHICLE_IDX = 1;   // 在场车辆/总车位
const RES_CHECK_IDX = 2;     // 今日巡检完成
const RES_CAMERA_IDX = 3;    // 在线摄像头/总数

/** 物联网 metricCards / metricRows 索引 */
const IOT_DEVICE_IDX = 0;       // 接入设备 (metricCards[0])
const IOT_ONLINE_RATE_IDX = 1;  // 接口在线率 (metricCards[1])
const IOT_COLLECT_IDX = 0;      // 数据采集点 (metricRows[0])
const IOT_DOCKING_IDX = 1;      // 系统对接 (metricRows[1])

/** 场馆运营 metricCards / metricRows 索引 */
const VENUE_ONSITE_IDX = 0;     // 当前在场 (metricCards[0])
const VENUE_ACTIVITY_IDX = 1;   // 今日活动数 (metricCards[1])
const VENUE_VISITOR_IDX = 0;    // 今日总客流 (metricRows[0])
const VENUE_PENDING_IDX = 1;    // 待筹备活动 (metricRows[1])

/** 安全防范面板索引 */
const SECURITY_INDEX = 3;           // rightPanels 中的安全防范索引
const SEC_MONITOR_IDX = 0;          // 监控点位 (metricCards[0])
const SEC_FIREDEVICE_IDX = 1;       // 消防设备 (metricCards[1])
const SEC_ALARM_IDX = 0;            // 今日告警 (metricRows[0])
const SEC_ACCESS_IDX = 1;           // 门禁通行 (metricRows[1])

/** 请求韧性安全摄像头和门禁汇总数据并回填面板和弹窗 */
async function fetchResilienceSecurityData() {
  try {
    const [cameraSummaryRes, accessSummaryRes] = await Promise.all([
      getSecuritySummary(),
      getAccessControlSummary(),
    ]);
    // 摄像头汇总：StatItem[]，[0]=总数 [1]=在线数
    const cameraSummary: any[] = Array.isArray(cameraSummaryRes) ? cameraSummaryRes : [];
    // 门禁汇总：StatItem[]，[0]=控制器总数 [1]=在线控制器 [2]=通道总数 [3]=在线通道
    const accessSummary: any[] = Array.isArray(accessSummaryRes) ? accessSummaryRes : [];

    // === 回填 metricCards ===
    // 摄像头总数 (metricCards[0])
    if (cameraSummary[0]?.value != null) {
      leftPanels[ROW_ZERO].metricCards[0].value = String(cameraSummary[0].value);
    }
    // 门禁控制器总数 (metricCards[1])
    if (accessSummary[0]?.value != null) {
      leftPanels[ROW_ZERO].metricCards[1].value = String(accessSummary[0].value);
    }

    // === 回填 metricRows ===
    // 在线摄像头 (metricRows[0])
    if (cameraSummary[1]?.value != null) {
      leftPanels[ROW_ZERO].metricRows[0].value = String(cameraSummary[1].value);
    }
    // 在线门禁控制器 (metricRows[1])
    if (accessSummary[1]?.value != null) {
      leftPanels[ROW_ZERO].metricRows[1].value = String(accessSummary[1].value);
    }
    // 门禁通道总数 (metricRows[2])
    if (accessSummary[2]?.value != null) {
      leftPanels[ROW_ZERO].metricRows[2].value = String(accessSummary[2].value);
    }
    // 在线门禁通道 (metricRows[3])
    if (accessSummary[3]?.value != null) {
      leftPanels[ROW_ZERO].metricRows[3].value = String(accessSummary[3].value);
    }

    // === 同步弹窗 stats ===
    const resilienceModal = modalData['resilience'];
    if (resilienceModal) {
      // stats[0] 在线摄像头 → 摄像头汇总[1]
      if (cameraSummary[1]?.value != null) {
        resilienceModal.stats[0].value = String(cameraSummary[1].value);
      }
      // stats[1] 在线门禁控制器 → 门禁汇总[1]
      if (accessSummary[1]?.value != null) {
        resilienceModal.stats[1].value = String(accessSummary[1].value);
      }
      // stats[2] 门禁通道总数 → 门禁汇总[2]
      if (accessSummary[2]?.value != null) {
        resilienceModal.stats[2].value = String(accessSummary[2].value);
      }
      // stats[3] 在线门禁通道 → 门禁汇总[3]
      if (accessSummary[3]?.value != null) {
        resilienceModal.stats[3].value = String(accessSummary[3].value);
      }
    }
  } catch (error) {
    console.error('获取韧性安全汇总数据失败:', error);
  }
}

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
      leftPanels[ROW_ZERO].metricRows[RES_CHECK_IDX].value = res.value;
      // 巡检完成率：显示百分比
      if (parsed) {
        leftPanels[ROW_ZERO].metricCards[ROW_ONE].value = parsed.percent;
      }

      // === 回填弹窗 ===
      const resilienceModal = modalData['resilience'];
      if (resilienceModal) {
        // stats[2] 今日巡检完成 → value
        resilienceModal.stats[2].value = res.value;
      }
    }
  } catch (error) {
    console.error('获取今日巡检完成数量失败:', error);
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
      kpiData[KPI_POWER_INDEX].number = data.electricCount.replace(/[^0-9]/g, '');
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

/** 初始化时请求新风机组统计，回填右侧面板新风机组能耗和平均PM2.5 */
async function fetchFreshAirStatistics() {
  try {
    const res = await getFreshAirStatistics();
    const data = res?.data || res?.result || res;
    if (data?.energyConsumption != null) {
      rightPanels[ENERGY_RIGHT_INDEX].metricRows[FRESH_AIR_ROW].value = String(data.energyConsumption);
    }
    if (data?.avgPm25 != null) {
      rightPanels[ENERGY_RIGHT_INDEX].metricRows[ROW_ZERO].value = String(data.avgPm25);
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

/** 请求设备状态统计并回填韧性安全弹窗右栏表格 */
/** 巡更计划状态映射 (0=停用, 1=启动, 2=运行中) */
const patrolStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: '停用', color: '#f87171' },
  1: { text: '启动', color: '#4ade80' },
  2: { text: '运行中', color: '#38bdf8' },
};

/** 请求巡更计划列表并回填韧性安全弹窗左栏表格 */
async function fetchPatrolPlanData() {
  try {
    const res = await getPatrolPlanList({ pageNo: 1, pageSize: 10 });
    const records: PatrolPlan[] = res?.records || res?.data?.records || res?.data || [];
    const resilienceModal = modalData['resilience'];
    if (resilienceModal && resilienceModal?.leftPanel?.type === 'table') {
      const tableData = resilienceModal?.leftPanel?.data as any;
      tableData.rows = records.map((item: PatrolPlan) => ({
        planName: item.planName || '--',
        patrolRoute: item.patrolRoute || '--',
        executionCycle: item.executionCycle || '--',
        nextExecution: item.nextExecution || '--',
        status: patrolStatusMap[item.status] || { text: '未知', color: '#94a3b8' },
      }));
    }
  } catch (error) {
    console.error('获取巡更计划列表失败:', error);
  }
}

async function fetchDeviceStatusStatistics() {
  try {
    const res = await getDeviceStatusStatistics();
    const list: DeviceTypeStatusVO[] = res?.result || res?.data || res || [];
    if (Array.isArray(list) && list.length > 0) {
      const resilienceModal = modalData['resilience'];
      if (resilienceModal && resilienceModal?.rightPanel?.type === 'table') {
        const tableData = resilienceModal?.rightPanel?.data as any;
        // 收集所有出现过的状态名称，用于动态生成列
        const statusSet = new Set<string>();
        list.forEach((item: DeviceTypeStatusVO) => {
          (item.data || []).forEach((sc: StatusCountVO) => {
            if (sc.status) statusSet.add(sc.status);
          });
        });
        const allStatuses = Array.from(statusSet);
        // 最多展示5列：设备类型 + 总数 + 最多3个状态列
        const statuses = allStatuses.slice(0, 3);
        // 动态生成列：设备类型 + 总数 + 各状态列
        tableData.columns = [
          { title: '设备类型', key: 'name' },
          { title: '总数', key: 'total', width: 60 },
          ...statuses.map((s) => ({ title: s, key: s, width: 60 })),
        ];
        // 生成行数据
        tableData.rows = list.map((item: DeviceTypeStatusVO) => {
          const statusList = item.data || [];
          const total = statusList.reduce((sum, sc) => sum + (sc.count || 0), 0);
          const row: Record<string, any> = {
            name: item.typeName || '--',
            total: String(total),
          };
          statuses.forEach((s) => {
            const found = statusList.find((sc) => sc.status === s);
            const count = found?.count ?? 0;
            // 异常/故障类状态用红色，其他用绿色
            const isAbnormal = /异常|故障|离线|告警/.test(s);
            row[s] = { text: String(count), color: isAbnormal && count > 0 ? '#f87171' : '#4ade80' };
          });
          return row;
        });
      }
    }
  } catch (error) {
    console.error('获取设备状态统计失败:', error);
  }
}

/** 请求场馆运营实时数据并回填面板和弹窗 */
async function fetchVenueData() {
  try {
    const [onsiteRes, activityRes, visitorRes, pendingRes, peakFlowRes, monthlyActivityRes] = await Promise.all([
      getCurrentOnSiteCount(),
      getTodayActivityCount(),
      getTodayVisitorCount(),
      getPendingActivity(),
      getPeakFlow(),
      getActivityCount(),
    ]);
    // 当前在场 (metricCards[0]) → 同步到 KPI 数据并触发动画重载
    const onsiteVal = onsiteRes?.value ?? onsiteRes;
    if (onsiteVal != null) {
      const num = parseInt(onsiteVal, 10) || 0;
      rightPanels[VENUE_INDEX].metricCards[VENUE_ONSITE_IDX].value = String(num);
      // === 同步 KPI 当前在场 ===
      kpiData[KPI_ONSITE_INDEX].number = num;
      kpiKey.value++;
    }
    // 今日活动数 (metricCards[1])
    const activityVal = activityRes?.value ?? activityRes;
    if (activityVal != null) {
      rightPanels[VENUE_INDEX].metricCards[VENUE_ACTIVITY_IDX].value = String(activityVal);
    }
    // === 同步弹窗 stats ===
    const venueModal = modalData['venue'];
    // 今日总客流 → 同步到 KPI 数据并触发动画重载
    const visitorVal = visitorRes?.value ?? visitorRes;
    if (visitorVal != null) {
      const num = parseInt(visitorVal, 10) || 0;
      const displayVal = num.toLocaleString();
      rightPanels[VENUE_INDEX].metricRows[VENUE_VISITOR_IDX].value = displayVal;
      // === 同步 KPI 今日客流 ===
      kpiData[KPI_PEOPLE_INDEX].number = num;
      kpiKey.value++;
      // === 同步弹窗 ===
      if (venueModal) {
        venueModal.stats[0].value = displayVal;
      }
    }
    if (venueModal) {
      // 待筹备活动 (metricRows[1]) → stats[1]
      const pendingVal = pendingRes?.value ?? pendingRes;
      if (pendingVal != null) {
        const displayVal = String(pendingVal);
        rightPanels[VENUE_INDEX].metricRows[VENUE_PENDING_IDX].value = displayVal;
        venueModal.stats[1].value = displayVal;
      }
      // 峰值客流 (metricRows[2]) → stats[2] + KPI 峰值人数
      const peakFlowVal = peakFlowRes?.value ?? peakFlowRes;
      if (peakFlowVal != null) {
        const num = parseInt(peakFlowVal, 10) || 0;
        const displayVal = num.toLocaleString();
        rightPanels[VENUE_INDEX].metricRows[2].value = displayVal;
        venueModal.stats[2].value = displayVal;
        // === 同步 KPI 峰值人数 ===
        kpiData[KPI_PEAK_INDEX].number = num;
        kpiKey.value++;
      }
      // 本月活动数 (metricRows[3]) → stats[3]
      const monthlyActivityVal = monthlyActivityRes?.value ?? monthlyActivityRes;
      if (monthlyActivityVal != null) {
        const displayVal = String(monthlyActivityVal);
        rightPanels[VENUE_INDEX].metricRows[3].value = displayVal;
        venueModal.stats[3].value = displayVal;
      }
    }
  } catch (error) {
    console.error('获取场馆运营数据失败:', error);
  }
}

/** 请求安全防范实时数据并回填面板和弹窗 */
async function fetchSecurityData() {
  try {
    // 监控点位 → totalCamera 接口；消防设备 → fireDevice 接口；今日告警 → todayAlarm 接口；门禁通行 → accessControl 接口
    // 门禁设备总数 → accessDeviceTotal 接口；门禁点位总数 → accessPointTotal 接口
    const [cameraRes, fireRes, alarmRes, accessRes, accessDeviceTotalRes, accessPointTotalRes] = await Promise.all([
      getTotalCamera(),
      getFireDevice(),
      getTodayAlarm(),
      getAccessControl(),
      getAccessDeviceTotal(),
      getAccessPointTotal(),
    ]);
    // 监控点位 (metricCards[0])，取 value 字段
    const monitorVal = cameraRes?.value ?? cameraRes;
    if (monitorVal != null) {
      const num = parseInt(monitorVal, 10) || 0;
      rightPanels[SECURITY_INDEX].metricCards[SEC_MONITOR_IDX].value = num.toLocaleString();
    }
    // 消防设备 (metricCards[1])，取 value 字段
    const fireVal = fireRes?.value ?? fireRes;
    if (fireVal != null) {
      const num = parseInt(fireVal, 10) || 0;
      rightPanels[SECURITY_INDEX].metricCards[SEC_FIREDEVICE_IDX].value = num.toLocaleString();
    }
    // 今日告警 (metricRows[0])，取 total 字段
    const alarmData = alarmRes?.data || alarmRes?.result || alarmRes;
    const alarmTotal = alarmData?.total ?? alarmData?.value;
    if (alarmTotal != null) {
      const num = parseInt(alarmTotal, 10) || 0;
      rightPanels[SECURITY_INDEX].metricRows[SEC_ALARM_IDX].value = String(num);
    }
    // 门禁通行 (metricRows[1])，取 value 字段
    const accessVal = accessRes?.value ?? accessRes;
    if (accessVal != null) {
      const num = parseInt(accessVal, 10) || 0;
      rightPanels[SECURITY_INDEX].metricRows[SEC_ACCESS_IDX].value = num.toLocaleString();
    }
    // 门禁设备总数 (metricRows[2])，取 value 字段
    const accessDeviceTotalVal = accessDeviceTotalRes?.value ?? accessDeviceTotalRes;
    if (accessDeviceTotalVal != null) {
      const num = parseInt(accessDeviceTotalVal, 10) || 0;
      rightPanels[SECURITY_INDEX].metricRows[2].value = String(num);
    }
    // 门禁点位总数 (metricRows[3])，取 value 字段
    const accessPointTotalVal = accessPointTotalRes?.value ?? accessPointTotalRes;
    if (accessPointTotalVal != null) {
      const num = parseInt(accessPointTotalVal, 10) || 0;
      rightPanels[SECURITY_INDEX].metricRows[3].value = String(num);
    }
    // === 同步弹窗 stats（与 metricRows 字段同步）===
    const securityModal = modalData['security'];
    if (securityModal) {
      // stats[0] 今日告警 → metricRows[0]
      if (alarmTotal != null) {
        const num = parseInt(alarmTotal, 10) || 0;
        securityModal.stats[0].value = String(num);
      }
      // stats[1] 门禁通行 → metricRows[1]
      if (accessVal != null) {
        const num = parseInt(accessVal, 10) || 0;
        securityModal.stats[1].value = num.toLocaleString();
      }
      // stats[2] 门禁设备总数 → metricRows[2]
      if (accessDeviceTotalVal != null) {
        const num = parseInt(accessDeviceTotalVal, 10) || 0;
        securityModal.stats[2].value = String(num);
      }
      // stats[3] 门禁点位总数 → metricRows[3]
      if (accessPointTotalVal != null) {
        const num = parseInt(accessPointTotalVal, 10) || 0;
        securityModal.stats[3].value = String(num);
      }
    }
  } catch (error) {
    console.error('获取安全防范数据失败:', error);
  }
}

/** 递归统计分组下的摄像头点位数：children 为空则统计自身 videoList，有 children 则递归汇总所有子孙节点的 videoList 数量 */
function countGroupVideos(group: CameraPackageGroup): number {
  const children = group.children || [];
  if (children.length === 0) {
    return (group.videoList || []).length;
  }
  return children.reduce((sum, child) => sum + countGroupVideos(child), 0);
}

/** 请求摄像头分组树（packageGroup），回填安全防范弹窗-监控点位分布 */
async function fetchCameraPackageGroup() {
  try {
    const res = await getCameraPackageGroup();
    const groups: CameraPackageGroup[] = res?.result || res?.data || res || [];
    if (!Array.isArray(groups) || groups.length === 0) return;
    const securityModal = modalData['security'];
    if (securityModal?.leftPanel?.type === 'table') {
      const tableData = securityModal.leftPanel.data as ModalTableData;
      // name 对应区域，count 为该分组（含所有子孙节点）下的摄像头点位数
      tableData.rows = groups.map((g: CameraPackageGroup) => ({
        name: g.name || '--',
        count: String(countGroupVideos(g)),
      }));
    }
  } catch (error) {
    console.error('获取摄像头分组数据失败:', error);
  }
}

/** 请求门禁控制器设备列表（acsDevice/list），回填安全防范弹窗-控制器列表 */
async function fetchAcsDeviceList() {
  try {
    const res = await getAcsDeviceList({ pageNo: 1, pageSize: 100 });
    const records: AcsDeviceListVO[] = res?.result?.records || res?.data?.records || res?.records || [];
    if (!Array.isArray(records)) return;
    const securityModal = modalData['security'];
    if (securityModal?.rightPanel?.type === 'table') {
      const tableData = securityModal.rightPanel.data as ModalTableData;
      // name 对应设备名称，ip 对应设备IP，regionName 对应区域名称，abnormal 对应在线状态
      tableData.rows = records.map((item: AcsDeviceListVO) => {
        const online = item.online === '1';
        return {
          name: item.name || '--',
          ip: item.ip || '--',
          regionName: item.regionName || '--',
          abnormal: { text: online ? '在线' : '离线', color: online ? '#4ade80' : '#f87171' },
        };
      });
    }
  } catch (error) {
    console.error('获取门禁控制器设备列表失败:', error);
  }
}

/** 门状态展示映射（与安全操作台一致）：0-初始状态 1-开门状态 2-关门状态 3-离线状态 */
const doorStateTextMap: Record<string, { text: string; color: string }> = {
  '0': { text: '初始状态', color: '#94a3b8' },
  '1': { text: '开门状态', color: '#4ade80' },
  '2': { text: '关门状态', color: '#38bdf8' },
  '3': { text: '离线状态', color: '#f87171' },
};

/** 请求门禁地点列表（door/list），回填安全防范弹窗-门禁地点列表 */
async function fetchDoorList() {
  try {
    const res = await getDoorList({ pageNo: 1, pageSize: 100 });
    const records: DoorListVO[] = res?.result?.records || res?.data?.records || res?.records || [];
    if (!Array.isArray(records)) return;
    const securityModal = modalData['security'];
    if (securityModal?.extraTable) {
      // name 对应门禁地点名称，doorNo 对应门禁地点编号，regionName 对应区域名称，doorState 对应门状态
      securityModal.extraTable.rows = records.map((item: DoorListVO) => ({
        name: item.name || '--',
        doorNo: item.doorNo || '--',
        regionName: item.regionName || '--',
        doorState: doorStateTextMap[item.doorState || ''] || { text: '未知', color: '#94a3b8' },
      }));
    }
  } catch (error) {
    console.error('获取门禁地点列表失败:', error);
  }
}

/** 请求各场馆客流统计（venueList），回填会展服务弹窗-各场馆客流分布（venueName→label，todayInCount→value） */
async function fetchExhibitionVenueFlow() {
  try {
    const res = await getVenueVisitorFlowList();
    const list: VenueFlowVO[] = res?.result || res?.data || res || [];
    if (!Array.isArray(list) || list.length === 0) return;
    const exhibitionModal = modalData['exhibition'];
    const panel = exhibitionModal?.leftPanel;
    if (panel?.type === 'bar') {
      const barData = panel.data as ModalBarData;
      const colorList = ['blue', 'green', 'orange', 'purple'];
      const counts = list.map((item) => Number(item.todayInCount) || 0);
      const max = Math.max(...counts, 1);
      barData.items = list.map((item, idx): ModalBarItem => ({
        label: item.venueName || `场馆${idx + 1}`,
        color: colorList[idx % colorList.length],
        percent: Math.round((counts[idx] / max) * 100),
        value: `${counts[idx].toLocaleString()}人`,
      }));
    }
  } catch (error) {
    console.error('获取各场馆客流分布失败:', error);
  }
}

/** 请求今日客流趋势（periodType=0），回填会展服务弹窗-今日客流趋势（bars/footer，echarts 折线渲染） */
async function fetchExhibitionTrend() {
  try {
    const res = await getVenueVisitorFlowTrend({ periodType: 0 });
    if (!res || typeof res !== 'object' || Array.isArray(res)) return;
    const trend = modalData['exhibition']?.trend;
    if (!trend) return;
    // x轴：后端 date（逐时），无则 0-23 时
    const xAxis: string[] =
      Array.isArray(res.date) && res.date.length > 0
        ? res.date.map((d: any) => String(d))
        : Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    // 解析各场馆逐时客流：date/total 之外的数组字段视为一个场馆系列
    const skipKeys = new Set(['date', 'total', 'todayInTotal', 'todayInOutTotal']);
    const colorList = ['#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#a78bfa', '#fb7185', '#22d3ee', '#a3e635', '#f97316', '#c084fc'];
    const venueSeries: { name: string; color: string; values: number[] }[] = [];
    Object.keys(res).forEach((key) => {
      if (skipKeys.has(key) || !Array.isArray(res[key]) || res[key].length === 0) return;
      venueSeries.push({
        name: key,
        color: colorList[venueSeries.length % colorList.length],
        values: res[key].map((v: any) => Number(v) || 0),
      });
    });
    // 合计客流：优先 total 字段，否则累加各场馆逐时值
    let totalValues: number[] = [];
    if (Array.isArray(res.total) && res.total.length > 0) {
      totalValues = res.total.map((v: any) => Number(v) || 0);
    } else if (venueSeries.length > 0) {
      const len = Math.max(...venueSeries.map((s) => s.values.length));
      totalValues = Array.from({ length: len }, (_, xi) =>
        venueSeries.reduce((sum, s) => sum + (Number(s.values[xi]) || 0), 0),
      );
    }
    if (xAxis.length === 0) return;
    // 组装 series：各场馆各一条曲线；多场馆且存在合计时最后追加"总客流"曲线
    const allSeries = [...venueSeries];
    if (venueSeries.length === 0 && totalValues.length > 0) {
      allSeries.push({ name: '今日客流', color: '#38bdf8', values: totalValues });
    } else if (venueSeries.length > 1 && totalValues.length > 0) {
      allSeries.push({ name: '总客流', color: '#38bdf8', values: totalValues });
    }
    if (allSeries.length === 0) return;
    // bars：按各系列最大值的归一化（旧字段，与 echarts 曲线同步）
    const max = Math.max(...allSeries.flatMap((s) => s.values), 1);
    trend.bars = xAxis.map((label, xi) => ({
      height: Math.max(2, Math.round(((totalValues[xi] ?? 0) / max) * 100)),
      color: '#38bdf8',
      label,
      value: totalValues[xi] ?? 0,
    }));
    // echarts 折线数据
    trend.xAxis = xAxis;
    trend.series = allSeries.map((s) => ({ name: s.name, color: s.color, values: s.values }));
    // footer：峰值时段与峰值客流（按合计）
    const peakIdx = totalValues.length ? totalValues.indexOf(Math.max(...totalValues)) : -1;
    const peakTime = peakIdx >= 0 ? (xAxis[peakIdx] ?? '') : '';
    const peakVal = peakIdx >= 0 ? (totalValues[peakIdx] ?? 0) : 0;
    const sumVal = totalValues.reduce((s, v) => s + v, 0);
    trend.footer = `峰值时段: ${peakTime} (${Number(peakVal).toLocaleString()}人次) | 今日客流合计: ${Number(sumVal).toLocaleString()}人次`;
  } catch (error) {
    console.error('获取今日客流趋势失败:', error);
  }
}

/** 请求接口状态监控列表，返回记录数组供弹窗使用 */
async function fetchInterfaceStatusList(): Promise<InterfaceInfo[]> {
  try {
    const res = await getInterfaceStatusList({ pageNo: 1, pageSize: 50 });
    return res?.records || [];
  } catch (error) {
    console.error('获取接口状态监控列表失败:', error);
    return [];
  }
}

async function handleOpenModal(key: string) {
  // 点韧性安全面板时先请求设备状态统计和巡更计划列表再打开弹窗
  if (key === 'resilience') {
    await Promise.all([fetchDeviceStatusStatistics(), fetchPatrolPlanData()]);
    modalRef.value?.open(key, modalData);
  } else if (key === 'alarm') {
    // 点故障告警面板时先请求告警记录、统计数据和趋势再打开弹窗
    const [records, stats, trend] = await Promise.all([fetchAlarmRecords(), fetchAlarmStatistics(), fetchAlarmTrend()]);
    modalRef.value?.open(key, modalData, records, stats, trend);
  } else if (key === 'exhibition') {
    // 会展服务弹窗：请求停车场实时状态、各场馆客流分布、今日客流趋势后打开
    await Promise.all([fetchParkingLotStatus(), fetchExhibitionVenueFlow(), fetchExhibitionTrend()]);
    modalRef.value?.open(key, modalData);
  } else if (key === 'security') {
    // 安全防范弹窗：请求摄像头分组（监控点位分布）、门禁控制器（控制器列表）、门禁地点（门禁地点列表）后打开
    await Promise.all([fetchCameraPackageGroup(), fetchAcsDeviceList(), fetchDoorList()]);
    modalRef.value?.open(key, modalData);
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
  } else if (key === 'kpiPeople') {
    // 今日客流详情弹窗：请求汇总数据、今日时段分布、各场馆分布、近7日趋势
    const [summaryData, todayTrendData, venueListData, weekTrendData] = await Promise.all([
      getFlowSummary(),
      getFlowTrend({ periodType: 0 }), // 今日
      getFlowList({ date: new Date().toISOString().split('T')[0] }),
      getFlowTrend({ periodType: 1 }), // 本周
    ]);
    // 填充汇总数据到 stats
    if (Array.isArray(summaryData) && modalData.kpiPeople) {
      summaryData.forEach((item: any, index: number) => {
        if (modalData.kpiPeople!.stats[index]) {
          modalData.kpiPeople!.stats[index].value = String(item.value || '--');
        }
      });
    }
    // 填充各时段客流分布到 leftPanel
    if (todayTrendData && modalData.kpiPeople?.leftPanel?.type === 'table') {
      const tableData = modalData.kpiPeople.leftPanel.data as ModalTableData;
      const xAxisData = Array.isArray(todayTrendData.date) ? todayTrendData.date : [];
      // 找到 total 数据作为各时段净增
      if (Array.isArray(todayTrendData.total) && xAxisData.length > 0) {
        tableData.rows = xAxisData.map((time: string, idx: number) => {
          const total = todayTrendData.total[idx] || 0;
          const prevTotal = idx > 0 ? todayTrendData.total[idx - 1] || 0 : 0;
          const net = idx === 0 ? total : total - prevTotal;
          return {
            time,
            in: String(total),
            out: idx === 0 ? '0' : String(prevTotal),
            net: { text: (net >= 0 ? '+' : '') + net, color: net >= 0 ? '#4ade80' : '#f87171' },
          };
        });
      }
    }
    // 填充各场馆客流分布到 rightPanel
    if (venueListData && modalData.kpiPeople?.rightPanel?.type === 'table') {
      const tableData = modalData.kpiPeople.rightPanel.data as ModalTableData;
      const records = Array.isArray(venueListData) ? venueListData : (venueListData?.records || []);
      const totalCount = records.reduce((sum: number, item: any) => sum + (item.todayInCount || 0), 0);
      tableData.rows = records.map((item: any) => {
        const count = item.todayInCount || 0;
        const ratio = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
        return {
          name: item.venueName || '',
          count: String(count),
          ratio: ratio + '%',
          peak: item.maxTime || '--',
        };
      });
    }
    // 填充近7日客流趋势到 trend
    if (weekTrendData && modalData.kpiPeople?.trend) {
      if (Array.isArray(weekTrendData.total) && Array.isArray(weekTrendData.date)) {
        const values = weekTrendData.total as number[];
        const labels = weekTrendData.date as string[];
        const max = Math.max(...values, 1);
        // 设置 xAxis 和 series（弹窗组件渲染图表使用）
        modalData.kpiPeople.trend.xAxis = labels;
        modalData.kpiPeople.trend.series = [{ name: '客流', color: '#4ade80', values }];
        modalData.kpiPeople.trend.bars = values.map((v: number, i: number) => ({
          height: Math.round((v / max) * 100),
          color: '#4ade80',
          label: labels[i] || `第${i + 1}天`,
          value: v,
        }));
        // 动态计算 footer：本周累计和日均
        const weekTotal = values.reduce((sum: number, v: number) => sum + v, 0);
        const avgDaily = values.length > 0 ? Math.round(weekTotal / values.length) : 0;
        modalData.kpiPeople.trend.footer = `日均: ${avgDaily.toLocaleString()} 人次 | 本周累计: ${weekTotal.toLocaleString()} 人次`;
      }
    }
    modalRef.value?.open(key, modalData);
  } else if (key === 'energy') {
    // 点节能低碳时请求近7日能耗趋势、各场馆用电（用于用能结构分析）、能耗统计、新风机组统计（平均PM2.5）、空调机组统计
    const [trendData, venueData, energyStatsData, freshAirStats, acStats] = await Promise.all([
      fetchEnergyConsumptionPSDElectricityRaw(),
      fetchElectricityInVenueRaw(),
      fetchEnergyStatisticsRaw(),
      getFreshAirStatistics(),
      getAirConditioningUnitStatistics(),
    ]);
    // 能耗统计数据赋值给卡片
    if (energyStatsData && modalData.energy) {
      const stats = modalData.energy.stats;
      if (energyStatsData.electricCount != null) stats[0].value = String(energyStatsData.electricCount);
      if (energyStatsData.waterCount != null) stats[1].value = String(energyStatsData.waterCount);
    }
    // 新风机组统计：平均PM2.5 → stats[2]
    if (freshAirStats && modalData.energy) {
      const data = freshAirStats?.data || freshAirStats?.result || freshAirStats;
      if (data?.avgPm25 != null) modalData.energy.stats[2].value = String(data.avgPm25);
    }
    // 空调机组统计：能耗 → stats[3]
    if (acStats && modalData.energy) {
      const data = acStats?.data || acStats?.result || acStats;
      if (data?.energyConsumption != null) modalData.energy.stats[3].value = String(data.energyConsumption);
    }
    // 将各场馆用电数据重组成 { name: electricity } 对象后赋值给左面板 ⚡ 用能结构分析
    if (venueData && venueData.length > 0 && modalData?.energy?.leftPanel?.type === 'bar') {
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
    if (venueData && venueData.length > 0 && modalData?.energy?.rightPanel?.type === 'table') {
      const tableData = modalData.energy.rightPanel.data as ModalTableData;
      tableData.rows = venueData.map((item: any) => ({
        name: item.name ?? '',
        electricity: item.electricity ?? '',
        electricityProportion: item.electricityProportion ?? '',
        electricityMoM: typeof item.electricityMoM === 'object' ? item.electricityMoM : { text: item.electricityMoM ?? '', color: '' },
      }));
    }
    modalRef.value?.open(key, modalData, undefined, undefined, undefined, undefined, undefined, trendData);
  } else if (key === 'venue') {
    // 场馆运营弹窗：请求本周活动排期和场馆信息列表
    try {
      const [exhibitionRes, venueRes] = await Promise.all([
        getExhibitionList(),
        getVenueInfoList({ pageNo: 1, pageSize: 50 }),
      ]);
      // 处理活动排期数据
      const exhibitionData = Array.isArray(exhibitionRes) ? exhibitionRes : (exhibitionRes?.result || exhibitionRes?.data || exhibitionRes?.records || []);
      if (modalData.venue?.leftPanel?.type === 'table') {
        const tableData = modalData.venue.leftPanel.data as ModalTableData;
        const rows: Record<string, any>[] = [];
        (exhibitionData as DaySchedule[]).forEach((day) => {
          const dateStr = day.date || '';
          if (day.list && day.list.length > 0) {
            day.list.forEach((activity) => {
              const startTime = activity.startTime?.slice(0, 5) || '';
              const endTime = activity.endTime?.slice(0, 5) || '';
              rows.push({
                date: dateStr,
                activeName: activity.activeName || '--',
                time: startTime && endTime ? `${startTime}-${endTime}` : (startTime || endTime || '--'),
                venueName: activity.venueName || '--',
              });
            });
          }
        });
        tableData.rows = rows;
      }
      // 处理场馆信息数据
      if (modalData.venue?.rightPanel?.type === 'table') {
        const venueTableData = modalData.venue.rightPanel.data as ModalTableData;
        const venueList: VenueItem[] = Array.isArray(venueRes) ? venueRes : (venueRes?.records || venueRes?.data || []);
        venueTableData.rows = venueList.map((item) => ({
          venueName: item.venueName || '--',
          location: item.location || '--',
          area: item.area || '--',
          floors: item.floors || '--',
          ceilingH: item.ceilingH || '--',
        }));
      }
    } catch (error) {
      console.error('获取场馆运营数据失败:', error);
    }
    modalRef.value?.open(key, modalData);
  } else if (key === 'iot') {
    // 物联网弹窗：请求接口状态监控列表 + 协议类型列表，将 protocolTypeId 映射为名称
    const [interfaceList, protocolTypes] = await Promise.all([
      fetchInterfaceStatusList(),
      getProtocolTypeList().catch(() => []),
    ]);
    const protocolMap = new Map<number, string>();
    const protoList: any[] = Array.isArray(protocolTypes) ? protocolTypes : protocolTypes?.records || [];
    protoList.forEach((p: any) => {
      if (p.id != null) protocolMap.set(p.id, p.typeName || '--');
    });
    // 将 protocolTypeId 映射为 protocolTypeName 供模板展示
    interfaceList.forEach((item: any) => {
      item.protocolTypeName = item.protocolTypeId != null
        ? (protocolMap.get(item.protocolTypeId) || '--')
        : '--';
    });
    (modalData.iot as any)._interfaceList = interfaceList;
    modalRef.value?.open(key, modalData);
  } else {
    modalRef.value?.open(key, modalData);
  }
}

/** 请求接入设备和数据采集点并回填物联网面板和弹窗（同一接口，千分位） */
async function fetchIotAccessAndCollect() {
  try {
    const res = await getAccessDevice();
    const val = res?.value ?? res;
    if (val != null) {
      const num = parseInt(val, 10) || 0;
      const displayVal = num.toLocaleString();
      // 接入设备 (metricCards[0])
      leftPanels[IOT_INDEX].metricCards[IOT_DEVICE_IDX].value = displayVal;
      // 数据采集点 (metricRows[0])
      leftPanels[IOT_INDEX].metricRows[IOT_COLLECT_IDX].value = displayVal;
      // === 同步弹窗 stats[0] ===
      const iotModal = modalData['iot'];
      if (iotModal) {
        iotModal.stats[0].value = displayVal;
      }
    }
  } catch (error) {
    console.error('获取接入设备/数据采集点失败:', error);
  }
}

/** 请求接口在线率并回填物联网面板 */
async function fetchOnlineRate() {
  try {
    const res = await getOnlineRate();
    const val = res?.value ?? res;
    if (val != null) {
      const num = parseFloat(val) || 0;
      leftPanels[IOT_INDEX].metricCards[IOT_ONLINE_RATE_IDX].value = num + '%';
    }
  } catch (error) {
    console.error('获取接口在线率失败:', error);
  }
}

/** 请求系统对接数并回填物联网面板和弹窗 */
async function fetchSystemDocking() {
  try {
    const res = await getSystemDocking();
    const val = res?.value ?? res;
    if (val != null) {
      const num = parseInt(val, 10) || 0;
      const displayVal = String(num);
      leftPanels[IOT_INDEX].metricRows[IOT_DOCKING_IDX].value = displayVal;
      // === 同步弹窗 stats[1] ===
      const iotModal = modalData['iot'];
      if (iotModal) {
        iotModal.stats[1].value = displayVal;
      }
    }
  } catch (error) {
    console.error('获取系统对接数失败:', error);
  }
}

/** 请求今日采集量和数据完整率并回填物联网面板和弹窗 */
async function fetchIotCollectionAndCompleteRate() {
  try {
    const [collectionRes, completeRateRes] = await Promise.all([
      getTodayCollectionAmount(),
      getDataCompleteRate(),
    ]);
    // 今日采集量 (metricRows[2])
    const collectionVal = collectionRes?.value ?? collectionRes;
    if (collectionVal != null) {
      const num = parseInt(collectionVal, 10) || 0;
      const displayVal = String(num);
      leftPanels[IOT_INDEX].metricRows[2].value = displayVal;
      // === 同步弹窗 stats[2] ===
      const iotModal = modalData['iot'];
      if (iotModal) {
        iotModal.stats[2].value = displayVal;
      }
    }
    // 数据完整率 (metricRows[3])
    const completeRateVal = completeRateRes?.value ?? completeRateRes;
    if (completeRateVal != null) {
      const num = parseFloat(completeRateVal) || 0;
      const displayVal = num + '%';
      leftPanels[IOT_INDEX].metricRows[3].value = displayVal;
      // === 同步弹窗 stats[3] ===
      const iotModal = modalData['iot'];
      if (iotModal) {
        iotModal.stats[3].value = displayVal;
      }
    }
  } catch (error) {
    console.error('获取今日采集量和数据完整率失败:', error);
  }
}

/** 请求会展服务实时数据并回填面板和弹窗 */
async function fetchExhibitionData() {
  try {
    const [pendingRes, currentExhibitionRes, completeRateRes, pendingSummaryRes, summarizedRes, deviceExceptionRes] = await Promise.all([
      getPendingCount(),
      getCurrentExhibition(),
      getPreparationCompleteRate(),
      getPendingSummaryExhibition(),
      getSummarizedExhibition(),
      getDeviceException(),
    ]);
    // 待筹备会展 (metricCards[0])
    const pendingVal = pendingRes?.value ?? pendingRes;
    if (pendingVal != null) {
      const num = parseInt(pendingVal, 10) || 0;
      rightPanels[EXHIBITION_INDEX].metricCards[0].value = String(num);
    }
    // 当前展会 (metricCards[1])
    const currentExhibitionVal = currentExhibitionRes?.value ?? currentExhibitionRes;
    if (currentExhibitionVal != null) {
      const num = parseInt(currentExhibitionVal, 10) || 0;
      rightPanels[EXHIBITION_INDEX].metricCards[1].value = String(num);
    }
    // === 同步弹窗 stats（与 metricRows 字段同步）===
    const exhibitionModal = modalData['exhibition'];
    if (exhibitionModal) {
      // 筹备完成率 (metricRows[0]) → stats[0]
      const completeRateVal = completeRateRes?.value ?? completeRateRes;
      if (completeRateVal != null) {
        const num = parseFloat(completeRateVal) || 0;
        const displayVal = num + '%';
        rightPanels[EXHIBITION_INDEX].metricRows[0].value = displayVal;
        exhibitionModal.stats[0].value = displayVal;
      }
      // 待总结展会 (metricRows[1]) → stats[1]
      const pendingSummaryVal = pendingSummaryRes?.value ?? pendingSummaryRes;
      if (pendingSummaryVal != null) {
        const num = parseInt(pendingSummaryVal, 10) || 0;
        const displayVal = String(num);
        rightPanels[EXHIBITION_INDEX].metricRows[1].value = displayVal;
        exhibitionModal.stats[1].value = displayVal;
      }
      // 已总结展会 (metricRows[2]) → stats[2]
      const summarizedVal = summarizedRes?.value ?? summarizedRes;
      if (summarizedVal != null) {
        const num = parseInt(summarizedVal, 10) || 0;
        const displayVal = String(num);
        rightPanels[EXHIBITION_INDEX].metricRows[2].value = displayVal;
        exhibitionModal.stats[2].value = displayVal;
      }
      // 设备异常 (metricRows[3]) → stats[3]
      const deviceExceptionVal = deviceExceptionRes?.value ?? deviceExceptionRes;
      if (deviceExceptionVal != null) {
        const num = parseInt(deviceExceptionVal, 10) || 0;
        const displayVal = String(num);
        rightPanels[EXHIBITION_INDEX].metricRows[3].value = displayVal;
        exhibitionModal.stats[3].value = displayVal;
      }
    }
  } catch (error) {
    console.error('获取会展服务数据失败:', error);
  }
}

/** 请求当前在场人数并回填韧性安全面板和弹窗 */
async function fetchCurrentEntryCount() {
  
  try {
    const res = await getCurrentEntryCount();
    const val = res?.value ?? res;
    if (val != null) {
      const num = parseInt(val, 10) || 0;
      leftPanels[ROW_ZERO].metricRows[RES_PEOPLE_IDX].value = String(num);
      // === 同步弹窗 stats[0] ===
      const resilienceModal = modalData['resilience'];
      if (resilienceModal) {
        resilienceModal.stats[0].value = String(num);
      }
    }
  } catch (error) {
    console.error('获取当前在场人数失败:', error);
  }
}

/** 请求在场车辆和剩余车位并回填韧性安全面板和弹窗（总车位 = 在场车辆 + 剩余车位） */
async function fetchVehicleAndParking() {
  try {
    const [vehicleRes, parkingRes] = await Promise.all([
      getCurrentOnVehicle(),
      getRemainingParkingSpace(),
    ]);
    const vehicleVal = parseInt((vehicleRes?.value ?? vehicleRes) as string, 10) || 0;
    const parkingVal = parseInt((parkingRes?.value ?? parkingRes) as string, 10) || 0;
    const total = vehicleVal + parkingVal;
    const displayVal = `${vehicleVal}/${total}`;
    leftPanels[ROW_ZERO].metricRows[RES_VEHICLE_IDX].value = displayVal;
    // === 同步弹窗 stats[1] ===
    const resilienceModal = modalData['resilience'];
    if (resilienceModal) {
      resilienceModal.stats[1].value = displayVal;
    }
  } catch (error) {
    console.error('获取在场车辆/总车位失败:', error);
  }
}

/** 请求在线摄像头和总数并回填韧性安全面板和弹窗 */
async function fetchCameraStatus() {
  try {
    const [onlineRes, totalRes] = await Promise.all([
      getOnlineCamera(),
      getTotalCamera(),
    ]);
    const onlineVal = parseInt((onlineRes?.value ?? onlineRes) as string, 10) || 0;
    const totalVal = parseInt((totalRes?.value ?? totalRes) as string, 10) || 0;
    const displayVal = `${onlineVal}/${totalVal}`;
    leftPanels[ROW_ZERO].metricRows[RES_CAMERA_IDX].value = displayVal;
    // === 同步弹窗 stats[3] ===
    const resilienceModal = modalData['resilience'];
    if (resilienceModal) {
      resilienceModal.stats[3].value = displayVal;
    }
  } catch (error) {
    console.error('获取在线摄像头/总数失败:', error);
  }
}

/** 根据使用率获取颜色 */
function getRateColor(usageRate: number): string {
  if (usageRate >= 80) return '#f87171'; // 拥挤 - 红
  if (usageRate >= 60) return '#fb923c'; // 适中 - 橙
  return '#4ade80'; // 宽松 - 绿
}

/** 请求停车场实时状态并回填会展服务弹窗 */
async function fetchParkingLotStatus() {
  try {
    const res = await getParkingLotStatus();
    const list: ParkingSpaceStatVO[] = res?.result || res?.data || res || [];
    if (Array.isArray(list) && list.length > 0) {
      const exhibitionModal = modalData['exhibition'];
      if (exhibitionModal && exhibitionModal?.rightPanel?.type === 'table') {
        const tableData = exhibitionModal?.rightPanel?.data as any;
        tableData.rows = list.map((item: ParkingSpaceStatVO) => {
          const total = item.total ?? 0;
          const used = item.used ?? 0;
          const remain = item.shengyu ?? (total - used);
          const rate = item.usageRate ?? (total > 0 ? Math.round((used / total) * 100) : 0);
          return {
            name: item.name || '--',
            total: String(total),
            used: String(used),
            remain: String(remain),
            rate: { text: rate + '%', color: getRateColor(rate) },
          };
        });
      }
    }
  } catch (error) {
    console.error('获取停车场实时状态失败:', error);
  }
}

/** 请求所有模块数据并构建跑马灯真实数据 */
async function fetchTickerData() {
  try {
    const [
      entryRes, vehicleRes, parkingRes, checkRes, cameraOnlineRes, cameraTotalRes,
      accessDeviceRes, dockingRes, collectionRes, completeRateRes,
      alarmStatsRes,
      visitorRes, pendingActRes, peakFlowRes, monthlyActRes,
      pendingExhRes, currentExhRes, completeRateExhRes, pendingSummaryRes, summarizedRes,
      todayAlarmRes, accessControlRes, accessDeviceTotalRes, accessPointTotalRes,
    ] = await Promise.all([
      getCurrentEntryCount(), getCurrentOnVehicle(), getRemainingParkingSpace(), getTodayCheckCount(), getOnlineCamera(), getTotalCamera(),
      getAccessDevice(), getSystemDocking(), getTodayCollectionAmount(), getDataCompleteRate(),
      getAlarmStatistics(),
      getTodayVisitorCount(), getPendingActivity(), getPeakFlow(), getActivityCount(),
      getPendingCount(), getCurrentExhibition(), getPreparationCompleteRate(), getPendingSummaryExhibition(), getSummarizedExhibition(),
      getTodayAlarm(), getAccessControl(), getAccessDeviceTotal(), getAccessPointTotal(),
    ]);

    // 辅助函数：安全取值
    const val = (r: any) => r?.value ?? r ?? '--';
    const num = (r: any) => {
      const v = val(r);
      const n = parseInt(v, 10);
      return isNaN(n) ? '--' : n;
    };
    const str = (r: any) => String(val(r));

    // 在场车辆/总车位
    const vehicleNum = num(vehicleRes);
    const parkingNum = num(parkingRes);
    const totalParking = (typeof vehicleNum === 'number' && typeof parkingNum === 'number') ? vehicleNum + parkingNum : '--';

    // 告警统计
    const alarmData = alarmStatsRes?.data || alarmStatsRes?.result || alarmStatsRes || {};

    // 构建跑马灯数据
    tickerData[0] = {
      dotColor: 'green',
      text: `韧性安全：当前在场人数 ${num(entryRes)}人 | 在场车辆/总车位 ${vehicleNum}/${totalParking} | 今日巡检完成 ${num(checkRes)}项 | 在线摄像头/总数 ${num(cameraOnlineRes)}/${num(cameraTotalRes)}`,
    };
    tickerData[1] = {
      dotColor: 'green',
      text: `物联网：数据采集点 ${num(accessDeviceRes).toLocaleString()}个 | 系统对接 ${num(dockingRes)}个 | 今日采集量 ${str(collectionRes)} | 数据完整率 ${str(completeRateRes)}%`,
    };
    tickerData[2] = {
      dotColor: alarmData.untreatedCount > 0 ? 'orange' : 'green',
      text: `故障告警：已处理 ${alarmData.completedCount ?? '--'}条 | 待处理 ${alarmData.untreatedCount ?? '--'}条 | 严重告警 ${alarmData.seriousCount ?? '--'}条 | 平均处理时长 ${alarmData.averageProcessingTime ?? '--'}分钟`,
    };
    tickerData[3] = {
      dotColor: 'green',
      text: `场馆运营：今日总客流 ${num(visitorRes).toLocaleString()}人次 | 待筹备活动 ${num(pendingActRes)} | 峰值客流 ${num(peakFlowRes).toLocaleString()} | 本月活动数 ${str(monthlyActRes)}`,
    };
    tickerData[4] = {
      dotColor: 'green',
      text: `会展服务：待筹备会展 ${num(pendingExhRes)} | 当前展会 ${num(currentExhRes)} | 筹备完成率 ${str(completeRateExhRes)}% | 待总结展会 ${num(pendingSummaryRes)}个 | 已总结展会 ${num(summarizedRes)}个`,
    };
    tickerData[5] = {
      dotColor: 'green',
      text: `安全防范：今日告警 ${str(todayAlarmRes)}条 | 门禁通行 ${str(accessControlRes)}人次 | 门禁设备总数 ${str(accessDeviceTotalRes)}个 | 门禁点位总数 ${str(accessPointTotalRes)}个`,
    };
  } catch (error) {
    console.error('获取跑马灯数据失败:', error);
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

// ==================== 定时刷新（1分钟一次，分批次每次10个） ====================
/** 所有需要定时调用的接口函数 */
const refreshFns: Array<() => Promise<any>> = [
  fetchTodayCheck,
  fetchCurrentEntryCount,
  fetchVehicleAndParking,
  fetchCameraStatus,
  fetchResilienceSecurityData,
  fetchPatrolPlanData,
  fetchAlarmStatistics,
  fetchIotAccessAndCollect,
  fetchOnlineRate,
  fetchSystemDocking,
  fetchIotCollectionAndCompleteRate,
  fetchExhibitionData,
  fetchVenueData,
  fetchSecurityData,
  fetchEnergyStatistics,
  fetchAirConditioningUnitStatistics,
  fetchFreshAirStatistics,
  fetchPowerStatistics,
  fetchTickerData,
];

const BATCH_SIZE = 10;
const REFRESH_INTERVAL = 60 * 1000; // 1分钟
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** 分批次执行所有接口：每次 BATCH_SIZE 个，间隔 500ms */
async function runBatchRefresh() {
  for (let i = 0; i < refreshFns.length; i += BATCH_SIZE) {
    const batch = refreshFns.slice(i, i + BATCH_SIZE);
    // 并发执行当前批次的接口
    await Promise.allSettled(batch.map((fn) => fn()));
    // 批次之间间隔 500ms，避免瞬间并发过多
    if (i + BATCH_SIZE < refreshFns.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(runBatchRefresh, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

onMounted(() => {
  nextTick(calcScale);
  window.addEventListener('resize', onResize);
  // 请求韧性安全实时数据
  fetchTodayCheck();
  fetchCurrentEntryCount();
  fetchVehicleAndParking();
  fetchCameraStatus();
  fetchResilienceSecurityData();
  fetchPatrolPlanData();
  // 请求告警统计数据
  fetchAlarmStatistics();
  // 请求物联网实时数据
  fetchIotAccessAndCollect();
  fetchOnlineRate();
  fetchSystemDocking();
  fetchIotCollectionAndCompleteRate();
  // 请求会展服务实时数据
  fetchExhibitionData();
  // 请求场馆运营实时数据
  fetchVenueData();
  // 请求安全防范实时数据
  fetchSecurityData();
  // 请求能耗统计，回填 KPI 数据
  fetchEnergyStatistics();
  // 请求空调机组统计，回填右侧面板
  fetchAirConditioningUnitStatistics();
  // 请求新风机组统计，回填右侧面板
  fetchFreshAirStatistics();
  // 请求配电系统统计，回填右侧面板
  fetchPowerStatistics();
  // 请求跑马灯真实数据
  fetchTickerData();
  // 启动定时刷新
  startAutoRefresh();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (resizeTimer) clearTimeout(resizeTimer);
  // 停止定时刷新
  stopAutoRefresh();
  // 恢复 html/body 的 overflow，避免大屏 overflow:hidden 残留导致操作台无法滚动
  document.documentElement.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
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
  grid-template-columns: 386px 1088px 386px;
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
