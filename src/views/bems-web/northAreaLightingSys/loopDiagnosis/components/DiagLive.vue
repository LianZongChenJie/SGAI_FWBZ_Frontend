<script setup lang="ts">
/* 回路诊断 · 实时诊断子视图（版式参照 AIFD 主图）：
 * KPI 汇总条 → 设备树 | 箱信息+回路列表 | 回路详情（8 参量 + 健康基准图 + 推理链）| 命中问题/专家结论/处置建议/全园报警。
 * 数据与判定全部来自 store 的 snap/alarms（与规则引擎同源），阈值可调实时生效。 */
import { ref, computed, watchEffect } from 'vue'
import EChart from './EChart.vue'
import { LD, TH, DEMO, SEL, DG, snap, alarms, boxStatus, ckStatus, STATUS_TXT, STATUS_BADGE, alarmModelCode, zoneWinOf } from '../lib/store.js'
import { KB, DIAG_INFO } from '../lib/kb.js'
import { demoSnapshot } from '../lib/sim.js'
import { fmtMin, r2 } from '../lib/util.js'

const showTh = ref(false)
const DOT = { ok: '#0ca30c', warn: '#fab219', crit: '#d03b3b', off: '#9ca3af' }

/* ---------- 选中箱子（自动纠偏）与默认选中 ---------- */
const cur = computed(() => {
  const p = LD.parcels[SEL.p] || LD.parcels[0]
  const z = p.zones.find(x => x.zid === SEL.z) || p.zones[0]
  const b = (z.boxes as any[]).find((x: any) => x.bid === SEL.b) || z.boxes[0]
  return { p, z, b }
})
/* 初次进入：默认选第一个报警箱（沿用旧原型约定，首拍即为 F12·开路箱） */
watchEffect(() => {
  if (SEL.b) return
  const al = alarms.value
  outer:
  for (let i = 0; i < LD.parcels.length; i++) {
    for (const z of LD.parcels[i].zones) {
      for (const b of z.boxes) {
        if (boxStatus(LD.parcels[i], z, b, al) === 'crit') {
          SEL.p = i; SEL.z = z.zid; SEL.b = b.bid
          break outer
        }
      }
    }
  }
  if (!SEL.b) { SEL.p = 0; SEL.z = LD.parcels[0].zones[0].zid; SEL.b = LD.parcels[0].zones[0].boxes[0].bid }
})

const bk = computed(() => cur.value.p.name + '|' + cur.value.z.zid + '|' + cur.value.b.bid)
const boxSnap = computed(() => snap.value.boxes[bk.value] || { volts: 0 })

/* ---------- 回路列表与选中回路 ---------- */
const circuits = computed(() => {
  const { p, z, b } = cur.value; const sn = snap.value; const al = alarms.value
  return (b.circuits || []).map(c => {
    const st = sn.circuits[bk.value + '|' + c.i] || { amps: 0, onNow: false }
    const isHit = DG.codeFilter && al.some(a => a.bid === b.bid && a.zid === z.zid && a.ci === c.i && alarmModelCode(a) === DG.codeFilter)
    return { c, st, status: ckStatus(p, z, b, c, al), isHit }
  })
})
/* 选中回路无效时自动落到首个异常回路 */
watchEffect(() => {
  if (!circuits.value.length) { DG.ci = null; return }
  if (circuits.value.some(x => x.c.i === DG.ci)) return
  const bad = circuits.value.find(x => x.status === 'crit') || circuits.value.find(x => x.status === 'warn')
  DG.ci = (bad || circuits.value[0]).c.i
})
const sel = computed(() => circuits.value.find(x => x.c.i === DG.ci) || { c: { i: 0, kw: 0, m: 0, ch: 0, fake: false, month: 0, today: 0 }, st: { amps: 0, onNow: false }, status: 'off', isHit: false })
const ci = () => sel.value.c
const isTest = () => !!ci().fake

