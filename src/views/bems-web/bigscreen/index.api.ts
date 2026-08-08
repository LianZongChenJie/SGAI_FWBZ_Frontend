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
    /** 今日数据量 */
    todayDataSize = '/sgai-fwbz-dev/fwbz/interfaceStatistics/todayDataSize',
    /** 数据采集点 */
    collectionPoint = '/sgai-fwbz-dev/fwbz/dataCollection/collectionPointCount',
    /** 今日总客流 */
    todayTraffic = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/todayVisitorCount',
    /** 当前在场 */
    currentOnSite = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/currentVisitorCount',
    /** 用电分时数据 */
    electricityInTimePeriod = '/sgai-tp/fwbz/meterPointData/electricityInTimePeriod',
    /** 能耗计量统计 */
    energyStatistics = '/sgai-tp/fwbz/energyMetering/statistics',
    /** 空调机组统计 */
    airConditioningUnitStatistics = '/sgai-tp/fwbz/operationSupport/airConditioningUnitStatistics',
    /** 新风机组统计 */
    freshAirStatistics = '/sgai-tp/fwbz/operationSupport/freshAirStatistics',
    /** 配电系统统计 */
    powerStatistics = '/sgai-tp/fwbz/operationSupport/powerStatistics',
    /** 近7日用电趋势 */
    energyConsumptionPSDElectricity = '/sgai-tp/fwbz/meterPointData/energyConsumptionPSDElectricity',
    /** 各场馆用电 */
    electricityInVenue = '/sgai-tp/fwbz/meterPointData/electricityInVenue',
    /** 用能结构分析 */
    energyStructure = '/sgai-tp/fwbz/meterPointData/energyStructure',
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

/** 用电分时数据 */
export const getElectricityInTimePeriod = () => defHttp.get({ url: Api.electricityInTimePeriod });

/** 能耗计量统计 */
export const getEnergyStatistics = () => defHttp.get({ url: Api.energyStatistics });

/** 空调机组统计 */
export const getAirConditioningUnitStatistics = () => defHttp.get({ url: Api.airConditioningUnitStatistics });

/** 新风机组统计 */
export const getFreshAirStatistics = () => defHttp.get({ url: Api.freshAirStatistics });

/** 配电系统统计 */
export const getPowerStatistics = () => defHttp.get({ url: Api.powerStatistics });

/** 近7日用电趋势 */
export const getEnergyConsumptionPSDElectricity = () => defHttp.get({ url: Api.energyConsumptionPSDElectricity });

/** 各场馆用电 */
export const getElectricityInVenue = () => defHttp.get({ url: Api.electricityInVenue });

/** 用能结构分析 */
export const getEnergyStructure = () => defHttp.get({ url: Api.energyStructure });