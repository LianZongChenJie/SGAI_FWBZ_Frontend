<template>
  <div class="ai-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="报告生成数" :value="45" change-text="↑ 12 本月" trend="up" color="blue" :icon="DocIcon" />
      <StatCard label="覆盖设备" :value="'2,456'" change-text="全部核心设备" color="green" :icon="GearIcon" />
      <StatCard label="分析维度" :value="8" change-text="多维度" color="orange" :icon="ChartIcon" />
      <StatCard label="报告准确率" :value="'96.5%'" change-text="↑ 2.3% 较上月" trend="up" color="purple" :icon="TargetIcon" />
    </div>

    <!-- AI报告卡片 -->
    <div class="ai-report-card">
      <div class="ai-report-header">
        <span class="ai-badge">AI</span>
        <span class="ai-report-title">园区设备运行综合分析报告 - 2026年6月第2周</span>
      </div>
      <div class="ai-report-desc">
        本报告基于AI对园区2,456台核心设备的运行数据、156条告警记录及能耗数据进行深度分析。通过时序分析、聚类分析、关联规则挖掘等技术，识别出设备运行中的异常模式、能效瓶颈及潜在故障风险。报告覆盖设备健康度、能效水平、告警处置效率、运行稳定性四大维度，并提供针对性的优化建议。
      </div>
      <div class="ai-metrics">
        <div class="ai-metric">
          <div class="ai-metric-value">97.8%</div>
          <div class="ai-metric-label">设备健康度</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">85.2%</div>
          <div class="ai-metric-label">平均能效</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">12.5min</div>
          <div class="ai-metric-label">告警响应</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">99.2%</div>
          <div class="ai-metric-label">运行稳定</div>
        </div>
      </div>
    </div>

    <!-- 报告列表 -->
    <div class="card">
      <div class="card-header">
        <h3>📄 报告列表</h3>
        <div class="filter-bar">
          <a-select v-model:value="typeFilter" style="width: 140px" placeholder="全部类型">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="整体">整体报告</a-select-option>
            <a-select-option value="分区">分区报告</a-select-option>
            <a-select-option value="单台">单台设备报告</a-select-option>
          </a-select>
          <a-button type="primary">🤖 生成新报告</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="columns"
          :data-source="filteredData"
          :pagination="{ pageSize: 10 }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <span class="status-text" :class="getTypeClass(record.type)">{{ record.type }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text normal">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">查看</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 功能说明面板 -->
    <div class="feature-panel">
      <h4>📋 功能说明</h4>
      <p>通过AI分析设备运行数据、告警数据等内容，生成整体及部分的运行报告。依托 AI 技术，深度分析核心用能设备的实时运行数据、故障告警数据及能耗数据，自动挖掘数据背后的运行规律、异常隐患及能效短板。可生成园区整体及各分区、各单台设备的运行报告，清晰呈现设备运行状态、能效水平、告警处置情况及优化建议，为设备运维、能耗管控提供数据支撑，提升园区能源管理的智能化与精细化水平。</p>
      <div class="feature-list">
        <div class="feature-list-item">设备运行数据深度挖掘分析</div>
        <div class="feature-list-item">故障告警数据模式识别</div>
        <div class="feature-list-item">能耗数据异常检测与归因</div>
        <div class="feature-list-item">运行规律自动发现</div>
        <div class="feature-list-item">能效短板智能诊断</div>
        <div class="feature-list-item">整体/分区/单台设备报告</div>
        <div class="feature-list-item">优化建议自动生成</div>
        <div class="feature-list-item">报告准确率持续优化</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

defineOptions({ name: 'AiReportPage' })

// emoji 图标
const DocIcon = () => h('span', { style: 'font-size: 20px;' }, '📄')
const GearIcon = () => h('span', { style: 'font-size: 20px;' }, '⚙️')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const TargetIcon = () => h('span', { style: 'font-size: 20px;' }, '🎯')

const typeFilter = ref('')

const columns = [
  { title: '报告名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '分析范围', dataIndex: 'scope', key: 'scope' },
  { title: '生成时间', dataIndex: 'time', key: 'time', width: 160 },
  { title: '数据量', dataIndex: 'dataCount', key: 'dataCount', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 80 },
]

const tableData = [
  { id: 1, name: '园区整体运行周报', type: '整体', scope: '全园区', time: '2026-06-09 06:00', dataCount: '2,456设备/156告警', status: '已完成' },
  { id: 2, name: 'A馆空调机组专项分析', type: '分区', scope: 'A馆/空调', time: '2026-06-08 18:00', dataCount: '12机组/8告警', status: '已完成' },
  { id: 3, name: 'AC-A-01单台设备诊断', type: '单台', scope: 'AC-A-01', time: '2026-06-08 14:00', dataCount: '1设备/3告警', status: '已完成' },
  { id: 4, name: '照明系统能效评估', type: '分区', scope: '全园区/照明', time: '2026-06-07 20:00', dataCount: '2,340回路/5告警', status: '已完成' },
]

const filteredData = computed(() => {
  if (!typeFilter.value) return tableData
  return tableData.filter((item) => item.type === typeFilter.value)
})

function getTypeClass(type: string): string {
  if (type === '整体') return 'info'
  if (type === '分区') return 'warning'
  if (type === '单台') return 'normal'
  return 'info'
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

    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
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
