<template>
  <section class="page-wrapper" :class="themeClass">
    <div class="report-grid">
      <div v-for="item in reportList" :key="item.key" class="report-card">
        <div class="card-header">
          <div class="card-icon" v-html="item.icon"></div>
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.desc }}</p>
        </div>
        <div :ref="(el) => setChartRef(el, item.key)" class="chart-box"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';

/* --------------------- 日期工具 --------------------- */
function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    days.push(`${month}-${date}`);
  }
  return days;
}

const dateLabels = getLast7Days();

/* --------------------- 报表配置 --------------------- */
interface SeriesConf {
  name: string;
  data: number[];
  color: string;
  unit: string;
  /** 使用右侧 y 轴（仅折线图多维度时生效） */
  yAxisIndex?: number;
}

interface ReportItem {
  key: string;
  title: string;
  desc: string;
  icon: string;
  chartType: 'bar' | 'line';
  series: SeriesConf[];
}

const reportList: ReportItem[] = [
  {
    key: 'runtime',
    title: '运行报表',
    desc: '设备运行时长、开关记录、模式执行',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    chartType: 'bar',
    series: [
      { name: '运行时长(h)', data: [12.5, 14.2, 11.8, 15.6, 13.4, 16.1, 14.8], color: '#00a2e8', unit: 'h' },
      { name: '开关次数', data: [8, 10, 6, 9, 7, 11, 9], color: '#10b981', unit: '次' },
      { name: '模式执行', data: [3, 2, 4, 3, 5, 4, 3], color: '#f59e0b', unit: '次' },
    ],
  },
  {
    key: 'energy',
    title: '能耗报表',
    desc: '用电量、电费、单耗、同比环比',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    chartType: 'line',
    series: [
      { name: '用电量(kWh)', data: [320, 295, 340, 310, 365, 330, 350], color: '#f59e0b', unit: 'kWh' },
      { name: '电费(元)', data: [256, 236, 272, 248, 292, 264, 280], color: '#00a2e8', unit: '元', yAxisIndex: 1 },
    ],
  },
  {
    key: 'fault',
    title: '故障报表',
    desc: '故障统计、MTTR、故障趋势',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    chartType: 'bar',
    series: [
      { name: '故障次数', data: [2, 0, 1, 3, 1, 0, 2], color: '#ef4444', unit: '次' },
      { name: 'MTTR(min)', data: [45, 0, 30, 55, 25, 0, 40], color: '#8b5cf6', unit: 'min' },
    ],
  },
  {
    key: 'alarm',
    title: '报警报表',
    desc: '报警分类、响应时效、处理率',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
    chartType: 'line',
    series: [
      { name: '报警数量', data: [5, 8, 4, 7, 6, 9, 5], color: '#8b5cf6', unit: '条' },
      { name: '处理率(%)', data: [92, 88, 95, 90, 93, 87, 94], color: '#10b981', unit: '%', yAxisIndex: 1 },
    ],
  },
  {
    key: 'ticket',
    title: '工单报表',
    desc: '工单处理效率、满意度、成本',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    chartType: 'bar',
    series: [
      { name: '工单数', data: [18, 22, 15, 20, 25, 19, 23], color: '#10b981', unit: '单' },
      { name: '满意度(%)', data: [94, 91, 96, 89, 93, 95, 92], color: '#f59e0b', unit: '%' },
      { name: '处理时长(h)', data: [3.2, 2.8, 4.1, 3.5, 2.6, 3.0, 3.8], color: '#00a2e8', unit: 'h' },
    ],
  },
  {
    key: 'custom',
    title: '自定义报表',
    desc: '自定义维度、字段、时间范围',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    chartType: 'line',
    series: [
      { name: '节能率(%)', data: [72, 68, 75, 70, 78, 74, 76], color: '#ec4899', unit: '%' },
      { name: '响应时间(s)', data: [120, 145, 110, 135, 100, 125, 115], color: '#06b6d4', unit: 's', yAxisIndex: 1 },
    ],
  },
];

/* --------------------- 判断是否需要双 Y 轴 --------------------- */
function hasDualYAxis(item: ReportItem): boolean {
  return item.series.some((s) => s.yAxisIndex === 1);
}

/* --------------------- ECharts --------------------- */
const chartRefs = new Map<string, HTMLDivElement>();
const chartInstances = new Map<string, echarts.ECharts>();

function setChartRef(el: HTMLDivElement | null, key: string) {
  if (el) {
    chartRefs.set(key, el);
  }
}

