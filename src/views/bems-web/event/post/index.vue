<template>
  <div class="event-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <a-spin :spinning="statLoading">
        <div class="stats-inner">
          <StatCard
            v-for="(card, index) in statCards"
            :key="index"
            :label="card.title || '--'"
            :value="formatStatValue(card.value)"
            :change-text="card.context || ''"
            :color="statCardConfigs[index]?.color || 'blue'"
            :icon="statCardConfigs[index]?.icon"
          />
          <!-- 后端返回不足4张时用占位补齐 -->
          <StatCard
            v-for="n in Math.max(0, 4 - statCards.length)"
            :key="'placeholder-' + n"
            label="--"
            value="--"
            color="blue"
          />
        </div>
      </a-spin>
    </div>

    <!-- 展会总结报告 -->
    <div class="card">
      <div class="card-header">
        <h3><BarChartOutlined /> 展会总结报告{{ currentReport ? ' - ' + currentReport.activeName : '' }}</h3>
        <div class="header-actions">
          <a-select
            v-model:value="selectedReportId"
            style="width: 240px"
            placeholder="请选择展会"
            :loading="reportListLoading"
            :options="reportOptions"
            :field-names="{ label: 'activeName', value: 'id' }"
            allow-clear
            @change="handleReportChange"
          />
          <a-button :loading="exportLoading" @click="handleExport"><DownloadOutlined /> 导出Excel</a-button>
          <a-button :loading="saveLoading" type="primary" @click="handleSave">
            <SaveOutlined /> 保存
          </a-button>
        </div>
      </div>
      <div class="card-body">
        <a-spin :spinning="detailLoading">
          <!-- 无数据空状态 -->
          <div v-if="!currentReport" class="empty-placeholder">
            <div class="empty-icon"><InboxOutlined /></div>
            <div class="empty-text">暂无报告数据</div>
          </div>
          <template v-else>
            <!-- 三栏数据 -->
            <div class="three-col">
              <!-- 人员服务 -->
              <div class="report-group">
                <h4 class="group-title">人员服务</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">总服务人次</span>
                    <span class="info-value">{{ formatNumber(currentReport.servicePersonnel) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">投诉数量</span>
                    <span class="info-value" :style="{ color: '#dd6b20' }">{{ formatNumber(currentReport.complaintsTotal) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">建议数量</span>
                    <span class="info-value">{{ formatNumber(currentReport.recommendedTotal) }}</span>
                  </div>
                </div>
              </div>
              <!-- 设备与能耗 -->
              <div class="report-group">
                <h4 class="group-title">设备与能耗</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">设备故障数</span>
                    <span class="info-value" :style="{ color: '#dd6b20' }">{{ formatNumber(currentReport.deviceFailuresTotal) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">总用电量</span>
                    <span class="info-value">{{ formatNumber(currentReport.consumptionElectricity) }} kWh</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">单人次能耗</span>
                    <span class="info-value" :style="{ color: '#38a169' }">{{ formatNumber(currentReport.personEnergyConsumption) }} kWh</span>
                  </div>
                </div>
              </div>
              <!-- 会展数据 -->
              <div class="report-group">
                <h4 class="group-title">会展数据</h4>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">展会天数</span>
                    <span class="info-value">{{ formatNumber(currentReport.dayNumber) }} 天</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">总客流</span>
                    <span class="info-value">{{ formatNumber(currentReport.passengerFlow) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">峰值客流</span>
                    <span class="info-value">{{ formatNumber(currentReport.peakFlow) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">参展商数</span>
                    <span class="info-value">{{ formatNumber(currentReport.exhibitors) }} 家</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI优化建议 -->
            <div class="suggestions-section">
              <h4 class="group-title">优化建议（AI生成）</h4>
              <div class="suggestion-list">
                <div class="suggestion-item" v-for="item in suggestions" :key="item">
                  {{ item }}
                </div>
              </div>
            </div>
          </template>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ScheduleOutlined,
  CheckCircleOutlined,
  RobotOutlined,
  BookOutlined,
  BarChartOutlined,
  InboxOutlined,
  SaveOutlined,
  DownloadOutlined,
  ExperimentOutlined,
} from '@ant-design/icons-vue'
import {
  getSummary,
  getReportList,
  exportReportExcel,
  getReportStatistics,
  saveReportStatistics,
} from './index.api'
import type { StatCardVO, ActiveMeetReport } from './index.api'

defineOptions({ name: 'EventPostPage' })

// ===== 统计卡片配置（图标/颜色固定，数据来自后端） =====
const statCardConfigs = [
  { color: 'blue' as const, icon: ScheduleOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: RobotOutlined },
  { color: 'purple' as const, icon: BookOutlined },
]

const statCards = ref<StatCardVO[]>([])
const statLoading = ref(false)

/** 后端返回的 value 可能是对象或基本类型，统一格式化 */
function formatStatValue(val?: string | number | { [key: string]: any } | null): string | number {
  if (val == null || val === '') return '--'
  if (typeof val === 'string' || typeof val === 'number') return val
  return (val as any).value ?? (val as any).num ?? (val as any).count ?? '--'
}

const fetchSummary = async () => {
  statLoading.value = true
  try {
    const res = await getSummary()
    statCards.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取卡片汇总失败:', error)
  } finally {
    statLoading.value = false
  }
}

// ===== 展会总结报告 =====
const reportList = ref<ActiveMeetReport[]>([])
const reportListLoading = ref(false)
const selectedReportId = ref<number | undefined>(undefined)
const reportOptions = computed(() =>
  reportList.value.map((item) => ({ ...item }))
)
const currentReport = ref<ActiveMeetReport | null>(null)
const detailLoading = ref(false)
const saveLoading = ref(false)

const fetchReportList = async () => {
  reportListLoading.value = true
  try {
    const res = await getReportList({ pageNo: 1, pageSize: 100 })
    if (Array.isArray(res)) {
      reportList.value = res
    } else {
      reportList.value = res?.records || []
    }
    // 默认选择第一个
    if (reportList.value.length > 0 && reportList.value[0].id != null) {
      selectedReportId.value = reportList.value[0].id
      await fetchReportStatistics(selectedReportId.value)
    }
  } catch (error) {
    console.error('获取展会总结报告列表失败:', error)
  } finally {
    reportListLoading.value = false
  }
}

/** 选择展会后调用 statistics 接口获取真实数据 */
const handleReportChange = async (val: number | undefined) => {
  if (val == null) {
    currentReport.value = null
    return
  }
  await fetchReportStatistics(val)
}

/** 调用 statistics 接口获取展会总结报告详情 */
const fetchReportStatistics = async (id: number) => {
  detailLoading.value = true
  try {
    const res = await getReportStatistics(id)
    if (res) {
      currentReport.value = res
    } else {
      currentReport.value = null
    }
  } catch (error) {
    console.error('获取展会总结报告详情失败:', error)
    currentReport.value = null
  } finally {
    detailLoading.value = false
  }
}

/** 保存展会总结报告（入参为 statistics 接口返回的数据） */
const handleSave = async () => {
  if (!currentReport.value) {
    message.warning('暂无数据可保存')
    return
  }
  saveLoading.value = true
  try {
    await saveReportStatistics(currentReport.value)
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saveLoading.value = false
  }
}

// ===== 导出 =====
const exportLoading = ref(false)

const handleExport = async () => {
  if (!currentReport.value) {
    message.warning('暂无数据可导出')
    return
  }
  exportLoading.value = true
  try {
    const res = await exportReportExcel({ pageNo: 1, pageSize: 100 })
    if (!res || res.size === 0) {
      message.warning('文件下载失败')
      return
    }
    const url = window.URL.createObjectURL(new Blob([res], { type: 'application/vnd.ms-excel' }))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '展会总结报告.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    exportLoading.value = false
  }
}

// ===== AI优化建议（静态，后续可接接口） =====
const suggestions = [
  '建议A馆F2层空调提前30分钟预冷，可降低开展初期能耗峰值15%',
  'B馆会议室音响设备建议增加日常巡检频次，减少展会期间故障',
  'C馆室外广场建议增设临时遮阳设施，提升参展商满意度',
  '安保人员部署建议根据客流预测动态调整，可优化人力成本10%',
]

// ===== 工具函数 =====
function formatNumber(val?: number | string): string {
  if (val == null || val === '') return '--'
  const num = Number(val)
  if (isNaN(num)) return String(val)
  return num.toLocaleString()
}

// ===== 初始化 =====
onMounted(() => {
  fetchSummary()
  fetchReportList()
})
</script>

<style scoped lang="less">
.event-page { padding: 0; }

.stats-row {
  margin-bottom: 20px;

  .stats-inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
}

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
    flex-wrap: wrap;
    gap: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .card-body { padding: 22px; }
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.report-group {
  background: #f9fafb;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  padding: 16px 14px;

  .group-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 14px;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .info-label {
      font-size: 13px;
      color: #718096;
    }

    .info-value {
      font-size: 13px;
      font-weight: 600;
    }
  }
}

.suggestions-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .group-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;
  }
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .suggestion-item {
    font-size: 12px;
    color: #5a6a8a;
    padding: 10px 14px;
    background: #f7fafc;
    border-radius: 6px;
    display: flex;
    align-items: flex-start;
    gap: 8px;

    &::before {
      content: '✓';
      color: #52c41a;
      font-weight: 700;
      flex-shrink: 0;
    }
  }
}

.empty-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 260px;
  padding: 30px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }
}

@media (max-width: 1200px) {
  .stats-row .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .three-col { grid-template-columns: 1fr; }
}
</style>
