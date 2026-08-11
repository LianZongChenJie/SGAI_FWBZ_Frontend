<template>
  <div class="ai-page">
    <a-spin :spinning="loading">
      <!-- 统计卡片行 -->
      <div class="stats-row">
        <StatCard
          label="预测项数量"
          :value="reportData?.predict_items?.length ?? 0"
          change-text="AI预测"
          trend="up"
          color="blue"
          :icon="BrainIcon"
        />
        <StatCard
          label="预警项数量"
          :value="reportData?.warning_items?.length ?? 0"
          change-text="需关注"
          color="orange"
          :icon="TargetIcon"
        />
        <StatCard
          label="平均置信度"
          :value="avgConfidence + '%'"
          change-text="预测可靠性"
          trend="up"
          color="green"
          :icon="ClockIcon"
        />
        <StatCard
          label="优化建议数"
          :value="reportData?.suggestions?.length ?? 0"
          change-text="AI建议"
          color="purple"
          :icon="HitIcon"
        />
      </div>

      <!-- AI报告卡片 -->
      <div class="ai-report-card" v-if="reportData">
        <div class="ai-report-header">
          <span class="ai-badge">AI</span>
          <span class="ai-report-title">{{ reportData.report_title || '设备运行趋势预测报告' }}</span>
        </div>
        <div class="ai-report-desc">{{ reportData.summary }}</div>
        <div class="ai-metrics">
          <div class="ai-metric" v-for="(item, index) in topPredictItems" :key="index">
            <div class="ai-metric-value" :class="item.trend">{{ item.predict_value }}</div>
            <div class="ai-metric-label">{{ item.item_name }}</div>
            <div class="ai-metric-confidence">置信度 {{ (item.confidence * 100).toFixed(0) }}%</div>
          </div>
        </div>
      </div>

      <!-- 两栏布局：能耗趋势预测 + 设备预警清单 -->
      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <h3>📈 能耗趋势预测</h3>
            <span class="tag tag-purple">AI预测</span>
          </div>
          <div class="card-body">
            <div ref="trendChartRef" class="chart-container"></div>
            <!-- 预测项详情列表 -->
            <div class="predict-list" v-if="reportData?.predict_items?.length">
              <div
                class="predict-item"
                v-for="(item, index) in reportData.predict_items"
                :key="index"
              >
                <div class="predict-item-header">
                  <span class="predict-item-name">{{ item.item_name }}</span>
                  <span class="predict-item-trend" :class="item.trend">
                    <span v-if="item.trend === 'up'">↑</span>
                    <span v-else-if="item.trend === 'down'">↓</span>
                    <span v-else>→</span>
                    {{ item.predict_value }}
                  </span>
                </div>
                <div class="predict-item-desc">{{ item.description }}</div>
                <div class="predict-item-confidence">
                  置信度: {{ (item.confidence * 100).toFixed(0) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3>⚠️ 设备预警清单</h3>
            <span class="tag tag-red">需关注</span>
          </div>
          <div class="card-body">
            <a-empty v-if="!reportData?.warning_items?.length" description="暂无预警" />
            <template v-else>
              <div
                class="alert-card"
                v-for="(warning, index) in reportData.warning_items"
                :key="index"
                :class="getWarningClass(warning)"
              >
                <div class="alert-icon">{{ getWarningIcon(warning) }}</div>
                <div class="alert-content">
                  <div class="alert-title">{{ warning.device_name }} - {{ warning.warning_type }}</div>
                  <div class="alert-desc">{{ warning.warning_content }}</div>
                  <div class="alert-time">
                    预测置信度 {{ (warning.confidence * 100).toFixed(0) }}% | 建议处理时间: {{ warning.suggest_time }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="card" v-if="reportData?.suggestions?.length">
        <div class="card-header">
          <h3>💡 AI优化建议</h3>
        </div>
        <div class="card-body">
          <div class="suggestion-list">
            <div
              class="suggestion-item"
              v-for="(suggestion, index) in reportData.suggestions"
              :key="index"
            >
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
import { StatCard } from '/@/views/bems-web/components'
import { getPredictReport, type PredictReport } from './index.api'
import * as echarts from 'echarts'

defineOptions({ name: 'AiPredictPage' })

// emoji 图标
const BrainIcon = () => h('span', { style: 'font-size: 20px;' }, '🧠')
const TargetIcon = () => h('span', { style: 'font-size: 20px;' }, '🎯')
const ClockIcon = () => h('span', { style: 'font-size: 20px;' }, '⏰')
const HitIcon = () => h('span', { style: 'font-size: 20px;' }, '🎯')

const loading = ref(false)
const reportData = ref<PredictReport | null>(null)

// 图表引用
const trendChartRef = ref<HTMLElement>()
const trendChartInstance = shallowRef<echarts.ECharts>()

// 平均置信度
const avgConfidence = computed(() => {
  const items = reportData.value?.predict_items ?? []
  if (!items.length) return '0'
  const sum = items.reduce((acc, item) => acc + item.confidence, 0)
  return (sum / items.length * 100).toFixed(0)
})

// 取前4个预测项展示在指标卡片中
const topPredictItems = computed(() => {
  return (reportData.value?.predict_items ?? []).slice(0, 4)
})

// 获取预警样式
const getWarningClass = (warning: any) => {
  const confidence = warning.confidence
  if (confidence >= 0.9) return 'danger'
  if (confidence >= 0.8) return 'warning'
  return 'info'
}

// 获取预警图标
const getWarningIcon = (warning: any) => {
  const type = warning.warning_type || ''
  if (type.includes('电压') || type.includes('电气')) return '⚡'
  if (type.includes('能耗') || type.includes('能效')) return '📊'
  if (type.includes('水位') || type.includes('水')) return '💧'
  if (type.includes('温度') || type.includes('温')) return '🌡️'
  return '⚠️'
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPredictReport({
      predict_type: 'all',
      time_range: 'week',
    })
    // 兼容包装和非包装格式
    const data = (res as any)?.result ?? res
    reportData.value = data as PredictReport

    await nextTick()
    renderTrendChart()
  } catch (error) {
    console.error('获取AI预测报告失败:', error)
  } finally {
    loading.value = false
  }
}

// 渲染预测趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return
  if (!trendChartInstance.value) {
    trendChartInstance.value = echarts.init(trendChartRef.value)
  }

  const items = reportData.value?.predict_items ?? []
  if (!items.length) {
    trendChartInstance.value.clear()
    return
  }

  const itemNames = items.map((item) => item.item_name)

  const trendColors: Record<string, string> = {
    up: '#E86452',
    down: '#52C41A',
    stable: '#5B8FF9',
  }

  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      formatter: (params: any) => {
        const item = items[params[0].dataIndex]
        if (!item) return ''
        return `<div style="font-weight:600;margin-bottom:6px;">${item.item_name}</div>
          <div>预测值: ${item.predict_value}</div>
          <div>置信度: ${(item.confidence * 100).toFixed(0)}%</div>
          <div style="margin-top:4px;color:#718096;">${item.description}</div>`
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
      data: itemNames,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: {
        color: '#718096',
        fontSize: 11,
        interval: 0,
        rotate: itemNames.length > 3 ? 15 : 0,
        formatter: (name: string) => name.length > 8 ? name.substring(0, 8) + '...' : name,
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '置信度(%)',
      max: 100,
      min: 0,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0aec0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: items.map((item) => ({
          value: parseFloat((item.confidence * 100).toFixed(1)),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: trendColors[item.trend] || '#5B8FF9' },
              { offset: 1, color: (trendColors[item.trend] || '#5B8FF9') + '80' },
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

// 图表容器
.chart-container {
  width: 100%;
  height: 240px;
  margin-bottom: 16px;
}

// 预测项列表
.predict-list {
  .predict-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .predict-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;

      .predict-item-name {
        font-size: 13px;
        font-weight: 600;
        color: #2d3748;
      }

      .predict-item-trend {
        font-size: 12px;
        font-weight: 600;

        &.up { color: #e53e3e; }
        &.down { color: #389e0d; }
        &.stable { color: #3182ce; }
      }
    }

    .predict-item-desc {
      font-size: 12px;
      color: #718096;
      line-height: 1.5;
      margin-bottom: 4px;
    }

    .predict-item-confidence {
      font-size: 11px;
      color: #a0aec0;
    }
  }
}

// 告警卡片
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

        &.up { color: #e53e3e; }
        &.down { color: #389e0d; }
        &.stable { color: #3182ce; }
      }
      .ai-metric-label {
        font-size: 11px;
        color: #a0aec0;
        margin-top: 4px;
      }
      .ai-metric-confidence {
        font-size: 10px;
        color: #cbd5e0;
        margin-top: 2px;
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
