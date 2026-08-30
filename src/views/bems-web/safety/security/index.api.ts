import { defHttp } from '/@/utils/http/axios';

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
  /** 摄像头分页列表 */
  cameraPage = '/sgai-fwbz-dev/fwbz/hikvision/camera/page',
  /** 获取运行中的巡更计划摄像头 */
  runningCameraList = '/sgai-fwbz-dev/fwbz/patrolPlan/runningPlan',
  /** 获取摄像头播放地址 */
  cameraPlayUrls = '/sgai-fwbz-dev/fwbz/hikvision/camera/playUrls',
  /** 获取摄像头分组树形数据 */
  cameraPackageGroup = '/sgai-fwbz-dev/fwbz/hikvision/camera/packageGroup',
  /** 是否是正在执行的计划 */
  isRunningPlan = '/sgai-fwbz-dev/fwbz/patrolPlan/isRunningPlan',
  /** 报警信息列表 */
  alarmInfoList = '/sgai-fwbz-dev/fwbz/hikvision/eventNotify/list',

  // 门禁
  /** 门禁汇总数据 */
  accessControlSummary = '/sgai-fwbz-dev/fwbz/hikvision/doorStatistics/summary',
  /** 门禁地点列表 */
  accessControlDoorList = '/sgai-fwbz-dev/fwbz/hikvision/door/list',
  /** 门禁设备列表 */
  accessControlDeviceList = '/sgai-fwbz-dev/fwbz/hikvision/acsDevice/list',
  /** 同步门禁状态 */
  syncAccessControlStatus = '/sgai-fwbz-dev/fwbz/hikvision/door/syncDoorStatus',
  /** 门禁事件列表 */
  accessControlEventList = '/sgai-fwbz-dev/fwbz/hikvision/doorEvent/list',
  /** 门禁开关操作 */
  accessControlSwitch = '/sgai-fwbz-dev/fwbz/hikvision/door/control',
}

/** 
 * 门禁地点查询入参
 */
export interface Request {
    /**
     * 门禁点编号（精确查询）
     */
    doorNo?: string;
    /**
     * 门状态，0-初始，1-开门，2-关门，3-离线（精确查询）
     */
    doorState?: string;
    /**
     * 安装位置（模糊查询）
     */
    installLocation?: string;
    /**
     * 资源名称（模糊查询）
     */
    name?: string;
    /**
     * 当前页码
     */
    pageNo?: number;
    /**
     * 每页大小
     */
    pageSize?: number;
    /**
     * 区域名称（模糊查询）
     */
    regionName?: string;
    /**
     * 接入协议（精确查询）
     */
    treatyType?: string;
}


/**
 * 控制请求参数
 *
 * DoorControlRequest
 */
export interface DoorControlRequest {
    /**
     * 控制类型：0-常开，1-门闭，2-门开，3-常闭
     */
    controlType: number;
    /**
     * 门禁点唯一标识，最大支持10个门禁点
     */
    doorIndexCodes: string[];
    [property: string]: any;
}


/**
 * 报警信息列表
 *
 * EventNotify
 */
export interface EventNotify {
    /**
     * 事件类别，如：视频事件
     */
    ability?: string;
    /**
     * 事件其它扩展信息，JSON格式存储
     */
    eventData?: string;
    /**
     * 事件唯一标识
     */
    eventId?: string;
    /**
     * 事件等级：0-未配置 1-低 2-中 3-高
     */
    eventLvl?: number;
    /**
     * 事件类型，数值编码
     */
    eventType?: number;
    /**
     * 记录创建时间
     */
    gmtCreate?: string;
    /**
     * 记录更新时间
     */
    gmtModified?: string;
    /**
     * 事件发生时间（设备时间），ISO8601格式
     */
    happenTime?: string;
    id?: number;
    /**
     * 事件从接收者发出的时间，ISO8601格式
     */
    sendTime?: string;
    /**
     * 事件源编号
     */
    srcIndex?: string;
    /**
     * 事件源名称
     */
    srcName?: string;
    /**
     * 事件源父设备编码
     */
    srcParentIndex?: string;
    /**
     * 事件源类型
     */
    srcType?: string;
    /**
     * 事件状态：0-瞬时 1-开始 2-停止
     */
    status?: number;
    /**
     * 脉冲超时时间，单位：秒
     */
    timeout?: number;
    [property: string]: any;
}


