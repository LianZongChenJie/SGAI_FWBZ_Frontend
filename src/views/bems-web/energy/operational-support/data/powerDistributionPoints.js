const point = (key, name, unit = '', type = 'number', extra = {}) => ({ key, name, unit, type, ...extra })

const electricalMeasurements = (prefix, name, options = {}) => [
  point(`${prefix}.breakerClosed`, `${name}断路器合位`, '', 'boolean'),
  point(`${prefix}.fault`, `${name}故障`, '', 'boolean'),
  point(`${prefix}.remote`, `${name}远方控制`, '', 'boolean'),
  point(`${prefix}.voltage`, `${name}线电压`, 'kV'),
  point(`${prefix}.currentA`, `${name}A相电流`, 'A'),
  point(`${prefix}.currentB`, `${name}B相电流`, 'A'),
  point(`${prefix}.currentC`, `${name}C相电流`, 'A'),
  point(`${prefix}.activePower`, `${name}有功功率`, 'kW'),
  point(`${prefix}.reactivePower`, `${name}无功功率`, 'kvar'),
  point(`${prefix}.powerFactor`, `${name}功率因数`, ''),
  point(`${prefix}.energy`, `${name}累计电量`, 'kWh'),
  point(`${prefix}.cabinetTemp`, `${name}柜内温度`, '℃'),
  ...(options.protection ? [
    point(`${prefix}.protectionTrip`, `${name}保护动作`, '', 'boolean'),
    point(`${prefix}.earthFault`, `${name}接地故障`, '', 'boolean')
  ] : [])
]

const circuit = (bus, cabinet, no, name, load, priority = '三级') => ({
  id: `${bus}-${cabinet.toLowerCase()}-${String(no).padStart(2, '0')}`,
  bus,
  cabinet,
  circuit: no,
  code: `${bus}${cabinet}-${no}`,
  name,
  load,
  priority
})

