<template>
  <div class="venue-flow-page">
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

    <!-- 两栏布局：热力图 + 客流趋势 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><ClockCircleOutlined /> 实时客流热力图</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><ClockCircleOutlined /></div>
            <div class="chart-text">客流时段分布热力图</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 各场馆客流趋势</h3><span class="tag tag-blue">实时</span></div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">今日分时客流趋势图</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 各场馆客流统计表格 -->
    <div class="card">
      <div class="card-header">
        <h3><BarChartOutlined /> 各场馆客流统计</h3>
        <div class="filter-bar">
          <a-date-picker
            v-model:value="filterDate"
            style="width: 160px"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            @change="handleSearch"
          />
          <a-select
            v-model:value="filterVenueId"
            style="width: 140px"
            placeholder="全部场馆"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option v-for="item in venueOptions" :key="item.id" :value="item.id">{{ item.venueName }}</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="flowColumns"
          :data-source="flowData"
          :loading="flowLoading"
          :pagination="false"
          row-key="venueId"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'compareRate'">
              <span :style="{ color: record.compareRate?.includes('↑') ? '#38a169' : '#e53e3e' }">
                {{ record.compareRate }}
              </span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === 1 ? 'normal' : 'danger'">
                {{ record.statusLabel || (record.status === 1 ? '正常' : '异常') }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { StatCard } from '/@/views/bems-web/components'
import { getFlowSummary, getFlowList } from './index.api'
import type { StatItem, VenueFlowVO } from './index.api'
import { getVenueList } from '../venueScheduling/index.api'
import type { VenueItem } from '../venueScheduling/index.api'
import {
  TeamOutlined, UserOutlined, RiseOutlined, ClockCircleOutlined,
  BarChartOutlined, SearchOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'VenueFlowPage' })

// ===== 卡片配置 =====
const cardConfig = [
  { color: 'blue' as const, icon: TeamOutlined },
  { color: 'green' as const, icon: UserOutlined },
  { color: 'orange' as const, icon: RiseOutlined },
  { color: 'purple' as const, icon: ClockCircleOutlined },
]

// ===== 统计卡片 =====
const statCards = ref<StatItem[]>([])

const fetchStatCards = async () => {
  try {
    const res = await getFlowSummary()
    statCards.value = res || []
  } catch (error) {
    console.error('获取客流汇总卡片失败:', error)
  }
}

// ===== 场馆下拉 =====
const venueOptions = ref<VenueItem[]>([])

const fetchVenueOptions = async () => {
  try {
    const res = await getVenueList()
    venueOptions.value = res || []
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

// ===== 客流统计表格 =====
const filterDate = ref<string>(dayjs().format('YYYY-MM-DD'))
const filterVenueId = ref<number| string>('')
const flowData = ref<VenueFlowVO[]>([])
const flowLoading = ref(false)

const flowColumns = [
  { title: '场馆', dataIndex: 'venueName', key: 'venueName', width: 120 },
  { title: '今日进场', dataIndex: 'todayInCount', key: 'todayInCount', width: 100 },
  { title: '当前在场', dataIndex: 'todayNowCount', key: 'todayNowCount', width: 100 },
  { title: '峰值人数', dataIndex: 'maxCount', key: 'maxCount', width: 100 },
  { title: '峰值时间', dataIndex: 'maxTime', key: 'maxTime', width: 100 },
  { title: '平均停留', dataIndex: 'averageDuration', key: 'averageDuration', width: 100 },
  { title: '较昨日', dataIndex: 'compareRate', key: 'compareRate', width: 100 },
  { title: '状态', key: 'status', width: 80 },
]

const fetchFlowData = async () => {
  flowLoading.value = true
  try {
    const params: Record<string, any> = { date: filterDate.value }
    if (filterVenueId.value !== undefined) params.venueId = filterVenueId.value
    const res = await getFlowList(params)
    flowData.value = res || []
  } catch (error) {
    console.error('获取客流统计列表失败:', error)
  } finally {
    flowLoading.value = false
  }
}

const handleSearch = () => {
  fetchFlowData()
}

onMounted(() => {
  fetchStatCards()
  fetchVenueOptions()
  fetchFlowData()
})
</script>

<style scoped lang="less">
.venue-flow-page { padding: 0; }

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

    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
  }

  .card-body { padding: 22px; }
}

.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 260px;
  padding: 30px;

  .chart-icon { font-size: 48px; margin-bottom: 12px; }
  .chart-text { font-size: 14px; color: #718096; font-weight: 500; }
  .chart-sub { font-size: 12px; color: #a0aec0; margin-top: 8px; }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.normal { background: #c6f6d5; color: #22543d; }
  &.danger { background: #fed7d7; color: #742a2a; }
}
</style>
