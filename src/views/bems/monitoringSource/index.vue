<template>
  <div class="monitoring-source-main-box">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs" :destroyInactiveTabPane="true">
      <a-tab-pane key="1" tab="环境监控">
        模式化
      </a-tab-pane>
      <a-tab-pane key="2" tab="变配电监控">
        <substation-and-distribution />
      </a-tab-pane>
      <a-tab-pane key="3" tab="照明监控">
        模式化
      </a-tab-pane>
    </a-tabs>
  </div>  
</template>

<script setup lang="ts">
import SubstationAndDistribution from './components/SubstationAndDistribution.vue'
import { ref } from 'vue';

const activeKey = ref('2');
</script>

<style scoped lang="less">
.monitoring-source-main-box{
}
</style>