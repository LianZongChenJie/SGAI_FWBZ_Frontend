<template>
  <div class="ba-schematic fcu">
    <div class="fcu-asset device" @click="$emit('select-device','ba.fcu')">
      <img src="/equipment/fan-coil-v2-2_5d.png" alt="风机盘管" />
      <div class="air-stream fcu-flow" :class="{ active: p('ba.fcu.running') }"><i v-for="x in 8" :key="x"></i></div>
      <div v-for="no in [1, 2]" :key="no" :class="['fan-rotor', `fcu-rotor-${no}`, { running: p('ba.fcu.running') }]"><i></i></div>
      <div class="valve-motion fcu-valve" :style="valveStyle(p('ba.fcu.valve'))"><i></i></div>
      <b class="fcu-air-label fcu-ra">RA ↑</b>
      <b class="fcu-air-label fcu-da">DA →</b>
      <PointBadge class="fcu-valve-feedback" label="水阀反馈" :value="`${n('ba.fcu.valve',1)}%`" />
    </div>
    <PointBadge class="fcu-on" label="开关机" :value="p('ba.fcu.onOff') ? '开机' : '关机'" />
    <div class="fcu-panel">
      <h4>风盘参数</h4>
      <PointBadge label="温度" :value="`${n('ba.fcu.roomTemp',1)} ℃`" />
      <PointBadge label="设定温度" :value="`${n('ba.fcu.setpoint',1)} ℃`" />
      <PointBadge label="水阀状态" :value="p('ba.fcu.valveClosed') ? '关闭' : '开启'" />
      <PointBadge label="模式" :value="p('ba.fcu.mode')" />
      <PointBadge label="风速" :value="speedText()" />
      <PointBadge label="键盘锁" :value="p('ba.fcu.keyboardLock') ? '锁定' : '关闭'" />
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

const { p, n, valveStyle, speedText } = createHelpers(props.values)
</script>

<style scoped>
.ba-schematic{position:absolute;inset:0;overflow:hidden;color:#bcd3df;background:linear-gradient(rgba(53,108,132,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(53,108,132,.05) 1px,transparent 1px);background-size:18px 18px}
.device{cursor:pointer;transition:.2s}
.device:hover{filter:brightness(1.2);transform:translateY(-4px)}
.fcu-asset{position:absolute;inset:auto;left:9%;top:4%;width:72%;height:auto;aspect-ratio:1.594;overflow:hidden}
.fcu-asset img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.air-stream{position:absolute;display:flex;align-items:center;gap:12px;pointer-events:none;opacity:0;overflow:hidden}
.air-stream i{position:relative;flex:0 0 34px;width:34px;height:13px;border:0;border-top:2px solid #8bf7f1;border-radius:50%;transform:none;filter:drop-shadow(0 0 4px #30e7e2)}
.air-stream i::after{content:"";position:absolute;right:-1px;top:-4px;width:6px;height:6px;border:solid #8bf7f1;border-width:2px 2px 0 0;transform:rotate(45deg)}
.air-stream.active{opacity:.85}
.air-stream.active i{animation:windCurve 1.8s linear infinite}
.air-stream.active i:nth-child(2n){animation-delay:-.9s;opacity:.65}
.fcu-flow{left:18%;right:8%;top:54%;height:26px}
.fan-rotor{position:absolute;width:45px;height:45px;border-radius:50%;pointer-events:none}
.fan-rotor i{position:absolute;inset:8%;border:2px solid rgba(90,236,202,.42);background:repeating-conic-gradient(from 0deg,rgba(83,244,203,.92) 0 13deg,transparent 13deg 42deg);-webkit-mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%);mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%)}
.fan-rotor.running i{animation:spin .7s linear infinite;filter:drop-shadow(0 0 6px #34e1ba)}
.fcu-rotor-1{left:28.5%;top:42%}
.fcu-rotor-2{left:39.2%;top:39%}
.valve-motion{position:absolute;width:30px;height:30px;border:3px solid #d5a542;border-radius:50%;pointer-events:none}
.valve-motion i{position:absolute;left:47%;top:-20%;width:3px;height:140%;background:#ffe075;transform:rotate(var(--open));transition:transform .7s ease;transform-origin:center}
.fcu-valve{left:59.5%;top:69%}
.fcu-air-label{position:absolute;z-index:8;padding:3px 7px;border:1px solid rgba(102,224,238,.45);background:rgba(5,37,51,.88);color:#aef4f4;font-size:9px}
.fcu-ra{left:18%;bottom:19%}
.fcu-da{right:12%;top:47%}
.fcu-valve-feedback{position:absolute;left:60%;bottom:12%;z-index:9}
.fcu-on{position:absolute;left:19%;top:12%}
.fcu-panel{position:absolute;right:3%;top:9%;width:210px;padding:7px;border:1px solid #2b5a6d;background:#082332}
.fcu-panel h4{padding:5px 7px;background:#0f4257;color:#7bd0db}
.fcu-panel :deep(.point-badge){display:flex;justify-content:space-between;border-width:0 0 1px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes windCurve{0%{transform:translateX(-46px) scaleX(.8);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(46px) scaleX(1.1);opacity:0}}
</style>
