<template>
  <div
    ref="viewportRef"
    class="power-viewport"
  >
    <div class="power-canvas" :style="canvasStyle">
      <div class="grid-paper"></div>

      <div class="zone-title high-zone"><span>01</span><div><b>10kV 高压配电系统</b><small>双路电源 · 分段运行 · 继电保护监测</small></div></div>
      <div class="bus high-bus hv-4" :class="[energizedClass('power.hv.bus.4.energized'), motionClass('power.hv.bus.4')]" @click="select('power.hv.bus.4')">
        <label>10kV 4#母线</label><i></i><em>{{ v('power.hv.bus.4.voltage', 2) }} kV</em>
      </div>
      <div class="bus high-bus hv-5" :class="[energizedClass('power.hv.bus.5.energized'), motionClass('power.hv.bus.5')]" @click="select('power.hv.bus.5')">
        <label>10kV 5#母线</label><i></i><em>{{ v('power.hv.bus.5.voltage', 2) }} kV</em>
      </div>

      <div v-for="item in hvBranches" :key="item.id" class="hv-branch" :class="motionClass(item.id)" :style="{ left: `${item.x}px` }" @click="select(item.id)">
        <div class="hv-drop" :class="energizedClass(`${item.prefix}.breakerClosed`)"><i></i></div>
        <div class="breaker" :class="breakerClass(item.prefix)"><i></i><b></b></div>
        <div v-if="item.meter" class="meter"><i></i><span>{{ item.meter }}</span></div>
        <div v-else-if="item.transformer" class="transformer" :class="[deviceClass(`power.transformer.${item.transformer}.running`, `power.transformer.${item.transformer}.fault`), motionClass(`power.transformer.${item.transformer}`)]" @click.stop="select(`power.transformer.${item.transformer}`)">
          <i>△</i><i>Y</i><b>{{ item.transformer }}#变压器</b><small>SCB14-2500kVA</small>
        </div>
        <div v-else class="outgoing-arrow">↓</div>
        <strong>{{ item.name }}</strong><small>{{ item.code }}</small>
      </div>

      <div class="tx-data tx-one" @click="select('power.transformer.1')"><b>1#变压器</b><span>负载率 {{ v('power.transformer.1.loadRate', 1) }}%</span><span>{{ v('power.transformer.1.activePower', 0) }} kW</span><em>{{ v('power.transformer.1.windingTemp', 1) }} ℃</em></div>
      <div class="tx-data tx-two" @click="select('power.transformer.2')"><b>2#变压器</b><span>负载率 {{ v('power.transformer.2.loadRate', 1) }}%</span><span>{{ v('power.transformer.2.activePower', 0) }} kW</span><em>{{ v('power.transformer.2.windingTemp', 1) }} ℃</em></div>

      <div class="compensation-overview">
        <header><span>无功补偿监测</span><b>POWER FACTOR {{ v('power.station.powerFactor', 2) }}</b></header>
        <button v-for="no in 4" :key="no" :class="[deviceClass(`power.capacitor.${no}.running`, `power.capacitor.${no}.fault`), motionClass(`power.capacitor.${no}`)]" @click="select(`power.capacitor.${no}`)">
          <i><b></b><b></b><b></b></i><span>{{ no }}#补偿柜</span><small>{{ v(`power.capacitor.${no}.reactivePower`, 0) }} kvar</small>
        </button>
      </div>

      <div class="zone-title low-zone"><span>02</span><div><b>0.4kV 低压配电系统</b><small>按现场柜号与回路号逐条展开 · 点击回路查看完整电参量</small></div></div>

      <section v-for="busNo in [4, 5]" :key="busNo" class="lv-section" :class="`section-${busNo}`">
        <div class="section-heading">
          <div><span>0.4kV {{ busNo }}#母线</span><strong>{{ feedersByBus[busNo].length }} 条出线</strong></div>
          <p>{{ v(`power.lv.bus.${busNo}.voltageAB`, 0) }} V <i></i> {{ v(`power.lv.bus.${busNo}.current`, 0) }} A <i></i> {{ v(`power.lv.bus.${busNo}.activePower`, 0) }} kW</p>
        </div>
        <div class="bus lv-bus" :class="[energizedClass(`power.lv.bus.${busNo}.energized`), motionClass(`power.lv.bus.${busNo}`)]" :style="{ width: `${busWidth(busNo)}px` }" @click="select(`power.lv.bus.${busNo}`)"><i></i></div>

        <div class="lv-incomer" :class="motionClass(`power.lv.incomer.${busNo === 4 ? 1 : 2}`)" @click="select(`power.lv.incomer.${busNo === 4 ? 1 : 2}`)">
          <span>{{ busNo === 4 ? '1#' : '2#' }}变压器低压进线</span><div class="incomer-wire"><i></i></div><div class="breaker compact" :class="breakerClass(`power.lv.incomer.${busNo === 4 ? 1 : 2}`)"><i></i><b></b></div>
        </div>

        <div v-for="(item, index) in feedersByBus[busNo]" :key="item.id" class="feeder" :class="[deviceClass(`${feedPrefix(item)}.breakerClosed`, `${feedPrefix(item)}.fault`), motionClass(`power.lv.feeder.${item.id}`)]" :style="{ left: `${200 + index * feederPitch}px` }" @click="select(`power.lv.feeder.${item.id}`)">
          <div class="feeder-drop"><i></i></div>
          <div class="mini-breaker"><i></i></div>
          <div class="ct"><i></i><i></i><i></i></div>
          <div class="flow-particle">▼</div>
          <div class="feeder-card">
            <header><span>{{ item.cabinet }}</span><b>{{ item.code }}</b></header>
            <strong>{{ item.name }}</strong>
            <small>{{ item.priority }}回路</small>
            <div><span>{{ v(`${feedPrefix(item)}.activePower`, 0) }} kW</span><em>{{ boolText(`${feedPrefix(item)}.breakerClosed`, '供电', '备用') }}</em></div>
          </div>
        </div>
      </section>

      <button class="bus-coupler" :class="[breakerClass('power.lv.coupler.445'), motionClass('power.lv.coupler.445')]" @click="select('power.lv.coupler.445')"><i></i><b>445 母联</b><span>{{ boolText('power.lv.coupler.445.breakerClosed', '合闸', '分闸') }}</span></button>

      <div class="schematic-legend"><span><i class="dot live"></i>带电 / 合闸</span><span><i class="dot open"></i>失电 / 分闸</span><span><i class="dot fault"></i>故障</span><span><i class="line hv"></i>10kV母线</span><span><i class="line lv"></i>0.4kV母线</span><b>鼠标悬停有反馈 · 带电线路显示动态电流方向</b></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { POWER_FEEDERS } from '../data/powerDistributionPoints.js'

