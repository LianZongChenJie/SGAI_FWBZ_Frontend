<template>
  <div class="energy-flow-tree">
    <a-button @click="showAddModal">新增</a-button>
    <a-button @click="showEditModal">编辑</a-button>
    <a-button @click="handleDelete">删除</a-button>
    <a-tree
      v-model:selectedKeys="selectKeys"
      :tree-data="treeData"
      show-icon
      :default-expand-all="true"
      :field-names="{ title: 'nodeName', key: 'id' }"
    />

    <!-- 新增弹窗 -->
    <a-modal v-model:visible="visible" title="新增节点" @ok="handleOk" @cancel="handleCancel">
      <a-form :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="拓扑分类">
          {{ props.energyFlowType.name }}
        </a-form-item>
        <a-form-item label="上级节点">
          <a-tree-select
            v-model:value="formState.parentId"
            :tree-data="treeData"
            placeholder="请选择上级节点"
            :field-names="{ label: 'nodeName', value: 'id' }"
          />
        </a-form-item>
        <a-form-item label="节点名称">
          <a-input v-model:value="formState.nodeName" placeholder="请输入节点名称" />
        </a-form-item>
        <a-form-item label="计量点">
          <a-select v-model:value="formState.meteringPointId" placeholder="请选择计量点" show-search allowClear>
            <a-select-option v-for="item in meteringPoint" :key="item.id" :value="item.id">
              {{ item.pointName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formState.sort" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { energyFlowTree, addEnergyFlow, deleteEnergyFlow, editEnergyFlow, findMeteringPointAll } from '../index.api';
  import { message, Modal } from 'ant-design-vue';

  const props = defineProps({
    energyFlowType: {
      type: Object,
      default: () => ({
        type: '',
        name: '',
      }),
    },
  });
  // 弹窗相关状态
  const visible = ref(false);
  const formState = ref({
    type: '',
    parentId: undefined,
    nodeName: '',
    meteringPointId: undefined,
    sort: 0,
  });
  const treeData = ref<any[]>([]);
  const selectKeys = ref([]);

  const meteringPoint = ref([]);

  const findMeteringPoint = async () => {
    meteringPoint.value = await findMeteringPointAll();
  };

  // 显示弹窗
  const showAddModal = () => {
    showModal();
  };

  // 编辑弹窗
  const showEditModal = () => {
    console.log('selectKeys', selectKeys.value);
    if (selectKeys.value.length === 0) {
      // 弹窗提醒用户未选择节点
      message.warning('请选择要编辑的节点');
      return;
    }
    formState.value = findNodeInTree(treeData.value, selectKeys.value[0]);
    console.log('formState', formState.value);
    showModal();
  };

  const showModal = () => {
    findMeteringPoint();
    visible.value = true;
  };

  const findNodeInTree = (tree: any[], id: string): any => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  // 删除节点
  const handleDelete = () => {
    // 这里添加删除逻辑
    if (selectKeys.value.length === 0) {
      message.warning('请选择要编辑的节点');
    }
    const info = findNodeInTree(treeData.value, selectKeys.value[0]);
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除节点【' + info.nodeName + '】吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        // 这里添加删除逻辑
        await deleteEnergyFlow({ id: selectKeys.value[0] }, findTreeData);
      },
    });
  };

  // 提交表单
  const handleOk = async () => {
    console.log('提交表单:', formState.value);
    const params = {
      ...formState.value,
      type: props.energyFlowType.type,
    };
    console.log('params', params);
    if (params.id) {
      await editEnergyFlow(params);
    } else {
      await addEnergyFlow(params);
    }
    findTreeData();
    handleCancel();
  };

  // 取消表单
  const handleCancel = () => {
    // 重置表单信息
    formState.value = {
      type: '',
      parentId: undefined,
      nodeName: '',
      sort: 0,
    };
    visible.value = false;
  };

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
<style lang="less" scoped>
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
