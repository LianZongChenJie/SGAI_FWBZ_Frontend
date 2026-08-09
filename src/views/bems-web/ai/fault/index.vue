<template>
  <div class="ai-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="本月故障数" :value="45" change-text="↓ 12 较上月" trend="down" color="blue" :icon="WrenchIcon" />
      <StatCard label="AI预判命中" :value="'38/45'" change-text="84.4% 命中率" trend="up" color="green" :icon="TargetIcon" />
      <StatCard label="平均修复时长" :value="'32min'" change-text="↓ 8min 较上月" trend="down" color="orange" :icon="StopwatchIcon" />
      <StatCard label="非计划停机" :value="2" change-text="↓ 5 较上月" trend="down" color="purple" :icon="StopIcon" />
    </div>

    <!-- AI报告卡片 -->
    <div class="ai-report-card">
      <div class="ai-report-header">
        <span class="ai-badge">AI</span>
        <span class="ai-report-title">设备故障智能分析报告 - 2026年6月</span>
      </div>
      <div class="ai-report-desc">
        本报告基于AI对6月份45起设备故障的深度分析，结合故障前运行数据、告警信息、历史故障记录，识别故障根因与潜在规律。通过关联分析发现，68%的空调故障与滤网堵塞相关，45%的照明故障与驱动器老化相关。报告提供设备维保优先级排序、备件采购建议、预防性维护计划优化方案。
      </div>
      <div class="ai-metrics">
        <div class="ai-metric">
          <div class="ai-metric-value">45</div>
          <div class="ai-metric-label">本月故障</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">84.4%</div>
          <div class="ai-metric-label">AI预判命中</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">32min</div>
          <div class="ai-metric-label">平均修复</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">2</div>
          <div class="ai-metric-label">非计划停机</div>
        </div>
      </div>
    </div>

    <!-- 两栏布局：故障类型分布 + 故障位置分布 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3>📊 故障类型分布</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">📊</div>
            <div class="chart-text">故障类型帕累托图</div>
            <div class="chart-sub">空调 35% | 照明 25% | 消防 15% | 楼控 15% | 其他 10%</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>📍 故障位置分布</h3>
        </div>
        <div class="card-body">
          <div class="map-placeholder">
            <div class="map-icon">🗺️</div>
            <div class="map-text">故障点位热力分布图</div>
            <div class="map-sub">红色=高频故障区 | 黄色=中频 | 绿色=低频</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备维保优先级建议 -->
    <div class="card">
      <div class="card-header">
        <h3>🔧 设备维保优先级建议（AI生成）</h3>
        <a-button type="primary">📥 导出维保计划</a-button>
      </div>
      <div class="card-body">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="{ pageSize: 10 }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'priority'">
              <span class="status-text" :class="record.priorityClass">{{ record.priority }}</span>
            </template>
            <template v-if="column.key === 'riskScore'">
              <span :style="{ color: getRiskColor(record.riskScore), fontWeight: 500 }">{{ record.riskScore }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 功能说明面板 -->
    <div class="feature-panel">
      <h4>📋 功能说明</h4>
      <p>AI分析故障数据，包括故障类型、故障频率、故障设备种类、故障位置、故障前设备运行数据等，综合分析后产生分析报告，为设备更换、维保、维修等工作提供数据支撑。平台基于 AI 算法对设备运行数据、告警信息、历史故障记录进行智能诊断与关联分析，自动生成AI 故障分析报告。报告可精准定位故障类型、发生时段、异常参数及潜在诱因，给出故障等级、影响范围与处理建议，实现从被动告警向主动预判、快速处置转变，提升设备可靠性与运维效率，降低非计划停机风险。</p>
      <div class="feature-list">
        <div class="feature-list-item">故障类型自动分类与统计</div>
        <div class="feature-list-item">故障频率趋势分析</div>
        <div class="feature-list-item">故障设备种类与位置分布</div>
        <div class="feature-list-item">故障前运行数据回溯分析</div>
        <div class="feature-list-item">故障关联规则挖掘</div>
        <div class="feature-list-item">故障等级与影响范围评估</div>
        <div class="feature-list-item">维保/维修/更换决策建议</div>
        <div class="feature-list-item">非计划停机风险预测</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

defineOptions({ name: 'AiFaultPage' })

// emoji 图标
const WrenchIcon = () => h('span', { style: 'font-size: 20px;' }, '🔧')
const TargetIcon = () => h('span', { style: 'font-size: 20px;' }, '🎯')
const StopwatchIcon = () => h('span', { style: 'font-size: 20px;' }, '⏱️')
const StopIcon = () => h('span', { style: 'font-size: 20px;' }, '🛑')

const columns = [
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '设备', dataIndex: 'device', key: 'device' },
  { title: '位置', dataIndex: 'location', key: 'location', width: 120 },
  { title: '故障频次', dataIndex: 'frequency', key: 'frequency', width: 100 },
  { title: 'AI风险评分', dataIndex: 'riskScore', key: 'riskScore', width: 110 },
  { title: '建议措施', dataIndex: 'suggestion', key: 'suggestion' },
  { title: '建议时间', dataIndex: 'suggestedTime', key: 'suggestedTime', width: 100 },
]

