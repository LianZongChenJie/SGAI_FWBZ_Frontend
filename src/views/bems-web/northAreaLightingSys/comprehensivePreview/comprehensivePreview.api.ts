import { defHttp } from '/@/utils/http/axios';

enum Api {
  overviewStats = '/sgai-bqzm/bems/lighting/home/areaStatistics',
  blockList = '/northAreaLighting/overview/blockList',
  allOn = '/sgai-bqzm/bems/lighting/plan/control',
  allOff = '/sgai-bqzm/bems/lighting/plan/control',
  getAllSpace = '/sgai-bqzm//bems/lighting/district/listPage',
  getAllCircuit = '/sgai-bqzm/bems/lighting/circuit/all',
  openArea = '/sgai-bqzm/bems/lighting/area/open',
  closeArea = '/sgai-bqzm/bems/lighting/area/close',
  allArea = '/sgai-bqzm/bems/lighting/area/all',
  areaRunStatus = '/sgai-bqzm/bems/lighting/home/areaRunStatus',
  runTimeCompare = '/sgai-bqzm/bems/lighting/analysis/runTimeCompare',
  sceneSpace = '/sgai-bqzm/bems/lighting/scene/space',
  videoListBySpace = '/sgai-bqzm/bems/lighting/videoMonitor/listBySpace',
}

/** 获取总览统计数据 */
export const getOverviewStatsApi = () => defHttp.get({ url: Api.overviewStats });

/** 获取地块运行状态列表 */
export const getBlockListApi = () => defHttp.get({ url: Api.blockList });

/** 全区开灯 */
export const allOnApi  = (params) => defHttp.post({ url: Api.allOn, params });

/** 全区关灯 */
export const allOffApi = (params) => defHttp.post({ url: Api.allOff, params });

/** 获取所有地块（type 传 "1"：只取地块数据*/
export const getAllSpaceApi = (type: string) => defHttp.get({ url: Api.getAllSpace, params: { type } });

/** 查询所有回路 */
export const getAllCircuitApi = () => defHttp.get({ url: Api.getAllCircuit });

/** 开启地块照明 */
export const openAreaApi = (id: string) => defHttp.post({ url: Api.openArea, params: { id } }, { joinParamsToUrl: true });

/** 关闭地块照明 */
export const closeAreaApi = (id: string) => defHttp.post({ url: Api.closeArea, params: { id } }, { joinParamsToUrl: true });

/** 获取所有区域标点数据 */
export const getAllAreaApi = () => defHttp.get({ url: Api.allArea });

/** 获取地块运行状态统计（正常/告警/离线） */
export const getAreaRunStatusApi = () => defHttp.get({ url: Api.areaRunStatus });

/** 获取各地块运行时长对比（本月） */
export const getRunTimeCompareApi = (queryStr = '') => defHttp.get({ url: `${Api.runTimeCompare}${queryStr}` });

/** 获取地块场景数据（按 spaceId 查询地块的回路与场景，返回 result：scenes 场景 + circuits 回路） */
export const getSceneSpaceApi = (spaceId: string) =>
  defHttp.get({ url: Api.sceneSpace, params: { spaceId } }, { joinParamsToUrl: true });

/** 获取地块视频列表（按 spaceId 查询，spaceId 写死为 1） */
export const getVideoListBySpaceApi = (spaceId: string = '1') =>
  defHttp.get({ url: Api.videoListBySpace, params: { spaceId } }, { joinParamsToUrl: true });

