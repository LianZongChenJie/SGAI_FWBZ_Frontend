import { defHttp } from '/@/utils/http/axios'

enum Api {
  freshAirHandlingUnitList = '/sgai-tp/fwbz/operationSupport/freshAirHandlingUnitList',
  freshAirStatistics = '/sgai-tp/fwbz/operationSupport/freshAirStatistics',
  pm25 = '/sgai-tp/fwbz/operationSupport/pm25',
  freshSupplyAirTemperature = '/sgai-tp/fwbz/operationSupport/freshSupplyAirTemperature',
  freshReturnAirTemperature = '/sgai-tp/fwbz/operationSupport/freshReturnAirTemperature',
}

/**
 * 新风机组列表
 */
export const getFreshAirUnitList = (params = {}) => defHttp.get({ url: Api.freshAirHandlingUnitList, params })

/**
 * 新风机组统计
 */
export const getFreshAirStatistics = (params = {}) => defHttp.get({ url: Api.freshAirStatistics, params })

/**
 * 各机组PM2.5分布
 */
export const getPm25 = (params = {}) => defHttp.get({ url: Api.pm25, params })

/**
 * 新风送风温度
 */
export const getFreshSupplyAirTemperature = (params = {}) => defHttp.get({ url: Api.freshSupplyAirTemperature, params })

/**
 * 新风回风温度
 */
export const getFreshReturnAirTemperature = (params = {}) => defHttp.get({ url: Api.freshReturnAirTemperature, params })
