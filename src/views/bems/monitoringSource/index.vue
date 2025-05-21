<template>
  <div
    class="standardized-management-main-box"
    id="testBox"
  >
    监控源
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const gv = ref();

const dm = ref();

onMounted(() => {
  const ht = (window as any).ht;
  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(document.getElementById('testBox'));
  console.log('gv.value------------->', gv.value);
  
  initEvent();
});

const initEvent = () => {
  gv.value.isMovable =  () => false; // 禁止移动
  gv.value.getSelectWidth =  () => 0; // 禁止选中
  gv.value.deserialize('displays/tukuzujian/baojingxitong.json', function (json, dm, gv, data) {
    gv.fitContent(); // 适配内容
  });
};
</script>

<style scoped lang="less">
.standardized-management-main-box {
  margin: 16px;
  height: 500px;
  border: 1px solid red;
  .full-height-tabs {
    background-color: #fff !important;
  }
}
</style>