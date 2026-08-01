<template>
  <div class="overview-tab">
    <div class="stat-cards">
      <StatCard
        label="计量表计总数"
        :value="statData.meterTotal"
        :change-text="statData.meterTotalChange"
        trend="up"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="表计在线率"
        :value="statData.meterOnlineRate"
        :change-text="statData.meterOnlineStatus"
        trend=""
        color="green"
        :icon="CheckCircleOutlined"
      />
      <StatCard
        label="今日用电量"
        :value="statData.todayPower"
        :change-text="statData.todayPowerChange"
        trend="down"
        color="orange"
        :icon="PlugIcon"
      />
      <StatCard
        label="今日用水量"
        :value="statData.todayWater"
        :change-text="statData.todayWaterChange"
        trend="down"
        color="purple"
        :icon="WaterDropIcon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue'

// 自定义 emoji 图标组件（插头和水滴）
const PlugIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  meterTotal: '245',
  meterTotalChange: '56 新增',
  meterOnlineRate: '100%',
  meterOnlineStatus: '全部正常',
  todayPower: '42,156',
  todayPowerChange: '6.8% kWh',
  todayWater: '856',
  todayWaterChange: '3.2% m³',
})

// 加载概览数据（预留接口）
const loadOverviewData = async () => {
  // TODO: 调用概览数据接口，例如：
  // const res = await getEnergyMeteringOverview()
  // statData.meterTotal = res.meterTotal
  // statData.meterTotalChange = res.meterTotalChange
  // ...
  console.log('加载能源计量概览数据')
}

onMounted(() => {
  loadOverviewData()
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
