/**
 * 各页签图表区域 mock 数据层
 *
 * 对应原型 energy-charts/tab_data.js，9 个页签 × 各 2 张图 = 18 张图。
 * acTab / freshTab / powerTab 的部分图线上已有真实接口，但此处统一使用 mock 数据，
 * 保证在无后端环境下也能 1:1 还原原型样式。
 */

/* ---------- 公共常量 ---------- */
export const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0') + ':00')

/* ---------- 确定性抖动（固定种子，刷新不变） ---------- */
function wobble(i: number, seed: number, amp: number): number {
  const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453
  return ((s - Math.floor(s)) - 0.5) * 2 * amp
}
const round1 = (v: number) => Math.round(v * 10) / 10

/* ---------- 公共运行日程 ---------- */
// 空调/新风/风机盘管/热回收：08 时启动，13–15 时峰值，21 时停机
const AC_LOAD = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0.45, 0.72, 0.86, 0.93, 0.97,
  1.0, 0.99, 0.95, 0.90,
  0.84, 0.76, 0.62, 0.34,
  0, 0, 0,
]
// 排风机：07–21 时运行
const EXH_LOAD = [
  0, 0, 0, 0, 0, 0, 0,
  0.55, 0.75, 0.85, 0.85, 0.85,
  0.90, 0.90, 0.90, 0.90, 0.90,
  0.85, 0.85, 0.70, 0.50,
  0, 0, 0,
]
// 光伏出力形态（8 月晴日钟形）
const PV_SHAPE = [
  0, 0, 0, 0, 0, 0,
  0.05, 0.22, 0.45, 0.68, 0.85, 0.95,
  1.0, 0.97, 0.88, 0.72, 0.52, 0.30,
  0.12, 0.02,
  0, 0, 0, 0,
]
const OFF_AMBIENT = [26.4, 26.2, 26.0, 25.9, 25.9, 26.1, 26.5, 27.0]
const POST_OFF = [23.4, 24.1, 24.7]
function offTarget(h: number): number {
  return h <= 7 ? OFF_AMBIENT[h] : POST_OFF[h - 21]
}
function trackCurve(
  targets: number[],
  start: number,
  rateDown: number,
  rateUp: number,
  jitterSeed: number,
  jitterAmp: number,
): number[] {
  const out: number[] = []
  let v = start
  for (let h = 0; h < 24; h++) {
    const step = targets[h] - v
    v += Math.max(-rateDown, Math.min(rateUp, step))
    out.push(round1(v + wobble(h, jitterSeed, jitterAmp)))
  }
  return out
}
function runSeries(
  unitNames: string[],
  fn: (h: number, u: number) => number,
): { name: string; data: (number | null)[] }[] {
  return unitNames.map((name, u) => ({
    name,
    data: HOURS.map((_, h) => (AC_LOAD[h] === 0 ? null : round1(fn(h, u)))),
  }))
}

/* ============================================================
 * 页签① 空调机组（acTab）— 图1 回风二氧化碳
 * ============================================================ */
const AHU = ['AHU-1', 'AHU-2', 'AHU-3', 'AHU-4']
const CO2_OCC = [
  0, 0, 0, 0, 0, 0, 0,
  0.15, 0.40, 0.60, 0.60, 0.80,
  1.0, 1.0, 1.0, 0.90, 0.80,
  0.70, 0.50, 0.30, 0.15,
  0, 0, 0,
]
function buildAcCo2Series(): { name: string; data: number[] }[] {
  const OFFSET = [3, 6, -5, 0]
  return AHU.map((name, u) => ({
    name,
    data: HOURS.map((_, h) =>
      round1(412 + 172 * CO2_OCC[h] * (1 + OFFSET[u] / 500) + wobble(h, u + 201, 4)),
    ),
  }))
}

/* ============================================================
 * 页签① 空调机组 — 图2 供回风温度趋势（送温/回温切换）
 * ============================================================ */
