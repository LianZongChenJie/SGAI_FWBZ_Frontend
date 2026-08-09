<template>
  <div class="ai-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="预测模型数" :value="12" change-text="↑ 3 新增" trend="up" color="blue" :icon="BrainIcon" />
      <StatCard label="预测准确率" :value="'94.5%'" change-text="↑ 1.8% 较上月" trend="up" color="green" :icon="TargetIcon" />
      <StatCard label="预警提前量" :value="'24-72h'" change-text="充足预警期" color="orange" :icon="ClockIcon" />
      <StatCard label="本月预警命中" :value="'28/30'" change-text="93.3% 命中率" trend="up" color="purple" :icon="HitIcon" />
    </div>

    <!-- AI报告卡片 -->
    <div class="ai-report-card">
      <div class="ai-report-header">
        <span class="ai-badge">AI</span>
        <span class="ai-report-title">设备运行趋势预测报告 - 未来7天</span>
      </div>
      <div class="ai-report-desc">
        本报告基于LSTM时序预测模型与XGBoost回归模型，对园区核心设备的能耗趋势、关键运行参数趋势进行未来7天预测。模型综合考虑历史运行数据、天气预报、展会排期、节假日因素等多维特征，预测结果置信区间95%。当前预测显示下周因高温天气与大型展会叠加，空调能耗预计上升25%，建议提前调整冷机运行策略。
      </div>
      <div class="ai-metrics">
        <div class="ai-metric">
          <div class="ai-metric-value">+25%</div>
          <div class="ai-metric-label">空调能耗预测</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">+18%</div>
          <div class="ai-metric-label">总用电量预测</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">3</div>
          <div class="ai-metric-label">高风险设备</div>
        </div>
        <div class="ai-metric">
          <div class="ai-metric-value">95%</div>
          <div class="ai-metric-label">预测置信度</div>
        </div>
      </div>
    </div>

    <!-- 两栏布局：能耗趋势预测 + 设备预警清单 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3>📈 能耗趋势预测</h3>
          <span class="tag tag-purple">AI预测</span>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">📊</div>
            <div class="chart-text">未来7天能耗预测曲线</div>
            <div class="chart-sub">实线=历史 | 虚线=预测 | 阴影=置信区间</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>⚠️ 设备预警清单</h3>
          <span class="tag tag-red">需关注</span>
        </div>
        <div class="card-body">
          <!-- 预警卡片 -->
          <div class="alert-card warning">
            <div class="alert-icon">❄️</div>
            <div class="alert-content">
              <div class="alert-title">AC-A-03 冷机效率衰减预警</div>
              <div class="alert-desc">预测未来72小时内COP值将下降至3.8以下，建议安排维保检查</div>
              <div class="alert-time">预测置信度 92% | 建议处理时间: 48h内</div>
            </div>
          </div>
          <div class="alert-card warning">
            <div class="alert-icon">⚡</div>
            <div class="alert-content">
              <div class="alert-title">PD-B-02 配电柜温度上升预警</div>
              <div class="alert-desc">预测未来48小时内柜内温度将超过45°C，建议检查散热风扇</div>
              <div class="alert-time">预测置信度 88% | 建议处理时间: 24h内</div>
            </div>
          </div>
          <div class="alert-card info">
            <div class="alert-icon">💡</div>
            <div class="alert-content">
              <div class="alert-title">LT-C-105 照明回路寿命预警</div>
              <div class="alert-desc">基于运行时长与开关次数预测，该回路驱动器剩余寿命约30天</div>
              <div class="alert-time">预测置信度 85% | 建议处理时间: 2周内</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能说明面板 -->
    <div class="feature-panel">
      <h4>📋 功能说明</h4>
      <p>通过AI分析设备运行数据，预测设备运行趋势，包括能耗趋势、设备参数运行趋势（预警）等。平台依托 AI 算法对设备历史与实时运行数据进行深度挖掘，构建多维度预测模型，精准预判设备未来运行趋势：一方面智能预测能耗变化趋势，为节能调控提供依据；另一方面实时跟踪电压、电流、温度、压力等关键参数运行趋势，提前识别异常偏移并发出预警，有效降低故障风险，实现从被动运维向主动预测、智能管控转变。</p>
      <div class="feature-list">
        <div class="feature-list-item">能耗变化趋势智能预测</div>
        <div class="feature-list-item">设备关键参数趋势跟踪</div>
        <div class="feature-list-item">异常偏移提前识别预警</div>
        <div class="feature-list-item">多维度预测模型构建</div>
        <div class="feature-list-item">负荷预测与调控建议</div>
        <div class="feature-list-item">故障风险概率评估</div>
        <div class="feature-list-item">预测准确率持续学习优化</div>
        <div class="feature-list-item">从被动运维到主动预测转变</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

defineOptions({ name: 'AiPredictPage' })

// emoji 图标
const BrainIcon = () => h('span', { style: 'font-size: 20px;' }, '🧠')
const TargetIcon = () => h('span', { style: 'font-size: 20px;' }, '🎯')
const ClockIcon = () => h('span', { style: 'font-size: 20px;' }, '⏰')
const HitIcon = () => h('span', { style: 'font-size: 20px;' }, '🎯')
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

// 告警卡片
.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid;

  &.danger {
    background: #fff5f5;
    border-left-color: #e53e3e;
  }
  &.warning {
    background: #fffaf0;
    border-left-color: #dd6b20;
  }
  &.info {
    background: #ebf8ff;
    border-left-color: #3182ce;
  }

  .alert-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  &.danger .alert-icon { background: #fed7d7; color: #e53e3e; }
  &.warning .alert-icon { background: #feebc8; color: #dd6b20; }
  &.info .alert-icon { background: #bee3f8; color: #3182ce; }

  .alert-content {
    flex: 1;

    .alert-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }
    .alert-desc {
      font-size: 12px;
      color: #718096;
      line-height: 1.5;
    }
    .alert-time {
      font-size: 11px;
      color: #a0aec0;
      margin-top: 6px;
    }
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
