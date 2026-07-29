<template>
  <div class="data-model-main-box">
    <div class="model-box">
      <DeviceModelTable :getTargetModel="getTargetModel" />
    </div>
    <div class="attribute-box">
      <DeviceModelTableAttribute ref="attributeRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import DeviceModelTable from './components/DeviceModelTable.vue';
  import DeviceModelTableAttribute from './components/DeviceModelTableAttribute.vue';
  import { ref } from 'vue';

  const attributeRef = ref();

  // 设置目标模型
  const getTargetModel = (target) => {
    attributeRef.value.setTargetModel(target);
  };
</script>

<style scoped lang="less">
  .data-model-main-box {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    height: 100%;
    background-color: #f5f2f2;
    .model-box,
    .attribute-box {
      height: 98%;
      border-radius: 10px;
      background-color: #fff;
    }
    .model-box {
      width: 56%;
    }
    .attribute-box {
      width: 42%;
    }
  }
</style>
