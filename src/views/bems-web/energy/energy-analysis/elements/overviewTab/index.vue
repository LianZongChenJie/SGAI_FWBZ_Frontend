<template>
  <div class="overview-tab">
    <!-- KPI 条 -->
    <div class="kpi-grid">
      <div v-for="kpi in kpiList" :key="kpi.key" class="kpi-card" :class="kpi.accent">
        <div class="kpi-card__head">
          <span class="kpi-card__label">{{ kpi.label }}</span>
          <span v-if="kpi.tag" class="kpi-card__tag">{{ kpi.tag }}</span>
        </div>
        <div class="kpi-card__value" :class="kpi.textColor">
          {{ kpi.value }}<span v-if="kpi.unit" class="kpi-card__unit">{{ kpi.unit }}</span>
        </div>
        <div class="kpi-card__sub">{{ kpi.sub }}</div>
      </div>
    </div>

    <!-- 主图 + 右侧栏 -->
    <div class="main-wrap">
      <!-- 今日逐时冷负荷 · 预测与实测闭环 -->
      <a-card class="chart-card" :bordered="false">
        <div class="chart-card__header">
          <div class="chart-card__title">
            <span>今日逐时冷负荷 · 预测与实测闭环</span>
            <span class="chart-card__tag">P50 / P90 置信带</span>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color legend-color--band"></span>P90 置信带 (80%)
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #1f3a5f"></span>P50 预测
            </span>
            <span class="legend-item">
              <span class="legend-color legend-color--dot" style="background: #fa8c16"></span>实测
            </span>
          </div>
        </div>
        <div class="chart-card__body">
          <div v-show="chartLoading" class="chart-placeholder">
            <a-spin />
            <span>加载中...</span>
          </div>
          <div v-show="!chartLoading" ref="loadChartRef" class="load-chart"></div>
        </div>
      </a-card>

      <!-- 右侧栏 -->
      <div class="side-panel">
        <!-- 本拍下发摘要 -->
        <a-card class="side-card" :bordered="false">
          <div class="side-card__title">
            <span>本拍下发摘要</span>
            <span class="side-card__extra">{{ dispatch.shootTime }}</span>
          </div>
          <div class="dispatch-list">
            <div class="dispatch-row">
              <span class="dispatch-row__label">下发设定值</span>
              <span class="dispatch-row__value">{{ dispatch.sendCount }} 条</span>
            </div>
            <div class="dispatch-row">
              <span class="dispatch-row__label">成功</span>
              <span class="dispatch-row__value is-green">{{ dispatch.successCount }}</span>
            </div>
            <div class="dispatch-row">
              <span class="dispatch-row__label">越限钳位</span>
              <span class="dispatch-row__value is-orange">{{ dispatch.clampCount }}</span>
            </div>
            <div class="dispatch-row">
              <span class="dispatch-row__label">回退厂商</span>
              <span class="dispatch-row__value">{{ dispatch.fallbackCount }}</span>
            </div>
          </div>
          <div class="dispatch-action">
            <span class="dispatch-action__label">最近动作</span>
            <span class="dispatch-action__badge dispatch-action__badge--ok">{{ dispatch.lastAction }}</span>
          </div>
        </a-card>

        <!-- 优化层状态 -->
        <a-card class="side-card" :bordered="false">
          <div class="side-card__title side-card__title--full">优化层状态</div>
          <div class="optimizer-wrap">
            <div class="optimizer-ring">
              <svg viewBox="0 0 100 100">
                <circle class="optimizer-ring__bg" cx="50" cy="50" r="42" />
                <circle
                  class="optimizer-ring__fg"
                  cx="50"
                  cy="50"
                  r="42"
                  :style="{ strokeDashoffset: optimizer.ringOffset }"
                />
              </svg>
            </div>
            <div class="optimizer-meta">
              <div class="optimizer-meta__status">{{ optimizer.status }}</div>
              <div class="optimizer-meta__row">模式：{{ optimizer.mode }}</div>
              <div class="optimizer-meta__row">预测精度 {{ optimizer.accuracy }}</div>
            </div>
          </div>
        </a-card>

        <!-- 设备在线概览 -->
        <a-card class="side-card side-card--device" :bordered="false">
          <div class="side-card__title side-card__title--full">
            <span>设备在线概览</span>
            <span class="side-card__extra">{{ chillers.length }} 冷机 · {{ heatPumps.length }} 热泵</span>
          </div>
          <div class="device-section">
            <div class="device-section__label">集中冷机 <span>（{{ chillers.length }} 台）</span></div>
            <div class="chiller-list">
              <div v-for="ch in chillers" :key="ch.name" class="chiller-item">
                <span class="chiller-item__name">{{ ch.name }}</span>
                <span class="chiller-item__status" :class="ch.online ? 'is-on' : 'is-off'">
                  {{ ch.online ? '运行' : '停止' }}
                </span>
              </div>
            </div>
          </div>
          <div class="device-section">
            <div class="device-section__label">风冷热泵 <span>（{{ heatPumps.length }} 台）</span></div>
            <div class="heatpump-grid">
              <div
                v-for="hp in heatPumps"
                :key="hp.name"
                class="heatpump-cell"
                :class="hp.online ? 'is-on' : 'is-off'"
              >
                <span class="heatpump-cell__name">{{ hp.name }}</span>
                <span class="heatpump-cell__status" :class="hp.online ? 'is-on' : 'is-off'">
                  {{ hp.online ? '运行' : '停止' }}
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useECharts } from '/@/hooks/web/useECharts'
import {
  getEnergyAnalysisOverview,
  getLoadChartData,
  getDispatchSummary,
  getOptimizerStatus,
  getDeviceStatus,
} from './index.api'

