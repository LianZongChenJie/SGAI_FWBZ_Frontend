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
    dataIndex: 'start',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.start || '--',
  },
  {
    title: '有效结束时间',
    dataIndex: 'end',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.end || '--',
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
    dataIndex: 'state',
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => record.state || '--',
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
    slot: 'disposable',
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
    colProps: { span: 6 },
    slot: 'frequency',
  },
  {
    field: 'timeType',
    label: ' ',
    component: 'Select',
    required: true,
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 6 },
    slot: 'timeType',
  },
  {
    field: 'specificTime',
    label: ' ',
    component: 'Cascader',
    required: true,
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 10 },
    slot: 'specificTime',
  },
  {
    field: 'frequencyDisplay',
    label: ' ',
    component: 'Input',
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 24 },
    slot: 'frequencyDisplay',
  },
  {
    field: 'broad',
    label: '宽泛期',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => values.disposable === '周期时间',
    colProps: { span: 18 },
    slot: 'broad',
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
    field: 'start',
    label: '开始时间',
    component: 'Input',
  },
  {
    field: 'end',
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
