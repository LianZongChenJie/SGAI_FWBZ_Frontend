<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="巡检任务详情" :width="1000" :showOkBtn="false">
    <template #footer>
      <a-button @click="handleExportPdf">导出PDF</a-button>
      <a-button v-if="detailData.stateCode === '待释放'" type="primary" @click="handleReleaseTask">释放巡检任务</a-button>
      <a-button v-else-if="detailData.stateCode === '执行'" type="primary" @click="handleExecute">执行</a-button>
      <a-button @click="handleUpdateDate">变更日期</a-button>
      <a-button @click="handleReassign">重新派单</a-button>
      <a-button @click="handleCancel">取消</a-button>
    </template>
    <div v-loading="loading">
      <Description @register="registerDesc" :data="detailData" :column="2" />

      <div style="margin-top: 16px">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
          <h3 style="margin: 0">巡检规则</h3>
          <a-button v-if="detailData.stateCode === '待释放'" type="primary" size="small" @click="handleOpenRuleModal">
            选择
          </a-button>
        </div>
        <BasicTable @register="registerRuleTable" />
      </div>

      <div style="margin-top: 16px">
        <h3 style="margin-bottom: 8px">巡检作业内容</h3>
        <template v-if="subGroup && typeof subGroup === 'object' && Object.keys(subGroup).length">
          <div v-for="(items, groupKey) in subGroup" :key="groupKey" style="margin-bottom: 12px">
            <a-collapse v-model:activeKey="activeSubNames">
              <a-collapse-panel v-for="(subItems, subKey) in items" :key="subKey" :header="subKey">
                <a-table
                  v-if="subItems && Array.isArray(subItems) && subItems.length"
                  :dataSource="subItems"
                  :columns="contentColumns"
                  :pagination="false"
                  bordered
                  size="small"
                  rowKey="id"
                />
                <a-empty v-else description="暂无数据" />
              </a-collapse-panel>
            </a-collapse>
          </div>
        </template>
        <a-empty v-else description="暂无巡检作业内容" />
      </div>

      <div style="margin-top: 16px">
        <h3 style="margin-bottom: 8px">巡检人</h3>
        <p>{{ detailData.lastPeople || '--' }}</p>
      </div>
    </div>
  </BasicModal>

  <BasicModal
      @register="registerRuleModal"
      title="添加巡检规则"
      :width="900"
      @ok="handleBindRule"
      :closeable="true"
      :maskClosable="true"
    >
      <BasicForm @register="registerSearchForm" style="margin-bottom: 16px" />
      <BasicTable
        @register="registerAllRuleTable"
        :rowSelection="{ type: 'checkbox', selectedRowKeys: selectedRuleKeys, onChange: onSelectChange }"
      />
    </BasicModal>
    
    <ExecuteModal @register="registerExecuteModal" @success="handleSuccess" />
</template>

