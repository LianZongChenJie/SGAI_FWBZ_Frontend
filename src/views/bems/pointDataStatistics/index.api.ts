import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  pointAll = '/bems/meteringPoint/listAll',
}

/**
 * 查询所有的计量点位
 */
export const pointAll = () => defHttp.get({ url: Api.pointAll });
