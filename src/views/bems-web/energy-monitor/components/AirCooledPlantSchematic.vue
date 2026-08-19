<!-- ===== 集中风冷 · 风冷群控示意图 ===== -->
<template>
  <div ref="viewportRef" class="schematic-viewport">
    <div class="plant-canvas" :style="canvasStyle">
      <div class="paper-grid"></div>

      <section class="setting-panel public-settings">
        <h4>风冷群控公共参数</h4>
        <div class="setting-grid">
          <span>系统总启停 <b :class="{ active: isRunning('air.control.systemEnabled') }">{{ isRunning('air.control.systemEnabled') ? '已启动' : '已停止' }}</b></span>
          <span>启动数量 <b>{{ value('air.control.outputCount', 0) }} 台</b></span>
          <span>启动模式 <b>{{ textValue('air.control.startMode') }}</b></span>
          <span>强制数量 <b>{{ value('air.control.forceCount', 0) }} 台</b></span>
          <span>机组顺序 <b>{{ textValue('air.control.startOrder') }}</b></span>
          <span>水泵顺序 <b>{{ textValue('air.control.pumpOrder') }}</b></span>
        </div>
      </section>

      <section class="setting-panel loop-settings">
        <h4>冷冻水公共参数</h4>
        <div class="setting-grid">
          <span>供水温度 <b>{{ value('air.loop.supplyTemp', 1) }} ℃</b></span>
          <span>回水温度 <b>{{ value('air.loop.returnTemp', 1) }} ℃</b></span>
          <span>供水压力 <b>{{ value('air.loop.supplyPressure', 2) }} MPa</b></span>
          <span>回水压力 <b>{{ value('air.loop.returnPressure', 2) }} MPa</b></span>
          <span>系统流量 <b>{{ value('air.loop.flow', 1) }} m³/h</b></span>
          <span>供回水温差 <b>{{ deltaTemp }} ℃</b></span>
        </div>
      </section>

      <div class="ambient-readouts">
        <span>室外温度 <b>{{ value('station.outdoorTemp', 1) }} ℃</b></span>
        <span>室外湿度 <b>{{ value('station.outdoorHumidity', 1) }} %</b></span>
      </div>

      <div class="pipe-layer">
        <div v-for="(pipe, index) in pipes" :key="index" class="pipe" :class="[pipe.kind, pipe.dir, pipe.w > pipe.h ? 'horizontal' : 'vertical', { 'riser': pipe.riser }]" :style="pipeStyle(pipe)"><i v-if="pipe.dir && !pipe.riser"></i><b v-if="pipe.cap"></b></div>
      </div>

      <section class="air-unit-bank">
        <div v-for="no in 12" :key="no" class="air-unit interactive-device" :class="[runningClass(`airUnit.${no}.running`, `airUnit.${no}.fault`), motionClass(`air.unit.${no}`)]" :data-device-id="`air.unit.${no}`" :style="unitStyle(no)" @click="selectUnit(no)">
          <div class="unit-title"><strong>{{ no }}#风冷机组</strong><span>{{ value(`airUnit.${no}.hours`, 1) }} hr</span></div>
          <img src="/equipment/air-cooled-chiller-2_5d.png" alt="风冷机组">
          <div class="fan-motion"><i></i><i></i><i></i></div>
          <div class="unit-state"><b>{{ value(`airUnit.${no}.load`, 0) }}%</b><em>{{ value(`airUnit.${no}.fanFrequency`, 1) }} Hz</em></div>
        </div>
      </section>

      <section class="header-vessels">
        <div class="header-unit collector interactive-device is-normal" :class="motionClass('air.collector')" data-device-id="air.collector" @click="selectDevice('air.collector')"><img src="/equipment/header-vessel-2_5d.png" alt="集水器"><span>集水器</span></div>
        <div class="header-unit distributor interactive-device is-normal" :class="motionClass('air.distributor')" data-device-id="air.distributor" @click="selectDevice('air.distributor')"><img src="/equipment/header-vessel-2_5d.png" alt="分水器"><span>分水器</span></div>
        <div class="header-sensor collector-sensor">冷冻回水 <b>{{ value('air.loop.returnPressure', 2) }} MPa</b> <b>{{ value('air.loop.returnTemp', 1) }} ℃</b></div>
        <div class="header-sensor distributor-sensor">冷冻供水 <b>{{ value('air.loop.supplyPressure', 2) }} MPa</b> <b>{{ value('air.loop.supplyTemp', 1) }} ℃</b></div>
      </section>

      <div class="degasser interactive-device" :class="[runningClass('air.degasser.running', 'air.degasser.fault'), motionClass('air.degasser')]" data-device-id="air.degasser" @click="selectDevice('air.degasser')">
        <img src="/equipment/vacuum-degasser-2_5d.png" alt="真空脱气机">
        <span>真空脱气机</span><small>液位 {{ value('air.degasser.level', 0) }}% · {{ statusText('air.degasser.running', 'air.degasser.fault') }}</small>
      </div>

      <div class="water-processor interactive-device" :class="[runningClass('air.treatment.running', 'air.treatment.fault'), motionClass('air.treatment')]" data-device-id="air.treatment" @click="selectDevice('air.treatment')">
        <img src="/equipment/water-treatment-2_5d.png" alt="全程水处理器">
        <span>全程水处理器</span><small>运行状态 <b>{{ isRunning('air.treatment.running') ? '运行' : '停止' }}</b></small><small>故障报警 {{ isRunning('air.treatment.fault') ? '故障' : '正常' }}</small>
      </div>

      <section class="pump-bank chilled-pumps">
        <h4>冷水泵组</h4>
        <div v-for="no in 3" :key="no" class="pump-line interactive-device" :class="[runningClass(`airChwPump.${no}.running`, `airChwPump.${no}.fault`), motionClass(`air.chwPump.${no}`)]" :data-device-id="`air.chwPump.${no}`" :style="{ top: `${28 + (no - 1) * 66}px` }" @click="selectDevice(`air.chwPump.${no}`)">
          <div class="valve-symbol"><i></i></div><div class="pump-device"><img src="/equipment/pump-2_5d.png" alt="冷水泵"><i></i></div>
          <div class="pump-caption"><strong>{{ no }}#冷水泵</strong><span>{{ value(`airChwPump.${no}.frequency`, 1) }} Hz</span><em>{{ value(`airChwPump.${no}.hours`, 1) }} hr</em></div>
        </div>
      </section>

      <section class="pump-bank hot-pumps">
        <h4>热水泵组</h4>
        <div v-for="no in 2" :key="no" class="pump-line interactive-device" :class="[runningClass(`airHotPump.${no}.running`, `airHotPump.${no}.fault`), motionClass(`air.hotPump.${no}`)]" :data-device-id="`air.hotPump.${no}`" :style="{ top: `${42 + (no - 1) * 82}px` }" @click="selectDevice(`air.hotPump.${no}`)">
          <div class="valve-symbol"><i></i></div><div class="pump-device"><img src="/equipment/pump-2_5d.png" alt="热水泵"><i></i></div>
          <div class="pump-caption"><strong>{{ no }}#热水泵</strong><span>{{ value(`airHotPump.${no}.frequency`, 1) }} Hz</span><em>{{ value(`airHotPump.${no}.hours`, 1) }} hr</em></div>
        </div>
      </section>

      <div v-for="chip in chips" :key="chip.label" class="data-chip" :style="{ left: `${chip.x}px`, top: `${chip.y}px` }"><i>{{ chip.icon }}</i><b>{{ chip.label }}</b></div>

      <div class="plant-legend">
        <span>设备状态：</span><b><i class="legend-dot stopped"></i>停止</b><b><i class="legend-dot running"></i>运行</b><b><i class="legend-dot fault"></i>故障</b>
        <em></em><span>管路颜色：</span><b><i class="legend-line supply"></i>冷冻水供水</b><b><i class="legend-line return"></i>冷冻水回水</b>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({ values: { type: Object, required: true } })
