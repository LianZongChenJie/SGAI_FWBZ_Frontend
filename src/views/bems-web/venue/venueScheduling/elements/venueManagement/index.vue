<template>
  <div class="venue-management">
    <a-card :title="title" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          + 新增场馆
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'buildable'">
            <a-tag :color="record.buildable === 1 ? 'green' : 'red'">
              {{ record.buildable === 1 ? '是' : '否' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleDetail(record)">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VenueItem } from './index.api'

// ===== Props =====
const props = withDefaults(
  defineProps<{
    title?: string
    data?: VenueItem[]
    loading?: boolean
  }>(),
  {
    title: '🏢 场馆信息管理',
    data: () => [],
    loading: false
  }
)

// ===== Emits =====
const emit = defineEmits<{
  add: []
  detail: [record: VenueItem]
  tableChange: [pagination: any]
}>()


// ===== 表格列定义 =====
const columns = [
  { title: '场馆名称', dataIndex: 'venueName', key: 'venueName', width: 100 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 120 },
  { title: '朝向', dataIndex: 'orientation', key: 'orientation', width: 100 },
  { title: '建筑面积', dataIndex: 'area', key: 'area', width: 120 },
  { title: '层高', dataIndex: 'ceilingH', key: 'ceilingH', width: 120 },
  { title: '采光条件', dataIndex: 'lighting', key: 'lighting', width: 180 },
  { title: '基础条件', dataIndex: 'basicFacility', key: 'basicFacility', width: 180 },
  { title: '可施工', key: 'buildable', width: 80 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' }
]

// ===== 分页配置 =====
const pagination = computed(() => ({
  current: 1,
  pageSize: 10,
  total: props?.data?.length || 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
}))

// ===== 事件处理 =====
const handleAdd = () => {
  emit('add')
}

const handleDetail = (record: VenueItem) => {
  emit('detail', record)
}

const handleTableChange = (paginationData: any) => {
  pagination.value.current = paginationData.current
  pagination.value.pageSize = paginationData.pageSize
  emit('tableChange', paginationData)
}
</script>