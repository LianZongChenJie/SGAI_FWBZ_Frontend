<!--
 * @component AlertCard
 * @description 告警卡片
 -->
<template>
  <div class="alert-card" :class="level">
    <div class="alert-icon">
      <component :is="iconMap[level]" />
    </div>
    <div class="alert-content">
      <div class="alert-header">
        <span class="alert-title">{{ title }}</span>
        <a-tag :color="levelColorMap[level]" size="small">{{ levelLabel }}</a-tag>
      </div>
      <div class="alert-desc">{{ description }}</div>
      <div class="alert-time">{{ time }}</div>
      <div class="alert-actions">
        <slot name="actions">
          <!-- 默认展示3个按钮 -->
          <a-button size="small" type="primary" :danger="level === 'danger'" @click="handleAction('confirm')">
            确认
          </a-button>
          <a-button size="small" @click="handleAction('transfer')">
            转工单
          </a-button>
          <a-button size="small" @click="handleAction('video')">
            视频核验
          </a-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WarningFilled, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

export type AlertLevel = 'danger' | 'warning' | 'info'

const props = withDefaults(
  defineProps<{
    level: AlertLevel
    title: string
    description: string
    time: string
  }>(),
  {
    level: 'info'
  }
)

const emit = defineEmits<{
  action: [type: string]
}>()

const levelMap = {
  danger: { label: '紧急', icon: WarningFilled, color: 'error' },
  warning: { label: '重要', icon: WarningOutlined, color: 'warning' },
  info: { label: '一般', icon: InfoCircleOutlined, color: 'processing' }
}

const levelLabel = computed(() => levelMap[props.level].label)
const iconMap = {
  danger: WarningFilled,
  warning: WarningOutlined,
  info: InfoCircleOutlined
}
const levelColorMap = {
  danger: 'error',
  warning: 'warning',
  info: 'processing'
}

const handleAction = (type: string) => {
  emit('action', type)
}
</script>

<style scoped lang="less">
.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &.danger {
    background: #fff2f0;
    border-left-color: #ff4d4f;
  }

  &.warning {
    background: #fffbe6;
    border-left-color: #faad14;
  }

  &.info {
    background: #e6f4ff;
    border-left-color: #1677ff;
  }
}

.alert-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;

  .danger & {
    background: #ffccc7;
    color: #ff4d4f;
  }

  .warning & {
    background: #ffe58f;
    color: #faad14;
  }

  .info & {
    background: #bae0ff;
    color: #1677ff;
  }
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.alert-desc {
  font-size: 13px;
  color: #4e5969;
  line-height: 1.6;
}

.alert-time {
  font-size: 12px;
  color: #86909c;
  margin-top: 6px;
}

.alert-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
</style>