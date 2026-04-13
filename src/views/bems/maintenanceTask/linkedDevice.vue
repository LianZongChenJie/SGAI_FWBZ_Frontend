<template>
  <BasicTable @register="registerTable" :loading="loading" :show-action-column="props.status === '已执行'">
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <execute @register="registerExecute" />
</template>
<script lang="ts" setup>
  import { useListPage } from '@/hooks/system/useListPage';
  import { TableAction, ActionItem } from '/@/components/Table';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { ref, onMounted, watch } from 'vue';
  import { deviceList } from './task.api';
  import execute from './execute.vue';
  import { useModal } from '@/components/Modal';
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
  });
  const [registerExecute, { openModal: openExecute }] = useModal();
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: () => deviceList(props.taskId),
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
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
        },
      ],
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
    },
  });
  const [registerTable, { reload, setProps }] = tableContext;
  function getTableAction(record): ActionItem[] {
    const actions = [
      {
        label: '更新',
        onClick: handleDetail.bind(null, record),
      },
    ];
    return actions;
  }
  const handleDetail = (record) => {
    console.log(record);
    openExecute(true, record);
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
