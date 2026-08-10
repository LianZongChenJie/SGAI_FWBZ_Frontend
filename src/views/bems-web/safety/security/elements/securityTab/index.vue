<template>
  <div class="security-tab">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in statCards"
        :key="index"
        :label="item.title"
        :value="item.value"
        :change-text="item.context"
        :color="cardConfig[index].color"
        :icon="cardConfig[index].icon"
      />
    </div>

    <!-- 实时监控画面 -->
    <div class="card">
      <div class="card-header">
        <h3><VideoCameraOutlined /> 实时监控画面</h3>
        <a-radio-group v-model:value="gridLayout" button-style="solid" size="small">
          <a-radio-button :value="1">1×1</a-radio-button>
          <a-radio-button :value="2">2×2</a-radio-button>
          <a-radio-button :value="3">3×3</a-radio-button>
          <a-radio-button :value="4">4×4</a-radio-button>
        </a-radio-group>
      </div>
      <div class="card-body">
        <CameraCarousel :cameras="cameraList" :layout="gridLayout" />
      </div>
    </div>

    <!-- 两栏布局：视频巡更计划 + AI分析事件 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><ScheduleOutlined /> 视频巡更计划</h3>
          <a-button type="primary" @click="handleAddPatrol">+ 新增巡更</a-button>
        </div>
        <div class="card-body patrol-card-body">
          <a-table
            :columns="patrolColumns"
            :data-source="patrolData"
            :pagination="patrolPagination"
            :loading="patrolLoading"
            row-key="id"
            size="small"
            :scroll="{ y: 240 }"
            @change="handlePatrolTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="statusMap[record.status]?.color">
                  {{ statusMap[record.status]?.text }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" :disabled="record.status === 2" @click="handleEditPatrol(record)">编辑</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><WarningOutlined /> AI视频分析事件</h3>
          <a-button @click="handleViewAllAIEvents">查看全部</a-button>
        </div>
        <div class="card-body">
          <AlertCard
            v-for="event in displayedAIEvents"
            :key="event.id"
            :level="event.level"
            :title="event.title"
            :description="event.description"
            :time="event.time"
            :show-actions="false"
          />
        </div>
      </div>
    </div>

    <!-- AI事件详情弹窗 -->
    <a-modal
      v-model:visible="aiEventsModalVisible"
      title="AI视频分析事件"
      width="800px"
      :footer="null"
    >
      <div class="ai-events-modal">
        <AlertCard
          v-for="event in aiEvents"
          :key="event.id"
          :level="event.level"
          :title="event.title"
          :description="event.description"
          :time="`${event.time} | ${event.location}`"
          :show-actions="false"
        />
      </div>
    </a-modal>

    <!-- 巡更计划新增/编辑弹窗 -->
    <a-modal
      v-model:visible="patrolModalVisible"
      :title="patrolModalTitle"
      width="560px"
      :confirm-loading="patrolModalLoading"
      :destroy-on-close="true"
      @ok="handlePatrolSubmit"
      @cancel="handlePatrolCancel"
    >
      <a-form ref="patrolFormRef" :model="patrolForm" :rules="patrolRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="计划名称" name="planName">
          <a-input v-if="patrolModalMode === 'add'" v-model:value="patrolForm.planName" placeholder="请输入计划名称" />
          <span v-else>{{ patrolForm.planName }}</span>
        </a-form-item>
        <a-form-item label="巡更路线" name="patrolRoute">
          <a-input v-if="patrolModalMode === 'add'" v-model:value="patrolForm.patrolRoute" placeholder="请输入巡更路线" />
          <span v-else>{{ patrolForm.patrolRoute }}</span>
        </a-form-item>
        <a-form-item label="执行周期" name="executionCycle">
          <a-time-picker
            v-if="patrolModalMode === 'add'"
            v-model:value="patrolForm.executionCycle"
            show-time
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="请选择执行周期"
            style="width: 100%"
          />
          <span v-else>{{ patrolForm.executionCycle }}</span>
        </a-form-item>
        <a-form-item v-if="patrolModalMode === 'add'" label="巡更摄像头" name="indexCodes">
          <a-select
            v-model:value="patrolForm.indexCodes"
            mode="multiple"
            placeholder="请选择摄像头"
            :options="cameraOptions"
            :field-names="{ label: 'name', value: 'indexCode' }"
            show-search
            :filter-option="filterCameraOption"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch
            v-model:checked="patrolForm.statusChecked"
            checked-children="启动"
            un-checked-children="停用"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { StatCard, AlertCard } from '/@/views/bems-web/components'
import CameraCarousel from '../../../components/CameraCarousel/index.vue'
import {
  getSecuritySummary,
  getPatrolPlanList,
  editPatrolPlan,
  addPatrolPlan,
  getCameraList,
  getRunningCameraList,
  checkIsRunningPlan,
  getAlarmInfoList,
} from '../../index.api'
import type { StatItem, PatrolPlan, CameraItem, EventNotify } from '../../index.api'
import {
  VideoCameraOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'SecurityTab' })

