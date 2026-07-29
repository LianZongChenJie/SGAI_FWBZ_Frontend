<template>
  <a-card class="stat-card" :class="color" :bordered="false" hoverable>
    <!-- 标签 -->
    <div class="stat-label">{{ label }}</div>
    <!-- 数值 -->
    <div class="stat-value">{{ value }}</div>
    <!-- 变化趋势 -->
    <div v-if="changeText" class="stat-change" :class="trend">
      <component
        v-if="trend === 'up' || trend === 'down'"
        :is="trend === 'up' ? ArrowUpOutlined : ArrowDownOutlined"
      />
      {{ changeText }}
    </div>
    <!-- 右上角图标 -->
    <div v-if="icon" class="stat-icon" :class="color">
      <component :is="icon" />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'StatCard' })

defineProps({
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
  trend: {
    type: String as () => 'up' | 'down' | '',
    default: ''
  },
  color: {
    type: String as () => 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan',
    default: 'blue'
  },
  icon: {
    type: [String, Object],
    default: ''
  }
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
  }

  .stat-label {
    font-size: 13px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 10px;
    font-weight: 400;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.88);
    margin-bottom: 8px;
    line-height: 1.2;
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

    .anticon {
      font-size: 12px;
    }
  }

  .stat-icon {
    position: absolute;
    right: 18px;
    top: 18px;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;

    &.blue   { background: #e6f4ff; color: #1677ff; }
    &.green  { background: #f6ffed; color: #52c41a; }
    &.orange { background: #fffbe6; color: #faad14; }
    &.red    { background: #fff2f0; color: #ff4d4f; }
    &.purple { background: #f9f0ff; color: #722ed1; }
    &.cyan   { background: #e6fffb; color: #13c2c2; }
  }
}
</style>