import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getLinkageControlListApi = '/bems/linkageStrategy/listPage',
  createLinkageControlApi = '/bems/linkageStrategy/add',
  selectDevice = '/bems/device/list',
  spaceTree = '/bems/space/getTree',
  categoryTree = '/bems/equipmentCategory/getTree',
  getPontByDeviceIdApi = '/bems/deviceAttribute/getByDeviceId', 
  editLinkageControlApi = '/bems/linkageStrategy/edit',
  getLinkageControlDetailApi = '/bems/linkageStrategy/getDetailById',
  deleteLinkageControlApi = '/bems/linkageStrategy/delete',
  enableLinkageControlApi = '/bems/linkageStrategy/startStrategy',
  disableLinkageControlApi = '/bems/linkageStrategy/stopStrategy',
}

/**
 * 获取联动控制表格数据
 */
export const getLinkageControlListApi = (params) => defHttp.get({ url: Api.getLinkageControlListApi, params });

/**
 * 创建联动控制
 */
export const createLinkageControlApi = (params) => defHttp.post({ url: Api.createLinkageControlApi, params });

/**
 * 编辑联动控制获取数据详情
 */
export const getLinkageControlDetailApi = (params) => defHttp.get({ url: Api.getLinkageControlDetailApi, params }, { joinParamsToUrl: true }); 

/**
 * 编辑联动控制
 */
export const editLinkageControlApi = (params) => defHttp.post({ url: Api.editLinkageControlApi, params }); 

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 获取空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 分设备下点位数据
 * @param params
 */
export const getPontByDeviceIdApi = (params) => defHttp.get({ url: Api.getPontByDeviceIdApi, params }, { joinParamsToUrl: true }); 

/**
 * 删除策略
 * @param params
 */
export const deleteLinkageControlApi = (params) => defHttp.delete({ url: Api.deleteLinkageControlApi, params }, { joinParamsToUrl: true }); 

/**
 * 启用策略
 * @param params
 */
export const enableLinkageControlApi = (params) => defHttp.post({ url: Api.enableLinkageControlApi, params }, { joinParamsToUrl: true }); 

/**
 * 禁用策略
 * @param params
 */
export const disableLinkageControlApi = (params) => defHttp.post({ url: Api.disableLinkageControlApi, params }, { joinParamsToUrl: true }); 
