import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  /** 汇总统计 */
  sunnary = '/sgai-fwbz-dev/fwbz/parkingStatistics/summary',
  /** 停车记录查询 */
  recordList = '/sgai-fwbz-dev/fwbz/parking/record/listPage',
  /** 停车场接口 */
  parkingLot = '/sgai-fwbz-dev/fwbz/parking/record/parkingLotList',
  /** 车辆类型下拉 */
  parkType = '/sgai-fwbz-dev/fwbz/parking/record/parkTypeList',
  /** 停车流量趋势 */
  parkingFlow24h = '/sgai-fwbz-dev/fwbz/parkingStatistics/parkingFlow24h',
  /** 停车场实时车位分布 */
  parkingSpaceDistribution = '/sgai-fwbz-dev/fwbz/parkingStatistics/parkingSpaceDistribution',
}

/**
 * 停车场实时车位分布数据
 */
export interface ResultListParkingSpaceStatVO {
    /**
     * 返回代码
     */
    code?: number;
    /**
     * 返回处理消息
     */
    message?: string;
    /**
     * 返回数据对象
     */
    result?: ParkingSpaceStatVO[];
    /**
     * 成功标志
     */
    success?: boolean;
    /**
     * 时间戳
     */
    timestamp?: number;
    [property: string]: any;
}

/**
 * 停车场实时车位分布 VO（用于"停车场实时状态"统计图）
 *
 * ParkingSpaceStatVO
 */
export interface ParkingSpaceStatVO {
    /**
     * 停车场ID
     */
    id?: number;
    /**
     * 纬度
     */
    lat?: number;
    /**
     * 经度
     */
    lng?: number;
    /**
     * 停车场名称（如 P1）
     */
    name?: string;
    /**
     * 饱和度
     */
    saturation?: number;
    /**
     * 剩余车位数
     */
    shengyu?: number;
    /**
     * 车位状态（宽松/适中/拥挤）
     */
    state?: string;
    /**
     * 总车位数
     */
    total?: number;
    /**
     * 使用率（百分比，保留 1 位小数）
     */
    usageRate?: number;
    /**
     * 已用车位数
     */
    used?: number;
    /**
     * 使用率（原始值，来自API）
     */
    usedRate?: number;
    [property: string]: any;
}

/**
 * 停车记录查询请求参数
 */
export interface Request {
  /** 主键 */
  id?: number;
  /** 当前页码 */
  pageNo?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 停车场名称 */
  parkingLot?: string;
  /** 车牌号 */
  plateNo?: string;
  /** 类型，如进场、出场 */
  parkType?: string;
  [property: string]: any;
}

/**
 * 停车记录响应数据项
 */
export interface ParkingRecord {
  /** 创建人 */
  createBy?: string;
  /** 创建日期 */
  createTime?: string;
  /** 方向，如入口、出口 */
  direction?: string;
  /** 记录创建时间 */
  gmtCreate?: string;
  /** 记录更新时间 */
  gmtModified?: string;
  /** 主键 */
  id?: number;
  /** 当前页码 */
  pageNo?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 日期 */
  parkDate?: string;
  /** 停车时长，如 2小时30分钟 */
  parkDuration?: string;
  /** 停车场名称 */
  parkingLot?: string;
  /** 时间，格式 HH24:MI:SS */
  parkTime?: string;
  /** 类型，如进场、出场 */
  parkType?: string;
  /** 车牌号 */
  plateNo?: string;
  /** 车位号 */
  spaceNo?: string;
  /** 所属部门 */
  sysOrgCode?: string;
  /** 更新人 */
  updateBy?: string;
  /** 更新日期 */
  updateTime?: string;
  [property: string]: any;
}

/** 停车场下拉选项数据项 */
export interface ParkingLotOption {
  /** 停车场名称（既是 key 也是 value） */
  parkingLot?: string;
  [property: string]: any;
}

/** 车辆类型下拉选项数据项 */
export interface ParkTypeOption {
  /** 类型名称（既是 key 也是 value） */
  parkType?: string;
  [property: string]: any;
}

/** 统计卡片数据项 */
export interface StatItem {
  /** 卡片标题 */
  title: string
  /** 卡片数值 */
  value: string
  /** 变化描述 */
  context: string
}

/** 获取统计卡片汇总 */
export const getSummary = () => fwbzHttp.get({ url: Api.sunnary });

/** 停车记录查询（分页） */
export const getRecordList = (params: Request) => fwbzHttp.get({ url: Api.recordList, params });

/** 获取停车场下拉列表 */
export const getParkingLotList = () => fwbzHttp.get({ url: Api.parkingLot });

/** 获取车辆类型下拉列表 */
export const getParkTypeList = () => fwbzHttp.get({ url: Api.parkType });

/** 获取24小时停车流量趋势 */
export const getParkingFlow24h = () => fwbzHttp.get({ url: Api.parkingFlow24h });

/** 获取停车场实时车位分布 */
export const getParkingSpaceDistribution = () => fwbzHttp.get({ url: Api.parkingSpaceDistribution });
