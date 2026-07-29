<template>
  <div>
    <div v-if="canEdit" style="margin-bottom: 16px">
      <a-button type="primary" @click="handleAddSpace" v-if="!isCalendar">添加空间</a-button>
    </div>
    <BasicTable @register="registerTable" :loading="loading">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <SpaceSelectModal @register="registerSpaceModal" @success="handleSpaceSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { useListPage } from '@/hooks/system/useListPage';
  import { TableAction, ActionItem } from '/@/components/Table';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { ref, watch, computed } from 'vue';
  import { getTreeData, addSpaces, removeSpaces, getSpaceTree } from './task.api';
  import SpaceSelectModal from './SpaceSelectModal.vue';
  import { useModal } from '@/components/Modal';
  import { message, Modal } from 'ant-design-vue';

  const loading = ref(false);
  const props = defineProps({
    taskId: {
      type: Number,
      default: '',
    },
    status: {
      type: String,
      default: '',
    },
    // 是否为编辑模式（编辑模式下显示操作列和删除按钮）
    isEditMode: {
      type: Boolean,
      default: false,
    },
    // 是否为日历模式（日历模式下不显示备注列，操作列只显示删除按钮）
    isCalendar: {
      type: Boolean,
      default: false,
    },
  });

  // 是否可以编辑（只有未开始状态可以编辑）
  const canEdit = computed(() => props.status === '未开始');

  const [registerSpaceModal, { openModal: openSpaceModal }] = useModal();

  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: () => getTreeData(props.taskId),
      pagination: false,
      columns: [
        {
          title: '空间名称',
          dataIndex: 'spaceName',
          align: 'center',
        },
        {
          title: '空间全称',
          dataIndex: 'fullName',
          align: 'center',
        },
      ],
      rowKey: 'id',
      rowSelection: { type: 'checkbox' },
      showIndexColumn: true,
      showActionColumn: props.isEditMode && !props.isCalendar,
      actionColumn: props.isEditMode
        ? {
            width: 80,
            title: '操作',
            dataIndex: 'action',
            fixed: 'right',
          }
        : undefined,
      showTableSetting: false,
    },
  });

  const [registerTable, { reload }, { rowSelection }] = tableContext;

  // 计算是否有选中项
  const hasSelected = computed(() => selectedRowKeys.value.length > 0);
  const selectedRowKeys = ref([]);

  // 监听选择变化
  watch(
    () => rowSelection?.selectedRowKeys,
    (keys) => {
      selectedRowKeys.value = keys || [];
    },
    { immediate: true }
  );

  // 添加空间
  const handleAddSpace = () => {
    openSpaceModal(true, props.taskId);
  };

  // 空间添加成功回调
  const handleSpaceSuccess = () => {
    reload();
  };

  // 获取操作按钮
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '删除',
        color: 'error',
        onClick: handleDeleteSpace.bind(null, record),
      },
    ];
  }

  // 删除单个空间
  const handleDeleteSpace = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除空间"${record.spaceName}"吗？`,
      onOk: async () => {
        await removeSpaces({
          taskId: props.taskId,
          spaceIds: [record.spaceId],
        });
        reload();
      },
    });
  };

  // 删除选中的空间
  const handleRemoveSpaces = () => {
    if (selectedRowKeys.value.length === 0) {
      message.warning('请先选择要删除的空间');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.value.length} 个空间吗？`,
      onOk: async () => {
        // 获取选中空间的ID
        const selectedSpaces = rowSelection?.selectedRows || [];
        const spaceIds = selectedSpaces.map((item) => item.spaceId);

        await removeSpaces({
          taskId: props.taskId,
          spaceIds: spaceIds,
        });
        reload();
      },
    });
  };

  watch(
    () => props.taskId,
    (newVal) => {
      if (newVal) {
        reload();
      }
    }
  );
</script>
<style scoped>
  .ant-input-number {
    width: 100%;
  }
</style>
