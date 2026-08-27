/**
 * 弹窗组件共享工具函数
 * 从 BuildingAutomationPage.vue 中提取的 format / pointTone / state 逻辑
 */

/** 读取点位值 */
export function getValue(values, key) {
  return values[key] ?? '--'
}

/** 格式化点位显示值 */
export function formatValue(values, row) {
  const v = getValue(values, row.key)
  if (row.type === 'boolean') {
    return v
      ? (row.key.includes('fault') || row.key.includes('Alarm') ? '报警' : '是')
      : (row.key.includes('fault') || row.key.includes('Alarm') ? '正常' : '否')
  }
  const shown = typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(1) : v
  return `${shown}${row.unit ? ` ${row.unit}` : ''}`
}

/** 点位状态样式 */
export function pointTone(values, row) {
  const v = getValue(values, row.key)
  if (row.type === 'boolean' && v && (row.key.includes('fault') || row.key.includes('Alarm'))) return 'bad'
  if (row.type === 'boolean' && v) return 'good'
  return ''
}

/** 计算设备状态文本 */
export function getStateText(values, prefix) {
  const fault = Boolean(values[`${prefix}.fault`])
  const running = Boolean(values[`${prefix}.running`] ?? values[`${prefix}.fanEnable`])
  return fault ? '故障' : running ? '运行' : '停止'
}

/** 计算设备状态样式类 */
export function getStateTone(values, prefix) {
  const fault = Boolean(values[`${prefix}.fault`])
  const running = Boolean(values[`${prefix}.running`] ?? values[`${prefix}.fanEnable`])
  return fault ? 'fault' : running ? 'running' : 'stopped'
}

/** 按 prefix 过滤点位列表 */
export function filterPoints(catalog, prefix) {
  return catalog.filter(p => p.key.startsWith(prefix + '.'))
}
