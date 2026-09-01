<template>
  <div class="energy-page">
    <!-- 顶部"能源站管理系统"一行暂不显示（注释保留，后续可按需恢复）-->
    <!-- <header class="topbar">
      <div class="brand-lockup">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div><strong>能源站管理系统</strong><small>ENERGY STATION MANAGEMENT</small></div>
      </div>
      <div class="station-title"><i></i><span>首钢园 · 2/3/4号场馆</span><em>集中风冷系统</em></div>
      <div class="header-actions">
        <div class="live-state" :class="{ connected }"><b></b>{{ connected ? '数据在线' : '演示数据' }}</div>
        <button class="icon-button" title="刷新" @click="refreshTime">↻</button>
        <div class="clock"><strong>{{ currentTime }}</strong><small>{{ currentDate }}</small></div>
      </div>
    </header> -->
    

    <section class="system-metrics">
      <article v-for="metric in airMetrics" :key="metric.key" class="metric-card" :class="metric.tone">
        <div class="metric-icon">{{ metric.icon }}</div>
        <div class="metric-copy"><span>{{ metric.label }}</span><strong>{{ number(point(metric.key), metric.digits) }}<small>{{ metric.unit }}</small></strong><em>{{ metricNote(metric) }}</em></div>
        <div class="mini-bars"><i v-for="n in 8" :key="n" :style="{ height: `${18 + ((n * 11 + metric.seed) % 28)}%` }"></i></div>
      </article>
    </section>

    <main class="dashboard-body">
      <section class="content-grid">
        <article class="panel topology-panel">
          <div class="panel-heading">
            <h2>集中风冷系统实时监控</h2>
            <div class="legend"><span><i class="dot running"></i>运行</span><span><i class="dot stopped"></i>停止</span><span><i class="dot fault"></i>故障</span><span><i class="line supply"></i>冷冻供水</span><span><i class="line return"></i>冷冻回水</span></div>
          </div>

          <div class="topology">
            <AirCooledPlantSchematic :values="values" @select-unit="selectedAirUnit = $event" @select-device="openDevice" />
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
              <div class="donut"><div><strong>92</strong><span>健康度</span></div></div>
              <div class="health-list"><span><i class="ok"></i>运行设备 <b>11</b></span><span><i class="idle"></i>停止设备 <b>4</b></span><span><i class="warn"></i>活动告警 <b>{{ point('air.station.alarmCount') }}</b></span></div>
            </div>
          </article>

          <article class="panel detail-panel">
            <div class="compact-heading"><div><span class="eyebrow">EQUIPMENT DETAIL</span><h3>{{ selectedAirUnit }}# 风冷机组</h3></div><span class="run-pill" :class="statusClass(`airUnit.${selectedAirUnit}.running`)">{{ runningText(`airUnit.${selectedAirUnit}.running`) }}</span></div>
            <div class="detail-grid">
              <div><span>实时负载率</span><strong>{{ display(`airUnit.${selectedAirUnit}.load`) }}</strong></div>
              <div><span>输入功率</span><strong>{{ display(`airUnit.${selectedAirUnit}.power`) }}</strong></div>
              <div><span>风机频率</span><strong>{{ display(`airUnit.${selectedAirUnit}.fanFrequency`) }}</strong></div>
              <div><span>累计运行</span><strong>{{ display(`airUnit.${selectedAirUnit}.hours`) }}</strong></div>
            </div>
            <div class="trend"><div class="trend-line"><i v-for="n in 18" :key="n" :style="{ height: `${28 + ((n * 17) % 58)}%` }"></i></div><div class="trend-label"><span>08:00</span><span>12:00</span><span>16:00</span><span>现在</span></div></div>
          </article>

          <article class="panel alarm-panel">
            <div class="compact-heading"><div><span class="eyebrow">ACTIVE EVENTS</span><h3>实时事件</h3></div><a>全部事件 →</a></div>
            <div class="alarm-list">
              <div><i class="level medium"></i><span><b>5#风冷机组风机频率偏高</b><small>设备告警 · 10:18:42</small></span><em>中</em></div>
              <div class="normal"><i class="level"></i><span><b>群控策略自动加减机</b><small>运行记录 · 09:45:00</small></span><em>正常</em></div>
              <div class="normal"><i class="level"></i><span><b>系统切换至自动模式</b><small>运行记录 · 09:12:30</small></span><em>正常</em></div>
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
    "air.station.totalPower": 638.4,
    "airUnit.1.running": true,
    "airUnit.1.load": { "value": 78, "quality": "good" }
  }
}</pre>
        <div class="api-notes"><span><b>WebSocket</b><small>订阅 /ws，消息类型 energy-points</small></span><span><b>浏览器调用</b><small>window.EnergyStation.updatePoints(...)</small></span><span><b>设备动效</b><small>POST /api/energy-station/device-motion</small></span><span><b>打开面板</b><small>window.EnergyStation.openDevicePanel(id)</small></span></div>
        <button class="primary-button" @click="copyExample">{{ copied ? '已复制示例' : '复制请求示例' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { bindingStore } from '/@/views/bems-web/energy-monitor/stores/bindingStore.js'
import { ENERGY_STATION_DEFAULTS, ENERGY_STATION_POINTS } from '/@/views/bems-web/energy-monitor/data/energyStationPoints.js'
import { ENERGY_DEVICE_IDS, getEnergyDeviceProfile } from '/@/views/bems-web/energy-monitor/data/energyStationDevices.js'
import AirCooledPlantSchematic from '/@/views/bems-web/energy-monitor/components/AirCooledPlantSchematic.vue'

defineOptions({ name: 'EnergyManagementCentralizedAirPage' })

const values = reactive({ ...ENERGY_STATION_DEFAULTS })
const quality = reactive({})
const currentTime = ref('')
const currentDate = ref('')
const lastUpdate = ref('--:--:--')
const selectedAirUnit = ref(1)
const selectedDeviceId = ref('')
const showApi = ref(false)
const copied = ref(false)
const catalog = ENERGY_STATION_POINTS
let clockTimer

const connected = computed(() => bindingStore.state.socketConnected)
const pointCount = computed(() => Object.keys(quality).length)
const pointMap = Object.fromEntries(catalog.map(item => [item.key, item]))
const airMetrics = [
  { key: 'air.station.totalPower', label: '风冷系统总功率', unit: 'kW', digits: 1, icon: 'ϟ', noteKey: 'air.station.powerSavingRate', notePrefix: '较昨日同期 ↓ ', noteUnit: '%', tone: 'blue', seed: 6 },
  { key: 'air.station.coolingCapacity', label: '当前制冷量', unit: 'kW', digits: 0, icon: '❄', noteKey: 'air.station.loadRate', notePrefix: '负荷率 ', noteUnit: '%', tone: 'cyan', seed: 11 },
  { key: 'air.station.cop', label: '风冷系统 COP', unit: '', digits: 2, icon: '◎', noteKey: 'air.station.copImprovement', notePrefix: '优于基准值 ', noteUnit: '%', tone: 'green', seed: 15 },
  { key: 'air.station.dailyEnergy', label: '今日累计用电', unit: 'kWh', digits: 0, icon: '↗', noteKey: 'air.station.forecastEnergy', notePrefix: '预测 ', noteUnit: ' kWh', tone: 'amber', seed: 21 }
]
const selectedDevice = computed(() => getEnergyDeviceProfile(selectedDeviceId.value))
const deviceState = computed(() => {
  const device = selectedDevice.value
  if (!device) return { label: '正常', tone: 'normal' }
  if (device.faultKey && Boolean(point(device.faultKey))) return { label: '故障', tone: 'fault' }
  if (device.runningKey) return Boolean(point(device.runningKey)) ? { label: '运行', tone: 'running' } : { label: '停止', tone: 'stopped' }
  return { label: device.tank ? '液位正常' : '工作正常', tone: 'normal' }
})

function point(key) { return values[key] ?? '--' }
function number(value, digits = 1) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '--'
}
function metricNote(metric) {
  const digits = metric.noteKey.endsWith('forecastEnergy') ? 0 : 1
  return `${metric.notePrefix}${number(point(metric.noteKey), digits)}${metric.noteUnit}`
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
function openDevice(id) {
  if (!ENERGY_DEVICE_IDS.includes(id)) return false
  selectedDeviceId.value = id
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
  const text = `curl -X POST ${location.origin}/api/energy-station/points -H "Content-Type: application/json" -d '{"points":{"air.station.totalPower":638.4,"airUnit.1.running":true,"airUnit.1.load":78}}'`
  await navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1600)
}

onMounted(() => {
  refreshTime()
  clockTimer = setInterval(refreshTime, 1000)
  window.addEventListener('energy-point-values', onEnergyPoints)
  window.addEventListener('binding-value', onBindingValue)
  loadSnapshot().finally(() => applyPoints(bindingStore.getColdLatestValues()))
})
onUnmounted(() => {
  clearInterval(clockTimer)
  window.removeEventListener('energy-point-values', onEnergyPoints)
  window.removeEventListener('binding-value', onBindingValue)
})
</script>

<style scoped>
.energy-page { --ink:#2d3748; --muted:#718096; --edge:#e2e8f0; --panel-bg:#ffffff; --cyan:#0ea5e9; --blue:#3b82f6; --green:#22c55e; min-width:0; min-height:0; height:100%; color:var(--ink); background:#f5f7fa; display:flex; flex-direction:column; overflow-y:auto; font-family:"PingFang SC","Microsoft YaHei",sans-serif; position:relative; }
.topbar { height:68px; display:grid; grid-template-columns:270px 1fr 330px; align-items:center; padding:0 24px; border-bottom:1px solid var(--edge); background:#ffffff; z-index:2; }
.brand-lockup { display:flex; align-items:center; gap:11px; }
.brand-mark { width:34px; height:34px; display:flex; align-items:flex-end; gap:3px; transform:skew(-10deg); }
.brand-mark span { width:8px; background:linear-gradient(#22d3ee,#3b82f6); border-radius:2px 2px 0 0; }
.brand-mark span:nth-child(1){height:17px}.brand-mark span:nth-child(2){height:27px}.brand-mark span:nth-child(3){height:22px}
.brand-lockup strong { display:block; font-size:16px; letter-spacing:1.8px; color:#1e293b; }.brand-lockup small { display:block; margin-top:2px; font-size:8px; letter-spacing:2px; color:#94a3b8; }
.station-title { justify-self:center; display:flex; align-items:center; gap:10px; }.station-title i { width:5px; height:5px; border-radius:50%; background:var(--green); }.station-title span { font-size:16px; font-weight:700; letter-spacing:1px; color:#1e293b; }.station-title em { font-style:normal; color:#64748b; border-left:1px solid #e2e8f0; padding-left:10px; }
.header-actions { display:flex; justify-content:flex-end; align-items:center; gap:15px; }.live-state { color:#f59e0b; font-size:13px; padding:6px 10px; border:1px solid rgba(245,158,11,.28); border-radius:6px; }.live-state b { display:inline-block; width:6px; height:6px; margin-right:6px; border-radius:50%; background:#f59e0b; }.live-state.connected { color:var(--green); border-color:rgba(34,197,94,.25); }.live-state.connected b { background:var(--green); }.icon-button { width:30px; height:30px; border:1px solid var(--edge); background:#f8fafc; color:#64748b; border-radius:6px; font-size:18px; cursor:pointer; }.clock { border-left:1px solid var(--edge); padding-left:15px; text-align:right; }.clock strong { display:block; font-size:15px; letter-spacing:1px; color:#1e293b; }.clock small { display:block; color:var(--muted); font-size:9px; margin-top:2px; }
.system-metrics { --edge:#e2e8f0; display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.metric-card { min-height:78px; border:1px solid var(--edge); background:#ffffff; padding:14px 12px; display:flex; align-items:center; gap:10px; position:relative; overflow:hidden; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.metric-card::before { content:""; position:absolute; left:0; top:14px; bottom:14px; width:2px; background:var(--tone); }
.metric-card.blue{--tone:#3888ff}.metric-card.cyan{--tone:#0ea5e9}.metric-card.green{--tone:#22c55e}.metric-card.amber{--tone:#f59e0b}
.metric-icon { width:34px; height:34px; display:grid; place-items:center; color:var(--tone); background:color-mix(in srgb,var(--tone) 10%,transparent); border:1px solid color-mix(in srgb,var(--tone) 22%,transparent); font-size:16px; }
.metric-copy { display:flex; flex-direction:column; min-width:110px; }
.metric-copy>span { color:#94a3b8; font-size:10px; letter-spacing:.5px; }
.metric-copy strong { color:#1e293b; font-size:22px; line-height:1.15; margin-top:2px; font-variant-numeric:tabular-nums; }
.metric-copy strong small { color:#94a3b8; font-size:9px; font-weight:400; margin-left:4px; }
.metric-copy em { color:var(--tone); font-style:normal; font-size:9px; margin-top:3px; }
.mini-bars { height:36px; flex:1; display:flex; align-items:flex-end; gap:3px; opacity:.55; }
.mini-bars i { flex:1; min-width:2px; background:color-mix(in srgb,var(--tone) 45%,transparent); }
.dashboard-body { flex:1; min-height:740px; padding:0; position:relative; z-index:1; display:flex; flex-direction:column; gap:16px; margin: 20px 0 }
.content-grid { flex:1; min-height:0; display:grid; grid-template-columns:1fr; gap:16px; }.panel { background:var(--panel-bg); border:1px solid var(--edge); border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); overflow:hidden; }.topology-panel { min-height:0; display:flex; flex-direction:column; }.panel-heading { height:54px; padding:0 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f0f0f0; }.eyebrow { display:block; color:#94a3b8; font-size:9px; font-weight:700; letter-spacing:2px; margin-bottom:3px; }.panel-heading h2,.compact-heading h3 { font-size:20px; font-weight:600; color:#2d3748; letter-spacing:.4px; margin:0; }.legend { display:flex; gap:14px; font-size:14px; color:#64748b; }.legend span { display:flex; align-items:center; gap:5px; }.dot { width:8px;height:8px;border-radius:50%; }.dot.running{background:#22c55e}.dot.stopped{background:#94a3b8}.dot.fault{background:#ef4444}.line{width:16px;height:3px;border-radius:2px}.line.supply{background:#3b82f6}.line.return{background:#22c55e}.line.cooling-supply{background:#f59e0b}.line.cooling-return{background:#eab308}
.topology { flex:1; min-height:0; position:relative; overflow:hidden; background:#f8fafc; }
.device-inspector{position:absolute;z-index:18;right:18px;top:18px;width:286px;max-height:calc(100% - 36px);display:flex;flex-direction:column;color:#2d3748;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12)}.device-inspector>header{padding:16px 18px 12px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;border-radius:12px 12px 0 0}.device-inspector>header span{font-size:9px;letter-spacing:2px;color:#94a3b8}.device-inspector>header h3{margin:4px 0 2px;font-size:20px;color:#1e293b;font-weight:600}.device-inspector>header small{font-size:10px;color:#94a3b8}.device-inspector>header button{align-self:flex-start;border:0;background:transparent;color:#94a3b8;font-size:22px;line-height:1;cursor:pointer}.device-summary{margin:14px 16px 10px;padding:12px 14px;display:flex;align-items:center;gap:12px;border:1px solid var(--edge);border-radius:8px;background:#f8fafc}.device-summary>i{width:12px;height:12px;border-radius:50%;background:#94a3b8}.device-summary div{display:flex;flex-direction:column}.device-summary span{font-size:10px;color:var(--muted)}.device-summary strong{font-size:16px;margin-top:2px;color:#2d3748}.device-summary button{margin-left:auto;padding:6px 10px;border:1px solid #3b82f6;background:#eff6ff;color:#3b82f6;font-size:13px;border-radius:6px;cursor:pointer}.device-summary.running{border-color:rgba(34,197,94,.3)}.device-summary.running>i{background:#22c55e}.device-summary.stopped>i{background:#94a3b8}.device-summary.fault{border-color:rgba(239,68,68,.3);background:#fef2f2}.device-summary.fault>i{background:#ef4444;animation:state-pulse 1s infinite}.device-summary.normal>i{background:#3b82f6}.device-data-list{margin:0 16px 12px;overflow:auto;border:1px solid var(--edge);border-radius:6px}.device-data-list>div{min-height:32px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0f0;background:#ffffff}.device-data-list>div:last-child{border-bottom:0}.device-data-list span{font-size:14px;color:var(--muted)}.device-data-list strong{min-width:80px;padding:4px 8px;text-align:center;font-size:14px;font-weight:500;color:#475569;background:#f8fafc;border-radius:4px}.device-data-list .good strong{color:#16a34a;background:#f0fdf4}.device-data-list .idle strong{color:#64748b;background:#f8fafc}.device-data-list .bad strong{color:#ef4444;background:#fef2f2}.device-data-list .control strong{color:#3b82f6;background:#eff6ff}.device-inspector>footer{padding:10px 16px 12px;display:grid;grid-template-columns:6px auto 1fr;gap:8px;align-items:center;border-top:1px solid #f0f0f0;font-size:10px;color:var(--muted)}.device-inspector>footer i{width:6px;height:6px;border-radius:50%;background:#22c55e}.device-inspector>footer code{text-align:right;color:#64748b;overflow:hidden;text-overflow:ellipsis}.panel-tank-level{position:relative;height:58px;margin:0 16px 10px;overflow:hidden;border:1px solid var(--edge);border-radius:6px;background:linear-gradient(90deg,#f1f5f9,#e2e8f0)}.panel-tank-level i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#22d3ee,#3b82f6);transition:height .6s ease}.panel-tank-level span{position:absolute;z-index:2;inset:0;display:grid;place-items:center;font-size:15px;font-weight:700;color:#1e293b}.device-panel-enter-active,.device-panel-leave-active{transition:.22s ease}.device-panel-enter-from,.device-panel-leave-to{opacity:0;transform:translateX(18px)}@keyframes state-pulse{50%{opacity:.35}}
.side-stack{display:none}.health-panel{flex:0 0 158px;padding:13px}.compact-heading{display:flex;justify-content:space-between;align-items:flex-start}.compact-heading button{background:#f1f5f9;border:1px solid var(--edge);color:#64748b;padding:4px 7px;font-size:8px}.compact-heading a{color:#3b82f6;font-size:8px}.donut-row{display:flex;align-items:center;gap:18px;margin-top:11px}.donut{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#22c55e 0 85%,#f59e0b 85% 92%,#e2e8f0 92%);position:relative}.donut::after{content:"";position:absolute;inset:8px;border-radius:50%;background:#ffffff}.donut div{z-index:1;text-align:center}.donut strong{display:block;font-size:19px}.donut span{font-size:7px;color:#94a3b8}.health-list{flex:1;display:flex;flex-direction:column;gap:8px}.health-list span{font-size:8px;color:#64748b;display:flex;align-items:center}.health-list i{width:6px;height:6px;border-radius:1px;margin-right:6px}.health-list i.ok{background:#22c55e}.health-list i.idle{background:#94a3b8}.health-list i.warn{background:#f59e0b}.health-list b{margin-left:auto;color:#475569;font-size:13px}
.detail-panel{flex:1;min-height:210px;padding:13px}.run-pill{font-size:8px;padding:3px 7px;border:1px solid #22c55e;color:#22c55e;background:rgba(34,197,94,.08)}.run-pill.stopped{color:#94a3b8;border-color:#cbd5e1}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#e2e8f0;margin-top:12px}.detail-grid div{background:#ffffff;padding:9px}.detail-grid span{display:block;color:#94a3b8;font-size:7px}.detail-grid strong{font-size:16px;color:#475569;margin-top:3px;display:block}.trend{height:72px;margin-top:9px;border-top:1px solid #e2e8f0}.trend-line{height:56px;display:flex;align-items:flex-end;gap:2px;padding-top:8px}.trend-line i{flex:1;background:linear-gradient(to top,rgba(59,130,246,.55),rgba(59,130,246,.05));border-top:1px solid #3b82f6}.trend-label{display:flex;justify-content:space-between;color:#94a3b8;font-size:6px}
.alarm-panel{flex:0 0 185px;padding:13px}.alarm-list{margin-top:9px}.alarm-list>div{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #e2e8f0}.alarm-list .level{width:4px;height:27px;background:#f59e0b}.alarm-list .level.low{background:#64748b}.alarm-list .level:not(.medium):not(.low){background:#22c55e}.alarm-list span{flex:1}.alarm-list b{display:block;font-size:8px;font-weight:500;color:#475569}.alarm-list small{display:block;color:#94a3b8;font-size:7px;margin-top:3px}.alarm-list em{font-style:normal;font-size:7px;padding:2px 5px;background:rgba(245,158,11,.1);color:#f59e0b}.alarm-list .normal em{color:#22c55e;background:rgba(34,197,94,.06)}
.statusbar{height:36px;flex:none;padding:0 20px;display:flex;align-items:center;gap:24px;background:#ffffff;border-top:1px solid var(--edge);color:#94a3b8;font-size:14px;z-index:2}.statusbar span:first-child{margin-right:auto}.statusbar i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#f59e0b;margin-right:6px}.statusbar i.online{background:#22c55e}.statusbar b{color:#64748b}.statusbar code{color:#3b82f6}.statusbar button{border:0;background:transparent;color:#3b82f6;font-size:14px;cursor:pointer}
.modal-mask{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:grid;place-items:center}.api-modal{width:min(560px,90vw);padding:28px;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.15);position:relative}.modal-close{position:absolute;right:16px;top:12px;border:0;background:transparent;color:#94a3b8;font-size:24px;cursor:pointer}.api-modal h2{font-size:20px;margin-bottom:8px;color:#1e293b}.api-modal p{font-size:16px;line-height:1.7;color:#64748b}.api-modal pre{margin:14px 0;padding:16px;background:#f8fafc;border:1px solid var(--edge);border-radius:8px;color:#3b82f6;font-size:14px;line-height:1.55;overflow:auto}.api-notes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.api-notes span{padding:12px;border:1px solid var(--edge);background:#f8fafc;border-radius:8px}.api-notes b{display:block;font-size:14px;color:#2d3748}.api-notes small{display:block;color:#94a3b8;font-size:10px;margin-top:4px}.primary-button{border:0;background:#3b82f6;color:#ffffff;padding:10px 18px;font-size:16px;border-radius:8px;cursor:pointer}.primary-button:hover{background:#2563eb}
@media(max-width:1180px){.topbar{grid-template-columns:220px 1fr 270px}.legend{display:none}}
@media(max-width:900px){.station-title em,.clock small{display:none}.topbar{grid-template-columns:190px 1fr 180px;padding:0 12px}.content-grid{display:block;min-height:0;overflow:hidden}.topology-panel{height:100%;min-height:0}.side-stack{display:none}.dashboard-body{overflow:hidden}.statusbar span:nth-child(3){display:none}}
</style>
