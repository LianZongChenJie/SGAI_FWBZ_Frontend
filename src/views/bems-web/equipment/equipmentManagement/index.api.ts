import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  venueInfoList = '/sgai-fwbz/fwbz/venueInfo/list',
  deviceRunStateStatistics = '/jeecg-system/sgai-tp/fwbz/device/deviceRunStateStatistics',
}

/** 获取设备信息列表 */
export const getVenueInfoList = (params) => 
  fwbzHttp.get({ url: Api.venueInfoList, params });

/** 获取设备运行状态统计 */
export const getDeviceRunStateStatistics = (params) =>
   fwbzHttp.get({ url: Api.deviceRunStateStatistics, params });
