import { defHttp } from '/@/utils/http/axios';

enum Api {
  statistics = '/sgai-fwbz-dev/fwbz/energyMetering/statistics',
  measuringListWithMouth = '/sgai-fwbz-dev/fwbz/deviceData/measuringList',
  findDayByConfig = '/sgai-fwbz-dev/fwbz/meterPointData/findDayEnergyStructure',
  findMonthByConfig = '/sgai-fwbz-dev/fwbz/meterPointData/findMonthEnergyStructure',
  findYearByConfig = '/sgai-fwbz-dev/fwbz/meterPointData/findYearEnergyStructure',
  findDayVenueElectricity = '/sgai-fwbz-dev/fwbz/meterPointData/findDayVenueElectricity',
  findMonthVenueElectricity = '/sgai-fwbz-dev/fwbz/meterPointData/findMonthVenueElectricity',
  findYearVenueElectricity = '/sgai-fwbz-dev/fwbz/meterPointData/findYearVenueElectricity',
  /** 导出报表 */
  exportData = '/sgai-fwbz-dev/fwbz/deviceData/measuringListExport',
}

/**
 * 获取能源计量概览统计数据
 */
export const getEnergyMeteringStatistics = () => defHttp.get({ url: Api.statistics });

/**
 * 获取计量表计数据（含月度数据）
 */
export const getMeasuringListWithMouth = (params = {}) => defHttp.get({ url: Api.measuringListWithMouth, params });

/**
 * 统一计量点数据日查询接口
 * @param params - 包含 meterPointData 区分模块（venueElectricity / energyStructure）
 */
export const findDayByConfig = (params = {}) => defHttp.get({ url: Api.findDayByConfig, params });

/**
 * 统一计量点数据月查询接口
 * @param params - 包含 meterPointData 区分模块（venueElectricity / energyStructure）
 */
export const findMonthByConfig = (params = {}) => defHttp.get({ url: Api.findMonthByConfig, params });

/**
 * 统一计量点数据年查询接口
 * @param params - 包含 meterPointData 区分模块（venueElectricity / energyStructure）
 */
export const findYearByConfig = (params = {}) => defHttp.get({ url: Api.findYearByConfig, params });

/**
 * 各场馆用电 - 日查询
 */
export const findDayVenueElectricity = (params = {}) => defHttp.get({ url: Api.findDayVenueElectricity, params });

/**
 * 各场馆用电 - 月查询
 */
export const findMonthVenueElectricity = (params = {}) => defHttp.get({ url: Api.findMonthVenueElectricity, params });

/**
 * 各场馆用电 - 年查询
 */
export const findYearVenueElectricity = (params = {}) => defHttp.get({ url: Api.findYearVenueElectricity, params });

enum DeviceApi {
  /** 设备属性列表（按设备ID查询） */
  listByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
}

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: DeviceApi.listByDeviceId, params });

/**
 * 导出计量表计数据
 */
export const exportData = (params = {}) => defHttp.get({ url: Api.exportData, params, responseType: 'blob' }, { isTransformResponse: false });
