<template>
  <div class="alert-page">
    <div class="stats-row">
      <StatCard label="待处理告警" :value="statData.pending" change-text="↓ 3 较昨日" trend="down" color="red" :icon="WarningOutlined" />
      <StatCard label="处理中" :value="statData.processing" change-text="↑ 2 较昨日" trend="up" color="orange" :icon="SyncOutlined" />
      <StatCard label="今日已处理" :value="statData.todayDone" change-text="↑ 8 较昨日" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="平均处理时长" :value="statData.avgTime" change-text="↓ 3.2min" trend="down" color="blue" :icon="ClockCircleOutlined" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><WarningOutlined /> 待处理告警</h3>
        <div class="filter-bar">
          <a-select v-model:value="levelFilter" style="width: 120px" placeholder="全部等级">
            <a-select-option value="">全部等级</a-select-option>
            <a-select-option value="紧急">紧急</a-select-option>
            <a-select-option value="重要">重要</a-select-option>
            <a-select-option value="一般">一般</a-select-option>
          </a-select>
          <a-select v-model:value="typeFilter" style="width: 130px" placeholder="全部类型">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="设备故障">设备故障</a-select-option>
            <a-select-option value="阈值告警">阈值告警</a-select-option>
            <a-select-option value="系统告警">系统告警</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <div class="alert-list">
          <div class="alert-card" :class="alert.level" v-for="alert in alertList" :key="alert.title">
            <div class="alert-icon">
              <WarningFilled v-if="alert.level === 'danger'" />
              <WarningOutlined v-else-if="alert.level === 'warning'" />
              <InfoCircleOutlined v-else />
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }} <span class="level-tag" :class="alert.level">{{ alert.levelLabel }}</span></div>
              <div class="alert-desc">{{ alert.description }}</div>
              <div class="alert-time">{{ alert.time }} | 持续 {{ alert.duration }}</div>
              <div class="alert-actions">
                <a-button type="primary" :danger="alert.level === 'danger'" size="small">确认并处理</a-button>
                <a-button size="small">转工单</a-button>
                <a-button size="small">视频核验</a-button>
                <a-button size="small">标记误报</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>对平台产生的各类告警信息进行集中处理和管理。支持告警确认、工单流转、视频核验、误报标记等操作，实现告警全生命周期管理，确保告警及时有效处理。</p>
      <div class="feature-list">
        <div class="feature-list-item">告警信息集中展示与分类过滤</div>
        <div class="feature-list-item">告警确认与处理流程管理</div>
        <div class="feature-list-item">工单自动流转与派发</div>
        <div class="feature-list-item">视频远程核验告警现场</div>
        <div class="feature-list-item">告警误报标记与反馈</div>
        <div class="feature-list-item">告警处理统计与KPI分析</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  WarningOutlined, SyncOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SearchOutlined, InfoCircleOutlined, WarningFilled,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AlertHandlePage' })

const statData = { pending: 12, processing: 5, todayDone: 28, avgTime: '12.5min' }
const levelFilter = ref('')
const typeFilter = ref('')

const alertList = [
  {
    level: 'danger', levelLabel: '紧急', title: 'A馆F2层烟感探测器异常',
    description: '烟感探测器ID: SMK-201 信号异常，信号强度 32%，需立即检查设备连接状态。该设备位于A馆F2层展厅A区域，属于消防重点监控区域。',
    time: '2026-06-09 13:42:18', duration: '3分钟',
  },
  {
    level: 'danger', levelLabel: '紧急', title: 'B馆消防水泵房压力异常',
    description: '消防水泵出口压力 0.45MPa，低于设定阈值 0.5MPa，可能影响消防供水能力。建议立即检查水泵运行状态及管网泄漏情况。',
    time: '2026-06-09 13:38:05', duration: '7分钟',
  },
  {
    level: 'warning', levelLabel: '重要', title: 'B馆空调机组能耗异常偏高',
    description: '当前能耗较基准值高出 23%，建议检查设备运行参数。机组AC-B-03运行电流异常，可能为滤网堵塞或冷媒不足导致。',
    time: '2026-06-09 13:35:05', duration: '10分钟',
  },
  {
    level: 'warning', levelLabel: '重要', title: 'C馆照明回路L-305离线',
    description: '智慧照明系统回路L-305通信中断，已自动切换备用模式。该回路控制C馆F2层展厅照明，涉及12个灯具。',
    time: '2026-06-09 13:28:33', duration: '17分钟',
  },
  {
    level: 'info', levelLabel: '一般', title: '停车系统接口异常',
    description: '停车管理系统HTTP API接口响应超时，已自动重连3次。当前系统处于降级模式，数据采集延迟约15分钟。',
    time: '2026-06-09 12:15:33', duration: '1小时30分钟',
  },
]
</script>

<style scoped lang="less">
.alert-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header { padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    h3 { font-size: 16px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
    .filter-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  }
  .card-body { padding: 22px; }
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 10px;
  border-left: 4px solid;
  transition: all 0.2s;

  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

  &.danger { background: #fff2f0; border-left-color: #ff4d4f; }
  &.warning { background: #fffbe6; border-left-color: #faad14; }
  &.info { background: #e6f4ff; border-left-color: #1677ff; }

  .alert-icon {
    width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
    .danger & { background: #ffccc7; color: #ff4d4f; }
    .warning & { background: #ffe58f; color: #faad14; }
    .info & { background: #bae0ff; color: #1677ff; }
  }

  .alert-content {
    flex: 1; min-width: 0;
    .alert-title { font-size: 14px; font-weight: 600; color: #1d2129; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    .level-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500;
      &.danger { background: #ffccc7; color: #742a2a; }
      &.warning { background: #ffe58f; color: #744210; }
      &.info { background: #bae0ff; color: #2a4365; }
    }
    .alert-desc { font-size: 13px; color: #4e5969; line-height: 1.6; }
    .alert-time { font-size: 12px; color: #86909c; margin-top: 6px; }
    .alert-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  }
}

.feature-panel {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%); border-radius: 12px; padding: 24px; margin-top: 20px; border: 1px solid #e8e0f0;
  h4 { font-size: 15px; font-weight: 600; color: #2d3748; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  p { font-size: 13px; color: #4a5568; line-height: 1.8; margin-bottom: 16px; }
  .feature-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    .feature-list-item { font-size: 12px; color: #5a6a8a; padding: 8px 12px; background: rgba(255,255,255,0.7); border-radius: 6px;
      &::before { content: '✓'; color: #52c41a; font-weight: 700; margin-right: 6px; }
    }
  }
}
</style>