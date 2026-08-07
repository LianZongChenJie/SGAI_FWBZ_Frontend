<template>
  <div class="person-page">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        v-for="(card, index) in statCards"
        :key="index"
        :label="card.title || '--'"
        :value="card.value ?? '--'"
        :change-text="card.context || ''"
        :color="cardConfig[index]?.color || 'blue'"
        :icon="cardConfig[index]?.icon"
      />
    </div>

    <!-- 两栏布局：热力图 + 客流趋势 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><HeatMapOutlined /> 人员分布热力图</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <div class="map-placeholder">
            <div class="map-icon"><HeatMapOutlined /></div>
            <div class="map-text">场馆人员分布热力图</div>
            <div class="map-sub">A馆 1,234人 | B馆 892人 | C馆 1,441人</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><BarChartOutlined /> 各场馆客流趋势</h3>
          <div class="btn-group">
            <a-button :type="trendPeriod === 0 ? 'primary' : 'default'" size="small" @click="handleTrendPeriodChange(0)">今日</a-button>
            <a-button :type="trendPeriod === 1 ? 'primary' : 'default'" size="small" @click="handleTrendPeriodChange(1)">本周</a-button>
            <a-button :type="trendPeriod === 2 ? 'primary' : 'default'" size="small" @click="handleTrendPeriodChange(2)">本月</a-button>
          </div>
        </div>
        <div class="card-body">
          <a-spin :spinning="trendLoading">
            <div v-if="trendVenueNames.length > 0" ref="trendChartRef" class="trend-chart"></div>
            <a-empty v-else description="暂无数据" class="trend-empty" />
          </a-spin>
        </div>
      </div>
    </div>

    <!-- 人员识别记录表格 -->
    <div class="card">
      <div class="card-header">
        <h3><UserOutlined /> 人员识别记录</h3>
        <div class="filter-bar">
          <a-input v-model:value="searchKeyword" placeholder="搜索姓名/工号" style="width: 180px" allow-clear @press-enter="handleSearch" />
          <a-select v-model:value="personType" style="width: 130px" placeholder="全部类型">
            <a-select-option v-for="opt in personTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
          </a-select>
          <a-select v-model:value="venueFilter" style="width: 140px" placeholder="全部场馆">
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option v-for="item in venueOptions" :key="item.id" :value="item.venueName">{{ item.venueName }}</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 查询</a-button>
          <a-button><DownloadOutlined /> 导出</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="recognitionColumns"
          :data-source="recognitionData"
          :loading="recognitionLoading"
          :pagination="recognitionPagination"
          row-key="id"
          size="middle"
          @change="handleRecognitionTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'nameId'">
              {{ record.personName || '--' }} / {{ record.employeeNo || '--' }}
            </template>
            <template v-if="column.key === 'confidence'">
              {{ record.confidence != null ? record.confidence + '%' : '--' }}
            </template>
            <template v-if="column.key === 'personType'">
              <span class="status-text" :class="getPersonTypeClass(record.personType)">
                {{ record.personType || '--' }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 人员轨迹查询 -->
    <div class="card">
      <div class="card-header">
        <h3><SearchOutlined /> 人员轨迹查询</h3>
        <a-button type="primary" @click="handleAddTrack">+ 新增查询</a-button>
      </div>
      <div class="card-body">
        <div class="two-col">
          <div>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">查询人员</span>
                <span class="info-value">张三 (EMP-1024)</span>
              </div>
              <div class="info-item">
                <span class="info-label">查询时间段</span>
                <span class="info-value">2026-06-09 08:00 - 14:00</span>
              </div>
              <div class="info-item">
                <span class="info-label">轨迹点位数</span>
                <span class="info-value">23 个</span>
              </div>
              <div class="info-item">
                <span class="info-label">覆盖场馆</span>
                <span class="info-value">A馆、B馆</span>
              </div>
              <div class="info-item">
                <span class="info-label">停留最久区域</span>
                <span class="info-value">A馆-F2-展厅 (2小时15分)</span>
              </div>
            </div>
          </div>
          <div class="map-placeholder" style="min-height: 250px;">
            <div class="map-icon"><NodeIndexOutlined /></div>
            <div class="map-text">人员轨迹路线图</div>
            <div class="map-sub">东门 → A馆F1 → A馆F2 → B馆F1 → 南门</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增查询弹窗 -->
    <a-modal
      v-model:visible="trackModalVisible"
      title="新增查询"
      width="560px"
      :confirm-loading="trackModalLoading"
      @ok="handleTrackSubmit"
      @cancel="handleTrackCancel"
    >
      <a-form ref="trackFormRef" :model="trackForm" :rules="trackRules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="人脸照片" name="facePhoto">
          <a-upload
            list-type="picture-card"
            :file-list="fileList"
            :before-upload="handleBeforeUpload"
            :max-count="1"
            accept="image/*"
            @remove="handleRemovePhoto"
          >
            <div v-if="fileList.length === 0">
              <PlusOutlined />
              <div class="ant-upload-text">上传照片</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="查询时间段" name="timeRange">
          <a-range-picker
            v-model:value="trackForm.timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, shallowRef, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, UploadFile } from 'ant-design-vue'
import * as echarts from 'echarts'
import { StatCard } from '/@/views/bems-web/components'
import { addTrackQuery, getSummary, getRecognitionRecord, getVenueList, getVenueFlowTrend } from './index.api'
import type { StatCard as StatCardVO, PersonRecognition, VenueItem, VenueFlowTrendVO } from './index.api'
import {
  UserOutlined,
  TeamOutlined,
  CameraOutlined,
  WarningOutlined,
  HeatMapOutlined,
  BarChartOutlined,
  SearchOutlined,
  DownloadOutlined,
  NodeIndexOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'PersonManagementPage' })

