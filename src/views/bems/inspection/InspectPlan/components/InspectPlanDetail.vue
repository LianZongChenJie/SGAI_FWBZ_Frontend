<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="巡检计划详情" :width="1000" :showOkBtn="false">
    <template #footer>
      <a-button
        v-if="!repairForm.stateCode || repairForm.stateCode == '未开始' && !repairForm.isCreateTask && !editStatus"
        type="default"
        @click="enterEditMode"
      >
        编辑
      </a-button>
      <a-button
        :loading="loading"
        v-if="editStatus"
        type="primary"
        @click="saveEditData"
      >
        保存
      </a-button>
      <a-button
        v-if="editStatus"
        @click="exitEditMode"
      >
        取消
      </a-button>
      <a-button :loading="loading" v-if="!editStatus && !repairForm.stateCode || repairForm.stateCode == '未开始' && tableData && tableData.length != 0 && !repairForm.isCreateTask" type="primary" @click="saveBaseData('createTask')">生成巡检任务</a-button>
      <a-button :loading="loading" v-if="!editStatus && !repairForm.stateCode || repairForm.stateCode == '未开始' && taskData && taskData.length != 0 && repairForm.canRelease" @click.once="onReleaseTask" type="primary">释放巡检任务</a-button>
      <a-button :loading="loading" v-if="!editStatus && !repairForm.stateCode || repairForm.stateCode == '未开始' && repairForm.canCancel" @click="onCancelPlan" type="primary">一键取消</a-button>
      <a-button @click="handleExit">关闭</a-button>
    </template>
    <div v-loading="loading">
      <div class="info-title">基本信息</div>
      <Description
        v-if="!editStatus"
        @register="registerBaseDesc"
        :data="baseData"
        :column="2"
        bordered
      />
      <BasicForm
        v-else
        @register="registerBaseEditForm"
        :model="repairForm"
        :labelWidth="120"
        :column="2"
        style="margin-bottom: 20px;"
      />

      <div class="info-title">执行周期</div>
      <Description
        v-if="!editStatus"
        @register="registerCycleDesc"
        :data="cycleData"
        :column="2"
        bordered
      />
      <BasicForm
        v-else
        @register="registerCycleEditForm"
        :model="repairForm"
        :labelWidth="120"
        :column="2"
        style="margin-bottom: 20px;"
      />

      <div class="info-title" style="display: flex; justify-content: space-between; align-items: center;">
        <span>巡检规则</span>
        <a-button
          v-if="!repairForm.isCreateTask"
          type="primary"
          size="small"
          @click="handleOpenRuleModal"
        >
          选择规则
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

  <Modal title="修改日期" v-model:open="dialogVisible" width="30%" @ok="submitForm" @cancel="handelCancel">
    <BasicForm @register="registerTaskForm" />
  </Modal>
</template>

<script lang="ts" setup>
import { ref, nextTick, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { BasicTable, useTable } from '/@/components/Table';
import { Description, useDescription } from '/@/components/Description';
import { Modal, message, Tag, Select, SelectOption } from 'ant-design-vue';
import {
  getInspectPlanDetail,
  createTask,
  release,
  cancel,
  setBindRule,
  getAllRule,
  setTaskDate,
  getAllGroups,
  getSpaceTree,
  updateInspectPlan,
} from '../InspectPlan.api';
import { ProcessingDay, ProcessingEchoDate } from '../config/config';
import { getWeekDay, getDayMonth, getYearDay } from '../InspectPlan.api';
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
const router = useRouter();
// 新增编辑状态相关变量
const editStatus = ref(false); // 编辑状态
const originalForm = ref<Recordable>({}); // 原始数据备份
const groupOptions = ref<Recordable[]>([]); // 组别选项
const regionData = ref<Recordable[]>([]); // 空间树数据

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
    disposable: repairForm.value.disposable ? '周期时间' : '固定时间',
    timeRange: repairForm.value.startTime && repairForm.value.endTime ? repairForm.value.startTime + '~' + repairForm.value.endTime : '--',
  };
  if (!repairForm.value.disposable) {
    data.broad = repairForm.value.broad ? repairForm.value.broad + ' ' + repairForm.value.broadUnit : '--';
    data.frequency = repairForm.value.cycle ? `每 ${repairForm.value.cycle}${repairForm.value.unit || ''}` : '--';
  }
  return data;
});

const [registerBaseDesc] = useDescription({
  schema: [
    { field: 'planNo', label: '巡检计划编号', span: 1 },
    { field: 'name', label: '巡检计划名称', span: 1 },
    { field: 'groupName', label: '执行组别', span: 1 },
    { field: 'spaceName', label: '执行位置', span: 1 },
    { field: 'description', label: '说明', span: 3 },
  ],
  column: 3,
  bordered: true
});

