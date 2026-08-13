import { defHttp } from '/@/utils/http/axios'

enum Api {
  statistics = '/sgai-tp/fwbz/meteringPoint/statistics',
}

/**
 * 计量规则统计汇总数据（顶部四个卡片）
 */
export const getRulesStatistics = (params = {}) => defHttp.get({ url: Api.statistics, params })
