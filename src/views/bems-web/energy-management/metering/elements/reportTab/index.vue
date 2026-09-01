<template>
  <div class="report-tab">
    <div class="stat-cards">
      <StatCard
        label="报表模板数"
        :value="statData.reportTemplate"
        :change-text="statData.reportTemplateChange"
        trend="up"
        color="blue"
        :icon="DocumentIcon"
      />
      <StatCard
        label="本月已生成"
        :value="statData.monthlyGenerated"
        :change-text="statData.monthlyGeneratedChange"
        trend="up"
        color="green"
        :icon="CheckSquareIcon"
      />
      <StatCard
        label="定时任务"
        :value="statData.scheduledTask"
        :change-text="statData.scheduledTaskStatus"
        trend=""
        color="orange"
        :icon="ClockIcon"
      />
      <StatCard
        label="双碳报表"
        :value="statData.carbonReport"
        :change-text="statData.carbonReportChange"
        trend="up"
        color="purple"
        :icon="EarthIcon"
      />
    </div>

    <div class="report-sections">
      <a-card class="report-card" :bordered="false">
        <template #title>
          <span class="card-title-icon">📋</span>
          能源报表列表
        </template>
        <template #extra>
          <a-button type="primary">+ 新建报表</a-button>
        </template>
        <a-table
          :columns="reportColumns"
          :data-source="reportList"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-tag status-generated">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <div class="action-btns">
                <a-button type="link" size="small">查看</a-button>
                <a-button type="link" size="small">下载</a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>

      <a-card class="report-card" :bordered="false">
        <template #title>
          <span class="card-title-icon">⏰</span>
          定时报表任务
        </template>
        <template #extra>
          <a-button type="primary">+ 新增任务</a-button>
        </template>
        <a-table
          :columns="taskColumns"
          :data-source="taskList"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span
                class="status-tag"
                :class="record.status === '启用' ? 'status-enabled' : 'status-standby'"
              >
                {{ record.status }}
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <div class="action-btns">
                <a-button type="link" size="small">编辑</a-button>
                <a-button type="link" size="small">
                  {{ record.status === '启用' ? '停用' : '触发' }}
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, h, ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// 自定义 emoji 图标组件
const DocumentIcon = () => h('span', { style: 'font-size: 20px;' }, '📄')
const CheckSquareIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const ClockIcon = () => h('span', { style: 'font-size: 20px;' }, '⏰')
const EarthIcon = () => h('span', { style: 'font-size: 20px;' }, '🌍')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  reportTemplate: '12',
  reportTemplateChange: '3 新增',
  monthlyGenerated: '48',
  monthlyGeneratedChange: '12 份',
  scheduledTask: '6',
  scheduledTaskStatus: '全部正常',
  carbonReport: '4',
  carbonReportChange: '1 新增',
})

// 能源报表列表列
const reportColumns = [
  { title: '报表名称', dataIndex: 'name', key: 'name', width: 100, ellipsis: true },
  { title: '报表类型', dataIndex: 'type', key: 'type', width: 80   },
  { title: '统计周期', dataIndex: 'period', key: 'period', width: 80 },
  { title: '生成时间', dataIndex: 'generatedAt', key: 'generatedAt', width: 100 },
  { title: '状态', key: 'status', width: 60, align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center', fixed: 'right' },
]

// 定时报表任务列
const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name', width: 100, ellipsis: true },
  { title: '报表模板', dataIndex: 'template', key: 'template', width: 100, ellipsis: true },
  { title: '执行周期', dataIndex: 'cycle', key: 'cycle', width: 80 },
  { title: '下次执行', dataIndex: 'nextRun', key: 'nextRun', width: 100 },
  { title: '状态', key: 'status', width: 60, align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center', fixed: 'right' },
]

// 能源报表列表数据
const reportList = ref([
  { id: '1', name: '月度能耗汇总报表', type: '分项统计', period: '2026-05', generatedAt: '2026-06-01 08:00', status: '已生成' },
  { id: '2', name: '场馆用电对比报表', type: '空间统计', period: '2026-05', generatedAt: '2026-06-01 08:00', status: '已生成' },
  { id: '3', name: '重点机组能效报表', type: '专业统计', period: '2026-05', generatedAt: '2026-06-01 08:00', status: '已生成' },
  { id: '4', name: '碳排放核算报表', type: '双碳报表', period: '2026-05', generatedAt: '2026-06-01 08:00', status: '已生成' },
  { id: '5', name: '用能异常分析报表', type: '分析报表', period: '2026-05', generatedAt: '2026-06-01 08:00', status: '已生成' },
])

// 定时报表任务数据
const taskList = ref([
  { id: '1', name: '每日能耗日报', template: '能耗日报模板', cycle: '每日 08:00', nextRun: '2026-06-10 08:00', status: '启用' },
  { id: '2', name: '月度能耗月报', template: '能耗月报模板', cycle: '每月1日 08:00', nextRun: '2026-07-01 08:00', status: '启用' },
  { id: '3', name: '双碳数据月报', template: '碳排放核算模板', cycle: '每月1日 09:00', nextRun: '2026-07-01 09:00', status: '启用' },
  { id: '4', name: '展会用能专项报告', template: '展会用能模板', cycle: '按需触发', nextRun: '-', status: '待命' },
])

// 加载报表数据（预留接口）
const loadReportData = async () => {
  // TODO: 调用报表数据接口
  console.log('加载报表数据')
}

onMounted(() => {
  loadReportData()
})
</script>

<style scoped lang="less">
.report-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .report-sections {
    display: flex;
    gap: 16px;

    .report-card {
      flex: 1;
      min-width: 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
      }

      :deep(.ant-card-head-title) {
        font-weight: 600;
      }

      .card-title-icon {
        margin-right: 8px;
      }

      .action-btns {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .ant-btn-link {
          padding: 0;
          height: auto;
          line-height: 1.5;
        }
      }

      .status-tag {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size:14px;
        white-space: nowrap;

        &.status-generated,
        &.status-enabled {
          color: #389e0d;
          background: #e6f7e6;
        }

        &.status-standby {
          color: #d48806;
          background: #fffbe6;
        }
      }
    }
  }
}
</style>
