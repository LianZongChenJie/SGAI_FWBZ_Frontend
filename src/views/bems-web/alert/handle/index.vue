<!-- 报警处理 -->
<template>
  <div class="alert-page">
    <div class="stats-row">
      <StatCard label="待处理告警" :value="statData.untreatedCount" change-text="" trend="" color="red" :icon="PendingAlertIcon" />
      <StatCard label="处理中" :value="statData.eventCount" change-text="" trend="" color="orange" :icon="ProcessingIcon" />
      <StatCard label="今日已处理" :value="statData.completedCount" change-text="" trend="" color="green" :icon="TodayDoneIcon" />
      <StatCard label="平均处理时长(分钟)" :value="statData.averageProcessingTime" change-text="" trend="" color="blue" :icon="AvgTimeIcon" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3>🚨待处理告警</h3>
        <div class="filter-bar">
          <a-select v-model:value="levelFilter" style="width: 120px" placeholder="报警等级" :options="levelOption" allowClear @change="onQuery" />
          <a-select v-model:value="typeFilter" style="width: 130px" placeholder="报警类型" :options="categoryOption" allowClear @change="onQuery" />
          <a-button type="primary" @click="onQuery">🔍查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-spin :spinning="loading" tip="加载中...">
          <div v-if="alertList.length === 0 && !loading" class="empty-state">暂无待处理告警</div>
          <div class="alert-list" v-else>
          <div class="alert-card" :class="item.level" v-for="item in alertList" :key="item.id">
            <div class="alert-icon">
              <VeryDangerIcon v-if="item.level === 'veryDanger'" />
              <DangerIcon v-else-if="item.level === 'danger'" />
              <InfoIcon v-else />
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ item.description }} <span class="category-tag">{{ item.alarmCategoryName }}</span> <span class="level-tag" :class="item.level">{{ item.levelLabel }}</span></div>
              <div class="alert-desc">{{ item.title }}</div>

              <!-- <div class="alert-title">{{ item.title }} <span class="level-tag" :class="item.level">{{ item.levelLabel }}</span></div> -->
              <!-- <div class="alert-desc">{{ item.description }}</div> -->
              <div class="alert-time">{{ item.time }} | 持续 {{ item.duration }}</div>
              <div class="alert-actions">
                <a-button class="confirm-btn" :class="'confirm-' + item.level" size="small" @click="handleConfirm(item)">确认并处理</a-button>
                <a-button size="small" @click="handleTransfer(item)">转工单</a-button>
                </div>
            </div>
          </div>
        </div>
        </a-spin>
        <div class="pagination-wrapper">
          <Pagination
            :current="currentPage"
            :total="totalRecords"
            :page-size="pageSize"
            show-size-changer
            :show-total="(total) => `共 ${total} 条`"
            @change="onPageChange"
            @showSizeChange="onPageSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 转工单弹窗 -->
    <a-modal
      v-model:open="transferVisible"
      title="📝 转工单"
      width="800px"
      :mask-closable="false"
      @ok="handleTransferSave"
      ok-text="提交"
      cancel-text="取消"
    >
      <!-- 填写区 -->
      <div class="transfer-actions">
        <div class="transfer-actions__item">
          <span class="transfer-actions__label">联系人</span>
          <a-input v-model:value="transferForm.contractPeople" placeholder="请输入联系人" style="width: 200px" />
        </div>
        <div class="transfer-actions__item">
          <span class="transfer-actions__label">联系电话</span>
          <a-input v-model:value="transferForm.contractPhone" placeholder="请输入联系电话" style="width: 200px" />
        </div>
      </div>

      <!-- 只读信息 -->
      <a-descriptions bordered :column="2" size="small" style="margin-top: 16px">
        <a-descriptions-item label="记录id">{{ transferForm.recordId || '--' }}</a-descriptions-item>
        <a-descriptions-item label="空间id">{{ transferForm.spaceId || '--' }}</a-descriptions-item>
        <a-descriptions-item label="空间全称">{{ transferForm.address || '--' }}</a-descriptions-item>
        <a-descriptions-item label="区域名称">{{ transferForm.spaceName || '--' }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ transferForm.description || '--' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  getAlarmRecordsListApi,
  getAlarmCategoryListApi,
  getAlarmLevelListApi,
  getAlarmRecordStatisticsApi,
  confirmAlarmRecordApi,
  transferEventAlarmRecordApi,
} from '../alarmManagement/Standardized.api'
import { Pagination, message } from 'ant-design-vue'

