<template>
  <div class="ai-page">
    <a-spin :spinning="queryLoading">
      <div class="stats-row">
        <StatCard
          v-for="(item, index) in statCards"
          :key="index"
          :label="item.label"
          :value="item.value"
          :change-text="item.change"
          :color="item.color"
          :icon="item.icon"
        />
      </div>

      <div class="ai-report-card" v-if="reportData">
        <div class="ai-report-header">
          <span class="ai-badge">AI</span>
          <span class="ai-report-title">{{ reportData.report_title }}</span>
        </div>
        <div class="ai-report-desc">{{ reportData.summary || reportData.report_desc }}</div>
        <div class="ai-metrics" v-if="reportData.metrics?.length">
          <div class="ai-metric" v-for="(item, index) in reportData.metrics" :key="index">
            <div class="ai-metric-value">{{ item.value }}</div>
            <div class="ai-metric-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <div class="ai-report-card ai-report-placeholder" v-else-if="!generateLoading">
        <div class="ai-placeholder-inner">
          <div class="ai-placeholder-icon">⚡</div>
          <div class="ai-placeholder-text">选择时间范围后点击“生成报告”，获取 AI 节能分析</div>
        </div>
      </div>
      <div class="ai-report-card ai-report-loading" v-else>
        <div class="ai-loading-inner">
          <a-spin size="large" />
          <div class="ai-loading-text">AI节能分析中，预计需要较长时间，请耐心等待...</div>
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <h3><BarChartOutlined /> 节能效果分析</h3>
            <div class="btn-group">
              <a-button :type="timeRange === 'week' ? 'primary' : 'default'" size="small" @click="changeRange('week')">本周</a-button>
              <a-button :type="timeRange === 'month' ? 'primary' : 'default'" size="small" @click="changeRange('month')">本月</a-button>
              <a-button :type="timeRange === 'year' ? 'primary' : 'default'" size="small" @click="changeRange('year')">本年</a-button>
            </div>
          </div>
          <div class="card-body">
            <div ref="barChartRef" class="chart-container" v-show="reportData?.strategy_items?.length"></div>
            <div class="chart-placeholder" v-if="!reportData?.strategy_items?.length">
              <div class="chart-text">生成报告后展示优化前日均 vs 优化后日均</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3><PieChartOutlined /> 节能措施分布</h3></div>
          <div class="card-body">
            <div ref="pieChartRef" class="chart-container" v-show="reportData?.strategy_items?.length"></div>
            <div class="chart-placeholder" v-if="!reportData?.strategy_items?.length">
              <div class="chart-text">生成报告后展示各项策略节能贡献</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><BulbOutlined /> AI节能优化策略</h3>
          <div class="filter-bar">
            <a-select v-model:value="venueName" style="width: 160px" allow-clear placeholder="全部场馆">
              <a-select-option v-for="item in venues" :key="item.id" :value="item.venue_name">{{ item.venue_name }}</a-select-option>
            </a-select>
            <a-button type="primary" :loading="generateLoading" @click="handleGenerate"><PlusOutlined /> 生成报告</a-button>
          </div>
        </div>
        <div class="card-body">
          <a-table :columns="columns" :data-source="reportData?.strategy_items || []" :pagination="{ pageSize: 8 }" row-key="strategy_name" size="middle">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <span class="status-text" :class="record.status === '运行中' || record.status === '已完成' ? 'normal' : 'info'">{{ record.status }}</span>
              </template>
              <template v-if="column.key === 'saving_rate'">
                <span style="color: #52c41a; font-weight: 500;">{{ record.saving_rate || '--' }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <div class="card" v-if="reportData?.suggestions?.length">
        <div class="card-header"><h3>优化建议</h3></div>
        <div class="card-body">
          <div class="suggestion-list">
            <div class="suggestion-item" v-for="(item, index) in reportData.suggestions" :key="index">
              <div class="suggestion-index">{{ index + 1 }}</div>
              <div class="suggestion-text">{{ item }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, shallowRef, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ThunderboltOutlined, RiseOutlined, BulbOutlined, EnvironmentOutlined,
  BarChartOutlined, PieChartOutlined, PlusOutlined,
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { unwrapAiResponse, parseHistoryContent, getVenues, getReportHistory, getReportDetail, type VenueInfo } from '../common.api'
import { generateEnergyReport, type AIEnergyReportResponse } from './index.api'

defineOptions({ name: 'AiEnergyPage' })

const timeRange = ref<'week' | 'month' | 'quarter' | 'year'>('month')
const venueName = ref<string | undefined>(undefined)
const venues = ref<VenueInfo[]>([])
const queryLoading = ref(false)
const generateLoading = ref(false)
const reportData = ref<AIEnergyReportResponse | null>(null)

const barChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const barChartInstance = shallowRef<echarts.ECharts>()
const pieChartInstance = shallowRef<echarts.ECharts>()

const fallbackStats = [
  { label: '累计节能量', value: '--', change: '生成报告后展示', color: 'blue' as const, icon: ThunderboltOutlined },
  { label: '节能收益率', value: '--', change: '生成报告后展示', color: 'green' as const, icon: RiseOutlined },
  { label: 'AI优化策略', value: 0, change: '生成报告后展示', color: 'orange' as const, icon: BulbOutlined },
  { label: '碳减排量', value: '--', change: '生成报告后展示', color: 'purple' as const, icon: EnvironmentOutlined },
]

const statCards = computed(() => {
  const metrics = reportData.value?.metrics || []
  if (!metrics.length) {
    return [
      { ...fallbackStats[0] },
      { ...fallbackStats[1] },
      { ...fallbackStats[2], value: reportData.value?.strategy_items?.length ?? 0 },
      { ...fallbackStats[3] },
    ]
  }
  const icons = [ThunderboltOutlined, RiseOutlined, BulbOutlined, EnvironmentOutlined]
  const colors = ['blue', 'green', 'orange', 'purple'] as const
  return metrics.slice(0, 4).map((item, index) => ({
    label: item.label,
    value: item.value,
    change: '',
    color: colors[index],
    icon: icons[index],
  }))
})

const columns = [
  { title: '策略名称', dataIndex: 'strategy_name', key: 'strategy_name' },
  { title: '实施日期', dataIndex: 'implement_date', key: 'implement_date', width: 120 },
  { title: '优化前日均', dataIndex: 'before_daily', key: 'before_daily', width: 120 },
  { title: '优化后日均', dataIndex: 'after_daily', key: 'after_daily', width: 120 },
  { title: '日节能量', dataIndex: 'daily_saving', key: 'daily_saving', width: 110 },
  { title: '节能率', dataIndex: 'saving_rate', key: 'saving_rate', width: 100 },
  { title: '累计节约', dataIndex: 'total_saving', key: 'total_saving', width: 110 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
]

const fetchVenues = async () => {
  try {
    const res = await getVenues()
    venues.value = unwrapAiResponse<{ items: VenueInfo[] }>(res).items || []
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

const loadLatestEnergy = async () => {
  queryLoading.value = true
  try {
    const res = await getReportHistory({
      page: 1,
      page_size: 1,
      report_type: 'energy',
      time_range: timeRange.value,
    })
    const first = unwrapAiResponse<{ items: { id: number }[] }>(res).items?.[0]
    if (!first) return
    const detail = unwrapAiResponse(await getReportDetail(first.id))
    const parsed = parseHistoryContent<AIEnergyReportResponse>(detail)
    if (parsed) {
      reportData.value = parsed
      await nextTick()
      renderCharts()
    }
  } catch (error) {
    console.error('加载最近节能报告失败:', error)
  } finally {
    queryLoading.value = false
  }
}

const handleGenerate = async () => {
  generateLoading.value = true
  queryLoading.value = true
  try {
    const res = await generateEnergyReport({
      time_range: timeRange.value,
      venue_name: venueName.value || undefined,
    })
    reportData.value = unwrapAiResponse<AIEnergyReportResponse>(res)
    message.success('节能报告已生成')
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('生成节能报告失败:', error)
  } finally {
    generateLoading.value = false
    queryLoading.value = false
  }
}

const changeRange = (range: 'week' | 'month' | 'year') => {
  timeRange.value = range
  loadLatestEnergy()
}

const parseNumber = (value?: string | null) => {
  if (!value) return 0
  const num = parseFloat(String(value).replace(/[^\d.-]/g, ''))
  return Number.isNaN(num) ? 0 : num
}

const renderCharts = () => {
  const items = reportData.value?.strategy_items || []
  if (!items.length) return

  if (barChartRef.value) {
    if (!barChartInstance.value) barChartInstance.value = echarts.init(barChartRef.value)
    barChartInstance.value.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['优化前日均', '优化后日均'] },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '16%', containLabel: true },
      xAxis: {
        type: 'category',
        data: items.map((i) => i.strategy_name),
        axisLabel: { interval: 0, rotate: items.length > 3 ? 20 : 0, formatter: (name: string) => (name.length > 8 ? `${name.slice(0, 8)}...` : name) },
      },
      yAxis: { type: 'value' },
      series: [
        { name: '优化前日均', type: 'bar', data: items.map((i) => parseNumber(i.before_daily)), itemStyle: { color: '#E86452' } },
        { name: '优化后日均', type: 'bar', data: items.map((i) => parseNumber(i.after_daily)), itemStyle: { color: '#5AD8A6' } },
      ],
    })
  }

  if (pieChartRef.value) {
    if (!pieChartInstance.value) pieChartInstance.value = echarts.init(pieChartRef.value)
    pieChartInstance.value.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '68%'],
        data: items.map((i) => ({ name: i.strategy_name, value: parseNumber(i.saving_rate) || parseNumber(i.daily_saving) || 1 })),
      }],
    })
  }
}

const resizeCharts = () => {
  barChartInstance.value?.resize()
  pieChartInstance.value?.resize()
}

onMounted(() => {
  fetchVenues()
  loadLatestEnergy()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  barChartInstance.value?.dispose()
  pieChartInstance.value?.dispose()
})
</script>

<style scoped lang="less">
@import '../ai-page.less';
</style>
