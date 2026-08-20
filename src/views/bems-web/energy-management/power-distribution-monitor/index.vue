<template>
  <div class="power-page">
    <nav class="power-subnav">
      <button class="active"><span>ϟ</span> 总配电室一次系统</button>
      <div class="system-meta">
        <span><i :class="{ online: connected }"></i>{{ connected ? '采集链路在线' : '采集链路离线' }}</span>
        <b>{{ livePointCount ? `实时点位 ${livePointCount}` : '演示默认值' }}</b>
        <em>10kV / 0.4kV</em>
      </div>
    </nav>

    <main class="power-body">
      <section class="metrics">
        <article v-for="metric in metrics" :key="metric.key" :class="metric.tone">
          <div class="metric-icon">{{ metric.icon }}</div>
          <div><span>{{ metric.label }}</span><strong>{{ formatNumber(value(metric.key), metric.digits) }}<small>{{ metric.unit }}</small></strong><em>{{ metric.note }}</em></div>
          <i class="metric-spark"><b v-for="n in 10" :key="n" :style="{ height: `${20 + ((n * 13 + metric.seed) % 55)}%` }"></b></i>
        </article>
      </section>

      <article class="topology-panel">
        <header>
          <div><span>SINGLE-LINE DIAGRAM</span><h2>服贸会核心区总配电室实时一次系统图</h2></div>
          <div class="header-data">
            <span><b></b>10kV 4#母线 {{ display('power.hv.bus.4.voltage') }}</span>
            <span><b></b>10kV 5#母线 {{ display('power.hv.bus.5.voltage') }}</span>
            <button @click="showApi = true">数据接入说明</button>
          </div>
        </header>
        <div class="topology">
          <PowerSingleLineSchematic :values="values" @select-device="openDevice" />
          <Transition name="device-panel">
            <section v-if="selectedDevice" class="device-inspector" @click.stop>
              <header>
                <div><span>ELECTRICAL DEVICE</span><h3>{{ selectedDevice.title }}</h3><small>{{ selectedDevice.type }}</small><code>{{ selectedDevice.id }}</code></div>
                <button aria-label="关闭设备数据面板" @click="closeDevice">×</button>
              </header>
              <div class="device-summary" :class="deviceState.tone">
                <i></i><div><span>当前状态</span><strong>{{ deviceState.label }}</strong></div>
                <button @click="nudgeSelected">动效测试</button>
              </div>
              <div class="device-data-list">
                <div v-for="row in selectedDevice.fields" :key="row.key" :class="deviceRowTone(row)"><span>{{ row.label }}</span><strong>{{ deviceRowValue(row) }}</strong></div>
              </div>
              <footer><i></i><span>后台点位实时推送</span><code>{{ selectedDevice.fields[0]?.key }}</code></footer>
            </section>
          </Transition>
        </div>
      </article>
    </main>

    <footer class="statusbar">
      <span><i :class="{ online: connected }"></i>更新时间 {{ lastUpdate }}</span>
      <span>点位目录 <b>{{ catalog.length }}</b></span>
      <span>设备及回路 <b>{{ deviceIds.length }}</b></span>
      <span>API <code>POST /api/power-distribution/points</code></span>
      <button @click="showApi = true">查看接口</button>
    </footer>

    <div v-if="showApi" class="modal-mask" @click.self="showApi = false">
      <div class="api-modal">
        <button class="modal-close" @click="showApi = false">×</button>
        <span class="eyebrow">DATA INTEGRATION</span><h2>变配电实时数据接入</h2>
        <p>按点位编码推送即可。页面收到数据后会同步刷新母线、开关、变压器、馈线状态及弹窗测量值。</p>
        <pre>POST /api/power-distribution/points
Content-Type: application/json

