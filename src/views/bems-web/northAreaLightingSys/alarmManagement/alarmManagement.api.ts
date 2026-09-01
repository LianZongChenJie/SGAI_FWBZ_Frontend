import { defHttp } from '/@/utils/http/axios';


enum Api {
  alarmList = '/sgai-bqzm/bems/alarm/record/listPage',
  alarmBatchDispose = '/sgai-bqzm/bems/alarm/record/eliminations',
  alarmTransferWorkOrder = '/sgai-bqzm/bems/alarm/record/transferEvent ',
  alarmClose = '/sgai-bqzm/bems/alarm/record/elimination',
  alarmRetry = '/sgai-bqzm/bems/alarm/record/test',
  alarmConfigSave = '/sgai-bqzm//bems/alarm/rule/add',
  alarmCategoryList = '/sgai-bqzm//bems/alarm/rules/list',
  alarmLevelList = '/sgai-bqzm/bems/alarm/level/list',
  crcuitListApi = '/sgai-bqzm/bems/lighting/circuit/listPage',
}

/** 获取报警记录列表 */
export const getAlarmListApi = (params?) => defHttp.get({ url: Api.alarmList, params });


/** 批量处置 */
export const batchDisposeApi = (data) => defHttp.post({ url: Api.alarmBatchDispose, data });

/** 转工单 */
export const transferWorkOrderApi = (data) => defHttp.post({ url: Api.alarmTransferWorkOrder, data });

/** 关闭报警 */
export const closeAlarmApi = (id) => defHttp.post({ url: `${Api.alarmClose}?id=${id}` });

/** 重试报警 */
export const retryAlarmApi = (data) => defHttp.get({ url: Api.alarmRetry, data });

/** 保存报警配置 */
export const saveAlarmConfigApi = (data) => defHttp.post({ url: Api.alarmConfigSave, data });

/** 获取报警类别列表 */
export const getAlarmCategoryListApi = () => defHttp.get({ url: Api.alarmCategoryList });

/** 获取所有报警等级 */
export const getAlarmLevelListApi = () => defHttp.get({ url: Api.alarmLevelList });
/** 获取电路列表 */
export const getCircuitListApi = (params?) => defHttp.get({ url: Api.crcuitListApi, params });
