import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getLinkageControlListApi = '/bems/linkageStrategy/listPage',
  createLinkageControlApi = '/bems/linkageStrategy/add',
  selectDevice = '/bems/device/measuring/list',
  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/measuring/getTree',
  deviceCategoryTree = '/bems/equipmentCategory/equipment/getTree',
  getPontByDeviceIdApi = '/bems/deviceAttribute/getByDeviceId',
  editLinkageControlApi = '/bems/linkageStrategy/edit',
  getLinkageControlDetailApi = '/bems/linkageStrategy/getDetailById',
  deleteLinkageControlApi = '/bems/linkageStrategy/delete',
  enableLinkageControlApi = '/bems/linkageStrategy/startStrategy',
  disableLinkageControlApi = '/bems/linkageStrategy/stopStrategy',
  getStandardizedManagementtApi = '/bems/patterningStrategy/listPage',
  createStandardizedManagementtlApi = '/bems/patterningStrategy/add',
  getStandardizedManagemenDetailApi = '/bems/patterningStrategy/getDetailById',
  editStandardizedManagemenApi = '/bems/patterningStrategy/edit',
  deleteStandardizedManagemenApi = '/bems/patterningStrategy/delete',
  enableStandardizedManagemenApi = '/bems/patterningStrategy/startStrategy',
  disableStandardizedManagemenApi = '/bems/patterningStrategy/stopStrategy',
  executeStandardizedManagemenApi = '/bems/patterningStrategy/executionNow',
  getControlRecordsListApi = '/bems/strategyExecuteRecord/listPage',
  getControlRecordsDetailApi = '/bems/pointExecuteRecord/getByStrategyExecuteId',
  getPatterningExecutionTimeApi = '/bems/patterningExecutionTime/getById'
}

/**
 * 获取联动控制表格数据
 */
export const getLinkageControlListApi = (params) => defHttp.get({ url: Api.getLinkageControlListApi, params });

/**
 * 创建联动控制
 */
export const createLinkageControlApi = (params) => defHttp.post({ url: Api.createLinkageControlApi, params });

/**
 * 编辑联动控制获取数据详情
 */
export const getLinkageControlDetailApi = (params) => defHttp.get({ url: Api.getLinkageControlDetailApi, params }, { joinParamsToUrl: true });

/**
 * 编辑联动控制
 */
export const editLinkageControlApi = (params) => defHttp.post({ url: Api.editLinkageControlApi, params });

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 分类树
 * @param params
 */
export const deviceCategoryTree = (params) => defHttp.get({ url: Api.deviceCategoryTree, params }); 

/**
 * 分设备下点位数据
 * @param params
 */
export const getPontByDeviceIdApi = (params) => defHttp.get({ url: Api.getPontByDeviceIdApi, params }, { joinParamsToUrl: true });

/**
 * 删除策略
 * @param params
 */
export const deleteLinkageControlApi = (params) => defHttp.delete({ url: Api.deleteLinkageControlApi, params }, { joinParamsToUrl: true });

/**
 * 启用策略
 * @param params
 */
export const enableLinkageControlApi = (params) => defHttp.post({ url: Api.enableLinkageControlApi, params }, { joinParamsToUrl: true });

/**
 * 禁用策略
 * @param params
 */
export const disableLinkageControlApi = (params) => defHttp.post({ url: Api.disableLinkageControlApi, params }, { joinParamsToUrl: true });

/**
 * 获取场景控制表格数据
 */
export const getStandardizedManagementtApi = (params) => defHttp.get({ url: Api.getStandardizedManagementtApi, params });

/**
 * 创建模式化管理
 */
export const createStandardizedManagementtlApi = (params) => defHttp.post({ url: Api.createStandardizedManagementtlApi, params });

/**
 * 编辑模式化获取数据详情
 */
export const getStandardizedManagemenDetailApi = (params) =>
  defHttp.get({ url: Api.getStandardizedManagemenDetailApi, params }, { joinParamsToUrl: true });

/**
 * 编辑模式化
 */
export const editStandardizedManagemenApi = (params) => defHttp.post({ url: Api.editStandardizedManagemenApi, params });

/**
 * 删除模式化
 * @param params
 */
export const deleteStandardizedManagemenApi = (params) =>
  defHttp.delete({ url: Api.deleteStandardizedManagemenApi, params }, { joinParamsToUrl: true });

/**
 * 启用模式化
 * @param params
 */
export const enableStandardizedManagemenApi = (params) =>
  defHttp.post({ url: Api.enableStandardizedManagemenApi, params }, { joinParamsToUrl: true });

/**
 * 禁用模式化
 * @param params
 */
export const disableStandardizedManagemenApi = (params) =>
  defHttp.post({ url: Api.disableStandardizedManagemenApi, params }, { joinParamsToUrl: true });

/**
 * 禁用模式化
 * @param params
 */
export const executeStandardizedManagemenApi = (params) =>
  defHttp.post({ url: Api.executeStandardizedManagemenApi, params }, { joinParamsToUrl: true });

/**
 * 获取控制记录数据
 */
export const getControlRecordsListApi = (params) => defHttp.get({ url: Api.getControlRecordsListApi, params });

/**
 * 获取控制记录详情数据
 */
export const getControlRecordsDetailApi = (params) => defHttp.get({ url: Api.getControlRecordsDetailApi, params });

/**
 * 获取联动设备启用信息
 * @param params
 */
export const getPatterningExecutionTimeApi = (params) => defHttp.get({ url: Api.getPatterningExecutionTimeApi, params }, { joinParamsToUrl: true }); 
