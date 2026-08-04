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
