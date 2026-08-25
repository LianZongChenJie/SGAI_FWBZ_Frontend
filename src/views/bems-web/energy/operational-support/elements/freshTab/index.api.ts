import { defHttp } from '/@/utils/http/axios'

enum Api {
  freshAirHandlingUnitList = '/sgai-fwbz-dev/fwbz/operationSupport/freshAirHandlingUnitList',
  freshAirStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/freshAirStatistics',
  pm25 = '/sgai-fwbz-dev/fwbz/operationSupport/pm25',
  freshSupplyAirTemperature = '/sgai-fwbz-dev/fwbz/operationSupport/freshSupplyAirTemperature',
  freshReturnAirTemperature = '/sgai-fwbz-dev/fwbz/operationSupport/freshReturnAirTemperature',
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

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId', params })

/**
 * 空调机组控制
 */
export const airControl = (data: any[]) => defHttp.post({ url: '/sgai-fwbz-dev/fwbz/operationSupport/airControl', data })