// 基本信息编辑表单
const [registerBaseEditForm] = useForm({
  schemas: [
    { field: 'planNo', label: '巡检计划编号', component: 'Input', disabled: true, colProps: { span: 8 } },
    { field: 'name', label: '巡检计划名称', component: 'Input', required: true, colProps: { span: 8 } },
    {
      field: 'groupId',
      label: '执行组别',
      component: 'Select',
      required: true,
      colProps: { span: 8 },
      componentProps: {
        options: groupOptions,
        fieldNames: { label: 'name', value: 'id' }
      }
    },
    {
      field: 'spaceId',
      label: '执行位置',
      component: 'TreeSelect',
      required: true,
      colProps: { span: 8 },
      componentProps: {
        treeData: regionData,
        fieldNames: { label: 'spaceName', value: 'id', children: 'children' },
        showCheckedStrategy: 'SHOW_PARENT',
        placeholder: '请选择执行位置',
        style: { width: '100%' }
      }
    },
    { field: 'description', label: '说明', component: 'InputTextArea', colProps: { span: 24 } },
  ],
  showActionButtonGroup: false,
  column: 3,
  labelWidth: 120,
});

const [registerCycleDesc] = useDescription({
  schema: [
    { field: 'disposable', label: '执行方式', span: 1 },
    { field: 'timeRange', label: '时间范围', span: 1 },
    {
      field: 'broad',
      label: '宽泛期',
      show: () => !!repairForm.value.disposable,
      span: 1,
    },
    {
      field: 'frequency',
      label: '重复频率',
      span: 3,
      show: () => !!repairForm.value.disposable,
      render: (val) => {
        if (!repairForm.value.cycle) return '--';
        const unit = repairForm.value.unit || '';
        const tags = frequencyTimeList.value.map((tag, index) => {
          const text = repairForm.value.unit === '年' ? tag[0] + tag[1] : tag[0];
          return h(Tag, { key: index, color: 'default', style: { marginRight: '4px', marginBottom: '4px' } }, () => text);
        });
        return h('span', { style: { whiteSpace: 'normal', lineHeight: '24px' } }, [`每 ${repairForm.value.cycle}${unit} 的`, ...tags]);
      },
    },
  ],
  column: 3,
  bordered: true
});

// 执行周期编辑表单
const [registerCycleEditForm] = useForm({
  schemas: [
    {
      field: 'disposable',
      label: '执行方式',
      component: 'RadioGroup',
      required: true,
      colProps: { span: 8 },
      componentProps: {
        options: [
          { label: '固定时间', value: false },
          { label: '周期时间', value: true }
        ]
      }
    },
    {
      field: 'time',
      label: '时间范围',
      component: 'RangePicker',
      required: true,
      colProps: { span: 8 },
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' }
      }
    },
    {
      field: 'broad',
      label: '宽泛期',
      component: 'Input',
      required: true,
      show: () => !!repairForm.value.disposable,
      colProps: { span: 8 },
      componentProps: {
        style: { width: '100px', marginRight: '8px' }
      },
      renderComponentContent: () => {
        return h('Select', {
          value: repairForm.value.broadUnit || '天',
          onChange: (val) => {
            repairForm.value.broadUnit = val;
          },
          style: { width: '80px' }
        }, {
          default: () => [
            h('SelectOption', { value: '时' }, () => '时'),
            h('SelectOption', { value: '天' }, () => '天'),
          ]
        });
      }
    },
    {
      field: 'cycle',
      label: '重复频率',
      component: 'InputNumber',
      required: true,
      show: () => !!repairForm.value.disposable,
      colProps: { span: 8 },
      componentProps: {
        min: 1,
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      field: 'unit',
      label: '单位',
      component: 'Select',
      required: true,
      show: () => !!repairForm.value.disposable,
      colProps: { span: 8 },
      componentProps: {
        options: [
          { label: '天', value: '天' },
          { label: '周', value: '周' },
          { label: '月', value: '月' },
          { label: '年', value: '年' },
        ],
        style: { width: '100%' }
      }
    },
    {
      field: 'specificTime',
      label: '具体时间',
      component: 'Cascader',
      required: true,
      show: () => !!repairForm.value.disposable,
      colProps: { span: 8 },
      componentProps: {
        options: computed(() => getFrequencyTimeOptions()),
        multiple: true,
        separator: '',
        style: { width: '100%' }
      }
    }
  ],
  showActionButtonGroup: false,
  column: 3,
  labelWidth: 120,
});

