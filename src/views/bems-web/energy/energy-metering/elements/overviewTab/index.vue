<template>
  <div class="overview-tab">
    <div class="stat-cards">
      <StatCard
        label="计量表计总数"
        :value="statData.count"
        :change-text="statData.meterTotalChange"
        trend="up"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="表计在线率"
        :value="statData.onlineRate"
        :change-text="statData.meterOnlineStatus"
        trend=""
        color="green"
        :icon="CheckCircleOutlined"
      />
      <StatCard
        label="今日用电量"
        :value="statData.electricCount"
        :change-text="statData.todayPowerChange"
        trend="down"
        color="orange"
        :icon="PlugIcon"
      />
      <StatCard
        label="今日用水量"
        :value="statData.waterCount"
        :change-text="statData.todayWaterChange"
        trend="down"
        color="purple"
        :icon="WaterDropIcon"
      />
    </div>

    <!-- 分析模块：各场馆用电对比 / 用能结构分析 -->
    <div class="analysis-cards">
      <!-- 各场馆用电对比 -->
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">📊</span>
            <span>各场馆用电对比</span>
          </div>
          <span class="analysis-card__tag">本月</span>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">各场馆用电量柱状对比图</div>
          </div>
        </div>
      </a-card>

      <!-- 用能结构分析 -->
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">🥧</span>
            <span>用能结构分析</span>
          </div>
          <span class="analysis-card__tag analysis-card__tag--realtime">实时</span>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">🍩</span>
            <div class="chart-placeholder__text">用能类型占比饼图</div>
            <div class="chart-placeholder__legend">
              空调 45% | 照明 25% | 动力 18% | 其他 12%
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 计量表计数据 -->
    <a-card class="meter-data-card" :bordered="false">
      <div class="meter-data-card__header">
        <div class="meter-data-card__title">
          <span class="meter-data-card__icon">📋</span>
          <span>计量表计数据</span>
        </div>
        <div class="meter-data-card__actions">
          <a-select
            v-model:value="meterType"
            placeholder="全部类型"
            class="meter-data-card__select"
            :options="typeOptions"
          />
          <a-select
            v-model:value="meterVenue"
            placeholder="全部场馆"
            class="meter-data-card__select"
            :options="venueOptions"
          />
          <a-button type="primary" @click="handleSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            🔍查询
          </a-button>
          <a-button>
            <template #icon>
              <ExportOutlined />
            </template>
            📥导出报表
          </a-button>
        </div>
      </div>
      <a-table
        :columns="meterColumns"
        :data-source="meterData"
        :pagination="pagination"
        size="middle"
        class="meter-data-card__table"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'runState'">
            <span
              class="status-tag"
              :class="{
                'status-tag--normal':  record.runState === '在线',
                'status-tag--offline': record.runState === '离线'
              }"
            >
              {{ record.runState }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small">详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue'
import { getEnergyMeteringStatistics, getMeasuringListWithMouth } from './index.api'
import { getVenueInfoList, getCategoryTreeData, spaceTree } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api'

// 自定义 emoji 图标组件（插头和水滴）
const PlugIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  count: '245',
  meterTotalChange: '56 新增',
  onlineRate: '100%',
  meterOnlineStatus: '全部正常',
  electricCount: '42,156',
  todayPowerChange: '6.8% kWh',
  waterCount: '856',
  todayWaterChange: '3.2% m³',
})

// 计量表计数据筛选
const meterType = ref<string | undefined>(undefined)
const meterVenue = ref<string | undefined>(undefined)

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'electric', label: '电表' },
  { value: 'water', label: '水表' },
  { value: 'gas', label: '气表' },
]

const venueOptions = ref([{ value: '', label: '全部场馆' }])

// 获取场馆列表
const fetchVenueList = async () => {
  try {
    const res = await getVenueInfoList({})
    const list = Array.isArray(res) ? res : (res.records || res.data || [])
    const map: Record<string, string> = {}
    venueOptions.value = [
      { value: '', label: '全部场馆' },
      ...list.map((item: any) => {
        const name = item.venueName || item.name || item.id
        map[item.id] = name
        return { value: item.id, label: name }
      }),
    ]
    venueMap.value = map
  } catch (e) {
    console.error('获取场馆列表失败:', e)
  }
}

const meterColumns = [
  { title: '表计编号', dataIndex: 'deviceCode', key: 'deviceCode' },
  {
    title: '表计类型',
    dataIndex: 'categoryId',
    key: 'categoryId',
    customRender: ({ text }: any) => {
      if (!text) return '-'
      return findTreeNodeTitle(categoryTreeData.value, text) || text
    }
  },
  {
    title: '安装位置',
    key: 'installLocation',
    customRender: ({ record }: any) => {
      const vId = record.venueId
      const sId = record.spaceId
      const venueName = vId ? (venueMap.value[vId] || vId) : '-'
      const spaceName = sId ? (findTreeNodeTitle(spaceTreeData.value, sId) || sId) : '-'
      return `${venueName} - ${spaceName}`
    }
  },
  { title: '今日读数', dataIndex: 'value', key: 'value' },
  { title: '今日用量', dataIndex: 'dayTotal', key: 'dayTotal' },
  { title: '本月累计', dataIndex: 'mouthTotal', key: 'mouthTotal' },
  { title: '状态', dataIndex: 'runState', key: 'runState' },
  { title: '操作', key: 'action' },
]

// 分类树数据（表计类型映射）
const categoryTreeData = ref<any[]>([])

// 空间树数据（安装位置映射）
const spaceTreeData = ref<any[]>([])

// 场馆名称映射 { venueId: venueName }
const venueMap = ref<Record<string, string>>({})

// 递归查找树节点，根据 key 返回对应 title
const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
  if (!treeData || !Array.isArray(treeData)) return ''
  const find = (nodes: any[]): string => {
    for (const node of nodes) {
      if (String(node.key) === String(key)) {
        return node.title || node.value || node.label
      }
      if (node.children && Array.isArray(node.children)) {
        const title = find(node.children)
        if (title) return title
      }
    }
    return ''
  }
  return find(treeData)
}

// 加载分类树数据
const loadCategoryTree = async () => {
  try {
    const res = await getCategoryTreeData()
    categoryTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载分类树数据失败:', e)
  }
}

// 加载空间树数据
const loadSpaceTree = async () => {
  try {
    const res = await spaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  pageSizeOptions: ['10', '20', '50', '100'],
})

const meterData = ref([])

// 构建查询参数
const buildMeterParams = (pageNo: number, pageSize: number) => {
  const params: any = { pageNo, pageSize }
  if (meterType.value) params.categoryId = meterType.value
  if (meterVenue.value) params.venueId = meterVenue.value
  return params
}

// 加载计量表计数据
const loadMeterData = async (pageNo = pagination.current, pageSize = pagination.pageSize) => {
  try {
    const params = buildMeterParams(pageNo, pageSize)
    const res = await getMeasuringListWithMouth(params)
    pagination.total = res.total ?? 0
    meterData.value = (res.records || res || []).map((item: any, idx: number) => ({
      key: item.deviceId ?? idx,
      deviceCode: item.deviceCode ?? '-',
      categoryId: item.categoryId ?? '-',
      venueId: item.venueId ?? '-',
      spaceId: item.spaceId ?? '-',
      value: item.value ?? '-',
      dayTotal: item.dayTotal ?? '-',
      mouthTotal: item.mouthTotal ?? '-',
      runState: item.runState ?? '-',
    }))
  } catch (e) {
    console.error('加载计量表计数据失败:', e)
  }
}

// 查询按钮
const handleSearch = () => {
  pagination.current = 1
  loadMeterData(1, pagination.pageSize)
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadMeterData(pag.current, pag.pageSize)
}

// 加载概览数据
const loadOverviewData = async () => {
  try {
    const res = await getEnergyMeteringStatistics()
    statData.count = res.count ?? statData.count
    statData.meterTotalChange = res.meterTotalChange ?? statData.meterTotalChange
    statData.onlineRate = res.onlineRate ?? statData.onlineRate
    statData.meterOnlineStatus = res.meterOnlineStatus ?? statData.meterOnlineStatus
    statData.electricCount = res.electricCount ?? statData.electricCount
    statData.todayPowerChange = res.todayPowerChange ?? statData.todayPowerChange
    statData.waterCount = res.waterCount ?? statData.waterCount
    statData.todayWaterChange = res.todayWaterChange ?? statData.todayWaterChange
  } catch (e) {
    console.error('加载能源计量概览数据失败:', e)
  }
}

onMounted(() => {
  loadOverviewData()
  loadMeterData()
  fetchVenueList()
  loadCategoryTree()
  loadSpaceTree()
})
</script>

<style scoped lang="less">
.overview-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .analysis-cards {
    display: flex;
    gap: 16px;
    margin-top: 20px;
  }

  .analysis-card {
    flex: 1;
    min-width: 300px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 16px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -16px 16px;
      padding: 0 16px 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__icon {
      font-size: 18px;
    }

    &__icon2 {
      font-size: 54px;
    }

    &__tag {
      display: inline-block;
      padding: 2px 10px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.65);
      background: #f5f5f5;
      border-radius: 4px;

      &--realtime {
        color: #1890ff;
        background: #e6f7ff;
      }
    }

    &__body {
      height: 240px;
      background: #f7f9fc;
      border-radius: 8px;
      overflow: hidden;
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;

      &__text {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
      }

      &__legend {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.35);
      }
    }
  }

  .meter-data-card {
    margin-top: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 16px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -16px 16px;
      padding: 0 16px 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__icon {
      font-size: 18px;
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__select {
      width: 140px;
    }

    &__table {
      :deep(.ant-table-thead > tr > th) {
        background: #fafafa;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 600;
      }

      :deep(.ant-table-tbody > tr > td) {
        color: rgba(0, 0, 0, 0.65);
      }
    }

    .status-tag {
      display: inline-block;
      padding: 4px 12px;
      font-size: 12px;
      border-radius: 12px;

      &--normal {
        color: #389e0d;
        background: #e6f7e6;
      }

      &--offline {
        color: #cf1322;
        background: #fff1f0;
      }
    }

    .ant-pagination {
      margin-top: 16px;
      padding: 8px 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;

      :deep(.ant-pagination-total-text) {
        margin-right: auto;
        color: rgba(0, 0, 0, 0.65);
      }

      :deep(.ant-pagination-options) {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      :deep(.ant-pagination-options-quick-jumper) {
        color: rgba(0, 0, 0, 0.65);

        input {
          width: 48px;
          margin: 0 8px;
        }
      }
    }
  }
}
</style>
