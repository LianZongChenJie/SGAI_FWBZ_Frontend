<template>
  <div class="dashboard-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        label="今日场馆客流"
        :value="statData.todayVisitors"
        change-text="↑ 15.3% 较昨日"
        trend="up"
        color="blue"
        :icon="TeamOutlined"
      />
      <StatCard
        label="设备在线率"
        :value="statData.deviceOnlineRate"
        change-text="↑ 0.8% 较上周"
        trend="up"
        color="green"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="今日能耗 (kWh)"
        :value="statData.todayEnergy"
        change-text="↓ 8.2% 较昨日"
        trend="down"
        color="orange"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="待处理告警"
        :value="statData.pendingAlerts"
        change-text="↓ 3 较昨日"
        trend="down"
        color="red"
        :icon="WarningOutlined"
      />
    </div>

    <!-- 快捷入口 -->
    <div class="quick-links">
      <div class="quick-link" v-for="link in quickLinks" :key="link.title" @click="handleQuickLink(link)">
        <div class="quick-link-icon" :style="{ background: link.bgColor, color: link.iconColor }">
          <component :is="link.icon" />
        </div>
        <div class="quick-link-title">{{ link.title }}</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="dashboard-charts">
      <div class="card">
        <div class="card-header">
          <h3><BarChartOutlined /> 能耗趋势分析</h3>
          <div class="btn-group">
            <a-button :type="energyPeriod === '7d' ? 'primary' : 'default'" size="small" @click="energyPeriod = '7d'">近7天</a-button>
            <a-button :type="energyPeriod === '30d' ? 'primary' : 'default'" size="small" @click="energyPeriod = '30d'">近30天</a-button>
            <a-button :type="energyPeriod === 'year' ? 'primary' : 'default'" size="small" @click="energyPeriod = 'year'">本年</a-button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">能耗趋势折线图 / 柱状图组合</div>
            <div class="chart-sub">展示电、水、气等多能源类型的日/月消耗趋势</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><PieChartOutlined /> 能源结构占比</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 320px;">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">能源类型饼图 / 环形图</div>
            <div class="chart-sub">电力 65% | 天然气 20% | 水 12% | 其他 3%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 两栏布局：最新告警 + 今日会展活动 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><BellOutlined /> 最新告警</h3>
          <a-button size="small" @click="handleViewAllAlerts">查看全部</a-button>
        </div>
        <div class="card-body">
          <AlertCard
            v-for="alert in alertList"
            :key="alert.title"
            :level="alert.level"
            :title="alert.title"
            :description="alert.description"
            :time="alert.time"
            @action="(type: string) => handleAlertAction(alert, type)"
          />
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><CalendarOutlined /> 今日会展活动</h3>
          <span class="tag tag-green">进行中</span>
        </div>
        <div class="card-body">
          <div class="timeline">
            <div class="timeline-item" v-for="event in todayEvents" :key="event.title">
              <div class="timeline-time">{{ event.time }}</div>
              <div class="timeline-content">
                <strong>{{ event.title }}</strong><br />
                {{ event.location }} | 预计客流 {{ event.visitors }}人 | 状态: <span class="status-text" :class="event.status">{{ event.statusLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 子系统对接状态 -->
    <div class="card">
      <div class="card-header">
        <h3><ApiOutlined /> 子系统对接状态</h3>
        <span class="tag tag-green">运行正常</span>
      </div>
      <div class="card-body">
        <div class="device-grid">
          <div class="device-card-item" v-for="sub in subsystems" :key="sub.title">
            <div class="device-card-header">
              <div class="device-card-icon" :style="{ background: sub.bgColor, color: sub.iconColor }">
                <component :is="sub.icon" />
              </div>
              <div>
                <div class="device-card-title">{{ sub.title }}</div>
                <div class="device-card-meta">{{ sub.meta }}</div>
              </div>
            </div>
            <div class="device-card-stats">
              <div class="device-card-stat">
                <div class="num">{{ sub.total }}</div>
                <div class="lbl">设备总数</div>
              </div>
              <div class="device-card-stat">
                <div class="num">{{ sub.online }}</div>
                <div class="lbl">在线</div>
              </div>
              <div class="device-card-stat" :class="{ 'stat-highlight': sub.offline > 0 }">
                <div class="num">{{ sub.offline }}</div>
                <div class="lbl">离线</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import AlertCard from '/@/views/bems-web/components/AlertCard/index.vue'
import {
  TeamOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  BarChartOutlined,
  PieChartOutlined,
  BellOutlined,
  CalendarOutlined,
  ApiOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ExperimentOutlined,
  BulbOutlined,
  CarOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'DashboardPage' })

// ===== 统计数据 =====
const statData = {
  todayVisitors: '12,847',
  deviceOnlineRate: '98.6%',
  todayEnergy: '45,230',
  pendingAlerts: 12,
}

// ===== 快捷入口 =====
const quickLinks = [
  { title: '韧性安全', icon: SafetyOutlined, bgColor: '#ebf8ff', iconColor: '#3182ce', route: '/bems-web/safety/person' },
  { title: '节能低碳', icon: EnvironmentOutlined, bgColor: '#f0fff4', iconColor: '#38a169', route: '/bems-web/energy/operational-support' },
  { title: '物联网', icon: ApiOutlined, bgColor: '#fffaf0', iconColor: '#dd6b20', route: '/bems-web/iot/interface' },
  { title: '故障告警', icon: BellOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e', route: '/bems-web/alert/setting' },
  { title: '场馆运营', icon: BankOutlined, bgColor: '#faf5ff', iconColor: '#805ad5', route: '/bems-web/venue/flow' },
  { title: '会展服务', icon: ExperimentOutlined, bgColor: '#e6fffa', iconColor: '#00b5d8', route: '/bems-web/event/pre' },
]

// ===== 能耗趋势 =====
const energyPeriod = ref('30d')

// ===== 告警列表 =====
const alertList = [
  {
    level: 'danger' as const,
    title: 'A馆F2层烟感探测器异常',
    description: '烟感探测器ID: SMK-201 信号异常，需立即检查设备连接状态',
    time: '2026-06-09 13:42:18',
  },
  {
    level: 'warning' as const,
    title: 'B馆空调机组能耗异常偏高',
    description: '当前能耗较基准值高出 23%，建议检查设备运行参数',
    time: '2026-06-09 13:35:05',
  },
  {
    level: 'info' as const,
    title: 'C馆照明回路L-305离线',
    description: '智慧照明系统回路L-305通信中断，已自动切换备用模式',
    time: '2026-06-09 13:28:33',
  },
]

// ===== 今日会展活动 =====
const todayEvents = [
  { time: '08:00 - 18:00', title: '2026国际智能制造博览会', location: 'A馆1-3层', visitors: '8,000', status: 'normal', statusLabel: '正常' },
  { time: '09:00 - 17:00', title: '新能源产业高峰论坛', location: 'B馆会议中心', visitors: '2,500', status: 'normal', statusLabel: '正常' },
  { time: '14:00 - 20:00', title: '夏季汽车消费展', location: 'C馆室外广场', visitors: '5,000', status: 'warning', statusLabel: '筹备中' },
  { time: '明日 09:00', title: '数字文创产业交易会', location: 'A馆4层', visitors: '6,000', status: 'info', statusLabel: '待开始' },
]

// ===== 子系统对接 =====
const subsystems = [
  { title: '安防系统', meta: '视频监控 / 门禁', icon: SafetyOutlined, bgColor: '#ebf8ff', iconColor: '#3182ce', total: 156, online: 154, offline: 2 },
  { title: '消防系统', meta: '烟感 / 喷淋 / 报警', icon: WarningOutlined, bgColor: '#f0fff4', iconColor: '#38a169', total: 286, online: 283, offline: 3 },
  { title: '照明系统', meta: '回路 / 场景控制', icon: BulbOutlined, bgColor: '#fffaf0', iconColor: '#dd6b20', total: 128, online: 126, offline: 2 },
  { title: '楼控系统', meta: '空调 / 新风 / 配电', icon: ThunderboltOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e', total: 64, online: 63, offline: 1 },
  { title: '能源计量', meta: '电表 / 水表 / 气表', icon: BarChartOutlined, bgColor: '#faf5ff', iconColor: '#805ad5', total: 92, online: 91, offline: 1 },
  { title: '停车系统', meta: '车位 / 出入管理', icon: CarOutlined, bgColor: '#e6fffa', iconColor: '#00b5d8', total: 8, online: 8, offline: 0 },
]

// ===== 方法 =====
const handleQuickLink = (link: { title: string; route: string }) => {
  console.log('Navigate to:', link.route)
}

const handleViewAllAlerts = () => {
  console.log('View all alerts')
}

const handleAlertAction = (alert: { title: string }, type: string) => {
  console.log('Alert action:', alert.title, type)
}
</script>

<style scoped lang="less">
.dashboard-page {
  padding: 0;
}

// 统计卡片行
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

// 快捷入口
.quick-links {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  .quick-link {
    background: white;
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .quick-link-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin: 0 auto 12px;
    }

    .quick-link-title {
      font-size: 13px;
      font-weight: 500;
      color: #2d3748;
    }
  }
}

// 图表区域
.dashboard-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

// 卡片
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;

  .card-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }

    .tag-green { background: #c6f6d5; color: #22543d; }
    .tag-blue { background: #bee3f8; color: #2a4365; }
    .tag-orange { background: #feebc8; color: #744210; }
    .tag-red { background: #fed7d7; color: #742a2a; }
    .tag-purple { background: #e9d8fd; color: #553c9a; }

    .btn-group {
      display: flex;
      gap: 8px;
    }
  }

  .card-body {
    padding: 22px;
  }
}

// 两栏布局
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

// 图表占位
.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 280px;
  padding: 30px;

  .chart-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .chart-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }

  .chart-sub {
    font-size: 12px;
    color: #a0aec0;
    margin-top: 8px;
  }
}

// 时间线
.timeline {
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }

  .timeline-item {
    position: relative;
    padding-bottom: 20px;

    &:last-child {
      padding-bottom: 0;
    }

    &::before {
      content: '';
      position: absolute;
      left: -22px;
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #3182ce;
      border: 2px solid white;
      box-shadow: 0 0 0 2px #3182ce;
    }

    .timeline-time {
      font-size: 12px;
      color: #a0aec0;
      margin-bottom: 4px;
    }

    .timeline-content {
      font-size: 13px;
      color: #2d3748;
      line-height: 1.6;

      .status-text {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.normal { background: #c6f6d5; color: #22543d; }
        &.warning { background: #feebc8; color: #744210; }
        &.danger { background: #fed7d7; color: #742a2a; }
        &.info { background: #bee3f8; color: #2a4365; }
      }
    }
  }
}

// 设备卡片网格
.device-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .device-card-item {
    background: #fafafa;
    border-radius: 10px;
    padding: 18px 20px;
    transition: all 0.25s ease;
    border: 1px solid #f0f0f0;

    &:hover {
      border-color: #d9d9d9;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .device-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;

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
    }

    .device-card-stats {
      display: flex;
      gap: 16px;
      padding-top: 14px;
      border-top: 1px solid #f0f0f0;

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

        &.stat-highlight .num {
          color: #ff4d4f;
        }
      }
    }
  }
}
</style>