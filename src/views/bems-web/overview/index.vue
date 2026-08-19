<template>
  <div class="dashboard-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        label="今日场馆客流"
        :value="statData.todayVisitors"
        trend="up"
        color="blue"
        :icon="CrowdIcon"
      />
      <StatCard
        label="设备在线率"
        :value="statData.deviceOnlineRate"
        trend="up"
        color="green"
        :icon="ThunderIcon"
      />
      <StatCard
        label="今日能耗 (kWh)"
        :value="statData.todayEnergy"
        trend="down"
        color="orange"
        :icon="EnergyIcon"
      />
      <StatCard
        label="待处理告警"
        :value="statData.pendingAlerts"
        trend="down"
        color="red"
        :icon="AlertIcon"
      />
    </div>

    <!-- 快捷入口 -->
    <div class="quick-links">
      <div class="quick-link" v-for="link in quickLinks" :key="link.title" @click="handleQuickLink(link)">
        <div class="quick-link-icon" :style="{ background: link.bgColor, color: link.iconColor }">
          <component :is="link.icon" />
        </div>
        <div class="quick-link-title">{{ link.title }}</div>
      </div>
    </div>

    <!-- 能耗趋势分析 + 能源结构占比 -->
    <div class="dashboard-charts">
      <!-- 能耗趋势分析 -->
      <div class="card trend-analysis-card">
        <div class="card-header">
          <div class="card-title-wrap">
            <span class="card-title">📈 能耗趋势分析</span>
          </div>
          <div class="card-actions">
            <a-radio-group v-model:value="dateType" button-style="solid">
              <a-radio-button value="date">日</a-radio-button>
              <a-radio-button value="month">月</a-radio-button>
              <a-radio-button value="year">年</a-radio-button>
            </a-radio-group>
            <!-- <span class="date-label">日期：</span>
            <a-date-picker v-model:value="date" :picker="dateType" valueFormat="YYYY-MM-DD" />
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button @click="handleExport">导出</a-button> -->
          </div>
        </div>
        <div class="card-body">
          <PointDataStatistics
            ref="pointDataStatisticsRef"
            v-model:dateType="dateType"
            v-model:date="date"
            v-model:time="time"
            hide-tree
            hide-switch
            mix-chart
          />
        </div>
      </div>

      <!-- 能源结构占比 -->
      <div class="card">
        <div class="card-header">
          <h3>🥧 能源结构占比</h3>
          <div class="venue-electricity-tabs">
            <button
              v-for="tab in structureTabs"
              :key="tab.key"
              :class="['venue-electricity-tab', { active: structureActive === tab.key }]"
              @click="handleStructureTabChange(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="card-body">
          <div v-show="structureLoading" class="chart-placeholder">
            <a-spin />
            <div class="chart-text">加载中...</div>
          </div>
          <div
            v-show="!structureLoading && structureChartData.length === 0"
            class="chart-placeholder"
          >
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">暂无数据</div>
          </div>
          <div v-show="!structureLoading && structureChartData.length > 0" ref="structureChartRef" class="structure-chart"></div>
        </div>
      </div>
    </div>

    <!-- 两栏布局：最新告警 + 今日会展活动 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3>🚨 最新告警</h3>
          <a-button size="small" @click="handleViewAllAlerts">查看全部</a-button>
        </div>
        <div class="card-body">
          <a-spin :spinning="alertLoading" tip="加载中...">
            <div v-if="alertList.length === 0 && !alertLoading" class="empty-state">暂无待处理告警</div>
            <div class="alert-list" v-else>
              <div class="alert-card" :class="item.level" v-for="item in alertList" :key="item.id">
                <div class="alert-icon">
                  <AlertVeryDangerIcon v-if="item.level === 'veryDanger'" />
                  <AlertDangerIcon v-else-if="item.level === 'danger'" />
                  <AlertInfoIcon v-else />
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ item.description }} <span class="category-tag">{{ item.alarmCategoryName }}</span> <span class="level-tag" :class="item.level">{{ item.levelLabel }}</span></div>
                  <div class="alert-desc">{{ item.title }}</div>
                  <div class="alert-time">{{ item.time }} | 持续 {{ item.duration }}</div>
                  <div class="alert-actions">
                    <a-button class="confirm-btn" :class="'confirm-' + item.level" size="small" @click="handleConfirm(item)">确认并处理</a-button>
                    <a-button size="small" @click="handleTransfer(item)">转工单</a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-spin>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>📅 今日会展活动</h3>
          <span class="tag tag-green">进行中</span>
        </div>
        <div class="card-body">
          <div v-if="todayEvents.length === 0" class="empty-state">今日暂无会展活动</div>
          <div class="timeline" v-else>
            <div class="timeline-item" v-for="event in todayEvents" :key="event.title">
              <div class="timeline-time">{{ event.time }}</div>
              <div class="timeline-content">
                <strong>{{ event.title }}</strong><br />
                {{ event.location }} | 预计客流 {{ event.visitors }}人 | 状态: <span class="status-text" :class="event.status">{{ event.statusLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备总览 -->
    <div class="card">
      <div class="card-header overview-header">
        <h3>📡 子系统对接状态</h3>
        <span class="tag tag-green">运行正常</span>
      </div>
      <div class="card-body">
        <div class="device-grid">
          <DeviceCard
            v-for="(item, index) in displayData"
            :key="index"
            :title="item.title"
            :meta="item.meta"
            :icon="item.icon"
            :icon-bg="item.iconBg"
            :icon-color="item.iconColor"
            :stats="item.stats"
            @click="handleCardClick(item)"
          />
        </div>
      </div>
    </div>

    <!-- 转工单弹窗 -->
    <a-modal
      v-model:open="transferVisible"
      title="📝 转工单"
      width="800px"
      :mask-closable="false"
      @ok="handleTransferSave"
      ok-text="提交"
      cancel-text="取消"
    >
      <!-- 填写区 -->
      <div class="transfer-actions">
        <div class="transfer-actions__item">
          <span class="transfer-actions__label">联系人</span>
          <a-input v-model:value="transferForm.contractPeople" placeholder="请输入联系人" style="width: 200px" />
        </div>
        <div class="transfer-actions__item">
          <span class="transfer-actions__label">联系电话</span>
          <a-input v-model:value="transferForm.contractPhone" placeholder="请输入联系电话" style="width: 200px" />
        </div>
      </div>

      <!-- 只读信息 -->
      <a-descriptions bordered :column="2" size="small" style="margin-top: 16px">
        <a-descriptions-item label="记录id">{{ transferForm.recordId || '--' }}</a-descriptions-item>
        <a-descriptions-item label="空间id">{{ transferForm.spaceId || '--' }}</a-descriptions-item>
        <a-descriptions-item label="空间全称">{{ transferForm.address || '--' }}</a-descriptions-item>
        <a-descriptions-item label="区域名称">{{ transferForm.spaceName || '--' }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ transferForm.description || '--' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { StatCard, DeviceCard } from '/@/views/bems-web/components'
import { getTodayExhibitionActivity, getTodayVisitorCount, getAlarmStatistics } from './index.api'
import type { ActiveMeetInfo } from './index.api'
import { getEquipmentOverview } from '/@/views/bems-web/energy/operational-support/elements/overviewTab/index.api'
import {
  getAlarmRecordsListApi,
  confirmAlarmRecordApi,
  transferEventAlarmRecordApi,
} from '/@/views/bems-web/alert/alarmManagement/Standardized.api'
import { useECharts } from '/@/hooks/web/useECharts'
import {
  findDayByConfig,
  findMonthByConfig,
  findYearByConfig,
} from '/@/views/bems-web/energy/energy-metering/elements/overviewTab/index.api'
import {
  PieChartOutlined,
} from '@ant-design/icons-vue'
import PointDataStatistics from '/@/views/bems-web/energy/energy-metering/elements/analysisTab/pointDataStatistics/index.vue'

// 自定义 emoji 图标组件（统计卡片）
const CrowdIcon = () => h('span', { style: 'font-size: 20px;' }, '👥')
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const EnergyIcon = () => h('span', { style: 'font-size: 20px;' }, '🔋')
const AlertIcon = () => h('span', { style: 'font-size: 20px;' }, '🚨')
// 自定义 emoji 图标组件（快捷入口）
const ShieldIcon = () => h('span', { style: 'font-size: 20px;' }, '🛡️')
const EcoIcon = () => h('span', { style: 'font-size: 20px;' }, '🌿')
const AntennaIcon = () => h('span', { style: 'font-size: 20px;' }, '📡')
const SirenIcon = () => h('span', { style: 'font-size: 20px;' }, '🔔')
const StadiumIcon = () => h('span', { style: 'font-size: 20px;' }, '🏟️')
const CircusIcon = () => h('span', { style: 'font-size: 20px;' }, '🎪')

// 自定义 emoji 图标组件
const HeatMeterIcon = () => h('span', { style: 'font-size: 20px;' }, '🌡️')
const AirConditionerIcon = () => h('span', { style: 'font-size: 20px;' }, '❄️')
const FreshAirUnitIcon = () => h('span', { style: 'font-size: 20px;' }, '🌀')
const ElectricMeterIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const PressureTransmitterIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const WaterMeterIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')
const SumpPitIcon = () => h('span', { style: 'font-size: 20px;' }, '🕳️')
const FlowSensorIcon = () => h('span', { style: 'font-size: 20px;' }, '📏')
const HeatRecoveryIcon = () => h('span', { style: 'font-size: 20px;' }, '🔄')
const ExhaustFanIcon = () => h('span', { style: 'font-size: 20px;' }, '💨')
const SupplyFanIcon = () => h('span', { style: 'font-size: 20px;' }, '🌬️')
const FanCoilIcon = () => h('span', { style: 'font-size: 20px;' }, '🎛️')
const TerminalElectricIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const TerminalWaterIcon = () => h('span', { style: 'font-size: 20px;' }, '🚰')

// ===== 图标配置 =====
const iconConfig: Record<string, { icon: any; iconBg: string; iconColor: string }> = {
  '热量表': { icon: HeatMeterIcon, iconBg: '#fff2f0', iconColor: '#ff4d4f' },
  '空调机组': { icon: AirConditionerIcon, iconBg: '#e6f4ff', iconColor: '#1677ff' },
  '新风机组': { icon: FreshAirUnitIcon, iconBg: '#f9f0ff', iconColor: '#722ed1' },
  '电表': { icon: ElectricMeterIcon, iconBg: '#fffbe6', iconColor: '#faad14' },
  '压力变送器': { icon: PressureTransmitterIcon, iconBg: '#e6fffb', iconColor: '#13c2c2' },
  '水表': { icon: WaterMeterIcon, iconBg: '#e6f7ff', iconColor: '#0099cc' },
  '集水坑': { icon: SumpPitIcon, iconBg: '#f0f5ff', iconColor: '#2f54eb' },
  '流量传感器': { icon: FlowSensorIcon, iconBg: '#f6ffed', iconColor: '#52c41a' },
  '热回收机组': { icon: HeatRecoveryIcon, iconBg: '#fff7e6', iconColor: '#fa8c16' },
  '排风机': { icon: ExhaustFanIcon, iconBg: '#f5f5f5', iconColor: '#595959' },
  '送风机': { icon: SupplyFanIcon, iconBg: '#e6f7ff', iconColor: '#1890ff' },
  '风机盘管': { icon: FanCoilIcon, iconBg: '#f9f0ff', iconColor: '#9254de' },
  '末端电表': { icon: TerminalElectricIcon, iconBg: '#fff1f0', iconColor: '#cf1322' },
  '末端水表': { icon: TerminalWaterIcon, iconBg: '#e6fffb', iconColor: '#006d75' },
}
defineOptions({ name: 'DashboardPage' })

const router = useRouter()

// ===== 统计数据 =====
const statData = ref<{
  todayVisitors: string | number
  deviceOnlineRate: string | number
  todayEnergy: string | number
  pendingAlerts: string | number
}>({
  todayVisitors: '--',
  deviceOnlineRate: '98.6%',
  todayEnergy: '45,230',
  pendingAlerts: '--',
})

/** 加载统计数据（今日场馆客流 + 待处理告警） */
const fetchStatData = async () => {
  try {
    const [visitorRes, alarmRes] = await Promise.all([
      getTodayVisitorCount(),
      getAlarmStatistics(),
    ])
    // 今日场馆客流
    const visitorVal = visitorRes?.value ?? visitorRes
    if (visitorVal != null) {
      const num = parseInt(visitorVal, 10) || 0
      statData.value.todayVisitors = num.toLocaleString()
    }
    // 待处理告警（取 untreatedCount 字段）
    if (alarmRes != null) {
      const num = alarmRes.untreatedCount ?? 0
      statData.value.pendingAlerts = num
    }
  } catch {
    // 静默处理
  }
}

// ===== 快捷入口 =====
const quickLinks = [
  { title: '韧性安全', icon: ShieldIcon, bgColor: '#ebf8ff', iconColor: '#3182ce', route: '/fwbz/safety/security' },
  { title: '能源机电', icon: EcoIcon, bgColor: '#f0fff4', iconColor: '#38a169', route: '/fwbz/energy/operational' },
  { title: '物联网', icon: AntennaIcon, bgColor: '#fffaf0', iconColor: '#dd6b20', route: '/fwbz/iot/interface' },
  { title: '故障告警', icon: SirenIcon, bgColor: '#fff5f5', iconColor: '#e53e3e', route: '/fwbz/alert/setting' },
  { title: '场馆运营', icon: StadiumIcon, bgColor: '#faf5ff', iconColor: '#805ad5', route: '/fwbz/venue/flow' },
  { title: '会展服务', icon: CircusIcon, bgColor: '#e6fffa', iconColor: '#00b5d8', route: '/fwbz/event/pre' },
]

// ===== 能耗趋势分析 =====
const dateType = ref<string>('month')
const date = ref<string>()
const time = ref<string>()
const pointDataStatisticsRef = ref<InstanceType<typeof PointDataStatistics>>()

const handleQuery = () => {
  pointDataStatisticsRef.value?.findData()
}

const handleExport = () => {
  pointDataStatisticsRef.value?.handleExport()
}

// ===== 告警图标 =====
const AlertVeryDangerIcon = () => h('span', { style: 'font-size: 18px;' }, '🚨')
const AlertDangerIcon = () => h('span', { style: 'font-size: 18px;' }, '⚠️')
const AlertInfoIcon = () => h('span', { style: 'font-size: 18px;' }, '💡')

// ===== 告警列表 =====
interface AlertRecord {
  id: string
  _record: any
  level: string
  levelLabel: string
  description: string
  title: string
  time: string
  duration: string
  alarmCategoryName: string
}

const alertList = ref<AlertRecord[]>([])
const alertLoading = ref(false)

// 报警等级文本 → level class 映射
const levelClassMap: Record<string, string> = { '非常紧急': 'veryDanger', '紧急': 'danger' }

// 计算持续时间
const getDuration = (alarmTime: string): string => {
  if (!alarmTime) return ''
  const diff = Date.now() - new Date(alarmTime).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时${minutes % 60}分钟`
  const days = Math.floor(hours / 24)
  return `${days}天${hours % 24}小时`
}

// API 记录 → 卡片格式映射
const mapRecordToCard = (record: any): AlertRecord => {
  const levelName: string = record.alarmLevelName || ''
  return {
    id: record.id,
    _record: record,
    level: levelClassMap[levelName] || 'info',
    levelLabel: levelName,
    title: record.alarmContent || '',
    description: `设备: ${record.deviceName || '-'} | 位置: ${record.spaceName || '-'}`,
    time: record.alarmTime || '',
    duration: getDuration(record.alarmTime),
    alarmCategoryName: record.alarmCategoryName || '-',
  }
}

const fetchAlertList = async () => {
  alertLoading.value = true
  try {
    const res = await getAlarmRecordsListApi({ alarmStatus: '1', pageNo: 1, pageSize: 3 })
    const records = res?.records || res?.data?.records || res?.data || []
    alertList.value = (Array.isArray(records) ? records : []).slice(0, 3).map(mapRecordToCard)
  } catch {
    // 静默处理
  } finally {
    alertLoading.value = false
  }
}

// 确认并处理
const handleConfirm = async (alert: AlertRecord) => {
  try {
    await confirmAlarmRecordApi({ id: alert.id })
    message.success('确认成功')
    // 刷新最新告警列表和统计数据
    fetchAlertList()
    // fetchStatData()
  } catch {
    // defHttp 已自动提示错误信息
  }
}

// 转工单弹窗
const transferVisible = ref(false)
const transferForm = reactive({
  recordId: '',
  spaceId: '',
  address: '',
  spaceName: '',
  description: '',
  contractPeople: '',
  contractPhone: '',
})

// 打开转工单弹窗
const handleTransfer = (alert: AlertRecord) => {
  const record = alert._record || {}
  transferForm.recordId = alert.id
  transferForm.spaceId = record.spaceId ?? ''
  transferForm.address = ''
  transferForm.spaceName = record.spaceName ?? ''
  transferForm.description = record.alarmContent ?? ''
  transferForm.contractPeople = ''
  transferForm.contractPhone = ''
  transferVisible.value = true
}

// 提交转工单
const handleTransferSave = async () => {
  try {
    await transferEventAlarmRecordApi({ ...transferForm })
    message.success('转工单成功')
    transferVisible.value = false
    // 刷新最新告警列表
    fetchAlertList()
  } catch {
    // defHttp 已自动提示错误信息
  }
}

// ===== 今日会展活动 =====
interface TodayEvent {
  id: number | string
  time: string
  title: string
  location: string
  visitors: string
  status: string
  statusLabel: string
}

const todayEvents = ref<TodayEvent[]>([])

const fetchTodayEvents = async () => {
  try {
    const res = await getTodayExhibitionActivity({
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
    })
    const records = res?.records || []
    const now = dayjs()
    todayEvents.value = records.map((item: ActiveMeetInfo) => {
      const startStr = item.startTime ? item.startTime.substring(0, 5) : ''
      const endStr = item.endTime ? item.endTime.substring(0, 5) : ''
      const timeRange = startStr && endStr ? `${startStr} - ${endStr}` : (startStr || endStr || '--')

      // 根据当前时间与活动时间计算状态
      let status = 'info'
      let statusLabel = '待开始'
      if (startStr && endStr) {
        const todayDate = dayjs().format('YYYY-MM-DD')
        const start = dayjs(`${todayDate} ${startStr}:00`)
        const end = dayjs(`${todayDate} ${endStr}:00`)
        if (now.isAfter(end)) {
          status = 'info'
          statusLabel = '已结束'
        } else if (now.isAfter(start) && now.isBefore(end)) {
          status = 'normal'
          statusLabel = '进行中'
        } else if (now.isBefore(start)) {
          status = 'warning'
          statusLabel = '筹备中'
        }
      }

      const location = [item.venueName, item.venueFloors].filter(Boolean).join(' ') || '--'

      return {
        id: item.id || item.activeName || '',
        time: timeRange,
        title: item.activeName || '--',
        location,
        visitors: item.peopleQuantity != null ? String(item.peopleQuantity) : '--',
        status,
        statusLabel,
      }
    })
  } catch (error) {
    console.error('获取今日会展活动失败:', error)
  }
}

// ===== 设备总览 =====
const allDeviceData = ref<any[]>([])
const equipmentLoading = ref(false)

/** 加载设备总览数据 */
const loadEquipmentOverview = async () => {
  equipmentLoading.value = true
  try {
    const res = await getEquipmentOverview()
    const list = res?.records || res?.data?.records || res?.data || res || []
    const items = Array.isArray(list) ? list : []
    allDeviceData.value = items.map((item: any) => {
      const categoryName = item.category?.categoryName || item.title || item.name || ''
      const cfg = iconConfig[categoryName] || { icon: AirConditionerIcon, iconBg: '#e6f4ff', iconColor: '#1677ff' }
      return {
        title: categoryName,
        meta: item.meta || item.system || '',
        icon: cfg.icon,
        iconBg: cfg.iconBg,
        iconColor: cfg.iconColor,
        stats: item.stats || [
          { label: '总数', value: item.count ?? 0 },
          { label: '运行', value: item.online ?? 0 },
          { label: '故障', value: item.offline ?? 0, highlight: (item.offline ?? 0) > 0 },
        ],
        system: item.system || item.meta || '',
        venue: item.venue || '',
      }
    })
  } catch {
    // 静默处理
  } finally {
    equipmentLoading.value = false
  }
}

/** 设备数据 */
const displayData = computed(() => allDeviceData.value)

// ===== 能源结构占比饼图 =====
const structureChartRef = ref<HTMLDivElement>()
const structureChartData = ref<{ name: string; value: number }[]>([])
const structureLoading = ref(false)
const structureChartInstance = ref<any>(null)

const structureTabs: { key: 'day' | 'month' | 'year'; label: string }[] = [
  { key: 'day', label: '日' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
]
const structureActive = ref<'day' | 'month' | 'year'>('month')

const handleStructureTabChange = (key: 'day' | 'month' | 'year') => {
  structureActive.value = key
  loadStructureData(key)
}

const PIE_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']

/** 加载用能结构占比数据 */
const loadStructureData = async (type: 'day' | 'month' | 'year' = 'month') => {
  structureLoading.value = true
  try {
    const apiMap = {
      day: findDayByConfig,
      month: findMonthByConfig,
      year: findYearByConfig,
    }
    const res = await apiMap[type]()
    const chatData = res?.chat || res?.result?.chat || res?.data?.chat || {}
    const seriesList = (chatData.chatSeriesList || chatData.seriesList || []) as any[]
    const filteredList = seriesList.filter((item: any) => item.name !== '合计')
    const pieData = filteredList.map((item: any) => ({
      name: item.name,
      value: Array.isArray(item.data) && item.data.length > 0 ? Number(item.data[0]) || 0 : 0,
    }))
    structureChartData.value = pieData
    structureLoading.value = false
    await nextTick()
    if (pieData.length > 0) {
      renderStructureChart(pieData)
    }
  } catch (e) {
    console.error('加载用能结构数据失败:', e)
    structureLoading.value = false
  }
}

/** 渲染用能结构饼图 */
const renderStructureChart = (data: { name: string; value: number }[]) => {
  if (!structureChartRef.value) return
  try {
    if (!structureChartInstance.value) {
      const { setOptions } = useECharts(structureChartRef as any)
      structureChartInstance.value = setOptions
    }
    structureChartInstance.value({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `<div style="font-weight:600;margin-bottom:4px;">${params.name}</div>
          <div>占比：<span style="font-weight:600;">${params.percent}%</span></div>`
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#666', fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
          scaleSize: 10,
        },
        data: data.map((item, idx) => ({
          ...item,
          itemStyle: { color: PIE_COLORS[idx % PIE_COLORS.length] },
        })),
      },
    ],
    })
  } catch (e) {
    console.error('渲染用能结构饼图失败:', e)
  }
}

const handleCardClick = (item: any) => {
  console.log('点击卡片:', item.title)
}

// ===== 方法 =====
const handleQuickLink = (link: { title: string; route: string }) => {
  console.log('Navigate to:', link.route)
  router.push({ path: link.route })
}

const handleViewAllAlerts = () => {
  router.push({ path: '/fwbz/alert/handle' })
}

onMounted(() => {
  fetchStatData()
  fetchTodayEvents()
  fetchAlertList()
  loadEquipmentOverview()
  loadStructureData('month')
})
</script>

<style scoped lang="less">
.dashboard-page {
  padding: 0;
}

// 统计卡片行
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

// 快捷入口
.quick-links {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  .quick-link {
    background: white;
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .quick-link-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin: 0 auto 12px;
    }

    .quick-link-title {
      font-size: 13px;
      font-weight: 500;
      color: #2d3748;
    }
  }
}

// 图表区域
.dashboard-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

// 卡片
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;

  .card-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }

    .tag-green { background: #c6f6d5; color: #22543d; }
    .tag-blue { background: #bee3f8; color: #2a4365; }
    .tag-orange { background: #feebc8; color: #744210; }
    .tag-red { background: #fed7d7; color: #742a2a; }
    .tag-purple { background: #e9d8fd; color: #553c9a; }

    .btn-group {
      display: flex;
      gap: 8px;
    }
  }

  .card-body {
    padding: 22px;
  }
}

// 两栏布局
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

// 图表占位
.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 280px;
  padding: 30px;

  .chart-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .chart-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }

  .chart-sub {
    font-size: 12px;
    color: #a0aec0;
    margin-top: 8px;
  }
}

// 时间线
.timeline {
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }

  .timeline-item {
    position: relative;
    padding-bottom: 20px;

    &:last-child {
      padding-bottom: 0;
    }

    &::before {
      content: '';
      position: absolute;
      left: -22px;
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #3182ce;
      border: 2px solid white;
      box-shadow: 0 0 0 2px #3182ce;
    }

    .timeline-time {
      font-size: 12px;
      color: #a0aec0;
      margin-bottom: 4px;
    }

    .timeline-content {
      font-size: 13px;
      color: #2d3748;
      line-height: 1.6;

      .status-text {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.normal { background: #c6f6d5; color: #22543d; }
        &.warning { background: #feebc8; color: #744210; }
        &.danger { background: #fed7d7; color: #742a2a; }
        &.info { background: #bee3f8; color: #2a4365; }
      }
    }
  }
}

// 设备总览头部 + 状态图
.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #52c41a;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 9999px;
  }
}

// 设备卡片网格
.device-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

// 告警列表卡片
.empty-state {
  text-align: center;
  color: #a0aec0;
  padding: 40px 0;
  font-size: 14px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-card {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #fafafa;
  border-left: 4px solid #d9d9d9;
  transition: all 0.3s;

  &:hover {
    background: #f0f0f0;
  }

  &.veryDanger {
    border-left-color: #ff4d4f;
    background: #fff2f0;
  }

  &.danger {
    border-left-color: #fa8c16;
    background: #fff7e6;
  }

  &.info {
    border-left-color: #1677ff;
    background: #e6f4ff;
  }

  .alert-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert-content {
    flex: 1;
    min-width: 0;

    .alert-title {
      font-size: 13px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 4px;

      .category-tag {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        background: #e2e8f0;
        color: #4a5568;
        font-weight: 400;
      }

      .level-tag {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 400;

        &.veryDanger {
          background: #ffccc7;
          color: #cf1322;
        }

        &.danger {
          background: #ffe7ba;
          color: #d46b08;
        }

        &.info {
          background: #bae0ff;
          color: #0958d9;
        }
      }
    }

    .alert-desc {
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .alert-time {
      font-size: 11px;
      color: #a0aec0;
      margin-bottom: 10px;
    }

    .alert-actions {
      display: flex;
      gap: 8px;

      .confirm-btn {
        &.confirm-veryDanger {
          background: #ff4d4f;
          border-color: #ff4d4f;
          color: #fff;

          &:hover {
            background: #ff7875;
            border-color: #ff7875;
          }
        }

        &.confirm-danger {
          background: #fa8c16;
          border-color: #fa8c16;
          color: #fff;

          &:hover {
            background: #ffa940;
            border-color: #ffa940;
          }
        }

        &.confirm-info {
          background: #1677ff;
          border-color: #1677ff;
          color: #fff;

          &:hover {
            background: #4096ff;
            border-color: #4096ff;
          }
        }
      }
    }
  }
}

// 转工单填写区
.transfer-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 12px 16px;
  background: #f7f9fc;
  border: 1px solid #e5e6eb;
  border-radius: 8px;

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    flex-shrink: 0;
  }
}

// 能源结构占比饼图
.structure-chart {
  width: 100%;
  height: 320px;
}

.venue-electricity-tabs {
  display: inline-flex;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.venue-electricity-tab {
  padding: 4px 14px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  background: #ffffff;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #1890ff;
  }

  &.active {
    color: #ffffff;
    background: #1890ff;
  }

  &:not(:last-child) {
    border-right: 1px solid #d9d9d9;
  }
}

// 能耗趋势分析卡片（在 dashboard-charts 网格内）
.trend-analysis-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid #f0f0f0;

    .card-title-wrap {
      display: flex;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .date-label {
        font-size: 14px;
        color: #595959;
        margin-left: 8px;
      }

      :deep(.ant-radio-button-wrapper) {
        color: #595959;
      }

      :deep(.ant-radio-button-wrapper-checked) {
        color: #fff;
        background-color: #1890ff;
        border-color: #1890ff;
      }

      :deep(.ant-btn-primary) {
        background-color: #1890ff;
        border-color: #1890ff;
      }
    }
  }

  .card-body {
    min-height: 120px;
    padding: 22px;

    :deep(.point-data-statistics) {
      height: calc(100vh - 450px);
    }
  }
}
</style>