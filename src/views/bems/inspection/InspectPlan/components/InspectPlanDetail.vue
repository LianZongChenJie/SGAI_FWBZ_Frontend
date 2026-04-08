<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="巡检计划详情" :width="1000" :showOkBtn="false">
    <template #footer>
      <a-button
        :loading="loading"
        v-if="repairForm.state == '未开始' && tableData && tableData.length != 0 && !repairForm.isCreateTask"
        type="primary"
        @click="saveBaseData('createTask')"
        >生成巡检任务</a-button
      >
      <a-button
        :loading="loading"
        v-if="repairForm.state == '未开始' && taskData && taskData.length != 0 && repairForm.canRelease"
        @click.once="onReleaseTask"
        type="primary"
        >释放巡检任务</a-button
      >
      <a-button :loading="loading" v-if="repairForm.state == '未开始' && repairForm.canCancel" @click="onCancelPlan" type="primary"
        >一键取消</a-button
      >
      <a-button @click="handleExit">关闭</a-button>
    </template>
    <div v-loading="loading">
      <div class="info-title">基本信息</div>
      <Description @register="registerBaseDesc" :data="baseData" :column="2" bordered />

      <div class="info-title">执行周期</div>
      <Description @register="registerCycleDesc" :data="cycleData" :column="2" bordered />

      <div class="info-title" style="display: flex; justify-content: space-between; align-items: center">
        <span>巡检规则</span>
        <a-button v-if="!repairForm.isCreateTask && (!tableData || tableData.length === 0)" type="primary" size="small" @click="handleOpenRuleModal">
          选择
        </a-button>
      </div>
      <BasicTable @register="registerRuleTable" />

      <div style="margin-top: 16px" v-if="repairForm.isCreateTask">
        <h3 style="margin-bottom: 8px">巡检任务</h3>
        <BasicTable @register="registerTaskTable">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'taskNo'">
              <a @click="toTaskDetail(record)">{{ record.taskNo || '--' }}</a>
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
  </BasicModal>

  <BasicModal @register="registerRuleModal" title="添加巡检规则" :width="900" @ok="handleBindRule" :closeable="true" :maskClosable="true">
    <BasicForm @register="registerSearchForm" style="margin-bottom: 16px" />
    <BasicTable @register="registerAllRuleTable" :rowSelection="{ type: 'checkbox', selectedRowKeys: selectedRuleKeys, onChange: onSelectChange }" />
  </BasicModal>

  <Modal title="修改日期" v-model:open="dialogVisible" width="30%" @ok="submitForm" @cancel="handelCancel">
    <BasicForm @register="registerTaskForm" />
  </Modal>
</template>

