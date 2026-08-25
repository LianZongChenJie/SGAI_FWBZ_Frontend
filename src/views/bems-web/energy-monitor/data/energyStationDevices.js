const field = (label, key, kind = 'value') => ({ label, key, kind })

const statusFields = (prefix, { frequencyKey = `${prefix}.frequency`, includeFrequency = true } = {}) => [
  field('运行状态', `${prefix}.running`, 'running'),
  field('故障状态', `${prefix}.fault`, 'fault'),
  field('控制源', `${prefix}.controlSource`, 'text'),
  field('软故障', `${prefix}.softFault`, 'fault'),
  field('控制模式', `${prefix}.controlMode`, 'mode'),
  field('强制命令', `${prefix}.forceCommand`, 'command'),
  ...(includeFrequency ? [field('强制频率', `${prefix}.forceFrequency`, 'value'), field('频率反馈', frequencyKey, 'value')] : [])
]

const distributedHallNames = { east: '东会议室', hall2: '2号馆', hall3: '3号馆' }

export const ENERGY_DEVICE_IDS = [
  ...[1, 2, 3, 4].map(no => `water.tower.${no}`),
  'water.collector', 'water.distributor', 'water.treatment.chilled', 'water.treatment.cooling', 'water.dosing',
  ...[1, 2, 3].map(no => `water.chwPump.${no}`),
  ...[1, 2, 3].map(no => `water.chiller.${no}`),
  ...[1, 2, 3].map(no => `water.cwPump.${no}`),
  'water.softener', 'water.tank', 'water.makeupPump',
  ...Array.from({ length: 12 }, (_, index) => `air.unit.${index + 1}`),
  'air.collector', 'air.distributor', 'air.degasser', 'air.treatment',
  ...[1, 2, 3].map(no => `air.chwPump.${no}`),
  ...[1, 2].map(no => `air.hotPump.${no}`),
  ...Object.keys(distributedHallNames).flatMap(hall => [
    ...[1, 2, 3].map(no => `distributed.${hall}.unit.${no}`),
    ...[1, 2].map(no => `distributed.${hall}.pump.${no}`),
    `distributed.${hall}.degasser`,
    `distributed.${hall}.treatment`,
    `distributed.${hall}.tank`,
    `distributed.${hall}.makeupPump`,
    `distributed.${hall}.softener`
  ])
]

