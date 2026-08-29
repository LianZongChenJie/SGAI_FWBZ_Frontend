<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="空调机组总数"
        :value="statsData.count"
        color="blue"
        :icon="AcUnitTotalIcon"
      />
      <StatCard
        label="运行中"
        :value="statsData.online"
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="今日能耗"
        :value="statsData.energyConsumption"
        color="orange"
        :icon="EnergyConsumptionIcon"
      />
      <StatCard
        label="平均COP"
        :value="statsData.avgCop"
        color="purple"
        :icon="avgCopIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>❄️空调机组实时监测</h3>
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
          :scroll="{ x: 1100 }"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'spaceId'">
              {{ findTreeNodePath(spaceTreeData, record.spaceId) || record.spaceId }}
            </template>
            <template v-if="column.key === 'runStop'">
              <a-tag v-if="record.runStop === '1'" color="green">运行</a-tag>
              <!-- <a-tag v-else-if="record.runStop === '待机'" color="orange">待机</a-tag> -->
              <a-tag v-else color="red">停止</a-tag>
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
        <button class="collapse-btn" @click="collapsedCharts = !collapsedCharts">
          <CaretDownOutlined v-if="!collapsedCharts" />
          <CaretUpOutlined v-else />
        </button>
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
          <div v-if="hasCo2Data" ref="co2ChartRef" class="venue-chart"></div>
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
          <div v-if="hasTempData" ref="tempChartRef" class="venue-chart"></div>
          <div v-else class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 空调系统 -->
    <div class="card" :class="{ 'process-fullscreen': processFullscreen }">
      <div class="card-header">
        <h3>🏭 工艺图监控 - 空调系统</h3>
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
      <div class="card-body process-body" v-show="!collapsedProcess">
        <div class="process-layout">
          <!-- 左侧：空间位置树 -->
          <div class="process-tree">
            <div class="process-tree__header">设备位置</div>
            <a-tree
              v-model:selectedKeys="selectedSpaceKeys"
              :tree-data="spaceTreeData"
              :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
              default-expand-all
              :style="{ maxHeight: '500px', overflow: 'auto' }"
              @select="handleSpaceSelect"
            />
          </div>
          <!-- 右侧：工艺图 -->
          <div
            class="process-schematic"
            @wheel.prevent="handleProcessZoom"
            @mousedown.prevent="startProcessPan"
            :style="{ cursor: processPanning ? 'grabbing' : 'grab' }"
          >
            <div class="process-schematic__inner" :style="{ transform: `translate(${panX}px, ${panY}px) scale(${processZoom})` }">
              <Ahu :values="ahuValues" :system-params="systemParams" :device-name="selectedDeviceName" />
            </div>
            <div class="process-schematic__controls">
              <button class="zoom-btn" @click="zoomOut">−</button>
              <span class="zoom-label">{{ Math.round(processZoom * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
              <button class="zoom-btn" @click="resetProcessZoom">重置</button>
            </div>
          </div>
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
            <a-tag v-if="detailRecord?.runStop === '1'" color="green">运行</a-tag>
            <!-- <a-tag v-else-if="detailRecord?.runStop === '0'" color="orange">待机</a-tag> -->
            <a-tag v-else color="red">停止</a-tag>
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
      title="❄️ 空调机组控制"
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
            <a-tag v-if="controlRecord?.runStop === '1'" color="green">运行</a-tag>
            <a-tag v-else color="red">停止</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="设定温度">{{ controlTempValue }}°C</a-descriptions-item>
          <template v-for="item in controlDisplayAttrs" :key="item.label">
            <a-descriptions-item :label="item.label">{{ item.value ?? '--' }}<span v-if="item.unit">{{ item.unit }}</span></a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted, nextTick } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { StatCard } from '/@/views/bems-web/components'
import { getSpaceTree } from './index.api'
import { getAcUnitList, getAcUnitStatistics, getDeviceAttrList, airControl } from './index.api'
import { useECharts } from '/@/hooks/web/useECharts'
import Ahu from '../../building-automation/ahu-1.vue'
import { getAcCo2Data, getAcSupplyData, getAcReturnData } from '../chartData'
import { buildTrendOption } from '../chartOptions'

// 折叠状态
const collapsedTable = ref(false)
const collapsedCharts = ref(false)
const collapsedProcess = ref(false)

// 工艺图全屏
const processFullscreen = ref(false)
const toggleProcessFullscreen = () => {
  processFullscreen.value = !processFullscreen.value
}

// 工艺图缩放与平移
const processZoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const processPanning = ref(false)
let panStartX = 0
let panStartY = 0
let panOriginX = 0
let panOriginY = 0

const handleProcessZoom = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  processZoom.value = Math.min(3, Math.max(0.5, +(processZoom.value + delta).toFixed(2)))
}
const zoomIn = () => {
  processZoom.value = Math.min(3, +(processZoom.value + 0.2).toFixed(2))
}
const zoomOut = () => {
  processZoom.value = Math.max(0.5, +(processZoom.value - 0.2).toFixed(2))
}
const startProcessPan = (e: MouseEvent) => {
  processPanning.value = true
  panStartX = e.clientX
  panStartY = e.clientY
  panOriginX = panX.value
  panOriginY = panY.value
  window.addEventListener('mousemove', onProcessPan)
  window.addEventListener('mouseup', stopProcessPan)
}
const onProcessPan = (e: MouseEvent) => {
  if (!processPanning.value) return
  panX.value = panOriginX + (e.clientX - panStartX)
  panY.value = panOriginY + (e.clientY - panStartY)
}
const stopProcessPan = () => {
  processPanning.value = false
  window.removeEventListener('mousemove', onProcessPan)
  window.removeEventListener('mouseup', stopProcessPan)
}
const resetProcessZoom = () => {
  processZoom.value = 1
  panX.value = 0
  panY.value = 0
}

// 工艺图 - 左侧树 & 右侧Ahu组件
const selectedSpaceKeys = ref<string[]>([])
const ahuValues = ref<Record<string, any>>({})
const systemParams = ref<any[]>([])
const selectedDeviceName = ref<string>('')

/** 将接口返回的树数据转换为 a-tree 格式 */
const transformTreeData = (nodes: any[]): any[] => {
  if (!nodes || !Array.isArray(nodes)) return []
  return nodes.map((node) => {
    const children = [
      ...(node.child ? transformTreeData(node.child) : []),
      ...(node.device ? node.device.map((d: any) => ({
        key: `device-${d.id}`,
        title: d.deviceName,
        isLeaf: true,
        rawDevice: d,
      })) : []),
    ]
    return {
      key: `space-${node.spaceId}`,
      title: node.spaceName,
      children,
      rawSpace: node,
    }
  })
}

/** 递归查找树中第一个设备节点 */
const findFirstDeviceKey = (nodes: any[]): string | null => {
  for (const node of nodes) {
    if (node.isLeaf) return String(node.key)
    if (node.children && node.children.length > 0) {
      const deviceKey = findFirstDeviceKey(node.children)
      if (deviceKey) return deviceKey
    }
  }
  return null
}

/** 从树中根据 key 查找设备原始数据 */
const findDeviceByKey = (nodes: any[], key: string): any | null => {
  for (const node of nodes) {
    if (String(node.key) === key) return node.rawDevice || null
    if (node.children && node.children.length > 0) {
      const found = findDeviceByKey(node.children, key)
      if (found) return found
    }
  }
  return null
}

/** 根据选中的节点加载工艺图数据（只有设备节点才加载） */
const handleSpaceSelect = (keys: (string | number)[]) => {
  if (!keys || keys.length === 0) return
  const key = String(keys[0])
  selectedSpaceKeys.value = [key]
  // 只有点击设备节点时才加载工艺图数据
  if (!key.startsWith('device-')) return
  // 更新选中的设备名称
  const device = findDeviceByKey(spaceTreeData.value, key)
  if (device) selectedDeviceName.value = device.deviceName || ''
  loadAhuValues(key)
}

/** 加载工艺图点位数据 */
const loadAhuValues = async (deviceKey: string) => {
  // 从 key 中提取设备 ID（格式: device-4719）
  const deviceId = deviceKey.replace('device-', '')
  try {
    const res = await getDeviceAttrList({ deviceId })
    const list = res?.records || res?.data || res || []
    // 保留接口返回的原始数组用于系统参数渲染
    systemParams.value = Array.isArray(list) ? list : []
    // 同时构建 key-value 映射用于工艺图动效
    const values: Record<string, any> = {}
    if (Array.isArray(list)) {
      list.forEach((item: any) => {
        if (item.code) values[item.code] = item.value
      })
    }
    ahuValues.value = values
  } catch (e) {
    console.error('加载工艺图数据失败:', e)
    ahuValues.value = {}
    systemParams.value = []
  }
}

// 自定义 emoji 图标组件
const AcUnitTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '❄️')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const EnergyConsumptionIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const avgCopIcon = () => h('span', { style: 'font-size: 20px;' }, '📈')

