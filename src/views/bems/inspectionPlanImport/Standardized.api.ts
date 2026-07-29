import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getPlanListApi = '/maintenance/planModel/findByYear',
  importTemplateApi = '/maintenance/planModel/importTemplate',

  exportTemplateApi = '/maintenance/planModel/exportTemplate',

}

/**
 * 计划列表
 * @param params
 */
export const getPlanListApi = (params) => defHttp.get({ url: Api.getPlanListApi, params }, { joinParamsToUrl: true });


/**
 * 计划导入
 * @param params
 */
let headers = {
  'Content-Type': 'multipart/form-data',
};
export const importTemplateApi = (params) => defHttp.post({ url: Api.importTemplateApi, params, headers });

/**
 * 导出
 * @param params
 */
export const exportTemplateApi = (params) => defHttp.get({ url: Api.exportTemplateApi, params, responseType: 'blob', }, { joinParamsToUrl: true });

