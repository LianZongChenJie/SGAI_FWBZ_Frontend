<template>
  <div class="event-page">
    <div class="stats-row">
      <StatCard label="当前进行展会" :value="statData.activeEvents" change-text="↑ 1 较昨日" trend="up" color="blue" :icon="PlayCircleOutlined" />
      <StatCard label="现场总人数" :value="statData.totalPeople" change-text="↑ 8.5% 较昨日" trend="up" color="green" :icon="TeamOutlined" />
      <StatCard label="展位使用率" :value="statData.boothUsage" change-text="↑ 3.2% 较昨日" trend="up" color="orange" :icon="AppstoreOutlined" />
      <StatCard label="满意度评分" :value="statData.satisfaction" change-text="↑ 0.2 较昨日" trend="up" color="purple" :icon="StarOutlined" />
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><DashboardOutlined /> 展会实时数据看板</h3><span class="tag tag-blue">实时</span></div>
        <div class="card-body">
          <div class="real-time-dashboard">
            <div class="rt-item" v-for="item in realtimeData" :key="item.label">
              <div class="rt-label">{{ item.label }}</div>
              <div class="rt-value">{{ item.value }}</div>
              <div class="rt-change" :class="item.trend === 'up' ? 'up' : 'down'">{{ item.change }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 现场客流趋势</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">今日展会现场分时客流趋势图</div>
            <div class="chart-sub">当前峰值 2,350人</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><CustomerServiceOutlined /> 现场服务请求</h3>
        <div class="filter-bar">
          <a-select v-model:value="requestFilter" style="width: 130px" placeholder="全部类型">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="设备故障">设备故障</a-select-option>
            <a-select-option value="安保求助">安保求助</a-select-option>
            <a-select-option value="咨询服务">咨询服务</a-select-option>
            <a-select-option value="医疗急救">医疗急救</a-select-option>
          </a-select>
          <a-select v-model:value="statusFilter" style="width: 120px" placeholder="全部状态">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="待处理">待处理</a-select-option>
            <a-select-option value="处理中">处理中</a-select-option>
            <a-select-option value="已完成">已完成</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 8 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'priority'">
              <span class="status-text" :class="record.priority === '紧急' ? 'danger' : record.priority === '重要' ? 'warning' : 'info'">{{ record.priority }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === '已完成' ? 'normal' : record.status === '处理中' ? 'warning' : 'danger'">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">处理</a-button>
              <a-button type="link" size="small">转派</a-button>
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
  PlayCircleOutlined, TeamOutlined, AppstoreOutlined, StarOutlined,
  DashboardOutlined, BarChartOutlined, CustomerServiceOutlined,
  SearchOutlined, InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'EventDuringPage' })

const statData = { activeEvents: 2, totalPeople: '3,567', boothUsage: '92.5%', satisfaction: '4.8' }
const requestFilter = ref('')
const statusFilter = ref('')

const realtimeData = [
  { label: 'A馆客流', value: '1,234', change: '+12.5%', trend: 'up' },
  { label: 'B馆客流', value: '892', change: '+5.3%', trend: 'up' },
  { label: 'C馆客流', value: '1,441', change: '-2.1%', trend: 'down' },
  { label: '展位使用率', value: '92.5%', change: '+3.2%', trend: 'up' },
  { label: '服务请求', value: '8', change: '-3', trend: 'down' },
  { label: '平均响应', value: '3.5min', change: '-1.2min', trend: 'down' },
]

const columns = [
  { title: '请求编号', dataIndex: 'id', key: 'id', width: 80 },
  { title: '请求类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '所属展会', dataIndex: 'event', key: 'event', width: 120 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 100 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 70 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 110, fixed: 'right' },
]

const tableData = [
  { id: 'REQ-001', type: '设备故障', description: 'A馆3号展位投影仪无法显示', event: '2024国际车展', location: 'A馆-3号', priority: '紧急', status: '处理中' },
  { id: 'REQ-002', type: '安保求助', description: 'B馆入口处发现可疑包裹', event: '智慧城市博览会', location: 'B馆入口', priority: '紧急', status: '待处理' },
  { id: 'REQ-003', type: '咨询服务', description: '参展商咨询展位电力增容', event: '2024国际车展', location: 'A馆服务台', priority: '一般', status: '处理中' },
  { id: 'REQ-004', type: '设备故障', description: 'C馆空调出风口漏水', event: '家居设计展', location: 'C馆-012', priority: '重要', status: '待处理' },
  { id: 'REQ-005', type: '咨询服务', description: '观众询问失物招领处位置', event: '智慧城市博览会', location: 'B馆服务台', priority: '一般', status: '已完成' },
  { id: 'REQ-006', type: '医疗急救', description: 'A馆有观众突感身体不适', event: '2024国际车展', location: 'A馆-008', priority: '紧急', status: '处理中' },
  { id: 'REQ-007', type: '安保求助', description: 'B馆发现展品损坏纠纷', event: '智慧城市博览会', location: 'B馆-015', priority: '重要', status: '待处理' },
  { id: 'REQ-008', type: '咨询服务', description: '展商咨询展位延期申请流程', event: '家居设计展', location: 'C馆服务台', priority: '一般', status: '已完成' },
]
</script>

<style scoped lang="less">
.event-page { padding: 0; }

.real-time-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  .rt-item {
    background: #fafafa;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    .rt-label { font-size: 12px; color: #999; margin-bottom: 8px; }
    .rt-value { font-size: 24px; font-weight: 600; color: #333; }
    .rt-change {
      font-size: 12px; margin-top: 4px;
      &.up { color: #52c41a; }
      &.down { color: #ff4d4f; }
    }
  }
}
</style>