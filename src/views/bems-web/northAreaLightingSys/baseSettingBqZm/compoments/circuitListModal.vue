<template>
  <div class="add-modal-wrapper" :class="themeClass">
    <a-modal
      v-model:open="open"
      title="回路控制"
      :footer="null"
      width="1300px"
      :destroyOnClose="true"
      :maskClosable="false"
      wrapClassName="circuit-list-modal"
      :getContainer="false"
    >
    <!-- 标题 -->
     <section class="modal-title">
      <div class="title-left">
        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <div class="title-text">
          <span class="title-label">区域</span>
          <span class="title-value">{{ modalTitle }}</span>
        </div>
      </div>
      <div class="title-actions">
        <button class="btn btn-primary" @click="onSearch">刷新</button>
        <a-popconfirm
          :title="'确认全开'+ modalTitle +'？'"
          ok-text="确定"
          cancel-text="取消"
          @confirm="onOpenAll()"
        ><button class="btn btn-primary">全开</button></a-popconfirm>
        <a-popconfirm
          :title="'确认全关'+ modalTitle +'？'"
          ok-text="确定"
          cancel-text="取消"
          @confirm="onCloseAll()"
        >
        <button class="btn btn-danger">全关</button></a-popconfirm>
      </div>
     </section>

      <!-- 数据表格（可滚动区域） -->
      <section class="table-container" v-loading="tableLoading">
        <table class="device-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>回路名称</th>
              <th>
                <span class="th-label">状态</span>
                <span class="th-btn-wrap">
                  <span class="filter-btn" :class="{ active: statusFilter }" @click.stop="toggleStatusFilter">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </span>
                  <div v-if="showStatusDropdown" class="filter-dropdown" @click.stop>
                    <div
                      v-for="opt in statusOptions"
                      :key="opt"
                      class="filter-option"
                      :class="{ active: statusFilter === opt }"
                      @click="applyStatusFilter(opt)"
                    >{{ opt }}</div>
                    <div class="filter-option" :class="{ active: !statusFilter }" @click="applyStatusFilter('')">全部</div>
                  </div>
                </span>
              </th>
              <th>
                <span class="th-label">开启时间</span>
                <span class="th-btn-wrap sort-btn" @click="toggleSort('startTime')">
                  <span class="arr-up" :class="{ active: sortKey === 'startTime' && sortOrder === 'asc' }">▲</span>
                  <span class="arr-down" :class="{ active: sortKey === 'startTime' && sortOrder === 'desc' }">▼</span>
                </span>
              </th>
              <th>
                <span class="th-label">关闭时间</span>
                <span class="th-btn-wrap sort-btn" @click="toggleSort('closingTime')">
                  <span class="arr-up" :class="{ active: sortKey === 'closingTime' && sortOrder === 'asc' }">▲</span>
                  <span class="arr-down" :class="{ active: sortKey === 'closingTime' && sortOrder === 'desc' }">▼</span>
                </span>
              </th>
              <th>
                <span class="th-label">开启总时长</span>
                <span class="th-btn-wrap sort-btn" @click="toggleSort('allDuration')">
                  <span class="arr-up" :class="{ active: sortKey === 'allDuration' && sortOrder === 'asc' }">▲</span>
                  <span class="arr-down" :class="{ active: sortKey === 'allDuration' && sortOrder === 'desc' }">▼</span>
                </span>
              </th>
              <th>
                <span class="th-label">额定电流</span>
                <span class="th-btn-wrap sort-btn" @click="toggleSort('ratedElectricCurrent')">
                  <span class="arr-up" :class="{ active: sortKey === 'ratedElectricCurrent' && sortOrder === 'asc' }">▲</span>
                  <span class="arr-down" :class="{ active: sortKey === 'ratedElectricCurrent' && sortOrder === 'desc' }">▼</span>
                </span>
              </th>
              <th>
                <span class="th-label">实时电流</span>
                <span class="th-btn-wrap sort-btn" @click="toggleSort('electricCurrent')">
                  <span class="arr-up" :class="{ active: sortKey === 'electricCurrent' && sortOrder === 'asc' }">▲</span>
                  <span class="arr-down" :class="{ active: sortKey === 'electricCurrent' && sortOrder === 'desc' }">▼</span>
                </span>
              </th>
              <th>操作人</th>
              <th>操作时间</th>
              <th>操作</th>
            </tr>
          </thead>
        </table>
        <div class="table-scroll">
          <table class="device-table">
            <tbody>
              <tr v-for="(row, idx) in displayData" :key="row.id">
                <td>{{ idx + 1 }}</td>
                <td class="ellipsis-cell" :title="row.circuitName">{{ row.circuitName }}</td>
                <td class="status-cell">
                  <span
                    class="status-indicator"
                    :class="{
                      online: row.status === '开启',
                      offline: row.status === '关闭',
                    }"
                  >
                    <img
                      v-if="row.status === '关闭'"
                      class="status-icon"
                      src="@/assets/images/lightClose.png"
                      alt=""
                    />
                    <img
                      v-else
                      class="status-icon"
                      src="@/assets/images/lightOpen.png"
                      alt=""
                    />
                    <span class="status-text">{{ row.status }}</span>
                  </span>
                </td>
                <td>{{ row.startTime }}</td>
                <td>{{ row.closingTime }}</td>
                <td>{{ formatSeconds(row.allDuration, { showHoursAlways: true }) }}</td>
                <td>{{ row.ratedElectricCurrent != null ? row.ratedElectricCurrent : '-' }}</td>
                <td>{{ row.electricCurrent != null ? row.electricCurrent : '-' }}</td>
                <td>{{ row.operatorBy }}</td>
                <td>{{ row.operatorTime }}</td>
                <td class="actions">
                  <div class="actions-inner">
                  <a-popconfirm
                    :title="'确认开启'+ row.circuitName +'？'"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="onOpenRow(row)"
                  ><button class="action-btn btn-open" style="color: #1a1a1a;">开启</button></a-popconfirm>
                  <a-popconfirm
                    :title="'确认关闭'+ row.circuitName +'？'"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="onCloseRow(row)"
                  ><button class="action-btn btn-close">关闭</button></a-popconfirm>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 底部操作按钮 -->
      <div class="modal-footer">
        <span class="total-count">共 <b class="count-num">{{ displayData.length }}</b> 条</span>
        <div class="footer-actions">
          <a-button class="btn-cancel" @click="closeModal">取消</a-button>
          <a-button class="btn-confirm" type="primary" :loading="loading" @click="onSubmit">确定</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, nextTick, reactive } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { getCircuitListApi, setAreaOpenApi, setAreaCloseApi, setCircuitOpenApi, setCircuitCloseApi } from '@/api/baseSettingBqZm';
