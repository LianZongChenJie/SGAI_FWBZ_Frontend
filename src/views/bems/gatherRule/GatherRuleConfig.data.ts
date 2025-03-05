import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';

//列表数据
export const columns: BasicColumn[] = [
  {
    title: '网关编号',
    align: 'center',
    dataIndex: 'gatewayCode',
  },
  {
    title: '网关名称',
    align: 'center',
    dataIndex: 'gatewayName',
  },
  {
    title: '网关类型',
    align: 'center',
    dataIndex: 'gatewayType_dictText',
  },
  {
    title: '安装位置',
    align: 'center',
    dataIndex: 'installAddr',
  },
  {
    title: 'ip',
    align: 'center',
    dataIndex: 'ip',
  },
  {
    title: '通讯协议',
    align: 'center',
    dataIndex: 'protocol_dictText',
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'state_dictText',
  },
  {
    title: '最后采集时间',
    align: 'center',
    dataIndex: 'lastCollectionTime',
  },
  {
    title: '采集频率/s',
    align: 'center',
    dataIndex: 'frequency',
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '网关编号',
    field: 'gatewayCode',
    component: 'JInput',
  },
  {
    label: '安装位置',
    field: 'installAddr',
    component: 'TreeSelect',
    componentProps: {
      treeData: [],
      fieldNames: {
        label: 'title',
        key: 'key',
        value: 'key',
        children: 'children',
      },
    },
    //colProps: {span: 6},
  },
  {
    label: '状态',
    field: 'state',
    component: 'JSelectMultiple',
    componentProps: {
      dictCode: 'rule_state',
    },
    //colProps: {span: 6},
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '网关编号',
    field: 'gatewayCode',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入网关编号!' }];
    },
  },
  {
    label: '网关名称',
    field: 'gatewayName',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入网关名称!' }];
    },
  },
  {
    label: '网关类型',
    field: 'gatewayType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'rule_gatewayType',
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入网关类型!' }];
    },
  },
  {
    label: '安装位置',
    field: 'installAddr',
    component: 'TreeSelect',
    componentProps: {
      treeData: [],
      fieldNames: {
        label: 'title',
        key: 'key',
        value: 'key',
        children: 'children',
      },
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择安装位置!' }];
    },
  },
  {
    label: 'ip',
    field: 'ip',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入ip!' }];
    },
  },
  {
    label: '通讯协议',
    field: 'protocol',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'rule_protocol',
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入通讯协议!' }];
    },
  },
  {
    label: '状态',
    field: 'state',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'rule_state',
    },
  },
  {
    label: '最后采集时间',
    field: 'lastCollectionTime',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    label: '采集频率/s',
    field: 'frequency',
    component: 'InputNumber',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入采集频率/s!' }];
    },
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

// 高级查询数据
export const superQuerySchema = {
  gatewayCode: { title: '网关编号', order: 0, view: 'text', type: 'string' },
  gatewayName: { title: '网关名称', order: 1, view: 'text', type: 'string' },
  gatewayType: { title: '网关类型', order: 2, view: 'list', type: 'string', dictCode: 'rule_gatewayType' },
  installAddr: { title: '安装位置', order: 3, view: 'text', type: 'string' },
  ip: { title: 'ip', order: 4, view: 'text', type: 'string' },
  protocol: { title: '通讯协议', order: 5, view: 'list', type: 'string', dictCode: 'rule_protocol' },
  state: { title: '状态', order: 6, view: 'list', type: 'string', dictCode: 'rule_state' },
  lastCollectionTime: { title: '最后采集时间', order: 7, view: 'datetime', type: 'string' },
  frequency: { title: '采集频率/s', order: 8, view: 'number', type: 'number' },
};

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
