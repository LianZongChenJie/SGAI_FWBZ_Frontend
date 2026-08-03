<template>
  <div class="event-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <StatCard label="待总结展会" :value="statData.pendingSummary" change-text="需出具报告" trend="up" color="blue" :icon="ScheduleOutlined" />
      <StatCard label="已总结展会" :value="statData.completedSummary" change-text="↑ 3 本月" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="报告生成" :value="statData.reportMode" change-text="自动+人工" trend="up" color="orange" :icon="RobotOutlined" />
      <StatCard label="知识库积累" :value="statData.knowledgeBase" change-text="↑ 12 条经验" trend="up" color="purple" :icon="BookOutlined" />
    </div>

    <!-- 展会总结报告 -->
    <div class="card">
      <div class="card-header">
        <h3><BarChartOutlined /> 展会总结报告 - 智能制造博览会</h3>
        <div class="header-actions">
          <a-button>导出PDF</a-button>
          <a-button type="primary">AI生成</a-button>
        </div>
      </div>
      <div class="card-body">
        <!-- 三栏数据 -->
        <div class="three-col">
          <!-- 人员服务 -->
          <div class="report-group">
            <h4 class="group-title">人员服务</h4>
            <div class="info-list">
              <div class="info-item" v-for="item in personnelData" :key="item.label">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value" :style="{ color: item.color || '#2d3748' }">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <!-- 设备与能耗 -->
          <div class="report-group">
            <h4 class="group-title">设备与能耗</h4>
            <div class="info-list">
              <div class="info-item" v-for="item in deviceData" :key="item.label">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value" :style="{ color: item.color || '#2d3748' }">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <!-- 会展数据 -->
          <div class="report-group">
            <h4 class="group-title">会展数据</h4>
            <div class="info-list">
              <div class="info-item" v-for="item in exhibitionData" :key="item.label">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value" :style="{ color: item.color || '#2d3748' }">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI优化建议 -->
        <div class="suggestions-section">
          <h4 class="group-title">优化建议（AI生成）</h4>
          <div class="suggestion-list">
            <div class="suggestion-item" v-for="item in suggestions" :key="item">
              {{ item }}
            </div>
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
  RobotOutlined,
  BookOutlined,
  BarChartOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'EventPostPage' })

const statData = {
  pendingSummary: 2,
  completedSummary: 18,
  reportMode: 'AI',
  knowledgeBase: 156,
}

const colorGreen = '#38a169'

const personnelData: { label: string; value: string; color?: string }[] = [
  { label: '总服务人次', value: '45,678' },
  { label: '投诉数量', value: '5' },
  { label: '建议数量', value: '23' },
  { label: '满意度评分', value: '4.6/5.0', color: colorGreen },
  { label: '安保出勤', value: '128人次/天' },
]

const deviceData: { label: string; value: string; color?: string }[] = [
  { label: '设备故障数', value: '12' },
  { label: '平均修复时长', value: '18分钟' },
  { label: '总用电量', value: '356,789 kWh' },
  { label: '能耗预算比', value: '95.2%', color: colorGreen },
  { label: '单人次能耗', value: '7.8 kWh' },
]

const exhibitionData: { label: string; value: string; color?: string }[] = [
  { label: '展会天数', value: '3天' },
  { label: '总客流', value: '45,678' },
  { label: '峰值客流', value: '8,234' },
  { label: '参展商数', value: '256家' },
  { label: '应急响应', value: '2次' },
]

const suggestions = [
  '建议A馆F2层空调提前30分钟预冷，可降低开展初期能耗峰值15%',
  'B馆会议室音响设备建议增加日常巡检频次，减少展会期间故障',
  'C馆室外广场建议增设临时遮阳设施，提升参展商满意度',
  '安保人员部署建议根据客流预测动态调整，可优化人力成本10%',
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

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .card-body { padding: 22px; }
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.report-group {
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

.suggestions-section {
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

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .suggestion-item {
    font-size: 12px;
    color: #5a6a8a;
    padding: 10px 14px;
    background: #f7fafc;
    border-radius: 6px;
    display: flex;
    align-items: flex-start;
    gap: 8px;

    &::before {
      content: '✓';
      color: #52c41a;
      font-weight: 700;
      flex-shrink: 0;
    }
  }
}
</style>
