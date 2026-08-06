import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/sgai-fwbz-dev/fwbz/preparationStatistics/summary',
    /** 会前筹备清单 */
    preparationList = '/sgai-fwbz-dev/fwbz/activeMeet/preparation/checklist',
    /** 完成筹备项 */
    finishPreparationItem = '/sgai-fwbz-dev/fwbz/activeMeet/preparation/complete',
    /** 会展活动列表 */
    activeMeetList = '/sgai-fwbz-dev/fwbz/activeMeet/info/listPage',
}

/**
 * 统计卡片VO
 *
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

/** 完成筹备项入参 */
export interface Request {
    preparationInfoId: number;
    preparationValue: number;
    realValue: number;
    [property: string]: any;
}

/**
 * 会前筹备清单
 *
 * PreparationChecklistVO
 */
export interface PreparationChecklistVO {
    activeMeetId?: number;
    activeName?: string;
    data?: DeviceTypeGroupVO[];
    preparationProgress?: string;
    [property: string]: any;
}

/**
 * 按筹备类型分组
 *
 * DeviceTypeGroupVO
 */
export interface DeviceTypeGroupVO {
    preparationProgress?: string;
    typeData?: PreparationDetailVO[];
    typeId?: number;
    typeName?: string;
    [property: string]: any;
}

/**
 * 筹备明细
 *
 * PreparationDetailVO
 */
export interface PreparationDetailVO {
    completeTime?: string;
    preparationInfoId?: number;
    preparationInfoName?: string;
    preparationValue?: number;
    realValue?: number;
    status?: number;
    [property: string]: any;
}


/** 卡片汇总信息 */
export const getSummary = () => fwbzHttp.get({ url: Api.summary });

/** 会前筹备清单 */
export const getPreparationList = (params?: { id?: number }) =>
    fwbzHttp.get({ url: Api.preparationList, params });

/** 会展活动列表 */
export const getActiveMeetList = (params?: { pageNo?: number; pageSize?: number }) =>
    fwbzHttp.get({ url: Api.activeMeetList, params });

/** 完成筹备项 */
export const finishPreparationItem = (params: Request) =>
    fwbzHttp.post({ url: Api.finishPreparationItem, params });
