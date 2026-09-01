<template>
  <div class="security-tab">
    <!-- 统计卡片行 -->
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in statCardsForRender"
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
        <div class="monitor-actions">
          <a-tag v-if="manualMode" color="blue">手动模式</a-tag>
          <a-button v-if="manualMode" type="link" size="small" @click="handleRestorePatrol">恢复巡更</a-button>
          <a-button size="small" @click="openCameraDrawer"><ApartmentOutlined /> 选择摄像头</a-button>
          <a-radio-group v-model:value="gridLayout" button-style="solid" size="small">
            <a-radio-button :value="1">1×1</a-radio-button>
            <a-radio-button :value="2">2×2</a-radio-button>
            <a-radio-button :value="3">3×3</a-radio-button>
            <a-radio-button :value="4">4×4</a-radio-button>
          </a-radio-group>
          <button class="collapse-btn" @click="monitorCollapsed = !monitorCollapsed">
            <CaretDownOutlined v-if="!monitorCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!monitorCollapsed" class="card-body">
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

    <!-- 摄像头分布地图 -->
    <div class="card">
      <div class="card-header">
        <h3><EnvironmentOutlined /> 摄像头分布地图</h3>
        <button class="collapse-btn" @click="mapCollapsed = !mapCollapsed">
          <CaretDownOutlined v-if="!mapCollapsed" />
          <CaretUpOutlined v-else />
        </button>
      </div>
      <div v-show="!mapCollapsed" class="card-body">
        <SecurityCameraMap />
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
            :field-names="{ label: 'name', value: 'systemId' }"
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

    <!-- 巡更计划结束确认弹窗 -->
    <a-modal
      v-model:visible="patrolFinishedModalVisible"
      title="巡更计划已结束"
      width="520px"
      ok-text="确认"
      cancel-text="取消"
      @ok="handleFinishedConfirm"
      @cancel="handleFinishedCancel"
    >
      <div class="finished-plan-info">
        <a-descriptions :column="1" size="small" bordered>
          <a-descriptions-item label="计划名称">{{ runningPlanDetail?.planName || '--' }}</a-descriptions-item>
          <a-descriptions-item label="巡更路线">{{ runningPlanDetail?.patrolRoute || '--' }}</a-descriptions-item>
          <a-descriptions-item label="执行周期">{{ runningPlanDetail?.executionCycle || '--' }}</a-descriptions-item>
          <a-descriptions-item label="下次执行">{{ runningPlanDetail?.nextExecution || '--' }}</a-descriptions-item>
          <a-descriptions-item label="关联摄像头">
            <span v-if="runningPlanDetail?.cameras?.length">
              {{ runningPlanDetail.cameras.map((c) => c.cameraName || c.indexCode).join('、') }}
            </span>
            <span v-else>--</span>
          </a-descriptions-item>
        </a-descriptions>
        <p v-if="manualMode" class="finished-tip">当前为手动监控模式，确认后仅刷新巡更列表，不影响自选画面。</p>
        <p v-else class="finished-tip">该巡更计划已执行结束，是否刷新巡更列表和监控画面？</p>
      </div>
    </a-modal>

    <!-- 摄像头选择抽屉（手动模式） -->
    <a-drawer
      v-model:visible="drawerVisible"
      title="选择摄像头"
      placement="right"
      width="460"
      :body-style="{ paddingTop: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }"
    >
      <a-input-search
        v-model:value="cameraSearchValue"
        placeholder="搜索摄像头"
        allow-clear
        style="margin-bottom: 12px; flex-shrink: 0"
      />
      <div class="camera-tree-wrap">
        <a-tree
          v-if="filteredCameraTreeData.length > 0"
          v-model:checkedKeys="cameraCheckedKeys"
          v-model:expandedKeys="cameraExpandedKeys"
          :tree-data="filteredCameraTreeData"
          checkable
          :selectable="false"
          show-line
        />
        <a-empty v-else description="无匹配摄像头" />
      </div>

      <!-- 已选摄像头（可在此取消选中） -->
      <div v-if="checkedCameras.length > 0" class="camera-checked-wrap">
        <div class="camera-checked-title">已选摄像头（{{ checkedCameras.length }}）</div>
        <div class="camera-checked-tags">
          <a-tag
            v-for="cam in checkedCameras"
            :key="cam.key"
            closable
            @close="removeCheckedCamera(cam.key)"
          >
            {{ cam.name }}
          </a-tag>
        </div>
      </div>
      <template #footer>
        <div class="camera-drawer-footer">
          <span class="camera-selected-count">已选 {{ cameraCheckedLeafCount }} / 当前布局最多 {{ gridCapacity }}</span>
          <div>
            <a-button style="margin-right: 8px" @click="drawerVisible = false">取消</a-button>
            <a-button type="primary" @click="handleCameraSelectConfirm">确认</a-button>
          </div>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { StatCard, AlertCard } from '/@/views/bems-web/components'
