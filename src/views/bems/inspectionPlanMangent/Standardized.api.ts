import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getPlanmangebtListApi = '/maintenance/plan/queryPage',
  getPlanDetailApi = '/maintenance/plan/findDetail',

  executeNowApi = '/maintenance/plan/executeNow',
  getUnitOrgListApi = '/maintenance/team/list',
  saveOrUpdateOneApi = '/maintenance/plan/saveOrUpdateOne',
  removeByIdsApi = '/maintenance/plan/removeByIds',

}

/**
 * 计划管理列表
 * @param params
 */
export const getPlanmangebtListApi = (params) => defHttp.get({ url: Api.getPlanmangebtListApi, params }, { joinParamsToUrl: true });


/**
 * 计划详情
 * @param params
 */
export const getPlanDetailApi = (params) => defHttp.get({ url: Api.getPlanDetailApi, params });

/**
 * 即时生效
 * @param params
 */
export const executeNowApi = (params) => defHttp.get({ url: Api.executeNowApi, params }, { joinParamsToUrl: true });

/**
 * 获取班组
 * 
 */
export const getUnitOrgListApi = () => defHttp.get({ url: Api.getUnitOrgListApi});

/**
 * 修改保存
 * @param params
 */
export const saveOrUpdateOneApi = (params) => defHttp.post({ url: Api.saveOrUpdateOneApi, params }, { joinParamsToUrl: true });

/**
 * 计划删除
 * @param params
 */
export const removeByIdsApi = (params) => defHttp.post({ url: Api.removeByIdsApi, params });
