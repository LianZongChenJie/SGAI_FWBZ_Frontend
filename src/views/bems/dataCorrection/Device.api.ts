import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  categoryTree = '/bems/equipmentCategory/getTree',
  spaceTree = '/bems/space/getTree',
  addDevice = '/bems/device/add',
  editDevice = '/bems/device/edit',
  deleteDevice = '/bems/device/delete',
  selectDevice = '/bems/deviceData/hour/listPage',
  updateAutomation = '/bems/device/updateAutomaticAlgorithm',
  staticDataList = '/bems/deviceStaticData/list',
  staticDataSave = '/bems/deviceStaticData/save',
  attributeDataList = '/bems/deviceAttributeData/list',
  editDataValue = '/bems/deviceData/hourDataAmend', 
  recalculateApi = '/bems/meterPointData/calculateValue', 
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
 * 修改最终值
 */
export const editDataValue = (params) => defHttp.post({ url: Api.editDataValue, params });

/**
 * 重新计算
 */
export const recalculateApi = (params) => defHttp.post({ url: Api.recalculateApi, params });