const SA_SETPOINT = [16.5, 16.8, 17.0, 16.2]
function buildAcSupplySeries(): { name: string; data: number[] }[] {
  return AHU.map((name, u) => ({
    name,
    data: trackCurve(
      HOURS.map((_, h) => (h >= 8 && h <= 20 ? SA_SETPOINT[u] + 0.5 * AC_LOAD[h] : offTarget(h))),
      26.4, 3.5, 2.5, u + 11, 0.2,
    ),
  }))
}
function buildAcReturnSeries(): { name: string; data: number[] }[] {
  const OFFSET = [0.3, 0, -0.2, 0.1]
  return AHU.map((name, u) => ({
    name,
    data: trackCurve(
      HOURS.map((_, h) => (h >= 8 && h <= 20 ? 23.0 + 2.8 * AC_LOAD[h] + OFFSET[u] : offTarget(h) + 0.5)),
      26.9, 1.5, 1.5, u + 21, 0.15,
    ),
  }))
}

/* ============================================================
 * 页签② 新风机组 — 图1 各机组PM2.5分布（柱状）
 * ============================================================ */
const PAU = ['PAU-1', 'PAU-2', 'PAU-3', 'PAU-4']
function buildPm25Data() {
  const base = [12.4, 14.8, 11.2, 16.9]
  return {
    categories: PAU,
    catLabel: '新风机组',
    unit: 'μg/m³',
    threshold: 35,
    thresholdLabel: 'GB 3095 二级 35 μg/m³',
    series: [{ name: '送风 PM2.5', data: base.map((v, i) => round1(v + wobble(i, 5, 0.6))) }],
  }
}

/* ============================================================
 * 页签② 新风机组 — 图2 送回风温度曲线（送温/回温切换）
 * ============================================================ */
function buildFreshSupplySeries(): { name: string; data: number[] }[] {
  const OFFSET = [0, 0.3, 0.5, -0.4]
  return PAU.map((name, u) => ({
    name,
    data: trackCurve(
      HOURS.map((_, h) => (AC_LOAD[h] > 0 ? 18.2 + 0.9 * AC_LOAD[h] + OFFSET[u] : offTarget(h))),
      26.4, 3.5, 2.5, u + 31, 0.2,
    ),
  }))
}
function buildFreshReturnSeries(): { name: string; data: number[] }[] {
  const OFFSET = [0.2, 0, -0.2, 0.1]
  return PAU.map((name, u) => ({
    name,
    data: trackCurve(
      HOURS.map((_, h) => (AC_LOAD[h] > 0 ? 24.2 + 1.8 * AC_LOAD[h] + OFFSET[u] : offTarget(h) + 0.4)),
      26.8, 1.5, 1.5, u + 41, 0.15,
    ),
  }))
}

/* ============================================================
 * 页签② 排风机 — 图1 排风系统能耗趋势（折线）
 * ============================================================ */
const EF = ['EF-1', 'EF-2', 'EF-3', 'EF-4']
function buildExhaustEnergySeries(): { name: string; data: number[] }[] {
  const BASE = [9.5, 8.2, 7.0, 5.8]
  return EF.map((name, u) => ({
    name,
    data: HOURS.map((_, h) =>
      EXH_LOAD[h] === 0 ? 0 : round1(BASE[u] * EXH_LOAD[h] * (1 + wobble(h, u + 51, 0.03)))),
  }))
}

/* ============================================================
 * 页签② 排风机 — 图2 排风压差分析（折线）
 * ============================================================ */
function buildExhaustPressureSeries(): { name: string; data: number[] }[] {
  return EF.map((name, u) => ({
    name,
    data: HOURS.map((_, h) =>
      EXH_LOAD[h] === 0 ? 0 : round1(240 + 55 * EXH_LOAD[h] + [8, 3, -4, -9][u] + wobble(h, u + 61, 6))),
  }))
}

/* ============================================================
 * 页签③ 风机盘管 — 图1 风机盘管能耗趋势（折线·各馆）
 * ============================================================ */
