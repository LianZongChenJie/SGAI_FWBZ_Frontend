import { defHttp } from '/@/utils/http/axios';

enum Api {
  /** 汇总统计 */
  sunnary = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/summary',
  /** 客流统计列表 */
  flowList = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/venueList',
  /** 各场馆客流趋势 */
  trend = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/hourly/todayTrend',
  /** 实时客流热力图 */
  heatmap = '/sgai-fwbz-dev/fwbz/venueVisitorFlow/hourly/heatmap',

}

/**
 * 实时客流热力图
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


 /** 各场馆客流趋势-请求参数 */
export interface Request {
    /**
     * 统计周期: 0-本日, 1-本周, 2-本月
     */
    periodType: number;
    [property: string]: any;
}




/**
 * 场馆客流统计卡片 VO
 * <p>对应前端四张卡片：今日总客流 / 当前在场 / 峰值客流 / 平均停留</p>
 *
 * VisitorFlowCardVO
 */
export interface VisitorFlowCardVO {
    /**
     * 上下文描述（如 ↑5.3% 较昨日、进行中）
     */
    context?: string;
    /**
     * 标题
     */
    title?: string;
    /**
     * 单位/后缀（如 h、%）
     */
    unit?: string;
    /**
     * 数值
     */
    value?: string;
    [property: string]: any;
}

/**
 * 客流统计列表字段
 */
export interface ResultListVenueFlowVO {
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
    result?: VenueFlowVO[];
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
 * 各场馆客流统计 VO（前端表格展示）
 * <p>对应前端"各场馆客流统计"表格：场馆 / 今日进场 / 当前在场 / 峰值人数 / 峰值时间 / 平均停留 / 较昨日 / 状态</p>
 *
 * VenueFlowVO
 */
export interface VenueFlowVO {
    /**
     * 平均停留时长
     */
    averageDuration?: number;
    /**
     * 较昨日增减率描述（如 ↑18.5%）
     */
    compareRate?: string;
    /**
     * 峰值人数
     */
    maxCount?: number;
    /**
     * 峰值时间（HH:mm）
     */
    maxTime?: string;
    /**
     * 状态码（1=正常，0=异常）
     */
    status?: number;
    /**
     * 状态描述（如 正常 / 异常）
     */
    statusLabel?: string;
    /**
     * 今日进场人数
     */
    todayInCount?: number;
    /**
     * 当前在场人数
     */
    todayNowCount?: number;
    /**
     * 场馆id
     */
    venueId?: number;
    /**
     * 场馆名称
     */
    venueName?: string;
    [property: string]: any;
}

/** 客流统计列表查询参数 */
export interface FlowListRequest {
  /** 查询日期，格式 YYYY-MM-DD */
  date?: string;
  /** 场馆ID（不传则查全部场馆） */
  venueId?: number;
  [property: string]: any;
}

/** 统计卡片数据项 */
export interface StatItem {
  title: string
  value: string
  context: string
}

/** 获取客流汇总卡片 */
export const getFlowSummary = () => defHttp.get({ url: Api.sunnary });

/** 获取各场馆客流统计列表 */
export const getFlowList = (params: FlowListRequest) => defHttp.get({ url: Api.flowList, params });

/** 获取各场馆客流趋势（今日/本周/本月） */
export const getFlowTrend = (params: Request) => defHttp.get({ url: Api.trend, params });

/** 获取实时客流热力图数据 */
export const getHeatmap = () => defHttp.get({ url: Api.heatmap });