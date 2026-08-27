import { defHttp } from '/@/utils/http/axios'

enum Api {
  /** 设备空间位置 */
  spaceTree = '/sgai-fwbz-dev/fwbz/device/findNameAndIdByCategory',
  /** 设备属性列表（按设备ID查询） */
  listByDeviceId = '/sgai-fwbz-dev/fwbz/deviceAttribute/listByDeviceId',
}

/**
 * 设备空间位置返回值
 */
export interface ResultListDevice {
  id?: number
  deviceCode?: string
  deviceName?: string
  categoryId?: number
  spaceId?: number
  spaceName?: string
  [property: string]: any
}

/** 设备空间位置 */
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree, params: { categoryIds: '40' } })

/**
 * 设备属性列表（按设备ID查询）
 */
export const getDeviceAttrList = (params = {}) => defHttp.get({ url: Api.listByDeviceId, params })
