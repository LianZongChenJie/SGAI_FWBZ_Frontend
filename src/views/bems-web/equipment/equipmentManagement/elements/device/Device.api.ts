import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  // categoryTree = '/bems/equipmentCategory/measuring/getTree',
  categoryTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/measuring/getPermissionTree',
  // spaceTree = '/bems/space/getTree',
  spaceTree = '/sgai-fwbz-dev/fwbz/space/getPermissionTree',
  // spaceTree2 = '/bems/space/getTreeByDeviceType',
  spaceTree2 = '/sgai-fwbz-dev/fwbz/space/getPermissionTreeByDeviceType',
  addDevice = '/sgai-fwbz-dev/fwbz/device/measuring/add',
  editDevice = '/sgai-fwbz-dev/fwbz/device/edit',
  deleteDevice = '/sgai-fwbz-dev/fwbz/device/delete',
  // selectDevice = '/sgai-fwbz-dev/fwbz/device/measuring/list',
  selectDevice = '/sgai-fwbz-dev/fwbz/device/list',

  updateAutomation = '/sgai-fwbz-dev/fwbz/device/updateAutomaticAlgorithm',
  staticDataList = '/sgai-fwbz-dev/fwbz/deviceStaticData/list',
  staticDataSave = '/sgai-fwbz-dev/fwbz/deviceStaticData/save',
  attributeDataList = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
  getDeviceAttribute = '/sgai-fwbz-dev/fwbz/deviceModel/queryByCategoryId',
  getListByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/queryPage',
  saveData = '/sgai-fwbz-dev/fwbz/deviceAttribute/edit',
  addDate = '/sgai-fwbz-dev/fwbz/deviceAttribute/add',
  deleteItem = '/sgai-fwbz-dev/fwbz/deviceAttribute/delete',

  exportData = '/sgai-fwbz-dev/fwbz/device/export',
  getCategoryTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/getTree',
  venueInfoList = '/sgai-fwbz-dev/fwbz/venueInfo/listAll'
}

/**
 * 静态数据列表
 */
export const staticDataList = (params) => defHttp.get({ url: Api.staticDataList, params });
/**
 * 静态数据保存
 */
export const staticDataSave = (params) => defHttp.post({ url: Api.staticDataSave, params });

/**
 * 采集数据列表
 */
export const attributeDataList = (params) => defHttp.get({ url: Api.attributeDataList, params });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 空间树
 */
export const spaceTree2 = (params) => defHttp.get({ url: Api.spaceTree2, params }, { joinParamsToUrl: true });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.editDevice : Api.addDevice;
  return defHttp.post({ url: url, params });
};
/**
 * 删除设备
 */
export const deleteDevice = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteDevice, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 切换自动算法
 */
export const updateAutomaticAlgorithm = (params) => defHttp.post({ url: Api.updateAutomation, params });

/**
 * 切换自动算法
 */
export const getDeviceAttribute = (params) => defHttp.get({ url: Api.getDeviceAttribute, params }, { joinParamsToUrl: true });

/**
 * 获取表格数据
 */
export const getListByDeviceId = (params) => defHttp.get({ url: Api.getListByDeviceId, params });

/**
 * 新增编辑后的数据
 */
export const addData = (params) => defHttp.post({ url: Api.addDate, params });

/**
 * 保存编辑后的数据
 */
export const saveData = (params) => defHttp.post({ url: Api.saveData, params });

/**
 * 删除数据
 */
export const deleteItem = (params) => defHttp.delete({ url: Api.deleteItem, params }, { joinParamsToUrl: true });

/**
 * 导出数据
 */
export const exportData = (params) => defHttp.get({ url: Api.exportData, params: params, responseType: 'blob', } ,{ isTransformResponse: false });

/**
 * 获取设备类别树（下拉选择框用）
 */
export const getCategoryTreeData = () => defHttp.get({ url: Api.getCategoryTree });

/**
 * 获取场馆信息列表（供能源计量总览等页面使用）
 */
export const getVenueInfoList = (params) => defHttp.get({ url: Api.venueInfoList, params });