<script lang="ts" setup>
  import { ref, nextTick, computed, h } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicTable, useTable } from '/@/components/Table';
  import { Description, useDescription } from '/@/components/Description';
  import { Modal, message, Tag } from 'ant-design-vue';
  import { getInspectPlanDetail, createTask, release, cancel, setBindRule, getAllRule, setTaskDate } from '../InspectPlan.api';
  import { ProcessingDay, ProcessingEchoDate } from '../config/config';
  import dayjs from 'dayjs';

  const emit = defineEmits(['register', 'success']);

  const repairForm = ref<Recordable>({});
  const tableData = ref<Recordable[]>([]);
  const taskData = ref<Recordable[]>([]);
  const spaceNameList = ref<string[]>([]);
  const frequencyTimeList = ref<string[][]>([]);
  const loading = ref(false);
  const selectedRuleKeys = ref<string[]>([]);
  const allRuleData = ref<Recordable[]>([]);
  const dialogVisible = ref(false);
  const taskForm = ref<any>({ date: [] });

  const [registerRuleModal, { openModal: openRuleModal, closeModal: closeRuleModal, setModalProps: setRuleModalProps }] = useModal();

  const baseData = computed(() => ({
    planNo: repairForm.value.planNo || '--',
    name: repairForm.value.name || '--',
    groupName: repairForm.value.groupName || '--',
    spaceName: repairForm.value.spaceName || '--',
    description: repairForm.value.description || '--',
  }));

  const cycleData = computed(() => {
    const data: Record<string, any> = {
      disposable: repairForm.value.disposable ? '固定时间' : '周期时间',
      timeRange: repairForm.value.start && repairForm.value.end ? repairForm.value.start + '~' + repairForm.value.end : '--',
    };
    if (!repairForm.value.disposable) {
      data.broad = repairForm.value.broad ? repairForm.value.broad + ' ' + repairForm.value.broadUnit : '--';
      data.frequency = repairForm.value.cycle ? `每 ${repairForm.value.cycle}${repairForm.value.unit || ''}` : '--';
    }
    return data;
  });

  const [registerBaseDesc] = useDescription({
    schema: [
      { field: 'planNo', label: '巡检计划编号' },
      { field: 'name', label: '巡检计划名称' },
      { field: 'groupName', label: '执行组别' },
      { field: 'spaceName', label: '执行位置' },
      { field: 'description', label: '说明', span: 2 },
    ],
  });

  const [registerCycleDesc] = useDescription({
    schema: [
      { field: 'disposable', label: '执行方式' },
      { field: 'timeRange', label: '时间范围' },
      {
        field: 'broad',
        label: '宽泛期',
        show: () => !repairForm.value.disposable,
      },
      {
        field: 'frequency',
        label: '重复频率',
        span: 2,
        show: () => !repairForm.value.disposable,
        render: (val) => {
          if (!repairForm.value.cycle) return '--';
          const unit = repairForm.value.unit || '';
          const tags = frequencyTimeList.value.map((tag, index) => {
            const text = repairForm.value.unit === '年' ? tag[0] + tag[1] : tag[0];
            return h(Tag, { key: index, color: 'default', style: { marginBottom: '4px' } }, () => text);
          });
          return h('span', {}, [`每 ${repairForm.value.cycle}${unit} 的`, ...tags]);
        },
      },
    ],
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: true });
    loading.value = true;
    try {
      await getDetaile(data.record.id);
    } finally {
      loading.value = false;
      setModalProps({ confirmLoading: false });
    }
  });

  const [registerRuleTable, { reload: reloadRuleTable }] = useTable({
    dataSource: tableData,
    columns: [
      { title: '规则编号', dataIndex: 'ruleNo', align: 'center' },
      { title: '规则名称', dataIndex: 'name', align: 'center' },
      { title: '巡检对象', dataIndex: 'inspectObject', align: 'center' },
      { title: '规则类型', dataIndex: 'type', align: 'center' },
      { title: '建议工作天数', dataIndex: 'recommendedDays', align: 'center' },
    ],
    pagination: false,
    bordered: true,
    size: 'small',
  });

  const [registerTaskTable, { reload: reloadTaskTable }] = useTable({
    dataSource: taskData,
    columns: [
      { title: '工单状态', dataIndex: 'state', align: 'center' },
      { title: '任务编号', dataIndex: 'taskNo', key: 'taskNo', align: 'center' },
      { title: '执行组别', dataIndex: 'groupName', align: 'center' },
      {
        title: '执行开始时间',
        dataIndex: 'start',
        align: 'center',
        customRender: ({ record }) => (record.start ? dayjs(record.start).format('YYYY-MM-DD HH:mm') : '--'),
      },
      {
        title: '执行结束时间',
        dataIndex: 'end',
        align: 'center',
        customRender: ({ record }) => (record.end ? dayjs(record.end).format('YYYY-MM-DD HH:mm') : '--'),
      },
      {
        title: '最后执行时间',
        dataIndex: 'lastTime',
        align: 'center',
        customRender: ({ record }) => (record.lastTime ? dayjs(record.lastTime).format('YYYY-MM-DD HH:mm') : '--'),
      },
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
      { title: '规则类型', dataIndex: 'type', align: 'center' },
      { title: '建议工作天数', dataIndex: 'recommendedDays', align: 'center' },
      { title: '描述', dataIndex: 'executionTime', align: 'center' },
    ],
    pagination: false,
    bordered: true,
    size: 'small',
    rowKey: 'id',
  });

  const [registerTaskForm, { setFieldsValue: setTaskFieldsValue, validate: validateTaskForm }] = useForm({
    labelWidth: 120,
    schemas: [
      {
        field: 'date',
        label: '计划日期',
        component: 'RangePicker',
        required: true,
        componentProps: {
          format: 'YYYY-MM-DD HH:mm',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          showTime: true,
          rangeSeparator: '至',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
        },
      },
    ],
    showActionButtonGroup: false,
  });

  async function getDetaile(planId) {
    try {
      const res = await getInspectPlanDetail({ planId });
      const resultData = res?.result || res?.data || res || {};
      repairForm.value = resultData;
      tableData.value = Array.isArray(resultData?.ruleList) ? resultData.ruleList : [];
      taskData.value = Array.isArray(resultData?.taskList) ? resultData.taskList : [];

      if (resultData?.spaceName) {
        spaceNameList.value = resultData.spaceName.split(',').map((item: string) => item.trim());
      } else {
        spaceNameList.value = [];
      }

      if (!resultData?.disposable && resultData?.specificTime) {
        if (resultData.unit === '年') {
          frequencyTimeList.value = ProcessingEchoDate(resultData.specificTime);
        } else {
          frequencyTimeList.value = ProcessingDay(resultData.specificTime);
        }
      } else {
        frequencyTimeList.value = [];
      }

      nextTick(() => {
        reloadRuleTable();
        reloadTaskTable();
      });
    } catch (error) {
      console.error('获取详情失败:', error);
    }
  }

  function handleExit() {
    closeModal();
    emit('success');
  }

  async function loadAllRules(searchVal?: string) {
    const params: Recordable = {};
    if (searchVal) {
      params.search_LIKE_ruleNo = searchVal;
      params.search_LIKE_name = searchVal;
    }
    try {
      const res = await getAllRule(params);
      allRuleData.value = Array.isArray(res?.records) ? res.records : [];
    } catch (error) {
      console.error('加载规则失败:', error);
      allRuleData.value = [];
      message.error('加载巡检规则失败');
    }
  }

  function syncSelectedKeys() {
    if (!tableData.value || !Array.isArray(tableData.value)) {
      selectedRuleKeys.value = [];
      return;
    }
    const ruleIds = tableData.value.map((item: any) => item?.id || '').filter(Boolean);
    selectedRuleKeys.value = Array.isArray(ruleIds) ? [...ruleIds] : [];
  }

  function onSelectChange(keys: string[]) {
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
      const planId = repairForm.value.id;
      if (!planId) {
        message.error('计划ID不存在');
        closeRuleModal();
        return;
      }
      if (ruleIds.length === 0) {
        message.error('请至少选择一条巡检规则');
        setRuleModalProps({ confirmLoading: false });
        return;
      }
      await setBindRule({ ruleIds, planId });
      message.success('绑定规则成功');
      closeRuleModal();
      await getDetaile(planId);
      emit('success');
    } catch (error) {
      console.error('绑定规则失败:', error);
      message.error('绑定规则失败');
      closeRuleModal();
    } finally {
      setRuleModalProps({ confirmLoading: false });
    }
  }

  async function saveBaseData(type) {
    if (type === 'createTask') {
      if (!tableData.value || tableData.value.length === 0) {
        message.error('操作失败，请添加巡检规则后重试');
        return;
      }
      Modal.confirm({
        title: '确定生成巡检任务吗，是否确定生成？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          try {
            loading.value = true;
            await createTask({ planId: repairForm.value.id });
            message.success('操作成功！');
            await getDetaile(repairForm.value.id);
            emit('success');
          } catch (error) {
            console.error('生成巡检任务失败:', error);
            message.error('操作失败');
          } finally {
            loading.value = false;
          }
        },
      });
    }
  }

  async function onReleaseTask() {
    try {
      loading.value = true;
      await release({ planId: repairForm.value.id });
      message.success('操作成功！');
      await getDetaile(repairForm.value.id);
      emit('success');
    } catch (error) {
      message.error('操作失败');
    } finally {
      loading.value = false;
    }
  }

  async function onCancelPlan() {
    try {
      loading.value = true;
      await cancel({ planId: repairForm.value.id });
      message.success('操作成功！');
      await getDetaile(repairForm.value.id);
      emit('success');
    } catch (error) {
      message.error('操作失败');
    } finally {
      loading.value = false;
    }
  }

  function changeDate(data) {
    dialogVisible.value = true;
    taskForm.value.id = data.id;
    taskForm.value.date = [data.start, data.end];
    setTaskFieldsValue({ date: [data.start, data.end] });
  }

  function toTaskDetail(data) {
    console.log('跳转到任务详情页面', data);
  }

  function handelCancel() {
    dialogVisible.value = false;
  }

  async function submitForm() {
    try {
      const values = await validateTaskForm();
      const timeArr = typeof values.date === 'string' ? values.date.split(',') : values.date;
      const params = {
        id: taskForm.value.id,
        start: timeArr ? timeArr[0] : '',
        end: timeArr ? timeArr[1] : '',
      };
      await setTaskDate(params);
      message.success('操作成功！');
      dialogVisible.value = false;
      await getDetaile(repairForm.value.id);
    } catch (error) {
      message.error('操作失败');
    }
  }
</script>

<style lang="less" scoped>
  .info-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    margin-top: 20px;
    color: #333;
  }
</style>
