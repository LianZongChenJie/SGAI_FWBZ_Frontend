import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  venueInfoList = '/sgai-fwbz/fwbz/venueInfo/list',
}

/** 获取场地列表 */
export const getVenueInfoList = (params) => fwbzHttp.get({ url: Api.venueInfoList, params });

