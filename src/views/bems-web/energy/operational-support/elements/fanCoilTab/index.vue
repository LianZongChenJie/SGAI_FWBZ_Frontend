<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="风机盘管总数"
        :value="statsData.count"
        color="blue"
        :icon="TotalIcon"
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
        unit="kWh"
        color="orange"
        :icon="EnergyIcon"
      />
      <StatCard
        label="平均温度"
        :value="statsData.avgTemp"
        unit="°C"
        color="purple"
        :icon="TempIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>🎛️风机盘管实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
          <a-input v-model:value="searchForm.deviceName" placeholder="设备名称" allow-clear style="width: 160px" @pressEnter="handleSearch" />
          <a-select v-model:value="searchForm.runState" placeholder="状态" allow-clear style="width: 120px" @change="handleSearch">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select>
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
          :loading="tableLoading"
          :scroll="{ x: 1200 }"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
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
            <span>风机盘管能耗趋势</span>
          </div>
          <span class="card-note">各馆 FCU 群 · 逐时 kWh</span>
        </div>
        <div class="analysis-card__body">
          <div v-if="hasEnergyData" ref="energyChartRef" class="venue-chart"></div>
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
            <span>供回水温度曲线</span>
          </div>
          <span class="card-note">冷冻水供/回水总管 · ℃</span>
        </div>
        <div class="analysis-card__body">
          <div v-if="hasWaterData" ref="waterChartRef" class="venue-chart"></div>
          <div v-else class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 风机盘管系统 -->
    <div class="card" :class="{ 'process-fullscreen': processFullscreen }">
      <div class="card-header">
        <h3>🏭工艺图监控 - 风机盘管系统</h3>
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
          <div class="process-schematic">
            <Fcu
              :values="deviceValues"
              :system-params="systemParams"
              :device-name="selectedDeviceName"
            />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted, nextTick } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { getSpaceTree, getDeviceAttrList, selectDevice } from './index.api'
import Fcu from '../../building-automation/fcu.vue'
import { useECharts } from '/@/hooks/web/useECharts'
import { getFcuEnergyData, getFcuWaterData } from '../chartData'
import { buildTrendOption } from '../chartOptions'

// 自定义 emoji 图标组件
const TotalIcon = () => h('span', { style: 'font-size: 20px;' }, '🎛️')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const EnergyIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const TempIcon = () => h('span', { style: 'font-size: 20px;' }, '🌡️')

defineOptions({ name: 'FanCoilTab' })

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

// 工艺图 - 左侧树 & 右侧Fcu组件
const selectedSpaceKeys = ref<string[]>([])
const spaceTreeData = ref<any[]>([])
const deviceValues = ref<Record<string, any>>({})
const systemParams = ref<any[]>([])
const selectedDeviceName = ref<string>('')

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

/** 加载设备属性信息 */
const loadDeviceAttrList = async (deviceKey: string) => {
  const deviceId = deviceKey.replace('device-', '')
  try {
    const res = await getDeviceAttrList({ deviceId })
    const list = res?.records || res?.data || res || []
    systemParams.value = Array.isArray(list) ? list : []
    // 同时构建 key-value 映射用于工艺图动效
    const values: Record<string, any> = {}
    if (Array.isArray(list)) {
      list.forEach((item: any) => {
        if (item.code) values[item.code] = item.value
      })
    }
    deviceValues.value = values
  } catch (e) {
    console.error('加载设备属性失败:', e)
    systemParams.value = []
    deviceValues.value = {}
  }
}

/** 加载设备列表 */
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
        if (device) {
          deviceValues.value = device
          selectedDeviceName.value = device.deviceName || ''
        }
        loadDeviceAttrList(firstKey)
      }
    }
  } catch (e) {
    console.error('加载设备列表失败:', e)
  }
}

