import { defHttp } from '/@/utils/http/axios';

enum Api {
  EquipmentList = '/sgai-bqzm/bems/device/list',
  spaceTree = '/sgai-bqzm/bems/space/getPermissionTree',
}
// export const EquipmentListApi = (params?: Recordable) => defHttp.get<Recordable[]>({ url: Api.EquipmentList, params });
export const EquipmentListApi = (params) => {
  return defHttp.get({ url: Api.EquipmentList, params });
};
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree });