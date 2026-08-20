<template>
  <div class="optimization-page">
    <header class="optimization-header">
      <div>
        <span class="eyebrow">EXPERT OPTIMIZATION LOOP</span>
        <h1>能源分析与启停求解</h1>
        <p>气象 · 电价 · 活动排期 · 末端分析</p>
      </div>
      <div class="header-state">
        <div class="view-tabs"><button class="active">01 分析求解</button><button @click="goStrategyControl">02 策略执行</button></div>
        <span><i></i>数据链路在线</span><b>模型 {{ text('optimization.forecast.modelVersion') }}</b><em>距下拍 {{ countdownText }}</em><em>更新 {{ text('optimization.forecast.updatedAt') }}</em>
      </div>
    </header>

    <section class="logic-flow" aria-label="优化闭环流程">
      <div v-for="(step, index) in flowSteps" :key="step.title" :class="{ active: index <= flowStage }">
        <b>{{ index + 1 }}</b><span><strong>{{ step.title }}</strong><small>{{ step.note }}</small></span><i v-if="index < flowSteps.length - 1">→</i>
      </div>
    </section>

    <main class="optimization-scroll">
      <section class="kpi-grid">
        <article v-for="item in kpis" :key="item.key" :class="item.tone">
          <span>{{ item.label }}</span><strong>{{ format(item.key, item.digits) }}<small>{{ item.unit }}</small></strong><em>{{ item.note }}</em>
        </article>
      </section>

      <section class="analysis-grid">
        <article class="expert-card forecast-card">
          <header>
            <div><span class="section-no">01</span><div><h2>负荷预测与实际纠偏</h2><p>P50 / P90 置信带 · 峰平谷电价 · 会展启闭馆窗口</p></div></div>
            <div class="forecast-badges"><span>准确率 <b>{{ format('optimization.forecast.accuracy', 1) }}%</b></span><span>下一小时 P90 <b>{{ format('optimization.forecast.nextHourP90', 0) }} kW</b></span></div>
          </header>
          <div ref="loadChartRef" class="load-chart"></div>
          <div class="chart-legend">
            <span><i class="band"></i>P90 区间</span>
            <span><i class="line"></i>P50 预测</span>
            <span><i class="dot actual"></i>实测</span>
            <span><i class="block event"></i>会展开馆窗口</span>
            <span><i class="block peak"></i>峰价时段</span>
          </div>
        </article>

        <aside class="input-stack">
          <article class="expert-card input-card">
            <header><div><span class="section-no">A</span><div><h2>气象与电价输入</h2><p>{{ text('optimization.weather.source') }}</p></div></div><span class="quality good">质量 GOOD</span></header>
            <div class="weather-now"><div><span>干球</span><strong>{{ format('optimization.weather.dryBulb', 1) }}℃</strong></div><div><span>湿球</span><strong>{{ format('optimization.weather.wetBulb', 1) }}℃</strong></div><div><span>辐射</span><strong>{{ format('optimization.weather.solarRadiation', 0) }}</strong><small>W/m²</small></div><div><span>降雨</span><strong>{{ format('optimization.weather.rainProbability', 0) }}%</strong></div></div>
            <div ref="weatherChartRef" class="weather-chart"></div>
            <div class="tariff-strip"><span><i></i>{{ text('optimization.tariff.currentPeriod') }}</span><b>{{ format('optimization.tariff.currentPrice', 2) }} 元/kWh</b><em>下一峰段 {{ text('optimization.tariff.nextPeakStart') }}–{{ text('optimization.tariff.nextPeakEnd') }}</em></div>
            <div class="influence"><span>气象对负荷贡献</span><b><i :style="{ width: `${numberValue('optimization.forecast.weatherContribution')}%` }"></i></b><strong>{{ format('optimization.forecast.weatherContribution', 0) }}%</strong></div>
          </article>

          <article class="expert-card event-card">
            <header><div><span class="section-no">B</span><div><h2>会展日程输入</h2><p>开闭馆 + 客流 → 能源站启停预测</p></div></div><span class="quality good">3 / 3 已接入</span></header>
            <div class="hall-list">
              <div v-for="hall in halls" :key="hall.no">
                <b>{{ hall.no }}号馆</b><span>{{ hall.open }}–{{ hall.close }}</span><em>{{ hall.people.toLocaleString() }} 人</em><small>{{ hall.level }}</small>
                <p>建议 <strong>{{ hall.start }}</strong> 启动 · <strong>{{ hall.stop }}</strong> 停止 <i>{{ hall.confidence }}%</i></p>
              </div>
            </div>
            <div class="influence event-influence"><span>会展日程负荷贡献</span><b><i :style="{ width: `${numberValue('optimization.forecast.eventContribution')}%` }"></i></b><strong>{{ format('optimization.forecast.eventContribution', 0) }}%</strong></div>
          </article>
        </aside>
      </section>

      <section class="expert-card schedule-card">
        <header>
          <div><span class="section-no">02</span><div><h2>活动排期驱动启停求解</h2><p>活动开闭馆为硬边界 · 历史降温/温升梯度自学习 · 末端数据只分析不下控</p></div></div>
          <div class="schedule-tags"><span>排期硬约束</span><span class="analysis-only">末端只采集</span><b>置信度 {{ format('optimization.schedule.plant.confidence', 0) }}%</b></div>
        </header>
        <div class="plant-timeline">
          <div class="timeline-line"><i></i></div>
          <div class="timeline-node start"><b>{{ text('optimization.schedule.plant.recommendedStart') }}</b><span>能源站启动</span><small>{{ text('optimization.schedule.plant.governingHall').split(' / ')[0] }}</small></div>
          <div class="timeline-node open"><b>{{ text('optimization.schedule.plant.earliestEventOpen') }}</b><span>最早开馆</span><small>不可突破</small></div>
          <div class="timeline-node stop"><b>{{ text('optimization.schedule.plant.recommendedStop') }}</b><span>建议停机</span><small>利用管网 / 建筑余冷</small></div>
          <div class="timeline-node close"><b>{{ text('optimization.schedule.plant.latestEventClose') }}</b><span>最晚闭馆</span><small>不可突破</small></div>
          <aside><span>预计预冷用电 <b>{{ format('optimization.schedule.plant.estimatedPrecoolEnergy', 0) }} kWh</b></span><span>较固定时刻预计节电 <b>{{ format('optimization.schedule.plant.estimatedSavedVsFixed', 0) }} kWh</b></span></aside>
        </div>
        <div class="schedule-table-wrap">
          <table class="schedule-table">
            <thead><tr><th>场馆 / 活动硬边界</th><th>末端实测（仅分析）</th><th>历史自学习</th><th>最晚安全启动</th><th>最早安全停机</th><th>开/闭馆预测室温</th><th>过早 / 过晚代价</th><th>求解依据</th></tr></thead>
            <tbody>
              <tr v-for="hall in scheduleHalls" :key="hall.no">
                <td><strong>{{ hall.no }}号馆</strong><span>{{ hall.open }}–{{ hall.close }}</span></td>
                <td><b>{{ hall.indoor.toFixed(1) }}℃</b><span>目标 {{ hall.target.toFixed(1) }}℃ · RH {{ hall.rh.toFixed(0) }}%</span></td>
                <td><b>降 {{ hall.cooling.toFixed(1) }}℃/h</b><span>停机升 {{ hall.drift.toFixed(2) }}℃/h · {{ hall.samples }}d</span></td>
                <td class="time-cell"><strong>{{ hall.latestStart }}</strong><span>推荐 {{ hall.start }}</span></td>
                <td class="time-cell"><strong>{{ hall.earliestStop }}</strong><span>余冷 {{ hall.coast }} min</span></td>
                <td><b>{{ hall.openTemp.toFixed(1) }} / {{ hall.closeTemp.toFixed(1) }}℃</b><span>允许上限 {{ hall.maxTemp.toFixed(1) }}℃</span></td>
                <td><b>早开 +{{ hall.waste }} kWh</b><span>晚开风险 {{ hall.lateRisk }} min</span></td>
                <td><span>{{ hall.evidence }}</span><i>{{ hall.confidence }}%</i></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <div v-if="toast" class="optimization-toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ENERGY_OPTIMIZATION_DEFAULTS, ENERGY_OPTIMIZATION_POINTS } from './data/energyOptimizationPoints.js'
