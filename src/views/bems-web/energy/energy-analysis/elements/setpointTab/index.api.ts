import { defHttp } from '/@/utils/http/axios'

enum Api {
  send = '/sgai-fwbz-dev/fwbz/setpoint/send',
  recordList = '/sgai-fwbz-dev/fwbz/setpoint/recordList',
}

/**
 * 下发设定值
 * @param data - 包含 paramType / deviceId / setpoint
 */
export const sendSetpoint = (data = {}) => defHttp.post({ url: Api.send, data })

/**
 * 获取设定值下发记录列表
 * @param params - 分页参数 pageNo / pageSize
 */
export const getSetpointRecordList = (params = {}) => defHttp.get({ url: Api.recordList, params })
