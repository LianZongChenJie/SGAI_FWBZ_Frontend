/* 泛光照明 mock 引擎（纯函数、固定种子、确定性，与旧原型 sim.js 同源）。
 * 亮灯日程常量与 build_lighting.py 同名同值：19:10 亮灯 / 22:40 熄灯。 */
export const SIM_SEED = 20260812
export const SCHED = { onH: 19, onM: 10, offH: 22, offM: 40 }

export function mulberry32 (a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    var t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/* 各区域亮灯窗口（分钟值），对 SCHED 做 ±8 分钟确定性抖动，种子=SIM_SEED+zoneIdx*97。 */
export function zoneWindow (zi) {
  var r = mulberry32(SIM_SEED + zi * 97)
  var dOn = Math.floor(r() * 17) - 8; var dOff = Math.floor(r() * 17) - 8
  return { on: SCHED.onH * 60 + SCHED.onM + dOn, off: SCHED.offH * 60 + SCHED.offM + dOff }
}

/* 某回路在某分钟是否点亮：fake 恒不亮；sim_open 恒亮（故障常亮）；否则 c.on 且在窗口内。 */
export function circuitOnAt (c, win, minute) {
  if (c.fake) return false
  if (c.sim_open) return true
  if (!c.on) return false
  return minute >= win.on && minute < win.off
}

function _eachCircuit (ld, fn) {
  var zi = 0
  ld.parcels.forEach(function (p) { p.zones.forEach(function (z) {
    var win = zoneWindow(zi++)
    z.boxes.forEach(function (b) { b.circuits.forEach(function (c) { fn(p, z, b, c, win) }) })
  }) })
}

/* 24h 逐时功率：每小时取 h*60+30 分钟判定，park=全园，parcels=分地块。 */
export function hourlySeries (ld) {
  var park = new Array(24).fill(0); var byP = {}
  ld.parcels.forEach(function (p) { byP[p.name] = new Array(24).fill(0) })
  for (var h = 0; h < 24; h++) {
    _eachCircuit(ld, function (p, z, b, c, win) {
      if (circuitOnAt(c, win, h * 60 + 30)) { park[h] += c.kw; byP[p.name][h] += c.kw }
    })
  }
  return { park: park, parcels: byP }
}

/* 实时快照：箱电压 + 回路电流/合分闸。确定性，同参同果。 */
export function demoSnapshot (ld, minute, tick) {
  var out = { boxes: {}, circuits: {} }
  _eachCircuit(ld, function (p, z, b, c, win) {
    var bk = p.name + '|' + z.zid + '|' + b.bid; var ck = bk + '|' + c.i
    if (!out.boxes[bk]) {
      var r0 = mulberry32(SIM_SEED + bk.length * 131 + tick * 7)
      var v = b.sim_overvolt ? 246 + (r0() - 0.5) : 219.5 + 1.2 * Math.sin(tick / 7 + bk.length) + (r0() - 0.5)
      out.boxes[bk] = { volts: Math.round(v * 10) / 10 }
    }
    var onNow = circuitOnAt(c, win, minute)
    var r = mulberry32(SIM_SEED + c.i * 31 + b.bid.length * 17 + tick * 7)
    var amps
    if (c.sim_open) amps = 0.02 /* 开路：近零电流 */
    else if (!onNow && c.sim_stuck) amps = 0.55 + r() * 0.1 /* 触点粘连：分闸仍有流 */
    else if (!onNow) amps = r() * 0.02 /* 正常分闸：漏流 */
    else { var v2 = out.boxes[bk].volts; amps = c.kw * 1000 / v2 * 1.05 * (0.97 + r() * 0.06) } /* 合闸负载电流 */
    out.circuits[ck] = { amps: Math.round(amps * 100) / 100, onNow: onNow }
  })
  return out
}
