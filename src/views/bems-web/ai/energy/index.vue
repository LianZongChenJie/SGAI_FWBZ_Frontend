<template>
  <div class="ai-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="AI优化策略" :value="18" change-text="↑ 6 新增" trend="up" color="blue" :icon="BrainIcon" />
      <StatCard label="累计节能量" :value="'156,780'" change-text="↑ 12.3% kWh" trend="up" color="green" :icon="LeafIcon" />
      <StatCard label="节约费用" :value="'¥187,536'" change-text="↑ 15.6% 累计" trend="up" color="orange" :icon="MoneyIcon" />
      <StatCard label="ROI" :value="'325%'" change-text="投资回报" trend="up" color="purple" :icon="TrendIcon" />
    </div>

    <!-- AI报告卡片 -->
    <div class="ai-report-card">
      <div class="ai-report-header">
        <span class="ai-badge">AI</span>
        <span class="ai-report-title">AI节能效果分析报告 - 2026年Q2</span>
      </div>
      <div class="ai-report-desc">
        本报告基于AI对园区Q2季度用能数据的全面分析，对比优化策略实施前后的能耗变化。通过建立负荷特性模型、环境响应模型、设备效率模型，量化分析各优化策略的实际节能效果。报告显示，空调冷机群控优化策略贡献最大节能量（45%），照明按需调光次之（28%），新风量自适应控制贡献（18%），其他策略贡献（9%）。
      </div>
      <div class="ai-metrics">
        <div class="ai-metric">
          <div class="ai-metric-value">45,678</div>
          <div class="ai-metric-label">Q2节能量(kWh)</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">¥54,814</div>
          <div class="ai-metric-label">Q2节约费用</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">18.5%</div>
          <div class="ai-metric-label">综合节能率</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">28.6</div>
          <div class="ai-metric-label">减排CO₂(吨)</div>
        </div>
      </div>
    </div>

    <!-- 各策略节能效果对比 -->
    <div class="card">
      <div class="card-header">
        <h3>📊 各策略节能效果对比</h3>
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
            <template v-if="column.key === 'savingRate'">
              <span style="color: #38a169; font-weight: 500;">{{ record.savingRate }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text normal">{{ record.status }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 功能说明面板 -->
    <div class="feature-panel">
      <h4>📋 功能说明</h4>
      <p>AI分析用能数据，包括历史用能、AI优化后用能的数据分析报告。平台通过 AI 智能分析园区历史用能数据，结合负荷特性、环境条件、设备效率等多维信息，建立用能模型，形成历史用能分析报告；并基于智能优化算法输出优化策略，生成AI 优化后用能对比分析报告，直观展示节能潜力、优化效果与降本收益，为节能决策与能效提升提供数据支撑。</p>
      <div class="feature-list">
        <div class="feature-list-item">历史用能数据深度分析</div>
        <div class="feature-list-item">负荷特性与环境条件关联建模</div>
        <div class="feature-list-item">设备效率基准线建立</div>
        <div class="feature-list-item">用能模型自动构建</div>
        <div class="feature-list-item">智能优化策略生成</div>
        <div class="feature-list-item">优化前后对比分析</div>
        <div class="feature-list-item">节能潜力与收益量化</div>
        <div class="feature-list-item">投资回报ROI分析</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

defineOptions({ name: 'AiEnergyPage' })

// emoji 图标
const BrainIcon = () => h('span', { style: 'font-size: 20px;' }, '🧠')
const LeafIcon = () => h('span', { style: 'font-size: 20px;' }, '🌿')
const MoneyIcon = () => h('span', { style: 'font-size: 20px;' }, '💰')
const TrendIcon = () => h('span', { style: 'font-size: 20px;' }, '📈')

const columns = [
  { title: '策略名称', dataIndex: 'name', key: 'name' },
  { title: '实施日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: '优化前日均', dataIndex: 'beforeAvg', key: 'beforeAvg', width: 120 },
  { title: '优化后日均', dataIndex: 'afterAvg', key: 'afterAvg', width: 120 },
  { title: '日节能量', dataIndex: 'dailySaving', key: 'dailySaving', width: 110 },
  { title: '节能率', dataIndex: 'savingRate', key: 'savingRate', width: 80 },
  { title: '累计节约', dataIndex: 'totalSaving', key: 'totalSaving', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
]

const tableData = [
  { id: 1, name: '空调冷机群控优化', startDate: '2026-04-15', beforeAvg: '12,456 kWh', afterAvg: '10,587 kWh', dailySaving: '1,869 kWh', savingRate: '15.0%', totalSaving: '¥67,234', status: '运行中' },
  { id: 2, name: '照明按需调光策略', startDate: '2026-04-20', beforeAvg: '4,567 kWh', afterAvg: '3,654 kWh', dailySaving: '913 kWh', savingRate: '20.0%', totalSaving: '¥32,890', status: '运行中' },
  { id: 3, name: '新风量自适应控制', startDate: '2026-03-01', beforeAvg: '3,456 kWh', afterAvg: '3,041 kWh', dailySaving: '415 kWh', savingRate: '12.0%', totalSaving: '¥14,950', status: '运行中' },
  { id: 4, name: '电梯群控优化', startDate: '2026-05-10', beforeAvg: '1,234 kWh', afterAvg: '1,111 kWh', dailySaving: '123 kWh', savingRate: '10.0%', totalSaving: '¥4,430', status: '运行中' },
]
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
  .ai-report-card .ai-metrics { grid-template-columns: repeat(2, 1fr); }
}
</style>
