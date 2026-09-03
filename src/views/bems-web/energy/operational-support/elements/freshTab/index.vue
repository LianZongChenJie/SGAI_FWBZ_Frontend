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
        <div class="header-right">
          <div class="filter-bar">
          <a-input v-model:value="searchForm.deviceName" placeholder="设备名称" allow-clear style="width: 160px" @pressEnter="handleSearch" />
          <a-select v-model:value="searchForm.runState" placeholder="状态" allow-clear style="width: 120px" @change="handleSearch">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch">🔍 查询</a-button>
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
          :scroll="{ x: 1100 }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'runState'">
              <a-tag v-if="record.runState === '在线'" color="green">在线</a-tag>
              <a-tag v-else color="red">离线</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleControl(record)">控制</a-button>
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
        <div class="chart-header-right">
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
            <span class="analysis-card__icon">💨</span>
            <span>回风PM2.5</span>
          </div>
          <span class="card-note">今日均值 μg/m³ · 虚线=GB 3095 二级 35</span>
        </div>
        <div class="analysis-card__body">
          <div v-if="hasPm25Data" ref="pm25ChartRef" class="venue-chart"></div>
          <div v-else class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">🌡️</span>
            <span>送回风温度曲线</span>
          </div>
          <div class="temp-tabs">
            <button
              v-for="tab in tempTabs"
              :key="tab.key"
              :class="['temp-tab', { active: tempActive === tab.key }]"
              @click="handleTempTabChange(tab.key)"
            >{{ tab.label }}</button>
          </div>
        </div>
        <div class="analysis-card__body">
          <div v-if="hasTempData" ref="tempChartRef" class="venue-chart"></div>
          <div v-else class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 新风系统 -->
    <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 新风系统</h3>
        <div class="header-right">
          <a-tag color="green">实时</a-tag>
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
          <div class="chart-text">新风系统工艺流程监控图</div>
          <div style="font-size:14px; color: #a0aec0; margin-top: 8px">
            新风入口 → 过滤网 → 表冷器 → 送风机 → PM2.5监测 → 送风出口 | 实时参数叠加显示
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="详情" width="800px" :footer="null" :confirm-loading="detailLoading">
      <a-spin :spinning="detailLoading">
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="机组编号">{{ detailRecord?.deviceCode ?? '--' }}</a-descriptions-item>
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

    <!-- 控制弹窗 -->
    <a-modal
      v-model:open="controlVisible"
      title="🌀 新风机组控制"
      width="800px"
      :mask-closable="false"
      @ok="handleControlSave"
      ok-text="保存"
      cancel-text="取消"
    >
      <a-spin :spinning="controlAttrLoading">
        <!-- 控制操作区 -->
        <div class="control-actions">
          <div class="control-actions__item">
            <span class="control-actions__label">开关</span>
            <a-switch v-model:checked="controlSwitchValue" checked-children="开" un-checked-children="关" />
          </div>
          <div class="control-actions__item">
            <span class="control-actions__label">设定温度</span>
            <a-input-number v-model:value="controlTempValue" :min="16" :max="30" :step="1" style="width: 200px" addon-after="°C" />
          </div>
        </div>

        <!-- 实时监测数据（只读） -->
        <a-descriptions bordered :column="2" size="small" style="margin-top: 16px">
          <a-descriptions-item label="机组编号">{{ controlRecord?.deviceCode ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="位置">{{ findTreeNodePath(spaceTreeData, controlRecord?.spaceId) || controlRecord?.spaceId || '--' }}</a-descriptions-item>
          <a-descriptions-item label="运行状态">
            <a-tag v-if="controlRecord?.runState === '在线'" color="green">在线</a-tag>
            <a-tag v-else color="red">离线</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="设定温度">{{ controlTempValue }}°C</a-descriptions-item>
          <template v-for="item in controlDisplayAttrs" :key="item.label">
            <a-descriptions-item :label="item.label">{{ item.value ?? '--' }}<span v-if="item.unit">{{ item.unit }}</span></a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted, nextTick } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { spaceTree } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api'
import { message } from 'ant-design-vue'
import { getFreshAirUnitList, getFreshAirStatistics, getDeviceAttrList, airControl, exportData, selectDevice } from './index.api'
import { getStatisticsByCategoryId } from '../../index.api'
import { useECharts } from '/@/hooks/web/useECharts'
import { buildTrendOption } from '../chartOptions'

// 自定义 emoji 图标组件
const FreshUnitTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '🌀')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const AvgPm25Icon = () => h('span', { style: 'font-size: 20px;' }, '💨')
const energyConsumptionIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')

