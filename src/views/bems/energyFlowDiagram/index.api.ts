import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  findDay = '/bems/energyFlowDiagram/findDay',
  findMonth = '/bems/energyFlowDiagram/findMonth',
  findYear = '/bems/energyFlowDiagram/findYear',
  energyFlowType = '/sys/dict/getDictItems/energy_flow_type',
}

export const findDay = (params) => defHttp.get({ url: Api.findDay, params });
export const findMonth = (params) => defHttp.get({ url: Api.findMonth, params });
export const findYear = (params) => defHttp.get({ url: Api.findYear, params });
/**
 * 能流图分类字典获取
 */
export const energyFlowType = () => defHttp.get({ url: Api.energyFlowType });
