import { defHttp } from '/@/utils/http/axios';

enum Api {
    logApi = '/bems/manualTaskReadingLog/list',
}

export const getLogList = (params) => defHttp.get({ url: Api.logApi, params })