import { defHttp } from '/@/utils/http/axios'

enum Api {
  overview = '/sgai-fwbz-dev/fwbz/centralizedWaterCooling/overview',
}

/**
 * 集中水冷系统总览数据
 */
export interface ICentralizedWaterOverview {
  /**
   * 系统效能COP
   */
  cop?: number
  /**
   * 当前制冷量(kW)
   */
  currentCoolingCapacity?: number
  /**
   * 今日累计用电量(kWh)
   */
  todayPowerConsumption?: number
  /**
   * 系统总功率(kW)
   */
  totalPower?: number
  [property: string]: any
}

/**
 * 获取集中水冷系统总览数据
 */
export const getCentralizedWaterOverview = () => defHttp.get({ url: Api.overview })
