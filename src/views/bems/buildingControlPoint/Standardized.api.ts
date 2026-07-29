import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getBuildingControlPointListApi = '/bems/bc/buildingControlPoint/listPage',
  getBuildingControlPointHistoryApi = '/bems/bc/buildingControlPointHistory/listPage',
}

/**
 * 获取楼控点位列表
 */
export const getBuildingControlPointListApi = (params) => defHttp.get({ url: Api.getBuildingControlPointListApi, params });

/**
 * 获取楼控点位历史数据
 */
export const getBuildingControlPointHistoryApi = (params) => defHttp.get({ url: Api.getBuildingControlPointHistoryApi, params });
