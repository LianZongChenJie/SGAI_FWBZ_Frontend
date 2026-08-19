<!-- ===== 集中水冷 · 冷源群控示意图 ===== -->
<template>
  <div ref="viewportRef" class="schematic-viewport">
    <div class="plant-canvas" :style="canvasStyle">
      <div class="paper-grid"></div>

      <section class="setting-panel public-settings">
        <h4>群控公共参数</h4>
        <div class="setting-grid">
          <span>软故障复位 <b>复位</b></span><span>加机判断延时 <b>{{ value('control.addJudgeDelay', 1) }} min</b></span>
          <span>加机负荷设定 <b>{{ value('control.addLoadSetpoint', 1) }} %</b></span><span>减机负荷设定 <b>{{ value('control.removeLoadSetpoint', 1) }} %</b></span>
          <span>加机温度偏差 <b>{{ value('control.addTempDelta', 1) }} ℃</b></span><span>减机温度偏差 <b>{{ value('control.removeTempDelta', 1) }} ℃</b></span>
          <span>冷冻泵开延时 <b>{{ value('control.chwPumpStartDelay', 1) }} min</b></span><span>冷冻泵关延时 <b>{{ value('control.chwPumpStopDelay', 1) }} min</b></span>
          <span>冷却泵开延时 <b>{{ value('control.cwPumpStartDelay', 1) }} min</b></span><span>冷却泵关延时 <b>{{ value('control.cwPumpStopDelay', 1) }} min</b></span>
        </div>
      </section>
      <section class="setting-panel chiller-settings">
        <h4>冷机群控参数</h4>
        <div class="setting-grid">
          <span>系统总启停 <b :class="{ active: isRunning('control.systemEnabled') }">{{ isRunning('control.systemEnabled') ? '已启动' : '已停止' }}</b></span><span>输出启动数量 <b>{{ value('control.outputCount', 0) }}</b></span>
          <span>启动数量模式 <b>{{ textValue('control.startMode') }}</b></span><span>强制设定数量 <b>{{ value('control.forceCount', 0) }}</b></span>
          <span>冷机启动顺序 <b>{{ textValue('control.startOrder') }}</b></span><span>冷机设定排序 <b>{{ textValue('control.chillerOrder') }}</b></span>
        </div>
      </section>
      <div class="ambient-readouts">
        <span>室外温度 <b>{{ value('station.outdoorTemp', 1) }} ℃</b></span>
        <span>室外湿度 <b>{{ value('station.outdoorHumidity', 1) }} %</b></span>
        <span>湿球温度 <b>{{ value('station.wetBulbTemp', 1) }} ℃</b></span>
      </div>

      <div class="pipe-layer">
        <div v-for="(pipe, index) in pipes" :key="index" class="pipe" :class="[pipe.kind, pipe.dir, pipe.w > pipe.h ? 'horizontal' : 'vertical', { 'riser': pipe.riser }]" :style="pipeStyle(pipe)">
          <i v-if="pipe.dir && !pipe.riser"></i>
          <b v-if="pipe.cap"></b>
        </div>
      </div>

      <div class="tower-bank equipment-zone">
        <div v-for="no in 4" :key="no" class="cooling-tower interactive-device" :class="[runningClass(`tower.${no}.running`, `tower.${no}.fault`), motionClass(`water.tower.${no}`)]" :data-device-id="`water.tower.${no}`" :style="{ left: `${(no - 1) * 108}px` }" @click="selectDevice(`water.tower.${no}`)">
          <img src="/equipment/cooling-tower-2_5d.png" alt="冷却塔">
          <div class="tower-fan-motion"><i></i></div>
          <div class="device-caption"><strong>{{ no }}#冷却塔</strong><em>{{ value(`tower.${no}.frequency`, 1) }} Hz</em></div>
          <div class="tower-value">{{ value('loop.cwSupplyTemp', 1) }} ℃</div>
        </div>
      </div>

      <section class="header-vessels">
        <div class="header-unit collector interactive-device is-normal" :class="motionClass('water.collector')" data-device-id="water.collector" @click="selectDevice('water.collector')">
          <img class="header-vessel-image" src="/equipment/header-vessel-2_5d.png" alt="集水器">
          <span class="header-vessel-name">集水器</span>
        </div>
        <div class="header-unit distributor interactive-device is-normal" :class="motionClass('water.distributor')" data-device-id="water.distributor" @click="selectDevice('water.distributor')">
          <img class="header-vessel-image" src="/equipment/header-vessel-2_5d.png" alt="分水器">
          <span class="header-vessel-name">分水器</span>
        </div>
        <div class="header-sensor supply-sensor">冷冻回水 <b>{{ value('loop.chwReturnPressure', 2) }} MPa</b> <b>{{ value('station.returnTemp', 1) }} ℃</b></div>
        <div class="header-sensor return-sensor">冷冻供水 <b>{{ value('loop.chwSupplyPressure', 2) }} MPa</b> <b>{{ value('station.supplyTemp', 1) }} ℃</b></div>
      </section>

      <div class="water-processor chilled-processor interactive-device" :class="[runningClass('treatment.chilledRunning', 'treatment.chilledFault'), motionClass('water.treatment.chilled')]" data-device-id="water.treatment.chilled" @click="selectDevice('water.treatment.chilled')">
        <img src="/equipment/water-treatment-2_5d.png" alt="冷冻水全程水处理器">
        <span>全程水处理器</span><small>运行状态 <b>{{ isRunning('treatment.chilledRunning') ? '运行' : '停止' }}</b></small><small>故障报警 {{ isRunning('treatment.chilledFault') ? '故障' : '正常' }}</small>
      </div>
      <div class="water-processor cooling-processor interactive-device" :class="[runningClass('treatment.coolingRunning', 'treatment.coolingFault'), motionClass('water.treatment.cooling')]" data-device-id="water.treatment.cooling" @click="selectDevice('water.treatment.cooling')">
        <img src="/equipment/water-treatment-2_5d.png" alt="冷却水全程水处理器">
        <span>全程水处理器</span><small>运行状态 <b>{{ isRunning('treatment.coolingRunning') ? '运行' : '停止' }}</b></small><small>故障报警 {{ isRunning('treatment.coolingFault') ? '故障' : '正常' }}</small>
      </div>
      <div class="dosing-device interactive-device" :class="[runningClass('dosing.running', 'dosing.fault'), motionClass('water.dosing')]" data-device-id="water.dosing" @click="selectDevice('water.dosing')"><img src="/equipment/dosing-skid-2_5d.png" alt="加药装置"><span>加药装置</span><small>{{ isRunning('dosing.fault') ? '故障' : (isRunning('dosing.running') ? '运行正常' : '已停止') }}</small></div>

      <section class="chw-pump-bank pump-bank">
        <div v-for="no in 3" :key="no" class="pump-line interactive-device" :class="[runningClass(`chwPump.${no}.running`, `chwPump.${no}.fault`), motionClass(`water.chwPump.${no}`)]" :data-device-id="`water.chwPump.${no}`" :style="{ top: `${(no - 1) * 108}px` }" @click="selectDevice(`water.chwPump.${no}`)">
          <div class="meter-chip">{{ value('loop.chwSupplyPressure', 2) }} MPa</div>
          <div class="valve-symbol"><i></i></div>
          <div class="inline-pump"><img src="/equipment/pump-2_5d.png" alt="冷冻水泵"><i></i></div>
          <div class="line-caption"><span>{{ no }}#冷冻泵</span><b>{{ value(`chwPump.${no}.frequency`, 1) }} Hz</b><em>{{ isRunning(`chwPump.${no}.running`) ? '群控可用' : '停止' }}</em></div>
        </div>
      </section>

      <section class="chiller-bank">
        <div v-for="no in 3" :key="no" class="chiller-line interactive-device" :class="[runningClass(`chiller.${no}.running`, `chiller.${no}.fault`), motionClass(`water.chiller.${no}`)]" :data-device-id="`water.chiller.${no}`" :style="{ top: `${(no - 1) * 108}px` }" @click="selectChiller(no)">
          <div class="chiller-machine"><img src="/equipment/chiller-2_5d.png" alt="离心式冷水机组"><i class="running-glow"></i></div>
          <div class="chiller-label"><strong>{{ no }}#冷水机组</strong><span>{{ value(`chiller.${no}.hours`, 1) }} hr</span><em>{{ isRunning(`chiller.${no}.running`) ? '群控可用' : '停止' }}</em></div>
          <div class="chiller-load"><b>{{ value(`chiller.${no}.load`, 0) }}%</b><b>{{ value(`chiller.${no}.power`, 1) }} kW</b></div>
        </div>
      </section>

      <section class="cw-pump-bank pump-bank">
        <div v-for="no in 3" :key="no" class="pump-line interactive-device" :class="[runningClass(`cwPump.${no}.running`, `cwPump.${no}.fault`), motionClass(`water.cwPump.${no}`)]" :data-device-id="`water.cwPump.${no}`" :style="{ top: `${(no - 1) * 108}px` }" @click="selectDevice(`water.cwPump.${no}`)">
          <div class="meter-chip">{{ value('loop.cwPressure', 2) }} MPa</div>
          <div class="valve-symbol"><i></i></div>
          <div class="inline-pump"><img src="/equipment/pump-2_5d.png" alt="冷却水泵"><i></i></div>
          <div class="line-caption"><span>{{ no }}#冷却泵</span><b>{{ value(`cwPump.${no}.frequency`, 1) }} Hz</b><em>{{ isRunning(`cwPump.${no}.running`) ? '群控可用' : '停止' }}</em></div>
        </div>
      </section>

      <section class="makeup-system">
        <div class="softener interactive-device" :class="[runningClass('makeup.softenerRunning'), motionClass('water.softener')]" data-device-id="water.softener" @click="selectDevice('water.softener')"><img src="/equipment/water-softener-2_5d.png" alt="软化水装置"><span>软化水装置</span></div>
        <div class="makeup-tank interactive-device is-normal" :class="motionClass('water.tank')" data-device-id="water.tank" :style="{ '--level': tankLevel }" @click="selectDevice('water.tank')"><img src="/equipment/water-tank-2_5d.png" alt="补水箱"><div class="tank-liquid-window"></div><span>补水箱</span><em>液位 {{ value('makeup.tankLevel', 0) }}%</em></div>
        <div class="makeup-pumps interactive-device" :class="[runningClass('makeup.pumpRunning'), motionClass('water.makeupPump')]" data-device-id="water.makeupPump" @click="selectDevice('water.makeupPump')"><img src="/equipment/makeup-pump-skid-2_5d.png" alt="定压补水泵组"><span>定压补水泵</span><em>压力 {{ value('makeup.pressure', 2) }} MPa</em></div>
      </section>

      <aside class="control-panel">
        <h4>冷却塔群控参数</h4>
        <span>逼近度设定值 <b>{{ value('towerControl.approachSetpoint', 1) }} ℃</b></span><span>设定温度高限 <b>{{ value('towerControl.highTempLimit', 1) }} ℃</b></span><span>设定温度低限 <b>{{ value('towerControl.lowTempLimit', 1) }} ℃</b></span><span>加塔延时设定 <b>{{ value('towerControl.addDelay', 1) }} min</b></span><span>减塔延时设定 <b>{{ value('towerControl.removeDelay', 1) }} min</b></span><span>冷却塔高频 <b>{{ value('towerControl.highFrequency', 1) }} Hz</b></span><span>冷却塔低频 <b>{{ value('towerControl.lowFrequency', 1) }} Hz</b></span>
      </aside>

      <div v-for="chip in chips" :key="chip.label" class="data-chip" :style="{ left: `${chip.x}px`, top: `${chip.y}px` }"><i>{{ chip.icon }}</i><b>{{ chip.label }}</b></div>

      <div class="plant-legend">
        <span>设备状态：</span><b><i class="legend-dot stopped"></i>停止</b><b><i class="legend-dot running"></i>运行</b><b><i class="legend-dot fault"></i>故障</b>
        <em></em><span>管路颜色：</span><b><i class="legend-line chw-supply"></i>冷冻水供水</b><b><i class="legend-line chw-return"></i>冷冻水回水</b><b><i class="legend-line cw-return"></i>冷却水供水</b><b><i class="legend-line cw-supply"></i>冷却水回水</b>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({ values: { type: Object, required: true } })
