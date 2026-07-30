import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
/**
 * BEMS-Web 业务模块路由
 * 使用 LAYOUT 布局：左侧菜单 + 右侧面包屑+用户信息+内容区
 */
const bemsWeb: AppRouteModule = {
  path: '/bems-web',
  name: 'BemsWeb',
  component: LAYOUT,
  meta: {
    orderNo: 20,
    icon: 'ion:grid-outline',
    title: '总览仪表盘',
  },
  children: [
    {
      path: 'energy',
      name: 'BemsWebEnergy',
      component: () => import('/@/views/bems-web/energy/operational-support/index.vue'),
      meta: {
        title: '运行保障',
      },
    },

    {
      path: 'venue/scheduling',
      name: 'venueScheduling',
      component: () => import('/@/views/bems-web/venue/venueScheduling/index.vue'),
      meta: {
        title: '场馆排期',
      },
    },
    {
      path: 'iot',
      name: 'BemsWebIot',
      component: () => import('/@/views/bems-web/iot/index.vue'),
      meta: {
        title: 'IoT监测',
      },
    },
    {
      path: 'alert',
      name: 'BemsWebAlert',
      component: () => import('/@/views/bems-web/alert/index.vue'),
      meta: {
        title: '告警中心',
      },
    },
    {
      path: 'event',
      name: 'BemsWebEvent',
      component: () => import('/@/views/bems-web/event/index.vue'),
      meta: {
        title: '事件管理',
      },
    },
    {
      path: 'safety',
      name: 'BemsWebSafety',
      component: () => import('/@/views/bems-web/safety/index.vue'),
      meta: {
        title: '安全监管',
      },
    },
    {
      path: 'ai',
      name: 'BemsWebAi',
      component: () => import('/@/views/bems-web/ai/index.vue'),
      meta: {
        title: 'AI助手',
      },
    },
  ],
};

export default bemsWeb;