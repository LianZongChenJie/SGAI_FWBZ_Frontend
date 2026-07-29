<template>
  <a-modal title="视频监控" :visible="visible" @ok="visible = false" @cancel="visible = false" width="80vw">
    <!-- <iframe :src="'http://10.168.47.23:4000/index.htmL?id=' + singleMonitorId" frameborder="0"
      style="width:100%; height:100%" allow="autoplay; fullscreen; camera; microphone"></iframe> -->
      <iframe :src="'http://10.168.47.23:4000/index.html?id=' + singleMonitorId" frameborder="0"
      style="width: 100%; height: 70vh" allow="autoplay; fullscreen; camera; microphone"></iframe>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref<boolean>(false);
const singleMonitorId = ref<string>('0096142642943133010293b98d3214a64af5b516d49cfbb97160');

const showModal = (id) => {
  singleMonitorId.value = id
  visible.value = true
}

defineExpose({
  showModal
})

</script>

<style lang="less" scoped></style>