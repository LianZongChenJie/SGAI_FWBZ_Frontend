<template>
  <div class="event-schedule">
    <a-card :title="title" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
            新增排期
        </a-button>
      </template>

      <div class="schedule-scroll">
        <div class="schedule-list">
          <div
            v-for="day in data"
            :key="day.date"
            class="schedule-day"
          >
            <div class="day-header">{{ day.label }}</div>
            <div
              v-for="(event, index) in day.events"
              :key="index"
              class="schedule-item"
              :style="{ borderLeftColor: event.color || '#1677ff' }"
            >
              <div class="event-time">{{ event.time }}</div>
              <div class="event-name">{{ event.name }}</div>
              <div class="event-meta">
                {{ event.location }} | {{ event.attendees }}人
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue'

// ===== 类型定义 =====
export interface EventItem {
  time: string              // 活动时间，如 "08:00-18:00"
  name: string              // 活动名称
  location: string          // 场馆位置
  attendees: number | string // 预计人数
  color?: string            // 左侧边框颜色（可选）
}

export interface DaySchedule {
  date: string              // 日期，如 "06/08"
  label: string             // 显示标签，如 "周一 06/08"
  events: EventItem[]
}

// ===== Props =====
withDefaults(
  defineProps<{
    title?: string
    data?: DaySchedule[]
  }>(),
  {
    title: '📅 本周活动排期',
    data: () => []
  }
)

// ===== Emits =====
const emit = defineEmits<{
  add: []
}>()


// ===== 事件处理 =====
const handleAdd = () => {
  emit('add')
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
}

.event-time {
  font-size: 11px;
  color: #86909c;
  margin-bottom: 4px;
}

.event-name {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.event-meta {
  font-size: 11px;
  color: #86909c;
  margin-top: 4px;
}

</style>