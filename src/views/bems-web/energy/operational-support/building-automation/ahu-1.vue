<template>
  <div class="ba-page ahu-1">
    <main>
      <header>
        <h1>{{ deviceName || 'AHU-1 新风机组' }}</h1>
        <button class="panel-toggle" :class="{ active: showPanel }" @click="showPanel = !showPanel">系统参数</button>
      </header>
      <div class="ba-content">
        <section
          class="schematic-card"
          ref="schematicCardRef"
          @wheel.prevent="handleZoom"
          @mousedown.prevent="startPan"
          :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0', cursor: panning ? 'grabbing' : 'grab' }"
        >
          <div class="ba-schematic ahu ahu-1">
          <div class="ahu-wrap device" @click="$emit('select-device','ba.ahu1')">
      <img class="ahu-asset" src="/equipment/ahu-process-v2-2_5d.png" alt="AHU-1 新风机组" />
      <div class="air-stream supply-flow" :class="{ active: isFanRunning() }"><i v-for="x in 12" :key="`s${x}`"></i></div>
      <div class="fan-rotor ahu-supply-rotor" :class="{ running: isFanRunning() }"><i></i></div>
      <!-- <div class="valve-motion ahu-valve" :style="valveStyle(p('ba.ahu1.valve'))"><i></i></div> -->
      <div class="damper-motion ahu-fresh-damper" :class="{ closed: !isFanRunning() }"><i v-for="x in 5" :key="`d${x}`"></i></div>
      <!-- <div class="instrument home-sensor instrument-up" title="回风温湿度"><i>T/H</i></div>
      <div class="instrument home-adjust instrument-up" title="回风阀调节"><i>A</i></div>
      <div class="instrument home-fankui instrument-left" title="回风阀反馈"><i>F</i></div>
      <div class="instrument fresh-sensor" title="新风温湿度"><i>T/H</i></div>
      <div class="instrument supply-sensor" title="送风温湿度"><i>T/H</i></div>
      <div class="instrument co2-instrument instrument-up" title="CO₂传感器"><i>CO₂</i></div>
      <div class="instrument pm25-instrument instrument-up" title="PM2.5传感器"><i>PM</i></div>
      <div class="instrument damper-instrument instrument-up" title="新风阀反馈"><i>V</i></div>
      <div class="instrument filter-switch filter-switch-one" title="初效压差"><i>DP</i></div>
      <div class="instrument filter-switch filter-switch-two" title="中效压差"><i>DP</i></div>
      <div class="instrument frost-switch" title="防冻开关"><i>F</i></div>
      <div class="instrument humidifier-point" title="加湿控制"><i>H</i></div>
      <div class="instrument valve-actuator" title="盘管水阀执行器"><i>V</i></div>
      <div class="instrument supply-water-instrument" title="供水温度"><i>T</i></div>
      <div class="instrument return-water-instrument" title="回水温度"><i>T</i></div>
      <div class="instrument fan-status-instrument" title="送风机状态"><i>F</i></div>
      <div class="instrument fan-fault-instrument" title="送风机故障报警"><i>A</i></div>
      <div class="instrument fan-control-instrument" title="送风机控制"><i>C</i></div>
      <div class="instrument supply-temp-instrument" title="送风温度"><i>T</i></div>
      <div class="instrument supply-humidity-instrument" title="送风湿度"><i>H</i></div> -->
      <!-- <PointBadge class="pt fresh-air" label="新风温湿度" :value="`${n('ba.ahu1.freshTemp',1)}℃ · ${n('ba.ahu1.freshHumidity',1)}%RH`" />
      <PointBadge class="pt fresh-damper" label="新风阀反馈" :value="`${n('ba.ahu1.freshDamper',1)}%`" />
      <PointBadge class="pt filter-one" label="初效" :value="p('ba.ahu1.filter1Alarm')?'报警':'正常'" :alarm="p('ba.ahu1.filter1Alarm')" />
      <PointBadge class="pt filter-two" label="中效" :value="p('ba.ahu1.filter2Alarm')?'报警':'正常'" :alarm="p('ba.ahu1.filter2Alarm')" />
      <PointBadge class="pt valve-point" label="水阀反馈 / 调节" :value="`${n('ba.ahu1.valve',1)}%`" />
      <PointBadge class="pt water-point" label="供 / 回水温度" :value="`${n('ba.ahu1.supplyWaterTemp',1)} / ${n('ba.ahu1.returnWaterTemp',1)}℃`" />
      <PointBadge class="pt frost-point" label="防冻报警" :value="p('ba.ahu1.frostAlarm')?'报警':'正常'" :alarm="p('ba.ahu1.frostAlarm')" />
      <PointBadge class="pt humid-point" label="加湿控制" :value="p('ba.ahu1.humidifier')?'开':'关'" />
      <PointBadge class="pt fan-point" label="送风机状态 / 频率" :value="`${p('ba.ahu1.running')?'运行':'停止'} · ${n('ba.ahu1.fanFrequency',1)}Hz`" :alarm="p('ba.ahu1.fault')" />
      <PointBadge class="pt supply-air" label="送风温湿度" :value="`${n('ba.ahu1.supplyTemp',1)}℃ · ${n('ba.ahu1.supplyHumidity',1)}%RH`" /> -->
      <PointBadge class="pt return-damper-control" label="回风阀调节" :value="getParamValue('回风阀控制')" />
      <PointBadge class="pt return-damper-fb" label="回风阀反馈" :value="getParamValue('回风阀反馈')" />
      <PointBadge class="pt fresh-air-temp" label="新风温度" :value="getParamValue('新风温度')" />
      <PointBadge class="pt fresh-air-humidity" label="新风湿度" :value="getParamValue('新风湿度')" />
      <PointBadge class="pt fresh-damper-fb" label="新风阀反馈" :value="getParamValue('新风阀')" />
      <PointBadge class="pt co2-sensor" label="CO₂传感器" :value="getParamValue('二氧化碳')" />
      <PointBadge class="pt pm25-sensor" label="PM2.5传感器" :value="getParamValue('PM2.5')" />
      <PointBadge class="pt return-air-temp" label="回风温度" :value="getParamValue('回风温度')" />
      <PointBadge class="pt return-air-humidity" label="回风湿度" :value="getParamValue('回风湿度')" />
      <PointBadge class="pt filter-one-fb" label="初效" :value="getParamValue('初效')" />
      <PointBadge class="pt filter-two-fb" label="中效" :value="getParamValue('中效')" />
      <PointBadge class="pt frost-alarm" label="防冻报警" :value="getParamValue('防冻报警')" />
      <PointBadge class="pt valve-control-fb" label="水阀控制" :value="getParamValue('水阀控制')" />
      <PointBadge class="pt valve-feedback-fb" label="水阀反馈" :value="getParamValue('水阀开度反馈')" />
      <PointBadge class="pt humidifier-fb" label="加湿控制" :value="getParamValue('湿膜加湿')" />
      <PointBadge class="pt supply-water-temp" label="供水温度" :value="getParamValue('供水温度')" />
      <PointBadge class="pt return-water-temp" label="回水温度" :value="getParamValue('回水温度')" />
      <PointBadge class="pt fan-status" label="送风机状态" :value="getParamValue('送风机运行状态')" />
      <PointBadge class="pt fan-fault" label="送风机故障报警" :value="getParamValue('送风机故障')" />
      <PointBadge class="pt fan-control" label="送风机控制" :value="getParamValue('送风机启停控制')" />
      <PointBadge class="pt fan-auto" label="送风机手自动" :value="getParamValue('送风机/自动')" />
      <PointBadge class="pt fan-freq-fb" label="送风机频率反馈" :value="getParamValue('送风机频率反馈')" />
      <PointBadge class="pt fan-freq-adj" label="送风机频率调节" :value="getParamValue('送风机频率控制')" />
      <PointBadge class="pt supply-air-temp" label="送风温度" :value="getParamValue('送风温度')" />
      <PointBadge class="pt supply-air-humidity" label="送风湿度" :value="getParamValue('送风湿度')" />
          </div>
        </div>
      </section>
        <aside class="system-panel" v-show="showPanel">
          <header>系统参数</header>
          <div v-for="item in displaySystemParams" :key="item.code || item.configId">
            <span>{{ item.label }}</span>
            <strong>{{ formatParam(item) }}</strong>
          </div>
        </aside>
      </div>
      <!-- 缩放控制栏 -->
      <div class="zoom-controls">
        <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
        <button class="zoom-btn" @click="zoomOutFn">−</button>
        <button class="zoom-btn" @click="zoomInFn">+</button>
        <button class="zoom-btn" @click="resetZoom">重置</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import PointBadge from './components/PointBadge.vue'
