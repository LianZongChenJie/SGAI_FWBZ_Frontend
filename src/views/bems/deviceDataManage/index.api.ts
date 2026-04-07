import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  // list = '/bems/device/list',
  // categoryTree = '/bems/equipmentCategory/getTree',
  categoryTree = '/bems/equipmentCategory/getPermissionTree',
  // spaceTree = '/bems/space/getTree',
  spaceTree = '/bems/space/getPermissionTree',
  list = '/bems/deviceData/list',
  findHourData = '/bems/deviceData/findHourData', 
  getDeviceNumberDataApi = '/bems/deviceData/statisticsRunState',

  exportData = '/bems/deviceData/export',

  getHistoryDataApi = '/bems/deviceData/real/list',
  getChartDataDayApi = '/bems/deviceData/day/list',
  getChartDataMonthApi = '/bems/deviceData/month/list',
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
