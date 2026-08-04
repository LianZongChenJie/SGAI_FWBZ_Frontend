import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  venueInfoList = '/sgai-fwbz-dev/fwbz/venueInfo/list',
  addVenue = '/sgai-fwbz-dev/fwbz/venueInfo/add',
  editVenue = '/sgai-fwbz-dev/fwbz/venueInfo/edit',
  delVenue = '/sgai-fwbz-dev/fwbz/venueInfo/delete',
}

/** 场馆信息 */
export interface VenueItem {
  id: string
  venueName: string            // 场馆名称
  location: string        // 位置
  orientation: string     // 朝向
  area: string            // 建筑面积
  ceilingH: string          // 层高
  lighting: string        // 采光条件
  basicFacility: string  // 基础条件
  buildable: boolean  // 可施工
}

/** 场馆信息请求参数 */
export interface Request {
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

/** 获取场地列表 */
export const getVenueInfoList = (params: Request) => fwbzHttp.get({ url: Api.venueInfoList, params });

/** 新增场馆 */
export const addVenueInfo = (params: Request) => fwbzHttp.post({ url: Api.addVenue, params });

