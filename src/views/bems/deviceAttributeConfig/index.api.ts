import { defHttp } from '/@/utils/http/axios';

enum Api {
  add = '/bems/deviceAttributeConfig/add',
  delete = '/bems/deviceAttributeConfig/delete',
  edit = '/bems/deviceAttributeConfig/edit',
  list = '/bems/deviceAttributeConfig/list',
}
export const add = (params?: any) => defHttp.post({ url: Api.add, params });
export const deleteById = (params?: any) => defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true });
export const update = (params?: any) => defHttp.put({ url: Api.edit, params });
export const list = (params?: any) => defHttp.get({ url: Api.list, params });
