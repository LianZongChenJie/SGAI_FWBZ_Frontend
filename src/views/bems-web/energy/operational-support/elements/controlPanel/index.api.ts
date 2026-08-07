import { defHttp } from '/@/utils/http/axios'

/** 空调机组控制项 */
export interface AcControlItem {
  id: string
  code: string
  location: string
  status: '运行' | '待机' | '故障'
  setTemp: string
}

/** 照明回路控制项 */
export interface LightingControlItem {
  id: string
  code: string
  location: string
  status: '开启' | '关闭' | '调光'
  brightness: string
}

enum Api {
  airList = '/sgai-tp/fwbz/operationSupport/overview/airList',
  airControl = '/sgai-tp/fwbz/operationSupport/airControl',
}

/** 获取空调机组列表 */
export const getAirList = (params = {}) => defHttp.get({ url: Api.airList, params })

/** 空调机组控制 */
export const airControl = (data: any[]) => defHttp.post({ url: Api.airControl, data })
