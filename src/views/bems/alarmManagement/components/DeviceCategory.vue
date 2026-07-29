<template>
  <div class="device-space">
    <!-- 左侧树形结构 -->
    <div class="space-tree">
      <a-tree v-model:selectedKeys="selectedKeys" v-model:checkedKeys="checkedKeys" v-model:expandedKeys="expandedKeys"
        :tree-data="categoryTreeData" checkable @select="onSelect" @check="onCheck">
        <template #title="{ title, key, dataRef }">
          <a-popover>
            <template #content>
              {{ title }}
            </template>
            <span class="truncated-text">
              {{ truncateText(title, 10) }}
            </span>
          </a-popover>
        </template>

      </a-tree>
    </div>
    <!-- 右侧表格 -->
    <div class="space-table">
      <DeviceTable ref="deviceTableRef" :categoryKeys="checkedKeys" :category-tree-data="categoryTreeData"
        :space-tree-data="spaceTreeData" @refresh="handleRefresh" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import DeviceTable from './DeviceTable.vue';
import { useModal } from '@/components/Modal';
import { Modal } from 'ant-design-vue';
import { deleteDevice, categoryTree } from './Device.api';

// 添加 deviceTableRef 定义
const deviceTableRef = ref();
const detailModalRef = ref();

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

const [registerModal, { openModal }] = useModal();

// 树相关数据
const selectedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);

// 树节点选择事件
const onSelect = (selectedKeys: string[], info: any) => {
  console.log('selected', selectedKeys, info);
};

const onCheck = (checkedKeys: string[], info: any) => {
  console.log('checked', checkedKeys, info.checkedNodes);
};


const handleRefresh = (params: any) => {
  console.log('刷新表格', params);
  // 这里实现获取表格数据的逻辑
};

// 截断文本函数
const truncateText = (text, length = 10) => {
  const maxLength = length
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  getCategoryTree()
})
</script>

<style lang="less" scoped>
.device-space {
  display: flex;
  height: 100%;

  .space-tree {
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

  .space-table {
    flex: 1;
  }
}
</style>
