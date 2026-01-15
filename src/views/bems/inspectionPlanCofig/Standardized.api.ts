import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getPlanConfigListApi = '/maintenance/planModel/queryPage',
  importTemplateApi = '/maintenance/planModel/importTemplate',

  exportTemplateApi = '/maintenance/planModel/exportTemplate',

}

/**
 * 计划配置列表
 * @param params
 */
export const getPlanConfigListApi = (params) => defHttp.get({ url: Api.getPlanConfigListApi, params }, { joinParamsToUrl: true });


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

