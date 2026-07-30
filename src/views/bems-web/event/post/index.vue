<template>
  <div class="event-page">
    <div class="stats-row">
      <StatCard label="已完成展会" :value="statData.completedEvents" change-text="↑ 3 较上月" trend="up" color="blue" :icon="CheckCircleOutlined" />
      <StatCard label="总参展人数" :value="statData.totalVisitors" change-text="↑ 15.3% 较上月" trend="up" color="green" :icon="TeamOutlined" />
      <StatCard label="总成交额" :value="statData.totalDeal" change-text="↑ 22.5% 较上月" trend="up" color="orange" :icon="DollarOutlined" />
      <StatCard label="展商满意度" :value="statData.satisfaction" change-text="↑ 0.3 较上月" trend="up" color="purple" :icon="StarOutlined" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><FileTextOutlined /> 展会总结报告</h3>
        <div class="filter-bar">
          <a-select v-model:value="eventFilter" style="width: 150px" placeholder="全部展会">
            <a-select-option value="">全部展会</a-select-option>
            <a-select-option value="2024国际车展">2024国际车展</a-select-option>
            <a-select-option value="智慧城市博览会">智慧城市博览会</a-select-option>
            <a-select-option value="家居设计展">家居设计展</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
          <a-button><DownloadOutlined /> 导出报表</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 8 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'satisfaction'">
              <span class="star-rating">
                <StarFilled v-for="i in Math.floor(record.satisfaction)" :key="i" style="color: #faad14;" />
                <StarOutlined v-for="i in (5 - Math.floor(record.satisfaction))" :key="'e' + i" style="color: #d9d9d9;" />
                <span style="margin-left: 4px; font-size: 12px;">{{ record.satisfaction }}</span>
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">查看报告</a-button>
              <a-button type="link" size="small">下载</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 展会数据统计分析</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各展会数据对比分析图</div>
            <div class="chart-sub">参展人数 | 成交额 | 满意度</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><PieChartOutlined /> 展会类型分布</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">展会类型占比分析</div>
            <div class="chart-sub">汽车展 25% | 科技展 40% | 家居展 20% | 其他 15%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>对已完成的会展活动进行总结分析和数据沉淀。自动生成展会总结报告，包含客流数据、成交情况、展商满意度等多维度分析，为后续展会运营提供数据支撑。</p>
      <div class="feature-list">
        <div class="feature-list-item">展会总结报告自动生成</div>
        <div class="feature-list-item">多维度数据统计分析</div>
        <div class="feature-list-item">展商满意度调查与评价</div>
        <div class="feature-list-item">展会投入产出分析</div>
        <div class="feature-list-item">展会数据报告导出</div>
        <div class="feature-list-item">展会运营优化建议</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  CheckCircleOutlined, TeamOutlined, DollarOutlined, StarOutlined,
  FileTextOutlined, BarChartOutlined, PieChartOutlined,
  SearchOutlined, DownloadOutlined, InfoCircleOutlined, StarFilled,
} from '@ant-design/icons-vue'

defineOptions({ name: 'EventPostPage' })

const statData = { completedEvents: 12, totalVisitors: '35,280', totalDeal: '¥2,850万', satisfaction: '4.8' }
const eventFilter = ref('')

const columns = [
  { title: '展会名称', dataIndex: 'name', key: 'name' },
  { title: '举办时间', dataIndex: 'date', key: 'date', width: 120 },
  { title: '展商数', dataIndex: 'exhibitors', key: 'exhibitors', width: 80 },
  { title: '参展人数', dataIndex: 'visitors', key: 'visitors', width: 100 },
  { title: '成交额', dataIndex: 'deal', key: 'deal', width: 110 },
  { title: '满意度', dataIndex: 'satisfaction', key: 'satisfaction', width: 150 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
]

const tableData = [
  { id: 1, name: '2024国际车展', date: '2024-03-01~03-05', exhibitors: 86, visitors: '12,580', deal: '¥1,200万', satisfaction: 4.8 },
  { id: 2, name: '智慧城市博览会', date: '2024-02-20~02-23', exhibitors: 120, visitors: '15,200', deal: '¥980万', satisfaction: 4.7 },
  { id: 3, name: '家居设计展', date: '2024-02-10~02-12', exhibitors: 65, visitors: '7,500', deal: '¥670万', satisfaction: 4.9 },
  { id: 4, name: '国际教育展', date: '2024-01-15~01-18', exhibitors: 45, visitors: '8,900', deal: '¥350万', satisfaction: 4.5 },
  { id: 5, name: '人工智能大会', date: '2024-01-05~01-08', exhibitors: 78, visitors: '11,200', deal: '¥780万', satisfaction: 4.6 },
  { id: 6, name: '绿色能源峰会', date: '2023-12-20~12-22', exhibitors: 52, visitors: '6,800', deal: '¥520万', satisfaction: 4.7 },
]
</script>

<style scoped lang="less">
.event-page { padding: 0; }

.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
</style>