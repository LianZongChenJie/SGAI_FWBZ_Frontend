import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  transferJumpLoginApi = '/sys/wd/validateLogin',
}

/**
 * 获取回路配置列表数据
 */
export const transferJumpLoginApi = (params) => defHttp.post({ url: Api.transferJumpLoginApi, params });
