<template>
  <div class="venue-flow-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in statCards"
        :key="index"
        :label="item.title"
        :value="item.value"
        :change-text="item.context"
        :color="cardConfig[index]?.color || 'blue'"
        :icon="cardConfig[index]?.icon"
      />
    </div>

    <!-- 两栏布局：热力图 + 客流趋势 -->
    <div class="two-col">
      <div class="card" :class="{ 'heatmap-fullscreen': heatmapFullscreen }">
        <div class="card-header">
          <h3><ClockCircleOutlined /> 实时客流热力图</h3>
          <div class="header-right">
            <a-button size="small" @click="toggleHeatmapFullscreen">
              <FullscreenExitOutlined v-if="heatmapFullscreen" />
              <FullscreenOutlined v-else />
              <!-- {{ heatmapFullscreen ? '退出全屏' : '全屏预览' }} -->
            </a-button>
          </div>
        </div>
        <div class="card-body" :class="{ 'heatmap-fullscreen-body': heatmapFullscreen }">
          <a-spin :spinning="heatmapLoading" :class="{ 'spin-fullscreen': heatmapFullscreen }">
            <FlowHeatmapMapView :data="heatmapData" :fullscreen="heatmapFullscreen" />
          </a-spin>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><BarChartOutlined /> 各场馆客流趋势</h3>
          <div class="header-right">
            <a-radio-group v-model:value="trendPeriod" button-style="solid" size="small" @change="handleTrendChange">
              <a-radio-button :value="0">今日</a-radio-button>
              <a-radio-button :value="1">本周</a-radio-button>
              <a-radio-button :value="2">本月</a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <div class="card-body">
          <a-spin :spinning="trendLoading">
            <div ref="trendChartRef" class="trend-chart"></div>
          </a-spin>
        </div>
      </div>
    </div>

    <!-- 各场馆客流统计表格 -->
    <div class="card">
      <div class="card-header">
        <h3><BarChartOutlined /> 各场馆客流统计</h3>
        <div class="filter-bar">
          <a-date-picker
            v-model:value="filterDate"
            style="width: 160px"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            @change="handleSearch"
          />
          <a-select
            v-model:value="filterVenueId"
            style="width: 140px"
            placeholder="全部场馆"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option v-for="item in venueOptions" :key="item.id" :value="item.id">{{ item.venueName }}</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 查询</a-button>
          <a-button type="primary" :loading="flowExportLoading" @click="handleFlowExport"><DownloadOutlined /> 导出</a-button>
          <button class="collapse-btn" @click="flowCollapsed = !flowCollapsed">
            <CaretDownOutlined v-if="!flowCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!flowCollapsed" class="card-body">
        <a-table
          :columns="flowColumns"
          :data-source="flowData"
          :loading="flowLoading"
          :pagination="false"
          row-key="venueId"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'compareRate'">
              <span :style="{ color: record.compareRate?.includes('↑') ? '#38a169' : '#e53e3e' }">
                {{ record.compareRate }}
              </span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === 1 ? 'normal' : 'danger'">
                {{ record.statusLabel || (record.status === 1 ? '正常' : '异常') }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import dayjs from 'dayjs'
import { StatCard } from '/@/views/bems-web/components'
import { useECharts } from '/@/hooks/web/useECharts'
import { getFlowSummary, getFlowList, getFlowTrend, getHeatmap, exportData } from './index.api'
import type { StatItem, VenueFlowVO, VenueHeatmapItemVO } from './index.api'
import { getVenueList } from '../venueScheduling/index.api'
import type { VenueItem } from '../venueScheduling/index.api'
import {
  TeamOutlined, UserOutlined, RiseOutlined, ClockCircleOutlined,
  BarChartOutlined, SearchOutlined, FullscreenOutlined, FullscreenExitOutlined,
  CaretDownOutlined, CaretUpOutlined, DownloadOutlined,
} from '@ant-design/icons-vue'
import FlowHeatmapMapView from './FlowHeatmapMapView.vue'

defineOptions({ name: 'VenueFlowPage' })

// 折叠状态
const flowCollapsed = ref(false)

// ===== 卡片配置 =====
const cardConfig = [
  { color: 'blue' as const, icon: TeamOutlined },
  { color: 'green' as const, icon: UserOutlined },
  { color: 'orange' as const, icon: RiseOutlined },
  { color: 'purple' as const, icon: ClockCircleOutlined },
]

// ===== 统计卡片 =====
const statCards = ref<StatItem[]>([])

const fetchStatCards = async () => {
  try {
    const res = await getFlowSummary()
    statCards.value = res || []
  } catch (error) {
    console.error('获取客流汇总卡片失败:', error)
  }
}

// ===== 场馆下拉 =====
const venueOptions = ref<VenueItem[]>([])

const fetchVenueOptions = async () => {
  try {
    const res = await getVenueList()
    venueOptions.value = res || []
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

// ===== 客流统计表格 =====
const filterDate = ref<string>(dayjs().format('YYYY-MM-DD'))
const filterVenueId = ref<number| string>('')
const flowData = ref<VenueFlowVO[]>([])
const flowLoading = ref(false)

const flowColumns = [
  { title: '序号', key: 'index', width: 70, customRender: ({ index }) => index + 1 },
  { title: '场馆', dataIndex: 'venueName', key: 'venueName', width: 120 },
  { title: '今日进场', dataIndex: 'todayInCount', key: 'todayInCount', width: 100 },
  { title: '当前在场', dataIndex: 'todayNowCount', key: 'todayNowCount', width: 100 },
  { title: '峰值人数', dataIndex: 'maxCount', key: 'maxCount', width: 100 },
  { title: '峰值时间', dataIndex: 'maxTime', key: 'maxTime', width: 100 },
  { title: '平均停留', dataIndex: 'averageDuration', key: 'averageDuration', width: 100 },
  { title: '较昨日', dataIndex: 'compareRate', key: 'compareRate', width: 100 },
  { title: '状态', key: 'status', width: 80 },
]

const fetchFlowData = async () => {
  flowLoading.value = true
  try {
    const params: Record<string, any> = { date: filterDate.value }
    if (filterVenueId.value !== undefined) params.venueId = filterVenueId.value
    const res = await getFlowList(params)
    flowData.value = res || []
  } catch (error) {
    console.error('获取客流统计列表失败:', error)
  } finally {
    flowLoading.value = false
  }
}

const handleSearch = () => {
  fetchFlowData()
}

// ===== 导出场馆客流统计数据 =====
const flowExportLoading = ref(false)

const handleFlowExport = async () => {
  flowExportLoading.value = true
  try {
    const res = await exportData({ date: filterDate.value })
    const blobOptions = { type: 'application/vnd.ms-excel' }
    const fileSuffix = '.xlsx'
    const url = window.URL.createObjectURL(new Blob([res], blobOptions))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '场馆客流统计' + fileSuffix)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出场馆客流数据失败:', error)
  } finally {
    flowExportLoading.value = false
  }
}

// ===== 客流趋势图（今日/本周/本月） =====
const trendChartRef = ref<HTMLDivElement | null>(null)
const { setOptions: setTrendChartOptions } = useECharts(trendChartRef as Ref<HTMLDivElement>)

const trendPeriod = ref<number>(0) // 0=今日, 1=本周, 2=本月
const trendLoading = ref(false)

// 场馆颜色列表
const venueColors = ['#3182ce', '#38a169', '#dd6b20', '#805ad5', '#e53e3e', '#319795', '#d69e2e', '#718096']

/** 根据周期类型生成默认 X 轴标签（接口无 date 字段时使用） */
function getDefaultXAxis(periodType: number): string[] {
  if (periodType === 0) {
    // 今日：0-23 时
    return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  } else if (periodType === 1) {
    // 本周：周一到周日
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  } else {
    // 本月：1-31 日
    return Array.from({ length: dayjs().daysInMonth() }, (_, i) => `${i + 1}日`)
  }
}

/** 处理后端返回的趋势数据，转为 ECharts series 格式
 *
 * 真实数据结构（本周/本月）：
 * {
 *   date: ["周一", "周二", ...],
 *   "1号馆": [0, 0, 0, 490, 0, 0, 0],
 *   "2号馆": [0, 0, 0, 272, 0, 0, 0],
 *   "total": [0, 0, 0, 1715, 0, 0, 0],
 *   todayInTotal: 0,
 *   todayInOutTotal: 0
 * }
 */
function parseTrendData(res: any, periodType: number) {
  // 需要跳过的非场馆字段
  const skipKeys = new Set(['date', 'total', 'todayInTotal', 'todayInOutTotal'])

  let xAxisData: string[] = []
  let series: { name: string; data: number[]; color?: string; isTotal?: boolean }[] = []

  if (res && typeof res === 'object' && !Array.isArray(res)) {
    // 直接使用后端返回的 date 作为 X 轴，如果没有则用默认
    xAxisData = Array.isArray(res.date) && res.date.length > 0 ? res.date : getDefaultXAxis(periodType)

    // 遍历所有字段，跳过 date/total/todayInTotal/todayInOutTotal
    let venueIdx = 0
    Object.keys(res).forEach((key) => {
      if (skipKeys.has(key)) return
      if (!Array.isArray(res[key])) return
      series.push({
        name: key,
        data: res[key],
        color: venueColors[venueIdx % venueColors.length],
      })
      venueIdx++
    })

    // 如果有 total 字段，作为合计折线单独展示
    if (Array.isArray(res.total)) {
      series.push({
        name: '合计',
        data: res.total,
        color: '#e53e3e',
        isTotal: true,
      })
    }
  } else {
    // 接口无数据时，使用默认 X 轴，生成空 series 以展示图表框架
    xAxisData = getDefaultXAxis(periodType)
  }

  return { xAxisData, series }
}

/** 渲染趋势图 */
function renderTrendChart(res: any) {
  const { xAxisData, series } = parseTrendData(res, trendPeriod.value)

  // 即使无数据也渲染图表框架（坐标轴 + 网格 + 空折线），保证页面不空白
  setTrendChartOptions({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      type: 'scroll',
      top: '2%',
      left: 'center',
      textStyle: { fontSize:14, color: '#4a5568' },
      icon: 'roundRect',
      data: series.map((s) => s.name),
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#718096', fontSize:13 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      axisLabel: { color: '#718096', fontSize:13 },
    },
    series: series.length > 0 ? series.map((s) => {
      // 合计线使用加粗虚线样式，不显示面积填充
      if (s.isTotal) {
        return {
          name: s.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: s.data,
          lineStyle: { width: 3, color: s.color, type: 'dashed' },
          itemStyle: { color: s.color },
          z: 10,
        }
      }
      // 各场馆折线带面积填充
      return {
        name: s.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: s.data,
        lineStyle: { width: 2, color: s.color },
        itemStyle: { color: s.color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: (s.color || '#3182ce') + '33' },
              { offset: 1, color: (s.color || '#3182ce') + '05' },
            ],
          },
        },
      }
    }) : [{
      // 无数据时渲染一条空折线，保证图表框架可见
      name: '暂无数据',
      type: 'line',
      data: new Array(xAxisData.length).fill(null),
      lineStyle: { color: 'transparent' },
      itemStyle: { color: 'transparent' },
    }],
  })
}

