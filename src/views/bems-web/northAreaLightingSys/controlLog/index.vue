<template>
  <div class="page-container" :class="themeClass">
    <div class="log-card">
      <div class="card-header">
        <span class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </span>
        <h2 class="card-title">操作日志</h2>
      </div>
      <!-- 查询条件 -->
      <div class="filter-bar">
        <div class="filter-item">
          <label class="filter-label">操作时间</label>
          <a-range-picker
            v-model:value="dateRange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
            class="filter-date-picker"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">类型</label>
          <select v-model="relTypeFilter" class="select">
            <option value="">全部</option>
            <option value="回路">回路</option>
            <option value="区域">区域</option>
            <option value="场景">场景</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">名称</label>
          <el-input
            v-model="nameInput"
            placeholder="请输入名称"
            clearable
            class="filter-input"
            @keyup.enter="onSearch"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">操作状态</label>
          <select v-model="operationType" class="select">
            <option value="">全部</option>
            <option value="开">开启</option>
            <option value="关">关闭</option>
          </select>
        </div>
        <!-- 触发类型筛选（暂注释） -->
        <div class="filter-item">
          <label class="filter-label">触发类型</label>
          <select v-model="operatorTypeFilter" class="select">
            <option value="">全部</option>
            <option value="定时">定时</option>
            <option value="手动">手动</option>
            <option value="场景">场景</option>
          </select>
        </div>
       
        <div class="filter-item">
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button @click="onExport">导出数据</el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="log-table">
          <colgroup>
            <col style="width: 60px;" />
            <col style="width: 100px;" />
            <col style="width: 70px;" />
            <col style="width: 230px;" />
            <col style="width: 80px;" />
            <col style="width: 80px;" />
            <col style="width: 100px;" />
            <col style="width: 80px;" />
          </colgroup>
          <thead>
            <tr>
              <th>序号</th>
              <th>操作时间</th>
              <th>类型</th>
              <th>名称</th>
              <th>操作状态</th>
              <th>触发类型</th>
              <th>操作人员</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="item.id || index">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ item.operationTime }}</td>
              <td>{{ item.relType }}</td>
              <td class="cell-wrap">{{ item.name }}</td>
              <td class="cell-wrap">{{ item.operationType === '开' ? '开启' : item.operationType === '关' ? '关闭' : '-'}}</td>
              <td>{{ item.operatorType }}</td>
              <td>{{ item.operationBy }}</td>
              <td>
                <el-button type="primary" link size="small" @click="onDetail(item)">详情</el-button>
              </td>
            </tr>
            <tr v-if="!loading && tableData.length === 0">
              <td colspan="8" style="text-align: center; padding: 24px;">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 分页 -->
      <div class="pagination-bar">
        <span class="pagination-info">共 {{ total }} 条</span>
        <span class="pagination-size-label">每页</span>
        <select v-model="pageSize" class="pagination-select" @change="onPageSizeChange">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
        <span class="pagination-size-label">条</span>
        <button
          class="pagination-btn"
          :disabled="currentPage <= 1"
          @click="onPageChange(currentPage - 1)"
        >上一页</button>
        <span class="pagination-current">{{ currentPage }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
        <button
          class="pagination-btn"
          :disabled="currentPage >= Math.ceil(total / pageSize)"
          @click="onPageChange(currentPage + 1)"
        >下一页</button>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="操作日志详情"
      width="880px"
      :footer="null"
      wrapClassName="control-log-detail-modal"
      :getContainer="false"
      @cancel="closeDetail"
    >
      <!-- 标题信息 -->
      <section class="modal-title">
        <div class="title-left">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <div class="title-text">
            <span class="title-label">名称</span>
            <span class="title-value">{{ detailData?.name || detailRecord?.name || '-' }}</span>
          </div>
        </div>
        <div class="title-meta">
          <span>类型：{{ detailData?.relType || detailRecord?.relType || '-' }}</span>
          <span>操作类型：{{ detailData?.operationType === '开' ? '开启' : detailData?.operationType === '关' ? '关闭' : '-'}}</span>
          <span>操作人员：{{ detailData?.operationBy || detailRecord?.operationBy || '-' }}</span>
          <span>操作时间：{{ detailData?.operationTime || detailRecord?.operationTime || '-' }}</span>
        </div>
      </section>

      <!-- 详情列表 -->
      <section class="table-container" v-loading="detailLoading">
        <table class="device-table">
          <colgroup>
            <col style="width: 60px;" />
            <col />
            <col style="width: 90px;" />
            <col style="width: 90px;" />
            <col style="width: 90px;" />
          </colgroup>
          <thead>
            <tr>
              <th>序号</th>
              <th>回路名称</th>
              <th>类型</th>
              <th>操作状态</th>
              <th>操作人员</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in circuitDetailList" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td class="ellipsis-cell" :title="item.name">{{ item.name || '-' }}</td>
              <td>{{ item.relType || '-' }}</td>
              <td>{{ item.operationType === '开' ? '开启' : item.operationType === '关' ? '关闭' : '-'}}</td>
              <td>{{ item.operationBy || '-' }}</td>
            </tr>
            <tr v-if="circuitDetailList.length === 0">
              <td colspan="6" style="text-align: center; padding: 24px; color: #8fa3bf;">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="modal-footer">
        <a-button class="btn-cancel" @click="closeDetail">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, onMounted } from 'vue';
