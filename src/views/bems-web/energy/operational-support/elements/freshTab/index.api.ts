import { defHttp } from '/@/utils/http/axios'

enum Api {
  freshAirHandlingUnitList = '/sgai-fwbz-dev/fwbz/operationSupport/freshAirHandlingUnitList',
  freshAirStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/freshAirStatistics',
  pm25 = '/sgai-fwbz-dev/fwbz/operationSupport/pm25',
  freshSupplyAirTemperature = '/sgai-fwbz-dev/fwbz/operationSupport/freshSupplyAirTemperature',
  freshReturnAirTemperature = '/sgai-fwbz-dev/fwbz/operationSupport/freshReturnAirTemperature',
  /** 设备空间位置 */
  spaceTree = '/sgai-fwbz-dev/fwbz/device/findNameAndIdByCategory',
  /** 设备属性列表（按设备ID查询） */
  listByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
  /** 设备列表 */
  deviceList = '/sgai-fwbz-dev/fwbz/device/list',
}

/** 设备空间位置 */
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree, params: { categoryIds: '17' } })

/**
 * 新风机组列表
 */
export const getFreshAirUnitList = (params = {}) => defHttp.get({ url: Api.freshAirHandlingUnitList, params })

/** 设备列表（新风机组 categoryIds=17） */
export const selectDevice = (params = {}) => defHttp.get({ url: Api.deviceList, params })

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
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: Api.listByDeviceId, params })

/**
 * 设备列表导出
 */
export const airControl = (data: any[]) => defHttp.post({ url: '/sgai-fwbz-dev/fwbz/operationSupport/airControl', data })

/** 设备列表导出 */
export const exportData = (params) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/device/export', params: params, responseType: 'blob' }, { isTransformResponse: false })
