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
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, h } from 'vue'
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
  }
}
</style>
