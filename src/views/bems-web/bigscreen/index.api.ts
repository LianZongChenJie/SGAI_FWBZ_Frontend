import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 统计今日巡检完成数量 */
    todayCheck = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/todayCheck',
    /** 待处理告警异常 */
    alarmException = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/pendingAlarm',
    
    /** 故障告警 */
    /** 告警记录分页列表 */
    alarmRecordList = '/sgai-tp/fwbz/alarm/record/listPage',
    /** 告警统计 */
    alarmStatistics = '/sgai-tp/fwbz/alarm/record/statistics',
    /** 告警趋势 */
    alarmTrendRecently = '/sgai-tp/fwbz/alarm/record/alarmTrendRecently',
    /** 今日数据量 */
    todayDataSize = '/sgai-fwbz-dev/fwbz/interfaceStatistics/todayDataSize',
    /** 数据采集点 */
    collectionPoint = '/sgai-fwbz-dev/fwbz/dataCollection/collectionPointCount',
    /** 今日总客流 */
    todayTraffic = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/todayVisitorCount',
    /** 当前在馆 */
    currentOnSite = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/currentVisitorCount',
    /** 停车场实时状态 */
    parkingLotStatus = '/sgai-fwbz-dev/fwbz/parkingStatistics/parkingSpaceDistribution',
    /** 摄像头坐标分组分布 */
    cameraCoordinateGroup = '/sgai-fwbz-dev/fwbz/hikvision/camera/coordinateGroup',
    /** 人员热力分布数据 */
    personHeatMap = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/hourly/areaHeat',
}

/**
 * 返回数据对象
 *
 * 人员热力分布数据
 */
export interface AreaHeatResponseVO {
    /**
     * 最大权重
     */
    maxweight?: number;
    /**
     * 热力图数据列表
     */
    peopleHeatmapDataList?: AreaHeatDataItemVO[];
    [property: string]: any;
}

/**
 * 区域热力图数据项
 *
 * AreaHeatDataItemVO
 */
export interface AreaHeatDataItemVO {
    /**
     * 人数
     */
    count?: number;
    /**
     * 纬度
     */
    lat?: number;
    /**
     * 经度
     */
    lon?: number;
    [property: string]: any;
}


// 摄像头视频信息
export interface VideoInfo {
    /** 视频ID */
    id: number;
    /** 视频名称 */
    name: string;
    /** 简称 */
    shortName: string;
    /** 视频编码 */
    videoCode:  string;
    /** 经度 */
    longitude: string;
    /** 纬度 */
    latitude: string;
    /** IP地址 */
    ip: string;
    /** 端口 */
    port:  number;
    /** 用户名 */
    userName:  string;
    /** 密码 */
    password:  string;
    /** 空间路径 */
    spacePath:  string;
    /** 系统ID */
    systemId: string;
    /** 绘图编码 */
    drawingCode:  string;
    /** 类型 */
    type:  string;
    /** 远程ID */
    remoteId: number;
    /** 排序号 */
    sortNum:  number;
    /** 是否初始化 */
    isInit: number;
    /** 制造商 */
    manufacturers:  string;
    /** 点位路径 */
    pointPath: string;
    /** 分组ID */
    groupId:  string;
    /** 分组名称 */
    groupName:  string;
    /** 在线状态 */
    online:  boolean;
    /** URL地址 */
    url:  string;
}

// 摄像头分组信息
export interface CameraGroup {
    /** 纬度 */
    latitude: number;
    /** 该分组下的摄像头数量 */
    count: number;
    /** 摄像头列表 */
    videos: VideoInfo[];
    /** 经度 */
    longitude: number;
}


/**
 * 停车场实时车位分布 VO（用于"停车场实时状态"统计图）
 *
 * ParkingSpaceStatVO
 */
export interface ParkingSpaceStatVO {
    /**
     * 停车场ID
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
     * 停车场名称（如 P1）
     */
    name?: string;
    /**
     * 饱和度
     */
    saturation?: number;
    /**
     * 剩余车位数
     */
    shengyu?: number;
    /**
     * 车位状态（宽松/适中/拥挤）
     */
    state?: string;
    /**
     * 总车位数
     */
    total?: number;
    /**
     * 使用率（百分比，保留 1 位小数）
     */
    usageRate?: number;
    /**
     * 已用车位数
     */
    used?: number;
    /**
     * 使用率（原始值，来自API）
     */
    usedRate?: number;
    [property: string]: any;
}




/**
 * 统计数量
 *
 */
export interface CountVO {
    /**
     * 上下文描述（如 ↑3、↓2、进行中、下周开始）
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

/** 统计今日巡检完成数量 */
export const getTodayCheckCount = () => defHttp.get({ url: Api.todayCheck });

/** 待处理告警异常 */
export const getAlarmExceptionCount = () => defHttp.get({ url: Api.alarmException });

/** 告警记录分页列表（待处理告警） */
export const getAlarmRecordList = (params: { pageNo: number; pageSize: number; alarmStatus: number }) =>
  defHttp.get({ url: Api.alarmRecordList, params });

/** 告警统计 */
export const getAlarmStatistics = () => defHttp.get({ url: Api.alarmStatistics });

/** 告警趋势 */
export const getAlarmTrendRecently = () => defHttp.get({ url: Api.alarmTrendRecently });

/** 今日数据量（返回KB） */
export const getTodayDataSize = () => defHttp.get({ url: Api.todayDataSize });

/** 数据采集点数量 */
export const getCollectionPointCount = () => defHttp.get({ url: Api.collectionPoint });

/** 今日总客流 */
export const getTodayTraffic = () => defHttp.get({ url: Api.todayTraffic });

/** 当前在场人数 */
export const getCurrentOnSite = () => defHttp.get({ url: Api.currentOnSite });

/** 停车场实时车位分布 */
export const getParkingLotStatus = () => defHttp.get({ url: Api.parkingLotStatus });

/** 摄像头坐标分组分布 */
export const getCameraCoordinateGroup = () => defHttp.get({ url: Api.cameraCoordinateGroup });

/** 人员热力分布数据 */
export const getPersonHeatMap = () => defHttp.get({ url: `${Api.personHeatMap}?areaId=` });