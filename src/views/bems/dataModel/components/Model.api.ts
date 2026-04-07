import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getDeviceModelList = '/bems/deviceModel/queryPage',
  // getCategoryTree = '/bems/equipmentCategory/getTree',
  getCategoryTree = '/bems/equipmentCategory/getPermissionTree',
  addModel = '/bems/deviceModel/add',
  updateModel = '/bems/deviceModel/edit',
  deleteModel = '/bems/deviceModel/delete',
  deleteBatchModel = '/bems/deviceModel/deleteBatch',
  getDeviceModelAttribute = '/bems/deviceModelAttribute/queryPage',
  addModelAttribute = '/bems/deviceModelAttribute/add',
  updateModelAttribute = '/bems/deviceModelAttribute/edit',
  deleteModelAttribute = '/bems/deviceModelAttribute/delete',
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