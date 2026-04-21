<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="添加设备" @cancel="cancel" @ok="handleOk" width="800px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :loading="loading" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useListPage } from '@/hooks/system/useListPage';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { ref } from 'vue';
  import { addDevices } from './task.api';
  import { defHttp } from '/@/utils/http/axios';

  const emit = defineEmits(['success']);

  const taskId = ref('');
  const loading = ref(false);
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    taskId.value = data;
    reload();
  });

  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: () => defHttp.get({ url: '/bems/device/list' }),
      columns: [
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
      ],
      formConfig: {
        schemas: [
          {
            label: '设备编号',
            field: 'deviceCode',
            component: 'Input',
          },
          {
            label: '设备名称',
            field: 'deviceName',
            component: 'Input',
          },
        ],
        baseColProps: {
          span: 8,
        },
        labelWidth: 70,
      },
      rowKey: 'id',
      rowSelection: { type: 'checkbox' },
      showIndexColumn: true,
      showActionColumn: false,
      showTableSetting: false,
    },
  });

  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection }] = tableContext;

  const cancel = () => {
    clearSelectedRowKeys();
  };

  const handleOk = () => {
    const selectedRows = rowSelection.selectedRows;
    if (selectedRows.length === 0) {
      return;
    }

    const deviceIds = selectedRows.map((row) => row.id);
    loading.value = true;
    addDevices({
      taskId: taskId.value,
      deviceIds: deviceIds,
    })
      .then(() => {
        closeModal();
        emit('success');
      })
      .finally(() => {
        loading.value = false;
      });
  };
</script>
<style scoped>
  .ant-input-number {
    width: 100%;
  }
</style>