// 参考src\views\bems\lightingControl\components\LoopListModal.vue
const emit = defineEmits<{
  success: [];
}>();

/* ==================== 弹框状态 ==================== */
const open = ref(false);
const formRef = ref<FormInstance>();
const loading = ref(false);

/* ==================== 弹框标题 ==================== */
const modalTitle = ref('')
const formObj = reactive<any>({});

function showModal(rowObj) {
  console.log('rowObj', rowObj);
  Object.assign(formObj, rowObj.row)
  modalTitle.value = formObj.areaName
  onSearch()
  // 查询回路
  
  open.value = true;
}

function closeModal() {
  open.value = false;
}

async function onSubmit() {
  closeModal();
  emit('success');
}

// 加载loading标识
const tableLoading = ref(false);
// table表格
const tableData = ref<any[]>([]);

/* --------------------- 排序 & 筛选 --------------------- */
const sortKey = ref('');
const sortOrder = ref<'asc' | 'desc'>('asc');
const statusFilter = ref('');
const statusOptions = ['开启', '关闭'];
const showStatusDropdown = ref(false);

const displayData = computed(() => {
  let list = [...tableData.value];
  // 状态筛选
  if (statusFilter.value) {
    list = list.filter((r: any) => r.status === statusFilter.value);
  }
  // 排序
  if (sortKey.value) {
    const key = sortKey.value;
    const dir = sortOrder.value === 'asc' ? 1 : -1;
    list.sort((a: any, b: any) => {
      const va = a[key];
      const vb = b[key];
      if (key === 'allDuration' || key === 'ratedElectricCurrent') {
        return ((va || 0) - (vb || 0)) * dir;
      }
      return String(va || '').localeCompare(String(vb || '')) * dir;
    });
  }
  return list;
});

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