const props = defineProps({
  values: { type: Object, required: true },
  scale: { type: Number, default: 1 },
  translateX: { type: Number, default: 0 },
  translateY: { type: Number, default: 0 }
})
const emit = defineEmits(['select-device'])
const viewportRef = ref(null)
const motionDeviceId = ref('')
let motionTimer
const feeders = POWER_FEEDERS
const feederPitch = 70
const feedersByBus = {
  4: feeders.filter(item => item.bus === 4),
  5: feeders.filter(item => item.bus === 5)
}
const canvasWidth = computed(() => Math.max(2400, Math.max(feedersByBus[4].length, feedersByBus[5].length) * feederPitch + 340))
const CANVAS_HEIGHT = 1180
const canvasStyle = computed(() => ({
  width: `${canvasWidth.value}px`,
  height: `${CANVAS_HEIGHT}px`,
  transform: `translate(${props.translateX}px, ${props.translateY}px) scale(${props.scale})`,
  transformOrigin: '0 0'
}))
const hvBranches = [
  { id: 'power.hv.incomer.1', prefix: 'power.hv.incomer.1', name: '1#进线柜', code: '201', x: 150 },
  { id: 'power.hv.meter.1', prefix: 'power.hv.meter.1', name: '1#计量柜', code: '44', meter: 'V/A', x: 350 },
  { id: 'power.hv.feeder.211', prefix: 'power.hv.feeder.211', name: '核心区分配电室', code: '211', x: 550 },
  { id: 'power.hv.feeder.222', prefix: 'power.hv.feeder.222', name: '1#变压器高压柜', code: '222', transformer: 1, x: 750 },
  { id: 'power.hv.feeder.221', prefix: 'power.hv.feeder.221', name: '2#变压器高压柜', code: '221', transformer: 2, x: 1150 },
  { id: 'power.hv.feeder.212', prefix: 'power.hv.feeder.212', name: '核心区分配电室', code: '212', x: 1350 },
  { id: 'power.hv.meter.2', prefix: 'power.hv.meter.2', name: '2#计量柜', code: '55', meter: 'V/A', x: 1550 },
  { id: 'power.hv.incomer.2', prefix: 'power.hv.incomer.2', name: '2#进线柜', code: '202', x: 1750 }
]