/* ---------- KPI 汇总条 ---------- */
const kpis = computed(() => {
  const al = alarms.value
  let tot = 0; let ok = 0; let warn = 0; let crit = 0; let off = 0; let commBoxes = 0; let nAl = 0; let nWn = 0
  LD.parcels.forEach(p => p.zones.forEach(z => z.boxes.forEach(b => {
    if (b.comm) commBoxes++
    b.circuits.forEach(c => {
      if (!b.installed || c.fake) return
      tot++
      if (b.comm) { off++; return }
      const s = ckStatus(p, z, b, c, al)
      if (s === 'crit') crit++; else if (s === 'warn') warn++; else ok++
    })
  })))
  al.forEach(a => { if (a.level === 'alarm') nAl++; else if (a.level === 'warn') nWn++ })
  return [
    { f: 'all', t: '接入回路', v: tot, s: '在线 ' + (tot - off) },
    { f: 'ok', t: '健康回路', v: ok, s: tot ? (ok / tot * 100).toFixed(1) + '%' : '' },
    { f: 'warn', t: '预警回路', v: warn, s: '电压越限 / 台账缺陷' },
    { f: 'crit', t: '报警回路', v: crit, s: '开路 / 粘连 / 过载' },
    { f: 'off', t: '离线回路', v: off, s: '通信中断 ' + commBoxes + ' 箱' },
    { f: null, t: '规则命中', v: nAl + nWn, s: '报警 ' + nAl + ' · 预警 ' + nWn }
  ]
})
const cfCount = computed(() => alarms.value.filter(a => DG.codeFilter && alarmModelCode(a) === DG.codeFilter).length)

/* ---------- 设备树（筛选 / 搜索 / 规则命中） ---------- */
const tree = computed(() => {
  const al = alarms.value; const q = DG.search.trim().toLowerCase()
  const out = []
  LD.parcels.forEach((p, pi) => {
    const zones = []
    p.zones.forEach(z => {
      const boxes = []
      z.boxes.forEach(b => {
        const st = boxStatus(p, z, b, al)
        if (DG.filter !== 'all' && st !== DG.filter) return
        if (DG.codeFilter && !al.some(a => a.bid === b.bid && alarmModelCode(a) === DG.codeFilter)) return
        if (q && (b.bid + ' ' + (b.loc || '') + ' ' + p.name + ' ' + z.name).toLowerCase().indexOf(q) < 0) return
        boxes.push({ b, st, nAl: al.filter(a => a.bid === b.bid && a.level === 'alarm' && a.code !== 'R5').length })
      })
      if (boxes.length) zones.push({ z, boxes })
    })
    if (zones.length) out.push({ p, pi, zones })
  })
  return out
})
function selectBox (pi, zid, bid) { SEL.p = pi; SEL.z = zid; SEL.b = bid; DG.ci = null }

/* ---------- 箱信息 ---------- */
const boxInfo = computed(() => {
  const b = cur.value.b; const cs = b.circuits || []
  let pw = 0
  cs.forEach(c => { const st = snap.value.circuits[bk.value + '|' + c.i]; if (st && st.onNow) pw += st.amps * boxSnap.value.volts / 1000 })
  return {
    loc: b.loc || '—', ip: b.ip || '—', meter: b.meter_id || '无',
    volts: b.installed ? boxSnap.value.volts + ' V' : '—',
    pw: r2(pw).toFixed(2) + ' kW',
    today: r2(cs.reduce((s, c) => s + c.today, 0)).toFixed(1) + ' kWh',
    comm: b.comm, meas: b.meas, virtual: b.virtual, installed: b.installed
  }
})

