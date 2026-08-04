<template>
  <div class="energy-optimization-page">
    <a-tabs v-model:activeKey="currentTab" @change="handleTabChange">
      <a-tab-pane key="overview" tab="概览" />
      <a-tab-pane key="config" tab="配置" />
      <a-tab-pane key="log" tab="日志" />
    </a-tabs>

    <!-- 内容区域 -->
    <div class="tab-content">
      <!-- 概览 -->
      <OverviewTab v-if="currentTab === 'overview'" :data="tabData.overview" />

      <!-- 配置 -->
      <ConfigTab v-else-if="currentTab === 'config'" :data="tabData.config" />

      <!-- 日志 -->
      <LogTab v-else-if="currentTab === 'log'" :data="tabData.log" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import OverviewTab from './elements/overviewTab/index.vue'
import ConfigTab from './elements/configTab/index.vue'
import LogTab from './elements/logTab/index.vue'

// 当前激活的 Tab
const currentTab = ref('overview')

// Tab 数据
const tabData = reactive({
  overview: {},
  config: {},
  log: {}
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
.energy-optimization-page {
  background: #f0f2f5;
  min-height: calc(100vh - 120px);
}

.tab-content {
  margin-top: 20px;
}
</style>
