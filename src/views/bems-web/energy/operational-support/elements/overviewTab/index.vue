<template>
  <div class="energy-page">
    <h2 class="page-title">节能低碳</h2>
    <div class="stat-cards">
      <StatCard
        label="今日用电量"
        :value="statData.todayPower"
        change-text="较昨日下降 5.2%"
        trend="down"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="今日用水量"
        :value="statData.todayWater"
        change-text="较昨日上升 2.1%"
        trend="up"
        color="green"
        :icon="ShopOutlined"
      />
      <StatCard
        label="碳排放量"
        :value="statData.carbonEmission"
        change-text="较昨日下降 3.8%"
        trend="down"
        color="orange"
        :icon="CloudOutlined"
      />
      <StatCard
        label="设备运行率"
        :value="statData.deviceRate"
        change-text="较昨日上升 1.2%"
        trend="up"
        color="purple"
        :icon="SettingOutlined"
      />
      <StatCard
        label="告警总数"
        :value="statData.alarmTotal"
        change-text="较昨日持平"
        color="red"
        :icon="AlertOutlined"
      />
      <StatCard
        label="节能收益"
        :value="statData.savings"
        change-text="累计收益 128.5 万元"
        trend="up"
        color="cyan"
        :icon="DollarOutlined"
      />
    </div>
    <h2 class="page-title">普通卡片</h2>
    <div class="card-list">
    <CommonCard
      :icon="SafetyOutlined"
      title="韧性安全"
      to="/dashboard/analysis"
      icon-bg-color="#e6f7ff"
    />
    <CommonCard
      :icon="BulbOutlined"
      title="节能低碳"
      to="/task/myHandleTaskInfo"
      icon-bg-color="#f6ffed"
    />
    <CommonCard
      :icon="GlobalOutlined"
      title="物联网"
      to="/bems/gatherRuleConfigList"
      icon-bg-color="#fff7e6"
    />
    <CommonCard
      :icon="SoundOutlined"
      title="故障告警"
      to="/monitoringSource"
      icon-bg-color="#fff0f0"
    />
    <CommonCard
      :icon="BankOutlined"
      title="场馆运营"
      to="/joa/leaveList"
      icon-bg-color="#e6f7ff"
    />
    <CommonCard
      :icon="GiftOutlined"
      title="会展服务"
      to="/bems/pointDataStatistics"
      icon-bg-color="#f9f0ff"
    />
  </div>
  </div>
</template>

<script setup lang="ts">
import StatCard from '/@/views/bems-web/components/StatCard/index.vue'
import {
  ThunderboltOutlined,
  ShopOutlined,
  CloudOutlined,
  SettingOutlined,
  AlertOutlined,
  DollarOutlined,
} from '@ant-design/icons-vue'

import CommonCard from '/@/views/bems-web/components/CommonCard/index.vue';
import {
  SafetyOutlined,
  BulbOutlined,
  GlobalOutlined ,
  SoundOutlined ,
  BankOutlined,
  GiftOutlined,
} from '@ant-design/icons-vue'

console.log(11111111)

const statData = {
  todayPower: '1,286 kWh',
  todayWater: '326 m³',
  carbonEmission: '852 kg',
  deviceRate: '96.5%',
  alarmTotal: '3 条',
  savings: '¥ 12,580',
}
</script>

<style scoped lang="less">
.energy-page {
  padding: 24px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    color: rgba(0, 0, 0, 0.88);
  }

  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}

.card-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
</style>