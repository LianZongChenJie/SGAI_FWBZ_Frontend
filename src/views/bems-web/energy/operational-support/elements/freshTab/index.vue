<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="新风机组总数"
        :value="24"
        change-text=""
        trend=""
        color="blue"
        :icon="FreshUnitTotalIcon"
      />
      <StatCard
        label="运行中"
        :value="24"
        change-text=""
        trend=""
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="平均PM2.5"
        :value="'18'"
        change-text=""
        trend=""
        color="orange"
        :icon="AvgPm25Icon"
      />
      <StatCard
        label="今日能耗"
        :value="'3,456'"
        change-text=""
        trend=""
        color="purple"
        :icon="TodayEnergyIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>🌀新风机组实时监测</h3>
        <div class="filter-bar">
          <a-tree-select
            v-model:value="meterSpace"
            :tree-data="spaceTreeData"
            :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
            placeholder="设备位置"
            allow-clear
            tree-default-expand-all
            style="width: 200px"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            @change="handleSearch"
          />
          <a-button type="primary" @click="handleSearch">🔍 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :dataSource="filteredTableData"
          :columns="columns"
          :pagination="pagination"
          :scroll="{ x: 1100 }"
          size="middle"
          @change="handleTableChange"
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
          <h3>💨各区域CO₂浓度分布</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">📊</div>
            <div class="chart-text">各区域CO₂浓度实时柱状图</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>🔄新风量与客流关联</h3>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon">📊</div>
            <div class="chart-text">新风量与场馆客流关联分析</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺图监控 - 新风系统 -->
    <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 新风系统</h3>
        <a-tag color="green">实时</a-tag>
      </div>
      <div class="card-body">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon">🏭</div>
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
import { ref, reactive, computed, watch, h, onMounted } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import { spaceTree } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api'

// 自定义 emoji 图标组件
const FreshUnitTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '🌀')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const AvgPm25Icon = () => h('span', { style: 'font-size: 20px;' }, '💨')
const TodayEnergyIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')

defineOptions({ name: 'FreshTab' })

defineProps<{
  data?: any
}>()

// 设备位置树数据
const meterSpace = ref([])
const spaceTreeData = ref([])
const loadSpaceTree = async () => {
  try {
    const res = await spaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  pageSizeOptions: ['10', '20', '50', '100'],
})

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
    const matchVenue = !meterSpace.value || !meterSpace.value.length || item.location.includes(String(meterSpace.value))
    return matchVenue
  })
})

// 翻页数据变化时更新总数
watch(filteredTableData, (data) => {
  pagination.total = data.length
}, { immediate: true })

const handleSearch = () => {
  pagination.current = 1
  pagination.total = filteredTableData.value.length
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

onMounted(() => {
  loadSpaceTree()
})
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