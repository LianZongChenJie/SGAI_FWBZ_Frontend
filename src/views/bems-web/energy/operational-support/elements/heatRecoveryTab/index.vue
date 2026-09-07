<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="热回收机组总数"
        :value="statsData.count"
        color="blue"
        :icon="TotalIcon"
      />
      <StatCard
        label="在线"
        :value="statsData.online"
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="今日能耗"
        :value="statsData.energyConsumption"
        unit="kWh"
        color="orange"
        :icon="EnergyIcon"
      />
      <StatCard
        label="热回收效率"
        :value="statsData.efficiency"
        unit="%"
        color="purple"
        :icon="EfficiencyIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>🔄热回收机组实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
          <a-input v-model:value="searchForm.deviceName" placeholder="设备名称" allow-clear style="width: 160px" @pressEnter="handleSearch" />
          <a-select v-model:value="searchForm.runState" placeholder="状态" allow-clear style="width: 120px" @change="handleSearch">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 查询</a-button>
          </div>
          <a-button type="primary" :loading="exportLoading" @click="handleExport" class="export-btn">
            <DownloadOutlined v-if="!exportLoading" />
            导出
          </a-button>
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
          :loading="tableLoading"
          :scroll="{ x: 1300 }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'runState'">
              <a-tag v-if="record.runState === '在线'" color="green">在线</a-tag>
              <a-tag v-else color="red">离线</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleControl(record)">控制</a-button>
                <a-button type="link" size="small" @click="handleDetail(record)">详情</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="collapse-row">
      <div class="collapse-row__header">
        <h3>📊 图表区域</h3>
        <div class="chart-header-right">
          <DatePicker.RangePicker
            v-model:value="dateRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间', '结束时间']"
            style="width: 340px"
            @change="handleDateRangeChange"
          />
          <a-select
            v-model:value="selectedDeviceId"
            placeholder="选择设备"
            allow-clear
            show-search
            :filter-option="filterOption"
            style="width: 200px"
            :loading="deviceLoading"
            @change="handleDeviceChange"
          >
            <a-select-option v-for="item in deviceOptions" :key="item.value" :value="item.value" :label="item.label">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <button class="collapse-btn" @click="collapsedCharts = !collapsedCharts">
            <CaretDownOutlined v-if="!collapsedCharts" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
    <div class="two-col" v-show="!collapsedCharts">
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">🌫️</span>
            <span>回风二氧化碳</span>
          </div>
          <span class="card-note">今日 00:00–23:00 · 逐时 ppm · 虚线=设定 800</span>
        </div>
        <div class="analysis-card__body">
          <div v-show="hasCo2Data" ref="co2ChartRef" class="venue-chart"></div>
          <div v-show="!hasCo2Data" class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">🌡️</span>
            <span>供回风温度趋势</span>
          </div>
          <div class="temp-tabs">
            <button
              v-for="tab in tempTabs"
              :key="tab.key"
              :class="['temp-tab', { active: tempActive === tab.key }]"
              @click="handleTempTabChange(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="analysis-card__body">
          <div v-show="hasTempData" ref="tempChartRef" class="venue-chart"></div>
          <div v-show="!hasTempData" class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 热回收系统 -->
    <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 热回收系统</h3>
        <div class="header-right">
          <a-tag color="blue">实时</a-tag>
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
          <div class="chart-text">热回收系统工艺流程监控图</div>
          <div style="font-size:14px; color: #a0aec0; margin-top: 8px">
            排风入口 → 热交换芯 → 新风出口 | 新风入口 → 热交换芯 → 送风出口 | 实时温度/湿度/效率叠加显示
          </div>
        </div>
    </div>
    </div>

    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="详情" width="800px" :footer="null">
      <a-spin :spinning="detailLoading">
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="设备名称">{{ detailRecord?.deviceName ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="设备编号">{{ detailRecord?.deviceCode ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="设备位置">{{ detailRecord?.spaceName ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="备注">{{ detailRecord?.remark ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag v-if="detailRecord?.runState === '在线'" color="green">在线</a-tag>
            <a-tag v-else color="red">离线</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="最后通讯时间">{{ detailRecord?.lastGatherTime ?? '--' }}</a-descriptions-item>
          <template v-for="attr in detailAttributes" :key="attr.code || attr.configId">
            <a-descriptions-item :label="attr.label">{{ attr.value ?? '--' }}</a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-modal>

    <!-- 控制弹窗 -->
    <a-modal
      v-model:open="controlVisible"
      title="🔄 热回收机组控制"
      width="800px"
      :mask-closable="false"
      @ok="controlVisible = false"
      ok-text="关闭"
      :cancel-button-props="{ hidden: true }"
    >
      <a-spin :spinning="controlPointLoading">
        <a-descriptions v-if="controlPointData.length > 0" bordered :column="2" size="small" :label-style="{ width: '146px' }">
          <a-descriptions-item v-for="item in controlPointData" :key="item.id" :label="item.attributeName || '--'">
            <template v-if="item.valueType === 'BOOL'">
              <a-switch
                :checked="item.value === '1'"
                :loading="item._loading"
                @change="(checked: boolean) => handleSwitchChange(item, checked)"
              />
            </template>
            <template v-else>
              <div class="input-with-btn">
                <a-input
                  v-model:value="item._editValue"
                  :placeholder="item.value ?? '--'"
                  style="width: 120px"
                />
                <span v-if="item.unit" style="margin-left: 4px">{{ item.unit }}</span>
                <a-button
                  type="primary"
                  :loading="item._loading"
                  style="margin-left: 8px"
                  @click="handleInputConfirm(item)"
                >
                  确定
                </a-button>
              </div>
            </template>
          </a-descriptions-item>
        </a-descriptions>
        <a-empty v-else description="暂无可控制点位" />
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, h } from 'vue'
import { DatePicker, Modal, message } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { selectDevice, getDeviceAttrList, getHeatRecoveryStatistics, exportData, getSpaceTree, findDeviceControlPoint, realTimeData } from './index.api'
import { getStatisticsByCategoryId } from '../../index.api'
import { useECharts } from '/@/hooks/web/useECharts'
import { buildTrendOption } from '../chartOptions'

// 自定义 emoji 图标组件
const TotalIcon = () => h('span', { style: 'font-size: 20px;' }, '🔄')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const EnergyIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const EfficiencyIcon = () => h('span', { style: 'font-size: 20px;' }, '📈')

defineOptions({ name: 'HeatRecoveryTab' })

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

// 日期区间选择
const dateRange = ref<any>(null)
const formatDateTime = (date: Dayjs | null | undefined): string => {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : ''
}

/** 日期区间变化 */
const handleDateRangeChange = () => {
  renderCo2Chart()
  renderTempChart()
}

// 设备位置树数据
const spaceTreeData = ref<any[]>([])
const loadSpaceTree = async () => {
  try {
    const res = await getSpaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

// 统计数据
const statsData = ref({
  count: '--',
  online: '--',
  energyConsumption: '--',
  efficiency: '--',
})

/** 加载汇总统计数据 */
const loadStatistics = async () => {
  try {
    // 使用新接口获取总数和在线数（⚠️ 当前代码中热回收机组categoryIds为37，请确认是否正确）
    const statRes = await getStatisticsByCategoryId(37)
    const statData = statRes?.data ?? statRes ?? {}
    statsData.value.count = statData.count ?? '--'
    statsData.value.online = statData.online ?? '--'

    // 其他统计数据保持原有接口
    const res = await getHeatRecoveryStatistics()
    const data = res?.data ?? res ?? {}
    statsData.value.energyConsumption = data.energyConsumption ?? '--'
    statsData.value.efficiency = data.efficiency ?? '--'
  } catch (e) {
    console.error('获取热回收机组统计数据失败:', e)
  }
}

// 搜索表单
const searchForm = reactive({
  deviceName: '',
  runState: undefined as string | undefined,
})

const findSpaceTitleById = (spaceId: string | number): string => {
  if (!spaceId && spaceId !== 0) return ''
  const findTitle = (nodes: any[]): string => {
    for (const node of nodes) {
      const nodeKey = String(node.key)
      const searchKey = String(spaceId)
      if (nodeKey === searchKey || nodeKey === `space-${searchKey}` || nodeKey.endsWith(`-${searchKey}`)) {
        return node.title || node.value || node.label || ''
      }
      if (node.children && Array.isArray(node.children)) {
        const title = findTitle(node.children)
        if (title) return title
      }
    }
    return ''
  }
  return findTitle(spaceTreeData.value)
}

// 表格列定义
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    customRender: ({ index }: { index: number }) =>
      (currentPage.value - 1) * pageSize.value + index + 1,
  },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 120 },
  { title: '设备编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 120 },
  {
    title: '设备位置',
    dataIndex: 'spaceId',
    key: 'spaceId',
    width: 140,
    customRender: ({ text, record }) => {
      if (record.spaceName) return record.spaceName
      if (!text && text !== 0) return ''
      return findSpaceTitleById(text) || text
    },
  },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 100 },
  { title: '状态', dataIndex: 'runState', key: 'runState', width: 90 },
  { title: '最后通讯时间', dataIndex: 'lastGatherTime', key: 'lastGatherTime', width: 160 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' as const },
]

// 表格数据
const tableData = ref<any[]>([])
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const tableTotal = ref(0)

const pagination = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: tableTotal.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
}))

/** 加载表格数据 */
const loadTableData = async () => {
  tableLoading.value = true
  try {
    const res = await selectDevice({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      categoryIds: '37',
      deviceName: searchForm.deviceName || undefined,
      runState: searchForm.runState || undefined,
    })
    const list = res?.records || []
    tableData.value = list
    tableTotal.value = res?.total || 0
  } catch (error) {
    console.error('加载热回收机组列表失败:', error)
    tableData.value = []
    tableTotal.value = 0
  } finally {
    tableLoading.value = false
  }
}

// 导出loading
const exportLoading = ref(false)

/** 导出设备列表 */
const handleExport = async () => {
  exportLoading.value = true
  try {
    const res = await exportData({
      categoryIds: '37',
      deviceName: searchForm.deviceName || undefined,
      runState: searchForm.runState || undefined,
    })
    const blobOptions = { type: 'application/vnd.ms-excel' }
    const fileSuffix = '.xlsx'
    const url = window.URL.createObjectURL(new Blob([res], blobOptions))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '热回收机组列表' + fileSuffix)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('导出失败:', e)
  } finally {
    exportLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadTableData()
}

const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  loadTableData()
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
    const res = await getDeviceAttrList({ deviceId: record.id || record.deviceId })
    detailAttributes.value = res?.records || res?.data || res || []
  } catch (e) {
    console.error('查询设备属性失败:', e)
    detailAttributes.value = []
  } finally {
    detailLoading.value = false
  }
}

// 控制弹窗
const controlVisible = ref(false)
const controlPointLoading = ref(false)
const controlPointData = ref<any[]>([])

/** 打开控制弹窗 */
const handleControl = async (record: any) => {
  controlVisible.value = true
  controlPointLoading.value = true
  controlPointData.value = []
  try {
    const res = await findDeviceControlPoint({ deviceId: record.id || record.deviceId })
    const list = res?.records || res?.data || res || []
    controlPointData.value = (Array.isArray(list) ? list : []).map((item: any) => ({
      ...item,
      _loading: false,
      _editValue: item.value,
    }))
  } catch (e) {
    console.error('查询控制点位失败:', e)
    controlPointData.value = []
  } finally {
    controlPointLoading.value = false
  }
}

/** 开关切换确认 */
const handleSwitchChange = (item: any, checked: boolean) => {
  Modal.confirm({
    title: '确认操作',
    content: `确定要${checked ? '开启' : '关闭'}「${item.attributeName}」吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      item._loading = true
      try {
        await realTimeData({
          tagid: item.acquisitionCoding,
          pv: checked ? '1' : '0',
        })
        item.value = checked ? '1' : '0'
        message.success('操作成功')
      } catch (e) {
        message.error('操作失败')
      } finally {
        item._loading = false
      }
    },
  })
}

/** 输入框确认 */
const handleInputConfirm = (item: any) => {
  Modal.confirm({
    title: '确认操作',
    content: `确定要将「${item.attributeName}」的值修改为「${item._editValue}」吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      item._loading = true
      try {
        await realTimeData({
          tagid: item.acquisitionCoding,
          pv: item._editValue,
        })
        item.value = item._editValue
        message.success('操作成功')
      } catch (e) {
        message.error('操作失败')
      } finally {
        item._loading = false
      }
    },
  })
}

// 图表区域设备选择
const deviceLoading = ref(false)
const deviceOptions = ref<{ label: string; value: string }[]>([])
const selectedDeviceId = ref<string>('')

/** 加载设备选项 */
const loadDeviceOptions = async () => {
  deviceLoading.value = true
  try {
    const res = await selectDevice({ pageNo: 1, pageSize: 999, categoryIds: '37' })
    const list = res?.records || []
    deviceOptions.value = list.map((item: any) => ({
      label: item.deviceName,
      value: String(item.id),
    }))
    // 默认选中第一项，并渲染图表
    if (deviceOptions.value.length > 0) {
      selectedDeviceId.value = deviceOptions.value[0].value
      await renderCo2Chart()
      await renderTempChart()
    }
  } catch (error) {
    console.error('加载设备选项失败:', error)
    deviceOptions.value = []
  } finally {
    deviceLoading.value = false
  }
}

/** 设备选择变化 */
const handleDeviceChange = (deviceId: string) => {
  selectedDeviceId.value = deviceId
  renderCo2Chart()
  renderTempChart()
}

/** 下拉筛选规则 */
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

onMounted(() => {
  loadSpaceTree()
  loadStatistics()
  loadTableData()
  loadDeviceOptions()
})

// 回风二氧化碳图表
const co2ChartRef = ref<HTMLDivElement>()
const hasCo2Data = ref(false)
const { setOptions: setCo2ChartOptions } = useECharts(co2ChartRef as any)

// 供回风温度趋势图表
const tempChartRef = ref<HTMLDivElement>()
const hasTempData = ref(false)
const { setOptions: setTempChartOptions } = useECharts(tempChartRef as any)

const tempTabs: { key: 'supply' | 'return'; label: string }[] = [
  { key: 'supply', label: '送温' },
  { key: 'return', label: '回温' },
]
const tempActive = ref<'supply' | 'return'>('supply')

const handleTempTabChange = (key: 'supply' | 'return') => {
  tempActive.value = key
  renderTempChart()
}

/** 渲染回风二氧化碳图表 */
const renderCo2Chart = async () => {
  if (!selectedDeviceId.value) {
    hasCo2Data.value = false
    return
  }
  try {
    const { iconAreaCommon } = await import('../../index.api')
    const params: any = {
      deviceIds: selectedDeviceId.value,
      attributeName: '回风二氧化碳传感器',
      threshold: 800,
    }
    if (dateRange.value) {
      params.startTime = formatDateTime(dateRange.value[0])
      params.endTime = formatDateTime(dateRange.value[1])
    }
    const res = await iconAreaCommon(params) as any
    const data = res?.data || res || {}
    const xaxis = data.xaxis || data.xAxis || data.timeList || []
    const series = (data.chatSeriesList || data.seriesList || data.series || []).filter((s: any) => s.name !== '合计')
    if (!xaxis.length || !series.length) {
      hasCo2Data.value = false
      return
    }
    hasCo2Data.value = true
    await nextTick()
    setCo2ChartOptions(buildTrendOption(
      xaxis, series, 'ppm', true,
      { lines: [{ y: 800, label: 'CO2 设定值 800 ppm' }] },
      400, 880,
    ))
  } catch (error) {
    console.error('加载CO2数据失败:', error)
    hasCo2Data.value = false
  }
}

/** 渲染供回风温度趋势图表 */
const renderTempChart = async () => {
  if (!selectedDeviceId.value) {
    hasTempData.value = false
    return
  }
  const attributeName = tempActive.value === 'return' ? '回风温度' : '送风温度'
  try {
    const { iconAreaCommon } = await import('../../index.api')
    const params: any = {
      deviceIds: selectedDeviceId.value,
      attributeName,
    }
    if (dateRange.value) {
      params.startTime = formatDateTime(dateRange.value[0])
      params.endTime = formatDateTime(dateRange.value[1])
    }
    const res = await iconAreaCommon(params) as any
    const data = res?.data || res || {}
    const xaxis = data.xaxis || data.xAxis || data.timeList || []
    const series = (data.chatSeriesList || data.seriesList || data.series || []).filter((s: any) => s.name !== '合计')
    if (!xaxis.length || !series.length) {
      hasTempData.value = false
      return
    }
    hasTempData.value = true
    await nextTick()
    setTempChartOptions(buildTrendOption(xaxis, series, '℃', true))
  } catch (error) {
    console.error('加载温度数据失败:', error)
    hasTempData.value = false
  }
}
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
          font-size:16px;
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
      font-size:14px;
      text-align: right;
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
      font-size:16px;
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
        font-size:16px;
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

.chart-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
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
  font-size:14px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>
