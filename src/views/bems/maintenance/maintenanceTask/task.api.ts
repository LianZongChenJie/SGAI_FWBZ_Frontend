import { defHttp } from '/@/utils/http/axios';

enum Api {
  listApi = '/deviceMaintenance/weeklySummary/queryByYearWithFiles',
  weekListApi = '/deviceMaintenance/workPlan/queryByWeek',
  addApi = '/deviceMaintenance/weeklySummary/add',
  deleteApi = '/deviceMaintenance/weeklySummary/delete',
}

export const getList = (params) => defHttp.get({ url: Api.listApi, params });

export const getWeekList = (params) => defHttp.get({ url: Api.weekListApi, params });

export const addTask = (data) => defHttp.post({ url: Api.addApi, data });

export const deleteTask = (params) => defHttp.delete({ url: Api.deleteApi, params }, { joinParamsToUrl: true });
