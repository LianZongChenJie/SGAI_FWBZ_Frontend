import { defHttp } from '/@/utils/http/axios'

enum Api {
  airConditioningUnitList = '/sgai-fwbz-dev/fwbz/operationSupport/airConditioningUnitList',
  airConditioningUnitStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/airConditioningUnitStatistics',
  airEnergyFindDay = '/sgai-fwbz-dev/fwbz/operationSupport/airEnergyFindDay',
  supplyAirTemperature = '/sgai-fwbz-dev/fwbz/operationSupport/supplyAirTemperature',
  returnAirTemperature = '/sgai-fwbz-dev/fwbz/operationSupport/returnAirTemperature',
  listByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
  /** 设备空间位置 */
  spaceTree = '/sgai-fwbz-dev/fwbz/device/findNameAndIdByCategory',
  /** 设备基础信息列表 */
  deviceBaseInfoList = '/sgai-fwbz-dev/fwbz/device/list',
}

/**
 * 设备信息列表请求入参
 */
export interface Request {
    
    /**
     * 设备类别id
     */
    categoryId?: number;
    
    pageNo?: number;
    pageSize?: number;
    /**
     * 空间位置id
     */
    spaceId?: number;
    /**
     * 空间位置
     */
    spaceName?: string;
    /**
     * 场馆id
     */
    venueId?: number;
    [property: string]: any;
}


/** 设备信息列表 */
export const getDeviceBaseInfoList = (params = {}) => defHttp.get({ url: Api.deviceBaseInfoList, params: {...params, categoryId: '8'} })

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
 * 送风温度趋势
 */
export const getSupplyAirTemperature = (params = {}) => defHttp.get({ url: Api.supplyAirTemperature, params })

/**
 * 回风温度趋势
 */
export const getReturnAirTemperature = (params = {}) => defHttp.get({ url: Api.returnAirTemperature, params })

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: Api.listByDeviceId, params })

/**
 * 空调机组控制
 */
export const airControl = (data: any[]) => defHttp.post({ url: '/sgai-fwbz-dev/fwbz/operationSupport/airControl', data })

/** 设备空间位置 */
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree, params: {categoryIds: '8'} });

/** 设备列表导出 */
export const exportData = (params) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/device/export', params: params, responseType: 'blob' }, { isTransformResponse: false });
