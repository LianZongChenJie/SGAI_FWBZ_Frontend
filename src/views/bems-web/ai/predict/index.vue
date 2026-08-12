<template>
  <div class="ai-page">
    <a-spin :spinning="queryLoading">
      <!-- 统计卡片行 -->
      <div class="stats-row">
        <StatCard
          label="总故障数"
          :value="queryData?.fault_stats?.total_faults ?? 0"
          change-text="故障统计"
          color="red"
          :icon="FireIcon"
        />
        <StatCard
          label="涉及设备数"
          :value="queryData?.fault_stats?.affected_devices ?? 0"
          change-text="受影响设备"
          color="orange"
          :icon="DeviceIcon"
        />
        <StatCard
          label="故障类别数"
          :value="queryData?.fault_stats?.category_count ?? 0"
          change-text="分类统计"
          color="blue"
          :icon="ChartIcon"
        />
        <StatCard
          label="未处理故障"
          :value="queryData?.fault_stats?.unresolved_count ?? 0"
          change-text="待处理"
          trend="up"
          color="purple"
          :icon="ClockIcon"
        />
      </div>

      <!-- AI报告卡片 -->
      <div class="ai-report-card" v-if="analyzeData">
        <div class="ai-report-header">
          <span class="ai-badge">AI</span>
          <span class="ai-report-title">{{ analyzeData.report_title || '设备故障智能分析报告' }}</span>
        </div>
        <div class="ai-report-desc">{{ analyzeData.report_desc || analyzeData.summary }}</div>
        <div class="ai-metrics">
          <div class="ai-metric" v-for="(item, index) in analyzeData.metrics" :key="index">
            <div class="ai-metric-value">{{ item.value }}</div>
            <div class="ai-metric-label">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <!-- 两栏布局：故障分布统计 + 故障分析清单 -->
      <div class="two-col">
        <!-- 故障分布统计 -->
        <div class="card fixed-card">
          <div class="card-header">
            <h3>📊 故障分布统计</h3>
            <span class="tag tag-blue">实时数据</span>
          </div>
          <div class="card-body card-body-scroll">
            <div ref="trendChartRef" class="chart-container"></div>
          </div>
        </div>

        <!-- 故障分析清单 -->
        <div class="card fixed-card">
          <div class="card-header">
            <h3>🔧 故障分析清单</h3>
            <a-button
              type="primary"
              size="small"
              :loading="analyzeLoading"
              :disabled="analyzeLoading || !queryData"
              @click="handleAnalyze"
            >
              <template #icon><ThunderboltOutlined /></template>
              AI分析
            </a-button>
          </div>
          <div class="card-body card-body-scroll">
            <!-- 未触发分析时的提示 -->
            <div v-if="!analyzeData && !analyzeLoading" class="analyze-placeholder">
              <div class="analyze-placeholder-icon">🤖</div>
              <div class="analyze-placeholder-text">点击右上角"AI分析"按钮，生成故障分析报告</div>
            </div>
            <!-- 分析中 -->
            <div v-else-if="analyzeLoading" class="analyze-loading">
              <a-spin size="large" />
              <div class="analyze-loading-text">AI分析中，预估时间较长，请耐心等待...</div>
            </div>
            <!-- 分析结果 -->
            <template v-else-if="analyzeData?.fault_items?.length">
              <div
                class="alert-card"
                v-for="(item, index) in analyzeData.fault_items"
                :key="index"
                :class="getFaultClass(item)"
              >
                <div class="alert-icon">{{ getFaultIcon(item) }}</div>
                <div class="alert-content">
                  <div class="alert-title">{{ item.device_name }} - {{ item.fault_type }}</div>
                  <div class="alert-desc">原因: {{ item.cause }}</div>
                  <div class="alert-solution">建议: {{ item.solution }}</div>
                  <div class="alert-time">
                    故障时间: {{ formatTime(item.fault_time) }} | 持续: {{ item.duration || '--' }}
                  </div>
                </div>
              </div>
            </template>
            <a-empty v-else description="暂无分析数据" />
          </div>
        </div>
      </div>

      <!-- 维保优先级 -->
      <div class="card" v-if="analyzeData?.maintenance_priorities?.length">
        <div class="card-header">
          <h3>🔨 维保优先级</h3>
          <span class="tag tag-orange">AI建议</span>
        </div>
        <div class="card-body">
          <a-table
            :columns="maintenanceColumns"
            :data-source="analyzeData.maintenance_priorities"
            row-key="device_name"
            size="small"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'priority'">
                <span class="priority-tag" :class="getPriorityClass(record.priority)">{{ record.priority }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="card" v-if="analyzeData?.suggestions?.length">
        <div class="card-header">
          <h3>💡 AI优化建议</h3>
        </div>
        <div class="card-body">
          <div class="suggestion-list">
            <div
              class="suggestion-item"
              v-for="(suggestion, index) in analyzeData.suggestions"
              :key="index"
            >
              <span class="suggestion-index">{{ index + 1 }}</span>
              <span class="suggestion-text">{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 故障明细列表 -->
      <div class="card" v-if="queryData?.fault_list?.length">
        <div class="card-header">
          <h3>📋 故障明细列表</h3>
          <span class="tag tag-red">最近{{ queryData.fault_list.length }}条</span>
        </div>
        <div class="card-body">
          <AlertCard
            v-for="(item, index) in queryData.fault_list"
            :key="index"
            :level="getAlertLevel(item.alarm_level_name)"
            :title="`${item.device_name} - ${item.alarm_category_name}`"
            :description="item.alarm_content"
            :time="`告警时间: ${formatTime(item.alarm_time)}`"
            :show-actions="false"
          />
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { h, ref, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { StatCard, AlertCard } from '/@/views/bems-web/components'
import { ThunderboltOutlined } from '@ant-design/icons-vue'
import {
  getFaultQuery,
  getFaultAnalyze,
  type FaultQueryResponse,
  type FaultAnalyzeResponse,
  type FaultAnalysisItem,
} from './index.api'
import * as echarts from 'echarts'

defineOptions({ name: 'AiPredictPage' })

// emoji 图标
const FireIcon = () => h('span', { style: 'font-size: 20px;' }, '⚠️')
const DeviceIcon = () => h('span', { style: 'font-size: 20px;' }, '📡')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const ClockIcon = () => h('span', { style: 'font-size: 20px;' }, '⏰')

const queryLoading = ref(false)
const analyzeLoading = ref(false)
const queryData = ref<FaultQueryResponse | null>(null)
const analyzeData = ref<FaultAnalyzeResponse | null>(null)

// 图表引用
const trendChartRef = ref<HTMLElement>()
const trendChartInstance = shallowRef<echarts.ECharts>()

// 维保优先级表格列
const maintenanceColumns = [
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '设备名称', dataIndex: 'device_name', key: 'device_name', width: 150 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 130 },
  { title: '故障次数', dataIndex: 'fault_count', key: 'fault_count', width: 100 },
  { title: 'AI风险评分', dataIndex: 'ai_risk_score', key: 'ai_risk_score', width: 100 },
  { title: '建议操作', dataIndex: 'suggest_action', key: 'suggest_action', ellipsis: true },
  { title: '建议时限', dataIndex: 'suggest_time', key: 'suggest_time', width: 90 },
]

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '--'
  return time.replace('T', ' ').replace(/\.\d+Z$/, '').replace(/Z$/, '')
}

// 根据告警级别名称映射 AlertCard level
type AlertLevel = 'danger' | 'warning' | 'info'
const getAlertLevel = (levelName?: string): AlertLevel => {
  if (!levelName) return 'info'
  if (levelName.includes('非常紧急') || levelName.includes('紧急')) return 'danger'
  if (levelName.includes('高') || levelName.includes('重要')) return 'warning'
  return 'info'
}

// 获取故障分析项样式
const getFaultClass = (item: FaultAnalysisItem) => {
  const type = item.fault_type || ''
  if (type.includes('异常') || type.includes('过载') || type.includes('报警')) return 'danger'
  if (type.includes('不足') || type.includes('超标')) return 'warning'
  return 'info'
}

// 获取故障分析项图标
const getFaultIcon = (item: FaultAnalysisItem) => {
  const type = item.fault_type || ''
  if (type.includes('流速') || type.includes('流量')) return '💧'
  if (type.includes('压力')) return '📊'
  if (type.includes('温度')) return '🌡️'
  if (type.includes('电压') || type.includes('电气')) return '⚡'
  if (type.includes('能耗') || type.includes('能效')) return '📉'
  return '⚠️'
}

// 获取优先级样式
const getPriorityClass = (priority?: string) => {
  if (!priority) return ''
  if (priority.includes('紧急')) return 'priority-urgent'
  if (priority.includes('高')) return 'priority-high'
  if (priority.includes('中')) return 'priority-medium'
  return 'priority-low'
}

// 获取故障数据（快速查询）
const fetchData = async () => {
  queryLoading.value = true
  try {
    const res = await getFaultQuery({ time_range: 'month' })
    const data = (res as any)?.result ?? res
    queryData.value = data as FaultQueryResponse

    await nextTick()
    renderChart()
  } catch (error) {
    console.error('获取故障数据失败:', error)
  } finally {
    queryLoading.value = false
  }
}

// 点击 AI分析 按钮
const handleAnalyze = () => {
  fetchAnalyze()
}

// AI故障分析（LLM推理，耗时较长）
const fetchAnalyze = async () => {
  if (!queryData.value) return
  analyzeLoading.value = true
  analyzeData.value = null
  try {
    const res = await getFaultAnalyze(queryData.value)
    const data = (res as any)?.result ?? res
    analyzeData.value = data as FaultAnalyzeResponse
  } catch (error) {
    console.error('AI故障分析失败:', error)
  } finally {
    analyzeLoading.value = false
  }
}

// 渲染故障分布图
const renderChart = () => {
  if (!trendChartRef.value) return
  if (!trendChartInstance.value) {
    trendChartInstance.value = echarts.init(trendChartRef.value)
  }

  const categories = queryData.value?.fault_by_category ?? []
  if (!categories.length) {
    trendChartInstance.value.clear()
    return
  }

  const colors = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452', '#6DC8EC', '#945FB9']

  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      formatter: (params: any) => {
        const item = categories[params[0].dataIndex]
        if (!item) return ''
        return `<div style="font-weight:600;margin-bottom:6px;">${item.category}</div>
          <div>故障数: ${item.count}次</div>
          <div>占比: ${item.percentage}%</div>`
      },
    },
    grid: {
      left: '2%',
      right: '5%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories.map((c) => c.category),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: {
        color: '#718096',
        fontSize: 11,
        interval: 0,
        rotate: categories.length > 3 ? 15 : 0,
        formatter: (name: string) => (name.length > 8 ? name.substring(0, 8) + '...' : name),
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '故障数',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0aec0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: categories.map((c, idx) => ({
          value: c.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[idx % colors.length] },
              { offset: 1, color: colors[idx % colors.length] + '80' },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barWidth: '40%',
      },
    ],
  }
  trendChartInstance.value.setOption(option, true)
}

