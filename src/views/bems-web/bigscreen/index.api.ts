import { fwbzHttp } from '/@/utils/http/axios';
import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 统计今日巡检完成数量 */
    todayCheck = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/todayCheck',
    /** 待处理告警异常 */
    alarmException = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/pendingAlarm',
    
    /** 故障告警 */
    /** 告警记录分页列表 */
    alarmRecordList = '/sgai-tp/fwbz/alarm/record/listPage',
    /** 告警统计 */
    alarmStatistics = '/sgai-tp/fwbz/alarm/record/statistics',
    /** 告警趋势 */
    alarmTrendRecently = '/sgai-tp/fwbz/alarm/record/alarmTrendRecently',
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