/**
 * 返回数据对象
 *
 * 门禁事件列表
 */
export interface IPageDoorEventListVO {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: DoorEventListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}



/**
 * 门禁点事件列表VO，供前端展示
 *
 * DoorEventListVO
 */
export interface DoorEventListVO {
    /**
     * 卡号
     */
    cardNo?: string;
    /**
     * 控制器设备名称
     */
    devName?: string;
    /**
     * 门禁点编码
     */
    doorIndexCode?: string;
    /**
     * 门禁点名称
     */
    doorName?: string;
    /**
     * 事件ID
     */
    eventId?: string;
    /**
     * 事件名称
     */
    eventName?: string;
    /**
     * 事件产生时间
     */
    eventTime?: string;
    /**
     * 事件类型
     */
    eventType?: number;
    /**
     * 记录创建时间
     */
    gmtCreate?: string;
    /**
     * 主键ID
     */
    id?: number;
    /**
     * 进出类型：1-进 0-出 -1-未知
     */
    inAndOutType?: number;
    /**
     * 人员所属组织名称
     */
    orgName?: string;
    /**
     * 人员唯一编码
     */
    personId?: string;
    /**
     * 人员姓名
     */
    personName?: string;
    /**
     * 抓拍图片地址
     */
    picUri?: string;
    /**
     * 读卡器名称
     */
    readerDevName?: string;
    [property: string]: any;
}

/**
 * 返回数据对象
 *
 * IPageAcsDeviceListVO
 */
