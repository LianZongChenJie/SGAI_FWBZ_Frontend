<template>
  <div class="p-4">
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新增</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'ruleNo'">
          <a @click="handleDetail(record)">{{ record.ruleNo || '--' }}</a>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                label: '详情',
                onClick: handleDetail.bind(null, record),
              },
              {
                label: '删除',
                color: 'error',
                popConfirm: {
                  title: '删除不可恢复，确认删除该数据？',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <AddModal @register="registerAddModal" @success="handleSuccess" />
    <DetailModal @register="registerDetailModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { message } from 'ant-design-vue';
  import AddModal from './AddModal.vue';
  import DetailModal from './DetailModal.vue';
  import { getPlanRuleList, deletePlanRule } from './PlanRules.api';

  export default defineComponent({
    name: 'PlanRules',
    components: { BasicTable, TableAction, AddModal, DetailModal },
    setup() {
      const [registerAddModal, { openModal: openAddModal }] = useModal();
      const [registerDetailModal, { openModal: openDetailModal }] = useModal();
      const searchInfo = reactive<Recordable>({});

      const [registerTable, { reload, getForm }] = useTable({
        title: '巡检规则列表',
        api: getPlanRuleList,
        rowKey: 'id',
        columns: [
          {
            title: '序号',
            dataIndex: 'index',
            width: 55,
            align: 'center',
            customRender: ({ index }) => index + 1,
          },
          {
            title: '规则编号',
            dataIndex: 'ruleNo',
            key: 'ruleNo',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '规则名称',
            dataIndex: 'name',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '巡检对象',
            dataIndex: 'inspectObject',
            align: 'center',
            width: 100,
            ellipsis: true,
          },
          {
            title: '规则类型',
            dataIndex: 'type',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '建议工作天数',
            dataIndex: 'recommendedDays',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 120,
            fixed: 'right',
          },
        ],
        formConfig: {
          labelWidth: 120,
          schemas: [
            {
              field: 'ruleNo',
              label: '巡检规则编号',
              component: 'Input',
              colProps: { span: 6 },
            },
            {
              field: 'name',
              label: '巡检规则名称',
              component: 'Input',
              colProps: { span: 6 },
            },
            {
              field: 'inspectObject',
              label: '巡检对象',
              component: 'Select',
              componentProps: {
                options: [
                  { label: '消防系统', value: '消防系统' },
                  { label: '消防水系统', value: '消防水系统' },
                  { label: '消防排烟系统', value: '消防排烟系统' },
                ],
              },
              colProps: { span: 6 },
            },
            {
              field: 'type',
              label: '巡检规则类型',
              component: 'Select',
              componentProps: {
                options: [
                  { label: '日巡检', value: '日巡检' },
                  { label: '周巡检', value: '周巡检' },
                  { label: '月巡检', value: '月巡检' },
                  { label: '季巡检', value: '季巡检' },
                  { label: '半年巡检', value: '半年巡检' },
                  { label: '年巡检', value: '年巡检' },
                  { label: '其他', value: '其他' },
                ],
              },
              colProps: { span: 6 },
            },
          ],
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
      });

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
          await deletePlanRule({ ruleId: record.id });
          message.success('删除成功');
          reload();
        } catch (error) {
          message.error('删除失败');
        }
      }

      function handleSuccess() {
        reload();
      }

      return {
        registerTable,
        registerAddModal,
        registerDetailModal,
        handleCreate,
        handleDetail,
        handleDelete,
        handleSuccess,
        searchInfo,
      };
    },
  });
</script>