function p(key) { return props.values[key] }
function v(key, digits = 1) { const number = Number(p(key)); return Number.isFinite(number) ? number.toFixed(digits) : '--' }
function boolText(key, yes, no) { return Boolean(p(key)) ? yes : no }
function energizedClass(key) { return p(key) ? 'energized' : 'deenergized' }
function breakerClass(prefix) { return { closed: Boolean(p(`${prefix}.breakerClosed`)), fault: Boolean(p(`${prefix}.fault`)) } }
function deviceClass(running, fault) { return p(fault) ? 'fault' : p(running) ? 'running' : 'stopped' }
function feedPrefix(item) { return `power.lv.feeder.${item.id}` }
function busWidth(busNo) { return Math.max(2050, feedersByBus[busNo].length * feederPitch + 210) }
function motionClass(id) { return motionDeviceId.value === id ? 'external-motion' : '' }
function select(id) { emit('select-device', id) }

defineExpose({ viewportRef })
function onPowerMotion(event) {
  const deviceId = String(event.detail?.deviceId || '')
  if (!deviceId) return
  motionDeviceId.value = deviceId
  clearTimeout(motionTimer)
  motionTimer = setTimeout(() => { motionDeviceId.value = '' }, Math.max(300, Number(event.detail?.duration) || 900))
}
onMounted(() => window.addEventListener('power-device-motion', onPowerMotion))
onUnmounted(() => { window.removeEventListener('power-device-motion', onPowerMotion); clearTimeout(motionTimer) })
</script>

