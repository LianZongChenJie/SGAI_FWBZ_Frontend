/* 通用工具：演示时钟格式化与数值修约 */
export function fmtClock (min) {
  var h = Math.floor(min / 60) % 24; var m = min % 60
  return '2026-08-12 ' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')
}
export function nowHHMM (min) { return String(Math.floor(min / 60) % 24).padStart(2, '0') + ':00' }
export function fmtMin (m) { return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') }
export function r1 (x) { return Math.round(x * 10) / 10 }
export function r2 (x) { return Math.round(x * 100) / 100 }

/* 峰平谷/电价背景色带（单轴，电价不做第二根轴）——与旧原型一致 */
export function bandAreas () {
  return [
    [{ name: '谷', xAxis: '23:00', itemStyle: { color: 'rgba(46,139,87,.10)' } }, { xAxis: '07:00' }],
    [{ name: '平', xAxis: '07:00', itemStyle: { color: 'rgba(148,163,184,.10)' } }, { xAxis: '10:00' }],
    [{ name: '尖峰', xAxis: '10:00', itemStyle: { color: 'rgba(232,131,58,.12)' } }, { xAxis: '15:00' }],
    [{ name: '平', xAxis: '15:00', itemStyle: { color: 'rgba(148,163,184,.10)' } }, { xAxis: '18:00' }],
    [{ name: '尖峰', xAxis: '18:00', itemStyle: { color: 'rgba(232,131,58,.12)' } }, { xAxis: '21:00' }],
    [{ name: '平', xAxis: '21:00', itemStyle: { color: 'rgba(148,163,184,.10)' } }, { xAxis: '23:00' }]
  ]
}
