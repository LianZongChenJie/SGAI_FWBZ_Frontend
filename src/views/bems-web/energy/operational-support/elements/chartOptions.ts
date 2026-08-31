/**
 * ECharts option 构建器（1:1 还原原型 tab_charts.js 样式）
 *
 * 三种图类型：
 *   buildTrendOption — 折线趋势图（kind="chat"）
 *   buildBarOption   — 类目柱状图（kind="bar"）
 *   buildScatterOption — 散点图（kind="scatter"）
 */
import type { EChartsOption } from 'echarts'

/* ---------- 色板与墨色 token ---------- */
export const TSERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100']

const TINK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
  surface: '#ffffff',
}

/* ---------- 参考线 / 控制带 ---------- */
function refMark(ref?: { lines?: { y: number; label: string }[]; band?: number[]; bandLabel?: string }) {
  const mark: any = {}
  const lines = (ref && ref.lines ? ref.lines.slice() : []) as any[]
  if (lines.length) {
    mark.markLine = {
      silent: true,
      symbol: 'none',
      lineStyle: { type: 'dashed', color: TINK.muted, width: 1 },
      label: { color: TINK.secondary, fontSize: 11, position: 'insideEndTop' },
      data: lines.map((l) => ({ yAxis: l.y, label: { formatter: l.label } })),
    }
  }
  if (ref && ref.band) {
    mark.markArea = {
      silent: true,
      itemStyle: { color: 'rgba(11,11,11,0.04)' },
      label: { color: TINK.muted, fontSize: 11, position: 'insideTopLeft' },
      data: [[{ yAxis: ref.band[0], label: { formatter: ref.bandLabel || '' } }, { yAxis: ref.band[1] }]],
    }
  }
  return mark
}

/**
 * 折线趋势图（kind="chat"）
 */