/* ---------- 回路详情：8 参量 ---------- */
function ciAlarmsOf (c) {
  const al = alarms.value; const b = cur.value.b; const z = cur.value.z
  return al.filter(a => a.bid === b.bid && a.zid === z.zid && (a.ci === c.i || a.ci === 0))
}
const mets = computed(() => {
  const c = ci(); const U = boxSnap.value.volts; const I = sel.value.st.amps; const on = sel.value.st.onNow
  if (isTest()) {
    return ['电压', '电流', '有功功率', '无功功率', '视在功率', '功率因数', '频率', '累计电量'].map(l =>
      ({ l, v: '--', u: '', d: '测试通道', cls: 'd-mut' }))
  }
  const loaded = I >= 0.05
  const pf = loaded ? Math.min(0.97, 0.92 + ((c.i * 7 + c.m) % 8) / 100) : null
  const S = U * I / 1000
  const P = pf ? S * pf : 0
  const Q = Math.sqrt(Math.max(0, S * S - P * P))
  const f = 50 + (((c.i * 13 + DEMO.tick) % 5) - 2) * 0.01
  const hasR3 = ciAlarmsOf(c).some(a => a.code === 'R3')
  let iD; let iCls
  if (on && I < TH.openA) { iD = '≈0 · 开路'; iCls = 'd-bad' } else if (!on && I > TH.stuckA) { iD = '残留 · 粘连'; iCls = 'd-bad' } else if (I > TH.overA) { iD = '过载'; iCls = 'd-bad' } else if (on && loaded) { iD = '负载运行'; iCls = 'd-ok' } else { iD = '关断'; iCls = 'd-mut' }
  let pD; let pCls
  if (on && loaded) {
    const dev = (c.kw - P) / c.kw * 100
    if (dev > 10) { pD = '↓ ' + dev.toFixed(1) + '%'; pCls = 'd-bad' } else { pD = '基准 ' + c.kw + ' kW'; pCls = 'd-mut' }
  } else { pD = '空载'; pCls = 'd-mut' }
  return [
    { l: '电压', v: U.toFixed(1), u: 'V', d: hasR3 ? '越限' : '正常', cls: hasR3 ? 'd-bad' : 'd-ok' },
    { l: '电流', v: I.toFixed(2), u: 'A', d: iD, cls: iCls },
    { l: '有功功率', v: P.toFixed(2), u: 'kW', d: pD, cls: pCls },
    { l: '无功功率', v: Q.toFixed(2), u: 'kvar', d: '—', cls: 'd-mut' },
    { l: '视在功率', v: S.toFixed(2), u: 'kVA', d: '—', cls: 'd-mut' },
    { l: '功率因数', v: pf ? pf.toFixed(3) : '—', u: '', d: pf ? '正常' : '空载不可信', cls: pf ? 'd-ok' : 'd-mut' },
    { l: '频率', v: f.toFixed(2), u: 'Hz', d: '正常', cls: 'd-ok' },
    { l: '累计电量', v: String(c.month), u: 'kWh', d: '今日 +' + c.today, cls: 'd-ok' }
  ]
})

/* 综合健康度 */
const health = computed(() => {
  if (isTest()) return null
  const st = sel.value.status
  if (st === 'off') return 0
  let s = 96
  ciAlarmsOf(ci()).forEach(a => { if (a.level === 'alarm' && a.code !== 'R5') s -= 34; else if (a.level !== 'note') s -= 10 })
  return Math.max(2, s)
})
const healthCol = computed(() => ({ ok: '#157017', warn: '#9a6b00', crit: '#b02a2a', off: '#898781', test: '#898781' }[sel.value.status]))