// ===== KPI 条 =====
interface KpiItem {
  key: string
  label: string
  value: string
  unit?: string
  tag?: string
  sub: string
  accent: 'navy' | 'green' | 'orange'
  textColor?: string
}

const kpiList = ref<KpiItem[]>([
  {
    key: 'cop',
    label: '冷站综合 COP',
    value: '5.82',
    tag: '↑0.34 ',
    sub: '对标 TCECS 1100-2022',
    accent: 'navy',
  },
  {
    key: 'load',
    label: '当前冷负荷',
    value: '6,840',
    unit: 'kW',
    sub: 'P50 6,900 / P90 上界 7,720',
    accent: 'navy',
  },
  {
    key: 'power',
    label: '瞬时总功率',
    value: '1,175',
    unit: 'kW',
    sub: '冷机·泵·塔 联立',
    accent: 'navy',
  },
  {
    key: 'saving',
    label: '今日累计节能量',
    value: '2,140',
    unit: 'kWh',
    sub: '节能率 12.3% · 影子期基线',
    accent: 'green',
    textColor: 'is-green',
  },
  {
    key: 'peakCut',
    label: '峰段移峰削减',
    value: '1,820',
    unit: 'kW',
    sub: '较厂商基线峰值',
    accent: 'green',
    textColor: 'is-green',
  },
  {
    key: 'price',
    label: '当前电价时段',
    value: '峰',
    unit: '1.26 元/kWh',
    sub: '15:00 转平段',
    accent: 'orange',
    textColor: 'is-orange',
  },
  {
    key: 'mode',
    label: '优化模式',
    value: '闭环在线',
    sub: '连续 96 拍安全下发',
    accent: 'navy',
  },
  {
    key: 'next',
    label: '距下一拍',
    value: '00:43:21',
    sub: '每小时一拍 · MPC 滚动',
    accent: 'navy',
  },
])

