<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="配电柜总数"
        :value="statsData.count"
        color="blue"
        :icon="PowerCabinetTotalIcon"
      />
      <StatCard
        label="正常运行"
        :value="statsData.online"
        color="green"
        :icon="NormalRunningIcon"
      />
      <StatCard
        label="今日用电量"
        :value="statsData.energyConsumption"
        unit="kWh"
        color="orange"
        :icon="TodayPowerIcon"
      />
      <StatCard
        label="功率因数"
        :value="statsData.avgPowerFactor"
        color="purple"
        :icon="PowerFactorIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>⚡配电系统实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
          <a-tree-select
            v-model:value="meterSpace"
            :tree-data="spaceTreeData"
            :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
            placeholder="设备位置"
            allow-clear
            tree-default-expand-all
            style="width: 200px"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            @change="handleSearch"
          />
          <!-- <a-select v-model:value="filterStatus" placeholder="全部状态" style="width: 140px" allow-clear @change="handleSearch">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select> -->
          <a-button type="primary" @click="handleSearch">🔍 查询</a-button>
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
          :scroll="{ x: 1250 }"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'spaceId'">
              {{ findTreeNodePath(spaceTreeData, record.spaceId) || record.spaceId }}
            </template>
            <template v-if="column.key === 'runState'">
              <a-tag v-if="record.runState === '在线'" color="green">在线</a-tag>
              <a-tag v-else color="red">离线</a-tag>
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
            <span class="analysis-card__icon">📈</span>
            <span>有功功率</span>
          </div>
        </div>
        <div class="analysis-card__body">
          <div v-show="activeLoading" class="chart-placeholder">
            <a-spin />
            <div class="chart-placeholder__text">加载中...</div>
          </div>
          <div
            v-show="!activeLoading && activeChartData.length === 0"
            class="chart-placeholder"
          >
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
          <div
            v-show="!activeLoading && activeChartData.length > 0"
            ref="activeChartRef"
            class="venue-chart"
          ></div>
        </div>
      </a-card>
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">🌡️</span>
            <span>柜内温度分布</span>
          </div>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">配电柜温度热力分布</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 配电系统 -->
    <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 配电系统</h3>
        <div class="header-right">
          <a-tag color="orange">实时</a-tag>
          <button class="collapse-btn" @click="collapsedProcess = !collapsedProcess">
