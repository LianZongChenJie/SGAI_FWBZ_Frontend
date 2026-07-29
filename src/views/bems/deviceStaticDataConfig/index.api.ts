import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

enum Api {
  list = '/bems/deviceStaticDataConfig/list',
  save = '/bems/deviceStaticDataConfig/add',
  edit = '/bems/deviceStaticDataConfig/edit',
  delete = '/bems/deviceStaticDataConfig/delete',
}

export const getList = (params) => defHttp.get({ url: Api.list, params });
export const saveConfig = (params) => defHttp.post({ url: Api.save, params });
export const editConfig = (params) => defHttp.put({ url: Api.edit, params });
export const deleteConfig = (params) => defHttp.delete({ url: Api.delete, params });