import { createHelpers } from './components/utils.js'
import { formatSystemParam } from './components/systemParamFormat.js'
import { BUILDING_AUTOMATION_POINTS, BUILDING_AUTOMATION_DEFAULTS } from '../data/buildingAutomationPoints.js'

const props = defineProps({
  values: { type: Object, default: () => reactive({ ...BUILDING_AUTOMATION_DEFAULTS }) },
  systemParams: { type: Array, default: () => [] },
  deviceName: { type: String, default: '' }
})
defineEmits(['select-device'])

const showPanel = ref(false)

// === 缩放与平移 ===
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const panning = ref(false)
const schematicCardRef = ref(null)
let panStartX = 0
let panStartY = 0
let panOriginX = 0
let panOriginY = 0

const handleZoom = (e) => {
  if (!schematicCardRef.value) return
  const rect = schematicCardRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const oldZoom = zoom.value
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.min(3, Math.max(0.5, +(oldZoom + delta).toFixed(2)))
  if (newZoom === oldZoom) return
  const ratio = newZoom / oldZoom
  panX.value = mouseX - (mouseX - panX.value) * ratio
  panY.value = mouseY - (mouseY - panY.value) * ratio
  zoom.value = newZoom
}
const zoomInFn = () => { zoom.value = Math.min(3, +(zoom.value + 0.2).toFixed(2)) }
const zoomOutFn = () => { zoom.value = Math.max(0.5, +(zoom.value - 0.2).toFixed(2)) }
const startPan = (e) => {
  panning.value = true
  panStartX = e.clientX
  panStartY = e.clientY
  panOriginX = panX.value
  panOriginY = panY.value
  window.addEventListener('mousemove', onPan)
  window.addEventListener('mouseup', stopPan)
}
const onPan = (e) => {
  if (!panning.value) return
  panX.value = panOriginX + (e.clientX - panStartX)
  panY.value = panOriginY + (e.clientY - panStartY)
}
const stopPan = () => {
  panning.value = false
  window.removeEventListener('mousemove', onPan)
  window.removeEventListener('mouseup', stopPan)
}
const resetZoom = () => { zoom.value = 1; panX.value = 0; panY.value = 0 }

