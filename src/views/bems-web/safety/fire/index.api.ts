import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/summary',
    /** 消防设备实时监测 */
    realTimeMonitor = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/list',
    /** 设备状态统计 */
    deviceStatusStatistics = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/countByStatus',
    /** 消防设备类型 */
    deviceTypeList = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/typeList',
    /** 设备告警记录 */
    alarmRecord = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/alarmRecords',
    /** 消防设备分布图 */
    distributionMap = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/countByVenue',
}

/**
 * 场馆消防设备数量统计
 *
 * VenueDeviceCountVO
 */
export interface VenueDeviceCountVO {
    /**
     * 消防设备数量
     */
    deviceCount?: number;
    /**
     * 纬度
     */
    latitude?: number;
    /**
     * 经度
     */
    longitude?: number;
    /**
     * 场馆名称
     */
    venueName?: string;
    [property: string]: any;
}



/**
 * 设备告警记录
 *
 * IPageFireAlarmRecord
 */
export interface IPageFireAlarmRecord {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: FireAlarmRecord[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}

/**
 * 消防设备报警记录
 *
 * FireAlarmRecord
 */
export interface FireAlarmRecord {
    /**
     * 报警内容描述
     */
    alarmContent?: string;
    /**
     * 报警日期
     */
    alarmDate?: string;
    /**
     * 报警级别: 1低 2中 3高 4紧急
     */
    alarmLevel?: number;
    /**
     * 报警位置
     */
    alarmLocation?: string;
    /**
     * 报警时间
     */
    alarmTime?: string;
    /**
     * 报警类型: 烟感报警/温感报警/手报报警/设备故障/低电量/离线
     */
    alarmType?: string;
    /**
     * 消防设备ID
     */
    deviceId?: string;
    /**
     * 创建时间
     */
    gmtCreate?: string;
    /**
     * 修改时间
     */
    gmtModified?: string;
    /**
     * 处理人
     */
    handler?: string;
    /**
     * 处理备注
     */
    handleRemark?: string;
    /**
     * 处理状态: 0未处理 1处理中 2已处理 3误报 4忽略
     */
    handleStatus?: number;
    /**
     * 处理时间
     */
    handleTime?: string;
    /**
     * 主键ID
     */
    id?: number;
    /**
     * 状态: 1正常 0删除
     */
    status?: number;
    [property: string]: any;
}



/**
 * 消防设备类型
 *
 * SmokeDetectorType
 */
export interface SmokeDetectorType {
    /**
     * 主键ID
     */
    id?: number;
    /**
     * 设备类型名称
     */
    typeName?: string;
    [property: string]: any;
}

/** 卡片汇总信息 */
export const getSummary = () => defHttp.get({ url: Api.summary });

/** 消防设备实时监测列表（分页） */
export const getRealTimeMonitor = (params?: {
    pageNo?: number;
    pageSize?: number;
    deviceName?: string;
    status?: string;
    deviceType?: string;
}) => defHttp.get({ url: Api.realTimeMonitor, params });

/** 设备状态统计 */
export const getDeviceStatusStatistics = () => defHttp.get({ url: Api.deviceStatusStatistics });

/** 消防设备类型列表 */
export const getDeviceTypeList = () => defHttp.get({ url: Api.deviceTypeList });

/** 设备告警记录（分页，入参 deviceId） */
export const getAlarmRecordList = (params?: { deviceId: string | number; pageNo?: number; pageSize?: number }) =>
    defHttp.get({ url: Api.alarmRecord, params });

/** 消防设备分布图（按场馆统计设备数量） */
export const getDistributionMap = () => defHttp.get({ url: Api.distributionMap });

/**
 * 设备状态统计
 *
 * StatusCountVO
 */
export interface StatusCountVO {
    /**
     * 设备数量
     */
    count?: number;
    /**
     * 状态名称
     */
    status?: string;
    [property: string]: any;
}



/**
 * 消防设备实时监测
 *
 * IPageSmokeDetector
 */
export interface IPageSmokeDetector {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: SmokeDetector[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}


/**
 * 消防设备
 *
 * SmokeDetector
 */
export interface SmokeDetector {
    /**
     * 设备名称
     */
    deviceName?: string;
    /**
     * 设备类型ID（关联 table_smoke_detector_type）
     */
    deviceType?: string;
    /**
     * 主键ID
     */
    id?: number;
    /**
     * 最后巡检时间
     */
    lastCheckTime?: string;
    /**
     * 纬度
     */
    latitude?: number;
    /**
     * 安装位置
     */
    location?: string;
    /**
     * 经度
     */
    longitude?: number;
    /**
     * 电量
     */
    powerLevel?: string;
    /**
     * 信号强度
     */
    signal?: string;
    /**
     * 状态
     */
    status?: string;
    /**
     * 设备类型名称（联动 table_smoke_detector_type，非数据库字段）
     * 设备类型名称
     */
    typeName?: string;
    /**
     * 场馆ID
     */
    venueId?: number;
    /**
     * 场馆名称（联动 table_venue_info，非数据库字段）
     * 场馆名称
     */
    venueName?: string;
    [property: string]: any;
}


/**
 * 统计卡片VO
 *
 * StatCardVO
 */
export interface StatCardVO {
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
    value?: { [key: string]: any };
    [property: string]: any;
}
