<template>
  <a-modal
    v-model:open="open"
    title="事件详情"
    :footer="null"
    width="820px"
    :destroyOnClose="true"
    :maskClosable="true"
    :getContainer="container"
    wrapClassName="calendar-event-detail-modal"
    @cancel="closeModal"
   :class="themeClass">
    <!-- Loading 遮罩 -->
    <a-spin :spinning="detailLoading" tip="加载中...">
      <!-- 详情信息 -->
      <div class="event-detail-list">
        <div class="detail-row">
          <span class="detail-label">计划名称</span>
          <span class="detail-value">{{ detailData?.planName || eventData?.planName || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">计划类型</span>
          <span class="detail-value">{{ detailData?.relType || eventData?.planType || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">操作类型</span>
          <span class="detail-value">
            <span
              class="operation-indicator"
              :class="{
                online: (detailData?.operationType || eventData?.operationType) === '开启',
                offline: (detailData?.operationType || eventData?.operationType) === '关闭',
              }"
            >
              <img
                v-if="(detailData?.operationType || eventData?.operationType) === '关闭'"
                class="indicator-icon"
                src="@/assets/images/lightClose.png"
                alt=""
              />
              <img
                v-else
                class="indicator-icon"
                src="@/assets/images/lightOpen.png"
                alt=""
              />
              <span class="indicator-text">{{ detailData?.operationType || eventData?.operationType || '-' }}</span>
            </span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">操作描述</span>
          <span class="detail-value">{{ eventData?.label || '-' }}</span>
        </div>
      </div>

      <!-- 执行日志 / 执行目标 表格 -->
      <div v-if="tableData.length > 0" class="detail-table-section">
        <div class="table-title">{{ tableTitle }}</div>
        <div class="table-body-wrapper">
          <table class="detail-table">
            <thead>
              <tr>
                <th v-for="col in currentColumns" :key="col.key" :style="{ width: col.width }">{{ col.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableData" :key="(row as any).id || (row as any).relId">
                <td v-for="col in currentColumns" :key="col.key">
                  <span class="cell-text" :title="(row as any)[col.key] || '-'">{{ (row as any)[col.key] || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </a-spin>

    <!-- 底部关闭按钮 -->
    <div class="modal-footer">
      <a-button class="btn-close" @click="closeModal">关闭</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed } from 'vue';
import { getCalendarControlDetailApi } from '@/api/equipmentMonitoring';

interface CalendarEventItem {
  source: string;
  planId: number;
  planName: string;
  label: string;
  color: string;
  planType: string;
  operationType: string;
  status: string;
  dateStr: string;
}

interface LogItem {
  closeTime: string;
  id: number;
  ipAddress: string;
  name: string;
  openTime: string;
  operationBy: string;
  operationTime: string;
  operationType: string;
  operatorType: string;
  relId: number;
  relType: string;
}

interface TargetItem {
  relId: number;
  relName: string;
  relType: string;
}

interface DetailResult {
  date: string;
  executionTime: string;
  logs: LogItem[];
  operationType: string;
  planId: number;
  planName: string;
  relType: string;
  source: string;
  status: string;
  targets: TargetItem[];
}

// 全屏时由父组件传入地图卡片作为挂载容器（getContainer），避免原生全屏/CSS 降级全屏下弹框被遮挡
const props = defineProps<{
  container?: any;
}>();

const open = ref(false);
const eventData = ref<CalendarEventItem | null>(null);
const detailData = ref<DetailResult | null>(null);
const detailLoading = ref(false);

const sourceLabelMap: Record<string, string> = {
  PLAN: '照明计划',
  SCHEDULE: '动态任务',
  LOG: '历史记录',
};

const sourceLabel = computed(() => {
  const data = detailData.value || eventData.value;
  if (!data) return '-';
  return sourceLabelMap[(data as any).source] || (data as any).source || '-';
});

/** 优先 logs，否则 targets */
const tableData = computed(() => {
  if (!detailData.value) return [];
  const logs = detailData.value.logs;
  if (logs && logs.length > 0) return logs;
  return detailData.value.targets || [];
});

/** 当前表格类型 */
const tableType = computed<'logs' | 'targets'>(
  () => (detailData.value?.logs?.length ? 'logs' : 'targets'),
);

/** logs 列定义 */
const logColumns = [
  { key: 'name', title: '名称', width: '14%' },
  { key: 'relType', title: '类型', width: '8%' },
  { key: 'operationType', title: '操控', width: '8%' },
  // { key: 'openTime', title: '开启时间', width: '16%' },
  // { key: 'closeTime', title: '关闭时间', width: '16%' },
  { key: 'operationTime', title: '操作时间', width: '16%' },
  { key: 'operationBy', title: '操作人', width: '10%' },
  { key: 'ipAddress', title: 'IP', width: '12%' },
];

/** targets 列定义 */
const targetColumns = [
  { key: 'relName', title: '关联名称', width: '50%' },
  { key: 'relType', title: '关联类型', width: '50%' },
];

const currentColumns = computed(() =>
  tableType.value === 'logs' ? logColumns : targetColumns,
);

/** 表格总标题 */
const tableTitle = computed(() =>
  tableType.value === 'logs' ? '执行日志列表' : '执行目标列表',
);

async function showModal(event: CalendarEventItem) {
  eventData.value = event;
  console.log(eventData.value)
  open.value = true;
  detailData.value = null;
  detailLoading.value = true;
  try {
    const res = await getCalendarControlDetailApi({ planId: event.planId, date: event.dateStr, source: event.source});
    console.log(res)
    if (res) {
      detailData.value = res as DetailResult;
    }
  } catch (err) {
    console.error('获取日历详情失败：', err);
  } finally {
    detailLoading.value = false;
  }
}

function closeModal() {
  open.value = false;
}

defineExpose({ showModal, closeModal });
</script>

<style scoped lang="less">
/* ==================== 状态条 ==================== */
.event-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;

  &.status-done {
    background: rgba(0, 212, 255, 0.08);
    border-left: 3px solid #00d4ff;
    color: #00d4ff;
  }

  &.status-pending {
    background: rgba(255, 77, 79, 0.08);
    border-left: 3px solid #ff4d4f;
    color: #ff4d4f;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .status-divider {
    color: #303d50;
    margin: 0 2px;
  }

  .status-source {
    color: #8a9ab0;
    font-weight: 400;
  }
}

/* ==================== 详情列表 ==================== */
.event-detail-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
  background: rgba(10, 30, 55, 0.35);
}

.detail-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.07);

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 13px;
  color: #7fa6d4;
  line-height: 1.6;
}

.detail-value {
  flex: 1;
  font-size: 13px;
  color: #e8f4ff;
  line-height: 1.6;
  word-break: break-all;
}

.operation-indicator {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}

.operation-indicator .indicator-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.operation-indicator .indicator-text {
  display: inline-block;
  padding: 2px 10px;
  line-height: 1.6;
  font-size: 12px;
  border-radius: 4px;
}

.operation-indicator.online {
  color: rgb(244, 234, 42);
}

.operation-indicator.online .indicator-text {
  color: #f4c82a;
  background: rgba(244, 200, 42, 0.15);
}

.operation-indicator.online .indicator-icon {
  filter: none;
}

.operation-indicator.offline {
  color: #8a99ab;
}

.operation-indicator.offline .indicator-text {
  color: #d0d5dd;
  background: rgba(255, 255, 255, 0.08);
}

.operation-indicator.offline .indicator-icon {
  filter: grayscale(1) brightness(1.4) contrast(0.8);
}

/* ==================== 表格区域 ==================== */
.detail-table-section {
  margin-top: 16px;
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
  background: rgba(10, 30, 55, 0.35);
}

.table-title {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #e8f4ff;
  border-bottom: 1px solid rgba(0, 212, 255, 0.12);
  background: rgba(0, 212, 255, 0.06);
}

.table-body-wrapper {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.4);
    border-radius: 6px;

    &:hover {
      background: rgba(0, 212, 255, 0.7);
    }
  }
}

.detail-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 12px;
}

.detail-table thead tr {
  border-bottom: 1px solid rgba(0, 212, 255, 0.08);
}

.detail-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 500;
  color: #7fa6d4;
  white-space: nowrap;
  background: rgba(10, 30, 55, 0.45);
}

.detail-table tbody tr {
  border-bottom: 1px solid rgba(0, 212, 255, 0.08);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.detail-table td {
  padding: 8px 12px;
  color: #e8f4ff;
  vertical-align: middle;
}

.detail-table .cell-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 20px -24px -24px;
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 6px 6px;

  :deep(.ant-btn) {
    height: 32px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-close {
    background: linear-gradient(135deg, #00d4ff, #0088cc) !important;
    border: none !important;
    color: #061224 !important;
    font-weight: 600;

    &:hover {
      opacity: 0.9;
      box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
    }
  }
}
</style>

<style lang="less">
/* ==================== calendar-event-detail-modal 弹框样式（非 scoped 全局，通过唯一类名隔离） ==================== */
.calendar-event-detail-modal {
  background: rgba(2, 8, 23, 0.78) !important;
  backdrop-filter: blur(2px);

  .ant-modal {
    overflow: visible !important;
  }

  .ant-modal-content {
    position: relative;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow:
      0 0 0 1px rgba(0, 212, 255, 0.45),
      0 0 24px rgba(0, 212, 255, 0.25),
      0 0 60px rgba(0, 212, 255, 0.10),
      0 12px 40px rgba(0, 0, 0, 0.7) !important;
    overflow: visible !important;
  }

  .ant-modal-content::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    padding: 1.5px;
    background: linear-gradient(135deg,
        rgba(0, 212, 255, 0.7),
        rgba(0, 180, 240, 0.4) 25%,
        rgba(0, 140, 220, 0.6) 50%,
        rgba(0, 224, 160, 0.3) 75%,
        rgba(0, 212, 255, 0.7));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  .ant-modal-content::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 6px;
    background:
      linear-gradient(to right, rgba(0,212,255,0.85), rgba(0,212,255,0)) 2px 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(0,212,255,0.85), rgba(0,212,255,0)) 0 2px / 2px 18px no-repeat,
      linear-gradient(to left, rgba(0,212,255,0.85), rgba(0,212,255,0)) calc(100% - 2px) 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(0,212,255,0.85), rgba(0,212,255,0)) 100% 2px / 2px 18px no-repeat,
      linear-gradient(to right, rgba(0,212,255,0.85), rgba(0,212,255,0)) 2px 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(0,212,255,0.85), rgba(0,212,255,0)) 0 calc(100% - 2px) / 2px 18px no-repeat,
      linear-gradient(to left, rgba(0,212,255,0.85), rgba(0,212,255,0)) calc(100% - 2px) 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(0,212,255,0.85), rgba(0,212,255,0)) 100% calc(100% - 2px) / 2px 18px no-repeat;
    filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.4));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header {
    position: relative;
    background: linear-gradient(180deg, rgba(0,30,55,0.02) 0%, rgba(0,30,55,0.35) 100%) !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.18) !important;
    padding: 16px 24px !important;
    border-radius: 6px 6px 0 0 !important;
    margin-bottom: 0 !important;
  }

  .ant-modal-title {
    position: relative;
    color: #e8f4ff;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding-left: 12px;
    text-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
  }

  .ant-modal-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    background: linear-gradient(180deg, #00d4ff, #0088cc);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
  }

  .ant-modal-close {
    top: 16px !important;
    right: 20px !important;

    .ant-modal-close-x {
      color: #7fa6d4 !important;
      font-size: 18px !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover {
        color: #00d4ff !important;
        transform: rotate(90deg);
      }
    }
  }

  .ant-modal-body {
    padding: 24px !important;
    background: linear-gradient(180deg, rgba(15,40,69,0.30) 0%, rgba(15,40,69,0.05) 100%) !important;
  }

  .ant-modal-footer {
    display: none;
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white /* ==================== 状态条 ==================== */
.event-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;

  &.status-done  {
    background: rgba(24, 144, 255, 0.08);
    border-left: 3px solid #1890ff;
    color: #1890ff;
  }

  &.status-pending  {
    background: rgba(255, 77, 79, 0.08);
    border-left: 3px solid #ff4d4f;
    color: #ff4d4f;
  }

  .status-dot  {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .status-divider  {
    color: #dcdfe6;
    margin: 0 2px;
  }

  .status-source  {
    color: #909399;
    font-weight: 400;
  }}.theme-white /* ==================== 详情列表 ==================== */
.event-detail-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
  background: #fafbfc;
}.theme-white .detail-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);

  &:last-child  {
    border-bottom: none;
  }}.theme-white .detail-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}.theme-white .detail-value {
  flex: 1;
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
  word-break: break-all;
}.theme-white .operation-indicator {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}.theme-white .operation-indicator .indicator-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}.theme-white .operation-indicator .indicator-text {
  display: inline-block;
  padding: 2px 10px;
  line-height: 1.6;
  font-size: 12px;
  border-radius: 4px;
}.theme-white .operation-indicator.online {
  color: rgb(244, 234, 42);
}.theme-white .operation-indicator.online .indicator-text {
  color: #f4c82a;
  background: rgba(244, 200, 42, 0.15);
}.theme-white .operation-indicator.online .indicator-icon {
  filter: none;
}.theme-white .operation-indicator.offline {
  color: #909399;
}.theme-white .operation-indicator.offline .indicator-text {
  color: #606266;
  background: rgba(0, 0, 0, 0.04);
}.theme-white .operation-indicator.offline .indicator-icon {
  filter: grayscale(1) brightness(1.4) contrast(0.8);
}.theme-white /* ==================== 表格区域 ==================== */
.detail-table-section {
  margin-top: 16px;
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
  background: #fafbfc;
}.theme-white .table-title {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid rgba(24, 144, 255, 0.15);
  background: rgba(24, 144, 255, 0.06);
}.theme-white .table-body-wrapper {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar  {
    width: 6px;
  }

  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;

    &:hover  {
      background: rgba(0, 0, 0, 0.35);
    }}}.theme-white .detail-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 12px;
}.theme-white .detail-table thead tr {
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
}.theme-white .detail-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 500;
  color: #909399;
  white-space: nowrap;
  background: rgba(24, 144, 255, 0.04);
}.theme-white .detail-table tbody tr {
  border-bottom: 1px solid rgba(24, 144, 255, 0.08);

  &:last-child  {
    border-bottom: none;
  }

  &:hover  {
    background: rgba(0, 0, 0, 0.04);
  }}.theme-white .detail-table td {
  padding: 8px 12px;
  color: #303133;
  vertical-align: middle;
}.theme-white .detail-table .cell-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}.theme-white /* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 20px -24px -24px;
  border-top: 1px dashed rgba(24, 144, 255, 0.2);
  background: #fafbfc;
  border-radius: 0 0 6px 6px;

  :deep(.ant-btn)  {
    height: 32px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-close  {
    background: linear-gradient(135deg, #1890ff, #096dd9) !important;
    border: none !important;
    color: #ffffff !important;
    font-weight: 600;

    &:hover  {
      opacity: 0.9;
      box-shadow: 0 0 12px rgba(24, 144, 255, 0.3);
    }}}
</style>

<style lang="less">
.theme-white /* ==================== calendar-event-detail-modal 弹框样式（非 scoped 全局，通过唯一类名隔离） ==================== */
.calendar-event-detail-modal {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);

  .ant-modal  {
    overflow: visible !important;
  }

  .ant-modal-content  {
    position: relative;
    background: #ffffff !important;
    border-radius: 6px !important;
    border: 1px solid #e4e7ed !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15) !important;
    overflow: visible !important;
  }

  .ant-modal-content::before  {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    padding: 1.5px;
    background: linear-gradient(135deg,
        rgba(24, 144, 255, 0.7),
        rgba(64, 169, 255, 0.4) 25%,
        rgba(9, 109, 217, 0.6) 50%,
        rgba(24, 144, 255, 0.3) 75%,
        rgba(24, 144, 255, 0.7));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  .ant-modal-content::after  {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 6px;
    background:
      linear-gradient(to right, rgba(24,144,255,0.85), rgba(24,144,255,0)) 2px 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(24,144,255,0.85), rgba(24,144,255,0)) 0 2px / 2px 18px no-repeat,
      linear-gradient(to left, rgba(24,144,255,0.85), rgba(24,144,255,0)) calc(100% - 2px) 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(24,144,255,0.85), rgba(24,144,255,0)) 100% 2px / 2px 18px no-repeat,
      linear-gradient(to right, rgba(24,144,255,0.85), rgba(24,144,255,0)) 2px 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(24,144,255,0.85), rgba(24,144,255,0)) 0 calc(100% - 2px) / 2px 18px no-repeat,
      linear-gradient(to left, rgba(24,144,255,0.85), rgba(24,144,255,0)) calc(100% - 2px) 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(24,144,255,0.85), rgba(24,144,255,0)) 100% calc(100% - 2px) / 2px 18px no-repeat;
    filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.3));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header  {
    position: relative;
    background: #fafbfc !important;
    border-bottom: 1px solid #e4e7ed !important;
    padding: 16px 24px !important;
    border-radius: 6px 6px 0 0 !important;
    margin-bottom: 0 !important;
  }

  .ant-modal-title  {
    position: relative;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding-left: 12px;
    text-shadow: none;
  }

  .ant-modal-title::before  {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    background: linear-gradient(180deg, #1890ff, #096dd9);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
  }

  .ant-modal-close  {
    top: 16px !important;
    right: 20px !important;

    .ant-modal-close-x  {
      color: #909399 !important;
      font-size: 18px !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover  {
        color: #1890ff !important;
        transform: rotate(90deg);
      }}}

  .ant-modal-body  {
    padding: 24px !important;
    background: #ffffff !important;
  }

  .ant-modal-footer  {
    display: none;
  }}
</style>
