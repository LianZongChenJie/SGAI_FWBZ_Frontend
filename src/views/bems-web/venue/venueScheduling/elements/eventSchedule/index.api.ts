/** 活动排期项 */
export interface EventItem {
  time: string              // 活动时间，如 "08:00-18:00"
  name: string              // 活动名称
  location: string          // 场馆位置
  attendees: number | string // 预计人数
  color?: string            // 左侧边框颜色（可选）
}

/** 每日活动排期 */
export interface DaySchedule {
  date: string              // 日期，如 "06/08"
  label: string             // 显示标签，如 "周一 06/08"
  events: EventItem[]
}
