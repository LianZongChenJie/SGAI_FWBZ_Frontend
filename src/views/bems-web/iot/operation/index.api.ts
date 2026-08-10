import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/sgai-fwbz-dev/fwbz/runGuarantee/summary',
    /** 设备状态监控 */
    deviceStatusMonitor = '/sgai-fwbz-dev/fwbz/runGuarantee/deviceStat',
}

/**
 * 各系统设备在线统计
 *
 * SystemDeviceStatVO
 */
export interface SystemDeviceStatVO {
    /**
     * 设备总数
     */
    deviceCount?: number;
    /**
     * 在线数量
     */
    online?: number;
    /**
     * 在线率（百分比整数，如100表示100%）
     */
    onlineRate?: number;
    /**
     * 系统名称（对应设备类型名称）
     */
    systemName?: string;
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
    value?: string;
    [property: string]: any;
}

/** 卡片汇总（顶部统计卡片） */
export const getSummary = () => defHttp.get({ url: Api.summary });

/** 设备状态监控（各系统设备在线统计） */
export const getDeviceStatusMonitor = () => defHttp.get({ url: Api.deviceStatusMonitor });
