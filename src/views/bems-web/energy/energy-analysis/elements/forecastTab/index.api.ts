import { defHttp } from '/@/utils/http/axios'

enum Api {
  forecast = '/sgai-fwbz-dev/fwbz/loadForecast/predict',
  optimizeList = '/sgai-fwbz-dev/fwbz/loadForecast/optimizeList',
}

/**
 * 获取负荷预测数据
 * @param params - 包含 type（day / month / year / overview）
 */
export const getLoadForecast = (params = {}) => defHttp.get({ url: Api.forecast, params })

/**
 * 获取优化决策策略列表
 * @param params - 分页参数 pageNo / pageSize
 */
export const getOptimizeStrategyList = (params = {}) => defHttp.get({ url: Api.optimizeList, params })
