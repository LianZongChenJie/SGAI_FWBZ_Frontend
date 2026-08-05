import { defHttp } from '/@/utils/http/axios'

enum Api {
  powerDistributionSystemList = '/sgai-tp/fwbz/operationSupport/powerDistributionSystemList',
  activePower = '/sgai-tp/fwbz/operationSupport/activePower',
  powerStatistics = '/sgai-tp/fwbz/operationSupport/powerStatistics',
}

/**
 * 配电系统列表
 */
export const getPowerUnitList = (params = {}) => defHttp.get({ url: Api.powerDistributionSystemList, params })

/**
 * 有功功率
 */
export const getActivePower = (params = {}) => defHttp.get({ url: Api.activePower, params })

/**
 * 配电统计
 */
export const getPowerStatistics = (params = {}) => defHttp.get({ url: Api.powerStatistics, params })