const tableData = [
  { id: 1, priority: '紧急', priorityClass: 'danger', device: 'AC-A-03 冷机', location: 'A馆-机房', frequency: '5次/月', riskScore: '92/100', suggestion: '更换压缩机', suggestedTime: '7日内' },
  { id: 2, priority: '重要', priorityClass: 'warning', device: 'LT-B-105 驱动器', location: 'B馆-F2', frequency: '4次/月', riskScore: '78/100', suggestion: '预防性更换', suggestedTime: '14日内' },
  { id: 3, priority: '重要', priorityClass: 'warning', device: 'SMK-C-201 烟感', location: 'C馆-F3', frequency: '3次/月', riskScore: '65/100', suggestion: '线路检修', suggestedTime: '14日内' },
  { id: 4, priority: '一般', priorityClass: 'info', device: 'PD-A-02 配电柜', location: 'A馆-配电室', frequency: '2次/月', riskScore: '45/100', suggestion: '清洁散热', suggestedTime: '30日内' },
]

function getRiskColor(score: string): string {
  const num = parseInt(score, 10)
  if (isNaN(num)) return '#86909c'
  if (num >= 80) return '#e53e3e'
  if (num >= 60) return '#dd6b20'
  return '#3182ce'
}
</script>

<style scoped lang="less">
.ai-page { padding: 0; }

// 统计卡片行
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

// 两栏布局
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

// 卡片
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

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }
  }

  .card-body {
    padding: 22px;
  }
}

// 状态标签
.status-text {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;

  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
  &.info { background: #bee3f8; color: #2a4365; }
}

// 图表占位
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

// 地图占位
.map-placeholder {
  background: linear-gradient(135deg, #e6fffa 0%, #ebf8ff 100%);
  border-radius: 10px;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #4a5568;
  border: 2px dashed #81e6d9;
  padding: 30px;

  .map-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }
  .map-text {
    font-size: 15px;
    font-weight: 500;
  }
  .map-sub {
    font-size: 12px;
    color: #718096;
    margin-top: 8px;
  }
}

// AI报告卡片
.ai-report-card {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;

  .ai-report-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .ai-badge {
      background: linear-gradient(135deg, #805ad5, #6b46c1);
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .ai-report-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
    }
  }

  .ai-report-desc {
    font-size: 13px;
    color: #718096;
    line-height: 1.7;
    margin-bottom: 16px;
  }

  .ai-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;

    .ai-metric {
      background: white;
      padding: 14px;
      border-radius: 8px;
      text-align: center;

      .ai-metric-value {
        font-size: 20px;
        font-weight: 700;
        color: #2d3748;
      }
      .ai-metric-label {
        font-size: 11px;
        color: #a0aec0;
        margin-top: 4px;
      }
    }
  }
}

// 功能说明面板
.feature-panel {
  background: linear-gradient(135deg, #ebf8ff 0%, #f7fafc 100%);
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 16px;
  border: 1px solid #bee3f8;

  h4 {
    font-size: 14px;
    color: #2a4365;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    font-size: 13px;
    color: #4a5568;
    line-height: 1.7;
  }

  .feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 12px;

    .feature-list-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: #4a5568;
      line-height: 1.5;

      &::before {
        content: '✓';
        color: #38a169;
        font-weight: 700;
        flex-shrink: 0;
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
  .ai-report-card .ai-metrics { grid-template-columns: repeat(2, 1fr); }
}
</style>
