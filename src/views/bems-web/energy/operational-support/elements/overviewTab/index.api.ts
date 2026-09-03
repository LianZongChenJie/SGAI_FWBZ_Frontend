import { defHttp } from '/@/utils/http/axios'

enum Api {
  overviewStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/overviewStatistics',
  /** 获取设备总览 */
  equipmentOverview = '/sgai-fwbz-dev/fwbz/operationSupport/equipmentOverview',

  /** 设备状态监控（各系统设备在线统计） */
  deviceStat = '/sgai-fwbz-dev/fwbz/runGuarantee/deviceStat',
}

/**
 * 各系统设备在线统计
 *
 * SystemDeviceStatVO
 */
export interface SystemDeviceStatVO {
    /** 设备总数 */
    deviceCount?: number;
    /** 在线数量 */
    online?: number;
    /** 在线率（百分比整数，如100表示100%） */
    onlineRate?: number;
    /** 系统名称（对应设备类型名称） */
    systemName?: string;
    [property: string]: any;
}


/** 获取概览统计数据 */
export const getOverviewStatistics = (params = {}) => defHttp.get({ url: Api.overviewStatistics, params })

/** 获取设备总览 */
export const getEquipmentOverview = (params = {}) => defHttp.get({ url: Api.equipmentOverview, params })

/**
 * 各系统设备在线统计
 */
export const getDeviceStat = () => defHttp.get<SystemDeviceStatVO[]>({ url: Api.deviceStat })
