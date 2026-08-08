import { defHttp } from '/@/utils/http/axios';

enum Api {
    /** 统计今日巡检完成数量 */
    todayCheck = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/todayCheck',
    /** 待处理告警异常 */
    alarmException = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/pendingAlarm',
    /** 当前在场人数 */
    currentEntryCount = '/sgai-fwbz-dev/fwbz/hikvision/dashboard/currentOnsiteCount',
    /** 当前在场车辆 */
    currentOnVehicle = '/sgai-fwbz-dev/fwbz/parkingStatistics/currentInCount',
    /** 剩余车位数 */
    remainingParkingSpace = '/sgai-fwbz-dev/fwbz/parkingStatistics/remainingSpaceCount',
    /** 在线摄像头 */
    onlineCamera = '/sgai-fwbz-dev/fwbz/securityStatistics/cameraOnline',
    /** 总数摄像头 */
    totalCamera = '/sgai-fwbz-dev/fwbz/securityStatistics/cameraTotal',
    /** 接入设备/数据采集点 */
    accessDevice = '/sgai-fwbz-dev/fwbz/dataCollection/collectionPointCount',
    /** 系统对接数 */
    systemDocking = '/sgai-fwbz-dev/fwbz/securityStatistics/systemDocking',
    /** 接口在线率 */
    onlineRate = '/sgai-fwbz-dev/fwbz/securityStatistics/onlineRate',
    /** 设备状态统计 */
    deviceStatusStatistics = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/countByTypeAndStatus',
    /** 当前在场 */
    currentOnSiteCount = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/currentVisitorCount',
    /** 今日活动数 */
    todayActivityCount = '/sgai-fwbz-dev/fwbz/activeMeetStatistics/countToday',
    /** 今日总客流 */
    todayVisitorCount = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/todayVisitorCount',
    /** 待筹备活动 */
    pendingActivity = '/sgai-fwbz-dev/fwbz/activeMeetStatistics/countNextWeek',
    /** 消防设备 */
    fireDeviceTotal = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/total',
    /** 今日告警 */
    todayAlarm = '/sgai-fwbz-dev/fwbz/hikvision/eventNotify/list',
    /** 门禁通行 */
    accessControl = '/sgai-fwbz-dev/fwbz/hikvision/doorStatistics/countTodayDoorEvents',
    /** 门禁设备总数 */
    accessDeviceTotal = '/sgai-fwbz-dev/fwbz/hikvision/doorStatistics/countTotalDevices',
    /** 门禁点位总数 */
    accessPointTotal = '/sgai-fwbz-dev/fwbz/hikvision/doorStatistics/countTotalDoorPoints',
    /** 消防设备 */
    fireDevice = '/sgai-fwbz-dev/fwbz/fireDevice/smokeDetector/count/total',
    /** 峰值客流 */
    peakFlow = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/peakVisitorCount',
    /** 本月活动数 */
    activityCount = '/sgai-fwbz-dev/fwbz/activeMeetStatistics/countThisMonth',
    /** 今日采集量 */
    todayCollectionAmount = '/sgai-fwbz-dev/fwbz/dataCollection/todayCollectionAmount',
    /** 数据完整率 */
    dataCompleteRate = '/sgai-fwbz-dev/fwbz/dataCollection/dataCompletenessRate',

    
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
    /** 待筹备会展 */
    pendingCount = '/sgai-fwbz-dev/fwbz/preparationStatistics/pendingCount',
    /** 当前展会 */
    currentExhibition = '/sgai-fwbz-dev/fwbz/complaintStatistics/todayActiveMeet',
    /** 筹备完成率 */
    preparationCompleteRate = '/sgai-fwbz-dev/fwbz/preparationStatistics/completionRate',
    /** 投诉建议 */
    complaintSuggestion = '/sgai-fwbz-dev/fwbz/complaintStatistics/todayComplaint',
    /** 待总结展会  */
    pendingSummaryExhibition = '/sgai-fwbz-dev/fwbz/activeMeetReport/statistics/countPendingSummary',
    /** 已总结展会 */
    summarizedExhibition = '/sgai-fwbz-dev/fwbz/activeMeetReport/statistics/countSummarized',
    /** 设备异常 */
    deviceException = '/sgai-fwbz-dev/fwbz/complaintStatistics/todayAlarm',
}

