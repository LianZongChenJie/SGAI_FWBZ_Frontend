<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="添加空间"
    @ok="handleSubmit"
    @cancel="closeModalHandle"
    :width="600"
    :height="600"
    :z-index="10000"
  >
    <a-directory-tree
      v-model:expandedKeys="expandedKeys"
      v-model:checkedKeys="checkedKeys"
      multiple
      checkable
      :tree-data="treeData"
      :fieldNames="{ children: 'children', title: 'title', key: 'key' }"
    />
  </BasicModal>
</template>
<script lang="ts" setup>
  import type { TreeProps } from 'ant-design-vue';
  import BasicModal from '@/components/Modal/src/BasicModal.vue';
  import { useModalInner } from '@/components/Modal';
  import { ref } from 'vue';
  import { getSpaceTree, addSpaces } from './task.api';

  const emit = defineEmits(['success']);

  const expandedKeys = ref<string[]>([]);
  const checkedKeys = ref<{ checked: string[] }>({ checked: [] });
  const treeData = ref<TreeProps['treeData']>([]);
  const taskId = ref<Number>();

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ loading: true });
    checkedKeys.value.checked = [];
    expandedKeys.value = [];
    treeData.value = [];
    taskId.value = data;
    getTreeDataHandle();
  });

  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      // 提交表单，与维保计划导入保持一致
      await addSpaces({ taskId: taskId.value, spaceIds: checkedKeys.value });
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  async function getTreeDataHandle() {
    const res = await getSpaceTree({ id: taskId.value });
    // 处理数据
    treeData.value = res;
    checkedKeys.value.checked = [];
    expandedKeys.value = [];
    // 获取选中节点及其所有父节点
    const { checkedIds, expandedIds } = findCheckedAndExpanded(treeData.value);
    checkedKeys.value.checked = checkedIds;
    expandedKeys.value = Array.from(new Set([...expandedKeys.value, ...expandedIds]));
    if (res && res.length > 0 && expandedKeys.value.length === 0) {
      // 默认展开所有第一层节点
      res.forEach((node) => {
        expandedKeys.value.push(node.key);
      });
    }
    setModalProps({ loading: false });
  }

  /**
   * 递归找出所有选中节点及其上级节点
   */
  function findCheckedAndExpanded(nodes, parentIds = []) {
    const checkedIds: string[] = [];
    const expandedIds: string[] = [];

    for (const node of nodes) {
      const currentPath = [...parentIds, node.id];

      if (node.checked) {
        checkedIds.push(node.id);
        expandedIds.push(...parentIds); // 展开所有父节点
      }

      if (node.children && node.children.length > 0) {
        const childResult = findCheckedAndExpanded(node.children, currentPath);
        checkedIds.push(...childResult.checkedIds);
        expandedIds.push(...childResult.expandedIds);
      }
    }

    return { checkedIds, expandedIds };
  }

  function closeModalHandle() {
    expandedKeys.value = [];
  }
</script>
