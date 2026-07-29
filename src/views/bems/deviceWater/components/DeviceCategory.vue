<template>
  <div class="device-space">
    <!-- 左侧树形结构 -->
    <div class="space-tree">
      <a-tree v-model:selectedKeys="selectedKeys" v-model:checkedKeys="checkedKeys" v-model:expandedKeys="expandedKeys"
        :tree-data="treeData" checkable @select="onSelect" @check="onCheck">
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
      <DeviceTable ref="deviceTableRef" :categoryKeys="checkedKeys" :category-tree-data="treeData"
        :space-tree-data="spaceTreeData" @edit="handleEdit" @delete="handleDelete" @detail="handleDetail"
        @add="handleCreate" @refresh="handleRefresh" />
    </div>
  </div>
  <DeviceModal @register="registerModal" @success="handleSuccess" />
  <DetailModal ref="detailModalRef" />
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue';
import DeviceTable from './DeviceTable.vue';
import { useModal } from '@/components/Modal';
import DeviceModal from './DeviceModal.vue';
import DetailModal from './DetailModal.vue';
import { Modal } from 'ant-design-vue';
import { deleteDevice } from '../Device.api';

// 添加 deviceTableRef 定义
const deviceTableRef = ref();
const detailModalRef = ref();

const props = defineProps<{
  treeData: any[]; // categoryTreeData
  spaceTreeData: any[]; // spaceTreeData
}>();

// 监听 treeData 变化，当数据加载后自动勾选所有节点
watch(() => props.treeData, (newTreeData) => {
  if (newTreeData && newTreeData.length > 0) {
    // 等待DOM更新后执行
    nextTick(() => {
      // 方法1：简单获取所有节点key
      const allKeys = getAllNodeKeys(newTreeData);
      checkedKeys.value = allKeys;

      // 也可以同时展开所有节点
      expandedKeys.value = allKeys;

      console.log('自动勾选了', allKeys.length, '个节点');
    });
  }
}, { immediate: true, deep: true });

// 递归获取所有节点的key
const getAllNodeKeys = (treeData: any[]): string[] => {
  const keys: string[] = [];

  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
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

// 新建设备
function handleCreate() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
    categoryTreeData: props.treeData, // 设备类别树
    spaceTreeData: props.spaceTreeData, // 设备位置树
  });
}

// 编辑设备
const handleEdit = (record: any) => {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
    categoryTreeData: props.treeData, // 设备类别树
    spaceTreeData: props.spaceTreeData, // 设备位置树
  });
};

// 表单提交成功后的回调
function handleSuccess() {
  deviceTableRef.value?.reload();
}

// 设备详情
const handleDetail = (record: any) => {
  console.log('设备详情', record);
  detailModalRef.value?.openModal(record.id);
};

const handleDelete = async (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除设备 "${record.deviceName}" 吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteDevice({ id: record.id }, handleSuccess());
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
  });
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
