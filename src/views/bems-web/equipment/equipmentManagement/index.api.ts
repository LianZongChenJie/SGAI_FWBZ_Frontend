import { fwbzHttp } from '/@/utils/http/axios';
import { defHttp } from '/@/utils/http/axios'

enum Api {
  venueInfoList = '/sgai-tp/fwbz/venueInfo/list',
  deviceRunStateStatistics = '/sgai-tp/fwbz/device/deviceRunStateStatistics',
}

/** 获取设备信息列表 */
export const getVenueInfoList = (params) => 
  defHttp.get({ url: Api.venueInfoList, params });

/** 获取设备运行状态统计 */
export const getDeviceRunStateStatistics = (params) =>
   defHttp.get({ url: Api.deviceRunStateStatistics, params });
