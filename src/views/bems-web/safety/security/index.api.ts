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
  /** 是否是正在执行的计划 */
  isRunningPlan = '/sgai-fwbz-dev/fwbz/patrolPlan/isRunningPlan',
}

/** 统计卡片数据项 */
export interface StatItem {
  title: string
  value: string
  context: string
}

/**
 * ResultPatrolPlanDetailVo
 */
export interface Response {
  /** 返回代码 */
  code?: number;
  /** 返回处理消息 */
  message?: string;
  /** 返回数据对象 */
  result?: PatrolPlanDetailVo;
  /** 成功标志 */
  success?: boolean;
  /** 时间戳 */
  timestamp?: number;
  [property: string]: any;
}

/**
 * 返回数据对象 — PatrolPlanDetailVo
 */
export interface PatrolPlanDetailVo {
  /** 关联摄像头列表 */
  cameras?: PlanCamera[];
  /** 创建人 */
  createBy?: string;
  /** 创建日期 */
  createTime?: string;
  /** 执行周期 */
  executionCycle?: string;
  /** 主键 */
  id?: number;
  /** 下次执行 */
  nextExecution?: string;
  pageNo?: number;
  pageSize?: number;
  /** 巡更路线 */
  patrolRoute?: string;
  /** 计划名称 */
  planName?: string;
  /** 状态 */
  status?: number;
  /** 所属部门 */
  sysOrgCode?: string;
  /** 更新人 */
  updateBy?: string;
  /** 更新日期 */
  updateTime?: string;
  [property: string]: any;
}

/**
 * table_plan_camera对象 — PlanCamera
 */
export interface PlanCamera {
  /** 摄像头名称（非数据库字段，联表查询） */
  cameraName?: string;
  /** 主键 */
  id?: number;
  /** 摄像头唯一编码 */
  indexCode?: string;
  /** 巡更计划ID */
  planId?: number;
  /** 视频流URL（HLS m3u8） */
  url?: string;
  [property: string]: any;
}

/**
 * PatrolPlanDto
 */
export interface Request {
  /** 创建日期 */
  createTime?: string;
  /** 执行周期 */
  executionCycle?: string;
  /** 主键 */
  id?: number;
  /** 摄像头唯一编码列表 */
  indexCodes?: string[];
  /** 巡更路线 */
  patrolRoute?: string;
  /** 计划名称 */
  planName?: string;
  /** 状态 */
  status?: number;
  [property: string]: any;
}

/** 巡更计划数据 */
export interface PatrolPlan {
  id: number
  planName: string
  patrolRoute: string
  executionCycle: string
  nextExecution: string
  status: number
}

/** 摄像头列表选项 */
export interface CameraItem {
  indexCode: string
  name: string
}

/** 获取安防统计卡片汇总 */
export const getSecuritySummary = (params?) => fwbzHttp.get({ url: Api.summary, params });

/** 获取巡更计划列表 */
export const getPatrolPlanList = (params?) => fwbzHttp.get({ url: Api.patrolPlanList, params });

/** 编辑巡更计划 */
export const editPatrolPlan = (params: Request) => fwbzHttp.put({ url: Api.patrolPlanEdit, params });

/** 新增巡更计划 */
export const addPatrolPlan = (params: Request) => fwbzHttp.post({ url: Api.patrolPlanAdd, params });

/** 获取摄像头列表 */
export const getCameraList = (params?) => fwbzHttp.get({ url: Api.cameraList, params });

/** 获取运行中的巡更计划摄像头（实时监控画面） */
export const getRunningCameraList = (params?) => fwbzHttp.get({ url: Api.runningCameraList, params });

/** 获取摄像头播放地址（入参格式: { cameraIndexCode: ['编码1', '编码2'] }） */
export const getCameraPlayUrls = (params) => fwbzHttp.post({ url: Api.cameraPlayUrls, params });

/** 查询指定计划是否仍在执行中（入参: { id: 计划ID }，返回值: boolean） */
export const checkIsRunningPlan = (params) => fwbzHttp.get({ url: Api.isRunningPlan, params });



