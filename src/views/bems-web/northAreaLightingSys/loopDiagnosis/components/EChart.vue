<script setup lang="ts">
/* ECharts 薄包装：option 引用变化即 setOption(notMerge)；自动 resize / 卸载 dispose */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '260px' }
})

const el = ref(null)
let chart = null
let ro = null

function render () {
  if (!chart && el.value) chart = echarts.init(el.value)
  if (chart && props.option) chart.setOption(props.option, true)
}

onMounted(() => {
  render()
  ro = new ResizeObserver(() => { if (chart) chart.resize() })
  ro.observe(el.value)
})
watch(() => props.option, render)
onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  if (chart) chart.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" :style="{ height, width: '100%' }"></div>
</template>
