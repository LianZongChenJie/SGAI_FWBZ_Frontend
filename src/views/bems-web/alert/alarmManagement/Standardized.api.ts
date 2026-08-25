import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getAlarmLevelListApi = '/sgai-fwbz-dev/fwbz/alarm/level/list',
  getAlarmLevelPageListApi = '/sgai-fwbz-dev/fwbz/alarm/level/listPage',
  addAlarmLevelApi = '/sgai-fwbz-dev/fwbz/alarm/level/add',
  editAlarmLevelApi = '/sgai-fwbz-dev/fwbz/alarm/level/edit',
  deleteAlarmLevelApi = '/sgai-fwbz-dev/fwbz/alarm/level/delete',
  enableAlarmLevelApi = '/sgai-fwbz-dev/fwbz/alarm/level/startLevel',
  disableAlarmLevelApi = '/sgai-fwbz-dev/fwbz/alarm/level/stopLevel',

  getAlarmCategoryListApi = '/sgai-fwbz-dev/fwbz/alarm/category/list',
  getAlarmCategoryPageListApi = '/sgai-fwbz-dev/fwbz/alarm/category/listPage',
  addAlarmCategoryApi = '/sgai-fwbz-dev/fwbz/alarm/category/add',
  editAlarmCategoryApi = '/sgai-fwbz-dev/fwbz/alarm/category/edit',
  deleteAlarmCategoryApi = '/sgai-fwbz-dev/fwbz/alarm/category/delete',
  enableAlarmCategoryApi = '/sgai-fwbz-dev/fwbz/alarm/category/startCategory',
  disableAlarmCategoryApi = '/sgai-fwbz-dev/fwbz/alarm/category/stopCategory',

  addAlarmRulesApi = '/sgai-fwbz-dev/fwbz/alarm/rule/add',
  editAlarmRulesApi = '/sgai-fwbz-dev/fwbz/alarm/rule/edit',
  deleteAlarmRulesApi = '/sgai-fwbz-dev/fwbz/alarm/rule/delete',
  getAlarmRulesListApi = '/sgai-fwbz-dev/fwbz/alarm/rule/listPage',
  enableAlarmRuleslApi = '/sgai-fwbz-dev/fwbz/alarm/rule/startRule',
  disableAlarmRuleslApi = '/sgai-fwbz-dev/fwbz/alarm/rule/stopRule',
  getAlarmRulesDetailApi = '/sgai-fwbz-dev/fwbz/alarm/rule/getDetailById',
  userList = '/sys/user/list',
  getPontByDeviceIdApi = '/sgai-fwbz-dev/fwbz/deviceAttribute/getByDeviceId',

  getAlarmRuleStatisticsApi = '/sgai-fwbz-dev/fwbz/alarm/rule/statistics',

  getAlarmRecordStatisticsApi = '/sgai-fwbz-dev/fwbz/alarm/record/statistics',
  getAlarmRecordsListApi = '/sgai-fwbz-dev/fwbz/alarm/record/listPage',
  getAlarmRecordsStatisticsApi = '/sgai-fwbz-dev/fwbz/alarm/record/levelStatistics',
  confirmAlarmRecordApi = '/sgai-fwbz-dev/fwbz/alarm/record/confirm',
  eliminateAlarmRecordsApi = '/sgai-fwbz-dev/fwbz/alarm/record/elimination',
  transferEventAlarmRecordApi = '/sgai-fwbz-dev/fwbz/alarm/record/transferEvent',

  selectDevice = '/sgai-fwbz-dev/fwbz/device/list',
  selectMeasuringDevice = '/sgai-fwbz-dev/fwbz/device/measuring/list',
  spaceTree = '/sgai-fwbz-dev/fwbz/space/getTree',
  categoryTree = '/sgai-fwbz-dev/fwbz/equipmentCategory/getTree',
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
 * 获取告警规则统计数据
 */
export const getAlarmRuleStatisticsApi = () => defHttp.get({ url: Api.getAlarmRuleStatisticsApi });

/**
 * 获取告警记录统计数据
 */
export const getAlarmRecordStatisticsApi = () => defHttp.get({ url: Api.getAlarmRecordStatisticsApi });

/**
 * 获取告警记录分页数据
 */
export const getAlarmRecordsListApi = (params) => defHttp.get({ url: Api.getAlarmRecordsListApi, params });

/**
 * 获取告警记录分页数据
 */
export const getAlarmRecordsStatisticsApi = (params) => defHttp.get({ url: Api.getAlarmRecordsStatisticsApi, params });

/**
 * 确认告警记录
 */
export const confirmAlarmRecordApi = (params) => defHttp.post({ url: Api.confirmAlarmRecordApi, params }, { joinParamsToUrl: true });

/**
 * 消除告警记录
 */
export const eliminateAlarmRecordsApi = (params) => defHttp.post({ url: Api.eliminateAlarmRecordsApi, params }, { joinParamsToUrl: true });

/**
 * 转工单
 */
export const transferEventAlarmRecordApi = (data) => defHttp.post({ url: Api.transferEventAlarmRecordApi, data });

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 查询设备
 */
export const selectMeasuringDevice = (params) => defHttp.get({ url: Api.selectMeasuringDevice, params });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });
