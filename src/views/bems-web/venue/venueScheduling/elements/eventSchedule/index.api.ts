import type { ActiveMeetInfo, WeekActivityVO } from '../../index.api'

/** 活动排期项（使用后端 ActiveMeetInfo 类型） */
export type EventItem = ActiveMeetInfo

/** 每日活动排期（使用后端 WeekActivityVO 类型） */
export type DaySchedule = WeekActivityVO

/** 重新导出，方便外部引用 */
export type { ActiveMeetInfo, WeekActivityVO } from '../../index.api'
