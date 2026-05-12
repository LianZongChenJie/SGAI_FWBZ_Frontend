import { defHttp } from '/@/utils/http/axios';

enum Api {
  listByCycleApi = '/bems/manualTask/listByCycle',
  deviceTypeApi = '/bems/equipmentCategory/measuring/getPermissionTree',
  updateReadingApi = '/bems/manualTask/updateReading',
  logApi = '/bems/manualTaskReadingLog/list',
}

export const getManualTaskListByCycle = (params) => defHttp.get({ url: Api.listByCycleApi, params }, { joinParamsToUrl: true });

export const getDeviceType = () => defHttp.get({ url: Api.deviceTypeApi });

export const updateReading = (params) => defHttp.put({ url: Api.updateReadingApi, params }, { joinParamsToUrl: true });

export const getLogList = (params) => defHttp.get({ url: Api.logApi, params }, { joinParamsToUrl: true });