/* ---------- 健康基准图（最近 30 分钟，与引擎同源回放） ---------- */
const chartOpt = computed(() => {
  const c = ci(); const n = 16; const hist = []
  for (let k = n - 1; k >= 0; k--) {
    let m = DEMO.minute - k * 2; if (m < 19 * 60) m = 19 * 60
    const s = demoSnapshot(LD, m, Math.max(0, DEMO.tick - k))
    const st = s.circuits[bk.value + '|' + c.i] || { amps: 0, onNow: false }
    const U = (s.boxes[bk.value] || { volts: 220 }).volts
    const pf = Math.min(0.97, 0.92 + ((c.i * 7 + c.m) % 8) / 100)
    hist.push({ t: fmtMin(m), kw: Math.round(U * st.amps * pf) / 1000, amps: st.amps })
  }
  const mode = DG.metric
  const base = mode === 'power' ? c.kw : Math.round(c.kw * 1000 / 220 * 1.05 * 100) / 100
  const data = hist.map(h => mode === 'power' ? h.kw : h.amps)
  const badNow = sel.value.status === 'crit'
  const marks = []
  if (base > 0.15) {
    marks.push({ yAxis: base, lineStyle: { color: '#2E8B57', type: 'dashed', width: 1.5 }, label: { formatter: '健康基准 ' + base + (mode === 'power' ? ' kW' : ' A'), color: '#2E8B57', position: 'insideEndTop', fontSize: 11 } })
  }
  const areas = base > 0.15
    ? [[{ yAxis: Math.round(base * 0.9 * 100) / 100, itemStyle: { color: 'rgba(46,139,87,.07)' } }, { yAxis: Math.round(base * 1.1 * 100) / 100 }]]
    : []
  return {
    animation: false,
    grid: { left: 46, right: 16, top: 26, bottom: 24 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: hist.map(h => h.t), axisLine: { lineStyle: { color: '#c9ccd1' } }, axisLabel: { color: '#898781', fontSize: 10 } },
    yAxis: { type: 'value', name: mode === 'power' ? 'kW' : 'A', splitLine: { lineStyle: { color: '#ebeae4' } }, axisLabel: { color: '#898781' } },
    series: [{
      type: 'line', data, symbol: 'circle', symbolSize: 5, smooth: false,
      lineStyle: { width: 2, color: '#2a78d6' },
      itemStyle: { color: p => (badNow && p.dataIndex === data.length - 1) ? '#d03b3b' : '#2a78d6' },
      markLine: { silent: true, symbol: 'none', data: marks },
      markArea: { silent: true, data: areas }
    }]
  }
})
const chartNote = computed(() => {
  const c = ci(); const U = boxSnap.value.volts; const I = sel.value.st.amps; const on = sel.value.st.onNow
  if (!cur.value.b.installed || cur.value.b.comm) return { t: '数据不可用（未安装/通信中断），电气判定暂停', cls: 'd-bad' }
  if (isTest()) return { t: '测试通道（假），不参与规则判定', cls: 'd-mut' }
  if (on && I < TH.openA) return { t: '当前电流 ' + I.toFixed(2) + 'A ≈ 0，低于健康基准 ' + ((1 - I / (c.kw * 1000 / 220 * 1.05)) * 100).toFixed(0) + '%，疑似开路', cls: 'd-bad' }
  if (!on && I > TH.stuckA) return { t: '非亮灯窗口 · 残留电流 ' + I.toFixed(2) + 'A（阈值 ' + TH.stuckA + 'A），疑似触点粘连/漏电', cls: 'd-bad' }
  if (on) {
    const pf = Math.min(0.97, 0.92 + ((c.i * 7 + c.m) % 8) / 100)
    const P = U * I * pf / 1000
    const dev = (c.kw - P) / c.kw * 100
    return { t: dev > 10 ? '当前功率较健康基准低 ' + dev.toFixed(1) + '%，超出 ±10% 健康区间' : '当前 ' + P.toFixed(2) + ' kW，处于健康基准 ±10% 区间', cls: dev > 10 ? 'd-bad' : 'd-ok' }
  }
  return { t: '非亮灯窗口 · 回路关断，漏流 ' + I.toFixed(2) + 'A 在阈内', cls: 'd-mut' }
})

