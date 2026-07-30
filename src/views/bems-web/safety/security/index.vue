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
        <div class="layout-control">
          <a-button-group>
            <a-button :type="gridLayout === '1x1' ? 'primary' : 'default'" size="small" @click="gridLayout = '1x1'">1×1</a-button>
            <a-button :type="gridLayout === '2x2' ? 'primary' : 'default'" size="small" @click="gridLayout = '2x2'">2×2</a-button>
            <a-button :type="gridLayout === '3x3' ? 'primary' : 'default'" size="small" @click="gridLayout = '3x3'">3×3</a-button>
            <a-button :type="gridLayout === '4x4' ? 'primary' : 'default'" size="small" @click="gridLayout = '4x4'">4×4</a-button>
          </a-button-group>
        </div>
      </div>
      <div class="card-body">
        <div class="camera-grid" :class="gridLayout">
          <div class="camera-item" v-for="cam in cameraList" :key="cam.id">
            <div class="camera-preview">
              <div class="camera-icon"><VideoCameraOutlined /></div>
              <div class="camera-name">{{ cam.name }}</div>
            </div>
            <div class="camera-info">
              <span class="status-dot" :class="cam.status"></span>
              <span>{{ cam.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 两栏布局：视频巡更计划 + AI分析事件 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><ScheduleOutlined /> 视频巡更计划</h3>
          <a-button type="primary" size="small">+ 新增巡更</a-button>
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
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small">查看</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><WarningOutlined /> AI视频分析事件</h3>
          <span class="tag tag-red">3 条未处理</span>
        </div>
        <div class="card-body">
          <div class="event-list">
            <div class="event-item" v-for="event in aiEvents" :key="event.id">
              <div class="event-icon" :style="{ background: event.bgColor, color: event.iconColor }">
                <component :is="event.icon" />
              </div>
              <div class="event-content">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-meta">{{ event.location }} | {{ event.time }}</div>
              </div>
              <a-button type="primary" size="small" danger>处理</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能说明 -->
    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>通过视频监控系统，对场馆内重点区域进行实时监控和智能分析。平台与安防视频系统对接，获取实时视频流、设备状态、AI分析事件等数据，实现视频巡更、事件预警、历史回放等业务功能。</p>
      <div class="feature-list">
        <div class="feature-list-item">实时视频监控画面预览</div>
        <div class="feature-list-item">多画面布局自由切换</div>
        <div class="feature-list-item">视频巡更计划编排与执行</div>
        <div class="feature-list-item">AI视频智能分析（人员聚集/遗留物/禁区入侵）</div>
        <div class="feature-list-item">告警事件自动识别与推送</div>
        <div class="feature-list-item">历史视频检索与回放</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  VideoCameraOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  DeleteOutlined,
  LockOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'SecurityManagementPage' })

const statData = {
  totalCameras: 156,
  onlineCameras: '154',
  todayPatrol: '6/8',
  aiEvents: 3,
}

const gridLayout = ref('2x2')

const cameraList = [
  { id: 1, name: 'CAM-01', location: 'A馆东门入口', status: 'online' },
  { id: 2, name: 'CAM-02', location: 'A馆F1大厅', status: 'online' },
  { id: 3, name: 'CAM-03', location: 'A馆F2展厅', status: 'online' },
  { id: 4, name: 'CAM-04', location: 'B馆南门入口', status: 'online' },
  { id: 5, name: 'CAM-05', location: 'B馆会议中心', status: 'online' },
  { id: 6, name: 'CAM-06', location: 'C馆西门入口', status: 'offline' },
  { id: 7, name: 'CAM-07', location: 'C馆F1展厅', status: 'online' },
  { id: 8, name: 'CAM-08', location: '停车场入口', status: 'online' },
]

const patrolColumns = [
  { title: '巡更名称', dataIndex: 'name', key: 'name' },
  { title: '巡更区域', dataIndex: 'area', key: 'area' },
  { title: '执行时间', dataIndex: 'time', key: 'time' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 70 },
]

const patrolData = [
  { id: 1, name: '早间例行巡更', area: 'A馆全区域', time: '08:00 - 09:00', status: '已完成' },
  { id: 2, name: '午间安全巡更', area: 'B馆全区域', time: '12:00 - 13:00', status: '进行中' },
  { id: 3, name: '下午场馆巡更', area: 'C馆全区域', time: '15:00 - 16:00', status: '待开始' },
  { id: 4, name: '夜间安防巡更', area: '全馆区域', time: '22:00 - 23:00', status: '待开始' },
]

const aiEvents = [
  { id: 1, title: '人员聚集检测', location: 'A馆F2展厅', time: '2026-06-09 14:20', icon: TeamOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e' },
  { id: 2, title: '遗留物检测', location: 'B馆F1大厅', time: '2026-06-09 13:45', icon: DeleteOutlined, bgColor: '#fffaf0', iconColor: '#dd6b20' },
  { id: 3, title: '禁区入侵检测', location: 'C馆设备间', time: '2026-06-09 13:12', icon: LockOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e' },
]
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

// 摄像头网格
.camera-grid {
  display: grid;
  gap: 12px;

  &.1x1 { grid-template-columns: 1fr; }
  &.2x2 { grid-template-columns: 1fr 1fr; }
  &.3x3 { grid-template-columns: 1fr 1fr 1fr; }
  &.4x4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

  .camera-item {
    background: #1a1a2e;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 2px solid #2d2d4e;

    .camera-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.3);

      .camera-icon { font-size: 36px; margin-bottom: 8px; }
      .camera-name { font-size: 13px; color: rgba(255, 255, 255, 0.5); }
    }

    .camera-info {
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.5);
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

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

// AI事件列表
.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .event-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f0f0;

    .event-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .event-content {
      flex: 1;
      min-width: 0;

      .event-title {
        font-size: 13px;
        font-weight: 600;
        color: #2d3748;
      }

      .event-meta {
        font-size: 12px;
        color: #a0aec0;
        margin-top: 2px;
      }
    }
  }
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