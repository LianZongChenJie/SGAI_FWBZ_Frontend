<template>
  <div class="overview-tab">
    <div class="stat-cards">
      <StatCard
        label="照明回路总数"
        :value="statData.loopTotal"
        :change-text="statData.loopTotalChange"
        trend="up"
        color="blue"
        :icon="BulbIcon"
      />
      <StatCard
        label="在线回路"
        :value="statData.onlineLoop"
        :change-text="statData.onlineLoopRate"
        trend=""
        color="green"
        :icon="CheckIcon"
      />
      <StatCard
        label="当前开启"
        :value="statData.openLoop"
        :change-text="statData.saveRate"
        trend="down"
        color="orange"
        :icon="SparkleIcon"
      />
      <StatCard
        label="今日能耗"
        :value="statData.todayEnergy"
        :change-text="statData.todayEnergyChange"
        trend="down"
        color="purple"
        :icon="LightningIcon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, h, onMounted } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// emoji 图标组件
const BulbIcon = () => h('span', { style: 'font-size: 20px;' }, '💡')
const CheckIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const SparkleIcon = () => h('span', { style: 'font-size: 20px;' }, '🌟')
const LightningIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')

// 统计数据（预留接口）
const statData = reactive({
  loopTotal: '2,340',
  loopTotalChange: '456 新增',
  onlineLoop: '2,338',
  onlineLoopRate: '99.9% 在线率',
  openLoop: '1,245',
  saveRate: '12% 节能中',
  todayEnergy: '3,420',
  todayEnergyChange: '15% kWh'
})

onMounted(() => {
  console.log('能源优化 - 概览')
})
</script>

<style scoped lang="less">
.overview-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
