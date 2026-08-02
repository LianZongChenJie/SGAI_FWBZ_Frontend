<template>
  <div class="log-tab">
    <div class="stat-cards">
      <StatCard
        label="今日控制次数"
        :value="statData.controlCount"
        :change-text="statData.controlCountChange"
        trend="up"
        color="blue"
        :icon="BarChartIcon"
      />
      <StatCard
      
        label="策略自动执行"
        :value="statData.autoExecute"
        :change-text="statData.autoExecuteRate"
        trend=""
        color="green"
        :icon="RobotIcon"
      />
      <StatCard
        label="手动控制"
        :value="statData.manualControl"
        :change-text="statData.manualControlRate"
        trend=""
        color="orange"
        :icon="PointerIcon"
      />
      <StatCard
        label="联动触发"
        :value="statData.linkTrigger"
        :change-text="statData.linkTriggerRate"
        trend=""
        color="purple"
        :icon="LinkIcon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, h, onMounted } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// emoji 图标组件
const BarChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const RobotIcon = () => h('span', { style: 'font-size: 20px;' }, '🤖')
const PointerIcon = () => h('span', { style: 'font-size: 20px;' }, '👆')
const LinkIcon = () => h('span', { style: 'font-size: 20px;' }, '🔗')

// 统计数据（预留接口）
const statData = reactive({
  controlCount: '156',
  controlCountChange: '23 较昨日',
  autoExecute: '89',
  autoExecuteRate: '57% 占比',
  manualControl: '45',
  manualControlRate: '29% 占比',
  linkTrigger: '22',
  linkTriggerRate: '14% 占比'
})

onMounted(() => {
  console.log('能源优化 - 日志')
})
</script>

<style scoped lang="less">
.log-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