import CameraCarousel from '../../../components/CameraCarousel/index.vue'
import SecurityCameraMap from './SecurityCameraMap.vue'
import {
  getSecuritySummary,
  getPatrolPlanList,
  editPatrolPlan,
  addPatrolPlan,
  getCameraPackageGroup,
  getCameraList,
  getRunningCameraList,
  checkIsRunningPlan,
  getAlarmInfoList,
} from '../../index.api'
import type { StatItem, PatrolPlan, PackageGroup, PackageVideo, CameraItem, EventNotify, PatrolPlanDetailVo } from '../../index.api'
import {
  VideoCameraOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  WarningOutlined,
  ApartmentOutlined,
  EnvironmentOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'SecurityTab' })

/** 折叠状态 */
const monitorCollapsed = ref(false)
const mapCollapsed = ref(false)

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

/** 摄像头总数 / 在线数（来自摄像头分组树叶子，由 fetchCameraOptions 统计） */
const cameraTotalCount = ref(0)
const cameraOnlineCount = ref(0)

/** 渲染用统计卡片：监控摄像头总数(第1张)、在线摄像头数量(第2张)用摄像头树数据覆盖 */
const statCardsForRender = computed(() =>
  statCards.value.map((item, idx) => {
    if (idx === 0) {
      return { ...item, value: String(cameraTotalCount.value) }
    }
    if (idx === 1) {
      const total = cameraTotalCount.value
      const online = cameraOnlineCount.value
      const rate = total > 0 ? Math.floor((online / total) * 100) : 0
      return { ...item, value: String(online), context: `在线率 ${rate}%` }
    }
    return item
  }),
)

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
/** 当前运行中的巡更计划完整详情（供结束弹窗展示） */
const runningPlanDetail = ref<PatrolPlanDetailVo | null>(null)
/** 巡更计划结束确认弹窗显隐 */
const patrolFinishedModalVisible = ref(false)
/** 已通知结束的巡更计划ID（防重复弹窗） */
const notifiedFinishedPlanId = ref<number | undefined>(undefined)

const fetchRunningCameras = async () => {
  try {
    const res = await getRunningCameraList()
    // 运行计划ID发生变化（新计划开始）时，重置已通知标记，保证新计划结束时能再次提醒
    if (res?.id && res.id !== runningPlanId.value) {
      notifiedFinishedPlanId.value = undefined
    }
    // 缓存完整巡更计划详情，供结束弹窗展示
    runningPlanDetail.value = res || null
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
      // 已通知过该计划结束，本轮跳过，避免每轮重复弹窗
      if (runningPlanId.value === notifiedFinishedPlanId.value) {
        return
      }
      // 记录已通知，并弹出确认弹窗展示巡更信息（不直接刷新，由用户确认后刷新）
      notifiedFinishedPlanId.value = runningPlanId.value
      patrolFinishedModalVisible.value = true
    }
  } catch (error) {
    console.error('查询计划执行状态失败:', error)
  }
}

/** 巡更计划结束弹窗：确认 → 刷新巡更列表；手动模式下不覆盖自选画面 */
const handleFinishedConfirm = async () => {
  patrolFinishedModalVisible.value = false
  await fetchPatrolData()
  if (!manualMode.value) {
    await fetchRunningCameras()
  }
}

/** 巡更计划结束弹窗：取消 → 仅关闭弹窗 */
const handleFinishedCancel = () => {
  patrolFinishedModalVisible.value = false
}

/** ===== 摄像头选择抽屉（手动模式：自选摄像头覆盖巡更画面） ===== */
const drawerVisible = ref(false)
/** 是否手动模式（用户自选摄像头，覆盖巡更画面） */
const manualMode = ref(false)
/** 抽屉内树勾选的 key 列表（父子联动，含分组与叶子） */
const cameraCheckedKeys = ref<(string | number)[]>([])
const cameraExpandedKeys = ref<(string | number)[]>([])
const cameraSearchValue = ref('')
/** 摄像头选择树数据（a-tree 格式） */
const cameraTreeData = ref<any[]>([])
/** 叶子 key → PackageVideo 映射，确认时用于取 url/indexCode */
const cameraLeafMap = new Map<string, PackageVideo>()
/** 手动模式下已选的完整摄像头列表（截断前），切换网格时重新截取 */
const manualCameras = ref<any[]>([])

/** 当前网格容量：1×1=1, 2×2=4, 3×3=9, 4×4=16 */
const gridCapacity = computed(() => gridLayout.value * gridLayout.value)

/** 叶子 key 以 v- 开头，用于计数与映射 */
const isLeafKey = (k: string | number): k is string => typeof k === 'string' && k.startsWith('v-')

/** 已选叶子数量 */
const cameraCheckedLeafCount = computed(() => cameraCheckedKeys.value.filter(isLeafKey).length)

/** 已选摄像头列表（树下方展示与取消用） */
const checkedCameras = computed(() =>
  cameraCheckedKeys.value.filter(isLeafKey).map((k) => ({
    key: k,
    name: cameraLeafMap.get(k)?.name || k,
  })),
)

/** 取消选中单个摄像头（从 checkedKeys 移除该叶子 key，父子联动自动更新） */
const removeCheckedCamera = (key: string) => {
  cameraCheckedKeys.value = cameraCheckedKeys.value.filter((k) => k !== key)
}

/** 收集树中所有分组 key（用于搜索时全部展开） */
const collectGroupKeys = (nodes: any[]): (string | number)[] =>
  nodes.flatMap((n) => (n.isLeaf ? [] : [n.key, ...collectGroupKeys(n.children || [])]))

/** 计算分组下（含子孙）摄像头叶子总数 */
const countGroupCameras = (g: PackageGroup): number => {
  const direct = (g.videoList || []).length
  const sub = (g.children || []).reduce((sum, child) => sum + countGroupCameras(child), 0)
  return direct + sub
}

/** 将分组树转为 a-tree treeData，并填充叶子映射 */
const buildCameraTreeData = (groups: PackageGroup[]): any[] => {
  cameraLeafMap.clear()
  const walk = (list: PackageGroup[]): any[] =>
    list
      .map((g) => {
        const leaves = (g.videoList || []).map((v) => {
          // 新格式以 indexCode 为摄像头唯一编码；兼容旧格式 systemId/id
          const leafKey = `v-${v.indexCode || (v.systemId || '').replace(/#/g, '') || v.id}`
          cameraLeafMap.set(leafKey, v)
          return { title: v.name, key: leafKey, isLeaf: true }
        })
        const subChildren = walk(g.children || [])
        return {
          title: `${g.name}（${countGroupCameras(g)}）`,
          name: g.name,
          key: `grp-${g.indexCode || g.id}`,
          disableCheckbox: true,
          children: [...leaves, ...subChildren],
        }
      })
      .filter((n) => n.children.length > 0)
  return walk(groups)
}

/** 搜索过滤：保留命中叶子及其祖先链 */
const filteredCameraTreeData = computed(() => {
  const kw = cameraSearchValue.value.trim().toLowerCase()
  if (!kw) return cameraTreeData.value
  const filterWalk = (nodes: any[]): any[] =>
    nodes
      .map((n) => {
        if (n.isLeaf) {
          // 命中关键字 或 已选中 → 保留（避免搜索时已选被树丢弃）
          const hit = n.title?.toLowerCase().includes(kw)
          const selected = cameraCheckedKeys.value.includes(n.key)
          return hit || selected ? n : null
        }
        // 分组：名称命中则整棵保留（含全部子孙）；否则递归过滤子节点
        if (n.name?.toLowerCase().includes(kw)) {
          return n
        }
        const children = filterWalk(n.children || [])
        return children.length > 0 ? { ...n, children } : null
      })
      .filter(Boolean) as any[]
  return filterWalk(cameraTreeData.value)
})

/** 搜索时展开所有分组，便于查看命中项（手动收集全部分组 key） */
watch(cameraSearchValue, (val) => {
  if (val) {
    cameraExpandedKeys.value = collectGroupKeys(cameraTreeData.value)
  }
})

/** 打开抽屉：回填当前已选叶子，便于增删 */
const openCameraDrawer = () => {
  if (manualMode.value && manualCameras.value.length) {
    cameraCheckedKeys.value = manualCameras.value.map((c) => `v-${c.indexCode}`)
  }
  drawerVisible.value = true
}

