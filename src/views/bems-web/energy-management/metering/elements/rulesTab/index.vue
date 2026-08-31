<template>
  <div class="rules-tab">
    <div class="stat-cards">
      <StatCard
        label="计量项目总数"
        :value="statData.count"
        :change-text="statData.addCount"
        trend=""
        color="blue"
        :icon="ClipboardIcon"
      />
      <StatCard
        label="已配置公式"
        :value="statData.formulaCount"
        :change-text="statData.coverage"
        trend=""
        color="green"
        :icon="CheckSquareIcon"
      />
      <StatCard
        label="电表项目"
        :value="statData.electricCount"
        :change-text="statData.electricPercentage"
        trend=""
        color="orange"
        :icon="ThunderIcon"
      />
      <StatCard
        label="水表项目"
        :value="statData.waterCount"
        :change-text="statData.waterPercentage"
        trend=""
        color="purple"
        :icon="WaterDropIcon"
      />
    </div>

    <!-- 计量规则配置模块 -->
    <div class="rule-config-card" :class="{ 'rule-fullscreen': ruleFullscreen }">
      <div class="card-header">
        <div class="card-title-wrap">
          <span class="card-title">📋计量规则配置</span>
        </div>
        <div class="card-actions">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="measureRuleRef?.showAddModal()">新增</a-button>
          <a-button @click="measureRuleRef?.showEditModal()">编辑</a-button>
          <a-button danger @click="measureRuleRef?.handleDelete()">删除</a-button>
          <button class="collapse-btn" @click="ruleFullscreen = !ruleFullscreen">
            <FullscreenOutlined v-if="!ruleFullscreen" />
            <FullscreenExitOutlined v-else />
          </button>
          <button class="collapse-btn" @click="ruleCollapsed = !ruleCollapsed">
            <CaretDownOutlined v-if="!ruleCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!ruleCollapsed" class="card-body">
        <MeasureRule ref="measureRuleRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, h } from 'vue'
import { PlusOutlined, FullscreenOutlined, FullscreenExitOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import MeasureRule from './measureRule/index.vue'
import { getRulesStatistics } from './index.api'

const measureRuleRef = ref()

// 全屏与折叠
const ruleFullscreen = ref(false)
const ruleCollapsed = ref(false)

// 自定义 emoji 图标组件
const ClipboardIcon = () => h('span', { style: 'font-size: 20px;' }, '📋')
const CheckSquareIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  count: '--',
  addCount: '',
  formulaCount: '--',
  coverage: '',
  electricCount: '--',
  electricPercentage: '',
  waterCount: '--',
  waterPercentage: '',
})

// 加载计量规则统计数据
const loadRulesData = async () => {
  try {
    const res = await getRulesStatistics()
    const data = res?.result || res?.data || res || {}
    Object.assign(statData, {
      count: data.count ?? statData.count,
      addCount: data.addCount ?? statData.addCount,
      formulaCount: data.formulaCount ?? statData.formulaCount,
      coverage: data.coverage ?? statData.coverage,
      electricCount: data.electricCount ?? statData.electricCount,
      electricPercentage: data.electricPercentage ?? statData.electricPercentage,
      waterCount: data.waterCount ?? statData.waterCount,
      waterPercentage: data.waterPercentage ?? statData.waterPercentage,
    })
  } catch (e) {
    console.error('加载计量规则统计数据失败:', e)
  }
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
        align-items: center;
      }
    }

    .card-body {
      min-height: 120px;
      padding: 22px;
    }
  }

  .collapse-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #666;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      color: #1677ff;
      border-color: #1677ff;
    }
  }

  .rule-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
    margin: 0;
    padding: 20px;
    overflow: auto;
    background: #fff;
  }
}
</style>
