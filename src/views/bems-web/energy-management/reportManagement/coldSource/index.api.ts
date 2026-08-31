import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/sgai-fwbz-dev/fwbz/coldSource/history/page',
  exportData = '/sgai-fwbz-dev/fwbz/coldSource/history/export',
  /** 冷源点位下拉接口 */
  coldSourcePoint = '/sgai-fwbz-dev/fwbz/coldSource/saveTagIds',
}

/**
 * 冷源历史数据分页查询
 */
export const getList = (params) => defHttp.get({ url: Api.list, params });

/**
 * 冷源历史数据导出
 */
export const exportData = (params) => defHttp.get({ url: Api.exportData, params: params, responseType: 'blob' }, { isTransformResponse: false });

/**
 * 冷源采集点下拉
 */
export const coldSourcePoint = () => defHttp.get({ url: Api.coldSourcePoint });
