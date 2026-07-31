import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  venueOptions = '/sgai-fwbz/fwbz/venueInfo/listAll',
  categoryOptions = '/sgai-fwbz /bems/equipmentCategory/list',
}

/**
 * 获取场馆列表
 */
export const getVenueOptions = (params?: Record<string, any>) =>
  fwbzHttp.get({ url: Api.venueOptions, params });

/**
 * 获取设备类型列表
 */
export const getCategoryOptions = (params?: Record<string, any>) =>
  fwbzHttp.get({ url: Api.categoryOptions, params });
