<template>
  <div class="project-evaluation">
    <div class="base-item">
      <BaseInfo />
    </div>
    <div class="base-item">
      <InvestmentRankingChart />
    </div>
    <div class="base-item">
      <YieldRankingChart />
    </div>
    <div class="base-item">
      <ItemQuantityChart />
    </div>
    <div class="base-item">
      <CycleDataChart />
    </div>
    <div class="base-item">
      <TypeOfIncomeChart />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseInfo from './components/BaseInfo.vue'
import InvestmentRankingChart from './components/InvestmentRankingChart.vue'
import YieldRankingChart from './components/YieldRankingChart.vue'
import ItemQuantityChart from './components/ItemQuantityChart.vue'
import CycleDataChart from './components/CycleDataChart.vue'
import TypeOfIncomeChart from './components/TypeOfIncomeChart.vue'
</script>

<style lang="less" scoped>
.project-evaluation {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-content: space-around;
  flex-wrap: wrap;

  .base-item {
    height: 45%;
    width: 30%;
    border-radius: 10px;
    background-color: #fff;
  }
}
</style>