import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  addCircuitApi = '/bems/lighting/circuit/add',
  getCircuitListApi = '/bems/lighting/circuit/listPage',
  getCircuitDetailApi = '/bems/lighting/circuit/detail',
  startCircuitApi = '/bems/lighting/circuit/start',
  closeCircuitApi = '/bems/lighting/circuit/close',

  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',
}

/**
 * 新增回路配置
 */
export const addCircuitApi = (params) => defHttp.post({ url: Api.addCircuitApi, params });

/**
 * 获取回路配置列表数据
 */
export const getCircuitListApi = (params) => defHttp.get({ url: Api.getCircuitListApi, params });

/**
 * 获取回路详情
 * @param params
 */
export const getCircuitDetailApi = (params) => defHttp.get({ url: Api.getCircuitDetailApi, params }, { joinParamsToUrl: true });

/**
 * 开启回路
 * @param params
 */
export const startCircuitApi = (params) => defHttp.post({ url: Api.startCircuitApi, params }, { joinParamsToUrl: true });

/**
 * 关闭回路
 * @param params
 */
export const closeCircuitApi = (params) => defHttp.post({ url: Api.closeCircuitApi, params }, { joinParamsToUrl: true });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });
