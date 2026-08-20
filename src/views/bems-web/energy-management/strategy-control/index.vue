<template>
  <div class="optimization-page">
    <header class="optimization-header">
      <div>
        <span class="eyebrow">EXPERT OPTIMIZATION LOOP</span>
        <h1>策略控制执行</h1>
        <p>专家建议 · 控制能力 · 人工确认 · 下发回退</p>
      </div>
      <div class="header-state">
        <div class="view-tabs">
          <button @click="goAnalysis">01 分析求解</button>
          <button class="active">02 策略执行</button>
        </div>
        <span><i></i>数据链路在线</span>
        <b>模型 {{ text('optimization.forecast.modelVersion') }}</b>
        <em>距下拍 {{ countdownText }}</em>
        <em>更新 {{ text('optimization.forecast.updatedAt') }}</em>
      </div>
    </header>

    <div class="logic-flow">
      <div v-for="(step, index) in flowSteps" :key="step.title" :class="{ active: index < flowStage }">
        <b>{{ String(index + 1).padStart(2, '0') }}</b>
        <span><strong>{{ step.title }}</strong><small>{{ step.note }}</small></span>
        <i v-if="index < flowSteps.length - 1">→</i>
      </div>
    </div>

    <main class="optimization-scroll">
      <section class="decision-grid control-view-grid">
        <article class="expert-card decision-card">
          <header>
            <div><span class="section-no">03</span><div><h2>专家结论与优化策略</h2><p>推荐值与厂商控制能力解耦；未开放接口绝不直写</p></div></div>
            <div class="decision-head-actions"><span class="risk low">低风险 · {{ format('optimization.control.riskScore', 0) }} 分</span><button @click="capabilityDialog = true">配置控制能力</button></div>
          </header>
          <div class="expert-conclusion"><i>!</i><div><strong>本拍专家结论</strong><p>{{ text('optimization.recommendation.conclusion') }}</p></div><span>预计节能 <b>{{ format('optimization.recommendation.expectedSavingRate', 1) }}%</b></span></div>
          <div class="decision-table-wrap">
            <table class="decision-table">
              <thead><tr><th>采用</th><th>对象 / 决策项</th><th>执行方式</th><th>当前</th><th>优化推荐</th><th>安全边界</th><th>推荐依据</th><th>点位编码</th></tr></thead>
              <tbody>
                <tr v-for="item in decisions" :key="item.pointKey" :class="{ muted: !selectedCommands[item.pointKey] }">
                  <td><button class="check" :class="{ selected: selectedCommands[item.pointKey] }" :aria-label="`${item.name}是否采用`" @click="selectedCommands[item.pointKey] = !selectedCommands[item.pointKey]">✓</button></td>
                  <td><strong>{{ item.system }}</strong><span>{{ item.name }}</span></td>
                  <td><span class="capability-badge" :class="item.capability">{{ capabilityMeta[item.capability].label }}</span></td>
                  <td>{{ item.current }}</td>
                  <td class="recommended">{{ item.recommended }}</td>
                  <td>{{ item.boundary }}</td>
                  <td>{{ item.basis }}</td>
                  <td><code>{{ item.pointKey }}</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="expert-card control-card">
          <header>
            <div><span class="section-no">04</span><div><h2>监控下发与执行</h2><p>先影子验证，再闭环；异常自动回退</p></div></div>
            <span class="dispatch-state">{{ text('optimization.control.dispatchState') }}</span>
          </header>
          <div class="mode-selector">
            <button v-for="item in modes" :key="item.key" :class="{ active: mode === item.key }" @click="setMode(item.key)"><b>{{ item.label }}</b><small>{{ item.note }}</small></button>
          </div>
          <div class="guard-grid">
            <span><i class="ok"></i>安全边界校验 <b>通过</b></span>
            <span><i class="ok"></i>变化率限制 <b>通过</b></span>
            <span><i class="ok"></i>通信质量 <b>正常</b></span>
            <span><i :class="fallbackReady ? 'ok' : 'warn'"></i>厂商基线 <b>{{ fallbackReady ? '可回退' : '不可用' }}</b></span>
          </div>
          <div class="capability-counts">
            <span class="direct">直控 <b>{{ capabilityCounts.direct }}</b></span>
            <span class="manual">人工确认 <b>{{ capabilityCounts.manual }}</b></span>
            <span class="advisory">仅建议 <b>{{ capabilityCounts.advisory }}</b></span>
            <span class="unavailable">不可控 <b>{{ capabilityCounts.unavailable }}</b></span>
          </div>
          <div class="dispatch-summary">
            <span>本拍已选 <b>{{ selectedCount }}</b> 条 / 可直控 <b>{{ directSelectedCount }}</b> 条</span>
            <span>数据完备度 <b>{{ format('optimization.control.dataReadiness', 0) }}%</b></span>
          </div>
          <div class="control-actions">
            <button class="dispatch-button" :disabled="mode !== 'closed' || actioning || directSelectedCount === 0" @click="openConfirm('dispatch')">{{ mode === 'shadow' ? '影子模式 · 不下发' : mode === 'frozen' ? '系统已冻结' : `下发 ${directSelectedCount} 条直控策略` }}</button>
            <button class="rollback-button" :disabled="!fallbackReady || actioning" @click="openConfirm('rollback')">回退厂商基线</button>
          </div>
          <button class="manual-order-button" :disabled="manualSelectedCount === 0 || actioning" @click="createManualActions">生成人工执行清单（{{ manualSelectedCount }} 条）</button>
          <div class="execution-monitor">
            <div><span>执行进度</span><b>{{ format('optimization.control.executionProgress', 0) }}%</b></div>
            <i><b :style="{ width: `${numberValue('optimization.control.executionProgress')}%` }"></b></i>
            <p>控制网关回执 → DDC 跟踪 → 实测校验 → 下一拍重算</p>
          </div>
          <div class="history-list">
            <h3>最近执行记录</h3>
            <div v-for="record in history.slice(0, 4)" :key="record.id">
              <time>{{ record.time }}</time>
              <span>{{ record.title }}</span>
              <b :class="record.tone">{{ record.state }}</b>
            </div>
          </div>
        </aside>
      </section>
    </main>

    <div v-if="confirmAction" class="confirm-mask" @click.self="confirmAction = ''">
      <section class="confirm-dialog">
        <header><span>{{ confirmAction === 'dispatch' ? 'CONTROL DISPATCH' : 'SAFE ROLLBACK' }}</span><h2>{{ confirmAction === 'dispatch' ? '确认下发直控策略' : '确认回退厂商基线' }}</h2></header>
        <p v-if="confirmAction === 'dispatch'">只提交 {{ directSelectedCount }} 条“接口直控”策略。人工确认和仅建议项不会进入控制网关；服务端还会按当前能力矩阵二次拦截并执行安全边界钳位。</p>
        <p v-else>优化层将立即冻结，停止新策略下发，并向控制网关广播“厂商基线接管”命令。</p>
        <div><button @click="confirmAction = ''">取消</button><button :class="confirmAction === 'rollback' ? 'danger' : 'primary'" @click="executeConfirmed">{{ actioning ? '处理中…' : '确认执行' }}</button></div>
      </section>
    </div>

    <div v-if="capabilityDialog" class="confirm-mask" @click.self="capabilityDialog = false">
      <section class="capability-dialog">
        <header>
          <div><span>VENDOR CONTROL MATRIX</span><h2>厂商接口控制能力</h2><p>今天确认接口后直接在这里修改；服务端以此作为硬闸门。</p></div>
          <button @click="capabilityDialog = false">×</button>
        </header>
        <div class="capability-list">
          <label v-for="item in decisions" :key="item.capabilityKey">
            <span><b>{{ item.system }} · {{ item.name }}</b><code>{{ item.capabilityKey }}</code></span>
            <select :value="item.capability" @change="setCapability(item.capabilityKey, $event.target.value)">
              <option v-for="option in capabilityOptions" :key="option.key" :value="option.key">{{ option.label }} — {{ option.note }}</option>
            </select>
          </label>
        </div>
        <footer><span>建议初始值保持保守：只有已确认写点才设为“接口直控”。</span><button @click="capabilityDialog = false">完成</button></footer>
      </section>
    </div>

    <div v-if="toast" class="optimization-toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ENERGY_OPTIMIZATION_DEFAULTS, ENERGY_OPTIMIZATION_POINTS } from './data/energyOptimizationPoints.js'
