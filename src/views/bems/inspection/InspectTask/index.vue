<template>
  <div class="p-4">
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新建</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'taskNo'">
          <a @click="handleDetail(record)">{{ record.taskNo || '--' }}</a>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                label: '详情',
                onClick: handleDetail.bind(null, record),
              },
              {
                label: '执行',
                disabled: disableRow(record.stateCode),
                onClick: handleExecute.bind(null, record),
              },
              {
                label: '删除',
                color: 'error',
                popConfirm: {
                  title: '确定取消该执行任务？',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <CreateModal @register="registerCreateModal" @success="handleSuccess" />
    <EditModal @register="registerEditModal" @success="handleSuccess" />
    <DetailModal @register="registerDetailModal" @success="handleSuccess" />
    <ExecuteModal @register="registerExecuteModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { message } from 'ant-design-vue';
  import CreateModal from './CreateModal.vue';
  import EditModal from './EditModal.vue';
  import DetailModal from './DetailModal.vue';
  import ExecuteModal from './ExecuteModal.vue';
  import { getInspectTaskList, deleteInspectTask } from './InspectTask.api';

  export default defineComponent({
    name: 'InspectTask',
    components: { BasicTable, TableAction, CreateModal, EditModal, DetailModal, ExecuteModal },
    setup() {
      const [registerCreateModal, { openModal: openCreateModal }] = useModal();
      const [registerEditModal, { openModal: openEditModal }] = useModal();
      const [registerDetailModal, { openModal: openDetailModal }] = useModal();
      const [registerExecuteModal, { openModal: openExecuteModal }] = useModal();
      const searchInfo = reactive<Recordable>({});

      const [registerTable, { reload }] = useTable({
        title: '巡检任务列表',
        api: getInspectTaskList,
        rowKey: 'id',
        columns: [
          {
            title: '任务编号',
            dataIndex: 'taskNo',
            key: 'taskNo',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '工单名称',
            dataIndex: 'name',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '工单状态',
            dataIndex: 'stateCode',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '执行组别',
            dataIndex: 'groupName',
            align: 'center',
            ellipsis: true,
          },
          {
            title: '开始时间',
            dataIndex: 'startTime',
            align: 'center',
            ellipsis: true,
            customRender: ({ record }) => (record.startTime ? formatTime(record.startTime) : '--'),
          },
          {
            title: '结束时间',
            dataIndex: 'endTime',
            align: 'center',
            ellipsis: true,
            customRender: ({ record }) => (record.endTime ? formatTime(record.endTime) : '--'),
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 150,
            fixed: 'right',
          },
        ],
        formConfig: {
          labelWidth: 120,
          schemas: [
            {
              field: 'search_LIKE_name',
              label: '工单名称',
              component: 'Input',
              colProps: { span: 6 },
            },
            {
              field: 'search_EQ_groupId',
              label: '执行组别',
              component: 'Select',
              // componentProps: {
              //   api: getAllGroups,
              //   labelField: 'name',
              //   valueField: 'id',
              //   params: { search_EQ_type: 'execution' },
              // },
              colProps: { span: 6 },
            },
            {
              field: 'search_EQ_state',
              label: '工作状态',
              component: 'Select',
              componentProps: {
                options: [
                  { label: '待释放', value: '待释放' },
                  { label: '未开始', value: '未开始' },
                  { label: '进行中', value: '进行中' },
                  { label: '已完成', value: '已完成' },
                  { label: '已取消', value: '已取消' },
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
        openCreateModal(true, {
          isUpdate: false,
        });
      }

      function handleDetail(record: Recordable) {
        openDetailModal(true, {
          record,
          isUpdate: true,
        });
      }

      function handleExecute(record: Recordable) {
        openExecuteModal(true, {
          record,
          isUpdate: true,
        });
      }

      function disableRow(state: string) {
        return state === '待释放' || state === '已完成';
      }

      async function handleDelete(record: Recordable) {
        try {
          await deleteInspectTask({ taskId: record.id });
          message.success('删除成功');
          reload();
        } catch (error) {
          message.error('删除失败');
        }
      }

      function handleSuccess() {
        reload();
      }

      function formatTime(time: string) {
        return time ? time.substring(0, 16) : '--';
      }

      return {
        registerTable,
        registerCreateModal,
        registerEditModal,
        registerDetailModal,
        registerExecuteModal,
        handleCreate,
        handleDetail,
        handleExecute,
        handleDelete,
        handleSuccess,
        searchInfo,
        disableRow,
        formatTime,
      };
    },
  });
</script>