const prefix = 'ba.ahu1'
const { p, n, valveStyle } = createHelpers(props.values)

const devicePoints = computed(() => BUILDING_AUTOMATION_POINTS.filter(pt => pt.key.startsWith(prefix + '.')))
const running = computed(() => Boolean(props.values[`${prefix}.running`] ?? props.values[`${prefix}.fanEnable`]))
const fault = computed(() => Boolean(props.values[`${prefix}.fault`]))
const stateText = computed(() => fault.value ? '故障' : running.value ? '运行' : '停止')
const stateTone = computed(() => fault.value ? 'fault' : running.value ? 'running' : 'stopped')

/** 当接口返回了系统参数数组时优先使用，否则回退到默认点位 */
const displaySystemParams = computed(() => {
  return props.systemParams && props.systemParams.length > 0 ? props.systemParams : devicePoints.value.slice(-6)
})

/** 从系统参数数组中按 label 关键词查找对应项并格式化值 */
function getParamValue(keyword) {
  if (!props.systemParams || props.systemParams.length === 0) return '--'
  // 模糊匹配：系统参数项的 label 包含关键词
  const item = props.systemParams.find((it) => it.label && it.label.includes(keyword))
  if (!item) return '--'
  return formatSystemParam(item)
}

/** 判断送风机是否运行（送风机运行状态=运行 或 送风机启停控制=开） */
function isFanRunning() {
  return isParamValueIncludes('送风机运行状态', '运行') || isParamOn('送风机启停')
}

/** 判断指定关键词的参数是否为开启状态 */
function isParamOn(keyword) {
  if (!props.systemParams || props.systemParams.length === 0) return false
  const item = props.systemParams.find((it) => it.label && it.label.includes(keyword))
  if (!item) return false
  const str = String(item.value)
  return str === '1' || str === 'true' || str.includes('开') || str.includes('运行')
}

/** 判断指定关键词的参数值是否包含指定文本 */
function isParamValueIncludes(keyword, text) {
  if (!props.systemParams || props.systemParams.length === 0) return false
  const item = props.systemParams.find((it) => it.label && it.label.includes(keyword))
  if (!item) return false
  return String(item.value).includes(text)
}

function formatParam(item) {
  return formatSystemParam(item)
}
</script>

