import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  findDay = '/bems/meterPointData/findDay',
  findMonth = '/bems/meterPointData/findMonth',
  findYear = '/bems/meterPointData/findYear',
  energyFlowType = '/sys/dict/getDictItems/energy_flow_type',
  energyFlowTree = '/bems/meteringPoint/getTree',
  test = '/bems/test/test',
}

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
