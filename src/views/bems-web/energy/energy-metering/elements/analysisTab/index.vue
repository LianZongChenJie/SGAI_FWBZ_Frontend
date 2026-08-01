<template>
  <div class="analysis-tab">
    <div class="stat-cards">
      <StatCard
        label="本月总耗电"
        :value="statData.monthlyPower"
        :change-text="statData.monthlyPowerChange"
        trend="up"
        color="blue"
        :icon="ThunderIcon"
      />
      <StatCard
        label="本月总用水"
        :value="statData.monthlyWater"
        :change-text="statData.monthlyWaterChange"
        trend="down"
        color="green"
        :icon="WaterDropIcon"
      />
      <StatCard
        label="日均耗电"
        :value="statData.dailyAvgPower"
        :change-text="statData.dailyAvgPowerChange"
        trend="up"
        color="orange"
        :icon="ChartIcon"
      />
      <StatCard
        label="环比节能"
        :value="statData.energySaving"
        :change-text="statData.energySavingChange"
        trend="up"
        color="purple"
        :icon="LeafIcon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// 自定义 emoji 图标组件
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const LeafIcon = () => h('span', { style: 'font-size: 20px;' }, '🌿')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  monthlyPower: '198,456',
  monthlyPowerChange: '5.2% kWh',
  monthlyWater: '5,234',
  monthlyWaterChange: '3.1% m³',
  dailyAvgPower: '22,050',
  dailyAvgPowerChange: '2.8% kWh',
  energySaving: '8.5%',
  energySavingChange: '1.2% 较上月',
})

// 加载计量分析数据（预留接口）
const loadAnalysisData = async () => {
  // TODO: 调用计量分析数据接口
  console.log('加载计量分析数据')
}

onMounted(() => {
  loadAnalysisData()
})
</script>

<style scoped lang="less">
.analysis-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
