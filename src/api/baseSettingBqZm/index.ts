import { defHttp } from '/@/utils/http/axios';

enum Api {
  getAreaListPageApi = '/sgai-bqzm/bems/lighting/area/listPage1',
  relNameApi = '/sgai-bqzm/bems/lighting/area/getAllRelName',
  allSpaceApi = '/sgai-bqzm/bems/lighting/area/getAllSpace',
  allDistrictTagApi = '/sgai-bqzm/bems/lighting/district/listPage',
  setAreaOpenApi = '/sgai-bqzm/bems/lighting/area/open',
  setAreaCloseApi = '/sgai-bqzm/bems/lighting/area/close',
  recallMqApi = '/sgai-bqzm/bems/lighting/area/recallMq',
  getCircuitListApi = '/sgai-bqzm/bems/lighting/circuit/listPage',
  setCircuitOpenApi = '/sgai-bqzm/bems/lighting/circuit/open',
  setCircuitCloseApi = '/sgai-bqzm/bems/lighting/circuit/close',
}
/**
 * 获取区域数据
 */
export const getAreaListPageApi = (params) => defHttp.get({ url: Api.getAreaListPageApi, params });
/**
 * 获取区域类型
 * @param params
 */
export const getRelName = (params) => defHttp.get({ url: Api.relNameApi, params });
/**
 * 获取全部区域
 * @param params
 */
export const getAllSpace = () => defHttp.get({ url: Api.allSpaceApi });
/**
 * 获取全部区域（地块运行状态标签列表）
 * @param type 传 "1" 只取地块（标签）数据
 */
export const getAllDistrictTag = (type: string = '1') =>
  defHttp.get({ url: Api.allDistrictTagApi, params: { type } });
/**
 * 开启区域
 */
export const setAreaOpenApi = (params) => defHttp.post({ url: Api.setAreaOpenApi, params }, { joinParamsToUrl: true });

/**
 * 关闭区域
 */
export const setAreaCloseApi = (params) => defHttp.post({ url: Api.setAreaCloseApi, params }, { joinParamsToUrl: true });
/**
 * 撤回（待下发消息）
 */
export const recallMqApi = (params) => defHttp.post({ url: Api.recallMqApi, params }, { joinParamsToUrl: true });
/**
 * 获取回路配置列表数据
 */
export const getCircuitListApi = (params) => defHttp.get({ url: Api.getCircuitListApi, params });
/**
 * 开启回路
 */
export const setCircuitOpenApi = (params) => defHttp.post({ url: Api.setCircuitOpenApi, params }, { joinParamsToUrl: true });
/**
 * 关闭回路
 */
export const setCircuitCloseApi = (params) => defHttp.post({ url: Api.setCircuitCloseApi, params }, { joinParamsToUrl: true });