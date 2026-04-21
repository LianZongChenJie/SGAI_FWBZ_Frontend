<template>
  <BasicTable @register="registerTable" />
</template>
<script lang="ts" setup>
  import { useListPage } from '@/hooks/system/useListPage';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { operationLogList } from './task.api';

  const props = defineProps({
    taskId: {
      type: Number,
      default: '',
    },
  });

  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: () => operationLogList(props.taskId),
      pagination: false,
      columns: [
        {
          title: '操作类型',
          dataIndex: 'operationTypeDesc',
          align: 'center',
        },
        {
          title: '操作人',
          dataIndex: 'operator',
          align: 'center',
        },
        {
          title: '操作时间',
          dataIndex: 'createTime',
          align: 'center',
        },
      ],
      rowKey: 'id',
      showIndexColumn: true,
      showTableSetting: false,
      showActionColumn: false,
    },
  });
  const [registerTable] = tableContext;
</script>
