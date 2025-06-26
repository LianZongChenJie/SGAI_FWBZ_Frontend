import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getPieChartDataApi = '/bems/meterPointData/findPieChat',
  getBarChartDataApi = '/bems/meterPointData/findBarChat',
  getLineChartDataApi = '/bems/meterPointData/findLineChat',
  getStackingChartDataApi = '/bems/meterPointData/findStackedColumnChart',
  getTabsDataApi = '/bems/energyAnalysis/config/list',
  getChartsListApi = '/bems/energyAnalysis/chart/list',
  getBenchmarkListApi = '/bems/energyAnalysis/benchmark/list',
}

/**
 * 获取饼图布图数据
 */
export const getPieChartDataApi = (params) => defHttp.get({ url: Api.getPieChartDataApi, params });

/**
 * 获取柱状图数据
 */
export const getBarChartDataApi = (params) => defHttp.get({ url: Api.getBarChartDataApi, params });

/**
 * 获取折线图数据
 */
export const getLineChartDataApi = (params) => defHttp.get({ url: Api.getLineChartDataApi, params });

/**
 * 获取堆叠图数据
 */
export const getStackingChartDataApi = (params) => defHttp.get({ url: Api.getStackingChartDataApi, params });

/**
 * 获取tabs配置列表
 */
export const getTabsDataApi = () => defHttp.get({ url: Api.getTabsDataApi });

/**
 * 获取charts配置列表
 */
export const getChartsListApi = (params) => defHttp.get({ url: Api.getChartsListApi, params }, { joinParamsToUrl: true });

/**
 * 获取charts配置列表
 */
export const getBenchmarkListApi = (params) => defHttp.get({ url: Api.getBenchmarkListApi, params }, { joinParamsToUrl: true });