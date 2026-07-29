<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="关联设备" @cancel="cancel" @ok="handleOk" width="800px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :loading="loading" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useListPage } from '@/hooks/system/useListPage';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { ref } from 'vue';
  import { deviceList, saveDevices } from './Standardized.api';

  const planId = ref('');
  const loading = ref(false);
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log(data);
    planId.value = data;
    reload();
  });
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: deviceList,
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
    // 清空选中项
    clearSelectedRowKeys();
  };
  const handleOk = () => {
    const selectedRowKeys = rowSelection.selectedRowKeys;
    loading.value = true;
    saveDevices({
      planId: planId.value,
      deviceIds: selectedRowKeys,
    })
      .then((res) => {
        console.log(res, res == '设备关联成功！');
        if (res == '设备关联成功！') {
          closeModal();
          loading.value = false;
        }
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
