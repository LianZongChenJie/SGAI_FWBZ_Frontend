<template>
  <div class="security-page">
    <!-- <a-tabs v-model:activeKey="currentTab" @change="handleTabChange">
      <a-tab-pane key="security" tab="安防" />
      <a-tab-pane key="accessControl" tab="门禁" />
    </a-tabs> -->

    <!-- 内容区域 -->
    <!-- <div class="tab-content"> -->
      <!-- 安防 -->
      <SecurityTab v-if="currentTab === 'security'" />

      <!-- 门禁 -->
      <!-- <AccessControlTab v-else-if="currentTab === 'accessControl'" /> -->
    <!-- </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SecurityTab from './elements/securityTab/index.vue'
import AccessControlTab from './elements/accessControlTab/index.vue'

defineOptions({ name: 'SecurityManagementPage' })

// 当前激活的 Tab
const currentTab = ref('security')

// Tab 切换事件
const handleTabChange = (key: string) => {
  currentTab.value = key
}
</script>

<style scoped lang="less">
.security-page {
  background: #f0f2f5;
  min-height: calc(100vh - 120px);
}

</style>
