<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="送补风机总数"
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
        label="平均送风量"
        :value="statsData.avgSupplyAir"
        unit="m³/h"
        color="purple"
        :icon="AirVolumeIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>🌬️送补风机实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
          <a-select v-model:value="filterStatus" placeholder="全部状态" style="width: 140px" allow-clear>
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="运行">运行</a-select-option>
            <a-select-option value="停止">停止</a-select-option>
            <a-select-option value="故障">故障</a-select-option>
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
          :dataSource="filteredTableData"
          :columns="columns"
          :pagination="{ pageSize: 10 }"
          :scroll="{ x: 1200 }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag v-if="record.status === '运行'" color="green">运行</a-tag>
              <a-tag v-else-if="record.status === '停止'" color="red">停止</a-tag>
              <a-tag v-else color="orange">故障</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">详情</a-button>
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
            <span>送补风系统能耗趋势</span>
          </div>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">各送补风机能耗趋势</div>
          </div>
        </div>
      </a-card>
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">💨</span>
            <span>送补风压差分析</span>
          </div>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">送风与补风压差分析</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 送补风系统 -->
    <div class="card" :class="{ 'process-fullscreen': processFullscreen }">
      <div class="card-header">
        <h3>🏭工艺图监控 - 送补风系统</h3>
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
            <FanBox :values="deviceValues" :system-params="systemParams" :device-name="selectedDeviceName" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { getSpaceTree, getDeviceAttrList } from './index.api'
import FanBox from '../../building-automation/fan-box.vue'

// 自定义 emoji 图标组件
const TotalIcon = () => h('span', { style: 'font-size: 20px;' }, '🌬️')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const EnergyIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const AirVolumeIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')

defineOptions({ name: 'SupplyFanTab' })

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

// 工艺图 - 左侧树 & 右侧FanBox组件
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
})

// 统计数据
const statsData = {
  count: 12,
  online: 11,
  energyConsumption: '328',
  avgSupplyAir: '6,500',
}

// 筛选条件
const filterStatus = ref('')

// 表格列定义
const columns = [
  { title: '机组编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 140 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '送风量(m³/h)', dataIndex: 'supplyAir', key: 'supplyAir', width: 130 },
  { title: '补风量(m³/h)', dataIndex: 'supplyAir2', key: 'supplyAir2', width: 130 },
  { title: '送风压(Pa)', dataIndex: 'supplyPressure', key: 'supplyPressure', width: 120 },
  { title: '补风压(Pa)', dataIndex: 'supplyPressure2', key: 'supplyPressure2', width: 120 },
  { title: '功率(kW)', dataIndex: 'power', key: 'power', width: 100 },
  { title: '今日能耗(kWh)', dataIndex: 'todayEnergy', key: 'todayEnergy', width: 130 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 表格数据
const tableData = [
  { code: 'SF-A-01', location: 'A馆-B1-机房', status: '运行', supplyAir: '8,500', supplyAir2: '6,200', supplyPressure: '320', supplyPressure2: '260', power: '5.5', todayEnergy: '24' },
  { code: 'SF-A-02', location: 'A馆-F1-大厅', status: '运行', supplyAir: '7,200', supplyAir2: '5,000', supplyPressure: '280', supplyPressure2: '220', power: '4.0', todayEnergy: '18' },
  { code: 'SF-B-01', location: 'B馆-B1-机房', status: '运行', supplyAir: '9,000', supplyAir2: '6,500', supplyPressure: '340', supplyPressure2: '280', power: '6.0', todayEnergy: '26' },
  { code: 'SF-B-02', location: 'B馆-F2-办公区', status: '运行', supplyAir: '6,500', supplyAir2: '4,500', supplyPressure: '250', supplyPressure2: '200', power: '3.5', todayEnergy: '15' },
  { code: 'SF-C-01', location: 'C馆-B1-机房', status: '停止', supplyAir: '0', supplyAir2: '0', supplyPressure: '0', supplyPressure2: '0', power: '0', todayEnergy: '0' },
  { code: 'SF-C-02', location: 'C馆-F1-大厅', status: '运行', supplyAir: '7,800', supplyAir2: '5,500', supplyPressure: '300', supplyPressure2: '240', power: '4.5', todayEnergy: '20' },
  { code: 'SF-D-01', location: 'D馆-屋顶', status: '故障', supplyAir: '--', supplyAir2: '--', supplyPressure: '--', supplyPressure2: '--', power: '--', todayEnergy: '--' },
  { code: 'SF-D-02', location: 'D馆-F3-办公区', status: '运行', supplyAir: '6,000', supplyAir2: '4,200', supplyPressure: '240', supplyPressure2: '190', power: '3.2', todayEnergy: '14' },
]

// 筛选逻辑
const filteredTableData = computed(() => {
  return tableData.filter((item) => {
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchStatus
  })
})

const handleSearch = () => {
  console.log('查询:', { status: filterStatus.value })
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
  }
}
</style>