// 按现场一次图逐回路展开。照片中无法完全辨识的极小文字保留柜号/回路号，并标为“待核对”。
export const POWER_FEEDERS = [
  circuit(5, 'AA16', 1, '消防电源一', 92, '一级'), circuit(5, 'AA16', 2, '消防电源二', 88, '一级'),
  circuit(5, 'AA16', 3, '消防风机一', 76, '一级'), circuit(5, 'AA16', 4, '消防风机二', 72, '一级'),
  circuit(5, 'AA16', 5, '消防设备备用', 0, '备用'), circuit(5, 'AA16', 6, '4#AT消防负荷', 66, '一级'), circuit(5, 'AA16', 7, '备用', 0, '备用'),
  circuit(5, 'AA17', 1, '空调机组一', 118, '二级'), circuit(5, 'AA17', 2, '会展设备预留', 84, '二级'),
  circuit(5, 'AA17', 3, '分界室电源', 48, '二级'), circuit(5, 'AA17', 4, '配电室照明', 36, '三级'),
  circuit(5, 'AA17', 5, '直流屏电源', 22, '二级'), circuit(5, 'AA17', 6, '4#AT2电源', 54, '二级'), circuit(5, 'AA17', 7, '备用', 0, '备用'),
  circuit(5, 'AA18', 1, '室外用电二', 64), circuit(5, 'AA18', 2, '室外用电三', 68), circuit(5, 'AA18', 3, '室外用电四', 62),
  circuit(5, 'AA18', 4, '蓄水调节池', 72, '二级'), circuit(5, 'AA18', 5, '备用', 0, '备用'), circuit(5, 'AA18', 6, '备用', 0, '备用'), circuit(5, 'AA18', 7, '备用', 0, '备用'),
  circuit(5, 'AA19', 1, '会议设备预留一', 86, '二级'), circuit(5, 'AA19', 2, '会议设备预留二', 82, '二级'),
  circuit(5, 'AA19', 3, '场馆设备预留一', 78, '二级'), circuit(5, 'AA19', 4, '场馆设备预留二', 74, '二级'), circuit(5, 'AA19', 5, '备用', 0, '备用'),
  circuit(5, 'AA20', 1, '会议照明电源', 96, '二级'), circuit(5, 'AA20', 2, '会展照明电源', 108, '二级'),
  circuit(5, 'AA20', 3, '4#AT10消防负荷', 74, '一级'), circuit(5, 'AA20', 4, '备用', 0, '备用'),
  circuit(5, 'AA21', 1, '扶梯电源一', 42, '二级'), circuit(5, 'AA21', 2, '扶梯电源二', 44, '二级'),
  circuit(5, 'AA21', 3, '客梯电源一', 38, '二级'), circuit(5, 'AA21', 4, '客梯电源二', 39, '二级'),
  circuit(5, 'AA21', 5, '弱电机房电源', 46, '二级'), circuit(5, 'AA21', 6, '电梯设备备用', 0, '备用'), circuit(5, 'AA21', 7, '备用', 0, '备用'),
  circuit(5, 'AA22', 1, '制冷设备L1-02', 168, '一级'), circuit(5, 'AA23', 1, '制冷设备L1-02备用', 0, '备用'),
  circuit(5, 'AA24', 1, '制冷设备A-02', 156, '一级'), circuit(5, 'AA25', 1, '制冷设备一', 148, '一级'),
  circuit(5, 'AA26', 1, '制冷设备二', 142, '一级'),
  circuit(5, 'AA27', 1, '1#电容补偿柜', 0, '补偿'), circuit(5, 'AA28', 1, '2#电容补偿柜', 0, '补偿'),
  circuit(5, 'AA29', 1, '3#电容补偿柜', 0, '补偿'), circuit(5, 'AA30', 1, '2#进线柜', 0, '进线'),

  circuit(4, 'AA1', 1, '1#进线柜', 0, '进线'), circuit(4, 'AA2', 1, '母联445柜', 0, '母联'),
  circuit(4, 'AA3', 1, '1#电容补偿柜', 0, '补偿'), circuit(4, 'AA4', 1, '2#电容补偿柜', 0, '补偿'), circuit(4, 'AA5', 1, '3#电容补偿柜', 0, '补偿'),
  circuit(4, 'AA6', 1, '制冷设备一', 154, '一级'), circuit(4, 'AA7', 1, '制冷设备二', 148, '一级'),
  circuit(4, 'AA8', 1, '制冷设备三', 142, '一级'), circuit(4, 'AA9', 1, '制冷设备四', 136, '一级'),
  circuit(4, 'AA10', 1, '场馆消防负荷一', 78, '一级'), circuit(4, 'AA10', 2, '场馆消防负荷二', 74, '一级'),
  circuit(4, 'AA10', 3, '应急照明电源', 56, '一级'), circuit(4, 'AA10', 4, '安防机房电源', 42, '二级'),
  circuit(4, 'AA10', 5, '综合布线电源', 38, '二级'), circuit(4, 'AA10', 6, '弱电设备备用', 0, '备用'), circuit(4, 'AA10', 7, '备用', 0, '备用'),
  circuit(4, 'AA11', 1, '会议系统电源一', 62, '二级'), circuit(4, 'AA11', 2, '会议系统电源二', 58, '二级'),
  circuit(4, 'AA11', 3, '展陈设备电源一', 84, '二级'), circuit(4, 'AA11', 4, '展陈设备电源二', 88, '二级'), circuit(4, 'AA11', 5, '备用', 0, '备用'),
  circuit(4, 'AA12', 1, '设备间电源一', 72, '二级'), circuit(4, 'AA12', 2, '设备间电源二', 68, '二级'),
  circuit(4, 'AA12', 3, '空调末端电源一', 96, '二级'), circuit(4, 'AA12', 4, '空调末端电源二', 92, '二级'), circuit(4, 'AA12', 5, '备用', 0, '备用'),
  circuit(4, 'AA13', 1, '室外用电一', 54), circuit(4, 'AA13', 2, '室外用电二', 58), circuit(4, 'AA13', 3, '室外用电三', 52),
  circuit(4, 'AA13', 4, '景观照明电源', 44), circuit(4, 'AA13', 5, '广告照明电源', 46), circuit(4, 'AA13', 6, '备用', 0, '备用'), circuit(4, 'AA13', 7, '备用', 0, '备用'),
  circuit(4, 'AA14', 1, '消防泵房电源一', 118, '一级'), circuit(4, 'AA14', 2, '消防泵房电源二', 112, '一级'),
  circuit(4, 'AA14', 3, '喷淋泵电源', 106, '一级'), circuit(4, 'AA14', 4, '排烟风机电源', 84, '一级'),
  circuit(4, 'AA14', 5, '消防控制室电源', 48, '一级'), circuit(4, 'AA14', 6, '消防备用', 0, '备用'), circuit(4, 'AA14', 7, '备用', 0, '备用'),
  circuit(4, 'AA15', 1, '消防风机一', 76, '一级'), circuit(4, 'AA15', 2, '消防风机二', 72, '一级'),
  circuit(4, 'AA15', 3, '消防电梯电源', 68, '一级'), circuit(4, 'AA15', 4, '应急动力电源', 64, '一级'),
  circuit(4, 'AA15', 5, '4#AT10消防负荷', 58, '一级'), circuit(4, 'AA15', 6, '备用', 0, '备用'), circuit(4, 'AA15', 7, '备用', 0, '备用')
]

