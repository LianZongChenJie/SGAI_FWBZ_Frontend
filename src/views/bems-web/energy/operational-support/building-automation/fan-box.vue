<template>
  <div class="ba-schematic fan">
    <div class="fanbox-asset device" @click="$emit('select-device','ba.fanbox')">
      <img src="/equipment/fan-box-v2-2_5d.png" alt="送排风机箱" />
      <div class="air-stream fanbox-flow" :class="{ active: p('ba.fanbox.running') }">
        <i v-for="x in 7" :key="x"></i>
      </div>
      <div class="fan-rotor fanbox-rotor" :class="{ running: p('ba.fanbox.running') }"><i></i></div>
      <div class="damper-motion fanbox-damper" :class="{ closed: p('ba.fanbox.damperClosed') }">
        <i v-for="x in 5" :key="x"></i>
      </div>
    </div>
    <PointBadge class="fan-damper-point" label="密闭阀状态" :value="p('ba.fanbox.damperClosed') ? '关闭' : '开启'" />
    <div class="fan-points">
      <PointBadge label="风机启停" :value="p('ba.fanbox.running') ? '开' : '关'" />
      <PointBadge label="风机故障" :value="p('ba.fanbox.fault') ? '故障' : '正常'" :alarm="p('ba.fanbox.fault')" />
      <PointBadge label="风机状态" :value="p('ba.fanbox.running') ? '运行' : '停止'" />
      <PointBadge label="风机手自动" :value="p('ba.fanbox.auto') ? '自动' : '手动'" />
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

const { p } = createHelpers(props.values)
</script>

<style scoped>
.ba-schematic{position:absolute;inset:0;overflow:hidden;color:#bcd3df;background:linear-gradient(rgba(53,108,132,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(53,108,132,.05) 1px,transparent 1px);background-size:18px 18px}
.device{cursor:pointer;transition:.2s}
.device:hover{filter:brightness(1.2);transform:translateY(-4px)}
.fanbox-asset{position:absolute;inset:auto;left:10%;top:8%;width:78%;height:auto;aspect-ratio:1.82;overflow:hidden}
.fanbox-asset img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.air-stream{position:absolute;display:flex;align-items:center;gap:12px;pointer-events:none;opacity:0;overflow:hidden}
.air-stream i{position:relative;flex:0 0 34px;width:34px;height:13px;border:0;border-top:2px solid #8bf7f1;border-radius:50%;transform:none;filter:drop-shadow(0 0 4px #30e7e2)}
.air-stream i::after{content:"";position:absolute;right:-1px;top:-4px;width:6px;height:6px;border:solid #8bf7f1;border-width:2px 2px 0 0;transform:rotate(45deg)}
.air-stream.active{opacity:.85}
.air-stream.active i{animation:windCurve 1.8s linear infinite}
.air-stream.active i:nth-child(2n){animation-delay:-.9s;opacity:.65}
.fanbox-flow{left:21%;right:14%;top:50%;height:28px}
.fan-rotor{position:absolute;width:48px;height:48px;border-radius:50%;pointer-events:none}
.fan-rotor i{position:absolute;inset:8%;border:2px solid rgba(90,236,202,.42);background:repeating-conic-gradient(from 0deg,rgba(83,244,203,.92) 0 13deg,transparent 13deg 42deg);-webkit-mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%);mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%)}
.fan-rotor.running i{animation:spin .7s linear infinite;filter:drop-shadow(0 0 6px #34e1ba)}
.fanbox-rotor{left:52.2%;top:43.5%}
.damper-motion{position:absolute;display:flex;justify-content:space-around;pointer-events:none}
.damper-motion i{width:3px;background:#62d9df;transform:rotate(var(--open,42deg));transform-origin:center;transition:transform .65s ease,background .3s}
.damper-motion.closed i{transform:rotate(-2deg);background:#ff9477}
.fanbox-damper{left:22%;top:39%;width:12%;height:24%}
.fan-damper-point{position:absolute;left:24%;top:17%}
.fan-points{position:absolute;left:51%;top:10%;display:grid;grid-template-columns:1fr 1fr;gap:5px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes windCurve{0%{transform:translateX(-46px) scaleX(.8);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(46px) scaleX(1.1);opacity:0}}
</style>