import { controlRecordListApi, getLogDetailApi } from '@/api/equipmentMonitoring';
import { exportExcel } from '/@/utils/export';

const loading = ref(false);
const tableData = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
/** 每页条数可选项 */
const pageSizeOptions = [10, 15, 20, 30, 50, 100];

/** 查询条件 */
const dateRange = ref<[string, string] | null>(null);
const relTypeFilter = ref('');
const operationType = ref('');
const operatorTypeFilter = ref('');
const nameInput = ref('');

/** 加载控制记录数据 */
async function fetchData() {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
    };
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0] + ' 00:00:00';
      params.endTime = dateRange.value[1] + ' 23:59:59';
    }
    if (relTypeFilter.value) {
      params.relType = relTypeFilter.value;
    }
    if (operationType.value) {
      params.operationType = operationType.value;
    }
    if (operatorTypeFilter.value) {
      params.operatorType = operatorTypeFilter.value;
    }
    if (nameInput.value) {
      params.name = nameInput.value;
    }
    const res = await controlRecordListApi(params);
    console.log('控制记录数据：', res);
    if (res?.records) {
      tableData.value = res.records.map((item: any, idx: number) => ({
        ...item,
        operatorType: item.operatorType,
      }));
      total.value = res.total ?? res.records.length;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (err) {
    console.error('获取控制记录失败：', err);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/** 查询 */
function onSearch() {
  currentPage.value = 1;
  fetchData();
}

/** 重置 */
function onReset() {
  dateRange.value = null;
  relTypeFilter.value = '';
  operationType.value = '';
  operatorTypeFilter.value = '';
  nameInput.value = '';
  currentPage.value = 1;
  fetchData();
}

/** 导出表格数据为 Excel（导出当前表格显示的数据，与表格一致） */
function onExport() {
  if (!tableData.value.length) {
    // eslint-disable-next-line no-alert
    alert('暂无可导出的数据');
    return;
  }
  const rows = tableData.value.map((row: any, idx: number) => ({
    index: (currentPage.value - 1) * pageSize.value + idx + 1,
    operationTime: row.operationTime,
    relType: row.relType,
    name: row.name,
    operationType:
      row.operationType === '开' ? '开启' : row.operationType === '关' ? '关闭' : '-',
    operatorType: row.operatorType,
    operationBy: row.operationBy,
  }));
  exportExcel({
    tableData: rows,
    fileName: '操作日志数据',
    headers: [
      { key: 'index', title: '序号' },
      { key: 'operationTime', title: '操作时间' },
      { key: 'relType', title: '类型' },
      { key: 'name', title: '名称' },
      { key: 'operationType', title: '操作状态' },
      { key: 'operatorType', title: '触发类型' },
      { key: 'operationBy', title: '操作人员' },
    ],
  });
}

/** 分页切换 */
function onPageChange(page: number) {
  currentPage.value = page;
  fetchData();
}

/** 每页条数切换 */
function onPageSizeChange() {
  currentPage.value = 1;
  fetchData();
}

/** 详情弹窗 */
const detailVisible = ref(false);
const detailRecord = ref<any>(null);
const detailData = ref<any>(null);
const detailLoading = ref(false);

/** 详情列表：优先使用 children，为空则用主记录包裹成数组 */
const circuitDetailList = computed(() => {
  if (!detailData.value) return [];
  const children = detailData.value.children;
  if (Array.isArray(children) && children.length > 0) {
    return children;
  }
  return [detailData.value];
});

function onDetail(item: any) {
  detailRecord.value = item;
  detailData.value = null;
  detailVisible.value = true;
  detailLoading.value = true;
  getLogDetailApi({ id: item.id }).then((res: any) => {
    console.log(res)
    detailData.value = res ?? null;
  }).catch((err) => {
    console.error('获取日志详情失败：', err);
  }).finally(() => {
    detailLoading.value = false;
  });
}

function closeDetail() {
  detailVisible.value = false;
  detailRecord.value = null;
  detailData.value = null;
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.page-container {
  --bg: #0f172a;
  --panel: #1e293b;
  // --accent: #0ea5e9;
  // --accent2: #10b981;
  // --accent3: #f59e0b;
  --danger: #ef4444;
  --text: #f1f5f9;
  --text2: #94a3b8;
  --border: #334155;
  --radius: 8px;
  --primary: #0ea5e9;

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg);
}

.log-card {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #ffffff;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;

  // 重置按钮深色主题
  :deep(.el-button:not(.el-button--primary)) {
    background-color: var(--panel);
    border-color: rgba(255, 255, 255, 0.45);
    color: #ffffff;

    &:hover {
      border-color: rgba(255, 255, 255, 0.8);
      color: #ffffff;
    }
  }
}

.filter-label {
  font-size: 14px;
  color: var(--text2);
  white-space: nowrap;
}

.filter-input {
  width: 180px;

  :deep(.el-input__wrapper) {
    background-color: transparent;
    box-shadow: none;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 4px;
    height: 36px;

    &:hover {
      border-color: rgba(255, 255, 255, 0.85);
    }
  }

  :deep(.el-input__inner) {
    color: #ffffff;
    font-size: 13px;
    height: 34px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.55);
    }
  }
}

