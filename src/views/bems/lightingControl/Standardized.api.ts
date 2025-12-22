import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getAreaListPageApi = '/bems/lighting/area/listPage',
  getCircuitListPageApi = '/bems/lighting/circuit/listPage',
  setAreaOpenApi = '/bems/lighting/area/open',
  setAreaCloseApi = '/bems/lighting/area/close',
  setCircuitOpenApi = '/bems/lighting/circuit/open',
  setCircuitCloseApi = '/bems/lighting/circuit/close',
  getLightingPlanAPi = '/bems/lighting/plan/listPage',
  addLightingPlanAPi = '/bems/lighting/plan/add',
  editLightingPlanAPi = '/bems/lighting/plan/edit',
  deleteLightingPlanAPi = '/bems/lighting/plan/delete',
  controlRecordListApi = '/bems/lighting/operationLog/listPage',
  enableApi = '/bems/lighting/plan/enable',
  disableApi = '/bems/lighting/plan/disable',

  getPlanTimeApi = '/bems/lighting/planExecutionTime/getByPlanId',
  enablePlanApi = '/bems/lighting/plan/enable',
}

/**
 * 获取区域数据
 */
export const getAreaListPageApi = (params) => defHttp.get({ url: Api.getAreaListPageApi, params });

/**
 * 获取回路分页数据
 */
export const getCircuitListPageApi = (params) => defHttp.get({ url: Api.getCircuitListPageApi, params }, { joinParamsToUrl: true });

/**
 * 开启区域
 */
export const setAreaOpenApi = (params) => defHttp.post({ url: Api.setAreaOpenApi, params }, { joinParamsToUrl: true });

/**
 * 关闭区域
 */
export const setAreaCloseApi = (params) => defHttp.post({ url: Api.setAreaCloseApi, params }, { joinParamsToUrl: true });

/**
 * 开启回路
 */
export const setCircuitOpenApi = (params) => defHttp.post({ url: Api.setCircuitOpenApi, params }, { joinParamsToUrl: true });

/**
 * 关闭回路
 */
export const setCircuitCloseApi = (params) => defHttp.post({ url: Api.setCircuitCloseApi, params }, { joinParamsToUrl: true });

/**
 * 获取回路分页数据
 */
export const getLightingPlanAPi = (params) => defHttp.get({ url: Api.getLightingPlanAPi, params }, { joinParamsToUrl: true });

/**
 * 新增定时计划
 */
export const addLightingPlanAPi = (params) => defHttp.post({ url: Api.addLightingPlanAPi, params });

/**
 * 编辑定时计划
 */
export const editLightingPlanAPi = (params) => defHttp.post({ url: Api.editLightingPlanAPi, params });


/**
 * 编辑定时计划
 */
export const deleteLightingPlanAPi = (params) => defHttp.delete({ url: Api.deleteLightingPlanAPi, params }, { joinParamsToUrl: true });

/**
 * 控制记录列表
 */
export const controlRecordListApi = (params) => defHttp.get({ url: Api.controlRecordListApi, params }, { joinParamsToUrl: true });

/**
 * 控制记录列表
 */
export const enableApi = (params) => defHttp.post({ url: Api.enableApi, params }, { joinParamsToUrl: true });

/**
 * 控制记录列表
 */
export const disableApi = (params) => defHttp.post({ url: Api.disableApi, params }, { joinParamsToUrl: true });

/**
 * 获取控制计划启用信息
 * @param params
 */
export const getPlanTimeApi = (params) => defHttp.get({ url: Api.getPlanTimeApi, params }, { joinParamsToUrl: true }); 

/**
 * 启用控制计划
 * @param params
 */
export const enablePlanApi = (params) =>
  defHttp.post({ url: Api.enablePlanApi, params }, { joinParamsToUrl: true });
