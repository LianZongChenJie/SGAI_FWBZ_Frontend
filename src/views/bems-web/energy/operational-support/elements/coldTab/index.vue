<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="冷源机组总数"
        :value="statsData.count"
        color="blue"
        :icon="ColdSourceTotalIcon"
      />
      <StatCard
        label="运行中"
        :value="statsData.online"
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="今日制冷量"
        :value="statsData.coolingCapacity"
        color="orange"
        :icon="TodayCoolingIcon"
      />
      <StatCard
        label="平均COP"
        :value="statsData.avgCop"
        color="purple"
        :icon="AvgCopIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>❄️冷源系统实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
            <a-select v-model:value="filterCategoryId" placeholder="全部机组类型" style="width: 160px" allow-clear @change="handleSearch">
              <a-select-option v-for="item in unitTypeList" :key="item.id" :value="item.id">
                {{ item.categoryName }}
              </a-select-option>
            </a-select>
            <a-select v-model:value="filterStatus" placeholder="全部状态" style="width: 140px" allow-clear @change="handleSearch">
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">停用</a-select-option>
            </a-select>
            <a-input
              v-model:value="filterDeviceCode"
              placeholder="搜索设备名称"
              style="width: 200px"
              allow-clear
              @search="handleSearch"
            />
            <a-button type="primary" @click="handleSearch">🔍 查询</a-button>
            <a-button @click="handleExport">📥 导出</a-button>
          </div>
          <button class="collapse-btn" @click="collapsedTable = !collapsedTable">
            <CaretDownOutlined v-if="!collapsedTable" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div class="card-body" v-show="!collapsedTable">
        <a-table
          :dataSource="tableData"
          :columns="columns"
          :pagination="pagination"
          :scroll="{ x: 1100 }"
          :loading="tableLoading"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag v-if="record.status === 1" color="green">启用</a-tag>
              <a-tag v-else color="red">停用</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleDetail(record)">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="collapse-row">
      <div class="collapse-row__header">
        <h3>📊 图表区域</h3>
        <button class="collapse-btn" @click="collapsedCharts = !collapsedCharts">
          <CaretDownOutlined v-if="!collapsedCharts" />
          <CaretUpOutlined v-else />
        </button>
      </div>
      <div class="two-col" v-show="!collapsedCharts">
        <a-card class="analysis-card" :bordered="false">
          <div class="analysis-card__header">
            <div class="analysis-card__title">
              <span class="analysis-card__icon">�</span>
              <span>冷源系统能效趋势(COP)</span>
            </div>
            <span class="card-note">逐时 COP · 停机无数据 · 轴范围 2~10</span>
          </div>
          <div class="analysis-card__body">
            <div v-if="hasCopData" ref="copChartRef" class="venue-chart"></div>
            <div v-else class="chart-placeholder">
              <span class="analysis-card__icon2">📊</span>
              <div class="chart-placeholder__text">暂无数据</div>
            </div>
          </div>
        </a-card>
        <a-card class="analysis-card" :bordered="false">
          <div class="analysis-card__header">
            <div class="analysis-card__title">
              <span class="analysis-card__icon">📊</span>
              <span>制冷量</span>
            </div>
            <span class="card-note">逐时制冷量 kW · 额定 4400/2500 kW</span>
          </div>
          <div class="analysis-card__body">
            <div v-if="hasCapacityData" ref="capacityChartRef" class="venue-chart"></div>
            <div v-else class="chart-placeholder">
              <span class="analysis-card__icon2">📊</span>
              <div class="chart-placeholder__text">暂无数据</div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>

  <!-- 详情弹窗 -->
  <a-modal v-model:visible="detailVisible" title="详情" width="800px" :footer="null" :confirm-loading="detailLoading">
    <a-spin :spinning="detailLoading">
      <a-descriptions bordered :column="2" size="small" v-if="detailData">
        <a-descriptions-item label="设备编号">{{ detailData.deviceCode ?? '--' }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ detailData.deviceName ?? '--' }}</a-descriptions-item>
        <a-descriptions-item label="设备类别">{{ detailData.categoryName ?? '--' }}</a-descriptions-item>
        <a-descriptions-item label="所属系统">{{ detailData.systemCode ?? '--' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="detailData.status === 1" color="green">启用</a-tag>
          <a-tag v-else color="red">停用</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ detailData.remark ?? '--' }}</a-descriptions-item>
        <template v-for="attr in detailAttributes" :key="attr.attrCode">
          <a-descriptions-item :label="attr.attrName">{{ attr.value ?? '--' }}<span v-if="attr.unit">{{ attr.unit }}</span></a-descriptions-item>
        </template>
      </a-descriptions>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, nextTick } from 'vue'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { useECharts } from '/@/hooks/web/useECharts'
