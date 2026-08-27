const point = (key, label, unit = '', type = 'number') => ({ key, label, unit, type })

export const BUILDING_AUTOMATION_VIEWS = [
  { id: 'sump', title: '集水坑双泵', subtitle: '液位与排水泵监控', asset: 'sump-pump-station-v2-2_5d.png', type: 'sump' },
  { id: 'ahu-summary', title: 'AHU机组总览', subtitle: 'AHU 1 / AHU 2 运行总览', asset: 'ahu-cutaway-2_5d.png', type: 'summary' },
  { id: 'fan-box', title: '送排风机箱', subtitle: '密闭阀与离心风机监控', asset: 'fan-box-v2-2_5d.png', type: 'fan' },
  { id: 'ahu-1', title: 'AHU-1 新风机组', subtitle: '单风道过滤、盘管与送风', asset: 'ahu-cutaway-2_5d.png', type: 'ahu' },
  { id: 'ahu-2', title: 'AHU-2 回风机组', subtitle: '新回风混合与空气品质', asset: 'ahu-cutaway-2_5d.png', type: 'ahu' },
  { id: 'ahu-3', title: 'AHU-3 排风联动机组', subtitle: '新回风、排风与变频控制', asset: 'ahu-cutaway-2_5d.png', type: 'ahu-exhaust' },
  { id: 'fcu', title: '风机盘管', subtitle: '盘管阀门与风速控制', asset: 'fan-coil-v2-2_5d.png', type: 'fcu' },
  { id: 'ahu-4', title: 'AHU-4 转轮新风机组', subtitle: '转轮热回收与送排风联动', asset: 'ahu-cutaway-2_5d.png', type: 'ahu-rotary' }
]

const points = []
const defaults = {}
function add(key, label, unit, value, type = typeof value === 'boolean' ? 'boolean' : 'number') {
  points.push(point(key, label, unit, type)); defaults[key] = value
}

add('ba.sump.level', '集水坑液位', '%', 62)
add('ba.sump.levelAlarm', '液位报警', '', false)
for (const no of [1, 2]) {
  add(`ba.sump.pump${no}.running`, `${no}#排水泵运行`, '', no === 1)
  add(`ba.sump.pump${no}.fault`, `${no}#排水泵故障`, '', false)
  add(`ba.sump.pump${no}.auto`, `${no}#排水泵手自动`, '', true)
  add(`ba.sump.pump${no}.current`, `${no}#排水泵电流`, 'A', no === 1 ? 8.6 : 0)
}

for (const id of ['ahu1', 'ahu2', 'ahu3', 'ahu4']) {
  const n = Number(id.slice(-1))
  add(`ba.${id}.running`, `${id.toUpperCase()}运行`, '', n !== 2)
  add(`ba.${id}.fault`, `${id.toUpperCase()}故障`, '', false)
  add(`ba.${id}.auto`, `${id.toUpperCase()}手自动`, '', true)
  add(`ba.${id}.fanEnable`, `${id.toUpperCase()}风机启停`, '', n !== 2)
  add(`ba.${id}.fanFrequency`, `${id.toUpperCase()}风机频率`, 'Hz', n === 2 ? 0 : 44 + n)
  add(`ba.${id}.fanCommandFrequency`, `${id.toUpperCase()}风机频率调节`, 'Hz', n === 2 ? 0 : 45)
  add(`ba.${id}.fanDp`, `${id.toUpperCase()}送风机压差`, 'Pa', n === 2 ? 0 : 186 + n * 8)
  add(`ba.${id}.valve`, `${id.toUpperCase()}水阀反馈`, '%', 42 + n * 9)
  add(`ba.${id}.freshDamper`, `${id.toUpperCase()}新风阀`, '%', 35 + n * 8)
  add(`ba.${id}.returnDamper`, `${id.toUpperCase()}回风阀`, '%', 80 - n * 5)
  add(`ba.${id}.supplyTemp`, `${id.toUpperCase()}送风温度`, '℃', 17.8 + n * .4)
  add(`ba.${id}.returnTemp`, `${id.toUpperCase()}回风温度`, '℃', 22.1 + n * .3)
  add(`ba.${id}.freshTemp`, `${id.toUpperCase()}新风温度`, '℃', 29.5)
  add(`ba.${id}.supplyHumidity`, `${id.toUpperCase()}送风湿度`, '%RH', 66 - n)
  add(`ba.${id}.returnHumidity`, `${id.toUpperCase()}回风湿度`, '%RH', 68 + n)
  add(`ba.${id}.co2`, `${id.toUpperCase()}回风CO₂`, 'ppm', 430 + n * 18)
  add(`ba.${id}.pm25`, `${id.toUpperCase()}回风PM2.5`, 'μg/m³', 18 + n * 3)
  add(`ba.${id}.freshHumidity`, `${id.toUpperCase()}新风湿度`, '%RH', 58 + n)
  add(`ba.${id}.freshFlow`, `${id.toUpperCase()}新风流量`, 'm/s', 5.8 + n * .2)
  add(`ba.${id}.returnFlow`, `${id.toUpperCase()}回风流量`, 'm/s', 6.4 + n * .2)
  add(`ba.${id}.supplyWaterTemp`, `${id.toUpperCase()}供水温度`, '℃', 9.3 + n * .1)
  add(`ba.${id}.returnWaterTemp`, `${id.toUpperCase()}回水温度`, '℃', 12 + n * .2)
  add(`ba.${id}.humidifier`, `${id.toUpperCase()}加湿控制`, '', false)
  add(`ba.${id}.filter1Alarm`, `${id.toUpperCase()}初效报警`, '', false)
  add(`ba.${id}.filter2Alarm`, `${id.toUpperCase()}中效报警`, '', false)
  add(`ba.${id}.frostAlarm`, `${id.toUpperCase()}防冻报警`, '', false)
}

