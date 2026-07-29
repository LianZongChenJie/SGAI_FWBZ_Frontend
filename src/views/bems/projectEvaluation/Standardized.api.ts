import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getProjectOverviewApi = '/bems/project/evaluation/getOverview',
  getInvestmentRankingApi = '/bems/project/evaluation/getInvestmentRanking',
}

/**
 * 获取项目总览数据
 */
export const getProjectOverviewApi = () => defHttp.get({ url: Api.getProjectOverviewApi }); 

/**
 * 获取项目投资排名数据
 */
export const getInvestmentRankingApi = () => defHttp.get({ url: Api.getInvestmentRankingApi }); 
