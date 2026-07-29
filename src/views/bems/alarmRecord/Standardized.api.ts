import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getAlarmLevelListApi = '/bems/alarm/level/list',
  getAlarmLevelPageListApi = '/bems/alarm/level/listPage',
  addAlarmLevelApi = '/bems/alarm/level/add',
  editAlarmLevelApi = '/bems/alarm/level/edit',
  deleteAlarmLevelApi = '/bems/alarm/level/delete',
  enableAlarmLevelApi = '/bems/alarm/level/startLevel',
  disableAlarmLevelApi = '/bems/alarm/level/stopLevel',

  getAlarmCategoryListApi = '/bems/alarm/category/list',
  getAlarmCategoryPageListApi = '/bems/alarm/category/listPage',
  addAlarmCategoryApi = '/bems/alarm/category/add',
  editAlarmCategoryApi = '/bems/alarm/category/edit',
  deleteAlarmCategoryApi = '/bems/alarm/category/delete',
  enableAlarmCategoryApi = '/bems/alarm/category/startCategory',
  disableAlarmCategoryApi = '/bems/alarm/category/stopCategory',

  addAlarmRulesApi = '/bems/alarm/rule/add',
  editAlarmRulesApi = '/bems/alarm/rule/edit',
  deleteAlarmRulesApi = '/bems/alarm/rule/delete',
  getAlarmRulesListApi = '/bems/alarm/rule/listPage',
  enableAlarmRuleslApi = '/bems/alarm/rule/startRule',
  disableAlarmRuleslApi = '/bems/alarm/rule/stopRule',
  getAlarmRulesDetailApi = '/bems/alarm/rule/getDetailById',
  userList = '/sys/user/list',
  getPontByDeviceIdApi = '/bems/deviceAttribute/getByDeviceId',

  getAlarmRecordsListApi = '/bems/alarm/record/listPage',
  getAlarmRecordsStatisticsApi = '/bems/alarm/record/levelStatistics',
  eliminateAlarmRecordsApi = '/bems/alarm/record/elimination',

  selectDevice = '/bems/device/list',
  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',

  getWorkOrderDetailApi = '/bems/event/getDetail',
  getEventSpaceApi = '/bems/event/getEventSpace',
  transferEventApi = '/bems/alarm/record/transferEvent', 

  eliminationsApi = '/bems/alarm/record/eliminations', 


}

/**
 * 获取告警等级数据
 */
export const getAlarmLevelListApi = () => defHttp.get({ url: Api.getAlarmLevelListApi });

/**
 * 获取告警等级分页数据
 */
export const getAlarmLevelPageListApi = (params) => defHttp.get({ url: Api.getAlarmLevelPageListApi, params });

/**
 * 新增告警级别
 */
export const addAlarmLevelApi = (params) => defHttp.post({ url: Api.addAlarmLevelApi, params });

/**
 * 编辑告警级别
 */
export const editAlarmLevelApi = (params) => defHttp.post({ url: Api.editAlarmLevelApi, params }, { joinParamsToUrl: true });

/**
 * 删除告警级别
 * @param params
 */
export const deleteAlarmLevelApi = (params) => defHttp.delete({ url: Api.deleteAlarmLevelApi, params }, { joinParamsToUrl: true });

/**
 * 启用告警级别
 * @param params
 */
export const enableAlarmLevelApi = (params) => defHttp.post({ url: Api.enableAlarmLevelApi, params }, { joinParamsToUrl: true });

/**
 * 禁用告警级别
 * @param params
 */
export const disableAlarmLevelApi = (params) => defHttp.post({ url: Api.disableAlarmLevelApi, params }, { joinParamsToUrl: true });

/**
 * 获取告警类别数据
 */
export const getAlarmCategoryListApi = () => defHttp.get({ url: Api.getAlarmCategoryListApi });

/**
 * 获取告警等级分页数据
 */
