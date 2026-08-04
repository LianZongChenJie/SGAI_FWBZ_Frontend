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
    <div class="trend-analysis-card">
      <div class="card-header">
        <div class="card-title-wrap">
          <span class="card-title">📈 能耗趋势分析</span>
        </div>
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
        </div>
      </div>
      <div class="card-body">
        <PointDataStatistics
          ref="pointDataStatisticsRef"
          v-model:dateType="dateType"
          v-model:date="date"
          v-model:time="time"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, h, ref } from 'vue'
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
  electricCount: '',
  electricCountMoM: '',
  waterCount: '',
  waterCountMoM: '',
  electricAvg: '',
  electricAvgMom: '',
  energySaving: '',
  energySavingMom: '',
})

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

  .trend-analysis-card {
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
        align-items: center;
        gap: 12px;

        .date-label {
          font-size: 14px;
          color: #595959;
          margin-left: 8px;
        }

        :deep(.ant-radio-button-wrapper) {
          color: #595959;
        }

        :deep(.ant-radio-button-wrapper-checked) {
          color: #fff;
          background-color: #1890ff;
          border-color: #1890ff;
        }

        :deep(.ant-btn-primary) {
          background-color: #1890ff;
          border-color: #1890ff;
        }
      }
    }

    .card-body {
      min-height: 120px;
      padding: 22px;
    }
  }
}
</style>
