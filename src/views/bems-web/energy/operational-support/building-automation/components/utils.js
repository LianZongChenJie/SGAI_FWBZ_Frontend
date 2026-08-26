/**
 * 楼宇自控视图共享工具函数
 * 从 BuildingAutomationSchematic.vue 中提取的通用逻辑
 */

/** 创建绑定了 values 的辅助函数集合 */
export function createHelpers(values) {
  /** 读取点位值 */
  const p = (key) => values[key] ?? '--'

  /** 读取数值型点位并格式化为指定小数位 */
  const n = (key, d = 1) => {
    const x = Number(p(key))
    return Number.isFinite(x) ? x.toFixed(d) : '--'
  }

  /** 限制值在 0-100 之间 */
  const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0))

  /** 阀门旋转角度样式 */
  const valveStyle = (value) => ({ '--open': `${-42 + clamp(value) * .84}deg` })

  /** 报警样式判断 */
  const alarm = (key) => p(key) ? 'alarm' : 'normal'

  /** 风速档位文本 */
  const speedText = () => {
    const speed = Number(p('ba.fcu.speed'))
    return ['低速', '中速', '高速'][Math.max(0, speed - 1)] || '自动'
  }

  return { p, n, clamp, valveStyle, alarm, speedText }
}

/** 限制值在 0-100 之间（独立使用） */
export const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0))

/** 阀门旋转角度样式（独立使用） */
export const valveStyle = (value) => ({ '--open': `${-42 + clamp(value) * .84}deg` })
