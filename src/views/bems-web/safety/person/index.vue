<template>
  <div class="person-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        label="今日进场人数"
        :value="statData.todayEntry"
        change-text="↑ 12.5% 较昨日"
        trend="up"
        color="blue"
        :icon="UserOutlined"
      />
      <StatCard
        label="当前在场人数"
        :value="statData.currentPresent"
        change-text="↑ 5.3% 较昨日"
        trend="up"
        color="green"
        :icon="TeamOutlined"
      />
      <StatCard
        label="人员识别记录"
        :value="statData.recognitionRecords"
        change-text="↑ 8.7% 较昨日"
        trend="up"
        color="orange"
        :icon="CameraOutlined"
      />
      <StatCard
        label="异常行为预警"
        :value="statData.abnormalAlerts"
        change-text="↓ 2 较昨日"
        trend="down"
        color="purple"
        :icon="WarningOutlined"
      />
    </div>

    <!-- 两栏布局：热力图 + 客流趋势 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><HeatMapOutlined /> 人员分布热力图</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <div class="map-placeholder">
            <div class="map-icon"><HeatMapOutlined /></div>
            <div class="map-text">场馆人员分布热力图</div>
            <div class="map-sub">A馆 1,234人 | B馆 892人 | C馆 1,441人</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><BarChartOutlined /> 各场馆客流趋势</h3>
          <div class="btn-group">
            <a-button type="primary" size="small">今日</a-button>
            <a-button size="small">本周</a-button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各场馆分时客流柱状图</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 人员识别记录表格 -->
    <div class="card">
      <div class="card-header">
        <h3><UserOutlined /> 人员识别记录</h3>
        <div class="filter-bar">
          <a-input v-model:value="searchKeyword" placeholder="搜索姓名/工号" style="width: 180px" />
          <a-select v-model:value="personType" style="width: 130px" placeholder="全部类型">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="employee">员工</a-select-option>
            <a-select-option value="visitor">访客</a-select-option>
            <a-select-option value="vip">VIP</a-select-option>
          </a-select>
          <a-select v-model:value="venueFilter" style="width: 130px" placeholder="全部场馆">
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option value="A">A馆</a-select-option>
            <a-select-option value="B">B馆</a-select-option>
            <a-select-option value="C">C馆</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
          <a-button><DownloadOutlined /> 导出</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="recognitionColumns"
          :data-source="recognitionData"
          :pagination="{ pageSize: 10 }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'personType'">
              <span class="status-text" :class="record.personType === '员工' ? 'normal' : record.personType === '访客' ? 'info' : 'warning'">
                {{ record.personType }}
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 人员轨迹查询 -->
    <div class="card">
      <div class="card-header">
        <h3><SearchOutlined /> 人员轨迹查询</h3>
        <a-button type="primary">+ 新增查询</a-button>
      </div>
      <div class="card-body">
        <div class="two-col">
          <div>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">查询人员</span>
                <span class="info-value">张三 (EMP-1024)</span>
              </div>
              <div class="info-item">
                <span class="info-label">查询时间段</span>
                <span class="info-value">2026-06-09 08:00 - 14:00</span>
              </div>
              <div class="info-item">
                <span class="info-label">轨迹点位数</span>
                <span class="info-value">23 个</span>
              </div>
              <div class="info-item">
                <span class="info-label">覆盖场馆</span>
                <span class="info-value">A馆、B馆</span>
              </div>
              <div class="info-item">
                <span class="info-label">停留最久区域</span>
                <span class="info-value">A馆-F2-展厅 (2小时15分)</span>
              </div>
            </div>
          </div>
          <div class="map-placeholder" style="min-height: 250px;">
            <div class="map-icon"><NodeIndexOutlined /></div>
            <div class="map-text">人员轨迹路线图</div>
            <div class="map-sub">东门 → A馆F1 → A馆F2 → B馆F1 → 南门</div>
          </div>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  UserOutlined,
  TeamOutlined,
  CameraOutlined,
  WarningOutlined,
  HeatMapOutlined,
  BarChartOutlined,
  SearchOutlined,
  DownloadOutlined,
  NodeIndexOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'PersonManagementPage' })

// ===== 统计数据 =====
const statData = {
  todayEntry: '8,234',
  currentPresent: '3,567',
  recognitionRecords: '45,892',
  abnormalAlerts: 3,
}

// ===== 筛选条件 =====
const searchKeyword = ref('')
const personType = ref('')
const venueFilter = ref('')

// ===== 人员识别记录表格列 =====
const recognitionColumns = [
  { title: '识别时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '人员类型', dataIndex: 'personType', key: 'personType', width: 100 },
  { title: '姓名/ID', dataIndex: 'nameId', key: 'nameId', width: 160 },
  { title: '识别位置', dataIndex: 'location', key: 'location', width: 180 },
  { title: '置信度', dataIndex: 'confidence', key: 'confidence', width: 90 },
  { title: '进出方向', dataIndex: 'direction', key: 'direction', width: 100 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' },
]

// ===== 人员识别记录数据 =====
const recognitionData = [
  { id: 1, time: '2026-06-09 13:45:22', personType: '员工', nameId: '张三 / EMP-1024', location: 'A馆-东门-闸机01', confidence: '98.5%', direction: '进场' },
  { id: 2, time: '2026-06-09 13:44:18', personType: '访客', nameId: '李四 / VIS-5089', location: 'B馆-南门-闸机03', confidence: '96.2%', direction: '进场' },
  { id: 3, time: '2026-06-09 13:43:05', personType: 'VIP', nameId: '王五 / VIP-0102', location: 'A馆-VIP通道', confidence: '99.1%', direction: '进场' },
  { id: 4, time: '2026-06-09 13:42:33', personType: '员工', nameId: '赵六 / EMP-2056', location: 'C馆-西门-闸机02', confidence: '97.8%', direction: '出场' },
  { id: 5, time: '2026-06-09 13:41:50', personType: '访客', nameId: '钱七 / VIS-5090', location: 'A馆-东门-闸机01', confidence: '95.4%', direction: '进场' },
  { id: 6, time: '2026-06-09 13:40:12', personType: '员工', nameId: '孙八 / EMP-3089', location: 'B馆-北门-闸机02', confidence: '98.1%', direction: '进场' },
  { id: 7, time: '2026-06-09 13:38:45', personType: '访客', nameId: '周九 / VIS-5091', location: 'A馆-东门-闸机01', confidence: '94.7%', direction: '出场' },
  { id: 8, time: '2026-06-09 13:36:30', personType: '员工', nameId: '吴十 / EMP-4023', location: 'C馆-西门-闸机01', confidence: '99.2%', direction: '进场' },
]
</script>

<style scoped lang="less">
.person-page {
  padding: 0;
}

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
    .tag-blue { background: #bee3f8; color: #2a4365; }

    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .btn-group {
      display: flex;
      gap: 8px;
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
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
  &.info { background: #bee3f8; color: #2a4365; }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .info-label {
      font-size: 13px;
      color: #718096;
    }

    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #2d3748;
    }
  }
}

</style>