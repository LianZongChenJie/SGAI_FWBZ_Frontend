import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

/**
 * BEMS-Web 会展小镇服务保障平台路由
 * 使用 LAYOUT 布局：左侧菜单 + 右侧面包屑+用户信息+内容区
 */
const bemsWeb: AppRouteModule = {
  path: '/fwbz',
  name: 'FWBZ',
  meta: {
    title: '总览仪表盘',
  },
  children: [
    // ===== 总览仪表盘 =====
    {
      path: 'overview',
      name: 'FWBZOverview',
      component: () => import('/@/views/bems-web/overview/index.vue'),
      meta: {
        hideMenu: true,          // 隐藏此菜单项
        hideBreadcrumb: true,    // 隐藏面包屑
        title: '总览仪表盘',
        currentActiveMenu: '/fwbz', // 当前激活的菜单项，确保一级菜单被选中
      },
    },

    // ===== 韧性安全 =====
    {
      path: 'safety',
      name: 'BemsWebSafety',
      meta: { title: '韧性安全' },
      redirect: '/fwbz/safety/person',
      children: [
        {
          path: 'person',
          name: 'BemsWebSafetyPerson',
          component: () => import('/@/views/bems-web/safety/person/index.vue'),
          meta: { title: '人员管理' },
        },
        {
          path: 'vehicle',
          name: 'BemsWebSafetyVehicle',
          component: () => import('/@/views/bems-web/safety/vehicle/index.vue'),
          meta: { title: '车辆管理' },
        },
        {
          path: 'fire',
          name: 'BemsWebSafetyFire',
          component: () => import('/@/views/bems-web/safety/fire/index.vue'),
          meta: { title: '消防管理' },
        },
        {
          path: 'security',
          name: 'BemsWebSafetySecurity',
          component: () => import('/@/views/bems-web/safety/security/index.vue'),
          meta: { title: '安防管理' },
        },
      ],
    },

    // ===== 节能低碳 =====
    {
      path: 'energy',
      name: 'BemsWebEnergy',
      meta: { title: '节能低碳' },
      redirect: '/fwbz/energy/operational-support',
      children: [
        {
          path: 'operational-support',
          name: 'BemsWebEnergyOperationalSupport',
          component: () => import('/@/views/bems-web/energy/operational-support/index.vue'),
          meta: { title: '运行保障' },
        },
        {
          path: 'smart-lighting',
          name: 'BemsWebEnergySmartLighting',
          component: () => import('/@/views/bems-web/energy/smart-lighting/index.vue'),
          meta: { title: '智慧照明' },
        },
        {
          path: 'energy-metering',
          name: 'BemsWebEnergyMetering',
          component: () => import('/@/views/bems-web/energy/energy-metering/index.vue'),
          meta: { title: '能源计量' },
        },
        {
          path: 'energy-optimization',
          name: 'BemsWebEnergyOptimization',
          component: () => import('/@/views/bems-web/energy/energy-optimization/index.vue'),
          meta: { title: '能源优化' },
        },
      ],
    },

    // ===== 物联网 =====
    {
      path: 'iot',
      name: 'BemsWebIot',
      meta: { title: '物联网' },
      redirect: '/fwbz/iot/interface',
      children: [
        {
          path: 'interface',
          name: 'BemsWebIotInterface',
          component: () => import('/@/views/bems-web/iot/interface/index.vue'),
          meta: { title: '接口平台' },
        },
        {
          path: 'data-collection',
          name: 'BemsWebIotDataCollection',
          component: () => import('/@/views/bems-web/iot/data-collection/index.vue'),
          meta: { title: '数据采集' },
        },
        {
          path: 'operation',
          name: 'BemsWebIotOperation',
          component: () => import('/@/views/bems-web/iot/operation/index.vue'),
          meta: { title: '运行保障' },
        },
      ],
    },

    // ===== 故障告警 =====
    {
      path: 'alert',
      name: 'BemsWebAlert',
      meta: { title: '故障告警' },
      redirect: '/fwbz/alert/setting',
      children: [
        {
          path: 'setting',
          name: 'BemsWebAlertSetting',
          component: () => import('/@/views/bems-web/alert/setting/index.vue'),
          meta: { title: '报警设置' },
        },
        {
          path: 'handle',
          name: 'BemsWebAlertHandle',
          component: () => import('/@/views/bems-web/alert/handle/index.vue'),
          meta: { title: '报警处理' },
        },
      ],
    },

    // ===== 场馆运营 =====
    {
      path: 'venue',
      name: 'BemsWebVenue',
      meta: { title: '场馆运营' },
      redirect: '/fwbz/venue/flow',
      children: [
        {
          path: 'flow',
          name: 'BemsWebVenueFlow',
          component: () => import('/@/views/bems-web/venue/flow/index.vue'),
          meta: { title: '场馆客流' },
        },
        {
          path: 'scheduling',
          name: 'BemsWebVenueScheduling',
          component: () => import('/@/views/bems-web/venue/venueScheduling/index.vue'),
          meta: { title: '场馆排期' },
        },
      ],
    },

    // ===== 会展服务 =====
    {
      path: 'event',
      name: 'BemsWebEvent',
      meta: { title: '会展服务' },
      redirect: '/fwbz/event/pre',
      children: [
        {
          path: 'pre',
          name: 'BemsWebEventPre',
          component: () => import('/@/views/bems-web/event/pre/index.vue'),
          meta: { title: '会前管理' },
        },
        {
          path: 'during',
          name: 'BemsWebEventDuring',
          component: () => import('/@/views/bems-web/event/during/index.vue'),
          meta: { title: '会中管理' },
        },
        {
          path: 'post',
          name: 'BemsWebEventPost',
          component: () => import('/@/views/bems-web/event/post/index.vue'),
          meta: { title: '会后管理' },
        },
      ],
    },

    // ===== AI运行报告 =====
    {
      path: 'ai',
      name: 'BemsWebAi',
      meta: { title: 'AI运行报告' },
      redirect: '/fwbz/ai/carbon',
      children: [
        {
          path: 'carbon',
          name: 'BemsWebAiCarbon',
          component: () => import('/@/views/bems-web/ai/carbon/index.vue'),
          meta: { title: '多模态能碳计算' },
        },
        {
          path: 'predict',
          name: 'BemsWebAiPredict',
          component: () => import('/@/views/bems-web/ai/predict/index.vue'),
          meta: { title: 'AI预测报告' },
        },
      ],
    },
  ],
};

export default bemsWeb;