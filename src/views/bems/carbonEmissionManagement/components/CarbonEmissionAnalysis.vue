<template>
  <div class="carbon-emission-analysis">
    <div class="carbon-flow-chart">
      <CarbonFlowChart />
    </div>
    <div class="overview-and-trends">
      <OverviewAndTrends />
    </div>
    <div class="carbon-object">
      <CarbonObject />
    </div>
    <div class="scenarioization">
      <Scenarioization />
    </div>
    <!-- <div class="time-comparison">

    </div> -->
  </div>
</template>

<script setup lang="ts">
import CarbonFlowChart from './CarbonFlowChart.vue'
import OverviewAndTrends from './OverviewAndTrends.vue'
import CarbonObject from './CarbonObject.vue'
import Scenarioization from './Scenarioization.vue'

</script>

<style lang="less" scoped>
.carbon-emission-analysis {
  display: flex;
  flex-wrap: wrap;
  height: 82vh;
  width: 100%;
  padding: 10px 10px;
  margin: 0 10px;
  border: 1px solid rgb(122, 121, 121);
  overflow: auto;

  .carbon-flow-chart {
    height: 450px;
    width: 100%;
    border-radius: 5px;
    padding: 5px;
    background-color: #fff;
  }

  .overview-and-trends, 
  .carbon-object, 
  .scenarioization, 
  .time-comparison {
    height: 350px;
    width: 100%;
    padding: 5px;
    margin-top: 12px;
  }
}
</style>