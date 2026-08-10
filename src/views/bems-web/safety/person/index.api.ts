import { defHttp } from '/@/utils/http/axios';

enum Api {
  /** 卡片汇总 */
  summary = '/sgai-fwbz-dev/fwbz/hikvision/dashboard/stat/summary',
  /** 新增人员轨迹查询 */
  trackList = '/sgai-fwbz-dev/fwbz/personnelTrajectory/query',
  /** 人员识别记录 */
  recognitionRecord = '/sgai-fwbz-dev/fwbz/hikvision/personRecognition/list',
  /** 场馆客流趋势数据 */
  venueFlowTrend = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/hourly/todayTrend',
  /** 场馆列表（全量） */
  venueList = '/sgai-fwbz-dev/fwbz/venueInfo/listAll',
  /** 人员分布热力图 */
  distributionMap = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/hourly/heatmap',
}

/**
 * 新增人员轨迹查询
 *
 * PersonnelTrajectoryResultVO
 */
export interface PersonnelTrajectoryResultVO {
    /**
     * 轨迹摄像头信息列表
     */
    cameraList?: PersonnelTrajectoryVO[];
    /**
     * 证件号码
     */
    certificateNum?: string;
    /**
     * 证件类别：111-身份证，OTHER-其它证件
     * 证件类别
     */
    certificateType?: string;
    /**
     * 人脸分组人脸图片URL
     */
    faceUrl?: string;
    /**
     * 人脸分组匹配姓名
     */
    name?: string;
    /**
     * 人脸分组相似度
     */
    similarity?: string;
    [property: string]: any;
}

/**
 * 人员轨迹结果
 *
 * PersonnelTrajectoryVO
 */
export interface PersonnelTrajectoryVO {
    /**
     * 背景图片URL
     */
    bkgPicUrl?: string;
    /**
     * 摄像头唯一编码
     */
    cameraIndexCode?: string;
    /**
     * 摄像头名称
     */
    cameraName?: string;
    /**
     * 抓拍时间（ISO8601标准）
     */
    captureTime?: string;
    /**
     * 人脸图片URL
     */
    facePicUrl?: string;
    /**
     * 摄像头安装位置
     */
    installLocation?: string;
    /**
     * 纬度
     */
    latitude?: number;
    /**
     * 经度
     */
    longitude?: number;
    /**
     * 相似度
     */
    similarity?: string;
    [property: string]: any;
}


/**
 * 各场馆热力图数据项
 *
 * VenueHeatmapItemVO
 */
export interface VenueHeatmapItemVO {
    /**
     * 场馆ID
     */
    id?: number;
    /**
     * 纬度
     */
    lat?: number;
    /**
     * 经度
     */
    lng?: number;
    /**
     * 场馆名称
     */
    name?: string;
    /**
     * 剩余比例 = shengyu/total
     */
    saturation?: number;
    /**
     * 剩余容量
     */
    shengyu?: number;
    /**
     * 拥挤状态：宽松/适中/拥挤
     */
    state?: string;
    /**
     * 今日峰值（max_count），作为容量参考
     */
    total?: number;
    /**
     * 使用率百分比 = used/total * 100
     */
    usageRate?: number;
    /**
     * 当前在场人数（today_now_count）
     */
    used?: number;
    /**
     * 使用比例 = used/total
     */
    usedRate?: number;
    [property: string]: any;
}



/** 客流趋势入参 */
export interface VenueFlowTrendRequest {
    /**
     * 日期，默认今天
     */
    date?: string;
    /**
     * 统计周期: 0-本日, 1-本周, 2-本月
     */
    periodType: number;
    [property: string]: any;
}

/** 场馆客流趋势返回数据（各场馆为动态 key，不含总流量） */
export interface VenueFlowTrendVO {
    /** 时间轴标签（如小时/日期/星期） */
    date?: string[];
    /** 各场馆客流数据，key 为场馆名称（如 "1号馆"），value 为各时间点客流数组 */
    [property: string]: any;
}

