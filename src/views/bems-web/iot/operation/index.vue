<template>
  <div class="iot-page">
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in statCards"
        :key="index"
        :label="item.title"
        :value="item.value"
        :change-text="item.context"
        :trend="item.trend"
        :color="item.color"
        :icon="item.icon"
      />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><ApiOutlined /> 设备状态监控</h3>
        <span class="tag tag-green">实时监控</span>
      </div>
      <div class="card-body">
        <a-spin :spinning="deviceLoading" tip="加载中...">
          <div class="device-grid">
            <DeviceCard
              v-for="(item, index) in deviceList"
              :key="index"
              :title="item.title"
              :meta="item.meta"
              :icon="ApiOutlined"
              :icon-bg="item.iconBg"
              :icon-color="item.iconColor"
              :stats="item.stats"
            />
          </div>
          <div v-if="!deviceLoading && deviceList.length === 0" class="empty-state">
            暂无数据
          </div>
        </a-spin>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { StatCard, DeviceCard } from '/@/views/bems-web/components'
import {
  LinkOutlined, CheckCircleOutlined, DownloadOutlined, SettingOutlined,
  ApiOutlined,
} from '@ant-design/icons-vue'
import { getSummary, getDeviceStatusMonitor } from './index.api'
import type { StatCardVO, SystemDeviceStatVO } from './index.api'

defineOptions({ name: 'IotOperationPage' })

// ===== 顶部统计卡片 =====
interface StatCardItem {
  title: string
  value: string | number
  context?: string
  trend: 'up' | 'down' | ''
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan'
  icon: any
}

// 按顺序配置每张卡片的颜色与图标，与接口返回的 StatCardVO 列表一一对应
const statCardConfig = [
  { color: 'blue' as const, icon: LinkOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: DownloadOutlined },
  { color: 'red' as const, icon: SettingOutlined },
]

const statCards = ref<StatCardItem[]>([])
const statLoading = ref(false)

const loadSummary = async () => {
  statLoading.value = true
  try {
    const res = await getSummary()
    const list: StatCardVO[] = Array.isArray(res) ? res : (res?.data || res?.result || [])
    statCards.value = (list || []).map((item, index) => {
      const cfg = statCardConfig[index] || { color: 'blue' as const, icon: LinkOutlined }
      // 根据 context 中的箭头方向推断趋势
      const ctx = item.context || ''
      let trend: 'up' | 'down' | '' = ''
      if (ctx.includes('↑')) trend = 'up'
      else if (ctx.includes('↓')) trend = 'down'
      return {
        title: item.title || '',
        value: (item.value ?? '--'),
        context: ctx,
        trend,
        color: cfg.color,
        icon: cfg.icon,
      }
    })
  } catch (e) {
    console.error('加载卡片汇总失败:', e)
  } finally {
    statLoading.value = false
  }
}

// ===== 设备状态监控 =====
interface DeviceCardItem {
  title: string
  meta: string
  iconBg: string
  iconColor: string
  stats: { label: string; value: string | number; highlight?: boolean }[]
}

const deviceList = ref<DeviceCardItem[]>([])
const deviceLoading = ref(false)

const loadDeviceStatus = async () => {
  deviceLoading.value = true
  try {
    const res = await getDeviceStatusMonitor()
    const list: SystemDeviceStatVO[] = Array.isArray(res) ? res : (res?.data || res?.result || [])
    deviceList.value = (list || []).map((item) => {
      const onlineRate = item.onlineRate ?? 0
      const offline = (item.deviceCount ?? 0) - (item.online ?? 0)
      // 在线率低于 100% 时高亮显示
      const normal = onlineRate >= 100
      return {
        title: item.systemName || '--',
        meta: '设备状态',
        iconBg: normal ? '#f0fff4' : '#fff5f5',
        iconColor: normal ? '#38a169' : '#e53e3e',
        stats: [
          { label: '设备总数', value: item.deviceCount ?? 0 },
          { label: '在线', value: item.online ?? 0 },
          { label: '离线', value: offline, highlight: offline > 0 },
        ],
      }
    })
  } catch (e) {
    console.error('加载设备状态监控失败:', e)
  } finally {
    deviceLoading.value = false
  }
}

onMounted(() => {
  loadSummary()
  loadDeviceStatus()
})
</script>

<style scoped lang="less">
.iot-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 20px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header {
    padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    h3 { font-size: 16px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
    .tag { font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 500; }
    .tag-green { background: #c6f6d5; color: #22543d; }
  }
  .card-body { padding: 22px; }
}

.device-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}

.empty-state {
  text-align: center; color: #86909c; padding: 40px 0; font-size: 14px;
}
</style>
