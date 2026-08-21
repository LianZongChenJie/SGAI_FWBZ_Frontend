<template>
  <div class="energy-page" :class="{ standalone }">
    <!-- 顶部"能源站管理系统"一行暂不显示（注释保留，后续可按需恢复）
    <header v-if="!embedded" class="topbar">
      <div class="brand-lockup">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div><strong>能源站管理系统</strong><small>ENERGY STATION MANAGEMENT</small></div>
      </div>
      <div class="station-title"><i></i><span>首钢园 · 2/3/4号场馆</span><em>{{ activeSystem === 'water' ? '集中水冷系统' : activeSystem === 'air' ? '集中风冷系统' : '分馆风冷系统' }}</em></div>
      <div class="header-actions">
        <div class="live-state" :class="{ connected }"><b></b>{{ connected ? '数据在线' : '演示数据' }}</div>
        <button class="icon-button" title="刷新" @click="refreshTime">↻</button>
        <div class="clock"><strong>{{ currentTime }}</strong><small>{{ currentDate }}</small></div>
      </div>
    </header>
    -->

    <section class="system-overview">
      <div v-for="group in overviewGroups" :key="group.key" class="overview-row">
        <div class="overview-name" :class="group.key"><i></i><span>{{ group.title }}</span></div>
        <div class="overview-cards">
          <article v-for="metric in group.metrics" :key="metric.key" class="metric-card" :class="metric.tone">
            <div class="metric-icon">{{ metric.icon }}</div>
            <div class="metric-copy"><span>{{ metric.label }}</span><strong>{{ number(point(metric.key), metric.digits) }}<small>{{ metric.unit }}</small></strong><em>{{ metricNote(metric) }}</em></div>
            <div class="mini-bars"><i v-for="n in 8" :key="n" :style="{ height: `${18 + ((n * 11 + metric.seed) % 28)}%` }"></i></div>
          </article>
        </div>
      </div>
    </section>

    <div class="subnav">
      <a-tabs :activeKey="activeSystem" @change="switchSystem">
        <a-tab-pane key="water" tab="集中水冷" />
        <a-tab-pane key="air" tab="集中风冷" />
        <a-tab-pane key="distributed" tab="分馆风冷" />
      </a-tabs>
    </div>

    <main class="dashboard-body">
      <section class="content-grid">
        <article class="panel topology-panel">
          <div class="panel-heading">
            <div><span class="eyebrow">REAL-TIME TOPOLOGY</span><h2>{{ activeSystem === 'water' ? '集中水冷系统实时监控' : activeSystem === 'air' ? '集中风冷系统实时监控' : '东会议室 / 2号馆 / 3号馆分馆风冷监控' }}</h2></div>
            <div class="legend"><span><i class="dot running"></i>运行</span><span><i class="dot stopped"></i>停止</span><span><i class="dot fault"></i>故障</span><span><i class="line supply"></i>冷冻供水</span><span><i class="line return"></i>冷冻回水</span><template v-if="activeSystem === 'water'"><span><i class="line cooling-return"></i>冷却供水</span><span><i class="line cooling-supply"></i>冷却回水</span></template></div>
          </div>

          <div class="topology">
            <EnergyPlantSchematic v-if="activeSystem === 'water'" :values="values" @select-chiller="selectedChiller = $event" @select-device="openDevice" />
            <AirCooledPlantSchematic v-else-if="activeSystem === 'air'" :values="values" @select-unit="selectedAirUnit = $event" @select-device="openDevice" />
            <DistributedAirCooledSchematic v-else :values="values" @select-device="openDevice" />
            <Transition name="device-panel">
              <section v-if="selectedDevice" class="device-inspector" @click.stop>
                <header>
                  <div><span>DEVICE DATA</span><h3>{{ selectedDevice.title }}</h3><small>{{ selectedDevice.type }} · {{ selectedDevice.id }}</small></div>
                  <button aria-label="关闭设备数据面板" @click="closeDevice">×</button>
                </header>
                <div class="device-summary" :class="deviceState.tone">
                  <i></i><div><span>当前状态</span><strong>{{ deviceState.label }}</strong></div>
                  <button @click="nudgeSelected">动效测试</button>
                </div>
                <div v-if="selectedDevice.tank" class="panel-tank-level"><i :style="{ height: `${boundedValue(selectedDevice.tankKey || 'makeup.tankLevel')}%` }"></i><span>{{ boundedValue(selectedDevice.tankKey || 'makeup.tankLevel') }}%</span></div>
                <div class="device-data-list">
                  <div v-for="row in selectedDevice.fields" :key="row.key" :class="deviceRowTone(row)"><span>{{ row.label }}</span><strong>{{ deviceRowValue(row) }}</strong></div>
                </div>
                <footer><i></i><span>点位可由后台实时推送</span><code>{{ selectedDevice.fields[0]?.key }}</code></footer>
              </section>
            </Transition>
          </div>
        </article>

        <aside class="side-stack">
          <article class="panel health-panel">
            <div class="compact-heading"><div><span class="eyebrow">SYSTEM HEALTH</span><h3>设备运行状态</h3></div><button>今日⌄</button></div>
            <div class="donut-row">
              <div class="donut"><div><strong>88</strong><span>健康度</span></div></div>
              <div class="health-list"><span><i class="ok"></i>运行设备 <b>9</b></span><span><i class="idle"></i>停止设备 <b>3</b></span><span><i class="warn"></i>活动告警 <b>{{ point('station.alarmCount') }}</b></span></div>
            </div>
          </article>

          <article class="panel detail-panel">
            <div class="compact-heading"><div><span class="eyebrow">EQUIPMENT DETAIL</span><h3>{{ selectedChiller }}# 冷水机组</h3></div><span class="run-pill" :class="statusClass(`chiller.${selectedChiller}.running`)">{{ runningText(`chiller.${selectedChiller}.running`) }}</span></div>
            <div class="detail-grid">
              <div><span>实时负载率</span><strong>{{ display(`chiller.${selectedChiller}.load`) }}</strong></div>
              <div><span>输入功率</span><strong>{{ display(`chiller.${selectedChiller}.power`) }}</strong></div>
              <div><span>冷冻出水</span><strong>{{ display(`chiller.${selectedChiller}.supplyTemp`) }}</strong></div>
              <div><span>冷冻回水</span><strong>{{ display(`chiller.${selectedChiller}.returnTemp`) }}</strong></div>
            </div>
            <div class="trend"><div class="trend-line"><i v-for="n in 18" :key="n" :style="{ height: `${28 + ((n * 17) % 58)}%` }"></i></div><div class="trend-label"><span>08:00</span><span>12:00</span><span>16:00</span><span>现在</span></div></div>
          </article>

          <article class="panel alarm-panel">
            <div class="compact-heading"><div><span class="eyebrow">ACTIVE EVENTS</span><h3>实时事件</h3></div><a>全部事件 →</a></div>
            <div class="alarm-list">
              <div><i class="level medium"></i><span><b>冷冻供回水温差偏低</b><small>系统诊断 · 10:24:16</small></span><em>中</em></div>
              <div><i class="level low"></i><span><b>3#冷却塔通信中断</b><small>设备告警 · 09:48:03</small></span><em>低</em></div>
              <div class="normal"><i class="level"></i><span><b>系统群控策略已执行</b><small>运行记录 · 09:30:00</small></span><em>正常</em></div>
            </div>
          </article>
        </aside>
      </section>
    </main>

    <footer class="statusbar"><span><i :class="{ online: connected }"></i>数据更新时间 {{ lastUpdate }}</span><span>点位接入 <b>{{ pointCount }}</b> / {{ catalog.length }}</span><span>API <code>POST /api/energy-station/points</code></span><button @click="showApi = true">查看接入说明</button></footer>

    <div v-if="showApi" class="modal-mask" @click.self="showApi = false">
      <div class="api-modal">
        <button class="modal-close" @click="showApi = false">×</button>
        <span class="eyebrow">DATA INTEGRATION</span><h2>实时数据接入</h2>
        <p>后台按点位编码推送即可；支持单点、数组和对象三种格式。页面也暴露了同名浏览器接口，便于二次集成。</p>
        <pre>POST /api/energy-station/points
