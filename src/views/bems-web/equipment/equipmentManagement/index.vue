<template>
  <div class="energy-page">
    <div class="stat-cards">
      <StatCard
        label="设备总数"
        :value="statData.todayPower"
        change-text="较昨日下降 5.2%"
        trend="down"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="在线数量"
        :value="statData.todayWater"
        change-text="较昨日上升 2.1%"
        trend="up"
        color="green"
        :icon="ShopOutlined"
      />
      <StatCard
        label="区域数量"
        :value="statData.carbonEmission"
        change-text="较昨日下降 3.8%"
        trend="down"
        color="orange"
        :icon="CloudOutlined"
      />
      <StatCard
        label="运行中设备"
        :value="statData.deviceRate"
        change-text="较昨日上升 1.2%"
        trend="up"
        color="purple"
        :icon="SettingOutlined"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { StatCard} from '/@/views/bems-web/components';
import {
  ThunderboltOutlined,
  ShopOutlined,
  CloudOutlined,
  SettingOutlined,
  BulbOutlined,

} from '@ant-design/icons-vue'

const statData = ref({
  todayPower: '1,286 kWh',
  todayWater: '326 m³',
  carbonEmission: '852 kg',
  deviceRate: '96.5%',
  alarmTotal: '3 条',
  savings: '¥ 12,580',
})

</script>

<style scoped lang="less">
.energy-page {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  
}
</style>