/**
 * 楼宇自控设备弹窗组件集合
 * 每个文件是一个可独立渲染的弹窗 Vue 组件，对应一个视图的点击弹窗
 *
 * 使用方式：
 *   import SumpDrawer from './drawers/SumpDrawer.vue'
 *   <SumpDrawer :values="pointValues" @close="..." @trigger-motion="..." />
 *
 * 或通过 index 统一引入：
 *   import { getDrawerById } from './drawers/index.js'
 *   const DrawerComp = getDrawerById('sump')
 */

import SumpDrawer from './SumpDrawer.vue'
import AhuSummaryDrawer from './AhuSummaryDrawer.vue'
import FanBoxDrawer from './FanBoxDrawer.vue'
import Ahu1Drawer from './Ahu1Drawer.vue'
import Ahu2Drawer from './Ahu2Drawer.vue'
import Ahu3Drawer from './Ahu3Drawer.vue'
import FcuDrawer from './FcuDrawer.vue'
import Ahu4Drawer from './Ahu4Drawer.vue'

/**
 * 视图 id 到弹窗组件的映射
 */
const drawerMap = {
  'sump':        SumpDrawer,
  'ahu-summary': AhuSummaryDrawer,
  'fan-box':     FanBoxDrawer,
  'ahu-1':       Ahu1Drawer,
  'ahu-2':       Ahu2Drawer,
  'ahu-3':       Ahu3Drawer,
  'fcu':         FcuDrawer,
  'ahu-4':       Ahu4Drawer
}

/** 根据视图 id 获取弹窗组件 */
export function getDrawerById(id) {
  return drawerMap[id] || null
}

/** 所有弹窗组件列表（顺序与视图列表一致） */
export const drawerList = [
  SumpDrawer,
  AhuSummaryDrawer,
  FanBoxDrawer,
  Ahu1Drawer,
  Ahu2Drawer,
  Ahu3Drawer,
  FcuDrawer,
  Ahu4Drawer
]

export {
  SumpDrawer,
  AhuSummaryDrawer,
  FanBoxDrawer,
  Ahu1Drawer,
  Ahu2Drawer,
  Ahu3Drawer,
  FcuDrawer,
  Ahu4Drawer
}

export default drawerMap
