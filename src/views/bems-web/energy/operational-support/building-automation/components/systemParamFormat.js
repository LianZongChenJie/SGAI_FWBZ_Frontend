/**
 * 系统参数格式化工具
 * 用于将接口返回的设备属性数据格式化展示到系统参数面板
 */

/** 根据 label 判断是否为告警类型（正常/告警） */
const ALARM_LABELS = ['报警', '故障', '保护', '信号']
/** 根据 label 判断是否为开关类型（开/关） */
const SWITCH_LABELS = ['控制', '启停', '开关', '加湿', '运行状态', '密闭阀']

function isAlarmLabel(label) {
  return ALARM_LABELS.some(k => label.includes(k))
}

function isSwitchLabel(label) {
  return SWITCH_LABELS.some(k => label.includes(k))
}

/** 根据 label 推断单位 */
export function inferUnit(label) {
  if (!label) return ''
  if (label.includes('温度')) return '℃'
  if (label.includes('湿度')) return '%RH'
  if (label.includes('流量')) return 'm³/h'
  if (label.includes('压差') || label.includes('压力')) return 'Pa'
  if (label.includes('频率')) return 'Hz'
  if (label.includes('二氧化碳') || label.includes('CO2') || label.includes('CO₂')) return 'ppm'
  if (label.includes('PM2.5') || label.includes('PM25')) return 'μg/m³'
  if (label.includes('开度') || (label.includes('反馈') && !label.includes('温度') && !label.includes('湿度')) || label.includes('调节') || (label.includes('控制') && label.includes('阀'))) return '%'
  if (label.includes('设定') && label.includes('温度')) return '℃'
  if (label.includes('设定') && label.includes('湿度')) return '%RH'
  if (label.includes('设定') && (label.includes('CO2') || label.includes('CO₂'))) return 'ppm'
  if (label.includes('开度') && label.includes('设定')) return '%'
  return ''
}

/**
 * 格式化系统参数项的值
 * - value 为 0/1 时，根据 label 判断渲染"开/关"或"正常/告警"
 * - 其他数值根据 label 拼接单位
 */
export function formatSystemParam(item) {
  const raw = item?.value
  if (raw === null || raw === undefined || raw === '') return '--'
  const label = item?.label || ''
  console.log('label1', label, raw)
  const str = String(raw)

  // 0/1 类型
  if (str === '0' || str === '1') {
    const isOne = str === '1'
    // 故障状态信号：0=正常 1=故障
    if (label.includes('故障')) return isOne ? '正常' : '故障'
    // 报警/保护类
    if (isAlarmLabel(label)) return isOne ? '正常' : '告警'
    // 开关控制类
    if (isSwitchLabel(label)) return isOne ? '开' : '关'
    // 手动/自动类
    // console.log('label2', label)
    if (label.includes('自动')) return isOne ? '自动' : '手动'
    // 默认 0/1 按开关处理
    return isOne ? '开' : '关'
  }

  // 其他数值：根据 label 拼单位
  const unit = inferUnit(label)
  const num = Number(str)
  const shown = Number.isFinite(num) && !Number.isInteger(num) ? num.toFixed(2) : str
  return unit ? `${shown} ${unit}` : shown
}
