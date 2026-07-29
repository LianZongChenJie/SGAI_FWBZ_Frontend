import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  categoryTree = '/bems/equipmentCategory/measuring/getTree',
  spaceTree = '/bems/space/getTree',
  unitList = '/bems/unitManagement/findAll',
  analyticFormula = '/bems/meteringPoint/analyticFormula',
  saveFormula = '/bems/meteringPoint/saveFormula',
  energyFlowType = '/sys/dict/getDictItems/energy_flow_type',
  energyFlowTree = '/bems/meteringPoint/getTree',
  addMeasureRule = '/bems/meteringPoint/add',
  deleteMeasureRule = '/bems/meteringPoint/delete',
  editMeasureRule = '/bems/meteringPoint/edit',
  ruleList = '/bems/meteringPoint/list',
  pointList = '/bems/meteringPoint/listPoint',
}

/**
 * 分类树
 * @param params
 */
export const categoryTree = () => defHttp.get({ url: Api.categoryTree });
/**
 * 空间树
 * @param params
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 单位列表
 * @param params
 */
export const unitList = () => defHttp.get({ url: Api.unitList });

export const pointList = (params) => defHttp.get({ url: Api.pointList, params });

/**
 * 解析公式
 * @param params
 */
export const analyticFormula = (params) => defHttp.post({ url: Api.analyticFormula, params });

/**
 * 保存公式
 * @param params
 */
export const saveFormula = (params) => defHttp.post({ url: Api.saveFormula, params });

/**
 * 能流图分类字典获取
 */
export const energyFlowType = () => defHttp.get({ url: Api.energyFlowType });

/**
 * 能流图配置树获取
 */
export const energyFlowTree = (params) => defHttp.get({ url: Api.energyFlowTree, params });

/**
 * 新增能流图节点
 */
export const addMeasureRule = (params) => defHttp.post({ url: Api.addMeasureRule, params });

/**
 * 删除能流图节点
 */
export const deleteMeasureRule = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteMeasureRule, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 编辑能流图节点
 */
export const editMeasureRule = (params) => defHttp.post({ url: Api.editMeasureRule, params });

/**
 * 能流图节点列表
 */
export const ruleList = (params) => defHttp.get({ url: Api.ruleList, params });