import { getColdCopData, getColdCapacityData } from '../chartData'
import { buildTrendOption } from '../chartOptions'
import { getColdUnitList, getColdUnitDetail, getUnitTypeList, exportColdUnitList } from './index.api'
import type { ColdSourceEquipmentCategory, ColdSourceDevicePageDto, ColdSourceDeviceDetailDto } from './index.api'

// 自定义 emoji 图标组件
const ColdSourceTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '�️')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const TodayCoolingIcon = () => h('span', { style: 'font-size: 20px;' }, '�')
const AvgCopIcon = () => h('span', { style: 'font-size: 20px;' }, '📈')

defineOptions({ name: 'ColdTab' })

// 折叠状态
const collapsedTable = ref(false)
const collapsedCharts = ref(false)

// 统计数据
const statsData = reactive({
  count: '--',
  online: '--',
  coolingCapacity: '--',
  avgCop: '--',
})

// 机组类型下拉
const unitTypeList = ref<ColdSourceEquipmentCategory[]>([])

// 筛选条件
const filterCategoryId = ref<number | undefined>(undefined)
const filterStatus = ref<number | undefined>(undefined)
const filterDeviceCode = ref('')

// 表格
const tableLoading = ref(false)
const tableData = ref<ColdSourceDevicePageDto[]>([])

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 70,
    customRender: ({ index }: { index: number }) =>
      (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  { title: '设备编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 120 },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 150 },
  { title: '设备类别', dataIndex: 'categoryName', key: 'categoryName', width: 120 },
  { title: '所属系统', dataIndex: 'systemCode', key: 'systemCode', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 150 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  pageSizeOptions: ['10', '20', '50'],
})

/**
 * 加载机组类型下拉
 */
const loadUnitTypeList = async () => {
  try {
    const res = await getUnitTypeList()
    unitTypeList.value = Array.isArray(res) ? res : []
  } catch (e) {
    console.error('加载机组类型失败:', e)
  }
}

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  try {
    // 获取全部数据用于统计
    const res = await getColdUnitList({ pageNo: 1, pageSize: 1 })
    const total = res?.total ?? 0
    statsData.count = total > 0 ? String(total) : '--'

    // 统计启用数量
    const enableRes = await getColdUnitList({ pageNo: 1, pageSize: 1, status: 1 })
    const onlineCount = enableRes?.total ?? 0
    statsData.online = onlineCount > 0 ? String(onlineCount) : '--'

    // 制冷量和COP暂时使用占位数据，如需要可补充接口
    statsData.coolingCapacity = '--'
    statsData.avgCop = '--'
  } catch (e) {
    console.error('获取统计数据失败:', e)
  }
}

/**
 * 加载表格数据
 */
const loadTableData = async () => {
  tableLoading.value = true
  try {
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }
    if (filterCategoryId.value) params.categoryId = filterCategoryId.value
    if (filterStatus.value !== undefined) params.status = filterStatus.value
    if (filterDeviceCode.value) {
      params.deviceName = filterDeviceCode.value
    }

    const res = await getColdUnitList(params)
    tableData.value = res?.records ?? []
    pagination.total = res?.total ?? 0
  } catch (e) {
    console.error('加载设备列表失败:', e)
    tableData.value = []
    pagination.total = 0
  } finally {
    tableLoading.value = false
  }
}

