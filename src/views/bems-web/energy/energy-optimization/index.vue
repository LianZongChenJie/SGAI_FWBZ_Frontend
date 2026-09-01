<template>
  <div class="energy-optimization-page">
    <div class="stat-cards">
      <StatCard
        label="AI优化策略数"
        :value="statData.aiStrategyCount"
        :change-text="statData.aiStrategyChange"
        trend="up"
        color="blue"
        :icon="BrainIcon"
      />
      <StatCard
        label="累计节能能量"
        :value="statData.energySaved"
        :change-text="statData.energySavedChange"
        trend="up"
        color="green"
        :icon="LeafIcon"
      />
      <StatCard
        label="节能收益率"
        :value="statData.savingRate"
        :change-text="statData.savingRateChange"
        trend="up"
        color="orange"
        :icon="MoneyIcon"
      />
      <StatCard
        label="碳减排量"
        :value="statData.carbonReduction"
        :change-text="statData.carbonReductionChange"
        trend="up"
        color="purple"
        :icon="EarthIcon"
      />
    </div>

    <!-- 能流图模块 -->
    <a-card class="flow-card" :bordered="false">
      <div class="flow-card__header">
        <div class="flow-card__title">
          <span class="flow-card__icon">🌊</span>
          <span>能流图</span>
        </div>
        <span class="flow-card__tag">实时</span>
      </div>
      <div class="flow-card__body">
        <div class="flow-placeholder">
          <span class="flow-placeholder__icon">🌊</span>
          <div class="flow-placeholder__title">能源流向桑吉图</div>
          <div class="flow-placeholder__desc">展示电/水/气从供应端到各用能终端的流向与损耗</div>
        </div>
      </div>
    </a-card>

    <!-- 底部左右两栏模块 -->
    <div class="bottom-modules">
      <!-- 左侧：AI 优化策略 -->
      <a-card class="strategy-card" :bordered="false">
        <div class="strategy-card__header">
          <div class="strategy-card__title">
            <span class="strategy-card__icon">🧠</span>
            <span>AI优化策略</span>
          </div>
          <a-button type="primary" size="small" class="strategy-card__add-btn">
            <template #icon><PlusOutlined /></template>
            新增策略
          </a-button>
        </div>
        <div class="strategy-card__list">
          <div
            v-for="(item, index) in strategyList"
            :key="index"
            class="strategy-item"
          >
            <div class="strategy-item__icon">{{ item.icon }}</div>
            <div class="strategy-item__body">
              <div class="strategy-item__title">{{ item.title }}</div>
              <div class="strategy-item__desc">{{ item.desc }}</div>
              <div class="strategy-item__meta">已运行 {{ item.days }} 天 | 累计节能 {{ item.saved }} kWh</div>
              <div class="strategy-item__actions">
                <a-button type="primary" size="small">查看效果</a-button>
                <a-button size="small">调整参数</a-button>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 右侧：优化效果对比 -->
      <a-card class="compare-card" :bordered="false">
        <div class="compare-card__header">
          <div class="compare-card__title">
            <span class="compare-card__icon">📈</span>
            <span>优化效果对比</span>
          </div>
          <a-select
            v-model:value="compareStrategy"
            size="small"
            class="compare-card__select"
            :options="compareOptions"
          />
        </div>
        <div class="compare-card__body">
          <div class="compare-placeholder">
            <span class="compare-placeholder__icon">📊</span>
            <div class="compare-placeholder__title">优化前后能耗对比曲线</div>
            <div class="compare-placeholder__desc">蓝色=优化前 | 绿色=优化后</div>
          </div>
        </div>
        <div class="compare-card__stats">
          <div class="stat-row" v-for="(row, idx) in compareStats" :key="idx">
            <span class="stat-row__label">{{ row.label }}</span>
            <span class="stat-row__value" :class="row.cls">{{ row.value }}</span>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import { PlusOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'EnergyOptimization' })

// 自定义 emoji 图标组件
const BrainIcon = () => h('span', { style: 'font-size: 20px;' }, '🧠')
const LeafIcon = () => h('span', { style: 'font-size: 20px;' }, '🌿')
const MoneyIcon = () => h('span', { style: 'font-size: 20px;' }, '💰')
const EarthIcon = () => h('span', { style: 'font-size: 20px;' }, '🌍')

// 统计数据（模拟数据，可对接实际接口）
const statData = reactive({
  aiStrategyCount: '18',
  aiStrategyChange: '↑ 6 新增',
  energySaved: '156,780',
  energySavedChange: '↑ 12.3% kWh',
  savingRate: '23.5%',
  savingRateChange: '↑ 3.2% 较上月',
  carbonReduction: '89.6',
  carbonReductionChange: '↑ 8.7% 吨CO₂',
})

