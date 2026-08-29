import { defHttp } from '/@/utils/http/axios';

enum Api {
  listPage = '/sgai-bqzm/bems/lighting/dataCollect/listPage',
  add = '/sgai-bqzm/bems/lighting/dataCollect/add',
  edit = '/sgai-bqzm/bems/lighting/dataCollect/edit',
}

/**
 * 获取数据采集接口列表
 */
export const dataCollectListApi = (params) =>
  defHttp.get({ url: Api.listPage, params }, { joinParamsToUrl: true });

/**
 * 新增数据采集接口
 */
export const dataCollectAddApi = (params) => defHttp.post({ url: Api.add, params });

/**
 * 编辑数据采集接口
 */
export const dataCollectEditApi = (params) => defHttp.post({ url: Api.edit, params });