const fetchTrendData = async () => {
  trendLoading.value = true
  try {
    const res = await getFlowTrend({ periodType: trendPeriod.value })
    await nextTick()
    renderTrendChart(res)
  } catch (error) {
    console.error('获取客流趋势数据失败:', error)
    renderTrendChart(null)
  } finally {
    trendLoading.value = false
  }
}

const handleTrendChange = () => {
  fetchTrendData()
}

// ===== 实时客流热力图 =====
const heatmapData = ref<VenueHeatmapItemVO[]>([])
const heatmapLoading = ref(false)
const heatmapFullscreen = ref(false)

const toggleHeatmapFullscreen = () => {
  heatmapFullscreen.value = !heatmapFullscreen.value
}

const fetchHeatmapData = async () => {
  heatmapLoading.value = true
  try {
    const res = await getHeatmap()
    heatmapData.value = Array.isArray(res) ? res : (res?.data || res?.result || [])
  } catch (error) {
    console.error('获取实时客流热力图数据失败:', error)
  } finally {
    heatmapLoading.value = false
  }
}

// ===== 初始化 =====
onMounted(() => {
  fetchStatCards()
  fetchVenueOptions()
  fetchFlowData()
  fetchTrendData()
  fetchHeatmapData()
})
</script>

<style scoped lang="less">
.venue-flow-page { padding: 0; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

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
    flex-wrap: wrap;
    gap: 12px;

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
      font-size:13px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-blue { background: #bee3f8; color: #2a4365; }

    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .card-body { padding: 22px; }
}

.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 260px;
  padding: 30px;

  .chart-icon { font-size: 48px; margin-bottom: 12px; }
  .chart-text { font-size:16px; color: #718096; font-weight: 500; }
  .chart-sub { font-size:14px; color: #a0aec0; margin-top: 8px; }
}

.trend-chart {
  width: 100%;
  height: 280px;
}

.heatmap-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  margin: 0;
  border-radius: 0;
  overflow: auto;
  background: #fff;

  .card-body.heatmap-fullscreen-body {
    height: calc(100% - 60px);
    padding: 10px;
    overflow: hidden;

    .spin-fullscreen {
      width: 100%;
      height: 100%;

      :deep(.ant-spin-container) {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size:14px;
  font-weight: 500;

  &.normal { background: #c6f6d5; color: #22543d; }
  &.danger { background: #fed7d7; color: #742a2a; }
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size:14px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>
