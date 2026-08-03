import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  summary = '/sgai-fwbz-dev/fwbz/securityStatistics/summary',
  /** 巡更计划列表 */
  patrolPlanList = '/sgai-fwbz-dev/fwbz/patrolPlan/list',
  /** 巡更计划编辑 */
  patrolPlanEdit = '/sgai-fwbz-dev/fwbz/patrolPlan/edit',
  /** 巡更计划新增 */
  patrolPlanAdd = '/sgai-fwbz-dev/fwbz/patrolPlan/add',
  /** 摄像头列表数据 */
  cameraList = '/sgai-fwbz-dev/fwbz/hikvision/camera/list',
  /** 获取运行中的巡更计划摄像头 */
  runningCameraList = '/sgai-fwbz-dev/fwbz/patrolPlan/runningPlan',
  /** 获取摄像头播放地址 */
  cameraPlayUrls = '/sgai-fwbz-dev/fwbz/hikvision/camera/playUrls',
}

/** 获取安防统计卡片汇总 */
export const getSecuritySummary = (params?) => fwbzHttp.get({ url: Api.summary, params });

/** 获取巡更计划列表 */
export const getPatrolPlanList = (params?) => fwbzHttp.get({ url: Api.patrolPlanList, params });

/** 编辑巡更计划 */
export const editPatrolPlan = (params) => fwbzHttp.put({ url: Api.patrolPlanEdit, params });

/** 新增巡更计划 */
export const addPatrolPlan = (params) => fwbzHttp.post({ url: Api.patrolPlanAdd, params });

/** 获取摄像头列表 */
export const getCameraList = (params?) => fwbzHttp.get({ url: Api.cameraList, params });

/** 获取运行中的巡更计划摄像头（实时监控画面） */
export const getRunningCameraList = (params?) => fwbzHttp.get({ url: Api.runningCameraList, params });

/** 获取摄像头播放地址（入参格式: { cameraIndexCode: ['编码1', '编码2'] }） */
export const getCameraPlayUrls = (params) => fwbzHttp.post({ url: Api.cameraPlayUrls, params });



