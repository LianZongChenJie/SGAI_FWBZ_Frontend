<!--
 * @component DeviceCard
 * @description 设备/子系统卡片
 -->
<template>
  <a-card class="device-card" :class="{ 'has-error': hasError }" hoverable @click="emit('click')">
    <!-- 头部：图标 + 标题 -->
    <div class="device-card-header">
      <div class="device-card-icon" :style="{ background: iconBg, color: iconColor }">
        <component :is="icon" />
      </div>
      <div>
        <div class="device-card-title">{{ title }}</div>
        <div class="device-card-meta">{{ meta }}</div>
      </div>
    </div>

    <!-- 统计数据行 -->
    <div class="device-card-stats">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="device-card-stat"
        :class="{ 'stat-highlight': stat.highlight }"
      >
        <div class="num">{{ stat.value }}</div>
        <div class="lbl">{{ stat.label }}</div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">

import { computed } from 'vue'

interface DeviceStat {
  label: string      // 统计项名称，如 "总数"、"运行"、"故障"
  value: string | number  // 统计数值，如 86、'2,340'
  highlight?: boolean     // 是否高亮（红色），通常用于故障/告警数
}

const props = defineProps<{
  title: string
  meta: string
  icon?: any
  iconBg?: string
  iconColor?: string
  stats?: DeviceStat[]
}>()

const emit = defineEmits<{
  click: []
}>()

console.log(props, 'props')

// 是否存在高亮项（故障/告警）
const hasError = computed(() => {
  return props.stats?.some((s) => s.highlight && Number(s.value) > 0) || false
})
</script>

<style scoped lang="less">
.device-card {
  border-radius: 12px;
  transition: all 0.25s ease;


  // 覆盖 a-card 内部 padding
  :deep(.ant-card-body) {
    padding: 18px 20px;
  }
}

.device-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.device-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.device-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.device-card-meta {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}

.device-card-stats {
  display: flex;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.device-card-stat {
  text-align: center;
  flex: 1;

  .num {
    font-size: 18px;
    font-weight: 700;
    color: #1d2129;
    line-height: 1.3;
  }

  .lbl {
    font-size: 11px;
    color: #86909c;
    margin-top: 2px;
  }

  &.stat-highlight {
    .num {
      color: #ff4d4f;
    }
  }
}
</style>