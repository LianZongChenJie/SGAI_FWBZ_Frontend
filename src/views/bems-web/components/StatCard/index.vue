<template>
  <a-card class="stat-card" :class="color" :bordered="false" hoverable>
    <!-- 左侧信息区 -->
    <div class="stat-info">
      <!-- 标签 -->
      <div class="stat-label">{{ label }}</div>
      <!-- 数值 -->
      <div class="stat-value">
        {{ value }}
        <span v-if="unit" class="stat-unit">{{ unit }}</span>
      </div>
      <!-- 变化趋势 -->
      <div v-if="changeText" class="stat-change" :class="trendClass">
        {{ changeText }}
      </div>
    </div>
    <!-- 右侧图标区 -->
    <div v-if="icon" class="stat-icon" :class="color">
      <component :is="icon" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'StatCard' })

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  changeText: {
    type: String,
    default: ''
  },
  color: {
    type: String as () => 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan',
    default: 'blue'
  },
  icon: {
    type: [String, Object],
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
})

// 根据 changeText 中是否包含箭头判断趋势方向，用于渲染不同颜色
const trendClass = computed(() => {
  if (props.changeText.includes('↑')) return 'up'
  if (props.changeText.includes('↓')) return 'down'
  return ''
})
</script>

<style scoped lang="less">
.stat-card {
  flex: 1;
  min-width: 180px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }

  // 左侧彩色竖条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    border-radius: 12px 0 0 12px;
    z-index: 1;
  }

  &.blue::before   { background: #1677ff; }
  &.green::before  { background: #52c41a; }
  &.orange::before { background: #faad14; }
  &.red::before    { background: #ff4d4f; }
  &.purple::before { background: #722ed1; }
  &.cyan::before   { background: #13c2c2; }

  :deep(.ant-card-body) {
    padding: 22px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .stat-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(0, 0, 0, 0.45);
    margin: 0;
    font-weight: 400;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.88);
    margin: 0;
    line-height: 1.2;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .stat-unit {
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
  }

  .stat-change {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;

    &.up   { color: #52c41a; }
    &.down { color: #ff4d4f; }
    // 无箭头时保持默认颜色
    &:not(.up):not(.down) {
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .stat-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;

    & span {
      font-size: 28px !important;
    }

    &.blue   { background: #e6f4ff; color: #1677ff; }
    &.green  { background: #f6ffed; color: #52c41a; }
    &.orange { background: #fffbe6; color: #faad14; }
    &.red    { background: #fff2f0; color: #ff4d4f; }
    &.purple { background: #f9f0ff; color: #722ed1; }
    &.cyan   { background: #e6fffb; color: #13c2c2; }
  }
}
</style>
