<template>
  <div class="ai-page">
    <a-spin :spinning="queryLoading">
      <div class="stats-row">
        <StatCard label="故障分析总数" :value="queryData?.fault_stats?.total_faults ?? 0" change-text="故障统计" color="blue" :icon="FileTextOutlined" />
        <StatCard label="涉及设备数" :value="queryData?.fault_stats?.affected_devices ?? 0" change-text="受影响设备" color="green" :icon="CheckCircleOutlined" />
        <StatCard label="未处理故障" :value="queryData?.fault_stats?.unresolved_count ?? 0" change-text="待处理" color="orange" :icon="ClockCircleOutlined" />
        <StatCard label="已处理故障" :value="queryData?.fault_stats?.resolved_count ?? 0" change-text="已修复" color="purple" :icon="FundOutlined" />
      </div>

      <div class="ai-report-card" v-if="analyzeData">
        <div class="ai-report-header">
          <span class="ai-badge">AI</span>
          <span class="ai-report-title">{{ analyzeData.report_title || '设备故障智能分析报告' }}</span>
        </div>
        <div class="ai-report-desc">{{ analyzeData.report_desc || analyzeData.summary }}</div>
        <div class="ai-metrics" v-if="analyzeData.metrics?.length">
          <div class="ai-metric" v-for="(item, index) in analyzeData.metrics" :key="index">
            <div class="ai-metric-value">{{ item.value }}</div>
            <div class="ai-metric-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <div class="ai-report-card ai-report-placeholder" v-else-if="!analyzeLoading">
        <div class="ai-placeholder-inner">
          <div class="ai-placeholder-icon">🔧</div>
          <div class="ai-placeholder-text">查询故障数据后点击“诊断分析”，生成故障分析报告</div>
        </div>
      </div>
      <div class="ai-report-card ai-report-loading" v-else>
        <div class="ai-loading-inner">
          <a-spin size="large" />
          <div class="ai-loading-text">AI故障分析中，预计需要较长时间，请耐心等待...</div>
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <h3><BarChartOutlined /> 故障分类统计</h3>
            <div class="btn-group">
              <a-button :type="timeRange === 'week' ? 'primary' : 'default'" size="small" @click="changeRange('week')">本周</a-button>
              <a-button :type="timeRange === 'month' ? 'primary' : 'default'" size="small" @click="changeRange('month')">本月</a-button>
              <a-button :type="timeRange === 'year' ? 'primary' : 'default'" size="small" @click="changeRange('year')">本年</a-button>
            </div>
          </div>
          <div class="card-body">
            <div ref="barChartRef" class="chart-container"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3><PieChartOutlined /> 故障原因分析</h3></div>
          <div class="card-body">
            <div ref="pieChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><WarningOutlined /> 故障分析报告列表</h3>
          <div class="filter-bar">
            <a-select v-model:value="venueName" style="width: 160px" allow-clear placeholder="全部场馆">
              <a-select-option v-for="item in venues" :key="item.id" :value="item.venue_name">{{ item.venue_name }}</a-select-option>
            </a-select>
            <a-select v-model:value="levelFilter" style="width: 120px" allow-clear placeholder="全部等级">
              <a-select-option value="紧急">紧急</a-select-option>
              <a-select-option value="重要">重要</a-select-option>
              <a-select-option value="一般">一般</a-select-option>
            </a-select>
            <a-button type="primary" :loading="queryLoading" @click="fetchData"><SearchOutlined /> 查询</a-button>
            <a-button type="primary" ghost :loading="analyzeLoading" :disabled="!queryData" @click="handleAnalyze">诊断分析</a-button>
          </div>
        </div>
        <div class="card-body">
          <a-table :columns="columns" :data-source="filteredList" :pagination="{ pageSize: 8 }" row-key="id" size="middle">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'level'">
                <span class="status-text" :class="levelClass(record.alarm_level_name)">{{ record.alarm_level_name || '--' }}</span>
              </template>
              <template v-if="column.key === 'status'">
                <span class="status-text" :class="statusClass(record.alarm_status)">{{ record.alarm_status || '--' }}</span>
              </template>
              <template v-if="column.key === 'time'">{{ formatTime(record.alarm_time) }}</template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" :disabled="!analyzeData" @click="scrollToReport">查看报告</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <div class="card" v-if="analyzeData?.suggestions?.length">
        <div class="card-header"><h3>维保建议</h3></div>
        <div class="card-body">
          <div class="suggestion-list">
            <div class="suggestion-item" v-for="(item, index) in analyzeData.suggestions" :key="index">
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
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, FundOutlined,
  BarChartOutlined, PieChartOutlined, WarningOutlined, SearchOutlined,
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { unwrapAiResponse, getVenues, type VenueInfo } from '../common.api'
import {
  getFaultQuery,
  getFaultAnalyze,
  type FaultQueryResponse,
  type FaultAnalyzeResponse,
  type FaultListItem,
} from './index.api'

defineOptions({ name: 'AiFaultPage' })