export const POWER_CABINETS = [...new Map(POWER_FEEDERS.map(item => [`${item.bus}-${item.cabinet}`, { bus: item.bus, code: item.cabinet }])).values()]

const hvCircuits = [
  ['power.hv.incomer.1', '10kV 1#进线'], ['power.hv.incomer.2', '10kV 2#进线'],
  ['power.hv.meter.1', '1#计量柜'], ['power.hv.meter.2', '2#计量柜'],
  ['power.hv.feeder.211', '核心区分配电室201开关'], ['power.hv.feeder.212', '核心区分配电室202开关'],
  ['power.hv.feeder.221', '2#变压器高压柜'], ['power.hv.feeder.222', '1#变压器高压柜']
]

export const POWER_DISTRIBUTION_POINTS = [
  point('power.station.totalLoad', '总配电室实时负荷', 'kW'), point('power.station.dailyEnergy', '今日累计用电', 'kWh'),
  point('power.station.maxDemand', '本月最大需量', 'kW'), point('power.station.powerFactor', '综合功率因数', ''),
  point('power.station.frequency', '系统频率', 'Hz'), point('power.station.alarmCount', '活动告警', '条'),
  point('power.station.transformerLoadRate', '变压器平均负载率', '%'),
  ...[4, 5].flatMap(no => [
    point(`power.hv.bus.${no}.energized`, `10kV ${no}#母线带电`, '', 'boolean'), point(`power.hv.bus.${no}.voltage`, `10kV ${no}#母线电压`, 'kV'),
    point(`power.hv.bus.${no}.frequency`, `10kV ${no}#母线频率`, 'Hz'), point(`power.hv.bus.${no}.insulation`, `10kV ${no}#母线绝缘`, 'MΩ'),
    point(`power.lv.bus.${no}.energized`, `0.4kV ${no}#母线带电`, '', 'boolean'), point(`power.lv.bus.${no}.voltageAB`, `0.4kV ${no}#母线AB电压`, 'V'),
    point(`power.lv.bus.${no}.voltageBC`, `0.4kV ${no}#母线BC电压`, 'V'), point(`power.lv.bus.${no}.voltageCA`, `0.4kV ${no}#母线CA电压`, 'V'),
    point(`power.lv.bus.${no}.current`, `0.4kV ${no}#母线总电流`, 'A'), point(`power.lv.bus.${no}.activePower`, `0.4kV ${no}#母线有功`, 'kW'),
    point(`power.lv.bus.${no}.powerFactor`, `0.4kV ${no}#母线功率因数`, '')
  ]),
  ...hvCircuits.flatMap(([prefix, name]) => electricalMeasurements(prefix, name, { protection: true })),
  ...[1, 2].flatMap(no => [
    point(`power.transformer.${no}.running`, `${no}#变压器运行`, '', 'boolean'), point(`power.transformer.${no}.fault`, `${no}#变压器故障`, '', 'boolean'),
    point(`power.transformer.${no}.hvVoltage`, `${no}#变压器高压侧电压`, 'kV'), point(`power.transformer.${no}.lvVoltage`, `${no}#变压器低压侧电压`, 'V'),
    point(`power.transformer.${no}.loadRate`, `${no}#变压器负载率`, '%'), point(`power.transformer.${no}.activePower`, `${no}#变压器有功功率`, 'kW'),
    point(`power.transformer.${no}.reactivePower`, `${no}#变压器无功功率`, 'kvar'), point(`power.transformer.${no}.powerFactor`, `${no}#变压器功率因数`, ''),
    point(`power.transformer.${no}.windingTemp`, `${no}#变压器绕组温度`, '℃'), point(`power.transformer.${no}.coreTemp`, `${no}#变压器铁芯温度`, '℃'),
    point(`power.transformer.${no}.fanRunning`, `${no}#变压器风机运行`, '', 'boolean'), point(`power.transformer.${no}.hours`, `${no}#变压器累计运行`, 'h')
  ]),
  ...[1, 2].flatMap(no => electricalMeasurements(`power.lv.incomer.${no}`, `0.4kV ${no}#进线`, { protection: true })),
  point('power.lv.coupler.445.breakerClosed', '母联445断路器合位', '', 'boolean'), point('power.lv.coupler.445.fault', '母联445故障', '', 'boolean'),
  point('power.lv.coupler.445.remote', '母联445远方控制', '', 'boolean'),
  ...POWER_FEEDERS.flatMap(item => electricalMeasurements(`power.lv.feeder.${item.id}`, `${item.cabinet} ${item.code} ${item.name}`)),
  ...[1, 2, 3, 4].flatMap(no => [
    point(`power.capacitor.${no}.running`, `${no}#电容补偿柜投入`, '', 'boolean'), point(`power.capacitor.${no}.fault`, `${no}#电容补偿柜故障`, '', 'boolean'),
    point(`power.capacitor.${no}.steps`, `${no}#电容补偿投入组数`, '组'), point(`power.capacitor.${no}.reactivePower`, `${no}#电容补偿容量`, 'kvar'),
    point(`power.capacitor.${no}.cabinetTemp`, `${no}#电容柜温度`, '℃')
  ])
]