function toggleStatusFilter() {
  showStatusDropdown.value = !showStatusDropdown.value;
}

function applyStatusFilter(val: string) {
  statusFilter.value = val;
  showStatusDropdown.value = false;
}

/* --------------------- 分页 --------------------- */
const pageSize = ref(999);
const total = ref(0);

/** 查询 */
function onSearch() {
  fetchList();
}
/** 重置 */
function onReset() {
  fetchList();
}
/** 获取列表数据 */
async function fetchList() {
  tableLoading.value = true;
  try {
    const params = {
      pageSize: pageSize.value,
      areaId: formObj.id || undefined,
    };
    const data = await getCircuitListApi(params);
    console.log('获取数据：', data);
    // 解析分页信息
    if (data) {
      total.value = data.total ?? 0;
      tableData.value = Array.isArray(data.records) ? data.records : [];
    }
  } catch (err) {
    console.error('Failed to load equipment list:', err);
  } finally {tableLoading.value = false;}
}

// 多选--全开
const onOpenAll = async () => {
    await setAreaOpenApi({
      id: formObj.id,
    }).then((res) => {
      console.log('res', res);
      message.success('全开成功！');
    })
    .catch((err) => {
      console.log('res', err);
      message.error('全开失败！');
    })
    .finally(() => {
      // fetchList();
    });
}
/** 多选--全关 */
const onCloseAll = async () => {
   await setAreaCloseApi({
      id: formObj.id,
    }).then((res) => {
      console.log('res', res);
      message.success('全关成功！');
    })
    .catch((err) => {
      console.log('res', err);
      message.error('全关失败！');
    })
    .finally(() => {
      // fetchList();
    });
}
/** 单行--全开 */
const onOpenRow = async (row) => {
  await setCircuitOpenApi({
      id: row.id,
    }).then((res) => {
      console.log('res', res);
      message.success('开启成功！');
    })
    .catch((err) => {
      console.log('res', err);
      message.error('全关失败！');
    })
    .finally(() => {
      // fetchList();
    });
}
/** 单行--全关 */
const onCloseRow = async (row) => {
  await setCircuitCloseApi({
      id: row.id,
    }).then((res) => {
      console.log('res', res);
      message.success('关闭成功！');
    })
    .catch((err) => {
      console.log('res', err);
      message.error('关闭成功！');
    })
    .finally(() => {
      // fetchList();
    });
}
/* --------------------- 工具函数 --------------------- */
function formatSeconds(totalSeconds, options:any = {}) {
  // 参数校验
  if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
    console.warn('formatSeconds: 参数必须为非负数字');
    return '00:00';
  }
  
  // 默认配置
  const {
    showHoursAlways = false,
    padZero = true,
    separator = ':',
    showUnit = false
  } = options;
  
  // 计算时分秒
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  // 补零函数
  const pad:any = (num) => padZero ? num.toString().padStart(2, '0') : num.toString();
  
  // 根据配置返回不同格式
  if (showUnit) {
    // 显示单位格式：1时02分03秒
    const parts:any = [];
    if (hours > 0 || showHoursAlways) {
      parts.push(`${hours}时`);
    }
    parts.push(`${pad(minutes)}分`);
    parts.push(`${pad(seconds)}秒`);
    return parts.join('');
  } else {
    // 标准格式：HH:MM:SS 或 MM:SS
    if (hours > 0 || showHoursAlways) {
      return `${pad(hours)}${'小时'}${pad(minutes)}${'分钟'}${pad(seconds)}秒`;
    } else {
      return `${pad(minutes)}${separator}${pad(seconds)}`;
    }
  }
}
defineExpose({
  showModal,
  closeModal,
});

</script>

