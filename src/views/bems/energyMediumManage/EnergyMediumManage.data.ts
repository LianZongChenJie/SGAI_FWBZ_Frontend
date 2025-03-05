import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '能介编码',
    align: 'center',
    dataIndex: 'code',
  },
  {
    title: '能介名称',
    align: 'left',
    dataIndex: 'name',
  },
  {
    title: '标准单位',
    align: 'center',
    dataIndex: 'standardUnit',
    customRender: ({ text, record }) => {
      const unitList = window['unitList'] || [];
      const unit = unitList.find((item) => item.id == text);
      return unit ? unit.name : text;
    },
  },
  {
    title: '排序',
    align: 'center',
    dataIndex: 'sort',
  },
  {
    title: '分时计量',
    align: 'center',
    dataIndex: 'timeSharing',
    customRender: ({ text }) => {
      return text === '1' ? '是' : '否';
    },
  },
  {
    title: '说明',
    align: 'center',
    dataIndex: 'remark',
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '能介编码',
    field: 'code',
    component: 'JInput',
  },
  {
    label: '能介名称',
    field: 'name',
    component: 'JInput',
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '父级节点',
    field: 'pid',
    component: 'TreeSelect',
    componentProps: {
      placeholder: '请选择父级节点',
      fieldNames: {
        label: 'title',
        key: 'key',
        value: 'key',
      },
    },
  },
  {
    label: '能介编码',
    field: 'code',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入能介编码!' }];
    },
  },
  {
    label: '能介名称',
    field: 'name',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入能介名称!' }];
    },
  },
  {
    label: '标准单位',
    field: 'standardUnit',
    component: 'Select',
    componentProps: {
      placeholder: '请选择标准单位',
      options: [], // 选项将在 Modal 中动态设置
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择标准单位!' }];
    },
  },
  {
    label: '排序',
    field: 'sort',
    component: 'InputNumber',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入排序!' }];
    },
  },
  {
    label: '分时计量',
    field: 'timeSharing',
    component: 'RadioGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择是否分时计量!' }];
    },
  },
  {
    label: '说明',
    field: 'remark',
    component: 'Input',
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
  code: { title: '能介编码', order: 1, view: 'text', type: 'string' },
  name: { title: '能介名称', order: 2, view: 'text', type: 'string' },
  standardUnit: { title: '标准单位', order: 3, view: 'text', type: 'string' },
  sort: { title: '排序', order: 4, view: 'number', type: 'number' },
  timeSharing: { title: '分时计量', order: 5, view: 'text', type: 'string' },
  remark: { title: '说明', order: 6, view: 'text', type: 'string' },
};

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