Content-Type: application/json

{
  "points": {
    "station.totalPower": 486.2,
    "chiller.1.running": true,
    "chiller.1.load": { "value": 82, "quality": "good" }
  }
}</pre>
        <div class="api-notes"><span><b>WebSocket</b><small>订阅 /ws，消息类型 energy-points</small></span><span><b>浏览器调用</b><small>window.EnergyStation.updatePoints(...)</small></span><span><b>设备动效</b><small>POST /api/energy-station/device-motion</small></span><span><b>打开面板</b><small>window.EnergyStation.openDevicePanel(id)</small></span></div>
        <button class="primary-button" @click="copyExample">{{ copied ? '已复制示例' : '复制请求示例' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { bindingStore } from './stores/bindingStore.js'
import { ENERGY_STATION_DEFAULTS, ENERGY_STATION_POINTS } from './data/energyStationPoints.js'
import { ENERGY_DEVICE_IDS, getEnergyDeviceProfile } from './data/energyStationDevices.js'
import EnergyPlantSchematic from './components/EnergyPlantSchematic.vue'
import AirCooledPlantSchematic from './components/AirCooledPlantSchematic.vue'
import DistributedAirCooledSchematic from './components/DistributedAirCooledSchematic.vue'

const props = defineProps({ standalone: Boolean, embedded: Boolean, initialSystem: { type: String, default: 'water' } })

const values = reactive({ ...ENERGY_STATION_DEFAULTS })
const quality = reactive({})
const currentTime = ref('')
const currentDate = ref('')
const lastUpdate = ref('--:--:--')
const activeSystem = ref(['air', 'distributed'].includes(props.initialSystem) ? props.initialSystem : 'water')
const selectedChiller = ref(1)
const selectedAirUnit = ref(1)
const selectedDeviceId = ref('')
const showApi = ref(false)
const copied = ref(false)
const catalog = ENERGY_STATION_POINTS
let clockTimer

const connected = computed(() => bindingStore.state.socketConnected)
const pointCount = computed(() => Object.keys(quality).length)
const currentAlarmCount = computed(() => point(activeSystem.value === 'water' ? 'station.alarmCount' : activeSystem.value === 'air' ? 'air.station.alarmCount' : 'distributed.station.alarmCount'))
const pointMap = Object.fromEntries(catalog.map(item => [item.key, item]))
const waterMetrics = [
  { key: 'station.totalPower', label: '系统总功率', unit: 'kW', digits: 1, icon: 'ϟ', noteKey: 'station.powerSavingRate', notePrefix: '较昨日同期 ↓ ', noteUnit: '%', tone: 'blue', seed: 4 },
  { key: 'station.coolingCapacity', label: '当前制冷量', unit: 'kW', digits: 0, icon: '❄', noteKey: 'station.loadRate', notePrefix: '负荷率 ', noteUnit: '%', tone: 'cyan', seed: 9 },
  { key: 'station.cop', label: '系统能效 COP', unit: '', digits: 2, icon: '◎', noteKey: 'station.copImprovement', notePrefix: '优于基准值 ', noteUnit: '%', tone: 'green', seed: 13 },
  { key: 'station.dailyEnergy', label: '今日累计用电', unit: 'kWh', digits: 0, icon: '↗', noteKey: 'station.forecastEnergy', notePrefix: '预测 ', noteUnit: ' kWh', tone: 'amber', seed: 19 }
]
const airMetrics = [
  { key: 'air.station.totalPower', label: '风冷系统总功率', unit: 'kW', digits: 1, icon: 'ϟ', noteKey: 'air.station.powerSavingRate', notePrefix: '较昨日同期 ↓ ', noteUnit: '%', tone: 'blue', seed: 6 },
  { key: 'air.station.coolingCapacity', label: '当前制冷量', unit: 'kW', digits: 0, icon: '❄', noteKey: 'air.station.loadRate', notePrefix: '负荷率 ', noteUnit: '%', tone: 'cyan', seed: 11 },
  { key: 'air.station.cop', label: '风冷系统 COP', unit: '', digits: 2, icon: '◎', noteKey: 'air.station.copImprovement', notePrefix: '优于基准值 ', noteUnit: '%', tone: 'green', seed: 15 },
  { key: 'air.station.dailyEnergy', label: '今日累计用电', unit: 'kWh', digits: 0, icon: '↗', noteKey: 'air.station.forecastEnergy', notePrefix: '预测 ', noteUnit: ' kWh', tone: 'amber', seed: 21 }
]
const distributedMetrics = [
  { key: 'distributed.station.totalPower', label: '分馆风冷总功率', unit: 'kW', digits: 1, icon: 'ϟ', noteKey: 'distributed.station.powerSavingRate', notePrefix: '较昨日同期 ↓ ', noteUnit: '%', tone: 'blue', seed: 7 },
  { key: 'distributed.station.coolingCapacity', label: '当前制冷量', unit: 'kW', digits: 0, icon: '❄', noteKey: 'distributed.station.loadRate', notePrefix: '负荷率 ', noteUnit: '%', tone: 'cyan', seed: 12 },
  { key: 'distributed.station.cop', label: '分馆综合 COP', unit: '', digits: 2, icon: '◎', noteKey: 'distributed.station.copImprovement', notePrefix: '优于基准值 ', noteUnit: '%', tone: 'green', seed: 17 },
  { key: 'distributed.station.dailyEnergy', label: '今日累计用电', unit: 'kWh', digits: 0, icon: '↗', noteKey: 'distributed.station.forecastEnergy', notePrefix: '预测 ', noteUnit: ' kWh', tone: 'amber', seed: 23 }
]
const metrics = computed(() => activeSystem.value === 'water' ? waterMetrics : activeSystem.value === 'air' ? airMetrics : distributedMetrics)
const overviewGroups = computed(() => [
  { key: 'water', title: '集中水冷', metrics: waterMetrics },
  { key: 'air', title: '集中风冷', metrics: airMetrics },
  { key: 'distributed', title: '分馆风冷', metrics: distributedMetrics },
])
const selectedDevice = computed(() => getEnergyDeviceProfile(selectedDeviceId.value))
const deviceState = computed(() => {
  const device = selectedDevice.value
  if (!device) return { label: '正常', tone: 'normal' }
  if (device.faultKey && Boolean(point(device.faultKey))) return { label: '故障', tone: 'fault' }
  if (device.runningKey) return Boolean(point(device.runningKey)) ? { label: '运行', tone: 'running' } : { label: '停止', tone: 'stopped' }
  return { label: device.tank ? '液位正常' : '工作正常', tone: 'normal' }
})

function point(key) { return values[key] ?? '--' }
function metricNote(metric) {
  const digits = metric.noteKey.endsWith('forecastEnergy') ? 0 : 1
  return `${metric.notePrefix}${number(point(metric.noteKey), digits)}${metric.noteUnit}`
}
function number(value, digits = 1) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '--'
}
function display(key) {
  const meta = pointMap[key]
  if (!meta) return point(key)
  const digits = meta.type === 'number' && Math.abs(Number(point(key))) < 10 ? 2 : meta.type === 'number' ? 1 : 0
  return meta.type === 'boolean' ? (point(key) ? '运行' : '停止') : `${number(point(key), digits)} ${meta.unit}`.trim()
}
function statusClass(key) { return values[key] ? 'running' : 'stopped' }
function runningText(key) { return values[key] ? '运行中' : '已停止' }
function boundedValue(key) { return Math.min(100, Math.max(0, Number(point(key)) || 0)) }
function deviceRowValue(row) {
  if (row.kind === 'running') return Boolean(point(row.key)) ? '运行' : '停止'
  if (row.kind === 'fault') return Boolean(point(row.key)) ? '故障' : '正常'
  if (row.kind === 'text' || row.kind === 'mode' || row.kind === 'command') return String(point(row.key) ?? '--')
  return display(row.key)
}
function deviceRowTone(row) {
  if (row.kind === 'running') return Boolean(point(row.key)) ? 'good' : 'idle'
  if (row.kind === 'fault') return Boolean(point(row.key)) ? 'bad' : 'good'
  if (row.kind === 'mode' || row.kind === 'command') return 'control'
  return ''
}
function switchSystem(system) {
  activeSystem.value = system
  selectedDeviceId.value = ''
}
watch(() => props.initialSystem, system => { if (['water', 'air', 'distributed'].includes(system)) switchSystem(system) })
function openDevice(id) {
  if (!ENERGY_DEVICE_IDS.includes(id)) return false
  selectedDeviceId.value = id
  if (id.startsWith('water.chiller.')) selectedChiller.value = Number(id.split('.').pop())
  if (id.startsWith('air.unit.')) selectedAirUnit.value = Number(id.split('.').pop())
  return true
}
function closeDevice() { selectedDeviceId.value = '' }
function triggerDeviceMotion(deviceId, duration = 900) {
  if (!ENERGY_DEVICE_IDS.includes(deviceId)) return false
  window.dispatchEvent(new CustomEvent('energy-device-motion', { detail: { deviceId, duration } }))
  return true
}
function nudgeSelected() { if (selectedDeviceId.value) triggerDeviceMotion(selectedDeviceId.value) }

function normalizePoints(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  const source = payload.points || payload
  if (Array.isArray(source)) return source
  return Object.entries(source).map(([key, value]) => typeof value === 'object' && value !== null ? { key, ...value } : { key, value })
}
function applyPoints(payload) {
  normalizePoints(payload).forEach(item => {
    const key = item.key || item.pointKey || item.id
    if (!key || !(key in pointMap)) return
    values[key] = item.value
    quality[key] = item.quality || 'good'
  })
  lastUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}
function onEnergyPoints(event) { applyPoints(event.detail) }
function onBindingValue(event) {
  const message = event.detail
  const key = message?.target?.pointKey
  if (key) applyPoints([{ key, value: message.value, quality: message.quality }])
}
function refreshTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
}
async function loadSnapshot() {
  try {
    const response = await fetch('/api/energy-station/points')
    if (response.ok) applyPoints(await response.json())
  } catch {}
}
async function copyExample() {
  const text = `curl -X POST ${location.origin}/api/energy-station/points -H "Content-Type: application/json" -d '{"points":{"station.totalPower":486.2,"chiller.1.running":true,"chiller.1.load":82}}'`
  await navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}

