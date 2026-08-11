<template>
  <div class="event-schedule">
    <a-card :bordered="false">
      <template #title>
        <span>{{ title }}</span>
      </template>
      <template #extra>
        <div class="header-extra">
          <a-radio-group v-model:value="period" button-style="solid" @change="handlePeriodChange">
            <a-radio-button value="week">本周</a-radio-button>
            <a-radio-button value="month">本月</a-radio-button>
          </a-radio-group>
          <a-button type="primary" @click="handleAdd">
            + 新增排期
          </a-button>
        </div>
      </template>

      <a-spin :spinning="loading">
        <!-- 本周视图 -->
        <div v-if="period === 'week'" class="schedule-scroll">
          <div class="schedule-list">
            <div
              v-for="day in weekData"
              :key="day.date"
              class="schedule-day"
              :class="{ 'is-today': isToday(day.date) }"
            >
              <div class="day-header">{{ formatDayHeader(day.date) }}</div>
              <div
                v-for="(event, index) in day.list"
                :key="event.id"
                class="schedule-item"
                :style="{ borderLeftColor: getColor(index) }"
              >
                <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
                <div class="event-row">
                  <a-tooltip :title="event.activeName" placement="topLeft">
                    <div class="event-name">{{ event.activeName }}</div>
                  </a-tooltip>
                  <a-popconfirm
                    title="确认删除该活动？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="handleDelete(event)"
                  >
                    <DeleteOutlined class="event-delete" @click.stop />
                  </a-popconfirm>
                </div>
                <div class="event-meta">
                  {{ event.venueName }}{{ event.venueFloors ? ' ' + event.venueFloors : '' }} | {{ event.peopleQuantity }}人
                </div>
              </div>
              <div v-if="!day.list || day.list.length === 0" class="event-empty">暂无活动</div>
            </div>
          </div>
        </div>

        <!-- 本月视图 -->
        <div v-else class="month-calendar">
          <div class="month-weekdays">
            <div v-for="w in weekDayNames" :key="w" class="month-weekday">{{ w }}</div>
          </div>
          <div class="month-grid">
            <div
              v-for="(cell, idx) in monthDays"
              :key="idx"
              class="month-day"
              :class="{ 'other-month': !cell.isCurrentMonth, 'is-today': isToday(cell.dateStr) }"
            >
              <div class="month-day-num">{{ cell.date }}</div>
              <div class="month-day-events">
                <a-tooltip
                  v-for="event in cell.events"
                  :key="event.id"
                  placement="topLeft"
                >
                  <template #title>
                    <div class="event-tooltip">
                      <div>活动名称：{{ event.activeName }}</div>
                      <div>日期：{{ event.startDate }}</div>
                      <div>时间：{{ event.startTime }} - {{ event.endTime }}</div>
                      <div>场馆：{{ event.venueName }}</div>
                      <div v-if="event.venueFloors">楼层：{{ event.venueFloors }}</div>
                      <div>预计人数：{{ event.peopleQuantity }}人</div>
                    </div>
                  </template>
                  <div class="month-event-tag" :style="{ borderLeftColor: getColor(event._index || 0) }">
                    {{ event.activeName }}
                  </div>
                </a-tooltip>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { DeleteOutlined } from '@ant-design/icons-vue'
import type { DaySchedule } from './index.api'

dayjs.locale('zh-cn')

// ===== 预置10个颜色，循环使用 =====
const COLORS = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa541c',
  '#2f54eb',
  '#a0d911',
  '#f5222d',
]

/** 根据索引循环获取颜色 */
const getColor = (index: number): string => {
  return COLORS[index % COLORS.length]
}

/** 将日期格式化为 "周几 MM/DD" */
const formatDayHeader = (date?: string): string => {
  if (!date) return ''
  const weekday = dayjs(date).format('ddd')   // 周一
  const dateStr = dayjs(date).format('MM/DD') // 08/03
  return `${weekday} ${dateStr}`
}

