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

    <!-- 计量规则配置模块 -->
    <div class="rule-config-card">
      <div class="card-header">
        <div class="card-title-wrap">
          <span class="card-title">📋计量规则配置</span>
        </div>
        <div class="card-actions">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="measureRuleRef?.showAddModal()">新增</a-button>
          <a-button @click="measureRuleRef?.showEditModal()">编辑</a-button>
          <a-button danger @click="measureRuleRef?.handleDelete()">删除</a-button>
        </div>
      </div>
      <div class="card-body">
        <MeasureRule ref="measureRuleRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, h } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import MeasureRule from './measureRule/index.vue'

const measureRuleRef = ref()

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

  .rule-config-card {
    margin-top: 10px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      border-bottom: 1px solid #f0f0f0;

      .card-title-wrap {
        display: flex;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
      }

      .card-actions {
        display: flex;
        gap: 8px;
      }
    }

    .card-body {
      min-height: 120px;
      padding: 22px;
    }
  }
}
</style>
