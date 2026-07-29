<template>
  <a-tabs
    v-model:activeKey="activeKey"
    centered
    class="full-height-tabs"
    :destroyInactiveTabPane="true"
  >
    <a-tab-pane
      key="1"
      tab="成本分析"
    >
      <CostAnalysis />
    </a-tab-pane>
    <a-tab-pane
      key="2"
      tab="绩效分析"
    >
      <PerformanceAnalysis />
    </a-tab-pane>
    <!-- <a-tab-pane
      key="3"
      tab="能效分析"
    ></a-tab-pane> -->
  </a-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CostAnalysis from './components/CostAnalysis.vue';
import PerformanceAnalysis from './components/PerformanceAnalysis.vue';

const activeKey = ref('1');
</script>

<style lang="less" scoped>
</style>