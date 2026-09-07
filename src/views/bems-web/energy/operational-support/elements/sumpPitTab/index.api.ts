import { defHttp } from '/@/utils/http/axios'

enum Api {
  /** 设备空间位置 */
  spaceTree = '/sgai-fwbz-dev/fwbz/device/findNameAndIdByCategory',
  /** 设备属性列表（按设备ID查询） */
  listByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
  /** 设备列表 */
  deviceList = '/sgai-fwbz-dev/fwbz/device/list',
  /** 集水坑汇总信息 */
  sumpPitSummary = '/sgai-fwbz-dev/fwbz/collectionPitStatistics/statistics',
  /** 查询设备控制点位 */
  findDeviceControlPoint = '/sgai-fwbz-dev/fwbz/deviceAttribute/getControlByDeviceId',
  /** 实时写入数据 */
  realTimeData = '/sgai-fwbz-dev/fwbz/buildingControl/updRealData',
}

/**
 * 集水坑汇总信息
 *
 */
export interface CollectionPitStatisticsDto {
    /**
     * 故障设备总数
     */
    faultDeviceCount?: number;
    /**
     * 液位告警设备数
     */
    liquidLevelAlarmCount?: number;
    [property: string]: any;
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
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree, params: { categoryIds: '34' } })

/**
 * 集水坑汇总信息
 */
export const getSumpPitSummary = () => defHttp.get<{ data: CollectionPitStatisticsDto }>({ url: Api.sumpPitSummary })

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: Api.listByDeviceId, params })

/**
 * 设备列表（集水坑 categoryIds=34）
 */
export const selectDevice = (params = {}) => defHttp.get({ url: Api.deviceList, params })

/**
 * 设备列表导出
 */
export const exportData = (params) => defHttp.get({ url: '/sgai-fwbz-dev/fwbz/device/export', params: params, responseType: 'blob' }, { isTransformResponse: false });

/**
 * 查询设备控制点
 */
export const findDeviceControlPoint = (params = {}) => defHttp.get({ url: Api.findDeviceControlPoint, params })

/**
 * 实时数据写入
 */
export const realTimeData = (data = {}) => defHttp.post({ url: Api.realTimeData, data })
