<template>
  <div class="device-space">
    <!-- 左侧树形结构 -->
    <div class="space-tree">
      <a-space class="action-buttons">
        <a-tooltip title="新建设备">
          <a-button :icon="h(PlusCircleOutlined)" @click="handleCreate" />
        </a-tooltip>
        <a-tooltip title="编辑设备">
          <a-button :icon="h(EditOutlined)" @click="handleEdit" />
        </a-tooltip>
        <a-tooltip title="删除设备">
          <a-button :icon="h(DeleteOutlined)" />
        </a-tooltip>
      </a-space>
      <a-tree
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        v-model:expandedKeys="expandedKeys"
        :tree-data="treeData"
        checkable
        @select="onSelect"
        @check="onCheck"
      />
    </div>
    <!-- 右侧表格 -->
    <div class="space-table">
      <DeviceTable
        ref="deviceTableRef"
        :categoryKeys="checkedKeys"
        :category-tree-data="treeData"
        :space-tree-data="spaceTreeData"
        @edit="handleEdit"
        @delete="handleDelete"
        @refresh="handleRefresh"
      />
    </div>
  </div>
  <DeviceModal @register="registerModal" @success="handleSuccess" />
</template>

<script lang="ts" setup>
  import { ref, h } from 'vue';
  import DeviceTable from './DeviceTable.vue';
  import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { useModal } from '@/components/Modal';
  import DeviceModal from './DeviceModal.vue';

  // 添加 deviceTableRef 定义
  const deviceTableRef = ref();

  const props = defineProps<{
    treeData: any[]; // categoryTreeData
    spaceTreeData: any[]; // spaceTreeData
  }>();

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

  const handleDelete = (record: any) => {
    console.log('删除', record);
  };

  const handleRefresh = (params: any) => {
    console.log('刷新表格', params);
    // 这里实现获取表格数据的逻辑
  };
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
      padding: 10px;
    }
  }
</style>
