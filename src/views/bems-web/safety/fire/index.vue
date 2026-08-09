<template>
  <div class="fire-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in statCards"
        :key="index"
        :label="item.title || '--'"
        :value="formatStatValue(item.value)"
        :change-text="item.context || ''"
        :color="cardConfig[index]?.color || 'blue'"
        :icon="cardConfig[index]?.icon"
      />
    </div>

    <!-- 两栏布局：设备分布 + 状态统计 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><HeatMapOutlined /> 消防设备分布图</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <div class="map-placeholder">
            <div class="map-icon"><FireOutlined /></div>
            <div class="map-text">消防设备分布图</div>
            <div class="map-sub">A馆 86台 | B馆 72台 | C馆 64台 | 室外 64台</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><PieChartOutlined /> 设备状态统计</h3>
          <span class="tag" :class="statusTagClass">{{ statusTagText }}</span>
        </div>
        <div class="card-body">
          <!-- 有数据时展示饼状图 -->
          <div v-if="hasStatusData" ref="statusChartRef" class="status-chart"></div>
          <!-- 无数据时展示默认占位样式 -->
          <div v-else class="chart-placeholder">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">设备状态统计图表</div>
            <div class="chart-sub">暂无数据</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 消防设备实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3><FireOutlined /> 消防设备实时监测</h3>
        <div class="filter-bar">
          <a-input
            v-model:value="searchForm.deviceName"
            placeholder="搜索设备名称"
            style="width: 200px"
            allow-clear
            @press-enter="handleSearch"
          />
          <a-select
            v-model:value="searchForm.status"
            style="width: 130px"
            placeholder="全部状态"
            allow-clear
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</a-select-option>
          </a-select>
          <a-select
            v-model:value="searchForm.deviceType"
            style="width: 150px"
            placeholder="全部类型"
            allow-clear
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option v-for="t in deviceTypeOptions" :key="t.value" :value="t.value">{{ t.label }}</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="deviceColumns"
          :data-source="tableData"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-dot" :class="getStatusClass(record.status)"></span>
              <span>{{ record.status || '--' }}</span>
            </template>
            <template v-if="column.key === 'powerLevel'">
              <span :style="{ color: getPowerColor(record.powerLevel) }">
                {{ record.powerLevel || '--' }}
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  FireOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  WarningOutlined,
  HeatMapOutlined,
  PieChartOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import { useECharts } from '/@/hooks/web/useECharts'
import {
  getSummary,
  getRealTimeMonitor,
  getDeviceStatusStatistics,
} from './index.api'
import type { StatCardVO, SmokeDetector, StatusCountVO } from './index.api'

defineOptions({ name: 'FireManagementPage' })

/** 将后端返回的 value（可能是对象）格式化为 StatCard 所需的 string|number */
function formatStatValue(val?: { [key: string]: any } | string | number): string | number {
  if (val == null) return '--'
  if (typeof val === 'string' || typeof val === 'number') return val
  // 对象类型：尝试取常见字段
  return (val as any).value ?? (val as any).num ?? (val as any).count ?? JSON.stringify(val)
}

// ===== 统计卡片配置（图标/颜色固定，数据来自后端） =====
const cardConfig = [
  { color: 'blue' as const, icon: FireOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: ScheduleOutlined },
  { color: 'red' as const, icon: WarningOutlined },
]

const statCards = ref<StatCardVO[]>([])

const fetchStatCards = async () => {
  try {
    const res = await getSummary()
    statCards.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取消防统计卡片数据失败:', error)
  }
}

// ===== 设备状态统计（饼状图） =====
const deviceStatusList = ref<StatusCountVO[]>([])
const statusChartRef = ref<HTMLDivElement | null>(null)
const { setOptions: setStatusChartOptions } = useECharts(statusChartRef as Ref<HTMLDivElement>)

/** 是否有状态统计数据（用于控制展示饼图或默认占位） */
const hasStatusData = computed(() => {
  return deviceStatusList.value.some((item) => (item.count ?? 0) > 0)
})

/** 状态颜色映射 */
function getStatusColor(status?: string): string {
  if (!status) return '#8c8c8c'
  if (status.includes('正常') || status.includes('在线')) return '#52c41a'
  if (status.includes('离线')) return '#ff4d4f'
  if (status.includes('故障') || status.includes('异常')) return '#faad14'
  return '#8c8c8c'
}

/** 更新饼状图 */
function updateStatusChart() {
  if (!hasStatusData.value) return
  const chartData = deviceStatusList.value
    .filter((item) => (item.count ?? 0) > 0)
    .map((item) => ({
      name: item.status || '未知',
      value: item.count || 0,
      itemStyle: { color: getStatusColor(item.status) },
    }))
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  setStatusChartOptions({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}台 ({d}%)',
    },
    legend: {
      bottom: '2%',
      left: 'center',
      textStyle: { fontSize: 13, color: '#4a5568' },
    },
    graphic: total > 0
      ? {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: String(total),
            fontSize: 28,
            fontWeight: 'bold',
            fill: '#2d3748',
          },
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius: ['45%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          formatter: '{b}\n{c}台',
          fontSize: 13,
          color: '#4a5568',
        },
        labelLine: { show: true, length: 10, length2: 10 },
        data: chartData,
      },
    ],
  })
}

