<template>
  <div class="vehicle-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in statCards"
        :key="index"
        :label="item.title"
        :value="item.value"
        :change-text="item.context"
        :color="cardConfig[index]?.color || 'blue'"
        :icon="cardConfig[index]?.icon"
      />
    </div>

    <!-- 两栏布局：停车场实时状态 + 流量趋势 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><EnvironmentOutlined /> 停车场实时状态</h3>
          <span class="tag tag-green">运行正常</span>
        </div>
        <div class="card-body">
          <ParkingMapView :data="parkingSpaceData" />
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><BarChartOutlined /> 24小时停车流量趋势</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <!-- 今日汇总 -->
          <!-- <div class="trend-summary">
            <div class="summary-item">
              <span class="summary-label">今日进场</span>
              <span class="summary-value color-in">{{ trendData.todayInTotal }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-label">今日出场</span>
              <span class="summary-value color-out">{{ trendData.todayOutTotal }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-label">今日总流量</span>
              <span class="summary-value color-total">{{ trendData.todayInOutTotal }}</span>
            </div>
          </div> -->
          <!-- 趋势图表 -->
          <div ref="trendChartRef" class="trend-chart"></div>
        </div>
      </div>
    </div>

    <!-- 车辆出入记录表格 -->
    <div class="card">
      <div class="card-header">
        <h3><CarOutlined /> 车辆出入记录</h3>
        <div class="filter-bar">
          <a-input
            v-model:value="searchKeyword"
            placeholder="搜索车牌号"
            allow-clear
            style="width: 180px"
            @press-enter="handleSearch"
          />
          <a-select v-model:value="parkingLot" style="width: 140px" placeholder="全部停车场" allow-clear @change="handleSearch">
            <a-select-option value="">全部停车场</a-select-option>
            <a-select-option v-for="item in parkingLotOptions" :key="item.parkingLot" :value="item.parkingLot">{{ item.parkingLot }}</a-select-option>
          </a-select>
          <a-select v-model:value="parkType" style="width: 120px" placeholder="全部类型" allow-clear @change="handleSearch">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option v-for="item in parkTypeOptions" :key="item.parkType" :value="item.parkType">{{ item.parkType }}</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="vehicleColumns"
          :data-source="vehicleData"
          :pagination="vehiclePagination"
          :loading="vehicleLoading"
          row-key="id"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'parkType'">
              <span class="status-text" :class="record.parkType === '进场' ? 'normal' : 'info'">{{ record.parkType }}</span>
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
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from 'vue'
import * as echarts from 'echarts'
import { StatCard } from '/@/views/bems-web/components'
import { getRecordList, getParkingLotList, getParkTypeList, getSummary, getParkingFlow24h, getParkingSpaceDistribution } from './index.api'
import type { Request, ParkingRecord, ParkingLotOption, ParkTypeOption, StatItem, ParkingSpaceStatVO } from './index.api'
import ParkingMapView from './ParkingMapView.vue'
import {
  CarOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'VehicleManagementPage' })

/** 卡片颜色与图标配置（与后端返回顺序对应） */
const cardConfig = [
  { color: 'blue' as const, icon: CarOutlined },
  { color: 'green' as const, icon: ShopOutlined },
  { color: 'orange' as const, icon: EnvironmentOutlined },
  { color: 'purple' as const, icon: ClockCircleOutlined },
]

/** 统计卡片数据 */
const statCards = ref<StatItem[]>([])

/** 获取统计卡片数据 */
const fetchStatCards = async () => {
  try {
    const res = await getSummary()
    statCards.value = res || []
  } catch (error) {
    console.error('获取统计卡片数据失败:', error)
  }
}

// ===================== 停车流量趋势数据 =====================
const trendData = ref({
  date: [] as string[],
  in: [] as number[],
  out: [] as number[],
  total: [] as number[],
  todayInTotal: 0,
  todayOutTotal: 0,
  todayInOutTotal: 0,
})

const fetchTrendData = async () => {
  try {
    const res = await getParkingFlow24h()
    if (res) {
      trendData.value = {
        date: res.date || [],
        in: res.in || [],
        out: res.out || [],
        total: res.total || [],
        todayInTotal: res.todayInTotal || 0,
        todayOutTotal: res.todayOutTotal || 0,
        todayInOutTotal: res.todayInOutTotal || 0,
      }
      updateChart()
    }
  } catch (error) {
    console.error('获取停车流量趋势失败:', error)
  }
}

// ===================== 停车场实时状态（DaxiMap 室内地图） =====================
const parkingSpaceData = ref<ParkingSpaceStatVO[]>([])

const fetchParkingSpace = async () => {
  try {
    const res = await getParkingSpaceDistribution()
    parkingSpaceData.value = res || []
  } catch (error) {
    console.error('获取停车场分布数据失败:', error)
  }
}

// ===================== ECharts 图表 =====================
const trendChartRef = ref<HTMLElement>()
const chartInstance = shallowRef<echarts.ECharts>()

const initChart = () => {
  if (!trendChartRef.value) return
  chartInstance.value = echarts.init(trendChartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance.value) return
  const data = trendData.value
  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: {
      data: ['进场', '出场', '总流量'],
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#718096', fontSize: 12 },
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: data.date,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#a0aec0', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0aec0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series: [
      {
        name: '进场',
        type: 'bar',
        data: data.in,
        barWidth: '18%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#36b37e' },
            { offset: 1, color: '#52c41a' },
          ]),
        },
      },
      {
        name: '出场',
        type: 'bar',
        data: data.out,
        barWidth: '18%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#69c0ff' },
          ]),
        },
      },
      {
        name: '总流量',
        type: 'line',
        data: data.total,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#ff9c6e' },
        itemStyle: { color: '#ff9c6e' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,156,110,0.25)' },
            { offset: 1, color: 'rgba(255,156,110,0.02)' },
          ]),
        },
      },
    ],
  }
  chartInstance.value.setOption(option, true)
}

