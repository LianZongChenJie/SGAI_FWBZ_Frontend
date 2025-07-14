import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getCircuitListApi = '/bems/lighting/circuit/listPage',
  addCircuitApi = '/bems/lighting/circuit/add',
  editCircuitApi = '/bems/lighting/circuit/edit',
  deleteCircuitByIdApi = '/bems/lighting/circuit/deleteById',
  batchDeleteCircuitApi = '/bems/lighting/circuit/deleteBatch',
  getCircuitDetailApi = '/bems/lighting/circuit/detail',
  getNotConfiguredListApi = '/bems/device/equipment/list',
  saveCircuitRelApi = '/bems/lighting/circuitRel/save',

  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',
}

/**
 * 获取回路配置列表数据
 */
export const getCircuitListApi = (params) => defHttp.get({ url: Api.getCircuitListApi, params });

/**
 * 新增回路配置
 */
export const addCircuitApi = (params) => defHttp.post({ url: Api.addCircuitApi, params });

/**
 * 编辑回路配置
 */
export const editCircuitApi = (params) => defHttp.post({ url: Api.editCircuitApi, params });

/**
 * 删除单条回路配置
 * @param params
 */
export const deleteCircuitByIdApi = (params) => defHttp.delete({ url: Api.deleteCircuitByIdApi, params }, { joinParamsToUrl: true });

/**
 * 批量删除回路配置
 * @param params
 */
export const batchDeleteCircuitApi = (params) => defHttp.delete({ url: Api.batchDeleteCircuitApi, params }, { joinParamsToUrl: true });

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
