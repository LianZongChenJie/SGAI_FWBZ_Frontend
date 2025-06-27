import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { truncate } from 'fs/promises';

const { createConfirm } = useMessage();
enum Api {
  getTotalCostApi = '/bems/costAnalysis/getTotalCost',
  getSpecialtyPieChartApi = '/bems/costAnalysis/findSpecialtyPieChat',
  getDayCostBarChartApi = '/bems/costAnalysis/findDayCost',

  findDay = '/bems/costAnalysis/findDay',
  findMonth = '/bems/costAnalysis/findMonth',
  findYear = '/bems/costAnalysis/findYear',
  energyFlowType = '/sys/dict/getDictItems/energy_flow_type',
  energyFlowTree = '/bems/meteringPoint/getTree',
  test = '/bems/test/test',
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


/**
 * 日数据
 */
export const findDay = (params) => defHttp.get({ url: Api.findDay, params });

/**
 * 月数据
 */
export const findMonth = (params) => defHttp.get({ url: Api.findMonth, params });
/**
 * 年数据
 */
export const findYear = (params) => defHttp.get({ url: Api.findYear, params });

/**
 * 能流图分类字典获取
 */
export const energyFlowType = () => defHttp.get({ url: Api.energyFlowType });

export const energyFlowTree = (params) => defHttp.get({ url: Api.energyFlowTree, params });

export const test = () => defHttp.get({ url: Api.test });