const emit = defineEmits(['select-chiller', 'select-device'])

const viewportRef = ref(null)
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
let observer
let motionTimer
const motionDeviceId = ref('')

const canvasStyle = computed(() => ({ transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})` }))

const pipes = [
  // 集水器上方四根回水立管（末端 → 集水器），riser/cap 保持原 vertical-risers 样式
  { kind:'chw-return',x:65,y:280,w:5,h:78,dir:'down',riser:true,cap:true },
  { kind:'chw-return',x:88,y:280,w:5,h:68,dir:'down',riser:true,cap:true },
  { kind:'chw-return',x:110,y:280,w:5,h:64,dir:'down',riser:true,cap:true },
  { kind:'chw-return',x:133,y:280,w:5,h:61,dir:'down',riser:true,cap:true },
  // 集水器四根立管顶部横管（绿色），连接四根回水立管
  { kind:'chw-return',x:17,y:280,w:147,h:5,dir:'right',riser:true },
  { kind:'chw-return',x:162,y:280,w:5,h:27,dir:'down',riser:true},

  // 分水器上方四根供水立管（分水器 → 末端），与集水器同样可配置
  { kind:'chw-supply',x:212,y:288,w:5,h:70,dir:'down',riser:true,cap:true },
  { kind:'chw-supply',x:235,y:288,w:5,h:60,dir:'down',riser:true,cap:true },
  { kind:'chw-supply',x:258,y:288,w:5,h:56,dir:'down',riser:true,cap:true },
  { kind:'chw-supply',x:280,y:288,w:5,h:53,dir:'down',riser:true,cap:true },
  // 分水器四根立管顶部横管（蓝色），连接四根供水立管
  { kind:'chw-supply',x:212,y:288,w:73,h:5,dir:'right',riser:true },

  // 集水器右口 → 分水器左口连接斜线（绿色），dx/dy 为终点相对起点的偏移
  { kind:'chw-return',x:155,y:355,dx:30,dy:25,h:4,dir:'right',riser:true,slant:true },
  // 冷冻回水：末端 → 集水器 → 冷冻泵 → 冷机蒸发器（绿色）
  { kind:'chw-return',x:17,y:280,w:5,h:105,dir:'down' },
  { kind:'chw-return',x:17,y:380,w:24,h:5,dir:'right' },
  // 集水器右端出水先上翻再进入泵组总管，明确绕开分水器
  // { kind:'chw-return',x:162,y:303,w:5,h:56,dir:'up' },
  { kind:'chw-return',x:162,y:303,w:215,h:5,dir:'right' },
  { kind:'chw-return',x:377,y:303,w:5,h:233,dir:'down' },
  { kind:'chw-return',x:377,y:315,w:263,h:5,dir:'right' },
  { kind:'chw-return',x:377,y:423,w:263,h:5,dir:'right' },
  { kind:'chw-return',x:377,y:531,w:263,h:5,dir:'right' },
  // 冷冻供水：冷机蒸发器 → 分水器 → 末端（蓝色）
  { kind:'chw-supply',x:557,y:240,w:5,h:320,dir:'up' },
  { kind:'chw-supply',x:557,y:340,w:83,h:5,dir:'left' },
  { kind:'chw-supply',x:557,y:448,w:83,h:5,dir:'left' },
  { kind:'chw-supply',x:557,y:556,w:83,h:5,dir:'left' },
  { kind:'chw-supply',x:320,y:240,w:240,h:5,dir:'left' },
  { kind:'chw-supply',x:320,y:240,w:5,h:117,dir:'down' },
  { kind:'chw-supply',x:300,y:354,w:25,h:5,dir:'left' },
  // 冷却回水：冷机冷凝器 → 冷却塔上部布水（橙色热水）
  { kind:'cw-supply',x:842,y:340,w:91,h:5,dir:'right' },
  { kind:'cw-supply',x:842,y:448,w:91,h:5,dir:'right' },
  { kind:'cw-supply',x:842,y:556,w:91,h:5,dir:'right' },
  { kind:'cw-supply',x:928,y:220,w:5,h:341,dir:'up' },
  // 橙色冷却回水串接加药装置，两端管线止于设备法兰
  { kind:'cw-supply',x:928,y:220,w:80,h:5,dir:'right' },
  { kind:'cw-supply',x:1107,y:220,w:163,h:5,dir:'right' },
  { kind:'cw-supply',x:1265,y:22,w:5,h:203,dir:'up' },
  { kind:'cw-supply',x:870,y:22,w:400,h:5,dir:'left' },
  { kind:'cw-supply',x:870,y:22,w:5,h:72,dir:'down' },
  { kind:'cw-supply',x:978,y:22,w:5,h:72,dir:'down' },
  { kind:'cw-supply',x:1086,y:22,w:5,h:72,dir:'down' },
  { kind:'cw-supply',x:1194,y:22,w:5,h:72,dir:'down' },
  // 冷却供水：冷却塔集水盘 → 冷却泵 → 冷机冷凝器（黄色冷水）
  { kind:'cw-return',x:870,y:151,w:379,h:5,dir:'right' },
  { kind:'cw-return',x:870,y:130,w:5,h:26,dir:'down' },
  { kind:'cw-return',x:978,y:130,w:5,h:26,dir:'down' },
  { kind:'cw-return',x:1086,y:130,w:5,h:26,dir:'down' },
  { kind:'cw-return',x:1194,y:130,w:5,h:26,dir:'down' },
  { kind:'cw-return',x:1244,y:151,w:5,h:384,dir:'down' },
  { kind:'cw-return',x:842,y:315,w:407,h:5,dir:'left' },
  { kind:'cw-return',x:842,y:423,w:407,h:5,dir:'left' },
  { kind:'cw-return',x:842,y:531,w:407,h:5,dir:'left' },
  // 补水管（软化水装置 → 补水箱 → 定压补水泵）
  { kind:'makeup',x:44,y:572,w:338,h:4,dir:'right' },
  { kind:'makeup',x:377,y:530,w:3,h:45,dir:'up' },
  // 冷冻水全程水处理器旁通：回水主管取水 → 处理器 → 回到回水主管
  { kind:'chw-return',x:377,y:257,w:4,h:50,dir:'up' },
  // { kind:'chw-return',x:324,y:257,w:57,h:4,dir:'left' },
  { kind:'chw-return',x:396,y:257,w:32,h:4,dir:'right' },
  { kind:'chw-return',x:424,y:257,w:4,h:58,dir:'down' },
  { kind:'chw-return',x:377,y:311,w:51,h:4,dir:'left' },
  // 冷却水处理器旁通：黄色供水主管取水 → 处理器 → 回到主管
  { kind:'cw-return',x:1178,y:303,w:71,h:4,dir:'left' },
  { kind:'cw-return',x:1088,y:303,w:8,h:4,dir:'left' },
  { kind:'cw-return',x:1088,y:303,w:4,h:16,dir:'down' },
  { kind:'cw-return',x:1088,y:315,w:161,h:4,dir:'right' },
  // 补水泵出口接入冷冻回水总管
  { kind:'makeup',x:362,y:550,w:15,h:4,dir:'right' }
]

const chips = computed(() => [
  { x:560,y:235,icon:'P',label:`${value('loop.chwSupplyPressure',2)} MPa` },
  { x:566,y:342,icon:'T',label:`${value('station.supplyTemp',1)} ℃` },
  { x:356,y:485,icon:'F',label:`${value('loop.chwFlow',1)} m³/h` },
  { x:888,y:214,icon:'T',label:`${value('loop.cwReturnTemp',1)} ℃` },
  { x:1090,y:293,icon:'P',label:`${value('loop.cwPressure',2)} MPa` },
  { x:1190,y:158,icon:'L',label:`${value('tower.basinLevel',2)} m` }
])

function point(key) { return props.values[key] ?? '--' }
const tankLevel = computed(() => Math.min(100, Math.max(0, Number(point('makeup.tankLevel')) || 0)))
function textValue(key) { return String(point(key) ?? '--') }
function value(key, digits = 1) {
  const number = Number(point(key))
  return Number.isFinite(number) ? number.toFixed(digits) : '--'
}
function isRunning(key) { return Boolean(point(key)) }
function runningClass(key, faultKey) { return faultKey && isRunning(faultKey) ? 'is-fault' : isRunning(key) ? 'is-running' : 'is-stopped' }
function motionClass(id) { return motionDeviceId.value === id ? 'external-motion' : '' }
function selectDevice(id) { emit('select-device', id) }
function selectChiller(no) { emit('select-chiller', no); selectDevice(`water.chiller.${no}`) }
function onDeviceMotion(event) {
  const id = event.detail?.deviceId || event.detail?.id
  if (!id?.startsWith('water.')) return
  clearTimeout(motionTimer)
  motionDeviceId.value = ''
  requestAnimationFrame(() => {
    motionDeviceId.value = id
    motionTimer = setTimeout(() => { motionDeviceId.value = '' }, Math.max(300, Number(event.detail?.duration) || 900))
  })
}
function pipeStyle(pipe) {
  // 斜线：以起点为中心旋转的细长矩形，dx/dy 决定长度与角度
  if (pipe.slant) {
    const length = Math.hypot(pipe.dx, pipe.dy)
    const angle = Math.atan2(pipe.dy, pipe.dx) * 180 / Math.PI
    return { left:`${pipe.x}px`, top:`${pipe.y - (pipe.h / 2)}px`, width:`${length}px`, height:`${pipe.h}px`, transform:`rotate(${angle}deg)`, transformOrigin:'left center' }
  }
  return { left:`${pipe.x}px`, top:`${pipe.y}px`, width:`${pipe.w}px`, height:`${pipe.h}px` }
}

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
.schematic-viewport{position:absolute;inset:0;overflow:hidden;background:#eef3f2}.plant-canvas{position:absolute;left:0;top:0;width:1320px;height:640px;transform-origin:top left;color:#34464a;font-family:"Microsoft YaHei","PingFang SC",sans-serif}.paper-grid{position:absolute;inset:0;background:linear-gradient(rgba(81,116,118,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(81,116,118,.035) 1px,transparent 1px),radial-gradient(circle at 45% 45%,#fff,#edf2f1);background-size:9px 9px,9px 9px,100% 100%}
.interactive-device{cursor:pointer;transform-origin:center;transition:transform .18s ease,filter .18s ease,opacity .18s ease;outline:none}.interactive-device:hover{z-index:12!important;transform:translateY(-4px) scale(1.025);filter:brightness(1.06) drop-shadow(0 6px 5px rgba(27,68,70,.18))}.interactive-device::after{content:"";position:absolute;z-index:20;right:4px;top:4px;width:7px;height:7px;border:2px solid rgba(255,255,255,.85);border-radius:50%;background:#2a9ed1;box-shadow:0 0 7px rgba(42,158,209,.8)}.interactive-device.is-running::after{background:#39b94f;box-shadow:0 0 8px #39b94f}.interactive-device.is-stopped::after{background:#8b9697;box-shadow:none}.interactive-device.is-fault::after{background:#d63d46;box-shadow:0 0 9px #d63d46;animation:device-alert 1s infinite}.interactive-device.external-motion{animation:device-nudge .82s cubic-bezier(.2,.75,.3,1)}.is-fault{filter:saturate(.55)}.is-fault img{filter:drop-shadow(0 0 7px rgba(214,61,70,.5))}@keyframes device-nudge{0%,100%{transform:translate(0)}22%{transform:translateY(-8px) rotate(-1.2deg) scale(1.035)}45%{transform:translateY(1px) rotate(.7deg)}68%{transform:translateY(-4px) rotate(-.4deg)}}@keyframes device-alert{50%{opacity:.3}}
.setting-panel{position:absolute;z-index:7;top:14px;padding:10px 12px;background:rgba(213,221,219,.86);box-shadow:0 1px 5px rgba(38,63,65,.13);border:1px solid rgba(107,132,131,.18)}.setting-panel h4{font-size:13px;margin:0 0 7px;color:#263b3d}.public-settings{left:18px;width:330px}.chiller-settings{left:362px;width:300px}.setting-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 8px}.setting-grid span{display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#46595b;white-space:nowrap}.setting-grid b{min-width:55px;padding:2px 5px;text-align:center;background:rgba(255,255,255,.72);border:1px solid rgba(91,116,116,.15);font-weight:400;color:#506265}.setting-grid b.active{color:#168441;background:#dff4e6}.ambient-readouts{position:absolute;z-index:6;left:700px;top:55px;display:flex;flex-direction:column;gap:7px}.ambient-readouts span{font-size:8px;color:#506467}.ambient-readouts b{display:inline-block;margin-left:7px;padding:2px 7px;background:#d0f0ed;color:#297d7e;font-weight:400}
.pipe-layer{position:absolute;inset:0;z-index:1}.pipe{position:absolute;background:var(--pipe);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pipe) 70%,#314b4a),0 1px 1px rgba(0,0,0,.15);border-radius:2px}.pipe.chw-supply,.legend-line.chw-supply{--pipe:#0879d0}.pipe.chw-return,.legend-line.chw-return{--pipe:#51a82f}.pipe.cw-supply,.legend-line.cw-supply{--pipe:#d87319}.pipe.cw-return,.legend-line.cw-return{--pipe:#d0bd00}.pipe.makeup{--pipe:#329f76}.pipe i{position:absolute;width:0;height:0;filter:drop-shadow(0 0 1px white)}.pipe.riser{box-shadow:none;border-radius:0;background:var(--pipe)}.pipe.riser::after{display:none}.pipe.riser>b{position:absolute;top:12px;left:-4px;width:11px;height:8px;background:#439849;border:2px solid #dde9df}.pipe.horizontal.right i{right:28%;top:-3px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid #152b2d}.pipe.horizontal.left i{left:28%;top:-3px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:8px solid #152b2d}.pipe.vertical.down i{left:-3px;top:45%;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid #152b2d}.pipe.vertical.up i{left:-3px;top:38%;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #152b2d}
.tower-bank{position:absolute;left:805px;top:39px;width:440px;height:145px;z-index:3}.cooling-tower{position:absolute;top:0;width:88px;height:138px}.tower-valve{position:absolute;left:33px;top:-10px;width:20px;height:15px}.tower-valve::before,.tower-valve::after{content:"";position:absolute;top:5px;width:8px;height:8px;background:#4ba947;transform:rotate(45deg)}.tower-valve::before{left:1px}.tower-valve::after{right:1px}.tower-valve i{position:absolute;left:8px;top:-4px;width:4px;height:8px;background:#548b55}.tower-fan{position:absolute;left:10px;top:12px;width:65px;height:14px;border:1px solid #477c55;border-bottom:0;background:#d6e2d5}.tower-fan i{position:absolute;left:26px;top:1px;width:10px;height:10px;border:2px dotted #2b8f43;border-radius:50%}.is-running .tower-fan i{animation:fan-spin 1.2s linear infinite}.tower-shell{position:absolute;left:8px;top:26px;width:70px;height:62px;padding:10px 8px;background:linear-gradient(135deg,#2f8c4b,#176134);border:1px solid #34794a;clip-path:polygon(8% 0,92% 0,100% 100%,0 100%);box-shadow:inset 8px 0 12px rgba(255,255,255,.08),2px 3px 4px rgba(31,62,49,.18)}.tower-shell span{display:block;height:2px;margin:4px 0;background:rgba(5,62,30,.35)}.tower-shell b{position:absolute;left:29px;top:19px;color:#b5d333;font-size:19px}.tower-feet{position:absolute;left:15px;top:88px;width:56px;display:flex;justify-content:space-between}.tower-feet i{width:5px;height:9px;background:#416f4c}.device-caption{position:absolute;top:96px;width:88px;text-align:center}.device-caption strong{display:block;font-size:8px}.device-caption em{display:block;font-size:7px;font-style:normal;color:#687b7b;margin-top:2px}.tower-value{position:absolute;top:124px;left:14px;padding:2px 5px;background:#cbecea;color:#347879;font-size:7px}.is-stopped{filter:grayscale(.6);opacity:.72}@keyframes fan-spin{to{transform:rotate(360deg)}}
.header-vessels{position:absolute;left:33px;top:285px;width:285px;height:162px;z-index:3}.header-unit{position:absolute;top:50px;width:132px}.collector{left:0}.distributor{right:0}.vertical-risers{position:absolute;left:18px;top:-49px;width:94px;display:flex;justify-content:space-between}.vertical-risers>i{width:4px;height:51px;background:#62a74d;position:relative}.vertical-risers>i:nth-child(2){background:#d0bd00}.vertical-risers>i:nth-child(3){background:#d87319}.vertical-risers>i:nth-child(4){background:#0879d0}.vertical-risers b{position:absolute;top:12px;left:-4px;width:11px;height:8px;background:#439849;border:2px solid #dde9df}.vessel{height:42px;border:1px solid #8b9995;border-radius:21px;background:linear-gradient(#c7cfcb,#aeb9b5);box-shadow:inset 0 8px 10px rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;color:#3d4d4e;font-size:9px}.vessel>i{position:absolute;width:14px;height:30px;border:1px solid #8c9995;border-radius:50%}.vessel>i:first-child{left:8px}.vessel>i:last-child{right:8px}.vessel-feet{display:flex;justify-content:space-around}.vessel-feet i{width:5px;height:12px;background:#9ba7a3}.header-sensor{position:absolute;font-size:7px;color:#536466}.header-sensor b{padding:2px 4px;background:#caebe8;color:#337b78;font-weight:400}.supply-sensor{left:6px;top:17px}.return-sensor{right:0;top:26px}
.water-processor{position:absolute;z-index:4;width:126px;height:92px;color:#44585a}.water-processor>img{position:absolute;left:0;top:0;width:86px;height:73px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(38,61,56,.21))}.water-processor span,.water-processor small{position:absolute;left:78px;white-space:nowrap}.water-processor span{top:17px;font-size:8px;font-weight:600}.water-processor small{top:33px;font-size:7px}.water-processor small:last-child{top:47px}.water-processor small b{background:#2aa846;color:white;padding:1px 3px}.chilled-processor{left:324px;top:219px}.cooling-processor{left:1092px;top:245px}.dosing-device{position:absolute;z-index:4;left:1007px;top:174px;width:101px;height:80px;text-align:center}.dosing-device>img{position:absolute;left:2px;top:0;width:96px;height:69px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(38,61,56,.21))}.dosing-device span{position:absolute;left:0;right:0;top:58px;font-size:8px;font-weight:600}.dosing-device small{position:absolute;left:0;right:0;top:70px;font-size:7px;color:#596a6b}
.pump-bank{position:absolute;z-index:4;top:286px;height:300px}.chw-pump-bank{left:408px;width:196px}.cw-pump-bank{left:982px;width:164px}.pump-line{position:absolute;left:0;width:100%;height:83px}.meter-chip{position:absolute;left:0;top:-8px;padding:2px 4px;background:#caebe8;color:#337b78;font-size:7px}.valve-symbol{position:absolute;left:28px;top:18px;width:20px;height:16px}.valve-symbol::before,.valve-symbol::after{content:"";position:absolute;width:10px;height:10px;border:2px solid #4b8d4a;transform:rotate(45deg)}.valve-symbol::before{left:0}.valve-symbol::after{right:0}.valve-symbol i{position:absolute;left:8px;top:-8px;width:4px;height:10px;background:#579655}.inline-pump{position:absolute;left:55px;top:11px;width:51px;height:29px;border:2px solid #397849;border-radius:17px 7px 7px 17px;background:linear-gradient(#55a760,#2f8247)}.inline-pump::before{content:"";position:absolute;left:10px;top:5px;width:15px;height:15px;border:2px solid #2f7040;border-radius:50%}.inline-pump i{position:absolute;right:-8px;top:8px;width:9px;height:10px;background:#347444}.inline-pump b{position:absolute;left:19px;top:-8px;width:13px;height:9px;background:#4a9857}.is-running .inline-pump::before{animation:fan-spin 1s linear infinite;border-style:dashed}.line-caption{position:absolute;left:112px;top:0;width:82px}.line-caption span{display:block;font-size:8px}.line-caption b{display:block;font-size:7px;color:#347a7a;font-weight:400;margin-top:4px}.line-caption em{display:inline-block;font-size:7px;font-style:normal;color:#228343;background:#d9efdf;padding:1px 3px;margin-top:3px}.is-stopped .line-caption em{color:#667777;background:#e0e5e3}
.chiller-bank{position:absolute;z-index:4;left:630px;top:278px;width:250px;height:310px}.chiller-line{position:absolute;left:0;width:245px;height:94px;cursor:pointer}.chiller-machine{position:absolute;left:12px;top:16px;width:128px;height:47px;display:flex;align-items:center}.chiller-head{width:25px;height:35px;border:2px solid #3f7945;border-radius:18px 4px 4px 18px;background:#4d9b56}.chiller-head i{display:block;width:13px;height:13px;border:2px dashed #2f713b;border-radius:50%;margin:9px 0 0 5px}.chiller-barrel{height:41px;flex:1;border:2px solid #3e7743;background:linear-gradient(#5ba866,#3e8b4c);position:relative;display:grid;place-items:center}.chiller-barrel::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 12px,rgba(26,93,43,.18) 13px)}.chiller-barrel span{position:absolute;left:4px;right:4px;top:7px;height:3px;background:#347840}.chiller-barrel b{font-size:8px;color:#dcebdd}.chiller-motor{width:38px;height:32px;border:2px solid #376f41;border-radius:4px 14px 14px 4px;background:#4d9b57;position:relative}.chiller-motor i{position:absolute;left:7px;top:-10px;width:18px;height:10px;background:#43884d}.chiller-feet{position:absolute;left:21px;right:10px;bottom:0;display:flex;justify-content:space-between}.chiller-feet i{width:14px;height:5px;background:#3b7142}.chiller-label{position:absolute;left:0;top:-3px;width:230px;display:flex;gap:8px;font-size:8px}.chiller-label strong{font-weight:500}.chiller-label span{color:#617374}.chiller-label em{font-style:normal;color:#258546;background:#dcf0e0;padding:1px 4px}.chiller-load{position:absolute;left:145px;top:34px}.chiller-load b{display:block;color:#357c79;background:#caebe8;padding:2px 5px;font-size:7px;font-weight:400;margin:3px}.is-stopped .chiller-load b{color:#6b7775;background:#e0e5e3}
.makeup-system{position:absolute;z-index:4;left:48px;top:507px;width:350px;height:96px}.softener{position:absolute;left:-10px;top:12px;width:86px;height:75px}.softener>img{position:absolute;left:0;top:0;width:86px;height:68px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(38,61,56,.22))}.softener span,.makeup-tank span,.makeup-pumps span{position:absolute;bottom:0;white-space:nowrap;font-size:7px}.softener span{left:18px}.makeup-tank{position:absolute;left:104px;top:0;width:83px;height:81px;border:1px solid #669398;background:linear-gradient(90deg,rgba(146,201,208,.35),rgba(221,240,240,.55));overflow:visible}.makeup-tank i{position:absolute;inset:6px;border-radius:50%;border-top:2px solid #85afb2}.makeup-tank>b{position:absolute;left:2px;right:2px;bottom:2px;max-height:74px;background:rgba(81,170,183,.35)}.makeup-tank span{left:25px;bottom:-13px}.makeup-tank em{position:absolute;left:8px;top:-13px;font-style:normal;font-size:7px;color:#397b7e;background:#caebe8;padding:2px 4px}.makeup-pumps{position:absolute;left:219px;top:5px;width:116px;height:79px}.makeup-pumps>img{position:absolute;left:0;top:0;width:116px;height:70px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(30,58,39,.24))}.makeup-pumps span{left:31px;bottom:-1px}.makeup-pumps em{position:absolute;left:24px;top:-5px;font-style:normal;font-size:7px;color:#397b7e;background:#caebe8;padding:2px 4px}
.control-panel{position:absolute;z-index:6;right:14px;top:328px;width:143px;padding:9px;background:rgba(205,213,210,.88);box-shadow:0 1px 4px rgba(46,66,64,.18)}.control-panel h4{font-size:10px;margin-bottom:7px;text-align:center}.control-panel span{display:flex;justify-content:space-between;font-size:7px;margin:5px 0;color:#526160}.control-panel b{min-width:48px;padding:2px 3px;background:rgba(255,255,255,.72);font-weight:400;text-align:center}.data-chip{position:absolute;z-index:7;display:flex;align-items:center;gap:3px;font-size:7px}.data-chip i{width:14px;height:14px;display:grid;place-items:center;background:#318f56;border:2px solid #d7e8dc;color:white;font-style:normal;font-size:6px}.data-chip b{font-weight:400;color:#377b7a;background:#caebe8;padding:2px 4px}
.plant-legend{position:absolute;z-index:7;left:18px;right:18px;bottom:5px;height:22px;display:flex;align-items:center;gap:10px;padding:0 10px;background:rgba(202,210,207,.72);font-size:7px;color:#526261}.plant-legend>b{display:flex;align-items:center;gap:4px;font-weight:400}.plant-legend em{width:1px;height:12px;background:#a9b6b2}.legend-dot{width:7px;height:7px;border-radius:50%;background:#89928e}.legend-dot.running{background:#4fa928}.legend-dot.fault{background:#c63b42}.legend-line{width:13px;height:3px;background:var(--pipe)}

/* 2.5D 主设备素材：保留设备真实接口，管路延伸到图像下层形成接管效果 */
.header-unit{top:42px;width:138px;height:84px}.header-vessel-image{position:absolute;left:-4px;top:-9px;width:146px;height:96px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(48,69,66,.22))}.header-vessel-name{position:absolute;left:0;right:0;bottom:-7px;text-align:center;font-size:8px;font-weight:600;color:#3d5050;text-shadow:0 1px white}.header-unit .vertical-risers{left:23px;top:-39px;width:91px}.header-unit .vertical-risers>i{height:48px}.header-unit:hover .header-vessel-image{filter:drop-shadow(3px 4px 3px rgba(48,69,66,.2)) drop-shadow(0 0 4px rgba(42,143,111,.26))}
.makeup-tank{border:0;background:none;width:88px;height:84px;overflow:visible}.makeup-tank>img{position:absolute;z-index:1;left:-2px;top:-15px;width:92px;height:100px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(43,68,72,.23))}.tank-liquid-window{position:absolute;z-index:2;left:18px;right:18px;bottom:13px;height:calc(var(--level) * .58px);max-height:58px;min-height:1px;background:linear-gradient(90deg,rgba(0,132,205,.72),rgba(55,222,236,.82),rgba(0,122,194,.72));clip-path:polygon(5% 0,95% 0,100% 100%,0 100%);opacity:.78;box-shadow:inset 0 0 7px rgba(212,251,255,.66);transition:height .9s cubic-bezier(.22,.8,.35,1);overflow:visible}.tank-liquid-window::before{content:"";position:absolute;left:0;right:0;top:-4px;height:8px;border-radius:50%;background:rgba(115,239,248,.95);border:1px solid rgba(11,109,166,.65);box-shadow:inset 0 2px 3px rgba(255,255,255,.75),0 0 4px rgba(34,196,224,.45)}.tank-liquid-window::after{content:"";position:absolute;left:-35%;top:-2px;width:55%;height:3px;border-radius:50%;background:rgba(255,255,255,.86);animation:tank-wave 2.2s ease-in-out infinite alternate}.makeup-tank span{left:28px;bottom:-13px}.makeup-tank em{left:10px;top:-17px;z-index:3;font-weight:600}.makeup-tank:hover .tank-liquid-window{filter:saturate(1.18)}@keyframes tank-wave{to{left:75%}}
.cooling-tower>img{position:absolute;left:-4px;top:7px;width:100px;height:116px;object-fit:contain;filter:drop-shadow(4px 6px 4px rgba(35,60,48,.23))}.cooling-tower.is-running>img{filter:drop-shadow(4px 6px 4px rgba(35,60,48,.2)) drop-shadow(0 0 5px rgba(52,155,82,.22))}.tower-fan-motion{position:absolute;left:33px;top:17px;width:31px;height:17px;border-radius:50%;transform:skewY(-7deg);overflow:hidden;opacity:.85}.tower-fan-motion i{position:absolute;inset:2px;border:2px dashed rgba(222,238,220,.9);border-radius:50%}.is-running .tower-fan-motion i{animation:fan-spin .85s linear infinite}.device-caption{top:112px;text-shadow:0 1px white}.tower-value{top:138px}.tower-bank{height:160px}
.chiller-machine{position:absolute;left:-4px;top:10px;width:218px;height:86px;display:block}.chiller-machine img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(4px 5px 3px rgba(34,61,43,.25))}.chiller-machine .running-glow{position:absolute;left:22px;right:18px;bottom:8px;height:8px;border-radius:50%;background:rgba(42,181,85,.2);filter:blur(6px);animation:equipment-breathe 1.8s ease-in-out infinite}.is-stopped .chiller-machine .running-glow{display:none}.chiller-label{z-index:2;top:-5px}.chiller-load{z-index:2;left:179px;top:52px}.chiller-line:hover .chiller-machine img{filter:drop-shadow(4px 5px 3px rgba(34,61,43,.2)) drop-shadow(0 0 5px rgba(42,163,79,.34))}
.inline-pump{position:absolute;left:42px;top:-2px;width:105px;height:72px;border:0;border-radius:0;background:none;overflow:visible}.inline-pump img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(30,58,39,.24))}.inline-pump::before{display:none}.inline-pump i{right:10px;left:auto;top:54px;width:42px;height:5px;border-radius:50%;background:rgba(37,157,75,.2);filter:blur(4px)}.is-running .inline-pump img{animation:equipment-breathe 1.8s ease-in-out infinite}.chw-pump-bank .line-caption{left:145px}.cw-pump-bank .inline-pump{left:19px}.cw-pump-bank .line-caption{left:120px}.cw-pump-bank .valve-symbol{left:4px}.cw-pump-bank .meter-chip{left:-3px;top:-10px}
@keyframes equipment-breathe{0%,100%{filter:drop-shadow(3px 4px 3px rgba(30,58,39,.24)) brightness(1)}50%{filter:drop-shadow(3px 4px 3px rgba(30,58,39,.2)) drop-shadow(0 0 5px rgba(47,173,83,.32)) brightness(1.035)}}

/* 流向动画：箭头沿每段管路按供回水方向移动 */
.pipe.horizontal.right i{animation:pipe-right 1.7s linear infinite}.pipe.horizontal.left i{animation:pipe-left 1.7s linear infinite}.pipe.vertical.down i{animation:pipe-down 1.7s linear infinite}.pipe.vertical.up i{animation:pipe-up 1.7s linear infinite}.pipe::after{content:"";position:absolute;opacity:.28;border-radius:inherit}.pipe.horizontal::after{left:2px;right:2px;top:1px;height:1px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.95) 0 7px,transparent 7px 16px);animation:water-h 1s linear infinite}.pipe.vertical::after{top:2px;bottom:2px;left:1px;width:1px;background:repeating-linear-gradient(180deg,rgba(255,255,255,.95) 0 7px,transparent 7px 16px);animation:water-v 1s linear infinite}.pipe.horizontal.left::after,.pipe.vertical.up::after{animation-direction:reverse}
@keyframes pipe-right{from{right:90%}to{right:5%}}@keyframes pipe-left{from{left:90%}to{left:5%}}@keyframes pipe-down{from{top:5%}to{top:84%}}@keyframes pipe-up{from{top:84%}to{top:5%}}@keyframes water-h{to{background-position:16px 0}}@keyframes water-v{to{background-position:0 16px}}
</style>
