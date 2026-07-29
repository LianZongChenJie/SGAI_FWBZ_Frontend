import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getSituationalControlListApi = '/bems/lighting/scenarios/listPage',
  addScenariosApi = '/bems/lighting/scenarios/add',
  editScenariosApi = '/bems/lighting/scenarios/edit',
  deleteScenariosByIdApi = '/bems/lighting/scenarios/deleteById',
  batchDeleteCircuitApi = '/bems/lighting/scenarios/deleteBatch',
  
  getSituationalDetailApi = '/bems/lighting/scenarios/detail',
  getNotConfiguredListApi = '/bems/lighting/circuit/listPage',
  saveScenariosRelApi = '/bems/lighting/scenariosRel/save',

  startSituationalApi = '/bems/lighting/scenarios/enable',
  closeSituationalApi = '/bems/lighting/scenarios/disable',

  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',
}

/**
 * 获取回路配置列表数据
 */
export const getSituationalControlListApi = (params) => defHttp.get({ url: Api.getSituationalControlListApi, params });

/**
 * 新增情景
 */
export const addScenariosApi = (params) => defHttp.post({ url: Api.addScenariosApi, params });

/**
 * 编辑情景
 */
export const editScenariosApi = (params) => defHttp.post({ url: Api.editScenariosApi, params });

/**
 * 删除单条情景
 * @param params
 */
export const deleteScenariosByIdApi = (params) => defHttp.delete({ url: Api.deleteScenariosByIdApi, params }, { joinParamsToUrl: true });

/**
 * 批量删除回路配置
 * @param params
 */
export const batchDeleteCircuitApi = (params) => defHttp.delete({ url: Api.batchDeleteCircuitApi, params }, { joinParamsToUrl: true });

/**
 * 获取回路详情
 * @param params
 */
export const getSituationalDetailApi = (params) => defHttp.get({ url: Api.getSituationalDetailApi, params }, { joinParamsToUrl: true });

/**
 * 获取未配置列表数据
 * @param params
 */
export const getNotConfiguredListApi = (params) => defHttp.get({ url: Api.getNotConfiguredListApi, params }, { joinParamsToUrl: true });

/**
 * 保存情景配置
 * @param params
 */
export const saveScenariosRelApi = (params) => defHttp.post({ url: Api.saveScenariosRelApi, params });


/**
 * 开启情景
 * @param params
 */
export const startSituationalApi = (params) => defHttp.post({ url: Api.startSituationalApi, params }, { joinParamsToUrl: true });

/**
 * 关闭情景
 * @param params
 */
export const closeSituationalApi = (params) => defHttp.post({ url: Api.closeSituationalApi, params }, { joinParamsToUrl: true });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });
