<template>
  <div class="security-page">
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
      </div>
      <div class="card-body">
        <CameraCarousel :cameras="cameraList" :items-per-page="8" />
      </div>
    </div>

    <!-- 两栏布局：视频巡更计划 + AI分析事件 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><ScheduleOutlined /> 视频巡更计划</h3>
          <a-button type="primary" @click="handleAddPatrol">+ 新增巡更</a-button>
        </div>
        <div class="card-body">
          <a-table
            :columns="patrolColumns"
            :data-source="patrolData"
            :pagination="patrolPagination"
            :loading="patrolLoading"
            row-key="id"
            size="small"
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
          v-for="event in allAIEvents"
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
import CameraCarousel from '../components/CameraCarousel/index.vue'
import { getSecuritySummary, getPatrolPlanList, editPatrolPlan, addPatrolPlan, getCameraList, getRunningCameraList, checkIsRunningPlan } from './index.api'
import {
  VideoCameraOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'SecurityManagementPage' })

/** 卡片颜色与图标配置（与后端返回顺序对应） */
const cardConfig = [
  { color: 'blue' as const, icon: VideoCameraOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: ScheduleOutlined },
  { color: 'red' as const, icon: WarningOutlined },
]

/** 统计卡片数据 */
interface StatItem {
  title: string
  value: string
  context: string
}

/**
 * ResultPatrolPlanDetailVo
 */
export interface Response {
    /**
     * 返回代码
     */
    code?: number;
    /**
     * 返回处理消息
     */
    message?: string;
    /**
     * 返回数据对象
     */
    result?: PatrolPlanDetailVo;
    /**
     * 成功标志
     */
    success?: boolean;
    /**
     * 时间戳
     */
    timestamp?: number;
    [property: string]: any;
}

/**
 * 返回数据对象
 *
 * PatrolPlanDetailVo
 */
export interface PatrolPlanDetailVo {
    /**
     * 关联摄像头列表
     */
    cameras?: PlanCamera[];
    /**
     * 创建人
     */
    createBy?: string;
    /**
     * 创建日期
     */
    createTime?: string;
    /**
     * 执行周期
     */
    executionCycle?: string;
    /**
     * 主键
     */
    id?: number;
    /**
     * 下次执行
     */
    nextExecution?: string;
    pageNo?: number;
    pageSize?: number;
    /**
     * 巡更路线
     */
    patrolRoute?: string;
    /**
     * 计划名称
     */
    planName?: string;
    /**
     * 状态
     */
    status?: number;
    /**
     * 所属部门
     */
    sysOrgCode?: string;
    /**
     * 更新人
     */
    updateBy?: string;
    /**
     * 更新日期
     */
    updateTime?: string;
    [property: string]: any;
}

/**
 * table_plan_camera对象
 *
 * PlanCamera
 */
export interface PlanCamera {
    /**
     * 摄像头名称（非数据库字段，联表查询）
     * 摄像头名称
     */
    cameraName?: string;
    /**
     * 主键
     */
    id?: number;
    /**
     * 摄像头唯一编码
     */
    indexCode?: string;
    /**
     * 巡更计划ID
     */
    planId?: number;
    /**
     * 视频流URL（HLS m3u8）
     */
    url?: string;
    [property: string]: any;
}

/**
 * PatrolPlanDto
 */
export interface Request {
    /**
     * 创建日期
     */
    createTime?: string;
    /**
     * 执行周期
     */
    executionCycle?: string;
    /**
     * 主键
     */
    id?: number;
    /**
     * 摄像头唯一编码列表
     */
    indexCodes?: string[];
    /**
     * 巡更路线
     */
    patrolRoute?: string;
    /**
     * 计划名称
     */
    planName?: string;
    /**
     * 状态
     */
    status?: number;
    [property: string]: any;
}

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
interface PatrolPlan {
  id: number
  planName: string
  patrolRoute: string
  executionCycle: string
  nextExecution: string
  status: number
}
const patrolData = ref<PatrolPlan[]>([])
const patrolLoading = ref(false)
const patrolPagination = ref({
  current: 1,
  pageSize: 10,
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
interface CameraItem {
  indexCode: string
  name: string
}
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
  patrolFormRef.value?.resetFields()
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
      message.success('新增成功')
    } else {
      await editPatrolPlan({
        id: patrolForm.id,
        status: patrolForm.statusChecked ? 1 : 0,
      })
      message.success('修改成功')
    }

    patrolModalVisible.value = false
    fetchPatrolData()
  } catch (error) {
    console.error('提交巡更计划失败:', error)
  } finally {
    patrolModalLoading.value = false
  }
}

const handlePatrolCancel = () => {
  patrolModalVisible.value = false
}

// 所有AI事件数据
const allAIEvents = [
  {
    id: 1,
    level: 'danger' as const,
    title: '人员聚集检测',
    description: 'A馆F2展厅检测到超50人聚集，存在安全隐患',
    time: '2026-06-09 14:20',
    location: 'A馆F2展厅'
  },
  {
    id: 2,
    level: 'warning' as const,
    title: '遗留物检测',
    description: 'B馆F1大厅中央区域发现可疑遗留物品',
    time: '2026-06-09 13:45',
    location: 'B馆F1大厅'
  },
  {
    id: 3,
    level: 'danger' as const,
    title: '禁区入侵检测',
    description: 'C馆设备间检测到未授权人员进入',
    time: '2026-06-09 13:12',
    location: 'C馆设备间'
  },
  {
    id: 4,
    level: 'warning' as const,
    title: '异常行为检测',
    description: '停车场B区域检测到可疑徘徊行为',
    time: '2026-06-09 12:55',
    location: '停车场B区域'
  },
  {
    id: 5,
    level: 'info' as const,
    title: '周界入侵告警',
    description: '户外广场南侧围栏检测到异常触碰',
    time: '2026-06-09 12:30',
    location: '户外广场南侧'
  },
]

// 显示前3个事件
const displayedAIEvents = allAIEvents.slice(0, 3)

// 弹窗状态
const aiEventsModalVisible = ref(false)

// 查看全部事件
const handleViewAllAIEvents = () => {
  aiEventsModalVisible.value = true
}
</script>

<style scoped lang="less">
.security-page { padding: 0; }

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

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-red { background: #fed7d7; color: #742a2a; }

    .layout-control {
      display: flex;
      gap: 8px;
    }
  }

  .card-body {
    padding: 22px;
  }
}

// 状态点样式已在CameraCarousel组件中定义，此处保留通用样式

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  &.online { background: #52c41a; }
  &.offline { background: #ff4d4f; }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  &.normal { background: #c6f6d5; color: #22543d; }
  &.info { background: #bee3f8; color: #2a4365; }
  &.warning { background: #feebc8; color: #744210; }
}

.ai-events-modal {
  max-height: 60vh;
  overflow-y: auto;
}
</style>