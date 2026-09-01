<template>
  <div class="schedule-tab">
    <!-- 分馆预定时间表 -->
    <a-card class="sc-card" :bordered="false">
      <div class="sc-card__header">
        <div class="sc-card__title">
          <span>分馆预定时间表</span>
          <span class="sc-card__tag">2/3/4 号馆 · 开馆/闭馆/人数预测准确度</span>
        </div>
        <div class="sc-card__note">预测峰值人数 / 真实峰值人数 ＝ 历史预测准确度，越接近 1 越准</div>
      </div>
      <div class="sc-card__body sc-card__body--plain">
        <table class="sc-tbl">
          <thead>
            <tr>
              <th>场馆</th>
              <th>今日开馆</th>
              <th>今日闭馆</th>
              <th class="td-num">今日预测峰值(人)</th>
              <th class="td-num">历史预测/真实</th>
              <th>准确度判定</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in scheduleVenues" :key="v.name">
              <td><b>{{ v.name }}</b></td>
              <td class="num">{{ v.open }}</td>
              <td class="num">{{ v.close }}</td>
              <td class="td-num">{{ v.predict.toLocaleString() }}</td>
              <td class="td-num">{{ v.ratio.toFixed(2) }}</td>
              <td>
                <span v-if="isGood(v)" class="badge ok">可信 · {{ pct(v) }}%</span>
                <span v-else class="badge warn">偏差 {{ pct(v) }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="sc-card__foot">
        准确度 = 过去 30 天「预测峰值人数 / 真实峰值人数」均值，|比值−1| ≤ 10% 即判定可信、启用预测预排程。
        1 号馆（主场馆）固定开馆 09:00–18:00，由全局预排程覆盖，未列入分馆日程表。
      </div>
    </a-card>

    <!-- 各馆预冷启停优化（预测驱动） -->
    <a-card class="sc-card sc-card--mt14" :bordered="false">
      <div class="sc-card__header">
        <div class="sc-card__title">
          <span>各馆预冷启停优化（预测驱动）</span>
          <span class="sc-card__tag">精确到"开馆前 N 分钟"启动 · 较固定早开节能</span>
        </div>
        <div class="sc-legend">
          <span class="legend-item"><span class="legend-color" style="background: #c4c8ce"></span>保守早开（避免）</span>
          <span class="legend-item"><span class="legend-color" style="background: #2e8b57"></span>必要预冷（优化）</span>
          <span class="legend-item"><span class="legend-dot"></span>开馆时刻</span>
        </div>
      </div>
      <div class="sc-card__body">
        <div ref="precoolChartRef" class="sc-chart sc-chart--240"></div>
        <div class="sc-card__desc">
          <b class="c-navy">为什么节能：</b>基于 24h 冷量预测，把各馆预冷精确启动到"开馆前 15~20 分钟"，恰好把室温拉到舒适带下限；
          相比<b>不预测、固定提前 30 分钟早开</b>，省掉灰色"过度预冷"段的冷量。
          <b class="c-green">制冷量预测的价值 ＝ 用预测换掉保守冗余。</b>
          <span class="c-green c-strong">{{ saveText }}</span>
        </div>
      </div>
    </a-card>

    <!-- 冷站预排程时间轴 -->
    <a-card class="sc-card sc-card--mt14" :bordered="false">
      <div class="sc-card__header">
        <div class="sc-card__title">
          <span>冷站预排程时间轴</span>
          <span class="sc-card__tag">据日程预先排定 · 冷机 / 热泵 / 经济调度</span>
        </div>
        <div class="sc-legend">
          <span class="legend-item"><span class="legend-color" style="background: #2a78d6"></span>冷机运行</span>
          <span class="legend-item"><span class="legend-color" style="background: #9ec5f4"></span>热泵供冷</span>
          <span class="legend-item"><span class="legend-color" style="background: #2e8b57"></span>预冷 / 谷段蓄冷</span>
          <span class="legend-item"><span class="legend-color" style="background: #e8833a"></span>峰段放冷</span>
        </div>
      </div>
      <div class="sc-card__body">
        <div ref="strategyChartRef" class="sc-chart sc-chart--380"></div>
        <div class="sc-card__note-bar">
          时间轴由各馆开闭馆时间 + 冷量预测 + 峰谷电价联动生成，每小时一拍滚动刷新；实际执行以下发控制台为准。
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useECharts } from '/@/hooks/web/useECharts'

