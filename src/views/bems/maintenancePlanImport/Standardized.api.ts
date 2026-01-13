import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getPlanListApi = '/maintenance/planModel/findByYear',
  importTemplateApi = '/maintenance/planModel/importTemplate',

  exportTemplateApi = '/maintenance/planModel/exportTemplate',
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
 * 计划列表
 * @param params
 */
export const getPlanListApi = (params) => defHttp.get({ url: Api.getPlanListApi, params }, { joinParamsToUrl: true });


/**
 * 计划导入
 * @param params
 */
let headers = {
  'Content-Type': 'multipart/form-data',
};
export const importTemplateApi = (params) => defHttp.post({ url: Api.importTemplateApi, params, headers });

/**
 * 导出
 * @param params
 */
export const exportTemplateApi = (params) => defHttp.get({ url: Api.exportTemplateApi, params, responseType: 'blob', }, { joinParamsToUrl: true });

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
