<template>
  <div class="vehicle-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="今日进场车辆" :value="statData.todayEntry" change-text="↑ 9.3% 较昨日" trend="up" color="blue" :icon="CarOutlined" />
      <StatCard label="当前在场车辆" :value="statData.currentParked" change-text="↑ 3.2% 较昨日" trend="up" color="green" :icon="ShopOutlined" />
      <StatCard label="剩余车位" :value="statData.remainingSpots" change-text="↑ 156 较昨日" trend="up" color="orange" :icon="EnvironmentOutlined" />
      <StatCard label="平均停车时长" :value="statData.avgParkingTime" change-text="↓ 12min 较昨日" trend="down" color="purple" :icon="ClockCircleOutlined" />
    </div>

    <!-- 两栏布局：停车场实时状态 + 流量趋势 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><EnvironmentOutlined /> 停车场实时状态</h3>
          <span class="tag tag-green">运行正常</span>
        </div>
        <div class="card-body">
          <div class="map-placeholder">
            <div class="map-icon"><CarOutlined /></div>
            <div class="map-text">停车场实时状态地图</div>
            <div class="map-sub">P1停车场 85/120 | P2停车场 62/80 | P3停车场 45/60</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><BarChartOutlined /> 24小时停车流量趋势</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">24小时停车流量趋势图</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 车辆出入记录表格 -->
    <div class="card">
      <div class="card-header">
        <h3><CarOutlined /> 车辆出入记录</h3>
        <div class="filter-bar">
          <a-input v-model:value="searchKeyword" placeholder="搜索车牌号" style="width: 180px" />
          <a-select v-model:value="parkingLot" style="width: 140px" placeholder="全部停车场">
            <a-select-option value="">全部停车场</a-select-option>
            <a-select-option value="P1">P1停车场</a-select-option>
            <a-select-option value="P2">P2停车场</a-select-option>
            <a-select-option value="P3">P3停车场</a-select-option>
          </a-select>
          <a-select v-model:value="direction" style="width: 120px" placeholder="全部方向">
            <a-select-option value="">全部方向</a-select-option>
            <a-select-option value="进场">进场</a-select-option>
            <a-select-option value="出场">出场</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
          <a-button><DownloadOutlined /> 导出</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="vehicleColumns"
          :data-source="vehicleData"
          :pagination="{ pageSize: 10 }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'direction'">
              <span class="status-text" :class="record.direction === '进场' ? 'normal' : 'info'">{{ record.direction }}</span>
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
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  CarOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SearchOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'VehicleManagementPage' })

const statData = {
  todayEntry: '1,856',
  currentParked: '1,023',
  remainingSpots: '2,156',
  avgParkingTime: '2h 35min',
}

const searchKeyword = ref('')
const parkingLot = ref('')
const direction = ref('')

const vehicleColumns = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '车牌号', dataIndex: 'plateNumber', key: 'plateNumber', width: 130 },
  { title: '车辆类型', dataIndex: 'vehicleType', key: 'vehicleType', width: 100 },
  { title: '停车场', dataIndex: 'parkingLot', key: 'parkingLot', width: 110 },
  { title: '方向', dataIndex: 'direction', key: 'direction', width: 80 },
  { title: '车位号', dataIndex: 'spotNumber', key: 'spotNumber', width: 90 },
  { title: '停车时长', dataIndex: 'duration', key: 'duration', width: 100 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' },
]

const vehicleData = [
  { id: 1, time: '2026-06-09 14:32:15', plateNumber: '京A·88888', vehicleType: '轿车', parkingLot: 'P1停车场', direction: '进场', spotNumber: 'A-012', duration: '-' },
  { id: 2, time: '2026-06-09 14:28:43', plateNumber: '京B·66666', vehicleType: 'SUV', parkingLot: 'P2停车场', direction: '出场', spotNumber: 'B-035', duration: '3h 12min' },
  { id: 3, time: '2026-06-09 14:25:10', plateNumber: '京C·12345', vehicleType: '轿车', parkingLot: 'P1停车场', direction: '进场', spotNumber: 'A-013', duration: '-' },
  { id: 4, time: '2026-06-09 14:22:05', plateNumber: '京A·99999', vehicleType: 'MPV', parkingLot: 'P3停车场', direction: '进场', spotNumber: 'C-008', duration: '-' },
  { id: 5, time: '2026-06-09 14:18:30', plateNumber: '京D·77777', vehicleType: 'SUV', parkingLot: 'P1停车场', direction: '出场', spotNumber: 'A-008', duration: '5h 45min' },
  { id: 6, time: '2026-06-09 14:15:22', plateNumber: '京E·33333', vehicleType: '轿车', parkingLot: 'P2停车场', direction: '进场', spotNumber: 'B-036', duration: '-' },
  { id: 7, time: '2026-06-09 14:10:48', plateNumber: '京A·55555', vehicleType: '新能源', parkingLot: 'P1停车场', direction: '进场', spotNumber: 'A-014', duration: '-' },
  { id: 8, time: '2026-06-09 14:05:12', plateNumber: '京F·22222', vehicleType: '轿车', parkingLot: 'P3停车场', direction: '出场', spotNumber: 'C-002', duration: '2h 20min' },
]
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