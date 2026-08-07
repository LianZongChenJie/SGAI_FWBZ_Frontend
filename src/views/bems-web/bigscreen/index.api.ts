import { fwbzHttp } from '/@/utils/http/axios';
import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 统计今日巡检完成数量 */
    todayCheck = '/jeecgboot/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/todayCheck',
    /** 待处理告警异常 */
    alarmException = '/jeecgboot/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/pendingAlarm',
    
    /** 故障告警 */
    /** 告警记录分页列表 */
    alarmRecordList = '/sgai-tp/fwbz/alarm/record/listPage',
    /** 告警统计 */
    alarmStatistics = '/sgai-tp/fwbz/alarm/record/statistics',
    /** 告警趋势 */
    alarmTrendRecently = '/sgai-tp/fwbz/alarm/record/alarmTrendRecently',
    /** 今日数据量 */
    todayDataSize = '/jeecgboot/sgai-fwbz-dev/fwbz/interfaceStatistics/todayDataSize',
    /** 数据采集点 */
    collectionPoint = '/jeecgboot/sgai-fwbz-dev/fwbz/dataCollection/collectionPointCount',
    /** 今日总客流 */
    todayTraffic = '/jeecgboot/sgai-fwbz-dev/fwbz/venueVisitorFlow/todayVisitorCount',
    /** 当前在馆 */
    currentOnSite = '/jeecgboot/sgai-fwbz-dev/fwbz/venueVisitorFlow/currentVisitorCount',
    /** 停车场实时状态 */
    parkingLotStatus = '/jeecgboot/sgai-fwbz-dev/fwbz/parkingStatistics/parkingSpaceDistribution',
    /** 各场馆客流分布 */
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
 * 统计数量
 *
 */
export interface CountVO {
    /**
     * 上下文描述（如 ↑3、↓2、进行中、下周开始）
     */
    context?: string;
    /**
     * 标题
     */
    title?: string;
    /**
     * 数值
     */
    value?: string;
    [property: string]: any;
}

/** 统计今日巡检完成数量 */
export const getTodayCheckCount = () => fwbzHttp.get({ url: Api.todayCheck });

/** 待处理告警异常 */
export const getAlarmExceptionCount = () => fwbzHttp.get({ url: Api.alarmException });

/** 告警记录分页列表（待处理告警） */
export const getAlarmRecordList = (params: { pageNo: number; pageSize: number; alarmStatus: number }) =>
  defHttp.get({ url: Api.alarmRecordList, params });

/** 告警统计 */
export const getAlarmStatistics = () => defHttp.get({ url: Api.alarmStatistics });

/** 告警趋势 */
export const getAlarmTrendRecently = () => defHttp.get({ url: Api.alarmTrendRecently });

/** 今日数据量（返回KB） */
export const getTodayDataSize = () => fwbzHttp.get({ url: Api.todayDataSize });

/** 数据采集点数量 */
export const getCollectionPointCount = () => fwbzHttp.get({ url: Api.collectionPoint });

/** 今日总客流 */
export const getTodayTraffic = () => fwbzHttp.get({ url: Api.todayTraffic });

/** 当前在场人数 */
export const getCurrentOnSite = () => fwbzHttp.get({ url: Api.currentOnSite });