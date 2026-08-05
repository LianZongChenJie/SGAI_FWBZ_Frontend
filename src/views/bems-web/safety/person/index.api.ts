import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  /** 今日进场人数 */
  todayEntrance = '/sgai-fwbz-dev/fwbz/hikvision/dashboard/todayEntryCount',
  /** 当前在场人数 */
  currentEntrance = '/sgai-fwbz-dev/fwbz/hikvision/dashboard/currentOnsiteCount',
  /** 查询人员识别记录 */
  queryPersonRecord = '/sgai-fwbz-dev/fwbz/hikvision/dashboard/recognitionRecords',
  /** 查询异常行为预警 */
  queryAbnormalBehavior = '/sgai-fwbz-dev/fwbz/hikvision/dashboard/abnormalBehaviorAlerts',
  /** 人员轨迹查询 */
  trackList = '/sgai-fwbz-dev/fwbz/personnelTrajectory/query',
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

/**
 * 人员轨迹列表（含摄像头名称、安装位置、经纬度信息）
 *
 * ResultListPersonnelTrajectoryVO
 */
export interface Response {
    /**
     * 返回代码
     */
    code?: number;
    /**
     * 返回处理消息
     */
    message?: string;
    /**
     * 返回数据对象
     */
    result?: PersonnelTrajectoryVO[];
    /**
     * 成功标志
     */
    success?: boolean;
    /**
     * 时间戳
     */
    timestamp?: number;
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
     * 抓拍时间
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


/** 新增人员轨迹查询 */
export const addTrackQuery = (params: TrackQueryRequest) => fwbzHttp.post({ url: Api.trackList, params });

/** 获取今日进场人数 */
export const getTodayEntryCount = () => fwbzHttp.post({ url: Api.todayEntrance });

/** 获取当前在场人数 */
export const getCurrentOnsiteCount = () => fwbzHttp.post({ url: Api.currentEntrance });

/** 获取人员识别记录数 */
export const getRecognitionRecords = () => fwbzHttp.post({ url: Api.queryPersonRecord });

/** 获取异常行为预警数 */
export const getAbnormalBehaviorAlerts = () => fwbzHttp.post({ url: Api.queryAbnormalBehavior });
