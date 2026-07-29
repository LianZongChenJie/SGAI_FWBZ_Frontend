import { defHttp } from '/@/utils/http/axios';

enum Api {
  getMonthPlanApi = '/maintenance/plan/queryAll',
  getPlanDetailApi = '/maintenance/planModel/detail',
}

/**
 * 获取月度计划列表
 * @param params { yearMonth: 'YYYY-MM' }
 */
export const getMonthPlanApi = (params) => defHttp.get({ url: Api.getMonthPlanApi, params }, { joinParamsToUrl: true });

/**
 * 获取计划详情
 * @param params 计划ID
 */
export const getPlanDetailApi = (params) =>
  defHttp.get({ url: Api.getPlanDetailApi, params }, { joinParamsToUrl: true });
