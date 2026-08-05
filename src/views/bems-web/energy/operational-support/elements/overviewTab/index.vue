<template>
  <div class="energy-page">
    <div class="stat-cards">
      <StatCard
        label="对接子系统数"
        :value="statData.count"
        color="blue"
        :icon="ClipboardIcon"
      />
      <StatCard
        label="设备在线率"
        :value="statData.online"
        unit="%"
        color="green"
        :icon="CheckSquareIcon"
      />
      <StatCard
        label="远程控制设备"
        :value="statData.remoteControlEquipment"
        color="orange"
        :icon="ThunderIcon"
      />
      <StatCard
        label="今日指令下发"
        :value="statData.todayInstructionWasIssued"
        color="purple"
        :icon="WaterDropIcon"
      />
      
    </div>
    <div class="device-overview">
      <!-- 标题栏 + 筛选 -->
      <div class="overview-header">
        <span class="overview-title">🏗️ 设备总览</span>
        <div class="filter-area">
          <a-tree-select
            v-model:value="filterSystem"
            :tree-data="categoryTreeData"
            :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
            placeholder="设备类型"
            allow-clear
            style="width: 200px"
          />

          <!-- <a-select
            v-model:value="filterVenue"
            placeholder="全部场馆"
            style="width: 140px"
            allow-clear
          >
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option value="A馆">A馆</a-select-option>
            <a-select-option value="B馆">B馆</a-select-option>
            <a-select-option value="C馆">C馆</a-select-option>
          </a-select> -->

          <a-button type="primary" @click="handleSearch">🔍查询</a-button>
        </div>
      </div>

      <!-- 卡片网格 -->
      <div class="device-grid">
        <DeviceCard
          v-for="(item, index) in displayData"
          :key="index"
          :title="item.title"
          :meta="item.meta"
          :icon="item.icon"
          :icon-bg="item.iconBg"
          :icon-color="item.iconColor"
          :stats="item.stats"
          @click="handleCardClick(item)"
        />
      </div>
    </div>
    <div class="control-panel">
      <ControlPanel
        title="🎮 远程控制面板"
        tag="实时控制"
        :lighting-data="lightingData"
        @control="handleControl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onMounted } from 'vue';
import { StatCard, DeviceCard} from '/@/views/bems-web/components';
import ControlPanel from '../controlPanel/index.vue';
import type { LightingControlItem } from '../controlPanel/index.api';
import { getOverviewStatistics, getEquipmentOverview } from './index.api';
import { getCategoryTreeData } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api';


// ===== 筛选条件 =====
const filterSystem = ref<string | undefined>(undefined)
const filterVenue = ref('')

// 设备类别树数据
const categoryTreeData = ref<any[]>([])

const loadCategoryTree = async () => {
  try {
    const res = await getCategoryTreeData()
    // 只保留一级节点，去掉所有二级及以下菜单
    const flatTree = (res || []).map((node: any) => ({ ...node, children: undefined }))
    categoryTreeData.value = flatTree
  } catch (e) {
    console.error('加载设备类别树失败:', e)
  }
}

// 自定义 emoji 图标组件
const ClipboardIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const CheckSquareIcon = () => h('span', { style: 'font-size: 20px;' }, '📶')
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '🎮')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '📤')
const HeatMeterIcon = () => h('span', { style: 'font-size: 20px;' }, '🌡️')
const AirConditionerIcon = () => h('span', { style: 'font-size: 20px;' }, '❄️')
const FreshAirUnitIcon = () => h('span', { style: 'font-size: 20px;' }, '🌀')
const ElectricMeterIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const PressureTransmitterIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const WaterMeterIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')
const SumpPitIcon = () => h('span', { style: 'font-size: 20px;' }, '🕳️')
const FlowSensorIcon = () => h('span', { style: 'font-size: 20px;' }, '📏')
const HeatRecoveryIcon = () => h('span', { style: 'font-size: 20px;' }, '🔄')
const ExhaustFanIcon = () => h('span', { style: 'font-size: 20px;' }, '💨')
const SupplyFanIcon = () => h('span', { style: 'font-size: 20px;' }, '🌬️')
const FanCoilIcon = () => h('span', { style: 'font-size: 20px;' }, '🎛️')
const TerminalElectricIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const TerminalWaterIcon = () => h('span', { style: 'font-size: 20px;' }, '🚰')