/** 加载 KPI 总览数据，接口失败时保留模拟值 */
const loadOverview = async () => {
  try {
    const res = await getEnergyAnalysisOverview()
    const map: Record<string, Partial<KpiItem>> = {
      cop: { value: res.cop, tag: res.copTag, sub: res.copChange },
      load: { value: res.load, sub: res.loadRange },
      power: { value: res.power },
      saving: { value: res.saving, sub: res.savingRate },
      peakCut: { value: res.peakCut },
      price: { value: res.pricePeriod, unit: res.priceUnit, sub: res.priceNext },
      mode: { value: res.mode, sub: res.modeDesc },
      next: { value: res.nextAction, sub: res.nextActionDesc },
    }
    kpiList.value = kpiList.value.map((item) => ({ ...item, ...(map[item.key] || {}) }))
  } catch (e) {
    console.error('加载能源分析总览数据失败:', e)
  }
}

// ===== 今日逐时冷负荷 · 预测与实测闭环 =====
const loadChartRef = ref<HTMLDivElement>()
const chartLoading = ref(false)
const { setOptions: setLoadChartOptions } = useECharts(loadChartRef as any)

/** 峰平谷电价时段（背景色带，按小时索引 0~24） */
const pricePeriods = [
  { name: '谷', start: 0, end: 6, color: 'rgba(82, 196, 26, 0.14)' },
  { name: '平', start: 6, end: 8, color: 'rgba(0, 0, 0, 0.04)' },
  { name: '峰', start: 8, end: 11, color: 'rgba(250, 140, 16, 0.14)' },
  { name: '平', start: 11, end: 18, color: 'rgba(0, 0, 0, 0.04)' },
  { name: '峰', start: 18, end: 22, color: 'rgba(250, 140, 16, 0.14)' },
  { name: '谷', start: 22, end: 24, color: 'rgba(82, 196, 26, 0.14)' },
]

/** 预冷蓄冷 / 放冷滑行 动作标注 */
const actionLines = [
  { name: '预冷蓄冷', xAxis: 6 },
  { name: '放冷滑行', xAxis: 13 },
]

/** 模拟日负荷形状（kW） */
const loadShape = [4300, 4200, 4100, 4050, 4100, 4300, 4700, 5400, 6100, 6600, 6800, 6700, 6450, 6250, 6100, 6000, 5900, 5800, 5700, 5600, 5300, 5000, 4800, 4500]

/** 生成 24 小时模拟曲线数据 */
const buildMockChartData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const p50 = loadShape.map((v, i) => Math.round(v + Math.sin(i * 1.7) * 30))
  const p90Upper = p50.map((v, i) => v + 480 + Math.round(Math.cos(i) * 120))
  const actual = p50.map((v, i) => Math.round(v * (0.97 + ((i * 7) % 6) / 100)))
  return { hours, p50, p90Upper, actual }
}

/** 根据小时获取电价时段名 */
const priceNameOf = (hour: string) => {
  const h = parseInt(hour, 10)
  if ((h >= 8 && h < 11) || (h >= 18 && h < 22)) return '峰'
  if ((h >= 6 && h < 8) || (h >= 11 && h < 18)) return '平'
  return '谷'
}

/** 电价数值（元/kWh） */
const priceValueOf = (period: string) => {
  if (period === '峰') return '1.26'
  if (period === '平') return '0.85'
  return '0.35'
}

/** 加载负荷预测图数据 */
const loadLoadChart = async () => {
  chartLoading.value = true
  try {
    const res = await getLoadChartData()
    let hours: string[] = []
    let p50: number[] = []
    let p90Upper: number[] = []
    let actual: number[] = []
    // 兼容后端 { chat: { xaxis, chatSeriesList } } 返回格式
    const chatData = res?.chat || res?.result?.chat || res?.data?.chat || res || {}
    const seriesList = chatData.chatSeriesList || chatData.seriesList || []
    if (Array.isArray(chatData.xaxis) && seriesList.length > 0) {
      hours = chatData.xaxis
      const findSeries = (name: string) =>
        seriesList.find((s: any) => String(s.name).indexOf(name) > -1)?.data || []
      p50 = findSeries('P50')
      p90Upper = findSeries('P90')
      actual = findSeries('实测')
    } else {
      const mock = buildMockChartData()
      hours = mock.hours
      p50 = mock.p50
      p90Upper = mock.p90Upper
      actual = mock.actual
    }
    chartLoading.value = false
    await nextTick()
    if (hours.length > 0 && p50.length > 0) {
      renderLoadChart(hours, p50, p90Upper, actual)
    }
  } catch (e) {
    console.error('加载负荷预测数据失败:', e)
    chartLoading.value = false
    await nextTick()
    const mock = buildMockChartData()
    renderLoadChart(mock.hours, mock.p50, mock.p90Upper, mock.actual)
  }
}