/** 场馆信息 */
export interface VenueItem {
    id: number;
    /** 场馆名称 */
    venueName: string;
    /** 位置 */
    location: string;
    /** 朝向 */
    orientation: string;
    /** 建筑面积 */
    area: string;
    /** 层高 */
    ceilingH: string;
    /** 采光条件 */
    lighting: string;
    /** 基础条件 */
    basicFacility: string;
    /** 可施工 1=是 0=否 */
    buildable: number;
    /** 楼层 */
    floors: string;
    [property: string]: any;
}




/** 人员识别记录入参字段定义 */
export interface Request {
    /**
     * 进出方向（进/出/未知）
     */
    direction?: string;
    /**
     * 员工号，精确匹配
     */
    employeeNo?: string;
    /**
     * 识别结束时间
     */
    endTime?: string;
    /**
     * 页码，从1开始
     */
    pageNo: number;
    /**
     * 每页条数
     */
    pageSize: number;
    /**
     * 姓名，模糊匹配
     */
    personName?: string;
    /**
     * 人员类型（员工/访客/VIP/临时人员/黑名单等）
     */
    personType?: string;
    /**
     * 识别位置，模糊匹配
     */
    recognizeLocation?: string;
    /**
     * 识别开始时间
     */
    startTime?: string;
    /**
     * 所属场馆，模糊匹配
     */
    venue?: string;
    [property: string]: any;
}

/**
 * 人员识别记录返回值
 *
 */
export interface IPagePersonRecognition {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    optimizeJoinOfCountSql?: boolean;
    pages?: number;
    records?: PersonRecognition[];
    searchCount?: boolean;
    size?: number;
    total?: number;
    [property: string]: any;
}


/**
 * 人员识别记录表
 *
 * PersonRecognition
 */
export interface PersonRecognition {
    /**
     * 置信度
     */
    confidence?: number;
    /**
     * 进出方向（进/出/未知）
     */
    direction?: string;
    /**
     * 员工号
     */
    employeeNo?: string;
    /**
     * 记录创建时间
     */
    gmtCreate?: string;
    /**
     * 记录更新时间
     */
    gmtModified?: string;
    id?: number;
    /**
     * 姓名
     */
    personName?: string;
    /**
     * 人员类型（员工/访客/VIP/临时人员/黑名单等）
     */
    personType?: string;
    /**
     * 识别位置
     */
    recognizeLocation?: string;
    /**
     * 识别时间
     */
    recognizeTime?: string;
    /**
     * 所属场馆
     */
    venue?: string;
    [property: string]: any;
}


/**
 * 统计卡片
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
    value?: string;
    [property: string]: any;
}


/**
 * 人员轨迹新增查询请求参数
 */
export interface TrackQueryRequest {
  /** 人脸照片Base64编码字符串 */
  facePhoto?: string;
  /** 查询开始时间，格式 YYYY-MM-DD HH:mm:ss */
  startTime?: string;
  /** 查询结束时间，格式 YYYY-MM-DD HH:mm:ss */
  endTime?: string;
  [property: string]: any;
}

export const addTrackQuery = (params: TrackQueryRequest) => defHttp.post({ url: Api.trackList, params });

/** 获取今日进场人数 */
export const getSummary = () => defHttp.get({ url: Api.summary });

/** 获取人员识别记录列表（分页） */
export const getRecognitionRecord = (params: Request) =>
    defHttp.get({ url: Api.recognitionRecord, params });

/** 获取场馆列表（全量，用于下拉选择） */
export const getVenueList = () => defHttp.get({ url: Api.venueList });

/** 获取场馆客流趋势数据 */
export const getVenueFlowTrend = (params: VenueFlowTrendRequest) =>
    defHttp.get({ url: Api.venueFlowTrend, params });

/** 人员分布热力图（各场馆热力数据） */
export const getDistributionMap = () => defHttp.get({ url: Api.distributionMap });
