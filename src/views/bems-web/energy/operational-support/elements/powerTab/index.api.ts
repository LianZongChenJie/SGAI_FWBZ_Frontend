import { defHttp } from '/@/utils/http/axios'

enum Api {
  powerDistributionSystemList = '/sgai-fwbz-dev/fwbz/operationSupport/powerDistributionSystemList',
  activePower = '/sgai-fwbz-dev/fwbz/operationSupport/activePower',
  powerStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/powerStatistics',
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

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId', params })

/**
 * 设备列表导出
 */
export const exportData = (params) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/device/export', params: params, responseType: 'blob' }, { isTransformResponse: false });