const energyStationApi = {
  updatePoint: (key, value, options = {}) => applyPoints([{ key, value, ...options }]),
  updatePoints: applyPoints,
  getSnapshot: () => ({ ...values }),
  getPointCatalog: () => catalog.map(item => ({ ...item })),
  getDeviceCatalog: () => ENERGY_DEVICE_IDS.map(id => ({ ...getEnergyDeviceProfile(id) })),
  getActiveSystem: () => activeSystem.value,
  setActiveSystem: system => { if (['water', 'air', 'distributed'].includes(system)) switchSystem(system) },
  openDevicePanel: openDevice,
  closeDevicePanel: closeDevice,
  triggerDeviceMotion
}

onMounted(() => {
  refreshTime()
  clockTimer = setInterval(refreshTime, 1000)
  window.addEventListener('energy-point-values', onEnergyPoints)
  window.addEventListener('binding-value', onBindingValue)
  window.EnergyStation = energyStationApi
  loadSnapshot().finally(() => applyPoints(bindingStore.getColdLatestValues()))
})
onUnmounted(() => {
  clearInterval(clockTimer)
  window.removeEventListener('energy-point-values', onEnergyPoints)
  window.removeEventListener('binding-value', onBindingValue)
  if (window.EnergyStation === energyStationApi) delete window.EnergyStation
})
</script>

