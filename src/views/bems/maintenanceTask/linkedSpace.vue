<template>
  <BasicTable @register="registerTable" :loading="loading" />
</template>
<script lang="ts" setup>
  import { useListPage } from '@/hooks/system/useListPage';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { ref, onMounted, watch } from 'vue';
  import { getTreeData } from './task.api';
  const loading = ref(false);
  const props = defineProps({
    taskId: {
      type: String,
      default: '',
    },
  });
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: () => getTreeData(props.taskId),
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
      rowSelection: { type: 'checkbox' },
      showIndexColumn: true,
      showActionColumn: false,
      showTableSetting: false,
    },
  });
  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection }] = tableContext;
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