<style scoped lang="less">
  /* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  border: none;
  white-space: nowrap;
}

.btn-primary {
  background: #00a2e8;
  color: #fff;
}

.btn-primary:hover {
  background: #0090cf;
}

.btn-secondary {
  background: #ffffff;
  color: #1a1a1a;
}

.btn-secondary:hover {
  opacity: 0.88;
}

.btn-outline {
  background: transparent;
  color: #ffffff;
  border: 1px solid #303d50;
}

.btn-outline:hover {
  border-color: #00a2e8;
  color: #00a2e8;
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
}

.btn-danger:hover {
  background: #dc2626;
}
/* ==================== 标题区域（科技感） ==================== */
.modal-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -11px;
  gap: 12px;
  padding: 12px 16px;
  width: 102%;
  background: rgba(0, 162, 232, 0.05);
  border-left: 3px solid #00a2e8;
  border-radius: 0 6px 6px 0;

  .title-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-icon {
    width: 22px;
    height: 22px;
    color: #00a2e8;
    flex-shrink: 0;
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
    color: #00c6ff;
    font-weight: 600;
    font-size: 15px;
  }

  .title-actions {
    display: flex;
    gap: 8px;
  }
}

/* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 20px;
  background: rgba(0, 162, 232, 0.06);
  border-left: 3px solid #00a2e8;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  color: #8a9ab0;

  .tip-icon {
    width: 18px;
    height: 18px;
    color: #00a2e8;
    flex-shrink: 0;
  }
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 6px 6px;

  .total-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #b0c7e0;
    font-size: 13px;
    flex-shrink: 0;

    &::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00d4ff;
      box-shadow: 0 0 6px rgba(0, 212, 255, 0.6);
    }

    .count-num {
      color: #00d4ff;
      font-size: 16px;
      font-weight: 700;
      font-family: 'DIN', 'Helvetica Neue', Arial, sans-serif;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
    }
  }

  .footer-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  :deep(.ant-btn) {
    height: 32px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-cancel {
    background: transparent !important;
    border: 1px solid rgba(0, 212, 255, 0.25) !important;
    color: #7fa6d4 !important;

    &:hover {
      border-color: #00d4ff !important;
      color: #00d4ff !important;
      background: rgba(0, 212, 255, 0.06) !important;
    }
  }

  .btn-confirm {
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
/* ------------------- Title Actions ------------------- */
.title-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ------------------- Table ------------------- */
.table-container {
  position: relative;
}

.table-scroll {
  min-height: 400px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
  border-top: none;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 229, 160, 0.85) rgba(255, 255, 255, 0.1);

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 160, 0.85);
    border-radius: 8px;
    border: 1px solid rgba(0, 255, 180, 0.35);
    box-shadow: 0 0 8px rgba(0, 229, 160, 0.5);

    &:hover {
      background: rgba(0, 255, 180, 1);
      box-shadow: 0 0 12px rgba(0, 255, 180, 0.8);
    }
  }

  &::-webkit-scrollbar-thumb:active {
    background: rgba(0, 255, 180, 1);
    box-shadow: 0 0 14px rgba(0, 255, 180, 0.9);
  }
}

.device-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.device-table th,
.device-table td {
  padding: 14px 12px;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}

.device-table thead th {
  color: #a0aabf;
  font-weight: 500;
  border-bottom: 1px solid #303d50;
  user-select: none;
  white-space: nowrap;
}

.device-table thead th .th-label {
  font-size: 13px;
  font-weight: 500;
}

