<template>
  <div class="ai-page">
    <div class="stats-row">
      <StatCard label="预测准确率" :value="statData.accuracy" change-text="↑ 2.3% 较上月" trend="up" color="blue" :icon="CheckCircleOutlined" />
      <StatCard label="预测周期" :value="statData.period" change-text="7天" trend="up" color="green" :icon="CalendarOutlined" />
      <StatCard label="预测模型数" :value="statData.modelCount" change-text="↑ 2 新增" trend="up" color="orange" :icon="ApartmentOutlined" />
      <StatCard label="覆盖指标" :value="statData.metrics" change-text="↑ 5 新增" trend="up" color="purple" :icon="DashboardOutlined" />
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><LineChartOutlined /> 能耗预测趋势</h3>
          <div class="btn-group">
            <a-button type="primary" size="small">未来7天</a-button>
            <a-button size="small">未来30天</a-button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><LineChartOutlined /></div>
            <div class="chart-text">AI能耗预测趋势图（实际 vs 预测）</div>
            <div class="chart-sub">预测准确率 95.8%</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 预测与实际对比</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各场馆能耗预测 vs 实际对比</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><FundOutlined /> 预测指标详情</h3>
        <div class="filter-bar">
          <a-select v-model:value="venueFilter" style="width: 150px" placeholder="全部场馆">
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option value="A馆">A馆</a-select-option>
            <a-select-option value="B馆">B馆</a-select-option>
            <a-select-option value="C馆">C馆</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 8 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'trend'">
              <span :style="{ color: record.trend === 'up' ? '#ff4d4f' : '#52c41a' }">
                <ArrowUpOutlined v-if="record.trend === 'up'" />
                <ArrowDownOutlined v-else />
                {{ record.change }}
              </span>
            </template>
            <template v-if="column.key === 'accuracy'">
              <span class="status-text" :class="record.accuracy >= 90 ? 'normal' : record.accuracy >= 80 ? 'warning' : 'danger'">{{ record.accuracy }}%</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  CheckCircleOutlined, CalendarOutlined, ApartmentOutlined, DashboardOutlined,
  LineChartOutlined, BarChartOutlined, FundOutlined,
  SearchOutlined, InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AiPredictPage' })

const statData = { accuracy: '95.8%', period: '7天/30天', modelCount: 8, metrics: 24 }
const venueFilter = ref('')

const columns = [
  { title: '预测指标', dataIndex: 'metric', key: 'metric' },
  { title: '所属场馆', dataIndex: 'venue', key: 'venue', width: 80 },
  { title: '实际值', dataIndex: 'actual', key: 'actual', width: 90 },
  { title: '预测值', dataIndex: 'predict', key: 'predict', width: 90 },
  { title: '误差率', dataIndex: 'error', key: 'error', width: 80 },
  { title: '预测准确率', dataIndex: 'accuracy', key: 'accuracy', width: 100 },
  { title: '趋势', dataIndex: 'trend', key: 'trend', width: 100 },
  { title: '更新时间', dataIndex: 'time', key: 'time', width: 150 },
]

const tableData = [
  { id: 1, metric: '日用电量 (kWh)', venue: 'A馆', actual: '12,580', predict: '12,350', error: '1.83%', accuracy: 98.2, trend: 'down', change: '-1.83%', time: '2024-03-25 23:59' },
  { id: 2, metric: '日用水量 (m³)', venue: 'A馆', actual: '320', predict: '335', error: '4.69%', accuracy: 95.3, trend: 'up', change: '+4.69%', time: '2024-03-25 23:59' },
  { id: 3, metric: '日碳排放 (tCO₂)', venue: 'B馆', actual: '128', predict: '132', error: '3.13%', accuracy: 96.9, trend: 'up', change: '+3.13%', time: '2024-03-25 23:59' },
  { id: 4, metric: '日客流 (人)', venue: 'C馆', actual: '1,890', predict: '1,750', error: '7.41%', accuracy: 92.6, trend: 'down', change: '-7.41%', time: '2024-03-25 23:59' },
  { id: 5, metric: '日用电量 (kWh)', venue: 'B馆', actual: '8,920', predict: '8,650', error: '3.03%', accuracy: 97.0, trend: 'down', change: '-3.03%', time: '2024-03-25 23:59' },
  { id: 6, metric: '日碳排放 (tCO₂)', venue: 'A馆', actual: '520', predict: '498', error: '4.23%', accuracy: 95.8, trend: 'down', change: '-4.23%', time: '2024-03-25 23:59' },
]
</script>

<style scoped lang="less">
.ai-page { padding: 0; }
</style>