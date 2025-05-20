<template>
  <div class="standardized-management-main-box">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs" :destroyInactiveTabPane="true">
      <a-tab-pane key="1" tab="报警规则">
        <alarm-rules />
      </a-tab-pane>
      <a-tab-pane key="2" tab="报警记录">
        <alarm-records />
      </a-tab-pane>
      <a-tab-pane key="3" tab="报警级别">
        <alarm-leve />
      </a-tab-pane>
      <a-tab-pane key="4" tab="报警类别">
        <alarm-category />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AlarmLeve from './components/AlarmLevel.vue'
import AlarmCategory from './components/AlarmCategory.vue'
import AlarmRules from './components/AlarmRules.vue'
import AlarmRecords from './components/AlarmRecords.vue'

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