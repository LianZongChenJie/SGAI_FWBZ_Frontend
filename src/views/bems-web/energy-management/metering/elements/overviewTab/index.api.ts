import { defHttp } from '/@/utils/http/axios';

enum Api {
  statistics = '/sgai-tp/fwbz/energyMetering/statistics',
  measuringListWithMouth = '/sgai-tp/fwbz/deviceData/measuringList',
  findDayByConfig = '/sgai-tp/fwbz/meterPointData/findDayEnergyStructure',
  findMonthByConfig = '/sgai-tp/fwbz/meterPointData/findMonthEnergyStructure',
  findYearByConfig = '/sgai-tp/fwbz/meterPointData/findYearEnergyStructure',
  findDayVenueElectricity = '/sgai-tp/fwbz/meterPointData/findDayVenueElectricity',
  findMonthVenueElectricity = '/sgai-tp/fwbz/meterPointData/findMonthVenueElectricity',
  findYearVenueElectricity = '/sgai-tp/fwbz/meterPointData/findYearVenueElectricity',
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
