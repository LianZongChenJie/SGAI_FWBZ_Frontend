import { defHttp } from '/@/utils/http/axios';

enum Api {
  statistics = '/sgai-tp/fwbz/energyMetering/statistics',
  measuringListWithMouth = '/sgai-tp/fwbz/deviceData/measuringList',
}

/**
 * 获取能源计量概览统计数据
 */
export const getEnergyMeteringStatistics = () => defHttp.get({ url: Api.statistics });

/**
 * 获取计量表计数据（含月度数据）
 */
export const getMeasuringListWithMouth = (params = {}) => defHttp.get({ url: Api.measuringListWithMouth, params });
