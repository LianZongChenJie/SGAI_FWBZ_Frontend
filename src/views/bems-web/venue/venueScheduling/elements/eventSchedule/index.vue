<template>
  <div class="event-schedule">
    <a-card :title="title" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
            + 新增排期
        </a-button>
      </template>

      <a-spin :spinning="loading">
        <div class="schedule-scroll">
          <div class="schedule-list">
            <div
              v-for="day in data"
              :key="day.date"
              class="schedule-day"
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
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
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

// ===== Props =====
withDefaults(
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
}>()


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
</style>
