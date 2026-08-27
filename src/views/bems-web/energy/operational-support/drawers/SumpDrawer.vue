<template>
  <div class="drawer-mask" @click.self="$emit('close')">
    <aside class="device-drawer">
      <button @click="$emit('close')">×</button>
      <small>DEVICE DATA</small>
      <h2>集水坑双泵</h2>
      <div class="summary" :class="stateTone">
        <i></i><strong>{{ stateText }}</strong>
        <button @click="$emit('trigger-motion')">动效测试</button>
      </div>
      <div class="drawer-list">
        <p v-for="row in devicePoints" :key="row.key">
          <span>{{ row.label }}</span>
          <b :class="tone(row)">{{ format(row) }}</b>
        </p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BUILDING_AUTOMATION_POINTS, BUILDING_AUTOMATION_DEFAULTS } from '../data/buildingAutomationPoints.js'
import { formatValue, pointTone, getStateText, getStateTone, filterPoints } from './utils.js'

const props = defineProps({
  values: { type: Object, default: () => ({ ...BUILDING_AUTOMATION_DEFAULTS }) }
})
defineEmits(['close', 'trigger-motion'])

const prefix = 'ba.sump'
const devicePoints = computed(() => filterPoints(BUILDING_AUTOMATION_POINTS, prefix))
const stateText = computed(() => getStateText(props.values, prefix))
const stateTone = computed(() => getStateTone(props.values, prefix))

const format = (row) => formatValue(props.values, row)
const tone = (row) => pointTone(props.values, row)
</script>

<style scoped>
.drawer-mask{position:absolute;inset:0;z-index:60;background:rgba(1,8,13,.7);backdrop-filter:blur(5px)}
.device-drawer{position:absolute;right:0;top:0;bottom:0;width:330px;padding:20px;border-left:1px solid #2b8193;background:#08202e;overflow-y:auto}
.device-drawer>button{position:absolute;right:12px;top:8px;border:0;background:none;color:#7898a9;font-size:22px;cursor:pointer}
.device-drawer small{color:#36a4bb;font-size:6px;letter-spacing:2px}
.device-drawer h2{margin:5px 0 14px;color:#d9eaf3;font-size:18px}
.summary{padding:10px;display:flex;align-items:center;gap:8px;border:1px solid #285164;background:#0a2a3b;font-size:8px}
.summary i{width:8px;height:8px;border-radius:50%;background:currentColor}
.summary button{margin-left:auto;padding:4px 7px;border:1px solid #27798b;background:#0e3a49;color:#71d6dc;font-size:7px;cursor:pointer}
.running{color:#48dfa8!important}
.stopped{color:#869ba7!important;filter:saturate(.45)}
.fault{color:#ff7968!important}
.drawer-list{margin-top:12px;border:1px solid #204657}
.drawer-list p{height:32px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #183b4b;font-size:8px}
.drawer-list span{color:#7190a1}
.good{color:#4be0aa!important}
.bad{color:#ff7868!important}
</style>