/** 渲染负荷预测与实测闭环图 */
const renderLoadChart = (xaxis: string[], p50: number[], p90Upper: number[], actual: number[]) => {
  // P90 置信带：P50 基线（stack 底层）+ 差值（上界 - P50），叠加出上下界之间的色带
  const confidenceData = p90Upper.map((v, i) => Math.max(0, v - (p50[i] || 0)))
  const priceMap: Record<string, string> = {}
  xaxis.forEach((h) => (priceMap[h] = priceNameOf(h)))
  setLoadChartOptions({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0
        const hour = params[0]?.axisValue || ''
        const price = priceMap[hour] || '-'
        const priceVal = priceValueOf(price)
        const p50Val = Math.round(p50[idx] ?? 0)
        const p90UpperVal = Math.round(p90Upper[idx] ?? 0)
        const p90LowerVal = Math.round(2 * p50Val - p90UpperVal)
        const actualVal = Math.round(actual[idx] ?? 0)
        const row = (dotColor: string, label: string, value: string) =>
          `<div style="display:flex;align-items:center;gap:6px;line-height:1.8;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};"></span>
            <span style="color:#666;">${label}</span>
            <span style="margin-left:auto;font-weight:600;padding-left:14px;">${value}</span>
          </div>`
        let html = `<div style="font-weight:600;margin-bottom:6px;">${hour} ${price}段 ${priceVal}元/kWh</div>`
        html += row('#1f3a5f', 'P50 预测：', `${p50Val.toLocaleString()} kW`)
        html += row('rgba(31,58,95,.15)', 'P90 带：', `${p90LowerVal.toLocaleString()} ~ ${p90UpperVal.toLocaleString()} kW`)
        html += row('#fa8c16', '实测：', `${actualVal.toLocaleString()} kW`)
        return html
      },
    },
    grid: { left: 52, right: 24, top: 34, bottom: 34, containLabel: true },
    xAxis: {
      type: 'category',
      data: xaxis,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e5e5e5' } },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 12, interval: 0 },
    },
    yAxis: {
      type: 'value',
      name: '冷负荷 (kW)',
      max: 8400,
      interval: 2000,
      nameTextStyle: { color: '#999', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f0f2f5' } },
      axisLabel: { color: '#666', fontSize: 12 },
    },
    series: [
      {
        name: 'P50 基线',
        type: 'line',
        stack: 'conf',
        data: p50,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        emphasis: { disabled: true },
        tooltip: { show: false },
      },
      {
        name: 'P90 置信带 (80%)',
        type: 'line',
        stack: 'conf',
        data: confidenceData,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: '#e8eef5' },
        emphasis: { disabled: true },
        tooltip: { show: false },
      },
      {
        name: 'P50 预测',
        type: 'line',
        data: p50,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#1f3a5f', width: 2.5 },
        markArea: {
          silent: true,
          label: {
            show: true,
            position: 'top',
            color: '#999',
            fontSize: 12,
            offset: [0, -2],
          },
          data: pricePeriods.map((p) => [
            { name: p.name, xAxis: p.start, itemStyle: { color: p.color } },
            { xAxis: p.end },
          ]),
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { type: 'dashed', color: '#52c41a', width: 1.5 },
          label: {
            position: 'end',
            color: '#52c41a',
            fontSize: 11,
            rotate: 90,
            formatter: '{b}',
          },
          data: actionLines,
        },
        z: 5,
      },
      {
        name: '实测',
        type: 'scatter',
        data: actual,
        symbolSize: 7,
        itemStyle: { color: '#fa8c16' },
        z: 6,
      },
    ],
  })
}

// ===== 本拍下发摘要 =====
const dispatch = reactive({
  sendCount: 9,
  successCount: 8,
  clampCount: 1,
  fallbackCount: 0,
  lastAction: '2#冷机 加机',
  shootTime: '14:00 拍',
})

const loadDispatch = async () => {
  try {
    const res = await getDispatchSummary()
    dispatch.sendCount = res.sendCount ?? dispatch.sendCount
    dispatch.successCount = res.successCount ?? dispatch.successCount
    dispatch.clampCount = res.clampCount ?? dispatch.clampCount
    dispatch.fallbackCount = res.fallbackCount ?? dispatch.fallbackCount
    dispatch.lastAction = res.lastAction ?? dispatch.lastAction
    dispatch.shootTime = res.shootTime ?? dispatch.shootTime
  } catch (e) {
    console.error('加载下发摘要失败:', e)
  }
}

// ===== 优化层状态 =====
const RING_CIRCUMFERENCE = 2 * Math.PI * 42
const optimizer = reactive({
  percent: 93,
  status: '闭环在线',
  mode: '全局 RTO',
  accuracy: '≈ 80%',
  ringOffset: (RING_CIRCUMFERENCE * (1 - 93 / 100)).toFixed(2),
})

const loadOptimizer = async () => {
  try {
    const res = await getOptimizerStatus()
    optimizer.percent = res.percent ?? optimizer.percent
    optimizer.status = res.status ?? optimizer.status
    optimizer.mode = res.mode ?? optimizer.mode
    optimizer.accuracy = res.accuracy ?? optimizer.accuracy
    optimizer.ringOffset = (RING_CIRCUMFERENCE * (1 - optimizer.percent / 100)).toFixed(2)
  } catch (e) {
    console.error('加载优化层状态失败:', e)
  }
}

// ===== 设备在线概览 =====
const chillers = ref([
  { name: '1#磁悬浮', type: '离心', online: true },
  { name: '2#磁悬浮', type: '离心', online: true },
  { name: '3#定频离心', type: '离心', online: false },
])

const heatPumps = computed(() => {
  const offline = new Set(['HP13', 'HP20'])
  return Array.from({ length: 21 }, (_, i) => {
    const name = `HP${String(i + 1).padStart(2, '0')}`
    return { name, online: !offline.has(name) }
  })
})

const loadDevices = async () => {
  try {
    const res = await getDeviceStatus()
    if (Array.isArray(res.chillers) && res.chillers.length > 0) {
      chillers.value = res.chillers
    }
  } catch (e) {
    console.error('加载设备状态失败:', e)
  }
}

onMounted(() => {
  loadOverview()
  loadLoadChart()
  loadDispatch()
  loadOptimizer()
  loadDevices()
})
</script>