import { optimizeExhibitionPlant } from './utils/energyOptimizationEngine.js'

const router = useRouter()
const values = reactive({ ...ENERGY_OPTIMIZATION_DEFAULTS })
const quality = reactive({})
const confirmAction = ref('')
const capabilityDialog = ref(false)
const actioning = ref(false)
const toast = ref('')
const selectedCommands = reactive({})
let countdownTimer
let toastTimer
let dashboardRefreshTimer

const pointMap = Object.fromEntries(ENERGY_OPTIMIZATION_POINTS.map(item => [item.key, item]))
const flowStage = 4
const flowSteps = [
  { title: '采集', note: '站房 · 气象 · 会展' }, { title: '预测', note: 'P50 / P90 冷负荷' }, { title: '决策', note: '约束寻优与结论' }, { title: '下发', note: '网关写点与确认' }, { title: '验证', note: '执行监控与回退' }
]
const capabilityMeta = {
  direct: { label: '直控', note: '接口已开通' },
  manual: { label: '人工确认', note: '需要值班确认' },
  advisory: { label: '仅建议', note: '只读推荐' },
  unavailable: { label: '不可控', note: '未开放接口' }
}
const capabilityOptions = Object.entries(capabilityMeta).map(([key, value]) => ({ key, ...value }))
const decisionDefinitions = [
  { system: '能源站', name: '启动时间', capabilityKey: 'optimization.capability.plantStartTime', pointKey: 'optimization.recommendation.plantStartTime', current: '08:00', boundary: '最早 09:00 开馆', basis: '2号馆历史降温 2.7℃/h' },
  { system: '能源站', name: '停止时间', capabilityKey: 'optimization.capability.plantStopTime', pointKey: 'optimization.recommendation.plantStopTime', current: '20:30', boundary: '最晚 19:00 闭馆', basis: '3号馆余冷滑行 50 min' },
  { system: '冷冻站', name: '冷冻供水温度', capabilityKey: 'optimization.capability.chwSupplyTemp', pointKey: 'optimization.recommendation.chwSupplyTemp', current: '7.0 ℃', boundary: '5 ~ 9 ℃', basis: '峰段降供温 0.4℃' },
  { system: '冷冻站', name: '冷冻回水温度目标', capabilityKey: 'optimization.capability.chwReturnTempTarget', pointKey: 'optimization.recommendation.chwReturnTempTarget', current: '15.0 ℃', boundary: '10 ~ 16 ℃', basis: '大温差策略' },
  { system: '水泵', name: '冷冻泵频率', capabilityKey: 'optimization.capability.chwPumpFrequency', pointKey: 'optimization.recommendation.chwPumpFrequency', current: '42 Hz', boundary: '30 ~ 50 Hz', basis: '满足最小压差' },
  { system: '水泵', name: '冷却泵频率', capabilityKey: 'optimization.capability.cwPumpFrequency', pointKey: 'optimization.recommendation.cwPumpFrequency', current: '43 Hz', boundary: '30 ~ 50 Hz', basis: '逼近冷却塔逼近度' },
  { system: '冷却塔', name: '冷却塔频率', capabilityKey: 'optimization.capability.towerFrequency', pointKey: 'optimization.recommendation.towerFrequency', current: '38 Hz', boundary: '30 ~ 50 Hz', basis: '湿球温度修正' },
  { system: '冷水机组', name: '运行台数', capabilityKey: 'optimization.capability.chillerCount', pointKey: 'optimization.recommendation.chillerCount', current: '2 台', boundary: '1 ~ 3 台', basis: '负荷爬坡速率' },
  { system: '能源站', name: '预冷时长', capabilityKey: 'optimization.capability.preCoolingMinutes', pointKey: 'optimization.recommendation.preCoolingMinutes', current: '90 min', boundary: '20 ~ 180 min', basis: '降温梯度自学习' }
]
decisionDefinitions.forEach(item => { selectedCommands[item.pointKey] = true })
const decisions = computed(() => decisionDefinitions.map(item => ({
  ...item,
  recommended: formatPoint(item.pointKey),
  capability: capabilityMeta[text(item.capabilityKey)] ? text(item.capabilityKey) : 'unavailable'
})))
const selectedCount = computed(() => Object.values(selectedCommands).filter(Boolean).length)
const directSelectedCount = computed(() => decisions.value.filter(item => selectedCommands[item.pointKey] && item.capability === 'direct').length)
const manualSelectedCount = computed(() => decisions.value.filter(item => selectedCommands[item.pointKey] && (item.capability === 'manual' || item.capability === 'advisory')).length)
const capabilityCounts = computed(() => decisions.value.reduce((counts, item) => { counts[item.capability] += 1; return counts }, { direct: 0, manual: 0, advisory: 0, unavailable: 0 }))
const mode = computed(() => text('optimization.control.mode'))
const fallbackReady = computed(() => Boolean(values['optimization.control.fallbackReady']))
const modes = [
  { key: 'shadow', label: '影子模式', note: '只计算不下发' },
  { key: 'closed', label: '闭环模式', note: '人工确认后下发' },
  { key: 'frozen', label: '暂停冻结', note: '厂商基线接管' }
]
const history = ref([
  { id: 'H-2404-08', time: '08:00', title: '直控下发 6 条 · 冷冻供温 7.8℃', state: '成功', tone: 'ok' },
  { id: 'H-2404-07', time: '07:00', title: '直控下发 5 条 · 预冷启动', state: '成功', tone: 'ok' },
  { id: 'H-2404-06', time: '06:00', title: '人工清单 2 条待确认', state: '待确认', tone: 'warn' },
  { id: 'H-2404-05', time: '05:00', title: '回退厂商基线 · 通信闪断', state: '回退', tone: 'danger' }
])
const countdownText = computed(() => { const seconds = Math.max(0, numberValue('optimization.control.nextCycleSeconds')); return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` })

function goAnalysis() { router.push('/fwbz/energy-management/analysis-startstop') }
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
async function refreshDashboard() { await loadSnapshot() }

async function setMode(nextMode) {
  if (nextMode === mode.value) return
  values['optimization.control.mode'] = nextMode
  if (nextMode === 'shadow') { values['optimization.control.dispatchState'] = '影子验证' } else if (nextMode === 'frozen') { values['optimization.control.dispatchState'] = '厂商接管' } else { values['optimization.control.dispatchState'] = '待下发' }
  try { const response = await fetch('/api/energy-optimization/mode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: nextMode }) }); if (response.ok) applyPoints(await response.json()) } catch {}
  showToast(nextMode === 'shadow' ? '已切换影子模式 · 本轮仅计算不下发' : nextMode === 'frozen' ? '已切换暂停冻结 · 厂商基线接管' : '已切换闭环模式 · 确认后下发')
}
function openConfirm(action) { confirmAction.value = action }
async function setCapability(key, capability) {
  values[key] = capability
  const meta = pointMap[key]
  const label = capabilityMeta[capability]?.label || capability
  history.value.unshift({ id: `H-${Date.now()}`, time: new Date().toTimeString().slice(0, 5), title: `能力矩阵更新 · ${meta ? meta.name : key}`, state: label, tone: 'neutral' })
  try { const response = await fetch('/api/energy-optimization/capability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pointKey: key, capability }) }); if (response.ok) applyPoints(await response.json()) } catch {}
  showToast(`已更新 ${meta ? meta.name : key} 控制能力为「${label}」`)
}
async function createManualActions() {
  if (actioning.value) return
  actioning.value = true
  try {
    const commands = decisions.value.filter(item => selectedCommands[item.pointKey] && (item.capability === 'manual' || item.capability === 'advisory')).map(item => ({ pointKey: item.pointKey, name: item.name, target: numberValue(item.pointKey), capability: item.capability }))
    const response = await fetch('/api/energy-optimization/manual-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands }) })
    if (response.ok) applyPoints(await response.json())
    history.value.unshift({ id: `H-${Date.now()}`, time: new Date().toTimeString().slice(0, 5), title: `人工清单 ${commands.length} 条待确认`, state: '待确认', tone: 'warn' })
    showToast(`已生成 ${commands.length} 条人工执行清单`)
  } finally {
    actioning.value = false
  }
}
async function executeConfirmed() {
  if (actioning.value) return
  actioning.value = true
  try {
    const action = confirmAction.value
    confirmAction.value = ''
    if (action === 'dispatch') {
      const commands = decisions.value.filter(item => selectedCommands[item.pointKey] && item.capability === 'direct').map(item => ({ pointKey: item.pointKey, name: item.name, target: numberValue(item.pointKey) }))
      const response = await fetch('/api/energy-optimization/dispatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands }) })
      if (response.ok) applyPoints(await response.json())
      values['optimization.control.executionProgress'] = 100
      history.value.unshift({ id: `H-${Date.now()}`, time: new Date().toTimeString().slice(0, 5), title: `直控下发 ${commands.length} 条`, state: '成功', tone: 'ok' })
      showToast(`已下发 ${commands.length} 条直控策略`)
    } else {
      const response = await fetch('/api/energy-optimization/rollback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: '人工确认' }) })
      if (response.ok) applyPoints(await response.json())
      values['optimization.control.executionProgress'] = 0
      history.value.unshift({ id: `H-${Date.now()}`, time: new Date().toTimeString().slice(0, 5), title: '回退厂商基线 · 优化层冻结', state: '回退', tone: 'danger' })
      showToast('已回退厂商基线 · 优化层冻结')
    }
  } finally {
    actioning.value = false
  }
}
async function onOptimizationCommand(event) {
  const command = event.detail
  if (!command || typeof command !== 'object') return
  const action = command.action || (typeof command.type === 'string' ? command.type.replace('energy-optimization-', '') : '')
  if (action === 'dispatch') { confirmAction.value = 'dispatch'; await executeConfirmed() }
  else if (action === 'rollback') { confirmAction.value = 'rollback'; await executeConfirmed() }
  else if (action === 'manual' || action === 'manual-actions') { await createManualActions() }
}

const optimizationApi = {
  updatePoint: (key, value, options = {}) => applyPoints([{ key, value, ...options }]),
  updatePoints: applyPoints,
  getSnapshot: () => ({ ...values }),
  getPointCatalog: () => ENERGY_OPTIMIZATION_POINTS.map(item => ({ ...item })),
  getActiveView: () => 'control',
  setCapability,
  dispatch: commands => fetch('/api/energy-optimization/dispatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands }) }),
  createManualActions: commands => fetch('/api/energy-optimization/manual-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands }) }),
  rollback: reason => fetch('/api/energy-optimization/rollback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) })
}

onMounted(async () => {
  window.addEventListener('energy-optimization-values', onOptimizationValues)
  window.addEventListener('energy-optimization-command', onOptimizationCommand)
  window.EnergyOptimization = optimizationApi
  recalculateRecommendations()
  await loadSnapshot()
  countdownTimer = setInterval(() => { const key = 'optimization.control.nextCycleSeconds'; values[key] = numberValue(key) > 0 ? numberValue(key) - 1 : numberValue('optimization.control.cycleMinutes') * 60 }, 1000)
  dashboardRefreshTimer = setInterval(refreshDashboard, 30 * 60 * 1000)
})
onUnmounted(() => {
  clearInterval(countdownTimer); clearInterval(dashboardRefreshTimer); clearTimeout(toastTimer)
  window.removeEventListener('energy-optimization-values', onOptimizationValues); window.removeEventListener('energy-optimization-command', onOptimizationCommand)
  if (window.EnergyOptimization === optimizationApi) delete window.EnergyOptimization
})
</script>

<style scoped>
.optimization-page{--ink:#2d3748;--muted:#64748b;--edge:#e2e8f0;--panel-bg:#ffffff;--cyan:#0ea5e9;--green:#22c55e;--blue:#3b82f6;--amber:#f59e0b;--red:#ef4444;height:100%;min-height:0;display:flex;flex-direction:column;color:var(--ink);background:#f5f7fa;font-family:"PingFang SC","Microsoft YaHei",sans-serif;position:relative;zoom:1.2}.optimization-header{height:72px;flex:none;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--edge);background:#ffffff}.optimization-header .eyebrow{color:#94a3b8;font-size:9px;font-weight:700;letter-spacing:2px}.optimization-header h1{font-size:19px;margin:2px 0 1px;color:#1e293b}.optimization-header p{font-size:9px;color:#94a3b8}.header-state{display:flex;align-items:center;gap:13px;font-size:8px;color:#94a3b8}.header-state span{padding:6px 9px;border:1px solid rgba(34,197,94,.3);color:#16a34a;border-radius:6px}.header-state span i{display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:var(--green);box-shadow:0 0 7px rgba(34,197,94,.4)}.header-state b{font-weight:500;color:#64748b}.header-state em{font-style:normal}.logic-flow{height:58px;flex:none;padding:8px 20px;display:grid;grid-template-columns:repeat(5,1fr);border-bottom:1px solid var(--edge);background:#ffffff}.logic-flow>div{display:flex;align-items:center;position:relative;opacity:.5}.logic-flow b{width:25px;height:25px;display:grid;place-items:center;border:1px solid #cbd5e1;border-radius:50%;font-size:9px;color:#94a3b8}.logic-flow span{display:flex;flex-direction:column;margin-left:8px}.logic-flow strong{font-size:10px;color:#334155}.logic-flow small{font-size:7px;color:#94a3b8;margin-top:2px}.logic-flow i{position:absolute;right:10px;color:#cbd5e1;font-style:normal}.logic-flow>div.active{opacity:1}.logic-flow>div.active b{color:#ffffff;background:var(--green);border-color:var(--green);box-shadow:0 0 12px rgba(34,197,94,.25)}.optimization-scroll{flex:1;min-height:0;overflow:auto;padding:12px 14px 20px;background-color:#f5f7fa;background-image:linear-gradient(rgba(148,163,184,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.07) 1px,transparent 1px);background-size:24px 24px}.expert-card{border:1px solid var(--edge);background:var(--panel-bg);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden}.expert-card>header{height:48px;padding:0 13px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0f0}.expert-card>header>div:first-child{display:flex;align-items:center}.section-no{width:23px;height:23px;margin-right:9px;display:grid;place-items:center;border:1px solid #bae6fd;color:#0284c7;font-size:7px;border-radius:6px;background:#f0f9ff}.expert-card h2{font-size:11px;color:#2d3748}.expert-card header p{margin-top:2px;font-size:7px;color:#94a3b8}.decision-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(340px,.75fr);gap:10px;margin-top:10px}.decision-card{min-width:0}.decision-head-actions{display:flex;align-items:center;gap:6px}.decision-head-actions button{padding:4px 7px;border:1px solid #bae6fd;background:#f0f9ff;color:#0284c7;font-size:7px;border-radius:6px}.risk{font-size:7px;padding:4px 7px;border:1px solid;border-radius:4px}.risk.low{color:#16a34a;border-color:rgba(34,197,94,.32);background:rgba(34,197,94,.06)}.expert-conclusion{margin:10px 12px;padding:9px 10px;display:grid;grid-template-columns:23px 1fr 92px;gap:9px;align-items:center;border:1px solid rgba(14,165,233,.28);background:rgba(14,165,233,.06);border-radius:8px}.expert-conclusion>i{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;background:#0ea5e9;color:white;font-style:normal}.expert-conclusion strong{font-size:9px;color:#334155}.expert-conclusion p{margin-top:3px;color:#64748b;font-size:8px;line-height:1.5}.expert-conclusion>span{font-size:7px;text-align:right;color:#64748b}.expert-conclusion>span b{display:block;font-size:14px;color:#16a34a}.decision-table-wrap{overflow:auto;max-height:266px}.decision-table{width:100%;border-collapse:collapse;font-size:7px}.decision-table th{padding:6px 7px;text-align:left;color:#475569;background:#f8fafc;white-space:nowrap;font-weight:500}.decision-table td{padding:6px 7px;border-top:1px solid #f0f0f0;color:#64748b;white-space:nowrap}.decision-table td:nth-child(2){white-space:normal;min-width:88px}.decision-table td:nth-child(6){white-space:normal;min-width:142px}.decision-table td:nth-child(7){white-space:normal;min-width:150px}.decision-table td strong{display:block;color:#334155;font-size:8px}.decision-table td span{font-size:7px}.decision-table td.recommended{color:#16a34a;font-weight:700}.decision-table code{font-size:6px;color:#0284c7}.decision-table tr.muted{opacity:.38}.check{width:17px;height:17px;border:1px solid #cbd5e1;background:#ffffff;color:transparent;border-radius:4px;font-size:9px}.check.selected{color:#ffffff;background:#22c55e;border-color:#22c55e}.control-card{min-width:0}.dispatch-state{padding:3px 6px;font-size:7px;color:#16a34a;border:1px solid rgba(34,197,94,.3);border-radius:4px}.mode-selector{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:10px}.mode-selector button{padding:7px 4px;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;border-radius:8px}.mode-selector button b{display:block;font-size:8px}.mode-selector button small{display:block;margin-top:2px;font-size:6px}.mode-selector button.active{border-color:#0ea5e9;color:#0284c7;background:rgba(14,165,233,.08);box-shadow:inset 0 -2px #0ea5e9}.guard-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 10px}.guard-grid span{padding:5px 6px;background:#f8fafc;border:1px solid #e2e8f0;font-size:7px;color:#64748b;border-radius:6px}.guard-grid i{display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%}.guard-grid i.ok{background:#22c55e}.guard-grid i.warn{background:#f59e0b}.guard-grid b{float:right;color:#334155}.capability-counts{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:8px 10px 0}.capability-counts span{padding:5px 4px;text-align:center;border:1px solid #e2e8f0;font-size:6px;color:#64748b;border-radius:6px;background:#f8fafc}.capability-counts b{display:block;margin-top:2px;font-size:10px}.capability-counts .direct b{color:#16a34a}.capability-counts .manual b{color:#0284c7}.capability-counts .advisory b{color:#d97706}.capability-counts .unavailable b{color:#94a3b8}.dispatch-summary{display:flex;justify-content:space-between;padding:9px 11px 6px;font-size:7px;color:#64748b}.dispatch-summary b{color:#1e293b;font-size:9px}.control-actions{display:grid;grid-template-columns:1fr 105px;gap:6px;padding:0 10px}.control-actions button{height:32px;font-size:8px;border-radius:6px}.dispatch-button{border:1px solid #0ea5e9;background:#0284c7;color:white}.dispatch-button:disabled{border-color:#e2e8f0;background:#f1f5f9;color:#94a3b8}.rollback-button{border:1px solid rgba(239,68,68,.4);background:rgba(239,68,68,.06);color:#dc2626}.rollback-button:disabled{opacity:.4}.manual-order-button{height:28px;margin:6px 10px 0;width:calc(100% - 20px);border:1px solid rgba(245,158,11,.4);background:rgba(245,158,11,.07);color:#d97706;font-size:7px;border-radius:6px}.manual-order-button:disabled{opacity:.38}.execution-monitor{margin:10px;padding:8px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px}.execution-monitor>div{display:flex;justify-content:space-between;font-size:7px;color:#64748b}.execution-monitor>div b{color:#16a34a}.execution-monitor>i{display:block;height:4px;margin-top:6px;background:#e2e8f0;border-radius:2px;overflow:hidden}.execution-monitor>i b{display:block;height:100%;background:linear-gradient(90deg,#0ea5e9,#22c55e);transition:width .4s}.execution-monitor p{margin-top:5px;color:#94a3b8;font-size:6px}.history-list{margin:0 10px 10px}.history-list h3{padding-bottom:5px;border-bottom:1px solid #e2e8f0;font-size:8px;color:#475569}.history-list>div{display:grid;grid-template-columns:36px 1fr 55px;gap:4px;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:7px}.history-list time{color:#94a3b8}.history-list span{color:#64748b}.history-list b{text-align:right;font-weight:500}.history-list b.ok{color:#16a34a}.history-list b.warn{color:#d97706}.history-list b.danger{color:#dc2626}.history-list b.neutral{color:#94a3b8}.capability-badge{display:inline-block;padding:3px 5px;border:1px solid;border-radius:4px;font-size:6px!important}.capability-badge.direct{color:#16a34a;border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.07)}.capability-badge.manual{color:#0284c7;border-color:rgba(14,165,233,.35);background:rgba(14,165,233,.07)}.capability-badge.advisory{color:#d97706;border-color:rgba(245,158,11,.35);background:rgba(245,158,11,.07)}.capability-badge.unavailable{color:#94a3b8;border-color:rgba(148,163,184,.3)}.confirm-mask{position:absolute;inset:0;z-index:30;display:grid;place-items:center;background:rgba(15,23,42,.45);backdrop-filter:blur(5px)}.confirm-dialog{width:430px;padding:20px;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 25px 70px rgba(0,0,0,.18)}.confirm-dialog header span{font-size:7px;letter-spacing:2px;color:#0284c7}.confirm-dialog header h2{margin-top:4px;font-size:16px;color:#1e293b}.confirm-dialog>p{margin:13px 0;color:#64748b;font-size:9px;line-height:1.7}.confirm-dialog>div{display:flex;justify-content:flex-end;gap:7px}.confirm-dialog button{padding:7px 13px;border:1px solid #e2e8f0;background:#ffffff;color:#64748b;font-size:8px;border-radius:6px}.confirm-dialog button.primary{background:#0284c7;border-color:#0284c7;color:white}.confirm-dialog button.danger{background:#dc2626;border-color:#dc2626;color:white}.capability-dialog{width:650px;max-height:82%;display:flex;flex-direction:column;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 25px 70px rgba(0,0,0,.18)}.capability-dialog>header{padding:16px 18px;display:flex;justify-content:space-between;border-bottom:1px solid #f0f0f0}.capability-dialog header span{font-size:7px;letter-spacing:2px;color:#0284c7}.capability-dialog header h2{margin-top:4px;font-size:16px;color:#1e293b}.capability-dialog header p{margin-top:3px;font-size:8px;color:#94a3b8}.capability-dialog header>button{width:28px;height:28px;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;border-radius:6px}.capability-list{overflow:auto;padding:7px 18px}.capability-list label{display:grid;grid-template-columns:1fr 250px;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f0}.capability-list label span{display:flex;flex-direction:column}.capability-list label b{font-size:9px;color:#334155}.capability-list label code{margin-top:3px;font-size:6px;color:#94a3b8}.capability-list select{height:29px;padding:0 8px;border:1px solid #e2e8f0;background:#ffffff;color:#334155;font-size:8px;border-radius:6px}.capability-dialog footer{padding:11px 18px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f0f0f0}.capability-dialog footer span{font-size:7px;color:#94a3b8}.capability-dialog footer button{padding:6px 15px;border:1px solid #0ea5e9;background:#0284c7;color:white;font-size:8px;border-radius:6px}.view-tabs{display:flex;border:1px solid var(--edge);border-radius:8px;background:#f8fafc;overflow:hidden}.view-tabs button{height:25px;padding:0 9px;border:0;border-right:1px solid var(--edge);background:transparent;color:#64748b;font-size:7px}.view-tabs button:last-child{border-right:0}.view-tabs button.active{color:#0284c7;background:rgba(14,165,233,.1);box-shadow:inset 0 -2px #0ea5e9}.optimization-toast{position:absolute;z-index:40;left:50%;bottom:34px;transform:translateX(-50%);padding:9px 16px;border:1px solid var(--edge);background:#ffffff;color:#1e293b;font-size:9px;border-radius:8px;box-shadow:0 12px 28px rgba(0,0,0,.12)}.control-view-grid{margin-top:0;align-items:start}.control-view-grid .decision-table-wrap{max-height:430px}.control-view-grid .control-card{min-height:500px}@media(max-width:1180px){.decision-grid{grid-template-columns:1fr}.control-card{min-height:430px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