// 父组件透传的数据（预留）
const props = defineProps<{ data?: any }>()

// ===================== 数据（原型口径：预定时间表 + 预冷启停 5b + 预排程 6） =====================
// 各馆：openM=开馆分钟(0点起)、preOpt=预冷提前分钟、preEarly=保守早开分钟、ratio=历史预测准确度、save=节能比例
const venues = ref<any[]>([
  { name: '1号馆', openM: 9 * 60, open: '09:00', close: '18:00', preOpt: 15, preEarly: 30, predict: 2400, ratio: 0.97, save: 7, inSchedule: false },
  { name: '2号馆', openM: 9 * 60, open: '09:00', close: '18:00', preOpt: 15, preEarly: 30, predict: 1820, ratio: 0.96, save: 8, inSchedule: true },
  { name: '3号馆', openM: 10 * 60, open: '10:00', close: '17:00', preOpt: 20, preEarly: 40, predict: 1350, ratio: 1.03, save: 11, inSchedule: true },
  { name: '4号馆', openM: 9 * 60 + 30, open: '09:30', close: '18:30', preOpt: 15, preEarly: 30, predict: 2100, ratio: 1.02, save: 9, inSchedule: true },
])

// 仅列出入表（inSchedule）的分馆
const scheduleVenues = computed(() => venues.value.filter((v) => v.inSchedule))

const pct = (v: any) => Math.round(v.ratio * 100)
const isGood = (v: any) => Math.abs(v.ratio - 1) <= 0.1

/** 各馆较固定早开节能汇总文案 */
const saveText = computed(
  () => '｜各馆较固定早开：' + venues.value.map((v) => `${v.name} ${v.save}%`).join(' · '),
)

// ===================== 甘特图 =====================
const precoolChartRef = ref<HTMLDivElement>()
const strategyChartRef = ref<HTMLDivElement>()
const { setOptions: setPrecoolOptions } = useECharts(precoolChartRef as any)
const { setOptions: setStrategyOptions } = useECharts(strategyChartRef as any)

const pad = (n: number) => String(n).padStart(2, '0')
/** 分钟 → HH:MM */
const fmtH = (m: number) => {
  m = Math.round(m)
  return pad(Math.floor(m / 60)) + ':' + pad(m % 60)
}

/** 各馆预冷启停优化（预测驱动）配置 */
const precoolOpt = () => {
  const lanes = venues.value.map((v) => v.name)
  const blocks: any[] = []
  venues.value.forEach((v, i) => {
    blocks.push({ lane: i, start: v.openM - v.preEarly, end: v.openM - v.preOpt, color: '#c4c8ce', label: '避免' })
    blocks.push({ lane: i, start: v.openM - v.preOpt, end: v.openM, color: '#2E8B57', label: `预冷${v.preOpt}min` })
  })
  return {
    lanes,
    blocks,
    xMin: 7 * 60 + 30,
    xMax: 10 * 60 + 30,
    scatter: {
      type: 'scatter' as const,
      symbol: 'triangle',
      symbolSize: 11,
      data: venues.value.map((v) => [v.openM, v.name, v.open]),
      itemStyle: { color: '#1F3A5F' },
      label: {
        show: true,
        formatter: (p: any) => '开馆 ' + p.value[2],
        position: 'top',
        color: '#1F3A5F',
        fontSize: 10,
        fontWeight: 600,
        distance: 3,
      },
      tooltip: { show: false },
    },
  }
}

