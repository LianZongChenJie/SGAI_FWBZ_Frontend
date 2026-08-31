import { defHttp } from '/@/utils/http/axios';

enum Api {
  /** 汇总卡片列表 */
  summaryCardList = '/sgai-fwbz-dev/fwbz/activeMeetStatistics/summary',
  /** 场馆信息列表 */
  venueInfoList = '/sgai-fwbz-dev/fwbz/venueInfo/list',
  /** 新增场馆信息 */
  addVenue = '/sgai-fwbz-dev/fwbz/venueInfo/add',
  /** 编辑场馆信息 */
  editVenue = '/sgai-fwbz-dev/fwbz/venueInfo/edit',
  /** 删除场馆信息 */
  delVenue = '/sgai-fwbz-dev/fwbz/venueInfo/delete',

  /** 新增会展活动 */
  addExhibition = '/sgai-fwbz-dev/fwbz/activeMeet/info/add',
  /** 场馆列表（全量） */
  venueList = '/sgai-fwbz-dev/fwbz/venueInfo/listAll',
  /** 会展列表 */
  exhibitionList = '/sgai-fwbz-dev/fwbz/activeMeet/info/thisWeek',
  /** 本月会展列表 */
  exhibitionMonthList = '/sgai-fwbz-dev/fwbz/activeMeet/info/listPage',
  /** 删除会展活动 */
  delExhibition = '/sgai-fwbz-dev/fwbz/activeMeet/info/delete',
  /** 导出场馆活动数据 */
  exportData = '/sgai-fwbz-dev/fwbz/activeMeet/info/export',
}

/**
 * 会展列表
 */
export interface ResultListWeekActivityVO {
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
    result?: WeekActivityVO[];
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
 * 本周活动（按日期分组）
 *
 * WeekActivityVO
 */
export interface WeekActivityVO {
    /**
     * 活动日期
     */
    date?: string;
    /**
     * 当天活动列表
     */
    list?: ActiveMeetInfo[];
    [property: string]: any;
}

/**
 * 活动信息
 *
 * ActiveMeetInfo
 */
export interface ActiveMeetInfo {
    /**
     * 活动名称
     */
    activeName?: string;
    /**
     * 创建人
     */
    createBy?: string;
    /**
     * 创建日期
     */
    createTime?: string;
    /**
     * 结束时间
     */
    endTime?: string;
    /**
     * 主键
     */
    id?: number;
    pageNo?: number;
    pageSize?: number;
    /**
     * 预计人数
     */
    peopleQuantity?: number;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 开始时间
     */
    startTime?: string;
    /**
     * 所属部门
     */
    sysOrgCode?: string;
    /**
     * 更新人
     */
    updateBy?: string;
    /**
     * 更新日期
     */
    updateTime?: string;
    /**
     * 活动层数
     */
    venueFloors?: string;
    /**
     * 场馆id
     */
    venueId?: number;
    /**
     * 场馆名称（非数据库字段）
     */
    venueName?: string;
    [property: string]: any;
}

/**
 * 新增会展活动入参字段
 */
export interface ExhibitionRequest {
  /** 活动名称 */
  activeName?: string;
  /** 结束时间 */
  endTime?: string;
  /** 预计人数 */
  peopleQuantity?: number;
  /** 开始日期 */
  startDate?: string;
  /** 开始时间 */
  startTime?: string;
  /** 活动层数 */
  venueFloors?: string;
  /** 场馆id */
  venueId?: number;
  /** 场馆名称（非数据库字段） */
  venueName?: string;
  [property: string]: any;
}

/** 场馆信息 */
export interface VenueItem {
  id: number
  venueName: string            // 场馆名称
  location: string        // 位置
  orientation: string     // 朝向
  area: string            // 建筑面积
  ceilingH: string          // 层高
  lighting: string        // 采光条件
  basicFacility: string  // 基础条件
  buildable: number      // 可施工 1=是 0=否
  floors: string         // 楼层
  [property: string]: any;
}

/** 场馆信息请求参数 */
export interface VenueRequest {
  /** 建筑面积 */
  area?: string;
  /** 基础情况 */
  basicFacility?: string;
  /** 可施工 1=是 0=否 */
  buildable?: number;
  /** 层高 */
  ceilingH?: string;
  /** 楼层 */
  floors?: string;
  /** 主键 */
  id?: number;
  /** 采光条件 */
  lighting?: string;
  /** 位置 */
  location?: string;
  /** 朝向 */
  orientation?: string;
  /** 场馆名称 */
  venueName?: string;
  [property: string]: any;
}

/** 获取场地列表（分页） */
export const getVenueInfoList = (params: VenueRequest) => defHttp.get({ url: Api.venueInfoList, params });

/** 新增场馆 */
export const addVenueInfo = (params: VenueRequest) => defHttp.post({ url: Api.addVenue, params });

/** 获取场馆列表（全量，用于下拉选择） */
export const getVenueList = () => defHttp.get({ url: Api.venueList });

/** 新增会展活动排期 */
export const addExhibition = (params: ExhibitionRequest) => defHttp.post({ url: Api.addExhibition, params });

/** 获取本周会展活动列表 */
export const getExhibitionList = () => defHttp.get({ url: Api.exhibitionList });

/** 获取本月会展活动列表（入参 startDate、endDate） */
export const getExhibitionMonthList = (params: { startDate: string; endDate: string }) =>
  defHttp.get({ url: Api.exhibitionMonthList, params });

/** 删除会展活动 */
export const delExhibition = (params: { id: number }) => defHttp.delete({ url: `${Api.delExhibition}?id=${params.id}` });

/** 统计卡片数据项 */
export interface StatItem {
  /** 卡片标题 */
  title: string
  /** 卡片数值 */
  value: string
  /** 变化描述 */
  context: string
}

/** 获取统计卡片汇总 */
export const getSummaryCardList = () => defHttp.get({ url: Api.summaryCardList });

/** 导出场馆活动数据（入参 startDate、endDate） */
export const exportData = (params: { startDate: string; endDate: string }) =>
  defHttp.get({ url: Api.exportData, params, responseType: 'blob' }, { isTransformResponse: false });