defineOptions({ name: 'AcTab' })

// 设备位置树数据
const meterSpace = ref([])
const spaceTreeData = ref<any[]>([])
const loadSpaceTree = async () => {
  try {
    const res = await getSpaceTree()
    const rawList = Array.isArray(res) ? res : (res.data || res.records || [])
    spaceTreeData.value = transformTreeData(rawList)
    // 默认选中第一个设备节点
    if (spaceTreeData.value.length > 0) {
      const firstKey = findFirstDeviceKey(spaceTreeData.value)
      if (firstKey) {
        selectedSpaceKeys.value = [firstKey]
        const device = findDeviceByKey(spaceTreeData.value, firstKey)
        if (device) selectedDeviceName.value = device.deviceName || ''
        loadAhuValues(firstKey)
      }
    }
  } catch (e) {
    console.error('加载设备列表失败:', e)
  }
}

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

// 筛选条件
const filterStatus = ref<string | undefined>(undefined)

// 统计数据
const statsData = reactive({
  count: '--',
  online: '--',
  energyConsumption: '--',
  avgCop: '--',
})

const loadStatistics = async () => {
  try {
    const res = await getAcUnitStatistics()
    const data = res?.data ?? res ?? {}
    statsData.count = data.count ?? '--'
    statsData.online = data.online ?? '--'
    statsData.energyConsumption = data.energyConsumption ?? '--'
    statsData.avgCop = data.avgCop ?? '--'
  } catch (e) {
    console.error('获取统计数据失败', e)
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

// 动态属性列
const attributeColumns = ref<any[]>([])

// 表格列定义（固定3列 + 动态列 + 操作列）
const columns = computed(() => [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 70,
    customRender: ({ index }: { index: number }) =>
      (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  { title: '机组编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 110 },
  { title: '位置', dataIndex: 'spaceId', key: 'spaceId', width: 150 },
  { title: '运行状态', dataIndex: 'runStop', key: 'runStop', width: 100 },
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

// 加载空调机组列表
const loadAcUnitList = async (pageNo = pagination.current, pageSize = pagination.pageSize, spaceId?: any, runStop?: string) => {
  try {
    const params: any = { pageNo, pageSize }
    if (spaceId) params.spaceId = spaceId
    if (runStop) params.runStop = runStop
    const res = await getAcUnitList(params)
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
        runStop: item.runStop ?? '--',
        ...attrs,
      }
    })
  } catch (e) {
    console.error('加载空调机组列表失败:', e)
  }
}

// 查询按钮
const handleSearch = () => {
  pagination.current = 1
  loadAcUnitList(1, pagination.pageSize, meterSpace.value, filterStatus.value)
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

// 控制弹窗
const controlVisible = ref(false)
const controlSwitchValue = ref(false)
const controlTempValue = ref<number>(22)
const controlRecord = ref<any>(null)
const controlAttrLoading = ref(false)
const controlAttrData = ref<{ label: string; value: any; unit?: string }[]>([])

/** 需要展示的属性标签 */
const CONTROL_DISPLAY_LABELS = ['送风温度', '回风温度', '新风温度', '新风湿度']

/** 从属性数据中筛选需要展示的项 */
const controlDisplayAttrs = computed(() => {
  return controlAttrData.value.filter(item => CONTROL_DISPLAY_LABELS.includes(item.label))
})

const handleControl = async (record: any) => {
  controlRecord.value = record
  controlSwitchValue.value = record.runStop === '1'
  controlTempValue.value = 22
  controlAttrData.value = []
  controlVisible.value = true

  // 调用接口获取设备属性
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
    console.error('空调控制失败:', e)
    message.error('保存失败')
  } finally {
    controlVisible.value = false
    loadAcUnitList()
  }
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadAcUnitList(pag.current, pag.pageSize, meterSpace.value, filterStatus.value)
}

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

/** 渲染回风二氧化碳图表（mock 数据） */
const renderCo2Chart = async () => {
  const data = getAcCo2Data()
  const series = (data.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!data.xaxis.length || !series.length) {
    hasCo2Data.value = false
    return
  }
  hasCo2Data.value = true
  await nextTick()
  setCo2ChartOptions(buildTrendOption(
    data.xaxis, series, 'ppm', true,
    { lines: [{ y: 800, label: 'CO2 设定值 800 ppm' }] },
    400, 880,
  ))
}

/** 渲染供回风温度趋势图表（mock 数据，送温/回温切换） */
const renderTempChart = async () => {
  const data = tempActive.value === 'return' ? getAcReturnData() : getAcSupplyData()
  const series = (data.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!data.xaxis.length || !series.length) {
    hasTempData.value = false
    return
  }
  hasTempData.value = true
  await nextTick()
  setTempChartOptions(buildTrendOption(data.xaxis, series, '℃', true))
}

onMounted(() => {
  loadSpaceTree()
  loadStatistics()
  renderCo2Chart()
  renderTempChart()
  loadAcUnitList()
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
        min-height: 300px;
        background: #f7f9fc;
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
      font-size: 12px;
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

.process-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
    margin: 0;
    padding: 20px;
    overflow: auto;
    background: #fff;
  }

  .process-body {
    height: 80%;
    .process-layout {
      display: flex;
      gap: 16px;
      min-height: 100%;
    }

    .process-tree {
      flex-shrink: 0;
      width: 240px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      overflow: hidden;

      &__header {
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;
      }

      :deep(.ant-tree) {
        padding: 8px;
      }
    }

    .process-schematic {
      flex: 1;
      position: relative;
      border: 1px solid #e5e6e8;
      border-radius: 8px;
      overflow: auto;
      background: linear-gradient(rgba(53, 108, 132, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(53, 108, 132, 0.05) 1px, transparent 1px);
      background-size: 18px 18px;
      background-color: #082332;
      min-height: 500px;

      .process-schematic__inner {
        width: 100%;
        min-height: 500px;
        position: relative;
        transform-origin: 0 0;
        transition: transform 0.05s ease-out;
      }

      .process-schematic__controls {
        position: sticky;
        bottom: 12px;
        right: 12px;
        margin-left: auto;
        width: fit-content;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
        padding: 4px 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 10;
      }
    }

    .process-empty {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #86909c;

      .chart-icon {
        font-size: 48px;
        color: #1677ff;
        margin-bottom: 12px;
      }

      .chart-text {
        font-size: 14px;
      }
    }
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
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    flex-shrink: 0;
  }
}

.zoom-btn {
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #595959;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 4px 8px;
  transition: all 0.2s;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}

.zoom-label {
  font-size: 12px;
  color: #595959;
  min-width: 40px;
  text-align: center;
}
</style>