/** 摄像头播放地址前缀（拼接摄像头 indexCode 编码） */
const CAMERA_PLAY_URL = 'http://10.168.47.23:4000/index.html?id='

/** 确认选择：叶子映射为上墙对象，缺编码忽略，超容量截断 */
const handleCameraSelectConfirm = () => {
  const leafKeys = cameraCheckedKeys.value.filter(isLeafKey)
  if (leafKeys.length === 0) {
    message.warning('请至少选择一个摄像头')
    return
  }
  const valid: any[] = []
  const noIdNames: string[] = []
  leafKeys.forEach((k) => {
    const v = cameraLeafMap.get(k)
    if (!v) return
    const indexCode = v.indexCode || (v.systemId || '').replace(/#/g, '')
    if (!indexCode) {
      noIdNames.push(v.name)
      return
    }
    valid.push({
      id: v.indexCode || v.id,
      cameraName: v.name,
      url: `${CAMERA_PLAY_URL}${indexCode}`,
      indexCode,
    })
  })
  if (noIdNames.length > 0) {
    message.warning(`以下摄像头缺少编码，已忽略：${noIdNames.join('、')}`)
  }
  if (valid.length === 0) {
    message.warning('所选摄像头均无法生成播放地址，无法上墙')
    return
  }
  if (valid.length > gridCapacity.value) {
    message.warning(`当前布局最多展示 ${gridCapacity.value} 路，将只显示前 ${gridCapacity.value} 路`)
  }
  manualCameras.value = valid
  cameraList.value = valid.slice(0, gridCapacity.value)
  manualMode.value = true
  drawerVisible.value = false
}

/** 恢复巡更：退出手动模式，重新拉取运行中摄像头 */
const handleRestorePatrol = async () => {
  manualMode.value = false
  manualCameras.value = []
  cameraCheckedKeys.value = []
  await fetchRunningCameras()
  message.success('已恢复巡更画面')
}

/** 手动模式下切换网格：按新容量重新截断显示 */
watch(gridLayout, () => {
  if (manualMode.value && manualCameras.value.length) {
    const cap = gridCapacity.value
    cameraList.value = manualCameras.value.slice(0, cap)
    if (manualCameras.value.length > cap) {
      message.warning(`当前布局最多展示 ${cap} 路，已截断显示`)
    }
  }
})

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

/** 摄像头列表选项（用于巡更摄像头选择，扁平列表） */
const cameraOptions = ref<CameraItem[]>([])

/** 摄像头下拉模糊搜索：按 name 字段匹配 */
const filterCameraOption = (input: string, option: any) => {
  const name = option?.name || ''
  return name.toLowerCase().includes(input.toLowerCase())
}

const fetchCameraOptions = async () => {
  try {
    // 巡更摄像头下拉：扁平列表
    const list = await getCameraList()
    cameraOptions.value = Array.isArray(list) ? list : []
    // 摄像头选择树 + 叶子映射 + 统计：分组树
    const res = await getCameraPackageGroup()
    const groups: PackageGroup[] = Array.isArray(res) ? res : []
    cameraTreeData.value = buildCameraTreeData(groups)
    cameraExpandedKeys.value = cameraTreeData.value.map((n) => n.key)
    // 统计摄像头总数与在线数（新格式 online 为数值 1-在线/0-离线，兼容旧格式布尔值），供统计卡片使用
    cameraTotalCount.value = cameraLeafMap.size
    cameraOnlineCount.value = [...cameraLeafMap.values()].filter((v) => v.online === 1 || v.online).length
  } catch (error) {
    console.error('获取摄像头数据失败:', error)
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

.finished-tip {
  margin: 16px 0 0;
  color: #faad14;
  font-size:16px;
}

.monitor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size:14px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}

.camera-tree-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  // 隐藏分组节点的 checkbox（分组 disableCheckbox，仅摄像头叶子可勾选）
  :deep(.ant-tree-checkbox-disabled) {
    display: none;
  }
}

.camera-checked-wrap {
  flex-shrink: 0;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  .camera-checked-title {
    font-size:16px;
    color: #666;
    margin-bottom: 8px;
  }

  .camera-checked-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
  }
}

.camera-drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.camera-selected-count {
  color: #666;
  font-size:16px;
}
</style>