// ===== 统计卡片配置（图标/颜色固定，数据来自后端） =====
const cardConfig = [
  { color: 'blue' as const, icon: UserOutlined },
  { color: 'green' as const, icon: TeamOutlined },
  { color: 'orange' as const, icon: CameraOutlined },
  { color: 'purple' as const, icon: WarningOutlined },
]
const statCards = ref<StatCardVO[]>([])

/** 获取卡片汇总 */
const fetchStatCards = async () => {
  try {
    const res = await getSummary()
    statCards.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchStatCards()
  fetchVenueOptions()
  fetchRecognitionData()
  // 初始化客流趋势图表并加载数据
  nextTick(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
  })
  fetchTrendData()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
})

// ===== 筛选条件 =====
const searchKeyword = ref('')
const personType = ref('')
const venueFilter = ref('')

// ===== 场馆下拉 =====
const venueOptions = ref<VenueItem[]>([])

const fetchVenueOptions = async () => {
  try {
    const res = await getVenueList()
    venueOptions.value = res || []
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

// ===== 各场馆客流趋势 =====
/** 统计周期: 0-本日, 1-本周, 2-本月 */
const trendPeriod = ref<number>(0)
const trendLoading = ref(false)
/** 原始接口返回数据 */
const trendData = ref<VenueFlowTrendVO>({})
/** 从返回数据中提取的场馆名称列表 */
const trendVenueNames = ref<string[]>([])

const trendChartRef = ref<HTMLElement>()
const chartInstance = shallowRef<echarts.ECharts>()

/** 需要排除的非场馆字段 */
const EXCLUDE_KEYS = ['date', 'total', 'todayInTotal', 'todayInOutTotal']

/** 曲线颜色调色板 */
const VENUE_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d',
  '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16',
]

/** 获取客流趋势数据 */
const fetchTrendData = async () => {
  trendLoading.value = true
  try {
    const res = await getVenueFlowTrend({ periodType: trendPeriod.value })
    if (res) {
      trendData.value = res
      // 动态提取各场馆名称（排除非场馆字段）
      const venues = Object.keys(res).filter(
        (key) => !EXCLUDE_KEYS.includes(key),
      )
      trendVenueNames.value = venues
      if (venues.length > 0) {
        // 有数据时确保图表容器已渲染后再初始化/更新
        await nextTick()
        // v-if 切换可能导致旧实例失效，此处统一处理
        if (chartInstance.value) {
          // 实例已存在，直接更新
          updateChart()
        } else {
          initChart()
        }
      } else {
        // 无场馆数据时销毁图表实例并置空引用
        disposeChart()
      }
    } else {
      trendVenueNames.value = []
      disposeChart()
    }
  } catch (error) {
    console.error('获取场馆客流趋势失败:', error)
    trendVenueNames.value = []
    disposeChart()
  } finally {
    trendLoading.value = false
  }
}

/** 销毁图表实例 */
const disposeChart = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = undefined
  }
}

/** 切换统计周期 */
const handleTrendPeriodChange = (period: number) => {
  if (trendPeriod.value === period) return
  trendPeriod.value = period
  fetchTrendData()
}

/** 初始化图表 */
const initChart = () => {
  if (!trendChartRef.value) return
  chartInstance.value = echarts.init(trendChartRef.value)
  updateChart()
}

/** 更新图表：每个场馆渲染为独立曲线，不展示总流量 */
const updateChart = () => {
  if (!chartInstance.value) return
  const data = trendData.value
  const dateList = data.date || []
  const venues = trendVenueNames.value

  const series = venues.map((venue, index) => ({
    name: venue,
    type: 'line' as const,
    data: data[venue] || [],
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2, color: VENUE_COLORS[index % VENUE_COLORS.length] },
    itemStyle: { color: VENUE_COLORS[index % VENUE_COLORS.length] },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: VENUE_COLORS[index % VENUE_COLORS.length] + '33' },
        { offset: 1, color: VENUE_COLORS[index % VENUE_COLORS.length] + '02' },
      ]),
    },
  }))

  const option: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#2d3748', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: {
      data: venues,
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#718096', fontSize: 12 },
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: dateList,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#a0aec0', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0aec0', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series,
  }
  chartInstance.value.setOption(option, true)
}

const resizeChart = () => {
  chartInstance.value?.resize()
}

// ===== 人员类型下拉选项 =====
const personTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '员工', value: '员工' },
  { label: '访客', value: '访客' },
  { label: 'VIP', value: 'VIP' },
  { label: '临时人员', value: '临时人员' },
  { label: '黑名单', value: '黑名单' },
]