const resizeChart = () => {
  chartInstance.value?.resize()
}

onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
  })
  // 加载统计卡片
  fetchStatCards()
  // 加载下拉选项
  fetchParkingLotOptions()
  fetchParkTypeOptions()
  // 加载停车记录列表
  fetchVehicleData()
  // 加载趋势图数据
  fetchTrendData()
  // 加载停车场分布数据（地图组件自行初始化）
  fetchParkingSpace()
  // 设置整点后10秒定时刷新
  scheduleHourlyRefresh()
})

// ====== 整点后10秒定时刷新 ======
let hourlyTimeout: ReturnType<typeof setTimeout> | null = null
let hourlyInterval: ReturnType<typeof setInterval> | null = null

/** 计算距离下一个整点后10秒的毫秒数 */
const getMsToNextHour10 = (): number => {
  const now = new Date()
  const target = new Date(now)
  target.setMinutes(0, 10, 0) // 当前小时的 :00:10
  // 如果当前已过 :00:10，则目标为下一个小时的 :00:10
  if (target.getTime() <= now.getTime()) {
    target.setHours(target.getHours() + 1)
  }
  return target.getTime() - now.getTime()
}

/** 定时刷新趋势图和停车场分布数据 */
const scheduleHourlyRefresh = () => {
  const ms = getMsToNextHour10()
  hourlyTimeout = setTimeout(() => {
    fetchTrendData()
    fetchParkingSpace()
    // 之后每 1 小时刷新一次
    hourlyInterval = setInterval(() => {
      fetchTrendData()
      fetchParkingSpace()
    }, 60 * 60 * 1000)
  }, ms)
}

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
  // 清理定时器
  if (hourlyTimeout) {
    clearTimeout(hourlyTimeout)
    hourlyTimeout = null
  }
  if (hourlyInterval) {
    clearInterval(hourlyInterval)
    hourlyInterval = null
  }
})

// ===================== 车辆出入记录（接口驱动） =====================
const searchKeyword = ref('')
const parkingLot = ref('')
const parkType = ref('')

