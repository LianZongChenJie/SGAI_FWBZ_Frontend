<template>
  <div class="venue-flow-page">
    <div class="stats-row">
      <StatCard label="今日总客流" :value="statData.todayTotal" change-text="↑ 12.5% 较昨日" trend="up" color="blue" :icon="TeamOutlined" />
      <StatCard label="当前在场" :value="statData.currentPresent" change-text="↑ 5.3% 较昨日" trend="up" color="green" :icon="UserOutlined" />
      <StatCard label="今日峰值客流" :value="statData.peakFlow" change-text="10:30" trend="up" color="orange" :icon="RiseOutlined" />
      <StatCard label="平均停留时长" :value="statData.avgStay" change-text="↑ 12min 较昨日" trend="up" color="purple" :icon="ClockCircleOutlined" />
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 客流趋势图</h3><span class="tag tag-blue">实时</span></div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">今日分时客流趋势图</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><PieChartOutlined /> 各场馆客流对比</h3></div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">各场馆客流占比</div>
            <div class="chart-sub">A馆 3,456人 | B馆 2,345人 | C馆 1,890人</div>
          </div>
        </div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><TeamOutlined /> 客流来源分析</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><TeamOutlined /></div>
            <div class="chart-text">客流来源分布图</div>
            <div class="chart-sub">参展商 35% | 观众 50% | 工作人员 15%</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><ClockCircleOutlined /> 客流时段分布</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><ClockCircleOutlined /></div>
            <div class="chart-text">客流时段分布热力图</div>
          </div>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { StatCard } from '/@/views/bems-web/components'
import {
  TeamOutlined, UserOutlined, RiseOutlined, ClockCircleOutlined,
  BarChartOutlined, PieChartOutlined, InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'VenueFlowPage' })

const statData = { todayTotal: '12,847', currentPresent: '3,567', peakFlow: '4,230', avgStay: '2h 35min' }
</script>

<style scoped lang="less">
.venue-flow-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 20px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header { padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between;
    h3 { font-size: 16px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
    .tag { font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 500; }
    .tag-blue { background: #bee3f8; color: #2a4365; }
  }
  .card-body { padding: 22px; }
}
.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #a0aec0; border: 2px dashed #e2e8f0; min-height: 260px; padding: 30px;
  .chart-icon { font-size: 48px; margin-bottom: 12px; }
  .chart-text { font-size: 14px; color: #718096; font-weight: 500; }
  .chart-sub { font-size: 12px; color: #a0aec0; margin-top: 8px; }
}
</style>