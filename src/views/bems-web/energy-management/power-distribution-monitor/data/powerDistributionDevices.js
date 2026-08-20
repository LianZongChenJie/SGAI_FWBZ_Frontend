import { POWER_FEEDERS } from './powerDistributionPoints.js'

const field = (label, key, kind = 'number') => ({ label, key, kind })
const electricalFields = prefix => [
  field('断路器状态', `${prefix}.breakerClosed`, 'breaker'), field('故障状态', `${prefix}.fault`, 'fault'),
  field('控制位置', `${prefix}.remote`, 'remote'), field('线电压', `${prefix}.voltage`),
  field('A相电流', `${prefix}.currentA`), field('B相电流', `${prefix}.currentB`), field('C相电流', `${prefix}.currentC`),
  field('有功功率', `${prefix}.activePower`), field('无功功率', `${prefix}.reactivePower`),
  field('功率因数', `${prefix}.powerFactor`), field('累计电量', `${prefix}.energy`), field('柜内温度', `${prefix}.cabinetTemp`)
]

export const POWER_DEVICE_IDS = [
  'power.hv.bus.4', 'power.hv.bus.5', 'power.lv.bus.4', 'power.lv.bus.5',
  'power.hv.incomer.1', 'power.hv.incomer.2', 'power.hv.meter.1', 'power.hv.meter.2',
  'power.hv.feeder.211', 'power.hv.feeder.212', 'power.hv.feeder.221', 'power.hv.feeder.222',
  'power.transformer.1', 'power.transformer.2', 'power.lv.incomer.1', 'power.lv.incomer.2', 'power.lv.coupler.445',
  ...POWER_FEEDERS.map(item => `power.lv.feeder.${item.id}`),
  ...[1, 2, 3, 4].map(no => `power.capacitor.${no}`)
]

export function getPowerDeviceProfile(id) {
  let match
  if ((match = id.match(/^power\.(hv|lv)\.bus\.(4|5)$/))) {
    const [, level, no] = match
    const prefix = `power.${level}.bus.${no}`
    const high = level === 'hv'
    return { id, title: `${high ? '10kV' : '0.4kV'} ${no}#母线`, type: '母线段', runningKey: `${prefix}.energized`, fields: high
      ? [field('带电状态', `${prefix}.energized`, 'energized'), field('母线电压', `${prefix}.voltage`), field('系统频率', `${prefix}.frequency`), field('绝缘电阻', `${prefix}.insulation`)]
      : [field('带电状态', `${prefix}.energized`, 'energized'), field('AB线电压', `${prefix}.voltageAB`), field('BC线电压', `${prefix}.voltageBC`), field('CA线电压', `${prefix}.voltageCA`), field('总电流', `${prefix}.current`), field('有功功率', `${prefix}.activePower`), field('功率因数', `${prefix}.powerFactor`)] }
  }
  if ((match = id.match(/^power\.transformer\.(1|2)$/))) {
    const no = match[1]; const prefix = `power.transformer.${no}`
    return { id, title: `${no}#变压器`, type: 'SCB14-2500kVA 干式变压器', runningKey: `${prefix}.running`, faultKey: `${prefix}.fault`, fields: [field('运行状态', `${prefix}.running`, 'running'), field('故障状态', `${prefix}.fault`, 'fault'), field('负载率', `${prefix}.loadRate`), field('有功功率', `${prefix}.activePower`), field('无功功率', `${prefix}.reactivePower`), field('功率因数', `${prefix}.powerFactor`), field('高压侧电压', `${prefix}.hvVoltage`), field('低压侧电压', `${prefix}.lvVoltage`), field('绕组温度', `${prefix}.windingTemp`), field('铁芯温度', `${prefix}.coreTemp`), field('冷却风机', `${prefix}.fanRunning`, 'running'), field('累计运行', `${prefix}.hours`)] }
  }
  if (id === 'power.lv.coupler.445') return { id, title: '0.4kV 母联445', type: '母线联络断路器', runningKey: 'power.lv.coupler.445.breakerClosed', faultKey: 'power.lv.coupler.445.fault', fields: [field('断路器状态', 'power.lv.coupler.445.breakerClosed', 'breaker'), field('故障状态', 'power.lv.coupler.445.fault', 'fault'), field('控制位置', 'power.lv.coupler.445.remote', 'remote')] }
  if ((match = id.match(/^power\.lv\.feeder\.(.+)$/))) {
    const item = POWER_FEEDERS.find(feeder => feeder.id === match[1]); if (!item) return null
    const prefix = `power.lv.feeder.${item.id}`
    return { id, title: item.name, type: `${item.cabinet}柜 · ${item.code} · ${item.priority}回路`, runningKey: `${prefix}.breakerClosed`, faultKey: `${prefix}.fault`, fields: electricalFields(prefix) }
  }
  if ((match = id.match(/^power\.capacitor\.(\d)$/))) {
    const no = match[1]; const prefix = `power.capacitor.${no}`
    return { id, title: `${no}#无功补偿柜`, type: '低压电容补偿装置', runningKey: `${prefix}.running`, faultKey: `${prefix}.fault`, fields: [field('投入状态', `${prefix}.running`, 'running'), field('故障状态', `${prefix}.fault`, 'fault'), field('投入组数', `${prefix}.steps`), field('补偿容量', `${prefix}.reactivePower`), field('柜内温度', `${prefix}.cabinetTemp`)] }
  }
  const labels = {
    'power.hv.incomer.1': '10kV 1#进线柜', 'power.hv.incomer.2': '10kV 2#进线柜',
    'power.hv.meter.1': '10kV 1#计量柜', 'power.hv.meter.2': '10kV 2#计量柜',
    'power.hv.feeder.211': '10kV 211馈线柜', 'power.hv.feeder.212': '10kV 212馈线柜',
    'power.hv.feeder.221': '10kV 221馈线柜', 'power.hv.feeder.222': '10kV 222馈线柜',
    'power.lv.incomer.1': '0.4kV 1#进线柜', 'power.lv.incomer.2': '0.4kV 2#进线柜'
  }
  if (labels[id]) {
    const prefix = id
    return { id, title: labels[id], type: id.includes('.hv.') ? '10kV金属铠装开关柜' : '0.4kV低压进线柜', runningKey: `${prefix}.breakerClosed`, faultKey: `${prefix}.fault`, fields: electricalFields(prefix) }
  }
  return null
}
