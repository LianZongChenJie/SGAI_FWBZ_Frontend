<template>
  <div class="scatter-plot-chart-box">
    <div
      class="scatter-plot-item"
    >
    <ScatterPlot :refName="'easternCoolingTowerRef'" :title="'东区机房冷却塔性能特性'"/>
    </div>
    <div class="scatter-plot-item">
      <ScatterPlot :refName="'westernCoolingTowerRef'" :title="'西区机房冷却塔性能特性'"/>
    </div>
    <div class="scatter-plot-item">
      <ScatterPlot :refName="'easternTranAndDistriRef'" :title="'东区机房输配能力特性'"/>
    </div>
    <div class="scatter-plot-item">
      <ScatterPlot :refName="'westernTranAndDistriRef'" :title="'西区机房输配能力特性'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ScatterPlot from './ScatterPlot.vue'

</script>

<style lang="less" scoped>
.scatter-plot-chart-box {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  .scatter-plot-item {
    width: 49%;
    height: 48%;
    background-color: #fff;
    border-radius: 10px;
  }
}
</style>