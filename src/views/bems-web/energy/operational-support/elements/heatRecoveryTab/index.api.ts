import { defHttp } from '/@/utils/http/axios'

enum Api {
  /** 设备空间位置 */
  spaceTree = '/sgai-fwbz-dev/fwbz/device/findNameAndIdByCategory',
  /** 设备属性列表（按设备ID查询） */
  listByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
  /** 设备列表 */
  deviceList = '/sgai-fwbz-dev/fwbz/device/list',
  /** 热回收机组汇总统计 */
  heatRecoveryStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/heatRecoveryStatistics',
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
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree, params: { categoryIds: '37' } })

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: Api.listByDeviceId, params })

/**
 * 设备列表（热回收机组 categoryIds=37）
 */
export const selectDevice = (params = {}) => defHttp.get({ url: Api.deviceList, params })

/**
 * 设备列表导出
 */
export const exportData = (params) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/device/export', params: params, responseType: 'blob' }, { isTransformResponse: false });

/**
 * 热回收机组汇总统计数据
 */
export const getHeatRecoveryStatistics = (params = {}) => defHttp.get({ url: Api.heatRecoveryStatistics, params })