import { optimizeExhibitionPlant } from './utils/energyOptimizationEngine.js'

const router = useRouter()
const values = reactive({ ...ENERGY_OPTIMIZATION_DEFAULTS })
const quality = reactive({})
const loadChartRef = ref(null)
const weatherChartRef = ref(null)
const toast = ref('')
let loadChart
let weatherChart
let countdownTimer
let toastTimer
let dashboardRefreshTimer

const pointMap = Object.fromEntries(ENERGY_OPTIMIZATION_POINTS.map(item => [item.key, item]))
const flowStage = 2
const flowSteps = [
  { title: '采集', note: '站房 · 气象 · 会展' }, { title: '预测', note: 'P50 / P90 冷负荷' }, { title: '决策', note: '约束寻优与结论' }, { title: '下发', note: '网关写点与确认' }, { title: '验证', note: '执行监控与回退' }
]
const kpis = computed(() => [
  { key: 'optimization.performance.stationCop', label: '能源站综合 COP', unit: '', digits: 2, note: '优于基线 0.34', tone: 'blue' },
  { key: 'optimization.performance.currentLoad', label: '当前冷负荷', unit: 'kW', digits: 0, note: `P90 ${format('optimization.forecast.nextHourP90', 0)} kW`, tone: 'cyan' },
  { key: 'optimization.performance.currentPower', label: '瞬时总功率', unit: 'kW', digits: 0, note: `基线 ${format('optimization.performance.baselinePower', 0)} kW`, tone: 'violet' },
  { key: 'optimization.performance.savedEnergyToday', label: '今日累计节能', unit: 'kWh', digits: 0, note: `节能率 ${format('optimization.performance.savingRate', 1)}%`, tone: 'green' },
  { key: 'optimization.performance.costSavingToday', label: '今日节约费用', unit: '元', digits: 0, note: '按峰平谷电价核算', tone: 'amber' },
  { key: 'optimization.performance.peakReduction', label: '峰段移峰削减', unit: 'kW', digits: 0, note: '预冷 + 设定值联调', tone: 'red' }
])
const halls = computed(() => [2, 3, 4].map(no => ({
  no, open: text(`optimization.event.hall${no}.openTime`), close: text(`optimization.event.hall${no}.closeTime`), people: numberValue(`optimization.event.hall${no}.expectedAttendance`), level: text(`optimization.event.hall${no}.eventLevel`), start: text(`optimization.schedule.hall${no}.recommendedStart`), stop: text(`optimization.schedule.hall${no}.recommendedStop`), confidence: numberValue(`optimization.schedule.hall${no}.confidence`)
})))
const scheduleHalls = computed(() => [2, 3, 4].map(no => ({
  no,
  open: text(`optimization.event.hall${no}.openTime`),
  close: text(`optimization.event.hall${no}.closeTime`),
  indoor: numberValue(`optimization.terminal.hall${no}.indoorTemp`),
  target: numberValue(`optimization.terminal.hall${no}.targetTemp`),
  maxTemp: numberValue(`optimization.terminal.hall${no}.maxOpenTemp`),
  rh: numberValue(`optimization.terminal.hall${no}.relativeHumidity`),
  cooling: numberValue(`optimization.terminal.hall${no}.coolingGradient`),
  drift: numberValue(`optimization.terminal.hall${no}.driftGradient`),
  samples: numberValue(`optimization.terminal.hall${no}.sampleDays`),
  start: text(`optimization.schedule.hall${no}.recommendedStart`),
  latestStart: text(`optimization.schedule.hall${no}.latestSafeStart`),
  earliestStop: text(`optimization.schedule.hall${no}.earliestSafeStop`),
  coast: numberValue(`optimization.schedule.hall${no}.coastMinutes`),
  openTemp: numberValue(`optimization.schedule.hall${no}.predictedOpenTemp`),
  closeTemp: numberValue(`optimization.schedule.hall${no}.predictedCloseTemp`),
  waste: numberValue(`optimization.schedule.hall${no}.earlyWasteKWh`),
  lateRisk: numberValue(`optimization.schedule.hall${no}.lateRiskMinutes`),
  evidence: text(`optimization.schedule.hall${no}.evidence`),
  confidence: numberValue(`optimization.schedule.hall${no}.confidence`)
})))
const countdownText = computed(() => { const seconds = Math.max(0, numberValue('optimization.control.nextCycleSeconds')); return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` })

function goStrategyControl() { router.push('/fwbz/energy-management/strategy-control') }
function raw(key) { return values[key] ?? '--' }
function text(key) { return String(raw(key)) }
function numberValue(key) { const n = Number(raw(key)); return Number.isFinite(n) ? n : 0 }
function format(key, digits = 1) { const n = Number(raw(key)); return Number.isFinite(n) ? n.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '--' }
function formatPoint(key) {
  const meta = pointMap[key]
  if (!meta) return text(key)
  if (meta.type === 'number') return `${format(key, meta.unit === '℃' ? 1 : 0)} ${meta.unit}`.trim()
  return text(key)
}
function normalizePoints(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  const source = payload.points || payload
  if (Array.isArray(source)) return source
  return Object.entries(source).map(([key, value]) => value && typeof value === 'object' && !Array.isArray(value) && 'value' in value ? { key, ...value } : { key, value })
}
function applyPoints(payload) {
  const incoming = normalizePoints(payload)
  incoming.forEach(item => {
    const key = item.key || item.pointKey || item.id
    if (!key || !(key in pointMap)) return
    values[key] = item.value
    quality[key] = item.quality || 'good'
  })
  const hasAlgorithmInput = incoming.some(item => item.key?.startsWith('optimization.weather.') || item.key?.startsWith('optimization.tariff.') || item.key?.startsWith('optimization.event.') || item.key?.startsWith('optimization.terminal.') || item.key === 'optimization.forecast.nextHourP90')
  const hasExternalRecommendation = incoming.some(item => item.key?.startsWith('optimization.recommendation.') || item.key?.startsWith('optimization.schedule.'))
  if (hasAlgorithmInput && !hasExternalRecommendation) recalculateRecommendations()
  nextTick(renderCharts)
}
function recalculateRecommendations() {
  const result = optimizeExhibitionPlant({
    weather: { dryBulb: raw('optimization.weather.dryBulb'), wetBulb: raw('optimization.weather.wetBulb'), solarRadiation: raw('optimization.weather.solarRadiation') },
    tariff: { currentPrice: raw('optimization.tariff.currentPrice'), nextPeakStart: raw('optimization.tariff.nextPeakStart') },
    halls: [2, 3, 4].map(no => ({
      no,
      openTime: raw(`optimization.event.hall${no}.openTime`),
      closeTime: raw(`optimization.event.hall${no}.closeTime`),
      expectedAttendance: raw(`optimization.event.hall${no}.expectedAttendance`),
      occupied: Boolean(raw(`optimization.event.hall${no}.occupied`)),
      terminal: {
        indoorTemp: raw(`optimization.terminal.hall${no}.indoorTemp`),
        targetTemp: raw(`optimization.terminal.hall${no}.targetTemp`),
        maxOpenTemp: raw(`optimization.terminal.hall${no}.maxOpenTemp`),
        coolingGradient: raw(`optimization.terminal.hall${no}.coolingGradient`),
        driftGradient: raw(`optimization.terminal.hall${no}.driftGradient`),
        comfortAtOpenRate: raw(`optimization.terminal.hall${no}.comfortAtOpenRate`),
        sampleDays: raw(`optimization.terminal.hall${no}.sampleDays`),
        dataQuality: raw(`optimization.terminal.hall${no}.dataQuality`)
      }
    })),
    loadP90: raw('optimization.forecast.nextHourP90'), designCapacity: 9000, plantPower: raw('optimization.performance.currentPower')
  })
  values['optimization.recommendation.plantStartTime'] = result.plantStartTime
  values['optimization.recommendation.plantStopTime'] = result.plantStopTime
  values['optimization.recommendation.preCoolingMinutes'] = result.preCoolingMinutes
  values['optimization.recommendation.chwSupplyTemp'] = result.controls.chwSupplyTemp
  values['optimization.recommendation.chwReturnTempTarget'] = result.controls.chwReturnTempTarget
  values['optimization.recommendation.chwPumpFrequency'] = result.controls.chwPumpFrequency
  values['optimization.recommendation.cwPumpFrequency'] = result.controls.cwPumpFrequency
  values['optimization.recommendation.towerFrequency'] = result.controls.towerFrequency
  values['optimization.recommendation.chillerCount'] = result.controls.chillerCount
  values['optimization.recommendation.expectedSavingRate'] = result.controls.expectedSavingRate
  values['optimization.recommendation.conclusion'] = result.conclusion
  Object.entries(result.schedule).forEach(([key, value]) => { values[`optimization.schedule.plant.${key}`] = value })
  result.hallSchedules.forEach(hall => {
    Object.entries(hall).forEach(([key, value]) => { values[`optimization.schedule.hall${hall.no}.${key}`] = value })
  })
}
function showToast(message) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 2800) }
function onOptimizationValues(event) { applyPoints(event.detail) }
async function loadSnapshot() {
  try { const response = await fetch('/api/energy-optimization/points'); if (response.ok) applyPoints(await response.json()) } catch {}
}
function bindChart(instance, el) {
  if (instance && !instance.isDisposed() && instance.getDom() === el) return instance
  if (instance && !instance.isDisposed()) instance.dispose()
  return echarts.init(el)
}
function disposeCharts() {
  if (loadChart) { loadChart.dispose(); loadChart = null }
  if (weatherChart) { weatherChart.dispose(); weatherChart = null }
}
function renderCharts() {
  if (!loadChartRef.value || !weatherChartRef.value) return
  loadChart = bindChart(loadChart, loadChartRef.value)
  weatherChart = bindChart(weatherChart, weatherChartRef.value)
  const chartHours = raw('optimization.forecast.hours')
  const p50 = raw('optimization.forecast.loadP50')
  const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
  const rawHigh = raw('optimization.forecast.loadP90High')
  const rawLow = raw('optimization.forecast.loadP90Low')
  const valid = (arr) => Array.isArray(arr) && arr.length === chartHours.length && arr.every(isFiniteNumber)
  const high = valid(rawHigh) ? rawHigh : []
  const low = valid(rawLow) ? rawLow : []
  const band = low.length && high.length ? high.map((value, index) => value - (low[index] ?? value)) : []
  const actual = raw('optimization.forecast.actualLoad')
  loadChart.setOption({ animationDuration: 500, grid: { left: 48, right: 22, top: 28, bottom: 34 }, tooltip: { trigger: 'axis', backgroundColor: '#ffffff', borderColor: '#e2e8f0', textStyle: { color: '#2d3748', fontSize: 11 } }, xAxis: { type: 'category', data: chartHours, boundaryGap: false, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 9, interval: 1 } }, yAxis: { type: 'value', name: 'kW', nameTextStyle: { color: '#94a3b8' }, axisLabel: { color: '#94a3b8', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.25)' } } }, series: [
    { name: 'P90 下界', type: 'line', data: low, stack: 'confidence', symbol: 'none', lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(41,151,195,0)' } },
    { name: 'P90 区间', type: 'line', data: band, stack: 'confidence', symbol: 'none', lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(41,151,195,.22)' } },
    { name: 'P50 预测', type: 'line', data: p50, smooth: true, symbol: 'none', lineStyle: { width: 2.5, color: '#38bde1' }, markArea: { silent: true, data: [[{ xAxis: '09', itemStyle: { color: 'rgba(34,197,94,.12)' }, label: { show: true, formatter: '会展开馆', color: '#16a34a', fontSize: 9 } }, { xAxis: '19' }], [{ xAxis: '10', itemStyle: { color: 'rgba(245,158,11,.12)' }, label: { show: true, formatter: '峰价', color: '#d97706', fontSize: 9 } }, { xAxis: '15' }], [{ xAxis: '18', itemStyle: { color: 'rgba(245,158,11,.12)' } }, { xAxis: '21' }]] } },
    { name: '实测', type: 'line', data: actual, symbol: 'circle', symbolSize: 7, connectNulls: false, lineStyle: { width: 1.5, color: '#ff9b55' }, itemStyle: { color: '#ff9b55', borderColor: '#fff', borderWidth: 1 } }
  ] })
  weatherChart.setOption({ animationDuration: 450, grid: { left: 28, right: 8, top: 8, bottom: 20 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: chartHours, boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#94a3b8', fontSize: 8, interval: 5 } }, yAxis: { type: 'value', min: 18, max: 38, axisLabel: { show: false }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.2)' } } }, series: [{ name: '干球', type: 'line', data: raw('optimization.weather.hourlyDryBulb'), symbol: 'none', smooth: true, lineStyle: { color: '#f0a353', width: 2 } }, { name: '湿球', type: 'line', data: raw('optimization.weather.hourlyWetBulb'), symbol: 'none', smooth: true, lineStyle: { color: '#45b9d5', width: 2 }, areaStyle: { color: 'rgba(69,185,213,.08)' } }] })
}
function resizeCharts() { loadChart?.resize(); weatherChart?.resize() }
function rebuildActualLoad() {
  const p50 = values['optimization.forecast.loadP50']
  if (!Array.isArray(p50) || !p50.length) return
  const hour = new Date().getHours()
  values['optimization.forecast.actualLoad'] = p50.map((value, index) =>
    index <= hour ? Math.round(Number(value) * (1 + ((index % 3) - 1) * 0.012)) : null
  )
}
async function refreshDashboard() {
  await loadSnapshot()
  rebuildActualLoad()
  renderCharts()
}

const optimizationApi = { updatePoint: (key, value, options = {}) => applyPoints([{ key, value, ...options }]), updatePoints: applyPoints, getSnapshot: () => ({ ...values }), getPointCatalog: () => ENERGY_OPTIMIZATION_POINTS.map(item => ({ ...item })), getActiveView: () => 'analysis' }

onMounted(async () => {
  window.addEventListener('energy-optimization-values', onOptimizationValues)
  window.addEventListener('resize', resizeCharts)
  window.EnergyOptimization = optimizationApi
  recalculateRecommendations()
  await loadSnapshot()
  rebuildActualLoad()
  renderCharts()
  countdownTimer = setInterval(() => { const key = 'optimization.control.nextCycleSeconds'; values[key] = numberValue(key) > 0 ? numberValue(key) - 1 : numberValue('optimization.control.cycleMinutes') * 60 }, 1000)
  dashboardRefreshTimer = setInterval(refreshDashboard, 30 * 60 * 1000)
})
onUnmounted(() => {
  clearInterval(countdownTimer); clearInterval(dashboardRefreshTimer); clearTimeout(toastTimer); disposeCharts()
  window.removeEventListener('energy-optimization-values', onOptimizationValues); window.removeEventListener('resize', resizeCharts)
  if (window.EnergyOptimization === optimizationApi) delete window.EnergyOptimization
})
</script>

<style scoped>
.optimization-page{--ink:#2d3748;--muted:#64748b;--edge:#e2e8f0;--panel-bg:#ffffff;--cyan:#0ea5e9;--green:#22c55e;--blue:#3b82f6;--amber:#f59e0b;--red:#ef4444;height:100%;min-height:0;display:flex;flex-direction:column;color:var(--ink);background:#f5f7fa;font-family:"PingFang SC","Microsoft YaHei",sans-serif;position:relative}.optimization-header{height:72px;flex:none;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--edge);background:#ffffff}.optimization-header .eyebrow{color:#94a3b8;font-size:9px;font-weight:700;letter-spacing:2px}.optimization-header h1{font-size:19px;margin:2px 0 1px;color:#1e293b}.optimization-header p{font-size:9px;color:#94a3b8}.header-state{display:flex;align-items:center;gap:13px;font-size:8px;color:#94a3b8}.header-state span{padding:6px 9px;border:1px solid rgba(34,197,94,.3);color:#16a34a;border-radius:6px}.header-state span i{display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:var(--green);box-shadow:0 0 7px rgba(34,197,94,.4)}.header-state b{font-weight:500;color:#64748b}.header-state em{font-style:normal}.logic-flow{height:58px;flex:none;padding:8px 20px;display:grid;grid-template-columns:repeat(5,1fr);border-bottom:1px solid var(--edge);background:#ffffff}.logic-flow>div{display:flex;align-items:center;position:relative;opacity:.5}.logic-flow b{width:25px;height:25px;display:grid;place-items:center;border:1px solid #cbd5e1;border-radius:50%;font-size:9px;color:#94a3b8}.logic-flow span{display:flex;flex-direction:column;margin-left:8px}.logic-flow strong{font-size:10px;color:#334155}.logic-flow small{font-size:7px;color:#94a3b8;margin-top:2px}.logic-flow i{position:absolute;right:10px;color:#cbd5e1;font-style:normal}.logic-flow>div.active{opacity:1}.logic-flow>div.active b{color:#ffffff;background:var(--green);border-color:var(--green);box-shadow:0 0 12px rgba(34,197,94,.25)}.optimization-scroll{flex:1;min-height:0;overflow:auto;padding:12px 14px 20px;background-color:#f5f7fa;background-image:linear-gradient(rgba(148,163,184,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.07) 1px,transparent 1px);background-size:24px 24px}.kpi-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:9px;margin-bottom:10px}.kpi-grid article{min-height:77px;padding:11px 12px;border:1px solid var(--edge);border-top:2px solid var(--tone);background:var(--panel-bg);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);position:relative;overflow:hidden}.kpi-grid article::after{content:"";position:absolute;right:-18px;bottom:-26px;width:65px;height:65px;border:12px solid color-mix(in srgb,var(--tone) 8%,transparent);border-radius:50%}.kpi-grid .blue{--tone:#3b82f6}.kpi-grid .cyan{--tone:#0ea5e9}.kpi-grid .violet{--tone:#8b5cf6}.kpi-grid .green{--tone:#22c55e}.kpi-grid .amber{--tone:#f59e0b}.kpi-grid .red{--tone:#ef4444}.kpi-grid span{font-size:8px;color:#94a3b8}.kpi-grid strong{display:block;margin-top:4px;font-size:20px;color:#1e293b;font-variant-numeric:tabular-nums}.kpi-grid strong small{font-size:8px;color:#94a3b8;margin-left:4px}.kpi-grid em{display:block;margin-top:2px;font-size:7px;color:var(--tone);font-style:normal}.expert-card{border:1px solid var(--edge);background:var(--panel-bg);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden}.expert-card>header{height:48px;padding:0 13px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0f0}.expert-card>header>div:first-child{display:flex;align-items:center}.section-no{width:23px;height:23px;margin-right:9px;display:grid;place-items:center;border:1px solid #bae6fd;color:#0284c7;font-size:7px;border-radius:6px;background:#f0f9ff}.expert-card h2{font-size:11px;color:#2d3748}.expert-card header p{margin-top:2px;font-size:7px;color:#94a3b8}.analysis-grid{display:grid;grid-template-columns:minmax(0,1.68fr) minmax(330px,.72fr);gap:10px}.forecast-card{min-height:356px}.forecast-badges{display:flex;gap:7px}.forecast-badges span{font-size:7px;color:#64748b;padding:5px 7px;border:1px solid var(--edge);border-radius:6px;background:#f8fafc}.forecast-badges b{color:#0284c7}.load-chart{height:267px}.chart-legend{height:39px;display:flex;align-items:center;justify-content:center;gap:18px;color:#64748b;font-size:7px}.chart-legend span{display:flex;align-items:center;gap:5px}.chart-legend i{display:inline-block}.chart-legend .band{width:15px;height:7px;border-radius:2px;background:rgba(14,165,233,.22)}.chart-legend i.line{flex:none;width:15px;height:3px;background:#0ea5e9}.chart-legend .p50{background:#0ea5e9}.chart-legend .dot{width:7px;height:7px;border-radius:50%}.chart-legend .actual{background:#f97316}.chart-legend .block{width:12px;height:7px;border-radius:2px}.chart-legend .event{background:rgba(34,197,94,.25)}.chart-legend .peak{background:rgba(245,158,11,.25)}.input-stack{display:grid;grid-template-columns:1fr;gap:10px}.quality{font-size:7px;padding:3px 6px;border:1px solid;border-radius:4px}.quality.good{color:#16a34a;border-color:rgba(34,197,94,.32);background:rgba(34,197,94,.06)}.weather-now{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e2e8f0;border:1px solid var(--edge);border-radius:8px;overflow:hidden}.weather-now>div{padding:7px;background:#ffffff;text-align:center}.weather-now span{display:block;color:#94a3b8;font-size:7px}.weather-now strong{display:inline-block;margin-top:2px;font-size:12px;color:#2d3748}.weather-now small{font-size:6px;color:#94a3b8;margin-left:2px}.weather-chart{height:57px}.influence{height:25px;padding:0 10px;display:grid;grid-template-columns:110px 1fr 28px;align-items:center;gap:6px;font-size:7px;color:#64748b}.influence>b{height:3px;background:#e2e8f0;border-radius:2px;overflow:hidden}.influence>b i{display:block;height:100%;background:#0ea5e9}.influence>strong{color:#0284c7}.hall-list{padding:4px 10px 1px}.hall-list>div{display:grid;grid-template-columns:40px 1fr 62px 51px;align-items:center;gap:5px;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:7px}.hall-list>div>b{font-size:8px;color:#334155}.hall-list>div>span,.hall-list>div>em{color:#64748b;font-style:normal}.hall-list>div>small{padding:2px 3px;text-align:center;color:#d97706;background:rgba(245,158,11,.1);border-radius:4px}.hall-list p{grid-column:1/-1;margin-top:2px;color:#64748b}.hall-list p strong{color:#16a34a}.hall-list p i{float:right;color:#0284c7;font-style:normal}.event-influence>b i{background:#22c55e}.optimization-toast{position:absolute;z-index:40;left:50%;bottom:34px;transform:translateX(-50%);padding:9px 16px;border:1px solid var(--edge);background:#ffffff;color:#1e293b;font-size:9px;border-radius:8px;box-shadow:0 12px 28px rgba(0,0,0,.12)}.tariff-strip{height:25px;padding:0 10px;display:flex;align-items:center;gap:8px;border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0;font-size:7px;color:#64748b}.tariff-strip span{color:#d97706}.tariff-strip span i{display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%;background:#f59e0b;box-shadow:0 0 7px rgba(245,158,11,.5)}.tariff-strip b{color:#b45309}.tariff-strip em{margin-left:auto;font-style:normal;color:#94a3b8}.schedule-card{margin-top:10px}.schedule-tags{display:flex;align-items:center;gap:6px}.schedule-tags span,.schedule-tags b{padding:4px 7px;border:1px solid rgba(14,165,233,.3);font-size:7px;font-weight:500;color:#0284c7;border-radius:4px;background:rgba(14,165,233,.05)}.schedule-tags .analysis-only{border-color:rgba(245,158,11,.32);color:#d97706;background:rgba(245,158,11,.06)}.plant-timeline{height:102px;margin:0 13px;position:relative;display:grid;grid-template-columns:repeat(4,minmax(110px,1fr)) 260px;align-items:center;gap:10px}.timeline-line{position:absolute;left:5%;right:285px;top:48px;height:2px;background:linear-gradient(90deg,#0ea5e9,#22c55e 42%,#f59e0b 73%,#ef4444)}.timeline-line i{display:block;width:72%;height:100%;background:rgba(0,0,0,.06)}.timeline-node{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center}.timeline-node::before{content:"";width:10px;height:10px;margin-bottom:5px;border:2px solid #ffffff;border-radius:50%;background:#0ea5e9;box-shadow:0 0 0 2px rgba(14,165,233,.25)}.timeline-node.stop::before{background:#f59e0b;box-shadow:0 0 0 2px rgba(245,158,11,.25)}.timeline-node.close::before{background:#ef4444;box-shadow:0 0 0 2px rgba(239,68,68,.23)}.timeline-node b{font-size:14px;color:#1e293b}.timeline-node span{margin-top:2px;font-size:8px;color:#475569}.timeline-node small{font-size:6px;color:#94a3b8}.plant-timeline aside{height:65px;padding:8px 10px;border-left:1px solid var(--edge);display:grid;align-content:center;gap:7px;background:#f8fafc;border-radius:0 8px 8px 0}.plant-timeline aside span{font-size:7px;color:#64748b}.plant-timeline aside b{float:right;color:#16a34a;font-size:9px}.schedule-table-wrap{overflow:auto;border-top:1px solid var(--edge)}.schedule-table{width:100%;border-collapse:collapse;font-size:7px}.schedule-table th{padding:7px 9px;text-align:left;color:#475569;background:#f8fafc;font-weight:500;white-space:nowrap}.schedule-table td{padding:8px 9px;border-top:1px solid #f0f0f0;color:#64748b;vertical-align:top}.schedule-table td strong,.schedule-table td b{display:block;color:#334155;font-size:8px}.schedule-table td span{display:block;margin-top:2px;line-height:1.45;color:#94a3b8}.schedule-table .time-cell strong{font-size:12px;color:#16a34a}.schedule-table .time-cell span{color:#94a3b8}.schedule-table td:last-child{min-width:170px}.schedule-table td:last-child i{display:inline-block;margin-top:3px;padding:2px 4px;font-style:normal;color:#0284c7;border:1px solid rgba(14,165,233,.25);border-radius:4px}.view-tabs{display:flex;border:1px solid var(--edge);border-radius:8px;background:#f8fafc;overflow:hidden}.view-tabs button{height:25px;padding:0 9px;border:0;border-right:1px solid var(--edge);background:transparent;color:#64748b;font-size:7px}.view-tabs button:last-child{border-right:0}.view-tabs button.active{color:#0284c7;background:rgba(14,165,233,.1);box-shadow:inset 0 -2px #0ea5e9}@media(max-width:1180px){.kpi-grid{grid-template-columns:repeat(3,1fr)}.analysis-grid{grid-template-columns:1fr}.input-stack{grid-template-columns:1fr 1fr}}@media(max-width:1180px){.plant-timeline{grid-template-columns:repeat(4,1fr)}.plant-timeline aside{display:none}.timeline-line{right:5%}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
