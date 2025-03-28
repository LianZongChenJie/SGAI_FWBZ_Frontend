<template>
  <div class="energy-flow-tree">
    <a-tree
      v-model:selectedKeys="selectKeys"
      :tree-data="treeData"
      show-icon
      :default-expand-all="true"
      :field-names="{ title: 'nodeName', key: 'id' }"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { energyFlowTree } from '../index.api';

  const props = defineProps({
    energyFlowType: {
      type: Object,
      default: () => ({
        type: '',
        name: '',
      }),
    },
  });

  const treeData = ref<any[]>([]);
  const selectKeys = ref([]);

  const findTreeData = async () => {
    if (props.energyFlowType.type != '') {
      treeData.value = await energyFlowTree({ type: props.energyFlowType.type });
    }
  };

  // 监听 energyFlowType 的变化
  watch(
    () => props.energyFlowType.type,
    () => {
      console.log('energyFlowType 变化:', props.energyFlowType);
      findTreeData();
    }
  );
  findMeteringPoint();
</script>
<style lang="less">
  .energy-flow-tree {
    width: 250px;
    padding: 10px;
    border-right: 1px solid #f0f0f0;
    :deep(.action-buttons) {
      width: 100%;
      padding: 8px;
      display: flex;
      justify-content: space-around;
    }
  }
</style>
