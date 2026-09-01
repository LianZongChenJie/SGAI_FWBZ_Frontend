<template>
  <section class="page-wrapper" :class="themeClass">
    <div class="page-panel">
      <!-- 标题栏 -->
      <header class="page-header">
        <div class="left">
          <svg
            class="icon-wrench"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <h1 class="title">地块档案管理</h1>
        </div>

        <div class="right">
          <button class="btn btn-primary" @click="onOpenAddModal">+ 新增地块</button>
          <!-- <button class="btn btn-secondary" @click="onImport">导入</button>
          <button class="btn btn-secondary" @click="onExport">导出</button> -->
        </div>
      </header>

      <!-- 筛选栏 -->
      <section class="filter-bar">
        <div class="search-box">
          <svg
            class="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="搜索地块名称、建设单位、型号..."
          />
        </div>
        <select v-model="selectedPlace" class="select">
          <option value="">全部地块</option>
          <option v-for="p in placeOptions" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="selectedStatus" class="select">
          <option value="">全部状态</option>
          <option value="在线">在线</option>
          <option value="离线">离线</option>
        </select>
      </section>

      <!-- 数据表格 -->
      <section class="table-wrapper" v-loading="tableLoading">
        <table class="device-table">
          <thead>
            <tr>
              <th>地块名称</th>
              <th>建设单位</th>
              <th>型号</th>
              <th>竣工日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredData" :key="row.id">
              <td>{{ row.spaceName }}</td>
              <td>{{ row.manufacturer }}</td>
              <td>{{ row.deviceModel }}</td>
              <td>{{ row.installDate }}</td>
              <td class="status-cell">
                <span
                  class="status-badge-table"
                  :class="{
                    online: row.runState === '在线',
                    offline: row.runState === '离线',
                  }"
                >{{ row.runState }}</span>
              </td>
              <td class="actions">
                <button class="action-btn" @click="onDetail(row)">详情</button>
                <button class="action-btn" @click="onOpenEditModal(row)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, onMounted } from 'vue';
import { EquipmentListApi } from '@/api/equipment';   // ← replace with the real module

/* --------------------- 模拟数据 --------------------- */
const tableData = ref([]);

/* --------------------- 筛选状态 --------------------- */
const searchKeyword = ref('');
const selectedPlace = ref('');
const selectedStatus = ref('');

/* 计算出所有地块选项（去重） */
const placeOptions = computed(() => {
  const set = new Set<string>();
  tableData.value.forEach((d) => set.add(d.spaceName));
  return Array.from(set);
});

/* 过滤后的表格数据 */
const filteredData = computed(() => {
  return tableData.value.filter((row) => {
    const matchesKeyword =
      !searchKeyword.value ||
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(searchKeyword.value.toLowerCase());

    const matchesPlace =
      !selectedPlace.value || row.spaceName === selectedPlace.value;

    const matchesStatus =
      !selectedStatus.value || row.runState === selectedStatus.value;

    return matchesKeyword && matchesPlace && matchesStatus;
  });
});
/** 获取列表数据 */
async function fetchList() {
  tableLoading.value = true;
  try {
    const data = await EquipmentListApi();
    console.log('设备列表数据：', data);
    // 判断 records 是否为有效数组，非数组或空数组时赋默认值
    if (data && Array.isArray(data.records) && data.records.length > 0) {
      tableData.value = data.records;
    } else {
      tableData.value = [];
    }
  } catch (err) {
    console.error('Failed to load equipment list:', err);
  } finally {tableLoading.value = false;}
}
/* --------------------- 按钮事件（示例） --------------------- */
/* --------------------- Modal 操作 --------------------- */
const addModalRef = ref<InstanceType<typeof AddModal>>();

function onOpenAddModal() {
  console.log('点击新增设备');
  addModalRef.value?.showModal('add');
}

function onOpenEditModal(row: Record<string, any>) {
  addModalRef.value?.showModal('edit', row);
}

