<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="关联空间"
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
  import { getTreeData, saveSpaces } from './Standardized.api';
  const expandedKeys = ref<string[]>([]);
  const checkedKeys = ref<{ checked: string[] }>({ checked: [] });

  const treeData = ref<TreeProps['treeData']>([]);
  const id = ref<Number>();
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ loading: true });
    checkedKeys.value.checked = [];
    expandedKeys.value = [];
    treeData.value = [];
    id.value = data;
    getTreeDataHandle();
  });
  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveSpaces({ planId: id.value, spaceIds: checkedKeys.value });
      //关闭弹窗
      closeModal();
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
  async function getTreeDataHandle() {
    const res = await getTreeData({ id: id.value });
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

  // function getCheckedKeys(val) {
  //   val.forEach((item) => {
  //     if (item.checked) {
  //       checkedKeys.value.push(item.id);
  //       expandedKeys.value.push(item.id);
  //     }
  //     if (item.children && item.children.length > 0) {
  //       getCheckedKeys(item.children);
  //       const hasCheckedChild = item.children.some((child) => child.checked);
  //       if (hasCheckedChild) {
  //         expandedKeys.value.push(item.id);
  //       }
  //     }
  //   });
  //   setModalProps({ loading: false });
  // }
  function closeModalHandle() {
    expandedKeys.value = [];
  }
</script>