defineOptions({ name: 'FreshTab' })

defineProps<{
  data?: any
}>()

// 折叠状态
const collapsedTable = ref(false)
const collapsedCharts = ref(false)
const collapsedProcess = ref(false)

// 工艺图全屏
const processFullscreen = ref(false)
const toggleProcessFullscreen = () => {
  processFullscreen.value = !processFullscreen.value
}

// 设备位置树数据
const meterSpace = ref<string | undefined>(undefined)
const spaceTreeData = ref<any[]>([])
const loadSpaceTree = async () => {
  try {
    const res = await spaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

// 递归查找树节点完整路径（支持带前缀的 key 匹配）
const findTreeNodePath = (treeData: any[], key: string | number, separator = '-'): string => {
  if (!treeData || !Array.isArray(treeData)) return ''
  const findPath = (nodes: any[], path: string[]): string[] | null => {
    for (const node of nodes) {
      const label = node.title || node.value || node.label || ''
      const currentPath = [...path, label]
      const nodeKey = String(node.key)
      const searchKey = String(key)
      // 精确匹配或带前缀匹配（如 space-1 匹配 1）
      if (nodeKey === searchKey || nodeKey === `space-${searchKey}` || nodeKey.endsWith(`-${searchKey}`)) {
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

// 搜索表单
const searchForm = reactive({
  deviceName: '',
  runState: undefined as string | undefined,
})

// 统计卡片数据
const statsData = reactive({
  count: 0,
  online: 0,
  avgPm25: '--',
  energyConsumption: '--',
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 使用新接口获取总数和在线数
    const statRes = await getStatisticsByCategoryId(17)
    const statData = statRes?.data ?? statRes ?? {}
    statsData.count = statData.count ?? 0
    statsData.online = statData.online ?? 0

    // 其他统计数据保持原有接口
    const res = await getFreshAirStatistics()
    const data = res?.data || res?.result || res || {}
    statsData.avgPm25 = data.avgPm25 ?? 0
    statsData.energyConsumption = data.energyConsumption ?? 0
  } catch (e) {
    console.error('加载新风统计数据失败:', e)
  }
}

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

// 表格列定义（参考排风机）
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

/** 加载新风机组列表 */
const loadTableData = async () => {
  tableLoading.value = true
  try {
    const res = await selectDevice({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      categoryIds: '17',
      deviceName: searchForm.deviceName || undefined,
      runState: searchForm.runState || undefined,
    })
    const list = res?.records || []
    tableData.value = list
    tableTotal.value = res?.total || 0
  } catch (error) {
    console.error('加载新风机组列表失败:', error)
    tableData.value = []
    tableTotal.value = 0
  } finally {
    tableLoading.value = false
  }
}

// 查询按钮
const handleSearch = () => {
  currentPage.value = 1
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
    const res = await getDeviceAttrList({ deviceId: record.id })
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
const controlSwitchValue = ref(false)
const controlTempValue = ref<number>(22)
const controlRecord = ref<any>(null)
const controlAttrLoading = ref(false)
const controlAttrData = ref<{ label: string; value: any; unit?: string }[]>([])

/** 需要展示的属性标签 */
const CONTROL_DISPLAY_LABELS = ['新风温度', '送风温度', 'PM2.5']

/** 从属性数据中筛选需要展示的项 */
const controlDisplayAttrs = computed(() => {
  return controlAttrData.value.filter(item => CONTROL_DISPLAY_LABELS.includes(item.label))
})

const handleControl = async (record: any) => {
  controlRecord.value = record
  controlSwitchValue.value = record.runState === '在线'
  controlTempValue.value = 22
  controlAttrData.value = []
  controlVisible.value = true

  const deviceId = record.deviceId
  if (deviceId) {
    controlAttrLoading.value = true
    try {
      const res: any = await getDeviceAttrList({ deviceId })
      const list = res?.records || res?.data || res || []
      controlAttrData.value = Array.isArray(list) ? list : []
    } catch (e) {
      console.error('获取设备属性失败:', e)
    } finally {
      controlAttrLoading.value = false
    }
  }
}

const handleControlSave = async () => {
  const deviceId = controlRecord.value?.deviceId
  if (!deviceId) return
  const onOffValue = controlSwitchValue.value ? 2 : 1
  const payload = [
    { deviceId, attributeCode: 'UNIT_ON_OFF', value: onOffValue },
    { deviceId, attributeCode: 'SA_TEMP_SETPOINT', value: controlTempValue.value },
  ]
  try {
    await airControl(payload)
    message.success('保存成功')
  } catch (e) {
    console.error('新风机组控制失败:', e)
    message.error('保存失败')
  } finally {
    controlVisible.value = false
    loadTableData()
  }
}

// 导出loading
const exportLoading = ref(false)

/** 导出设备列表 */
const handleExport = async () => {
  exportLoading.value = true
  try {
    const res = await exportData({
      categoryIds: '17',
      deviceName: searchForm.deviceName || undefined,
      runState: searchForm.runState || undefined,
    })
    const blobOptions = { type: 'application/vnd.ms-excel' }
    const fileSuffix = '.xlsx'
    const url = window.URL.createObjectURL(new Blob([res], blobOptions))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '新风机组列表' + fileSuffix)
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

// 控制弹窗 end

// 表格分页变化
const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  loadTableData()
}

// 图表区域设备选择
const deviceLoading = ref(false)
const deviceOptions = ref<{ label: string; value: string }[]>([])
const selectedDeviceId = ref<string>('')

/** 加载设备选项 */
const loadDeviceOptions = async () => {
  deviceLoading.value = true
  try {
    const res = await selectDevice({ pageNo: 1, pageSize: 999, categoryIds: '17' })
    const list = res?.records || []
    deviceOptions.value = list.map((item: any) => ({
      label: item.deviceName,
      value: String(item.id),
    }))
    // 默认选中第一项，并渲染图表
    if (deviceOptions.value.length > 0) {
      selectedDeviceId.value = deviceOptions.value[0].value
      // 设备加载完成后渲染图表
      await renderPm25Chart()
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
  renderPm25Chart()
  renderTempChart()
}

/** 下拉筛选规则 */
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

// 回风PM2.5图表
const pm25ChartRef = ref<HTMLDivElement>()
const hasPm25Data = ref(false)
const { setOptions: setPm25ChartOptions } = useECharts(pm25ChartRef as any)

/** 渲染回风PM2.5图表 */
const renderPm25Chart = async () => {
  if (!selectedDeviceId.value) {
    hasPm25Data.value = false
    return
  }
  try {
    const { iconAreaCommon } = await import('../../index.api')
    const res = await iconAreaCommon({
      deviceIds: selectedDeviceId.value,
      attributeName: '回风PM2.5',
      threshold: 35,
    }) as any
    const data = res?.data || res || {}
    const xaxis = data.xaxis || data.xAxis || data.timeList || []
    const series = (data.chatSeriesList || data.seriesList || data.series || []).filter((s: any) => s.name !== '合计')
    if (!xaxis.length || !series.length) {
      hasPm25Data.value = false
      return
    }
    hasPm25Data.value = true
    await nextTick()
    setPm25ChartOptions(buildTrendOption(
      xaxis, series, 'μg/m³', true,
      { lines: [{ y: 35, label: 'GB 3095 二级 35 μg/m³' }] },
    ))
  } catch (error) {
    console.error('加载PM2.5数据失败:', error)
    hasPm25Data.value = false
  }
}

// 送回风温度曲线
const tempChartRef = ref<HTMLDivElement>()
const hasTempData = ref(false)
const tempActive = ref<'supply' | 'return'>('supply')
const tempTabs: { key: 'supply' | 'return'; label: string }[] = [
  { key: 'supply', label: '送温' },
  { key: 'return', label: '回温' },
]
const { setOptions: setTempChartOptions } = useECharts(tempChartRef as any)

const handleTempTabChange = (key: 'supply' | 'return') => {
  tempActive.value = key
  renderTempChart()
}

/** 渲染送回风温度曲线 */
const renderTempChart = async () => {
  if (!selectedDeviceId.value) {
    hasTempData.value = false
    return
  }
  // 根据 tab 确定属性名称
  const attributeName = tempActive.value === 'return' ? '回风温度' : '送风温度'
  try {
    const { iconAreaCommon } = await import('../../index.api')
    const res = await iconAreaCommon({
      deviceIds: selectedDeviceId.value,
      attributeName,
    }) as any
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

onMounted(() => {
  loadSpaceTree()
  loadStatistics()
  // loadDeviceOptions 内部会在设备加载完成后自动渲染图表
  loadDeviceOptions()
  loadTableData()
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

.chart-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.control-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 12px 16px;
  background: #f7f9fc;
  border: 1px solid #e5e6eb;
  border-radius: 8px;

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size:16px;
    font-weight: 500;
    color: #1d2129;
    flex-shrink: 0;
  }
}
</style>