// 原生 select 样式（参照 equipmentManagement）
.select {
  width: 140px;
  height: 36px;
  padding: 0 28px 0 12px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 4px;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;

  option {
    background: var(--bg);
    color: #ffffff;
  }
}

.filter-date-picker {
  width: 260px;

  // Ant Design RangePicker 根元素
  :deep(.ant-picker) {
    height: 36px;
    background-color: transparent;
    box-shadow: none;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 4px;
    font-size: 13px;
    padding: 0 11px;

    &:hover {
      border-color: rgba(255, 255, 255, 0.85);
      box-shadow: none;
    }

    &.ant-picker-focused {
      border-color: rgba(255, 255, 255, 0.85);
      box-shadow: none;
    }

    .ant-picker-input {
      input {
        background-color: transparent;
        color: #ffffff;
        font-size: 13px;

        &::placeholder {
          color: rgba(255, 255, 255, 0.55);
        }
      }
    }

    .ant-picker-range-separator {
      color: rgba(255, 255, 255, 0.7);

      .ant-picker-separator {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .ant-picker-suffix,
    .ant-picker-clear {
      color: rgba(255, 255, 255, 0.7);
      background: transparent;
    }
  }
}


.table-wrapper {
  overflow-x: auto;
  flex: 1;
}

.log-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    tr {
      th {
        padding: 12px 14px;
        text-align: left;
        color: var(--text2);
        font-weight: 500;
        border-bottom: 1px solid var(--border);
        white-space: nowrap;
        font-size: 13px;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      &:nth-child(even) {
        background: rgba(255, 255, 255, 0.02);
      }

      td {
        padding: 14px;
        color: var(--text);
        font-size: 14px;
        vertical-align: middle;
        white-space: nowrap;

        // 长文本列：自动换行
        &.cell-wrap {
          white-space: normal;
          word-break: break-all;
          line-height: 1.6;
        }
      }
    }
  }
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 4px;
  user-select: none;
}

.pagination-info {
  font-size: 13px;
  color: var(--text2);
  margin-right: 8px;
}

.pagination-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #38bdf8;
  color: #38bdf8 !important;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-current {
  font-size: 13px;
  color: var(--text);
  font-weight: 600;
}

