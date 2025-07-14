import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '类别名称',
    align: 'left',
    dataIndex: 'categoryName',
  },
  {
    title: '排序',
    align: 'center',
    dataIndex: 'sort',
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'remark',
  },
  {
    title: '全称',
    align: 'center',
    dataIndex: 'fullName',
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '父级节点',
    field: 'pid',
    component: 'JTreeSelect',
    componentProps: {
      dict: 'equipment_category,category_name,id',
      pidField: 'pid',
      pidValue: '0',
      hasChildField: 'has_child',
    },
    slot: 'pid'
  },
  {
    label: '类别名称',
    field: 'categoryName',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入类别名称!' }];
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
    label: '备注',
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
  categoryName: { title: '类别名称', order: 1, view: 'text', type: 'string' },
  sort: { title: '排序', order: 2, view: 'number', type: 'number' },
  remark: { title: '备注', order: 3, view: 'text', type: 'string' },
  fullName: { title: '全称', order: 4, view: 'text', type: 'string' },
};

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
