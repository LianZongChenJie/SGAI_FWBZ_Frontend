import type { AppRouteRecordRaw } from '/@/router/types';

const EXTRA_AI_MENUS: AppRouteRecordRaw[] = [
  {
    path: '/fwbz/ai/report',
    name: 'bems-web-ai-report-index',
    component: 'bems-web/ai/report/index',
    meta: { title: 'AI运行报告' },
  },
  {
    path: '/fwbz/ai/energy',
    name: 'bems-web-ai-energy-index',
    component: 'bems-web/ai/energy/index',
    meta: { title: 'AI节能报告' },
  },
  {
    path: '/fwbz/ai/fault',
    name: 'bems-web-ai-fault-index',
    component: 'bems-web/ai/fault/index',
    meta: { title: 'AI故障分析报告' },
  },
];

function normalizeComponent(component: unknown) {
  return String(component || '')
    .replace(/^\//, '')
    .replace(/\.vue$/i, '');
}

function findAiParent(routes: AppRouteRecordRaw[]): AppRouteRecordRaw | null {
  for (const route of routes) {
    if (route.children?.length) {
      const nested = findAiParent(route.children);
      if (nested) return nested;
    }
    const path = String(route.path || '').replace(/\/$/, '');
    const title = String(route.meta?.title || '');
    const hasAiChildComponent = route.children?.some((child) => normalizeComponent(child.component).startsWith('bems-web/ai/'));
    if (
      hasAiChildComponent ||
      ((title === 'AI运行报告' || path === '/fwbz/ai' || path.endsWith('/ai')) && route.children?.length)
    ) {
      return route;
    }
  }
  return null;
}

function hasMenu(routes: AppRouteRecordRaw[], extra: AppRouteRecordRaw) {
  const extraComponent = normalizeComponent(extra.component);
  return routes.some((route) => {
    const component = normalizeComponent(route.component);
    const path = String(route.path || '');
    return component === extraComponent || path === extra.path || path.endsWith(`/ai/${extra.path.split('/').pop()}`);
  });
}

/**
 * 后台菜单模式下，把前端新增的 AI 报告页合并进「AI运行报告」目录。
 */
export function mergeExtraAiReportMenus(routeList: AppRouteRecordRaw[] = []) {
  const parent = findAiParent(routeList);
  const extras = EXTRA_AI_MENUS.filter((item) => {
    const siblings = parent?.children || routeList;
    return !hasMenu(siblings, item);
  });
  if (!extras.length) {
    return routeList;
  }

  if (parent) {
    parent.children = [...(parent.children || []), ...extras];
    parent.alwaysShow = true;
    return routeList;
  }

  routeList.push({
    path: '/fwbz/ai',
    name: 'BemsWebAi',
    component: 'LAYOUT',
    redirect: '/fwbz/ai/report',
    alwaysShow: true,
    meta: { title: 'AI运行报告' },
    children: extras,
  });
  return routeList;
}