// ===== 人员识别记录表格列 =====
const recognitionColumns = [
  { title: '识别时间', dataIndex: 'recognizeTime', key: 'recognizeTime', width: 180 },
  { title: '人员类型', dataIndex: 'personType', key: 'personType', width: 100 },
  { title: '姓名/工号', key: 'nameId', width: 160 },
  { title: '识别位置', dataIndex: 'recognizeLocation', key: 'recognizeLocation', width: 180 },
  { title: '置信度', key: 'confidence', width: 90 },
  { title: '进出方向', dataIndex: 'direction', key: 'direction', width: 100 },
  { title: '所属场馆', dataIndex: 'venue', key: 'venue', width: 120 },
]

// ===== 人员识别记录数据 =====
const recognitionLoading = ref(false)
const recognitionData = ref<PersonRecognition[]>([])
const recognitionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
})

const fetchRecognitionData = async () => {
  recognitionLoading.value = true
  try {
    const res = await getRecognitionRecord({
      pageNo: recognitionPagination.current,
      pageSize: recognitionPagination.pageSize,
      personName: searchKeyword.value || undefined,
      employeeNo: undefined,
      personType: personType.value || undefined,
      venue: venueFilter.value || undefined,
    })
    recognitionData.value = res?.records || []
    recognitionPagination.total = res?.total || 0
  } catch (error) {
    console.error('获取人员识别记录失败:', error)
  } finally {
    recognitionLoading.value = false
  }
}

const handleRecognitionTableChange = (pag: any) => {
  recognitionPagination.current = pag.current
  recognitionPagination.pageSize = pag.pageSize
  fetchRecognitionData()
}

const handleSearch = () => {
  recognitionPagination.current = 1
  fetchRecognitionData()
}

// ===== 新增查询弹窗 =====
const trackModalVisible = ref(false)
const trackModalLoading = ref(false)
const trackFormRef = ref<FormInstance>()
const fileList = ref<UploadFile[]>([])

const trackForm = reactive({
  facePhoto: '',
  timeRange: [] as string[],
})

const trackRules = {
  facePhoto: [{ required: true, message: '请上传人脸照片', trigger: 'change' }],
  timeRange: [{ required: true, type: 'array' as const, message: '请选择查询时间段', trigger: 'change' }],
}

/** 打开新增查询弹窗 */
const handleAddTrack = () => {
  resetTrackForm()
  trackModalVisible.value = true
}

/** 重置表单 */
const resetTrackForm = () => {
  trackForm.facePhoto = ''
  trackForm.timeRange = []
  fileList.value = []
  trackFormRef.value?.resetFields()
}

/** 文件上传前处理：转为Base64编码字符串 */
const handleBeforeUpload = (file: File) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    const base64 = reader.result as string
    trackForm.facePhoto = base64
    fileList.value = [
      {
        uid: String(Date.now()),
        name: file.name,
        status: 'done',
        url: base64,
      } as UploadFile,
    ]
    // 手动触发校验清除
    trackFormRef.value?.validateFields('facePhoto')
  }
  return false
}

/** 移除照片 */
const handleRemovePhoto = () => {
  trackForm.facePhoto = '' 
  fileList.value = []
  return true
}

/** 提交新增查询 */
const handleTrackSubmit = async () => {
  try {
    await trackFormRef.value?.validate()
    trackModalLoading.value = true
    await addTrackQuery({
      facePhoto: trackForm.facePhoto,
      startTime: trackForm.timeRange[0],
      endTime: trackForm.timeRange[1],
    })
    trackModalVisible.value = false
  } catch (error) {
    console.error('提交人员轨迹查询失败:', error)
  } finally {
    trackModalLoading.value = false
  }
}

/** 取消 */
const handleTrackCancel = () => {
  trackModalVisible.value = false
}

/** 人员类型样式映射 */
const getPersonTypeClass = (type?: string) => {
  if (!type) return ''
  if (type === '员工') return 'normal'
  if (type === '访客') return 'info'
  if (type === 'VIP') return 'warning'
  if (type === '黑名单') return 'danger'
  return 'info'
}
</script>

<style scoped lang="less">
.person-page {
  padding: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-blue { background: #bee3f8; color: #2a4365; }

    .filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .btn-group {
      display: flex;
      gap: 8px;
    }
  }

  .card-body {
    padding: 22px;
  }
}

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

  .chart-icon { font-size: 48px; margin-bottom: 12px; }
  .chart-text { font-size: 14px; color: #718096; font-weight: 500; }
}

.trend-chart {
  width: 100%;
  height: 300px;
}

.trend-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.map-placeholder {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #d0d9f0;
  min-height: 280px;
  padding: 30px;

  .map-icon { font-size: 48px; margin-bottom: 12px; }
  .map-text { font-size: 14px; color: #5a6a8a; font-weight: 500; }
  .map-sub { font-size: 12px; color: #8a9ab0; margin-top: 8px; }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
  &.info { background: #bee3f8; color: #2a4365; }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;

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
      color: #2d3748;
    }
  }
}

</style>