/* ---------- 推理链 ---------- */
const chain = computed(() => {
  const b = cur.value.b; const c = ci(); const U = boxSnap.value.volts; const st = sel.value.st
  if (!b.installed) return ['台账未安装', '移出判定范围']
  if (b.comm) return ['通信中断 ' + b.comm, '数据冻结', '暂停电气判定', '采集故障']
  const hasR3 = ciAlarmsOf(c).some(a => a.code === 'R3')
  const s = ['数据正常', '电压 ' + U + 'V ' + (hasR3 ? '越限' : '正常')]
  if (isTest()) return s.concat(['测试通道（假）', '不参与判定'])
  if (st.onNow) {
    s.push('合闸 · 亮灯窗口内')
    if (st.amps < TH.openA) return s.concat(['电流 ' + st.amps + 'A ≈ 0', '排除过载', '开路·灯具失效'])
    if (st.amps > TH.overA) return s.concat(['电流 ' + st.amps + 'A 超 ' + TH.overA + 'A', '过载'])
    return s.concat(['电流 ' + st.amps + 'A 在健康区间', '运行健康'])
  }
  s.push(c.on ? '分闸 · 非亮灯窗口' : '台账停用 · 分闸')
  if (st.amps > TH.stuckA) return s.concat(['残留电流 ' + st.amps + 'A > ' + TH.stuckA + 'A', '排除正常漏流', '触点粘连·漏电'])
  return s.concat(['漏流 ' + st.amps + 'A ≤ ' + TH.stuckA + 'A', '正常关断'])
})

/* ---------- 命中问题 / 专家结论 / 处置建议 ---------- */
const issues = computed(() => {
  const items = []
  const b = cur.value.b; const z = cur.value.z; const c = ci()
  const U = boxSnap.value.volts; const st = sel.value.st
  alarms.value.forEach(a => {
    if (a.bid !== b.bid || a.zid !== z.zid) return
    if (!(a.ci === c.i || a.ci === 0)) return
    if (a.level === 'note') { if (a.ci === c.i) items.push({ n: '台账提示', st: 'info', d: a.msg }); return }
    const m = KB.find(k => k.id === alarmModelCode(a))
    items.push({ n: m ? m.name : a.code, st: a.level === 'alarm' ? 'hit' : 'whit', d: a.msg })
  })
  if (b.installed && !b.comm && !c.fake) {
    items.push({ n: '回路失电', st: 'excl', d: '电压 ' + U + 'V 正常，数据持续更新' })
    if (st.onNow && st.amps >= TH.openA) items.push({ n: '开路·灯具失效', st: 'excl', d: '合闸电流 ' + st.amps + 'A 正常' })
    if (st.amps <= TH.overA) items.push({ n: '过载', st: 'excl', d: '电流 ' + st.amps + 'A 远低于额定 50A' })
    if (!st.onNow && st.amps <= TH.stuckA) items.push({ n: '触点粘连·漏电', st: 'excl', d: '分闸漏流 ' + st.amps + 'A 在阈内' })
  }
  const order = { hit: 0, whit: 1, info: 2, excl: 3 }
  items.sort((x, y) => order[x.st] - order[y.st])
  if (!items.some(i => i.st === 'hit' || i.st === 'whit')) items.unshift({ n: '运行健康', st: 'hit', d: '关键参数处于健康区间' })
  return items
})
const hitCount = computed(() => issues.value.filter(i => i.st === 'hit' || i.st === 'whit').length)
const ISTXT = { hit: '命中', whit: '预警命中', info: '提示', excl: '排除' }

