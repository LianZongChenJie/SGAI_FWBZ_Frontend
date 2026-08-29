<template>
  <div class="ba-page ahu-summary">
    <main>
      <header>
        <div>
          <h1>AHU机组总览</h1>
        </div>
      </header>
      <section class="schematic-card">
        <div class="ba-schematic">
          <div class="summary-table">
            <div class="tr head">
              <b>机组编号</b><b>运行状态</b><b>防冻报警</b><b>故障报警</b><b>水阀控制</b><b>送风温度</b><b>回风温度</b><b>设定温度</b><b>机组启停</b>
            </div>
            <button
              v-for="no in [1, 2]"
              :key="no"
              class="tr"
              @click="$emit('select-device', `ba.ahu${no}`)"
            >
              <strong>AHU {{ no }}</strong>
              <span class="fan-icon" :class="{ spin: p(`ba.ahu${no}.running`) }">✣</span>
              <em :class="alarm(`ba.ahu${no}.frostAlarm`)">▲</em>
              <em :class="alarm(`ba.ahu${no}.fault`)">▲</em>
              <span>{{ n(`ba.ahu${no}.valve`, 1) }}%</span>
              <span>{{ n(`ba.ahu${no}.supplyTemp`, 1) }}℃</span>
              <span>{{ n(`ba.ahu${no}.returnTemp`, 1) }}℃</span>
              <span>{{ n(`ba.ahu${no}.returnTempSetpoint`, 1) }}℃</span>
              <i :class="p(`ba.ahu${no}.fanEnable`) ? 'on' : 'off'">{{ p(`ba.ahu${no}.fanEnable`) ? 'ON' : 'OFF' }}</i>
            </button>
          </div>
        </div>
      </section>
      <aside class="system-panel">
        <header>系统参数</header>
        <div v-for="row in systemRows" :key="row.key">
          <span>{{ row.label }}</span>
          <strong>{{ formatRow(row) }}</strong>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { createHelpers } from './components/utils.js'
import { BUILDING_AUTOMATION_POINTS, BUILDING_AUTOMATION_DEFAULTS } from '../data/buildingAutomationPoints.js'

const props = defineProps({
  values: { type: Object, default: () => reactive({ ...BUILDING_AUTOMATION_DEFAULTS }) }
})
defineEmits(['select-device'])

const prefix = 'ba.ahu1'
const { p, n, alarm } = createHelpers(props.values)

const devicePoints = computed(() => BUILDING_AUTOMATION_POINTS.filter(pt => pt.key.startsWith(prefix + '.')))
const systemRows = computed(() => devicePoints.value.slice(-6))
const running = computed(() => Boolean(props.values[`${prefix}.running`] ?? props.values[`${prefix}.fanEnable`]))
const fault = computed(() => Boolean(props.values[`${prefix}.fault`]))
const stateText = computed(() => fault.value ? '故障' : running.value ? '运行' : '停止')
const stateTone = computed(() => fault.value ? 'fault' : running.value ? 'running' : 'stopped')

function formatRow(row) {
  const v = props.values[row.key] ?? '--'
  if (row.type === 'boolean') {
    return v ? (row.key.includes('fault') || row.key.includes('Alarm') ? '报警' : '是') : (row.key.includes('fault') || row.key.includes('Alarm') ? '正常' : '否')
  }
  const shown = typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(1) : v
  return `${shown}${row.unit ? ` ${row.unit}` : ''}`
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
.system-panel{position:absolute;right:16px;top:77px;bottom:14px;width:222px;padding-bottom:8px;border:1px solid #234b5e;background:#08202e}
.system-panel header{height:29px;padding:8px 10px;border-bottom:1px solid #285267;background:#0d3041;color:#80c7d1;font-size:8px}
.system-panel>div{height:34px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(52,91,109,.28);font-size:8px}
.system-panel span{color:#6d8c9d}
.system-panel strong{color:#d6e8f0}
@media(max-width:1050px){.schematic-card{right:16px}.system-panel{display:none}}

.ba-schematic{position:absolute;inset:0;overflow:hidden;color:#bcd3df;background:linear-gradient(rgba(53,108,132,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(53,108,132,.05) 1px,transparent 1px);background-size:18px 18px}
.summary-table{position:absolute;inset:8% 4%;display:flex;flex-direction:column;justify-content:center}
.tr{display:grid;grid-template-columns:1.1fr repeat(8,1fr);min-height:72px;align-items:center;border:1px solid #28566a;border-top:0;background:#0a2635;color:#d5e9f2}
.tr.head{min-height:45px;border-top:1px solid #28566a;background:#0d3345}
.tr>*{text-align:center;font-size:9px}
.tr strong{margin:0 12px;padding:8px;background:#15506d}
.tr em{font-style:normal;color:#5bd8a8}
.tr em.alarm{color:#f46e5b}
.tr i{justify-self:center;padding:5px 9px;font-style:normal;background:#6c4b26}
.tr i.on{background:#98702d;color:#fff}
.fan-icon{font-size:26px!important;color:#3ac695}
.fan-icon.spin{animation:spin 1.2s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
