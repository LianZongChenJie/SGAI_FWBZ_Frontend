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
} from './index.api';
import type { CountVO, ParkingSpaceStatVO, DeviceTypeStatusVO, StatusCountVO, InterfaceInfo } from './index.api';
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

/** 请求设备状态统计并回填韧性安全弹窗右栏表格 */
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
    // 当前在场 (metricCards[0])
    const onsiteVal = onsiteRes?.value ?? onsiteRes;
    if (onsiteVal != null) {
      const num = parseInt(onsiteVal, 10) || 0;
      rightPanels[VENUE_INDEX].metricCards[VENUE_ONSITE_IDX].value = String(num);
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
      // 峰值客流 (metricRows[2]) → stats[2]
      const peakFlowVal = peakFlowRes?.value ?? peakFlowRes;
      if (peakFlowVal != null) {
        const num = parseInt(peakFlowVal, 10) || 0;
        const displayVal = num.toLocaleString();
        rightPanels[VENUE_INDEX].metricRows[2].value = displayVal;
        venueModal.stats[2].value = displayVal;
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
  // 点韧性安全面板时先请求设备状态统计再打开弹窗
  if (key === 'resilience') {
    await fetchDeviceStatusStatistics();
    modalRef.value?.open(key, modalData);
  } else if (key === 'alarm') {
    // 点故障告警面板时先请求告警记录、统计数据和趋势再打开弹窗
    const [records, stats, trend] = await Promise.all([fetchAlarmRecords(), fetchAlarmStatistics(), fetchAlarmTrend()]);
    modalRef.value?.open(key, modalData, records, stats, trend);
  } else if (key === 'exhibition') {
    // 会展服务弹窗：先请求停车场实时状态再打开
    await fetchParkingLotStatus();
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

onMounted(() => {
  nextTick(calcScale);
  window.addEventListener('resize', onResize);
  // 请求韧性安全实时数据
  fetchTodayCheck();
  fetchCurrentEntryCount();
  fetchVehicleAndParking();
  fetchCameraStatus();
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
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (resizeTimer) clearTimeout(resizeTimer);
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
