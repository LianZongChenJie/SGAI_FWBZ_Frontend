import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
    /** 统计今日巡检完成数量 */
    todayCheck = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/todayCheck',
    /** 待处理告警异常 */
    alarmException = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/pendingAlarm',
    /** 今日数据量 */
    todayDataSize = '/sgai-fwbz-dev/fwbz/interfaceStatistics/todayDataSize',
    /** 采集点位数 */
    collectionPoint = '/sgai-fwbz-dev/fwbz/dataCollection/collectionPointCount',
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