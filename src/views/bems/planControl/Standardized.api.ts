import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getPlanControlListApi = '/bems/lighting/planControl/listPage',
  addPlanControlApi = '/bems/lighting/planControl/add',
  editPlanControlApi = '/bems/lighting/planControl/edit',
  deletePlanControlByIdApi = '/bems/lighting/planControl/deleteById',
  batchDeleteCircuitApi = '/bems/lighting/planControl/deleteBatch',
  
  getPlanControlDetailApi = '/bems/lighting/planControl/detail',
  getNotConfiguredListApi = '/bems/lighting/circuit/listPage',
  savePlanControlRelApi = '/bems/lighting/planControlRel/save',

  startPlanControlApi = '/bems/lighting/planControl/enable',
  closePlanControlApi = '/bems/lighting/planControl/enable',

  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',
}

/**
 * 获取回路配置列表数据
 */
export const getPlanControlListApi = (params) => defHttp.get({ url: Api.getPlanControlListApi, params });

/**
 * 新增计划
 */
export const addPlanControlApi = (params) => defHttp.post({ url: Api.addPlanControlApi, params });

/**
 * 编辑计划
 */
export const editPlanControlApi = (params) => defHttp.post({ url: Api.editPlanControlApi, params });

/**
 * 删除单条计划
 * @param params
 */
export const deletePlanControlByIdApi = (params) => defHttp.delete({ url: Api.deletePlanControlByIdApi, params }, { joinParamsToUrl: true });

/**
 * 批量删除回路配置
 * @param params
 */
export const batchDeleteCircuitApi = (params) => defHttp.delete({ url: Api.batchDeleteCircuitApi, params }, { joinParamsToUrl: true });

/**
 * 获取回路详情
 * @param params
 */
export const getPlanControlDetailApi = (params) => defHttp.get({ url: Api.getPlanControlDetailApi, params }, { joinParamsToUrl: true });

/**
 * 获取未配置列表数据
 * @param params
 */
export const getNotConfiguredListApi = (params) => defHttp.get({ url: Api.getNotConfiguredListApi, params }, { joinParamsToUrl: true });

/**
 * 保存情景配置
 * @param params
 */
export const savePlanControlRelApi = (params) => defHttp.post({ url: Api.savePlanControlRelApi, params });


/**
 * 开启计划
 * @param params
 */
export const startPlanControlApi = (params) => defHttp.post({ url: Api.startPlanControlApi, params }, { joinParamsToUrl: true });

/**
 * 关闭计划
 * @param params
 */
export const closePlanControlApi = (params) => defHttp.post({ url: Api.closePlanControlApi, params }, { joinParamsToUrl: true });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });
