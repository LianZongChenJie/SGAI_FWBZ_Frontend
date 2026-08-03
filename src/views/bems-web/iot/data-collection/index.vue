<template>
  <div class="iot-page">
    <div class="stats-row">
      <StatCard label="采集点位数" :value="statData.pointCount" change-text="↑ 2,345 新增" trend="up" color="blue" :icon="RadarChartOutlined" />
      <StatCard label="今日采集量" :value="statData.todayData" change-text="↑ 18% 条" trend="up" color="green" :icon="DownloadOutlined" />
      <StatCard label="数据完整率" :value="statData.completeness" change-text="↑ 0.3% 较昨日" trend="up" color="orange" :icon="CheckCircleOutlined" />
      <StatCard label="存储容量" :value="statData.storage" change-text="↑ 156GB 本月" trend="up" color="purple" :icon="DatabaseOutlined" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><RadarChartOutlined /> 数据采集状态</h3>
        <div class="filter-bar">
          <a-select v-model:value="systemFilter" style="width: 140px" placeholder="全部系统">
            <a-select-option value="">全部系统</a-select-option>
            <a-select-option value="安防">安防系统</a-select-option>
            <a-select-option value="消防">消防系统</a-select-option>
            <a-select-option value="楼控">楼控系统</a-select-option>
            <a-select-option value="照明">照明系统</a-select-option>
            <a-select-option value="能源">能源计量</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 10 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === '正常' ? 'normal' : record.status === '延迟' ? 'warning' : 'danger'">{{ record.status }}</span>
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
  RadarChartOutlined, DownloadOutlined, CheckCircleOutlined, DatabaseOutlined,
  SearchOutlined, InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'IotDataCollectionPage' })

const statData = { pointCount: '12,456', todayData: '5.6M', completeness: '99.8%', storage: '2.3TB' }
const systemFilter = ref('')

const columns = [
  { title: '系统名称', dataIndex: 'systemName', key: 'systemName' },
  { title: '采集点位', dataIndex: 'points', key: 'points', width: 100 },
  { title: '采集频率', dataIndex: 'frequency', key: 'frequency', width: 100 },
  { title: '今日采集量', dataIndex: 'todayData', key: 'todayData', width: 120 },
  { title: '数据完整率', dataIndex: 'completeness', key: 'completeness', width: 110 },
  { title: '最后采集时间', dataIndex: 'lastTime', key: 'lastTime', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
]

const tableData = [
  { id: 1, systemName: '安防监控系统', points: 356, frequency: '实时', todayData: '856,234', completeness: '99.9%', lastTime: '2026-06-09 13:45:22', status: '正常' },
  { id: 2, systemName: '消防报警系统', points: 892, frequency: '实时', todayData: '234,567', completeness: '99.8%', lastTime: '2026-06-09 13:45:20', status: '正常' },
  { id: 3, systemName: '楼控系统', points: '2,456', frequency: '5秒', todayData: '1,234,567', completeness: '99.7%', lastTime: '2026-06-09 13:45:18', status: '正常' },
  { id: 4, systemName: '照明系统', points: '2,340', frequency: '30秒', todayData: '456,789', completeness: '99.5%', lastTime: '2026-06-09 13:45:15', status: '延迟' },
  { id: 5, systemName: '能源计量系统', points: 245, frequency: '1分钟', todayData: '345,678', completeness: '100%', lastTime: '2026-06-09 13:45:00', status: '正常' },
  { id: 6, systemName: '停车管理系统', points: 48, frequency: '实时', todayData: '0', completeness: '0%', lastTime: '-', status: '中断' },
]
</script>

<style scoped lang="less">
.iot-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header {
    padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    h3 { font-size: 16px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
    .filter-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  }
  .card-body { padding: 22px; }
}
.status-text { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;
  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
}
</style>