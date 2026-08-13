<template>
  <div class="energy-metering-page">
    <a-tabs v-model:activeKey="currentTab" @change="handleTabChange">
      <a-tab-pane key="overview" tab="概览" />
      <a-tab-pane key="rules" tab="计量规则" />
      <a-tab-pane key="analysis" tab="计量分析" />
      <a-tab-pane key="report" tab="报表" />
    </a-tabs>

    <!-- 内容区域 -->
    <div class="tab-content">
      <!-- 概览 -->
      <OverviewTab v-if="currentTab === 'overview'" :data="tabData.overview" />

      <!-- 计量规则 -->
      <RulesTab v-else-if="currentTab === 'rules'" :data="tabData.rules" />

      <!-- 计量分析 -->
      <AnalysisTab v-else-if="currentTab === 'analysis'" :data="tabData.analysis" />

      <!-- 报表 -->
      <ReportTab v-else-if="currentTab === 'report'" :data="tabData.report" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import OverviewTab from './elements/overviewTab/index.vue'
import RulesTab from './elements/rulesTab/index.vue'
import AnalysisTab from './elements/analysisTab/index.vue'
import ReportTab from './elements/reportTab/index.vue'

// 当前激活的 Tab
const currentTab = ref('overview')

// Tab 数据
const tabData = reactive({
  overview: {},
  rules: {},
  analysis: {},
  report: {}
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
.energy-metering-page {
  background: #f0f2f5;
  min-height: calc(100vh - 120px);
}

.tab-content {
  margin-top: 20px;
}
</style>
