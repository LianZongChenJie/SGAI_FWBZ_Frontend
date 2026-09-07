import { defHttp } from '/@/utils/http/axios'

enum Api {
  overviewStatistics = '/sgai-fwbz-dev/fwbz/operationSupport/overviewStatistics',
  /** 获取设备总览 */
  equipmentOverview = '/sgai-fwbz-dev/fwbz/operationSupport/equipmentCategoryStatistics',

  /** 设备状态监控（各系统设备在线统计） */
  deviceStat = '/sgai-fwbz-dev/fwbz/runGuarantee/deviceStat',
}

/**
 * EquipmentCategory
 */
export interface EquipmentCategory {
    /** 类别名称 */
    categoryName?: string;
    /** 创建人 */
    createBy?: string;
    /** 创建日期 */
    createTime?: string;
    /** 父级id */
    fullId?: string;
    /** 全称 */
    fullName?: string;
    /** 是否有子节点 */
    hasChild?: string;
    /** 主键 */
    id?: number;
    pageNo?: number;
    pageSize?: number;
    /** 父级节点 */
    pid?: number;
    /** 备注 */
    remark?: string;
    /** 排序 */
    sort?: number;
    /** 所属部门 */
    sysOrgCode?: string;
    /** 类型。仪表：1；设备：2； */
    type?: string;
    /** 更新人 */
    updateBy?: string;
    /** 更新日期 */
    updateTime?: string;
    [property: string]: any;
}

/**
 * DeviceRunStateStatisticsDto
 */
export interface DeviceRunStateStatisticsDto {
    category?: EquipmentCategory;
    /** 总数 */
    count?: number;
    /** 运行设备 */
    equipmentCount?: number;
    /** 仪表数量 */
    measuringCount?: number;
    /** 离线 */
    offline?: number;
    /** 在线 */
    online?: number;
    [property: string]: any;
}

/**
 * 各系统设备在线统计
 *
 * SystemDeviceStatVO
 */
export interface SystemDeviceStatVO {
    /** 设备总数 */
    deviceCount?: number;
    /** 在线数量 */
    online?: number;
    /** 在线率（百分比整数，如100表示100%） */
    onlineRate?: number;
    /** 系统名称（对应设备类型名称） */
    systemName?: string;
    [property: string]: any;
}


/** 获取概览统计数据 */
export const getOverviewStatistics = (params = {}) => defHttp.get({ url: Api.overviewStatistics, params })

/** 获取设备总览 - 按设备类别运行状态统计 */
export const getEquipmentOverview = (params = {}) => defHttp.get({ url: Api.equipmentOverview, params })

/**
 * 各系统设备在线统计
 */
export const getDeviceStat = () => defHttp.get<SystemDeviceStatVO[]>({ url: Api.deviceStat })