export const getAlarmCategoryPageListApi = (params) => defHttp.get({ url: Api.getAlarmCategoryPageListApi, params });

/**
 * 新增告警级别
 */
export const addAlarmCategoryApi = (params) => defHttp.post({ url: Api.addAlarmCategoryApi, params });

/**
 * 编辑告警级别
 */
export const editAlarmCategoryApi = (params) => defHttp.post({ url: Api.editAlarmCategoryApi, params }, { joinParamsToUrl: true });

/**
 * 删除告警级别
 * @param params
 */
export const deleteAlarmCategoryApi = (params) => defHttp.delete({ url: Api.deleteAlarmCategoryApi, params }, { joinParamsToUrl: true });

/**
 * 启用告警级别
 * @param params
 */
export const enableAlarmCategoryApi = (params) => defHttp.post({ url: Api.enableAlarmCategoryApi, params }, { joinParamsToUrl: true });

/**
 * 禁用告警级别
 * @param params
 */
export const disableAlarmCategoryApi = (params) => defHttp.post({ url: Api.disableAlarmCategoryApi, params }, { joinParamsToUrl: true });

/**
 * 新增告警规则
 */
export const addAlarmRulesApi = (params) => defHttp.post({ url: Api.addAlarmRulesApi, params });

/**
 * 编辑告警规则
 */
export const editAlarmRulesApi = (params) => defHttp.post({ url: Api.editAlarmRulesApi, params });

/**
 * 获取告警规则表格数据
 */
export const getAlarmRulesListApi = (params) => defHttp.get({ url: Api.getAlarmRulesListApi, params });

/**
 * 启用告警规则
 * @param params
 */
export const enableAlarmRuleslApi = (params) => defHttp.post({ url: Api.enableAlarmRuleslApi, params }, { joinParamsToUrl: true });

/**
 * 禁用告警规则
 * @param params
 */
export const disableAlarmRuleslApi = (params) => defHttp.post({ url: Api.disableAlarmRuleslApi, params }, { joinParamsToUrl: true });

/**
 * 编辑告警规则获取数据详情
 */
export const getAlarmRulesDetailApi = (params) => defHttp.get({ url: Api.getAlarmRulesDetailApi, params }, { joinParamsToUrl: true });

/**
 * 删除告警规则
 * @param params
 */
export const deleteAlarmRulesApi = (params) => defHttp.delete({ url: Api.deleteAlarmRulesApi, params }, { joinParamsToUrl: true });

/**
 * 列表接口(查询用户，通过租户隔离)
 * @param params
 */
export const userList = (params) => defHttp.get({ url: Api.userList, params });

/**
 * 分设备下点位数据
 * @param params
 */
export const getPontByDeviceIdApi = (params) => defHttp.get({ url: Api.getPontByDeviceIdApi, params }, { joinParamsToUrl: true });

/**
 * 获取告警记录分页数据
 */
export const getAlarmRecordsListApi = (params) => defHttp.get({ url: Api.getAlarmRecordsListApi, params });

/**
 * 获取告警记录分页数据
 */
export const getAlarmRecordsStatisticsApi = (params) => defHttp.get({ url: Api.getAlarmRecordsStatisticsApi, params });

/**
 * 消除告警记录
 */
export const eliminateAlarmRecordsApi = (params) => defHttp.post({ url: Api.eliminateAlarmRecordsApi, params }, { joinParamsToUrl: true });

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

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
 * 获取工单详情
 */
export const getWorkOrderDetailApi = (params) => defHttp.get({ url: Api.getWorkOrderDetailApi, params }, { joinParamsToUrl: true });


/**
 * 获取详细地址树
 */
export const getEventSpaceApi = () => defHttp.get({ url: Api.getEventSpaceApi });

/**
 * 转工单
 */
export const transferEventApi = (params) => defHttp.post({ url: Api.transferEventApi, params });

/**
 * 误报消除
 */
export const eliminationsApi = (params) => defHttp.post({ url: Api.eliminationsApi, params });