/** 冷站预排程时间轴配置 */
const strategyOpt = () => {
  const B = '#9ec5f4'
  const G = '#2E8B57'
  const O = '#E8833A'
  const lanes = ['供冷模式', '1# 磁悬浮冷机', '2# 磁悬浮冷机', '3# 定频离心冷机', '1号馆热泵', '2号馆热泵', '3号馆热泵', '4号馆热泵', '经济调度(峰谷)']
  const blocks: any[] = [
    // 供冷模式（厂商独立/联合制冷模式：累加冷量 vs 2500kW 阈值）
    { lane: 0, start: 6 * 60, end: 6 * 60 + 40, color: '#7d8fa9', label: '独立制冷', tip: '独立制冷模式 · 各馆系统独立运行（厂商基线）。累加冷量<2500kW。' },
    { lane: 0, start: 6 * 60 + 40, end: 22 * 60, color: '#1F3A5F', label: '集中制冷(联合模式)', tip: '联合制冷模式 · 累加冷量>2500kW 切集中冷源统供。优化层知情迟滞：据24h预测07时越阈，06:00起预启1#冷机+谷段蓄冷，切换无缝；约22:25累加回落再切回独立。' },
    // 冷机
    { lane: 1, start: 6 * 60, end: 22 * 60, color: '#2a78d6', label: '运行(常开)' },
    { lane: 2, start: 9 * 60, end: 17 * 60, color: '#2a78d6', label: '运行' },
    { lane: 3, start: 11 * 60, end: 15 * 60, color: '#2a78d6', label: '运行(峰段)' },
    // 各馆热泵
    { lane: 4, start: 8 * 60 + 45, end: 9 * 60, color: G, label: '预冷' },
    { lane: 4, start: 9 * 60, end: 18 * 60, color: B, label: '供冷' },
    { lane: 5, start: 8 * 60 + 45, end: 9 * 60, color: G, label: '预冷' },
    { lane: 5, start: 9 * 60, end: 18 * 60, color: B, label: '供冷' },
    { lane: 6, start: 9 * 60 + 40, end: 10 * 60, color: G, label: '预冷' },
    { lane: 6, start: 10 * 60, end: 17 * 60, color: B, label: '供冷' },
    { lane: 7, start: 9 * 60 + 15, end: 9 * 60 + 30, color: G, label: '预冷' },
    { lane: 7, start: 9 * 60 + 30, end: 18 * 60 + 30, color: B, label: '供冷' },
    // 经济调度
    { lane: 8, start: 6 * 60, end: 7 * 60, color: G, label: '谷段蓄冷' },
    { lane: 8, start: 13 * 60, end: 16 * 60, color: O, label: '峰段放冷' },
  ]
  return { lanes, blocks, xMin: 6 * 60, xMax: 22 * 60 }
}

