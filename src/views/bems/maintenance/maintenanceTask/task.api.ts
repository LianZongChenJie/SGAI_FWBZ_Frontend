import { defHttp } from '/@/utils/http/axios';
enum Api {
  listApi = '/deviceMaintenance/weeklySummary/queryByYearWithFiles',
}

/**
 * 计划管理列表
 * @param params
 */
export const getList = (params) => defHttp.get({ url: Api.listApi, params });