.th-label,
.th-btn-wrap {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.th-btn-wrap {
  margin-left: 4px;
  cursor: pointer;
  position: relative;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  border-radius: 3px;
  color: #5a6a80;
  transition: all 0.15s;
}

.filter-btn:hover {
  color: #00c6ff;
  background: rgba(0, 198, 255, 0.1);
}

.filter-btn.active {
  color: #00c6ff;
  background: rgba(0, 198, 255, 0.15);
}

.sort-btn {
  flex-direction: column;
  gap: 0;
  margin-left: 8px;
  line-height: 0;
  justify-content: center;
  height: 24px;
}

.sort-btn .arr-up,
.sort-btn .arr-down {
  font-size: 10px;
  line-height: 10px;
  color: #3a4a5f;
  transition: color 0.12s;
}

.sort-btn .arr-up.active {
  color: #00c6ff;
}

.sort-btn .arr-down.active {
  color: #00c6ff;
}

.sort-btn:hover .arr-up,
.sort-btn:hover .arr-down {
  color: #5a6a80;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #1b2533;
  border: 1px solid #303d50;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  z-index: 20;
  min-width: 90px;
  padding: 4px 0;
}

.filter-option {
  padding: 7px 14px;
  font-size: 12px;
  color: #c0c8d4;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-option:hover {
  background: rgba(0, 162, 232, 0.1);
  color: #00c6ff;
}

.filter-option.active {
  color: #00c6ff;
  font-weight: 600;
}

/* 列宽比例分配 — 11列 */
.device-table th:nth-child(1),
.device-table td:nth-child(1) {
  width: 4%;
}

.device-table th:nth-child(2),
.device-table td:nth-child(2) {
  width: 16%;
}

.device-table th:nth-child(3),
.device-table td:nth-child(3) {
  width: 6%;
}

.device-table th:nth-child(4),
.device-table td:nth-child(4) {
  width: 11%;
}

.device-table th:nth-child(5),
.device-table td:nth-child(5) {
  width: 11%;
}

.device-table th:nth-child(6),
.device-table td:nth-child(6) {
  width: 11%;
}

.device-table th:nth-child(7),
.device-table td:nth-child(7) {
  width: 8%;
}

.device-table th:nth-child(8),
.device-table td:nth-child(8) {
  width: 7%;
}

.device-table th:nth-child(9),
.device-table td:nth-child(9) {
  width: 7%;
}

.device-table th:nth-child(10),
.device-table td:nth-child(10) {
  width: 9%;
}

.device-table th:nth-child(11),
.device-table td:nth-child(11) {
  width: 10%;
}

/* 复选框列居中对齐 */
.col-checkbox {
  text-align: center !important;
  vertical-align: middle;
}

.col-checkbox input[type='checkbox'] {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #00a2e8;
  vertical-align: middle;
  margin: 0;
  display: inline-block;
}

.device-table tbody td {
  color: #ffffff;
  border-bottom: 1px solid #303d50;
}

.device-table tbody tr:last-child td {
  border-bottom: none;
}

.device-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* 状态列强制左对齐 */
.status-cell {
  text-align: left !important;
}

/* 回路名称省略显示 */
.ellipsis-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 状态指示器 —— 图标与文字分离，灰色系 */
.status-indicator {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}

.status-indicator .status-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.status-indicator .status-text {
  display: inline-block;
  padding: 2px 10px;
  line-height: 1.6;
  font-size: 12px;
  border-radius: 4px;
}

.status-indicator.online {
  color: rgb(244, 234, 42);
}

.status-indicator.online .status-text {
  color: #f4c82a;
  background: rgba(244, 200, 42, 0.15);
}

.status-indicator.offline {
  color: #8a99ab;
}

.status-indicator.offline .status-text {
  color: #d0d5dd;
  background: rgba(255, 255, 255, 0.08);
}

/* 操作按钮 */
.device-table td.actions {
  border-bottom: 1px solid #303d50 !important;
}

.actions-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-inner .action-btn {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  color: #ffffff;
}

.actions-inner .action-btn.btn-open {
  background: #22c55e;
}

.actions-inner .action-btn.btn-open:hover {
  background: #16a34a;
}

.actions-inner .action-btn.btn-close {
  background: #ef4444;
}

.actions-inner .action-btn.btn-close:hover {
  background: #dc2626;
}

</style>

/* ==================== circuit-list-modal 弹框样式（通过唯一类名隔离，不污染全局） ==================== */
<style lang="less">
.circuit-list-modal {
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
.theme-white /* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  border: none;
  white-space: nowrap;
}.theme-white .btn-primary {
  background: #1890ff;
  color: #fff;
}.theme-white .btn-primary:hover {
  background: #40a9ff;
}.theme-white .btn-secondary {
  background: #ffffff;
  color: #1a1a1a;
}.theme-white .btn-secondary:hover {
  opacity: 0.88;
}.theme-white .btn-outline {
  background: transparent;
  color: #606266;
  border: 1px solid #dcdfe6;
}.theme-white .btn-outline:hover {
  border-color: #1890ff;
  color: #1890ff;
}.theme-white .btn-danger {
  background: #ff4d4f;
  color: #ffffff;
}.theme-white .btn-danger:hover {
  background: #ff7875;
}.theme-white /* ==================== 标题区域（科技感） ==================== */
.modal-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -11px;
  gap: 12px;
  padding: 12px 16px;
  width: 102%;
  background: rgba(24, 144, 255, 0.05);
  border-left: 3px solid #1890ff;
  border-radius: 0 6px 6px 0;

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

  .title-actions  {
    display: flex;
    gap: 8px;
  }}.theme-white /* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 20px;
  background: rgba(24, 144, 255, 0.06);
  border-left: 3px solid #1890ff;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  color: #909399;

  .tip-icon  {
    width: 18px;
    height: 18px;
    color: #1890ff;
    flex-shrink: 0;
  }}.theme-white /* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px dashed rgba(24, 144, 255, 0.25);
  background: #fafbfc;
  border-radius: 0 0 6px 6px;

  .total-count  {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #606266;
    font-size: 13px;
    flex-shrink: 0;

    &::before  {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #1890ff;
      box-shadow: 0 0 6px rgba(24, 144, 255, 0.6);
    }

    .count-num  {
      color: #1890ff;
      font-size: 16px;
      font-weight: 700;
      font-family: 'DIN', 'Helvetica Neue', Arial, sans-serif;
      text-shadow: 0 0 8px rgba(24, 144, 255, 0.4);
    }}

  .footer-actions  {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  :deep(.ant-btn)  {
    height: 32px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-cancel  {
    background: transparent !important;
    border: 1px solid rgba(24, 144, 255, 0.25) !important;
    color: #606266 !important;

    &:hover  {
      border-color: #1890ff !important;
      color: #1890ff !important;
      background: rgba(24, 144, 255, 0.06) !important;
    }}

  .btn-confirm  {
    background: linear-gradient(135deg, #1890ff, #096dd9) !important;
    border: none !important;
    color: #ffffff !important;
    font-weight: 600;

    &:hover  {
      opacity: 0.9;
      box-shadow: 0 0 12px rgba(24, 144, 255, 0.3);
    }}}.theme-white /* ------------------- Title Actions ------------------- */
.title-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}.theme-white /* ------------------- Table ------------------- */
.table-container {
  position: relative;
}.theme-white .table-scroll {
  min-height: 400px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
  border-top: none;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.04);

  &::-webkit-scrollbar  {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);

    &:hover  {
      background: rgba(0, 0, 0, 0.35);
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
    }}

  &::-webkit-scrollbar-thumb:active  {
    background: rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.18);
  }}.theme-white .device-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}.theme-white .device-table th,
