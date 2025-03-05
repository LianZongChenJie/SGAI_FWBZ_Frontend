import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  categoryTree = '/bems/equipmentCategory/getTree',
  spaceTree = '/bems/space/getTree',
  addDevice = '/bems/device/add',
  editDevice = '/bems/device/edit',
  deleteDevice = '/bems/device/delete',
  selectDevice = '/bems/device/list',
  updateAutomation = '/bems/device/updateAutomaticAlgorithm',
}

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.editDevice : Api.addDevice;
  return defHttp.post({ url: url, params });
};
/**
 * 删除设备
 */
export const deleteDevice = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteDevice, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 切换自动算法
 */
export const updateAutomaticAlgorithm = (params) => defHttp.post({ url: Api.updateAutomation, params });