<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useModal } from '/@/components/Modal';
  import { Description, useDescription } from '/@/components/Description';
  import { BasicTable, useTable } from '/@/components/Table';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import ExecuteModal from './ExecuteModal.vue';
  import { getInspectTaskDetail, getAllRule, bindRule, exportPdf, releaseTask, updateTaskDate, reassignTask, cancelTask } from './InspectTask.api';

  export default defineComponent({
    name: 'DetailModal',
    components: { BasicModal, Description, BasicTable, BasicForm, ExecuteModal },
    setup(_, { emit }) {
      const detailData = ref<Recordable>({});
      const ruleData = ref<Recordable[]>([]);
      const subGroup = ref<Recordable>({});
      const activeSubNames = ref<string[]>([]);
      const loading = ref(false);
      const selectedRuleKeys = ref<string[]>([]);
      const allRuleData = ref<Recordable[]>([]);

      const [registerExecuteModal, { openModal: openExecuteModal }] = useModal();

      const contentColumns = [
        { title: '巡检项', dataIndex: 'name', align: 'center' },
        { title: '巡检内容', dataIndex: 'content', align: 'center' },
        { title: '执行结果', dataIndex: 'answer', align: 'center' },
        { title: '执行时间', dataIndex: 'executeTime', align: 'center' },
      ];

      const [registerModal, { setModalProps }] = useModalInner(async (data) => {
        setModalProps({ confirmLoading: true });
        loading.value = true;
        try {
          await loadDetail(data.record.id);
        } finally {
          loading.value = false;
          setModalProps({ confirmLoading: false });
        }
      });

      const [registerRuleModal, { openModal: openRuleModal, closeModal: closeRuleModal, setModalProps: setRuleModalProps }] = useModal();

      async function loadDetail(taskId: string) {
        try {
          const res = await getInspectTaskDetail({ taskId });
          const resultData = res?.result || res?.data || res || {};
          detailData.value = resultData;
          ruleData.value = Array.isArray(resultData?.ruleList) ? resultData.ruleList : [];
          subGroup.value = resultData?.subGroup || {};

          activeSubNames.value = [];
          if (subGroup.value && typeof subGroup.value === 'object') {
            Object.entries(subGroup.value).forEach(([k, v]: [string, any]) => {
              if (v && typeof v === 'object') {
                Object.keys(v).forEach((kk) => {
                  activeSubNames.value.push(kk);
                });
              }
            });
          }
        } catch (error) {
          console.error('加载详情失败:', error);
          detailData.value = {};
          ruleData.value = [];
          subGroup.value = {};
          activeSubNames.value = [];
        }
      }

      const [registerDesc] = useDescription({
        schema: [
          { field: 'taskNo', label: '工单编号' },
          { field: 'name', label: '巡检任务名称' },
          { field: 'groupName', label: '执行组别' },
          { field: 'spaceName', label: '执行位置' },
          {
            field: 'startTime',
            label: '开始时间',
            customRender: ({ value }) => (value ? formatTime(value) : '--'),
          },
          {
            field: 'endTime',
            label: '结束时间',
            customRender: ({ value }) => (value ? formatTime(value) : '--'),
          },
          { field: 'stateCode', label: '执行状态' },
          { field: 'result', label: '巡检结果' },
          { field: 'description', label: '说明', span: 2 },
          { field: 'summary', label: '总结', span: 2 },
        ],
      });

      const [registerRuleTable] = useTable({
        dataSource: ruleData,
        columns: [
          { title: '任务编号', dataIndex: 'ruleNo', align: 'center' },
          { title: '规则名称', dataIndex: 'name', align: 'center' },
          { title: '巡检对象', dataIndex: 'inspectObject', align: 'center' },
          { title: '规则类型', dataIndex: 'ruleType', align: 'center' },
          { title: '建议工作天数', dataIndex: 'recommendedDays', align: 'center' },
        ],
        pagination: false,
        bordered: true,
        size: 'small',
      });

      const [registerSearchForm] = useForm({
        labelWidth: 0,
        schemas: [
          {
            field: 'keyword',
            label: '',
            component: 'Input',
            colProps: { span: 24 },
            componentProps: {
              placeholder: '请搜索巡检规则名称/巡检编号',
              onChange: (e: any) => handleSearchRule(e.target.value),
            },
          },
        ],
        showActionButtonGroup: false,
        autoSubmitOnEnter: true,
      });

      const [registerAllRuleTable] = useTable({
        dataSource: allRuleData,
        columns: [
          { title: '规则编号', dataIndex: 'ruleNo', align: 'center' },
          { title: '规则名称', dataIndex: 'name', align: 'center' },
          { title: '巡检对象', dataIndex: 'inspectObject', align: 'center' },
          { title: '规则类型', dataIndex: 'ruleType', align: 'center' },
          { title: '建议工作天数', dataIndex: 'recommendedDays', align: 'center' },
          { title: '描述', dataIndex: 'executionTime', align: 'center' },
        ],
        pagination: false,
        bordered: true,
        size: 'small',
        rowKey: 'id',
      });

      async function loadAllRules(searchVal?: string) {
        const params: Recordable = {};
        if (searchVal) {
          params.search_LIKE_ruleNo = searchVal;
          params.search_LIKE_name = searchVal;
        }
        try {
          const res = await getAllRule(params);
          console.log('getAllRule response:', res);
          allRuleData.value = Array.isArray(res?.records) ? res.records : [];
        } catch (error) {
          console.error('加载规则失败:', error);
          allRuleData.value = [];
          message.error('加载巡检规则失败');
        }
      }

      function syncSelectedKeys() {
        if (!ruleData.value || !Array.isArray(ruleData.value)) {
          selectedRuleKeys.value = [];
          return;
        }
        const ruleIds = ruleData.value.map((item: any) => item?.id || '').filter(Boolean);
        selectedRuleKeys.value = Array.isArray(ruleIds) ? [...ruleIds] : [];
      }

      function onSelectChange(keys: string[], records: any[]) {
        selectedRuleKeys.value = Array.isArray(keys) ? keys : [];
      }

      function handleSearchRule(val: string) {
        loadAllRules(val);
      }

      async function handleOpenRuleModal() {
        try {
          selectedRuleKeys.value = [];
          await loadAllRules();
          await nextTick();
          syncSelectedKeys();
          openRuleModal();
        } catch (error) {
          console.error('打开规则选择模态框失败:', error);
          message.error('打开规则选择模态框失败');
        }
      }

      async function handleBindRule() {
        try {
          setRuleModalProps({ confirmLoading: true });
          const ruleIds = selectedRuleKeys.value;
          const taskId = detailData.value.id;
          if (!taskId) {
            message.error('任务ID不存在');
            closeRuleModal();
            return;
          }
          if (ruleIds.length === 0) {
            message.error('请至少选择一条巡检规则');
            setRuleModalProps({ confirmLoading: false });
            return;
          }
          await bindRule({ ruleIds, taskId });
          message.success('绑定规则成功');
          closeRuleModal();
          await loadDetail(taskId);
          emit('success');
        } catch (error) {
          console.error('绑定规则失败:', error);
          message.error('绑定规则失败');
          closeRuleModal();
        } finally {
          setRuleModalProps({ confirmLoading: false });
        }
      }

      function formatTime(time: string) {
        return time ? time.substring(0, 16) : '--';
      }

      async function handleExportPdf() {
        try {
          const taskId = detailData.value.id;
          if (!taskId) {
            message.error('任务ID不存在');
            return;
          }
          const res = await exportPdf({ taskId });
          const blob = new Blob([res], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `巡检任务_${detailData.value.taskNo || detailData.value.name}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('PDF导出成功');
        } catch (error) {
          console.error('导出PDF失败:', error);
          message.error('导出PDF失败');
        }
      }

      async function handleReleaseTask() {
        try {
          const taskId = detailData.value.id;
          if (!taskId) {
            message.error('任务ID不存在');
            return;
          }
          await releaseTask({ taskId });
          message.success('释放巡检任务成功');
          await loadDetail(taskId);
          emit('success');
        } catch (error) {
          console.error('释放巡检任务失败:', error);
          message.error('释放巡检任务失败');
        }
      }

      function handleExecute() {
        openExecuteModal(true, {
          record: detailData.value,
          isUpdate: true,
        });
      }

      async function handleUpdateDate() {
        try {
          const taskId = detailData.value.id;
          if (!taskId) {
            message.error('任务ID不存在');
            return;
          }
          // 这里可以添加日期选择对话框
          message.info('变更日期功能待实现');
        } catch (error) {
          console.error('变更日期失败:', error);
          message.error('变更日期失败');
        }
      }

      async function handleReassign() {
        try {
          const taskId = detailData.value.id;
          if (!taskId) {
            message.error('任务ID不存在');
            return;
          }
          // 这里可以添加重新派单对话框
          message.info('重新派单功能待实现');
        } catch (error) {
          console.error('重新派单失败:', error);
          message.error('重新派单失败');
        }
      }

      async function handleCancel() {
        try {
          const taskId = detailData.value.id;
          if (!taskId) {
            message.error('任务ID不存在');
            return;
          }
          await cancelTask({ taskId });
          message.success('取消任务成功');
          await loadDetail(taskId);
          emit('success');
        } catch (error) {
          console.error('取消任务失败:', error);
          message.error('取消任务失败');
        }
      }

      async function handleSuccess() {
        const taskId = detailData.value.id;
        if (taskId) {
          await loadDetail(taskId);
          emit('success');
        }
      }

      return {
        registerModal,
        registerDesc,
        registerRuleTable,
        registerRuleModal,
        registerSearchForm,
        registerAllRuleTable,
        registerExecuteModal,
        detailData,
        subGroup,
        contentColumns,
        activeSubNames,
        loading,
        selectedRuleKeys,
        handleOpenRuleModal,
        handleBindRule,
        onSelectChange,
        handleExportPdf,
        handleReleaseTask,
        handleExecute,
        handleUpdateDate,
        handleReassign,
        handleCancel,
        handleSuccess,
        formatTime,
      };
    },
  });
</script>