.theme-white .device-table td {
  padding: 14px 12px;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}.theme-white .device-table thead th {
  color: #606266;
  font-weight: 500;
  border-bottom: 1px solid #e4e7ed;
  user-select: none;
  white-space: nowrap;
}.theme-white .device-table thead th .th-label {
  font-size: 13px;
  font-weight: 500;
}.theme-white .th-label,
.theme-white .th-btn-wrap {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}.theme-white .th-btn-wrap {
  margin-left: 4px;
  cursor: pointer;
  position: relative;
}.theme-white .filter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  border-radius: 3px;
  color: #909399;
  transition: all 0.15s;
}.theme-white .filter-btn:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}.theme-white .filter-btn.active {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.15);
}.theme-white .sort-btn {
  flex-direction: column;
  gap: 0;
  margin-left: 8px;
  line-height: 0;
  justify-content: center;
  height: 24px;
}.theme-white .sort-btn .arr-up,
.theme-white .sort-btn .arr-down {
  font-size: 10px;
  line-height: 10px;
  color: #c0c4cc;
  transition: color 0.12s;
}.theme-white .sort-btn .arr-up.active {
  color: #1890ff;
}.theme-white .sort-btn .arr-down.active {
  color: #1890ff;
}.theme-white .sort-btn:hover .arr-up,
.theme-white .sort-btn:hover .arr-down {
  color: #909399;
}.theme-white .filter-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 20;
  min-width: 90px;
  padding: 4px 0;
}.theme-white .filter-option {
  padding: 7px 14px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.15s;
}.theme-white .filter-option:hover {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}.theme-white .filter-option.active {
  color: #1890ff;
  font-weight: 600;
}.theme-white /* 列宽比例分配 — 10列 */
.device-table th:nth-child(1),
.theme-white .device-table td:nth-child(1) {
  width: 4%;
}.theme-white .device-table th:nth-child(2),
.theme-white .device-table td:nth-child(2) {
  width: 17%;
}.theme-white .device-table th:nth-child(3),
.theme-white .device-table td:nth-child(3) {
  width: 7%;
}.theme-white .device-table th:nth-child(4),
.theme-white .device-table td:nth-child(4) {
  width: 12%;
}.theme-white .device-table th:nth-child(5),
.theme-white .device-table td:nth-child(5) {
  width: 12%;
}.theme-white .device-table th:nth-child(6),
.theme-white .device-table td:nth-child(6) {
  width: 12%;
}.theme-white .device-table th:nth-child(7),
.theme-white .device-table td:nth-child(7) {
  width: 8%;
}.theme-white .device-table th:nth-child(8),
.theme-white .device-table td:nth-child(8) {
  width: 7%;
}.theme-white .device-table th:nth-child(9),
.theme-white .device-table td:nth-child(9) {
  width: 11%;
}.theme-white .device-table th:nth-child(10),
.theme-white .device-table td:nth-child(10) {
  width: 10%;
}.theme-white /* 复选框列居中对齐 */
.col-checkbox {
  text-align: center !important;
  vertical-align: middle;
}.theme-white .col-checkbox input[type='checkbox'] {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: #1890ff;
  vertical-align: middle;
  margin: 0;
  display: inline-block;
}.theme-white .device-table tbody td {
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
}.theme-white .device-table tbody tr:last-child td {
  border-bottom: none;
}.theme-white .device-table tbody tr:hover {
  background: rgba(24, 144, 255, 0.05);
}.theme-white /* 状态列强制左对齐 */
.status-cell {
  text-align: left !important;
}.theme-white /* 回路名称省略显示 */
.ellipsis-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}.theme-white /* 状态指示器 —— 图标与文字分离，灰色系 */
.status-indicator {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}.theme-white .status-indicator .status-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}.theme-white .status-indicator .status-text {
  display: inline-block;
  padding: 2px 10px;
  line-height: 1.6;
  font-size: 12px;
  border-radius: 4px;
}.theme-white .status-indicator.online {
  color: rgb(244, 234, 42);
}.theme-white .status-indicator.online .status-text {
  color: #f4c82a;
  background: rgba(244, 200, 42, 0.15);
}.theme-white .status-indicator.offline {
  color: #909399;
}.theme-white .status-indicator.offline .status-text {
  color: #909399;
  background: rgba(0, 0, 0, 0.04);
}.theme-white /* 操作按钮 */
.device-table td.actions {
  border-bottom: 1px solid #e4e7ed !important;
}.theme-white .actions-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}.theme-white .actions-inner .action-btn {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  color: #ffffff;
}.theme-white .actions-inner .action-btn.btn-open {
  background: #52c41a;
}.theme-white .actions-inner .action-btn.btn-open:hover {
  background: #389e0d;
}.theme-white .actions-inner .action-btn.btn-close {
  background: #ff4d4f;
}.theme-white .actions-inner .action-btn.btn-close:hover {
  background: #ff7875;
}
</style>

<style lang="less">
.theme-white .circuit-list-modal {
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
    box-shadow:
      0 0 0 1px rgba(24, 144, 255, 0.45),
      0 0 24px rgba(24, 144, 255, 0.12),
      0 0 60px rgba(24, 144, 255, 0.05),
      0 12px 40px rgba(0, 0, 0, 0.15) !important;
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
        rgba(24, 144, 255, 0.4) 25%,
        rgba(24, 144, 255, 0.6) 50%,
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
    filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.4));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header  {
    position: relative;
    background: #fafbfc !important;
    border-bottom: 1px solid rgba(24, 144, 255, 0.12) !important;
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
    text-shadow: 0 0 12px rgba(24, 144, 255, 0.4);
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
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.5);
  }

  .ant-modal-close  {
    top: 16px !important;
    right: 20px !important;

    .ant-modal-close-x  {
      color: #606266 !important;
      font-size: 18px !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover  {
        color: #1890ff !important;
        transform: rotate(90deg);
      }}}

  .ant-modal-body  {
    padding: 24px !important;
    background: linear-gradient(180deg, rgba(24,144,255,0.03) 0%, rgba(24,144,255,0.01) 100%) !important;
  }

  .ant-modal-footer  {
    display: none;
  }}
</style>