export function getEnergyDeviceProfile(id) {
  let match
  if ((match = id.match(/^water\.tower\.(\d+)$/))) {
    const no = match[1]
    return { id, title: `${no}#冷却塔`, type: '冷却塔', runningKey: `tower.${no}.running`, faultKey: `tower.${no}.fault`, fields: [field('累计运行', `tower.${no}.hours`), ...statusFields(`tower.${no}`)] }
  }
  if ((match = id.match(/^water\.chiller\.(\d+)$/))) {
    const no = match[1]
    return { id, title: `${no}#冷水机组`, type: '离心式冷水机组', runningKey: `chiller.${no}.running`, faultKey: `chiller.${no}.fault`, fields: [field('累计运行', `chiller.${no}.hours`), field('实时负载', `chiller.${no}.load`), field('冷冻出水', `chiller.${no}.supplyTemp`), field('冷冻回水', `chiller.${no}.returnTemp`), ...statusFields(`chiller.${no}`, { includeFrequency: false })] }
  }
  if ((match = id.match(/^water\.(chwPump|cwPump)\.(\d+)$/))) {
    const [, kind, no] = match
    const prefix = `${kind}.${no}`
    const label = kind === 'chwPump' ? '冷冻泵' : '冷却泵'
    return { id, title: `${no}#${label}`, type: `${label}变频控制`, runningKey: `${prefix}.running`, faultKey: `${prefix}.fault`, fields: [field('累计运行', `${prefix}.hours`), ...statusFields(prefix)] }
  }
  if (id === 'water.collector' || id === 'water.distributor') {
    const collector = id.endsWith('collector')
    return { id, title: collector ? '集水器' : '分水器', type: collector ? '冷冻回水汇集' : '冷冻供水分配', fields: collector ? [field('回水压力', 'loop.chwReturnPressure'), field('回水温度', 'station.returnTemp'), field('系统流量', 'loop.chwFlow')] : [field('供水压力', 'loop.chwSupplyPressure'), field('供水温度', 'station.supplyTemp'), field('系统流量', 'loop.chwFlow')] }
  }
  if (id === 'water.treatment.chilled' || id === 'water.treatment.cooling') {
    const chilled = id.endsWith('chilled')
    const prefix = chilled ? 'treatment.chilled' : 'treatment.cooling'
    const runningKey = `${prefix}Running`
    const faultKey = `${prefix}Fault`
    return { id, title: chilled ? '冷冻水全程水处理器' : '冷却水全程水处理器', type: '全程水处理', runningKey, faultKey, fields: [field('运行状态', runningKey, 'running'), field('故障状态', faultKey, 'fault'), field('主管压力', chilled ? 'loop.chwReturnPressure' : 'loop.cwPressure')] }
  }
  if (id === 'water.dosing') return { id, title: '加药装置', type: '冷却水加药', runningKey: 'dosing.running', faultKey: 'dosing.fault', fields: [field('运行状态', 'dosing.running', 'running'), field('故障状态', 'dosing.fault', 'fault'), field('冷却回水温度', 'loop.cwReturnTemp'), field('冷却水压力', 'loop.cwPressure')] }
  if (id === 'water.softener') return { id, title: '软化水装置', type: '补水预处理', runningKey: 'makeup.softenerRunning', fields: [field('运行状态', 'makeup.softenerRunning', 'running'), field('补水压力', 'makeup.pressure')] }
  if (id === 'water.tank') return { id, title: '补水箱', type: '液位设备', tank: true, fields: [field('当前液位', 'makeup.tankLevel')] }
  if (id === 'water.makeupPump') return { id, title: '定压补水泵组', type: '定压补水', runningKey: 'makeup.pumpRunning', fields: [field('运行状态', 'makeup.pumpRunning', 'running')] }

  if ((match = id.match(/^air\.unit\.(\d+)$/))) {
    const no = match[1]
    const prefix = `airUnit.${no}`
    return { id, title: `${no}#风冷机组`, type: '模块式风冷机组', runningKey: `${prefix}.running`, faultKey: `${prefix}.fault`, fields: [field('累计运行', `${prefix}.hours`), field('实时负载', `${prefix}.load`), ...statusFields(prefix, { frequencyKey: `${prefix}.fanFrequency` })] }
  }
  if ((match = id.match(/^air\.(chwPump|hotPump)\.(\d+)$/))) {
    const [, kind, no] = match
    const prefix = kind === 'chwPump' ? `airChwPump.${no}` : `airHotPump.${no}`
    const label = kind === 'chwPump' ? '冷水泵' : '热水泵'
    return { id, title: `${no}#${label}`, type: `${label}变频控制`, runningKey: `${prefix}.running`, faultKey: `${prefix}.fault`, fields: [field('累计运行', `${prefix}.hours`), ...statusFields(prefix)] }
  }
  if (id === 'air.collector' || id === 'air.distributor') {
    const collector = id.endsWith('collector')
    return { id, title: collector ? '集水器' : '分水器', type: collector ? '冷冻回水汇集' : '冷冻供水分配', fields: collector ? [field('回水压力', 'air.loop.returnPressure'), field('回水温度', 'air.loop.returnTemp'), field('系统流量', 'air.loop.flow')] : [field('供水压力', 'air.loop.supplyPressure'), field('供水温度', 'air.loop.supplyTemp'), field('系统流量', 'air.loop.flow')] }
  }
  if (id === 'air.degasser') return { id, title: '真空脱气机', type: '真空脱气定压', runningKey: 'air.degasser.running', faultKey: 'air.degasser.fault', fields: [field('液位', 'air.degasser.level'), field('运行状态', 'air.degasser.running', 'running'), field('故障状态', 'air.degasser.fault', 'fault'), field('回水压力', 'air.loop.returnPressure')] }
  if (id === 'air.treatment') return { id, title: '全程水处理器', type: '风冷系统水处理', runningKey: 'air.treatment.running', faultKey: 'air.treatment.fault', fields: [field('运行状态', 'air.treatment.running', 'running'), field('故障状态', 'air.treatment.fault', 'fault'), field('回水压力', 'air.loop.returnPressure')] }

  if ((match = id.match(/^distributed\.(east|hall2|hall3)\.unit\.(\d+)$/))) {
    const [, hall, no] = match
    const prefix = `distributed.${hall}.unit.${no}`
    return { id, title: `${distributedHallNames[hall]} ${no}#风冷机组`, type: '分馆模块式风冷机组', runningKey: `${prefix}.running`, faultKey: `${prefix}.fault`, fields: [field('累计运行', `${prefix}.hours`), field('实时负载', `${prefix}.load`), ...statusFields(prefix, { frequencyKey: `${prefix}.fanFrequency` })] }
  }
  if ((match = id.match(/^distributed\.(east|hall2|hall3)\.pump\.(\d+)$/))) {
    const [, hall, no] = match
    const prefix = `distributed.${hall}.pump.${no}`
    return { id, title: `${distributedHallNames[hall]} ${no}#冷水泵`, type: '分馆冷冻水泵', runningKey: `${prefix}.running`, faultKey: `${prefix}.fault`, fields: [field('累计运行', `${prefix}.hours`), ...statusFields(prefix)] }
  }
  if ((match = id.match(/^distributed\.(east|hall2|hall3)\.(degasser|treatment|tank|makeupPump|softener)$/))) {
    const [, hall, kind] = match
    const prefix = `distributed.${hall}`
    const hallName = distributedHallNames[hall]
    if (kind === 'degasser') return { id, title: `${hallName} 真空脱气机`, type: '真空脱气定压', runningKey: `${prefix}.degasser.running`, faultKey: `${prefix}.degasser.fault`, fields: [field('液位', `${prefix}.degasser.level`), field('运行状态', `${prefix}.degasser.running`, 'running'), field('故障状态', `${prefix}.degasser.fault`, 'fault'), field('回水压力', `${prefix}.loop.returnPressure`)] }
    if (kind === 'treatment') return { id, title: `${hallName} 全程水处理器`, type: '分馆冷冻水水处理', runningKey: `${prefix}.treatment.running`, faultKey: `${prefix}.treatment.fault`, fields: [field('运行状态', `${prefix}.treatment.running`, 'running'), field('故障状态', `${prefix}.treatment.fault`, 'fault'), field('回水压力', `${prefix}.loop.returnPressure`)] }
    if (kind === 'tank') return { id, title: `${hallName} 补水箱`, type: '分馆补水液位设备', tank: true, tankKey: `${prefix}.makeup.tankLevel`, fields: [field('当前液位', `${prefix}.makeup.tankLevel`)] }
    if (kind === 'makeupPump') return { id, title: `${hallName} 定压补水泵组`, type: '分馆定压补水', runningKey: `${prefix}.makeup.pumpRunning`, fields: [field('运行状态', `${prefix}.makeup.pumpRunning`, 'running')] }
    return { id, title: `${hallName} 软化水装置`, type: '分馆补水预处理', runningKey: `${prefix}.makeup.softenerRunning`, fields: [field('运行状态', `${prefix}.makeup.softenerRunning`, 'running'), field('补水压力', `${prefix}.makeup.pressure`)] }
  }
  return null
}