const timeRange = ref<'week' | 'month' | 'year'>('month')
const venueName = ref<string | undefined>(undefined)
const levelFilter = ref<string | undefined>(undefined)
const venues = ref<VenueInfo[]>([])
const queryLoading = ref(false)
const analyzeLoading = ref(false)
const queryData = ref<FaultQueryResponse | null>(null)
const analyzeData = ref<FaultAnalyzeResponse | null>(null)

const barChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const barChartInstance = shallowRef<echarts.ECharts>()
const pieChartInstance = shallowRef<echarts.ECharts>()

const columns = [
  { title: '报告编号', dataIndex: 'id', key: 'id', width: 90 },
  { title: '设备名称', dataIndex: 'device_name', key: 'device_name' },
  { title: '所属系统', dataIndex: 'alarm_category_name', key: 'alarm_category_name', width: 120 },
  { title: '故障描述', dataIndex: 'alarm_content', key: 'alarm_content', ellipsis: true },
  { title: '故障等级', dataIndex: 'alarm_level_name', key: 'level', width: 90 },
  { title: '发生时间', dataIndex: 'alarm_time', key: 'time', width: 170 },
  { title: '状态', dataIndex: 'alarm_status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' },
]

const filteredList = computed(() => {
  const list = (queryData.value?.fault_list || []) as FaultListItem[]
  if (list.length) {
    if (!levelFilter.value) return list
    return list.filter((item) => (item.alarm_level_name || '').includes(levelFilter.value as string))
  }
  const devices = queryData.value?.device_fault_count || []
  const categories = queryData.value?.fault_device_category || []
  return devices.map((item, index) => ({
    id: index + 1,
    device_name: item.device_name,
    alarm_category_name: categories[index]?.category || '--',
    alarm_content: `累计故障 ${item.fault_count} 次`,
    alarm_level_name: '--',
    alarm_time: queryData.value?.query_params?.end_date || '',
    alarm_status: '统计汇总',
  })) as FaultListItem[]
})

const formatTime = (time?: string) => (time || '--').replace('T', ' ').replace(/\.\d+Z?$/, '')
const levelClass = (level?: string) => {
  if (!level) return 'info'
  if (level.includes('紧急')) return 'danger'
  if (level.includes('重要') || level.includes('高')) return 'warning'
  return 'info'
}
const statusClass = (status?: string) => {
  if (!status) return 'info'
  if (status.includes('已修复') || status.includes('已处理') || status.includes('已完成') || status.includes('统计')) return 'normal'
  if (status.includes('处理中')) return 'warning'
  return 'danger'
}

const fetchVenues = async () => {
  try {
    const res = await getVenues()
    venues.value = unwrapAiResponse<{ items: VenueInfo[] }>(res).items || []
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

const fetchData = async () => {
  queryLoading.value = true
  analyzeData.value = null
  try {
    const res = await getFaultQuery({
      time_range: timeRange.value,
      venue_name: venueName.value,
    })
    queryData.value = unwrapAiResponse<FaultQueryResponse>(res)
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('获取故障数据失败:', error)
  } finally {
    queryLoading.value = false
  }
}

const handleAnalyze = async () => {
  if (!queryData.value) return
  analyzeLoading.value = true
  analyzeData.value = null
  try {
    const res = await getFaultAnalyze(queryData.value)
    analyzeData.value = unwrapAiResponse<FaultAnalyzeResponse>(res)
  } catch (error) {
    console.error('AI故障分析失败:', error)
  } finally {
    analyzeLoading.value = false
  }
}

const changeRange = (range: 'week' | 'month' | 'year') => {
  timeRange.value = range
  fetchData()
}

const scrollToReport = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const renderCharts = () => {
  const categories = queryData.value?.fault_by_category || []
  if (barChartRef.value) {
    if (!barChartInstance.value) barChartInstance.value = echarts.init(barChartRef.value)
    barChartInstance.value.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories.map((c) => c.category),
        axisLabel: { interval: 0, rotate: categories.length > 4 ? 20 : 0, formatter: (name: string) => (name?.length > 8 ? `${name.slice(0, 8)}...` : name) },
      },
      yAxis: { type: 'value', name: '故障数' },
      series: [{ type: 'bar', data: categories.map((c) => c.count), itemStyle: { color: '#E86452', borderRadius: [4, 4, 0, 0] } }],
    }, true)
  }

  const levels = queryData.value?.fault_by_level || []
  const pieSource = levels.length
    ? levels.map((item) => ({ name: item.level_name, value: item.count }))
    : categories.map((item) => ({ name: item.category, value: item.count }))
  if (pieChartRef.value) {
    if (!pieChartInstance.value) pieChartInstance.value = echarts.init(pieChartRef.value)
    pieChartInstance.value.setOption({
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: ['40%', '68%'], data: pieSource }],
    }, true)
  }
}

const resizeCharts = () => {
  barChartInstance.value?.resize()
  pieChartInstance.value?.resize()
}

onMounted(() => {
  fetchVenues()
  fetchData()
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