<style scoped>
.power-viewport{position:absolute;inset:0;overflow:hidden;background:#eef2f6;cursor:grab;user-select:none}.power-viewport:active{cursor:grabbing}.power-canvas{position:relative;color:#334155;font-family:"PingFang SC","Microsoft YaHei",sans-serif;will-change:transform}.grid-paper{position:absolute;inset:0;background:linear-gradient(rgba(148,163,184,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.1) 1px,transparent 1px),radial-gradient(circle at 28% 20%,#ffffff,#f1f5f9 55%);background-size:18px 18px,18px 18px,100% 100%}.zone-title{position:absolute;z-index:8;left:32px;display:flex;align-items:center;gap:9px}.zone-title>span{width:25px;height:25px;display:grid;place-items:center;border:1px solid #bae6fd;background:#f0f9ff;color:#0284c7;font-size:8px;border-radius:6px}.zone-title b,.zone-title small{display:block}.zone-title b{font-size:11px;color:#1e293b}.zone-title small{margin-top:2px;color:#94a3b8;font-size:7px}.high-zone{top:44px}.low-zone{top:348px}.bus{position:absolute;z-index:4;height:9px;border-radius:2px;cursor:pointer;transition:filter .2s,transform .2s}.bus:hover{filter:brightness(1.15);transform:translateY(-2px)}.bus label{position:absolute;left:0;top:-24px;color:#334155;font-size:10px;font-weight:700;letter-spacing:.8px}.bus em{position:absolute;right:0;top:-25px;padding:3px 7px;border:1px solid rgba(245,158,11,.35);background:#fffbeb;color:#d97706;font-size:8px;font-style:normal;border-radius:4px}.bus>i{position:absolute;inset:2px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.62) 0 9px,transparent 9px 29px);animation:bus-flow 1.5s linear infinite}.high-bus{top:103px;width:860px;background:#f59e0b;box-shadow:0 0 13px rgba(245,158,11,.35)}.hv-4{left:75px}.hv-5{left:1035px}.bus.deenergized{background:#cbd5e1;box-shadow:none}.bus.deenergized>i{animation:none;opacity:.18}.hv-branch{position:absolute;z-index:10;top:103px;width:100px;height:224px;text-align:center;cursor:pointer;transition:.2s}.hv-branch:hover{transform:translateY(-4px);filter:brightness(1.1)}.hv-drop{position:absolute;left:48px;top:0;width:4px;height:112px;background:#f59e0b}.hv-drop.energized{background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,.45)}.hv-drop::after{content:"";position:absolute;left:0;top:0;width:4px;height:22px;background:linear-gradient(transparent,#ffe3b4,transparent);animation:current-down 1.5s linear infinite}.hv-drop.deenergized::after{display:none}.hv-drop i{position:absolute;left:-3px;top:31px;width:10px;height:2px;border-top:2px solid #f59e0b;transform:rotate(-28deg)}.breaker{position:absolute;left:34px;top:45px;width:32px;height:29px}.breaker>i,.breaker>b{position:absolute;left:3px;right:3px;height:2px;background:#94a3b8}.breaker>i{top:6px}.breaker>b{bottom:6px}.breaker::after{content:"";position:absolute;left:8px;top:8px;width:16px;height:2px;background:#94a3b8;transform:rotate(-36deg);transform-origin:left;transition:.25s}.breaker.closed::after{background:#22c55e;transform:rotate(0);box-shadow:0 0 7px rgba(34,197,94,.6)}.breaker.fault::after{background:#ef4444;box-shadow:0 0 9px rgba(239,68,68,.6);animation:fault-flash .75s infinite}.meter{position:absolute;left:33px;top:88px;width:35px;height:35px;border:2px solid #f59e0b;border-radius:50%;background:#ffffff}.meter i{position:absolute;left:16px;bottom:17px;width:11px;height:1px;background:#d97706;transform:rotate(-32deg);transform-origin:left}.meter span{position:absolute;left:0;right:0;bottom:6px;color:#d97706;font-size:6px}.outgoing-arrow{position:absolute;left:42px;top:112px;color:#d97706;font-size:19px;animation:arrow-drop 1.4s ease-in-out infinite}.hv-branch>strong{position:absolute;left:-22px;right:-22px;top:157px;font-size:8px;line-height:1.3;color:#334155}.hv-branch>small{position:absolute;left:0;right:0;top:184px;color:#94a3b8;font-size:7px}.transformer{position:absolute;left:17px;top:105px;width:68px;height:86px}.transformer>i{position:absolute;left:14px;width:40px;height:40px;display:grid;place-items:center;border:3px solid #f59e0b;border-radius:50%;background:#ffffff;color:#d97706;font-style:normal;font-size:12px}.transformer>i:first-child{top:0}.transformer>i:nth-child(2){top:29px}.transformer>b{position:absolute;left:-14px;right:-14px;top:72px;font-size:7px;color:#334155}.transformer>small{position:absolute;left:-18px;right:-18px;top:83px;color:#94a3b8;font-size:6px}.transformer.running>i{animation:transformer-hum 2s ease-in-out infinite}.transformer.stopped{opacity:.45;filter:saturate(.2)}.transformer.fault>i{border-color:#ef4444;animation:fault-flash .7s infinite}.tx-data{position:absolute;z-index:12;top:230px;width:154px;height:62px;padding:8px 10px;display:grid;grid-template-columns:1fr 1fr;gap:3px;border:1px solid #e2e8f0;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.06);cursor:pointer;font-size:7px}.tx-data b{grid-column:1/-1;color:#1e293b}.tx-data span{color:#64748b}.tx-data em{color:#d97706;font-style:normal}.tx-one{left:695px}.tx-two{left:1095px}.compensation-overview{position:absolute;z-index:9;left:2060px;top:65px;width:560px;height:225px;padding:14px;border:1px solid #e2e8f0;background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)}.compensation-overview header{display:flex;justify-content:space-between;color:#64748b;font-size:8px}.compensation-overview header b{color:#16a34a}.compensation-overview>button{position:relative;width:116px;height:154px;margin:16px 7px 0 0;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px;color:#334155;vertical-align:top}.compensation-overview>button:hover{transform:translateY(-4px);border-color:#0ea5e9}.compensation-overview>button>i{display:flex;flex-direction:column;gap:11px;width:54px;height:66px;margin:11px auto;padding:9px;border:1px solid #e2e8f0;background:#ffffff;border-radius:6px}.compensation-overview>button>i b{height:4px;background:#0ea5e9;box-shadow:0 0 6px rgba(14,165,233,.45);animation:capacitor-pulse 1.6s ease-in-out infinite}.compensation-overview>button span,.compensation-overview>button small{display:block}.compensation-overview>button span{font-size:8px;color:#334155}.compensation-overview>button small{margin-top:5px;color:#64748b;font-size:7px}.compensation-overview>button.stopped{opacity:.45}.compensation-overview>button.stopped>i b{animation:none;background:#94a3b8;box-shadow:none}.compensation-overview>button.fault{border-color:#ef4444;animation:fault-flash .8s infinite}.lv-section{position:absolute;z-index:5;left:32px;right:32px;height:318px}.section-4{top:397px}.section-5{top:738px}.section-heading{position:absolute;left:0;top:0;width:108px;height:56px;padding:8px;border-left:2px solid #0ea5e9;background:linear-gradient(90deg,rgba(14,165,233,.1),transparent)}.section-heading span,.section-heading strong{display:block}.section-heading span{font-size:10px;color:#334155}.section-heading strong{margin-top:4px;color:#0284c7;font-size:7px}.section-heading p{position:absolute;left:0;top:62px;width:106px;color:#64748b;font-size:7px;line-height:1.8}.section-heading p i{display:inline-block;width:3px;height:3px;border-radius:50%;background:#0ea5e9}.lv-bus{left:122px;top:46px;background:#0ea5e9;box-shadow:0 0 13px rgba(14,165,233,.35)}.lv-incomer{position:absolute;z-index:9;left:132px;top:0;width:112px;height:77px;cursor:pointer;text-align:center;transition:.2s}.lv-incomer:hover{filter:brightness(1.1)}.lv-incomer>span{font-size:7px;color:#64748b}.incomer-wire{position:absolute;left:54px;top:17px;width:4px;height:42px;background:#0ea5e9}.incomer-wire::after{content:"";position:absolute;left:0;top:0;width:4px;height:18px;background:linear-gradient(transparent,#bae6fd,transparent);animation:current-down 1.3s linear infinite}.breaker.compact{left:40px;top:22px}.feeder{position:absolute;z-index:8;top:46px;width:100px;height:239px;text-align:center;cursor:pointer;transition:transform .18s,filter .18s}.feeder:hover{z-index:30;transform:translateY(-6px) scale(1.02);filter:brightness(1.08)}.feeder-drop{position:absolute;left:48px;top:0;width:4px;height:78px;background:#0ea5e9}.feeder-drop::after{content:"";position:absolute;left:0;top:0;width:4px;height:19px;background:linear-gradient(transparent,#bae6fd,transparent);animation:current-down 1.25s linear infinite}.feeder.stopped .feeder-drop{background:#94a3b8}.feeder.stopped .feeder-drop::after{display:none}.feeder-drop i{position:absolute;left:-3px;top:18px;width:10px;height:2px;border-top:2px solid #0ea5e9;transform:rotate(-28deg)}.mini-breaker{position:absolute;left:35px;top:30px;width:30px;height:25px}.mini-breaker::before,.mini-breaker::after{content:"";position:absolute;left:3px;right:3px;height:2px;background:#94a3b8}.mini-breaker::before{top:4px}.mini-breaker::after{bottom:4px}.mini-breaker i{position:absolute;left:5px;top:6px;width:18px;height:2px;background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,.6)}.stopped .mini-breaker i{transform:rotate(-36deg);background:#94a3b8;box-shadow:none}.fault .mini-breaker i{background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,.6);animation:fault-flash .7s infinite}.ct{position:absolute;left:28px;top:58px;display:flex;gap:3px}.ct i{width:12px;height:12px;border:2px solid #94a3b8;border-radius:50%}.flow-particle{position:absolute;left:43px;top:77px;color:#0ea5e9;font-size:10px;animation:arrow-drop 1.25s ease-in-out infinite}.stopped .flow-particle{color:#94a3b8;animation:none}.feeder-card{position:absolute;left:0;right:0;top:103px;min-height:124px;padding:8px 6px;border:1px solid #e2e8f0;background:#ffffff;border-radius:8px;box-shadow:0 8px 17px rgba(15,23,42,.08)}.feeder-card header{display:flex;justify-content:space-between;align-items:center;padding-bottom:5px;border-bottom:1px solid #f0f0f0}.feeder-card header span{color:#0284c7;font-size:7px}.feeder-card header b{font-size:6px;color:#94a3b8}.feeder-card>strong{display:block;min-height:30px;margin-top:7px;color:#1e293b;font-size:8px;line-height:1.35}.feeder-card>small{color:#94a3b8;font-size:6px}.feeder-card>div{margin-top:8px;display:flex;justify-content:space-between;color:#0284c7;font-size:6px}.feeder-card em{padding:1px 4px;background:rgba(34,197,94,.1);border-radius:3px;color:#16a34a;font-style:normal}.stopped .feeder-card{opacity:.58}.fault .feeder-card{border-color:rgba(239,68,68,.6);box-shadow:0 0 18px rgba(239,68,68,.12)}.fault .feeder-card em{background:rgba(239,68,68,.12);color:#dc2626}.bus-coupler{position:absolute;z-index:30;left:68px;top:708px;width:98px;height:48px;border:1px solid #e2e8f0;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.06);color:#334155}.bus-coupler i{display:block;width:28px;height:3px;margin:6px auto;background:#94a3b8;transform:rotate(-28deg)}.bus-coupler.closed i{background:#22c55e;transform:rotate(0);box-shadow:0 0 7px rgba(34,197,94,.6)}.bus-coupler b,.bus-coupler span{display:block;font-size:7px}.bus-coupler span{color:#64748b}.schematic-legend{position:absolute;z-index:20;left:32px;bottom:20px;width:calc(100% - 64px);height:34px;padding:0 12px;display:flex;align-items:center;gap:20px;border:1px solid #e2e8f0;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.06);color:#64748b;font-size:7px}.schematic-legend span{display:flex;align-items:center;gap:5px}.schematic-legend>b{margin-left:auto;font-weight:400}.dot{width:7px;height:7px;border-radius:50%}.dot.live{background:#22c55e;box-shadow:0 0 7px rgba(34,197,94,.5)}.dot.open{background:#94a3b8}.dot.fault{background:#ef4444;box-shadow:0 0 6px rgba(239,68,68,.5)}.line{width:20px;height:3px}.line.hv{background:#f59e0b}.line.lv{background:#0ea5e9}.external-motion{animation:external-motion .66s ease-in-out 2!important}@keyframes bus-flow{to{background-position:29px 0}}@keyframes current-down{0%{transform:translateY(-15px);opacity:0}35%{opacity:1}100%{transform:translateY(85px);opacity:0}}@keyframes arrow-drop{50%{transform:translateY(6px);opacity:.35}}@keyframes transformer-hum{50%{filter:brightness(1.15);box-shadow:0 0 9px rgba(245,158,11,.3)}}@keyframes capacitor-pulse{50%{opacity:.38;transform:scaleX(.8)}}@keyframes fault-flash{50%{filter:brightness(1.4);opacity:.55}}@keyframes external-motion{0%,100%{filter:brightness(1);transform:translateY(0)}45%{filter:brightness(1.6) drop-shadow(0 0 11px rgba(14,165,233,.85));transform:translateY(-7px) scale(1.035)}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.power-canvas{min-width:2400px}.feeder{width:64px;height:222px}.feeder:hover{transform:translateY(-5px) scale(1.045)}.feeder-drop{left:30px;height:70px}.mini-breaker{left:17px;top:28px}.ct{left:9px;top:55px}.ct i{width:10px;height:10px}.flow-particle{left:25px;top:70px;font-size:9px}.feeder-card{top:91px;min-height:111px;padding:5px 3px}.feeder-card header{display:block;padding-bottom:3px}.feeder-card header span,.feeder-card header b{display:block;font-size:5.5px}.feeder-card>strong{min-height:27px;margin-top:4px;font-size:6.5px;line-height:1.3}.feeder-card>small{font-size:5.5px}.feeder-card>div{display:block;margin-top:5px;font-size:5.5px}.feeder-card em{display:block;width:max-content;margin:3px auto 0}.schematic-legend{gap:13px;height:29px;font-size:6.5px}.dot{width:6px;height:6px}.line{width:16px}
</style>
