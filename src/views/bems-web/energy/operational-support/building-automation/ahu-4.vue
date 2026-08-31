<template>
  <div class="ba-page ahu-4">
    <main>
      <header>
        <div>
          <h1>{{ deviceName || 'AHU-4 转轮新风机组' }}</h1>
        </div>
      </header>
      <section class="schematic-card">
        <div class="ba-schematic ahu-rotary ahu-4">
          <div class="ahu-wrap device ahu-rotary" @click="$emit('select-device','ba.ahu4')">
            <img class="ahu-asset" src="/equipment/ahu-rotary-v2-2_5d.png" alt="AHU-4 转轮新风机组" />
            <div class="air-stream supply-flow" :class="{ active: p('ba.ahu4.running') }"><i v-for="x in 12" :key="`s${x}`"></i></div>
            <div class="air-stream return-flow" :class="{ active: p('ba.ahu4.running') }"><i v-for="x in 8" :key="`r${x}`"></i></div>
            <div class="air-stream exhaust-flow" :class="{ active: p('ba.ahu4.exhaustRunning') }"><i v-for="x in 5" :key="`e${x}`"></i></div>
            <div class="fan-rotor ahu-supply-rotor" :class="{ running: p('ba.ahu4.running') }"><i></i></div>
            <div class="fan-rotor ahu-exhaust-rotor" :class="{ running: p('ba.ahu4.exhaustRunning') }"><i></i></div>
            <div class="rotary-motion" :class="{ running: p('ba.ahu4.rotaryRunning') }"><i></i></div>
            <div class="valve-motion ahu-valve" :style="valveStyle(p('ba.ahu4.valve'))"><i></i></div>
            <div class="damper-motion ahu-fresh-damper" :style="valveStyle(p('ba.ahu4.freshDamper'))"><i v-for="x in 5" :key="`d${x}`"></i></div>
            <div class="instrument fresh-sensor" title="新风温湿度"><i>T/H</i></div>
            <div class="instrument return-co2-sensor" title="回风CO₂"><i>CO₂</i></div>
            <div class="instrument return-th-sensor" title="回风温湿度"><i>T/H</i></div>
            <div class="instrument return-pm-sensor" title="回风PM2.5"><i>PM</i></div>
            <div class="instrument supply-sensor" title="送风温湿度"><i>T/H</i></div>
            <div class="instrument filter-switch filter-switch-one" title="初效压差"><i>DP</i></div>
            <div class="instrument filter-switch filter-switch-two" title="中效压差"><i>DP</i></div>
            <div class="instrument frost-switch" title="防冻开关"><i>F</i></div>
            <div class="instrument humidifier-point" title="加湿控制"><i>H</i></div>
            <div class="instrument valve-actuator" title="盘管水阀执行器"><i>V</i></div>
            <PointBadge class="pt fresh-air" label="新风温湿度" :value="`${n('ba.ahu4.freshTemp',1)}℃ · ${n('ba.ahu4.freshHumidity',1)}%RH`" />
            <PointBadge class="pt fresh-damper" label="新风阀反馈" :value="`${n('ba.ahu4.freshDamper',1)}%`" />
            <PointBadge class="pt filter-one" label="初效" :value="p('ba.ahu4.filter1Alarm')?'报警':'正常'" :alarm="p('ba.ahu4.filter1Alarm')" />
            <PointBadge class="pt filter-two" label="中效" :value="p('ba.ahu4.filter2Alarm')?'报警':'正常'" :alarm="p('ba.ahu4.filter2Alarm')" />
            <PointBadge class="pt valve-point" label="水阀反馈 / 调节" :value="`${n('ba.ahu4.valve',1)}%`" />
            <PointBadge class="pt water-point" label="供 / 回水温度" :value="`${n('ba.ahu4.supplyWaterTemp',1)} / ${n('ba.ahu4.returnWaterTemp',1)}℃`" />
            <PointBadge class="pt frost-point" label="防冻报警" :value="p('ba.ahu4.frostAlarm')?'报警':'正常'" :alarm="p('ba.ahu4.frostAlarm')" />
            <PointBadge class="pt humid-point" label="加湿控制" :value="p('ba.ahu4.humidifier')?'开':'关'" />
            <PointBadge class="pt fan-point" label="送风机状态 / 频率" :value="`${p('ba.ahu4.running')?'运行':'停止'} · ${n('ba.ahu4.fanFrequency',1)}Hz`" :alarm="p('ba.ahu4.fault')" />
            <PointBadge class="pt supply-air" label="送风温湿度" :value="`${n('ba.ahu4.supplyTemp',1)}℃ · ${n('ba.ahu4.supplyHumidity',1)}%RH`" />
            <PointBadge class="pt return-temp" label="回风温湿度" :value="`${n('ba.ahu4.returnTemp',1)}℃ · ${n('ba.ahu4.returnHumidity',1)}%RH`" />
            <PointBadge class="pt return-data" label="回风 CO₂" :value="`${n('ba.ahu4.co2',0)} ppm`" />
            <PointBadge class="pt pm-point" label="回风 PM2.5" :value="`${n('ba.ahu4.pm25',1)} μg/m³`" />
            <PointBadge class="pt exhaust-point" label="排风机状态 / 频率" :value="`${p('ba.ahu4.exhaustRunning')?'运行':'停止'} · ${n('ba.ahu4.exhaustFrequency',1)}Hz`" :alarm="p('ba.ahu4.exhaustFault')" />
            <PointBadge class="pt rotary-point" label="转轮状态 / 频率" :value="`${p('ba.ahu4.rotaryRunning')?'运行':'停止'} · ${n('ba.ahu4.rotarySpeed',1)}Hz`" />
          </div>
        </div>
      </section>
      <aside class="system-panel">
        <header>系统参数</header>
        <div v-for="item in displaySystemParams" :key="item.code || item.configId">
          <span>{{ item.label }}</span>
          <strong>{{ formatParam(item) }}</strong>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
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

