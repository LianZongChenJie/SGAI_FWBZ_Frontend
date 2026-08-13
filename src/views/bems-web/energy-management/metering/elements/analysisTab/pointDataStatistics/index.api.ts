import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  findHour = '/sgai-tp/fwbz/meterPointData/findMinute',
  findDay = '/sgai-tp/fwbz/meterPointData/findDay',
  findMonth = '/sgai-tp/fwbz/meterPointData/findMonth',
  findYear = '/sgai-tp/fwbz/meterPointData/findYear',
  statistics = '/sgai-tp/fwbz/meterPointData/statistics',
  energyFlowType = '/sys/dict/getDictItems/energy_flow_type',
  // energyFlowTree = '/bems/meteringPoint/getTree',
  energyFlowTree = '/sgai-tp/fwbz/meteringPoint/getPermissionTree',
  // energyFlowTree = '/sgai-tp/fwbz/meteringPoint/getTree',

  test = '/sgai-tp/fwbz/test/test',
}

/**
 * 小时数据
 */
export const findHour = (params) => defHttp.get({ url: Api.findHour, params });

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

/**
 * 计量统计汇总数据（顶部四个卡片）
 */
export const getStatistics = (params = {}) => defHttp.get({ url: Api.statistics, params });

export const test = () => defHttp.get({ url: Api.test });
