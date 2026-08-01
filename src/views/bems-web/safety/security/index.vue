<template>
  <div class="security-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard label="监控摄像头总数" :value="statData.totalCameras" change-text="↑ 8 新增" trend="up" color="blue" :icon="VideoCameraOutlined" />
      <StatCard label="在线摄像头" :value="statData.onlineCameras" change-text="98.7%" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="今日视频巡更" :value="statData.todayPatrol" change-text="↑ 2 条完成" trend="up" color="orange" :icon="ScheduleOutlined" />
      <StatCard label="AI分析事件" :value="statData.aiEvents" change-text="↓ 3 较昨日" trend="down" color="red" :icon="WarningOutlined" />
    </div>

    <!-- 实时监控画面 -->
    <div class="card">
      <div class="card-header">
        <h3><VideoCameraOutlined /> 实时监控画面</h3>
      </div>
      <div class="card-body">
        <CameraCarousel :cameras="cameraList" :items-per-page="8" />
      </div>
    </div>

    <!-- 两栏布局：视频巡更计划 + AI分析事件 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><ScheduleOutlined /> 视频巡更计划</h3>
          <a-button type="primary">+ 新增巡更</a-button>
        </div>
        <div class="card-body">
          <a-table
            :columns="patrolColumns"
            :data-source="patrolData"
            :pagination="false"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <span class="status-text" :class="record.status === '进行中' ? 'normal' : record.status === '待开始' ? 'info' : 'warning'">
                  {{ record.status }}
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><WarningOutlined /> AI视频分析事件</h3>
          <a-button @click="handleViewAllAIEvents">查看全部</a-button>
        </div>
        <div class="card-body">
          <AlertCard
            v-for="event in displayedAIEvents"
            :key="event.id"
            :level="event.level"
            :title="event.title"
            :description="event.description"
            :time="event.time"
            :show-actions="false"
          />
        </div>
      </div>
    </div>

    <!-- AI事件详情弹窗 -->
    <a-modal
      v-model:visible="aiEventsModalVisible"
      title="AI视频分析事件"
      width="800px"
      :footer="null"
    >
      <div class="ai-events-modal">
        <AlertCard
          v-for="event in allAIEvents"
          :key="event.id"
          :level="event.level"
          :title="event.title"
          :description="event.description"
          :time="`${event.time} | ${event.location}`"
          :show-actions="false"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard, AlertCard } from '/@/views/bems-web/components'
import CameraCarousel from '../components/CameraCarousel/index.vue'
import {
  VideoCameraOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'SecurityManagementPage' })

const statData = {
  totalCameras: 156,
  onlineCameras: '154',
  todayPatrol: '6/8',
  aiEvents: 3,
}

const cameraList = [
  { id: 1, name: 'CAM-01', location: 'A馆东门入口', status: 'online' as const, ip: '192.168.1.101' },
  { id: 2, name: 'CAM-02', location: 'A馆F1大厅', status: 'online' as const, ip: '192.168.1.102' },
  { id: 3, name: 'CAM-03', location: 'A馆F2展厅', status: 'online' as const, ip: '192.168.1.103' },
  { id: 4, name: 'CAM-04', location: 'B馆南门入口', status: 'online' as const, ip: '192.168.1.104' },
  { id: 5, name: 'CAM-05', location: 'B馆会议中心', status: 'online' as const, ip: '192.168.1.105' },
  { id: 6, name: 'CAM-06', location: 'C馆西门入口', status: 'offline' as const, ip: '192.168.1.106' },
]

const patrolColumns = [
  { title: '巡更名称', dataIndex: 'name', key: 'name' },
  { title: '巡更区域', dataIndex: 'area', key: 'area' },
  { title: '执行时间', dataIndex: 'time', key: 'time' },
  { title: '状态', dataIndex: 'status', key: 'status' },
]

const patrolData = [
  { id: 1, name: '早间例行巡更', area: 'A馆全区域', time: '08:00 - 09:00', status: '已完成' },
  { id: 2, name: '午间安全巡更', area: 'B馆全区域', time: '12:00 - 13:00', status: '进行中' },
  { id: 3, name: '下午场馆巡更', area: 'C馆全区域', time: '15:00 - 16:00', status: '待开始' },
  { id: 4, name: '夜间安防巡更', area: '全馆区域', time: '22:00 - 23:00', status: '待开始' },
]

// 所有AI事件数据
const allAIEvents = [
  {
    id: 1,
    level: 'danger' as const,
    title: '人员聚集检测',
    description: 'A馆F2展厅检测到超50人聚集，存在安全隐患',
    time: '2026-06-09 14:20',
    location: 'A馆F2展厅'
  },
  {
    id: 2,
    level: 'warning' as const,
    title: '遗留物检测',
    description: 'B馆F1大厅中央区域发现可疑遗留物品',
    time: '2026-06-09 13:45',
    location: 'B馆F1大厅'
  },
  {
    id: 3,
    level: 'danger' as const,
    title: '禁区入侵检测',
    description: 'C馆设备间检测到未授权人员进入',
    time: '2026-06-09 13:12',
    location: 'C馆设备间'
  },
  {
    id: 4,
    level: 'warning' as const,
    title: '异常行为检测',
    description: '停车场B区域检测到可疑徘徊行为',
    time: '2026-06-09 12:55',
    location: '停车场B区域'
  },
  {
    id: 5,
    level: 'info' as const,
    title: '周界入侵告警',
    description: '户外广场南侧围栏检测到异常触碰',
    time: '2026-06-09 12:30',
    location: '户外广场南侧'
  },
]

// 显示前3个事件
const displayedAIEvents = allAIEvents.slice(0, 3)

// 弹窗状态
const aiEventsModalVisible = ref(false)

// 查看全部事件
const handleViewAllAIEvents = () => {
  aiEventsModalVisible.value = true
}
</script>

<style scoped lang="less">
.security-page { padding: 0; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
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
    .tag-red { background: #fed7d7; color: #742a2a; }

    .layout-control {
      display: flex;
      gap: 8px;
    }
  }

  .card-body {
    padding: 22px;
  }
}

// 状态点样式已在CameraCarousel组件中定义，此处保留通用样式

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  &.online { background: #52c41a; }
  &.offline { background: #ff4d4f; }
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
  &.warning { background: #feebc8; color: #744210; }
}

.ai-events-modal {
  max-height: 60vh;
  overflow-y: auto;
}

.feature-panel {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  border: 1px solid #e8e0f0;

  h4 {
    font-size: 15px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    font-size: 13px;
    color: #4a5568;
    line-height: 1.8;
    margin-bottom: 16px;
  }

  .feature-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    .feature-list-item {
      font-size: 12px;
      color: #5a6a8a;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      &::before { content: '✓'; color: #52c41a; font-weight: 700; }
    }
  }
}
</style>