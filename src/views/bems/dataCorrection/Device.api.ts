import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  categoryTree = '/bems/equipmentCategory/measuring/getTree',
  spaceTree = '/bems/space/getTree',
  selectDevice = '/bems/deviceData/hour/listPage',
  editDataValue = '/bems/deviceData/hourDataAmend',
  recalculateApi = '/bems/meterPointData/calculateValue',
}

/**
 * 静态数据列表
 */
export const staticDataList = (params) => {};
/**
 * 静态数据保存
 */
export const staticDataSave = (params) => {};

/**
 * 采集数据列表
 */
export const attributeDataList = (params) => {};

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
export const saveOrUpdate = (params, isUpdate) => {};
/**
 * 删除设备
 */
export const deleteDevice = (params, handleSuccess) => {};

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 切换自动算法
 */
export const updateAutomaticAlgorithm = (params) => {};

/**
 * 修改最终值
 */
export const editDataValue = (params) => defHttp.post({ url: Api.editDataValue, params });

/**
 * 重新计算
 */
export const recalculateApi = (params) => defHttp.post({ url: Api.recalculateApi, params });
