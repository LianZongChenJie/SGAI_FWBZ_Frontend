import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  venueOptions = '/sgai-fwbz/fwbz/venueInfo/listAll',
  categoryOptions = '/sgai-fwbz /bems/equipmentCategory/list',
}

/** 下拉选项（通用） */
export interface SelectOption {
  id: string | number
  name: string
}

/** 场馆下拉选项 */
export interface VenueOption {
  id: string | number
  venueName: string
}

/** 设备信息项 */
export interface EquipmentItem {
  id: string
  device_code: string     // 设备编号
  device_name: string     // 设备名称
  category_id: number     // 设备类别id
  model_id: number        // 设备模型id
  magnification: string   // 倍率
  device_type: number     // 设备分类 (1: 仪表, 2: 设备)
  run_state: number       // 运行状态 (0: 离线, 1: 在线)
}

/**
 * 获取场馆列表
 */
export const getVenueOptions = (params?: Record<string, any>) =>
  fwbzHttp.get({ url: Api.venueOptions, params });

/**
 * 获取设备类型列表
 */
export const getCategoryOptions = (params?: Record<string, any>) =>
  fwbzHttp.get({ url: Api.categoryOptions, params });