/**
 * 查询
 */
const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}

/**
 * 导出
 */
const handleExport = async () => {
  const params: any = {}
  if (filterCategoryId.value) params.categoryId = filterCategoryId.value
  if (filterStatus.value !== undefined) params.status = filterStatus.value
  if (filterDeviceCode.value) params.deviceName = filterDeviceCode.value

  try {
    const res = await exportColdUnitList(params)
    const blobOptions = { type: 'application/vnd.ms-excel' }
    const fileSuffix = '.xlsx'
    const url = window.URL.createObjectURL(new Blob([res], blobOptions))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '冷源设备列表' + fileSuffix)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('导出失败:', e)
  }
}

/**
 * 表格分页变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadTableData()
}

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<ColdSourceDeviceDetailDto | null>(null)
const detailAttributes = ref<any[]>([])

// 属性表格列

/**
 * 查看详情
 */
const handleDetail = async (record: ColdSourceDevicePageDto) => {
  detailData.value = null
  detailAttributes.value = []
  detailVisible.value = true
  detailLoading.value = true

  try {
    if (record.id) {
      const res = await getColdUnitDetail({ deviceId: record.id })
      detailData.value = res ?? null
      detailAttributes.value = res?.attributes ?? []
    }
  } catch (e) {
    console.error('获取设备详情失败:', e)
  } finally {
    detailLoading.value = false
  }
}

// 冷源系统能效趋势(COP)图表
const copChartRef = ref<HTMLDivElement>()
const hasCopData = ref(false)
const { setOptions: setCopChartOptions } = useECharts(copChartRef as any)

// 制冷量图表
const capacityChartRef = ref<HTMLDivElement>()
const hasCapacityData = ref(false)
const { setOptions: setCapacityChartOptions } = useECharts(capacityChartRef as any)

/** 加载图表数据 */
const loadCharts = async () => {
  await nextTick()
  // COP 趋势
  const copData = getColdCopData()
  const copSeries = (copData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!copData.xaxis.length || !copSeries.length) {
    hasCopData.value = false
  } else {
    hasCopData.value = true
    await nextTick()
    setCopChartOptions(buildTrendOption(copData.xaxis, copSeries, 'COP', false, undefined, 2, 10))
  }

  // 制冷量
  const capData = getColdCapacityData()
  const capSeries = (capData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!capData.xaxis.length || !capSeries.length) {
    hasCapacityData.value = false
  } else {
    hasCapacityData.value = true
    await nextTick()
    setCapacityChartOptions(buildTrendOption(capData.xaxis, capSeries, 'kW'))
  }
}

onMounted(() => {
  loadUnitTypeList()
  loadStatistics()
  loadTableData()
  loadCharts()
})
</script>

<style scoped lang="less">
.tab-page {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -24px 16px;
      padding: 0 24px 12px;
      border-bottom: 1px solid #f0f0f0;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .filter-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-left: auto;
      }
    }

    .card-body {
      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        background: #fafbfc;
        border: 1px dashed #e5e6e8;
        border-radius: 8px;
        padding: 24px;

        .chart-icon {
          font-size: 40px;
          color: #1677ff;
          margin-bottom: 12px;
        }

        .chart-text {
          font-size: 16px;
          color: #86909c;
        }
      }
    }
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

    .card-note {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      text-align: right;
    }

    &__body {
      height: 320px;
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
        font-size: 16px;
        color: rgba(0, 0, 0, 0.45);
      }
    }

    .venue-chart {
      width: 100%;
      height: 100%;
    }
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .collapse-row {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -24px 16px;
      padding: 0 24px 12px;
      border-bottom: 1px solid #f0f0f0;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>
