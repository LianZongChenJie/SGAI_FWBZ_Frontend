<template>
  <div class="equipment-management">
    <a-card :title="title" :bordered="false">
      <template #extra>
        <a-select
            v-model:value="filterVenue"
            placeholder="全部场馆"
            style="width: 140px; margin-right: 15px"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option
              v-for="item in venueOptions"
              :key="item.id"
              :value="item.venueName"
            >
              {{ item.venueName }}
            </a-select-option>
          </a-select>
        <a-select
            v-model:value="filterType"
            placeholder="全部类型"
            style="width: 150px; margin-right: 15px"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option
              v-for="item in categoryOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        <a-button type="primary" @click="handleAdd">
          新增设备
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
          <template v-if="column.key === 'device_type'">
            <a-tag>
              {{ record.device_type == 1 ? '仪表' : '设备' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'run_state'">
            <a-tag :color="record.run_state ? 'green' : 'red'">
              {{ record.run_state ? '在线' : '离线' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
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
import { ref, computed, onMounted } from 'vue'
import { getVenueOptions, getCategoryOptions} from './api'
import type { SelectOption, VenueOption, EquipmentItem } from './api'

// ===== 筛选条件 =====
const filterType = ref('')
const filterVenue = ref('')

// ===== 下拉选项数据 =====
const venueOptions = ref<VenueOption[]>([])
const categoryOptions = ref<SelectOption[]>([])

// ===== 初始化加载下拉数据 =====
const fetchVenueList = async () => {
  try {
    const res: any = await getVenueOptions()
    const list = res?.records || res?.data || res || []
    venueOptions.value = list.map((item: any) => ({
      id: item.id,
      venueName: item.venueName
    }))
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

const fetchCategoryList = async () => {
  try {
    const res: any = await getCategoryOptions()
    categoryOptions.value = res?.records || res || []
  } catch (error) {
    console.error('获取设备类型列表失败:', error)
  }
}

onMounted(() => {
  fetchVenueList()
  fetchCategoryList()
})

// ===== 类型定义 =====
// EquipmentItem 已从 ./api 导入

// ===== Props =====
const props = withDefaults(
  defineProps<{
    title?: string
    data?: EquipmentItem[]
    loading?: boolean
  }>(),
  {
    title: '⚙️ 设备信息管理',
    data: () => [],
    loading: false
  }
)

// ===== Emits =====
const emit = defineEmits<{
  add: []
  edit: [record: EquipmentItem]
  detail: [record: EquipmentItem]
  tableChange: [pagination: any]
  filterChange: [filters: { venue: string; type: string }]
}>()


// ===== 表格列定义 =====
const columns = [
  { title: '设备编号', dataIndex: 'device_code', key: 'device_code', width: 120 },
  { title: '设备名称', dataIndex: 'device_name', key: 'device_name', width: 120 },
  { title: '设备类别id', dataIndex: 'category_id', key: 'category_id', width: 180 },
  { title: '设备模型id', dataIndex: 'model_id', key: 'model_id', width: 180 },
  { title: '倍率', dataIndex: 'magnification', key: 'magnification', width: 100 },
  { title: '设备分类', dataIndex: 'device_type', key: 'device_type', width: 100 },
  { title: '运行状态', dataIndex: 'run_state', key: 'run_state', width: 100 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

// ===== 分页配置 =====
const currentPage = ref(1)
const pageSize = ref(10)

const pagination = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: props?.data?.length || 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
}))

// ===== 事件处理 =====
const handleAdd = () => {
  emit('add')
}

const handleEdit = (record: EquipmentItem) => {
  emit('edit', record)
}
const handleDetail = (record: EquipmentItem) => {
  emit('detail', record)
}

const handleTableChange = (paginationData: any) => {
  currentPage.value = paginationData.current
  pageSize.value = paginationData.pageSize
  emit('tableChange', paginationData)
}

const handleFilterChange = () => {
  currentPage.value = 1
  emit('filterChange', { venue: filterVenue.value, type: filterType.value })
}
</script>

<style scoped lang="less">
.equipment-management {
  :deep(.ant-card) {
    border-radius: 8px;
  }
}
</style>