/** 监控画面网格布局：1=1×1, 2=2×2, 3=3×3, 4=4×4 */
const gridLayout = ref(2)

/** 卡片颜色与图标配置（与后端返回顺序对应） */
const cardConfig = [
  { color: 'blue' as const, icon: VideoCameraOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: ScheduleOutlined },
  { color: 'red' as const, icon: WarningOutlined },
]

const statCards = ref<StatItem[]>([])

const fetchStatCards = async () => {
  try {
    const res = await getSecuritySummary()
    statCards.value = res || []
  } catch (error) {
    console.error('获取安防统计卡片数据失败:', error)
  }
}

onMounted(() => {
  fetchStatCards()
  fetchPatrolData()
  fetchCameraOptions()
  fetchRunningCameras()
  fetchAlarmInfoList()
  // 定时轮询：每 60 秒查询当前计划是否仍在执行，返回 false 时刷新列表和视频
  runningCameraTimer = setInterval(handlePolling, 60 * 1000)
})

onBeforeUnmount(() => {
  if (runningCameraTimer) {
    clearInterval(runningCameraTimer)
    runningCameraTimer = null
  }
})

/** ===== 实时监控画面（运行中的巡更摄像头） ===== */
let runningCameraTimer: ReturnType<typeof setInterval> | null = null

const cameraList = ref<any[]>([])
/** 当前运行中的巡更计划ID（来自 runningPlan 接口返回） */
const runningPlanId = ref<number | undefined>(undefined)

const fetchRunningCameras = async () => {
  try {
    const res = await getRunningCameraList()
    // res 为 PatrolPlanDetailVo，取 cameras 列表映射为 CameraCarousel 所需格式
    const cameras = res?.cameras || []
    // 记录当前运行中的计划ID，供轮询 isRunningPlan 使用
    runningPlanId.value = res?.id
    cameraList.value = cameras.map((cam: any) => ({
      id: cam.id || cam.indexCode,
      cameraName: cam.cameraName || cam.indexCode,
      url: cam.url,
      indexCode: cam.indexCode,
      planId: cam.planId,
    }))
  } catch (error) {
    console.error('获取运行中的巡更摄像头失败:', error)
  }
}

/**
 * 定时轮询：查询当前计划是否仍在执行
 * - isRunningPlan 返回 true  → 计划仍在执行，不刷新
 * - isRunningPlan 返回 false → 计划已结束，刷新巡更计划列表 + 运行中摄像头
 * - 没有运行中的计划ID时，直接刷新
 */
const handlePolling = async () => {
  // 没有运行中的计划ID，直接刷新
  if (!runningPlanId.value) {
    await fetchPatrolData()
    await fetchRunningCameras()
    return
  }

  try {
    const isRunning = await checkIsRunningPlan({ id: runningPlanId.value })
    if (!isRunning) {
      // 计划已结束，刷新巡更计划列表和运行中摄像头
      await fetchPatrolData()
      await fetchRunningCameras()
    }
  } catch (error) {
    console.error('查询计划执行状态失败:', error)
  }
}

const patrolColumns = [
  { title: '计划名称', dataIndex: 'planName', key: 'planName' },
  { title: '巡更路线', dataIndex: 'patrolRoute', key: 'patrolRoute' },
  { title: '执行周期', dataIndex: 'executionCycle', key: 'executionCycle' },
  { title: '下次执行', dataIndex: 'nextExecution', key: 'nextExecution' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 80 },
]

/** 巡更计划状态映射 (0=停用, 1=启动) */
const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '停用', color: 'red' },
  1: { text: '启动', color: 'green' },
  2: { text: '运行中', color: 'blue' },
}

/** 巡更计划数据 */
const patrolData = ref<PatrolPlan[]>([])
const patrolLoading = ref(false)
const patrolPagination = ref({
  current: 1,
  pageSize: 5,
  total: 0,
})

const fetchPatrolData = async () => {
  patrolLoading.value = true
  try {
    const res = await getPatrolPlanList({
      pageNo: patrolPagination.value.current,
      pageSize: patrolPagination.value.pageSize,
    })
    patrolData.value = res.records || []
    patrolPagination.value.total = res.total || 0
    patrolPagination.value.pageSize = res.size || 10
    patrolPagination.value.current = res.current || 1
  } catch (error) {
    console.error('获取巡更计划列表失败:', error)
  } finally {
    patrolLoading.value = false
  }
}

const handlePatrolTableChange = (pag: any) => {
  patrolPagination.value.current = pag.current
  patrolPagination.value.pageSize = pag.pageSize
  fetchPatrolData()
}

/** ===== 巡更计划新增/编辑弹窗（复用） ===== */
const patrolModalVisible = ref(false)
const patrolModalLoading = ref(false)
const patrolModalMode = ref<'add' | 'edit'>('add')
const patrolModalTitle = computed(() => patrolModalMode.value === 'add' ? '新增巡更计划' : '编辑巡更计划')
const patrolFormRef = ref<FormInstance>()