// 窗口大小调整
const resizeChart = () => {
  trendChartInstance.value?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  trendChartInstance.value?.dispose()
})
</script>

<style scoped lang="less">
.ai-page { padding: 0; }

// 统计卡片行
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

// 两栏布局
.two-col {
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
  }

  .card-body {
    padding: 22px;
  }
}

// 固定高度卡片 + 内容滚动
.fixed-card {
  display: flex;
  flex-direction: column;
  max-height: 500px;

  .card-header {
    flex-shrink: 0;
  }

  .card-body-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
}

// 图表容器
.chart-container {
  width: 100%;
  height: 380px;
}

// AI分析占位
.analyze-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .analyze-placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  .analyze-placeholder-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }
  .analyze-placeholder-sub {
    font-size: 12px;
    color: #a0aec0;
    margin-top: 8px;
  }
}

// AI分析加载中
.analyze-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .analyze-loading-text {
    font-size: 14px;
    color: #718096;
    margin-top: 16px;
    white-space: nowrap;
  }
}

// 告警卡片（故障分析清单）
.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid;

  &.danger {
    background: #fff5f5;
    border-left-color: #e53e3e;
  }
  &.warning {
    background: #fffaf0;
    border-left-color: #dd6b20;
  }
  &.info {
    background: #ebf8ff;
    border-left-color: #3182ce;
  }

  .alert-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  &.danger .alert-icon { background: #fed7d7; color: #e53e3e; }
  &.warning .alert-icon { background: #feebc8; color: #dd6b20; }
  &.info .alert-icon { background: #bee3f8; color: #3182ce; }

  .alert-content {
    flex: 1;

    .alert-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }
    .alert-desc {
      font-size: 12px;
      color: #718096;
      line-height: 1.5;
    }
    .alert-solution {
      font-size: 12px;
      color: #389e0d;
      line-height: 1.5;
      margin-top: 4px;
    }
    .alert-time {
      font-size: 11px;
      color: #a0aec0;
      margin-top: 6px;
    }
  }
}

// AI报告卡片
.ai-report-card {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;

  .ai-report-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .ai-badge {
      background: linear-gradient(135deg, #805ad5, #6b46c1);
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .ai-report-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
    }
  }

  .ai-report-desc {
    font-size: 13px;
    color: #718096;
    line-height: 1.7;
    margin-bottom: 16px;
  }

  .ai-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;

    .ai-metric {
      background: white;
      padding: 14px;
      border-radius: 8px;
      text-align: center;

      .ai-metric-value {
        font-size: 20px;
        font-weight: 700;
        color: #2d3748;
      }
      .ai-metric-label {
        font-size: 11px;
        color: #a0aec0;
        margin-top: 4px;
      }
    }
  }
}

// 维保优先级标签
.priority-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;

  &.priority-urgent { background: #ffccc7; color: #cf1322; }
  &.priority-high { background: #fff2f0; color: #ff4d4f; }
  &.priority-medium { background: #fff7e6; color: #fa8c16; }
  &.priority-low { background: #f6ffed; color: #52c41a; }
}

// 建议列表
.suggestion-list {
  .suggestion-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .suggestion-index {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e9d8fd;
      color: #6b46c1;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .suggestion-text {
      font-size: 13px;
      color: #4a5568;
      line-height: 1.6;
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
  .ai-report-card .ai-metrics { grid-template-columns: repeat(2, 1fr); }
}
</style>