const FCU_AREAS = ['1号馆', '2号馆', '3号馆', '4号馆']
function buildFcuEnergySeries(): { name: string; data: number[] }[] {
  const BASE = [38, 30, 24, 18]
  return FCU_AREAS.map((name, u) => ({
    name,
    data: HOURS.map((_, h) =>
      AC_LOAD[h] === 0 ? 0 : round1(BASE[u] * AC_LOAD[h] * (1 + wobble(h, u + 71, 0.04)))),
  }))
}

/* ============================================================
 * 页签③ 风机盘管 — 图2 供回水温度曲线（折线）
 * ============================================================ */
function buildFcuWaterSeries(): { name: string; data: number[] }[] {
  const supply = HOURS.map((_, h) => round1(7.35 - 0.25 * AC_LOAD[h] + wobble(h, 81, 0.05)))
  const ret = HOURS.map((_, h) => round1(7.4 + 5.4 * AC_LOAD[h] + wobble(h, 82, 0.12)))
  return [
    { name: '供水温度', data: supply },
    { name: '回水温度', data: ret },
  ]
}

/* ============================================================
 * 页签④ 热回收机组 — 图1 热回收能耗趋势（折线·停机断开）
 * ============================================================ */
const HRU = ['HRU-1', 'HRU-2', 'HRU-3']
function buildHeatRecoverySeries(): { name: string; data: (number | null)[] }[] {
  const BASE = [95, 80, 60]
  return runSeries(HRU, (h, u) => BASE[u] * AC_LOAD[h] * (1 + wobble(h, u + 91, 0.05)))
}

/* ============================================================
 * 页签④ 热回收机组 — 图2 排风温度回收效率（折线 % ·停机断开）
 * ============================================================ */
function buildHeatRecoveryEffSeries(): { name: string; data: (number | null)[] }[] {
  return runSeries(HRU, (h, u) => 58 + 12 * AC_LOAD[h] + [2, 0, -2][u] + wobble(h, u + 101, 1.2))
}

/* ============================================================
 * 页签⑤ 集水坑 — 图1 液位趋势曲线（折线·启/停泵参考线）
 * ============================================================ */
const PITS = ['JC-1', 'JC-2', 'JC-3', 'JC-4']
const LEVEL_START = 1.55
const LEVEL_STOP = 0.5
function buildPitLevelSeries(): { name: string; data: number[] }[] {
  return PITS.map((name, p) => {
    const inflow = [0.10, 0.085, 0.07, 0.05][p]
    const pumpRate = [2.4, 2.2, 2.0, 1.8][p]
    let v = LEVEL_STOP + 0.12 * p
    const data: number[] = []
    for (let h = 0; h < 24; h++) {
      let hourPeak = v
      for (let sub = 0; sub < 12; sub++) {
        v += (inflow * (0.8 + 0.4 * Math.abs(Math.sin(h * 2.7 + p * 1.3)))) / 12
        hourPeak = Math.max(hourPeak, v)
        if (v >= LEVEL_START) v = Math.max(LEVEL_STOP, v - (pumpRate / 12) * 2.5)
      }
      data.push(round1(Math.min(hourPeak, LEVEL_START + 0.06)))
    }
    return { name, data }
  })
}

/* ============================================================
 * 页签⑤ 集水坑 — 图2 排水泵运行统计（柱状·tooltip 附启动次数）
 * ============================================================ */
function buildPumpStatData() {
  const pumps = ['1号坑-1#泵', '1号坑-2#泵', '2号坑-1#泵', '2号坑-2#泵', '3号坑-1#泵', '4号坑-1#泵']
  const hours = [2.6, 1.8, 3.2, 2.1, 1.2, 0.8]
  const starts = [7, 5, 9, 6, 3, 2]
  return {
    categories: pumps,
    catLabel: '排水泵',
    unit: 'h',
    series: [{
      name: '运行时长',
      data: hours.map((v, i) => ({ value: round1(v + wobble(i, 111, 0.1)), starts: starts[i] })),
    }],
  }
}

/* ============================================================
 * 页签⑥ 配电系统 — 图1/图2 正向有功 / 正向无功（柱状）
 * ============================================================ */