const prefix = 'ba.ahu4'
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

function formatParam(item) {
  return formatSystemParam(item)
}
</script>

<style scoped>
.ba-page{height:100%;display:flex;flex-direction:column;overflow:hidden;background:#06131d;color:#d9eaf3;font-family:"DIN Alternate","PingFang SC","Microsoft YaHei",sans-serif}
main{flex:1;min-height:0;position:relative;padding:14px 16px 42px;background:radial-gradient(circle at 45% 42%,#123148,#07141e 62%)}
main>header{height:60px;display:flex;align-items:flex-start;justify-content:space-between}
main>header small{font-size:6px;letter-spacing:2px;color:#3d8197}
h1{margin-top:3px;font-size:18px}
main>header p{margin-top:3px;color:#597a8e;font-size:8px}
.headline{display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid #1d4355;background:#092333;font-size:7px}
.headline strong{padding:3px 7px}
.running{color:#48dfa8!important}
.stopped{color:#869ba7!important;filter:saturate(.45)}
.fault{color:#ff7968!important}
.schematic-card{position:absolute;left:16px;right:250px;top:77px;bottom:14px;overflow:hidden;border:1px solid rgba(78,141,167,.25);background:linear-gradient(rgba(63,117,142,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(63,117,142,.05) 1px,transparent 1px),rgba(5,20,30,.55);background-size:18px 18px}
.system-panel{position:absolute;right:16px;top:77px;bottom:14px;width:222px;padding-bottom:8px;border:1px solid #234b5e;background:#08202e;overflow-y:auto;overflow-x:hidden}
.system-panel header{height:29px;padding:8px 10px;border-bottom:1px solid #285267;background:#0d3041;color:#80c7d1;font-size:8px;position:sticky;top:0;z-index:2}
.system-panel>div{height:34px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(52,91,109,.28);font-size:8px}
.system-panel span{color:#6d8c9d}
.system-panel strong{color:#d6e8f0}
@media(max-width:1050px){.schematic-card{right:16px}.system-panel{display:none}}
.ba-schematic{position:absolute;inset:0;overflow:hidden;color:#bcd3df;background:linear-gradient(rgba(53,108,132,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(53,108,132,.05) 1px,transparent 1px);background-size:18px 18px}
.device{cursor:pointer;transition:.2s}
.device:hover{filter:brightness(1.2);transform:translateY(-4px)}
.ahu-wrap{position:absolute;left:1%;right:auto;top:7%;bottom:auto;width:78%;aspect-ratio:1.72;overflow:hidden}
.ahu-asset{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.air-stream{position:absolute;display:flex;align-items:center;gap:12px;pointer-events:none;opacity:0;overflow:hidden}
.air-stream i{position:relative;flex:0 0 34px;width:34px;height:13px;border:0;border-top:2px solid #8bf7f1;border-radius:50%;transform:none;filter:drop-shadow(0 0 4px #30e7e2)}
.air-stream i::after{content:"";position:absolute;right:-1px;top:-4px;width:6px;height:6px;border:solid #8bf7f1;border-width:2px 2px 0 0;transform:rotate(45deg)}
.air-stream.active{opacity:.85}
.air-stream.active i{animation:windCurve 1.8s linear infinite}
.air-stream.active i:nth-child(2n){animation-delay:-.9s;opacity:.65}
.supply-flow{left:21%;right:10%;top:56%;height:24px}
.return-flow{left:31%;right:15%;top:29%;height:24px;transform:scaleX(-1)}
.exhaust-flow{left:8%;width:27%;bottom:12%;height:24px;transform:scaleX(-1)}
.fan-rotor{position:absolute;width:58px;height:58px;border-radius:50%;pointer-events:none}
.fan-rotor i{position:absolute;inset:8%;border:2px solid rgba(90,236,202,.42);background:repeating-conic-gradient(from 0deg,rgba(83,244,203,.92) 0 13deg,transparent 13deg 42deg);-webkit-mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%);mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%)}
.fan-rotor.running i{animation:spin .7s linear infinite;filter:drop-shadow(0 0 6px #34e1ba)}
.ahu-supply-rotor{right:18.5%;top:49.5%}
.ahu-exhaust-rotor{left:15%;bottom:9%}
.rotary-motion{position:absolute;left:32.8%;top:27%;width:16%;height:42%;border-radius:50%;pointer-events:none}
.rotary-motion i{position:absolute;inset:8%;border:8px dashed rgba(60,224,170,.75);border-radius:50%;opacity:.25}
.rotary-motion.running i{opacity:1;animation:spin 2s linear infinite;filter:drop-shadow(0 0 8px #35d8a9)}
.valve-motion{position:absolute;width:30px;height:30px;border:3px solid #d5a542;border-radius:50%;pointer-events:none}
.valve-motion i{position:absolute;left:47%;top:-20%;width:3px;height:140%;background:#ffe075;transform:rotate(var(--open));transition:transform .7s ease;transform-origin:center}
.ahu-valve{left:51.5%;top:67%}
.damper-motion{position:absolute;display:flex;justify-content:space-around;pointer-events:none}
.damper-motion i{width:3px;background:#62d9df;transform:rotate(var(--open,42deg));transform-origin:center;transition:transform .65s ease,background .3s}
.ahu-fresh-damper{left:22%;top:48%;width:7%;height:19%}
.instrument{position:absolute;z-index:8;width:17px;height:22px;border-radius:5px 5px 2px 2px;background:linear-gradient(#48c9ee,#17658d);border:1px solid #76e7ff;box-shadow:0 0 8px rgba(57,209,245,.55);pointer-events:none}
.instrument::after{content:"";position:absolute;left:7px;top:21px;width:2px;height:15px;background:#45b7d8}
.instrument i{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:5px;font-style:normal;color:#eaffff}
.fresh-sensor{left:28%;top:48%}
.return-co2-sensor{left:42%;top:24%}
.return-th-sensor{left:53%;top:24%}
.return-pm-sensor{left:73%;top:24%}
.supply-sensor{left:83%;top:53%}
.filter-switch{width:14px;height:14px;border-radius:50%;background:#324d58;border-color:#f3c958;box-shadow:0 0 6px rgba(243,201,88,.5)}
.filter-switch::after{top:13px;left:6px;height:10px;background:#f3c958}
.filter-switch-one{left:39.5%;top:47%}
.filter-switch-two{left:45%;top:47%}
.frost-switch{left:58%;top:48%;background:#375b66}
.humidifier-point{left:64%;top:48%;background:#286f78}
.valve-actuator{left:52%;top:65%;background:#a67725;border-color:#ffd76b}
.pt{position:absolute;z-index:10}
.fresh-air{left:5%;top:43%}
.fresh-damper{left:10%;top:71%}
.filter-one{left:27%;top:69%}
.filter-two{left:36%;top:69%}
.valve-point{left:49%;top:41%}
.water-point{left:48%;bottom:3%}
.frost-point{left:58%;top:41%}
.humid-point{left:66%;top:41%}
.fan-point{left:75%;top:41%}
.supply-air{right:2%;top:70%}
.return-temp{left:38%;top:5%}
.return-data{left:54%;top:5%}
.pm-point{right:11%;top:17%}
.exhaust-point{left:3%;top:2%;bottom:auto}
.rotary-point{left:38%;top:46%}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes windCurve{0%{transform:translateX(-46px) scaleX(.8);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(46px) scaleX(1.1);opacity:0}}
</style>
