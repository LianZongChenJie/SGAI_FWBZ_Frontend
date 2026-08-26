import { defHttp } from '/@/utils/http/axios'

enum Api {
  /** 空间位置树 */
  spaceTree = '/sgai-fwbz-dev/fwbz/space/getPermissionTree',
}

/**
 * 空间位置返回值格式
 */
export interface SelectTreeModel {
  children?: SelectTreeModel[]
  isLeaf?: boolean
  key?: string
  parentId?: string
  title?: string
  value?: string
  [property: string]: any
}

/**
 * 空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree })
