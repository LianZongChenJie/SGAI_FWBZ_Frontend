<template>
  <div class="analysis-tab">
    <div class="stat-cards">
      <StatCard
        label="本月总耗电"
        :value="statData.electricCount"
        :change-text="statData.electricCountMoM"
        trend=""
        color="blue"
        :icon="ThunderIcon"
      />
      <StatCard
        label="本月总用水"
        :value="statData.waterCount"
        :change-text="statData.waterCountMoM"
        trend=""
        color="green"
        :icon="WaterDropIcon"
      />
      <StatCard
        label="日均耗电"
        :value="statData.electricAvg"
        :change-text="statData.electricAvgMom"
        trend=""
        color="orange"
        :icon="ChartIcon"
      />
      <StatCard
        label="环比节能"
        :value="statData.energySaving"
        :change-text="statData.energySavingMom"
        trend=""
        color="purple"
        :icon="LeafIcon"
      />
    </div>

    <!-- 能耗趋势分析模块 -->
    <a-card class="card trend-analysis-card" :bordered="false" :class="{ 'trend-fullscreen': fullscreen }">
      <div class="card-header">
        <h3>📈 能耗趋势分析</h3>
        <div class="card-actions">
          <a-radio-group v-model:value="dateType" button-style="solid">
            <a-radio-button value="date">日能耗</a-radio-button>
            <a-radio-button value="month">月能耗</a-radio-button>
            <a-radio-button value="year">年能耗</a-radio-button>
          </a-radio-group>
          <span class="date-label">日期：</span>
          <a-date-picker v-model:value="date" :picker="dateType" valueFormat="YYYY-MM-DD" />
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button @click="handleExport">导出</a-button>
          <button class="collapse-btn" @click="fullscreen = !fullscreen">
            <FullscreenOutlined v-if="!fullscreen" />
            <FullscreenExitOutlined v-else />
          </button>
          <button class="collapse-btn" @click="trendCollapsed = !trendCollapsed">
            <CaretDownOutlined v-if="!trendCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!trendCollapsed" class="card-body">
        <PointDataStatistics
          ref="pointDataStatisticsRef"
          v-model:dateType="dateType"
          v-model:date="date"
          v-model:time="time"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, h, ref } from 'vue'
import { FullscreenOutlined, FullscreenExitOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import PointDataStatistics from './pointDataStatistics/index.vue'
import { getStatistics } from './pointDataStatistics/index.api'

// 自定义 emoji 图标组件
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const LeafIcon = () => h('span', { style: 'font-size: 20px;' }, '🌿')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  electricCount: '--',
  electricCountMoM: '',
  waterCount: '--',
  waterCountMoM: '',
  electricAvg: '--',
  electricAvgMom: '',
  energySaving: '--',
  energySavingMom: '',
})

// 全屏查看
const fullscreen = ref(false)
// 折叠
const trendCollapsed = ref(false)

// 能耗趋势分析查询参数
const dateType = ref<string>('month')
const date = ref<string>()
const time = ref<string>()
const pointDataStatisticsRef = ref<InstanceType<typeof PointDataStatistics>>()

const handleQuery = () => {
  pointDataStatisticsRef.value?.findData()
}

const handleExport = () => {
  pointDataStatisticsRef.value?.handleExport()
}

// 加载计量分析统计数据
const loadAnalysisData = async () => {
  try {
    const res = await getStatistics()
    const data = res?.result || res?.data || res || {}
    Object.assign(statData, {
      electricCount: data.electricCount ?? statData.electricCount,
      electricCountMoM: data.electricCountMoM ?? statData.electricCountMoM,
      waterCount: data.waterCount ?? statData.waterCount,
      waterCountMoM: data.waterCountMoM ?? statData.waterCountMoM,
      electricAvg: data.electricAvg ?? statData.electricAvg,
      electricAvgMom: data.electricAvgMom ?? statData.electricAvgMom,
      energySaving: data.energySaving ?? statData.energySaving,
      energySavingMom: data.energySavingMom ?? statData.energySavingMom,
    })
  } catch (e) {
    console.error('加载计量分析统计数据失败:', e)
  }
}

onMounted(() => {
  loadAnalysisData()
})
</script>

<style scoped lang="less">
.analysis-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    overflow: hidden;

    :deep(.ant-card-body) {
      padding: 16px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -16px 16px;
      padding: 0 16px 12px;
      border-bottom: 1px solid #f0f0f0;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        font-size: 15px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }
    }

    .card-body {
      padding: 0;
    }
  }

  .trend-analysis-card {
    margin-top: 20px;

    .card-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .date-label {
        font-size:16px;
        color: #595959;
        margin-left: 8px;
      }
    }
  }

  .collapse-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size:14px;
    color: #666;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      color: #1677ff;
      border-color: #1677ff;
    }
  }

  .trend-fullscreen {
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
