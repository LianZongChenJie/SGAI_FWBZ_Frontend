import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getDeviceModelList = '/sgai-fwbz/fwbz/deviceModel/queryPage',
  // getCategoryTree = '/bems/equipmentCategory/getTree',
  getCategoryTree = '/sgai-fwbz/fwbz/equipmentCategory/getPermissionTree',
  addModel = '/sgai-fwbz/fwbz/deviceModel/add',
  updateModel = '/sgai-fwbz/fwbz/deviceModel/edit',
  deleteModel = '/sgai-fwbz/fwbz/deviceModel/delete',
  deleteBatchModel = '/sgai-fwbz/fwbz/deviceModel/deleteBatch',
  getDeviceModelAttribute = '/sgai-fwbz/fwbz/deviceModelAttribute/queryPage',
  addModelAttribute = '/sgai-fwbz/fwbz/deviceModelAttribute/add',
  updateModelAttribute = '/sgai-fwbz/fwbz/deviceModelAttribute/edit',
  deleteModelAttribute = '/sgai-fwbz/fwbz/deviceModelAttribute/delete',
}

/**
 * 获取专业数据list
 */
export const getCategoryDataList = () => defHttp.get({ url: Api.getCategoryTree });

/**
 * 获取设备模型数据list
 */
export const getDeviceModelList = (params) => defHttp.get({ url: Api.getDeviceModelList, params });

/**
 * 新增模型
 */
export const addModel = (params) => defHttp.post({ url: Api.addModel, params });

/**
 * 编辑模型
 */
export const updateModel = (params) => defHttp.post({ url: Api.updateModel, params });

/**
 * 删除模型
 */
export const deleteModel = (params) => defHttp.delete({ url: Api.deleteModel, params }, { joinParamsToUrl: true });

/**
 * 批量删除模型
 */
export const deleteBatchModel = (params) => defHttp.delete({ url: Api.deleteBatchModel, params }, { joinParamsToUrl: true });

/**
 * 获取设备模型属性
 */
export const getDeviceModelAttribute = (params) => defHttp.get({ url: Api.getDeviceModelAttribute, params });

/**
 * 新增模型
 */
export const addModelAttribute = (params) => defHttp.post({ url: Api.addModelAttribute, params });

/**
 * 编辑模型
 */
export const updateModelAttribute = (params) => defHttp.post({ url: Api.updateModelAttribute, params });

/**
 * 删除模型
 */
export const deleteModelAttribute = (params) => defHttp.delete({ url: Api.deleteModelAttribute, params }, { joinParamsToUrl: true });