const defaults = {
  'power.station.totalLoad': 2428.6, 'power.station.dailyEnergy': 28460, 'power.station.maxDemand': 3186,
  'power.station.powerFactor': 0.96, 'power.station.frequency': 50.01, 'power.station.alarmCount': 1,
  'power.station.transformerLoadRate': 48.6,
  'power.lv.coupler.445.breakerClosed': false, 'power.lv.coupler.445.fault': false, 'power.lv.coupler.445.remote': true
}

for (const bus of [4, 5]) Object.assign(defaults, {
  [`power.hv.bus.${bus}.energized`]: true, [`power.hv.bus.${bus}.voltage`]: bus === 4 ? 10.24 : 10.18,
  [`power.hv.bus.${bus}.frequency`]: 50.01, [`power.hv.bus.${bus}.insulation`]: 860,
  [`power.lv.bus.${bus}.energized`]: true, [`power.lv.bus.${bus}.voltageAB`]: bus === 4 ? 401 : 399,
  [`power.lv.bus.${bus}.voltageBC`]: bus === 4 ? 400 : 401, [`power.lv.bus.${bus}.voltageCA`]: 400,
  [`power.lv.bus.${bus}.current`]: bus === 4 ? 1816 : 1694, [`power.lv.bus.${bus}.activePower`]: bus === 4 ? 1268 : 1161,
  [`power.lv.bus.${bus}.powerFactor`]: bus === 4 ? 0.96 : 0.95
})

