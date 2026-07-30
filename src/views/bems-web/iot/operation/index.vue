<template>
  <div class="iot-page">
    <div class="stats-row">
      <StatCard label="链路总数" :value="statData.totalLinks" change-text="↑ 12 新增" trend="up" color="blue" :icon="LinkOutlined" />
      <StatCard label="正常链路" :value="statData.normalLinks" change-text="96.4% 正常" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="数据采集状态" :value="statData.collectionStatus" change-text="99.8% 完整" trend="up" color="orange" :icon="DownloadOutlined" />
      <StatCard label="数据处理状态" :value="statData.processStatus" change-text="实时处理" trend="up" color="red" :icon="SettingOutlined" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><LinkOutlined /> 链路状态监控</h3>
        <span class="tag tag-green">实时监控</span>
      </div>
      <div class="card-body">
        <div class="device-grid">
          <div class="device-card-item" v-for="link in linkData" :key="link.title">
            <div class="device-card-header">
              <div class="device-card-icon" :style="{ background: link.bgColor, color: link.iconColor }">
                <component :is="link.icon" />
              </div>
              <div>
                <div class="device-card-title">{{ link.title }}</div>
                <div class="device-card-meta">{{ link.meta }}</div>
              </div>
            </div>
            <div class="device-card-stats">
              <div class="device-card-stat">
                <div class="num">{{ link.status }}</div>
                <div class="lbl">状态</div>
              </div>
              <div class="device-card-stat">
                <div class="num">{{ link.latency }}</div>
                <div class="lbl">延迟</div>
              </div>
              <div class="device-card-stat" :class="{ 'stat-highlight': link.uptime === '中断' || link.uptime.includes('min') }">
                <div class="num">{{ link.uptime }}</div>
                <div class="lbl">可用</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>对物联网对接的各个平台的链路、接口运行状态、数据采集状态、数据处理状态进行监控，保障平台稳定运行。对物联网对接的各个平台的链路、接口运行状态、数据采集状态、数据处理状态进行监控，保障平台稳定运行。</p>
      <div class="feature-list">
        <div class="feature-list-item">网络链路连通性实时探测</div>
        <div class="feature-list-item">接口程序运行状态监控</div>
        <div class="feature-list-item">数据采集完整性校验</div>
        <div class="feature-list-item">数据处理流水线监控</div>
        <div class="feature-list-item">异常自动告警与故障转移</div>
        <div class="feature-list-item">平台稳定性SLI/SLO看板</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StatCard } from '/@/views/bems-web/components'
import {
  LinkOutlined, CheckCircleOutlined, DownloadOutlined, SettingOutlined,
  InfoCircleOutlined, ApiOutlined, DatabaseOutlined, CloudServerOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'IotOperationPage' })

const statData = { totalLinks: 56, normalLinks: 54, collectionStatus: '正常', processStatus: '正常' }

const linkData = [
  { title: '核心交换机链路', meta: '网络层', icon: ApiOutlined, bgColor: '#f0fff4', iconColor: '#38a169', status: '正常', latency: '1ms', uptime: '99.9%' },
  { title: '数据库连接池', meta: '数据层', icon: DatabaseOutlined, bgColor: '#f0fff4', iconColor: '#38a169', status: '正常', latency: '12ms', uptime: '45 连接数' },
  { title: '消息队列链路', meta: '中间件层', icon: CloudServerOutlined, bgColor: '#f0fff4', iconColor: '#38a169', status: '正常', latency: '5ms', uptime: '99.8%' },
  { title: '安防系统链路', meta: '应用层', icon: LinkOutlined, bgColor: '#f0fff4', iconColor: '#38a169', status: '正常', latency: '45ms', uptime: '99.7%' },
  { title: '照明系统链路', meta: '应用层', icon: LinkOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e', status: '异常', latency: '2,345ms', uptime: '15min' },
  { title: '停车系统链路', meta: '应用层', icon: LinkOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e', status: '离线', latency: '-', uptime: '中断' },
]
</script>

<style scoped lang="less">
.iot-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
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
  .device-card-item {
    background: #fafafa; border-radius: 10px; padding: 18px 20px; transition: all 0.25s ease; border: 1px solid #f0f0f0;
    &:hover { border-color: #d9d9d9; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .device-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
      .device-card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
      .device-card-title { font-size: 14px; font-weight: 600; color: #1d2129; }
      .device-card-meta { font-size: 12px; color: #86909c; margin-top: 2px; }
    }
    .device-card-stats { display: flex; gap: 16px; padding-top: 14px; border-top: 1px solid #f0f0f0;
      .device-card-stat { text-align: center; flex: 1;
        .num { font-size: 16px; font-weight: 700; color: #1d2129; line-height: 1.3; }
        .lbl { font-size: 11px; color: #86909c; margin-top: 2px; }
        &.stat-highlight .num { color: #ff4d4f; }
      }
    }
  }
}

.feature-panel {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%); border-radius: 12px; padding: 24px; margin-top: 20px; border: 1px solid #e8e0f0;
  h4 { font-size: 15px; font-weight: 600; color: #2d3748; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  p { font-size: 13px; color: #4a5568; line-height: 1.8; margin-bottom: 16px; }
  .feature-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    .feature-list-item { font-size: 12px; color: #5a6a8a; padding: 8px 12px; background: rgba(255,255,255,0.7); border-radius: 6px; display: flex; align-items: center; gap: 6px;
      &::before { content: '✓'; color: #52c41a; font-weight: 700; }
    }
  }
}
</style>