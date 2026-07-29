import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '能源介质',
    align: 'center',
    dataIndex: 'energyMedium',
  },
  {
    title: '单价',
    align: 'center',
    dataIndex: 'unitPrice',
  },
  {
    title: '单位',
    align: 'center',
    dataIndex: 'unit',
  },
  {
    title: '排序',
    align: 'center',
    dataIndex: 'sort',
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
    label: '能源介质',
    field: 'energyMedium',
    component: 'JInput',
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '能源介质',
    field: 'energyMedium',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入能源介质!' }];
    },
  },
  {
    label: '单价',
    field: 'unitPrice',
    component: 'InputNumber',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入单价!' }];
    },
  },
  {
    label: '单位',
    field: 'unit',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入单位!' }];
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
  energyMedium: { title: '能源介质', order: 0, view: 'text', type: 'string' },
  unitPrice: { title: '单价', order: 1, view: 'number', type: 'number' },
  unit: { title: '单位', order: 2, view: 'text', type: 'string' },
  sort: { title: '排序', order: 3, view: 'number', type: 'number' },
  remark: { title: '说明', order: 4, view: 'text', type: 'string' },
};

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