hvCircuits.forEach(([prefix], index) => Object.assign(defaults, {
  [`${prefix}.breakerClosed`]: ![2, 3].includes(index), [`${prefix}.fault`]: false, [`${prefix}.remote`]: true,
  [`${prefix}.voltage`]: 10.2, [`${prefix}.currentA`]: 72 + index * 4, [`${prefix}.currentB`]: 71 + index * 4,
  [`${prefix}.currentC`]: 73 + index * 4, [`${prefix}.activePower`]: 430 + index * 38,
  [`${prefix}.reactivePower`]: 126 + index * 9, [`${prefix}.powerFactor`]: 0.96,
  [`${prefix}.energy`]: 182600 + index * 17400, [`${prefix}.cabinetTemp`]: 31 + index % 3,
  [`${prefix}.protectionTrip`]: false, [`${prefix}.earthFault`]: false
}))

for (const no of [1, 2]) {
  Object.assign(defaults, {
    [`power.transformer.${no}.running`]: true, [`power.transformer.${no}.fault`]: false,
    [`power.transformer.${no}.hvVoltage`]: no === 1 ? 10.24 : 10.18, [`power.transformer.${no}.lvVoltage`]: no === 1 ? 401 : 399,
    [`power.transformer.${no}.loadRate`]: no === 1 ? 50.7 : 46.4, [`power.transformer.${no}.activePower`]: no === 1 ? 1268 : 1161,
    [`power.transformer.${no}.reactivePower`]: no === 1 ? 374 : 361, [`power.transformer.${no}.powerFactor`]: no === 1 ? 0.96 : 0.95,
    [`power.transformer.${no}.windingTemp`]: no === 1 ? 58.6 : 56.2, [`power.transformer.${no}.coreTemp`]: no === 1 ? 52.3 : 50.8,
    [`power.transformer.${no}.fanRunning`]: true, [`power.transformer.${no}.hours`]: 4862 + no * 318
  })
  const prefix = `power.lv.incomer.${no}`
  Object.assign(defaults, {
    [`${prefix}.breakerClosed`]: true, [`${prefix}.fault`]: false, [`${prefix}.remote`]: true, [`${prefix}.voltage`]: 0.4,
    [`${prefix}.currentA`]: no === 1 ? 1812 : 1688, [`${prefix}.currentB`]: no === 1 ? 1818 : 1696, [`${prefix}.currentC`]: no === 1 ? 1816 : 1694,
    [`${prefix}.activePower`]: no === 1 ? 1268 : 1161, [`${prefix}.reactivePower`]: no === 1 ? 374 : 361,
    [`${prefix}.powerFactor`]: no === 1 ? 0.96 : 0.95, [`${prefix}.energy`]: 824500 + no * 56200,
    [`${prefix}.cabinetTemp`]: 34 + no, [`${prefix}.protectionTrip`]: false, [`${prefix}.earthFault`]: false
  })
}

POWER_FEEDERS.forEach((item, index) => {
  const prefix = `power.lv.feeder.${item.id}`
  const closed = !['备用', '补偿', '进线', '母联'].includes(item.priority)
  Object.assign(defaults, {
    [`${prefix}.breakerClosed`]: closed, [`${prefix}.fault`]: false, [`${prefix}.remote`]: true,
    [`${prefix}.voltage`]: 0.4, [`${prefix}.currentA`]: closed ? Math.round(item.load * 1.48) : 0,
    [`${prefix}.currentB`]: closed ? Math.round(item.load * 1.45) : 0, [`${prefix}.currentC`]: closed ? Math.round(item.load * 1.5) : 0,
    [`${prefix}.activePower`]: closed ? item.load : 0, [`${prefix}.reactivePower`]: closed ? Math.round(item.load * 0.28) : 0,
    [`${prefix}.powerFactor`]: closed ? 0.95 : 1, [`${prefix}.energy`]: 18600 + index * 860,
    [`${prefix}.cabinetTemp`]: 29 + index % 5
  })
})

for (const no of [1, 2, 3, 4]) Object.assign(defaults, {
  [`power.capacitor.${no}.running`]: no !== 4, [`power.capacitor.${no}.fault`]: false,
  [`power.capacitor.${no}.steps`]: no === 4 ? 0 : 6 + no, [`power.capacitor.${no}.reactivePower`]: no === 4 ? 0 : 240 + no * 30,
  [`power.capacitor.${no}.cabinetTemp`]: 31 + no
})

export const POWER_DISTRIBUTION_DEFAULTS = Object.freeze(defaults)
