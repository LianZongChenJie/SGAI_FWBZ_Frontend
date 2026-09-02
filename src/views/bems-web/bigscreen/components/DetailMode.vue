<template>
  <div class="detail-mode">
    <!-- 标点点击弹窗：一键开关 + 回路列表 -->
    <a-modal
      v-model:open="modalVisible"
      :footer="null"
      width="400px"
      centered
      :zIndex="90000"
      class="space-modal"
      wrapClassName="space-modal"
      :bodyStyle="{ padding: '16px', background: '#0b1a2f' }"
      @cancel="onCancel"
    >
      <template #title>
        <div class="light-tabs-title">
          <span>{{ currentSpaceName }}-{{ currentAreaName }}</span>
        </div>
      </template>
      <a-tabs type="card" class="video-tabs space-tabs">
        <!-- 1. 一键开关 + 回路列表 -->
        <a-tab-pane key="control" tab="一键开关">
          <div class="light-pane">
            <!-- 一键开关 -->
            <div class="pane-switch">
              <button class="icon-btn with-text" @click="handleAreaOn" title="全开">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" fill="none" />
                </svg>
                <span class="btn-text">全开</span>
              </button>
              <button class="icon-btn dark-btn with-text" @click="handleAreaOff" title="全关">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span class="btn-text">全关</span>
              </button>
            </div>

            <!-- 回路列表（普通标点） -->
            <div v-if="!isSpecial477 && !isSpecial478" class="pane-table">
              <div class="circuit-count-tag">
                <span class="circuit-count-left">
                  <span class="stat-label">回路已开/回路总数：</span>
                  <span class="stat-value">
                    <span class="number highlight-text">{{ circuitSummary.on }}</span>
                    /
                    <span class="number">{{ circuitSummary.total }}</span>
                  </span>
                </span>
                <button class="table-refresh-btn" :disabled="loading" @click="refreshCircuitList" title="刷新">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              </div>
              <a-spin :spinning="loading" class="pane-spin">
                <template v-if="circuitList.length">
                  <div class="circuit-vxe-table-wrap">
                    <table class="device-table">
                      <thead>
                        <tr>
                          <th>序号</th>
                          <th>回路名称</th>
                          <th>电流</th>
                          <th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, idx) in circuitList" :key="row._key || idx">
                          <td>{{ Number(idx) + 1 }}</td>
                          <td :title="row.name">{{ row.name }}</td>
                          <td :title="row.electricCurrent || ''">{{ row.electricCurrent || '' }}</td>
                          <td>
                            <span class="circuit-status" :class="row.status === '开启' ? 'is-on' : 'is-off'">
                              {{ row.status || '关闭' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
                <div v-else class="space-submenu-empty">暂无回路</div>
              </a-spin>
            </div>

            <!-- 节目列表（标点 id=477） -->
            <div v-else-if="isSpecial477" class="pane-table">
              <a-spin :spinning="loading" class="pane-spin">
                <template v-if="planList.length">
                  <div class="circuit-vxe-table-wrap">
                    <table class="device-table">
                      <thead>
                        <tr>
                          <th>节目名称</th>
                          <th>状态</th>
                          <th>操作 <button class="table-refresh-btn" :disabled="loading" @click="refreshDataList" title="刷新">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="23 4 23 10 17 10" />
                              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                          </button></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in planList" :key="row.id">
                          <td :title="row.name">{{ row.name }}</td>
                          <td>{{ row.programState || '' }}</td>
                          <td>
                            <div class="plan-action-group">
                              <button class="mini-action-btn is-on" @click="handleProgramAction(row, '开启')">播放</button>
                              <button class="mini-action-btn is-off" @click="handleProgramAction(row, '关闭')">停止</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
                <div v-else class="space-submenu-empty">暂无节目</div>
              </a-spin>
            </div>

            <!-- 区域列表（标点 id=478） -->
            <div v-else class="pane-table">
              <a-spin :spinning="loading" class="pane-spin">
                <template v-if="area478List.length">
                  <div class="circuit-vxe-table-wrap">
                    <table class="device-table">
                      <thead>
                        <tr>
                          <th>名称</th>
                          <th>状态</th>
                          <th>操作 <button class="table-refresh-btn" :disabled="loading" @click="refreshDataList" title="刷新">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="23 4 23 10 17 10" />
                              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                          </button></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in area478List" :key="row.id">
                          <td :title="row.name">{{ row.name }}</td>
                          <td>{{ row.status || '' }}</td>
                          <td>
                            <div class="plan-action-group">
                              <button class="mini-action-btn is-on" @click="handleArea478Action(row, '开启')">开</button>
                              <button class="mini-action-btn is-off" @click="handleArea478Action(row, '关闭')">关</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
                <div v-else class="space-submenu-empty">暂无区域</div>
              </a-spin>
            </div>
          </div>
        </a-tab-pane>

        <!-- 2. 监控视频 -->
        <a-tab-pane key="video" tab="监控视频">
          <div class="light-pane">
            <div class="video-wrapper" v-if="videoUrl">
              <iframe
                :src="videoUrl"
                frameborder="0"
                allow="autoplay; fullscreen; encrypted-media"
                allowfullscreen
                class="camera-iframe"
              />
            </div>
            <div v-else class="space-submenu-empty">暂无监控视频</div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 统一二次确认弹框 -->
    <ConfirmModal ref="confirmModalRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 详情模式组件 - 照明标点控制弹窗
 * 迁移自 bigGis/index.vue 的 lightTabsModal 相关功能
 * 支持：
 *   - 普通标点：回路列表 + 一键开关
 *   - 标点 id=477：节目列表 + 一键开关（节目全控）
 *   - 标点 id=478：区域列表 + 一键开关（按空间名控制）
 */
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { setAreaOpenApi, setAreaCloseApi, getCircuitListApi } from '@/api/baseSettingBqZm'
import {
  getLightingProgramList,
  getLightingProgramControl,
  postProgramAllControl,
  getAreaListBySpaceName,
  postControlBySpaceName,
} from '@/api/equipmentMonitoring'
import ConfirmModal from '@/views/bems-web/northAreaLightingSys/equipmentMonitoring/components/ConfirmModal.vue'

const props = defineProps<{
  mapInstance?: any
  flid?: string | null
  buildingId?: string
}>()

const emit = defineEmits<{
  (e: 'open-change', visible: boolean): void
}>()

// ==================== 状态 ====================
const modalVisible = ref(false)
const loading = ref(false)
const currentAreaId = ref('')
const currentSpaceName = ref('')
const currentAreaName = ref('')
const currentSpaceIds = ref<string[]>([])
const videoUrl = ref('')
const circuitList = ref<any[]>([])

// 特殊标点标记
const isSpecial477 = ref(false)
const isSpecial478 = ref(false)

// 节目列表（标点 id=477）
const planList = ref<any[]>([])
// 区域列表（标点 id=478）
const area478List = ref<any[]>([])

// 确认弹窗引用
const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null)

// 回路统计
const circuitSummary = computed(() => {
  const total = circuitList.value.length
  const on = circuitList.value.filter((item) => item.status === '开启').length
  return { on, total }
})

// ==================== 方法 ====================

/** 打开弹窗并加载数据 */
async function openModal(data: any) {
  const areaId = data?.id
  const spaceName = data?.spaceName || ''

  if (!areaId) {
    message.warning('缺少区域ID')
    return
  }

  currentAreaId.value = String(areaId)
  currentSpaceName.value = spaceName
  currentAreaName.value = data?.areaName || ''
  videoUrl.value = data?.monitorAdr ? `http://10.168.47.23:4000/index.html?id=${data.monitorAdr}` : ''
  circuitList.value = []
  planList.value = []
  area478List.value = []
  modalVisible.value = true
  emit('open-change', true)

  // 解析 spaceIds（逗号分隔的字符串或数组）
  const rawSpaceIds = data?.spaceIds || ''
  if (Array.isArray(rawSpaceIds)) {
    currentSpaceIds.value = rawSpaceIds.map(String)
  } else if (typeof rawSpaceIds === 'string' && rawSpaceIds.trim()) {
    currentSpaceIds.value = rawSpaceIds.split(',').map(s => s.trim()).filter(Boolean)
  } else {
    currentSpaceIds.value = []
  }

  // 特殊标点处理
  const idStr = String(areaId)
  isSpecial477.value = idStr === '477'
  isSpecial478.value = idStr === '478'

  await loadData()
}

/** 根据标点类型加载数据 */
async function loadData() {
  if (isSpecial477.value) {
    await loadPlanList()
  } else if (isSpecial478.value) {
    await loadArea478List()
  } else {
    await loadCircuitList()
  }
}

/** 加载回路列表（使用 getCircuitListApi 按 areaId 查询，与 bigGis 原文件保持一致） */
async function loadCircuitList() {
  if (!currentAreaId.value) {
    console.warn('[DetailMode] 无 areaId，无法获取回路')
    circuitList.value = []
    return
  }
  loading.value = true
  try {
    // 按 bigGis 原文件逻辑：使用 getCircuitListApi 按 areaId 查询回路
    const res: any = await getCircuitListApi({ pageSize: 999, areaId: currentAreaId.value })
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const list = Array.isArray(res) ? res : (res?.records || res?.list || res?.result || res?.data || [])
    circuitList.value = list.map((item: any, idx: number) => ({
      ...item,
      _key: item.id || item.circuitId || `circuit-${idx}`,
      name: item.circuitName || item.name || '回路' + (idx + 1),
    }))
    console.log('[DetailMode] 回路数据:', circuitList.value.length, '条，来源 areaId:', currentAreaId.value)
  } catch (error) {
    console.error('加载回路列表失败:', error)
    circuitList.value = []
  } finally {
    loading.value = false
  }
}

/** 加载节目列表（标点 id=477） */
async function loadPlanList() {
  loading.value = true
  try {
    const data = await getLightingProgramList({ pageNo: 1, pageSize: 999 })
    const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || [])
    planList.value = records.map((item: any, idx: number) => ({
      ...item,
      id: item.id || idx,
      name: item.programName,
      enabled: item.programStatus === '开启' || item.enabled === true,
    }))
  } catch (error) {
    console.error('加载节目列表失败:', error)
    planList.value = []
  } finally {
    loading.value = false
  }
}

/** 加载区域列表（标点 id=478） */
async function loadArea478List() {
  loading.value = true
  try {
    const data = await getAreaListBySpaceName({ id: 1 })
    const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || [])
    area478List.value = records.map((item: any, idx: number) => ({
      ...item,
      id: item.id || item.areaId || idx,
      name: item.name || item.areaName || '区域' + (idx + 1),
      status: item.status || item.state || item.areaState || '关闭',
    }))
  } catch (error) {
    console.error('加载区域列表失败:', error)
    area478List.value = []
  } finally {
    loading.value = false
  }
}

/** 刷新回路列表 */
async function refreshCircuitList() {
  if (loading.value) return
  await loadCircuitList()
  message.success('刷新成功')
}

/** 刷新数据列表（根据当前模式刷新） */
async function refreshDataList() {
  if (loading.value) return
  await loadData()
  message.success('刷新成功')
}

/** 接口业务失败时抛出错误 */
function throwIfControlFailed(res: any) {
  if (res && res.success === false) {
    throw new Error(res.message || '操作失败')
  }
  return res
}

/** 显示确认弹窗 */
function showConfirm(opts: {
  content: string
  okText?: string
  onOk: () => void | Promise<void>
  onCancel?: () => void
}) {
  confirmModalRef.value?.showModal(opts)
}

