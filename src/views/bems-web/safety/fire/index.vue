<template>
  <div class="fire-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="消防设备总数" :value="statData.totalDevices" change-text="↑ 12 新增" trend="up" color="blue" :icon="FireOutlined" />
      <StatCard label="设备在线率" :value="statData.onlineRate" change-text="↑ 0.5% 较上周" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="今日巡检完成" :value="statData.todayInspection" change-text="↑ 3 项完成" trend="up" color="orange" :icon="ScheduleOutlined" />
      <StatCard label="待处理告警" :value="statData.pendingAlerts" change-text="↓ 5 较昨日" trend="down" color="red" :icon="WarningOutlined" />
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
          <span class="tag tag-green">正常</span>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">设备状态统计图表</div>
            <div class="chart-sub">正常 268 | 离线 12 | 故障 6</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 消防设备实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3><FireOutlined /> 消防设备实时监测</h3>
        <div class="filter-bar">
          <a-input v-model:value="searchKeyword" placeholder="搜索设备编号/名称" style="width: 200px" />
          <a-select v-model:value="deviceStatus" style="width: 130px" placeholder="全部状态">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="normal">正常</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="fault">故障</a-select-option>
          </a-select>
          <a-select v-model:value="deviceType" style="width: 130px" placeholder="全部类型">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="smoke">烟感探测器</a-select-option>
            <a-select-option value="sprinkler">喷淋系统</a-select-option>
            <a-select-option value="alarm">手动报警</a-select-option>
            <a-select-option value="hydrant">消火栓</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="deviceColumns"
          :data-source="deviceData"
          :pagination="{ pageSize: 10 }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-dot" :class="record.status"></span>
              <span>{{ record.statusLabel }}</span>
            </template>
            <template v-if="column.key === 'battery'">
              <span :style="{ color: record.batteryLevel < 20 ? '#ff4d4f' : record.batteryLevel < 50 ? '#faad14' : '#52c41a' }">
                {{ record.batteryLevel }}%
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">详情</a-button>
              <a-button type="link" size="small">巡检</a-button>
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
  FireOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  WarningOutlined,
  HeatMapOutlined,
  PieChartOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'FireManagementPage' })

const statData = {
  totalDevices: 286,
  onlineRate: '96.5%',
  todayInspection: '42/45',
  pendingAlerts: 8,
}

const searchKeyword = ref('')
const deviceStatus = ref('')
const deviceType = ref('')

const deviceColumns = [
  { title: '设备编号', dataIndex: 'deviceId', key: 'deviceId', width: 130 },
  { title: '设备类型', dataIndex: 'deviceType', key: 'deviceType', width: 110 },
  { title: '安装位置', dataIndex: 'location', key: 'location', width: 160 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '信号强度', dataIndex: 'signalStrength', key: 'signalStrength', width: 100 },
  { title: '电池电量', dataIndex: 'batteryLevel', key: 'battery', width: 90 },
  { title: '最近巡检', dataIndex: 'lastInspection', key: 'lastInspection', width: 170 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' },
]

const deviceData = [
  { id: 1, deviceId: 'SMK-201', deviceType: '烟感探测器', location: 'A馆-F2-走廊', status: 'normal', statusLabel: '正常', signalStrength: '-65dBm', batteryLevel: 85, lastInspection: '2026-06-08 09:30' },
  { id: 2, deviceId: 'SMK-202', deviceType: '烟感探测器', location: 'A馆-F2-展厅A', status: 'normal', statusLabel: '正常', signalStrength: '-62dBm', batteryLevel: 92, lastInspection: '2026-06-08 09:35' },
  { id: 3, deviceId: 'SPR-001', deviceType: '喷淋系统', location: 'B馆-F1-大厅', status: 'normal', statusLabel: '正常', signalStrength: '-58dBm', batteryLevel: 100, lastInspection: '2026-06-07 14:20' },
  { id: 4, deviceId: 'MAN-003', deviceType: '手动报警', location: 'C馆-西门-入口', status: 'offline', statusLabel: '离线', signalStrength: 'N/A', batteryLevel: 15, lastInspection: '2026-06-06 11:00' },
  { id: 5, deviceId: 'HYD-005', deviceType: '消火栓', location: 'A馆-F1-东侧', status: 'normal', statusLabel: '正常', signalStrength: '-70dBm', batteryLevel: 100, lastInspection: '2026-06-08 10:15' },
  { id: 6, deviceId: 'SMK-203', deviceType: '烟感探测器', location: 'B馆-F2-会议室', status: 'fault', statusLabel: '故障', signalStrength: '-85dBm', batteryLevel: 45, lastInspection: '2026-06-07 16:50' },
  { id: 7, deviceId: 'SPR-002', deviceType: '喷淋系统', location: 'C馆-F1-展厅', status: 'normal', statusLabel: '正常', signalStrength: '-60dBm', batteryLevel: 100, lastInspection: '2026-06-08 08:45' },
  { id: 8, deviceId: 'MAN-004', deviceType: '手动报警', location: 'A馆-东门-入口', status: 'normal', statusLabel: '正常', signalStrength: '-55dBm', batteryLevel: 78, lastInspection: '2026-06-08 09:00' },
]
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
  .chart-sub { font-size: 12px; color: #a0aec0; margin-top: 8px; }
}

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