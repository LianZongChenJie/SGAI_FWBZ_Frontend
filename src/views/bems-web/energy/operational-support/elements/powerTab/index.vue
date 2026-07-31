<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="配电柜总数"
        :value="45"
        change-text="↑ 8 新增"
        trend="up"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="正常运行"
        :value="45"
        change-text="100% 正常"
        trend="up"
        color="green"
        :icon="CheckCircleOutlined"
      />
      <StatCard
        label="今日用电量"
        :value="'42,156'"
        change-text="↓ 6.8% kWh"
        trend="down"
        color="orange"
        :icon="PoweroffOutlined"
      />
      <StatCard
        label="功率因数"
        :value="'0.95'"
        change-text="↑ 0.02 较昨日"
        trend="up"
        color="purple"
        :icon="DashboardOutlined"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3><ThunderboltOutlined /> 配电系统实时监测</h3>
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
              <a-tag v-if="record.status === '正常'" color="green">正常</a-tag>
              <a-tag v-else-if="record.status === '告警'" color="orange">告警</a-tag>
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
          <h3><BarChartOutlined /> 各配电柜负载趋势</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">配电柜负载率分时曲线</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><HeatMapOutlined /> 柜内温度分布</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">配电柜温度热力分布</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺图监控 - 配电系统 -->
    <div class="card">
      <div class="card-header">
        <h3><BankOutlined /> 工艺图监控 - 配电系统</h3>
        <a-tag color="orange">实时</a-tag>
      </div>
      <div class="card-body">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon"><BankOutlined /></div>
          <div class="chart-text">配电系统单线拓扑监控图</div>
          <div style="font-size: 12px; color: #a0aec0; margin-top: 8px">
            市电进线 → 变压器 → 低压配电柜 → 各楼层分配电箱 → 末端设备 | 实时电压/电流/负载率叠加显示
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
  ThunderboltOutlined,
  CheckCircleOutlined,
  PoweroffOutlined,
  DashboardOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  BankOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'PowerTab' })

defineProps<{
  data?: any
}>()

// 筛选条件
const filterVenue = ref('')

// 表格列定义
const columns = [
  { title: '配电柜编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 150 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '电压', dataIndex: 'voltage', key: 'voltage', width: 90 },
  { title: '电流', dataIndex: 'current', key: 'current', width: 90 },
  { title: '有功功率', dataIndex: 'activePower', key: 'activePower', width: 100 },
  { title: '无功功率', dataIndex: 'reactivePower', key: 'reactivePower', width: 100 },
  { title: '功率因数', dataIndex: 'powerFactor', key: 'powerFactor', width: 90 },
  { title: '柜内温度', dataIndex: 'temp', key: 'temp', width: 90 },
  { title: '负载率', dataIndex: 'loadRate', key: 'loadRate', width: 80 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 表格数据
const tableData = [
  { code: 'PD-A-01', location: 'A馆-1#配电室', status: '正常', voltage: '380V', current: '125A', activePower: '78 kW', reactivePower: '12 kVar', powerFactor: '0.96', temp: '35°C', loadRate: '65%' },
  { code: 'PD-A-02', location: 'A馆-2#配电室', status: '正常', voltage: '380V', current: '98A', activePower: '58 kW', reactivePower: '8 kVar', powerFactor: '0.97', temp: '32°C', loadRate: '48%' },
  { code: 'PD-B-01', location: 'B馆-1#配电室', status: '正常', voltage: '380V', current: '156A', activePower: '95 kW', reactivePower: '18 kVar', powerFactor: '0.94', temp: '38°C', loadRate: '78%' },
  { code: 'PD-C-01', location: 'C馆-1#配电室', status: '正常', voltage: '380V', current: '112A', activePower: '68 kW', reactivePower: '10 kVar', powerFactor: '0.96', temp: '34°C', loadRate: '56%' },
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