/** 全开 */
async function handleAreaOn() {
  // 标点 id=477：节目全开
  if (isSpecial477.value) {
    showConfirm({
      content: `确定要 <strong class="tip-action">全开</strong> 所有节目吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(await postProgramAllControl({ operationType: '开启' }))
          message.success('全开成功')
          await loadPlanList().catch(() => {})
        } catch (error) {
          console.error('全开失败:', error)
        }
      },
    })
    return
  }

  // 标点 id=478：按空间名控制地块全开
  if (isSpecial478.value) {
    showConfirm({
      content: `确定要 <strong class="tip-action">全开</strong> 地块"1号馆"的所有区域吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(await postControlBySpaceName({ spaceName: '1号馆', operationType: '开启' }))
          message.success('全开成功')
          await loadArea478List().catch(() => {})
        } catch (error) {
          console.error('全开失败:', error)
        }
      },
    })
    return
  }

  // 普通标点：区域全开
  if (!currentAreaId.value) return
  showConfirm({
    content: `确定要 <strong class="tip-action">全开</strong> 区域"${currentAreaName}"吗？`,
    onOk: async () => {
      try {
        await throwIfControlFailed(await setAreaOpenApi({ id: currentAreaId.value }))
        message.success('全开成功')
        await loadCircuitList().catch(() => {})
      } catch (error) {
        console.error('全开失败:', error)
      }
    },
  })
}

