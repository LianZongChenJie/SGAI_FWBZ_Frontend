<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="空调机组总数"
        :value="86"
        change-text="↑ 12 新增"
        trend="up"
        color="blue"
        :icon="FireOutlined"
      />
      <StatCard
        label="运行中"
        :value="84"
        change-text="97.7% 运行率"
        trend="up"
        color="green"
        :icon="CheckCircleOutlined"
      />
      <StatCard
        label="今日能耗"
        :value="'28,456'"
        change-text="↓ 5.2% kWh"
        trend="down"
        color="orange"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="平均COP"
        :value="'4.2'"
        change-text="↑ 0.3 较上周"
        trend="up"
        color="purple"
        :icon="ArrowUpOutlined"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3><FireOutlined /> 空调机组实时监测</h3>
        <div class="filter-bar">
          <a-select v-model:value="filterVenue" placeholder="全部场馆" style="width: 140px" allow-clear>
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option value="A馆">A馆</a-select-option>
            <a-select-option value="B馆">B馆</a-select-option>
            <a-select-option value="C馆">C馆</a-select-option>
          </a-select>
          <a-select v-model:value="filterStatus" placeholder="全部状态" style="width: 140px" allow-clear>
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="运行">运行</a-select-option>
            <a-select-option value="待机">待机</a-select-option>
            <a-select-option value="故障">故障</a-select-option>
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
          <h3><BarChartOutlined /> 空调能耗趋势</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各空调机组分时能耗曲线</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><HeatMapOutlined /> 供回水温度趋势</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">冷冻水/冷却水温度变化曲线</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺图监控 - 空调系统 -->
    <div class="card">
      <div class="card-header">
        <h3><BankOutlined /> 工艺图监控 - 空调系统</h3>
        <a-tag color="blue">实时</a-tag>
      </div>
      <div class="card-body">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon"><BankOutlined /></div>
          <div class="chart-text">空调系统工艺流程监控图</div>
          <div style="font-size: 12px; color: #a0aec0; margin-top: 8px">
            新风入口 → 过滤 → 表冷器 → 送风机 → 送风出口 | 实时参数叠加显示
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
  FireOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  BankOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AcTab' })

const props = defineProps<{
  data?: any
}>()

// 筛选条件
const filterVenue = ref('')
const filterStatus = ref('')

// 表格列定义
const columns = [
  { title: '机组编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 140 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '送风温度', dataIndex: 'supplyTemp', key: 'supplyTemp', width: 100 },
  { title: '回风温度', dataIndex: 'returnTemp', key: 'returnTemp', width: 100 },
  { title: '冷冻水温度', dataIndex: 'chilledWaterTemp', key: 'chilledWaterTemp', width: 110 },
  { title: '冷却水温度', dataIndex: 'coolingWaterTemp', key: 'coolingWaterTemp', width: 110 },
  { title: '运行电流', dataIndex: 'current', key: 'current', width: 90 },
  { title: 'COP', dataIndex: 'cop', key: 'cop', width: 80 },
  { title: '今日能耗', dataIndex: 'todayEnergy', key: 'todayEnergy', width: 110 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 表格数据
const tableData = [
  { code: 'AC-A-01', location: 'A馆-F1-大厅', status: '运行', supplyTemp: '18°C', returnTemp: '26°C', chilledWaterTemp: '7°C', coolingWaterTemp: '32°C', current: '45A', cop: '4.5', todayEnergy: '1,234 kWh' },
  { code: 'AC-A-02', location: 'A馆-F2-展厅', status: '运行', supplyTemp: '16°C', returnTemp: '24°C', chilledWaterTemp: '6°C', coolingWaterTemp: '33°C', current: '52A', cop: '4.2', todayEnergy: '1,456 kWh' },
  { code: 'AC-A-03', location: 'A馆-F3-办公', status: '待机', supplyTemp: '--', returnTemp: '28°C', chilledWaterTemp: '--', coolingWaterTemp: '--', current: '0A', cop: '--', todayEnergy: '0 kWh' },
  { code: 'AC-B-01', location: 'B馆-F1-会议', status: '运行', supplyTemp: '17°C', returnTemp: '25°C', chilledWaterTemp: '7°C', coolingWaterTemp: '31°C', current: '38A', cop: '4.8', todayEnergy: '987 kWh' },
  { code: 'AC-C-01', location: 'C馆-F1-展厅', status: '运行', supplyTemp: '18°C', returnTemp: '27°C', chilledWaterTemp: '7°C', coolingWaterTemp: '34°C', current: '48A', cop: '4.0', todayEnergy: '1,345 kWh' },
]

// 筛选逻辑
const filteredTableData = computed(() => {
  return tableData.filter((item) => {
    const matchVenue = !filterVenue.value || item.location.includes(filterVenue.value)
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchVenue && matchStatus
  })
})

const handleSearch = () => {
  console.log('查询:', { venue: filterVenue.value, status: filterStatus.value })
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