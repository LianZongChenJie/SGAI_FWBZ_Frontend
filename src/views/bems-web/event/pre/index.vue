<template>
  <div class="event-page">
    <div class="stats-row">
      <StatCard label="今日展会数" :value="statData.todayEvents" change-text="↑ 2 较昨日" trend="up" color="blue" :icon="CalendarOutlined" />
      <StatCard label="本周展会数" :value="statData.weekEvents" change-text="↑ 5 较上周" trend="up" color="green" :icon="ScheduleOutlined" />
      <StatCard label="参展商总数" :value="statData.exhibitorCount" change-text="↑ 15 新增" trend="up" color="orange" :icon="ShopOutlined" />
      <StatCard label="预计总客流" :value="statData.expectedVisitors" change-text="↑ 8.5% 较上周" trend="up" color="purple" :icon="TeamOutlined" />
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><CheckCircleOutlined /> 展前准备任务</h3></div>
        <div class="card-body">
          <div class="task-list">
            <div class="task-item" v-for="task in taskList" :key="task.title">
              <div class="task-status">
                <CheckCircleFilled v-if="task.status === 'done'" style="color: #52c41a;" />
                <SyncOutlined v-else-if="task.status === 'doing'" spin style="color: #1890ff;" />
                <ClockCircleOutlined v-else style="color: #d9d9d9;" />
              </div>
              <div class="task-info">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-deadline">截止时间：{{ task.deadline }}</div>
              </div>
              <div class="task-assignee">{{ task.assignee }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 展前准备进度</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各展会准备进度对比图</div>
            <div class="chart-sub">整体完成率 78%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><ShopOutlined /> 展商信息管理</h3>
        <div class="filter-bar">
          <a-input v-model:value="searchKeyword" placeholder="搜索展商名称" style="width: 180px" />
          <a-select v-model:value="eventFilter" style="width: 150px" placeholder="全部展会">
            <a-select-option value="">全部展会</a-select-option>
            <a-select-option value="2024国际车展">2024国际车展</a-select-option>
            <a-select-option value="智慧城市博览会">智慧城市博览会</a-select-option>
            <a-select-option value="家居设计展">家居设计展</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 8 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === '已确认' ? 'normal' : record.status === '待确认' ? 'warning' : 'info'">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">编辑</a-button>
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
  CalendarOutlined, ScheduleOutlined, ShopOutlined, TeamOutlined, CheckCircleOutlined,
  BarChartOutlined, CheckCircleFilled, SyncOutlined, ClockCircleOutlined,
  SearchOutlined, InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'EventPrePage' })

const statData = { todayEvents: 3, weekEvents: 8, exhibitorCount: 156, expectedVisitors: '12,500' }
const searchKeyword = ref('')
const eventFilter = ref('')

const taskList = [
  { title: '展位搭建与布置验收', deadline: '2024-03-15 18:00', assignee: '张三', status: 'done' },
  { title: '展商证件制作与发放', deadline: '2024-03-14 12:00', assignee: '李四', status: 'doing' },
  { title: '展会设备调试与测试', deadline: '2024-03-14 17:00', assignee: '王五', status: 'doing' },
  { title: '安保人员岗前培训', deadline: '2024-03-13 16:00', assignee: '赵六', status: 'pending' },
  { title: '场馆清洁与消杀', deadline: '2024-03-14 20:00', assignee: '外包服务', status: 'pending' },
  { title: '导览系统安装与测试', deadline: '2024-03-14 15:00', assignee: '技术部', status: 'pending' },
]

const columns = [
  { title: '展商名称', dataIndex: 'name', key: 'name' },
  { title: '所属展会', dataIndex: 'event', key: 'event' },
  { title: '展位号', dataIndex: 'booth', key: 'booth', width: 100 },
  { title: '联系人', dataIndex: 'contact', key: 'contact', width: 90 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '展品类别', dataIndex: 'category', key: 'category' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
]

const tableData = [
  { id: 1, name: '蔚来汽车', event: '2024国际车展', booth: 'A-001', contact: '王经理', phone: '138****5678', category: '新能源汽车', status: '已确认' },
  { id: 2, name: '华为技术', event: '智慧城市博览会', booth: 'B-012', contact: '李经理', phone: '139****2345', category: '智慧城市', status: '已确认' },
  { id: 3, name: '小米科技', event: '智慧城市博览会', booth: 'B-015', contact: '张经理', phone: '136****7890', category: '智能家居', status: '已确认' },
  { id: 4, name: '顾家家居', event: '家居设计展', booth: 'C-008', contact: '陈经理', phone: '135****3456', category: '家具', status: '待确认' },
  { id: 5, name: '美的集团', event: '智慧城市博览会', booth: 'B-020', contact: '刘经理', phone: '137****6789', category: '智能家电', status: '已确认' },
  { id: 6, name: '比亚迪', event: '2024国际车展', booth: 'A-005', contact: '赵经理', phone: '158****1234', category: '新能源汽车', status: '已确认' },
  { id: 7, name: '欧派家居', event: '家居设计展', booth: 'C-012', contact: '周经理', phone: '159****5678', category: '定制家居', status: '待确认' },
  { id: 8, name: '腾讯云', event: '智慧城市博览会', booth: 'B-025', contact: '吴经理', phone: '186****9012', category: '云计算', status: '已确认' },
]
</script>

<style scoped lang="less">
.event-page { padding: 0; }

.task-list {
  .task-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child { border-bottom: none; }
    .task-status {
      width: 24px;
      font-size: 16px;
      margin-right: 12px;
    }
    .task-info {
      flex: 1;
      .task-title { font-size: 14px; color: #333; font-weight: 500; }
      .task-deadline { font-size: 12px; color: #999; margin-top: 4px; }
    }
    .task-assignee {
      font-size: 12px; color: #666;
      background: #f5f5f5;
      padding: 2px 10px;
      border-radius: 4px;
    }
  }
}
</style>