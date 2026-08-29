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
          <h1 class="title">工单管理</h1>
        </div>

        <div class="right">
          <button class="btn btn-primary" @click="onAdd">+ 新增工单</button>
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
            placeholder="搜索工单编号、标题..."
          />
        </div>
        <select v-model="selectedPlace" class="select">
          <option value="">全部状态</option>
          <option v-for="p in placeOptions" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="selectedStatus" class="select">
          <option value="">全部优先级</option>
          <option value="紧急">紧急</option>
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>
      </section>

      <!-- 数据表格 -->
      <section class="table-wrapper">
        <table class="device-table">
          <thead>
            <tr>
              <th>工单编号</th>
              <th>标题</th>
              <th>来源</th>
              <th>关联设备</th>
              <th>优先级</th>
              <th>状态</th>
              <th>创建日期</th>
              <th>负责人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredData" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.place }}</td>
              <td>{{ row.loop }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    high: row.status === '高',
                    center: row.status === '中',
                    low: row.status === '低',
                    offline: row.status === '紧急',
                  }"
                >{{ row.status }}</span>
              </td>
              <td>
              <span
                  class="status-badge"
                  :class="{
                    high: row.vendor === '处理中',
                    pending: row.vendor === '待处理',
                    low: row.vendor === '已完成',
                  }"
                >{{ row.vendor }}</span>
                </td>
                <td>{{ row.date }}</td>
              <td>{{ row.model }}</td>
              
              
              <td class="actions">
                <button class="action-btn" @click="onEdit(row)">处理</button>
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
const tableData = ref([
  {
    id: 'WO-20260622-001',
    name: 'B2-滨水绿道回路07通信故障',
    place: '报警转工单',
    loop: 'DEV-B2-007',
    vendor: '待处理',
    model: '张工',
    date: '2023-05-20',
    status: '紧急',
  },
  {
    id: 'WO-20260622-002',
    name: 'A2-服贸会场馆功率异常排查',
    place: '报警转工单',
    loop: 'DEV-B2-007',
    vendor: '已完成',
    model: '张工',
    date: '2023-05-20',
    status: '高',
  },
  {
    id: 'WO-20260622-003',
    name: 'C1-科技大厦回路22离线修复',
    place: '报警转工单',
    loop: 'DEV-B2-007',
    vendor: '处理中',
    model: '张工',
    date: '2023-06-15',
    status: '中',
  },
  {
    id: 'WO-20260622-004',
    name: '全区照明设备巡检',
    place: '计划任务',
    loop: '全部',
    vendor: '处理中',
    model: '张工',
    date: '2023-08-10',
    status: '低',
  },
]);

/* --------------------- 筛选状态 --------------------- */
const searchKeyword = ref('');
const selectedPlace = ref('');
const selectedStatus = ref('');

/* 计算出所有地块选项（去重） */
const placeOptions = computed(() => {
  const set = new Set<string>();
  tableData.value.forEach((d) => set.add(d.status));
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
      !selectedPlace.value || row.place === selectedPlace.value;

    const matchesStatus =
      !selectedStatus.value || row.status === selectedStatus.value;

    return matchesKeyword && matchesPlace && matchesStatus;
  });
});

/* --------------------- 按钮事件（示例） --------------------- */
function onAdd() {
  console.log('点击新增设备');
}
function onImport() {
  console.log('点击导入');
}
function onExport() {
  console.log('点击导出');
}
function onDetail(row: typeof tableData.value[0]) {
  console.log('查看详情', row);
}
function onEdit(row: typeof tableData.value[0]) {
  console.log('编辑', row);
}
// 数据请求
const loading = ref(false);
onMounted(async () => {
  // loading.value = true;
  // try {
  //   const data = await EquipmentListApi();
  //   console.log('设备列表数据：', data);
  //    tableData.value = Array.isArray(data) ? data : (data?.list ?? []);
  // } catch (err) {
  //   console.error('Failed to load equipment list:', err);
  // } finally {loading.value = false;}
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
  --color-high: #F59E0B;
  --color-center: #94A3B8;
  --color-low: #52c41a;
  --color-offline: #ff4d4f;
  --color-pending: #0090cf;

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
  width: 100%;
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
  min-width: 900px;
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

/* 状态 Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
}

.status-badge.high {
  color: var(--color-high);
  background: rgba(68, 65, 57, 0.2);
}

.status-badge.center {
  color: var(--color-center);
  background: rgba(48, 59, 77, 0.2);
}

.status-badge.low {
  color: var(--color-low);
  background: rgba(68, 65, 57, 0.2);
}

.status-badge.offline {
  color: var(--color-offline);
  background: rgba(255, 77, 79, 0.2);
}

.status-badge.pending {
  color: var(--color-pending);
  background: rgba(28, 60, 85, 0.2);
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
  --color-high: #F59E0B;
  --color-center: #909399;
  --color-low: #52c41a;
  --color-offline: #ff4d4f;
  --color-pending: #1890ff;

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
  width: 100%;
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
  min-width: 900px;
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
}.theme-white .device-table tbody td {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}.theme-white .device-table tbody tr:last-child td {
  border-bottom: none;
}.theme-white .device-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.04);
}.theme-white /* 状态 Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
}.theme-white .status-badge.high {
  color: var(--color-high);
  background: rgba(68, 65, 57, 0.2);
}.theme-white .status-badge.center {
  color: var(--color-center);
  background: rgba(48, 59, 77, 0.2);
}.theme-white .status-badge.low {
  color: var(--color-low);
  background: rgba(68, 65, 57, 0.2);
}.theme-white .status-badge.offline {
  color: var(--color-offline);
  background: rgba(255, 77, 79, 0.2);
}.theme-white .status-badge.pending {
  color: var(--color-pending);
  background: rgba(28, 60, 85, 0.2);
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