function buildHourlyEnergyData(
  totalDay: number,
  base: number,
  perLoad: number,
  unit: string,
  seriesName: string,
) {
  const raw = HOURS.map((_, h) => base + perLoad * AC_LOAD[h])
  const k = totalDay / raw.reduce((a, b) => a + b, 0)
  const vals = raw.map((v) => Math.round(v * k * 100) / 100)
  const drift = Math.round((totalDay - vals.reduce((a, b) => a + b, 0)) * 100) / 100
  const maxIdx = raw.indexOf(Math.max(...raw))
  vals[maxIdx] += drift
  return { categories: HOURS, catLabel: '时刻', unit, series: [{ name: seriesName, data: vals }] }
}
function buildForwardActiveData() {
  return buildHourlyEnergyData(875.40, 18, 62, 'kWh', '正向有功')
}
function buildForwardReactiveData() {
  return buildHourlyEnergyData(159.60, 8, 22, 'kWh', '正向无功')
}

/* ============================================================
 * 页签⑦ 冷源系统 — 图1 冷源系统能效趋势（折线 COP·停机断开）
 * ============================================================ */
const CHILLERS = ['系统综合COP', '1#离心机组', '2#螺杆机组']
function buildCopSeries(): { name: string; data: (number | null)[] }[] {
  return CHILLERS.map((name, u) => ({
    name,
    data: HOURS.map((_, h) => {
      if (AC_LOAD[h] === 0) return null
      if (u === 0) return round1(3.55 + 1.25 * AC_LOAD[h] + wobble(h, 141, 0.05))
      if (u === 1) return round1(4.55 + 1.25 * AC_LOAD[h] + wobble(h, 142, 0.06))
      return round1(4.25 + 1.05 * AC_LOAD[h] + wobble(h, 143, 0.06))
    }),
  }))
}

/* ============================================================
 * 页签⑦ 冷源系统 — 图2 制冷量（折线·附合计序列）
 * ============================================================ */
const CHILLER_NAMES = ['1#离心机组', '2#螺杆机组']
const CHILLER_RATED = [4400, 2500]
function buildCoolingCapacitySeries(): { name: string; data: number[] }[] {
  const byUnit = CHILLER_NAMES.map((name, u) => ({
    name,
    data: HOURS.map((_, h) =>
      AC_LOAD[h] === 0 ? 0 : round1(CHILLER_RATED[u] * AC_LOAD[h] * (1 + wobble(h, u + 211, 0.02)))),
  }))
  const total = HOURS.map((_, h) => round1(byUnit.reduce((s, sr) => s + sr.data[h], 0)))
  return byUnit.concat([{ name: '合计', data: total }])
}

/* ============================================================
 * 页签⑧ 光伏系统 — 图1 光伏发电趋势（折线·合计过滤）
 * ============================================================ */
const PV_AREAS = ['A区屋面', 'B区屋面', '车棚区']
const PV_KWP = [272, 208, 119]
const PV_G_PEAK = 950
const PV_NOCT = 45
const PV_GAMMA = -0.0035
const PV_ETA_LINE = 0.985
const PV_ETA_OTHER = 0.94

function pvIrradiance(h: number): number {
  return PV_G_PEAK * PV_SHAPE[h]
}
function pvCellTemp(h: number, g: number): number {
  const tAmb = 26 + 7 * Math.max(0, Math.sin(((h - 6) / 13) * Math.PI))
  return tAmb + ((PV_NOCT - 20) / 800) * g
}
function pvEtaInv(g: number): number {
  return 0.97 - 0.12 * Math.exp(-(g / 1000) / 0.08)
}
function pvChain(h: number, u: number): number {
  const g = pvIrradiance(h)
  const etaTemp = 1 + PV_GAMMA * (pvCellTemp(h, g) - 25)
  return etaTemp * pvEtaInv(g) * PV_ETA_LINE * PV_ETA_OTHER
}
function pvWobble(h: number, u: number): number {
  return 1 + wobble(h, u + 161, 0.03)
}
function pvOutput(h: number, u: number): number {
  const g = pvIrradiance(h)
  if (g <= 0) return 0
  return PV_KWP[u] * (g / 1000) * pvChain(h, u) * pvWobble(h, u)
}

