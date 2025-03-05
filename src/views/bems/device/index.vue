<template>
  <div class="device_index">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs">
      <a-tab-pane key="1" tab="设备类别">
        <DeviceCategory :tree-data="categoryTreeData" :space-tree-data="spaceTreeData" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="空间位置">
        <DeviceSpace :category-tree-data="categoryTreeData" :space-tree-data="spaceTreeData" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import DeviceSpace from './components/DeviceSpace.vue';
  import DeviceCategory from './components/DeviceCategory.vue';
  import { categoryTree, spaceTree } from './Device.api';

  const activeKey = ref('1');
  const categoryTreeData = ref([]);
  const spaceTreeData = ref([]);

  // 获取设备类别树数据
  const getCategoryTree = async () => {
    try {
      const res = await categoryTree({});
      categoryTreeData.value = res;
    } catch (error) {
      console.error('获取设备类别失败:', error);
    }
  };

  // 获取设备位置树数据
  const getSpaceTree = async () => {
    try {
      const res = await spaceTree({});
      spaceTreeData.value = res;
    } catch (error) {
      console.error('获取设备位置失败:', error);
    }
  };

  onMounted(() => {
    getCategoryTree();
    getSpaceTree();
  });
</script>

<style lang="less" scoped>
  .device_index {
    border-radius: 4px;
    height: calc(100% - 40px);
    margin: 16px;
    background-color: #fff;

    :deep(.full-height-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .ant-tabs-content {
        flex: 1;
        height: 100%;

        .ant-tabs-tabpane {
          height: 100%;
        }
      }
    }
  }
</style>
