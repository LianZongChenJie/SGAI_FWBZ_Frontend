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
              <span class="legend-color legend-color--band"></span>P90 置信带(80%)
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #1f3a5f"></span>P50 预测
            </span>
            <span class="legend-item">
              <span class="legend-color legend-color--dot" style="background: #e8833a"></span>实测
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
        <!-- 设备在线概览（侧栏最上方，对应原型 order:-1） -->
        <a-card class="side-card side-card--device" :bordered="false">
          <div class="side-card__title side-card__title--full">
            <span>设备在线概览</span>
            <span class="side-card__extra">{{ chillers.length }} 冷机 · {{ totalHeatPump }} 热泵</span>
          </div>
          <div class="hp-grp-lab"><b>集中冷机</b><span>{{ chillers.length }} 台</span></div>
          <div class="dev-grid dev-grid--chiller">
            <div v-for="ch in chillers" :key="ch.name" class="dev-cell" :class="ch.online ? 'run' : 'stop'">
              <div class="d-n">{{ ch.name }}</div>
              <div class="d-s">{{ ch.online ? '运行' : '停止' }}</div>
            </div>
          </div>
          <div class="hp-grp-lab" style="margin-top: 10px"><b>风冷热泵 · 分馆</b><span>{{ totalHeatPump }} 台</span></div>
          <div v-for="grp in heatPumpGroups" :key="grp.name" class="hp-grp">
            <div class="hp-grp-lab"><b>{{ grp.name }}</b><span>{{ grp.count }} 台</span></div>
            <div class="dev-grid dev-grid--hp">
              <div
                v-for="i in grp.count"
                :key="i"
                class="dev-cell"
                :class="grp.stops[i] ? 'stop' : 'run'"
              >
                <div class="d-n">{{ grp.prefix }}-{{ String(i).padStart(2, '0') }}</div>
                <div class="d-s">{{ grp.stops[i] ? '停止' : '运行' }}</div>
              </div>
            </div>
          </div>
        </a-card>

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
              <span class="dispatch-row__value is-muted">{{ dispatch.fallbackCount }}</span>
            </div>
            <div class="dispatch-row">
              <span class="dispatch-row__label">最近动作</span>
              <span class="dispatch-badge dispatch-badge--ok">{{ dispatch.lastAction }}</span>
            </div>
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
              <div class="optimizer-meta__row">
                模式：{{ optimizer.mode }}<br />预测精度 {{ optimizer.accuracy }}
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { bindingStore } from '/@/views/bems-web/energy-monitor/stores/bindingStore.js'
import { useECharts } from '/@/hooks/web/useECharts'
import {
  getEnergyAnalysisOverview,
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

/** 峰平谷电价时段：0谷 1平 2峰（按小时索引 0~23，原型口径） */
const tariffByHour = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 0]
const tariffPrice: Record<number, number> = { 0: 0.33, 1: 0.79, 2: 1.26 }
const tariffName: Record<number, string> = { 0: '谷', 1: '平', 2: '峰' }

/** 峰平谷色带（markArea 段，按小时边界切分） */
const buildTariffBands = (withLabel: boolean): any[] => {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const segs: any[] = []
  let start = 0
  for (let i = 1; i <= 24; i++) {
    const cur = i < 24 ? tariffByHour[i] : -1
    if (i === 24 || cur !== tariffByHour[start]) {
      const p = tariffByHour[start]
      const color = p === 2 ? 'rgba(232,131,58,.12)' : p === 0 ? 'rgba(46,139,87,.10)' : 'rgba(0,0,0,.015)'
      const item: any[] = [
        { xAxis: hours[start], itemStyle: { color } },
        { xAxis: i < 24 ? hours[i] : '23' },
      ]
      if (withLabel) {
        item[0].label = {
          show: true,
          position: 'insideTop',
          formatter: tariffName[p],
          color: '#9aa3ad',
          fontSize: 10,
          fontWeight: 600,
          distance: 2,
        }
      }
      segs.push(item)
      start = i
    }
  }
  return segs
}

/** 模拟日负荷 P50（kW）—— 会展+办公 夏季典型日（原型口径） */
const loadP50 = [1620, 1540, 1480, 1420, 1420, 1520, 1920, 2820, 3820, 4920, 6020, 6820, 6620, 7020, 7420, 7320, 6920, 6220, 5820, 5420, 4920, 4020, 2820, 2020]

