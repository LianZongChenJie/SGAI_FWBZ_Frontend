<template>
  <div class="ai-page">
    <div class="stats-row">
      <StatCard label="报告总数" :value="stats.total_count" :change-text="`近7天 ${stats.recent_count}`" color="blue" :icon="FileTextOutlined" />
      <StatCard label="运行报告" :value="stats.by_type.run ?? 0" change-text="类型统计" color="green" :icon="FileAddOutlined" />
      <StatCard label="故障分析" :value="stats.by_type.fault ?? 0" change-text="类型统计" color="orange" :icon="FundOutlined" />
      <StatCard label="节能/能碳" :value="(stats.by_type.energy ?? 0) + (stats.by_type.carbon ?? 0) + (stats.by_type.energy_analysis ?? 0)" change-text="类型统计" color="purple" :icon="StarOutlined" />
    </div>

    <div class="ai-report-card" v-if="runReport">
      <div class="ai-report-header">
        <span class="ai-badge">AI</span>
        <span class="ai-report-title">{{ runReport.report_title }}</span>
      </div>
      <div class="ai-report-desc">{{ runReport.summary || runReport.report_desc }}</div>
      <div class="ai-metrics" v-if="runReport.metrics?.length">
        <div class="ai-metric" v-for="(item, index) in runReport.metrics" :key="index">
          <div class="ai-metric-value">{{ item.value }}</div>
          <div class="ai-metric-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
    <div class="ai-report-card ai-report-loading" v-else-if="generateLoading">
      <div class="ai-loading-inner">
        <a-spin size="large" />
        <div class="ai-loading-text">AI运行报告生成中，预计需要较长时间，请耐心等待...</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><FileTextOutlined /> AI运行报告列表</h3>
        <div class="filter-bar">
          <a-select v-model:value="reportType" style="width: 140px" allow-clear placeholder="全部类型">
            <a-select-option value="run">运行报告</a-select-option>
            <a-select-option value="predict">预测报告</a-select-option>
            <a-select-option value="energy">节能报告</a-select-option>
            <a-select-option value="fault">故障分析</a-select-option>
            <a-select-option value="carbon">能碳计算</a-select-option>
            <a-select-option value="energy_analysis">能源分析</a-select-option>
          </a-select>
          <a-select v-model:value="timeRange" style="width: 120px" allow-clear placeholder="全部周期">
            <a-select-option value="day">日报</a-select-option>
            <a-select-option value="week">周报</a-select-option>
            <a-select-option value="month">月报</a-select-option>
            <a-select-option value="quarter">季报</a-select-option>
            <a-select-option value="year">年报</a-select-option>
          </a-select>
          <a-select v-model:value="statusFilter" style="width: 120px" allow-clear placeholder="全部状态">
            <a-select-option value="已完成">已完成</a-select-option>
            <a-select-option value="已生成">已生成</a-select-option>
            <a-select-option value="生成中">生成中</a-select-option>
            <a-select-option value="失败">失败</a-select-option>
          </a-select>
          <a-button type="primary" :loading="listLoading" @click="fetchList"><SearchOutlined /> 查询</a-button>
          <a-button type="primary" ghost :loading="generateLoading" @click="handleGenerate"><PlusOutlined /> 生成报告</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="listLoading"
          :pagination="pagination"
          row-key="id"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'report_type'">{{ typeLabel(record.report_type) }}</template>
            <template v-if="column.key === 'time_range'">{{ rangeLabel(record.time_range) }}</template>
            <template v-if="column.key === 'created_at'">{{ formatTime(record.created_at) }}</template>
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="statusClass(record.status)">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
              <a-popconfirm title="确认删除该报告？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 报告周期分布</h3></div>
        <div class="card-body">
          <div ref="rangeChartRef" class="chart-container"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><PieChartOutlined /> 报告类型分布</h3></div>
        <div class="card-body">
          <div ref="typeChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <a-modal v-model:open="detailVisible" :title="detail?.title || '报告详情'" width="720px" :footer="null">
      <a-spin :spinning="detailLoading">
        <p v-if="detail?.summary" style="color: #718096; margin-bottom: 12px;">{{ detail.summary }}</p>
        <div class="detail-content">{{ formatContent(detail?.content) }}</div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  FileTextOutlined, FileAddOutlined, FundOutlined, StarOutlined,
  BarChartOutlined, PieChartOutlined, SearchOutlined, PlusOutlined,
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import {
  unwrapAiResponse,
  parseHistoryContent,
  getReportStats,
  getReportHistory,
  getReportDetail,
  deleteReport,
  type AIReportHistoryListItem,
  type AIReportHistoryResponse,
  type AIReportStatsResponse,
} from '../common.api'
import { generateRunReport, type AIRunReportResponse } from './index.api'

defineOptions({ name: 'AiReportPage' })

const TYPE_LABEL: Record<string, string> = {
  run: '运行报告',
  predict: '预测报告',
  energy: '节能报告',
  fault: '故障分析',
  carbon: '能碳计算',
  energy_analysis: '能源分析',
}
const RANGE_LABEL: Record<string, string> = {
  day: '日报',
  week: '周报',
  month: '月报',
  quarter: '季报',
  year: '年报',
}

const stats = ref<AIReportStatsResponse>({ total_count: 0, by_type: {}, by_time_range: {}, recent_count: 0 })
const tableData = ref<AIReportHistoryListItem[]>([])
const listLoading = ref(false)
const generateLoading = ref(false)
const runReport = ref<AIRunReportResponse | null>(null)
const reportType = ref<string | undefined>('run')
const timeRange = ref<string | undefined>(undefined)
const statusFilter = ref<string | undefined>(undefined)
const pagination = ref({ current: 1, pageSize: 10, total: 0, showSizeChanger: true })
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<AIReportHistoryResponse | null>(null)

const rangeChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()
const rangeChartInstance = shallowRef<echarts.ECharts>()
const typeChartInstance = shallowRef<echarts.ECharts>()

const columns = [
  { title: '报告名称', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '类型', dataIndex: 'report_type', key: 'report_type', width: 100 },
  { title: '周期', dataIndex: 'time_range', key: 'time_range', width: 80 },
  { title: '生成时间', dataIndex: 'created_at', key: 'created_at', width: 170 },
  { title: '覆盖范围', dataIndex: 'target_name', key: 'target_name', width: 120 },
  { title: '数据量', dataIndex: 'data_volume', key: 'data_volume', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' },
]

const typeLabel = (type?: string) => TYPE_LABEL[type || ''] || type || '--'
const rangeLabel = (range?: string) => RANGE_LABEL[range || ''] || range || '--'
const formatTime = (time?: string) => (time || '--').replace('T', ' ').replace(/\.\d+Z?$/, '')
const statusClass = (status?: string) => {
  if (status === '已完成' || status === '已生成') return 'normal'
  if (status === '生成中') return 'warning'
  if (status === '失败') return 'danger'
  return 'info'
}
const formatContent = (content?: string) => {
  if (!content) return '暂无详情'
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

const fetchStats = async () => {
  try {
    const res = await getReportStats()
    stats.value = unwrapAiResponse<AIReportStatsResponse>(res)
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('获取报告统计失败:', error)
  }
}

const fetchList = async () => {
  listLoading.value = true
  try {
    const res = await getReportHistory({
      page: pagination.value.current,
      page_size: pagination.value.pageSize,
      report_type: reportType.value || undefined,
      time_range: timeRange.value || undefined,
    })
    const data = unwrapAiResponse<{ items: AIReportHistoryListItem[]; total: number }>(res)
    let items = data.items || []
    if (statusFilter.value) {
      items = items.filter((item) => item.status === statusFilter.value)
    }
    tableData.value = items
    pagination.value.total = data.total || 0
    if (!runReport.value && items.length) {
      await hydrateLatestReport(items[0])
    }
  } catch (error) {
    console.error('获取报告列表失败:', error)
  } finally {
    listLoading.value = false
  }
}

const hydrateLatestReport = async (item: AIReportHistoryListItem) => {
  try {
    const res = await getReportDetail(item.id)
    const detail = unwrapAiResponse<AIReportHistoryResponse>(res)
    const parsed = parseHistoryContent<AIRunReportResponse>(detail)
    runReport.value = parsed || {
      report_title: detail.title,
      report_desc: detail.summary || '',
      summary: detail.summary || '',
      scope: detail.scope || '',
      time_range: detail.time_range,
      report_count: 0,
      device_count: 0,
      analysis_dimension: 0,
    }
  } catch (error) {
    console.error('加载最近报告失败:', error)
  }
}

const handleTableChange = (pager: any) => {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize
  fetchList()
}

const handleGenerate = async () => {
  generateLoading.value = true
  runReport.value = null
  try {
    const res = await generateRunReport({
      scope: 'all',
      time_range: (timeRange.value as any) || 'month',
    })
    runReport.value = unwrapAiResponse<AIRunReportResponse>(res)
    message.success('运行报告已生成')
    pagination.value.current = 1
    await Promise.all([fetchStats(), fetchList()])
  } catch (error) {
    console.error('生成运行报告失败:', error)
  } finally {
    generateLoading.value = false
  }
}

const handleView = async (record: AIReportHistoryListItem) => {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const res = await getReportDetail(record.id)
    detail.value = unwrapAiResponse<AIReportHistoryResponse>(res)
  } catch (error) {
    console.error('获取报告详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteReport(id)
    message.success('已删除')
    await Promise.all([fetchStats(), fetchList()])
  } catch (error) {
    console.error('删除报告失败:', error)
  }
}

const renderCharts = () => {
  const rangeData = Object.entries(stats.value.by_time_range || {})
  if (rangeChartRef.value) {
    if (!rangeChartInstance.value) rangeChartInstance.value = echarts.init(rangeChartRef.value)
    rangeChartInstance.value.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
      xAxis: { type: 'category', data: rangeData.map(([k]) => rangeLabel(k)), axisTick: { show: false } },
      yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
      series: [{ type: 'bar', data: rangeData.map(([, v]) => v), barWidth: 28, itemStyle: { color: '#5B8FF9', borderRadius: [4, 4, 0, 0] } }],
    })
  }

  const typeData = Object.entries(stats.value.by_type || {})
  if (typeChartRef.value) {
    if (!typeChartInstance.value) typeChartInstance.value = echarts.init(typeChartRef.value)
    typeChartInstance.value.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: '4%', top: 'center' },
      series: [{
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['38%', '50%'],
        data: typeData.map(([k, v]) => ({ name: typeLabel(k), value: v })),
      }],
    })
  }
}

const resizeCharts = () => {
  rangeChartInstance.value?.resize()
  typeChartInstance.value?.resize()
}

onMounted(async () => {
  await Promise.all([fetchStats(), fetchList()])
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  rangeChartInstance.value?.dispose()
  typeChartInstance.value?.dispose()
})
</script>

<style scoped lang="less">
@import '../ai-page.less';
</style>
