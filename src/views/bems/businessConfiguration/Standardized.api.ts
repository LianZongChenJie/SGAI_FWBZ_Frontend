import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {

  getBusinessConfigListApi = '/bems/businessConfig/list',
  editBusinessConfigApi = '/bems/businessConfig/update',
}

/**
 * 获取配置数据
 */
export const getBusinessConfigListApi = (params) => defHttp.get({ url: Api.getBusinessConfigListApi, params }, { joinParamsToUrl: true });



/**
 * 编辑配置
 */
export const editBusinessConfigApi = (params) => defHttp.post({ url: Api.editBusinessConfigApi, params }, { joinParamsToUrl: true });
