<template>
  <div class="detail-mode">
    <!-- 标点点击弹窗：一键开关 + 回路列表 -->
    <a-modal
      v-model:open="modalVisible"
      :footer="null"
      :width="840"
      :centered="false"
      :zIndex="95001"
      :closable="false"
      wrapClassName="space-modal-wrapper"
      :bodyStyle="{ padding: 0, overflow: 'hidden' }"
      @cancel="onCancel"
    >
      <div class="parcel-panel">
        <div class="panel-header">
          <span class="panel-title">{{ currentSpaceName }}-{{ currentAreaName }}</span>
          <span class="panel-close" @click="onCancel">✕</span>
        </div>
        <div class="panel-body">
      <a-tabs type="card" class="space-tabs">
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
          </div>
        </div>
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
import ConfirmModal from './ConfirmModalBigscreen.vue'

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
    content: `确定要 <strong class="tip-action">全开</strong> 服贸会区域吗？`,
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
    content: `确定要 <strong class="tip-action">全关</strong> 服贸会区域吗？`,
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

.light-pane {
  padding: 16px;
}

/* ==================== 浮层面板 ==================== */
.parcel-panel {
  background: linear-gradient(180deg, rgba(12, 28, 52, 0.96) 0%, rgba(8, 18, 36, 0.96) 100%);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 180, 255, 0.15);
  animation: panelFadeIn 0.2s ease-out;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

@keyframes panelFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ==================== 面板头部 ==================== */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(15, 31, 55, 0.8);
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}

.panel-title {
  color: #e2e8f0;
  font-size: 20px;
  font-weight: 600;
}

.panel-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    transform: scale(1.1);
  }
}

.panel-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  max-height: 860px;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(180deg, rgba(12, 28, 52, 0.96) 0%, rgba(8, 18, 36, 0.96) 100%);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(56, 189, 248, 0.4);
    border-radius: 3px;
  }
}

/* 一键开关 */
.pane-switch {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.with-text {
    color: #4ade80;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.4);

    &:hover {
      background: rgba(34, 197, 94, 0.3);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
    }
  }

  &.dark-btn {
    color: #f87171;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);

    &:hover {
      background: rgba(239, 68, 68, 0.3);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
    }
  }
}

.btn-text {
  font-size: 20px;
  font-weight: 600;
}

/* 回路列表 */
.pane-table {
  margin-top: 16px;
}

.circuit-count-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 20px;
}

.circuit-count-left {
  color: #94a3b8;
}

.stat-label {
  color: #94a3b8;
  font-size: 20px;
}

.stat-value {
  color: #e2e8f0;
  font-size: 20px;
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
  width: 32px;
  height: 32px;
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
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 20px;
  font-weight: 500;

  &.is-on {
    color: #4ade80;
    background: rgba(34, 197, 94, 0.1);
  }

  &.is-off {
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.1);
  }
}

/* 节目状态 */
.program-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 20px;
  font-weight: 500;
  color: #e2e8f0;
}

/* 回路/场景表格容器 */
.circuit-vxe-table-wrap {
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 6px;
  max-height: 720px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(56, 189, 248, 0.3);
    border-radius: 2px;
  }
}

/* 设备表格 */
.device-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 20px;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      background: rgba(15, 31, 55, 0.9);
      color: #8fe8ff;
      font-weight: 600;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
      font-size: 20px;
    }
  }

  td {
    padding: 8px 10px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.08);
    color: rgba(255, 255, 255, 0.9);
    font-size: 20px;
  }

  tr:hover td {
    background: rgba(56, 189, 248, 0.06);
  }
}

/* 空状态 */
.space-submenu-empty {
  padding: 30px;
  text-align: center;
  color: #64748b;
  font-size: 20px;
}

/* Spin 样式 */
:deep(.pane-spin) {
  .ant-spin-spinning {
    max-height: 600px;
  }
  .ant-spin-dot-item {
    background-color: #38bdf8;
  }
}

/* 视频 */
.video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
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
  gap: 4px;
  justify-content: center;
}

.mini-action-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 3px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.is-on {
    color: #4ade80;
    background: rgba(34, 197, 94, 0.15);

    &:hover {
      background: rgba(34, 197, 94, 0.3);
    }
  }

  &.is-off {
    color: #f87171;
    background: rgba(239, 68, 68, 0.15);

    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  }
}

/* 深度选择器：覆盖 ant-modal 样式 */
.space-modal-wrapper {
  .ant-modal {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    padding-bottom: 0;
  }

  .ant-modal-content {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .ant-modal-body {
    padding: 0 !important;
    overflow: hidden !important;
  }

  .ant-modal-close {
    display: none;
  }

  .ant-modal-mask {
    background: rgba(0, 0, 0, 0.75) !important;
    backdrop-filter: blur(4px);
  }
}

/* 深度选择器：覆盖 ant-tabs 样式 */


:deep(.tip-action) {
  font-weight: 700;
  color: #38bdf8;
}
:deep(.ant-tabs-nav) {
    margin-bottom: 0;
    width: 100%;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(56, 189, 248, 0.15) !important;

  .ant-tabs-nav-list {
    width: 100%;
    display: flex;
  }

  .ant-tabs-nav-operations {
    display: none !important;
  }

  .ant-tabs-tab {
    flex: 1;
    margin: 0 !important;
    padding: 12px 0 !important;
    justify-content: center;
    background: rgba(30, 45, 70, 0.6) !important;
    border: 1px solid rgba(56, 189, 248, 0.15) !important;
    border-radius: 4px 4px 0 0 !important;
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 20px;
    font-weight: 400;
    transition: all 0.2s ease;

    &:hover {
      color: #e2e8f0 !important;
      background: rgba(56, 189, 248, 0.1) !important;
      border-color: rgba(56, 189, 248, 0.3) !important;
    }
  }

  .ant-tabs-tab-btn {
    display: block;
    width: 100%;
    text-align: center;
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    color: #38bdf8 !important;
    background: rgba(56, 189, 248, 0.15) !important;
    border-color: rgba(56, 189, 248, 0.6) !important;
    border-bottom-color: transparent !important;
    font-weight: 600 !important;

    .ant-tabs-tab-btn {
      color: #38bdf8 !important;
    }
  }

  .ant-tabs-ink-bar {
    display: block !important;
    background: #38bdf8 !important;
    height: 2px !important;
  }

  .ant-tabs-content {
    height: calc(100% - 45px);
    overflow: hidden;
  }

  .ant-tabs-tabpane {
    height: 100%;
  }

}
</style>

<style lang="less">
/* 非 scoped 样式：覆盖全局 ant-modal-body padding */
.space-modal-wrapper {
  .ant-modal-body {
    padding: 0 !important;
    overflow: hidden !important;
  }
}
</style>
