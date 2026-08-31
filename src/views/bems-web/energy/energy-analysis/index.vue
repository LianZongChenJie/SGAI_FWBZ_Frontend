<template>
  <div class="energy-analysis-page">
    <a-tabs v-model:activeKey="currentTab" @change="handleTabChange">
      <a-tab-pane key="overview" tab="总览驾驶舱" />
      <a-tab-pane key="forecast" tab="负荷预测与优化决策" />
      <a-tab-pane key="setpoint" tab="设定值下发控制台" />
      <a-tab-pane key="schedule" tab="馆区日程与预排程" />
    </a-tabs>

    <!-- 内容区域 -->
    <div class="tab-content">
      <!-- 总览驾驶舱 -->
      <OverviewTab v-if="currentTab === 'overview'" :data="tabData.overview" />

      <!-- 负荷预测与优化决策 -->
      <ForecastTab v-else-if="currentTab === 'forecast'" :data="tabData.forecast" />

      <!-- 设定值下发控制台 -->
      <SetpointTab v-else-if="currentTab === 'setpoint'" :data="tabData.setpoint" />

      <!-- 馆区日程与预排程 -->
      <ScheduleTab v-else-if="currentTab === 'schedule'" :data="tabData.schedule" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import OverviewTab from './elements/overviewTab/index.vue'
import ForecastTab from './elements/forecastTab/index.vue'
import SetpointTab from './elements/setpointTab/index.vue'
import ScheduleTab from './elements/scheduleTab/index.vue'

// 当前激活的 Tab
const currentTab = ref('overview')

// Tab 数据
const tabData = reactive({
  overview: {},
  forecast: {},
  setpoint: {},
  schedule: {},
})

// Tab 切换事件
const handleTabChange = (key: string) => {
  currentTab.value = key
  // 切换时重新加载数据
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
.energy-analysis-page {
  background: #f0f2f5;
  min-height: calc(100vh - 120px);

  :deep(.ant-tabs-nav-wrap) {
    padding-left: 12px;
  }

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
}

.tab-content {
  margin-top: 20px;
}
</style>
