import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { truncate } from 'fs/promises';

const { createConfirm } = useMessage();
enum Api {
  getTotalCostApi = '/bems/costAnalysis/getTotalCost',
  getSpecialtyPieChartApi = '/bems/costAnalysis/findSpecialtyPieChat',
  getDayCostBarChartApi = '/bems/costAnalysis/findDayCost',
}

/**
 * 获取列表数据
 */
export const getTotalCostApi = (params) => defHttp.get({ url: Api.getTotalCostApi, params }, { joinParamsToUrl: true });

/**
 * 获取饼图数据
 */
export const getSpecialtyPieChartApi = (params) => defHttp.get({ url: Api.getSpecialtyPieChartApi, params }, { joinParamsToUrl: true });

/**
 * 获取柱状图数据
 */
export const getDayCostBarChartApi = (params) => defHttp.get({ url: Api.getDayCostBarChartApi, params }, { joinParamsToUrl: true });