<style scoped>
.ba-page{height:100%;display:flex;flex-direction:column;overflow:hidden;background:#06131d;color:#d9eaf3;font-family:"DIN Alternate","PingFang SC","Microsoft YaHei",sans-serif}
main{flex:1;min-height:0;display:flex;flex-direction:column;padding:0;position:relative;background:radial-gradient(circle at 45% 42%,#123148,#07141e 62%)}
main>header{flex-shrink:0;height:44px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(78,141,167,.25);background:rgba(8,35,50,.6)}
main>header h1{margin:0;font-size:16px;font-weight:600;color:#d9eaf3}
.panel-toggle{border:1px solid #3d8197;background:rgba(13,48,65,.8);color:#80c7d1;border-radius:4px;cursor:pointer;font-size:14px;padding:4px 10px;transition:all .2s}
.panel-toggle:hover{color:#48dfa8;border-color:#48dfa8}
.panel-toggle.active{color:#48dfa8;border-color:#48dfa8;background:rgba(72,223,168,.1)}
.ba-content{flex:1;min-height:0;display:flex;gap:0;overflow:hidden}
.schematic-card{flex:1;min-width:0;position:relative;overflow:hidden;border:1px solid rgba(78,141,167,.25);background:linear-gradient(rgba(63,117,142,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(63,117,142,.05) 1px,transparent 1px),rgba(5,20,30,.55);background-size:18px 18px;will-change:transform}
.system-panel{flex-shrink:0;width:222px;max-height:600px;height:600px;border:1px solid #234b5e;background:#08202e;overflow-y:auto;overflow-x:hidden;z-index:50;position:relative}
.system-panel header{height:29px;padding:8px 10px;border-bottom:1px solid #285267;background:#0d3041;color:#80c7d1;font-size:10px;position:sticky;top:0;z-index:2}
.system-panel>div{height:34px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(52,91,109,.28);font-size:10px}
.system-panel span{color:#6d8c9d}
.system-panel strong{color:#d6e8f0}
@media(max-width:1050px){.system-panel{display:none}.schematic-card{flex:1}}

.ba-schematic{position:absolute;inset:0;overflow:hidden;color:#bcd3df;background:linear-gradient(rgba(53,108,132,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(53,108,132,.05) 1px,transparent 1px);background-size:18px 18px}
.device{cursor:pointer;transition:.2s}
.device:hover{filter:brightness(1.2);transform:translateY(-4px)}
.ahu-wrap{position:absolute;left:1%;right:auto;top:8%;bottom:auto;width:100%;aspect-ratio:1.72;overflow:hidden}
.ahu-asset{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.air-stream{position:absolute;display:flex;align-items:center;gap:12px;pointer-events:none;opacity:0;overflow:hidden}
.air-stream i{position:relative;flex:0 0 34px;width:34px;height:13px;border:0;border-top:2px solid #8bf7f1;border-radius:50%;transform:none;filter:drop-shadow(0 0 4px #30e7e2)}
.air-stream i::after{content:"";position:absolute;right:-1px;top:-4px;width:6px;height:6px;border:solid #8bf7f1;border-width:2px 2px 0 0;transform:rotate(45deg)}
.air-stream.active{opacity:.85}
.air-stream.active i{animation:windCurve 1.8s linear infinite}
.air-stream.active i:nth-child(2n){animation-delay:-.9s;opacity:.65}
.supply-flow{left:21%;right:10%;top:49%;height:24px;transform: rotate(3deg);}
.fan-rotor{position:absolute;width:27px;height:27px;border-radius:50%;pointer-events:none}
.fan-rotor i{position:absolute;inset:8%;border:2px solid rgba(90,236,202,.42);background:repeating-conic-gradient(from 0deg,rgba(83,244,203,.92) 0 13deg,transparent 13deg 42deg);-webkit-mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%);mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%)}
.fan-rotor.running i{animation:spin .7s linear infinite;filter:drop-shadow(0 0 6px #34e1ba)}
.ahu-supply-rotor{right:23.5%;top:49.5%}
.valve-motion{position:absolute;width:30px;height:30px;border:3px solid #d5a542;border-radius:50%;pointer-events:none}
.valve-motion i{position:absolute;left:47%;top:-20%;width:3px;height:140%;background:#ffe075;transform:rotate(var(--open));transition:transform .7s ease;transform-origin:center}
.ahu-valve{left:51.5%;top:67%}
.damper-motion{position:absolute;display:flex;justify-content:space-around;pointer-events:none}
.damper-motion i{width:3px;background:#62d9df;transform:rotate(var(--open,42deg));transform-origin:center;transition:transform .65s ease,background .3s}
.damper-motion.closed i{transform:rotate(5deg);background:#ff9477}
.ahu-fresh-damper{left:22%;top:44%;width:7%;height:8%}
.instrument{position:absolute;z-index:8;width:17px;height:22px;border-radius:5px 5px 2px 2px;background:linear-gradient(#48c9ee,#17658d);border:1px solid #76e7ff;box-shadow:0 0 8px rgba(57,209,245,.55);pointer-events:none}
.instrument::after{content:"";position:absolute;left:7px;top:21px;width:2px;height:15px;background:#45b7d8}
.instrument i{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:5px;font-style:normal;color:#eaffff}
.fresh-sensor{left:28%;top:48%}
.supply-sensor{left:83%;top:53%}
.instrument-up{border-radius:2px 2px 5px 5px}
.instrument-up::after{top:-15px;left:7px}
.instrument-left{border-radius:2px 3px 3px 2px}
.instrument-left::after{top:4px;left:-15px;width:15px;height:2px}
.home-sensor{left:50%;top:20%}
.home-adjust{left:35%;top:27%}
.home-fankui{left:35%;top:36%}
.co2-instrument{left:42%;top:20%}
.pm25-instrument{left:68%;top:21%}
.damper-instrument{left:22%;top:45%}
.filter-switch{width:14px;height:14px;border-radius:50%;background:#324d58;border-color:#f3c958;box-shadow:0 0 6px rgba(243,201,88,.5)}
.filter-switch::after{top:13px;left:6px;height:10px;background:#f3c958}
.filter-switch-one{left:39.5%;top:47%}
.filter-switch-two{left:45%;top:47%}
.frost-switch{left:58%;top:48%;background:#375b66}
.humidifier-point{left:64%;top:48%;background:#286f78}
.valve-actuator{left:52%;top:65%;background:#a67725;border-color:#ffd76b}
.supply-water-instrument{left:46%;top:80%;background:#1a6b5a;border-color:#5fd9a0}
.return-water-instrument{left:54%;top:80%;background:#5a3a1a;border-color:#d9a05f}
.fan-status-instrument{left:76%;top:45%;background:#1a4a6b;border-color:#5fa0d9}
.fan-fault-instrument{left:76%;top:55%;background:#5a1a1a;border-color:#d95f5f}
.fan-control-instrument{left:76%;top:65%;background:#3a1a5a;border-color:#a05fd9}
.supply-temp-instrument{left:86%;top:48%;background:#1a6b5a;border-color:#5fd9a0}
.supply-humidity-instrument{left:86%;top:58%;background:#1a4a5a;border-color:#5fd9d9}
.pt{position:absolute;z-index:10}
.fresh-air-temp{left:29%;top:56%}
.fresh-air-humidity{left:21%;top:56%}
.fresh-damper-fb{left:18%;top:30%}
.return-damper-control{left:26%;top:20%}
.return-damper-fb{left:26%;top:30%}
.co2-sensor{left:40%;top:5%}
.pm25-sensor{left:65%;top:6%}
.return-air-temp{left:48%;top:-1%}
.return-air-humidity{left:48%;top:8%}
.filter-one-fb{left:39%;top:35%}
.filter-two-fb{left:44%;top:35%}
.valve-control-fb{left:49%;top:36%}
.valve-feedback-fb{left:49%;top:26%}
.humidifier-fb{left:59%;top:37%}
.supply-water-temp{left:44%;top:55%}
.return-water-temp{left:44%;top:65%}
.frost-alarm{left:56%;top:55%}
.fan-status{left:70%;top:28%}
.fan-fault{left:70%;top:60%}
.fan-control{left:70%;top:38%}
.fan-auto{left:70%;top:70%}
.fan-freq-fb{left:80%;top:28%}
.fan-freq-adj{left:80%;top:38%}
.supply-air-temp{left:83%;top:60%}
.supply-air-humidity{left:83%;top:70%}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes windCurve{0%{transform:translateX(-46px) scaleX(.8);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(46px) scaleX(1.1);opacity:0}}

.zoom-controls{position:absolute;bottom:12px;right:12px;display:flex;align-items:center;gap:4px;padding:6px 12px;background:rgba(8,35,50,.95);border:1px solid rgba(78,141,167,.25);border-radius:6px;z-index:20}
.zoom-btn{border:1px solid #3d8197;background:rgba(13,48,65,.8);color:#80c7d1;border-radius:4px;cursor:pointer;font-size:14px;line-height:1;padding:5px 10px;transition:all .2s}
.zoom-btn:hover{color:#48dfa8;border-color:#48dfa8;background:rgba(72,223,168,.1)}
.zoom-label{font-size:14px;color:#80c7d1;min-width:40px;text-align:center}
</style>
