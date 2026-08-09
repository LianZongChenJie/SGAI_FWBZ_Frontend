import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/summary',
    /** 消防设备实时监测 */
    realTimeMonitor = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/list',
    /** 设备状态统计 */
    deviceStatusStatistics = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/countByStatus',
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
