import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/sgai-fwbz-dev/fwbz/activeMeetReport/statistics/summary',
    /** 待总结展会下拉列表 */
    report = '/sgai-fwbz-dev/fwbz/activeMeetReport/list',
    /** 导出Excel */
    exportExcel = '/sgai-fwbz-dev/fwbz/activeMeetReport/exportXls',
    /** 展会总结报告 */
    statistics = '/sgai-fwbz-dev/fwbz/activeMeetReport/queryById',
    /** 保存展会总结报告 */
    saveStatistics = '/sgai-fwbz-dev/fwbz/activeMeetReport/save',
}

/**
 * 展会总结报告
 *
 * ActiveMeetReport
 */
export interface ActiveMeetReport {
    /**
     * 活动名称
     */
    activeName?: string;
    /**
     * 投诉数量
     */
    complaintsTotal?: number;
    /**
     * 总用电量
     */
    consumptionElectricity?: number;
    /**
     * 展会天数
     */
    dayNumber?: number;
    /**
     * 设备故障数
     */
    deviceFailuresTotal?: number;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 参展商数
     */
    exhibitors?: number;
    /**
     * 主键
     */
    id?: number;
    /**
     * 总客流
     */
    passengerFlow?: number;
    /**
     * 峰值客流
     */
    peakFlow?: number;
    /**
     * 单人次能耗
     */
    personEnergyConsumption?: number;
    /**
     * 建议数量
     */
    recommendedTotal?: number;
    /**
     * 总服务人数
     */
    servicePersonnel?: number;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 状态,0：待总结，1：已总结
     */
    status?: string;
}



/**
 * 统计卡片VO
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
    value?: string | number;
    [property: string]: any;
}


/**
 * 待总结展会下拉列表
 *
 * IPageActiveMeetReport
 */
export interface IPageActiveMeetReport {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: ActiveMeetReport[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}


/**
 * table_activeMeet_report对象
 *
 * ActiveMeetReport
 */
export interface ActiveMeetReport {
    /**
     * 活动名称
     */
    activeName?: string;
    /**
     * 投诉数量
     */
    complaintsTotal?: number;
    /**
     * 总用电量
     */
    consumptionElectricity?: number;
    /**
     * 展会天数
     */
    dayNumber?: number;
    /**
     * 设备故障数
     */
    deviceFailuresTotal?: number;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 参展商数
     */
    exhibitors?: number;
    /**
     * 主键
     */
    id?: number;
    /**
     * 总客流
     */
    passengerFlow?: number;
    /**
     * 峰值客流
     */
    peakFlow?: number;
    /**
     * 单人次能耗
     */
    personEnergyConsumption?: number;
    /**
     * 建议数量
     */
    recommendedTotal?: number;
    /**
     * 总服务人数
     */
    servicePersonnel?: number;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 状态,0：待总结，1：已总结
     */
    status?: string;
    [property: string]: any;
}

/** 卡片汇总信息 */
export const getSummary = () => defHttp.get({ url: Api.summary });

/** 展会总结报告列表（分页） */
export const getReportList = (params?: { pageNo?: number; pageSize?: number }) =>
    defHttp.get({ url: Api.report, params });

/** 导出Excel */
export const exportReportExcel = (params?: { pageNo?: number; pageSize?: number }) =>
    defHttp.get({ url: Api.exportExcel, params, responseType: 'blob' }, { isTransformResponse: false });

/** 展会总结报告详情（queryById） */
export const getReportStatistics = (id: number) =>
    defHttp.get({ url: Api.statistics, params: { id } });

/** 保存展会总结报告 */
export const saveReportStatistics = (data: ActiveMeetReport) =>
    defHttp.post({ url: Api.saveStatistics, data });
