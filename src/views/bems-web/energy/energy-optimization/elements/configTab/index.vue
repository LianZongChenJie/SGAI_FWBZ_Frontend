<template>
  <div class="config-tab">
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
        label="已配置组合"
        :value="statData.configGroup"
        :change-text="statData.configGroupChange"
        trend="down"
        color="orange"
        :icon="LinkIcon"
      />
      <StatCard
        label="模式策略数"
        :value="statData.strategyCount"
        :change-text="statData.strategyChange"
        trend="down"
        color="purple"
        :icon="MaskIcon"
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
const LinkIcon = () => h('span', { style: 'font-size: 20px;' }, '🔗')
const MaskIcon = () => h('span', { style: 'font-size: 20px;' }, '🎭')

// 统计数据（预留接口）
const statData = reactive({
  loopTotal: '2,340',
  loopTotalChange: '456 新增',
  onlineLoop: '2,338',
  onlineLoopRate: '99.9% 在线率',
  configGroup: '24',
  configGroupChange: '6 新增',
  strategyCount: '18',
  strategyChange: '4 新增'
})

onMounted(() => {
  console.log('能源优化 - 配置')
})
</script>

<style scoped lang="less">
.config-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