const concl = computed(() => {
  const b = cur.value.b; const c = ci(); const U = boxSnap.value.volts; const I = sel.value.st.amps
  let code = 'ok'
  const primary = issues.value.find(i => i.st === 'hit')
  if (primary) {
    const m = KB.find(k => k.name === primary.n)
    code = m ? m.id : 'ok'
  }
  if (b.comm) code = 'R5C'
  if (isTest()) code = 'test'
  if (!b.installed) code = 'R5M'
  const info = DIAG_INFO[code] || DIAG_INFO.ok
  const impact = {
    R1: '整回路 ' + c.kw + ' kW 未点亮',
    R2: '残留 ' + I + 'A ≈ ' + Math.round(U * I) + 'W',
    R3: '电压 ' + U + 'V 超限',
    R4: '电流 ' + I + 'A 超 ' + TH.overA + 'A',
    R5C: '全箱 ' + (b.circuits || []).length + ' 回路失监视',
    R5M: '能耗统计口径受影响',
    ok: '—', test: '—'
  }[code] || '—'
  return {
    code, info, impact,
    conf: info.conf == null ? '—' : info.conf + '%',
    locNote: code === 'R5C' ? '定位到箱子 / 通信链路级。' : '当前仅有回路级电流与箱级电压，无支路/单灯反馈，无法定位具体灯具。'
  }
})

/* ---------- 全园报警（点击跳转） ---------- */
const allAl = computed(() => alarms.value.filter(a => a.level !== 'note').slice(0, 8))
function jumpTo (a) {
  for (let i = 0; i < LD.parcels.length; i++) {
    const p = LD.parcels[i]
    for (const z of p.zones) {
      const b = (z.boxes as any[]).find((x: any) => x.bid === a.bid && z.zid === a.zid)
      if (b) { SEL.p = i; SEL.z = z.zid; SEL.b = b.bid; DG.ci = a.ci || null; DG.sub = 'live'; return }
    }
  }
}
const chips = [
  { f: 'all', n: '全部' }, { f: 'crit', n: '报警' }, { f: 'warn', n: '预警' }, { f: 'off', n: '离线' }
]
const win = computed(() => zoneWinOf(cur.value.p.name, cur.value.z.zid))
</script>

