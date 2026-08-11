<template>
  <div class="ai-page">
    <a-spin :spinning="loading">
      <!-- 统计卡片行 -->
      <div class="stats-row">
        <StatCard
          label="监测能源类型"
          :value="reportData?.energy_structure?.categories?.length ?? 0"
          :change-text="energyTypeText"
          color="blue"
          :icon="ThunderIcon"
        />
        <StatCard
          label="今日用电量"
          :value="reportData?.today_electricity?.value ?? 0"
          :change-text="formatChange(reportData?.today_electricity?.change)"
          trend="down"
          color="green"
          :icon="GlobeIcon"
        />
        <StatCard
          label="今日用水量"
          :value="reportData?.today_water?.value ?? 0"
          :change-text="formatChange(reportData?.today_water?.change)"
          trend="down"
          color="orange"
          :icon="ChartDownIcon"
        />
        <StatCard
          label="表计在线率"
          :value="reportData?.meter_online_rate ?? '-'"
          :change-text="`表计总数 ${reportData?.meter_total ?? 0}`"
          color="purple"
          :icon="ChartIcon"
        />
      </div>

      <!-- AI报告卡片 -->
      <div class="ai-report-card" v-if="reportData">
        <div class="ai-report-header">
          <span class="ai-badge">AI</span>
          <span class="ai-report-title">{{ reportData.report_title }}</span>
          <span class="ai-report-time">{{ reportData.report_time }}</span>
        </div>
        <div class="ai-report-desc">{{ reportData.summary }}</div>
        <div class="ai-metrics">
          <div class="ai-metric">
            <div class="ai-metric-value">{{ reportData.meter_total }}</div>
            <div class="ai-metric-label">计费表计总数</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">{{ reportData.meter_online_rate }}</div>
            <div class="ai-metric-label">表计在线率</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">{{ reportData.overview?.subsystem_count ?? 0 }}</div>
            <div class="ai-metric-label">子系统数量</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">{{ reportData.air_condition?.total_count ?? 0 }}</div>
            <div class="ai-metric-label">空调机组数量</div>
          </div>
        </div>
      </div>

      <!-- 两栏布局：用能结构分析 + 各场馆用电对比 -->
      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <h3>🌍 用能结构分析</h3>
          </div>
          <div class="card-body">
            <div ref="structureChartRef" class="chart-container"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3>📈 各场馆用电对比</h3>
          </div>
          <div class="card-body">
            <div ref="compareChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>

      <!-- 子系统概览 -->
      <div class="card" v-if="reportData">
        <div class="card-header">
          <h3>⚙️ 子系统运行概览</h3>
        </div>
        <div class="card-body">
          <div class="subsystem-grid">
            <div class="subsystem-item">
              <div class="subsystem-name">空调机组</div>
              <div class="subsystem-stats">
                <span class="stat-item">总数: {{ reportData.air_condition?.total_count ?? 0 }}</span>
                <span class="stat-item running">运行: {{ reportData.air_condition?.running_count ?? 0 }}</span>
                <span class="stat-item fault">故障: {{ reportData.air_condition?.fault_count ?? 0 }}</span>
              </div>
            </div>
            <div class="subsystem-item">
              <div class="subsystem-name">新风机组</div>
              <div class="subsystem-stats">
                <span class="stat-item">总数: {{ reportData.fresh_air?.total_count ?? 0 }}</span>
                <span class="stat-item running">运行: {{ reportData.fresh_air?.running_count ?? 0 }}</span>
                <span class="stat-item">PM2.5: {{ reportData.fresh_air?.avg_pm25 ?? '-' }}</span>
              </div>
            </div>
            <div class="subsystem-item">
              <div class="subsystem-name">配电系统</div>
              <div class="subsystem-stats">
                <span class="stat-item">总数: {{ reportData.power_distribution?.total_count ?? 0 }}</span>
                <span class="stat-item running">运行: {{ reportData.power_distribution?.running_count ?? 0 }}</span>
                <span class="stat-item">功率因数: {{ reportData.power_distribution?.power_factor ?? '-' }}</span>
              </div>
            </div>
            <div class="subsystem-item">
              <div class="subsystem-name">冷源系统</div>
              <div class="subsystem-stats">
                <span class="stat-item">总数: {{ reportData.cold_source?.total_count ?? 0 }}</span>
                <span class="stat-item">COP: {{ reportData.cold_source?.avg_cop ?? '-' }}</span>
                <span class="stat-item">今日制冷: {{ reportData.cold_source?.today_cooling ?? 0 }}</span>
              </div>
            </div>
            <div class="subsystem-item">
              <div class="subsystem-name">光伏系统</div>
              <div class="subsystem-stats">
                <span class="stat-item">装机容量: {{ reportData.photovoltaic?.installed_capacity ?? 0 }}kW</span>
                <span class="stat-item">今日发电: {{ reportData.photovoltaic?.today_generation ?? 0 }}kWh</span>
                <span class="stat-item">效率: {{ reportData.photovoltaic?.efficiency ?? 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="card" v-if="reportData?.suggestions?.length">
        <div class="card-header">
          <h3>💡 优化建议</h3>
        </div>
        <div class="card-body">
          <div class="suggestion-list">
            <div class="suggestion-item" v-for="(suggestion, index) in reportData.suggestions" :key="index">
              <span class="suggestion-index">{{ index + 1 }}</span>
              <span class="suggestion-text">{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { h, ref, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import { getEnergyAnalysis, type EnergyAnalysisReport } from './index.api'
import * as echarts from 'echarts'

defineOptions({ name: 'AiCarbonPage' })

// emoji 图标
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const GlobeIcon = () => h('span', { style: 'font-size: 20px;' }, '🌍')
const ChartDownIcon = () => h('span', { style: 'font-size: 20px;' }, '📉')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')

const loading = ref(false)
const reportData = ref<EnergyAnalysisReport | null>(null)

// 图表引用
const structureChartRef = ref<HTMLElement>()
const compareChartRef = ref<HTMLElement>()
const structureChartInstance = shallowRef<echarts.ECharts>()
const compareChartInstance = shallowRef<echarts.ECharts>()

// 能源类型文本
const energyTypeText = ref('')

// 格式化变化率
const formatChange = (change?: string) => {
  if (!change) return ''
  return `较上期 ${change}`
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getEnergyAnalysis({
      system_type: 'overview',
      time_range: 'day',
    })
    // 兼容包装和非包装格式
    const data = (res as any)?.result ?? res
    reportData.value = data as EnergyAnalysisReport

    // 设置能源类型文本
    const categories = reportData.value?.energy_structure?.categories ?? []
    energyTypeText.value = categories.join('/')

    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('获取能源分析报告失败:', error)
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderCharts = () => {
  renderStructureChart()
  renderCompareChart()
}

// 用能结构饼图
const renderStructureChart = () => {
  if (!structureChartRef.value) return
  if (!structureChartInstance.value) {
    structureChartInstance.value = echarts.init(structureChartRef.value)
  }

  const structure = reportData.value?.energy_structure
  if (!structure) return

  const categories = structure.categories || []
  const data = structure.data || []

  const pieColors = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452', '#6DC8EC', '#945FB9']

  const option: any = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)',
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
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
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
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: categories.map((name, idx) => ({
          name,
          value: data[idx] || 0,
          itemStyle: { color: pieColors[idx % pieColors.length] },
        })),
      },
    ],
  }
  structureChartInstance.value.setOption(option, true)
}

// 各场馆用电对比柱状图
const renderCompareChart = () => {
  if (!compareChartRef.value) return
  if (!compareChartInstance.value) {
    compareChartInstance.value = echarts.init(compareChartRef.value)
  }

  const compare = reportData.value?.venue_electricity_compare
  if (!compare) return

  const categories = compare.categories || []
  const dataMap = compare.data || {}

  // 提取每个分类的值（取数组第一个元素）
  const values = categories.map((cat) => {
    const arr = dataMap[cat]
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : 0
  })

  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
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
      data: categories,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#718096', fontSize: 12, interval: 0, rotate: categories.length > 4 ? 15 : 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0aec0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: values,
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#5B8FF9' },
            { offset: 1, color: '#85B7FF' },
          ]),
        },
      },
    ],
  }
  compareChartInstance.value.setOption(option, true)
}

// 窗口大小调整
const resizeCharts = () => {
  structureChartInstance.value?.resize()
  compareChartInstance.value?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  structureChartInstance.value?.dispose()
  compareChartInstance.value?.dispose()
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
  }

  .card-body {
    padding: 22px;
  }
}

// 图表容器
.chart-container {
  width: 100%;
  height: 300px;
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
    .ai-report-time {
      font-size: 12px;
      color: #a0aec0;
      margin-left: auto;
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

// 子系统网格
.subsystem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  .subsystem-item {
    background: #f7fafc;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid #e2e8f0;

    .subsystem-name {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 10px;
    }

    .subsystem-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .stat-item {
        font-size: 12px;
        color: #718096;
        background: white;
        padding: 4px 10px;
        border-radius: 6px;

        &.running { color: #389e0d; }
        &.fault { color: #cf1322; }
      }
    }
  }
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
      background: #e6f4ff;
      color: #1677ff;
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
