<template>
  <div class="ai-page">
    <div class="stats-row">
      <StatCard label="累计节能量" :value="statData.totalSaving" change-text="↑ 15.3% 较上月" trend="up" color="blue" :icon="ThunderboltOutlined" />
      <StatCard label="节能收益率" :value="statData.savingRate" change-text="↑ 3.2% 较上月" trend="up" color="green" :icon="RiseOutlined" />
      <StatCard label="AI优化策略" :value="statData.strategyCount" change-text="↑ 8 新增" trend="up" color="orange" :icon="BulbOutlined" />
      <StatCard label="碳减排量" :value="statData.carbonReduction" change-text="↑ 12.5% 较上月" trend="up" color="purple" :icon="EnvironmentOutlined" />
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 节能效果分析</h3>
          <div class="btn-group">
            <a-button type="primary" size="small">本周</a-button>
            <a-button size="small">本月</a-button>
            <a-button size="small">本年</a-button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">AI节能效果对比分析图</div>
            <div class="chart-sub">优化前能耗 vs 优化后能耗</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><PieChartOutlined /> 节能措施分布</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">各项节能措施贡献占比</div>
            <div class="chart-sub">空调优化 45% | 照明控制 25% | 设备调度 20% | 其他 10%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><BulbOutlined /> AI节能优化策略</h3>
        <a-button type="primary"><PlusOutlined /> 新增策略</a-button>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 8 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === '运行中' ? 'normal' : 'info'">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'effect'">
              <span style="color: #52c41a; font-weight: 500;">{{ record.effect }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">查看</a-button>
              <a-button type="link" size="small">编辑</a-button>
              <a-button type="link" size="small" danger>停用</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>基于AI算法对场馆能源消耗进行智能优化，通过分析历史能耗数据、设备运行参数、环境因素等多维数据，自动生成节能优化策略，实现能源消耗的精细化管理。</p>
      <div class="feature-list">
        <div class="feature-list-item">AI智能节能策略自动生成</div>
        <div class="feature-list-item">空调/照明/设备等多系统协同优化</div>
        <div class="feature-list-item">节能效果实时量化评估</div>
        <div class="feature-list-item">节能策略自适应调整</div>
        <div class="feature-list-item">能耗异常智能诊断</div>
        <div class="feature-list-item">节能报告自动生成</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StatCard } from '/@/views/bems-web/components'
import {
  ThunderboltOutlined, RiseOutlined, BulbOutlined, EnvironmentOutlined,
  BarChartOutlined, PieChartOutlined, PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AiEnergyPage' })

const statData = { totalSaving: '326,500 kWh', savingRate: '18.5%', strategyCount: 24, carbonReduction: '185 tCO₂' }

const columns = [
  { title: '策略名称', dataIndex: 'name', key: 'name' },
  { title: '适用系统', dataIndex: 'system', key: 'system', width: 100 },
  { title: '适用场馆', dataIndex: 'venue', key: 'venue', width: 80 },
  { title: '策略描述', dataIndex: 'desc', key: 'desc' },
  { title: '节能效果', dataIndex: 'effect', key: 'effect', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 70 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
]

const tableData = [
  { id: 1, name: '空调机组智能调温策略', system: '空调系统', venue: 'A馆', desc: '根据客流密度和室外温度动态调整空调出水温度', effect: '节能 12.5%', status: '运行中' },
  { id: 2, name: '照明回路智能控制策略', system: '照明系统', venue: 'B馆', desc: '根据自然光照和人员活动自动调节照明亮度', effect: '节能 8.3%', status: '运行中' },
  { id: 3, name: '新风机组CO₂联动策略', system: '新风系统', venue: 'C馆', desc: '根据CO₂浓度和客流数据动态调整新风量', effect: '节能 6.8%', status: '运行中' },
  { id: 4, name: '冷源系统优化调度策略', system: '冷源系统', venue: 'A馆', desc: '根据负荷预测优化冷机启停和运行台数', effect: '节能 15.2%', status: '运行中' },
  { id: 5, name: '光伏发电最大利用策略', system: '光伏系统', venue: '屋顶', desc: '根据天气预测优化储能充放电策略', effect: '节能 10.5%', status: '运行中' },
  { id: 6, name: '设备休眠策略', system: '综合', venue: '全馆', desc: '非运营时段自动进入低功耗休眠模式', effect: '节能 5.2%', status: '待启用' },
]
</script>

<style scoped lang="less">
.ai-page { padding: 0; }
</style>