import { defHttp } from '/@/utils/http/axios';

enum Api {
  listApi = '/bems/manualTaskItem/list',
  addApi = '/bems/manualTaskItem/add',
  editApi = '/bems/manualTaskItem/edit',
  deleteApi = '/bems/manualTaskItem/delete',
  generateTasksApi = '/bems/manualTaskItem/generateTasks',
  detailApi = '/bems/manualTask/list',
  deviceTypeApi = '/bems/equipmentCategory/measuring/getPermissionTree',
  deviceListApi = '/bems/device/measuring/find',
  pauseApi = '/bems/manualTask/pause',
  startApi = '/bems/manualTask/enable',
}

export const getManualTaskItemList = (params) => defHttp.get({ url: Api.listApi, params });

export const addManualTaskItem = (data) => defHttp.post({ url: Api.addApi, data });

export const editManualTaskItem = (data) => defHttp.post({ url: Api.editApi, data });

export const generateManualTaskItemTasks = (params) => defHttp.post({ url: Api.generateTasksApi, params }, { joinParamsToUrl: true });

export const getManualTaskItemDetail = (params) => defHttp.get({ url: Api.detailApi, params }, { joinParamsToUrl: true });

export const getDeviceType = () => defHttp.get({ url: Api.deviceTypeApi });

export const getDeviceList = (params) => defHttp.get({ url: Api.deviceListApi, params });

export const deleteManualTaskItem = (params) => defHttp.delete({ url: Api.deleteApi, params }, { joinParamsToUrl: true });

export const pauseManualTaskItem = (params) => defHttp.put({ url: Api.pauseApi, params }, { joinParamsToUrl: true });

export const startManualTaskItem = (params) => defHttp.put({ url: Api.startApi, params }, { joinParamsToUrl: true });
