<template>
  <div class="equip-page">
    <div class="stat-cards">
      <StatCard
        label="设备总数"
        :value="statData.count"
        change-text=""
        trend=""
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="在线数量"
        :value="statData.online"
        change-text=""
        trend=""
        color="green"
        :icon="ShopOutlined"
      />
      <StatCard
        label="仪表数量"
        :value="statData.measuringCount"
        change-text=""
        trend=""
        color="orange"
        :icon="CloudOutlined"
      />
      <StatCard
        label="运行数量"
        :value="statData.equipmentCount"
        change-text=""
        trend=""
        color="purple"
        :icon="SettingOutlined"
      />
    </div>
    <div class="equip-management">
        <Device />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { StatCard} from '/@/views/bems-web/components';
import Device from './elements/device/index.vue';
import {
  ThunderboltOutlined,
  ShopOutlined,
  CloudOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
import { getDeviceRunStateStatistics } from './index.api'

const statData = ref({
  count: '',
  online: '',
  measuringCount: '',
  equipmentCount: '',
})

const fetchStatData = async () => {
  try {
    const res = await getDeviceRunStateStatistics({})
    console.log('设备运行状态统计:', res)
    Object.assign(statData.value, res)
  } catch (error) {
    console.error('获取设备运行状态统计失败:', error)
  }
}

onMounted(() => {
  fetchStatData()
})
</script>

<style scoped lang="less">
.equip-page {
  padding: 15px;

  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 5px;
  }

  .equip-management {
    margin-top: 20px;
  }
}
</style>