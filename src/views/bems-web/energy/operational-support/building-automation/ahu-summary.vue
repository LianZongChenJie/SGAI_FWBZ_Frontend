<template>
  <div class="ba-schematic summary">
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
</template>

<script setup>
import { reactive } from 'vue'
import { createHelpers } from './components/utils.js'

const props = defineProps({
  values: { type: Object, default: () => reactive({}) }
})
defineEmits(['select-device'])

const { p, n, alarm } = createHelpers(props.values)
</script>

<style scoped>
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
