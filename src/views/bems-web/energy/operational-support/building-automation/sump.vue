<template>
  <div class="ba-schematic sump">
    <div class="sump-asset device" @click="$emit('select-device','ba.sump')">
      <img src="/equipment/sump-pump-station-v2-2_5d.png" alt="集水坑双泵" />
      <div class="water-level" :style="{ height: `${clamp(p('ba.sump.level')) * .30}%` }">
        <i></i><b></b>
      </div>
      <div
        v-for="no in [1, 2]"
        :key="no"
        :class="['pump-motion', `pump-motion-${no}`, { running: p(`ba.sump.pump${no}.running`), fault: p(`ba.sump.pump${no}.fault`) }]"
      >
        <i></i><b></b>
        <em>{{ p(`ba.sump.pump${no}.running`) ? '运行' : '停止' }}</em>
      </div>
      <strong class="level-readout">{{ n('ba.sump.level', 0) }}%</strong>
    </div>
    <PointBadge class="sump-alarm" label="液位报警" :value="p('ba.sump.levelAlarm') ? '报警' : '正常'" :alarm="p('ba.sump.levelAlarm')" />
    <div v-for="no in [1, 2]" :key="`pb${no}`" :class="`pump-points pump-${no}`">
      <PointBadge :label="`${no}#泵运行`" :value="p(`ba.sump.pump${no}.running`) ? '运行' : '停止'" />
      <PointBadge :label="`${no}#泵故障`" :value="p(`ba.sump.pump${no}.fault`) ? '故障' : '正常'" :alarm="p(`ba.sump.pump${no}.fault`)" />
      <PointBadge :label="`${no}#泵手自动`" :value="p(`ba.sump.pump${no}.auto`) ? '自动' : '手动'" />
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

const { p, n, clamp } = createHelpers(props.values)
</script>

<style scoped>
.ba-schematic{position:absolute;inset:0;overflow:hidden;color:#bcd3df;background:linear-gradient(rgba(53,108,132,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(53,108,132,.05) 1px,transparent 1px);background-size:18px 18px}
.device{cursor:pointer;transition:.2s}
.device:hover{filter:brightness(1.2);transform:translateY(-4px)}
.sump-asset{position:absolute;inset:auto;left:12%;top:7%;width:76%;height:auto;aspect-ratio:1.5;overflow:hidden}
.sump-asset img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.water-level{position:absolute;left:27%;bottom:27%;width:48%;overflow:hidden;border-radius:0;clip-path:polygon(0 10%,94% 0,100% 78%,7% 100%);background:linear-gradient(180deg,rgba(35,224,244,.42),rgba(8,114,190,.7));mix-blend-mode:screen;transition:height .8s cubic-bezier(.2,.8,.2,1)}
.water-level i,.water-level b{position:absolute;left:-20%;top:-5px;width:140%;height:12px;border-radius:50%;border-top:3px solid rgba(129,244,255,.95);animation:wave 2.2s ease-in-out infinite}
.water-level b{animation-delay:-1.1s;opacity:.55}
.level-readout{position:absolute;right:20%;bottom:25%;padding:5px 8px;border:1px solid #42dce7;background:#062a3b;color:#9af4fb}
.pump-motion{position:absolute;top:38%;width:11%;height:29%;border-radius:12px;transition:.25s}
.pump-motion-1{left:35.5%}
.pump-motion-2{left:55.5%}
.pump-motion i{position:absolute;inset:5%;border:2px solid rgba(113,141,151,.65);border-radius:50%}
.pump-motion b{position:absolute;left:45%;top:-8%;width:10%;height:116%;background:linear-gradient(transparent,#5ff2e7,transparent);opacity:0}
.pump-motion em{position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);padding:2px 6px;border-radius:9px;background:#50636c;color:#dce8ed;font-size:8px;font-style:normal;white-space:nowrap}
.pump-motion.running{background:rgba(28,214,151,.13);box-shadow:0 0 13px rgba(49,237,165,.9);animation:pumpBob 1.25s ease-in-out infinite}
.pump-motion.running i{border:3px dashed #54f2bd;animation:spin .75s linear infinite}
.pump-motion.running b{opacity:.75;animation:pumpPulse 1s ease-in-out infinite}
.pump-motion.running em{background:#12865f;color:#eafff8}
.pump-motion.fault{box-shadow:0 0 24px rgba(255,79,72,.9)}
.pump-motion.fault em{background:#b6403a}
.sump-alarm{position:absolute;left:15%;top:28%}
.pump-points{position:absolute;bottom:6%;display:flex;gap:4px}
.pump-1{left:20%}
.pump-2{right:16%}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes wave{0%,100%{transform:translateX(-3%) scaleY(.75)}50%{transform:translateX(3%) scaleY(1.2)}}
@keyframes pumpBob{50%{transform:translateY(-2px)}}
@keyframes pumpPulse{50%{opacity:.2}}
</style>
