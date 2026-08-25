import { defHttp } from '/@/utils/http/axios'

enum Api {
  login1 = '/sgai-fwbz-dev/fwbz/lighting/proxyLogin',
}

/**
 * 空调机组实时监测列表
 */
export const Login1 = (params = {}) => defHttp.get({ url: Api.login1, params })

