import { defHttp } from '/@/utils/http/axios';

enum Api {
  dataCollectList = '/sgai-bqzm/bems/lighting/dataInterface/listPage',
  dataCollectAdd = '/sgai-bqzm/bems/lighting/dataInterface/add',
  dataCollectEdit = '/sgai-bqzm/bems/lighting/dataInterface/update',
  
}
export const dataCollectListApi = (params) => {
  return defHttp.get({ url: Api.dataCollectList, params });
};
export const dataCollectAddApi = (params) => {
  return defHttp.post({ url: Api.dataCollectAdd, params }, { isTransformResponse: false });
};
export const dataCollectEditApi = (params) => {
  return defHttp.post({ url: Api.dataCollectEdit, params }, { isTransformResponse: false });
};