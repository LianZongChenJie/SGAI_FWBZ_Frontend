import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getDurationStatisticsListApi = '/bems/lighting/circuit/analysisDuration',
  addCircuitApi = '/bems/lighting/circuit/add',
  startCircuitApi = '/bems/lighting/circuit/start',
  closeCircuitApi = '/bems/lighting/circuit/close',
  getCircuitDetailApi = '/bems/lighting/circuit/detail',
  getNotConfiguredListApi = '/bems/device/equipment/list',
  saveCircuitRelApi = '/bems/lighting/circuitRel/save',

  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',
}

/**
 * 获取回路配置列表数据
 */
export const getDurationStatisticsListApi = (params) => defHttp.get({ url: Api.getDurationStatisticsListApi, params });

/**
 * 新增回路配置
 */
export const addCircuitApi = (params) => defHttp.post({ url: Api.addCircuitApi, params });

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
 * 获取回路详情
 * @param params
 */
export const getCircuitDetailApi = (params) => defHttp.get({ url: Api.getCircuitDetailApi, params }, { joinParamsToUrl: true });

/**
 * 获取未配置列表数据
 * @param params
 */
export const getNotConfiguredListApi = (params) => defHttp.get({ url: Api.getNotConfiguredListApi, params }, { joinParamsToUrl: true });

/**
 * 保存回路配置
 * @param params
 */
export const saveCircuitRelApi = (params) => defHttp.post({ url: Api.saveCircuitRelApi, params });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });
