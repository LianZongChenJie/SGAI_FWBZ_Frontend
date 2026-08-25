<template>
  <div class="event-schedule-page">
    <header class="schedule-header">
      <div>
        <span class="eyebrow">EVENT SCHEDULE DRIVEN START / STOP</span>
        <h1>活动排期驱动启停求解</h1>
        <p>服贸小镇活动排期 · 分馆能耗 · 设备启停联动 · 开闭馆硬边界</p>
      </div>
      <div class="header-state">
        <span class="tag-hard">排期硬约束</span>
        <span class="tag-analysis">末端只采集</span>
        <b>主导 {{ text('optimization.schedule.plant.governingHall') }}</b>
        <em>更新 {{ text('optimization.forecast.updatedAt') }}</em>
      </div>
    </header>

    <section class="kpi-grid" aria-label="活动能耗指标">
      <article v-for="item in kpis" :key="item.label" :class="item.tone">
        <span>{{ item.label }}</span><strong>{{ item.value }}<small>{{ item.unit }}</small></strong><em>{{ item.note }}</em>
      </article>
    </section>

    <main class="schedule-scroll">
      <section class="schedule-grid">
        <div class="schedule-main">
          <article class="expert-card energy-card">
            <header>
              <div><span class="section-no">01</span><div><h2>活动与能耗关系</h2><p>服贸小镇逐时分馆能耗 · 客流曲线 · 预冷爬坡与余冷回落对齐排期窗口</p></div></div>
              <div class="energy-badges"><span>活动日合计 <b>{{ format('optimization.energy.day.totalKWh', 0) }} kWh</b></span><span>非活动基线 <b>{{ format('optimization.energy.day.baselineKWh', 0) }} kWh</b></span></div>
            </header>
            <div ref="energyChartRef" class="energy-chart"></div>
            <div class="chart-legend">
              <span><i class="block hall1"></i>1号馆（旧馆·仅计量）</span><span><i class="block hall2"></i>2号馆</span><span><i class="block hall3"></i>3号馆</span><span><i class="block hall4"></i>4号馆</span><span><i class="line attendance"></i>小镇客流</span><span><i class="block event"></i>活动时段</span>
            </div>
          </article>

          <article class="expert-card linkage-card">
            <header>
              <div><span class="section-no">02</span><div><h2>活动与设备启停联动</h2><p>各馆按排期错峰：预冷段（能源站启动 → 开馆）· 供冷段（开馆 → 建议停机）· 余冷滑行（停机 → 闭馆）</p></div></div>
              <div class="schedule-tags"><span>分馆差异化启停</span><b>置信度 {{ format('optimization.schedule.plant.confidence', 0) }}%</b></div>
            </header>
            <div ref="linkageChartRef" class="linkage-chart"></div>
            <div class="chart-legend">
              <span><i class="block precool"></i>预冷段</span><span><i class="block run"></i>供冷段</span><span><i class="block coast"></i>余冷滑行</span><span><i class="block legacy"></i>旧馆固定运行（外部管理）</span>
            </div>
            <div class="equipment-caption">能源站设备随排期错峰启动：泵组随站启动，冷水机组延迟 10 min，冷却塔延迟 15 min；开馆越早、降温越慢的馆启动越早。旧馆（1号馆）冷机启停不在本页管理。</div>
            <div class="schedule-table-wrap equipment-table-wrap">
              <table class="schedule-table">
                <thead><tr><th>场馆 / 活动窗口</th><th>能源站启动</th><th>冷冻·冷却水泵</th><th>冷水机组（+10min）</th><th>冷却塔（+15min）</th><th>建议停机</th><th>余冷滑行</th></tr></thead>
                <tbody>
                  <tr v-for="row in equipmentRows" :key="row.no">
                    <td><strong>{{ row.no }}号馆</strong><span>{{ row.open }}–{{ row.close }} · {{ row.people.toLocaleString() }} 人</span></td>
                    <td class="time-cell"><strong>{{ row.station }}</strong><span>预冷 {{ row.lead }} min</span></td>
                    <td class="time-cell"><strong>{{ row.pumps }}</strong><span>随站启动</span></td>
                    <td class="time-cell"><strong>{{ row.chiller }}</strong><span>按启停顺序</span></td>
                    <td class="time-cell"><strong>{{ row.tower }}</strong><span>按冷凝负荷</span></td>
                    <td class="time-cell"><strong>{{ row.stop }}</strong><span>闭馆 {{ row.close }}</span></td>
                    <td class="time-cell"><strong>{{ row.coast }} min</strong><span>利用管网余冷</span></td>
                  </tr>
                  <tr class="legacy-row">
                    <td><strong>1号馆（旧馆）</strong><span>{{ legacyHall.open }}–{{ legacyHall.close }} · {{ legacyHall.people.toLocaleString() }} 人</span></td>
                    <td colspan="5"><span class="legacy-note">冷机启停由既有系统固定时刻管理（08:00–18:30），本页只展示活动与能耗，不生成启停建议</span></td>
                    <td><strong>{{ format('optimization.energy.day.hall1KWh', 0) }}</strong><span>kWh · 仅计量</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside class="input-stack">
          <article class="expert-card event-card">
            <header><div><span class="section-no">A</span><div><h2>会展日程输入</h2><p>开闭馆 + 客流 → 分馆启停求解的硬边界输入</p></div></div><span class="quality good">3 / 3 已接入</span></header>
            <div class="hall-list">
              <div v-for="hall in halls" :key="hall.no">
                <b>{{ hall.no }}号馆</b><span>{{ hall.open }}–{{ hall.close }}</span><em>{{ hall.people.toLocaleString() }} 人</em><small>{{ hall.level }}</small>
                <p>建议 <strong>{{ hall.start }}</strong> 启动 · <strong>{{ hall.stop }}</strong> 停止 <i>{{ hall.confidence }}%</i></p>
              </div>
              <div class="hall-legacy">
                <b>1号馆</b><span>{{ legacyHall.open }}–{{ legacyHall.close }}</span><em>{{ legacyHall.people.toLocaleString() }} 人</em><small>旧馆·仅计量</small>
                <p>冷机外部管理 · 能耗 {{ format('optimization.energy.day.hall1KWh', 0) }} kWh</p>
              </div>
            </div>
            <div class="influence event-influence"><span>会展日程负荷贡献</span><b><i :style="{ width: `${numberValue('optimization.forecast.eventContribution')}%` }"></i></b><strong>{{ format('optimization.forecast.eventContribution', 0) }}%</strong></div>
          </article>

          <article class="expert-card diff-card">
            <header><div><span class="section-no">B</span><div><h2>排期差异概览</h2><p>三馆开闭馆不同步 → 能源站启动 / 停机错峰</p></div></div></header>
            <div class="diff-list">
              <div v-for="item in scheduleDiff" :key="item.label">
                <span>{{ item.label }}</span><strong>{{ item.value }}</strong><em>{{ item.note }}</em>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section class="expert-card solve-card">
        <header>
          <div><span class="section-no">03</span><div><h2>整站求解结论与分馆明细</h2><p>启动取最早推荐馆 · 停机取最晚滑行馆 · 末端数据只分析不下控</p></div></div>
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
            <tbody><tr v-for="hall in scheduleHalls" :key="hall.no"><td><strong>{{ hall.no }}号馆</strong><span>{{ hall.open }}–{{ hall.close }}</span></td><td><b>{{ hall.indoor.toFixed(1) }}℃</b><span>目标 {{ hall.target.toFixed(1) }}℃ · RH {{ hall.rh.toFixed(0) }}%</span></td><td><b>降 {{ hall.cooling.toFixed(1) }}℃/h</b><span>停机升 {{ hall.drift.toFixed(2) }}℃/h · {{ hall.samples }}d</span></td><td class="time-cell"><strong>{{ hall.latestStart }}</strong><span>推荐 {{ hall.start }}</span></td><td class="time-cell"><strong>{{ hall.earliestStop }}</strong><span>余冷 {{ hall.coast }} min</span></td><td><b>{{ hall.openTemp.toFixed(1) }} / {{ hall.closeTemp.toFixed(1) }}℃</b><span>允许上限 {{ hall.maxTemp.toFixed(1) }}℃</span></td><td><b>早开 +{{ hall.waste }} kWh</b><span>晚开风险 {{ hall.lateRisk }} min</span></td><td><span>{{ hall.evidence }}</span><i>{{ hall.confidence }}%</i></td></tr></tbody>
          </table>
        </div>
      </section>
    </main>
    <div v-if="toast" class="optimization-toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ENERGY_OPTIMIZATION_DEFAULTS, ENERGY_OPTIMIZATION_POINTS } from './data/energyOptimizationPoints.js'