<style scoped>
.energy-page { --ink:#2d3748; --muted:#718096; --edge:#e2e8f0; --panel-bg:#ffffff; --cyan:#0ea5e9; --blue:#3b82f6; --green:#22c55e; min-width:0; min-height:0; height:100%; color:var(--ink); background:#f5f7fa; display:flex; flex-direction:column; overflow-y:auto; font-family:"PingFang SC","Microsoft YaHei",sans-serif; position:relative; }
.standalone { width:100vw; height:100vh; }
.embedded { width:100%; height:100%; }
.embedded .dashboard-body { gap:12px; }
/* 顶部"能源站管理系统"一行暂不显示，样式一并注释（后续可按需恢复）
.topbar { height:68px; display:grid; grid-template-columns:270px 1fr 330px; align-items:center; padding:0 24px; border-bottom:1px solid var(--edge); background:#ffffff; z-index:2; }
.brand-lockup { display:flex; align-items:center; gap:11px; }
.brand-mark { width:34px; height:34px; display:flex; align-items:flex-end; gap:3px; transform:skew(-10deg); }
.brand-mark span { width:8px; background:linear-gradient(#22d3ee,#3b82f6); border-radius:2px 2px 0 0; }
.brand-mark span:nth-child(1){height:17px}.brand-mark span:nth-child(2){height:27px}.brand-mark span:nth-child(3){height:22px}
.brand-lockup strong { display:block; font-size:16px; letter-spacing:1.8px; color:#1e293b; }.brand-lockup small { display:block; margin-top:2px; font-size:8px; letter-spacing:2px; color:#94a3b8; }
.station-title { justify-self:center; display:flex; align-items:center; gap:10px; }.station-title i { width:5px; height:5px; border-radius:50%; background:var(--green); }.station-title span { font-size:16px; font-weight:700; letter-spacing:1px; color:#1e293b; }.station-title em { font-style:normal; color:#64748b; border-left:1px solid #e2e8f0; padding-left:10px; }
.header-actions { display:flex; justify-content:flex-end; align-items:center; gap:15px; }.live-state { color:#f59e0b; font-size:11px; padding:6px 10px; border:1px solid rgba(245,158,11,.28); border-radius:6px; }.live-state b { display:inline-block; width:6px; height:6px; margin-right:6px; border-radius:50%; background:#f59e0b; }.live-state.connected { color:var(--green); border-color:rgba(34,197,94,.25); }.live-state.connected b { background:var(--green); }.icon-button { width:30px; height:30px; border:1px solid var(--edge); background:#f8fafc; color:#64748b; border-radius:6px; font-size:18px; cursor:pointer; }.clock { border-left:1px solid var(--edge); padding-left:15px; text-align:right; }.clock strong { display:block; font-size:15px; letter-spacing:1px; color:#1e293b; }.clock small { display:block; color:var(--muted); font-size:9px; margin-top:2px; }
*/
/* a-tabs 白底风格覆盖 */
.subnav :deep(.ant-tabs) { width:100%; }
.subnav :deep(.ant-tabs-nav) { margin-bottom:0; }
.subnav :deep(.ant-tabs-tab) { padding:10px 4px !important; font-size:14px; }
.subnav :deep(.ant-tabs-ink-bar) { background:#3b82f6; }
/* 系统总览：集中水冷 / 集中风冷 / 分馆风冷 三行指标卡片（样式取自原型 metrics 卡片） */
.system-overview { --edge:#1e3d52; --cyan:#22d3ee; margin:20px 0 0; padding:14px 16px; display:flex; flex-direction:column; gap:10px; background:linear-gradient(180deg,#eef4f9,#f5f7fa); border-top:1px solid #e2e8f0; }
.overview-row { display:grid; grid-template-columns:64px 1fr; gap:12px; align-items:stretch; }
.overview-name { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; border:1px solid var(--edge); border-radius:10px; background:linear-gradient(135deg,rgba(15,38,55,.92),rgba(8,25,38,.78)); color:#dcebf5; font-size:13px; font-weight:600; letter-spacing:1px; writing-mode:vertical-rl; }
.overview-name i { width:4px; height:18px; border-radius:2px; background:var(--cyan); box-shadow:0 0 8px var(--cyan); }
.overview-name.water i { background:#3888ff; box-shadow:0 0 8px #3888ff; }
.overview-name.air i { background:#17cbd2; box-shadow:0 0 8px #17cbd2; }
.overview-name.distributed i { background:#31cf97; box-shadow:0 0 8px #31cf97; }
.overview-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; min-width:0; }
.metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.metric-card { min-height:86px; border:1px solid var(--edge); background:linear-gradient(135deg,rgba(15,38,55,.92),rgba(8,25,38,.78)); padding:14px 12px; display:flex; align-items:center; gap:10px; position:relative; overflow:hidden; }
.metric-card::before { content:""; position:absolute; left:0; top:12px; bottom:12px; width:2px; background:var(--tone); box-shadow:0 0 10px var(--tone); }
.metric-card.blue{--tone:#3888ff}.metric-card.cyan{--tone:#17cbd2}.metric-card.green{--tone:#31cf97}.metric-card.amber{--tone:#e6a452}
.metric-icon { width:38px; height:38px; display:grid; place-items:center; color:var(--tone); background:color-mix(in srgb,var(--tone) 11%,transparent); border:1px solid color-mix(in srgb,var(--tone) 25%,transparent); font-size:19px; }
.metric-copy { display:flex; flex-direction:column; min-width:130px; }
.metric-copy>span { color:#7790a4; font-size:10px; letter-spacing:.5px; }
.metric-copy strong { color:#f0f8ff; font-size:24px; line-height:1.15; margin-top:2px; font-variant-numeric:tabular-nums; }
.metric-copy strong small { color:#728da1; font-size:9px; font-weight:400; margin-left:4px; }
.metric-copy em { color:var(--tone); font-style:normal; font-size:9px; margin-top:3px; }
.mini-bars { height:40px; flex:1; display:flex; align-items:flex-end; gap:3px; opacity:.5; }
.mini-bars i { flex:1; min-width:2px; background:linear-gradient(to top,var(--tone),transparent); }
.dashboard-body { flex:1; min-height:740px; padding:0; position:relative; z-index:1; display:flex; flex-direction:column; gap:16px; margin: 20px 0 }
.content-grid { flex:1; min-height:0; display:grid; grid-template-columns:1fr; gap:16px; }.panel { background:var(--panel-bg); border:1px solid var(--edge); border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); overflow:hidden; }.topology-panel { min-height:0; display:flex; flex-direction:column; }.panel-heading { height:54px; padding:0 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f0f0f0; }.eyebrow { display:block; color:#94a3b8; font-size:9px; font-weight:700; letter-spacing:2px; margin-bottom:3px; }.panel-heading h2,.compact-heading h3 { font-size:16px; font-weight:600; color:#2d3748; letter-spacing:.4px; margin:0; }.legend { display:flex; gap:14px; font-size:12px; color:#64748b; }.legend span { display:flex; align-items:center; gap:5px; }.dot { width:8px;height:8px;border-radius:50%; }.dot.running{background:#22c55e}.dot.stopped{background:#94a3b8}.dot.fault{background:#ef4444}.line{width:16px;height:3px;border-radius:2px}.line.supply{background:#3b82f6}.line.return{background:#22c55e}.line.cooling-supply{background:#f59e0b}.line.cooling-return{background:#eab308}
.topology { flex:1; min-height:0; position:relative; overflow:hidden; background:#f8fafc; }
.device-inspector{position:absolute;z-index:18;right:18px;top:18px;width:286px;max-height:calc(100% - 36px);display:flex;flex-direction:column;color:#2d3748;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12)}.device-inspector>header{padding:16px 18px 12px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;border-radius:12px 12px 0 0}.device-inspector>header span{font-size:9px;letter-spacing:2px;color:#94a3b8}.device-inspector>header h3{margin:4px 0 2px;font-size:16px;color:#1e293b;font-weight:600}.device-inspector>header small{font-size:10px;color:#94a3b8}.device-inspector>header button{align-self:flex-start;border:0;background:transparent;color:#94a3b8;font-size:22px;line-height:1;cursor:pointer}.device-summary{margin:14px 16px 10px;padding:12px 14px;display:flex;align-items:center;gap:12px;border:1px solid var(--edge);border-radius:8px;background:#f8fafc}.device-summary>i{width:12px;height:12px;border-radius:50%;background:#94a3b8}.device-summary div{display:flex;flex-direction:column}.device-summary span{font-size:10px;color:var(--muted)}.device-summary strong{font-size:14px;margin-top:2px;color:#2d3748}.device-summary button{margin-left:auto;padding:6px 10px;border:1px solid #3b82f6;background:#eff6ff;color:#3b82f6;font-size:11px;border-radius:6px;cursor:pointer}.device-summary.running{border-color:rgba(34,197,94,.3)}.device-summary.running>i{background:#22c55e}.device-summary.stopped>i{background:#94a3b8}.device-summary.fault{border-color:rgba(239,68,68,.3);background:#fef2f2}.device-summary.fault>i{background:#ef4444;animation:state-pulse 1s infinite}.device-summary.normal>i{background:#3b82f6}.device-data-list{margin:0 16px 12px;overflow:auto;border:1px solid var(--edge);border-radius:6px}.device-data-list>div{min-height:32px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0f0;background:#ffffff}.device-data-list>div:last-child{border-bottom:0}.device-data-list span{font-size:12px;color:var(--muted)}.device-data-list strong{min-width:80px;padding:4px 8px;text-align:center;font-size:12px;font-weight:500;color:#475569;background:#f8fafc;border-radius:4px}.device-data-list .good strong{color:#16a34a;background:#f0fdf4}.device-data-list .idle strong{color:#64748b;background:#f8fafc}.device-data-list .bad strong{color:#ef4444;background:#fef2f2}.device-data-list .control strong{color:#3b82f6;background:#eff6ff}.device-inspector>footer{padding:10px 16px 12px;display:grid;grid-template-columns:6px auto 1fr;gap:8px;align-items:center;border-top:1px solid #f0f0f0;font-size:10px;color:var(--muted)}.device-inspector>footer i{width:6px;height:6px;border-radius:50%;background:#22c55e}.device-inspector>footer code{text-align:right;color:#64748b;overflow:hidden;text-overflow:ellipsis}.panel-tank-level{position:relative;height:58px;margin:0 16px 10px;overflow:hidden;border:1px solid var(--edge);border-radius:6px;background:linear-gradient(90deg,#f1f5f9,#e2e8f0)}.panel-tank-level i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#22d3ee,#3b82f6);transition:height .6s ease}.panel-tank-level span{position:absolute;z-index:2;inset:0;display:grid;place-items:center;font-size:15px;font-weight:700;color:#1e293b}.device-panel-enter-active,.device-panel-leave-active{transition:.22s ease}.device-panel-enter-from,.device-panel-leave-to{opacity:0;transform:translateX(18px)}@keyframes state-pulse{50%{opacity:.35}}
@keyframes flow{to{transform:translateX(26px)}}
.equipment-group { position:absolute; z-index:2; }.group-title { display:flex; align-items:center; gap:7px; margin-bottom:8px; }.group-title>b { width:18px;height:18px;display:grid;place-items:center;border:1px solid #245674;color:#3f9fc3;font-size:7px; }.group-title span{font-size:10px;font-weight:600;color:#afc5d4}.group-title small{font-size:6px;color:#3f6075;letter-spacing:1px}.tower-group{left:2.5%;top:4%;width:47%}.tower-row{display:flex;gap:10px}.tower{flex:1;min-width:82px;height:88px;position:relative;padding:6px 7px 0;border:1px solid #18394d;background:rgba(8,28,42,.82)}.tower-fan{height:14px;border:1px solid #31556a;border-bottom:0;display:grid;place-items:center}.tower-fan i{width:12px;height:12px;border:2px dotted #28d19c;border-radius:50%}.tower.running .tower-fan i{animation:spin 1.2s linear infinite}.tower-body{height:34px;padding:4px;background:linear-gradient(160deg,#214558,#102c3e);clip-path:polygon(5% 0,95% 0,100% 100%,0 100%)}.tower-body span{display:block;height:2px;background:#40677a;margin:3px}.equipment-label{display:grid;grid-template-columns:1fr auto;align-items:center;margin-top:4px}.equipment-label b{font-size:8px}.equipment-label em{font-size:7px;color:#28d19c;font-style:normal}.equipment-label strong{grid-column:1/-1;color:#6fa6bc;font-size:7px;font-weight:400}.stopped{filter:saturate(.35);opacity:.66}.stopped .equipment-label em{color:#7b8d99}.running{--status:#28d19c}@keyframes spin{to{transform:rotate(360deg)}}
.chiller-group{left:2.5%;top:36%;width:58%}.chiller-row{display:flex;gap:9px}.chiller-card{width:31%;min-width:130px;border:1px solid #1b4155;background:#0a2232;padding:9px;cursor:pointer;transition:.2s}.chiller-card:hover{border-color:#257da0;transform:translateY(-1px)}.machine{height:43px;display:flex;align-items:center}.machine-cap{width:12px;height:27px;background:linear-gradient(90deg,#31576b,#173546);border-radius:8px 0 0 8px}.machine-core{height:35px;flex:1;position:relative;border:1px solid #3b6479;background:linear-gradient(#23495d,#102d40);display:grid;place-items:center;overflow:hidden}.machine-core::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 9px,rgba(109,160,183,.12) 10px)}.machine-core i{position:absolute;left:7px;width:20px;height:20px;border:1px solid #3c758b;border-radius:50%}.machine-core b{font-size:7px;letter-spacing:1px;color:#6fadc4}.machine-tail{width:16px;height:25px;background:#1a3c4f;border-radius:0 5px 5px 0}.running .machine-core{border-color:#238575;box-shadow:inset 0 0 16px rgba(40,209,156,.12)}.chiller-info{display:flex;justify-content:space-between;align-items:flex-end}.chiller-info span{font-size:8px}.chiller-info span i{display:inline-block;width:5px;height:5px;border-radius:50%;background:#566a77;margin-right:4px}.running .chiller-info span i{background:#28d19c;box-shadow:0 0 6px #28d19c}.chiller-info strong{font-size:16px;color:#80e0cf}.chiller-info small{font-size:7px;margin-left:2px}.load-track{height:2px;background:#18384a;margin:5px 0}.load-track i{display:block;height:100%;background:linear-gradient(90deg,#1887ae,#28d19c);box-shadow:0 0 6px #28d19c}.chiller-stats{display:flex;justify-content:space-between;color:#4f7084;font-size:7px}.chiller-stats b{color:#91adbf;font-weight:400}
.pump-group{left:63%;top:7%;width:33%}.pump-columns{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pump-column{padding:7px;border:1px solid #18394b;background:rgba(9,27,41,.8)}.pump-column label{display:block;color:#54798e;font-size:7px;margin-bottom:5px}.pump-item{height:43px;margin:4px 0;padding:4px;border:1px solid #18394b;display:grid;grid-template-columns:32px 1fr;grid-template-rows:1fr 1fr;align-items:center}.pump-shape{grid-row:1/-1;width:26px;height:21px;border:1px solid #3b6276;border-radius:50% 6px 6px 50%;position:relative;background:#15394b}.pump-shape::after{content:"";position:absolute;left:8px;top:6px;width:7px;height:7px;border:1px dashed #7192a3;border-radius:50%}.pump-shape i{position:absolute;right:-6px;top:7px;width:7px;height:7px;background:#31586b}.pump-item.running .pump-shape{border-color:#27a486;background:#125044;box-shadow:0 0 10px rgba(40,209,156,.15)}.pump-item span{font-size:7px}.pump-item strong{font-size:8px;color:#78a9ba;font-weight:400}
.load-card{position:absolute;right:2.5%;bottom:4%;width:31%;height:92px;z-index:2;border:1px solid #1b4255;background:linear-gradient(130deg,#0d2a3d,#091e2d);display:flex;align-items:center;gap:12px;padding:12px}.building-icon{width:68px;height:54px;display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:7px;border:1px solid #2c5c73;background:linear-gradient(150deg,#1b465b,#0d2a3d);clip-path:polygon(9% 0,100% 0,100% 100%,0 100%,0 18%)}.building-icon i{background:#2b7792;box-shadow:0 0 5px rgba(25,199,216,.2)}.load-card span{font-size:10px;display:block}.load-card strong{font-size:16px;color:#dbeaf4;display:block;margin:3px 0}.load-card small{font-size:7px;color:#57788c}.sensor{position:absolute;z-index:4;display:flex;align-items:center;gap:4px;font-size:7px}.sensor span{width:19px;height:19px;border:1px solid #2a7389;background:#0d3445;border-radius:50%;display:grid;place-items:center;color:#59aec5}.sensor b{padding:3px 5px;background:#0d2c3b;color:#83b7c6;font-weight:400}.sensor-a{right:9%;top:43%}.sensor-b{left:52%;bottom:7%}.sensor-c{right:34%;bottom:11%}
.side-stack{display:none}.health-panel{flex:0 0 158px;padding:13px}.compact-heading{display:flex;justify-content:space-between;align-items:flex-start}.compact-heading button{background:#0d283a;border:1px solid #1b4358;color:#6c8da1;padding:4px 7px;font-size:8px}.compact-heading a{color:#3984a4;font-size:8px}.donut-row{display:flex;align-items:center;gap:18px;margin-top:11px}.donut{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#28d19c 0 78%,#e49a41 78% 88%,#1a3547 88%);position:relative}.donut::after{content:"";position:absolute;inset:8px;border-radius:50%;background:#0a2030}.donut div{z-index:1;text-align:center}.donut strong{display:block;font-size:19px}.donut span{font-size:7px;color:#668397}.health-list{flex:1;display:flex;flex-direction:column;gap:8px}.health-list span{font-size:8px;color:#708b9d;display:flex;align-items:center}.health-list i{width:6px;height:6px;border-radius:1px;margin-right:6px}.health-list i.ok{background:#28d19c}.health-list i.idle{background:#536c7c}.health-list i.warn{background:#e49a41}.health-list b{margin-left:auto;color:#c9dce8;font-size:11px}
.detail-panel{flex:1;min-height:210px;padding:13px}.run-pill{font-size:8px;padding:3px 7px;border:1px solid #24685b;color:#28d19c;background:rgba(40,209,156,.08)}.run-pill.stopped{color:#7c909d;border-color:#405463}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#19384a;margin-top:12px}.detail-grid div{background:#0a2030;padding:9px}.detail-grid span{display:block;color:#58778c;font-size:7px}.detail-grid strong{font-size:13px;color:#bcd3e0;margin-top:3px;display:block}.trend{height:72px;margin-top:9px;border-top:1px solid #18394b}.trend-line{height:56px;display:flex;align-items:flex-end;gap:2px;padding-top:8px}.trend-line i{flex:1;background:linear-gradient(to top,rgba(31,177,199,.55),rgba(31,177,199,.05));border-top:1px solid #2bb9cb}.trend-label{display:flex;justify-content:space-between;color:#3d6075;font-size:6px}
.alarm-panel{flex:0 0 185px;padding:13px}.alarm-list{margin-top:9px}.alarm-list>div{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #152f40}.alarm-list .level{width:4px;height:27px;background:#d58c42}.alarm-list .level.low{background:#598aa0}.alarm-list .level:not(.medium):not(.low){background:#28d19c}.alarm-list span{flex:1}.alarm-list b{display:block;font-size:8px;font-weight:500;color:#b5cad7}.alarm-list small{display:block;color:#4f6b7d;font-size:7px;margin-top:3px}.alarm-list em{font-style:normal;font-size:7px;padding:2px 5px;background:rgba(213,140,66,.1);color:#d59752}.alarm-list .normal em{color:#4f907e;background:rgba(40,209,156,.06)}
.statusbar{height:36px;flex:none;padding:0 20px;display:flex;align-items:center;gap:24px;background:#ffffff;border-top:1px solid var(--edge);color:#94a3b8;font-size:12px;z-index:2}.statusbar span:first-child{margin-right:auto}.statusbar i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#f59e0b;margin-right:6px}.statusbar i.online{background:#22c55e}.statusbar b{color:#64748b}.statusbar code{color:#3b82f6}.statusbar button{border:0;background:transparent;color:#3b82f6;font-size:12px;cursor:pointer}
.modal-mask{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:grid;place-items:center}.api-modal{width:min(560px,90vw);padding:28px;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.15);position:relative}.modal-close{position:absolute;right:16px;top:12px;border:0;background:transparent;color:#94a3b8;font-size:24px;cursor:pointer}.api-modal h2{font-size:20px;margin-bottom:8px;color:#1e293b}.api-modal p{font-size:13px;line-height:1.7;color:#64748b}.api-modal pre{margin:14px 0;padding:16px;background:#f8fafc;border:1px solid var(--edge);border-radius:8px;color:#3b82f6;font-size:12px;line-height:1.55;overflow:auto}.api-notes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.api-notes span{padding:12px;border:1px solid var(--edge);background:#f8fafc;border-radius:8px}.api-notes b{display:block;font-size:12px;color:#2d3748}.api-notes small{display:block;color:#94a3b8;font-size:10px;margin-top:4px}.primary-button{border:0;background:#3b82f6;color:#ffffff;padding:10px 18px;font-size:13px;border-radius:8px;cursor:pointer}.primary-button:hover{background:#2563eb}
@media(max-width:1180px){.topbar{grid-template-columns:220px 1fr 270px}.legend{display:none}}
@media(max-width:900px){.station-title em,.clock small{display:none}.topbar{grid-template-columns:190px 1fr 180px;padding:0 12px}.content-grid{display:block;min-height:0;overflow:hidden}.topology-panel{height:100%;min-height:0}.side-stack{display:none}.dashboard-body{overflow:hidden}.statusbar span:nth-child(3){display:none}}
</style>
