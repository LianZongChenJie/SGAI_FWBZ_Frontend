<template>
  <div class="ba-schematic ahu-exhaust ahu-3">
    <div class="ahu-wrap device ahu-exhaust" @click="$emit('select-device','ba.ahu3')">
      <img class="ahu-asset" src="/equipment/ahu-process-v2-2_5d.png" alt="AHU-3 排风联动机组" />
      <div class="air-stream supply-flow" :class="{ active: p('ba.ahu3.running') }"><i v-for="x in 12" :key="`s${x}`"></i></div>
      <div class="air-stream return-flow" :class="{ active: p('ba.ahu3.running') }"><i v-for="x in 8" :key="`r${x}`"></i></div>
      <div class="air-stream exhaust-flow" :class="{ active: p('ba.ahu3.exhaustRunning') }"><i v-for="x in 5" :key="`e${x}`"></i></div>
      <div class="fan-rotor ahu-supply-rotor" :class="{ running: p('ba.ahu3.running') }"><i></i></div>
      <div class="fan-rotor ahu-exhaust-rotor" :class="{ running: p('ba.ahu3.exhaustRunning') }"><i></i></div>
      <div class="valve-motion ahu-valve" :style="valveStyle(p('ba.ahu3.valve'))"><i></i></div>
      <div class="damper-motion ahu-fresh-damper" :style="valveStyle(p('ba.ahu3.freshDamper'))"><i v-for="x in 5" :key="`d${x}`"></i></div>
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
      <PointBadge class="pt fresh-air" label="新风温湿度" :value="`${n('ba.ahu3.freshTemp',1)}℃ · ${n('ba.ahu3.freshHumidity',1)}%RH`" />
      <PointBadge class="pt fresh-damper" label="新风阀反馈" :value="`${n('ba.ahu3.freshDamper',1)}%`" />
      <PointBadge class="pt filter-one" label="初效" :value="p('ba.ahu3.filter1Alarm')?'报警':'正常'" :alarm="p('ba.ahu3.filter1Alarm')" />
      <PointBadge class="pt filter-two" label="中效" :value="p('ba.ahu3.filter2Alarm')?'报警':'正常'" :alarm="p('ba.ahu3.filter2Alarm')" />
      <PointBadge class="pt valve-point" label="水阀反馈 / 调节" :value="`${n('ba.ahu3.valve',1)}%`" />
      <PointBadge class="pt water-point" label="供 / 回水温度" :value="`${n('ba.ahu3.supplyWaterTemp',1)} / ${n('ba.ahu3.returnWaterTemp',1)}℃`" />
      <PointBadge class="pt frost-point" label="防冻报警" :value="p('ba.ahu3.frostAlarm')?'报警':'正常'" :alarm="p('ba.ahu3.frostAlarm')" />
      <PointBadge class="pt humid-point" label="加湿控制" :value="p('ba.ahu3.humidifier')?'开':'关'" />
      <PointBadge class="pt fan-point" label="送风机状态 / 频率" :value="`${p('ba.ahu3.running')?'运行':'停止'} · ${n('ba.ahu3.fanFrequency',1)}Hz`" :alarm="p('ba.ahu3.fault')" />
      <PointBadge class="pt supply-air" label="送风温湿度" :value="`${n('ba.ahu3.supplyTemp',1)}℃ · ${n('ba.ahu3.supplyHumidity',1)}%RH`" />
      <PointBadge class="pt return-temp" label="回风温湿度" :value="`${n('ba.ahu3.returnTemp',1)}℃ · ${n('ba.ahu3.returnHumidity',1)}%RH`" />
      <PointBadge class="pt return-data" label="回风 CO₂" :value="`${n('ba.ahu3.co2',0)} ppm`" />
      <PointBadge class="pt pm-point" label="回风 PM2.5" :value="`${n('ba.ahu3.pm25',1)} μg/m³`" />
      <PointBadge class="pt exhaust-point" label="排风机状态 / 频率" :value="`${p('ba.ahu3.exhaustRunning')?'运行':'停止'} · ${n('ba.ahu3.exhaustFrequency',1)}Hz`" :alarm="p('ba.ahu3.exhaustFault')" />
    </div>
    <div class="parameter-panel">
      <h4>系统参数</h4>
      <PointBadge label="系统启停" :value="p('ba.ahu3.systemEnable')?'开':'关'" />
      <PointBadge label="季节模式" :value="p('ba.ahu3.season')" />
      <PointBadge label="送风温度设定" :value="`${n('ba.ahu3.supplyTempSetpoint',1)}℃`" />
      <PointBadge label="回风温度设定" :value="`${n('ba.ahu3.returnTempSetpoint',1)}℃`" />
      <PointBadge label="CO₂设定" :value="`${n('ba.ahu3.co2Setpoint',0)} ppm`" />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import PointBadge from './components/PointBadge.vue'
import { createHelpers } from './components/utils.js'

const props = defineProps({
  values: { type: Object, default: () => reactive({}) }
})
defineEmits(['select-device'])

const { p, n, valveStyle } = createHelpers(props.values)
</script>

<style scoped>
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
.exhaust-point{left:2%;bottom:5%}
.parameter-panel{position:absolute;right:2%;top:10%;width:210px;padding:7px;border:1px solid #2b5a6d;background:#082332}
.parameter-panel h4{padding:5px 7px;background:#0f4257;color:#7bd0db}
.parameter-panel :deep(.point-badge){display:flex;justify-content:space-between;border-width:0 0 1px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes windCurve{0%{transform:translateX(-46px) scaleX(.8);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(46px) scaleX(1.1);opacity:0}}
</style>
