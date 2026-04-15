import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getPlanListApi = '/deviceMaintenance/maintenancePlan/tableView',
  importTemplateApi = '/deviceMaintenance/maintenancePlan/import',
  exportTemplateApi = '/deviceMaintenance/maintenancePlan/template',
  getFiledConfigApi = '/deviceMaintenance/orgFieldConfig/org/',
  getWeekDistributionApi = '/deviceMaintenance/maintenancePlan/weekDistribution',
  addPlanApi = '/deviceMaintenance/maintenancePlan/add',
  editPlanApi = '/deviceMaintenance/maintenancePlan/edit',
  deletePlanApi = '/deviceMaintenance/maintenancePlan/delete/',
  generateTasksByBatchApi = '/deviceMaintenance/maintenancePlan/generateTasksByBatch',
  deviceListApi = '/bems/device/list',
  saveDevicesApi = '/deviceMaintenance/maintenancePlan/saveDevices',
  treeData = '/bems/space/getTree',
  saveSpacesApi = '/deviceMaintenance/maintenancePlan/saveSpaces',
  planDetailApi = '/deviceMaintenance/maintenancePlan/detail/',
}

/**
 * 计划列表
 * @param params
 */
export const getPlanListApi = (params) => defHttp.get({ url: Api.getPlanListApi, params }, { joinParamsToUrl: true });

/**
 * 计划导入
 * @param params
 */
let headers = {
  'Content-Type': 'multipart/form-data',
};
export const importTemplateApi = (params) => defHttp.post({ url: Api.importTemplateApi, params, headers });

/**
 * 导出
 * @param params
 */
export const exportTemplateApi = (params) => defHttp.get({ url: Api.exportTemplateApi, params, responseType: 'blob' }, { joinParamsToUrl: true });

/**
 * 获取组织机构的字段配置
 * @param params
 */
export const getFiledConfig = (orgCode) => defHttp.get({ url: Api.getFiledConfigApi + orgCode });

/**
 * 计划列表
 * @param params
 */
export const getWeekDistribution = (params) => defHttp.get({ url: Api.getWeekDistributionApi, params });
/**
 * 新增计划
 * @param params
 */
export const addPlan = (params) => defHttp.post({ url: Api.addPlanApi, params });
/**
 * 新增计划
 * @param params
 */
export const editPlan = (params) => defHttp.put({ url: Api.editPlanApi, params });
/**
 * 删除计划
 * @param params
 */
export const deletePlan = (params) => defHttp.delete({ url: Api.deletePlanApi + params });
/**
 * 批量生成维保任务
 * @param params
 */
export const generateTasksByBatch = (params) => defHttp.post({ url: Api.generateTasksByBatchApi, params });
/**
 * 设备列表
 * @param params
 */
export const deviceList = (params) => defHttp.get({ url: Api.deviceListApi, params });
/**
 * 关联设备
 * @param params
 */
export const saveDevices = (params) => defHttp.post({ url: Api.saveDevicesApi, params });
/**
 * 获取空间树
 * @param params
 */
export const getTreeData = (params) => defHttp.get({ url: Api.treeData, params });
/**
 * 关联空间
 * @param params
 */
export const saveSpaces = (params) => defHttp.post({ url: Api.saveSpacesApi, params });
/**
 * 计划详情
 * @param params
 */
export const planDetail = (params) => defHttp.get({ url: Api.planDetailApi + params });
