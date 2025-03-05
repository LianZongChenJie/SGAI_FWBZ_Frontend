import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();

enum Api {
  list = '/bems/device/list',
  categoryTree = '/bems/equipmentCategory/getTree',
  spaceTree = '/bems/space/getTree',
}
/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });
