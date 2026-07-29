import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();

enum Api {
  list = '/bems/energyPricingConfig/listPage',
  save = '/bems/energyPrice/add',
  edit = '/bems/energyPrice/edit',
  deleteOne = '/bems/energyPrice/delete',
  deleteBatch = '/bems/energyPrice/deleteBatch',
  importExcel = '/bems/energyPrice/importExcel',
  exportXls = '/bems/energyPrice/exportXls',
  categoryTree = '/bems/equipmentCategory/measuring/getTree',
  addEnergyPriceApi = '/bems/energyPricingConfig/add', 
  editEnergyPriceApi = '/bems/energyPricingConfig/update',
  enableEnergyPriceApi = '/bems/energyPricingConfig/enable',
  disableEnergyPriceApi = '/bems/energyPricingConfig/disable',
}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 删除单个
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 新增费用
 * @param params
 */
export const addEnergyPriceApi = (params) => defHttp.post({ url: Api.addEnergyPriceApi, params });

/**
 * 编辑费用
 * @param params
 */
export const editEnergyPriceApi = (params) => defHttp.post({ url: Api.editEnergyPriceApi, params });

/**
 * 启用费用
 * @param params
 */
export const enableEnergyPriceApi = (params) => defHttp.post({ url: Api.enableEnergyPriceApi, params }, { joinParamsToUrl: true });

/**
 * 禁用费用
 * @param params
 */
export const disableEnergyPriceApi = (params) => defHttp.post({ url: Api.disableEnergyPriceApi, params }, { joinParamsToUrl: true});
