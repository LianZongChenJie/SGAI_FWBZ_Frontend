<template>
  <div class="event-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <StatCard label="当前展会" :value="statData.activeEvents" change-text="进行中" trend="up" color="blue" :icon="PlayCircleOutlined" />
      <StatCard label="现场调度指令" :value="statData.dispatchCount" change-text="↑ 12 今日" trend="up" color="green" :icon="SendOutlined" />
      <StatCard label="投诉建议" :value="statData.complaints" change-text="↓ 2 较昨日" trend="down" color="orange" :icon="MessageOutlined" />
      <StatCard label="设备异常" :value="statData.deviceErrors" change-text="↓ 3 已处理" trend="down" color="purple" :icon="ToolOutlined" />
    </div>

    <!-- 对屏指挥 + 对屏控制 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><DesktopOutlined /> 对屏指挥看板</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 350px;">
            <div class="chart-icon"><DesktopOutlined /></div>
            <div class="chart-text">指挥大屏实时数据展示</div>
            <div class="chart-sub">客流/能耗/设备/告警/视频 多维度融合</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><ControlOutlined /> 对屏控制面板</h3>
          <span class="tag tag-green">可控</span>
        </div>
        <div class="card-body">
          <div class="control-grid">
            <div class="control-card" v-for="item in controlPanels" :key="item.title">
              <div class="control-card-header">
                <div class="control-card-icon" :style="{ background: item.bgColor, color: item.iconColor }">
                  <component :is="item.icon" />
                </div>
                <div>
                  <div class="control-card-title">{{ item.title }}</div>
                  <div class="control-card-meta">{{ item.meta }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 投诉建议处理 -->
    <div class="card">
      <div class="card-header">
        <h3><MessageOutlined /> 投诉建议处理</h3>
        <a-button type="primary">+ 新增记录</a-button>
      </div>
      <div class="card-body">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <span class="status-text" :class="record.typeClass">{{ record.type }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.statusClass">{{ record.status }}</span>
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
import { StatCard } from '/@/views/bems-web/components'
import {
  PlayCircleOutlined,
  SendOutlined,
  MessageOutlined,
  ToolOutlined,
  DesktopOutlined,
  ControlOutlined,
  CloudOutlined,
  BulbOutlined,
  VideoCameraOutlined,
  AlertOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'EventDuringPage' })

const statData = {
  activeEvents: 3,
  dispatchCount: 45,
  complaints: 3,
  deviceErrors: 1,
}

const controlPanels = [
  { title: '空调控制', meta: '温度/模式/风速', icon: CloudOutlined, bgColor: '#ebf8ff', iconColor: '#3182ce' },
  { title: '照明控制', meta: '开关/亮度/场景', icon: BulbOutlined, bgColor: '#f0fff4', iconColor: '#38a169' },
  { title: '视频切换', meta: '监控画面/广播', icon: VideoCameraOutlined, bgColor: '#fffaf0', iconColor: '#dd6b20' },
  { title: '应急控制', meta: '广播/疏散/联动', icon: AlertOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e' },
]

const columns = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 100 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '内容', dataIndex: 'content', key: 'content' },
  { title: '来源', dataIndex: 'source', key: 'source', width: 150 },
  { title: '处理人', dataIndex: 'handler', key: 'handler', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 80 },
]

const tableData = [
  { id: 1, time: '13:30:22', type: '建议', typeClass: 'warning', content: 'A馆F2层空调温度偏低，建议调高1°C', source: '参展商-展位A-105', handler: '张工', status: '已处理', statusClass: 'normal' },
  { id: 2, time: '13:15:10', type: '投诉', typeClass: 'danger', content: 'B馆会议室音响有杂音，影响论坛进行', source: '主办方-新能源论坛', handler: '李工', status: '处理中', statusClass: 'warning' },
  { id: 3, time: '12:45:33', type: '咨询', typeClass: 'info', content: '咨询C馆室外广场临时用电申请流程', source: '参展商-汽车展', handler: '王工', status: '已回复', statusClass: 'normal' },
]
</script>

<style scoped lang="less">
.event-page { padding: 0; }

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
  margin-bottom: 20px;
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
  min-height: 280px;
  padding: 30px;

  .chart-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .chart-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }

  .chart-sub {
    font-size: 12px;
    color: #a0aec0;
    margin-top: 8px;
  }
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .control-card {
    background: #f7fafc;
    border-radius: 10px;
    padding: 18px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #3182ce;
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.1);
    }

    .control-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .control-card-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .control-card-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }

    .control-card-meta {
      font-size: 12px;
      color: #718096;
      margin-top: 2px;
    }
  }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
  &.info { background: #bee3f8; color: #2a4365; }
}
</style>