function onDetail(row: typeof tableData.value[0]) {
  console.log('查看详情', row);
}

function onModalSuccess() {
  fetchList();
}

// 数据请求
const tableLoading = ref(false);
onMounted(async () => {
  fetchList()
})


</script>

<style scoped>
/* ------------------- 颜色变量（挂在根节点，scoped 下 :root 无效） ------------------- */
.page-wrapper {
  --bg-page: #0b111e;
  --bg-panel: #1b2533;
  --color-text: #ffffff;
  --color-muted: #a0aabf;
  --color-primary: #00a2e8;
  --color-primary-hover: #0090cf;
  --color-border: #303d50;
  --color-online: #52c41a;
  --color-offline: #ff4d4f;

  box-sizing: border-box;
  min-height: 100%;
  padding: 16px;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page-wrapper *,
.page-wrapper *::before,
.page-wrapper *::after {
  box-sizing: border-box;
}

/* 内容卡片 */
.page-panel {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 20px 24px 16px;
}

/* ------------------- Header ------------------- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-wrench {
  width: 22px;
  height: 22px;
  color: var(--color-text);
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
}

.page-header .right {
  display: flex;
  align-items: center;
  gap: 10px;
}

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
  background: var(--color-primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: #ffffff;
  color: #1a1a1a;
}

.btn-secondary:hover {
  opacity: 0.88;
}

/* ------------------- Filter Bar ------------------- */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 300px;
  height: 36px;
  padding: 0 12px 0 36px;
  background: #ffffff;
  border: none;
  border-radius: 4px;
  color: #1a1a1a;
  font-size: 13px;
  outline: none;
}

.search-input::placeholder {
  color: #9ca3af;
}

.select {
  width: 140px;
  height: 36px;
  padding: 0 28px 0 12px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 4px;
  color: var(--color-text);
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
}

.select option {
  background: var(--bg-panel);
  color: var(--color-text);
}

/* ------------------- Table ------------------- */
.table-wrapper {
  overflow-x: auto;
}