export interface IPageAcsDeviceListVO {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: AcsDeviceListVO[];
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
 * 门禁设备列表VO，供前端展示门禁设备列表
 *
 * AcsDeviceListVO
 */
export interface AcsDeviceListVO {
    /**
     * 创建时间（设备侧上报）
     */
    createTime?: string;
    /**
     * 主动设备编号
     */
    deviceCode?: string;
    /**
     * 门禁设备类型编码
     */
    devTypeCode?: string;
    /**
     * 门禁设备类型型号
     */
    devTypeDesc?: string;
    /**
     * 资源唯一编码
     */
    indexCode?: string;
    /**
     * 门禁设备IP
     */
    ip?: string;
    /**
     * 厂商
     */
    manufacturer?: string;
    /**
     * 资源名称
     */
    name?: string;
    /**
     * 在线状态，0离线，1在线
     */
    online?: string;
    /**
     * 门禁设备端口
     */
    port?: string;
    /**
     * 所属区域
     */
    regionIndexCode?: string;
    /**
     * 区域名称
     */
    regionName?: string;
    /**
     * 接入协议
     */
    treatyType?: string;
    /**
     * 更新时间（设备侧上报）
     */
    updateTime?: string;
    [property: string]: any;
}


/**
 * 返回数据对象
 *
 * IPageDoorListVO
 */
export interface IPageDoorListVO {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: DoorListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}


/**
 * 门禁点列表VO，供前端展示门禁点列表
 *
 * DoorListVO
 */
export interface DoorListVO {
    /**
     * 通道号
     */
    channelNo?: string;
    /**
     * 创建时间（设备侧上报）
     */
    createTime?: string;
    /**
     * 门禁点编号
     */
    doorNo?: string;
    /**
     * 门状态，0-初始状态，1-开门状态，2-关门状态，3-离线状态
     */
    doorState?: string;
    /**
     * 资源唯一编码
     */
    indexCode?: string;
    /**
     * 安装位置
     */
    installLocation?: string;
    /**
     * 资源名称
     */
    name?: string;
    /**
     * 所属区域
     */
    regionIndexCode?: string;
    /**
     * 区域名称
     */
    regionName?: string;
    /**
     * 接入协议
     */
    treatyType?: string;
    /**
     * 更新时间（设备侧上报）
     */
    updateTime?: string;
    [property: string]: any;
}


/**
 * 门禁统计卡片
 *
 */
export interface StatCard {
    /**
     * 上下文描述（如 在线率xx%、较昨日↑3）
     */
    context?: string;
    /**
     * 标题
     */
    title?: string;
    /**
     * 数值
     */
    value?: { [key: string]: any };
    [property: string]: any;
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

/** 摄像头分组树 - 摄像头对象（海康资源树） */
export interface PackageVideo {
  /** 摄像头唯一编码 */
  indexCode?: string
  /** 摄像头名称 */
  name: string
  /** 摄像头类型：0-普通摄像头 1-半球摄像机 */
  cameraType?: number
  /** 安装位置 */
  installLocation?: string | null
  /** 所属区域编码 */
  regionIndexCode?: string
  /** 所属区域名称 */
  regionName?: string | null
  longitude?: number | null
  latitude?: number | null
  /** 通道类型 */
  channelType?: string
  /** 在线状态：0-离线 1-在线 */
  online?: number
  externalIndexCode?: string | null
  createTime?: string
  updateTime?: string
  [property: string]: any
}

/** 摄像头分组树 - 分组对象（区域/分组通用，海康资源树） */
export interface PackageGroup {
  /** 区域唯一编码 */
  indexCode: string
  /** 区域名称 */
  name: string
  /** 区域路径 */
  regionPath?: string
  /** 父区域编码 */
  parentIndexCode?: string
  /** 可用状态：0-不可用 1-可用 */
  available?: number
  /** 是否叶子：1-是（含摄像头） 0-否 */
  leaf?: number
  cascadeCode?: string
  cascadeType?: number
  /** 目录类型 */
  catalogType?: number
  externalIndexCode?: string | null
  /** 排序 */
  sort?: number
  localQuantity?: number | null
  totalQuantity?: number | null
  /** 直接挂载的摄像头列表 */
  videoList?: PackageVideo[]
  /** 子区域列表 */
  children?: PackageGroup[]
  [property: string]: any
}

/** 获取安防统计卡片汇总 */
export const getSecuritySummary = (params?) => defHttp.get({ url: Api.summary, params });

/** 获取巡更计划列表 */
export const getPatrolPlanList = (params?) => defHttp.get({ url: Api.patrolPlanList, params });

/** 编辑巡更计划 */
export const editPatrolPlan = (params: Request) => defHttp.put({ url: Api.patrolPlanEdit, params });

/** 新增巡更计划 */
export const addPatrolPlan = (params: Request) => defHttp.post({ url: Api.patrolPlanAdd, params });

/** 获取摄像头列表 */
export const getCameraList = (params?) => defHttp.get({ url: Api.cameraList, params });

/** 获取摄像头分页列表 */
export const getCameraPageList = (params?) => defHttp.get({ url: Api.cameraPage, params });

/** 获取摄像头分组树形数据（两级分组 + 摄像头列表） */
export const getCameraPackageGroup = (params?) => defHttp.get({ url: Api.cameraPackageGroup, params });

/** 获取运行中的巡更计划摄像头（实时监控画面） */
export const getRunningCameraList = (params?) => defHttp.get({ url: Api.runningCameraList, params });

/** 获取摄像头播放地址（入参格式: { cameraIndexCode: ['编码1', '编码2'] }） */
export const getCameraPlayUrls = (params) => defHttp.post({ url: Api.cameraPlayUrls, params });

/** 查询指定计划是否仍在执行中（入参: { id: 计划ID }，返回值: boolean） */
export const checkIsRunningPlan = (params) => defHttp.get({ url: Api.isRunningPlan, params });

/** 获取报警信息列表 */
export const getAlarmInfoList = (params?) => defHttp.get({ url: Api.alarmInfoList, params });

// ==================== 门禁相关接口 ====================

/** 获取门禁汇总数据 */
export const getAccessControlSummary = (params?) => defHttp.get({ url: Api.accessControlSummary, params });

/** 获取门禁地点列表 */
export const getAccessControlDoorList = (params?) => defHttp.get({ url: Api.accessControlDoorList, params });

/** 获取门禁设备列表 */
export const getAccessControlDeviceList = (params?) => defHttp.get({ url: Api.accessControlDeviceList, params });

/** 同步门禁状态 */
export const syncAccessControlStatus = () => defHttp.post({ url: Api.syncAccessControlStatus });

/** 获取门禁事件列表 */
export const getAccessControlEventList = (params?) => defHttp.get({ url: Api.accessControlEventList, params });


/** 门禁开关操作（控制类型：0-常开，1-门闭，2-门开，3-常闭） */
export const accessControlSwitch = (params: DoorControlRequest) => defHttp.post({ url: Api.accessControlSwitch, params });
