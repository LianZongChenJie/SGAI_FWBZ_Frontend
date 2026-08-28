<template>
  <div class="operation-page">
    <a-tabs v-model:activeKey="currentTab" @change="handleTabChange">
      <a-tab-pane key="overview" tab="概览" />
      <a-tab-pane key="ac" tab="空调机组" />
      <a-tab-pane key="fresh" tab="新风机组" />
      <a-tab-pane key="supplyFan" tab="排风机" />
      <a-tab-pane key="fanCoil" tab="风机盘管" />
      <a-tab-pane key="heatRecovery" tab="热回收机组" />
      <a-tab-pane key="sumpPit" tab="集水坑" />
      <a-tab-pane key="power" tab="配电系统" />
      <a-tab-pane key="cold" tab="冷源系统" />
      <a-tab-pane key="pv" tab="光伏系统" />
    </a-tabs>

    <!-- 内容区域 -->
    <div class="tab-content">
      <!-- 概览 -->
      <OverviewTab v-if="currentTab === 'overview'" :data="tabData.overview" />

      <!-- 空调机组 -->
      <AcTab v-else-if="currentTab === 'ac'" :data="tabData.ac" />

      <!-- 新风机组 -->
      <FreshTab v-else-if="currentTab === 'fresh'" :data="tabData.fresh" />

      <!-- 送补风机 -->
      <SupplyFanTab v-else-if="currentTab === 'supplyFan'" :data="tabData.supplyFan" />

      <!-- 风机盘管 -->
      <FanCoilTab v-else-if="currentTab === 'fanCoil'" :data="tabData.fanCoil" />

      <!-- 热回收机组 -->
      <HeatRecoveryTab v-else-if="currentTab === 'heatRecovery'" :data="tabData.heatRecovery" />

      <!-- 集水坑 -->
      <SumpPitTab v-else-if="currentTab === 'sumpPit'" :data="tabData.sumpPit" />

      <!-- 配电系统 -->
      <PowerTab v-else-if="currentTab === 'power'" :data="tabData.power" />

      <!-- 冷源系统 -->
      <ColdTab v-else-if="currentTab === 'cold'" :data="tabData.cold" />

      <!-- 光伏系统 -->
      <PvTab v-else-if="currentTab === 'pv'" :data="tabData.pv" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import OverviewTab from './elements/overviewTab/index.vue'
import AcTab from './elements/acTab/index.vue'
import FreshTab from './elements/freshTab/index.vue'
import SupplyFanTab from './elements/supplyFanTab/index.vue'
import FanCoilTab from './elements/fanCoilTab/index.vue'
import HeatRecoveryTab from './elements/heatRecoveryTab/index.vue'
import SumpPitTab from './elements/sumpPitTab/index.vue'
import PowerTab from './elements/powerTab/index.vue'
import ColdTab from './elements/coldTab/index.vue'
import PvTab from './elements/pvTab/index.vue'

// 当前激活的 Tab
const currentTab = ref('overview')

// Tab 数据
const tabData = reactive({
  overview: {},
  ac: {},
  fresh: {},
  acExhaust: {},
  supplyFan: {},
  fanCoil: {},
  heatRecovery: {},
  sumpPit: {},
  power: {},
  cold: {},
  pv: {
    stats: [
      { label: '光伏组串数', value: 12, changeText: '↑ 4 新增', color: 'blue', icon: '☀️' },
      { label: '装机容量', value: '856', changeText: 'kW', color: 'green', icon: '⚡' },
      { label: '今日发电量', value: '3,456', changeText: '↑ 12.3% kWh', color: 'orange', icon: '🔋' },
      { label: '发电效率', value: '18.5%', changeText: '↑ 0.8% 较昨日', color: 'purple', icon: '📈' }
    ],
    tableData: [
      {
        code: 'PV-A-01',
        location: 'A馆屋顶-东',
        status: '发电',
        dcVoltage: '680V',
        dcCurrent: '45A',
        dcPower: '30.6kW',
        acPower: '29.5kW',
        irradiance: '850W/m²',
        temp: '45°C',
        todayEnergy: '156kWh'
      },
      {
        code: 'PV-A-02',
        location: 'A馆屋顶-西',
        status: '发电',
        dcVoltage: '675V',
        dcCurrent: '42A',
        dcPower: '28.4kW',
        acPower: '27.3kW',
        irradiance: '820W/m²',
        temp: '48°C',
        todayEnergy: '142kWh'
      },
      {
        code: 'PV-B-01',
        location: 'B馆屋顶',
        status: '发电',
        dcVoltage: '690V',
        dcCurrent: '48A',
        dcPower: '33.1kW',
        acPower: '31.8kW',
        irradiance: '880W/m²',
        temp: '43°C',
        todayEnergy: '168kWh'
      },
      {
        code: 'PV-C-01',
        location: 'C馆屋顶',
        status: '发电',
        dcVoltage: '685V',
        dcCurrent: '46A',
        dcPower: '31.5kW',
        acPower: '30.2kW',
        irradiance: '860W/m²',
        temp: '46°C',
        todayEnergy: '159kWh'
      },
      {
        code: 'PV-P-01',
        location: '停车场车棚',
        status: '发电',
        dcVoltage: '670V',
        dcCurrent: '40A',
        dcPower: '26.8kW',
        acPower: '25.7kW',
        irradiance: '800W/m²',
        temp: '50°C',
        todayEnergy: '128kWh'
      }
    ]
  }
})

// Tab 切换事件
const handleTabChange = (key: string) => {
  currentTab.value = key
  // 模拟切换时重新加载数据
  loadTabData(key)
}

// 加载 Tab 数据
const loadTabData = async (tabKey: string) => {
  // TODO: 根据 tabKey 调用对应 API
  console.log('加载数据:', tabKey)
}

onMounted(() => {
  loadTabData(currentTab.value)
})
</script>

<style scoped lang="less">
.operation-page {
  background: #f0f2f5;
  min-height: calc(100vh - 120px);
}

.tab-content {
  margin-top: 20px;
}
</style>
