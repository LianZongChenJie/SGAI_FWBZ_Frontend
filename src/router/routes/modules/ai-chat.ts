import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

/**
 * AI 对话路由（Hephaestus 聊天模块）
 * 独立全屏页面，使用 LAYOUT 布局
 */
const aiChat: AppRouteModule = {
  path: '/ai-chat',
  name: 'AiChat',
  component: LAYOUT,
  meta: {
    title: 'AI对话',
    orderNo: 15,
  },
  children: [
    {
      path: 'index',
      name: 'AiChatIndex',
      component: () => import('/@/views/bems-web/chat/index.vue'),
      meta: {
        title: 'AI对话',
        hideMenu: true,
        hideBreadcrumb: true,
        currentActiveMenu: '/ai-chat',
      },
    },
  ],
};

export default aiChat;
