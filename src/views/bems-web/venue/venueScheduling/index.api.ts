import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  venueInfoList = '/sgai-fwbz-dev/fwbz/venueInfo/list',
  addVenue = '/sgai-fwbz-dev/fwbz/venueInfo/add',
  editVenue = '/sgai-fwbz-dev/fwbz/venueInfo/edit',
  delVenue = '/sgai-fwbz-dev/fwbz/venueInfo/delete',
}

/** 获取场地列表 */
export const getVenueInfoList = (params) => fwbzHttp.get({ url: Api.venueInfoList, params });

/** 新增场馆 */
export const addVenueInfo = (params) => fwbzHttp.post({ url: Api.addVenue, params });