.pagination-size-label {
  font-size: 13px;
  color: var(--text2);
  white-space: nowrap;
}

.pagination-select {
  width: 76px;
  height: 28px;
  padding: 0 24px 0 8px;
  background-color: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 10px;

  option {
    background: var(--bg);
    color: #ffffff;
  }
}

// 详情弹窗 - 科技风
.modal-title {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(0, 212, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-left: 3px solid #00d4ff;
  border-radius: 4px;
  margin-bottom: 16px;

  .title-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-icon {
    width: 22px;
    height: 22px;
    color: #00d4ff;
    flex-shrink: 0;
    filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.3));
  }

  .title-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .title-label {
    color: #8a9ab0;
    font-weight: 400;
  }

  .title-value {
    color: #00d4ff;
    font-weight: 600;
    font-size: 15px;
    text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
  }

  .title-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    color: #8a9ab0;
    font-size: 12px;
    padding-left: 34px;
  }
}

.table-container {
  position: relative;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.5);
    border-radius: 6px;

    &:hover {
      background: rgba(0, 212, 255, 0.8);
    }
  }
}

.device-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    white-space: nowrap;
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    color: #7fa6d4;
    font-weight: 500;
    border-bottom: 1px solid rgba(0, 212, 255, 0.15);
    user-select: none;
    background: #0f2845;
    box-shadow: 0 1px 0 rgba(0, 212, 255, 0.1);
  }

  tbody td {
    color: #e8f4ff;
    border-bottom: 1px solid rgba(0, 212, 255, 0.08);
    vertical-align: middle;
  }

  .ellipsis-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

// 状态指示器 —— 图标与文字分离，灰色系
.status-badge-fu-cu {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}

.status-badge-fu-cu .status-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.status-badge-fu-cu .status-text {
  line-height: 1;
}

.status-badge-fu-cu.online {
  color: rgb(244, 234, 42);
}

.status-badge-fu-cu.online .status-icon {
  filter: none;
}

.status-badge-fu-cu.offline {
  color: #8a99ab;
}

.status-badge-fu-cu.offline .status-icon {
  filter: grayscale(1) brightness(1.4) contrast(0.8);
}

// 底部按钮
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px 12px;
  margin: 20px -24px -24px;
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 6px 6px;
}

.btn-cancel {
  background: transparent !important;
  border: 1px solid rgba(0, 212, 255, 0.25) !important;
  color: #7fa6d4 !important;
  height: 32px;
  padding: 0 18px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #00d4ff !important;
    color: #00d4ff !important;
    background: rgba(0, 212, 255, 0.06) !important;
  }
}
</style>