import { recalculateExhibitionRecommendations } from './utils/energyOptimizationEngine.js'

const values = reactive({ ...ENERGY_OPTIMIZATION_DEFAULTS })
const quality = reactive({})
const energyChartRef = ref(null)
const linkageChartRef = ref(null)
const toast = ref('')
let energyChart
let linkageChart
let toastTimer
let snapshotTimer
const pointMap = Object.fromEntries(ENERGY_OPTIMIZATION_POINTS.map(item => [item.key, item]))

function raw(key) { return values[key] ?? '--' }
function text(key) { return String(raw(key)) }
function numberValue(key) { const n = Number(raw(key)); return Number.isFinite(n) ? n : 0 }
function format(key, digits = 1) { const n = Number(raw(key)); return Number.isFinite(n) ? n.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '--' }
const fmtInt = n => Number.isFinite(n) ? Math.round(n).toLocaleString('zh-CN') : '--'
function timeToMinutes(value) { const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/); if (!match) return null; const h = Number(match[1]); const m = Number(match[2]); if (h > 23 || m > 59) return null; return h * 60 + m }
function minutesToTimeLabel(value) { const m = ((Math.round(value) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` }
function hourLabel(key, fallback) { const match = String(raw(key)).match(/^(\d{1,2}):/); return match ? match[1].padStart(2, '0') : fallback }

// 2/3/4 号馆：排期输入 + 启停求解结果
const halls = computed(() => [2, 3, 4].map(no => ({
  no,
  name: text(`optimization.event.hall${no}.name`),
  open: text(`optimization.event.hall${no}.openTime`),
  close: text(`optimization.event.hall${no}.closeTime`),
  people: numberValue(`optimization.event.hall${no}.expectedAttendance`),
  level: text(`optimization.event.hall${no}.eventLevel`),
  start: text(`optimization.schedule.hall${no}.recommendedStart`),
  stop: text(`optimization.schedule.hall${no}.recommendedStop`),
  latestStart: text(`optimization.schedule.hall${no}.latestSafeStart`),
  earliestStop: text(`optimization.schedule.hall${no}.earliestSafeStop`),
  lead: numberValue(`optimization.schedule.hall${no}.leadMinutes`),
  coast: numberValue(`optimization.schedule.hall${no}.coastMinutes`),
  confidence: numberValue(`optimization.schedule.hall${no}.confidence`)
})))
// 旧馆（1号馆）：只展示活动与能耗，冷机启停由既有系统管理
const legacyHall = computed(() => ({
  open: text('optimization.event.hall1.openTime'),
  close: text('optimization.event.hall1.closeTime'),
  people: numberValue('optimization.event.hall1.expectedAttendance'),
  level: text('optimization.event.hall1.eventLevel'),
  energy: numberValue('optimization.energy.day.hall1KWh')
}))
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
const kpis = computed(() => {
  const total = numberValue('optimization.energy.day.totalKWh')
  const baseline = numberValue('optimization.energy.day.baselineKWh')
  const legacy = numberValue('optimization.energy.day.hall1KWh')
  const newHalls = [2, 3, 4].reduce((sum, no) => sum + numberValue(`optimization.energy.day.hall${no}KWh`), 0)
  const share = total > 0 ? Math.max(0, (total - baseline) / total * 100) : 0
  return [
    { label: '活动日总能耗', value: fmtInt(total), unit: 'kWh', note: '服贸小镇 1–4 号馆合计', tone: 'blue' },
    { label: '新馆活动能耗 2/3/4号馆', value: fmtInt(newHalls), unit: 'kWh', note: '排期驱动启停管理范围', tone: 'cyan' },
    { label: '旧馆（1号馆）能耗', value: fmtInt(legacy), unit: 'kWh', note: '仅计量 · 冷机启停外部管理', tone: 'slate' },
    { label: '活动能耗占比', value: share.toFixed(1), unit: '%', note: `较非活动基线 +${fmtInt(total - baseline)} kWh`, tone: 'green' },
    { label: '预计预冷用电', value: format('optimization.schedule.plant.estimatedPrecoolEnergy', 0), unit: 'kWh', note: `启动 ${text('optimization.schedule.plant.recommendedStart')} → 开馆 ${text('optimization.schedule.plant.earliestEventOpen')}`, tone: 'violet' },
    { label: '较固定时刻节电', value: format('optimization.schedule.plant.estimatedSavedVsFixed', 0), unit: 'kWh', note: '三馆错峰启动 + 余冷滑行', tone: 'amber' }
  ]
})
// 排期差异：三馆开闭馆与启停时间的错峰幅度
const scheduleDiff = computed(() => {
  const list = halls.value.filter(hall => timeToMinutes(hall.open) != null && timeToMinutes(hall.close) != null)
  if (!list.length) return []
  const first = list.reduce((a, b) => timeToMinutes(a.open) <= timeToMinutes(b.open) ? a : b)
  const last = list.reduce((a, b) => timeToMinutes(a.close) >= timeToMinutes(b.close) ? a : b)
  const span = (a, b) => Math.abs(timeToMinutes(a) - timeToMinutes(b))
  const minOpen = Math.min(...list.map(hall => timeToMinutes(hall.open)))
  const maxOpen = Math.max(...list.map(hall => timeToMinutes(hall.open)))
  const startMins = list.map(hall => timeToMinutes(hall.start)).filter(value => value != null)
  const stopMins = list.map(hall => timeToMinutes(hall.stop)).filter(value => value != null)
  return [
    { label: '最早开馆', value: first.open, note: `${first.no}号馆 · 启动硬边界` },
    { label: '最晚闭馆', value: last.close, note: `${last.no}号馆 · 停机硬边界` },
    { label: '三馆开馆时差', value: `${maxOpen - minOpen} min`, note: '入场不同步 → 分馆错峰预冷' },
    { label: '能源站启动跨度', value: `${minutesToTimeLabel(Math.min(...startMins))}–${minutesToTimeLabel(Math.max(...startMins))}`, note: `启动错峰 ${Math.max(...startMins) - Math.min(...startMins)} min` },
    { label: '建议停机跨度', value: `${minutesToTimeLabel(Math.min(...stopMins))}–${minutesToTimeLabel(Math.max(...stopMins))}`, note: `停机错峰 ${Math.max(...stopMins) - Math.min(...stopMins)} min` },
    { label: '旧馆（1号馆）', value: '固定 08:00–18:30', note: '冷机外部管理 · 仅计量能耗' }
  ]
})
// 设备启动时序：泵组随站启动，冷水机组 +10min，冷却塔 +15min
const equipmentRows = computed(() => halls.value.map(hall => {
  const startMin = timeToMinutes(hall.start)
  return {
    no: hall.no,
    open: hall.open,
    close: hall.close,
    people: hall.people,
    station: hall.start,
    lead: hall.lead,
    pumps: startMin != null ? minutesToTimeLabel(startMin) : '--',
    chiller: startMin != null ? minutesToTimeLabel(startMin + 10) : '--',
    tower: startMin != null ? minutesToTimeLabel(startMin + 15) : '--',
    stop: hall.stop,
    coast: hall.coast
  }
}))
// 甘特图行序（自下而上）：旧馆、4、3、2 号馆
const ganttRows = computed(() => {
  const hallRows = halls.value.map(hall => {
    const openMin = timeToMinutes(hall.open)
    const closeMin = timeToMinutes(hall.close)
    const startMin = timeToMinutes(hall.start)
    const stopMin = timeToMinutes(hall.stop)
    const stopClamped = stopMin != null && closeMin != null ? Math.min(stopMin, closeMin) : closeMin
    return { ...hall, openMin, closeMin, startMin, stopMin: stopClamped, legacy: false }
  }).filter(row => row.openMin != null && row.closeMin != null && row.startMin != null)
  const legacy = { key: 'legacy', label: '1号馆（旧馆）', startMin: 8 * 60, stopMin: 18 * 60 + 30, openMin: timeToMinutes(legacyHall.value.open) ?? 9 * 60, closeMin: timeToMinutes(legacyHall.value.close) ?? 18 * 60, open: legacyHall.value.open, close: legacyHall.value.close, legacy: true }
  return [legacy, ...hallRows.slice().reverse()]
})

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
  recalculateExhibitionRecommendations(raw, (key, value) => { values[key] = value })
}
async function loadSnapshot() {
  try { const response = await fetch('/api/energy-optimization/points'); if (response.ok) applyPoints(await response.json()) } catch {}
}
async function ensureEcharts() {
  if (window.echarts) return window.echarts
  await new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = '/vendor/echarts.min.js'; script.onload = resolve; script.onerror = reject; document.head.appendChild(script) })
  return window.echarts
}
function bindChart(instance, el) {
  if (instance && !instance.isDisposed() && instance.getDom() === el) return instance
  if (instance && !instance.isDisposed()) instance.dispose()
  return window.echarts.init(el)
}
function disposeCharts() {
  if (energyChart) { energyChart.dispose(); energyChart = null }
  if (linkageChart) { linkageChart.dispose(); linkageChart = null }
}
function renderCharts() {
  if (!window.echarts || !energyChartRef.value || !linkageChartRef.value) return
  energyChart = bindChart(energyChart, energyChartRef.value)
  linkageChart = bindChart(linkageChart, linkageChartRef.value)
  renderEnergyChart()
  renderLinkageChart()
}
function renderEnergyChart() {
  const chartHours = raw('optimization.forecast.hours')
  const openHour = hourLabel('optimization.schedule.plant.earliestEventOpen', '09')
  const closeHour = hourLabel('optimization.schedule.plant.latestEventClose', '19')
  energyChart.setOption({ animationDuration: 500, grid: { left: 46, right: 50, top: 30, bottom: 26 }, tooltip: { trigger: 'axis', backgroundColor: '#ffffff', borderColor: '#e2e8f0', textStyle: { color: '#2d3748', fontSize: 11 } }, xAxis: { type: 'category', data: chartHours, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 9, interval: 1 } }, yAxis: [
    { type: 'value', name: 'kWh', nameTextStyle: { color: '#94a3b8' }, axisLabel: { color: '#94a3b8', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.25)' } } },
    { type: 'value', name: '客流 / 人', nameTextStyle: { color: '#94a3b8' }, axisLabel: { color: '#94a3b8', fontSize: 9 }, splitLine: { show: false } }
  ], series: [
    { name: '1号馆（旧馆·仅计量）', type: 'bar', stack: 'energy', barWidth: '52%', data: raw('optimization.energy.hourly.hall1'), itemStyle: { color: '#5f7280' } },
    { name: '2号馆', type: 'bar', stack: 'energy', data: raw('optimization.energy.hourly.hall2'), itemStyle: { color: '#3f9ee8' } },
    { name: '3号馆', type: 'bar', stack: 'energy', data: raw('optimization.energy.hourly.hall3'), itemStyle: { color: '#35c7d7' } },
    { name: '4号馆', type: 'bar', stack: 'energy', data: raw('optimization.energy.hourly.hall4'), itemStyle: { color: '#8e7fe4' } },
    { name: '小镇客流', type: 'line', yAxisIndex: 1, data: raw('optimization.energy.hourly.attendance'), symbol: 'none', smooth: true, lineStyle: { width: 2, color: '#f0a353' }, itemStyle: { color: '#f0a353' }, markArea: { silent: true, data: [[{ xAxis: openHour, itemStyle: { color: 'rgba(34,197,94,.08)' }, label: { show: true, formatter: '服贸小镇活动时段', color: '#16a34a', fontSize: 9 } }, { xAxis: closeHour }]] } }
  ] })
}
function renderLinkageChart() {
  const rows = ganttRows.value
  if (!rows.length) return
  const bases = rows.map(row => row.startMin)
  const precoolData = rows.map(row => !row.legacy && row.openMin - row.startMin > 0
    ? { value: row.openMin - row.startMin, label: { show: true, position: 'insideLeft', formatter: row.start, color: '#ffffff', fontSize: 8 } }
    : 0)
  const runData = rows.map(row => row.legacy
    ? { value: Math.max(0, row.stopMin - row.startMin), itemStyle: { color: '#94a3b8' }, label: { show: true, position: 'insideLeft', formatter: '固定时刻 08:00–18:30 · 冷机外部管理', color: '#ffffff', fontSize: 8 } }
    : { value: Math.max(0, row.stopMin - row.openMin), label: { show: true, position: 'insideLeft', formatter: `开馆 ${row.open}`, color: '#ffffff', fontSize: 8 } })
  const coastData = rows.map(row => !row.legacy && row.closeMin - row.stopMin > 0
    ? { value: row.closeMin - row.stopMin, label: { show: true, position: 'right', formatter: `${row.stop} 停 → ${row.close} 闭`, color: '#1e293b', fontSize: 8 } }
    : 0)
  const minAxis = Math.floor((Math.min(...bases) - 45) / 60) * 60
  const maxEnd = Math.max(...rows.map(row => row.legacy ? row.stopMin : row.closeMin))
  const maxAxis = Math.ceil((maxEnd + 110) / 60) * 60
  linkageChart.setOption({ animationDuration: 500, grid: { left: 58, right: 18, top: 14, bottom: 26 }, tooltip: { trigger: 'item', backgroundColor: '#ffffff', borderColor: '#e2e8f0', textStyle: { color: '#2d3748', fontSize: 11 }, formatter: params => {
    const row = rows[params.dataIndex]
    if (!row) return ''
    if (row.legacy) return `<b>${row.label}</b><br/>活动 ${row.open}–${row.close} · 固定 08:00–18:30 运行<br/>冷机启停由既有系统管理，本页仅展示能耗`
    return `<b>${row.no}号馆</b> · ${row.name}<br/>能源站启动 ${row.start}（最晚安全 ${row.latestStart}）<br/>最早开馆 ${row.open}（硬边界）<br/>建议停机 ${row.stop}（最早安全 ${row.earliestStop}）<br/>最晚闭馆 ${row.close}（硬边界）· 余冷滑行 ${row.coast} min`
  } }, xAxis: { type: 'value', min: minAxis, max: maxAxis, interval: 60, axisLabel: { color: '#94a3b8', fontSize: 9, formatter: value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}` }, splitLine: { lineStyle: { color: 'rgba(148,163,184,.15)' } } }, yAxis: { type: 'category', data: rows.map(row => row.legacy ? '1号馆·旧馆' : `${row.no}号馆`), axisLine: { lineStyle: { color: '#e2e8f0' } }, axisTick: { show: false }, axisLabel: { color: '#64748b', fontSize: 10 } }, series: [
    { name: '占位', type: 'bar', stack: 'hall', barWidth: 20, silent: true, itemStyle: { color: 'transparent' }, data: bases },
    { name: '预冷段（能源站启动→开馆）', type: 'bar', stack: 'hall', data: precoolData, itemStyle: { color: 'rgba(14,165,233,.75)' } },
    { name: '供冷段（开馆→建议停机）', type: 'bar', stack: 'hall', data: runData, itemStyle: { color: 'rgba(34,197,94,.72)' } },
    { name: '余冷滑行（停机→闭馆）', type: 'bar', stack: 'hall', data: coastData, itemStyle: { color: 'rgba(245,158,11,.65)' } }
  ] })
}
function resizeCharts() { energyChart?.resize(); linkageChart?.resize() }
function showToast(message) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 2800) }
function onOptimizationValues(event) { applyPoints(event.detail) }

