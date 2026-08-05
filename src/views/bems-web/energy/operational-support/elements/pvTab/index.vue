<template>
  <div class="tab-page">
    <!-- 统计卡片 - 使用父级传入的 data 或默认数据 -->
    <div class="stat-cards">
      <StatCard
        label="光伏组串数"
        :value="data?.stats?.[0]?.value ?? 12"
        :change-text="data?.stats?.[0]?.changeText ?? '↑ 4 新增'"
        trend="up"
        color="blue"
        :icon="PvStringCountIcon"
      />
      <StatCard
        label="装机容量"
        :value="data?.stats?.[1]?.value ?? '856'"
        :change-text="data?.stats?.[1]?.changeText ?? 'kW'"
        trend="up"
        color="green"
        :icon="InstalledCapacityIcon"
      />
      <StatCard
        label="今日发电量"
        :value="data?.stats?.[2]?.value ?? '3,456'"
        :change-text="data?.stats?.[2]?.changeText ?? '↑ 12.3% kWh'"
        trend="up"
        color="orange"
        :icon="TodayGenerationIcon"
      />
      <StatCard
        label="发电效率"
        :value="data?.stats?.[3]?.value ?? '18.5%'"
        :change-text="data?.stats?.[3]?.changeText ?? '↑ 0.8% 较昨日'"
        trend="up"
        color="purple"
        :icon="GenerationEfficiencyIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>☀️光伏系统实时监测</h3>
        <div class="filter-bar">
          <a-select v-model:value="filterArea" placeholder="全部区域" style="width: 140px" allow-clear>
            <a-select-option value="">全部区域</a-select-option>
            <a-select-option value="A馆屋顶">A馆屋顶</a-select-option>
            <a-select-option value="B馆屋顶">B馆屋顶</a-select-option>
            <a-select-option value="C馆屋顶">C馆屋顶</a-select-option>
            <a-select-option value="停车场车棚">停车场车棚</a-select-option>
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
              <a-tag v-if="record.status === '发电'" color="green">发电</a-tag>
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
          <h3>📈光伏发电趋势</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">📊</div>
            <div class="chart-text">今日光伏发电功率曲线</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>🌤️发电效率分析</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">📊</div>
            <div class="chart-text">辐照度-发电量关联分析</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺图监控 - 光伏系统（只在光伏系统tab展示） -->
    <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 光伏系统</h3>
        <a-tag color="green">实时</a-tag>
      </div>
      <div class="card-body">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon">🏭</div>
          <div class="chart-text">光伏系统拓扑监控图</div>
          <div style="font-size: 12px; color: #a0aec0; margin-top: 8px">
            光伏组串 → 汇流箱 → 逆变器 → 交流配电柜 → 并网柜/储能 → 负载/电网 | 实时电压/功率/发电量叠加显示
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// 自定义 emoji 图标组件
const PvStringCountIcon = () => h('span', { style: 'font-size: 20px;' }, '☀️')
const InstalledCapacityIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const TodayGenerationIcon = () => h('span', { style: 'font-size: 20px;' }, '🔋')
const GenerationEfficiencyIcon = () => h('span', { style: 'font-size: 20px;' }, '📈')

defineOptions({ name: 'PvTab' })

const props = defineProps<{
  data?: any
}>()

// 筛选条件
const filterArea = ref('')

// 表格列定义
const columns = [
  { title: '组串编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 140 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '直流电压', dataIndex: 'dcVoltage', key: 'dcVoltage', width: 100 },
  { title: '直流电流', dataIndex: 'dcCurrent', key: 'dcCurrent', width: 100 },
  { title: '直流功率', dataIndex: 'dcPower', key: 'dcPower', width: 100 },
  { title: '交流功率', dataIndex: 'acPower', key: 'acPower', width: 100 },
  { title: '辐照度', dataIndex: 'irradiance', key: 'irradiance', width: 100 },
  { title: '板面温度', dataIndex: 'temp', key: 'temp', width: 90 },
  { title: '今日发电', dataIndex: 'todayEnergy', key: 'todayEnergy', width: 110 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 表格数据 - 优先使用父级传入的 data，否则使用默认数据
const defaultTableData = [
  { code: 'PV-A-01', location: 'A馆屋顶-东', status: '发电', dcVoltage: '680V', dcCurrent: '45A', dcPower: '30.6 kW', acPower: '29.5 kW', irradiance: '850 W/㎡', temp: '45°C', todayEnergy: '156 kWh' },
  { code: 'PV-A-02', location: 'A馆屋顶-西', status: '发电', dcVoltage: '675V', dcCurrent: '42A', dcPower: '28.4 kW', acPower: '27.3 kW', irradiance: '820 W/㎡', temp: '48°C', todayEnergy: '142 kWh' },
  { code: 'PV-B-01', location: 'B馆屋顶', status: '发电', dcVoltage: '690V', dcCurrent: '48A', dcPower: '33.1 kW', acPower: '31.8 kW', irradiance: '880 W/㎡', temp: '43°C', todayEnergy: '168 kWh' },
  { code: 'PV-C-01', location: 'C馆屋顶', status: '发电', dcVoltage: '685V', dcCurrent: '46A', dcPower: '31.5 kW', acPower: '30.2 kW', irradiance: '860 W/㎡', temp: '46°C', todayEnergy: '159 kWh' },
  { code: 'PV-P-01', location: '停车场车棚', status: '发电', dcVoltage: '670V', dcCurrent: '40A', dcPower: '26.8 kW', acPower: '25.7 kW', irradiance: '800 W/㎡', temp: '50°C', todayEnergy: '128 kWh' },
]

// 使用父级传入的tableData或默认数据
const tableData = computed(() => {
  return props.data?.tableData?.length ? props.data.tableData : defaultTableData
})

// 筛选逻辑
const filteredTableData = computed(() => {
  return tableData.value.filter((item: any) => {
    const matchArea = !filterArea.value || item.location.includes(filterArea.value)
    return matchArea
  })
})

const handleSearch = () => {
  console.log('查询:', { area: filterArea.value })
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
      margin: 0 -24px 16px;
      padding: 0 24px 12px;
      border-bottom: 1px solid #f0f0f0;
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