// AI 优化策略列表
const strategyList = reactive([
  {
    icon: '❄️',
    title: '空调冷机群控优化',
    desc: '基于负荷预测与室外温湿度，AI自动优化机组启停组合与出水温度设定，预计节能 15%',
    days: 45,
    saved: '23,456',
  },
  {
    icon: '💡',
    title: '照明按需调光策略',
    desc: '结合自然采光与人员分布，AI动态调节照明亮度，预计节能 20%',
    days: 30,
    saved: '8,234',
  },
  {
    icon: '🌀',
    title: '新风自适应控制',
    desc: '根据CO₂浓度与人员密度，AI自动调节新风量，保证空气质量同时降低能耗，预计节能 12%',
    days: 60,
    saved: '15,678',
  },
])
// 引用一次，抑制 vue-tsc 未使用警告（仅用于模板）
void strategyList

// 优化效果对比 - 策略下拉选项
const compareStrategy = ref<string>('freshAir')
const compareOptions = [
  { value: 'freshAir', label: '新风量自适应' },
  { value: 'acGroup', label: '空调冷机群控' },
  { value: 'lighting', label: '照明调光' },
]
void compareStrategy
void compareOptions

// 优化效果对比 - 统计数据
const compareStats = reactive([
  { label: '优化前日均能耗', value: '12,456 kWh', cls: 'default' },
  { label: '优化后日均能耗', value: '10,587 kWh', cls: 'highlight' },
  { label: '日均节能量', value: '1,869 kWh (15%)', cls: 'success' },
  { label: '累计节约成本', value: '¥ 45,678', cls: 'success' },
])
void compareStats

// 引用图标组件以抑制未使用警告
void PlusOutlined
</script>

<style scoped lang="less">
.energy-optimization-page {
  background: #f0f2f5;
  min-height: calc(100vh - 120px);
}

.stat-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.flow-card {
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  :deep(.ant-card-body) {
    padding: 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -16px 16px;
    padding: 0 16px 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }

  &__icon {
    font-size: 18px;
  }

  &__tag {
    display: inline-block;
    padding: 2px 10px;
    font-size:14px;
    color: #389e0d;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 4px;
  }

  &__body {
    height: 260px;
    border-radius: 8px;
    overflow: hidden;
  }

  .flow-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border: 2px dashed #95de64;
    border-radius: 8px;
    background: linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%);

    &__icon {
      font-size: 48px;
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__desc {
      font-size:16px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
}

// 底部左右两栏
.bottom-modules {
  display: flex;
  gap: 16px;
  margin-top: 20px;

  > * {
    flex: 1;
    min-width: 0;
  }
}

// 左侧：AI 优化策略
.strategy-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  :deep(.ant-card-body) {
    padding: 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -16px 16px;
    padding: 0 16px 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }

  &__icon {
    font-size: 18px;
  }

  &__add-btn {
    background: #1677ff;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .strategy-item {
    display: flex;
    gap: 12px;
    padding: 14px;
    background: #e6f4ff;
    border-left: 4px solid #1677ff;
    border-radius: 6px;

    &__icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border-radius: 8px;
      font-size: 22px;
    }

    &__body {
      flex: 1;
      min-width: 0;
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.88);
      margin-bottom: 4px;
    }

    &__desc {
      font-size:14px;
      color: rgba(0, 0, 0, 0.55);
      line-height: 1.5;
      margin-bottom: 6px;
    }

    &__meta {
      font-size:14px;
      color: rgba(0, 0, 0, 0.55);
      margin-bottom: 8px;
    }

    &__actions {
      display: flex;
      gap: 8px;
    }
  }
}

// 右侧：优化效果对比
.compare-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  :deep(.ant-card-body) {
    padding: 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -16px 16px;
    padding: 0 16px 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }

  &__icon {
    font-size: 18px;
  }

  &__select {
    width: 160px;
  }

  &__body {
    height: 250px;
    border-radius: 8px;
    overflow: hidden;
  }

  &__stats {
    margin-top: 12px;
  }

  .compare-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 2px dashed #91caff;
    border-radius: 8px;
    background: #f5f5f5;

    &__icon {
      font-size: 44px;
    }

    &__title {
      font-size:16px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__desc {
      font-size:14px;
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;

    & + & {
      border-top: 1px solid #f0f0f0;
    }

    &__label {
      font-size:16px;
      color: rgba(0, 0, 0, 0.65);
    }

    &__value {
      font-size:16px;
      font-weight: 600;

      &.default {
        color: rgba(0, 0, 0, 0.85);
      }

      &.highlight {
        color: #1677ff;
      }

      &.success {
        color: #52c41a;
      }
    }
  }
}
</style>
