<template>
  <div class="energy-monitor-root">
    <!-- 以 embedded 模式渲染能源站监控页(自带集中水冷/集中风冷/分馆风冷三页签) -->
    <EnergyStationPage embedded />
  </div>
</template>

<script setup>
import EnergyStationPage from './EnergyStationPage.vue'
</script>

<style scoped>
.energy-monitor-root {
  width: 100%;
  height: 100%;
  padding: 0;
}
</style>