function initCharts() {
  reportList.forEach((item) => {
    const dom = chartRefs.get(item.key);
    if (!dom) return;

    const instance = echarts.init(dom);
    chartInstances.set(item.key, instance);

    const dualAxis = hasDualYAxis(item);
    const legendNames = item.series.map((s) => s.name);

    // 公共 tooltip formatter
    const tooltipFormatter = (params: any) => {
      if (!Array.isArray(params)) params = [params];
      let html = `${params[0].axisValue}<br/>`;
      params.forEach((p: any) => {
        html += `${p.marker} ${p.seriesName}: ${p.value} ${p.color}`;
      });
      // 替换为实际单位
      item.series.forEach((s) => {
        html = html.replace(`${s.color}`, s.unit);
      });
      return html;
    };

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(20, 29, 43, 0.95)',
        borderColor: '#303d50',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: tooltipFormatter,
      },
      legend: {
        data: legendNames,
        bottom: 0,
        textStyle: { color: '#a0aabf', fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 14,
        icon: 'roundRect',
      },
      grid: {
        top: 10,
        left: 10,
        right: dualAxis ? 45 : 10,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dateLabels,
        axisLine: { lineStyle: { color: '#303d50' } },
        axisTick: { show: false },
        axisLabel: { color: '#a0aabf', fontSize: 11 },
      },
      yAxis: dualAxis
        ? [
            {
              type: 'value',
              name: item.series[0].name,
              nameTextStyle: { color: '#a0aabf', fontSize: 10 },
              splitLine: { lineStyle: { color: 'rgba(48, 61, 80, 0.35)' } },
              axisLabel: { color: '#a0aabf', fontSize: 11 },
            },
            {
              type: 'value',
              name: item.series.find((s) => s.yAxisIndex === 1)?.name || '',
              nameTextStyle: { color: '#a0aabf', fontSize: 10 },
              splitLine: { show: false },
              axisLabel: { color: '#a0aabf', fontSize: 11 },
            },
          ]
        : {
            type: 'value',
            name: item.series.length > 1 ? '' : item.series[0].name,
            nameTextStyle: { color: '#a0aabf', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(48, 61, 80, 0.35)' } },
            axisLabel: { color: '#a0aabf', fontSize: 11 },
          },
      series: item.series.map((s) => {
        const isBar = item.chartType === 'bar';
        return {
          name: s.name,
          type: item.chartType as any,
          data: s.data,
          yAxisIndex: s.yAxisIndex ?? 0,
          smooth: !isBar,
          symbol: 'circle',
          symbolSize: 5,
          barWidth: isBar ? '30%' : undefined,
          barGap: isBar ? '20%' : undefined,
          itemStyle: {
            color: s.color,
            borderRadius: isBar ? [4, 4, 0, 0] : 0,
          },
          lineStyle: !isBar ? { width: 2, color: s.color } : undefined,
          areaStyle: !isBar
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: s.color + '40' },
                  { offset: 1, color: s.color + '05' },
                ]),
              }
            : undefined,
        };
      }),
    };

    instance.setOption(option);
  });
}

function handleResize() {
  chartInstances.forEach((inst) => inst.resize());
}

onMounted(() => {
  nextTick(() => {
    initCharts();
    window.addEventListener('resize', handleResize);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  chartInstances.forEach((inst) => inst.dispose());
  chartInstances.clear();
});
</script>

<style scoped>
.page-wrapper {
  --bg-page: #0b111e;
  --bg-card: #1b2533;
  --color-text: #ffffff;
  --color-muted: #a0aabf;

  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  padding: 16px;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page-wrapper *,
.page-wrapper *::before,
.page-wrapper *::after {
  box-sizing: border-box;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  height: 100%;
}

.report-card {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.card-icon {
  width: 28px;
  height: 28px;
  color: var(--color-text);
  margin-bottom: 4px;
}

.card-icon svg {
  width: 100%;
  height: 100%;
}

.card-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.card-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-muted);
}

.chart-box {
  flex: 1;
  min-height: 0;
  width: 100%;
}

@media (max-width: 768px) {
  .report-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, minmax(200px, 1fr));
    height: auto;
    min-height: 100vh;
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped>
.theme-white.page-wrapper {
  --bg-page: #f5f7fa;
  --bg-card: #ffffff;
  --color-text: #303133;
  --color-muted: #909399;

  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  padding: 16px;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}.theme-white.page-wrapper *,
.theme-white.page-wrapper *::before,
.theme-white.page-wrapper *::after {
  box-sizing: border-box;
}.theme-white .report-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  height: 100%;
}.theme-white .report-card {
  background: var(--bg-card);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}.theme-white .card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6px;
  flex-shrink: 0;
}.theme-white .card-icon {
  width: 28px;
  height: 28px;
  color: var(--color-text);
  margin-bottom: 4px;
}.theme-white .card-icon svg {
  width: 100%;
  height: 100%;
}.theme-white .card-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}.theme-white .card-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-muted);
}.theme-white .chart-box {
  flex: 1;
  min-height: 0;
  width: 100%;
}

@media (max-width: 768px)  {.theme-white .report-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, minmax(200px, 1fr));
    height: auto;
    min-height: 100vh;
  }}
</style>
