import { defHttp } from '/@/utils/http/axios'

enum Api {
  overviewStatistics = '/sgai-tp/fwbz/operationSupport/overviewStatistics',
  equipmentOverview = '/sgai-tp/fwbz/operationSupport/equipmentOverview',
}

/** 获取概览统计数据 */
export const getOverviewStatistics = (params = {}) => defHttp.get({ url: Api.overviewStatistics, params })

/** 获取设备总览 */
export const getEquipmentOverview = (params = {}) => defHttp.get({ url: Api.equipmentOverview, params })
