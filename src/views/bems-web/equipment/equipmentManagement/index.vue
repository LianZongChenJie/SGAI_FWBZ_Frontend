<template>
  <div class="equip-page">
    <div class="stat-cards">
      <StatCard
        label="设备总数"
        :value="statData.count"
        change-text="较昨日下降 5.2%"
        trend="down"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="在线数量"
        :value="statData.online"
        change-text="较昨日上升 2.1%"
        trend="up"
        color="green"
        :icon="ShopOutlined"
      />
      <StatCard
        label="离线数量"
        :value="statData.offline"
        change-text="较昨日下降 3.8%"
        trend="down"
        color="orange"
        :icon="CloudOutlined"
      />
      <StatCard
        label="区域数量"
        :value="statData.spaceCount"
        change-text="较昨日上升 1.2%"
        trend="up"
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
  count: '111',
  online: '222',
  offline: '333',
  spaceCount: '444',
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