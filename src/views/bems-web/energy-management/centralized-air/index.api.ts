import { defHttp } from '/@/utils/http/axios'

enum Api {
  overview = '/sgai-fwbz-dev/fwbz/centralizedAirCooling/overview',
}

/**
 * 集中风冷系统总览数据
 */
export interface CentralizedAirCoolingOverviewDto {
  /**
   * 风冷系统COP
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
   * 风冷系统总功率(kW)
   */
  totalPower?: number
  [property: string]: any
}

/**
 * 获取集中风冷系统总览数据
 */
export const getCentralizedAirOverview = () => defHttp.get<CentralizedAirCoolingOverviewDto>({ url: Api.overview })
