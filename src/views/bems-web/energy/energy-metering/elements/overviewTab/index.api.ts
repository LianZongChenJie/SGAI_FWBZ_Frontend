import { defHttp } from '/@/utils/http/axios';

enum Api {
  statistics = '/sgai-tp/fwbz/energyMetering/statistics',
  measuringListWithMouth = '/sgai-tp/fwbz/deviceData/measuringList',
  findDayByConfig = '/sgai-tp/fwbz/meterPointData/findDayByConfig',
  findMonthByConfig = '/sgai-tp/fwbz/meterPointData/findMonthByConfig',
  findYearByConfig = '/sgai-tp/fwbz/meterPointData/findYearByConfig',
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
