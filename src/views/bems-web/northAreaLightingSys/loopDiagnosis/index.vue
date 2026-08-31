<template>
  <section class="page-wrapper" :class="themeClass">
    <div class="tabdiag">
      <DiagLive v-if="DG.sub === 'live'" />
      <DiagKB v-else />
    </div>
  </section>
</template>

<script setup lang="ts">
/* 回路诊断工作台（迁移自 fumao-lighting-vue 原型）：双子视图 = 实时诊断 + 规则与知识库 */
import { onMounted, onBeforeUnmount } from 'vue'
import DiagLive from './components/DiagLive.vue'
import DiagKB from './components/DiagKB.vue'
import { DG, tick } from './lib/store.js'
import { useScreenTheme } from '../useScreenTheme'

const { themeClass } = useScreenTheme()

/* 3 秒演示节拍：驱动 reactive 时钟 → snapshot/alarms 级联更新（进入页面才运行） */
let timer: number | undefined
onMounted(() => {
  timer = window.setInterval(tick, 3000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style>
/* ==================== 主题变量 ==================== */
.page-wrapper.theme-black {
  --navy: #1f3a5f;
  --navy-2: #2a5298;
  --orange: #e8833a;
  --green: #2e8b57;
  --st-good: #0ca30c;
  --st-warn: #fab219;
  --st-serious: #ec835a;
  --st-crit: #d03b3b;
  --bg: #0b111e;
  --surface: #1b2533;
  --ink: #e2e8f0;
  --ink-2: #94a3b8;
  --muted: #64748b;
  --grid: #2a3444;
  --grid-soft: #243043;
  --cat1: #38bdf8;
  --cat2: #eb6834;
  --cat3: #1baf7a;
  --cat4: #eda100;
  --cat5: #e87ba4;
  --shadow: 0 1px 2px rgba(0, 0, 0, .25), 0 2px 8px rgba(0, 0, 0, .2);
  --panel-hover: rgba(56, 189, 248, .08);
  --panel-on: rgba(56, 189, 248, .12);
  --th-bg: #141d2b;
  --field-bg: #0f1826;
  --field-line: #2f3b4d;
  --chip-bg: #141d2b;
  --b-ok-bg: #0c2b1c;
  --b-ok-fg: #4ade80;
  --b-warn-bg: #33270a;
  --b-warn-fg: #fbbf24;
  --b-crit-bg: #3a1515;
  --b-crit-fg: #f87171;
  --b-off-bg: #232c3a;
  --b-off-fg: #94a3b8;
  --track: #1a2434;
  --note-bg: #141d2b;
  --step-bg: #101826;
  --step-line: #2f3b4d;
  --focus-border: rgba(56, 189, 248, .35);
  --txt-good: #4ade80;
  --txt-warn: #fbbf24;
  --txt-crit: #f87171;
  --txt-mut: #64748b;
  --axis-line: #334155;
  --axis-label: #64748b;
  --split-line: #223047;
}

.page-wrapper.theme-white {
  --navy: #1f3a5f;
  --navy-2: #2a5298;
  --orange: #e8833a;
  --green: #2e8b57;
  --st-good: #0ca30c;
  --st-warn: #fab219;
  --st-serious: #ec835a;
  --st-crit: #d03b3b;
  --bg: #f4f5f7;
  --surface: #fff;
  --ink: #1f2937;
  --ink-2: #52514e;
  --muted: #898781;
  --grid: #ebeae4;
  --grid-soft: #ebeae4;
  --cat1: #2a78d6;
  --cat2: #eb6834;
  --cat3: #1baf7a;
  --cat4: #eda100;
  --cat5: #e87ba4;
  --shadow: 0 1px 2px rgba(17, 24, 39, .05), 0 2px 8px rgba(17, 24, 39, .04);
  --panel-hover: #eef3fa;
  --panel-on: #eef3fa;
  --th-bg: #f0f2f5;
  --field-bg: #fff;
  --field-line: #d5d7db;
  --chip-bg: #fff;
  --b-ok-bg: #e7f6e7;
  --b-ok-fg: #157017;
  --b-warn-bg: #fdf3d7;
  --b-warn-fg: #9a6b00;
  --b-crit-bg: #fde5e5;
  --b-crit-fg: #b02a2a;
  --b-off-bg: #ececec;
  --b-off-fg: #666;
  --track: #eceeef;
  --note-bg: #f7f7f4;
  --step-bg: #fff;
  --step-line: var(--grid);
  --focus-border: var(--cat1);
  --txt-good: #157017;
  --txt-warn: #9a6b00;
  --txt-crit: #b02a2a;
  --txt-mut: #898781;
  --axis-line: #c9ccd1;
  --axis-label: #898781;
  --split-line: #ebeae4;
}

/* ==================== 页面容器 ==================== */
.page-wrapper {
  height: calc(100vh - 60px);
  padding: 14px;
  overflow: hidden;
  background: var(--bg);
  font-size: 13px;
  line-height: 1.5;
}

/* ==================== 回路诊断工作台 ==================== */
.page-wrapper .tabdiag {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* ---- 通用卡片 / KPI / 徽章 / 表格 ---- */
.page-wrapper .row {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}
.page-wrapper .row > .col {
  flex: 1;
  min-width: 0;
}
.page-wrapper .card {
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 12px 14px;
  margin-bottom: 14px;
}
.page-wrapper .card h3 {
  font-size: 13px;
  color: var(--ink-2);
  margin-bottom: 8px;
  font-weight: 600;
}
.page-wrapper .kpis {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.page-wrapper .kpi {
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 10px 14px;
  text-align: left;
  border: 0;
}
.page-wrapper .kpi .t {
  font-size: 12px;
  color: var(--muted);
}
.page-wrapper .kpi .v {
  font-size: 22px;
  font-weight: 700;
  margin-top: 2px;
  color: var(--ink);
}
.page-wrapper .kpi .u {
  font-size: 12px;
  color: var(--muted);
  margin-left: 3px;
  font-weight: 400;
}
.page-wrapper .kpi .s {
  font-size: 11px;
  color: var(--muted);
  margin-top: 1px;
  display: block;
}
.page-wrapper .kpi.clickable {
  cursor: pointer;
  transition: box-shadow .15s;
}
.page-wrapper .kpi.clickable:hover {
  box-shadow: 0 2px 8px rgba(17, 24, 39, .12);
}
.page-wrapper .kpi.clickable.on {
  outline: 2px solid var(--cat1);
  outline-offset: -2px;
}
.page-wrapper .badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}
.page-wrapper .b-ok {
  background: var(--b-ok-bg);
  color: var(--b-ok-fg);
}
.page-wrapper .b-warn {
  background: var(--b-warn-bg);
  color: var(--b-warn-fg);
}
.page-wrapper .b-crit {
  background: var(--b-crit-bg);
  color: var(--b-crit-fg);
}
.page-wrapper .b-off {
  background: var(--b-off-bg);
  color: var(--b-off-fg);
}
.page-wrapper table.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--ink);
}
.page-wrapper table.tbl th {
  background: var(--th-bg);
  color: var(--ink-2);
  padding: 5px 8px;
  text-align: left;
  white-space: nowrap;
  position: sticky;
  top: 0;
}
.page-wrapper table.tbl td {
  padding: 5px 8px;
  border-top: 1px solid var(--grid-soft);
}
.page-wrapper .hint {
  color: var(--muted);
  padding: 30px;
  text-align: center;
}
.page-wrapper .subh {
  font-size: 11px;
  color: var(--muted);
  font-weight: 400;
}
.page-wrapper .ghostbtn {
  border: 1px solid var(--field-line);
  background: var(--field-bg);
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
}
.page-wrapper .ghostbtn:hover {
  border-color: var(--cat1);
  color: var(--cat1);
}

/* ---- 工具栏 ---- */
.page-wrapper .dg-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 8px 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.page-wrapper .tspacer {
  flex: 1;
}
.page-wrapper .seg {
  display: inline-flex;
  border: 1px solid var(--field-line);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.page-wrapper .seg button {
  border: 0;
  background: var(--field-bg);
  padding: 5px 14px;
  font-size: 13px;
  color: var(--ink-2);
  cursor: pointer;
}
.page-wrapper .seg button.on {
  background: var(--navy);
  color: #fff;
  font-weight: 600;
}
.page-wrapper .dg-search {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--field-line);
  border-radius: 6px;
  padding: 2px 8px;
  background: var(--field-bg);
}
.page-wrapper .dg-search input {
  border: 0;
  outline: 0;
  font-size: 12px;
  width: 170px;
  background: none;
  color: var(--ink);
}
.page-wrapper .dg-search input::placeholder {
  color: var(--muted);
}
.page-wrapper .chip {
  border: 1px solid var(--field-line);
  background: var(--chip-bg);
  border-radius: 14px;
  padding: 2px 12px;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
}
.page-wrapper .chip.on {
  background: var(--navy);
  border-color: var(--navy);
  color: #fff;
}
.page-wrapper .codefilter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  background: var(--b-crit-bg);
  color: var(--b-crit-fg);
  border-radius: 4px;
  padding: 2px 8px;
}
.page-wrapper .codefilter button {
  border: 0;
  background: none;
  color: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* ---- 三栏网格 ---- */
.page-wrapper .dg-grid {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}
.page-wrapper .dg-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
.page-wrapper .dg-scroll {
  overflow: auto;
  min-height: 0;
}
.page-wrapper .dg-scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.page-wrapper .dg-scroll::-webkit-scrollbar-thumb {
  background: var(--grid-soft);
  border-radius: 2px;
}
.page-wrapper .dg-fill {
  flex: 1;
  margin-bottom: 0;
}
.page-wrapper .dg-colwrap {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.page-wrapper .dg-colwrap::-webkit-scrollbar {
  width: 4px;
}
.page-wrapper .dg-colwrap::-webkit-scrollbar-thumb {
  background: var(--grid-soft);
  border-radius: 2px;
}
.page-wrapper .dg-colwrap .card {
  margin-bottom: 12px;
}
.page-wrapper .dg-colwrap .card:last-child {
  margin-bottom: 0;
}

/* ---- 设备树 ---- */
.page-wrapper .tree {
  font-size: 12px;
}
.page-wrapper .tree .pl {
  font-weight: 600;
  margin: 6px 0 2px;
  color: var(--ink);
}
.page-wrapper .tree .zn {
  margin-left: 10px;
  color: var(--ink-2);
}
.page-wrapper .treeline {
  margin-left: 22px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink);
}
.page-wrapper .treeline:hover {
  background: var(--panel-hover);
}
.page-wrapper .treeline.on {
  background: var(--panel-on);
}
.page-wrapper .tree .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.page-wrapper .treeline .tcount {
  margin-left: auto;
  background: var(--b-crit-bg);
  color: var(--b-crit-fg);
  border-radius: 8px;
  font-size: 10px;
  padding: 0 6px;
  line-height: 14px;
}
.page-wrapper .treeline .toff {
  margin-left: auto;
  color: var(--muted);
  font-size: 10px;
}

/* ---- 回路卡 ---- */
.page-wrapper .ccard {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: 1px solid var(--grid-soft);
  border-radius: 6px;
  background: var(--surface);
  padding: 5px 8px;
  margin-bottom: 6px;
  position: relative;
  color: var(--ink);
  cursor: pointer;
}
.page-wrapper .ccard.on {
  border-color: var(--cat1);
  background: var(--panel-on);
}
.page-wrapper .ccard.dim {
  opacity: .4;
}
.page-wrapper .ccard.hitmark {
  box-shadow: 0 0 0 2px rgba(208, 59, 59, .35);
}
.page-wrapper .ccard .sbar {
  width: 3px;
  border-radius: 2px;
  align-self: stretch;
  flex-shrink: 0;
}
.page-wrapper .sbar.ok {
  background: var(--st-good);
}
.page-wrapper .sbar.warn {
  background: var(--st-warn);
}
.page-wrapper .sbar.crit {
  background: var(--st-crit);
}
.page-wrapper .sbar.off {
  background: #9ca3af;
}
.page-wrapper .sbar.test {
  background: #c7c7c7;
}
.page-wrapper .ccard .cn {
  min-width: 0;
}
.page-wrapper .ccard .cn strong {
  font-size: 12px;
  display: block;
}
.page-wrapper .ccard .cn span {
  font-size: 11px;
  color: var(--muted);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.page-wrapper .ccard em {
  font-style: normal;
  font-size: 11px;
  margin-left: auto;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}
.page-wrapper .cs-ok {
  color: var(--txt-good);
}
.page-wrapper .cs-warn {
  color: var(--txt-warn);
}
.page-wrapper .cs-crit {
  color: var(--txt-crit);
}
.page-wrapper .cs-off,
.page-wrapper .cs-test {
  color: var(--muted);
}
.page-wrapper .boxinfo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 10px;
  font-size: 12px;
  background: var(--th-bg);
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 8px;
  color: var(--ink);
}
.page-wrapper .boxinfo .bl {
  color: var(--muted);
}
.page-wrapper .boxinfo .bv {
  text-align: right;
}

/* ---- 回路详情 ---- */
.page-wrapper .chead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.page-wrapper .chead .titleline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.page-wrapper .chead h2 {
  font-size: 15px;
  margin: 0;
  color: var(--ink);
}
.page-wrapper .chead .meta {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}
.page-wrapper .hscore {
  text-align: right;
  flex-shrink: 0;
}
.page-wrapper .hscore span {
  display: block;
  font-size: 11px;
  color: var(--muted);
}
.page-wrapper .hscore strong {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--ink);
}
.page-wrapper .metgrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 10px 0;
}
.page-wrapper .metcard {
  border: 1px solid var(--grid-soft);
  border-radius: 6px;
  padding: 6px 10px;
  background: var(--surface);
}
.page-wrapper .metcard .l {
  font-size: 11px;
  color: var(--muted);
}
.page-wrapper .metcard .v {
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
}
.page-wrapper .metcard .v small {
  font-size: 11px;
  color: var(--muted);
  font-weight: 400;
}
.page-wrapper .metcard .d {
  font-size: 11px;
}
.page-wrapper .d-ok {
  color: var(--txt-good);
}
.page-wrapper .d-bad {
  color: var(--txt-crit);
}
.page-wrapper .d-mut {
  color: var(--muted);
}
.page-wrapper .section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 6px;
  gap: 8px;
  flex-wrap: wrap;
}
.page-wrapper .chart-legend {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 11px;
  color: var(--ink-2);
  margin-top: 6px;
  flex-wrap: wrap;
}
.page-wrapper .chart-legend .lg-dot {
  display: inline-block;
  width: 14px;
  height: 3px;
  border-radius: 2px;
  vertical-align: middle;
  margin-right: 4px;
}
.page-wrapper .chart-legend strong {
  margin-left: auto;
}
.page-wrapper .chain {
  background: var(--th-bg);
  border-radius: 6px;
  padding: 7px 10px;
  margin-top: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  color: var(--ink);
}
.page-wrapper .chain .lab {
  font-weight: 600;
  color: var(--ink-2);
  flex-shrink: 0;
}
.page-wrapper .chain .step {
  background: var(--step-bg);
  border: 1px solid var(--grid-soft);
  border-radius: 4px;
  padding: 1px 8px;
  color: var(--ink);
}
.page-wrapper .chain .step.final {
  background: var(--st-warn);
  border-color: var(--st-warn);
  color: #5b4200;
  font-weight: 600;
}
.page-wrapper .chain .arr {
  color: #b6b4ae;
}