<!-- ==================== control-log-detail-modal 弹框样式（非 scoped 全局，通过唯一类名隔离） ==================== -->
<style lang="less">
.control-log-detail-modal {
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

/* 原生 option 在浏览器 OS 层渲染，scoped 无法覆盖，需非 scoped */
.page-container .select option {
  background: var(--bg) !important;
  color: #ffffff !important;
}
.page-container .pagination-select option {
  background: var(--bg) !important;
  color: #ffffff !important;
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
/* 根节点同时挂 page-container + theme-white（同一元素），需用同级选择器才能命中 */
.theme-white.page-container {
  --bg: #f5f7fa;
  --panel: #ffffff;
  // --accent: #1890ff;
  // --accent2: #52c41a;
  // --accent3: #f59e0b;
  --danger: #ff4d4f;
  --text: #303133;
  --text2: #909399;
  --border: #e4e7ed;
  --radius: 8px;
  --primary: #1890ff;

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg);
}.theme-white .log-card {
  background: var(--panel);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
}.theme-white .card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}.theme-white .header-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: var(--text);
}.theme-white .card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}.theme-white .filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}.theme-white .filter-item {
  display: flex;
  align-items: center;
  gap: 8px;

  // 重置按钮深色主题
  :deep(.el-button:not(.el-button--primary))  {
    background-color: var(--panel);
    border-color: #dcdfe6;
    color: var(--text);

    &:hover  {
      border-color: #40a9ff;
      color: #1890ff;
    }}}.theme-white .filter-label {
  font-size: 14px;
  color: var(--text2);
  white-space: nowrap;
}.theme-white .filter-input {
  width: 180px;

  :deep(.el-input__wrapper)  {
    background-color: transparent;
    box-shadow: none;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    height: 36px;

    &:hover  {
      border-color: #40a9ff;
    }}

  :deep(.el-input__inner)  {
    color: var(--text);
    font-size: 13px;
    height: 34px;

    &::placeholder  {
      color: rgba(0, 0, 0, 0.4);
    }}}.theme-white // 原生 select 样式（参照 equipmentManagement）
.select {
  width: 140px;
  height: 36px;
  padding: 0 28px 0 12px;
  background-color: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23606766' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;

  option  {
    background: var(--panel);
    color: var(--text);
  }}.theme-white .filter-date-picker {
  width: 260px;

  // Ant Design RangePicker 根元素
  :deep(.ant-picker)  {
    height: 36px;
    background-color: transparent;
    box-shadow: none;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 13px;
    padding: 0 11px;

    &:hover  {
      border-color: #40a9ff;
      box-shadow: none;
    }

    &.ant-picker-focused  {
      border-color: #40a9ff;
      box-shadow: none;
    }

    .ant-picker-input  {
      input  {
        background-color: transparent;
        color: var(--text);
        font-size: 13px;

        &::placeholder  {
          color: rgba(0, 0, 0, 0.4);
        }}}

    .ant-picker-range-separator  {
      color: rgba(0, 0, 0, 0.45);

      .ant-picker-separator  {
        color: rgba(0, 0, 0, 0.45);
      }}

    .ant-picker-suffix,
    .ant-picker-clear  {
      color: rgba(0, 0, 0, 0.45);
      background: transparent;
    }}}.theme-white .table-wrapper {
  overflow-x: auto;
  flex: 1;
}.theme-white .log-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 14px;

  thead  {
    tr  {
      th  {
        padding: 12px 14px;
        text-align: left;
        color: var(--text2);
        font-weight: 500;
        border-bottom: 1px solid var(--border);
        white-space: nowrap;
        font-size: 13px;
      }}}

  tbody  {
    tr  {
      border-bottom: 1px solid var(--border);
      transition: background 0.2s;

      &:hover  {
        background: rgba(0, 0, 0, 0.04);
      }

      &:nth-child(even)  {
        background: rgba(0, 0, 0, 0.02);
      }

      td  {
        padding: 14px;
        color: var(--text);
        font-size: 14px;
        vertical-align: middle;
        white-space: nowrap;

        // 长文本列：自动换行
        &.cell-wrap  {
          white-space: normal;
          word-break: break-all;
          line-height: 1.6;
        }}}}}.theme-white .pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 4px;
  user-select: none;
}.theme-white .pagination-info {
  font-size: 13px;
  color: var(--text2);
  margin-right: 8px;
}.theme-white .pagination-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}.theme-white .pagination-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff !important;
}.theme-white .pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}.theme-white .pagination-current {
  font-size: 13px;
  color: var(--text);
  font-weight: 600;
}.theme-white .pagination-size-label {
  font-size: 13px;
  color: var(--text2);
  white-space: nowrap;
}.theme-white .pagination-select {
  width: 76px;
  height: 28px;
  padding: 0 24px 0 8px;
  background-color: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23606766' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 10px;

  option  {
    background: var(--panel);
    color: var(--text);
  }}.theme-white // 详情弹窗 - 科技风
