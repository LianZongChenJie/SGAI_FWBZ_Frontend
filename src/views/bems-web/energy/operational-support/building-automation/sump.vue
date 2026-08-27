<template>
  <div class="ba-page sump">
    <main>
      <header>
        <div>
          <small>BUILDING AUTOMATION · 6.0F</small>
          <h1>{{ deviceName || '集水坑双泵' }}</h1>
          <p>液位与排水泵监控</p>
        </div>
        <div class="headline">
          <span>设备状态</span>
          <strong :class="stateTone">{{ stateText }}</strong>
          <em>点位 {{ devicePoints.length }}</em>
        </div>
      </header>
      <section class="schematic-card">
        <div class="ba-schematic">
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
              <div class="fan-rotor" :class="[`fan-rotor-${no}`,{ running: p(`ba.sump.pump${no}.running`) }]"><i></i></div>
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

const prefix = 'ba.sump'
const { p, n, clamp } = createHelpers(props.values)

const devicePoints = computed(() => BUILDING_AUTOMATION_POINTS.filter(pt => pt.key.startsWith(prefix + '.')))
const running = computed(() => Boolean(props.values[`${prefix}.running`]))
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
.sump-asset{position:absolute;inset:auto;top:2%;width:100%;height:96%;aspect-ratio:auto;overflow:hidden}
.sump-asset img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.water-level{position:absolute;left:27%;bottom:27%;width:48%;overflow:hidden;border-radius:0;clip-path:polygon(0 10%,94% 0,100% 78%,7% 100%);background:linear-gradient(180deg,rgba(35,224,244,.42),rgba(8,114,190,.7));mix-blend-mode:screen;transition:height .8s cubic-bezier(.2,.8,.2,1)}
.water-level i,.water-level b{position:absolute;left:-20%;top:-5px;width:140%;height:12px;border-radius:50%;border-top:3px solid rgba(129,244,255,.95);animation:wave 2.2s ease-in-out infinite}
.water-level b{animation-delay:-1.1s;opacity:.55}
.level-readout{position:absolute;right:20%;bottom:25%;padding:5px 8px;border:1px solid #42dce7;background:#062a3b;color:#9af4fb}
.pump-motion{position:absolute;top:38%;width:11%;height:29%;border-radius:12px;transition:.25s;display:flex;align-items:center;justify-content:center}
.pump-motion-1{left:35.5%}
.pump-motion-2{left:55.5%}
.pump-motion .fan-rotor{position:relative;width:36px;height:36px;border-radius:50%;pointer-events:none;margin-top:106px;margin-left:-6px;}
.pump-motion-2 .fan-rotor{position:relative;width:36px;height:36px;border-radius:50%;pointer-events:none;margin-top:80px;margin-left:35px;}
.pump-motion .fan-rotor i{position:absolute;inset:8%;border:2px solid rgba(90,236,202,.42);background:repeating-conic-gradient(from 0deg,rgba(83,244,203,.92) 0 13deg,transparent 13deg 42deg);-webkit-mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%);mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%)}
.pump-motion .fan-rotor.running i{animation:spin .7s linear infinite;filter:drop-shadow(0 0 6px #34e1ba)}
.pump-motion em{position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);padding:2px 6px;border-radius:9px;background:#50636c;color:#dce8ed;font-size:8px;font-style:normal;white-space:nowrap}
.pump-motion.running{background:rgba(28,214,151,.13);box-shadow:0 0 13px rgba(49,237,165,.9);animation:pumpBob 1.25s ease-in-out infinite}
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
</style>