/** 根据选中的节点切换（只有设备节点才传值） */
const handleSpaceSelect = (keys: (string | number)[]) => {
  if (!keys || keys.length === 0) return
  const key = String(keys[0])
  selectedSpaceKeys.value = [key]
  // 只有点击设备节点时才传值
  if (!key.startsWith('device-')) return
  const device = findDeviceByKey(spaceTreeData.value, key)
  if (device) {
    deviceValues.value = device
    selectedDeviceName.value = device.deviceName || ''
  }
  loadDeviceAttrList(key)
}

onMounted(() => {
  loadSpaceTree()
  loadTableData()
  loadCharts()
})

// 风机盘管能耗趋势图表
const energyChartRef = ref<HTMLDivElement>()
const hasEnergyData = ref(false)
const { setOptions: setEnergyChartOptions } = useECharts(energyChartRef as any)

// 供回水温度曲线图表
const waterChartRef = ref<HTMLDivElement>()
const hasWaterData = ref(false)
const { setOptions: setWaterChartOptions } = useECharts(waterChartRef as any)

/** 渲染风机盘管能耗趋势与供回水温度图表（mock 数据） */
const loadCharts = async () => {
  await nextTick()
  // 图1 能耗趋势
  const energyData = getFcuEnergyData()
  const energySeries = (energyData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!energyData.xaxis.length || !energySeries.length) {
    hasEnergyData.value = false
  } else {
    hasEnergyData.value = true
    await nextTick()
    setEnergyChartOptions(buildTrendOption(energyData.xaxis, energySeries, 'kWh'))
  }

  // 图2 供回水温度
  const waterData = getFcuWaterData()
  const waterSeries = (waterData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!waterData.xaxis.length || !waterSeries.length) {
    hasWaterData.value = false
  } else {
    hasWaterData.value = true
    await nextTick()
    setWaterChartOptions(buildTrendOption(waterData.xaxis, waterSeries, '℃', true))
  }
}

// 统计数据
const statsData = ref({
  count: 0,
  online: 0,
  energyConsumption: '--',
  avgTemp: '--',
})

// 搜索表单
const searchForm = reactive({
  deviceName: '',
  runState: undefined as string | undefined,
})

// 表格列定义（参考楼控设备列表）
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
  { title: '设备位置', dataIndex: 'spaceName', key: 'spaceName', width: 140 },
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
      categoryIds: '40',
      deviceName: searchForm.deviceName || undefined,
      runState: searchForm.runState || undefined,
    })
    const list = res?.records || []
    tableData.value = list
    tableTotal.value = res?.total || 0
    // 更新统计数据
    statsData.value.count = tableTotal.value
    statsData.value.online = list.filter((item: any) => item.runState === '在线').length
  } catch (error) {
    console.error('加载风机盘管列表失败:', error)
    tableData.value = []
    tableTotal.value = 0
  } finally {
    tableLoading.value = false
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
  .process-layout {
    display: flex;
    gap: 16px;
    min-height: 500px;
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
    overflow: hidden;
    background: linear-gradient(rgba(53, 108, 132, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(53, 108, 132, 0.05) 1px, transparent 1px);
    background-size: 18px 18px;
    background-color: #082332;
    min-height: 500px;
    display: flex;
    flex-direction: column;

    &__toolbar {
      flex-shrink: 0;
      height: 44px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(8, 35, 50, 0.95);
      border-bottom: 1px solid rgba(78, 141, 167, 0.25);
      z-index: 10;
    }

    &__title {
      font-size: 14px;
      font-weight: 600;
      color: #d9eaf3;
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    &__inner {
      flex: 1;
      min-height: 0;
      overflow: auto;
      position: relative;
    }

    :deep(.hide-system-panel) {
      .system-panel {
        display: none;
      }
      .schematic-card {
        right: 16px;
      }
    }
  }
}

.zoom-btn {
  border: 1px solid #3d8197;
  background: rgba(13, 48, 65, 0.8);
  color: #80c7d1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 5px 10px;
  transition: all 0.2s;

  &:hover {
    color: #48dfa8;
    border-color: #48dfa8;
    background: rgba(72, 223, 168, 0.1);
  }
}

.zoom-label {
  font-size: 12px;
  color: #80c7d1;
  min-width: 40px;
  text-align: center;
}
</style>
