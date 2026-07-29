<template>
  <div class="p-4">
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新增</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'planNo'">
          <a @click="handleDetail(record)">{{ record.planNo || '--' }}</a>
        </template>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <InspectPlanModal @register="registerAddModal" @success="handleAddSuccess" />
    <InspectPlanDetail @register="registerDetailModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="inspection-inspectPlan" setup>
import { reactive } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { message } from 'ant-design-vue';
import InspectPlanModal from './components/InspectPlanModal.vue';
import InspectPlanDetail from './components/InspectPlanDetail.vue';
import { columns, searchFormSchema } from './InspectPlan.data';
import { getInspectPlanList, deleteInspectPlan } from './InspectPlan.api';

const queryParam = reactive<Recordable>({});

const { tableContext } = useListPage({
  tableProps: {
    title: '巡检计划列表',
    api: getInspectPlanList,
    columns,
    rowKey: 'id',
    canResize: false,
    showTableSetting: true,
    bordered: true,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    showIndexColumn: false,
    actionColumn: {
      width: 130,
      fixed: 'right',
    },
    beforeFetch: (params) => {
      return Object.assign(params, queryParam);
    },
  },
});

const [registerTable, { reload }] = tableContext;

const [registerAddModal, { openModal: openAddModal }] = useModal();
const [registerDetailModal, { openModal: openDetailModal }] = useModal();

function handleCreate() {
  openAddModal(true, {
    isUpdate: false,
  });
}

function handleDetail(record: Recordable) {
  openDetailModal(true, {
    record,
    isUpdate: true,
  });
}

async function handleDelete(record: Recordable) {
  try {
    await deleteInspectPlan({ planId: record.id });
    message.success('删除成功');
    reload();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

function handleAddSuccess(res?: any) {
  reload();
  const record = res?.data || res || {};
  setTimeout(() => {
    openDetailModal(true, {
      record,
      isUpdate: true,
    });
  }, 300);
}

function handleSuccess() {
  reload();
}

function getTableAction(record) {
  return [
    {
      label: '详情',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '删除',
      color: 'error',
      popConfirm: {
        title: '确定删除该执行计划？',
        confirm: handleDelete.bind(null, record),
      },
    },
  ];
}
</script>

<style lang="less" scoped>
:deep(.ant-picker),
:deep(.ant-input-number) {
  width: 100%;
}
</style>