{
  "points": {
    "power.station.totalLoad": 2520.6,
    "power.transformer.1.loadRate": 53.2,
    "power.lv.feeder.cold-1.breakerClosed": true
  }
}</pre>
        <div class="api-notes">
          <span><b>点位目录</b><small>GET /api/power-distribution/catalog</small></span>
          <span><b>WebSocket</b><small>/ws · 消息类型 power-points</small></span>
          <span><b>设备动效</b><small>POST /api/power-distribution/device-motion</small></span>
          <span><b>浏览器 API</b><small>window.PowerDistribution</small></span>
        </div>
        <button class="primary-button" @click="copyExample">{{ copied ? '已复制示例' : '复制 curl 示例' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { bindingStore } from '/@/views/bems-web/energy-monitor/stores/bindingStore.js'
import PowerSingleLineSchematic from './components/PowerSingleLineSchematic.vue'
import { POWER_DISTRIBUTION_DEFAULTS, POWER_DISTRIBUTION_POINTS } from './data/powerDistributionPoints.js'
import { POWER_DEVICE_IDS, getPowerDeviceProfile } from './data/powerDistributionDevices.js'

const values = reactive({ ...POWER_DISTRIBUTION_DEFAULTS })
const quality = reactive({})
const lastUpdate = ref('--:--:--')
const selectedDeviceId = ref('')
const showApi = ref(false)
const copied = ref(false)
const catalog = POWER_DISTRIBUTION_POINTS
const deviceIds = POWER_DEVICE_IDS
const pointMap = Object.fromEntries(catalog.map(item => [item.key, item]))
const connected = computed(() => bindingStore.state.socketConnected)
const livePointCount = computed(() => Object.keys(quality).length)
const selectedDevice = computed(() => getPowerDeviceProfile(selectedDeviceId.value))
const metrics = [
  { key: 'power.station.totalLoad', label: '实时总负荷', unit: 'kW', digits: 1, icon: 'ϟ', note: '两段低压母线合计', tone: 'cyan', seed: 4 },
  { key: 'power.station.dailyEnergy', label: '今日累计用电', unit: 'kWh', digits: 0, icon: '∑', note: '高压计量口径', tone: 'blue', seed: 9 },
  { key: 'power.station.maxDemand', label: '本月最大需量', unit: 'kW', digits: 0, icon: 'M', note: '需量越限预警已启用', tone: 'amber', seed: 15 },
  { key: 'power.station.powerFactor', label: '综合功率因数', unit: '', digits: 2, icon: 'cosφ', note: '无功补偿联动监测', tone: 'green', seed: 21 }
]
const deviceState = computed(() => {
  const device = selectedDevice.value
  if (!device) return { label: '正常', tone: 'normal' }
  if (device.faultKey && Boolean(value(device.faultKey))) return { label: '故障', tone: 'fault' }
  const running = device.runningKey ? Boolean(value(device.runningKey)) : true
  if (device.type.includes('母线')) return running ? { label: '带电', tone: 'running' } : { label: '失电', tone: 'stopped' }
  if (device.type.includes('断路器') || device.type.includes('开关柜') || device.type.includes('进线柜') || device.type.includes('馈线')) return running ? { label: '合闸', tone: 'running' } : { label: '分闸', tone: 'stopped' }
  if (device.type.includes('补偿')) return running ? { label: '投入', tone: 'running' } : { label: '退出', tone: 'stopped' }
  return running ? { label: '运行', tone: 'running' } : { label: '停止', tone: 'stopped' }
})

function value(key) { return values[key] ?? '--' }
function formatNumber(input, digits = 1) { const number = Number(input); return Number.isFinite(number) ? number.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '--' }
function display(key) {
  const meta = pointMap[key]
  if (!meta) return String(value(key))
  if (meta.type === 'boolean') return Boolean(value(key)) ? '是' : '否'
  const raw = Number(value(key)); const digits = Number.isFinite(raw) && Math.abs(raw) < 10 ? 2 : 1
  return `${formatNumber(raw, digits)}${meta.unit ? ` ${meta.unit}` : ''}`
}
function deviceRowValue(row) {
  if (row.kind === 'breaker') return Boolean(value(row.key)) ? '合闸' : '分闸'
  if (row.kind === 'fault') return Boolean(value(row.key)) ? '故障' : '正常'
  if (row.kind === 'remote') return Boolean(value(row.key)) ? '远方' : '就地'
  if (row.kind === 'energized') return Boolean(value(row.key)) ? '带电' : '失电'
  if (row.kind === 'running') return Boolean(value(row.key)) ? '运行 / 投入' : '停止 / 退出'
  return display(row.key)
}
function deviceRowTone(row) {
  if (row.kind === 'fault') return Boolean(value(row.key)) ? 'bad' : 'good'
  if (['breaker', 'energized', 'running'].includes(row.kind)) return Boolean(value(row.key)) ? 'good' : 'idle'
  if (row.kind === 'remote') return 'control'
  return ''
}
function normalizePoints(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  const source = payload.points || payload
  if (Array.isArray(source)) return source
  return Object.entries(source).map(([key, item]) => item && typeof item === 'object' && !Array.isArray(item) ? { key, ...item } : { key, value: item })
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
function openDevice(id) { if (!POWER_DEVICE_IDS.includes(id)) return false; selectedDeviceId.value = id; return true }
function closeDevice() { selectedDeviceId.value = '' }
function triggerDeviceMotion(deviceId, duration = 900) {
  if (!POWER_DEVICE_IDS.includes(deviceId)) return false
  window.dispatchEvent(new CustomEvent('power-device-motion', { detail: { deviceId, duration } }))
  return true
}
function nudgeSelected() { if (selectedDeviceId.value) triggerDeviceMotion(selectedDeviceId.value) }
function onPowerPoints(event) { applyPoints(event.detail) }
async function loadSnapshot() { try { const response = await fetch('/api/power-distribution/points'); if (response.ok) applyPoints(await response.json()) } catch {} }
async function copyExample() {
  const text = `curl -X POST ${location.origin}/api/power-distribution/points -H "Content-Type: application/json" -d '{"points":{"power.station.totalLoad":2520.6,"power.transformer.1.loadRate":53.2,"power.lv.feeder.cold-1.breakerClosed":true}}'`
  await navigator.clipboard?.writeText(text); copied.value = true; setTimeout(() => { copied.value = false }, 1600)
}

const powerApi = {
  updatePoint: (key, nextValue, options = {}) => applyPoints([{ key, value: nextValue, ...options }]),
  updatePoints: applyPoints,
  getSnapshot: () => ({ ...values }),
  getPointCatalog: () => catalog.map(item => ({ ...item })),
  getDeviceCatalog: () => POWER_DEVICE_IDS.map(id => ({ ...getPowerDeviceProfile(id) })),
  openDevicePanel: openDevice,
  closeDevicePanel: closeDevice,
  triggerDeviceMotion
}

onMounted(() => { window.addEventListener('power-point-values', onPowerPoints); window.PowerDistribution = powerApi; loadSnapshot() })
onUnmounted(() => { window.removeEventListener('power-point-values', onPowerPoints); if (window.PowerDistribution === powerApi) delete window.PowerDistribution })
</script>

<style scoped>
.power-page{--ink:#2d3748;--muted:#64748b;--edge:#e2e8f0;--panel:#ffffff;--cyan:#0ea5e9;--green:#22c55e;--blue:#3b82f6;--amber:#f59e0b;--red:#ef4444;min-width:0;min-height:0;height:100%;display:flex;flex-direction:column;overflow:hidden;color:var(--ink);background:#f5f7fa;font-family:"PingFang SC","Microsoft YaHei",sans-serif;position:relative}.power-page::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;background:linear-gradient(rgba(148,163,184,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.06) 1px,transparent 1px);background-size:24px 24px}.power-subnav{z-index:2;height:38px;flex:none;padding:0 14px;display:flex;align-items:stretch;border-bottom:1px solid var(--edge);background:#ffffff}.power-subnav>button{min-width:154px;border:0;border-bottom:2px solid #0ea5e9;background:rgba(14,165,233,.08);color:#0284c7;font-size:10px;font-weight:500}.power-subnav>button span{margin-right:7px;color:#0ea5e9}.system-meta{margin-left:auto;display:flex;align-items:center;gap:14px;font-size:8px;color:#94a3b8}.system-meta span i{display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%;background:#f59e0b}.system-meta span i.online{background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,.5)}.system-meta b{padding:4px 7px;border:1px solid #e2e8f0;color:#475569;font-weight:400;border-radius:4px;background:#f8fafc}.system-meta em{font-style:normal;color:#d97706}.power-body{z-index:1;flex:1;min-height:0;padding:10px 12px;display:flex;flex-direction:column;gap:9px}.metrics{height:77px;flex:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.metrics article{--tone:#0ea5e9;min-width:0;padding:10px 12px;display:flex;align-items:center;gap:10px;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);position:relative;overflow:hidden}.metrics article::before{content:"";position:absolute;left:0;top:13px;bottom:13px;width:2px;background:var(--tone)}.metrics article.blue{--tone:#3b82f6}.metrics article.amber{--tone:#f59e0b}.metrics article.green{--tone:#22c55e}.metric-icon{width:34px;height:34px;flex:none;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--tone) 25%,transparent);background:color-mix(in srgb,var(--tone) 10%,transparent);color:var(--tone);font-size:12px;border-radius:8px}.metrics article>div:nth-child(2){min-width:108px}.metrics span{display:block;color:#94a3b8;font-size:8px}.metrics strong{display:block;margin-top:2px;color:#1e293b;font-size:20px;font-variant-numeric:tabular-nums}.metrics strong small{margin-left:4px;color:#94a3b8;font-size:7px;font-weight:400}.metrics em{display:block;margin-top:2px;color:var(--tone);font-size:7px;font-style:normal}.metric-spark{height:34px;flex:1;display:flex;align-items:flex-end;gap:2px;opacity:.5}.metric-spark b{flex:1;background:color-mix(in srgb,var(--tone) 45%,transparent)}.topology-panel{flex:1;min-height:0;display:flex;flex-direction:column;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden}.topology-panel>header{height:51px;flex:none;padding:0 15px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0f0}.topology-panel>header span:first-child{display:block;color:#94a3b8;font-size:6px;letter-spacing:1.8px}.topology-panel h2{margin-top:2px;font-size:12px;color:#1e293b}.header-data{display:flex;align-items:center;gap:13px}.header-data span{color:#64748b!important;font-size:7px!important;letter-spacing:0!important}.header-data span b{display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%;background:#f59e0b;box-shadow:0 0 6px rgba(245,158,11,.5)}.header-data button{padding:5px 8px;border:1px solid #bae6fd;background:#f0f9ff;color:#0284c7;font-size:8px;border-radius:6px}.topology{flex:1;min-height:0;position:relative;overflow:hidden}.device-inspector{position:absolute;z-index:18;right:16px;top:16px;width:292px;max-height:calc(100% - 32px);display:flex;flex-direction:column;color:#2d3748;border:1px solid #e2e8f0;background:#ffffff;border-radius:12px;box-shadow:0 20px 50px rgba(15,23,42,.22);backdrop-filter:blur(10px)}.device-inspector>header{padding:14px 15px 11px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between}.device-inspector>header span{font-size:6px;letter-spacing:1.8px;color:#0284c7}.device-inspector>header h3{margin:3px 0 2px;font-size:14px;color:#1e293b}.device-inspector>header small,.device-inspector>header code{display:block;color:#94a3b8;font-size:7px}.device-inspector>header code{margin-top:3px;color:#64748b}.device-inspector>header button{align-self:flex-start;border:0;background:transparent;color:#94a3b8;font-size:20px}.device-summary{margin:11px 13px 8px;padding:8px 9px;display:flex;align-items:center;gap:8px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px}.device-summary>i{width:8px;height:8px;border-radius:50%;background:#94a3b8}.device-summary div{display:flex;flex-direction:column}.device-summary span{font-size:6px;color:#94a3b8}.device-summary strong{font-size:11px;color:#334155}.device-summary button{margin-left:auto;padding:5px 7px;border:1px solid #bae6fd;background:#f0f9ff;color:#0284c7;font-size:7px;border-radius:6px}.device-summary.running{border-color:rgba(34,197,94,.4)}.device-summary.running>i{background:#22c55e;box-shadow:0 0 9px rgba(34,197,94,.5)}.device-summary.fault{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.06)}.device-summary.fault>i{background:#ef4444;box-shadow:0 0 9px rgba(239,68,68,.5)}.device-data-list{margin:0 13px 11px;overflow:auto;border:1px solid #e2e8f0;border-radius:8px}.device-data-list>div{min-height:26px;padding:0 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0f0;background:#ffffff}.device-data-list>div:last-child{border-bottom:0}.device-data-list span{font-size:7px;color:#64748b}.device-data-list strong{min-width:86px;padding:3px 5px;text-align:center;color:#475569;background:#f1f5f9;border-radius:4px;font-size:8px;font-weight:500}.device-data-list .good strong{color:#16a34a;background:rgba(34,197,94,.1)}.device-data-list .idle strong{color:#64748b;background:rgba(148,163,184,.14)}.device-data-list .bad strong{color:#dc2626;background:rgba(239,68,68,.1)}.device-data-list .control strong{color:#0284c7;background:rgba(14,165,233,.1)}.device-inspector>footer{padding:8px 13px 9px;display:grid;grid-template-columns:6px auto 1fr;gap:6px;align-items:center;border-top:1px solid #f0f0f0;font-size:6px;color:#94a3b8}.device-inspector>footer i{width:5px;height:5px;border-radius:50%;background:#22c55e}.device-inspector>footer code{text-align:right;color:#0284c7;overflow:hidden;text-overflow:ellipsis}.device-panel-enter-active,.device-panel-leave-active{transition:.22s ease}.device-panel-enter-from,.device-panel-leave-to{opacity:0;transform:translateX(18px)}.statusbar{z-index:2;height:28px;flex:none;padding:0 17px;display:flex;align-items:center;gap:22px;border-top:1px solid var(--edge);background:#ffffff;color:#94a3b8;font-size:7px}.statusbar span:first-child{margin-right:auto}.statusbar i{display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%;background:#f59e0b}.statusbar i.online{background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,.5)}.statusbar b{color:#475569}.statusbar code{color:#0284c7}.statusbar button{border:0;background:transparent;color:#0284c7;font-size:7px}.modal-mask{position:absolute;inset:0;z-index:30;display:grid;place-items:center;background:rgba(15,23,42,.45);backdrop-filter:blur(7px)}.api-modal{width:min(570px,90vw);padding:25px;border:1px solid var(--edge);background:#ffffff;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.18);position:relative}.modal-close{position:absolute;right:13px;top:9px;border:0;background:transparent;color:#94a3b8;font-size:22px}.eyebrow{color:#0284c7;font-size:6px;font-weight:700;letter-spacing:2px}.api-modal h2{margin:4px 0 8px;font-size:18px;color:#1e293b}.api-modal p{color:#64748b;font-size:10px;line-height:1.7}.api-modal pre{margin:13px 0;padding:13px;overflow:auto;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px;color:#0284c7;font-size:9px;line-height:1.55}.api-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:13px}.api-notes span{padding:9px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px}.api-notes b{display:block;font-size:9px;color:#334155}.api-notes small{display:block;margin-top:3px;color:#94a3b8;font-size:7px}.primary-button{padding:7px 13px;border:1px solid #0ea5e9;background:#0284c7;border-radius:6px;color:#ffffff;font-size:9px}@media(max-width:980px){.metrics strong{font-size:16px}.metric-spark{display:none}.header-data span{display:none}.statusbar span:nth-child(4){display:none}}
</style>
