import { defHttp } from '/@/utils/http/axios';
enum Api {
  listApi = '/deviceMaintenance/maintenanceTask/list',
  detailApi = '/deviceMaintenance/maintenanceTask/detail/',
  updateApi = '/deviceMaintenance/maintenanceTask/update',
  executeApi = '/deviceMaintenance/maintenanceTask/complete',
  deviceListApi = '/deviceMaintenance/taskDevice/listByTask/',
  treeData = '/deviceMaintenance/taskSpace/listByTask/',
  taskDevice = '/deviceMaintenance/taskDevice/updateRemark',
  operationLogListApi = '/deviceMaintenance/taskOperationLog/list/',
  addDevicesApi = '/deviceMaintenance/taskDevice/addDevices',
  removeDevicesApi = '/deviceMaintenance/taskDevice/removeDevices',
  addSpacesApi = '/deviceMaintenance/taskSpace/addSpaces',
  removeSpacesApi = '/deviceMaintenance/taskSpace/removeSpaces',
  spaceTreeApi = '/bems/space/getTree',
}

/**
 * 计划管理列表
 * @param params
 */
export const getList = (params) => defHttp.get({ url: Api.listApi, params });
/**
 * 计划详情
 * @param params
 */
export const getDetail = (params) => defHttp.get({ url: Api.detailApi + params });
/**
 * 更新维保任务
 * @param params
 */
export const updateTask = (params) => defHttp.put({ url: Api.updateApi, params });
/**
 * 执行任务
 * @param params
 */
export const execute = (params) => defHttp.post({ url: Api.executeApi, params });
/**
 * 设备列表
 * @param params
 */
export const deviceList = (params) => defHttp.get({ url: Api.deviceListApi + params });
/**
 * 获取空间树
 * @param params
 */
export const getTreeData = (params) => defHttp.get({ url: Api.treeData + params });
/**
 * 更新任务设备关联说明
 * @param params
 */
export const updateTaskDevice = (params) => defHttp.put({ url: Api.taskDevice, params });
/**
 * 批量添加设备
 * @param params
 */
export const addDevices = (params) => defHttp.post({ url: Api.addDevicesApi, params });
/**
 * 批量删除设备
 * @param params
 */
export const removeDevices = (params) => defHttp.delete({ url: Api.removeDevicesApi, params });
/**
 * 批量添加空间
 * @param params
 */
export const addSpaces = (params) => defHttp.post({ url: Api.addSpacesApi, params });
/**
 * 批量删除空间
 * @param params
 */
export const removeSpaces = (params) => defHttp.delete({ url: Api.removeSpacesApi, params });
/**
 * 操作日志列表
 * @param params
 */
export const operationLogList = (params) => defHttp.get({ url: Api.operationLogListApi + params });
/**
 * 获取空间树
 * @param params
 */
export const getSpaceTree = (params) => defHttp.get({ url: Api.spaceTreeApi, params });