.modal-title {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(24, 144, 255, 0.06);
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-left: 3px solid #1890ff;
  border-radius: 4px;
  margin-bottom: 16px;

  .title-left  {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-icon  {
    width: 22px;
    height: 22px;
    color: #1890ff;
    flex-shrink: 0;
    filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.2));
  }

  .title-text  {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .title-label  {
    color: #909399;
    font-weight: 400;
  }

  .title-value  {
    color: #1890ff;
    font-weight: 600;
    font-size: 15px;
  }

  .title-meta  {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    color: #909399;
    font-size: 12px;
    padding-left: 34px;
  }}.theme-white .table-container {
  position: relative;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar  {
    width: 6px;
  }

  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb  {
    background: rgba(24, 144, 255, 0.4);
    border-radius: 6px;

    &:hover  {
      background: rgba(24, 144, 255, 0.6);
    }}}.theme-white .device-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;

  th,
  td  {
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    white-space: nowrap;
  }

  thead th  {
    position: sticky;
    top: 0;
    z-index: 2;
    color: #606266;
    font-weight: 500;
    border-bottom: 1px solid #e4e7ed;
    user-select: none;
    background: #f5f7fa;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  }

  tbody td  {
    color: var(--text);
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  .ellipsis-cell  {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  tbody tr:last-child td  {
    border-bottom: none;
  }

  tbody tr:hover  {
    background: rgba(0, 0, 0, 0.04);
  }}.theme-white // 状态指示器 —— 图标与文字分离，灰色系
.status-badge-fu-cu {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}.theme-white .status-badge-fu-cu .status-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}.theme-white .status-badge-fu-cu .status-text {
  line-height: 1;
}.theme-white .status-badge-fu-cu.online {
  color: rgb(244, 234, 42);
}.theme-white .status-badge-fu-cu.online .status-icon {
  filter: none;
}.theme-white .status-badge-fu-cu.offline {
  color: #909399;
}.theme-white .status-badge-fu-cu.offline .status-icon {
  filter: grayscale(1) brightness(1.4) contrast(0.8);
}.theme-white // 底部按钮
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px 12px;
  margin: 20px -24px -24px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  border-radius: 0 0 6px 6px;
}.theme-white .btn-cancel {
  background: transparent !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
  height: 32px;
  padding: 0 18px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover  {
    border-color: #1890ff !important;
    color: #1890ff !important;
    background: rgba(24, 144, 255, 0.06) !important;
  }}
</style>

<style lang="less">
.theme-white .control-log-detail-modal {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);

  .ant-modal  {
    overflow: visible !important;
  }

  .ant-modal-content  {
    position: relative;
    background: #ffffff !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15) !important;
    overflow: visible !important;
  }

  .ant-modal-content::before,
  .ant-modal-content::after  {
    display: none;
  }

  .ant-modal-header  {
    position: relative;
    background: #fafafa !important;
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
  }

  .ant-modal-title::before  {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    background: #1890ff;
    border-radius: 2px;
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
  }}.theme-white.page-container .select option {
  background: var(--panel) !important;
  color: var(--text) !important;
}
.theme-white.page-container .pagination-select option {
  background: var(--panel) !important;
  color: var(--text) !important;
}
</style>
