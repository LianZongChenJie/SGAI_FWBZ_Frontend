import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '单位代码',
    align:"center",
    dataIndex: 'code'
   },
   {
    title: '单位名称',
    align:"center",
    dataIndex: 'name'
   },
   {
    title: '英文名称',
    align:"center",
    dataIndex: 'englishAme'
   },
   {
    title: '排序',
    align:"center",
    dataIndex: 'sort'
   },
   {
    title: '说明',
    align:"center",
    dataIndex: 'remark'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: "单位代码",
    field: "code",
    component: 'JInput',
  },
  {
    label: "单位名称",
    field: "name",
    component: 'JInput',
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '单位代码',
    field: 'code',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入单位代码!'},
          ];
     },
  },
  {
    label: '单位名称',
    field: 'name',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入单位名称!'},
          ];
     },
  },
  {
    label: '英文名称',
    field: 'englishAme',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入英文名称!'},
          ];
     },
  },
  {
    label: '排序',
    field: 'sort',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入排序!'},
          ];
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
	  show: false
	},
];

// 高级查询数据
export const superQuerySchema = {
  code: {title: '单位代码',order: 0,view: 'text', type: 'string',},
  name: {title: '单位名称',order: 1,view: 'text', type: 'string',},
  englishAme: {title: '英文名称',order: 2,view: 'text', type: 'string',},
  sort: {title: '排序',order: 3,view: 'number', type: 'number',},
  remark: {title: '说明',order: 4,view: 'text', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}