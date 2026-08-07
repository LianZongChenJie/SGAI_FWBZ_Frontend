import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/jeecgboot/sgai-fwbz-dev/fwbz/interfaceStatistics/summary',
    /** 接口状态监控列表 */
    interfaceStatusList = '/jeecgboot/sgai-fwbz-dev/fwbz/interfaceInfo/listPage',
    /** 协议类型下拉 */
    protocolTypeList = '/jeecgboot/sgai-fwbz-dev/fwbz/protocolType/list',
}

/**
 * 协议类型下拉
 *
 * ProtocolTypeInfo
 */
export interface ProtocolTypeInfo {
    /**
     * 创建人
     */
    createBy?: string;
    /**
     * 创建日期
     */
    createTime?: string;
    /**
     * 主键
     */
    id?: number;
    pageNo?: number;
    pageSize?: number;
    /**
     * 所属部门
     */
    sysOrgCode?: string;
    /**
     * 协议类型名称
     */
    typeName?: string;
    /**
     * 更新人
     */
    updateBy?: string;
    /**
     * 更新日期
     */
    updateTime?: string;
    [property: string]: any;
}


/**
 * 接口状态监控列表
 *
 */
export interface IPageInterfaceInfo {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: InterfaceInfo[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}


/**
 * 接口信息
 *
 * InterfaceInfo
 */
export interface InterfaceInfo {
    /**
     * 创建人
     */
    createBy?: string;
    /**
     * 创建日期
     */
    createTime?: string;
    /**
     * 主键
     */
    id?: number;
    /**
     * 接口地址
     */
    interfacePath?: string;
    pageNo?: number;
    pageSize?: number;
    /**
     * 协议类型ID
     */
    protocolTypeId?: number;
    /**
     * 最后心跳时间
     */
    requestTime?: string;
    /**
     * 响应时间(ms)
     */
    responseTime?: number;
    /**
     * 状态。在线：1；离线：0；异常：2
     */
    state?: number;
    /**
     * 系统名称
     */
    sysName?: string;
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
    [property: string]: any;
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


/** 卡片汇总信息 */
export const getSummary = () => fwbzHttp.get({ url: Api.summary });

/** 接口状态监控列表（分页，支持搜索） */
export const getInterfaceStatusList = (params?: {
    pageNo?: number;
    pageSize?: number;
    sysName?: string;
    protocolTypeId?: number;
    state?: number;
}) => fwbzHttp.get({ url: Api.interfaceStatusList, params });

/** 协议类型下拉列表 */
export const getProtocolTypeList = () => fwbzHttp.get({ url: Api.protocolTypeList });