.device-table {
  width: 100%;
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
  color: var(--color-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}

/* 列宽比例分配（占满父容器）：地块名称 & 建设单位 占比最大，其余自适应 */
.device-table th:nth-child(1),
.device-table td:nth-child(1) {
  width: 24%;
}

.device-table th:nth-child(2),
.device-table td:nth-child(2) {
  width: 24%;
}

.device-table th:nth-child(3),
.device-table td:nth-child(3) {
  width: 16%;
}

.device-table th:nth-child(4),
.device-table td:nth-child(4) {
  width: 16%;
}

.device-table th:nth-child(5),
.device-table td:nth-child(5) {
  width: 10%;
}

.device-table th:nth-child(6),
.device-table td:nth-child(6) {
  width: 10%;
}

.device-table tbody td {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
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

/* 状态 Badge */
.status-badge-table {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 48px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
}

.status-badge-table.online {
  color: var(--color-online);
  background: rgba(82, 196, 26, 0.2);
}

.status-badge-table.offline {
  color: var(--color-offline);
  background: rgba(255, 77, 79, 0.2);
}

/* 操作按钮 */
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions .action-btn {
  height: 28px;
  padding: 0 12px;
  background: #ffffff;
  border: none;
  border-radius: 4px;
  color: #1a1a1a;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.actions .action-btn:hover {
  opacity: 0.85;
}

/* ------------------- 响应式 ------------------- */
@media (max-width: 768px) {
  .page-panel {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header .right {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .select {
    width: 100%;
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped>
/* 白色主题颜色变量（挂在根节点，scoped 下 :root 无效，需与根类同级选择器命中） */
.theme-white.page-wrapper {
  --bg-page: #f5f7fa;
  --bg-panel: #ffffff;
  --color-text: #303133;
  --color-muted: #909399;
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-border: #e4e7ed;
  --color-online: #52c41a;
  --color-offline: #ff4d4f;

  box-sizing: border-box;
  min-height: 100%;
  padding: 16px;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}.theme-white.page-wrapper *,
.theme-white.page-wrapper *::before,
.theme-white.page-wrapper *::after {
  box-sizing: border-box;
}.theme-white /* 内容卡片 */
.page-panel {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 20px 24px 16px;
}.theme-white /* ------------------- Header ------------------- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}.theme-white .page-header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}.theme-white .icon-wrench {
  width: 22px;
  height: 22px;
  color: var(--color-text);
  flex-shrink: 0;
}.theme-white .title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
}.theme-white .page-header .right {
  display: flex;
  align-items: center;
  gap: 10px;
}.theme-white /* 按钮 */
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
  background: var(--color-primary);
  color: #fff;
}.theme-white .btn-primary:hover {
  background: var(--color-primary-hover);
}.theme-white .btn-secondary {
  background: #f0f2f5;
  color: #303133;
}.theme-white .btn-secondary:hover {
  opacity: 0.88;
}.theme-white /* ------------------- Filter Bar ------------------- */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}.theme-white .search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}.theme-white .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}.theme-white .search-input {
  width: 300px;
  height: 36px;
  padding: 0 12px 0 36px;
  background: #f0f2f5;
  border: none;
  border-radius: 4px;
  color: #303133;
  font-size: 13px;
  outline: none;
}.theme-white .search-input::placeholder {
  color: #9ca3af;
}.theme-white .select {
  width: 140px;
  height: 36px;
  padding: 0 28px 0 12px;
  background-color: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: var(--color-text);
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
}.theme-white .select option {
  background: var(--bg-panel);
  color: var(--color-text);
}.theme-white /* ------------------- Table ------------------- */
.table-wrapper {
  overflow-x: auto;
}.theme-white .device-table {
  width: 100%;
  border-collapse: collapse;
}.theme-white .device-table th,
.theme-white .device-table td {
  padding: 14px 12px;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}.theme-white .device-table thead th {
  color: var(--color-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}.theme-white /* 列宽比例分配（占满父容器）：地块名称 & 建设单位 占比最大，其余自适应 */
.device-table th:nth-child(1),
.theme-white .device-table td:nth-child(1) {
  width: 24%;
}.theme-white .device-table th:nth-child(2),
.theme-white .device-table td:nth-child(2) {
  width: 24%;
}.theme-white .device-table th:nth-child(3),
.theme-white .device-table td:nth-child(3) {
  width: 16%;
}.theme-white .device-table th:nth-child(4),
.theme-white .device-table td:nth-child(4) {
  width: 16%;
}.theme-white .device-table th:nth-child(5),
.theme-white .device-table td:nth-child(5) {
  width: 10%;
}.theme-white .device-table th:nth-child(6),
.theme-white .device-table td:nth-child(6) {
  width: 10%;
}.theme-white .device-table tbody td {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}.theme-white .device-table tbody tr:last-child td {
  border-bottom: none;
}.theme-white .device-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.04);
}.theme-white /* 状态列强制左对齐 */
.status-cell {
  text-align: left !important;
}.theme-white /* 状态 Badge */
.status-badge-table {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 48px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
}.theme-white .status-badge-table.online {
  color: var(--color-online);
  background: rgba(82, 196, 26, 0.2);
}.theme-white .status-badge-table.offline {
  color: var(--color-offline);
  background: rgba(255, 77, 79, 0.2);
}.theme-white /* 操作按钮 */
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}.theme-white .actions .action-btn {
  height: 28px;
  padding: 0 12px;
  background: #f0f2f5;
  border: none;
  border-radius: 4px;
  color: #303133;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}.theme-white .actions .action-btn:hover {
  opacity: 0.85;
}

/* ------------------- 响应式 ------------------- */
@media (max-width: 768px)  {.theme-white .page-panel {
    padding: 16px;
  }.theme-white .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }.theme-white .page-header .right {
    width: 100%;
    flex-wrap: wrap;
  }.theme-white .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }.theme-white .select {
    width: 100%;
  }}
</style>
