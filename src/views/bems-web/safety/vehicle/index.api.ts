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
