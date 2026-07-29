<template>
  <div class="device_index">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs">
      <a-tab-pane key="1" tab="设备类别">
        <DeviceCategory :tree-data="categoryTreeData" :space-tree-data="spaceTreeData" :getTreeData="getTreeData" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="空间位置">
        <DeviceSpace :category-tree-data="categoryTreeData" :space-tree-data="spaceTreeData" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import DeviceSpace from './components/DeviceSpace.vue';
  import DeviceCategory from './components/DeviceCategory.vue';
  import { categoryTree, spaceTree, spaceTree2 } from './Device.api';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const activeKey = ref('1');
  const categoryTreeData: any = ref([]);
  const spaceTreeData = ref([]);

  // 递归获取所有节点的key
  const getAllNodeKeys = (treeData: any[]): string[] => {
    const keys: string[] = [];

    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.key) {
          keys.push(node.key.toString());
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    if (treeData && treeData.length > 0) {
      traverse(treeData);
    }

    return keys;
  };

  // 获取设备类别树数据
  const getCategoryTree = async () => {
    try {
      const res = await categoryTree({});
      // allCategoryKeys.value = res;

      categoryTreeData.value = res;
    } catch (error) {
      console.error('获取设备类别失败:', error);
    }
  };

  // 获取设备位置树数据
  const getSpaceTree = async () => {
    try {
      // const res = await spaceTree({});
      const res = await spaceTree2({
        categoryIds: getAllNodeKeys(categoryTreeData.value).join(','),
        deviceType: 1,
      });
      spaceTreeData.value = res;
    } catch (error) {
      console.error('获取设备位置失败:', error);
    }
  };

  const findTreeNodeById = (tree, id) => {
    // 递归查找函数
    const findNode = (nodes) => {
      for (const node of nodes) {
        // 如果当前节点匹配
        if (node.key === id) {
          return node;
        }

        // 如果有子节点，递归查找
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(tree);
  };

  const getTreeData = async () => {
    await getCategoryTree();
    await getSpaceTree();
  };

  onMounted(async () => {
    await getCategoryTree();
    await getSpaceTree();
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

      .ant-tabs-nav {
        margin-bottom: 0;
      }

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
