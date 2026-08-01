<template>
  <div class="rules-tab">
    <div class="stat-cards">
      <StatCard
        label="计量项目总数"
        :value="statData.projectTotal"
        :change-text="statData.projectTotalChange"
        trend="up"
        color="blue"
        :icon="ClipboardIcon"
      />
      <StatCard
        label="已配置公式"
        :value="statData.configuredFormula"
        :change-text="statData.configuredFormulaChange"
        trend=""
        color="green"
        :icon="CheckSquareIcon"
      />
      <StatCard
        label="电表项目"
        :value="statData.electricProject"
        :change-text="statData.electricProjectChange"
        trend=""
        color="orange"
        :icon="ThunderIcon"
      />
      <StatCard
        label="水表项目"
        :value="statData.waterProject"
        :change-text="statData.waterProjectChange"
        trend=""
        color="purple"
        :icon="WaterDropIcon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// 自定义 emoji 图标组件
const ClipboardIcon = () => h('span', { style: 'font-size: 20px;' }, '📋')
const CheckSquareIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  projectTotal: '37',
  projectTotalChange: '12 新增',
  configuredFormula: '31',
  configuredFormulaChange: '84% 覆盖率',
  electricProject: '28',
  electricProjectChange: '76% 占比',
  waterProject: '9',
  waterProjectChange: '24% 占比',
})

// 加载计量规则数据（预留接口）
const loadRulesData = async () => {
  // TODO: 调用计量规则数据接口
  console.log('加载计量规则数据')
}

onMounted(() => {
  loadRulesData()
})
</script>

<style scoped lang="less">
.rules-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
