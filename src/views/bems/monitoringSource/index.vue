<template>
  <div class="monitoring-source-main-box">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs" :destroyInactiveTabPane="true">
      <a-tab-pane key="3" tab="变配电运行监控">
        <substationAndDistribution />
      </a-tab-pane>
      <a-tab-pane key="1" tab="冷源监控与分析(虚拟)">
        <ColdSourceMonitoring />
      </a-tab-pane>
      <a-tab-pane key="2" tab="环境监控与分析(虚拟)">
        <EnvironmentalMonitoring />
      </a-tab-pane>
      
      <!-- <a-tab-pane key="4" tab="照明监控">
        模式化
      </a-tab-pane> -->
      <a-tab-pane key="5" tab="给排水(虚拟)">
        <WaterSupplyAndDrainage />
      </a-tab-pane>
      <a-tab-pane key="6" tab="压力传感器">
        <PressureSensor />
      </a-tab-pane>
      <a-tab-pane key="7" tab="流速传感器">
        <PressureSensor />
      </a-tab-pane>
    </a-tabs>
  </div>  
</template>

<script setup lang="ts">
import SubstationAndDistribution from './components/SubstationAndDistribution.vue'
import ColdSourceMonitoring from './components/ColdSourceMonitoring.vue'
import EnvironmentalMonitoring from './components/EnvironmentalMonitoring.vue'
import WaterSupplyAndDrainage from './components/WaterSupplyAndDrainage.vue'
import PressureSensor from './components/PressureSensor.vue'
import { ref } from 'vue';

const activeKey = ref('3');
</script>

<style scoped lang="less">
.monitoring-source-main-box{
}
</style>