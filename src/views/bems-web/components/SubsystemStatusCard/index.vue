<!--
 * @component SubsystemStatusCard
 * @description 子系统对接状态卡片
-->
<template>
  <a-card class="subsystem-card" :class="{ 'has-error': hasError }" hoverable @click="emit('click')">
    <!-- 头部：图标 + 标题 + 状态 -->
    <div class="subsystem-card-header">
      <div class="subsystem-card-icon" :style="{ background: iconBg, color: iconColor }">
        <component :is="icon" />
      </div>
      <div class="subsystem-card-info">
        <div class="subsystem-card-title">{{ title }}</div>
        <div class="subsystem-card-meta">{{ meta }}</div>
        <div class="subsystem-card-status" :class="statusClass">
          <span class="status-dot"></span>
          {{ status }}
        </div>
      </div>
    </div>

    <!-- 连接状态信息 -->
    <div class="subsystem-card-connection">
      <div class="connection-item">
        <div class="connection-label">接口地址</div>
        <div class="connection-value">{{ connection.address }}</div>
      </div>
      <div class="connection-item">
        <div class="connection-label">协议类型</div>
        <div class="connection-value">{{ connection.protocol }}</div>
      </div>
      <div class="connection-item">
        <div class="connection-label">最后更新</div>
        <div class="connection-value">{{ connection.lastUpdate }}</div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="subsystem-card-stats">
      <div class="stat-item">
        <div class="stat-value">{{ stats.todayCalls }}</div>
        <div class="stat-label">今日调用</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.responseTime }}</div>
        <div class="stat-label">响应时间</div>
      </div>
      <div class="stat-item" :class="{ 'stat-error': stats.errorRate > 5 }">
        <div class="stat-value">{{ stats.errorRate }}%</div>
        <div class="stat-label">错误率</div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SubsystemStats {
  todayCalls: string
  responseTime: string
  errorRate: number
}

interface SubsystemConnection {
  address: string
  protocol: string
  lastUpdate: string
}

const props = defineProps<{
  title: string
  meta: string
  status: '在线' | '离线' | '异常'
  icon?: any
  iconBg?: string
  iconColor?: string
  connection: SubsystemConnection
  stats: SubsystemStats
}>()

const emit = defineEmits<{
  click: []
}>()

// 状态样式
const statusClass = computed(() => {
  switch (props.status) {
    case '在线': return 'status-online'
    case '离线': return 'status-offline'
    case '异常': return 'status-error'
    default: return ''
  }
})

// 是否存在错误状态
const hasError = computed(() => {
  return props.status === '离线' || props.status === '异常' || props.stats.errorRate > 5
})
</script>

<style scoped lang="less">
.subsystem-card {
  margin-bottom: 16px;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.has-error {
    border-left: 4px solid #ff4d4f;
  }
  
  :deep(.ant-card-body) {
    padding: 16px;
  }
}

.subsystem-card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.subsystem-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.subsystem-card-info {
  flex: 1;
  min-width: 0;
}

.subsystem-card-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}

.subsystem-card-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
}

.subsystem-card-status {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
  }
  
  &.status-online {
    color: #52c41a;
    .status-dot { background: #52c41a; }
  }
  
  &.status-offline {
    color: #8c8c8c;
    .status-dot { background: #8c8c8c; }
  }
  
  &.status-error {
    color: #ff4d4f;
    .status-dot { background: #ff4d4f; }
  }
}

.subsystem-card-connection {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .connection-label {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  
  .connection-value {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.85);
    font-family: monospace;
  }
}

.subsystem-card-stats {
  display: flex;
  justify-content: space-between;
  
  .stat-item {
    text-align: center;
    flex: 1;
    
    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.45);
    }
    
    &.stat-error {
      .stat-value {
        color: #ff4d4f;
      }
    }
  }
}
</style>