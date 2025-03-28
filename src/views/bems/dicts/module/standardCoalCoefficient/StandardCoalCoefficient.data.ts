import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '能源介质',
    align: "center",
    dataIndex: 'energyMedium'
  },
  {
    title: '单位',
    align: "center",
    dataIndex: 'unit'
  },
  {
    title: '当量折算系数',
    align: "center",
    dataIndex: 'eccsc'
  },
  {
    title: '等价折算系数',
    align: "center",
    dataIndex: 'ecf'
  },
  {
    title: '排序',
    align: "center",
    dataIndex: 'sort'
  },
  {
    title: '说明',
    align: "center",
    dataIndex: 'remark'
  },
];

// 高级查询数据
export const superQuerySchema = {
  energyMedium: {title: '能源介质',order: 0,view: 'text', type: 'string',},
  unit: {title: '单位',order: 1,view: 'text', type: 'string',},
  eccsc: {title: '当量折算系数',order: 2,view: 'text', type: 'string',},
  ecf: {title: '等价折算系数',order: 3,view: 'text', type: 'string',},
  sort: {title: '排序',order: 4,view: 'number', type: 'number',},
  remark: {title: '说明',order: 5,view: 'text', type: 'string',},
};