const eventScheduleApi = { updatePoint: (key, value, options = {}) => applyPoints([{ key, value, ...options }]), updatePoints: applyPoints, getSnapshot: () => ({ ...values }), getPointCatalog: () => ENERGY_OPTIMIZATION_POINTS.map(item => ({ ...item })) }

onMounted(async () => {
  window.addEventListener('energy-optimization-values', onOptimizationValues)
  window.addEventListener('resize', resizeCharts)
  window.EventSchedule = eventScheduleApi
  recalculateRecommendations()
  await loadSnapshot()
  try { await ensureEcharts(); renderCharts() } catch { showToast('图表组件加载失败，请检查本地资源') }
  snapshotTimer = setInterval(loadSnapshot, 30 * 60 * 1000)
})
onUnmounted(() => {
  clearInterval(snapshotTimer); clearTimeout(toastTimer); disposeCharts()
  window.removeEventListener('energy-optimization-values', onOptimizationValues); window.removeEventListener('resize', resizeCharts)
  if (window.EventSchedule === eventScheduleApi) delete window.EventSchedule
})
</script>

<style scoped>
.event-schedule-page{--ink:#2d3748;--muted:#64748b;--edge:#e2e8f0;--panel-bg:#ffffff;--cyan:#0ea5e9;--green:#22c55e;--blue:#3b82f6;--amber:#f59e0b;--red:#ef4444;height:100%;min-height:0;display:flex;flex-direction:column;color:var(--ink);background:#f5f7fa;font-family:"PingFang SC","Microsoft YaHei",sans-serif;position:relative}
.schedule-header{height:72px;flex:none;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--edge);background:#ffffff}
.schedule-header .eyebrow{color:#94a3b8;font-size:9px;font-weight:700;letter-spacing:2px}
.schedule-header h1{font-size:19px;margin:2px 0 1px;color:#1e293b}
.schedule-header p{font-size:9px;color:#94a3b8}
.header-state{display:flex;align-items:center;gap:10px;font-size:8px;color:#94a3b8}
.header-state .tag-hard{padding:5px 8px;border:1px solid rgba(14,165,233,.3);color:#0284c7;border-radius:6px;background:rgba(14,165,233,.05)}
.header-state .tag-analysis{padding:5px 8px;border:1px solid rgba(245,158,11,.32);color:#d97706;border-radius:6px;background:rgba(245,158,11,.06)}
.header-state b{font-weight:500;color:#64748b}
.header-state em{font-style:normal}
.kpi-grid{flex:none;display:grid;grid-template-columns:repeat(6,1fr);gap:9px;padding:12px 0 0}
.kpi-grid article{min-height:77px;padding:11px 12px;border:1px solid var(--edge);border-top:2px solid var(--tone);background:var(--panel-bg);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);position:relative;overflow:hidden}
.kpi-grid article::after{content:"";position:absolute;right:-18px;bottom:-26px;width:65px;height:65px;border:12px solid color-mix(in srgb,var(--tone) 8%,transparent);border-radius:50%}
.kpi-grid .blue{--tone:#3b82f6}.kpi-grid .cyan{--tone:#0ea5e9}.kpi-grid .violet{--tone:#8b5cf6}.kpi-grid .green{--tone:#22c55e}.kpi-grid .amber{--tone:#f59e0b}.kpi-grid .red{--tone:#ef4444}.kpi-grid .slate{--tone:#8296a3}
.kpi-grid span{font-size:8px;color:#94a3b8}
.kpi-grid strong{display:block;margin-top:4px;font-size:20px;color:#1e293b;font-variant-numeric:tabular-nums}
.kpi-grid strong small{font-size:8px;color:#94a3b8;margin-left:4px}
.kpi-grid em{display:block;margin-top:2px;font-size:7px;color:var(--tone);font-style:normal}
.schedule-scroll{flex:1;min-height:0;overflow:auto;padding:12px 0 20px;background-color:#f5f7fa;background-image:linear-gradient(rgba(148,163,184,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.07) 1px,transparent 1px);background-size:24px 24px}
.schedule-grid{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(330px,.78fr);gap:10px}
.schedule-main{display:grid;grid-template-columns:1fr;gap:10px;align-content:start;min-width:0}
.expert-card{border:1px solid var(--edge);background:var(--panel-bg);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden}
.expert-card>header{height:48px;padding:0 13px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0f0}
.expert-card>header>div:first-child{display:flex;align-items:center}
.section-no{width:23px;height:23px;margin-right:9px;display:grid;place-items:center;border:1px solid #bae6fd;color:#0284c7;font-size:7px;border-radius:6px;background:#f0f9ff;flex:none}
.expert-card h2{font-size:11px;color:#2d3748}
.expert-card header p{margin-top:2px;font-size:7px;color:#94a3b8}
.energy-badges{display:flex;gap:7px}
.energy-badges span{font-size:7px;color:#64748b;padding:5px 7px;border:1px solid var(--edge);border-radius:6px;background:#f8fafc}
.energy-badges b{color:#0284c7}
.energy-chart{height:236px}
.chart-legend{height:34px;display:flex;align-items:center;justify-content:center;gap:16px;color:#64748b;font-size:7px;flex-wrap:wrap}
.chart-legend span{display:flex;align-items:center;gap:5px}
.chart-legend i{display:inline-block}
.chart-legend .block{width:12px;height:7px;border-radius:2px}
.chart-legend .hall1{background:#5f7280}.chart-legend .hall2{background:#3f9ee8}.chart-legend .hall3{background:#35c7d7}.chart-legend .hall4{background:#8e7fe4}.chart-legend .event{background:rgba(34,197,94,.25)}
.chart-legend .line{width:15px;height:3px}.chart-legend .attendance{background:#f0a353}
.chart-legend .precool{background:rgba(14,165,233,.5)}.chart-legend .run{background:rgba(34,197,94,.65)}.chart-legend .coast{background:rgba(245,158,11,.55)}.chart-legend .legacy{background:#94a3b8}
.linkage-chart{height:196px}
.equipment-caption{padding:7px 13px 6px;color:#64748b;font-size:7px;line-height:1.6;border-top:1px solid #f0f0f0}
.input-stack{display:grid;grid-template-columns:1fr;gap:10px;align-content:start;min-width:0}
.quality{font-size:7px;padding:3px 6px;border:1px solid;border-radius:4px}
.quality.good{color:#16a34a;border-color:rgba(34,197,94,.32);background:rgba(34,197,94,.06)}
.hall-list{padding:4px 10px 1px}
.hall-list>div{display:grid;grid-template-columns:40px 1fr 62px 51px;align-items:center;gap:5px;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:7px}
.hall-list>div>b{font-size:8px;color:#334155}
.hall-list>div>span,.hall-list>div>em{color:#64748b;font-style:normal}
.hall-list>div>small{padding:2px 3px;text-align:center;color:#d97706;background:rgba(245,158,11,.1);border-radius:4px}
.hall-list p{grid-column:1/-1;margin-top:2px;color:#64748b}
.hall-list p strong{color:#16a34a}
.hall-list p i{float:right;color:#0284c7;font-style:normal}
.hall-list .hall-legacy{opacity:.66}
.hall-list .hall-legacy small{color:#8296a3;background:rgba(130,150,163,.12)}
.hall-list .hall-legacy p strong{color:#7fa3b5}
.influence{height:25px;padding:0 10px;display:grid;grid-template-columns:110px 1fr 28px;align-items:center;gap:6px;font-size:7px;color:#64748b}
.influence>b{height:3px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.influence>b i{display:block;height:100%;background:#0ea5e9}
.influence>strong{color:#0284c7}
.event-influence>b i{background:#22c55e}
.diff-list{padding:6px 10px 8px}
.diff-list>div{display:grid;grid-template-columns:88px 1fr;align-items:baseline;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:7px}
.diff-list>div:last-child{border-bottom:0}
.diff-list span{color:#64748b}
.diff-list strong{color:#1e293b;font-size:10px;font-variant-numeric:tabular-nums}
.diff-list em{grid-column:2;margin-top:1px;color:#94a3b8;font-style:normal}
.diff-list>div:first-child strong,.diff-list>div:nth-child(2) strong{color:#16a34a}
.diff-list>div:last-child strong{color:#94a3b8;font-size:8px}
.schedule-tags{display:flex;align-items:center;gap:6px}
.schedule-tags span,.schedule-tags b{padding:4px 7px;border:1px solid rgba(14,165,233,.3);font-size:7px;font-weight:500;color:#0284c7;border-radius:4px;background:rgba(14,165,233,.05)}
.schedule-tags .analysis-only{border-color:rgba(245,158,11,.32);color:#d97706;background:rgba(245,158,11,.06)}
.solve-card{margin-top:10px}
.plant-timeline{height:102px;margin:0 13px;position:relative;display:grid;grid-template-columns:repeat(4,minmax(110px,1fr)) 260px;align-items:center;gap:10px}
.timeline-line{position:absolute;left:5%;right:285px;top:48px;height:2px;background:linear-gradient(90deg,#0ea5e9,#22c55e 42%,#f59e0b 73%,#ef4444)}
.timeline-line i{display:block;width:72%;height:100%;background:rgba(0,0,0,.06)}
.timeline-node{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center}
.timeline-node::before{content:"";width:10px;height:10px;margin-bottom:5px;border:2px solid #ffffff;border-radius:50%;background:#0ea5e9;box-shadow:0 0 0 2px rgba(14,165,233,.25)}
.timeline-node.stop::before{background:#f59e0b;box-shadow:0 0 0 2px rgba(245,158,11,.25)}
.timeline-node.close::before{background:#ef4444;box-shadow:0 0 0 2px rgba(239,68,68,.23)}
.timeline-node b{font-size:14px;color:#1e293b}
.timeline-node span{margin-top:2px;font-size:8px;color:#475569}
.timeline-node small{font-size:6px;color:#94a3b8}
.plant-timeline aside{height:65px;padding:8px 10px;border-left:1px solid var(--edge);display:grid;align-content:center;gap:7px;background:#f8fafc;border-radius:0 8px 8px 0}
.plant-timeline aside span{font-size:7px;color:#64748b}
.plant-timeline aside b{float:right;color:#16a34a;font-size:9px}
.schedule-table-wrap{overflow:auto;border-top:1px solid var(--edge)}
.equipment-table-wrap{border-top:0}
.schedule-table{width:100%;border-collapse:collapse;font-size:7px}
.schedule-table th{padding:7px 9px;text-align:left;color:#475569;background:#f8fafc;font-weight:500;white-space:nowrap}
.schedule-table td{padding:8px 9px;border-top:1px solid #f0f0f0;color:#64748b;vertical-align:top}
.schedule-table td strong,.schedule-table td b{display:block;color:#334155;font-size:8px}
.schedule-table td span{display:block;margin-top:2px;line-height:1.45;color:#94a3b8}
.schedule-table .time-cell strong{font-size:12px;color:#16a34a}
.schedule-table .time-cell span{color:#94a3b8}
.schedule-table td:last-child{min-width:170px}
.schedule-table td:last-child i{display:inline-block;margin-top:3px;padding:2px 4px;font-style:normal;color:#0284c7;border:1px solid rgba(14,165,233,.25);border-radius:4px}
.schedule-table .legacy-row td{opacity:.72}
.schedule-table .legacy-row .time-cell strong{color:#94a3b8}
.legacy-note{color:#94a3b8!important}
.optimization-toast{position:absolute;z-index:40;left:50%;bottom:34px;transform:translateX(-50%);padding:9px 16px;border:1px solid var(--edge);background:#ffffff;color:#1e293b;font-size:9px;border-radius:8px;box-shadow:0 12px 28px rgba(0,0,0,.12)}
@media(max-width:1180px){.kpi-grid{grid-template-columns:repeat(3,1fr)}.schedule-grid{grid-template-columns:1fr}.plant-timeline{grid-template-columns:repeat(4,1fr)}.plant-timeline aside{display:none}.timeline-line{right:5%}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
