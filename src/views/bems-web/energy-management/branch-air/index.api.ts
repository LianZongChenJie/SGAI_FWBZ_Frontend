import { defHttp } from '/@/utils/http/axios'

enum Api {
  overview = '/sgai-fwbz-dev/fwbz/branchAirCooling/overview',
}

/**
 * 分馆风冷系统总览数据
 */
export interface BranchAirCoolingOverviewDto {
  /**
   * 分馆综合COP
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
   * 分馆风冷总功率(kW)
   */
  totalPower?: number
  [property: string]: any
}

/**
 * 获取分馆风冷系统总览数据
 */
export const getBranchAirOverview = () => defHttp.get<BranchAirCoolingOverviewDto>({ url: Api.overview })