// 根据单位获取具体时间选项
function getFrequencyTimeOptions() {
  const unit = repairForm.value.unit;
  if (unit === 'day') {
    return getDayMonth(0, 24, 'day');
  } else if (unit === 'week') {
    return getWeekDay();
  } else if (unit === 'month') {
    return getDayMonth(1, 32, 'month');
  } else if (unit === 'year') {
    return getYearDay(1, 13);
  }
  return [];
}

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
    { title: '序号', type: 'index', align: 'center', width: 60 },
    { title: '规则编号', dataIndex: 'ruleNo', align: 'center' },
    { title: '规则名称', dataIndex: 'name', align: 'center' },
    { title: '巡检对象', dataIndex: 'inspectObject', align: 'center' },
    { title: '规则类型', dataIndex: 'ruleType', align: 'center' },
    { title: '建议工作天数', dataIndex: 'recommendedDays', align: 'center' },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 80,
      show: () => editStatus.value,
      customRender: ({ record }) => {
        return h('a', { onClick: () => deleteRule(record) }, '删除');
      }
    }
  ],
  pagination: false,
  bordered: true,
  size: 'small',
});

// 删除规则
function deleteRule(record: Recordable) {
  const index = tableData.value.findIndex(item => item.id === record.id);
  if (index !== -1) {
    tableData.value.splice(index, 1);
  }
}

const [registerTaskTable, { reload: reloadTaskTable }] = useTable({
  dataSource: taskData,
  columns: [
    { title: '序号', type: 'index', align: 'center', width: 60 },
    { title: '工单状态', dataIndex: 'stateCode', align: 'center' },
    { title: '任务编号', dataIndex: 'taskNo', key: 'taskNo', align: 'center' },
    { title: '执行组别', dataIndex: 'groupName', align: 'center' },
    { title: '执行开始时间', dataIndex: 'startTime', align: 'center', customRender: ({ record }) => (record.startTime ? dayjs(record.startTime).format('YYYY-MM-DD HH:mm') : '--') },
    { title: '执行结束时间', dataIndex: 'endTime', align: 'center', customRender: ({ record }) => (record.endTime ? dayjs(record.endTime).format('YYYY-MM-DD HH:mm') : '--') },
    { title: '最后执行时间', dataIndex: 'lastTime', align: 'center', customRender: ({ record }) => (record.lastTime ? dayjs(record.lastTime).format('YYYY-MM-DD HH:mm') : '--') },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 150,
      customRender: ({ record }) => {
        return h('div', {}, [
          h('a', {
            onClick: () => changeDate(record),
            style: { marginRight: '8px', color: record.stateCode === '已取消' ? '#d9d9d9' : undefined, pointerEvents: record.stateCode === '已取消' ? 'none' : undefined }
          }, '变更时间'),
          h('a', { onClick: () => toTaskDetail(record) }, '详情')
        ]);
      }
    }
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
    // 设置默认值
    if (!repairForm.value.broadUnit) {
      repairForm.value.broadUnit = '天';
    }
    if (!repairForm.value.unit) {
      repairForm.value.unit = '天';
    }
    tableData.value = Array.isArray(resultData?.ruleList) ? resultData.ruleList : [];
    taskData.value = Array.isArray(resultData?.taskList) ? resultData.taskList : [];

    if (resultData?.spaceName) {
      spaceNameList.value = resultData.spaceName.split(',').map((item: string) => item.trim());
    } else {
      spaceNameList.value = [];
    }

    if (!!resultData?.disposable && resultData?.specificTime) {
      // 给回显的时间加上对应后缀，适配后端存储格式
      let formattedTime = resultData.specificTime;
      if (resultData.unit === '天') {
        // 天单位：HH:mm格式，取小时部分加"时"
        formattedTime = formattedTime.split(',').map(t => {
          const hour = t.split(':')[0];
          return `${hour}时`;
        }).join(',');
      } else if (resultData.unit === '月') {
        // 月单位：数字后加"日"
        formattedTime = formattedTime.split(',').map(t => `${t}日`).join(',');
      }

      if (resultData.unit === '年') {
        frequencyTimeList.value = ProcessingEchoDate(resultData.specificTime);
      } else {
        frequencyTimeList.value = ProcessingDay(formattedTime);
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

// 进入编辑模式
function enterEditMode() {
  originalForm.value = JSON.parse(JSON.stringify(repairForm.value));
  editStatus.value = true;
  // 加载组别和空间树数据
  loadGroupsAndSpace();

  // 处理specificTime回显，加上后缀匹配级联选择器
  nextTick(() => {
    if (!!repairForm.value.disposable && repairForm.value.specificTime) {
      let editTime = repairForm.value.specificTime.split(',').map(t => {
        if (repairForm.value.unit === '天') {
          // 天单位：HH:mm格式，提取小时加"时"
          const hour = t.split(':')[0];
          return `${hour}时`;
        }
        if (repairForm.value.unit === '月') return `${t}日`;
        if (repairForm.value.unit === '年') {
          const [m, d] = t.split('-');
          return [`${m}月`, `${d}日`];
        }
        return t; // 周单位直接返回汉字
      });
      setFieldsValue({ specificTime: editTime });
    }
  });
}

// 退出编辑模式
function exitEditMode() {
  repairForm.value = JSON.parse(JSON.stringify(originalForm.value));
  editStatus.value = false;
}

// 加载组别和空间树数据
async function loadGroupsAndSpace() {
  try {
    // TODO: 临时假数据，后续接口恢复后替换为真实API调用
    // const [groupsRes, spaceRes] = await Promise.all([
    //   getAllGroups(),
    //   getSpaceTree()
    // ]);
    // groupOptions.value = Array.isArray(groupsRes?.result || groupsRes?.data) ? (groupsRes.result || groupsRes.data) : [];
    // regionData.value = Array.isArray(spaceRes?.result || spaceRes?.data) ? (spaceRes.result || spaceRes.data) : [];

    // 组别假数据
    groupOptions.value = [
      { id: '1', name: '巡检一组' },
      { id: '2', name: '巡检二组' },
      { id: '3', name: '巡检三组' }
    ];

    // 空间树假数据
    regionData.value = [
      {
        id: '1',
        spaceName: '一层',
        children: [
          { id: '1-1', spaceName: '101房间' },
          { id: '1-2', spaceName: '102房间' },
          { id: '1-3', spaceName: '走廊' }
        ]
      },
      {
        id: '2',
        spaceName: '二层',
        children: [
          { id: '2-1', spaceName: '201房间' },
          { id: '2-2', spaceName: '202房间' }
        ]
      }
    ];
  } catch (error) {
    console.error('加载基础数据失败:', error);
    message.error('加载基础数据失败');
  }
}

// 保存编辑数据
async function saveEditData() {
  try {
    loading.value = true;
    // 校验表单
    const [baseValid, cycleValid] = await Promise.all([
      (registerBaseEditForm as any)[1].validate(),
      (registerCycleEditForm as any)[1].validate()
    ]);

    if (!baseValid || !cycleValid) return;

    // 构建提交参数
    const params = {
      id: repairForm.value.id,
      name: repairForm.value.name,
      groupId: repairForm.value.groupId,
      spaceId: repairForm.value.spaceId,
      description: repairForm.value.description,
      disposable: repairForm.value.disposable,
      startTime: repairForm.value.time[0],
      endTime: repairForm.value.time[1],
      cycle: repairForm.value.cycle,
      unit: repairForm.value.unit,
      specificTime: Array.isArray(repairForm.value.specificTime)
        ? repairForm.value.specificTime.map(item => {
            const str = Array.isArray(item) ? item.join('') : String(item);
            const num = str.replace(/[^0-9]/g, ''); // 去掉非数字字符，只保留数字
            // 天单位格式化为HH:mm
            if (repairForm.value.unit === '天') {
              return `${num.padStart(2, '0')}:00`;
            }
            return num;
          }).join(',')
        : (() => {
            const str = String(repairForm.value.specificTime);
            const num = str.replace(/[^0-9]/g, '');
            if (repairForm.value.unit === '天') {
              return num.split(',').map(n => `${n.padStart(2, '0')}:00`).join(',');
            }
            return num;
          })(),
      broad: repairForm.value.broad,
      broadUnit: repairForm.value.broadUnit
    };

    // 提交更新
    await updateInspectPlan(params);

    // 更新规则绑定
    const ruleIds = tableData.value.map(item => item.id);
    if (ruleIds.length > 0) {
      await setBindRule({ ruleIds, planId: repairForm.value.id });
    }

    message.success('保存成功');
    editStatus.value = false;
    // 刷新详情
    await getDetaile(repairForm.value.id);
    emit('success');
  } catch (error) {
    console.error('保存失败:', error);
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
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
    await release({ planId: repairForm.value.id, stateCode: '执行中' });
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
    await cancel({ planId: repairForm.value.id, stateCode: '已取消' });
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
  taskForm.value.date = [data.startTime, data.endTime];
  setTaskFieldsValue({ date: [data.startTime, data.endTime] });
}

function toTaskDetail(data: Recordable) {
  // 替换为实际的任务详情路由
  router.push({
    path: '/inspection/task/detail',
    query: { id: data.id, taskNo: data.taskNo }
  });
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
      startTime: timeArr ? timeArr[0] : '',
      endTime: timeArr ? timeArr[1] : '',
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
