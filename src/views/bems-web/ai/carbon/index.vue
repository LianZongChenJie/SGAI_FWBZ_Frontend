<template>
  <div class="ai-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="监测能源类型" :value="4" change-text="电/水/气/热" color="blue" :icon="ThunderIcon" />
      <StatCard label="今日碳排放" :value="28.5" change-text="↓ 3.2% 吨CO₂" trend="down" color="green" :icon="GlobeIcon" />
      <StatCard label="本月累计碳排" :value="856.3" change-text="↓ 5.8% 吨CO₂" trend="down" color="orange" :icon="ChartDownIcon" />
      <StatCard label="碳强度" :value="0.45" change-text="↓ 8.2% kgCO₂/㎡" trend="down" color="purple" :icon="ChartIcon" />
    </div>

    <!-- AI报告卡片 -->
    <div class="ai-report-card">
      <div class="ai-report-header">
        <span class="ai-badge">AI</span>
        <span class="ai-report-title">多模态能碳计算报告 - 2026年6月</span>
      </div>
      <div class="ai-report-desc">
        本报告基于会展小镇内电、水、气、热四类能源的实时计量数据，融合物理机理模型与机器学习算法，对园区能碳排放进行多维度精准核算。报告涵盖空间维度（场馆/楼层/区域）、时间维度（日/周/月/年）、用途维度（空调/照明/动力/生活）的能碳分析，并结合展会活动排期数据，识别能碳异常与优化空间。
      </div>
      <div class="ai-metrics">
        <div class="ai-metric">
          <div class="ai-metric-value">856.3</div>
          <div class="ai-metric-label">本月碳排(吨CO₂)</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">-5.8%</div>
          <div class="ai-metric-label">环比变化</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">0.45</div>
          <div class="ai-metric-label">碳强度(kg/㎡)</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">12.3%</div>
          <div class="ai-metric-label">减排潜力</div>
        </div>
      </div>
    </div>

    <!-- 两栏布局：碳排放结构分析 + 碳排放趋势 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3>🌍 碳排放结构分析</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">🍩</div>
            <div class="chart-text">碳排放来源占比</div>
            <div class="chart-sub">电力 68% | 天然气 22% | 热力 7% | 其他 3%</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>📈 碳排放趋势</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">📊</div>
            <div class="chart-text">月度碳排放趋势与目标对比</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能说明面板 -->
    <div class="feature-panel">
      <h4>📋 功能说明</h4>
      <p>结合会展小镇内的能耗数据，通过不同场景开展能碳计算，并生成运行报告。多模态能碳计算功能，整合电、水、气等多类型能源数据，融合物理机理模型与机器学习算法，实现多维度能碳精准核算、实时监测与动态预测。可自动适配园区不同用能场景，快速生成能碳分析报告，支撑碳减排决策，助力园区实现能碳精细化管理与 "双碳" 目标落地。</p>
      <div class="feature-list">
        <div class="feature-list-item">电/水/气/热多能源碳排放因子库</div>
        <div class="feature-list-item">物理机理模型与机器学习融合计算</div>
        <div class="feature-list-item">多维度能碳精准核算（空间/时间/用途）</div>
        <div class="feature-list-item">能碳实时监测与动态预测</div>
        <div class="feature-list-item">场景自适应能碳计算引擎</div>
        <div class="feature-list-item">能碳分析报告自动生成</div>
        <div class="feature-list-item">碳减排路径规划与效果评估</div>
        <div class="feature-list-item">双碳目标进度追踪看板</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

defineOptions({ name: 'AiCarbonPage' })

// emoji 图标
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const GlobeIcon = () => h('span', { style: 'font-size: 20px;' }, '🌍')
const ChartDownIcon = () => h('span', { style: 'font-size: 20px;' }, '📉')
const ChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
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

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-green { background: #c6f6d5; color: #22543d; }
    .tag-blue { background: #bee3f8; color: #2a4365; }
    .tag-orange { background: #feebc8; color: #744210; }
    .tag-red { background: #fed7d7; color: #742a2a; }
    .tag-purple { background: #e9d8fd; color: #553c9a; }
  }

  .card-body {
    padding: 22px;
  }
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
