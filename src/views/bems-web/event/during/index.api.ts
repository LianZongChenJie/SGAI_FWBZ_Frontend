import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
    /** 卡片汇总 */
    summary = '/sgai-fwbz-dev/fwbz/complaintStatistics/summary',
    /** 投诉建议处理列表 */
    complaintList = '/sgai-fwbz-dev/fwbz/complaint/list',
    /** 类型下拉 */
    typeList = '/sgai-fwbz-dev/fwbz/complaint/typeList',
    /** 状态下拉 */
    statusList = '/sgai-fwbz-dev/fwbz/complaint/statusList',
    /** 新增投诉 */
    addComplaint = '/sgai-fwbz-dev/fwbz/complaint/add',
    /** 编辑投诉 */
    editComplaint = '/sgai-fwbz-dev/fwbz/complaint/edit',
    /** 处理投诉 */
    handleComplaint = '/sgai-fwbz-dev/fwbz/complaint/handle',
    /** 删除投诉 */
    deleteComplaint = '/sgai-fwbz-dev/fwbz/complaint/delete',
}

/**
 * 处理投诉
 */
export interface HandleRequest {
    /**
     * 投诉建议ID
     */
    complaintId: number;
    /**
     * 处理内容
     */
    handleContent: string;
    /**
     * 处理人
     */
    handler?: string;
    /**
     * 新状态
     */
    status: string;
    [property: string]: any;
}

/**
 * 新增/编辑投诉
 */
export interface Request {
    /**
     * 日期
     */
    complaintDate?: string;
    /**
     * 时间，格式 HH:mm:ss
     */
    complaintTime?: string;
    /**
     * 内容
     */
    content?: string;
    /**
     * 创建时间
     */
    gmtCreate?: string;
    /**
     * 更新时间
     */
    gmtModified?: string;
    /**
     * 处理人
     */
    handler?: string;
    /**
     * 投诉建议ID
     */
    id?: number;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 来源
     */
    source?: string;
    /**
     * 状态
     */
    status?: string;
    /**
     * 标题
     */
    title?: string;
    /**
     * 投诉类型ID，关联 table_complaint_type.id
     */
    typeId?: number;
    /**
     * 类型名称（非数据库字段，用于列表展示）
     * 类型名称
     */
    typeName?: string;
    [property: string]: any;
}


/**
 * 类型下拉
 *
 * ComplaintType
 */
export interface ComplaintType {
    /**
     * 创建时间
     */
    gmtCreate?: string;
    /**
     * 更新时间
     */
    gmtModified?: string;
    /**
     * 类型ID
     */
    id?: number;
    /**
     * 类型名称
     */
    typeName?: string;
    [property: string]: any;
}

/**
 * 状态下拉
 *
 * ComplaintStatus
 */
export interface ComplaintStatus {
    /**
     * 创建时间
     */
    gmtCreate?: string;
    /**
     * 更新时间
     */
    gmtModified?: string;
    /**
     * 主键ID
     */
    id?: number;
    /**
     * 状态ID
     */
    statusId?: number;
    /**
     * 状态名称
     */
    statusName?: string;
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

/**
 * 投诉建议列表数据
 *
 * IPageComplaintInfo
 */
export interface IPageComplaintInfo {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: ComplaintInfo[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}


/**
 * table_complaint_info对象
 *
 * ComplaintInfo
 */
export interface ComplaintInfo {
    /**
     * 日期
     */
    complaintDate?: string;
    /**
     * 时间，格式 HH:mm:ss
     */
    complaintTime?: string;
    /**
     * 内容
     */
    content?: string;
    /**
     * 创建时间
     */
    gmtCreate?: string;
    /**
     * 更新时间
     */
    gmtModified?: string;
    /**
     * 处理人
     */
    handler?: string;
    /**
     * 投诉建议ID
     */
    id?: number;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 来源
     */
    source?: string;
    /**
     * 状态
     */
    status?: string;
    /**
     * 标题
     */
    title?: string;
    /**
     * 投诉类型ID，关联 table_complaint_type.id
     */
    typeId?: number;
    /**
     * 类型名称（非数据库字段，用于列表展示）
     * 类型名称
     */
    typeName?: string;
    [property: string]: any;
}




/** 卡片汇总信息 */
export const getSummary = () => fwbzHttp.get({ url: Api.summary });

/** 投诉建议列表（分页） */
export const getComplaintList = (params?: {
    pageNo?: number;
    pageSize?: number;
}) => fwbzHttp.get({ url: Api.complaintList, params });

/** 类型下拉列表 */
export const getTypeList = () => fwbzHttp.get({ url: Api.typeList });

/** 状态下拉列表 */
export const getStatusList = () => fwbzHttp.get({ url: Api.statusList });

/** 新增投诉 */
export const addComplaint = (params: Request) => fwbzHttp.post({ url: Api.addComplaint, params });

/** 编辑投诉（仅编辑处理人） */
export const editComplaint = (params: Request) => fwbzHttp.put({ url: Api.editComplaint, params });

/** 处理投诉 */
export const handleComplaint = (params: HandleRequest) => fwbzHttp.post({ url: Api.handleComplaint, params });

/** 删除投诉 */
export const deleteComplaint = (params: { id: number }) =>
    fwbzHttp.delete({ url: `${Api.deleteComplaint}?id=${params.id}` });

