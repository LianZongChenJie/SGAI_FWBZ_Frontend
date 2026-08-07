import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/jeecgboot/sgai-fwbz-dev/fwbz/dataCollection/summary',
    /** 数据采集状态列表 */
    dataCollectionList = '/jeecgboot/sgai-fwbz-dev/fwbz/dataCollection/interfaceList',
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


/**
 * 接口列表响应VO（含采集统计）
 *
 * InterfaceListVO
 */
export interface InterfaceListVO {
    collectionPointLocation?: number;
    cycle?: string;
    /**
     * 数据完整率（0或100）
     */
    dataCompleteRate?: number;
    id?: number;
    interfacePath?: string;
    /**
     * 最后采集时间
     */
    lastCollectionTime?: string;
    protocolTypeId?: number;
    requestTime?: string;
    responseTime?: number;
    state?: number;
    sysName?: string;
    sysOrgCode?: string;
    testPath?: string;
    /**
     * 今日采集量（KB）
     */
    todayCollection?: number;
    [property: string]: any;
}

/** 卡片汇总信息 */
export const getSummary = () => fwbzHttp.get({ url: Api.summary });

/** 数据采集状态列表（分页） */
export const getDataCollectionList = (params?: {
    pageNo?: number;
    pageSize?: number;
}) => fwbzHttp.get({ url: Api.dataCollectionList, params });
