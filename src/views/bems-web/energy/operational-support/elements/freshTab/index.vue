<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="新风机组总数"
        :value="24"
        change-text="↑ 6 新增"
        trend="up"
        color="blue"
        :icon="WindPowerOutlined"
      />
      <StatCard
        label="运行中"
        :value="24"
        change-text="100% 运行率"
        trend="up"
        color="green"
        :icon="CheckCircleOutlined"
      />
      <StatCard
        label="平均CO₂浓度"
        :value="'520'"
        change-text="↓ 8% ppm"
        trend="down"
        color="orange"
        :icon="CloudOutlined"
      />
      <StatCard
        label="今日换气次数"
        :value="'6.5'"
        change-text="↑ 0.5 次/h"
        trend="up"
        color="purple"
        :icon="SyncOutlined"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3><WindPowerOutlined /> 新风机组实时监测</h3>
        <div class="filter-bar">
          <a-select v-model:value="filterVenue" placeholder="全部场馆" style="width: 140px" allow-clear>
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option value="A馆">A馆</a-select-option>
            <a-select-option value="B馆">B馆</a-select-option>
            <a-select-option value="C馆">C馆</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch">🔍 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :dataSource="filteredTableData"
          :columns="columns"
          :pagination="{ pageSize: 10 }"
          :scroll="{ x: 1100 }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag v-if="record.status === '运行'" color="green">运行</a-tag>
              <a-tag v-else-if="record.status === '待机'" color="orange">待机</a-tag>
              <a-tag v-else color="red">故障</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><CloudOutlined /> 各区域CO₂浓度分布</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各区域CO₂浓度实时柱状图</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><SyncOutlined /> 新风量与客流关联</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">新风量与场馆客流关联分析</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺图监控 - 新风系统 -->
    <div class="card">
      <div class="card-header">
        <h3><BankOutlined /> 工艺图监控 - 新风系统</h3>
        <a-tag color="green">实时</a-tag>
      </div>
      <div class="card-body">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon"><BankOutlined /></div>
          <div class="chart-text">新风系统工艺流程监控图</div>
          <div style="font-size: 12px; color: #a0aec0; margin-top: 8px">
            新风入口 → 过滤网 → 表冷器 → 送风机 → PM2.5监测 → 送风出口 | 实时参数叠加显示
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  WindPowerOutlined,
  CheckCircleOutlined,
  CloudOutlined,
  SyncOutlined,
  BarChartOutlined,
  BankOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'FreshTab' })

defineProps<{
  data?: any
}>()

// 筛选条件
const filterVenue = ref('')

// 表格列定义
const columns = [
  { title: '机组编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 140 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '送风量', dataIndex: 'supplyAir', key: 'supplyAir', width: 110 },
  { title: '回风量', dataIndex: 'returnAir', key: 'returnAir', width: 110 },
  { title: 'CO₂浓度', dataIndex: 'co2', key: 'co2', width: 100 },
  { title: 'PM2.5', dataIndex: 'pm25', key: 'pm25', width: 100 },
  { title: '过滤网压差', dataIndex: 'filterPressure', key: 'filterPressure', width: 110 },
  { title: '风机频率', dataIndex: 'fanFreq', key: 'fanFreq', width: 100 },
  { title: '今日能耗', dataIndex: 'todayEnergy', key: 'todayEnergy', width: 110 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 表格数据
const tableData = [
  { code: 'FA-A-01', location: 'A馆-F1-东段', status: '运行', supplyAir: '5,000 m³/h', returnAir: '4,500 m³/h', co2: '480 ppm', pm25: '12 μg/m³', filterPressure: '120 Pa', fanFreq: '45 Hz', todayEnergy: '234 kWh' },
  { code: 'FA-A-02', location: 'A馆-F2-中段', status: '运行', supplyAir: '6,500 m³/h', returnAir: '6,000 m³/h', co2: '520 ppm', pm25: '15 μg/m³', filterPressure: '145 Pa', fanFreq: '50 Hz', todayEnergy: '312 kWh' },
  { code: 'FA-B-01', location: 'B馆-F1-南段', status: '运行', supplyAir: '4,000 m³/h', returnAir: '3,800 m³/h', co2: '450 ppm', pm25: '10 μg/m³', filterPressure: '98 Pa', fanFreq: '40 Hz', todayEnergy: '198 kWh' },
  { code: 'FA-C-01', location: 'C馆-F1-西段', status: '运行', supplyAir: '5,500 m³/h', returnAir: '5,200 m³/h', co2: '510 ppm', pm25: '18 μg/m³', filterPressure: '156 Pa', fanFreq: '48 Hz', todayEnergy: '267 kWh' },
]

// 筛选逻辑
const filteredTableData = computed(() => {
  return tableData.filter((item) => {
    const matchVenue = !filterVenue.value || item.location.includes(filterVenue.value)
    return matchVenue
  })
})

const handleSearch = () => {
  console.log('查询:', { venue: filterVenue.value })
}
</script>

<style scoped lang="less">
.tab-page {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .filter-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
    }

    .card-body {
      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        background: #fafbfc;
        border: 1px dashed #e5e6e8;
        border-radius: 8px;
        padding: 24px;

        .chart-icon {
          font-size: 40px;
          color: #1677ff;
          margin-bottom: 12px;
        }

        .chart-text {
          font-size: 14px;
          color: #86909c;
        }
      }
    }
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
}
</style>