const patrolForm = reactive({
  id: 0,
  planName: '',
  patrolRoute: '',
  executionCycle: '',
  indexCodes: [] as string[],
  statusChecked: false,
})

const patrolRules = {
  planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  patrolRoute: [{ required: true, message: '请输入巡更路线', trigger: 'blur' }],
  executionCycle: [{ required: true, message: '请选择执行周期', trigger: 'change' }],
  indexCodes: [{ required: true, message: '请选择摄像头', trigger: 'change' }],
}

/** 摄像头列表选项 */
const cameraOptions = ref<CameraItem[]>([])

/** 摄像头下拉模糊搜索：按 name 字段匹配 */
const filterCameraOption = (input: string, option: any) => {
  const name = option?.name || ''
  return name.toLowerCase().includes(input.toLowerCase())
}

const fetchCameraOptions = async () => {
  try {
    const res = await getCameraList()
    cameraOptions.value = res || []
  } catch (error) {
    console.error('获取摄像头列表失败:', error)
  }
}

const resetPatrolForm = () => {
  patrolForm.id = 0
  patrolForm.planName = ''
  patrolForm.patrolRoute = ''
  patrolForm.executionCycle = ''
  patrolForm.indexCodes = []
  patrolForm.statusChecked = true
  patrolFormRef.value?.clearValidate()
}

/** 新增 */
const handleAddPatrol = () => {
  patrolModalMode.value = 'add'
  resetPatrolForm()
  patrolModalVisible.value = true
}

/** 编辑 */
const handleEditPatrol = (record: PatrolPlan) => {
  patrolModalMode.value = 'edit'
  patrolForm.id = record.id
  patrolForm.planName = record.planName
  patrolForm.patrolRoute = record.patrolRoute
  patrolForm.executionCycle = record.executionCycle
  patrolForm.indexCodes = []
  patrolForm.statusChecked = record.status === 1
  patrolModalVisible.value = true
}

/** 提交（新增/编辑复用） */
const handlePatrolSubmit = async () => {
  try {
    if (patrolModalMode.value === 'add') {
      await patrolFormRef.value?.validate()
    }
    patrolModalLoading.value = true

    if (patrolModalMode.value === 'add') {
      await addPatrolPlan({
        planName: patrolForm.planName,
        patrolRoute: patrolForm.patrolRoute,
        executionCycle: patrolForm.executionCycle,
        indexCodes: patrolForm.indexCodes,
        status: patrolForm.statusChecked ? 1 : 0,
      })
    } else {
      await editPatrolPlan({
        id: patrolForm.id,
        status: patrolForm.statusChecked ? 1 : 0,
      })
    }

    patrolModalVisible.value = false
    resetPatrolForm()
    fetchPatrolData()
  } catch (error) {
    console.error('提交巡更计划失败:', error)
  } finally {
    patrolModalLoading.value = false
  }
}

const handlePatrolCancel = () => {
  patrolModalVisible.value = false
  resetPatrolForm()
}

// ===== 报警信息列表（AI视频分析事件） =====
/** 事件等级映射：0-未配置 1-低 2-中 3-高 */
const alarmLevelMap: Record<number, 'danger' | 'warning' | 'info'> = {
  3: 'danger',
  2: 'warning',
  1: 'info',
  0: 'info',
}

/** 报警信息列表 */
const alarmInfoList = ref<EventNotify[]>([])

/** 格式化时间：ISO8601 → 可读格式 */
const formatTime = (iso?: string): string => {
  if (!iso) return '--'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 前端展示用的事件列表（映射为 AlertCard 所需格式） */
const aiEvents = computed(() =>
  alarmInfoList.value.map((item) => ({
    id: item.id,
    level: alarmLevelMap[item.eventLvl ?? 0] ?? 'info',
    title: item.srcName || item.ability || '报警事件',
    description: item.eventTypeName || `事件类型: ${item.eventType ?? '--'}`,
    time: formatTime(item.happenTime || item.gmtCreate),
    location: item.srcName || '--',
  })),
)

// 显示前3个事件
const displayedAIEvents = computed(() => aiEvents.value.slice(0, 3))

const fetchAlarmInfoList = async () => {
  try {
    const res = await getAlarmInfoList({ pageNo: 1, pageSize: 100 })
    if (Array.isArray(res)) {
      alarmInfoList.value = res
    } else {
      alarmInfoList.value = res?.records || []
    }
  } catch (error) {
    console.error('获取报警信息列表失败:', error)
  }
}

// 弹窗状态
const aiEventsModalVisible = ref(false)

// 查看全部事件
const handleViewAllAIEvents = () => {
  aiEventsModalVisible.value = true
}
</script>

<style scoped lang="less">
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
  margin-bottom: 20px;
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
  }

  .card-body {
    padding: 22px;
  }
}

.patrol-card-body {
  max-height: 360px;
  overflow-y: auto;
}

.ai-events-modal {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
