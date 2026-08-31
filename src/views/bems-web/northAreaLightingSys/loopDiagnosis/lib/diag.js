/* 回路诊断规则引擎（纯函数，与旧原型 diag.js 同源）。
 * R1 合闸无流/开路；R2 分闸有流/粘连漏电；R3 电压越限；R4 过载；R5 静态缺陷（通信/计量/控制缺陷/未安装/测试通道）。 */
export const DEFAULT_TH = { openA: 0.5, stuckA: 0.2, voltPct: 10, overA: 45, voltNom: 220 }

export function diagnose (ld, snap, th) {
  th = th || DEFAULT_TH
  var out = []
  var lo = th.voltNom * (1 - th.voltPct / 100); var hi = th.voltNom * (1 + th.voltPct / 100)
  ld.parcels.forEach(function (p) { p.zones.forEach(function (z) { z.boxes.forEach(function (b) {
    var bk = p.name + '|' + z.zid + '|' + b.bid
    var bx = (snap && snap.boxes && snap.boxes[bk]) || { volts: 0 }
    if (!b.installed) {
      out.push({ code: 'R5', level: 'note', pname: p.name, zid: z.zid, bid: b.bid, ci: 0, msg: '箱子未安装' })
      return
    }
    if (b.comm) out.push({ code: 'R5', level: 'alarm', pname: p.name, zid: z.zid, bid: b.bid, ci: 0, msg: '通信中断（' + b.comm + '）' })
    if (b.meas) out.push({ code: 'R5', level: 'warn', pname: p.name, zid: z.zid, bid: b.bid, ci: 0, msg: '无法计量（' + b.meas + '，无电量数据）' })
    if (bx.volts && (bx.volts < lo || bx.volts > hi)) { out.push({ code: 'R3', level: 'warn', pname: p.name, zid: z.zid, bid: b.bid, ci: 0, msg: '电压越限 ' + bx.volts + 'V（允许 ' + Math.round(lo) + '~' + Math.round(hi) + 'V）' }) }
    (b.circuits || []).forEach(function (c) {
      var st = (snap && snap.circuits) ? snap.circuits[bk + '|' + c.i] : null
      var amps = st ? st.amps : (c.amps || 0); var onNow = st ? st.onNow : c.on
      ;(c.defects || []).forEach(function (d) {
        out.push({ code: 'R5', level: 'warn', pname: p.name, zid: z.zid, bid: b.bid, ci: c.i, msg: '控制缺陷：' + d })
      })
      if (c.fake) { out.push({ code: 'R5', level: 'note', pname: p.name, zid: z.zid, bid: b.bid, ci: c.i, msg: '测试通道（假）' }); return }
      if (onNow && amps < th.openA) { out.push({ code: 'R1', level: 'alarm', pname: p.name, zid: z.zid, bid: b.bid, ci: c.i, msg: '合闸无流 ' + amps + 'A，疑似开路/灯具故障' }) }
      if (!onNow && amps > th.stuckA) { out.push({ code: 'R2', level: 'alarm', pname: p.name, zid: z.zid, bid: b.bid, ci: c.i, msg: '分闸有流 ' + amps + 'A，疑似触点粘连/漏电' }) }
      if (amps > th.overA) { out.push({ code: 'R4', level: 'alarm', pname: p.name, zid: z.zid, bid: b.bid, ci: c.i, msg: '过载 ' + amps + 'A（额定50A）' }) }
    })
  }) }) })
  return out
}
