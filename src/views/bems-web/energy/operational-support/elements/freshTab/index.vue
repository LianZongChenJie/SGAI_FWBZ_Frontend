<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="新风机组总数"
        :value="statsData.count"
        change-text=""
        trend=""
        color="blue"
        :icon="FreshUnitTotalIcon"
      />
      <StatCard
        label="运行中"
        :value="statsData.online"
        change-text=""
        trend=""
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="平均PM2.5"
        :value="statsData.avgPm25"
        change-text=""
        trend=""
        color="orange"
        :icon="AvgPm25Icon"
      />
      <StatCard
        label="今日能耗"
        :value="statsData.energyConsumption"
        change-text=""
        trend=""
        color="purple"
        :icon="energyConsumptionIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>🌀新风机组实时监测</h3>
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
      </div>
      <div class="card-body">
        <a-table
          :dataSource="tableData"
          :columns="columns"
          :pagination="pagination"
          :scroll="{ x: 1100 }"
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
              <a-button type="link" size="small">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3>💨各机组pm2.5分布</h3>
        </div>
        <div class="card-body chart-body">
          <div v-show="pm25Loading" class="chart-placeholder">
            <a-spin />
            <div class="chart-text">加载中...</div>
          </div>
          <div
            v-show="!pm25Loading && pm25ChartData.length === 0"
            class="chart-placeholder"
          >
            <div class="chart-icon">📊</div>
            <div class="chart-text">暂无数据</div>
          </div>
          <div
            v-show="!pm25Loading && pm25ChartData.length > 0"
            ref="pm25ChartRef"
            class="pm25-chart"
          ></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>🌡️送回风温度曲线</h3>
          <div class="temp-tabs">
            <button
              v-for="tab in tempTabs"
              :key="tab.key"
              :class="['temp-tab', { active: tempActive === tab.key }]"
              @click="handleTempTabChange(tab.key)"
            >{{ tab.label }}</button>
          </div>
        </div>
        <div class="card-body chart-body">
          <div v-show="tempLoading" class="chart-placeholder">
            <a-spin />
            <div class="chart-text">加载中...</div>
          </div>
          <div
            v-show="!tempLoading && tempChartData.length === 0"
            class="chart-placeholder"
          >
            <div class="chart-icon">📊</div>
            <div class="chart-text">暂无数据</div>
          </div>
          <div
            v-show="!tempLoading && tempChartData.length > 0"
            ref="tempChartRef"
            class="pm25-chart"
          ></div>
        </div>
      </div>
    </div>

    <!-- 工艺图监控 - 新风系统 -->
    <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 新风系统</h3>
        <a-tag color="green">实时</a-tag>
      </div>
      <div class="card-body">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon">🏭</div>
          <div class="chart-text">新风系统工艺流程监控图</div>
          <div style="font-size: 12px; color: #a0aec0; margin-top: 8px">
            新风入口 → 过滤网 → 表冷器 → 送风机 → PM2.5监测 → 送风出口 | 实时参数叠加显示
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted, nextTick } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import { spaceTree } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api'
import { getFreshAirUnitList, getFreshAirStatistics, getPm25, getFreshSupplyAirTemperature, getFreshReturnAirTemperature } from './index.api'
import { useECharts } from '/@/hooks/web/useECharts'

// 自定义 emoji 图标组件
const FreshUnitTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '🌀')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const AvgPm25Icon = () => h('span', { style: 'font-size: 20px;' }, '💨')
const energyConsumptionIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')

defineOptions({ name: 'FreshTab' })

defineProps<{
  data?: any
}>()

// 设备位置树数据
const meterSpace = ref([])
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
  avgPm25: "--",
  energyConsumption: "--",
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getFreshAirStatistics()
    const data = res?.data || res?.result || res || {}
    statsData.count = data.count ?? 0
    statsData.online = data.online ?? 0
    statsData.avgPm25 = data.avgPm25 ?? 0
    statsData.energyConsumption = data.energyConsumption ?? 0
  } catch (e) {
    console.error('加载新风统计数据失败:', e)
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
  { title: '机组编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 110 },
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

// 加载新风机组列表
const loadFreshAirUnitList = async (pageNo = pagination.current, pageSize = pagination.pageSize, spaceId?: string, runState?: string) => {
  try {
    const params: any = { pageNo, pageSize }
    if (spaceId) params.spaceId = spaceId
    if (runState) params.runState = runState
    const res = await getFreshAirUnitList(params)
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
        spaceId: item.spaceId ?? '--',
        runState: item.runState ?? '--',
        ...attrs,
      }
    })
  } catch (e) {
    console.error('加载新风机组列表失败:', e)
  }
}