const fetchDeviceStatusStatistics = async () => {
  try {
    const res = await getDeviceStatusStatistics()
    deviceStatusList.value = Array.isArray(res) ? res : []
    // 数据加载后等 DOM 渲染完成再设置图表
    await nextTick()
    updateStatusChart()
  } catch (error) {
    console.error('获取设备状态统计失败:', error)
  }
}

// 状态列表变化时重新渲染饼图
watch(hasStatusData, () => {
  nextTick(() => updateStatusChart())
})

// 状态标签
const statusTagClass = computed(() => {
  const hasFault = deviceStatusList.value.some(
    (s) => (s.status || '').includes('故障') && (s.count || 0) > 0,
  )
  const hasOffline = deviceStatusList.value.some(
    (s) => (s.status || '').includes('离线') && (s.count || 0) > 0,
  )
  if (hasFault) return 'tag-red'
  if (hasOffline) return 'tag-orange'
  return 'tag-green'
})

const statusTagText = computed(() => {
  if (statusTagClass.value === 'tag-red') return '故障'
  if (statusTagClass.value === 'tag-orange') return '离线'
  return '正常'
})

// ===== 状态/类型下拉选项 =====
const statusOptions = computed(() => {
  const set = new Set<string>()
  deviceStatusList.value.forEach((s) => {
    if (s.status) set.add(s.status)
  })
  return Array.from(set)
})

const deviceTypeOptions = [
  { label: '烟感探测器', value: 'smoke' },
  { label: '喷淋系统', value: 'sprinkler' },
  { label: '手动报警', value: 'alarm' },
  { label: '消火栓', value: 'hydrant' },
]

// ===== 状态样式映射 =====
function getStatusClass(status?: string): string {
  if (!status) return ''
  if (status.includes('正常') || status.includes('在线')) return 'normal'
  if (status.includes('离线')) return 'offline'
  if (status.includes('故障') || status.includes('异常')) return 'fault'
  return ''
}

function getPowerColor(power?: string): string {
  if (!power) return '#86909c'
  const num = parseInt(power, 10)
  if (isNaN(num)) return '#86909c'
  if (num < 20) return '#ff4d4f'
  if (num < 50) return '#faad14'
  return '#52c41a'
}

// ===== 表格数据 =====
const loading = ref(false)
const tableData = ref<SmokeDetector[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
})

const searchForm = reactive({
  deviceName: '' as string,
  status: '' as string,
  deviceType: '' as string,
})

const deviceColumns = [
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 150 },
  { title: '设备类型', dataIndex: 'typeName', key: 'typeName', width: 130 },
  { title: '场馆', dataIndex: 'venueName', key: 'venueName', width: 120 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '信号强度', dataIndex: 'signal', key: 'signal', width: 100 },
  { title: '电量', dataIndex: 'powerLevel', key: 'powerLevel', width: 90 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' as const },
]

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getRealTimeMonitor({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      deviceName: searchForm.deviceName || undefined,
      status: searchForm.status || undefined,
      deviceType: searchForm.deviceType || undefined,
    })
    if (Array.isArray(res)) {
      tableData.value = res
      pagination.total = res.length
    } else {
      tableData.value = res?.records || []
      pagination.total = res?.total || 0
    }
  } catch (error) {
    console.error('获取消防设备列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchList()
}

const handleReset = () => {
  searchForm.deviceName = ''
  searchForm.status = ''
  searchForm.deviceType = ''
  pagination.current = 1
  fetchList()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchList()
}

// ===== 初始化 =====
onMounted(() => {
  fetchStatCards()
  fetchDeviceStatusStatistics()
  fetchList()
})
</script>

<style scoped lang="less">
.fire-page { padding: 0; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

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
    flex-wrap: wrap;
    gap: 12px;

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
    .tag-blue { background: #bee3f8; color: #2a4365; }
    .tag-green { background: #c6f6d5; color: #22543d; }
    .tag-orange { background: #feebc8; color: #744210; }
    .tag-red { background: #fed7d7; color: #742a2a; }

    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
  }

  .card-body {
    padding: 22px;
  }
}

/* 消防设备分布图占位样式（恢复原样） */
.map-placeholder {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #f0d0d0;
  min-height: 280px;
  padding: 30px;
  .map-icon { font-size: 48px; margin-bottom: 12px; }
  .map-text { font-size: 14px; color: #8a5a5a; font-weight: 500; }
  .map-sub { font-size: 12px; color: #b08a8a; margin-top: 8px; }
}

/* 设备状态统计饼状图容器 */
.status-chart {
  width: 100%;
  height: 280px;
}

/* 无数据时的默认占位样式 */
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
  .chart-icon { font-size: 48px; margin-bottom: 12px; }
  .chart-text { font-size: 14px; color: #718096; font-weight: 500; }
  .chart-sub { font-size: 12px; color: #a0aec0; margin-top: 8px; }
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  &.normal { background: #52c41a; }
  &.offline { background: #ff4d4f; }
  &.fault { background: #faad14; }
}
</style>