<template>
  <div class="tabdiag">
    <!-- KPI 汇总条（点击筛选） -->
    <div class="kpis" style="flex-shrink:0">
      <button v-for="k in kpis" :key="k.t" class="kpi" :class="{ clickable: !!k.f, on: k.f && DG.filter === k.f }"
        :style="k.f ? '' : 'cursor:default'" @click="k.f && (DG.filter = k.f)">
        <div class="t">{{ k.t }}</div><div class="v num">{{ k.v }}</div><span class="s">{{ k.s }}</span>
      </button>
    </div>

    <!-- 工具栏 -->
    <div class="dg-toolbar">
      <div class="seg">
        <button :class="{ on: DG.sub === 'live' }">实时诊断</button>
        <button :class="{ on: DG.sub === 'kb' }" @click="DG.sub = 'kb'">规则与知识库</button>
      </div>
      <label class="dg-search">🔍<input v-model="DG.search" type="search" placeholder="搜索箱子 / 位置 / 地块"></label>
      <div>
        <button v-for="c in chips" :key="c.f" class="chip" :class="{ on: DG.filter === c.f }" style="margin-right:6px"
          @click="DG.filter = c.f">{{ c.n }}</button>
      </div>
      <span v-if="DG.codeFilter" class="codefilter">规则 {{ DG.codeFilter }} 命中筛选 · {{ cfCount }} 条
        <button title="清除" @click="DG.codeFilter = null">✕</button></span>
      <div class="tspacer"></div>
      <button class="ghostbtn" @click="showTh = !showTh">诊断阈值…</button>
      <span v-if="showTh" class="throw">
        <label>开路判定(A)<input type="number" step="0.1" v-model.number="TH.openA"></label>
        <label>残留判定(A)<input type="number" step="0.1" v-model.number="TH.stuckA"></label>
        <label>电压偏差(%)<input type="number" step="1" v-model.number="TH.voltPct"></label>
        <label>过载判定(A)<input type="number" step="1" v-model.number="TH.overA"></label>
      </span>
    </div>

    <div class="dg-grid">
      <!-- 左：设备树 -->
      <div class="dg-col" style="flex:0 0 206px">
        <div class="card dg-fill dg-scroll">
          <h3>设备树 <span class="subh">{{ tree.reduce((s, p) => s + p.zones.reduce((s2, z) => s2 + z.boxes.length, 0), 0) }} 箱</span></h3>
          <div class="tree">
            <template v-for="tp in tree" :key="tp.p.name">
              <div class="pl">{{ tp.p.name }}</div>
              <template v-for="tz in tp.zones" :key="tz.z.zid">
                <div class="zn">{{ tz.z.name }} <span style="color:#898781">{{ tz.z.zid }}</span></div>
                <div v-for="o in tz.boxes" :key="o.b.bid" class="treeline"
                  :class="{ on: SEL.b === o.b.bid && SEL.z === tz.z.zid }"
                  @click="selectBox(tp.pi, tz.z.zid, o.b.bid)">
                  <span class="dot" :style="{ background: DOT[o.st] }"></span>
                  <span>{{ o.b.bid }}<template v-if="o.b.virtual"> <span style="color:#898781">(虚拟)</span></template></span>
                  <span v-if="o.nAl" class="tcount">{{ o.nAl }}</span>
                  <span v-else-if="o.st === 'off'" class="toff">离线</span>
                </div>
              </template>
            </template>
            <div v-if="!tree.length" class="hint" style="padding:16px">没有符合条件的箱子</div>
          </div>
        </div>
      </div>

      <!-- 中左：箱信息 + 回路列表 -->
      <div class="dg-col" style="flex:0 0 198px">
        <div class="card dg-fill dg-scroll">
          <h3>箱子 {{ cur.b.bid }}{{ cur.b.virtual ? '（虚拟）' : '' }}</h3>
          <div class="boxinfo">
            <span class="bl">位置</span><span class="bv">{{ boxInfo.loc }}</span>
            <span class="bl">电压</span><span class="bv num">{{ boxInfo.volts }}</span>
            <span class="bl">当前功率</span><span class="bv num">{{ boxInfo.pw }}</span>
            <span class="bl">今日能耗</span><span class="bv num">{{ boxInfo.today }}</span>
            <span class="bl">通信</span><span class="bv">
              <span v-if="boxInfo.comm" class="badge b-crit">中断</span><span v-else class="badge b-ok">正常</span></span>
            <span class="bl">计量</span><span class="bv">
              <span v-if="boxInfo.meas" class="badge b-warn">无法计量</span><span v-else style="color:#52514e">正常</span></span>
          </div>
          <div class="subh" style="margin:0 0 6px">回路列表（点击选中）</div>
          <button v-for="x in circuits" :key="x.c.i" class="ccard"
            :class="{ on: DG.ci === x.c.i, dim: DG.codeFilter && !x.isHit, hitmark: x.isHit }"
            @click="DG.ci = x.c.i">
            <i class="sbar" :class="x.status"></i>
            <span class="cn"><strong>回路 {{ x.c.i }}</strong>
              <span>模块{{ x.c.m }}-通道{{ x.c.ch }} · {{ x.c.kw }}kW{{ x.c.fake ? ' · 测试' : '' }}</span></span>
            <em :class="'cs-' + x.status">{{ STATUS_TXT[x.status] }}<br><span class="num">{{ x.st.amps.toFixed(2) }}A</span></em>
          </button>
        </div>
      </div>

      <!-- 中右：回路详情 -->
      <div class="dg-col" style="flex:1;min-width:470px">
        <div class="card dg-fill dg-scroll">
          <div class="chead">
            <div>
              <div class="titleline">
                <span class="badge" :class="STATUS_BADGE[sel.status]">{{ STATUS_TXT[sel.status] }}</span>
                <h2>{{ cur.b.bid }} · 回路 {{ ci().i }}</h2>
                <span class="subh">模块{{ ci().m }}-通道{{ ci().ch }}</span>
              </div>
              <div class="meta">{{ cur.p.name }} / {{ cur.z.name }} · 装机 {{ ci().kw }} kW · 额定 50 A · 亮灯 {{ fmtMin(win.on) }}–{{ fmtMin(win.off) }}{{ cur.b.virtual ? ' · 虚拟箱' : '' }}</div>
            </div>
            <div class="hscore"><span>综合健康度</span><strong class="num" :style="{ color: healthCol }">{{ health == null ? '—' : health }}</strong></div>
          </div>

          <div class="metgrid">
            <div v-for="m in mets" :key="m.l" class="metcard">
              <div class="l">{{ m.l }}</div>
              <div class="v num">{{ m.v }} <small>{{ m.u }}</small></div>
              <div class="d" :class="m.cls">{{ m.d }}</div>
            </div>
          </div>

          <div class="section-head">
            <div><h3 style="margin:0">实时运行与健康基准</h3><span class="subh">最近 30 分钟 · 每拍刷新 · 与规则引擎同源</span></div>
            <div class="seg">
              <button :class="{ on: DG.metric === 'power' }" @click="DG.metric = 'power'">有功功率</button>
              <button :class="{ on: DG.metric === 'amps' }" @click="DG.metric = 'amps'">电流</button>
            </div>
          </div>
          <EChart :option="chartOpt" height="200px"/>
          <div class="chart-legend">
            <span><i class="lg-dot" style="background:#2a78d6"></i>实际值</span>
            <span><i class="lg-dot" style="background:#2E8B57"></i>健康基准</span>
            <span><i class="lg-dot" style="background:rgba(46,139,87,.25)"></i>±10% 健康区间</span>
            <strong :class="chartNote.cls">{{ chartNote.t }}</strong>
          </div>

          <div class="chain">
            <span class="lab">⚙ 当前推理链</span>
            <template v-for="(s, i) in chain" :key="i">
              <i class="arr">→</i><span class="step" :class="{ final: i === chain.length - 1 }">{{ s }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- 右：命中问题 / 专家结论 / 处置建议 / 全园报警 -->
      <div class="dg-col" style="flex:0 0 304px">
        <div class="dg-colwrap">
          <div class="card">
            <h3>命中问题 <span class="icount">{{ hitCount }}</span></h3>
            <div class="subh" style="margin:-4px 0 8px">实时规则判定结果</div>
            <div v-for="(it, i) in issues" :key="i" class="issue" :class="it.st === 'hit' ? '' : it.st">
              <div class="ih"><b>{{ it.n }}</b><span class="ist" :class="it.st">{{ ISTXT[it.st] }}</span></div>
              <p>{{ it.d }}</p>
            </div>
          </div>
          <div class="card concl">
            <div class="cf"><h3 style="margin:0">专家结论</h3><span class="conf num">{{ concl.conf }}</span></div>
            <h4>{{ concl.info.name }}</h4>
            <div class="ctext">{{ concl.info.text }}</div>
            <div class="cgrid">
              <div><div class="cl">影响估算</div><div class="cv">{{ concl.impact }}</div></div>
              <div><div class="cl">定位等级</div><div class="cv">回路级</div></div>
            </div>
            <div class="cnote">定位边界：{{ concl.locNote }}</div>
          </div>
          <div class="card">
            <h3>处置建议</h3>
            <ol class="advice"><li v-for="(a, i) in concl.info.advice" :key="i">{{ a }}</li></ol>
          </div>
          <div class="card">
            <h3>全园报警（最新 8 条 · 点击跳转）</h3>
            <table class="tbl">
              <tr><th>级别</th><th>对象</th><th>信息</th></tr>
              <tr v-for="(a, i) in allAl" :key="i" style="cursor:pointer"
                :style="a.bid === cur.b.bid ? '' : 'opacity:.6'" @click="jumpTo(a)">
                <td><span class="badge" :class="a.level === 'alarm' ? 'b-crit' : 'b-warn'">{{ a.level === 'alarm' ? '报警' : '预警' }}</span></td>
                <td>{{ a.bid }}{{ a.ci ? '#' + a.ci : '' }}</td>
                <td>{{ a.msg }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
