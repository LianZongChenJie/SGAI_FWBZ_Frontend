<template>
  <div class="iot-page">
    <div class="stats-row">
      <StatCard
        v-for="(card, index) in statCards"
        :key="index"
        :label="card.title || '--'"
        :value="card.value ?? '--'"
        :change-text="card.context || ''"
        :color="statCardConfigs[index]?.color || 'blue'"
        :icon="statCardConfigs[index]?.icon"
      />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><RadarChartOutlined /> 数据采集状态</h3>
      </div>
      <div class="card-body">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>
            <template v-if="column.key === 'todayCollection'">
              {{ record.todayCollection != null ? record.todayCollection + ' KB' : '-' }}
            </template>
            <template v-if="column.key === 'dataCompleteRate'">
              {{ record.dataCompleteRate != null ? record.dataCompleteRate + '%' : '-' }}
            </template>
            <template v-if="column.key === 'state'">
              <span class="status-text" :class="getStateClass(record.state)">{{ getStateText(record.state) }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  RadarChartOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons-vue'
import { getSummary, getDataCollectionList } from './index.api'
import type { StatCardVO, InterfaceListVO } from './index.api'

defineOptions({ name: 'IotDataCollectionPage' })

// ===== 统计卡片配置（图标/颜色固定，数据来自后端） =====
const statCardConfigs = [
  { color: 'blue' as const, icon: RadarChartOutlined },
  { color: 'green' as const, icon: DownloadOutlined },
  { color: 'orange' as const, icon: CheckCircleOutlined },
  { color: 'purple' as const, icon: DatabaseOutlined },
]
const statCards = ref<StatCardVO[]>([])

const fetchSummary = async () => {
  try {
    const res = await getSummary()
    statCards.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取卡片汇总失败:', error)
  }
}

// ===== 状态映射：1=正常 0=中断 2=延迟 =====
const getStateText = (state?: number) => {
  switch (state) {
    case 1:
      return '正常'
    case 0:
      return '中断'
    case 2:
      return '延迟'
    default:
      return '--'
  }
}

const getStateClass = (state?: number) => {
  switch (state) {
    case 1:
      return 'normal'
    case 0:
      return 'danger'
    case 2:
      return 'warning'
    default:
      return ''
  }
}

// ===== 列表数据 =====
const loading = ref(false)
const tableData = ref<InterfaceListVO[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getDataCollectionList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    })
    // 兼容分页对象和数组两种返回格式
    if (Array.isArray(res)) {
      tableData.value = res
      pagination.total = res.length
    } else {
      tableData.value = res?.records || []
      pagination.total = res?.total || 0
    }
  } catch (error) {
    console.error('获取数据采集状态列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchList()
}

// ===== 列定义 =====
const columns = [
  { title: '序号', key: 'index', width: 70 },
  { title: '系统名称', dataIndex: 'sysName', key: 'sysName' },
  { title: '采集点位', dataIndex: 'collectionPointLocation', key: 'collectionPointLocation', width: 100 },
  { title: '采集频率', dataIndex: 'cycle', key: 'cycle', width: 100 },
  { title: '今日采集量', key: 'todayCollection', width: 120 },
  { title: '数据完整率', key: 'dataCompleteRate', width: 110 },
  { title: '最后采集时间', dataIndex: 'lastCollectionTime', key: 'lastCollectionTime', width: 180 },
  { title: '状态', key: 'state', width: 80 },
]

onMounted(() => {
  fetchSummary()
  fetchList()
})
</script>

<style scoped lang="less">
.iot-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 20px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header {
    padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    h3 { font-size: 16px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
  }
  .card-body { padding: 22px; }
}
.status-text { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;
  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
}
</style>