/** 通用甘特图渲染（custom 系列） */
const renderGantt = (setOptions: any, opt: any) => {
  const { lanes, blocks } = opt
  const series: any[] = [
    {
      type: 'custom',
      renderItem: (params: any, api: any) => {
        const idx = api.value(0)
        const b = blocks[idx]
        const s = api.coord([b.start, lanes[b.lane]])
        const e = api.coord([b.end, lanes[b.lane]])
        const w = e[0] - s[0]
        const h = 20
        const y = s[1] - h / 2
        const children: any[] = [
          { type: 'rect', shape: { x: s[0], y, width: Math.max(w, 2), height: h }, style: { fill: b.color, stroke: '#fff', lineWidth: 1.5 } },
        ]
        if (w > 50) {
          children.push({
            type: 'text',
            style: { text: b.label, x: s[0] + w / 2, y: y + h / 2, fill: '#fff', fontSize: 10, fontWeight: 600, textAlign: 'center', textVerticalAlign: 'middle' },
          })
        }
        return { type: 'group', children }
      },
      data: blocks.map((_: any, i: number) => [i]),
      clip: true,
      tooltip: {
        formatter: (p: any) => {
          const b = blocks[p.dataIndex]
          let s = `<b>${lanes[b.lane]}</b><br>${fmtH(b.start)} – ${fmtH(b.end)}` + (b.label ? ` · ${b.label}` : '')
          if (b.tip) s += `<br><span style="color:#898781">${b.tip}</span>`
          return s
        },
      },
    },
  ]
  if (opt.scatter) series.push(opt.scatter)

  setOptions({
    grid: { left: 106, right: 54, top: 16, bottom: 32 },
    tooltip: { trigger: 'item' },
    xAxis: {
      type: 'value',
      min: opt.xMin,
      max: opt.xMax,
      axisLabel: { formatter: fmtH, color: '#898781', fontSize:13, hideOverlap: true },
      splitLine: { lineStyle: { color: '#ebeae4' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: lanes,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#52514e', fontSize:14 },
      splitLine: { show: false },
    },
    series,
  })
}

// ===================== 父组件透传数据覆盖 =====================
const loadApiData = () => {
  const d = props.data as any
  if (Array.isArray(d?.venues) && d.venues.length) venues.value = d.venues
}

onMounted(async () => {
  loadApiData()
  await nextTick()
  renderGantt(setPrecoolOptions, precoolOpt())
  renderGantt(setStrategyOptions, strategyOpt())
})
</script>

<style scoped lang="less">
.schedule-tab {
  .sc-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 0;
    }

    &--mt14 {
      margin-top: 14px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      padding: 11px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size:16px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__tag {
      font-size:13px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.45);
      background: #eef3f9;
      padding: 2px 8px;
      border-radius: 10px;
    }

    &__note {
      font-size:14px;
      color: #898781;
    }

    &__body {
      padding: 12px 16px;

      &--plain {
        padding: 0;
      }
    }

    &__foot {
      padding: 10px 16px;
      font-size: 11.5px;
      color: #898781;
      border-top: 1px solid #eef0f3;
    }

    &__desc {
      margin-top: 8px;
      font-size:14px;
      color: #52514e;
      line-height: 1.75;

      .c-navy {
        color: #1f3a5f;
      }

      .c-green {
        color: #2e8b57;
      }

      .c-strong {
        font-weight: 600;
      }
    }

    &__note-bar {
      margin-top: 6px;
      font-size: 11.5px;
      color: #898781;
    }
  }

  /* 图例 */
  .sc-legend {
    display: flex;
    gap: 14px;
    font-size:14px;
    color: rgba(0, 0, 0, 0.65);
    flex-wrap: wrap;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-color {
      width: 14px;
      height: 8px;
      border-radius: 2px;
      display: inline-block;
    }

    .legend-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #1f3a5f;
      display: inline-block;
    }
  }

  /* 甘特图容器 */
  .sc-chart {
    width: 100%;

    &--240 {
      height: 240px;
    }

    &--380 {
      height: 380px;
    }
  }

  /* 表格 */
  .sc-tbl {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;

    th {
      background: #f4f6f9;
      color: #52514e;
      font-weight: 600;
      text-align: left;
      padding: 9px 12px;
      border-bottom: 1px solid rgba(17, 24, 39, 0.1);
      white-space: nowrap;
    }

    td {
      padding: 9px 12px;
      border-bottom: 1px solid #f0f2f5;
      vertical-align: middle;
      color: rgba(0, 0, 0, 0.65);
    }

    tr:hover td {
      background: #fafbfc;
    }

    .td-num {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .num {
      font-variant-numeric: tabular-nums;
    }
  }

  /* 状态徽标 */
  .badge {
    font-size:13px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    white-space: nowrap;

    &.ok {
      color: #0ca30c;
      background: rgba(12, 163, 12, 0.12);
    }

    &.warn {
      color: #b07a18;
      background: rgba(250, 178, 25, 0.18);
    }
  }
}
</style>
