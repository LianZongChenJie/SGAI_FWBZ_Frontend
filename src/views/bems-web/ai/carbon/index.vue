<template>
  <div class="ai-page">
    <a-spin :spinning="queryLoading">
      <!-- 统计卡片行 -->
      <div class="stats-row">
        <StatCard
          label="监测能源类型"
          :value="queryData?.energy_structure?.categories?.length ?? 0"
          :change-text="energyTypeText"
          color="blue"
          :icon="ThunderIcon"
        />
        <StatCard
          label="今日用电量"
          :value="queryData?.today_usage?.electricity?.value ?? 0"
          :change-text="formatChange(queryData?.today_usage?.electricity?.change)"
          trend="down"
          color="green"
          :icon="GlobeIcon"
        />
        <StatCard
          label="今日用水量"
          :value="queryData?.today_usage?.water?.value ?? 0"
          :change-text="formatChange(queryData?.today_usage?.water?.change)"
          trend="down"
          color="orange"
          :icon="ChartDownIcon"
        />
        <StatCard
          label="表计在线率"
          :value="queryData?.meter_data?.online_rate ?? '-'"
          :change-text="`表计总数 ${queryData?.meter_data?.total ?? 0}`"
          color="purple"
          :icon="ChartIcon"
        />
      </div>

      <!-- AI报告卡片 -->
      <div class="ai-report-card" v-if="analyzeData">
        <div class="ai-report-header">
          <span class="ai-badge">AI</span>
          <span class="ai-report-title">{{ analyzeData.report_title || '能源分析报告' }}</span>
          <span class="ai-report-time">{{ analyzeData.report_time }}</span>
        </div>
        <div class="ai-report-desc">{{ analyzeData.summary }}</div>
        <div class="ai-metrics">
          <div class="ai-metric">
            <div class="ai-metric-value">{{ analyzeData.meter_total }}</div>
            <div class="ai-metric-label">计费表计总数</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">{{ analyzeData.meter_online_rate }}</div>
            <div class="ai-metric-label">表计在线率</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">{{ analyzeData.overview?.subsystem_count ?? 0 }}</div>
            <div class="ai-metric-label">子系统数量</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">{{ analyzeData.air_condition?.total_count ?? 0 }}</div>
            <div class="ai-metric-label">空调机组数量</div>
          </div>
        </div>
      </div>
      <!-- AI分析占位 -->
      <div class="ai-report-card ai-report-placeholder" v-else-if="!analyzeLoading">
        <div class="ai-placeholder-inner">
          <div class="ai-placeholder-icon">🤖</div>
          <div class="ai-placeholder-text">点击下方"AI分析"按钮，生成能源分析报告</div>
        </div>
      </div>
      <!-- AI分析加载中 -->
      <div class="ai-report-card ai-report-loading" v-else-if="analyzeLoading">
        <div class="ai-loading-inner">
          <a-spin size="large" />
          <div class="ai-loading-text">AI分析中，预估时间较长，请耐心等待...</div>
        </div>
      </div>

      <!-- 两栏布局：用能结构分析 + 各场馆用电对比 -->
      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <h3>🌍 用能结构分析</h3>
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
      <div class="card" v-if="queryData">
        <div class="card-header">
          <h3>⚙️ 子系统运行概览</h3>
        </div>
        <div class="card-body">
          <div class="subsystem-grid">
            <DeviceCard
              v-for="(item, index) in subsystemCards"
              :key="index"
              :title="item.title"
              :meta="item.meta"
              :icon="item.icon"
              :icon-bg="item.iconBg"
              :icon-color="item.iconColor"
              :stats="item.stats"
            />
          </div>
        </div>
      </div>

      <!-- 异常警告 -->
      <div class="card" v-if="analyzeData?.warnings?.length">
        <div class="card-header">
          <h3>⚠️ 异常警告</h3>
          <span class="tag tag-red">{{ analyzeData.warnings.length }}条</span>
        </div>
        <div class="card-body">
          <div class="warning-list">
            <div class="warning-item" v-for="(warning, index) in analyzeData.warnings" :key="index">
              <span class="warning-icon">⚠️</span>
              <span class="warning-text">{{ warning }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="card" v-if="analyzeData?.suggestions?.length">
        <div class="card-header">
          <h3>💡 AI优化建议</h3>
        </div>
        <div class="card-body">
          <div class="suggestion-list">
            <div class="suggestion-item" v-for="(suggestion, index) in analyzeData.suggestions" :key="index">
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
import { h, ref, computed, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { StatCard, DeviceCard } from '/@/views/bems-web/components'
import { ThunderboltOutlined } from '@ant-design/icons-vue'
import { getEnergyQuery, getEnergyAnalyze, type EnergyQueryResponse, type EnergyAnalysisReport } from './index.api'
import * as echarts from 'echarts'

defineOptions({ name: 'AiCarbonPage' })

// emoji 图标
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const GlobeIcon = () => h('span', { style: 'font-size: 20px;' }, '🌍')
const ChartDownIcon = () => h('span', { style: 'font-size: 20px;' }, '📉')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')

// 子系统图标
const AirConditionIcon = () => h('span', { style: 'font-size: 20px;' }, '❄️')
const FreshAirIcon = () => h('span', { style: 'font-size: 20px;' }, '🌀')
const PowerDistIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const ColdSourceIcon = () => h('span', { style: 'font-size: 20px;' }, '🧊')
const PhotovoltaicIcon = () => h('span', { style: 'font-size: 20px;' }, '☀️')

const queryLoading = ref(false)
const analyzeLoading = ref(false)
const queryData = ref<EnergyQueryResponse | null>(null)
const analyzeData = ref<EnergyAnalysisReport | null>(null)

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

// 子系统卡片数据
const subsystemCards = computed(() => {
  const d = queryData.value
  if (!d) return []
  return [
    {
      title: '空调机组',
      meta: '暖通系统',
      icon: AirConditionIcon,
      iconBg: '#e6f4ff',
      iconColor: '#1677ff',
      stats: [
        { label: '总数', value: d.air_condition?.total_count ?? 0 },
        { label: '运行', value: d.air_condition?.running_count ?? 0 },
        { label: '故障', value: d.air_condition?.fault_count ?? 0, highlight: true },
      ],
    },
    {
      title: '新风机组',
      meta: '通风系统',
      icon: FreshAirIcon,
      iconBg: '#f6ffed',
      iconColor: '#52c41a',
      stats: [
        { label: '总数', value: d.fresh_air?.total_count ?? 0 },
        { label: '运行', value: d.fresh_air?.running_count ?? 0 },
        { label: 'PM2.5', value: d.fresh_air?.avg_pm25 ?? '-' },
      ],
    },
    {
      title: '配电系统',
      meta: '电力系统',
      icon: PowerDistIcon,
      iconBg: '#fff7e6',
      iconColor: '#fa8c16',
      stats: [
        { label: '总数', value: d.power_distribution?.total_count ?? 0 },
        { label: '运行', value: d.power_distribution?.running_count ?? 0 },
        { label: '功率因数', value: d.power_distribution?.power_factor ?? '-' },
      ],
    },
    {
      title: '冷源系统',
      meta: '制冷系统',
      icon: ColdSourceIcon,
      iconBg: '#e6fffb',
      iconColor: '#13c2c2',
      stats: [
        { label: '总数', value: d.cold_source?.total_count ?? 0 },
        { label: 'COP', value: d.cold_source?.avg_cop ?? '-' },
        { label: '今日制冷', value: d.cold_source?.today_cooling ?? 0 },
      ],
    },
    {
      title: '光伏系统',
      meta: '新能源',
      icon: PhotovoltaicIcon,
      iconBg: '#fffbe6',
      iconColor: '#faad14',
      stats: [
        { label: '装机容量', value: `${d.photovoltaic?.installed_capacity ?? 0}kW` },
        { label: '今日发电', value: `${d.photovoltaic?.today_generation ?? 0}kWh` },
        { label: '效率', value: `${d.photovoltaic?.efficiency ?? 0}%` },
      ],
    },
  ]
})

// 查询能源数据（快速，<1秒）
const fetchData = async () => {
  queryLoading.value = true
  try {
    const res = await getEnergyQuery({
      system_type: 'overview',
      time_range: 'day',
    })
    const data = (res as any)?.result ?? res
    queryData.value = data as EnergyQueryResponse

    // 设置能源类型文本
    const categories = queryData.value?.energy_structure?.categories ?? []
    energyTypeText.value = categories.join('/')

    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('获取能源数据失败:', error)
  } finally {
    queryLoading.value = false
  }
}

// 点击 AI分析 按钮
const handleAnalyze = () => {
  fetchAnalyze()
}

// AI能源分析（LLM推理，耗时较长）
const fetchAnalyze = async () => {
  if (!queryData.value) return
  analyzeLoading.value = true
  analyzeData.value = null
  try {
    const res = await getEnergyAnalyze(queryData.value)
    const data = (res as any)?.result ?? res
    analyzeData.value = data as EnergyAnalysisReport
  } catch (error) {
    console.error('AI能源分析失败:', error)
  } finally {
    analyzeLoading.value = false
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

  const structure = queryData.value?.energy_structure
  if (!structure) return

  const categories = structure.categories || []
  const data = structure.data || []

  const pieColors = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452', '#6DC8EC', '#945FB9']

  const option: any = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#666', fontSize:14 },
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
            fontSize:16,
            fontWeight: 'bold',
          },
        },
        data: categories.map((name, idx) => ({
          name,
          value: Number(data[idx]) || 0,
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

  const compare = queryData.value?.venue_electricity_compare
  if (!compare) return

  const categories = compare.categories || []
  const dataMap = compare.data || {}

  // 提取每个分类的值（取数组第一个元素）
  const values = categories.map((cat) => {
    const arr = dataMap[cat]
    return Array.isArray(arr) && arr.length > 0 ? Number(arr[0]) || 0 : 0
  })

  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748', fontSize:14 },
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
      axisLabel: { color: '#718096', fontSize:14, interval: 0, rotate: categories.length > 4 ? 15 : 0 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0aec0', fontSize:13 },
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

    .tag {
      font-size:13px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-red { background: #fed7d7; color: #742a2a; }
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

  &.ai-report-placeholder,
  &.ai-report-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
  }

  .ai-placeholder-inner,
  .ai-loading-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .ai-placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  .ai-placeholder-text {
    font-size:16px;
    color: #718096;
    font-weight: 500;
  }
  .ai-placeholder-sub {
    font-size:14px;
    color: #a0aec0;
    margin-top: 8px;
  }

  .ai-loading-text {
    font-size:16px;
    color: #718096;
    margin-top: 16px;
    white-space: nowrap;
  }

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
      font-size:13px;
      font-weight: 600;
    }
    .ai-report-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
    }
    .ai-report-time {
      font-size:14px;
      color: #a0aec0;
      margin-left: auto;
    }
  }

  .ai-report-desc {
    font-size:16px;
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
        font-size:13px;
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
}

// 异常警告列表
.warning-list {
  .warning-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .warning-icon {
      flex-shrink: 0;
      font-size: 16px;
    }
    .warning-text {
      font-size:16px;
      color: #4a5568;
      line-height: 1.6;
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
      font-size:14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .suggestion-text {
      font-size:16px;
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
