<template>
  <div>
    <div v-if="props.status === '未开始'" style="margin-bottom: 16px">
      <a-button type="primary" @click="handleAddDevice" v-if="!props.isCalendar">添加设备</a-button>
    </div>
    <BasicTable @register="registerTable" :loading="loading" :show-action-column="props.status !== '已执行'">
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <execute @register="registerExecute" />
    <DeviceSelectModal @register="registerDeviceModal" @success="handleDeviceSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { useListPage } from '@/hooks/system/useListPage';
  import { TableAction, ActionItem } from '/@/components/Table';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { ref, watch, computed } from 'vue';
  import { deviceList, addDevices, removeDevices } from './task.api';
  import execute from './execute.vue';
  import DeviceSelectModal from './DeviceSelectModal.vue';
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
    // 是否为编辑模式（编辑模式下不显示备注列，操作列只显示删除按钮）
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

  const emit = defineEmits(['refresh']);

  const [registerExecute, { openModal: openExecute }] = useModal();
  const [registerDeviceModal, { openModal: openDeviceModal }] = useModal();

  // 根据编辑模式动态生成列配置
  const columns = computed(() => {
    const baseColumns = [
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        align: 'center',
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        align: 'center',
      },
      {
        title: '设备类别',
        dataIndex: 'deviceName',
        align: 'center',
      },
      {
        title: '空间位置',
        dataIndex: 'deviceName',
        align: 'center',
      },
    ];

    // 非编辑模式下显示备注列
    if (!props.isEditMode) {
      baseColumns.push({
        title: '备注',
        dataIndex: 'remark',
        align: 'center',
      });
    }

    return baseColumns;
  });

  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: () => deviceList(props.taskId),
      pagination: false,
      columns: columns.value,
      actionColumn: {
        width: 80,
        title: '操作',
        dataIndex: 'action',
        fixed: 'right',
      },
      rowKey: 'id',
      rowSelection: { type: 'checkbox' },
      showIndexColumn: true,
      showTableSetting: false,
      showActionColumn: !props.isCalendar,
    },
  });

  const [registerTable, { reload, setProps }, { rowSelection }] = tableContext;

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

  function getTableAction(record): ActionItem[] {
    // 编辑模式下只显示删除按钮
    if (props.isEditMode) {
      return [
        {
          label: '删除',
          color: 'error',
          onClick: handleDeleteDevice.bind(null, record),
        },
      ];
    }

    // 详情模式下显示更新按钮
    return [
      {
        label: '更新',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  // 删除单个设备
  const handleDeleteDevice = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备"${record.deviceName}"吗？`,
      onOk: async () => {
        await removeDevices({
          taskId: props.taskId,
          deviceIds: [record.deviceId],
        });
        reload();
        emit('refresh');
      },
    });
  };

  const handleDetail = (record) => {
    console.log(record);
    openExecute(true, record);
  };

  // 添加设备
  const handleAddDevice = () => {
    openDeviceModal(true, props.taskId);
  };

  // 设备添加成功回调
  const handleDeviceSuccess = () => {
    reload();
    emit('refresh');
  };

  // 删除选中的设备
  const handleRemoveDevices = () => {
    if (selectedRowKeys.value.length === 0) {
      message.warning('请先选择要删除的设备');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.value.length} 个设备吗？`,
      onOk: async () => {
        try {
          // 获取选中设备的ID
          const selectedDevices = rowSelection?.selectedRows || [];
          const deviceIds = selectedDevices.map((item) => item.deviceId);

          await removeDevices({
            taskId: props.taskId,
            deviceIds: deviceIds,
          });
          message.success('删除成功');
          reload();
          emit('refresh');
        } catch (error) {
          message.error('删除失败');
        }
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

  watch(
    () => props.status,
    (newVal) => {
      setProps({ showActionColumn: newVal === '已执行' });
    }
  );
</script>
<style scoped>
  .ant-input-number {
    width: 100%;
  }
</style>