<CaretDownOutlined v-if="!collapsedProcess" />
          <CaretUpOutlined v-else />
          </button>
          <button class="collapse-btn" @click="toggleProcessFullscreen">
            <FullscreenOutlined v-if="!processFullscreen" />
            <FullscreenExitOutlined v-else />
          </button>
        </div>
      </div>
      <div class="card-body" v-show="!collapsedProcess">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon">🏭</div>
          <div class="chart-text">配电系统单线拓扑监控图</div>
          <div style="font-size: 12px; color: #a0aec0; margin-top: 8px">
            市电进线 → 变压器 → 低压配电柜 → 各楼层分配电箱 → 末端设备 | 实时电压/电流/负载率叠加显示
          </div>
        </div>
      </div>
    </div>
    </div>
    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="详情" width="800px" :footer="null" :confirm-loading="detailLoading">
      <a-spin :spinning="detailLoading">
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="配电柜编号">{{ detailRecord?.deviceCode ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="位置">{{ findTreeNodePath(spaceTreeData, detailRecord?.spaceId) || detailRecord?.spaceId || '--' }}</a-descriptions-item>
          <a-descriptions-item label="运行状态">
            <a-tag v-if="detailRecord?.runState === '在线'" color="green">在线</a-tag>
            <a-tag v-else color="red">离线</a-tag>
          </a-descriptions-item>
          <template v-for="attr in detailAttributes" :key="attr.label">
            <a-descriptions-item :label="attr.label">{{ attr.value ?? '--' }}</a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted, nextTick } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { spaceTree } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api'
import { getPowerUnitList, getActivePower, getPowerStatistics, getDeviceAttrList } from './index.api'
import { useECharts } from '/@/hooks/web/useECharts'

// 自定义 emoji 图标组件
const PowerCabinetTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const NormalRunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const TodayPowerIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const PowerFactorIcon = () => h('span', { style: 'font-size: 20px;' }, '📐')

defineOptions({ name: 'PowerTab' })

// 折叠状态
const collapsedTable = ref(false)
const collapsedCharts = ref(false)
const collapsedProcess = ref(false)

// 工艺图全屏
const processFullscreen = ref(false)
const toggleProcessFullscreen = () => {
  processFullscreen.value = !processFullscreen.value
}

defineProps<{
  data?: any
}>()

// 设备位置树数据
const meterSpace = ref<string | undefined>(undefined)
const spaceTreeData = ref([])
const loadSpaceTree = async () => {
  try {
    const res = await spaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

// 筛选条件
const filterStatus = ref<string | undefined>(undefined)

// 统计卡片数据
const statsData = reactive({
  count: "--",
  online: "--",
  energyConsumption: "--",
  avgPowerFactor: "--",
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getPowerStatistics()
    const data = res?.data || res?.result || res || {}
    statsData.count = data.count ?? 0
    statsData.online = data.online ?? 0
    statsData.energyConsumption = data.energyConsumption ?? 0
    statsData.avgPowerFactor = data.avgPowerFactor ?? 0
  } catch (e) {
    console.error('加载配电统计数据失败:', e)
  }
}

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  pageSizeOptions: ['10', '20', '50', '100'],
})

// 递归查找树节点完整路径
const findTreeNodePath = (treeData: any[], key: string | number, separator = '-'): string => {
  if (!treeData || !Array.isArray(treeData)) return ''
  const findPath = (nodes: any[], path: string[]): string[] | null => {
    for (const node of nodes) {
      const label = node.title || node.value || node.label || ''
      const currentPath = [...path, label]
      if (String(node.key) === String(key)) {
        return currentPath
      }
      if (node.children && Array.isArray(node.children)) {
        const result = findPath(node.children, currentPath)
        if (result) return result
      }
    }
    return null
  }
  const result = findPath(treeData, [])
  return result ? result.join(separator) : ''
}

// 动态属性列
const attributeColumns = ref<any[]>([])

// 表格列定义（固定3列 + 动态列 + 操作列）
const columns = computed(() => [
  { title: '配电柜编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 110 },
  { title: '配电柜名称', dataIndex: 'deviceName', key: 'deviceName', width: 130 },
  { title: '位置', dataIndex: 'spaceId', key: 'spaceId', width: 150 },
  { title: '运行状态', dataIndex: 'runState', key: 'runState', width: 100 },
  ...attributeColumns.value.map((attr: any) => ({
    title: attr.attributeName,
    dataIndex: attr.attributeName,
    key: attr.attributeName,
    width: 120,
  })),
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
])

// 表格数据
const tableData = ref<any[]>([])

// 加载配电系统列表
const loadPowerUnitList = async (pageNo = pagination.current, pageSize = pagination.pageSize, spaceId?: string, runState?: string) => {
  try {
    const params: any = { pageNo, pageSize }
    if (spaceId) params.spaceId = spaceId
    if (runState) params.runState = runState
    const res = await getPowerUnitList(params)
    pagination.total = res?.total ?? 0
    const list = res?.records || res?.data || res || []

    if (list.length > 0) {
      attributeColumns.value = list[0].deviceAttributeList || []
    }

    tableData.value = list.map((item: any) => {
      const attrs: Record<string, any> = {}
      if (item.deviceAttributeList) {
        item.deviceAttributeList.forEach((attr: any) => {
          attrs[attr.attributeName] = attr.value ?? '--'
        })
      }
      return {
        deviceId: item.deviceId,
        deviceCode: item.deviceCode ?? '--',
        deviceName: item.deviceName ?? '--',
        spaceId: item.spaceId ?? '--',
        runState: item.runState ?? '--',
        ...attrs,
      }
    })
  } catch (e) {
    console.error('加载配电系统列表失败:', e)
  }
}

// 查询按钮
const handleSearch = () => {
  pagination.current = 1
  loadPowerUnitList(1, pagination.pageSize, meterSpace.value, filterStatus.value)
}

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailRecord = ref<any>(null)
const detailAttributes = ref<any[]>([])
const handleDetail = async (record: any) => {
  detailRecord.value = record
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await getDeviceAttrList({ deviceId: record.deviceId })
    detailAttributes.value = res?.records || res?.data || res || []
  } catch (e) {
    console.error('查询设备属性失败:', e)
    detailAttributes.value = []
  } finally {
    detailLoading.value = false
  }
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadPowerUnitList(pag.current, pag.pageSize, meterSpace.value, filterStatus.value)
}

// 有功功率柱状图
const activeChartRef = ref<HTMLDivElement>()
const activeChartData = ref<any[]>([])
const activeLoading = ref(false)
const { setOptions: setActiveChartOptions } = useECharts(activeChartRef as any)

/** 加载有功功率数据 */
const loadActiveChart = async () => {
  activeLoading.value = true
  try {
    const res = await getActivePower()
    const chatData = res?.chat || res?.result?.chat || res?.data?.chat || {}
    const xaxis = chatData.xaxis || []
    const seriesList = (chatData.chatSeriesList || chatData.seriesList || []) as any[]
    const filteredList = seriesList.filter((item: any) => item.name !== '合计')
    activeChartData.value = filteredList
    activeLoading.value = false
    await nextTick()
    if (xaxis.length > 0 && filteredList.length > 0) {
      renderActiveChart(xaxis, filteredList)
    }
  } catch (e) {
    console.error('加载有功功率失败:', e)
    activeLoading.value = false
  }
}

/** 渲染有功功率柱状图 */
const renderActiveChart = (xaxis: string[], seriesList: { name: string; data: number[] }[]) => {
  setActiveChartOptions({
    tooltip: { trigger: 'axis', show: true },
    legend: {
      type: 'scroll',
      data: seriesList.map((item) => item.name),
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xaxis,
      axisLabel: {
        color: '#666',
        fontSize: 12,
        rotate: xaxis.length > 6 ? 30 : 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '',
      axisLabel: {
        margin: 15,
        overflow: 'truncate',
        color: '#666',
        fontSize: 12,
      },
    },
    series: seriesList.map((item) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      barMaxWidth: 40,
    })),
  })
}

onMounted(() => {
  loadSpaceTree()
  loadStatistics()
  loadPowerUnitList()
  loadActiveChart()
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
          font-size: 14px;
          color: #86909c;
        }
      }

      &.chart-body {
        height: 350px;
        background: #f7f9fc;
        border-radius: 8px;
        overflow: hidden;
        padding: 0;

        .chart-placeholder {
          height: 100%;
          min-height: auto;
          background: #f7f9fc;
          border: none;
          gap: 12px;
        }
      }

      .power-chart {
        width: 100%;
        height: 100%;
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

    &__body {
      height: 320px;
      background: #f7f9fc;
      border-radius: 8px;
      overflow: hidden;
    }

    .temp-tabs {
      display: inline-flex;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      overflow: hidden;
    }

    .temp-tab {
      padding: 4px 14px;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.65);
      background: #ffffff;
      border: none;
      outline: none;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #1890ff;
      }

      &.active {
        color: #ffffff;
        background: #1890ff;
      }

      &:not(:last-child) {
        border-right: 1px solid #d9d9d9;
      }
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
  width: 28px;
  height: 28px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>