import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { truncate } from 'fs/promises';

const { createConfirm } = useMessage();
enum Api {
  getOverviewDataApi = '/bems/carbonEmission/getOverview',
  getTrendsDayDataApi = '/bems/carbonEmission/getTrendComparisonForDay',
  getTrendsMonthDataApi = '/bems/carbonEmission/getTrendComparisonForMonth',
  getTrendsYearDataApi = '/bems/carbonEmission/getTrendComparisonForYear',

  getObjectListApi = '/bems/carbonEmission/spatialList',
  getCoalObjectListApi = '/bems/carbonEmission/specialtyList',
  getObjectPieDataApi = '/bems/carbonEmission/getSpatialCarbonEmissionAnalysis',
  getObjectDayDataApi = '/bems/carbonEmission/getSpatialCarbonEmissionForDay',
  getObjectMonthDataApi = '/bems/carbonEmission/getSpatialCarbonEmissionForMonth',
  getObjectYearDataApi = '/bems/carbonEmission/getSpatialCarbonEmissionForYear',

  getScenarioizationPieDataApi = '/bems/carbonEmission/getSpecialtyCarbonEmissionAnalysis',
  getScenarioizationDayDataApi = '/bems/carbonEmission/getSpecialtyCarbonEmissionForDay',
  getScenarioizationMonthDataApi = '/bems/carbonEmission/getSpecialtyCarbonEmissionForMonth',
  getScenarioizationYearDataApi = '/bems/carbonEmission/getSpecialtyCarbonEmissionForYear',

  getTrendForecastDayData = '/bems/carbonEmission/getCarbonEmissionForDay',
  getTrendForecastDayWeek = '/bems/carbonEmission/getCarbonEmissionForWeek',
  getTrendForecastDayMonth = '/bems/carbonEmission/getCarbonEmissionForMonth',
  getTrendForecastDayQuarter = '/bems/carbonEmission/getCarbonEmissionForQuarter',
  getTrendForecastDayYear = '/bems/carbonEmission/getCarbonEmissionForYear',
  // 碳流图
  getCarbonFlowChart = '/bems/carbonEmission/getCarbonFlowChart',
}

export const getCarbonFlowChartApi = () => defHttp.get({ url: Api.getCarbonFlowChart });

/**
 * 获取总览数据
 */
export const getOverviewDataApi = () => defHttp.get({ url: Api.getOverviewDataApi });

/**
 * 获取趋势图数据日
 */
export const getTrendsDayDataApi = (params) => defHttp.get({ url: Api.getTrendsDayDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取趋势图数据月
 */
export const getTrendsMonthDataApi = (params) => defHttp.get({ url: Api.getTrendsMonthDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取趋势图数据年
 */
export const getTrendsYearDataApi = (params) => defHttp.get({ url: Api.getTrendsYearDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取对象列表数据
 */
export const getObjectListApi = () => defHttp.get({ url: Api.getObjectListApi });

/**
 * 获取碳排放对象列表数据
 */
export const getCoalObjectListApi = () => defHttp.get({ url: Api.getCoalObjectListApi });

/**
 * 获取对象饼图数据
 */
export const getObjectPieDataApi = () => defHttp.get({ url: Api.getObjectPieDataApi });

/**
 * 获取对象图数据日
 */
export const getObjectDayDataApi = (params) => defHttp.get({ url: Api.getObjectDayDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取对象图数据月
 */
export const getObjectMonthDataApi = (params) => defHttp.get({ url: Api.getObjectMonthDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取对象图数据年
 */
export const getObjectYearDataApi = (params) => defHttp.get({ url: Api.getObjectYearDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取对象饼图数据
 */
export const getScenarioizationPieDataApi = () => defHttp.get({ url: Api.getScenarioizationPieDataApi });

/**
 * 获取对象图数据日
 */
export const getScenarioizationDayDataApi = (params) => defHttp.get({ url: Api.getScenarioizationDayDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取对象图数据月
 */
export const getScenarioizationMonthDataApi = (params) => defHttp.get({ url: Api.getScenarioizationMonthDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取对象图数据年
 */
export const getScenarioizationYearDataApi = (params) => defHttp.get({ url: Api.getScenarioizationYearDataApi, params }, { joinParamsToUrl: true });

/**
 * 获取本日趋势统计数据
 */
export const getTrendForecastDayData = () => defHttp.get({ url: Api.getTrendForecastDayData });

/**
 * 获取本周趋势统计数据
 */
export const getTrendForecastDayWeek = () => defHttp.get({ url: Api.getTrendForecastDayWeek });

/**
 * 获取本月趋势统计数据
 */
export const getTrendForecastDayMonth = () => defHttp.get({ url: Api.getTrendForecastDayMonth });

/**
 * 获取本季度趋势统计数据
 */
export const getTrendForecastDayQuarter = () => defHttp.get({ url: Api.getTrendForecastDayQuarter });

/**
 * 获取本年趋势统计数据
 */
export const getTrendForecastDayYear = () => defHttp.get({ url: Api.getTrendForecastDayYear });
