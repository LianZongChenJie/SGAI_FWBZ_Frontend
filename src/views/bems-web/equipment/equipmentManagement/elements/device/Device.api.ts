import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  // categoryTree = '/bems/equipmentCategory/measuring/getTree',
  categoryTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/measuring/getPermissionTree',
  // spaceTree = '/bems/space/getTree',
  spaceTree = '/sgai-fwbz-dev/fwbz/space/getPermissionTree',
  // spaceTree2 = '/bems/space/getTreeByDeviceType',
  spaceTree2 = '/sgai-fwbz-dev/fwbz/space/getPermissionTreeByDeviceType',
  addDevice = '/sgai-fwbz-dev/fwbz/device/measuring/add',
  editDevice = '/sgai-fwbz-dev/fwbz/device/edit',
  deleteDevice = '/sgai-fwbz-dev/fwbz/device/delete',
  // selectDevice = '/sgai-fwbz-dev/fwbz/device/measuring/list',
  selectDevice = '/sgai-fwbz-dev/fwbz/device/list',

  updateAutomation = '/sgai-fwbz-dev/fwbz/device/updateAutomaticAlgorithm',
  staticDataList = '/sgai-fwbz-dev/fwbz/deviceStaticData/list',
  staticDataSave = '/sgai-fwbz-dev/fwbz/deviceStaticData/save',
  attributeDataList = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
  getDeviceAttribute = '/sgai-fwbz-dev/fwbz/deviceModel/queryByCategoryId',
  getListByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/queryPage',
  saveData = '/sgai-fwbz-dev/fwbz/deviceAttribute/edit',
  addDate = '/sgai-fwbz-dev/fwbz/deviceAttribute/add',
  deleteItem = '/sgai-fwbz-dev/fwbz/deviceAttribute/delete',

  exportData = '/sgai-fwbz-dev/fwbz/device/export',
  getCategoryTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/getTree',
  venueInfoList = '/sgai-fwbz-dev/fwbz/venueInfo/listAll',
  /** 设备类别-仪表权限树 */
  getPermissionTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/measuring/getPermissionTree',
  /** 设备类别-设备权限树 */
  getEquipmentTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/equipment/getPermissionTree',
  /** 冷源设备 */
  getColdSourceTree = '/sgai-fwbz-dev/fwbz/coldSource/device/page',

}

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
 * 静态数据列表
 */
export const staticDataList = (params) => defHttp.get({ url: Api.staticDataList, params });
/**
 * 静态数据保存
 */
export const staticDataSave = (params) => defHttp.post({ url: Api.staticDataSave, params });

/**
 * 采集数据列表
 */
export const attributeDataList = (params) => defHttp.get({ url: Api.attributeDataList, params });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 空间树
 */
export const spaceTree2 = (params) => defHttp.get({ url: Api.spaceTree2, params }, { joinParamsToUrl: true });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.editDevice : Api.addDevice;
  return defHttp.post({ url: url, params });
};
/**
 * 删除设备
 */
export const deleteDevice = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteDevice, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 切换自动算法
 */
export const updateAutomaticAlgorithm = (params) => defHttp.post({ url: Api.updateAutomation, params });

/**
 * 切换自动算法
 */
export const getDeviceAttribute = (params) => defHttp.get({ url: Api.getDeviceAttribute, params }, { joinParamsToUrl: true });

/**
 * 获取表格数据
 */
export const getListByDeviceId = (params) => defHttp.get({ url: Api.getListByDeviceId, params });

/**
 * 新增编辑后的数据
 */
export const addData = (params) => defHttp.post({ url: Api.addDate, params });

/**
 * 保存编辑后的数据
 */
export const saveData = (params) => defHttp.post({ url: Api.saveData, params });

/**
 * 删除数据
 */
export const deleteItem = (params) => defHttp.delete({ url: Api.deleteItem, params }, { joinParamsToUrl: true });

/**
 * 导出数据
 */
export const exportData = (params) => defHttp.get({ url: Api.exportData, params: params, responseType: 'blob', } ,{ isTransformResponse: false });

/**
 * 获取设备类别树（下拉选择框用）
 */
export const getCategoryTreeData = () => defHttp.get({ url: Api.getCategoryTree });

/**
 * 获取场馆信息列表（供能源计量总览等页面使用）
 */
export const getVenueInfoList = (params) => defHttp.get({ url: Api.venueInfoList, params });

/**
 * 获取设备类别-仪表权限树
 */
export const getPermissionTree = () => defHttp.get({ url: Api.getPermissionTree });

/**
 * 获取设备类别-设备权限树
 */
export const getEquipmentTree = () => defHttp.get({ url: Api.getEquipmentTree });
