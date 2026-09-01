/* 全局响应式状态：演示时钟 / 诊断阈值 / 页签与选中 / 派生快照与报警。
 * 3 秒一拍：DEMO.tick/minute 变化 → snap 重算 → alarms 重算 → 各组件级联更新。 */
import { reactive, computed } from 'vue'
import { LD } from './data.js'
import { DEFAULT_TH, diagnose } from './diag.js'
import { demoSnapshot, hourlySeries, zoneWindow as zoneWindowIdx } from './sim.js'

export { LD }

export const TH = reactive({ ...DEFAULT_TH })                     // 诊断阈值（诊断页可调）
export const DEMO = reactive({ minute: 20 * 60 + 35, tick: 0 })   // 演示时钟：2026-08-12 20:35 起
export const UI = reactive({ tab: 'overview', parcel: -1 })       // 当前页签 / 总览地块筛选（-1=全园）
export const SEL = reactive({ p: 0, z: '', b: '' })               // 回路诊断选中箱子
export const DG = reactive({                                       // 回路诊断页状态
  sub: 'live',            // 子视图：live 实时诊断 | kb 规则与知识库
  filter: 'all',          // 状态筛选：all/ok/warn/crit/off
  codeFilter: null,       // 规则命中筛选（从知识库跳入）：R1/R2/R3/R4/R5C/R5M
  ci: null,               // 选中回路号
  metric: 'power',        // 健康基准图量纲：power | amps
  prob: 'R1',             // 知识库选中问题模型
  kbDomain: '全部',
  search: '',
  kbSearch: ''
})

export const snap = computed(() => demoSnapshot(LD, DEMO.minute, DEMO.tick))
export const alarms = computed(() => diagnose(LD, snap.value, TH))

/* 24h 逐时功率与台账聚量为静态，模块初始化算一次 */
export const HOURLY = hourlySeries(LD)

export function totalToday () {
  var s = 0
  LD.parcels.forEach(p => p.zones.forEach(z => z.boxes.forEach(b => b.circuits.forEach(c => { s += c.today }))))
  return s
}

export function tick () {
  DEMO.tick++; DEMO.minute++
  if (DEMO.minute >= 24 * 60) DEMO.minute = 19 * 60   // 演示时钟仅在亮灯段循环
}

/* —— 诊断页通用派生 —— */
/* R5 按 msg 细分：通信中断 → R5C（数据·通信）；其余（计量/控制缺陷/未安装/测试）→ R5M */
export function alarmModelCode (a) {
  return a.code === 'R5' ? (/通信/.test(a.msg) ? 'R5C' : 'R5M') : a.code
}

/* 箱子在当前报警集下的状态：off 未安装/通信中断 > crit 报警 > warn 预警 > ok */
export function boxStatus (p, z, b, alarmList) {
  var mine = alarmList.filter(a => a.pname === p.name && a.zid === z.zid && a.bid === b.bid)
  if (!b.installed || b.comm) return 'off'
  if (mine.some(a => a.level === 'alarm')) return 'crit'
  if (mine.some(a => a.level === 'warn')) return 'warn'
  return 'ok'
}

/* 回路在当前报警集下的状态：off/test 不参与 KPI 分母语义，用于列表着色 */
export function ckStatus (p, z, b, c, alarmList) {
  if (!b.installed || b.comm) return 'off'
  if (c.fake) return 'test'
  var crit = false; var warn = false
  alarmList.forEach(a => {
    if (a.bid !== b.bid || a.zid !== z.zid) return
    if (a.ci === c.i || a.ci === 0) {
      if (a.level === 'alarm' && a.code !== 'R5') crit = true
      else if (a.level === 'warn' || a.level === 'alarm') warn = true
    }
  })
  return crit ? 'crit' : warn ? 'warn' : 'ok'
}

export const STATUS_TXT = { ok: '正常', warn: '预警', crit: '报警', off: '离线', test: '测试' }
export const STATUS_BADGE = { ok: 'b-ok', warn: 'b-warn', crit: 'b-crit', off: 'b-off', test: 'b-off' }

/* 各区域亮灯窗口（分钟），与 sim.js zoneWindow 同种子 */
var _zw = null
export function zoneWinOf (pname, zid) {
  if (!_zw) {
    _zw = {}; var i = 0
    LD.parcels.forEach(p => p.zones.forEach(z => { _zw[p.name + '|' + z.zid] = zoneWindowIdx(i++) }))
  }
  return _zw[pname + '|' + zid]
}
