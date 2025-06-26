<template>
  <a-tabs
    v-model:activeKey="activeKey"
    centered
    class="full-height-tabs"
    :destroyInactiveTabPane="true"
  >
    <a-tab-pane
      key="1"
      tab="碳排放分析"
    >
    <CarbonEmissionAnalysis />
  </a-tab-pane>
    <a-tab-pane
      key="2"
      tab="碳排放趋势"
    >
    <CarbonEmissionTrend />
  </a-tab-pane>
    <a-tab-pane
      key="3"
      tab="碳标准配置"
    ></a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import CarbonEmissionAnalysis from './components/CarbonEmissionAnalysis.vue'
import CarbonEmissionTrend from './components/CarbonEmissionTrend.vue'
import { ref } from 'vue';

const activeKey = ref('1');
</script>

<style lang="less" scoped>
</style>