const emit = defineEmits(['select-unit', 'select-device'])

const viewportRef = ref(null)
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
let observer
let motionTimer
const motionDeviceId = ref('')

const canvasStyle = computed(() => ({ transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})` }))
const unitXs = [414, 558, 702, 846, 990, 1134]

const pipes = [
  // 集水器上方四根回水立管（末端 → 集水器），riser/cap 保持原 vertical-risers 样式
  { kind:'return',x:92,y:350,w:5,h:95,dir:'down',riser:true,cap:true },
  { kind:'return',x:116,y:350,w:5,h:92,dir:'down',riser:true,cap:true },
  { kind:'return',x:136,y:350,w:5,h:88,dir:'down',riser:true,cap:true },
  { kind:'return',x:159,y:350,w:5,h:85,dir:'down',riser:true,cap:true },
  // 集水器上方横管（绿色），连接最左侧回水竖线与四根回水立管
  { kind:'return',x:42,y:350,w:160,h:5,dir:'right',riser:true },
  // 分水器上方四根供水立管（分水器 → 末端），与集水器同样可配置
  { kind:'supply',x:245,y:355,w:5,h:80,dir:'down',riser:true,cap:true },
  { kind:'supply',x:271,y:355,w:5,h:77,dir:'down',riser:true,cap:true },
  { kind:'supply',x:290,y:355,w:5,h:75,dir:'down',riser:true,cap:true },
  { kind:'supply',x:313,y:355,w:5,h:70,dir:'down',riser:true,cap:true },
  // 分水器上方横管（蓝色），连接四根供水立管
  { kind:'supply',x:245,y:355,w:71,h:5,dir:'right',riser:true },
  // 集水器右口 → 分水器左口连接斜线（绿色），dx/dy 为终点相对起点的偏移
  { kind:'return',x:190,y:440,dx:32,dy:25,h:4,dir:'right',riser:true,slant:true },
  // 冷冻回水：末端 → 集水器 → 水泵 → 风冷机组（绿色）
  { kind:'return',x:42,y:350,w:5,h:115,dir:'down' },
  { kind:'return',x:42,y:460,w:27,h:5,dir:'right' },
  // 集水器右端出水上翻后进入水泵总管，绕开分水器
  { kind:'return',x:200,y:335,w:5,h:18,dir:'up' }, 
  { kind:'return',x:200,y:335,w:350,h:5,dir:'right' },
  { kind:'return',x:545,y:335,w:5,h:248,dir:'down' },
  { kind:'return',x:545,y:446,w:238,h:5,dir:'right' }, 
  { kind:'return',x:545,y:512,w:238,h:5,dir:'right' }, 
  { kind:'return',x:545,y:578,w:238,h:5,dir:'right' },
  { kind:'return',x:778,y:385,w:5,h:198,dir:'up' }, 
  { kind:'return',x:778,y:385,w:293,h:5,dir:'right' },
  { kind:'return',x:841,y:385,w:5,h:167,dir:'down' },
  { kind:'return',x:846,y:465,w:225,h:5,dir:'right' },
  { kind:'return',x:846,y:547,w:225,h:5,dir:'right' },
  { kind:'return',x:1066,y:385,w:5,h:167,dir:'up' }, 
  { kind:'return',x:1066,y:385,w:202,h:5,dir:'right' },
  { kind:'return',x:1263,y:38,w:5,h:352,dir:'up' }, 
  { kind:'return',x:402,y:38,w:866,h:5,dir:'left' }, 
  { kind:'return',x:402,y:188,w:866,h:5,dir:'left' },
  ...unitXs.flatMap(x => [{ kind:'return',x:x+8,y:38,w:5,h:42,dir:'down' }, 
  { kind:'return',x:x+8,y:188,w:5,h:42,dir:'down' }]),
  // 冷冻供水：风冷机组 → 分水器 → 末端（蓝色）
  { kind:'supply',x:402,y:166,w:880,h:5,dir:'right' }, 
  { kind:'supply',x:402,y:316,w:880,h:5,dir:'right' },
  ...unitXs.flatMap(x => [{ kind:'supply',x:x+120,y:135,w:5,h:36,dir:'down' }, 
  { kind:'supply',x:x+120,y:285,w:5,h:36,dir:'down' }]),
  { kind:'supply',x:1277,y:166,w:5,h:190,dir:'down' }, 
  { kind:'supply',x:360,y:351,w:920,h:5,dir:'left' },
  { kind:'supply',x:360,y:351,w:5,h:87,dir:'down' }, 
  { kind:'supply',x:335,y:435,w:30,h:2,dir:'left' },
  // 集分水器支管与水处理旁通
  // { kind:'return',x:98,y:350,w:5,h:70,dir:'down' }, 
  // { kind:'supply',x:258,y:350,w:5,h:70,dir:'down' },
  // 真空脱气机旁通：回水主管取水并回到同一回路
  { kind:'return',x:480,y:435,w:70,h:5,dir:'left' },
  { kind:'return',x:376,y:435,w:9,h:5,dir:'left' }, 
  { kind:'return',x:376,y:435,w:5,h:31,dir:'down' },
  { kind:'return',x:376,y:462,w:174,h:5,dir:'right' },
  // 全程水处理器旁通：脱气机下游取水 → 设备 → 回水主管
  { kind:'return',x:477,y:530,w:73,h:5,dir:'left' },
  { kind:'return',x:387,y:556,w:9,h:5,dir:'left' }, 
  { kind:'return',x:387,y:556,w:5,h:26,dir:'down' },
  { kind:'return',x:387,y:578,w:163,h:5,dir:'right' }
]

const chips = computed(() => [
  { x:610,y:338,icon:'P',label:`${value('air.loop.supplyPressure',2)} MPa` },
  { x:684,y:338,icon:'T',label:`${value('air.loop.supplyTemp',1)} ℃` },
  { x:398,y:334,icon:'F',label:`${value('air.loop.flow',1)} m³/h` },
  { x:1115,y:374,icon:'P',label:`${value('air.loop.returnPressure',2)} MPa` },
  { x:1184,y:374,icon:'T',label:`${value('air.loop.returnTemp',1)} ℃` }
])

function point(key) { return props.values[key] ?? '--' }
function value(key, digits = 1) { const number = Number(point(key)); return Number.isFinite(number) ? number.toFixed(digits) : '--' }
function textValue(key) { return String(point(key) ?? '--') }
function isRunning(key) { return Boolean(point(key)) }
function runningClass(runningKey, faultKey) { return faultKey && isRunning(faultKey) ? 'is-fault' : isRunning(runningKey) ? 'is-running' : 'is-stopped' }
function motionClass(id) { return motionDeviceId.value === id ? 'external-motion' : '' }
function selectDevice(id) { emit('select-device', id) }
function selectUnit(no) { emit('select-unit', no); selectDevice(`air.unit.${no}`) }
function onDeviceMotion(event) {
  const id = event.detail?.deviceId || event.detail?.id
  if (!id?.startsWith('air.')) return
  clearTimeout(motionTimer)
  motionDeviceId.value = ''
  requestAnimationFrame(() => {
    motionDeviceId.value = id
    motionTimer = setTimeout(() => { motionDeviceId.value = '' }, Math.max(300, Number(event.detail?.duration) || 900))
  })
}
function statusText(runningKey, faultKey) { return isRunning(faultKey) ? '故障' : isRunning(runningKey) ? '运行' : '停止' }
function pipeStyle(pipe) {
  // 斜线：以起点为中心旋转的细长矩形，dx/dy 决定长度与角度
  if (pipe.slant) {
    const length = Math.hypot(pipe.dx, pipe.dy)
    const angle = Math.atan2(pipe.dy, pipe.dx) * 180 / Math.PI
    return { left:`${pipe.x}px`, top:`${pipe.y - (pipe.h / 2)}px`, width:`${length}px`, height:`${pipe.h}px`, transform:`rotate(${angle}deg)`, transformOrigin:'left center' }
  }
  return { left:`${pipe.x}px`, top:`${pipe.y}px`, width:`${pipe.w}px`, height:`${pipe.h}px` }
}
function unitStyle(no) { const index = no - 1; return { left:`${unitXs[index % 6]}px`, top:`${54 + Math.floor(index / 6) * 150}px` } }
const deltaTemp = computed(() => { const n = Number(point('air.loop.returnTemp')) - Number(point('air.loop.supplyTemp')); return Number.isFinite(n) ? n.toFixed(1) : '--' })
function fitCanvas() {
  const el = viewportRef.value
  if (!el) return
  const next = Math.min(el.clientWidth / 1320, el.clientHeight / 640)
  scale.value = Math.max(.35, next)
  offsetX.value = Math.max(0, (el.clientWidth - 1320 * scale.value) / 2)
  offsetY.value = Math.max(0, (el.clientHeight - 640 * scale.value) / 2)
}

onMounted(() => { observer = new ResizeObserver(fitCanvas); observer.observe(viewportRef.value); window.addEventListener('energy-device-motion', onDeviceMotion); fitCanvas() })
onUnmounted(() => { observer?.disconnect(); clearTimeout(motionTimer); window.removeEventListener('energy-device-motion', onDeviceMotion) })
</script>

<style scoped>
.schematic-viewport{position:absolute;inset:0;overflow:hidden;background:#eef3f2}.plant-canvas{position:absolute;left:0;top:0;width:1320px;height:640px;transform-origin:top left;color:#34464a;font-family:"Microsoft YaHei","PingFang SC",sans-serif}.paper-grid{position:absolute;inset:0;background:linear-gradient(rgba(81,116,118,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(81,116,118,.035) 1px,transparent 1px),radial-gradient(circle at 48% 46%,#fff,#edf2f1);background-size:9px 9px,9px 9px,100% 100%}
.interactive-device{cursor:pointer;transform-origin:center;transition:transform .18s ease,filter .18s ease,opacity .18s ease;outline:none}.interactive-device:hover{z-index:12!important;transform:translateY(-4px) scale(1.025);filter:brightness(1.06) drop-shadow(0 6px 5px rgba(27,68,70,.18))}.interactive-device::after{content:"";position:absolute;z-index:20;right:4px;top:4px;width:7px;height:7px;border:2px solid rgba(255,255,255,.85);border-radius:50%;background:#2a9ed1;box-shadow:0 0 7px rgba(42,158,209,.8)}.interactive-device.is-running::after{background:#39b94f;box-shadow:0 0 8px #39b94f}.interactive-device.is-stopped::after{background:#8b9697;box-shadow:none}.interactive-device.is-fault::after{background:#d63d46;box-shadow:0 0 9px #d63d46;animation:device-alert 1s infinite}.interactive-device.external-motion{animation:device-nudge .82s cubic-bezier(.2,.75,.3,1)}@keyframes device-nudge{0%,100%{transform:translate(0)}22%{transform:translateY(-8px) rotate(-1.2deg) scale(1.035)}45%{transform:translateY(1px) rotate(.7deg)}68%{transform:translateY(-4px) rotate(-.4deg)}}@keyframes device-alert{50%{opacity:.3}}
.setting-panel{position:absolute;z-index:7;left:18px;width:355px;padding:10px 12px;background:rgba(213,221,219,.88);border:1px solid rgba(107,132,131,.18);box-shadow:0 1px 5px rgba(38,63,65,.13)}.public-settings{top:16px}.loop-settings{top:137px}.setting-panel h4{font-size:12px;margin:0 0 8px;color:#263b3d}.setting-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 9px}.setting-grid span{display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#46595b;white-space:nowrap}.setting-grid b{min-width:71px;padding:2px 5px;text-align:center;background:rgba(255,255,255,.74);border:1px solid rgba(91,116,116,.15);font-weight:400;color:#506265}.setting-grid b.active{color:#168441;background:#dff4e6}.ambient-readouts{position:absolute;z-index:7;left:20px;top:260px;display:flex;gap:9px}.ambient-readouts span{font-size:8px;color:#506467}.ambient-readouts b{margin-left:5px;padding:2px 6px;background:#d0f0ed;color:#297d7e;font-weight:400}
.pipe-layer{position:absolute;inset:0;z-index:1}.pipe{position:absolute;background:var(--pipe);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pipe) 70%,#314b4a),0 1px 1px rgba(0,0,0,.15);border-radius:2px}.pipe.supply,.legend-line.supply{--pipe:#0879d0}.pipe.return,.legend-line.return{--pipe:#51a82f}.pipe i{position:absolute;width:0;height:0;filter:drop-shadow(0 0 1px white)}.pipe.horizontal.right i{right:28%;top:-3px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid #152b2d}.pipe.horizontal.left i{left:28%;top:-3px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:8px solid #152b2d}.pipe.vertical.down i{left:-3px;top:45%;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid #152b2d}.pipe.vertical.up i{left:-3px;top:38%;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #152b2d}.pipe.horizontal.right i{animation:pipe-right 2.1s linear infinite}.pipe.horizontal.left i{animation:pipe-left 2.1s linear infinite}.pipe.vertical.down i{animation:pipe-down 2.1s linear infinite}.pipe.vertical.up i{animation:pipe-up 2.1s linear infinite}.pipe::after{content:"";position:absolute;opacity:.24;border-radius:inherit}.pipe.horizontal::after{left:2px;right:2px;top:1px;height:1px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.9) 0 7px,transparent 7px 16px);animation:water-h 1.3s linear infinite}.pipe.vertical::after{top:2px;bottom:2px;left:1px;width:1px;background:repeating-linear-gradient(180deg,rgba(255,255,255,.9) 0 7px,transparent 7px 16px);animation:water-v 1.3s linear infinite}.pipe.horizontal.left::after,.pipe.vertical.up::after{animation-direction:reverse}@keyframes pipe-right{from{right:90%}to{right:5%}}@keyframes pipe-left{from{left:90%}to{left:5%}}@keyframes pipe-down{from{top:5%}to{top:84%}}@keyframes pipe-up{from{top:84%}to{top:5%}}@keyframes water-h{to{background-position:16px 0}}@keyframes water-v{to{background-position:0 16px}}
.air-unit-bank{position:absolute;inset:0;z-index:3}.air-unit{position:absolute;width:136px;height:122px;cursor:pointer}.air-unit img{position:absolute;left:0;top:15px;width:136px;height:91px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(43,59,54,.2));transition:.2s}.air-unit:hover img{transform:translateY(-2px);filter:drop-shadow(3px 5px 3px rgba(43,59,54,.18)) drop-shadow(0 0 4px rgba(54,153,89,.25))}.unit-title{position:absolute;z-index:3;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;font-size:7px}.unit-title strong{font-weight:600}.unit-title span{color:#617374}.unit-state{position:absolute;z-index:3;left:7px;right:4px;bottom:0;display:flex;justify-content:space-between;font-size:7px}.unit-state b{padding:2px 4px;background:#d4efdf;color:#26804a;font-weight:400}.unit-state em{padding:2px 4px;background:#caebe8;color:#347b79;font-style:normal}.fan-motion{position:absolute;z-index:2;left:31px;top:27px;width:78px;height:26px;display:flex;gap:6px;transform:skewY(-7deg)}.fan-motion i{width:20px;height:20px;border:2px dashed rgba(31,57,51,.58);border-radius:50%}.is-running .fan-motion i{animation:fan-spin 1.1s linear infinite}.is-running .fan-motion i:nth-child(2){animation-duration:1.25s}.is-running .fan-motion i:nth-child(3){animation-duration:1.4s}.is-stopped{filter:saturate(.35);opacity:.68}.is-fault{filter:saturate(.45)}.is-fault img{filter:drop-shadow(0 0 5px rgba(198,59,66,.4))}.is-fault .unit-state b{background:#f2d9da;color:#b43239}@keyframes fan-spin{to{transform:rotate(360deg)}}
.header-vessels{position:absolute;left:62px;top:353px;width:292px;height:158px;z-index:4}.header-unit{position:absolute;top:58px;width:138px;height:84px}.header-unit.collector{left:0}.header-unit.distributor{right:0}.header-unit img{position:absolute;left:-4px;top:-9px;width:146px;height:96px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(48,69,66,.22))}.header-unit>span{position:absolute;left:0;right:0;bottom:-7px;text-align:center;font-size:8px;font-weight:600;color:#3d5050;text-shadow:0 1px white}.pipe.riser{box-shadow:none;border-radius:0;background:var(--pipe)}.pipe.riser::after{display:none}.pipe.riser>b{position:absolute;top:14px;left:-4px;width:11px;height:8px;background:#439849;border:2px solid #dde9df}.header-sensor{position:absolute;font-size:7px;color:#536466}.header-sensor b{padding:2px 4px;background:#caebe8;color:#337b78;font-weight:400}.collector-sensor{left:4px;top:22px}.distributor-sensor{right:0;top:31px}
.degasser{position:absolute;z-index:5;left:370px;top:375px;width:118px;height:112px;text-align:center}.degasser>img{position:absolute;left:9px;top:0;width:100px;height:88px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(38,61,56,.23))}.degasser span,.water-processor span{position:absolute;font-size:8px;font-weight:600;white-space:nowrap}.degasser span{left:0;right:0;top:82px}.degasser small,.water-processor small{position:absolute;font-size:7px;color:#566967;white-space:nowrap}.degasser small{left:0;right:0;top:95px}.water-processor{position:absolute;z-index:5;left:382px;top:486px;width:150px;height:100px}.water-processor>img{position:absolute;left:0;top:0;width:105px;height:83px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(38,61,56,.22))}.water-processor span{left:95px;top:20px}.water-processor small{left:95px;top:37px}.water-processor small:last-child{top:52px}.water-processor small b{background:#2aa846;color:white;padding:1px 3px}
.pump-bank{position:absolute;z-index:5;top:392px;height:205px}.pump-bank h4{position:absolute;top:0;left:0;font-size:9px;color:#3e5555}.chilled-pumps{left:565px;width:270px}.hot-pumps{left:875px;width:260px}.pump-line{position:absolute;left:0;width:100%;height:60px}.valve-symbol{position:absolute;left:0;top:21px;width:20px;height:15px}.valve-symbol::before,.valve-symbol::after{content:"";position:absolute;width:9px;height:9px;border:2px solid #4b8d4a;transform:rotate(45deg)}.valve-symbol::before{left:0}.valve-symbol::after{right:0}.valve-symbol i{position:absolute;left:8px;top:-8px;width:4px;height:10px;background:#579655}.pump-device{position:absolute;left:27px;top:0;width:91px;height:57px}.pump-device img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(30,58,39,.23))}.pump-device i{position:absolute;right:9px;bottom:4px;width:37px;height:4px;border-radius:50%;background:rgba(37,157,75,.22);filter:blur(4px)}.is-running .pump-device img{animation:pump-breathe 2s ease-in-out infinite}.pump-caption{position:absolute;left:121px;top:6px;width:130px;font-size:7px}.pump-caption strong{display:block;font-size:8px}.pump-caption span{display:inline-block;margin-top:4px;padding:2px 4px;background:#caebe8;color:#347a7a}.pump-caption em{display:inline-block;margin-left:3px;color:#617374;font-style:normal}@keyframes pump-breathe{50%{filter:drop-shadow(3px 4px 3px rgba(30,58,39,.2)) drop-shadow(0 0 4px rgba(47,173,83,.28)) brightness(1.03)}}
.data-chip{position:absolute;z-index:7;display:flex;align-items:center;gap:3px;font-size:7px}.data-chip i{width:14px;height:14px;display:grid;place-items:center;background:#318f56;border:2px solid #d7e8dc;color:white;font-style:normal;font-size:6px}.data-chip b{font-weight:400;color:#377b7a;background:#caebe8;padding:2px 4px}.plant-legend{position:absolute;z-index:8;left:18px;right:18px;bottom:5px;height:22px;display:flex;align-items:center;gap:10px;padding:0 10px;background:rgba(202,210,207,.78);font-size:7px;color:#526261}.plant-legend>b{display:flex;align-items:center;gap:4px;font-weight:400}.plant-legend>em{width:1px;height:12px;background:#a9b6b2}.legend-dot{width:7px;height:7px;border-radius:50%;background:#89928e}.legend-dot.running{background:#4fa928}.legend-dot.fault{background:#c63b42}.legend-line{width:13px;height:3px;background:var(--pipe)}
@media (prefers-reduced-motion:reduce){.plant-canvas *{animation:none!important;transition:none!important}}
</style>
