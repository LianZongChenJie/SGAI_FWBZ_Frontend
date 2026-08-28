import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  // list = '/sgai-fwbz-dev/fwbz/device/list',
  // categoryTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/getTree',
  categoryTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/getPermissionTree',
  // spaceTree = '/sgai-fwbz-dev/fwbz/space/getTree',
  spaceTree = '/sgai-fwbz-dev/fwbz/space/getPermissionTree',
  list = '/sgai-fwbz-dev/fwbz/deviceData/deviceStatusList',
  findHourData = '/sgai-fwbz-dev/fwbz/deviceData/findHourData', 
  getDeviceNumberDataApi = '/sgai-fwbz-dev/fwbz/deviceData/statisticsRunState',

  exportData = '/sgai-fwbz-dev/fwbz/deviceData/export',

  // getHistoryDataApi = '/sgai-fwbz-dev/fwbz/deviceData/real/list',
  getHistoryDataApi = '/sgai-fwbz-dev/fwbz/deviceAttributeHistory/listByAttributeId',
  getDeviceAttributeByDeviceIdApi = '/sgai-fwbz-dev/fwbz/deviceAttribute/getByDeviceId', 
  getChartDataDayApi = '/sgai-fwbz-dev/fwbz/deviceData/day/list',
  getChartDataMonthApi = '/sgai-fwbz-dev/fwbz/deviceData/month/list',
}

export const getCategoryTree = () => defHttp.get({ url: Api.categoryTree });
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree });
export const getList = (params) => defHttp.get({ url: Api.list, params });
export const findHourData = (params) => defHttp.get({ url: Api.findHourData, params });
export const getDeviceNumberDataApi = () => defHttp.get({ url: Api.getDeviceNumberDataApi });

/**
 * 导出数据
 */
export const exportData = (params) => defHttp.get({ url: Api.exportData, params: params, responseType: 'blob', } ,{ isTransformResponse: false });

/**
 * 获取属性列表
 */
export const getDeviceAttributeByDeviceIdApi = (params) => defHttp.get({ url: Api.getDeviceAttributeByDeviceIdApi, params }, { joinParamsToUrl: true });

/**
 * 获取表底值
 */
export const getHistoryDataApi = (params) => defHttp.get({ url: Api.getHistoryDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取图表数据日
 */
export const getChartDataDayApi = (params) => defHttp.get({ url: Api.getChartDataDayApi, params }, { joinParamsToUrl: true });

/**
 * 获取图表数据月
 */
export const getChartDataMonthApi = (params) => defHttp.get({ url: Api.getChartDataMonthApi, params }, { joinParamsToUrl: true });
