<template>
  <div class="event-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <StatCard label="待筹备展会" :value="statData.pendingEvents" change-text="↑ 2 新增" trend="up" color="blue" :icon="ScheduleOutlined" />
      <StatCard label="筹备完成率" :value="statData.completionRate" change-text="↑ 12.3% 较上周" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="明日开展" :value="statData.tomorrowOpen" change-text="数字文创交易会" trend="up" color="orange" :icon="CalendarOutlined" />
      <StatCard label="会前检查项" :value="statData.checkItems" change-text="全部覆盖" trend="up" color="purple" :icon="AuditOutlined" />
    </div>

    <!-- 会前筹备清单 -->
    <div class="card">
      <div class="card-header">
        <h3><ScheduleOutlined /> 会前筹备清单</h3>
        <span class="tag tag-blue">数字文创交易会 | 2026-06-10</span>
      </div>
      <div class="card-body">
        <div class="three-col">
          <!-- 配电与环境 -->
          <div class="checklist-group">
            <h4 class="group-title">配电与环境</h4>
            <div class="info-list">
              <div class="info-item" v-for="item in powerEnv" :key="item.label">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value" :style="{ color: item.color }">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <!-- 安保与消防 -->
          <div class="checklist-group">
            <h4 class="group-title">安保与消防</h4>
            <div class="info-list">
              <div class="info-item" v-for="item in securityFire" :key="item.label">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value" :style="{ color: item.color }">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <!-- 物资与人员 -->
          <div class="checklist-group">
            <h4 class="group-title">物资与人员</h4>
            <div class="info-list">
              <div class="info-item" v-for="item in materials" :key="item.label">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value" :style="{ color: item.color }">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 筹备进度 -->
        <div class="progress-section">
          <h4 class="group-title">筹备进度</h4>
          <div class="progress-item" v-for="item in progressData" :key="item.label">
            <span class="progress-label">{{ item.label }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :class="item.color" :style="{ width: item.value + '%' }"></div>
            </div>
            <span class="progress-value" :style="{ color: item.value >= 80 ? '#38a169' : '#dd6b20' }">{{ item.value }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 会前数据预测研判 -->
    <div class="card">
      <div class="card-header">
        <h3><BarChartOutlined /> 会前数据预测研判</h3>
        <span class="tag tag-purple">AI辅助</span>
      </div>
      <div class="card-body">
        <div class="two-col">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">展会能耗预测曲线</div>
            <div class="chart-sub">基于历史同类展会数据与天气预测</div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">客流预测分布</div>
            <div class="chart-sub">预测峰值 6,500人 | 出现在 11:00-13:00</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { StatCard } from '/@/views/bems-web/components'
import {
  ScheduleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  AuditOutlined,
  BarChartOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'EventPrePage' })

const statData = {
  pendingEvents: 5,
  completionRate: '78.5%',
  tomorrowOpen: 1,
  checkItems: 45,
}

const colorDone = '#38a169'
const colorPending = '#dd6b20'

const powerEnv = [
  { label: '配电容量评估', value: '✅ 已完成', color: colorDone },
  { label: '负荷预测', value: '✅ 已完成', color: colorDone },
  { label: '空调预冷', value: '⏳ 明日06:00', color: colorPending },
  { label: '照明场景预设', value: '✅ 已完成', color: colorDone },
  { label: '温湿度目标设定', value: '✅ 24°C/55%', color: colorDone },
]

const securityFire = [
  { label: '安保方案审批', value: '✅ 已通过', color: colorDone },
  { label: '安保人员部署', value: '✅ 32人已安排', color: colorDone },
  { label: '消防设备检查', value: '✅ 全部正常', color: colorDone },
  { label: '应急通道检查', value: '✅ 畅通', color: colorDone },
  { label: '消防演练', value: '⏳ 今日16:00', color: colorPending },
]

const materials = [
  { label: '应急物资准备', value: '✅ 已到位', color: colorDone },
  { label: '人员值班排班', value: '✅ 已发布', color: colorDone },
  { label: '人员培训', value: '✅ 已完成', color: colorDone },
  { label: '设备巡检', value: '⏳ 今日18:00', color: colorPending },
  { label: '系统联调测试', value: '✅ 已通过', color: colorDone },
]

const progressData = [
  { label: '总体进度', value: 78.5, color: 'green' },
  { label: '配电环境', value: 90, color: 'green' },
  { label: '安保消防', value: 85, color: 'green' },
  { label: '物资人员', value: 60, color: 'orange' },
]

</script>

<style scoped lang="less">
.event-page { padding: 0; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;

  .card-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-blue { background: #bee3f8; color: #2a4365; }
    .tag-purple { background: #e9d8fd; color: #553c9a; }
  }

  .card-body { padding: 22px; }
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.checklist-group {
  .group-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 14px;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .info-label {
      font-size: 13px;
      color: #718096;
    }

    .info-value {
      font-size: 13px;
      font-weight: 600;
    }
  }
}

.progress-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .group-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;
  }
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;

  &:last-child { margin-bottom: 0; }

  .progress-label {
    font-size: 13px;
    color: #4a5568;
    min-width: 80px;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #edf2f7;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;

    &.green { background: #38a169; }
    &.orange { background: #dd6b20; }
  }

  .progress-value {
    font-size: 13px;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }
}

.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 280px;
  padding: 30px;

  .chart-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .chart-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }

  .chart-sub {
    font-size: 12px;
    color: #a0aec0;
    margin-top: 8px;
  }
}
</style>
