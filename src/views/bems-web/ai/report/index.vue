<template>
  <div class="ai-page">
    <div class="stats-row">
      <StatCard label="报告总数" :value="statData.totalReports" change-text="↑ 12 本月" trend="up" color="blue" :icon="FileTextOutlined" />
      <StatCard label="本月生成" :value="statData.monthlyReports" change-text="↑ 3 较上月" trend="up" color="green" :icon="FileAddOutlined" />
      <StatCard label="运行分析报告" :value="statData.analysisReports" change-text="↑ 5 较上月" trend="up" color="orange" :icon="FundOutlined" />
      <StatCard label="平均评分" :value="statData.avgScore" change-text="↑ 0.2 较上月" trend="up" color="purple" :icon="StarOutlined" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><FileTextOutlined /> AI运行报告列表</h3>
        <div class="filter-bar">
          <a-select v-model:value="typeFilter" style="width: 140px" placeholder="全部类型">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="日报">日报</a-select-option>
            <a-select-option value="周报">周报</a-select-option>
            <a-select-option value="月报">月报</a-select-option>
            <a-select-option value="季报">季报</a-select-option>
          </a-select>
          <a-select v-model:value="statusFilter" style="width: 120px" placeholder="全部状态">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="已生成">已生成</a-select-option>
            <a-select-option value="生成中">生成中</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
          <a-button type="primary" ghost><PlusOutlined /> 生成报告</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 10 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === '已生成' ? 'normal' : 'warning'">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">查看</a-button>
              <a-button type="link" size="small">下载</a-button>
              <a-button type="link" size="small" danger>删除</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 报告生成趋势</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各类型报告生成数量趋势图</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><PieChartOutlined /> 报告类型分布</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 240px;">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">报告类型占比分析</div>
            <div class="chart-sub">日报 40% | 周报 30% | 月报 20% | 季报 10%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>AI自动生成各维度运行分析报告，涵盖能源消耗、设备运行、碳排放、场馆运营等数据。支持日报、周报、月报、季报等多种报告类型，提供数据趋势分析和异常预警，辅助运营管理决策。</p>
      <div class="feature-list">
        <div class="feature-list-item">多维度运行报告自动生成</div>
        <div class="feature-list-item">日报/周报/月报/季报全面覆盖</div>
        <div class="feature-list-item">AI智能数据分析和异常预警</div>
        <div class="feature-list-item">报告在线查看与下载</div>
        <div class="feature-list-item">历史报告归档与检索</div>
        <div class="feature-list-item">报告数据可视化展示</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  FileTextOutlined, FileAddOutlined, FundOutlined, StarOutlined,
  BarChartOutlined, PieChartOutlined, SearchOutlined, PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AiReportPage' })

const statData = { totalReports: 156, monthlyReports: 18, analysisReports: 45, avgScore: 4.6 }
const typeFilter = ref('')
const statusFilter = ref('')

const columns = [
  { title: '报告名称', dataIndex: 'name', key: 'name' },
  { title: '报告类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '生成时间', dataIndex: 'time', key: 'time', width: 150 },
  { title: '覆盖范围', dataIndex: 'scope', key: 'scope' },
  { title: '数据量', dataIndex: 'dataCount', key: 'dataCount', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
]

const tableData = [
  { id: 1, name: '2024年3月运行分析报告', type: '月报', time: '2024-03-31 23:59', scope: '全馆能耗/设备/碳排放', dataCount: '326条', status: '已生成' },
  { id: 2, name: '2024年3月第4周运行周报', type: '周报', time: '2024-03-24 23:59', scope: '本周能耗/设备运行', dataCount: '85条', status: '已生成' },
  { id: 3, name: '2024年3月24日运行日报', type: '日报', time: '2024-03-24 23:59', scope: '当日能耗/告警/客流', dataCount: '42条', status: '已生成' },
  { id: 4, name: '2024年Q1运行分析报告', type: '季报', time: '2024-03-31 23:59', scope: 'Q1能耗/碳排放/成本', dataCount: '1,280条', status: '生成中' },
  { id: 5, name: '2024年3月23日运行日报', type: '日报', time: '2024-03-23 23:59', scope: '当日能耗/告警/客流', dataCount: '38条', status: '已生成' },
  { id: 6, name: '2024年3月第3周运行周报', type: '周报', time: '2024-03-17 23:59', scope: '本周能耗/设备运行', dataCount: '92条', status: '已生成' },
]
</script>

<style scoped lang="less">
.ai-page { padding: 0; }
</style>