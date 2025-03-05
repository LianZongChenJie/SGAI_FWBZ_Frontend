import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  addMeteringPoint = '/bems/meteringPoint/add',
  editMeteringPoint = '/bems/meteringPoint/edit',
  deleteMeteringPoint = '/bems/meteringPoint/delete',
  selectMeteringPoint = '/bems/meteringPoint/list',
  categoryTree = '/bems/equipmentCategory/getTree',
  spaceTree = '/bems/space/getTree',
  unitList = '/bems/unitManagement/findAll',
  deviceList = '/bems/device/list',
  analyticFormula = '/bems/meteringPoint/analyticFormula',
  saveFormula = '/bems/meteringPoint/saveFormula',
}

/**
 * 查询计量点位
 */
export const selectPoint = (params) => defHttp.get({ url: Api.selectMeteringPoint, params });

/**
 * 新增计量点位
 */
export const addPoint = (params) => defHttp.post({ url: Api.addMeteringPoint, params });

/**
 * 修改计量点位
 */
export const editPoint = (params) => defHttp.post({ url: Api.editMeteringPoint, params });
/**
 * 删除计量点位
 */
export const deletePoint = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteMeteringPoint, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 分类树
 * @param params
 */
export const categoryTree = () => defHttp.get({ url: Api.categoryTree });
/**
 * 空间树
 * @param params
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 单位列表
 * @param params
 */
export const unitList = () => defHttp.get({ url: Api.unitList });

/**
 * 设备列表
 * @param params
 */
export const deviceList = (params) => defHttp.get({ url: Api.deviceList, params });

/**
 * 解析公式
 * @param params
 */
export const analyticFormula = (params) => defHttp.post({ url: Api.analyticFormula, params });

/**
 * 保存公式
 * @param params
 */
export const saveFormula = (params) => defHttp.post({ url: Api.saveFormula, params });
