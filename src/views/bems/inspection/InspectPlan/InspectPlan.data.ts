import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 55,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  {
    title: '计划编号',
    dataIndex: 'planNo',
    key: 'planNo',
    align: 'center',
    width: 170,
    ellipsis: true,
  },
  {
    title: '计划名称',
    dataIndex: 'name',
    align: 'center',
    width: 80,
    ellipsis: true,
  },
  {
    title: '有效开始时间',
    dataIndex: 'startTime',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.startTime || '--',
  },
  {
    title: '有效结束时间',
    dataIndex: 'endTime',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.endTime || '--',
  },
  {
    title: '执行组别',
    dataIndex: 'groupName',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.groupName || '--',
  },
  {
    title: '状态',
    dataIndex: 'stateCode',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.stateCode || '--',
  },
  {
    title: '创建人',
    dataIndex: 'creatorName',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.creatorName || '--',
  },
  {
    title: '执行位置',
    dataIndex: 'spaceName',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.spaceName || '--',
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.createdTime || '--',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'planNo',
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
    field: 'search_EQ_stateCode',
    label: '状态',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      options: [
        { label: '未开始', value: '未开始' },
        { label: '执行中', value: '执行中' },
        { label: '已完成', value: '已完成' },
        { label: '已取消', value: '已取消' },
      ],
    },
  },
  {
    field: 'spaceId',
    label: '执行位置',
    component: 'TreeSelect',
    colProps: { span: 6 },
  },
  {
    field: 'search_EQ_startTime',
    label: '开始时间',
    component: 'DatePicker',
    colProps: { span: 6 },
  },
];

export const addFormSchema: FormSchema[] = [
  {
    field: 'planNo',
    label: '巡检计划编号',
    component: 'Input',
    required: true,
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'name',
    label: '巡检计划名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'groupId',
    label: '执行组别',
    component: 'Select',
    required: true,
  },
  {
    field: 'spaceId',
    label: '执行位置',
    component: 'TreeSelect',
    required: true,
  },
  {
    field: 'description',
    label: '说明（选填）',
    component: 'InputTextArea',
  },
  {
    field: 'disposable',
    label: '执行方式',
    component: 'Select',
    required: true,
    defaultValue: '固定时间',
    colProps: { span: 10 },
    componentProps: {
      options: [
        { label: '固定时间', value: '固定时间' },
        { label: '周期时间', value: '周期时间' },
      ],
    },
  },
  {
    field: 'time',
    label: '时间范围',
    component: 'RangePicker',
    colProps: { span: 11 },
    required: true,
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      rangeSeparator: '至',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
    },
  },
  {
    field: 'frequency',
    label: '重复频率',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 4, offset: 1 },
    itemProps: {
      labelCol: { span: 24 },
      labelAlign: 'left',
      wrapperCol: { span: 24 },
      style: { display: 'block' },
    },
    slot: 'frequency',
    rules: [
      {
        required: true,
        message: '请输入重复频率',
      },
      {
        validator: async (_rule, value) => {
          const num = Number(value);
          if (!value || Number.isNaN(num) || num < 1) {
            return Promise.reject('重复频率必须大于0');
          }
          return Promise.resolve();
        },
      },
    ],
  },
  {
    field: 'timeType',
    label: '重复频率',
    component: 'Select',
    required: true,
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 4 },
    itemProps: {
      labelCol: { span: 24 },
      labelAlign: 'left',
      wrapperCol: { span: 24 },
      style: { display: 'block' },
    },
    componentProps: {
      options: [
        { label: '天', value: 'day' },
        { label: '周', value: 'week' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' },
      ],
    },
    rules: [
      {
        required: true,
        message: '请选择时间类型',
      },
    ],
  },
  {
    field: 'specificTime',
    label: '重复频率 ',
    component: 'Cascader',
    required: true,
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 6 },
    itemProps: {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
      labelAlign: 'left',
      style: { display: 'block' },
    },
    componentProps: {
      multiple: true,
      separator: '',
      placeholder: '的 具体时间',
    },
    rules: [
      {
        validator: async (_rule, value) => {
          if (!Array.isArray(value) || value.length === 0) {
            return Promise.reject('请选择具体时间');
          }
          return Promise.resolve();
        },
      },
    ],
  },
  {
    field: 'broad',
    label: '宽泛期',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 6 },
    itemProps: {
      labelCol: { span: 24 },
      labelAlign: 'left',
      wrapperCol: { span: 24 },
      style: { display: 'block' },
    },
    slot: 'broad',
    rules: [
      {
        required: true,
        message: '请输入宽泛期',
      },
      {
        pattern: /^\d+$/,
        message: '宽泛期只能输入数字',
      },
    ],
  },
  {
    field: 'frequencyDisplay',
    label: '',
    component: 'Input',
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 23, offset: 1 },
    slot: 'frequencyDisplay',
  },
];

export const detailFormSchema: FormSchema[] = [
  {
    field: 'planNo',
    label: '巡检计划编号',
    component: 'Input',
  },
  {
    field: 'name',
    label: '巡检计划名称',
    component: 'Input',
  },
  {
    field: 'groupName',
    label: '执行组别',
    component: 'Input',
  },
  {
    field: 'spaceName',
    label: '执行位置',
    component: 'Input',
  },
  {
    field: 'description',
    label: '说明',
    component: 'InputTextArea',
  },
  {
    field: 'disposable',
    label: '执行方式',
    component: 'Input',
    customRender: ({ value }) => (value ? '固定时间' : '周期时间'),
  },
  {
    field: 'startTime',
    label: '开始时间',
    component: 'Input',
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'Input',
  },
  {
    field: 'broad',
    label: '宽泛期',
    component: 'Input',
    customRender: ({ value, record }) => (value ? `${value} ${record.broadUnit}` : '--'),
  },
  {
    field: 'frequency',
    label: '重复频率',
    component: 'Input',
    customRender: ({ value, record }) => {
      if (!value) return '--';
      let unit = '';
      switch (record.timeType) {
        case 'day': unit = '天'; break;
        case 'week': unit = '周'; break;
        case 'month': unit = '月'; break;
        case 'year': unit = '年'; break;
      }
      return `每 ${value}${unit}`;
    },
  },
  {
    field: 'specificTime',
    label: '具体时间',
    component: 'Input',
  },
];
