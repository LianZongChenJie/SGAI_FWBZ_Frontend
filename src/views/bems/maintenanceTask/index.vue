<template>
  <div>
    <BasicTable @register="registerTable">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <Detail @register="registerDetail" />
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { TableAction, ActionItem } from '/@/components/Table';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { getList } from './task.api';
  import { columns } from './task.data';
  import Detail from './detail.vue';
  import { useModal } from '@/components/Modal';
  import moment from 'moment';
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: getList,
      columns: columns,
      showIndexColumn: true,
      formConfig: {
        schemas: [
          {
            label: '年份',
            field: 'year',
            defaultValue: moment().format('YYYY'),
            component: 'DatePicker',
            componentProps: {
              picker: 'year',
              format: 'YYYY',
              valueFormat: 'YYYY',
              placeholder: '请选择年份',
              clearable: false,
            },
          },
          {
            label: '任务名称',
            field: 'taskName',
            component: 'Input',
          },
        ],
      },
    },
  });
  const [registerTable] = tableContext;
  const [registerDetail, { openModal: openDetail }] = useModal();
  const [registerExecute, { openModal: openExecute }] = useModal();
  function getTableAction(record): ActionItem[] {
    const actions = [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
    // 根据任务状态判断是否显示执行按钮
    if (record.status !== '已执行') {
      actions.push({
        label: '执行',
        onClick: handleExecute.bind(null, record),
      });
    }

    return actions;
  }
  const handleDetail = (record) => {
    openDetail(true, record);
  };
  const handleExecute = (record) => {
    openDetail(true, { ...record, isExecute: true });
  };
</script>
