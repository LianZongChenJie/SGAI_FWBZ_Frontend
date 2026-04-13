import { defHttp } from '/@/utils/http/axios';
enum Api {
  listApi = '/deviceMaintenance/maintenanceTask/list',
  detailApi = '/deviceMaintenance/maintenanceTask/detail/',
  executeApi = '//deviceMaintenance/maintenanceTask/complete',
  deviceListApi = '/bems/device/list',
  treeData = '/deviceMaintenance/taskSpace/listByTask/',
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
 * 执行任务
 * @param params
 */
export const execute = (params) => defHttp.post({ url: Api.executeApi, params });
/**
 * 设备列表
 * @param params
 */
export const deviceList = (params) => defHttp.get({ url: Api.deviceListApi, params });
/**
 * 获取空间树
 * @param params
 */
export const getTreeData = (params) => defHttp.get({ url: Api.treeData + params });