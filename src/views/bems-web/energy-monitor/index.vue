<template>
  <div class="energy-monitor-root">
    <!-- 以 embedded 模式渲染能源站监控页(自带集中水冷/集中风冷/分馆风冷三页签) -->
    <EnergyStationPage embedded />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { bindingStore } from './stores/bindingStore.js'
import EnergyStationPage from './EnergyStationPage.vue'

// 初始化冷源实时数据 WebSocket：返回数据由 bindingStore 统一解析，
// 通过 energy-point-values 事件覆盖到 ENERGY_STATION_POINTS 对应字段
onMounted(() => bindingStore.connectColdSourceWs())
onUnmounted(() => bindingStore.disconnectColdSourceWs())
</script>

<style scoped>
.energy-monitor-root {
  width: 100%;
  height: 100%;
  padding: 0;
}
</style>
