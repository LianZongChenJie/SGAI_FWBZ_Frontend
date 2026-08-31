import { defHttp } from '/@/utils/http/axios'

enum Api {
  /** 设备空间位置 */
  spaceTree = '/sgai-fwbz-dev/fwbz/device/findNameAndIdByCategory',
  /** 设备属性列表（按设备ID查询） */
  listByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
  /** 设备列表 */
  deviceList = '/sgai-fwbz-dev/fwbz/device/list',
  /** 风机盘管汇总统计 */
  fanCoilStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/fanCoilStatistics',
}

/**
 * 设备空间位置返回值
 */
export interface ResultListDevice {
  id?: number
  deviceCode?: string
  deviceName?: string
  categoryId?: number
  spaceId?: number
  spaceName?: string
  [property: string]: any
}

/** 设备空间位置 */
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree, params: { categoryIds: '40' } })

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: Api.listByDeviceId, params })

/**
 * 设备列表（风机盘管 categoryIds=40）
 */
export const selectDevice = (params = {}) => defHttp.get({ url: Api.deviceList, params })

/**
 * 设备列表导出
 */
export const exportData = (params) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/device/export', params: params, responseType: 'blob' }, { isTransformResponse: false });

/**
 * 风机盘管汇总统计数据
 */
export const getFanCoilStatistics = (params = {}) => defHttp.get({ url: Api.fanCoilStatistics, params })
