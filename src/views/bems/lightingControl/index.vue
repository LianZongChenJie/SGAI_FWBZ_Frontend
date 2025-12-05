<template>
  <div class="">
    <a-tabs
      defaultActiveKey="1"
      :centered="true"
    >
      <a-tab-pane
        tab="立即控制"
        key="1"
      >
        <ImmediatelyControl />
      </a-tab-pane>
      <a-tab-pane
        tab="定时控制"
        key="2"
        forceRender
      >
        <TimingControl />
      </a-tab-pane>
      <a-tab-pane
        tab="控制记录"
        key="3"
        forceRender
      >
        <ControlRecord />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import ImmediatelyControl from './components/ImmediatelyControl.vue';
import TimingControl from './components/TimingControl.vue';
import ControlRecord from './components/ControlRecord.vue';



onMounted(async () => {
  // await getOptionsData();
});
</script>

<style scoped lang="less">
.checked-box {
  display: flex;
  justify-content: flex-start;
  align-content: center;
}

.reload-button {
  width: 100%;
  height: 40%;
  display: flex;
  align-items: center;
  justify-items: flex-end;
  border: 1px solid red;
}
</style>