let templateSeed = 1
let pointSeed = 1
let specSeed = 1

function makeId(prefix, seed) {
  return `${prefix}-${String(seed).padStart(4, '0')}`
}

function spec(name, key, unit = '', defaultValue = '', description = '') {
  return { id: makeId('spec', specSeed++), name, key, unit, defaultValue, description }
}

function point(name, key, options = {}) {
  return {
    id: makeId('pt', pointSeed++),
    name,
    key,
    group: options.group || '监测点',
    ioType: options.ioType || 'AI',
    access: options.access || 'R',
    dataType: options.dataType || 'number',
    unit: options.unit || '',
    defaultValue: options.defaultValue ?? '',
    required: Boolean(options.required),
    enumOptions: options.enumOptions || '',
    description: options.description || ''
  }
}

function template(config) {
  return {
    id: config.id || makeId('tpl', templateSeed++),
    code: config.code,
    name: config.name,
    profession: config.profession,
    system: config.system || config.profession,
    family: config.family || config.name,
    zone: config.zone || '',
    manufacturer: config.manufacturer || '待定',
    model: config.model || '',
    deviceType: config.deviceType || '',
    deviceLabel: config.deviceLabel || config.name,
    source: config.source || 'builtin',
    description: config.description || '',
    isDefault: config.isDefault !== false,
    specs: config.specs || [],
    points: config.points || [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

function runStateBundle(prefix = '') {
  return [
    point(`${prefix}运行状态`, `${prefix}runStatus`, { group: '监测点', ioType: 'DI', dataType: 'boolean', required: true }),
    point(`${prefix}故障状态`, `${prefix}faultStatus`, { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
    point(`${prefix}手自动状态`, `${prefix}modeStatus`, { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '手动,自动' }),
    point(`${prefix}启停控制`, `${prefix}startStopCmd`, { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
    point(`${prefix}运行时间`, `${prefix}runHours`, { group: '统计点', ioType: 'AI', unit: 'h' })
  ]
}

function vfdBundle(prefix = '') {
  return [
    point(`${prefix}频率反馈`, `${prefix}frequencyFeedback`, { group: '监测点', ioType: 'AI', unit: 'Hz' }),
    point(`${prefix}频率调节`, `${prefix}frequencyCommand`, { group: '控制点', ioType: 'AO', access: 'RW', unit: 'Hz' })
  ]
}

function valveBundle(prefix = '') {
  return [
    point(`${prefix}阀门状态`, `${prefix}valveStatus`, { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
    point(`${prefix}阀门控制`, `${prefix}valveCommand`, { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
  ]
}

const workbookTemplates = [
  template({
    code: 'HVAC-TOWER-001',
    name: '冷却塔',
    profession: '暖通',
    system: '冷却水系统',
    family: '冷却塔',
    deviceType: 'realistic-cooling-tower',
    deviceLabel: '冷却塔',
    source: 'excel',
    description: '来自现有设备模板表，适用于冷却塔风机及阀门联动控制。',
    specs: [spec('额定流量', 'ratedFlow', 'm3/h', '0'), spec('风机功率', 'fanPower', 'kW', '0'), spec('台数', 'unitCount', '台', '1')],
    points: [
      ...runStateBundle(),
      ...vfdBundle(),
      point('供水阀状态', 'supplyValveStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('供水阀控制', 'supplyValveCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('回水阀状态', 'returnValveStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('回水阀控制', 'returnValveCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('启用/禁用', 'enableCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'HVAC-CPUMP-001',
    name: '冷却泵',
    profession: '冷热源',
    system: '冷却水系统',
    family: '循环泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    source: 'excel',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'm3/h', '0'), spec('额定扬程', 'ratedHead', 'm', '0'), spec('电机功率', 'motorPower', 'kW', '0')],
    points: [
      point('启用/禁用', 'enableCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      ...runStateBundle(),
      point('供水压力', 'supplyPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }),
      point('回水压力', 'returnPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }),
      ...vfdBundle()
    ]
  }),
  template({
    code: 'HVAC-AIRCURTAIN-001',
    name: '热风幕',
    profession: '末端/面板',
    system: '空调末端',
    family: '热风幕',
    deviceType: 'supply-fan',
    deviceLabel: '送风机',
    source: 'excel',
    isDefault: false,
    specs: [spec('额定风量', 'ratedAirflow', 'm3/h', '0'), spec('安装高度', 'installHeight', 'm', '0')],
    points: [
      point('启停控制', 'startStopCmd', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('操作模式', 'operationMode', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '制热,送风,停机' }),
      point('BA系统启停', 'baStartStop', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('运行时间', 'runHours', { group: '统计点', ioType: 'AI', unit: 'h' }),
      point('指令源', 'commandSource', { group: '监测点', ioType: 'BI', dataType: 'enum', enumOptions: '就地,BA,联动' }),
      point('运行状态', 'runStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('故障状态', 'faultStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('手自动状态', 'modeStatus', { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '手动,自动' })
    ]
  }),
  template({
    code: 'ELEV-001',
    name: '电梯',
    profession: '强弱电',
    system: '垂直交通',
    family: '电梯',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    source: 'excel',
    isDefault: false,
    specs: [spec('额定载重', 'ratedLoad', 'kg', '0'), spec('额定速度', 'ratedSpeed', 'm/s', '0')],
    points: [
      point('当前楼层', 'currentFloor', { group: '监测点', ioType: 'AI', dataType: 'number' }),
      point('门状态', 'doorStatus', { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '开门,关门,开关中' }),
      point('故障状态', 'faultStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('电梯模式', 'elevatorMode', { group: '监测点', ioType: 'BI', dataType: 'enum', enumOptions: '正常,消防,检修' }),
      point('运行方向', 'travelDirection', { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '上行,下行,停止' }),
      point('运行状态', 'runStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('故障次数', 'faultCount', { group: '统计点', ioType: 'AI', dataType: 'number' }),
      point('电梯速度', 'travelSpeed', { group: '监测点', ioType: 'AI', unit: 'm/s' })
    ]
  }),
  template({
    code: 'CHILLER-CENTRIFUGAL-001',
    name: '离心冷机',
    profession: '冷热源',
    system: '冷冻站',
    family: '冷水机组',
    deviceType: 'realistic-chiller',
    deviceLabel: '冷水机组',
    source: 'excel',
    specs: [spec('额定制冷量', 'ratedCoolingCapacity', 'RT', '0'), spec('额定功率', 'ratedPower', 'kW', '0'), spec('冷媒类型', 'refrigerant', '', 'R134a')],
    points: [
      point('停机报警', 'shutdownAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('非停机报警', 'warningAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('油箱温度', 'oilTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('蒸发器压力', 'evaporatorPressure', { group: '监测点', ioType: 'AI', unit: 'kPa' }),
      point('冷凝器压力', 'condenserPressure', { group: '监测点', ioType: 'AI', unit: 'kPa' }),
      point('经济器压力', 'economizerPressure', { group: '监测点', ioType: 'AI', unit: 'kPa' }),
      point('油压差', 'oilDiffPressure', { group: '监测点', ioType: 'AI', unit: 'kPa' }),
      point('冷机投运', 'enableCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('出水温度设定点', 'leavingWaterSetpoint', { group: '控制点', ioType: 'AO', access: 'RW', unit: '℃' }),
      point('机组启停控制', 'startStopCmd', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('电流百分比', 'currentPercent', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('冷冻水进水温度', 'chwInTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('冷冻水出水温度', 'chwOutTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('冷却水进水温度', 'cwInTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('冷却水出水温度', 'cwOutTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('导叶开度', 'guideVaneOpening', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('机组负载百分比', 'loadPercent', { group: '监测点', ioType: 'AI', unit: '%' })
    ]
  }),
  template({
    code: 'ENV-AIRQ-001',
    name: '空气质量传感器',
    profession: '强弱电',
    system: '环境监测',
    family: '环境传感器',
    deviceType: 'sensor',
    deviceLabel: '人体感应器',
    source: 'excel',
    specs: [spec('安装区域', 'installZone', '', ''), spec('通讯协议', 'protocol', '', 'Modbus RTU')],
    points: [
      point('温度', 'temperature', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('湿度', 'humidity', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('PM2.5', 'pm25', { group: '监测点', ioType: 'AI', unit: 'ug/m3' }),
      point('二氧化碳', 'co2', { group: '监测点', ioType: 'AI', unit: 'ppm' }),
      point('挥发气体', 'voc', { group: '监测点', ioType: 'AI', unit: 'ppm' })
    ]
  }),
  template({
    code: 'AIR-HANDLER-001',
    name: '空调、新风机组',
    profession: '新风',
    system: '空调送排风系统',
    family: '空调机组',
    deviceType: 'air-handler',
    deviceLabel: '新风机组',
    source: 'excel',
    specs: [spec('额定风量', 'ratedAirflow', 'm3/h', '0'), spec('机外静压', 'externalStaticPressure', 'Pa', '0'), spec('冷量', 'ratedCooling', 'kW', '0')],
    points: [
      point('送风机频率反馈', 'supplyFanFrequencyFeedback', { group: '监测点', ioType: 'AI', unit: 'Hz' }),
      point('送风机频率给定', 'supplyFanFrequencyCommand', { group: '控制点', ioType: 'AO', access: 'RW', unit: 'Hz' }),
      point('排风机频率反馈', 'exhaustFanFrequencyFeedback', { group: '监测点', ioType: 'AI', unit: 'Hz' }),
      point('排风机频率给定', 'exhaustFanFrequencyCommand', { group: '控制点', ioType: 'AO', access: 'RW', unit: 'Hz' }),
      point('热转轮运行状态', 'wheelRunStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('热转轮故障状态', 'wheelFaultStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('热转轮手自动状态', 'wheelModeStatus', { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '手动,自动' }),
      point('防冻状态', 'freezeProtectionStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('热转轮启停控制', 'wheelStartStopCmd', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('季节模式', 'seasonMode', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '夏季,冬季,过渡季' }),
      point('排风机运行状态', 'exhaustFanRunStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('送风机运行状态', 'supplyFanRunStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('送风温度', 'supplyAirTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('回风温度', 'returnAirTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('过滤器压差报警', 'filterDiffAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('送风静压', 'supplyAirPressure', { group: '监测点', ioType: 'AI', unit: 'Pa' }),
      point('新风阀开度', 'freshAirValveOpening', { group: '控制点', ioType: 'AO', access: 'RW', unit: '%' }),
      point('回风阀开度', 'returnAirValveOpening', { group: '控制点', ioType: 'AO', access: 'RW', unit: '%' })
    ]
  }),
  template({
    code: 'CHILLER-SCREW-001',
    name: '螺杆冷机',
    profession: '冷热源',
    system: '冷冻站',
    family: '冷水机组',
    deviceType: 'realistic-chiller',
    deviceLabel: '冷水机组',
    source: 'excel',
    isDefault: false,
    specs: [spec('额定制冷量', 'ratedCoolingCapacity', 'RT', '0'), spec('额定功率', 'ratedPower', 'kW', '0')],
    points: [
      point('冷机投运', 'enableCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('制冷温度设定点', 'coolingSetpoint', { group: '控制点', ioType: 'AO', access: 'RW', unit: '℃' }),
      point('当前温度设定点', 'activeSetpoint', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('机组启停控制', 'startStopCmd', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('负荷需求限制', 'demandLimit', { group: '控制点', ioType: 'AO', access: 'RW', unit: '%' }),
      point('启动延时剩余时间', 'startupDelayRemaining', { group: '监测点', ioType: 'AI', unit: 's' }),
      point('机组负载百分比', 'loadPercent', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('当前负载限制', 'currentLoadLimit', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('蒸发器进水温度', 'evaporatorInTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('蒸发器出水温度', 'evaporatorOutTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('冷凝器进水温度', 'condenserInTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('冷凝器出水温度', 'condenserOutTemp', { group: '监测点', ioType: 'AI', unit: '℃' })
    ]
  }),
  template({
    code: 'WATER-SUMP-001',
    name: '集水坑',
    profession: '给排水',
    system: '排水系统',
    family: '集水坑',
    deviceType: 'tank',
    deviceLabel: '水箱',
    source: 'excel',
    isDefault: false,
    specs: [spec('有效容积', 'effectiveVolume', 'm3', '0'), spec('液位报警方式', 'levelAlarmMode', '', '高低液位')],
    points: [
      point('运行状态', 'pumpRunStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('故障状态', 'pumpFaultStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('手自动状态', 'pumpModeStatus', { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '手动,自动' }),
      point('1#运行时间', 'pump1RunHours', { group: '统计点', ioType: 'AI', unit: 'h' }),
      point('2#运行时间', 'pump2RunHours', { group: '统计点', ioType: 'AI', unit: 'h' }),
      point('液位状态', 'levelStatus', { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '低液位,正常,高液位,超高液位' })
    ]
  }),
  template({
    code: 'FAN-001',
    name: '风机',
    profession: '新风',
    system: '送排风系统',
    family: '风机',
    deviceType: 'supply-fan',
    deviceLabel: '送风机',
    source: 'excel',
    specs: [spec('额定风量', 'ratedAirflow', 'm3/h', '0'), spec('风机功率', 'motorPower', 'kW', '0')],
    points: [
      ...runStateBundle(),
      point('风机压差状态', 'fanDiffPressureStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('操作模式', 'operationMode', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '正常,值班,停机' }),
      point('BA系统启停', 'baStartStop', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('指令源', 'commandSource', { group: '监测点', ioType: 'BI', dataType: 'enum', enumOptions: '就地,BA,联动' })
    ]
  }),
  template({
    code: 'FCU-001',
    name: '风机盘管',
    profession: '末端/面板',
    system: '空调末端',
    family: '风机盘管',
    deviceType: 'air-handler',
    deviceLabel: '新风机组',
    source: 'excel',
    isDefault: false,
    specs: [spec('额定风量', 'ratedAirflow', 'm3/h', '0'), spec('额定冷量', 'ratedCooling', 'kW', '0')],
    points: [
      point('开关机', 'powerCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('室内温度', 'roomTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('温度设定', 'tempSetpoint', { group: '控制点', ioType: 'AO', access: 'RW', unit: '℃' }),
      point('运行模式', 'runMode', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '制冷,制热,送风,自动' }),
      point('风速设定', 'fanSpeed', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '低,中,高,自动' }),
      point('通讯状态', 'commStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' })
    ]
  })
]

const extraTemplates = [
  template({
    code: 'HVAC-CHWP-001',
    name: '冷冻泵',
    profession: '冷热源',
    system: '冷冻水系统',
    family: '循环泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    description: '冷冻水供回循环泵模板。',
    specs: [spec('额定流量', 'ratedFlow', 'm3/h', '0'), spec('额定扬程', 'ratedHead', 'm', '0'), spec('电机功率', 'motorPower', 'kW', '0')],
    points: [...runStateBundle(), ...vfdBundle(), point('供水压力', 'supplyPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }), point('回水压力', 'returnPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' })]
  }),
  template({
    code: 'HVAC-MAKEUP-001',
    name: '补水泵',
    profession: '给排水',
    system: '补水系统',
    family: '补水泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'm3/h', '0'), spec('稳压压力', 'pressureSetpoint', 'MPa', '0')],
    points: [...runStateBundle(), point('系统压力', 'systemPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }), point('补水阀控制', 'makeupValveCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })]
  }),
  template({
    code: 'HVAC-HEX-001',
    name: '板式换热器',
    profession: '冷热源',
    system: '换热系统',
    family: '换热器',
    deviceType: 'realistic-heat-exchanger',
    deviceLabel: '板式换热器',
    specs: [spec('额定换热量', 'ratedHeatExchange', 'kW', '0'), spec('设计压降', 'designPressureDrop', 'kPa', '0')],
    points: [
      point('一次侧进水温度', 'primaryInTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('一次侧出水温度', 'primaryOutTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('二次侧进水温度', 'secondaryInTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('二次侧出水温度', 'secondaryOutTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('一次侧进水压力', 'primaryInPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }),
      point('一次侧出水压力', 'primaryOutPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }),
      point('二次侧进水压力', 'secondaryInPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }),
      point('二次侧出水压力', 'secondaryOutPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' })
    ]
  }),
  template({
    code: 'WATER-BOOSTER-001',
    name: '生活给水泵',
    profession: '给排水',
    system: '生活给水系统',
    family: '供水泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'm3/h', '0'), spec('额定扬程', 'ratedHead', 'm', '0')],
    points: [...runStateBundle(), ...vfdBundle(), point('出水压力', 'outletPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }), point('水箱低液位联锁', 'lowLevelLock', { group: '报警点', ioType: 'DI', dataType: 'boolean' })]
  }),
  template({
    code: 'WATER-SEWAGE-001',
    name: '污水泵',
    profession: '给排水',
    system: '污废水系统',
    family: '排污泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'm3/h', '0'), spec('额定扬程', 'ratedHead', 'm', '0')],
    points: [...runStateBundle(), point('高液位报警', 'highLevelAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }), point('超高液位报警', 'veryHighLevelAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' })]
  }),
  template({
    code: 'WATER-TANK-001',
    name: '生活水箱',
    profession: '给排水',
    system: '生活给水系统',
    family: '水箱',
    deviceType: 'tank',
    deviceLabel: '水箱',
    specs: [spec('有效容积', 'effectiveVolume', 'm3', '0'), spec('材质', 'material', '', '不锈钢')],
    points: [
      point('液位', 'level', { group: '监测点', ioType: 'AI', unit: 'm' }),
      point('高液位报警', 'highLevelAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('低液位报警', 'lowLevelAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('补水阀状态', 'makeupValveStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('补水阀控制', 'makeupValveCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'FIRE-PUMP-001',
    name: '消防泵',
    profession: '消防',
    system: '消防给水系统',
    family: '消防泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'L/s', '0'), spec('额定扬程', 'ratedHead', 'm', '0')],
    points: [...runStateBundle(), point('消防压力', 'firePressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }), point('消防联动启动', 'fireLinkageStart', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })]
  }),
  template({
    code: 'FIRE-SPRINKLER-001',
    name: '喷淋泵',
    profession: '消防',
    system: '喷淋系统',
    family: '喷淋泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'L/s', '0'), spec('额定扬程', 'ratedHead', 'm', '0')],
    points: [...runStateBundle(), point('系统压力', 'systemPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' }), point('压力开关动作', 'pressureSwitchTrip', { group: '报警点', ioType: 'DI', dataType: 'boolean' })]
  }),
  template({
    code: 'FIRE-JOCKEY-001',
    name: '稳压泵',
    profession: '消防',
    system: '消防稳压系统',
    family: '稳压泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'L/s', '0'), spec('稳压压力', 'pressureSetpoint', 'MPa', '0')],
    points: [...runStateBundle(), point('系统压力', 'systemPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' })]
  }),
  template({
    code: 'FIRE-PANEL-001',
    name: '消防报警主机',
    profession: '消防',
    system: '火灾报警系统',
    family: '报警主机',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    isDefault: false,
    specs: [spec('回路数', 'loopCount', '路', '0'), spec('通讯协议', 'protocol', '', 'Modbus TCP')],
    points: [
      point('在线状态', 'onlineStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean', required: true }),
      point('火警状态', 'fireAlarmStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('故障状态', 'faultStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('屏蔽状态', 'shieldStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('消音控制', 'silenceCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('复位控制', 'resetCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'POWER-CABINET-001',
    name: '配电柜',
    profession: '配电',
    system: '低压配电系统',
    family: '配电柜',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    specs: [spec('额定电压', 'ratedVoltage', 'V', '380'), spec('额定电流', 'ratedCurrent', 'A', '0')],
    points: [
      point('合闸状态', 'closeStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('分闸状态', 'openStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('远方就地状态', 'remoteLocalStatus', { group: '监测点', ioType: 'DI', dataType: 'enum', enumOptions: '远方,就地' }),
      point('故障跳闸', 'tripAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('A相电压', 'voltageA', { group: '监测点', ioType: 'AI', unit: 'V' }),
      point('B相电压', 'voltageB', { group: '监测点', ioType: 'AI', unit: 'V' }),
      point('C相电压', 'voltageC', { group: '监测点', ioType: 'AI', unit: 'V' }),
      point('A相电流', 'currentA', { group: '监测点', ioType: 'AI', unit: 'A' }),
      point('B相电流', 'currentB', { group: '监测点', ioType: 'AI', unit: 'A' }),
      point('C相电流', 'currentC', { group: '监测点', ioType: 'AI', unit: 'A' }),
      point('有功功率', 'activePower', { group: '监测点', ioType: 'AI', unit: 'kW' }),
      point('无功功率', 'reactivePower', { group: '监测点', ioType: 'AI', unit: 'kVar' }),
      point('功率因数', 'powerFactor', { group: '监测点', ioType: 'AI', unit: '' })
    ]
  }),
  template({
    code: 'POWER-TRANSFORMER-001',
    name: '变压器',
    profession: '配电',
    system: '变配电系统',
    family: '变压器',
    deviceType: 'transformer',
    deviceLabel: '变压器',
    specs: [spec('容量', 'ratedCapacity', 'kVA', '0'), spec('电压等级', 'voltageLevel', '', '10/0.4kV')],
    points: [
      point('高压侧电流', 'hvCurrent', { group: '监测点', ioType: 'AI', unit: 'A' }),
      point('低压侧电流', 'lvCurrent', { group: '监测点', ioType: 'AI', unit: 'A' }),
      point('绕组温度', 'windingTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('油温', 'oilTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('超温报警', 'overTempAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('风机运行状态', 'fanRunStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('风机控制', 'fanCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'POWER-GENSET-001',
    name: '柴油发电机',
    profession: '配电',
    system: '备用电源系统',
    family: '发电机',
    deviceType: 'generator',
    deviceLabel: '发电机',
    specs: [spec('额定功率', 'ratedPower', 'kW', '0'), spec('额定电压', 'ratedVoltage', 'V', '400')],
    points: [
      point('机组运行状态', 'runStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('故障状态', 'faultStatus', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('远程启停控制', 'startStopCmd', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('输出电压', 'outputVoltage', { group: '监测点', ioType: 'AI', unit: 'V' }),
      point('输出频率', 'outputFrequency', { group: '监测点', ioType: 'AI', unit: 'Hz' }),
      point('输出功率', 'outputPower', { group: '监测点', ioType: 'AI', unit: 'kW' }),
      point('燃油液位', 'fuelLevel', { group: '监测点', ioType: 'AI', unit: '%' })
    ]
  }),
  template({
    code: 'POWER-UPS-001',
    name: 'UPS',
    profession: '强弱电',
    system: 'UPS供配电系统',
    family: 'UPS',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    isDefault: false,
    specs: [spec('容量', 'ratedCapacity', 'kVA', '0'), spec('后备时间', 'backupTime', 'min', '0')],
    points: [
      point('市电状态', 'mainsStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('逆变状态', 'inverterStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('旁路状态', 'bypassStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('电池电压', 'batteryVoltage', { group: '监测点', ioType: 'AI', unit: 'V' }),
      point('电池剩余容量', 'batterySoc', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('故障报警', 'faultAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'LIGHTING-SOUTH-001',
    name: '照明配电箱（南向）',
    profession: '照明',
    system: '照明配电系统',
    family: '照明配电箱',
    zone: '南向',
    deviceType: 'lighting-panel',
    deviceLabel: '照明配电箱',
    specs: [spec('回路数量', 'circuitCount', '回路', '0'), spec('服务区域', 'serviceZone', '', '南向')],
    points: [
      point('总电压', 'totalVoltage', { group: '监测点', ioType: 'AI', unit: 'V' }),
      point('总电流', 'totalCurrent', { group: '监测点', ioType: 'AI', unit: 'A' }),
      point('有功功率', 'activePower', { group: '监测点', ioType: 'AI', unit: 'kW' }),
      point('总开关状态', 'mainSwitchStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('总开关控制', 'mainSwitchCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('故障报警', 'faultAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'LIGHTING-NORTH-001',
    name: '照明配电箱（北向）',
    profession: '照明',
    system: '照明配电系统',
    family: '照明配电箱',
    zone: '北向',
    deviceType: 'lighting-panel',
    deviceLabel: '照明配电箱',
    isDefault: false,
    specs: [spec('回路数量', 'circuitCount', '回路', '0'), spec('服务区域', 'serviceZone', '', '北向')],
    points: [
      point('总电压', 'totalVoltage', { group: '监测点', ioType: 'AI', unit: 'V' }),
      point('总电流', 'totalCurrent', { group: '监测点', ioType: 'AI', unit: 'A' }),
      point('有功功率', 'activePower', { group: '监测点', ioType: 'AI', unit: 'kW' }),
      point('总开关状态', 'mainSwitchStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('总开关控制', 'mainSwitchCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('故障报警', 'faultAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'LIGHTING-CIRCUIT-001',
    name: '照明回路',
    profession: '照明',
    system: '照明控制系统',
    family: '照明回路',
    deviceType: 'light-fixture',
    deviceLabel: '照明灯具',
    specs: [spec('灯具数量', 'lampCount', '套', '0'), spec('区域功率', 'ratedPower', 'kW', '0')],
    points: [
      point('回路开关状态', 'switchStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('回路开关控制', 'switchCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('照度反馈', 'illuminance', { group: '监测点', ioType: 'AI', unit: 'Lux' }),
      point('定时模式', 'scheduleMode', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '手动,时控,联动' })
    ]
  }),
  template({
    code: 'LIGHTING-EMERGENCY-001',
    name: '应急照明回路',
    profession: '照明',
    system: '应急照明系统',
    family: '应急照明',
    deviceType: 'light-fixture',
    deviceLabel: '照明灯具',
    isDefault: false,
    specs: [spec('灯具数量', 'lampCount', '套', '0'), spec('备用时间', 'backupTime', 'min', '90')],
    points: [
      point('回路开关状态', 'switchStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('故障报警', 'faultAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('应急投入状态', 'emergencyStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('远程测试控制', 'testCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'BAS-DDC-001',
    name: 'DDC控制柜',
    profession: '末端/面板',
    system: '楼宇控制系统',
    family: 'DDC控制柜',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    isDefault: false,
    specs: [spec('AI点数', 'aiCount', '点', '16'), spec('DO点数', 'doCount', '点', '16')],
    points: [
      point('在线状态', 'onlineStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean', required: true }),
      point('通讯故障', 'commFault', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('控制器模式', 'controllerMode', { group: '监测点', ioType: 'BI', dataType: 'enum', enumOptions: '自动,手动,停用' }),
      point('远程复位控制', 'resetCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('柜内温度', 'cabinetTemp', { group: '监测点', ioType: 'AI', unit: '℃' })
    ]
  }),
  template({
    code: 'BAS-THERMOSTAT-001',
    name: '房间温控面板',
    profession: '末端/面板',
    system: '房间控制',
    family: '温控面板',
    deviceType: 'sensor',
    deviceLabel: '人体感应器',
    isDefault: false,
    specs: [spec('安装房间', 'roomName', '', ''), spec('通讯协议', 'protocol', '', 'BACnet MS/TP')],
    points: [
      point('室温反馈', 'roomTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('设定温度', 'tempSetpoint', { group: '控制点', ioType: 'AO', access: 'RW', unit: '℃' }),
      point('模式设定', 'modeSetpoint', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '制冷,制热,自动,关闭' }),
      point('风速设定', 'fanSpeedSetpoint', { group: '控制点', ioType: 'BV', access: 'RW', dataType: 'enum', enumOptions: '低,中,高,自动' }),
      point('通讯状态', 'commStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'SEC-ACCESS-001',
    name: '门禁控制器',
    profession: '强弱电',
    system: '门禁系统',
    family: '门禁控制器',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    isDefault: false,
    specs: [spec('门点数量', 'doorCount', '门', '1'), spec('通讯协议', 'protocol', '', 'TCP/IP')],
    points: [
      point('在线状态', 'onlineStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('门磁状态', 'doorContactStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('门锁状态', 'lockStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('开门控制', 'doorOpenCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' }),
      point('非法开门报警', 'forcedOpenAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'SEC-NETWORK-001',
    name: '网络交换机',
    profession: '强弱电',
    system: '综合布线系统',
    family: '交换机',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    isDefault: false,
    specs: [spec('端口数量', 'portCount', '口', '24'), spec('管理方式', 'managementMode', '', 'SNMP')],
    points: [
      point('在线状态', 'onlineStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('CPU负载', 'cpuUsage', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('内存占用', 'memoryUsage', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('上联口状态', 'uplinkStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('设备重启控制', 'restartCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'SEC-CCTV-001',
    name: '视频监控主机',
    profession: '强弱电',
    system: '视频监控系统',
    family: '视频主机',
    deviceType: 'distribution-box',
    deviceLabel: '配电箱',
    isDefault: false,
    specs: [spec('视频路数', 'channelCount', '路', '16'), spec('存储天数', 'storageDays', '天', '30')],
    points: [
      point('在线状态', 'onlineStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('硬盘故障', 'diskFaultAlarm', { group: '报警点', ioType: 'DI', dataType: 'boolean' }),
      point('录像状态', 'recordStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('CPU负载', 'cpuUsage', { group: '监测点', ioType: 'AI', unit: '%' }),
      point('设备重启控制', 'restartCommand', { group: '控制点', ioType: 'DO', access: 'RW', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'ENERGY-COLD-001',
    name: '蓄冷罐',
    profession: '蓄能',
    system: '蓄冷系统',
    family: '蓄冷罐',
    deviceType: 'tank',
    deviceLabel: '水箱',
    isDefault: false,
    specs: [spec('有效容积', 'effectiveVolume', 'm3', '0'), spec('设计蓄冷量', 'designStorage', 'kWh', '0')],
    points: [
      point('液位', 'level', { group: '监测点', ioType: 'AI', unit: 'm' }),
      point('上部温度', 'upperTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('下部温度', 'lowerTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('充冷状态', 'chargeStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('放冷状态', 'dischargeStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'ENERGY-HOT-001',
    name: '蓄热罐',
    profession: '蓄能',
    system: '蓄热系统',
    family: '蓄热罐',
    deviceType: 'tank',
    deviceLabel: '水箱',
    isDefault: false,
    specs: [spec('有效容积', 'effectiveVolume', 'm3', '0'), spec('设计蓄热量', 'designStorage', 'kWh', '0')],
    points: [
      point('液位', 'level', { group: '监测点', ioType: 'AI', unit: 'm' }),
      point('上部温度', 'upperTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('下部温度', 'lowerTemp', { group: '监测点', ioType: 'AI', unit: '℃' }),
      point('充热状态', 'chargeStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' }),
      point('放热状态', 'dischargeStatus', { group: '监测点', ioType: 'DI', dataType: 'boolean' })
    ]
  }),
  template({
    code: 'ENERGY-PUMP-001',
    name: '蓄能循环泵',
    profession: '蓄能',
    system: '蓄能系统',
    family: '循环泵',
    deviceType: 'realistic-pump',
    deviceLabel: '离心水泵',
    isDefault: false,
    specs: [spec('额定流量', 'ratedFlow', 'm3/h', '0'), spec('额定扬程', 'ratedHead', 'm', '0')],
    points: [...runStateBundle(), ...vfdBundle(), point('供水压力', 'supplyPressure', { group: '监测点', ioType: 'AI', unit: 'MPa' })]
  })
]

export const DEVICE_TEMPLATE_SEEDS = [...workbookTemplates, ...extraTemplates]
