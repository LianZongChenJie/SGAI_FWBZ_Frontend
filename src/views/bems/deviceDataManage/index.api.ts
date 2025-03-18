import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  // list = '/bems/device/list',
  categoryTree = '/bems/equipmentCategory/getTree',
  spaceTree = '/bems/space/getTree',
}

export const getCategoryTree = () => defHttp.get({ url: Api.categoryTree });
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree });
