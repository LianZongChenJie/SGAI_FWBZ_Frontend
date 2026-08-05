<template>
  <div class="energy-page">
    <div class="stat-cards">
      <StatCard
        label="对接子系统数"
        :value="statData.todayPower"
        change-text="较昨日下降 5.2%"
        trend="down"
        color="blue"
        :icon="ClipboardIcon"
      />
      <StatCard
        label="设备在线率"
        :value="statData.todayWater"
        change-text="较昨日上升 2.1%"
        trend="up"
        color="green"
        :icon="CheckSquareIcon"
      />
      <StatCard
        label="远程控制设备"
        :value="statData.carbonEmission"
        change-text="较昨日下降 3.8%"
        trend="down"
        color="orange"
        :icon="ThunderIcon"
      />
      <StatCard
        label="今日指令下发"
        :value="statData.deviceRate"
        change-text="较昨日上升 1.2%"
        trend="up"
        color="purple"
        :icon="WaterDropIcon"
      />
      
    </div>
    <div class="device-overview">
      <!-- 标题栏 + 筛选 -->
      <div class="overview-header">
        <span class="overview-title">🏗️ 设备总览</span>
        <div class="filter-area">
          <a-select
            v-model:value="filterSystem"
            placeholder="全部系统"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="">全部系统</a-select-option>
            <a-select-option value="楼控系统">楼控系统</a-select-option>
            <a-select-option value="照明系统">照明系统</a-select-option>
            <a-select-option value="低压配电">低压配电</a-select-option>
            <a-select-option value="消防系统">消防系统</a-select-option>
            <a-select-option value="制冷系统">制冷系统</a-select-option>
            <a-select-option value="新能源">新能源</a-select-option>
          </a-select>

          <a-select
            v-model:value="filterVenue"
            placeholder="全部场馆"
            style="width: 140px"
            allow-clear
          >
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option value="A馆">A馆</a-select-option>
            <a-select-option value="B馆">B馆</a-select-option>
            <a-select-option value="C馆">C馆</a-select-option>
          </a-select>

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
        :ac-data="acData"
        :lighting-data="lightingData"
        @control="handleControl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { StatCard, DeviceCard} from '/@/views/bems-web/components';
import ControlPanel from '../controlPanel/index.vue';
import type { AcControlItem, LightingControlItem } from '../controlPanel/index.api';


// ===== 筛选条件 =====
const filterSystem = ref('')
const filterVenue = ref('')

// 自定义 emoji 图标组件
const ClipboardIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const CheckSquareIcon = () => h('span', { style: 'font-size: 20px;' }, '📶')
const ThunderIcon = () => h('span', { style: 'font-size: 20px;' }, '🎮')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '📤')
const AirConditionerIcon = () => h('span', { style: 'font-size: 20px;' }, '🌡️')
const LightingCircuitIcon = () => h('span', { style: 'font-size: 20px;' }, '💡')
const DistributionCabinetIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const WaterPumpIcon = () => h('span', { style: 'font-size: 20px;' }, '🌊')
const FreshAirUnitIcon = () => h('span', { style: 'font-size: 20px;' }, '🌀')
const FireEquipmentIcon = () => h('span', { style: 'font-size: 20px;' }, '🔥')
const ColdSourceUnitIcon = () => h('span', { style: 'font-size: 20px;' }, '❄️')
const PhotovoltaicIcon = () => h('span', { style: 'font-size: 20px;' }, '☀️')

