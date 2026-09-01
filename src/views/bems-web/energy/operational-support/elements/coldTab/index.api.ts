import { defHttp } from '/@/utils/http/axios'

enum Api {
  /** 设备基础信息列表 */
  deviceBaseInfoList = '/sgai-fwbz-dev/fwbz/coldSource/device/page',
  /** 机组类型下拉 */
  unitTypeList = '/sgai-fwbz-dev/fwbz/coldSource/category/list',
  /** 详情 */
  detail = '/sgai-fwbz-dev/fwbz/coldSource/device/detail',
  /** 导出 */
  export = '/sgai-fwbz-dev/fwbz/coldSource/device/export'
}

/**
 * 获取冷源设备列表
 */
export const getColdUnitList = (params: Request) => defHttp.get<{ records: ColdSourceDevicePageDto[], total: number }>({ url: Api.deviceBaseInfoList, params })

/**
 * 获取冷源设备详情
 */
export const getColdUnitDetail = (params: { deviceId: number }) => defHttp.get<ColdSourceDeviceDetailDto>({ url: Api.detail, params })

/**
 * 获取机组类型下拉列表
 */
export const getUnitTypeList = () => defHttp.get<ColdSourceEquipmentCategory[]>({ url: Api.unitTypeList })

/**
 * 设备基础信息列表 请求入参
 * 
 */
export interface Request {
    /**
     * 设备类别id（精确匹配，关联 cold_source_equipment_category.id）
     */
    categoryId?: number;
    /**
     * 设备编号（模糊匹配）
     */
    deviceCode?: string;
    /**
     * 设备名称（模糊匹配）
     */
    deviceName?: string;
    pageNo?: number;
    pageSize?: number;
    /**
     * 设备状态（精确匹配，1启用 0停用）
     */
    status?: number;
    [property: string]: any;
}



/**
 * 设备基础信息列表 返回数据对象
 *
 */
export interface IPageColdSourceDevicePageDto {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ColdSourceDevicePageDto[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}

/**
 * com.baomidou.mybatisplus.core.metadata.OrderItem
 *
 * OrderItem
 */
export interface OrderItem {
    asc?: boolean;
    column?: string;
    [property: string]: any;
}

/**
 * 冷源设备列表返回 下拉选择
 *
 * ColdSourceDevicePageDto
 */
export interface ColdSourceDevicePageDto {
    /**
     * 设备类别id
     */
    categoryId?: number;
    /**
     * 设备类别名称
     */
    categoryName?: string;
    /**
     * 设备编号
     */
    deviceCode?: string;
    /**
     * 设备名称
     */
    deviceName?: string;
    /**
     * 主键
     */
    id?: number;
    /**
     * Niagara 路径
     */
    niagaraPath?: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 排序
     */
    sort?: number;
    /**
     * 状态: 1启用 0停用
     */
    status?: number;
    /**
     * 所属系统
     */
    systemCode?: string;
    [property: string]: any;
}

/**
 * 冷源设备类别表（FWBZ.cold_source_equipment_category）
 *
 * ColdSourceEquipmentCategory
 */
export interface ColdSourceEquipmentCategory {
    /**
     * 分类名称
     */
    categoryName?: string;
    /**
     * 全id
     */
    fullId?: string;
    /**
     * 全名
     */
    fullName?: string;
    /**
     * 是否有子节点: 1有 0无
     */
    hasChild?: number;
    /**
     * 主键
     */
    id?: number;
    /**
     * 主id
     */
    masterId?: number;
    /**
     * 父级id
     */
    pid?: number;
    /**
     * 备注（含分类编码）
     */
    remark?: string;
    /**
     * 排序
     */
    sort?: number;
    /**
     * 类别类型: 1计量 2楼控
     */
    type?: number;
    [property: string]: any;
}


/**
 * 详情 返回数据对象
 *
 * ColdSourceDeviceDetailDto
 */
export interface ColdSourceDeviceDetailDto {
    /**
     * 关联属性列表
     */
    attributes?: ColdSourceDeviceAttribute[];
    /**
     * 设备类别id
     */
    categoryId?: number;
    /**
     * 设备类别名称
     */
    categoryName?: string;
    /**
     * 设备编号
     */
    deviceCode?: string;
    /**
     * 设备名称
     */
    deviceName?: string;
    /**
     * 主键
     */
    id?: number;
    /**
     * Niagara 路径
     */
    niagaraPath?: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 排序
     */
    sort?: number;
    /**
     * 状态: 1启用 0停用
     */
    status?: number;
    /**
     * 所属系统
     */
    systemCode?: string;
    [property: string]: any;
}

/**
 * 详情 
 *
 * ColdSourceDeviceAttribute
 */
export interface ColdSourceDeviceAttribute {
    /**
     * 点位短名(object-name末段)
     */
    attrCode?: string;
    /**
     * 属性名
     */
    attrName?: string;
    /**
     * 属性类型
     */
    attrType?: string;
    /**
     * 创建人
     */
    createBy?: string;
    /**
     * 创建时间
     */
    createTime?: string;
    /**
     * 数据类型
     */
    dataType?: string;
    /**
     * 关联 cold_source_device.id
     */
    deviceId?: number;
    /**
     * 采集时间
     */
    gatherTime?: string;
    /**
     * 主键
     */
    id?: number;
    /**
     * 是否枚举
     */
    isEnum?: number;
    /**
     * 点位键名
     */
    keyname?: string;
    /**
     * 枚举JSON(CLOB)
     */
    objectDef?: string;
    /**
     * 排序
     */
    sortOrder?: number;
    /**
     * 所属部门编码
     */
    sysOrgCode?: string;
    /**
     * pSpace 通讯点位ID
     */
    tagid?: number;
    /**
     * 单位
     */
    unit?: string;
    /**
     * 更新人
     */
    updateBy?: string;
    /**
     * 更新时间
     */
    updateTime?: string;
    /**
     * 采集值
     */
    value?: string;
    /**
     * 枚举JSON
     */
    valueEnum?: string;
    [property: string]: any;
}