// 查询按钮
const handleSearch = () => {
  pagination.current = 1
  loadFreshAirUnitList(1, pagination.pageSize, meterSpace.value, filterStatus.value)
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadFreshAirUnitList(pag.current, pag.pageSize, meterSpace.value, filterStatus.value)
}

// 各机组PM2.5分布柱状图
const pm25ChartRef = ref<HTMLDivElement>()
const pm25ChartData = ref<any[]>([])
const pm25Loading = ref(false)
const { setOptions: setPm25ChartOptions } = useECharts(pm25ChartRef as any)

/** 加载各机组PM2.5分布数据 */
const loadPm25Chart = async () => {
  pm25Loading.value = true
  try {
    const res = await getPm25()
    // 响应格式：{ result: { chat: { xaxis, chatSeriesList } } } 或 { chat: { ... } }
    const chatData = res?.chat || res?.result?.chat || res?.data?.chat || {}
    const xaxis = chatData.xaxis || []
    const seriesList = (chatData.chatSeriesList || chatData.seriesList || []) as any[]
    const filteredList = seriesList.filter((item: any) => item.name !== '合计')
    pm25ChartData.value = filteredList
    pm25Loading.value = false
    await nextTick()
    if (xaxis.length > 0 && filteredList.length > 0) {
      renderPm25Chart(xaxis, filteredList)
    }
  } catch (e) {
    console.error('加载各机组PM2.5分布失败:', e)
    pm25Loading.value = false
  }
}

/** 渲染各机组PM2.5分布柱状图 */
const renderPm25Chart = (xaxis: string[], seriesList: { name: string; data: number[] }[]) => {
  setPm25ChartOptions({
    tooltip: { trigger: 'axis', show: true },
    legend: {
      type: 'scroll',
      data: seriesList.map((item) => item.name),
      bottom: 4,
      padding: [4, 0, 0, 0],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '22%',
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

// 送回风温度曲线
const tempChartRef = ref<HTMLDivElement>()
const tempChartData = ref<any[]>([])
const tempLoading = ref(false)
const tempActive = ref('supply')
const tempTabs = [
  { key: 'supply', label: '送风' },
  { key: 'return', label: '回风' },
]
const { setOptions: setTempChartOptions } = useECharts(tempChartRef as any)

const handleTempTabChange = (key: string) => {
  tempActive.value = key
  loadTempChart()
}

/** 加载送回风温度曲线数据 */
const loadTempChart = async () => {
  tempLoading.value = true
  tempChartData.value = []
  try {
    const apiFn = tempActive.value === 'supply' ? getFreshSupplyAirTemperature : getFreshReturnAirTemperature
    const res = await apiFn()
    const chatData = res?.chat || res?.result?.chat || res?.data?.chat || {}
    const xaxis = chatData.xaxis || []
    const seriesList = (chatData.chatSeriesList || chatData.seriesList || []) as any[]
    const filteredList = seriesList.filter((item: any) => item.name !== '合计')
    tempChartData.value = filteredList
    tempLoading.value = false
    await nextTick()
    if (xaxis.length > 0 && filteredList.length > 0) {
      renderTempChart(xaxis, filteredList)
    }
  } catch (e) {
    console.error('加载送回风温度曲线失败:', e)
    tempLoading.value = false
  }
}

/** 渲染送回风温度折线图 */
const renderTempChart = (xaxis: string[], seriesList: { name: string; data: number[] }[]) => {
  setTempChartOptions({
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
      boundaryGap: false,
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
      type: 'line',
      data: item.data,
      smooth: true,
    })),
  })
}

onMounted(() => {
  loadSpaceTree()
  loadStatistics()
  loadFreshAirUnitList()
  loadPm25Chart()
  loadTempChart()
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

      .temp-tabs {
        display: inline-flex;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        overflow: hidden;

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

      .pm25-chart {
        width: 100%;
        height: 100%;
      }
    }
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
}
</style>