// ===== 图标配置 =====
const iconConfig: Record<string, { icon: any; iconBg: string; iconColor: string }> = {
  '热量表': { icon: HeatMeterIcon, iconBg: '#fff2f0', iconColor: '#ff4d4f' },
  '空调机组': { icon: AirConditionerIcon, iconBg: '#e6f4ff', iconColor: '#1677ff' },
  '新风机组': { icon: FreshAirUnitIcon, iconBg: '#f9f0ff', iconColor: '#722ed1' },
  '电表': { icon: ElectricMeterIcon, iconBg: '#fffbe6', iconColor: '#faad14' },
  '压力变送器': { icon: PressureTransmitterIcon, iconBg: '#e6fffb', iconColor: '#13c2c2' },
  '水表': { icon: WaterMeterIcon, iconBg: '#e6f7ff', iconColor: '#0099cc' },
  '集水坑': { icon: SumpPitIcon, iconBg: '#f0f5ff', iconColor: '#2f54eb' },
  '流量传感器': { icon: FlowSensorIcon, iconBg: '#f6ffed', iconColor: '#52c41a' },
  '热回收机组': { icon: HeatRecoveryIcon, iconBg: '#fff7e6', iconColor: '#fa8c16' },
  '排风机': { icon: ExhaustFanIcon, iconBg: '#f5f5f5', iconColor: '#595959' },
  '送风机': { icon: SupplyFanIcon, iconBg: '#e6f7ff', iconColor: '#1890ff' },
  '风机盘管': { icon: FanCoilIcon, iconBg: '#f9f0ff', iconColor: '#9254de' },
  '末端电表': { icon: TerminalElectricIcon, iconBg: '#fff1f0', iconColor: '#cf1322' },
  '末端水表': { icon: TerminalWaterIcon, iconBg: '#e6fffb', iconColor: '#006d75' },
}

// ===== 设备总览数据 =====
const allData = ref<any[]>([])
const equipmentLoading = ref(false)

/** 加载设备总览数据 */
const loadEquipmentOverview = async () => {
  equipmentLoading.value = true
  try {
    const res = await getEquipmentOverview()
    const list = res?.records || res?.data?.records || res?.data || res || []
    const items = Array.isArray(list) ? list : []
    allData.value = items.map((item: any) => {
      const categoryName = item.category?.categoryName || item.title || item.name || ''
      const cfg = iconConfig[categoryName] || { icon: AirConditionerIcon, iconBg: '#e6f4ff', iconColor: '#1677ff' }
      return {
        title: categoryName,
        meta: item.meta || item.system || '',
        icon: cfg.icon,
        iconBg: cfg.iconBg,
        iconColor: cfg.iconColor,
        stats: item.stats || [
          { label: '总数', value: item.count ?? 0 },
          { label: '运行', value: item.online ?? 0 },
          { label: '故障', value: item.offline ?? 0, highlight: (item.offline ?? 0) > 0 },
        ],
        system: item.system || item.meta || '',
        venue: item.venue || '',
      }
    })
  } catch (e) {
    console.error('加载设备总览失败:', e)
  } finally {
    equipmentLoading.value = false
  }
}

const lightingData: LightingControlItem[] = [
  { id: '1', code: 'LT-A-101', location: 'A馆-F1-大厅', status: '开启', brightness: '80%' },
  { id: '2', code: 'LT-A-102', location: 'A馆-F2-展厅', status: '开启', brightness: '100%' }
]

const handleControl = (type: 'ac' | 'lighting', record: any) => {
  console.log(`控制 ${type}:`, record)
  // TODO: 打开控制弹窗或发送控制指令
}

// ===== 筛选逻辑 =====
// 递归查找树节点 title
const findTreeTitle = (tree: any[], key: string | undefined): string => {
  if (!key) return ''
  for (const node of tree) {
    if (node.key === key) return node.title || ''
    if (node.children?.length) {
      const found = findTreeTitle(node.children, key)
      if (found) return found
    }
  }
  return ''
}

const displayData = computed(() => {
  const filterTitle = findTreeTitle(categoryTreeData.value, filterSystem.value)
  return allData.value.filter((item) => {
    const matchSystem = !filterTitle || item.title === filterTitle
    const matchVenue = !filterVenue.value || item.venue === filterVenue.value
    return matchSystem && matchVenue
  })
})

// ===== 事件 =====
const handleSearch = () => {
  loadEquipmentOverview()
}

const handleCardClick = (item: any) => {
  console.log('点击卡片:', item.title)
  // TODO: 跳转到对应的设备详情页
}


// 统计卡片数据
const statData = reactive({
  count: "--",
  online: "--",
  remoteControlEquipment: "--",
  todayInstructionWasIssued: "--",
})

const loadStatistics = async () => {
  try {
    const res = await getOverviewStatistics()
    const data = res?.data || res?.result || res || {}
    statData.count = data.count ?? 0
    statData.online = data.online ?? 0
    statData.remoteControlEquipment = data.remoteControlEquipment ?? 0
    statData.todayInstructionWasIssued = data.todayInstructionWasIssued ?? 0
  } catch (e) {
    console.error('加载概览统计数据失败:', e)
  }
}

onMounted(() => {
  loadStatistics()
  loadCategoryTree()
  loadEquipmentOverview()
})

</script>

<style scoped lang="less">
.energy-page {

  .page-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    color: rgba(0, 0, 0, 0.88);
  }

  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  .device-overview {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .overview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -24px 20px;
    padding: 0 24px 12px;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
    gap: 12px;
  }

  .overview-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
  }

  .filter-area {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .device-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  .device-overview, .control-panel {
    margin-top: 20px;
  }
}
</style>