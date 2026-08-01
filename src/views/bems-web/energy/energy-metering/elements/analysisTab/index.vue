<template>
  <div class="analysis-tab">
    <div class="stat-cards">
      <StatCard
        label="本月总耗电"
        :value="statData.monthlyPower"
        :change-text="statData.monthlyPowerChange"
        trend="up"
        color="blue"
        :icon="ThunderIcon"
      />
      <StatCard
        label="本月总用水"
        :value="statData.monthlyWater"
        :change-text="statData.monthlyWaterChange"
        trend="down"
        color="green"
        :icon="WaterDropIcon"
      />
      <StatCard
        label="日均耗电"
        :value="statData.dailyAvgPower"
        :change-text="statData.dailyAvgPowerChange"
        trend="up"
        color="orange"
        :icon="ChartIcon"
      />
      <StatCard
        label="环比节能"
        :value="statData.energySaving"
        :change-text="statData.energySavingChange"
        trend="up"
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
          <a-button :icon="h(VerticalAlignBottomOutlined)" @click="handleExport">导出</a-button>
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
import { VerticalAlignBottomOutlined } from '@ant-design/icons-vue'

// 自定义 emoji 图标组件
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const LeafIcon = () => h('span', { style: 'font-size: 20px;' }, '🌿')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  monthlyPower: '198,456',
  monthlyPowerChange: '5.2% kWh',
  monthlyWater: '5,234',
  monthlyWaterChange: '3.1% m³',
  dailyAvgPower: '22,050',
  dailyAvgPowerChange: '2.8% kWh',
  energySaving: '8.5%',
  energySavingChange: '1.2% 较上月',
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

// 加载计量分析数据（预留接口）
const loadAnalysisData = async () => {
  // TODO: 调用计量分析数据接口
  console.log('加载计量分析数据')
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
