<template>
  <div class="device-tree-page">
    <a-tabs v-model:activeKey="activeTab" type="card">
      <a-tab-pane key="space" tab="空间树">
        <a-spin :spinning="spaceLoading">
          <a-tree
            v-if="spaceTreeData.length > 0"
            :tree-data="spaceTreeData"
            :field-names="{ children: 'children', title: 'title', key: 'key' }"
            :default-expand-all="false"
            show-line
            @select="handleSpaceSelect"
          />
          <a-empty v-else description="暂无空间数据" />
        </a-spin>
      </a-tab-pane>
      <a-tab-pane key="category" tab="分类树">
        <a-spin :spinning="categoryLoading">
          <a-tree
            v-if="categoryTreeData.length > 0"
            :tree-data="categoryTreeData"
            :field-names="{ children: 'children', title: 'title', key: 'key' }"
            :default-expand-all="false"
            show-line
            @select="handleCategorySelect"
          />
          <a-empty v-else description="暂无分类数据" />
        </a-spin>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { spaceTree, categoryTree } from '/@/views/bems-web/alert/alarmManagement/Standardized.api';

const props = defineProps<{
  selectKey?: (key: string, record: any) => void;
}>();

const activeTab = ref('space');
const spaceTreeData = ref<any[]>([]);
const categoryTreeData = ref<any[]>([]);
const spaceLoading = ref(false);
const categoryLoading = ref(false);

// 加载空间树
const loadSpaceTree = async () => {
  spaceLoading.value = true;
  try {
    const res: any = await spaceTree();
    spaceTreeData.value = res?.result || res?.data || res || [];
  } catch (e) {
    console.error('加载空间树失败:', e);
    spaceTreeData.value = [];
  } finally {
    spaceLoading.value = false;
  }
};

// 加载分类树
const loadCategoryTree = async () => {
  categoryLoading.value = true;
  try {
    const res: any = await categoryTree({});
    categoryTreeData.value = res?.result || res?.data || res || [];
  } catch (e) {
    console.error('加载分类树失败:', e);
    categoryTreeData.value = [];
  } finally {
    categoryLoading.value = false;
  }
};

// 空间树节点选中
const handleSpaceSelect = (selectedKeys: string[], e: any) => {
  if (selectedKeys.length > 0 && e?.node) {
    const { key, title } = e.node;
    props.selectKey?.(key, { key, title });
  }
};

// 分类树节点选中
const handleCategorySelect = (selectedKeys: string[], e: any) => {
  if (selectedKeys.length > 0 && e?.node) {
    const { key, title } = e.node;
    props.selectKey?.(key, { key, title });
  }
};

onMounted(() => {
  loadSpaceTree();
  loadCategoryTree();
});
</script>

<style scoped lang="less">
.device-tree-page {
  height: 100%;
  overflow: auto;

  :deep(.ant-tabs-nav-wrap) {
    padding-left: 12px;
  }
}
</style>
