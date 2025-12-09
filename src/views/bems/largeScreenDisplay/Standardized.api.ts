import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getDurationStatisticsListApi = '/bems/lighting/circuit/analysisDuration',
  addCircuitApi = '/bems/lighting/circuit/add',
  startCircuitApi = '/bems/lighting/circuit/start',
  closeCircuitApi = '/bems/lighting/circuit/close',
  getCircuitDetailApi = '/bems/lighting/circuit/detail',
  getNotConfiguredListApi = '/bems/device/equipment/list',
  saveCircuitRelApi = '/bems/lighting/circuitRel/save',

  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',

  getSituationStatisticApi = '/bems/wd/getSituationStatistic',
  getScreenFireControlRoomApi = '/bems/wd/getScreenFireControlRoom',

  getPointDataForToDayApi = '/bems/dataQueue/getPointDataForToDay',
  getPointDataForThisMonthApi = '/bems/dataQueue/getPointDataForThisMonth',
  getPointDataForThisYearApi = '/bems/dataQueue/getPointDataForThisYear',
  getPointDataMonthlyComparisonTrendApi = '/bems/dataQueue/getPointDataMonthlyComparisonTrend',
  getPointDataMonthlyRankingApi = '/bems/dataQueue/getPointDataMonthlyRanking',

  getAlarmRecordListForMonthApi = '/bems/homePage/alarmRecordListForMonth',
}

/**
 * 获取回路配置列表数据
 */
export const getDurationStatisticsListApi = (params) => defHttp.get({ url: Api.getDurationStatisticsListApi, params });

/**
 * 新增回路配置
 */
export const addCircuitApi = (params) => defHttp.post({ url: Api.addCircuitApi, params });

/**
 * 开启回路
 * @param params
 */
export const startCircuitApi = (params) => defHttp.post({ url: Api.startCircuitApi, params }, { joinParamsToUrl: true });

/**
 * 关闭回路
 * @param params
 */
export const closeCircuitApi = (params) => defHttp.post({ url: Api.closeCircuitApi, params }, { joinParamsToUrl: true });

/**
 * 获取回路详情
 * @param params
 */
export const getCircuitDetailApi = (params) => defHttp.get({ url: Api.getCircuitDetailApi, params }, { joinParamsToUrl: true });

/**
 * 获取未配置列表数据
 * @param params
 */
export const getNotConfiguredListApi = (params) => defHttp.get({ url: Api.getNotConfiguredListApi, params }, { joinParamsToUrl: true });

/**
 * 保存回路配置
 * @param params
 */
export const saveCircuitRelApi = (params) => defHttp.post({ url: Api.saveCircuitRelApi, params });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 查询火警处理及时率、异常处理及时率、异常处置情况
 * @param params
 */
export const getSituationStatisticApi = () => defHttp.get({ url: Api.getSituationStatisticApi });

/**
 * 查询项目中得消控室值守人员和维保人员的统计数据和人员得取证情况
 * @param params
 */
export const getScreenFireControlRoomApi = () => defHttp.get({ url: Api.getScreenFireControlRoomApi });

/**
 * 获取当日点位水电数据
 * @param params
 */
export const getPointDataForToDayApi = (params) => defHttp.get({ url: Api.getPointDataForToDayApi, params }, { joinParamsToUrl: true });

/**
 * 获取当月点位水电数据
 * @param params
 */
export const getPointDataForThisMonthApi = (params) => defHttp.get({ url: Api.getPointDataForThisMonthApi, params }, { joinParamsToUrl: true });

/**
 * 获取当年点位水电数据
 * @param params
 */
export const getPointDataForThisYearApi = (params) => defHttp.get({ url: Api.getPointDataForThisYearApi, params }, { joinParamsToUrl: true });

/**
 * 获取当月、上月、去年本月的对比趋势
 * @param params
 */
export const getPointDataMonthlyComparisonTrendApi = (params) => defHttp.get({ url: Api.getPointDataMonthlyComparisonTrendApi, params }, { joinParamsToUrl: true });

/**
 * 获取月排行数据
 * @param params
 */
export const getPointDataMonthlyRankingApi = (params) => defHttp.get({ url: Api.getPointDataMonthlyRankingApi, params }, { joinParamsToUrl: true });

/**
 * 报警信息列表
 */
export const getAlarmRecordListForMonthApi = (params) => defHttp.get({ url: Api.getAlarmRecordListForMonthApi, params }, { joinParamsToUrl: true }); 