for (const id of ['ahu3', 'ahu4']) {
  add(`ba.${id}.exhaustRunning`, `${id.toUpperCase()}排风机运行`, '', true)
  add(`ba.${id}.exhaustControl`, `${id.toUpperCase()}排风机控制`, '', true)
  add(`ba.${id}.exhaustAuto`, `${id.toUpperCase()}排风机手自动`, '', true)
  add(`ba.${id}.exhaustFault`, `${id.toUpperCase()}排风机故障`, '', false)
  add(`ba.${id}.exhaustFrequency`, `${id.toUpperCase()}排风机频率反馈`, 'Hz', 30)
  add(`ba.${id}.exhaustCommandFrequency`, `${id.toUpperCase()}排风机频率调节`, 'Hz', 30)
  add(`ba.${id}.exhaustDamper`, `${id.toUpperCase()}排风密闭阀`, '%', 100)
  add(`ba.${id}.exhaustTemp`, `${id.toUpperCase()}排风温度`, '℃', 19.8)
  add(`ba.${id}.exhaustHumidity`, `${id.toUpperCase()}排风湿度`, '%RH', 51)
}
add('ba.ahu4.rotaryRunning', 'AHU4转轮状态', '', true)
add('ba.ahu4.rotaryControl', 'AHU4转轮控制', '', true)
add('ba.ahu4.rotarySpeed', 'AHU4转轮频率', 'Hz', 36)
for (const id of ['ahu1','ahu2','ahu3','ahu4']) {
  add(`ba.${id}.systemEnable`, `${id.toUpperCase()}系统启停`, '', true)
  add(`ba.${id}.season`, `${id.toUpperCase()}季节模式`, '', '夏季', 'string')
  add(`ba.${id}.supplyTempSetpoint`, `${id.toUpperCase()}送风温度设定`, '℃', 21)
  add(`ba.${id}.returnTempSetpoint`, `${id.toUpperCase()}回风温度设定`, '℃', 24)
  add(`ba.${id}.co2Setpoint`, `${id.toUpperCase()}CO₂设定`, 'ppm', 800)
}

add('ba.fanbox.running', '风机运行', '', true)
add('ba.fanbox.fault', '风机故障', '', false)
add('ba.fanbox.auto', '风机手自动', '', true)
add('ba.fanbox.damperClosed', '密闭阀关闭', '', false)
add('ba.fanbox.frequency', '风机频率', 'Hz', 38)
add('ba.fcu.running', '风机盘管运行', '', true)
add('ba.fcu.valve', '风机盘管水阀', '%', 64)
add('ba.fcu.roomTemp', '室内温度', '℃', 22.6)
add('ba.fcu.setpoint', '温度设定', '℃', 22)
add('ba.fcu.speed', '风机档位', '', 3)
add('ba.fcu.onOff', '风机盘管开关机', '', true)
add('ba.fcu.valveClosed', '风机盘管水阀状态', '', false)
add('ba.fcu.mode', '风机盘管模式', '', '制冷', 'string')
add('ba.fcu.keyboardLock', '风机盘管键盘锁', '', false)

export const BUILDING_AUTOMATION_POINTS = points
export const BUILDING_AUTOMATION_DEFAULTS = defaults