// 自定义 emoji 图标组件
const PendingAlertIcon = () => h('span', { style: 'font-size: 20px;' }, '🚨')
const ProcessingIcon = () => h('span', { style: 'font-size: 20px;' }, '🔄')
const TodayDoneIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const AvgTimeIcon = () => h('span', { style: 'font-size: 20px;' }, '⏱️')
const VeryDangerIcon = () => h('span', { style: 'font-size: 18px;' }, '🚨')
const DangerIcon = () => h('span', { style: 'font-size: 18px;' }, '⚠️')
const InfoIcon = () => h('span', { style: 'font-size: 18px;' }, '💡')

defineOptions({ name: 'AlertHandlePage' })

interface AlertCard {
  id: string
  _record: any
  level: string
  levelLabel: string
  title: string
  description: string
  time: string
  duration: string
  alarmCategoryName: string
}

const statData = ref({ untreatedCount: 0, eventCount: 0, completedCount: 0, averageProcessingTime: '0min' })

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await getAlarmRecordStatisticsApi()
    if (res) {
      statData.value = {
        untreatedCount: res.untreatedCount ?? 0,
        eventCount: res.eventCount ?? 0,
        completedCount: res.completedCount ?? 0,
        averageProcessingTime: res.averageProcessingTime ?? '0min',
      }
    }
  } catch {
    // 静默处理
  }
}
const levelFilter = ref<string | undefined>(undefined)
const typeFilter = ref<string | undefined>(undefined)
const categoryOption = ref<{ label: string; value: string }[]>([])
const levelOption = ref<{ label: string; value: string }[]>([])
const alertList = ref<AlertCard[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 报警等级文本 → level class 映射
const levelClassMap: Record<string, string> = { '非常紧急': 'veryDanger', '紧急': 'danger' }

// 计算持续时间
const getDuration = (alarmTime: string): string => {
  if (!alarmTime) return ''
  const diff = Date.now() - new Date(alarmTime).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时${minutes % 60}分钟`
  const days = Math.floor(hours / 24)
  return `${days}天${hours % 24}小时`
}

// API 记录 → 卡片格式映射
const mapRecordToCard = (record: any): AlertCard => {
  const levelName: string = record.alarmLevelName || ''
  return {
    id: record.id,
    _record: record,
    level: levelClassMap[levelName] || 'info',
    levelLabel: levelName,
    title: record.alarmContent || '',
    description: `设备: ${record.deviceName || '-'} | 位置: ${record.spaceName || '-'}`,
    time: record.alarmTime || '',
    duration: getDuration(record.alarmTime),
    alarmCategoryName: record.alarmCategoryName || '-',
  }
}

// 获取待处理告警列表
const fetchAlertList = async (page = currentPage.value) => {
  loading.value = true
  try {
    const params: any = {
      pageNo: page,
      pageSize: pageSize.value,
      alarmStatus: '1', // 未处理
    }
    if (levelFilter.value) params.alarmLevelId = levelFilter.value
    if (typeFilter.value) params.alarmCategoryId = typeFilter.value
    const res = await getAlarmRecordsListApi(params)
    alertList.value = (res.records || []).map(mapRecordToCard)
    totalRecords.value = res.total || 0
    currentPage.value = page
  } catch {
    // defHttp 已自动提示错误信息
  } finally {
    loading.value = false
  }
}

// 分页切换
const onPageChange = (page: number) => {
  currentPage.value = page
  fetchAlertList(page)
}

// 每页条数切换
const onPageSizeChange = (_page: number, size: number) => {
  pageSize.value = size
  fetchAlertList(1)
}

// 查询（重置到第一页）
const onQuery = () => {
  fetchAlertList(1)
}

// 确认并处理
const handleConfirm = async (alert: AlertCard) => {
  try {
    await confirmAlarmRecordApi({ id: alert.id })
    message.success('确认成功')
    // 刷新列表和统计数据
    fetchAlertList(currentPage.value)
  } catch {
    // defHttp 已自动提示错误信息
  }
}

// 转工单弹窗
const transferVisible = ref(false)
const transferForm = reactive({
  recordId: '',
  spaceId: '',
  address: '',
  spaceName: '',
  description: '',
  contractPeople: '',
  contractPhone: '',
})

// 打开转工单弹窗
const handleTransfer = (alert: AlertCard) => {
  const record = alert._record || {}
  transferForm.recordId = alert.id
  transferForm.spaceId = record.spaceId ?? ''
  transferForm.address = ''
  transferForm.spaceName = record.spaceName ?? ''
  transferForm.description = record.alarmContent ?? ''
  transferForm.contractPeople = ''
  transferForm.contractPhone = ''
  transferVisible.value = true
}

// 提交转工单
const handleTransferSave = async () => {
  try {
    await transferEventAlarmRecordApi({ ...transferForm })
    message.success('转工单成功')
    transferVisible.value = false
    // 刷新列表
    fetchAlertList(currentPage.value)
  } catch {
    // defHttp 已自动提示错误信息
  }
}

// 获取报警类型/等级下拉选项
const getOptionsData = async () => {
  try {
    const [categoryRes, levelRes] = await Promise.all([
      getAlarmCategoryListApi(),
      getAlarmLevelListApi(),
    ])
    categoryOption.value = (categoryRes || []).map((item: any) => ({
      label: item.alarmCategoryName,
      value: item.id,
    }))
    levelOption.value = (levelRes || []).map((item: any) => ({
      label: item.alarmLevelName,
      value: item.id,
    }))
  } catch {
    // 静默处理
  }
}

onMounted(() => {
  fetchStatistics()
  getOptionsData()
  fetchAlertList()
})
</script>

<style scoped lang="less">
.alert-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 20px; }
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  :deep(.ant-pagination) {
    margin-top: 0;
    padding: 8px 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  :deep(.ant-pagination-total-text) {
    margin-right: auto;
    color: rgba(0, 0, 0, 0.65);
  }

  :deep(.ant-pagination-options) {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.ant-pagination-options-quick-jumper) {
    color: rgba(0, 0, 0, 0.65);

    input {
      width: 48px;
      margin: 0 8px;
    }
  }
}

.transfer-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 12px 16px;
  background: #f7f9fc;
  border: 1px solid #e5e6eb;
  border-radius: 8px;

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    flex-shrink: 0;
  }
}

.empty-state {
  text-align: center;
  color: #86909c;
  padding: 60px 0;
  font-size: 14px;
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

  &.veryDanger { background: #fff2f0; border-left-color: #ff4d4f; }
  &.danger { background: #fffbe6; border-left-color: #faad14; }
  &.info { background: #e6f4ff; border-left-color: #1677ff; }

  .alert-icon {
    width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
    .veryDanger & { background: #ffccc7; color: #ff4d4f; }
    .danger & { background: #ffe58f; color: #faad14; }
    .info & { background: #bae0ff; color: #1677ff; }
  }

  .alert-content {
    flex: 1; min-width: 0;
    .alert-title { font-size: 14px; font-weight: 600; color: #1d2129; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    .level-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500;
      &.veryDanger { background: #ffccc7; color: #742a2a; }
      &.danger { background: #ffe58f; color: #744210; }
      &.info { background: #bae0ff; color: #2a4365; }
    }
    .category-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; background: #e8e8e8; color: #555; }
    .alert-desc { font-size: 13px; color: #4e5969; line-height: 1.6; }
    .alert-time { font-size: 12px; color: #86909c; margin-top: 6px; }
    .alert-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .confirm-btn {
      &.confirm-veryDanger { background: #ff4d4f; border-color: #ff4d4f; color: #fff; &:hover { background: #ff7875; border-color: #ff7875; } }
      &.confirm-danger { background: #faad14; border-color: #faad14; color: #fff; &:hover { background: #ffc53d; border-color: #ffc53d; } }
      &.confirm-info { background: #1677ff; border-color: #1677ff; color: #fff; &:hover { background: #4096ff; border-color: #4096ff; } }
    }
  }
}
</style>