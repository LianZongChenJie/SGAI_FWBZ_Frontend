import { defHttp } from '/@/utils/http/axios'

enum Api {
  airConditioningUnitList = '/sgai-tp/fwbz/operationSupport/airConditioningUnitList',
  airConditioningUnitStatistics = '/sgai-tp/fwbz/operationSupport/airConditioningUnitStatistics',
  airEnergyFindDay = '/sgai-tp/fwbz/operationSupport/airEnergyFindDay',
  listByDeviceId = '/sgai-tp/fwbz/deviceAttribute/listByDeviceId',
}

/**
 * 空调机组实时监测列表
 */
export const getAcUnitList = (params = {}) => defHttp.get({ url: Api.airConditioningUnitList, params })

/**
 * 空调机组统计数据
 */
export const getAcUnitStatistics = (params = {}) => defHttp.get({ url: Api.airConditioningUnitStatistics, params })

/**
 * 空调能耗趋势（日）
 */
export const getAirEnergyDay = (params = {}) => defHttp.get({ url: Api.airEnergyFindDay, params })

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: Api.listByDeviceId, params })