/** 判断是否为今天 */
const isToday = (date?: string): boolean => {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

// ===== Props =====
const props = withDefaults(
  defineProps<{
    title?: string
    data?: DaySchedule[]
    loading?: boolean
  }>(),
  {
    title: '📅 本周活动排期',
    data: () => [],
    loading: false,
  }
)

// ===== Emits =====
const emit = defineEmits<{
  add: []
  delete: [event: any]
  changePeriod: [period: string]
}>()

// ===== 本周/本月切换 =====
const period = ref<string>('week')

const handlePeriodChange = (e: any) => {
  emit('changePeriod', e.target.value)
}

/** 生成当前周的7天（周一到周日） */
const generateWeekDays = (): DaySchedule[] => {
  const today = dayjs()
  const dayOfWeek = today.day() // 0=周日, 1=周一, ..., 6=周六
  // 计算本周周一的日期
  const monday = today.subtract(dayOfWeek === 0 ? 6 : dayOfWeek - 1, 'day')
  return Array.from({ length: 7 }, (_, i) => {
    const date = monday.add(i, 'day')
    return {
      date: date.format('YYYY-MM-DD'),
      list: [],
    }
  })
}

/** 将后端数据合并到7天卡片中 */
const weekData = computed<DaySchedule[]>(() => {
  const weekDays = generateWeekDays()
  if (!props.data || props.data.length === 0) return weekDays

  // 将后端数据按日期建立映射
  const dataMap = new Map<string, any[]>()
  props.data.forEach((day) => {
    if (day.date) {
      const dateKey = dayjs(day.date).format('YYYY-MM-DD')
      dataMap.set(dateKey, day.list || [])
    }
  })

  // 合并：将后端数据匹配到对应的日期卡片
  return weekDays.map((day) => {
    const matchedList = dataMap.get(day.date!)
    return {
      ...day,
      list: matchedList || [],
    }
  })
})

// ===== 本月日历 =====
const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

interface MonthCell {
  date: number
  dateStr: string
  isCurrentMonth: boolean
  events: any[]
}

const monthDays = computed<MonthCell[]>(() => {
  const now = dayjs()
  const year = now.year()
  const month = now.month() // 0-based

  const firstDay = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`)
  const daysInMonth = now.daysInMonth()
  // 周一为一周的第一天
  const startWeekday = firstDay.day() // 0=周日
  const offset = startWeekday === 0 ? 6 : startWeekday - 1

  // 构建日期 → 活动映射
  const eventMap = new Map<string, any[]>()
  let globalIndex = 0
  if (props.data && props.data.length > 0) {
    props.data.forEach((day) => {
      if (day.date) {
        const dateKey = dayjs(day.date).format('YYYY-MM-DD')
        const events = (day.list || []).map((evt) => ({
          ...evt,
          _index: globalIndex++,
        }))
        eventMap.set(dateKey, events)
      }
    })
  }

  const cells: MonthCell[] = []

  // 上月末尾日期
  const prevMonth = dayjs(firstDay).subtract(1, 'month')
  const prevMonthDays = prevMonth.daysInMonth()
  for (let i = offset - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const dateStr = prevMonth.date(d).format('YYYY-MM-DD')
    cells.push({
      date: d,
      dateStr,
      isCurrentMonth: false,
      events: eventMap.get(dateStr) || [],
    })
  }

  // 当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = now.date(i).format('YYYY-MM-DD')
    cells.push({
      date: i,
      dateStr,
      isCurrentMonth: true,
      events: eventMap.get(dateStr) || [],
    })
  }

  // 下月开头日期，补足 42 格
  const remaining = 42 - cells.length
  const nextMonth = dayjs(firstDay).add(1, 'month')
  for (let i = 1; i <= remaining; i++) {
    const dateStr = nextMonth.date(i).format('YYYY-MM-DD')
    cells.push({
      date: i,
      dateStr,
      isCurrentMonth: false,
      events: eventMap.get(dateStr) || [],
    })
  }

  return cells
})

// ===== 事件处理 =====
const handleAdd = () => {
  emit('add')
}

const handleDelete = (event: any) => {
  emit('delete', event)
}
</script>

<style scoped lang="less">
.event-schedule {
  width: 100%;
}

.header-extra {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== 本周视图 ===== */
.schedule-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
}

.schedule-list {
  display: flex;
  gap: 16px;
  min-width: max-content;
}

.schedule-day {
  min-width: 220px;
  max-width: 260px;
  background: #fafafa;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  flex: 1;

  &.is-today {
    background: #e6f4ff;
    border-color: #69b1ff;

    .day-header {
      color: #1677ff;
    }
  }
}

.day-header {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.schedule-item {
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-left: 3px solid #1677ff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    .event-delete {
      opacity: 1;
    }
  }
}

.event-time {
  font-size: 11px;
  color: #86909c;
  margin-bottom: 4px;
}

.event-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.event-name {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.event-delete {
  font-size: 14px;
  color: #ff4d4f;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #ff7875;
  }
}

.event-meta {
  font-size: 11px;
  color: #86909c;
  margin-top: 4px;
}

.event-empty {
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
  padding: 12px 0;
}

/* ===== 本月日历视图 ===== */
.month-calendar {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.month-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.month-weekday {
  padding: 10px 4px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 1px;
  background: #f0f0f0;
}

.month-day {
  background: #fff;
  padding: 4px 6px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.15s;

  &:hover {
    background: #f6f8fa;
  }

  &.other-month {
    background: #fafbfc;

    .month-day-num {
      color: #c0c4cc;
    }
  }

  &.is-today {
    background: #e6f4ff;

    .month-day-num {
      color: #1677ff;
      font-weight: 600;
    }
  }
}

.month-day-num {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.month-day-events {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
}

.month-event-tag {
  font-size: 11px;
  line-height: 1.4;
  padding: 2px 6px;
  border-radius: 3px;
  background: #f0f5ff;
  color: #1d2129;
  border-left: 3px solid #1677ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #d6e4ff;
  }
}

.event-tooltip {
  font-size: 13px;
  line-height: 1.8;

  > div {
    white-space: nowrap;
  }
}
</style>
