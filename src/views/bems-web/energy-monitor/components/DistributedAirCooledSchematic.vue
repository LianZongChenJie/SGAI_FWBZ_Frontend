<!-- ===== 分馆风冷 · 各馆风冷群控示意图 ===== -->
<template>
  <div ref="viewportRef" class="schematic-viewport">
    <div class="plant-canvas" :style="canvasStyle">
      <div class="paper-grid"></div>
      <div class="pipe-layer"><div v-for="(pipe, index) in pipes" :key="index" class="pipe" :class="[pipe.kind, pipe.dir, pipe.w > pipe.h ? 'horizontal' : 'vertical']" :style="pipeStyle(pipe)"><i></i></div></div>

      <section v-for="(hall, hallIndex) in halls" :key="hall.id" class="hall-branch" :style="{ left: `${18 + hallIndex * 430}px` }">
        <header><div><span>{{ String(hallIndex + 1).padStart(2, '0') }}</span><h3>{{ hall.name }}</h3></div><p><i :class="{ active: isRunning(`${prefix(hall)}.control.systemEnabled`) }"></i>{{ isRunning(`${prefix(hall)}.control.systemEnabled`) ? '系统运行' : '系统停止' }} · {{ isRunning(`${prefix(hall)}.control.autoMode`) ? '自动群控' : '人工模式' }}</p></header>

        <div class="terminal-load"><strong>{{ hall.name }}空调末端</strong><span>回水 ↓</span><span>供水 ↑</span></div>
        <div class="loop-sensors return-sensors"><b>{{ value(`${prefix(hall)}.loop.returnPressure`, 2) }} MPa</b><b>{{ value(`${prefix(hall)}.loop.returnTemp`, 1) }} ℃</b></div>
        <div class="loop-sensors supply-sensors"><b>{{ value(`${prefix(hall)}.loop.supplyTemp`, 1) }} ℃</b><b>{{ value(`${prefix(hall)}.loop.supplyPressure`, 2) }} MPa</b></div>
        <div class="flow-chip"><i>F</i>{{ value(`${prefix(hall)}.loop.flow`, 1) }} m³/h</div>

        <div v-for="no in 3" :key="no" class="air-unit interactive-device" :class="[runningClass(`${prefix(hall)}.unit.${no}.running`, `${prefix(hall)}.unit.${no}.fault`), motionClass(`distributed.${hall.id}.unit.${no}`)]" :style="{ top: `${50 + (no - 1) * 87}px` }" @click="selectDevice(`distributed.${hall.id}.unit.${no}`)">
          <div class="unit-title"><strong>{{ no }}#风冷机组</strong><span>{{ value(`${prefix(hall)}.unit.${no}.hours`, 1) }} hr</span></div>
          <img src="/equipment/air-cooled-chiller-2_5d.png" alt="风冷机组">
          <div class="port-coupler supply-port" aria-hidden="true"><i></i></div>
          <div class="port-coupler return-port" aria-hidden="true"><i></i></div>
          <div class="fan-motion"><i></i><i></i><i></i></div>
          <div class="unit-state"><b>{{ value(`${prefix(hall)}.unit.${no}.load`, 0) }}%</b><em>{{ value(`${prefix(hall)}.unit.${no}.fanFrequency`, 1) }} Hz</em></div>
        </div>

        <div class="auxiliary-row">
          <div class="aux-device degasser interactive-device" :class="[runningClass(`${prefix(hall)}.degasser.running`, `${prefix(hall)}.degasser.fault`), motionClass(`distributed.${hall.id}.degasser`)]" @click="selectDevice(`distributed.${hall.id}.degasser`)"><img src="/equipment/vacuum-degasser-2_5d.png" alt="真空脱气机"><span>真空脱气机</span><small>液位 {{ value(`${prefix(hall)}.degasser.level`, 0) }}%</small></div>
          <div class="aux-device treatment interactive-device" :class="[runningClass(`${prefix(hall)}.treatment.running`, `${prefix(hall)}.treatment.fault`), motionClass(`distributed.${hall.id}.treatment`)]" @click="selectDevice(`distributed.${hall.id}.treatment`)"><img src="/equipment/water-treatment-2_5d.png" alt="旁通水处理器"><span>旁通水处理</span><small>{{ statusText(`${prefix(hall)}.treatment.running`, `${prefix(hall)}.treatment.fault`) }}</small></div>
        </div>

        <div v-for="no in 2" :key="`pump-${no}`" class="pump-device interactive-device" :class="[runningClass(`${prefix(hall)}.pump.${no}.running`, `${prefix(hall)}.pump.${no}.fault`), motionClass(`distributed.${hall.id}.pump.${no}`)]" :style="{ top: `${374 + (no - 1) * 59}px` }" @click="selectDevice(`distributed.${hall.id}.pump.${no}`)">
          <img src="/equipment/pump-2_5d.png" alt="冷水泵"><div><strong>{{ no }}#冷水泵</strong><span>{{ value(`${prefix(hall)}.pump.${no}.frequency`, 1) }} Hz</span><small>{{ statusText(`${prefix(hall)}.pump.${no}.running`, `${prefix(hall)}.pump.${no}.fault`) }}</small></div>
        </div>

        <div v-if="hall.id !== 'east'" class="makeup-row">
          <div class="makeup-device softener interactive-device" :class="[runningClass(`${prefix(hall)}.makeup.softenerRunning`), motionClass(`distributed.${hall.id}.softener`)]" @click="selectDevice(`distributed.${hall.id}.softener`)"><img src="/equipment/water-softener-2_5d.png" alt="软化水装置"><i class="makeup-coupler inlet"></i><i class="makeup-coupler outlet"></i><span>软化水装置</span></div>
          <div class="makeup-device tank interactive-device" :class="motionClass(`distributed.${hall.id}.tank`)" @click="selectDevice(`distributed.${hall.id}.tank`)"><img src="/equipment/water-tank-2_5d.png" alt="补水箱"><i class="makeup-coupler inlet"></i><i class="makeup-coupler outlet"></i><i class="tank-liquid" :style="{ height: `${tankLevel(hall) * .42}px` }"></i><b>{{ value(`${prefix(hall)}.makeup.tankLevel`, 0) }}%</b><span>补水箱</span></div>
          <div class="makeup-device skid interactive-device" :class="[runningClass(`${prefix(hall)}.makeup.pumpRunning`), motionClass(`distributed.${hall.id}.makeupPump`)]" @click="selectDevice(`distributed.${hall.id}.makeupPump`)"><img src="/equipment/makeup-pump-skid-2_5d.png" alt="定压补水泵组"><i class="makeup-coupler inlet"></i><i class="makeup-coupler outlet"></i><b>{{ value(`${prefix(hall)}.makeup.pressure`, 2) }} MPa</b><span>定压补水泵组</span></div>
        </div>
      </section>

      <div class="topology-note"><b>三套独立水力环路</b><span>绿：场馆末端回水 → 并联水泵 → 风冷机组</span><span>蓝：风冷机组 → 场馆冷冻供水</span></div>
      <div class="plant-legend"><span>设备状态：</span><b><i class="legend-dot stopped"></i>停止</b><b><i class="legend-dot running"></i>运行</b><b><i class="legend-dot fault"></i>故障</b><em></em><span>管路颜色：</span><b><i class="legend-line supply"></i>冷冻供水</b><b><i class="legend-line return"></i>冷冻回水</b><strong>箭头表示实际流向</strong></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({ values: { type: Object, required: true } })