// ===== 原始数据 =====
const allData = [
  {
    title: '空调机组',
    meta: '楼控系统',
    icon: AirConditionerIcon,
    iconBg: '#e6f4ff',
    iconColor: '#1677ff',
    stats: [
      { label: '总数', value: 86 },
      { label: '运行', value: 84 },
      { label: '故障', value: 2, highlight: true }
    ],
    system: '楼控系统',
    venue: 'A馆'
  },
  {
    title: '照明回路',
    meta: '照明系统',
    icon: LightingCircuitIcon,
    iconBg: '#f6ffed',
    iconColor: '#52c41a',
    stats: [
      { label: '总数', value: '2,340' },
      { label: '在线', value: '2,338' },
      { label: '故障', value: 1, highlight: true }
    ],
    system: '照明系统',
    venue: 'B馆'
  },
  {
    title: '配电柜',
    meta: '低压配电',
    icon: DistributionCabinetIcon,
    iconBg: '#fffbe6',
    iconColor: '#faad14',
    stats: [
      { label: '总数', value: 45 },
      { label: '正常', value: 45 },
      { label: '告警', value: 0 }
    ],
    system: '低压配电',
    venue: 'A馆'
  },
  {
    title: '给排水泵',
    meta: '楼控系统',
    icon: WaterPumpIcon,
    iconBg: '#e6fffb',
    iconColor: '#13c2c2',
    stats: [
      { label: '总数', value: 32 },
      { label: '运行', value: 32 },
      { label: '停止', value: 0 }
    ],
    system: '楼控系统',
    venue: 'C馆'
  },
  {
    title: '新风机组',
    meta: '楼控系统',
    icon: FreshAirUnitIcon,
    iconBg: '#f9f0ff',
    iconColor: '#722ed1',
    stats: [
      { label: '总数', value: 24 },
      { label: '运行', value: 24 },
      { label: '故障', value: 0 }
    ],
    system: '楼控系统',
    venue: 'A馆'
  },
  {
    title: '消防设备',
    meta: '消防系统',
    icon: FireEquipmentIcon,
    iconBg: '#fff2f0',
    iconColor: '#ff4d4f',
    stats: [
      { label: '总数', value: 892 },
      { label: '正常', value: 890 },
      { label: '告警', value: 2, highlight: true }
    ],
    system: '消防系统',
    venue: 'B馆'
  },
  {
    title: '冷源机组',
    meta: '制冷系统',
    icon: ColdSourceUnitIcon,
    iconBg: '#e6f7ff',
    iconColor: '#0099cc',
    stats: [
      { label: '总数', value: 8 },
      { label: '运行', value: 7 },
      { label: '待机', value: 1 }
    ],
    system: '制冷系统',
    venue: 'C馆'
  },
  {
    title: '光伏设备',
    meta: '新能源',
    icon: PhotovoltaicIcon,
    iconBg: '#fff7e6',
    iconColor: '#fa8c16',
    stats: [
      { label: '组串', value: 12 },
      { label: 'kW装机', value: 856 },
      { label: 'kW发电', value: 623 }
    ],
    system: '新能源',
    venue: 'C馆'
  }
]

const acData: AcControlItem[] = [
  { id: '1', code: 'AC-A-01', location: 'A馆-F1-大厅', status: '运行', setTemp: '24°C' },
  { id: '2', code: 'AC-A-02', location: 'A馆-F2-展厅', status: '运行', setTemp: '22°C' }
]

const lightingData: LightingControlItem[] = [
  { id: '1', code: 'LT-A-101', location: 'A馆-F1-大厅', status: '开启', brightness: '80%' },
  { id: '2', code: 'LT-A-102', location: 'A馆-F2-展厅', status: '开启', brightness: '100%' }
]

const handleControl = (type: 'ac' | 'lighting', record: any) => {
  console.log(`控制 ${type}:`, record)
  // TODO: 打开控制弹窗或发送控制指令
}

// ===== 筛选逻辑 =====
const displayData = computed(() => {
  return allData.filter((item) => {
    const matchSystem = !filterSystem.value || item.system === filterSystem.value
    const matchVenue = !filterVenue.value || item.venue === filterVenue.value
    return matchSystem && matchVenue
  })
})

// ===== 事件 =====
const handleSearch = () => {
  console.log('筛选条件:', {
    system: filterSystem.value,
    venue: filterVenue.value
  })
}

const handleCardClick = (item: any) => {
  console.log('点击卡片:', item.title)
  // TODO: 跳转到对应的设备详情页
}


console.log(11111111)

const statData = {
  todayPower: '12',
  todayWater: '97.8%',
  carbonEmission: '2,456',
  deviceRate: '1,234',
  alarmTotal: '3 条',
  savings: '¥ 12,580',
}

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
    margin-bottom: 20px;
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