/** 下拉选项（接口获取） */
const parkingLotOptions = ref<ParkingLotOption[]>([])
const parkTypeOptions = ref<ParkTypeOption[]>([])

const vehicleColumns = [
  { title: '日期', dataIndex: 'parkDate', key: 'parkDate', width: 120 },
  { title: '时间', dataIndex: 'parkTime', key: 'parkTime', width: 100 },
  { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 130 },
  { title: '停车场', dataIndex: 'parkingLot', key: 'parkingLot', width: 110 },
  { title: '类型', dataIndex: 'parkType', key: 'parkType', width: 80 },
  { title: '车位号', dataIndex: 'spaceNo', key: 'spaceNo', width: 90 },
  { title: '停车时长', dataIndex: 'parkDuration', key: 'parkDuration', width: 120 },
  { title: '方向', dataIndex: 'direction', key: 'direction', width: 80 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' },
]

const vehicleData = ref<ParkingRecord[]>([])
const vehicleLoading = ref(false)
const vehiclePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

/** 查询停车记录 */
const fetchVehicleData = async () => {
  vehicleLoading.value = true
  try {
    const params: Request = {
      pageNo: vehiclePagination.value.current,
      pageSize: vehiclePagination.value.pageSize,
    }
    if (searchKeyword.value) params.plateNo = searchKeyword.value
    if (parkingLot.value) params.parkingLot = parkingLot.value
    if (parkType.value) params.parkType = parkType.value

    const res = await getRecordList(params)
    vehicleData.value = res?.records || []
    vehiclePagination.value.total = res?.total || 0
  } catch (error) {
    console.error('获取停车记录列表失败:', error)
  } finally {
    vehicleLoading.value = false
  }
}

/** 点击查询 */
const handleSearch = () => {
  vehiclePagination.value.current = 1
  fetchVehicleData()
}


/** 表格分页变化 */
const handleTableChange = (pag: any) => {
  vehiclePagination.value.current = pag.current
  vehiclePagination.value.pageSize = pag.pageSize
  fetchVehicleData()
}

/** 获取停车场下拉选项 */
const fetchParkingLotOptions = async () => {
  try {
    const res = await getParkingLotList()
    parkingLotOptions.value = res || []
  } catch (error) {
    console.error('获取停车场下拉列表失败:', error)
  }
}

/** 获取车辆类型下拉选项 */
const fetchParkTypeOptions = async () => {
  try {
    const res = await getParkTypeList()
    parkTypeOptions.value = res || []
  } catch (error) {
    console.error('获取车辆类型下拉列表失败:', error)
  }
}
</script>

<style scoped lang="less">
.vehicle-page { padding: 0; }

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
    .tag-green { background: #c6f6d5; color: #22543d; }
    .tag-blue { background: #bee3f8; color: #2a4365; }

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

/* 停车流量趋势 - 汇总 + 图表 */
.trend-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: linear-gradient(135deg, #f0f7ff 0%, #f7fafc 100%);
  border-radius: 10px;
  padding: 14px 20px;
  margin-bottom: 16px;

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .summary-label {
    font-size: 12px;
    color: #718096;
  }
  .summary-value {
    font-size: 22px;
    font-weight: 700;
    &.color-in { color: #52c41a; }
    &.color-out { color: #1890ff; }
    &.color-total { color: #ff7a45; }
  }
  .summary-divider {
    width: 1px;
    height: 32px;
    background: #e2e8f0;
  }
}

.trend-chart {
  width: 100%;
  height: 300px;
}

.map-placeholder {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #d0d9f0;
  min-height: 280px;
  padding: 30px;
  .map-icon { font-size: 48px; margin-bottom: 12px; }
  .map-text { font-size: 14px; color: #5a6a8a; font-weight: 500; }
  .map-sub { font-size: 12px; color: #8a9ab0; margin-top: 8px; }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  &.normal { background: #c6f6d5; color: #22543d; }
  &.info { background: #bee3f8; color: #2a4365; }
}
</style>