/* ---- 右栏：命中问题 / 专家结论 / 处置建议 ---- */
.page-wrapper .issue {
  border: 1px solid var(--grid-soft);
  border-left: 3px solid var(--st-crit);
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 6px;
  font-size: 12px;
}
.page-wrapper .issue.whit {
  border-left-color: var(--st-warn);
}
.page-wrapper .issue.info {
  border-left-color: #c9ccd1;
}
.page-wrapper .issue.excl {
  border-left-color: #c9ccd1;
  opacity: .72;
}
.page-wrapper .issue .ih {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.page-wrapper .issue .ih b {
  font-size: 12px;
  color: var(--ink);
}
.page-wrapper .issue .ist {
  font-size: 11px;
  white-space: nowrap;
}
.page-wrapper .ist.hit {
  color: var(--txt-crit);
}
.page-wrapper .ist.whit {
  color: var(--txt-warn);
}
.page-wrapper .ist.info {
  color: var(--muted);
}
.page-wrapper .ist.excl {
  color: var(--muted);
}
.page-wrapper .issue p {
  color: var(--ink-2);
  font-size: 11px;
  margin-top: 2px;
}
.page-wrapper .icount {
  display: inline-block;
  background: var(--b-crit-bg);
  color: var(--b-crit-fg);
  border-radius: 9px;
  font-size: 11px;
  padding: 0 8px;
  margin-left: 6px;
}
.page-wrapper .concl .cf {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.page-wrapper .concl .conf {
  color: var(--orange);
  font-weight: 700;
  font-size: 17px;
}
.page-wrapper .concl h4 {
  font-size: 14px;
  margin: 2px 0;
  color: var(--ink);
}
.page-wrapper .concl .ctext {
  font-size: 12px;
  color: var(--ink-2);
}
.page-wrapper .cgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 8px 0;
}
.page-wrapper .cgrid .cl {
  font-size: 11px;
  color: var(--muted);
}
.page-wrapper .cgrid .cv {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
}
.page-wrapper .cnote {
  font-size: 11px;
  color: var(--muted);
  background: var(--note-bg);
  border-radius: 4px;
  padding: 4px 8px;
}
.page-wrapper .advice {
  margin-left: 18px;
  font-size: 12px;
  color: var(--ink-2);
}
.page-wrapper .advice li {
  margin: 2px 0;
}

/* ---- 规则与知识库 ---- */
.page-wrapper .kbver {
  font-size: 11px;
  background: rgba(42, 82, 152, .18);
  color: var(--navy-2);
  border-radius: 4px;
  padding: 1px 8px;
}
.page-wrapper .prob-item {
  display: block;
  width: 100%;
  text-align: left;
  border: 1px solid var(--grid-soft);
  border-radius: 6px;
  background: var(--surface);
  padding: 6px 10px;
  margin-bottom: 6px;
  color: var(--ink);
  cursor: pointer;
}
.page-wrapper .prob-item.on {
  border-color: var(--cat1);
  background: var(--panel-on);
}
.page-wrapper .prob-item .pi-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
.page-wrapper .prob-item .pi-h b {
  font-size: 12px;
}
.page-wrapper .prob-item .pi-hit {
  font-size: 11px;
  background: var(--b-crit-bg);
  color: var(--b-crit-fg);
  border-radius: 9px;
  padding: 0 8px;
  flex-shrink: 0;
}
.page-wrapper .prob-item .pi-hit.zero {
  background: var(--th-bg);
  color: var(--muted);
}
.page-wrapper .logic-flow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 8px 0;
}
.page-wrapper .logic-card {
  border: 1px solid var(--grid-soft);
  border-top: 3px solid;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  background: var(--surface);
  color: var(--ink);
}
.page-wrapper .logic-card .lt {
  font-size: 11px;
  color: var(--muted);
}
.page-wrapper .logic-card b {
  display: block;
  margin: 1px 0;
  font-size: 12px;
  color: var(--ink);
}
.page-wrapper .logic-card p {
  font-size: 11px;
  color: var(--ink-2);
}
.page-wrapper .lc-req {
  border-top-color: var(--cat1);
}
.page-wrapper .lc-abn {
  border-top-color: var(--orange);
}
.page-wrapper .lc-exc {
  border-top-color: #9ca3af;
}
.page-wrapper .lc-dur {
  border-top-color: #8a5fb8;
}
.page-wrapper .outtiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.page-wrapper .outtile {
  background: var(--th-bg);
  border-radius: 6px;
  padding: 6px 10px;
}
.page-wrapper .outtile .cl {
  font-size: 11px;
  color: var(--muted);
  display: block;
}
.page-wrapper .outtile .cv {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
}
.page-wrapper .dep {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--grid-soft);
  padding: 5px 0;
  font-size: 12px;
  gap: 6px;
  color: var(--ink);
}
.page-wrapper .dep:first-of-type {
  border-top: 0;
}
.page-wrapper .dep b {
  font-size: 12px;
}
.page-wrapper .dep .role {
  font-size: 11px;
  color: var(--muted);
}
.page-wrapper .dbadge {
  font-size: 11px;
  border-radius: 10px;
  padding: 0 8px;
  white-space: nowrap;
  font-style: normal;
}
.page-wrapper .dbadge.ready {
  background: var(--b-ok-bg);
  color: var(--b-ok-fg);
}
.page-wrapper .dbadge.missing {
  background: var(--b-warn-bg);
  color: var(--b-warn-fg);
}
.page-wrapper .dbadge.optional {
  background: var(--th-bg);
  color: var(--muted);
}
.page-wrapper .cov-big {
  font-size: 26px;
  font-weight: 700;
  color: var(--green);
}
.page-wrapper .cov-track {
  height: 8px;
  background: var(--track);
  border-radius: 4px;
  overflow: hidden;
  margin: 6px 0;
}
.page-wrapper .cov-fill {
  height: 100%;
  background: var(--green);
  border-radius: 4px;
}
.page-wrapper .rel {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  margin: 6px 0;
  color: var(--ink);
}
.page-wrapper .rel .node {
  background: var(--panel-hover);
  border-radius: 4px;
  padding: 1px 8px;
  color: var(--ink);
}
.page-wrapper .rel .arr {
  color: #b6b4ae;
}

/* ---- 阈值行内编辑 ---- */
.page-wrapper .throw {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  align-items: center;
}
.page-wrapper .throw label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ink-2);
}
.page-wrapper .throw input {
  width: 60px;
  border: 1px solid var(--field-line);
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 12px;
  background: var(--field-bg);
  color: var(--ink);
}

/* ==================== 数字等宽 ==================== */
.page-wrapper .num {
  font-variant-numeric: tabular-nums;
}
</style>
