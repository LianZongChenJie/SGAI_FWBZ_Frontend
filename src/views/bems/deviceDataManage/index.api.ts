import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  // list = '/bems/device/list',
  categoryTree = '/bems/equipmentCategory/getTree',
  spaceTree = '/bems/space/getTree',
  list = '/bems/deviceData/list',
  findHourData = '/bems/deviceData/findHourData',
}

export const getCategoryTree = () => defHttp.get({ url: Api.categoryTree });
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree });
export const getList = (params) => defHttp.get({ url: Api.list, params });
export const findHourData = (params) => defHttp.get({ url: Api.findHourData, params });
