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
          <a-spin :spinning="heatmapLoading">
            <PersonHeatmapMapView :data="heatmapData" />
          </a-spin>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><BarChartOutlined /> 各场馆客流趋势</h3>
          <a-radio-group v-model:value="trendPeriod" button-style="solid" size="small" @change="handleTrendPeriodChange">
            <a-radio-button :value="0">今日</a-radio-button>
            <a-radio-button :value="1">本周</a-radio-button>
            <a-radio-button :value="2">本月</a-radio-button>
          </a-radio-group>
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
        </div>
      </div>
      <div class="card-body">
        <a-table
          :columns="recognitionColumns"
          :data-source="recognitionData"
          :loading="recognitionLoading"
          :pagination="recognitionPagination"
          row-key="id"
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
        <!-- 无查询结果时展示占位 -->
        <a-empty v-if="!trackResult" description="暂无数据，请点击新增查询" class="track-empty" />

        <!-- 有查询结果时：上下结构 -->
        <div v-else class="track-result">
          <!-- 上部分：查询人员信息 -->
          <div class="track-person-info">
            <div class="person-avatar">
              <img v-if="trackResult.faceUrl" :src="trackResult.faceUrl" alt="人脸照片" />
              <UserOutlined v-else class="avatar-fallback" />
            </div>
            <div class="person-details">
              <div class="person-name-row">
                <span class="person-name">{{ trackResult.name || '--' }}</span>
                <span v-if="trackResult.similarity" class="person-similarity">相似度: {{ trackResult.similarity }}</span>
              </div>
              <div class="person-meta-row">
                <span class="meta-item"><span class="meta-label">证件类型:</span> {{ trackResult.certificateType || '--' }}</span>
                <span class="meta-item"><span class="meta-label">证件号码:</span> {{ trackResult.certificateNum || '--' }}</span>
                <span class="meta-item"><span class="meta-label">查询时间段:</span> {{ trackQueryTimeRange }}</span>
                <span class="meta-item"><span class="meta-label">轨迹点位数:</span> {{ trackResult.cameraList?.length || 0 }} 个</span>
              </div>
            </div>
          </div>

          <!-- 下部分：路径时间线（横向展示，支持横向滚动） -->
          <div class="track-timeline-section">
            <div class="timeline-title">轨迹路径</div>
            <div class="track-timeline-scroll">
              <div class="track-timeline" v-if="trackResult.cameraList && trackResult.cameraList.length > 0">
                <div
                  class="track-timeline-item"
                  v-for="(point, idx) in trackResult.cameraList"
                  :key="idx"
                >
                  <div class="timeline-dot" :class="{ 'timeline-dot-start': idx === 0, 'timeline-dot-end': idx === trackResult.cameraList!.length - 1 }"></div>
                  <div class="timeline-time">{{ formatCaptureTime(point.captureTime) }}</div>
                  <div class="timeline-camera">{{ point.cameraName || '--' }}</div>
                  <div class="timeline-location">{{ point.installLocation || '--' }}</div>
                </div>
              </div>
              <a-empty v-else description="无轨迹数据" />
            </div>
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
import type { FormInstance, UploadFile } from 'ant-design-vue'
import * as echarts from 'echarts'
import { StatCard } from '/@/views/bems-web/components'
import { addTrackQuery, getSummary, getRecognitionRecord, getVenueList, getVenueFlowTrend, getDistributionMap } from './index.api'
import type { StatCard as StatCardVO, PersonRecognition, VenueItem, VenueFlowTrendVO, VenueHeatmapItemVO, PersonnelTrajectoryResultVO } from './index.api'
import PersonHeatmapMapView from './PersonHeatmapMapView.vue'
import {
  UserOutlined,
  TeamOutlined,
  CameraOutlined,
  WarningOutlined,
  HeatMapOutlined,
  BarChartOutlined,
  SearchOutlined,
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
  fetchHeatmapData()
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

// ===== 人员分布热力图 =====
const heatmapLoading = ref(false)
const heatmapData = ref<VenueHeatmapItemVO[]>([])

/** 获取热力图数据 */
const fetchHeatmapData = async () => {
  heatmapLoading.value = true
  try {
    const res = await getDistributionMap()
    heatmapData.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取人员分布热力图数据失败:', error)
    heatmapData.value = []
  } finally {
    heatmapLoading.value = false
  }
}

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
const handleTrendPeriodChange = () => {
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
      textStyle: { color: '#2d3748', fontSize:14 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
    },
    legend: {
      data: venues,
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#718096', fontSize:14 },
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
      axisLabel: { color: '#a0aec0', fontSize:13 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#a0aec0', fontSize:13 },
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

// ===== 人员轨迹查询 =====
const trackModalVisible = ref(false)
const trackModalLoading = ref(false)
const trackFormRef = ref<FormInstance>()
const fileList = ref<UploadFile[]>([])
/** 轨迹查询结果 */
const trackResult = ref<PersonnelTrajectoryResultVO | null>(null)
/** 当前查询的时间段 */
const trackQueryTimeRange = ref('')

const trackForm = reactive({
  facePhoto: '',
  timeRange: [] as string[],
})

const trackRules = {
  facePhoto: [{ required: true, message: '请上传人脸照片', trigger: 'change' }],
  timeRange: [{ required: true, type: 'array' as const, message: '请选择查询时间段', trigger: 'change' }],
}

/** 格式化抓拍时间，只展示时分 */
const formatCaptureTime = (time?: string): string => {
  if (!time) return '--'
  // 兼容 ISO8601 和普通格式，提取 HH:mm
  const match = time.match(/(\d{2}:\d{2})/)
  return match ? match[1] : time
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
    const res = await addTrackQuery({
      facePhoto: trackForm.facePhoto,
      startTime: trackForm.timeRange[0],
      endTime: trackForm.timeRange[1],
    })
    // 存储查询结果和时间范围
    trackResult.value = res || null
    trackQueryTimeRange.value = `${trackForm.timeRange[0]} ~ ${trackForm.timeRange[1]}`
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
      font-size:13px;
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
  .chart-text { font-size:16px; color: #718096; font-weight: 500; }
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

.track-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.track-result {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.track-person-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 10px;

  .person-avatar {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #d0d9f0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-fallback {
      font-size: 32px;
      color: #a0aec0;
    }
  }

  .person-details {
    flex: 1;
    min-width: 0;

    .person-name-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .person-name {
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
      }

      .person-similarity {
        font-size:14px;
        color: #718096;
        background: #fff;
        padding: 2px 8px;
        border-radius: 4px;
      }
    }

    .person-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;

      .meta-item {
        font-size:16px;
        color: #4a5568;

        .meta-label {
          color: #718096;
          margin-right: 4px;
        }
      }
    }
  }
}

.track-timeline-section {
  .timeline-title {
    font-size:16px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;
  }
}

.track-timeline-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 0 16px;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border-radius: 3px;
    &:hover { background: #a0a0a0; }
  }
}

.track-timeline {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 0 8px;
  position: relative;
  min-width: max-content;

  /* 横向连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 8px;
    right: 8px;
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
  }
}

.track-timeline-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  padding: 0 8px;

  .timeline-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3182ce;
    border: 2px solid white;
    box-shadow: 0 0 0 2px #3182ce;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .timeline-dot-start {
    background: #52c41a;
    box-shadow: 0 0 0 2px #52c41a;
  }

  .timeline-dot-end {
    background: #ff4d4f;
    box-shadow: 0 0 0 2px #ff4d4f;
  }

  .timeline-time {
    font-size:14px;
    color: #3182ce;
    font-weight: 600;
    margin-bottom: 4px;
    white-space: nowrap;
  }

  .timeline-camera {
    font-size:16px;
    color: #2d3748;
    font-weight: 500;
    text-align: center;
    margin-bottom: 2px;
    word-break: break-all;
  }

  .timeline-location {
    font-size:13px;
    color: #a0aec0;
    text-align: center;
  }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size:14px;
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
      font-size:16px;
      color: #718096;
    }

    .info-value {
      font-size:16px;
      font-weight: 600;
      color: #2d3748;
    }
  }
}

</style>