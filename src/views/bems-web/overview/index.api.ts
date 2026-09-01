import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 今日会展活动 */
    todayExhibitionActivity = '/sgai-fwbz-dev/fwbz/activeMeet/info/listPage',
    /** 今日总客流 */
    todayVisitorCount = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/todayVisitorCount',
    /** 今日能耗 */
    todayStatistics = '/sgai-fwbz-dev/fwbz/energyMetering/statistics',
    /** 告警统计（待处理告警数量） */
    alarmStatistics = '/sgai-fwbz-dev/fwbz/alarm/record/statistics',
    /** 设备数量 */
    deviceCount = '/sgai-fwbz-dev/fwbz/device/deviceRunStateStatistics'
}

/**
 * 今日会展活动
 *
 * IPageActiveMeetInfo
 */
export interface IPageActiveMeetInfo {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: ActiveMeetInfo[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}


/**
 * 活动信息
 *
 * ActiveMeetInfo
 */
export interface ActiveMeetInfo {
    /**
     * 活动名称
     */
    activeName?: string;
    /**
     * 创建人
     */
    createBy?: string;
    /**
     * 创建日期
     */
    createTime?: string;
    /**
     * 结束时间
     */
    endTime?: string;
    /**
     * 主键
     */
    id?: number;
    pageNo?: number;
    pageSize?: number;
    /**
     * 预计人数
     */
    peopleQuantity?: number;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 开始时间
     */
    startTime?: string;
    /**
     * 所属部门
     */
    sysOrgCode?: string;
    /**
     * 更新人
     */
    updateBy?: string;
    /**
     * 更新日期
     */
    updateTime?: string;
    /**
     * 活动层数
     */
    venueFloors?: string;
    /**
     * 场馆id
     */
    venueId?: number;
    /**
     * 场馆名称（非数据库字段）
     */
    venueName?: string;
    [property: string]: any;
}

/** 获取今日会展活动列表（入参: { startDate: 'YYYY-MM-DD' }） */
export const getTodayExhibitionActivity = (params?: { startDate?: string, endDate?: string }) =>
  defHttp.get({ url: Api.todayExhibitionActivity, params });

/** 今日总客流 */
export const getTodayVisitorCount = () => defHttp.get({ url: Api.todayVisitorCount });

/** 告警统计（待处理告警数量取 untreatedCount 字段） */
export const getAlarmStatistics = () => defHttp.get({ url: Api.alarmStatistics });
/** 今日能耗统计（取 electricCount 字段） */
export const getTodayStatistics = () => defHttp.get({ url: Api.todayStatistics });

/** 设备运行状态统计（取 online/count 计算在线率） */
export const getDeviceCount = () => defHttp.get({ url: Api.deviceCount });