/**
 * 按设备类型统计状态数量
 *
 * DeviceTypeStatusVO
 */
export interface DeviceTypeStatusVO {
    /**
     * 该类型下各状态统计列表
     */
    data?: StatusCountVO[];
    /**
     * 设备类型名称
     */
    typeName?: string;
    [property: string]: any;
}

/**
 * 设备状态统计
 *
 * StatusCountVO
 */
export interface StatusCountVO {
    /**
     * 设备数量
     */
    count?: number;
    /**
     * 状态名称
     */
    status?: string;
    [property: string]: any;
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

/** 当前在场人数（韧性安全） */
export const getCurrentEntryCount = () => defHttp.get({ url: Api.currentEntryCount });

/** 当前在场车辆 */
export const getCurrentOnVehicle = () => defHttp.get({ url: Api.currentOnVehicle });

/** 剩余车位数 */
export const getRemainingParkingSpace = () => defHttp.get({ url: Api.remainingParkingSpace });

/** 在线摄像头数量 */
export const getOnlineCamera = () => defHttp.get({ url: Api.onlineCamera });

/** 摄像头总数 */
export const getTotalCamera = () => defHttp.get({ url: Api.totalCamera });

/** 接入设备数量（与数据采集点同一接口） */
export const getAccessDevice = () => defHttp.get({ url: Api.accessDevice });

/** 系统对接数 */
export const getSystemDocking = () => defHttp.get({ url: Api.systemDocking });

/** 接口在线率 */
export const getOnlineRate = () => defHttp.get({ url: Api.onlineRate });

/** 设备状态统计（按设备类型统计状态数量） */
export const getDeviceStatusStatistics = () => defHttp.get({ url: Api.deviceStatusStatistics });

/** 当前在场人数（场馆运营） */
export const getCurrentOnSiteCount = () => defHttp.get({ url: Api.currentOnSiteCount });

/** 今日活动数 */
export const getTodayActivityCount = () => defHttp.get({ url: Api.todayActivityCount });

/** 今日总客流（场馆运营） */
export const getTodayVisitorCount = () => defHttp.get({ url: Api.todayVisitorCount });

/** 待筹备活动 */
export const getPendingActivity = () => defHttp.get({ url: Api.pendingActivity });

/** 消防设备总数 */
export const getFireDeviceTotal = () => defHttp.get({ url: Api.fireDeviceTotal });

/** 今日告警（安全防范） */
export const getTodayAlarm = () => defHttp.get({ url: Api.todayAlarm });

/** 门禁通行 */
export const getAccessControl = () => defHttp.get({ url: Api.accessControl });

/** 门禁设备总数 */
export const getAccessDeviceTotal = () => defHttp.get({ url: Api.accessDeviceTotal });

/** 门禁点位总数 */
export const getAccessPointTotal = () => defHttp.get({ url: Api.accessPointTotal });

/** 消防设备（fireDevice 接口） */
export const getFireDevice = () => defHttp.get({ url: Api.fireDevice });

/** 峰值客流 */
export const getPeakFlow = () => defHttp.get({ url: Api.peakFlow });

/** 本月活动数 */
export const getActivityCount = () => defHttp.get({ url: Api.activityCount });

/** 今日采集量 */
export const getTodayCollectionAmount = () => defHttp.get({ url: Api.todayCollectionAmount });

/** 数据完整率 */
export const getDataCompleteRate = () => defHttp.get({ url: Api.dataCompleteRate });

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

/** 待筹备会展 */
export const getPendingCount = () => defHttp.get({ url: Api.pendingCount });

/** 当前展会 */
export const getCurrentExhibition = () => defHttp.get({ url: Api.currentExhibition });

/** 筹备完成率 */
export const getPreparationCompleteRate = () => defHttp.get({ url: Api.preparationCompleteRate });

/** 投诉建议 */
export const getComplaintSuggestion = () => defHttp.get({ url: Api.complaintSuggestion });

/** 待总结展会 */
export const getPendingSummaryExhibition = () => defHttp.get({ url: Api.pendingSummaryExhibition });

/** 已总结展会 */
export const getSummarizedExhibition = () => defHttp.get({ url: Api.summarizedExhibition });

/** 设备异常 */
export const getDeviceException = () => defHttp.get({ url: Api.deviceException });