export function buildTrendOption(
  xaxis: string[],
  series: { name: string; data: (number | null)[] }[],
  unitName: string,
  scaleY?: boolean,
  ref?: { lines?: { y: number; label: string }[]; band?: number[]; bandLabel?: string },
  yMin?: number,
  yMax?: number,
): EChartsOption {
  const hasLegend = series.length >= 2
  return {
    color: TSERIES_COLORS,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: TINK.baseline, width: 1 } },
      backgroundColor: TINK.surface,
      borderColor: TINK.gridline,
      borderWidth: 1,
      padding: [8, 10],
      textStyle: { color: TINK.primary, fontSize: 12 },
    },
    legend: hasLegend
      ? {
          type: 'scroll',
          bottom: 0,
          itemWidth: 16,
          itemHeight: 8,
          textStyle: { color: TINK.secondary, fontSize: 12 },
          data: series.map((s) => s.name),
        }
      : undefined,
    grid: { left: '3%', right: '4%', top: '12%', bottom: hasLegend ? '16%' : '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xaxis,
      axisLabel: { color: TINK.muted, fontSize: 12, interval: 1 },
      axisLine: { lineStyle: { color: TINK.baseline } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      scale: !!scaleY,
      name: unitName,
      min: yMin,
      max: yMax,
      nameTextStyle: { color: TINK.muted, fontSize: 12, align: 'left' },
      axisLabel: { color: TINK.muted, fontSize: 12 },
      splitLine: { lineStyle: { color: TINK.gridline, width: 1, type: 'solid' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: series.map((s, i) =>
      Object.assign(
        {
          name: s.name,
          type: 'line',
          data: s.data,
          smooth: true,
          connectNulls: false,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          lineStyle: { width: 2, cap: 'round', join: 'round' },
          itemStyle: { borderColor: TINK.surface, borderWidth: 2 },
          emphasis: { focus: 'series', scale: 1.25 },
        },
        i === 0 ? refMark(ref) : {},
      ),
    ),
  }
}

/**
 * 类目柱状图（kind="bar"）
 */
export function buildBarOption(
  categories: string[],
  series: { name: string; data: any[] }[],
  unitName: string,
  threshold?: number,
  thresholdLabel?: string,
): EChartsOption {
  const yMax = threshold !== undefined ? Math.ceil((threshold * 1.12) / 10) * 10 : undefined
  return {
    color: [TSERIES_COLORS[0]],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(11,11,11,0.04)' } },
      backgroundColor: TINK.surface,
      borderColor: TINK.gridline,
      borderWidth: 1,
      padding: [8, 10],
      textStyle: { color: TINK.primary, fontSize: 12 },
      formatter: (params: any) => {
        const p = params[0]
        const extra = p.data && typeof p.data === 'object' && p.data.starts !== undefined
          ? `（启动 ${p.data.starts} 次）` : ''
        return `${p.axisValue}<br/>${p.seriesName}: ${typeof p.data === 'object' ? p.data.value : p.value} ${unitName}${extra}`
      },
    },
    grid: { left: '3%', right: '4%', top: '12%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: TINK.muted, fontSize: 12, interval: categories.length > 12 ? 3 : 0 },
      axisLine: { lineStyle: { color: TINK.baseline } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: unitName,
      max: yMax,
      nameTextStyle: { color: TINK.muted, fontSize: 12, align: 'left' },
      axisLabel: { color: TINK.muted, fontSize: 12 },
      splitLine: { lineStyle: { color: TINK.gridline, width: 1, type: 'solid' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      Object.assign(
        {
          name: series[0].name,
          type: 'bar',
          data: series[0].data,
          barWidth: '46%',
          itemStyle: { color: TSERIES_COLORS[0], borderRadius: [3, 3, 0, 0] },
          emphasis: { itemStyle: { color: TSERIES_COLORS[0] } },
        },
        threshold !== undefined
          ? {
              markLine: {
                silent: true,
                symbol: 'none',
                lineStyle: { type: 'dashed', color: TINK.muted, width: 1 },
                label: { color: TINK.secondary, fontSize: 11, position: 'insideEndBottom', formatter: thresholdLabel },
                data: [{ yAxis: threshold }],
              },
            }
          : {},
      ),
    ],
  }
}

/**
 * 散点图（kind="scatter"）
 */
export function buildScatterOption(
  series: { name: string; data: [number, number][] }[],
  xUnit: string,
  yUnit: string,
): EChartsOption {
  return {
    color: TSERIES_COLORS,
    tooltip: {
      trigger: 'item',
      backgroundColor: TINK.surface,
      borderColor: TINK.gridline,
      borderWidth: 1,
      padding: [8, 10],
      textStyle: { color: TINK.primary, fontSize: 12 },
      formatter: (p: any) => {
        return `${p.seriesName}<br/>辐照度: ${p.value[0]} ${xUnit}<br/>系统效率: ${p.value[1]} ${yUnit}`
      },
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      itemWidth: 16,
      itemHeight: 8,
      textStyle: { color: TINK.secondary, fontSize: 12 },
      data: series.map((s) => s.name),
    },
    grid: { left: '3%', right: '8%', top: '10%', bottom: '16%', containLabel: true },
    xAxis: {
      type: 'value',
      name: xUnit,
      scale: true,
      nameTextStyle: { color: TINK.muted, fontSize: 12 },
      axisLabel: { color: TINK.muted, fontSize: 12 },
      splitLine: { lineStyle: { color: TINK.gridline, width: 1, type: 'solid' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: yUnit,
      nameTextStyle: { color: TINK.muted, fontSize: 12, align: 'left' },
      axisLabel: { color: TINK.muted, fontSize: 12 },
      splitLine: { lineStyle: { color: TINK.gridline, width: 1, type: 'solid' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'scatter',
      data: s.data,
      symbolSize: 9,
      itemStyle: { opacity: 0.85, borderColor: TINK.surface, borderWidth: 2 },
      emphasis: { focus: 'series', scale: 1.2 },
    })),
  }
}
