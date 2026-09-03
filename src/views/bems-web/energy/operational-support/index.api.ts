import { defHttp } from '/@/utils/http/axios'

enum Api {
  /** 按设备类别查询设备运行状态统计 */
  statisticsByCategoryId = '/sgai-fwbz-dev/fwbz/energyStatistics/device/statisticsByCategoryId',
  /** 图表区域通用接口 */
  iconAreaCommon = '/sgai-fwbz-dev/fwbz/echarts/returnAirCo2Trend/query',
}

/** 图表区域接口入参 */
export interface Request {
    /**
     * 属性名称：默认 "回风二氧化碳"，也可传 "回风温度" 等其它属性名复用此接口
     * 属性名称
     */
    attributeName?: string;
    /**
     * 设备 ID（支持单选字符串或多选数组）
     * 设备ID
     */
    deviceIds: string | number[];
    /**
     * 结束时间；为空时默认为当天 23:59:59
     * 结束时间
     */
    endTime?: string;
    /**
     * 聚合粒度：hour(小时)/15min(15分钟)/day(天)；默认 hour
     * 聚合粒度：hour/15min/day
     */
    granularity?: string;
    /**
     * 起始时间；为空时默认为当天 00:00:00
     * 起始时间
     */
    startTime?: string;
    /**
     * 阈值（CO2 设定值等参考线），可选；为空时不在前端绘制设定线
     * 阈值（参考线）
     */
    threshold?: number;
    [property: string]: any;
}

/**
 * 图表区域接口返回值字段定义
 *
 * ReturnAirCo2TrendVo
 */
export interface ReturnAirCo2TrendVo {
    /**
     * 图例数据
     * 每条曲线对应一个设备名称
     */
    legend?: string[];
    /**
     * 折线系列数据
     */
    series?: TrendSeries[];
    /**
     * 阈值（CO2 设定值等参考线）
     */
    threshold?: number;
    /**
     * 图表标题
     */
    title?: string;
    /**
     * 单位
     */
    unit?: string;
    /**
     * x 轴时间标签
     * 形如 [00:00, 01:00, ..., 23:00]
     */
    xAxis?: string[];
    [property: string]: any;
}

/**
 * 单条折线系列：name = 设备名（AHU-1），data 与 xAxis 等长；缺失值用 null
 *
 * TrendSeries
 */
export interface TrendSeries {
    /**
     * 数据点
     * 缺失值用 null，ECharts 会断开折线
     */
    data?: number[];
    /**
     * 设备ID
     */
    deviceId?: number;
    /**
     * 系列名称（设备名/设备编号）
     */
    name?: string;
    [property: string]: any;
}


/**
 * 设备类别信息
 */
export interface EquipmentCategory {
  id?: number
  categoryName?: string
  [property: string]: any
}

/**
 * 设备运行状态统计数据
 */
export interface DeviceRunStateStatisticsDto {
  category?: EquipmentCategory
  /** 总数 */
  count?: number
  /** 运行设备 */
  equipmentCount?: number
  /** 仪表数量 */
  measuringCount?: number
  /** 离线 */
  offline?: number
  /** 在线 */
  online?: number
  [property: string]: any
}

/**
 * 按设备类别ID查询设备运行状态统计（总数、在线数等）
 * @param categoryId 设备类别ID
 */
export const getStatisticsByCategoryId = (categoryId: number | string) =>
  defHttp.get<DeviceRunStateStatisticsDto>({ url: Api.statisticsByCategoryId, params: { categoryId } })

/**
 * 图表区域通用接口（回风二氧化碳/回风温度等趋势数据）
 * @param params 请求参数
 */
export const iconAreaCommon = (params: Request) => defHttp.get<ReturnAirCo2TrendVo>({ url: Api.iconAreaCommon, params })