function buildPvPowerSeries(): { name: string; data: number[] }[] {
  const byArea = PV_AREAS.map((name, u) => ({
    name,
    data: HOURS.map((_, h) => round1(pvOutput(h, u))),
  }))
  const total = HOURS.map((_, h) => round1(byArea.reduce((s, sr) => s + sr.data[h], 0)))
  return byArea.concat([{ name: '合计', data: total }])
}

/* ============================================================
 * 页签⑧ 光伏系统 — 图2 辐照度-发电量关联分析（散点）
 * ============================================================ */
function buildPvEnergyCorrelationData() {
  return {
    xUnit: 'W/m²',
    yUnit: 'kWh',
    series: PV_AREAS.map((name, u) => ({
      name,
      data: HOURS.map((_, h) => {
        const g = pvIrradiance(h)
        if (g <= 0) return null
        return [g, round1(pvOutput(h, u))]
      }).filter(Boolean) as [number, number][],
    })),
  }
}

/* ============================================================
 * 对外暴露的获取 mock 数据函数
 * ============================================================ */

// --- 空调机组 ---
export function getAcCo2Data() {
  return { xaxis: HOURS, chatSeriesList: buildAcCo2Series() }
}
export function getAcSupplyData() {
  return { xaxis: HOURS, chatSeriesList: buildAcSupplySeries() }
}
export function getAcReturnData() {
  return { xaxis: HOURS, chatSeriesList: buildAcReturnSeries() }
}

// --- 新风机组 ---
export function getFreshPm25Data() {
  return buildPm25Data()
}
export function getFreshSupplyData() {
  return { xaxis: HOURS, chatSeriesList: buildFreshSupplySeries() }
}
export function getFreshReturnData() {
  return { xaxis: HOURS, chatSeriesList: buildFreshReturnSeries() }
}

// --- 排风机 ---
export function getExhaustEnergyData() {
  return { xaxis: HOURS, chatSeriesList: buildExhaustEnergySeries() }
}
export function getExhaustPressureData() {
  return { xaxis: HOURS, chatSeriesList: buildExhaustPressureSeries() }
}

// --- 风机盘管 ---
export function getFcuEnergyData() {
  return { xaxis: HOURS, chatSeriesList: buildFcuEnergySeries() }
}
export function getFcuWaterData() {
  return { xaxis: HOURS, chatSeriesList: buildFcuWaterSeries() }
}

// --- 热回收机组 ---
export function getHeatRecoveryEnergyData() {
  return { xaxis: HOURS, chatSeriesList: buildHeatRecoverySeries() }
}
export function getHeatRecoveryEffData() {
  return { xaxis: HOURS, chatSeriesList: buildHeatRecoveryEffSeries() }
}

// --- 集水坑 ---
export function getSumpLevelData() {
  return { xaxis: HOURS, chatSeriesList: buildPitLevelSeries() }
}
export function getSumpPumpData() {
  return buildPumpStatData()
}

// --- 配电系统 ---
export function getForwardActiveData() {
  return buildForwardActiveData()
}
export function getForwardReactiveData() {
  return buildForwardReactiveData()
}

// --- 冷源系统 ---
export function getColdCopData() {
  return { xaxis: HOURS, chatSeriesList: buildCopSeries() }
}
export function getColdCapacityData() {
  return { xaxis: HOURS, chatSeriesList: buildCoolingCapacitySeries() }
}

// --- 光伏系统 ---
export function getPvPowerData() {
  return { xaxis: HOURS, chatSeriesList: buildPvPowerSeries() }
}
export function getPvCorrelationData() {
  return buildPvEnergyCorrelationData()
}

/* ---------- 参考线元数据 ---------- */
export const TAB_REF = {
  sump_level: {
    lines: [
      { y: LEVEL_START, label: `启泵液位 ${LEVEL_START.toFixed(2)} m` },
      { y: LEVEL_STOP, label: `停泵液位 ${LEVEL_STOP.toFixed(2)} m` },
    ],
  },
}