const emit = defineEmits(['select-device'])
const viewportRef = ref(null)
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const motionDeviceId = ref('')
let observer
let motionTimer

const halls = [
  { id: 'east', name: '东会议室' },
  { id: 'hall2', name: '2号馆' },
  { id: 'hall3', name: '3号馆' }
]
const canvasStyle = computed(() => ({ transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})` }))
const pipes = halls.flatMap((hall, hallIndex) => {
  const x = 18 + hallIndex * 430
  const unitYs = [119, 206, 293]
  return [
    // 冷冻回水（绿）：末端向下，经两台并联泵后向上进入三台风冷机组右侧入口。
    { kind: 'return', x: x + 42, y: 101, w: 5, h: 365, dir: 'down' },
    { kind: 'return', x: x + 42, y: 365, w: 86, h: 5, dir: 'right' },
    { kind: 'return', x: x + 42, y: 403, w: 310, h: 5, dir: 'right' },
    { kind: 'return', x: x + 42, y: 462, w: 310, h: 5, dir: 'right' },
    { kind: 'return', x: x + 347, y: 119, w: 5, h: 348, dir: 'up' },
    ...unitYs.map(y => ({ kind: 'return', x: x + 300, y, w: 52, h: 5, dir: 'left' })),
    // 冷冻供水（蓝）：三台机组左侧出口汇入供水立管，再向左、向上送至场馆末端。
    { kind: 'supply', x: x + 180, y: 119, w: 5, h: 213, dir: 'down' },
    ...unitYs.map(y => ({ kind: 'supply', x: x + 180, y, w: 48, h: 5, dir: 'left' })),
    { kind: 'supply', x: x + 84, y: 329, w: 101, h: 5, dir: 'left' },
    { kind: 'supply', x: x + 84, y: 101, w: 5, h: 233, dir: 'up' },
    // 水处理与脱气旁通均取自本馆回水主管并回到本馆回路。
    { kind: 'return', x: x + 43, y: 326, w: 91, h: 4, dir: 'right' },
    { kind: 'return', x: x + 130, y: 326, w: 4, h: 43, dir: 'down' },
    // 独立补水管路（仅 2号馆 / 3号馆保留，东会议室已按需求移除）。
    ...(hall.id !== 'east' ? [
      { kind: 'makeup', x: x, y: 519, w: 22, h: 4, dir: 'right' },
      { kind: 'makeup', x: x + 82, y: 519, w: 11, h: 4, dir: 'right' },
      { kind: 'makeup', x: x + 89, y: 519, w: 4, h: 37, dir: 'down' },
      { kind: 'makeup', x: x + 89, y: 552, w: 14, h: 4, dir: 'right' },
      { kind: 'makeup', x: x + 156, y: 552, w: 15, h: 4, dir: 'right' },
      { kind: 'makeup', x: x + 167, y: 543, w: 4, h: 13, dir: 'up' },
      { kind: 'makeup', x: x + 167, y: 543, w: 18, h: 4, dir: 'right' },
      { kind: 'makeup', x: x + 263, y: 543, w: 89, h: 4, dir: 'right' },
      { kind: 'makeup', x: x + 347, y: 365, w: 5, h: 182, dir: 'up' }
    ] : []),
  ]
})

function prefix(hall) { return `distributed.${hall.id}` }
function point(key) { return props.values[key] ?? '--' }
function value(key, digits = 1) { const numeric = Number(point(key)); return Number.isFinite(numeric) ? numeric.toFixed(digits) : '--' }
function isRunning(key) { return Boolean(point(key)) }
function runningClass(runningKey, faultKey) { return faultKey && isRunning(faultKey) ? 'is-fault' : isRunning(runningKey) ? 'is-running' : 'is-stopped' }
function statusText(runningKey, faultKey) { return faultKey && isRunning(faultKey) ? '故障' : isRunning(runningKey) ? '运行' : '停止' }
function motionClass(id) { return motionDeviceId.value === id ? 'external-motion' : '' }
function selectDevice(id) { emit('select-device', id) }
function tankLevel(hall) { return Math.min(100, Math.max(0, Number(point(`${prefix(hall)}.makeup.tankLevel`)) || 0)) }
function pipeStyle(pipe) { return { left: `${pipe.x}px`, top: `${pipe.y}px`, width: `${pipe.w}px`, height: `${pipe.h}px` } }
function onDeviceMotion(event) {
  const id = event.detail?.deviceId || event.detail?.id
  if (!id?.startsWith('distributed.')) return
  clearTimeout(motionTimer)
  motionDeviceId.value = ''
  requestAnimationFrame(() => {
    motionDeviceId.value = id
    motionTimer = setTimeout(() => { motionDeviceId.value = '' }, Math.max(300, Number(event.detail?.duration) || 900))
  })
}
function fitCanvas() {
  const el = viewportRef.value
  if (!el) return
  // 画布 1320×640：等比适配后整体放大 6%；宽度方向以卡片宽度为上限，画布宽度不超出卡片、居中显示
  const fit = Math.min(el.clientWidth / 1320, el.clientHeight / 640)
  scale.value = Math.max(.35, Math.min(fit * 1.06, el.clientWidth / 1320))
  offsetX.value = (el.clientWidth - 1320 * scale.value) / 2
  offsetY.value = (el.clientHeight - 640 * scale.value) / 2
}

onMounted(() => { observer = new ResizeObserver(fitCanvas); observer.observe(viewportRef.value); window.addEventListener('energy-device-motion', onDeviceMotion); fitCanvas() })
onUnmounted(() => { observer?.disconnect(); clearTimeout(motionTimer); window.removeEventListener('energy-device-motion', onDeviceMotion) })
</script>

<style scoped>
.schematic-viewport{position:absolute;inset:0;overflow:hidden;background:#eef3f2}.plant-canvas{position:absolute;left:0;top:0;width:1320px;height:640px;transform-origin:top left;color:#35484a;font-family:"Microsoft YaHei","PingFang SC",sans-serif}.paper-grid{position:absolute;inset:0;background:linear-gradient(rgba(81,116,118,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(81,116,118,.035) 1px,transparent 1px),radial-gradient(circle at 48% 46%,#fff,#edf2f1);background-size:9px 9px,9px 9px,100% 100%}.hall-branch{position:absolute;z-index:2;top:14px;width:414px;height:584px;border:1px solid rgba(78,111,112,.16);background:linear-gradient(145deg,rgba(255,255,255,.36),rgba(222,232,229,.18));box-shadow:0 6px 18px rgba(57,79,77,.06)}.hall-branch>header{height:34px;padding:0 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(80,111,111,.15);background:rgba(219,228,225,.66)}.hall-branch>header div{display:flex;align-items:center;gap:7px}.hall-branch>header div>span{width:18px;height:18px;display:grid;place-items:center;border:1px solid #77a3a4;color:#3f7b7d;font-size:7px}.hall-branch h3{font-size:13px}.hall-branch header p{font-size:7px;color:#607274}.hall-branch header p i{display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:50%;background:#8d9897}.hall-branch header p i.active{background:#39ac49;box-shadow:0 0 6px #39ac49}.pipe-layer{position:absolute;inset:0;z-index:1}.pipe{position:absolute;background:var(--pipe);border-radius:2px;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pipe) 72%,#314b4a),0 1px 1px rgba(0,0,0,.14)}.pipe.supply,.legend-line.supply{--pipe:#0879d0}.pipe.return,.legend-line.return{--pipe:#51a82f}.pipe.makeup{--pipe:#329f76}.pipe i{position:absolute;width:0;height:0;filter:drop-shadow(0 0 1px white)}.pipe.horizontal.right i{right:40%;top:-3px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid #162c2e;animation:pipe-right 2s linear infinite}.pipe.horizontal.left i{left:40%;top:-3px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:8px solid #162c2e;animation:pipe-left 2s linear infinite}.pipe.vertical.down i{left:-3px;top:40%;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid #162c2e;animation:pipe-down 2s linear infinite}.pipe.vertical.up i{left:-3px;top:55%;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #162c2e;animation:pipe-up 2s linear infinite}.pipe::after{content:"";position:absolute;opacity:.24}.pipe.horizontal::after{left:2px;right:2px;top:1px;height:1px;background:repeating-linear-gradient(90deg,white 0 6px,transparent 6px 15px);animation:water-h 1.3s linear infinite}.pipe.vertical::after{top:2px;bottom:2px;left:1px;width:1px;background:repeating-linear-gradient(180deg,white 0 6px,transparent 6px 15px);animation:water-v 1.3s linear infinite}.pipe.horizontal.left::after,.pipe.vertical.up::after{animation-direction:reverse}@keyframes pipe-right{from{right:88%}to{right:5%}}@keyframes pipe-left{from{left:88%}to{left:5%}}@keyframes pipe-down{from{top:5%}to{top:82%}}@keyframes pipe-up{from{top:82%}to{top:5%}}@keyframes water-h{to{background-position:15px 0}}@keyframes water-v{to{background-position:0 15px}}
.terminal-load{position:absolute;z-index:5;left:8px;top:50px;width:160px;height:42px;padding:6px 8px;border:1px solid rgba(80,117,119,.2);background:rgba(236,242,240,.9)}.terminal-load strong{display:block;font-size:8px}.terminal-load span{display:inline-block;margin:5px 18px 0 0;font-size:7px;color:#4f7375}.terminal-load span:first-of-type{color:#458d3e}.terminal-load span:last-child{color:#237bb1}.loop-sensors{position:absolute;z-index:6;display:flex;flex-direction:column;gap:4px}.loop-sensors b{padding:2px 4px;background:#c9ebe8;color:#347a78;font-size:7px;font-weight:400}.return-sensors{left:4px;top:103px}.supply-sensors{left:93px;top:103px}.flow-chip{position:absolute;z-index:6;left:113px;top:341px;padding:2px 5px;background:#c9ebe8;color:#347a78;font-size:7px}.flow-chip i{margin-right:4px;padding:2px 3px;background:#338c58;color:white;font-style:normal}.interactive-device{cursor:pointer;transform-origin:center;transition:transform .18s ease,filter .18s ease,opacity .18s ease}.interactive-device:hover{z-index:15!important;transform:translateY(-4px) scale(1.03);filter:brightness(1.06) drop-shadow(0 6px 5px rgba(27,68,70,.17))}.interactive-device::after{content:"";position:absolute;z-index:20;right:3px;top:4px;width:6px;height:6px;border:2px solid rgba(255,255,255,.88);border-radius:50%;background:#8b9697}.interactive-device.is-running::after{background:#39b94f;box-shadow:0 0 7px #39b94f}.interactive-device.is-fault::after{background:#d63d46;box-shadow:0 0 8px #d63d46;animation:device-alert 1s infinite}.interactive-device.external-motion{animation:device-nudge .82s cubic-bezier(.2,.75,.3,1)}.is-stopped{filter:saturate(.35);opacity:.68}.is-fault{filter:saturate(.45)}@keyframes device-nudge{0%,100%{transform:translate(0)}22%{transform:translateY(-8px) rotate(-1.2deg) scale(1.035)}45%{transform:translateY(1px) rotate(.7deg)}68%{transform:translateY(-4px) rotate(-.4deg)}}@keyframes device-alert{50%{opacity:.3}}
.air-unit{position:absolute;z-index:4;left:188px;width:150px;height:84px}.air-unit img{position:absolute;left:0;top:10px;width:143px;height:72px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(43,59,54,.21))}.unit-title{position:absolute;z-index:3;left:3px;right:2px;top:0;display:flex;justify-content:space-between;font-size:7px}.unit-title span{color:#617374}.unit-state{position:absolute;z-index:3;left:4px;right:2px;bottom:0;display:flex;justify-content:space-between;font-size:7px}.unit-state b,.unit-state em{padding:1px 4px;background:#c9ebe8;color:#347a78;font-weight:400;font-style:normal}.unit-state b{background:#d7efdd;color:#27814a}.fan-motion{position:absolute;z-index:2;left:34px;top:21px;width:72px;height:21px;display:flex;gap:5px;transform:skewY(-7deg)}.fan-motion i{width:17px;height:17px;border:2px dashed rgba(31,57,51,.58);border-radius:50%}.is-running .fan-motion i{animation:fan-spin 1.1s linear infinite}.is-running .fan-motion i:nth-child(2){animation-duration:1.25s}.is-running .fan-motion i:nth-child(3){animation-duration:1.4s}@keyframes fan-spin{to{transform:rotate(360deg)}}
.auxiliary-row{position:absolute;z-index:5;left:6px;top:262px;width:165px;height:95px;display:flex;gap:4px}.aux-device{position:relative;width:80px;height:91px;text-align:center}.aux-device img{width:76px;height:65px;object-fit:contain;filter:drop-shadow(2px 3px 2px rgba(38,61,56,.2))}.aux-device span{display:block;margin-top:-3px;font-size:7px;font-weight:600}.aux-device small{display:block;margin-top:1px;font-size:6px;color:#5f7373}.pump-device{position:absolute;z-index:5;left:118px;width:190px;height:55px}.pump-device>img{position:absolute;left:0;top:0;width:100px;height:52px;object-fit:contain;filter:drop-shadow(3px 4px 3px rgba(30,58,39,.23))}.is-running.pump-device>img{animation:equipment-breathe 1.8s ease-in-out infinite}.pump-device>div{position:absolute;left:101px;top:7px;font-size:7px}.pump-device strong{display:block;font-size:8px}.pump-device span{display:inline-block;margin-top:4px;padding:2px 4px;background:#c9ebe8;color:#347a78}.pump-device small{display:inline-block;margin-left:3px;color:#2a874c}.makeup-row{position:absolute;z-index:5;left:8px;bottom:15px;width:394px;height:80px;display:flex;align-items:flex-end;gap:10px;border-top:1px solid rgba(65,111,100,.18)}.makeup-device{position:relative;height:76px;text-align:center}.makeup-device img{position:relative;z-index:2;width:100%;height:62px;object-fit:contain;filter:drop-shadow(2px 3px 2px rgba(37,58,51,.2))}.makeup-device span{position:absolute;z-index:5;left:0;right:0;bottom:0;font-size:6px;white-space:nowrap}.makeup-device b{position:absolute;z-index:6;left:50%;top:0;transform:translateX(-50%);padding:1px 3px;background:#c9ebe8;color:#347a78;font-size:6px;font-weight:400;white-space:nowrap}.makeup-device.tank{width:65px}.makeup-device.tank>.tank-liquid{position:absolute;z-index:3;left:21px;right:21px;bottom:17px;max-height:42px;background:linear-gradient(#3cd4e1,#1685bc);opacity:.7;transition:height .8s}.makeup-device.tank b{top:7px}.makeup-device.skid{width:112px}.makeup-device.softener{width:78px}.makeup-coupler{position:absolute;z-index:4;width:12px;height:8px;border-radius:3px;background:#329f76;border-left:3px solid #34765a;border-right:3px solid #34765a;box-shadow:inset 0 1px rgba(255,255,255,.5)}.softener .makeup-coupler{top:14px}.softener .makeup-coupler.inlet{left:3px}.softener .makeup-coupler.outlet{left:67px}.tank .makeup-coupler{top:47px}.tank .makeup-coupler.inlet{left:1px}.tank .makeup-coupler.outlet{left:52px}.skid .makeup-coupler{top:38px}.skid .makeup-coupler.inlet{left:8px}.skid .makeup-coupler.outlet{left:94px}@keyframes equipment-breathe{50%{filter:drop-shadow(3px 4px 3px rgba(30,58,39,.2)) drop-shadow(0 0 5px rgba(47,173,83,.32)) brightness(1.035)}}
.topology-note{position:absolute;z-index:7;left:28px;bottom:31px;display:none}.plant-legend{position:absolute;z-index:8;left:18px;right:18px;bottom:5px;height:22px;display:flex;align-items:center;gap:10px;padding:0 10px;background:rgba(202,210,207,.82);font-size:7px;color:#526261}.plant-legend>b{display:flex;align-items:center;gap:4px;font-weight:400}.plant-legend>em{width:1px;height:12px;background:#a9b6b2}.plant-legend>strong{margin-left:auto;color:#477779;font-weight:500}.legend-dot{width:7px;height:7px;border-radius:50%;background:#89928e}.legend-dot.running{background:#4fa928}.legend-dot.fault{background:#c63b42}.legend-line{width:13px;height:3px;background:var(--pipe)}@media(prefers-reduced-motion:reduce){.plant-canvas *{animation:none!important;transition:none!important}}
.hall-branch{z-index:auto;background:linear-gradient(145deg,rgba(255,255,255,.3),rgba(222,232,229,.13))}.pipe-layer{z-index:3}
.air-unit img{z-index:2}.unit-title,.unit-state{z-index:5}.fan-motion{z-index:3}.port-coupler{position:absolute;z-index:4;top:53px;width:17px;height:8px;border-radius:4px;background:var(--port-color);box-shadow:inset 0 1px rgba(255,255,255,.45),0 1px 2px rgba(30,54,52,.2)}.port-coupler::before,.port-coupler::after{content:"";position:absolute;top:-2px;width:4px;height:12px;border-radius:2px;background:#397356;border:1px solid rgba(35,75,57,.55)}.port-coupler::before{left:0}.port-coupler::after{right:0}.port-coupler i{position:absolute;left:3px;right:3px;top:2px;height:3px;border-top:1px solid rgba(255,255,255,.6)}.supply-port{--port-color:#0879d0;left:25px}.return-port{--port-color:#51a82f;left:111px}
</style>
