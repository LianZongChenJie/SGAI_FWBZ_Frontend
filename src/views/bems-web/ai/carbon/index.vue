<template>
  <div class="ai-page">
    <div class="stats-row">
      <StatCard label="总碳排放量" :value="statData.totalCarbon" change-text="↓ 8.5% 较上月" trend="down" color="blue" :icon="EnvironmentOutlined" />
      <StatCard label="电力碳排放" :value="statData.electricCarbon" change-text="↓ 5.2% 较上月" trend="down" color="green" :icon="ThunderboltOutlined" />
      <StatCard label="天然气碳排放" :value="statData.gasCarbon" change-text="↓ 12.3% 较上月" trend="down" color="orange" :icon="FireOutlined" />
      <StatCard label="碳减排量" :value="statData.carbonReduction" change-text="↑ 15.8% 较上月" trend="up" color="purple" :icon="CheckCircleOutlined" />
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 碳排放趋势分析</h3>
          <div class="btn-group">
            <a-button :type="period === 'month' ? 'primary' : 'default'" size="small" @click="period = 'month'">月度</a-button>
            <a-button :type="period === 'quarter' ? 'primary' : 'default'" size="small" @click="period = 'quarter'">季度</a-button>
            <a-button :type="period === 'year' ? 'primary' : 'default'" size="small" @click="period = 'year'">年度</a-button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">多模态能碳计算趋势图</div>
            <div class="chart-sub">电力 | 天然气 | 水 | 其他能源碳排放</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><PieChartOutlined /> 碳排放结构分析</h3><span class="tag tag-blue">本月</span></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">各能源碳排放占比</div>
            <div class="chart-sub">电力 65% | 天然气 22% | 水 8% | 其他 5%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><DashboardOutlined /> 各场馆碳排放对比</h3></div>
        <div class="card-body">
          <div class="card-table">
            <div class="compare-row" v-for="item in venueCarbonData" :key="item.name">
              <div class="compare-name">{{ item.name }}</div>
              <div class="compare-bar">
                <div class="bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
              </div>
              <div class="compare-value">{{ item.value }} tCO₂</div>
              <div class="compare-change" :class="item.trend === 'down' ? 'down' : 'up'">{{ item.change }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><CalculatorOutlined /> 能碳计算模型</h3></div>
        <div class="card-body">
          <div class="model-list">
            <div class="model-item" v-for="model in modelList" :key="model.name">
              <div class="model-icon" :style="{ background: model.bgColor }">
                <component :is="model.icon" />
              </div>
              <div class="model-info">
                <div class="model-name">{{ model.name }}</div>
                <div class="model-desc">{{ model.desc }}</div>
              </div>
              <span class="status-text" :class="model.status === '已启用' ? 'normal' : 'info'">{{ model.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>基于多模态数据融合的能碳计算平台，实时采集电、水、气、热等多种能源数据，通过AI算法模型进行碳排放计算与分析。支持多维度碳排放核算、碳足迹追踪、碳减排效果评估等功能。</p>
      <div class="feature-list">
        <div class="feature-list-item">多模态能源数据融合采集</div>
        <div class="feature-list-item">AI碳排放计算模型</div>
        <div class="feature-list-item">碳排放趋势分析与预测</div>
        <div class="feature-list-item">碳减排效果量化评估</div>
        <div class="feature-list-item">碳排放报告自动生成</div>
        <div class="feature-list-item">碳资产管理建议</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  EnvironmentOutlined, ThunderboltOutlined, FireOutlined, CheckCircleOutlined,
  BarChartOutlined, PieChartOutlined, DashboardOutlined, CalculatorOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AiCarbonPage' })

const period = ref('month')
const statData = { totalCarbon: '1,280', electricCarbon: '832', gasCarbon: '282', carbonReduction: '156' }

const venueCarbonData = [
  { name: 'A馆', value: 520, percent: 100, color: '#1890ff', change: '-8.5%', trend: 'down' },
  { name: 'B馆', value: 380, percent: 73, color: '#52c41a', change: '-5.2%', trend: 'down' },
  { name: 'C馆', value: 260, percent: 50, color: '#faad14', change: '-12.3%', trend: 'down' },
  { name: '多功能厅', value: 120, percent: 23, color: '#722ed1', change: '-3.8%', trend: 'down' },
]

const modelList = [
  { name: '电力碳排放模型', desc: '基于实时电力数据计算碳排放', icon: ThunderboltOutlined, bgColor: '#e6f7ff', status: '已启用' },
  { name: '天然气碳排放模型', desc: '基于天然气消耗量计算碳排放', icon: FireOutlined, bgColor: '#fff7e6', status: '已启用' },
  { name: '综合能耗计算模型', desc: '多能源类型综合碳排放计算', icon: CalculatorOutlined, bgColor: '#f6ffed', status: '已启用' },
  { name: '碳减排评估模型', desc: 'AI驱动的碳减排效果评估', icon: EnvironmentOutlined, bgColor: '#f9f0ff', status: '开发中' },
]
</script>

<style scoped lang="less">
.ai-page { padding: 0; }

.compare-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  &:last-child { border-bottom: none; }
  .compare-name { width: 80px; font-size: 13px; color: #333; }
  .compare-bar { flex: 1; height: 16px; background: #f0f0f0; border-radius: 8px; margin: 0 12px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 8px; transition: width 0.5s; }
  .compare-value { width: 80px; font-size: 13px; color: #333; font-weight: 500; }
  .compare-change { width: 60px; font-size: 12px; &.down { color: #52c41a; } &.up { color: #ff4d4f; } }
}

.model-list {
  .model-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child { border-bottom: none; }
    .model-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-right: 12px;
    }
    .model-info { flex: 1; }
    .model-name { font-size: 14px; color: #333; font-weight: 500; }
    .model-desc { font-size: 12px; color: #999; margin-top: 2px; }
  }
}
</style>