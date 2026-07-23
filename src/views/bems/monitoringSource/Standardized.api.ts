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
  groundFloor = '/admin/device/account/getSpaceInfoList',
  getPointData = '/admin/device/account/queryNewDeviceAccountList',

  getEnergyUseSafetyApi = '/bems/homePage/energyUseSafety',
  findDeviceAndAttributeApi = '/bems/device/findDeviceAndAttribute',
  deviceRunStateStatisticsApi = '/bems/device/deviceRunStateStatistics',

  findSpaceDeviceByCategoryldApi = '/bems/device/other/findSpaceDeviceByCategoryId',

  getByDeviceIdApi = '/bems/deviceAttribute/getByDeviceId',

  controlDeviceApi = '/bems/deviceAttribute/control',
  fjpgDeviceApi = '/bems/device/equipment/listDeviceAndAttribute',
  fjpgDeviceEditApi = '/bems/deviceAttribute/batchControl',
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
 * 禁用告警级别
 * @param params
 */
export const groundFloor = (params) => defHttp.post({ url: Api.disableAlarmLevelApi, params });


/**
 * 禁用告警级别
 * @param params
 */
export const getPointData = (params) => defHttp.get({ url: Api.getPointData, params });

/**
 * 用能安全
 */
export const getEnergyUseSafetyApi = (params) => defHttp.get({ url: Api.getEnergyUseSafetyApi, params });

/**
 * 禁用告警级别
 * @param params
 */
export const findDeviceAndAttributeApi = (params) => defHttp.get({ url: Api.findDeviceAndAttributeApi, params }, { joinParamsToUrl: true });

/**
 * 禁用告警级别
 * @param params
 */
export const deviceRunStateStatisticsApi = (params) => defHttp.get({ url: Api.deviceRunStateStatisticsApi, params }, { joinParamsToUrl: true });

/**
 * 禁用告警级别
 * @param params
 */
export const findSpaceDeviceByCategoryldApi = (params) => defHttp.get({ url: Api.findSpaceDeviceByCategoryldApi, params }, { joinParamsToUrl: true });

/**
 * 获取设备下点位数据
 * @param params
 */
export const getByDeviceIdApi = (params) => defHttp.get({ url: Api.getByDeviceIdApi, params }, { joinParamsToUrl: true });

/**
 * 设备属性控制
 * @param params
 */
export const controlDeviceApi = (params) => defHttp.post({ url: Api.controlDeviceApi, params });

/**
 * 获取风机盘管列表
 * @param params
 */
export const fjpgDeviceApi = (params) => defHttp.get({ url: Api.fjpgDeviceApi, params }, { joinParamsToUrl: true });
/**
 * 批量设备属性控制
 * @param params
 */
export const fjpgDeviceEditApi = (params) => defHttp.post({ url: Api.fjpgDeviceEditApi, params });