<style scoped lang="less">
.overview-tab {
  // ===== KPI 条 =====
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 12px;
  }

  .kpi-card {
    position: relative;
    background: #fff;
    border-radius: 10px;
    padding: 12px 12px 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    // 顶部彩色条
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }

    &.navy::before { background: #1f3a5f; }
    &.green::before { background: #52c41a; }
    &.orange::before { background: #fa8c16; }

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 8px;
    }

    &__label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__tag {
      flex-shrink: 0;
      font-size: 9px;
      line-height: 1;
      color: #666;
      background: #eef1f5;
      border-radius: 4px;
      padding: 3px 5px;
      white-space: nowrap;
    }

    &__value {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
      color: #1f3a5f;
      font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.is-green { color: #389e0d; }
      &.is-orange { color: #fa8c16; }
    }

    &__unit {
      font-size: 11px;
      font-weight: 400;
      color: #999;
      margin-left: 4px;
    }

    &__sub {
      margin-top: 6px;
      font-size: 11px;
      color: #999;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // ===== 主图 + 右侧栏 =====
  .main-wrap {
    display: flex;
    align-items: stretch;
    gap: 16px;
    margin-top: 20px;
  }

  .chart-card {
    flex: 1;
    min-width: 0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: -16px -16px 14px;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1f3a5f;
    }

    &__tag {
      font-size: 12px;
      font-weight: 400;
      color: #999;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 2px 8px;
      margin-left: 4px;
    }

    &__body {
      flex: 1;
      height: 380px;
    }
  }

  .chart-legend {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
  }

  .legend-color {
    display: inline-block;
    width: 14px;
    height: 3px;
    border-radius: 2px;
    background: #1f3a5f;

    &--band {
      height: 10px;
      background: #e8eef5;
      border: 1px solid #d0dce8;
    }

    &--dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  }

  .chart-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    background: #f7f9fc;
    border-radius: 8px;
  }

  .load-chart {
    width: 100%;
    height: 100%;
  }

  // ===== 右侧栏 =====
  .side-panel {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .side-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    &:last-child {
      flex: 1;
    }

    :deep(.ant-card-body) {
      padding: 12px 16px;
    }

    &__title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      padding-bottom: 8px;
      margin-bottom: 0;
      border-bottom: 1px solid #f0f0f0;

      &--full {
        margin: -12px -16px 10px;
        padding: 10px 16px;
      }
    }

    &__extra {
      font-size: 13px;
      font-weight: 400;
      color: #999;
    }

    // 设备在线概览：卡片被 flex:1 拉伸时，内容仍靠上，底部留 15px
    &--device {
      :deep(.ant-card-body) {
        display: flex;
        flex-direction: column;
        padding: 12px 16px 15px;
        height: 100%;
      }
    }
  }

  // 本拍下发摘要
  .dispatch-list {
    padding: 0;
  }

  .dispatch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    &__label {
      font-size: 14px;
      color: #666;
    }

    &__value {
      font-size: 17px;
      font-weight: 600;
      color: #333;
      font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;

      &.is-green { color: #389e0d; }
      &.is-orange { color: #fa8c16; }
    }
  }

  .dispatch-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0 0;
    border-top: 1px solid #f5f5f5;

    &__label {
      font-size: 14px;
      color: #666;
    }

    &__badge {
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 12px;

      &--ok {
        color: #389e0d;
        background: #f6ffed;
        border: 1px solid #b7eb8f;
      }
    }
  }

  // 优化层状态
  .optimizer-wrap {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .optimizer-ring {
    position: relative;
    width: 92px;
    height: 92px;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    &__bg {
      fill: none;
      stroke: #e8f5e9;
      stroke-width: 10;
    }

    &__fg {
      fill: none;
      stroke: #52c41a;
      stroke-width: 10;
      stroke-linecap: round;
      stroke-dasharray: 263.89;
      transition: stroke-dashoffset 0.6s ease;
    }
  }

  .optimizer-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;

    &__status {
      font-size: 20px;
      font-weight: 600;
      color: #52c41a;
      margin-bottom: 0;
    }

    &__row {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }

  // 设备在线概览
  .device-section {
    & + & {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed #f0f0f0;
    }

    &__label {
      font-size: 13px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.75);
      margin-bottom: 8px;

      span {
        font-size: 12px;
        font-weight: 400;
        color: #999;
        margin-left: 4px;
      }
    }
  }

  .chiller-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .chiller-item {
    background: #f4f6f9;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    &__name {
      font-size: 13px;
      color: #333;
      white-space: nowrap;
    }

    &__status {
      font-size: 12px;
      font-weight: 500;

      &.is-on { color: #52c41a; }
      &.is-off { color: #999; }
    }
  }

  .heatpump-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }

  .heatpump-cell {
    background: #f4f6f9;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 4px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;

    &__name {
      font-size: 12px;
      color: #333;
    }

    &__status {
      font-size: 11px;
      font-weight: 500;

      &.is-on { color: #52c41a; }
      &.is-off { color: #999; }
    }
  }
}
</style>
