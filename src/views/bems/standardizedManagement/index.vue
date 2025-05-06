<template>
  <div class="standardized-management-main-box">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs" :destroyInactiveTabPane="true">
      <a-tab-pane key="1" tab="联动控制">
        <linkage-control />
      </a-tab-pane>
      <a-tab-pane key="2" tab="场景控制">
        <standardized-management />
      </a-tab-pane>
      <a-tab-pane key="3" tab="控制记录">
        <ControlRecords />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LinkageControl from './components/LinkageControl.vue'
import StandardizedManagement from './components/StandardizedManagement.vue'
import ControlRecords from './components/ControlRecords.vue'

const activeKey = ref('1');
</script>

<style scoped lang="less">
.standardized-management-main-box {
  margin: 16px;
  .full-height-tabs {
      background-color: #fff !important;
    }
}
  
</style>