/** 全关 */
async function handleAreaOff() {
  // 标点 id=477：节目全关
  if (isSpecial477.value) {
    showConfirm({
      content: `确定要 <strong class="tip-action">全关</strong> 所有节目吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(await postProgramAllControl({ operationType: '关闭' }))
          message.success('全关成功')
          await loadPlanList().catch(() => {})
        } catch (error) {
          console.error('全关失败:', error)
        }
      },
    })
    return
  }

  // 标点 id=478：按空间名控制地块全关
  if (isSpecial478.value) {
    showConfirm({
      content: `确定要 <strong class="tip-action">全关</strong> 地块"1号馆"的所有区域吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(await postControlBySpaceName({ spaceName: '1号馆', operationType: '关闭' }))
          message.success('全关成功')
          await loadArea478List().catch(() => {})
        } catch (error) {
          console.error('全关失败:', error)
        }
      },
    })
    return
  }

  // 普通标点：区域全关
  if (!currentAreaId.value) return
  showConfirm({
    content: `确定要 <strong class="tip-action">全关</strong> 区域"${currentAreaName}"吗？`,
    onOk: async () => {
      try {
        await throwIfControlFailed(await setAreaCloseApi({ id: currentAreaId.value }))
        message.success('全关成功')
        await loadCircuitList().catch(() => {})
      } catch (error) {
        console.error('全关失败:', error)
      }
    },
  })
}

/** 节目控制（标点 id=477） */
function handleProgramAction(row: any, action: '开启' | '关闭') {
  showConfirm({
    content: `确定要 <strong class="tip-action">${action}</strong> 节目"${row.name || row.programName || '-'}"吗？`,
    onOk: async () => {
      try {
        await throwIfControlFailed(
          await getLightingProgramControl({
            operationType: action,
            programId: row.id,
          }),
        )
        message.success(`${action}成功`)
        await loadPlanList()
      } catch (error) {
        console.error(`节目${action}失败:`, error)
      }
    },
  })
}

/** 区域控制（标点 id=478） */
function handleArea478Action(row: any, action: '开启' | '关闭') {
  if (!row.id) {
    message.warning('该区域无 ID，无法执行操作')
    return
  }
  const actionText = action === '开启' ? '开启' : '关闭'
  showConfirm({
    content: `确定要 <strong class="tip-action">${actionText}</strong> 区域"${row.name || '-'}"吗？`,
    onOk: async () => {
      try {
        if (action === '开启') {
          await throwIfControlFailed(await setAreaOpenApi({ id: row.id }))
        } else {
          await throwIfControlFailed(await setAreaCloseApi({ id: row.id }))
        }
        message.success(`${actionText}成功`)
        await loadArea478List()
      } catch (error) {
        console.error(`区域${actionText}失败:`, error)
      }
    },
  })
}

/** 关闭弹窗 */
function onCancel() {
  modalVisible.value = false
  circuitList.value = []
  planList.value = []
  area478List.value = []
  currentAreaId.value = ''
  currentSpaceName.value = ''
  currentAreaName.value = ''
  currentSpaceIds.value = []
  videoUrl.value = ''
  isSpecial477.value = false
  isSpecial478.value = false
  emit('open-change', false)
}

/** 刷新（暴露给父组件） */
function refresh() {
  return refreshDataList()
}

defineExpose({
  openModal,
  refresh,
})

// 监听弹窗关闭
watch(modalVisible, (val) => {
  if (!val) {
    circuitList.value = []
    planList.value = []
    area478List.value = []
  }
})
</script>

<style scoped lang="less">
.detail-mode {
  position: relative;
}

.light-tabs-title {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.light-pane {
  padding: 8px 0;
}

/* 一键开关 */
.pane-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.icon-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 4px;
  background: rgba(8, 20, 40, 0.85);
  color: #38bdf8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(56, 189, 248, 0.15);
    border-color: #38bdf8;
  }
}

.icon-btn.dark-btn {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.3);

  &:hover {
    background: rgba(148, 163, 184, 0.15);
    border-color: #94a3b8;
  }
}

.btn-text {
  font-size: 13px;
  font-weight: 500;
}

/* 回路列表 */
.pane-table {
  margin-top: 8px;
}