/** 生成 24 小时模拟曲线数据（P90 带 ±，实测仅到演示时刻 14 时，对齐原型 NOW_HOUR=14） */
const buildMockChartData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const now = 14
  const p90hi = loadP50.map((v, i) => Math.round(v * (1.1 + 0.02 * Math.sin(i))))
  const p90lo = loadP50.map((v, i) => Math.round(v * (0.9 - 0.02 * Math.sin(i))))
  const actual = loadP50.map((v, i) => (i <= now ? Math.round(v * (1 + ((i % 3) - 1) * 0.012)) : null))
  return { hours, p50: loadP50, p90hi, p90lo, actual }
}

/** 加载负荷预测图数据（暂用静态模拟数据，不调用接口；恢复接口时改为请求 getLoadChartData 并映射 xaxis/P50/P90/实测） */
const loadLoadChart = async () => {
  chartLoading.value = true
  const mock = buildMockChartData()
  chartLoading.value = false
  await nextTick()
  renderLoadChart(mock.hours, mock.p50, mock.p90lo, mock.p90hi, mock.actual)
}

/** 渲染负荷预测与实测闭环图（参照原型：P90 置信带 + P50 预测 + 实测散点 + 峰平谷色带 + 阈值/蓄冷/放冷标注） */
const renderLoadChart = (
  xaxis: string[],
  p50: number[],
  p90lo: number[],
  p90hi: number[],
  actual: (number | null)[],
) => {
  // P90 置信带：stack 底层（下界）+ 差值（上界 - 下界）叠加出带
  const bandData = p90hi.map((v, i) => Math.max(0, v - (p90lo[i] || 0)))
  setLoadChartOptions({
    grid: { left: 54, right: 24, top: 34, bottom: 34 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#dfe4ea',
      textStyle: { color: '#1f2937', fontSize: 12 },
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0
        const hour = xaxis[idx] || ''
        const period = tariffByHour[idx] ?? 0
        const hi = Math.round(p90hi[idx] ?? 0)
        const lo = Math.round(p90lo[idx] ?? 0)
        const act = actual[idx]
        let s = `<b>${hour}:00</b>　${tariffName[period]}段 ${tariffPrice[period]}元/kWh<br>`
        s += `P50 预测：<b>${Math.round(p50[idx] ?? 0).toLocaleString()} kW</b><br>`
        s += `P90 带：${lo.toLocaleString()} ~ ${hi.toLocaleString()} kW`
        if (act != null) s += `<br><span style="color:#E8833A">实测：${Math.round(act).toLocaleString()} kW</span>`
        return s
      },
    },
    xAxis: {
      type: 'category',
      data: xaxis,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisTick: { show: false },
      axisLabel: { color: '#898781', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '冷负荷 (kW)',
      min: 0,
      max: 8400,
      nameTextStyle: { color: '#898781', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#ebeae4' } },
      axisLabel: { color: '#898781', fontSize: 11 },
    },
    series: [
      {
        name: 'P90 下界',
        type: 'line',
        stack: 'band',
        data: p90lo,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'transparent' },
        emphasis: { disabled: true },
        tooltip: { show: false },
        z: 1,
      },
      {
        name: 'P90 置信带 (80%)',
        type: 'line',
        stack: 'band',
        data: bandData,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(42,120,214,.20)' },
        emphasis: { disabled: true },
        tooltip: { show: false },
        z: 2,
      },
      {
        name: 'P50 预测',
        type: 'line',
        data: p50,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#1F3A5F', width: 2.2 },
        z: 5,
        markArea: {
          silent: true,
          data: buildTariffBands(true),
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: { color: '#2E8B57', fontSize: 10, fontWeight: 600 },
          data: [
            {
              yAxis: 2500,
              lineStyle: { color: '#4a3aa7', type: 'dashed', width: 1.5 },
              label: {
                formatter: '集中冷源阈值2500kW',
                position: 'insideEndTop',
                color: '#4a3aa7',
                fontSize: 10,
                fontWeight: 600,
              },
            },
            {
              xAxis: '06',
              label: { formatter: '蓄冷 06:00–07:00', position: 'insideStartTop' },
              lineStyle: { color: '#2E8B57', type: 'dashed' },
            },
            {
              xAxis: '14',
              label: { formatter: '放冷滑行 ↑', position: 'insideStartTop' },
              lineStyle: { color: '#E8833A', type: 'dashed' },
            },
          ],
        },
      },
      {
        name: '实测',
        type: 'scatter',
        data: actual,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#E8833A', borderColor: '#fff', borderWidth: 1.5 },
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

// ===== 设备在线概览（原型：3 冷机 · 21 热泵，热泵按馆分组） =====
const chillers = ref([
  { name: '1# 磁悬浮', online: true },
  { name: '2# 磁悬浮', online: true },
  { name: '3# 定频离心', online: false },
])

/** 热泵按馆分组：1号馆12 / 2号馆3 / 3号馆3 / 4号馆3，stops 记录停机序号 */
interface HeatPumpGroup {
  name: string
  prefix: string
  count: number
  stops: Record<number, boolean>
}

const heatPumpGroups = ref<HeatPumpGroup[]>([
  { name: '1号馆', prefix: '1', count: 12, stops: { 6: true } },
  { name: '2号馆', prefix: '2', count: 3, stops: {} },
  { name: '3号馆', prefix: '3', count: 3, stops: {} },
  { name: '4号馆', prefix: '4', count: 3, stops: { 2: true } },
])

const totalHeatPump = computed(() => heatPumpGroups.value.reduce((sum, g) => sum + g.count, 0))

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
  // loadOverview()
  loadLoadChart()
  // loadDispatch()
  // loadOptimizer()
  // loadDevices()
  // 冷源实时数据 WebSocket 连接
  bindingStore.connectColdSourceWs()
})
onUnmounted(() => {
  bindingStore.disconnectColdSourceWs()
})
</script>

<style scoped lang="less">
.overview-tab {
  // ===== KPI 条 =====
  .kpi-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 12px;
  }

  .kpi-card {
    position: relative;
    min-width: 0;
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
    align-items: flex-start;
    gap: 16px;
    margin-top: 20px;
  }

  .chart-card {
    flex: 1;
    min-width: 0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 0;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 11px 16px;
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
      height: 360px;
      padding: 8px 10px 12px;
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
    height: 8px;
    border-radius: 2px;
    background: #1f3a5f;

    &--band {
      background: rgba(42, 120, 214, 0.22);
    }

    &--dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #e8833a;
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
  }

  // 本拍下发摘要（原型：mini-stat 虚线行 + badge）
  .dispatch-list {
    padding: 0;
  }

  .dispatch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px dashed #eef0f3;

    &:last-child {
      border-bottom: none;
    }

    &__label {
      flex: 1;
      font-size: 12px;
      color: #52514e;
    }

    &__value {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
      font-variant-numeric: tabular-nums;

      &.is-green { color: #0ca30c; }
      &.is-orange { color: #e8833a; }
      &.is-muted { color: #898781; }
    }
  }

  .dispatch-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;

    &--ok {
      color: #0ca30c;
      background: rgba(12, 163, 12, 0.12);
    }
  }

  // 优化层状态（原型：status-ring 96px 环 + 状态文本）
  .optimizer-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .optimizer-ring {
    position: relative;
    width: 96px;
    height: 96px;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    &__bg {
      fill: none;
      stroke: #eef0f3;
      stroke-width: 9;
    }

    &__fg {
      fill: none;
      stroke: #0ca30c;
      stroke-width: 9;
      stroke-linecap: round;
      stroke-dasharray: 263.89;
      transition: stroke-dashoffset 0.6s ease;
    }
  }

  .optimizer-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__status {
      font-size: 18px;
      font-weight: 700;
      color: #0ca30c;
      margin-bottom: 0;
    }

    &__row {
      font-size: 12px;
      color: #52514e;
      line-height: 1.6;
    }
  }

  // 设备在线概览（原型：dev-grid 点阵 + 分馆分组）
  .hp-grp-lab {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: #52514e;
    margin: 0 0 4px;

    b {
      color: #1f3a5f;
      font-weight: 600;
    }
  }

  .hp-grp {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .dev-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;

    &--chiller {
      grid-template-columns: repeat(3, 1fr);
    }

    &--hp {
      grid-template-columns: repeat(auto-fit, minmax(42px, 1fr));
    }
  }

  .dev-cell {
    background: #f4f6f9;
    border: 1px solid #e6ebf2;
    border-radius: 5px;
    padding: 6px 4px;
    text-align: center;

    .d-n {
      font-size: 11px;
      color: #52514e;
    }

    .d-s {
      font-size: 11px;
      font-weight: 700;
      margin-top: 2px;
    }

    &.run .d-s {
      color: #0ca30c;
    }

    &.stop .d-s {
      color: #898781;
    }
  }
}
</style>
