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
}

/**
 * 获取告警等级数据
 */
export const getAreaListPageApi = (params) => defHttp.get({ url: Api.getAreaListPageApi, params });

/**
 * 获取告警等级分页数据
 */
export const getCircuitListPageApi = (params) => defHttp.get({ url: Api.getCircuitListPageApi, params }, { joinParamsToUrl: true });

/**
 * 获取告警等级分页数据
 */
export const setAreaOpenApi = (params) => defHttp.post({ url: Api.setAreaOpenApi, params }, { joinParamsToUrl: true });

/**
 * 获取告警等级分页数据
 */
export const setAreaCloseApi = (params) => defHttp.post({ url: Api.setAreaCloseApi, params }, { joinParamsToUrl: true });

/**
 * 获取告警等级分页数据
 */
export const setCircuitOpenApi = (params) => defHttp.post({ url: Api.setCircuitOpenApi, params }, { joinParamsToUrl: true });

/**
 * 获取告警等级分页数据
 */
export const setCircuitCloseApi = (params) => defHttp.post({ url: Api.setCircuitCloseApi, params }, { joinParamsToUrl: true });