.circuit-count-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.circuit-count-left {
  color: #94a3b8;
}

.stat-label {
  color: #94a3b8;
}

.stat-value {
  color: #e2e8f0;
}

.number {
  font-variant-numeric: tabular-nums;
}

.number.highlight-text {
  color: #4ade80;
  font-weight: 600;
}

.table-refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 4px;
  background: transparent;
  color: #38bdf8;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(56, 189, 248, 0.15);
    border-color: #38bdf8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 回路状态 */
.circuit-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;

  &.is-on {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.15);
  }

  &.is-off {
    color: #f87171;
    background: rgba(248, 113, 113, 0.15);
  }
}

/* 节目状态 */
.program-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  color: #e2e8f0;
}

/* 设备表格 */
.device-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th, td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  }

  th {
    color: #94a3b8;
    font-weight: 500;
    background: rgba(56, 189, 248, 0.05);
  }

  td {
    color: #e2e8f0;
  }

  tbody tr:hover {
    background: rgba(56, 189, 248, 0.05);
  }
}

/* 空状态 */
.space-submenu-empty {
  padding: 24px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

/* 视频 */
.video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
}

.camera-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 操作按钮组 */
.plan-action-group {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.mini-action-btn {
  padding: 3px 10px;
  border: 1px solid;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &.is-on {
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.4);
    background: rgba(74, 222, 128, 0.1);

    &:hover {
      background: rgba(74, 222, 128, 0.2);
      border-color: #4ade80;
    }
  }

  &.is-off {
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.4);
    background: rgba(248, 113, 113, 0.1);

    &:hover {
      background: rgba(248, 113, 113, 0.2);
      border-color: #f87171;
    }
  }
}

/* 深度选择器：覆盖 ant-modal 标题样式 */
:deep(.space-modal) {
  .ant-modal-header {
    background: #0b1a2f;
    border-bottom: 1px solid rgba(56, 189, 248, 0.15);
    padding: 12px 16px;
  }

  .ant-modal-title {
    color: #e2e8f0;
  }
}

/* 深度选择器：覆盖 ant-tabs 样式 */
:deep(.space-tabs) {
  .ant-tabs-nav {
    margin-bottom: 12px;
    width: 100%;

    &::before {
      border-bottom: 1px solid rgba(56, 189, 248, 0.15);
    }
  }

  .ant-tabs-nav-list {
    width: 100%;
    display: flex;
  }

  .ant-tabs-tab {
    flex: 1;
    margin: 0;
    padding: 8px 0;
    justify-content: center;
    color: #cbd5e1;
    font-size: 13px;
    transition: color 0.2s ease;

    &:hover {
      color: #38bdf8;
    }
  }

  .ant-tabs-tab-btn {
    display: block;
    width: 100%;
    text-align: center;
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    background: linear-gradient(180deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.05));
    border-bottom: 1px solid #38bdf8;
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #38bdf8 !important;
    font-weight: 600;
  }

  .ant-tabs-ink-bar {
    background: #38bdf8;
  }
}

/* Spin 样式 */
:deep(.pane-spin) {
  .ant-spin-spinning {
    max-height: 320px;
  }
}

:deep(.ant-spin-dot-item) {
  background-color: #38bdf8;
}

/* 确认弹窗中的动作词高亮 */
:deep(.tip-action) {
  font-weight: 700;
  color: #38bdf8;
}
</style>

<style lang="less">
/* 全局样式 - 用于覆盖 ant-modal 被 teleport 到 body 的部分 */
.space-modal {
  .ant-modal-header {
    background: #0b1a2f !important;
    border-bottom: 1px solid rgba(56, 189, 248, 0.15) !important;
    padding: 12px 16px !important;
  }

  .ant-modal-title {
    color: #e2e8f0 !important;
  }

  .ant-modal-close {
    color: #94a3b8 !important;
    &:hover {
      color: #38bdf8 !important;
    }
  }
}

/* 全局样式 - 用于覆盖 ant-tabs 被 teleport 到 body 的部分 */
.space-tabs {
  .ant-tabs-tab {
    color: #cbd5e1 !important;
    font-size: 13px;
    transition: color 0.2s ease;

    &:hover {
      color: #38bdf8 !important;
    }
  }

  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #38bdf8 !important;
    font-weight: 600;
  }
}
</style>
