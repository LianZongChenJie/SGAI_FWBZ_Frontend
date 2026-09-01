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
          <h1 class="title">基础信息管理</h1>
        </div>

        <div class="right">
        </div>
      </header>

      <!-- 筛选栏 -->
      <section class="filter-bar">
        <div class="filter-left">
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
              placeholder="搜索名称"
            />
          </div>
          <select v-model="selectedRelName" class="select">
            <option value="">全部类别</option>
            <option v-for="p in relNameOptions" :key="p" :value="p">{{ p }}</option>
          </select>
          <select v-model="selectedPlace" class="select">
            <option value="">全部区域</option>
            <option v-for="p in placeOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
          <select v-model="selectedStatus" class="select">
            <option value="">全部状态</option>
            <option value="开启">开启</option>
            <option value="关闭">关闭</option>
          </select>
          <button class="btn btn-primary" @click="onSearch">查询</button>
          <button class="btn btn-outline" @click="onReset">重置</button>
          <button class="btn btn-outline" @click="onExport">导出数据</button>
        </div>
        <div class="filter-right">
          <button class="btn btn-primary" @click="onSearch">刷新</button>
          <button class="btn btn-primary" @click="onOpenAll">全开</button>
          <button class="btn btn-danger" @click="onCloseAll">全关</button>
        </div>
      </section>

      <!-- 数据表格 -->
      <section ref="tableWrapperRef" class="table-wrapper" v-loading="tableLoading">
        <vxe-table
          ref="tableRef"
          :data="tableData"
          :row-config="{ keyField: 'id', height: 36 }"
          :checkbox-config="{ checkField: '_checked' }"
          :sort-config="{ sortMethod: tableSortMethod }"
          height="100%"
          border="none"
          @checkbox-change="onCheckboxChange"
          @checkbox-all="onCheckboxAll"
        >
          <vxe-column type="checkbox" width="40" fixed="left"></vxe-column>
          <vxe-column type="seq" title="序号" width="50" fixed="left"></vxe-column>
          <vxe-column field="relName" title="类别" min-width="110" sortable></vxe-column>
          <vxe-column field="districtName" title="区域" min-width="120" sortable></vxe-column>
          <!-- areaCode -->
          <vxe-column field="areaCode" title="区域编码" min-width="120" sortable></vxe-column>
          <vxe-column field="areaName" title="名称" min-width="130" sortable></vxe-column>
          <vxe-column field="pendingMsgCount" title="待下发消息数量" width="140" header-align="center" align="center" sortable></vxe-column>
          <vxe-column field="status" title="状态" width="110" sortable>
            <template #default="{ row }">
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
            </template>
          </vxe-column>
          <vxe-column field="comstat" title="连接状态" min-width="100" sortable></vxe-column>
          <vxe-column title="操作" width="360" fixed="right" header-align="left" align="left">
            <template #default="{ row }">
              <div class="actions">
                <button class="action-btn" @click="videoMonitorModalOpen(row)">监控视频</button>
                <button class="action-btn" @click="circuitListModalOpenChange(row)">回路列表</button>
                <button class="action-btn btn-primary" style="color: #1a1a1a;" @click="onOpenRow(row)">全开</button>
                <button class="action-btn btn-danger" @click="onCloseRow(row)">全关</button>
                <button class="action-btn btn-recall" :disabled="Number(row.pendingMsgCount) <= 0" @click="onRecall(row)">撤回</button>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </section>
    </div>
  </section>

  <!-- 二次确认弹框，多选 -->
  <configOpenMessage ref="configOpenMessageRef" @success="onModalConfigOpenMessageSuccess($event)"></configOpenMessage>
  <!-- 二次确认弹框，单选 -->
  <configOpenMessageTwo ref="configOpenMessageRefTwo" @success="onModalConfigOpenMessageSuccessTwo($event)"></configOpenMessageTwo>
  <!-- 回路列表 -->
  <circuitListModal ref="circuitListModalRef" @success="circuitListModalSuccess($event)"></circuitListModal>
  <!-- 监控视频弹框 -->
  <VideoMonitorModal ref="videoMonitorModalRef"></VideoMonitorModal>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { getRelName, getAllDistrictTag, getAreaListPageApi, setAreaOpenApi, setAreaCloseApi, recallMqApi } from '@/api/baseSettingBqZm';   // ← replace with the real module
import configOpenMessage from './compoments/configOpenMessage.vue';
import configOpenMessageTwo from './compoments/configOpenMessageTwo.vue';
import circuitListModal from './compoments/circuitListModal.vue';
import VideoMonitorModal from './compoments/VideoMonitorModal.vue';

import { message } from 'ant-design-vue';
import { exportExcel } from '/@/utils/export';
/* --------------------- 模拟数据 --------------------- */
const rawData = ref([]);
const tableRef = ref();
const tableWrapperRef = ref<HTMLElement>();
let resizeObserver: ResizeObserver | null = null;

/* --------------------- 筛选状态 --------------------- */
const searchKeyword = ref('');
const selectedPlace = ref('');
const selectedRelName = ref('');
const selectedStatus = ref('');
const appliedStatus = ref('');

/* 前端本地过滤（status 不走接口，点查询才生效） */
const tableData = computed(() => {
  if (!appliedStatus.value) return rawData.value;
  return rawData.value.filter((row: any) => row.status === appliedStatus.value);
});

/* 类别 */
const relNameOptions = ref<string[]>([]);
/* 区域 */
const placeOptions = ref<{ label: string; value: string }[]>([])

/** 获取类别下拉选项 */
async function fetchRelNameOptions() {
  try {
    const res = await getRelName();
    console.log('类别选项：', res);
    if (Array.isArray(res)) {
      relNameOptions.value = res;
    }
  } catch (err) {
    console.error('获取类别选项失败：', err);
  }
}

/** 获取区域下拉选项（综合预览地块运行状态标签列表） */
async function fetchPlaceOptions() {
  try {
    const res = await getAllDistrictTag('1');
    console.log('区域选项：', res);
    const list = Array.isArray(res) ? res : (res?.records || []);
    // 查询接口按 districtId 过滤，下拉 value 用标签 id，label 用标签中文名（districtName）
    placeOptions.value = list.map((item: { id: string; districtName: string }) => ({
      label: item.districtName,
      value: String(item.id),
    }));
  } catch (err) {
    console.error('获取区域选项失败：', err);
  }
}

// 加载loading标识
const tableLoading = ref(false);
/** 获取列表数据 */
async function fetchList() {
  tableLoading.value = true;
  try {
    const params = {
      column: 'createTime',
      order: 'desc',
      pageNo: 1,
      pageSize: 9999,
      relName: selectedRelName.value || undefined,
      districtId: selectedPlace.value || undefined,
      areaName: searchKeyword.value.trim() || undefined,
    };
    const data = await getAreaListPageApi(params);
    console.log('设备列表数据：', data);
    if (data) {
      rawData.value = Array.isArray(data.records) ? data.records : [];
      // 数据更新后重新计算表格尺寸，确保 auto-resize 生效
      await nextTick();
      tableRef.value?.recalculate?.();
    }
  } catch (err) {
    console.error('Failed to load equipment list:', err);
  } finally {tableLoading.value = false;}
}

/** 前端排序：待下发消息数量按数值比较，其余列按中文本地化比较 */
function tableSortMethod({ data, sortList }: { data: any[]; sortList: Array<{ field: string; order: 'asc' | 'desc' }> }) {
  // vxe-table 调用签名: ({ data, sortList, $table })，排序字段/方向从 sortList 取
  if (!sortList || !sortList.length) return data;
  const { field, order } = sortList[0];
  const isDesc = order === 'desc';
  return [...data].sort((a: any, b: any) => {
    const va = a[field];
    const vb = b[field];
    // 空值固定排最后
    if (va == null || va === '') return 1;
    if (vb == null || vb === '') return -1;
    let result: number;
    if (field === 'pendingMsgCount') {
      result = (Number(va) || 0) - (Number(vb) || 0);
    } else {
      result = String(va).localeCompare(String(vb), 'zh-Hans-CN');
    }
    return isDesc ? -result : result;
  });
}

/** 查询 */
function onSearch() {
  appliedStatus.value = selectedStatus.value;
  fetchList();
}

/** 重置 */
function onReset() {
  searchKeyword.value = '';
  selectedRelName.value = '';
  selectedPlace.value = '';
  selectedStatus.value = '';
  appliedStatus.value = '';
  fetchList();
}

/** 导出表格数据为 Excel（导出当前过滤后的数据，与表格显示一致） */
function onExport() {
  if (!tableData.value.length) {
    // eslint-disable-next-line no-alert
    alert('暂无可导出的数据');
    return;
  }
  const rows = tableData.value.map((row: any, idx: number) => ({
    index: idx + 1,
    relName: row.relName,
    districtName: row.districtName,
    areaCode: row.areaCode,
    areaName: row.areaName,
    pendingMsgCount: row.pendingMsgCount,
    status: row.status,
    comstat: row.comstat,
  }));
  exportExcel({
    tableData: rows,
    fileName: '基础信息管理数据',
    headers: [
      { key: 'index', title: '序号' },
      { key: 'relName', title: '类别' },
      { key: 'districtName', title: '区域' },
      { key: 'areaCode', title: '区域编码' },
      { key: 'areaName', title: '名称' },
      { key: 'pendingMsgCount', title: '待下发消息数量' },
      { key: 'status', title: '状态' },
      { key: 'comstat', title: '连接状态' },
    ],
  });
}
/* --------------------- Modal 操作 --------------------- */
const configOpenMessageRef = ref<InstanceType<typeof configOpenMessage>>();
/** 全开 */
function onOpenAll() {
  if (!selectedRowKeys.value.length) return message.error('请勾选区域！');
  const checkedRows = rawData.value.filter((row: any) => selectedRowKeys.value.includes(row.id));
  configOpenMessageRef.value?.showModal('open', checkedRows);
}

/** 全关 */
function onCloseAll() {
  if (!selectedRowKeys.value.length) return message.error('请勾选区域！');
  const checkedRows = rawData.value.filter((row: any) => selectedRowKeys.value.includes(row.id));
  configOpenMessageRef.value?.showModal('close', checkedRows);
}

function onModalConfigOpenMessageSuccess(type) {
  console.log('开关---按钮回调----');
  console.log('type:', type);
  if(type === "open") {
    openAll()
  } else if(type === "close") {
    closeAll()
  }
}
// 表格勾选
const selectedRowKeys = ref<string[]>([]);

/** vxe-table 单行勾选变更 */
function onCheckboxChange({ records }: { records: any[] }) {
  selectedRowKeys.value = records.map((row: any) => row.id);
}

/** vxe-table 全选/全不选 */
function onCheckboxAll({ records }: { records: any[] }) {
  selectedRowKeys.value = records.map((row: any) => row.id);
}

// 多选--全开
const openAll = async () => {
  if (!selectedRowKeys.value.length) return message.error('请勾选区域！');
  try {
    await Promise.all(
      selectedRowKeys.value.map(async (item) => {
        await setAreaOpenApi({ id: item });
      }),
    );
    message.success('全开指令已下发');
  } catch (error) {
    // 全局拦截器已统一弹出错误提示，这里只记录日志
    console.error('全开失败:', error);
  }
  onSearch();
};

// 多选--全关
const closeAll = async () => {
  if (!selectedRowKeys.value.length) return message.error('请勾选区域！');
  try {
    await Promise.all(
      selectedRowKeys.value.map(async (item) => {
        await setAreaCloseApi({ id: item });
      }),
    );
    message.success('全关指令已下发');
  } catch (error) {
    // 全局拦截器已统一弹出错误提示，这里只记录日志
    console.error('全关失败:', error);
  }
  onSearch();
};
// 单行--row操作
const configOpenMessageRefTwo = ref<InstanceType<typeof configOpenMessageTwo>>();
/** 单行--全开 */
function onOpenRow(row) {
 configOpenMessageRefTwo.value?.showModal({
  type: 'open',
  row: row,
 });
}

/** 单行--全关 */
function onCloseRow(row) {
 configOpenMessageRefTwo.value?.showModal({
  type: 'close',
  row: row,
 });
}

function onModalConfigOpenMessageSuccessTwo(event) {
  console.log('单行--开关---按钮回调----');
  console.log('type:', event.type);
  if(event.type === "open") {
    handleOpen(event.row)
  } else if(event.type === "close") {
    handleClose(event.row)
  }
}
// 单行--全开
const handleOpen = async (record) => {
  try {
    await setAreaOpenApi({ id: record.id });
    message.success('全开成功！');
  } catch (error) {
    // 全局拦截器已统一弹出错误提示，这里只记录日志
    console.error('全开失败:', error);
  }
  onSearch();
};
// 单行--全关
const handleClose = async (record) => {
  try {
    await setAreaCloseApi({ id: record.id });
    message.success('全关成功！');
  } catch (error) {
    // 全局拦截器已统一弹出错误提示，这里只记录日志
    console.error('全关失败:', error);
  }
  onSearch();
};

// 单行--撤回（待下发数量 > 0 时可用）
const onRecall = async (row) => {
  await recallMqApi({
    id: row.id,
  }).then((res) => {
    console.log('撤回成功', res);
  });
  onSearch()
};

// 回路列表
const circuitListModalRef = ref<InstanceType<typeof circuitListModal>>();
const videoMonitorModalRef = ref<InstanceType<typeof VideoMonitorModal> | null>(null);
const circuitListModalOpenChange = (rowObj) => {
  circuitListModalRef.value?.showModal({
    row: rowObj,
  });
}
const circuitListModalSuccess = () =>{
  onSearch()
}

// 监控视频弹框
const videoMonitorModalOpen = (row) => {
  videoMonitorModalRef.value?.showModal(row);
}

onMounted(() => {
  fetchList();
  fetchRelNameOptions();
  fetchPlaceOptions();

  // ResizeObserver：wrapper 尺寸确定后让 vxe-table 重算高度
  resizeObserver = new ResizeObserver(() => {
    tableRef.value?.recalculate?.();
  });
  if (tableWrapperRef.value) {
    resizeObserver.observe(tableWrapperRef.value);
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect();
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
  height: 100%;
  max-height: calc(100vh - 60px); /* 减去 layout header 高度，超出后内部消化 */
  padding: 16px;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  padding: 15px 24px 16px;

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
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

.btn-outline {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
}

.btn-danger:hover {
  background: #dc2626;
}

/* ------------------- Filter Bar ------------------- */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ====== vxe-table 深色主题覆盖 ====== */
/* 把 --color-border 在表格作用域内重定向为背景色，让表头/表体的分隔线也"消失"
   （.btn-outline 在 .table-wrapper 之外，不受影响） */
.table-wrapper {
  --color-border: var(--bg-panel);
  overflow: hidden; /* 外层截断，table 自己负责滚动 */
}
.table-wrapper :deep(.vxe-table) {
  /* 表格整体背景：去外边框 + 继承父容器 flex 高度 */
  background: var(--bg-panel);
  color: var(--color-text);
  border: 0;
  outline: 0;
  box-shadow: none;
  height: 100%;

  /* 终极方案：把 vxe-table 内置所有"边框线"相关 CSS 变量全部指向背景色
     包括 border--default/full/outer/inner 下用 linear-gradient 画的分隔线 */
  --vxe-ui-table-border-color: var(--bg-panel);
  --vxe-ui-table-border-width: 0;
  --vxe-ui-table-checkbox-range-border-color: var(--bg-panel);
  --vxe-ui-table-cell-area-border-color: var(--bg-panel);
  --vxe-ui-table-cell-main-area-extension-border-color: var(--bg-panel);
  --vxe-ui-table-cell-extend-area-border-color: var(--bg-panel);
  --vxe-ui-table-cell-copy-area-border-color: var(--bg-panel);
  /* 滚动状态下 fixed 列的"分隔阴影"也清零 */
  --vxe-ui-table-fixed-right-scrolling-box-shadow: none;
  --vxe-ui-table-fixed-left-scrolling-box-shadow: none;
  /* 渲染层/表头/底部行/选中行的背景都向面板色对齐，避免产生任何对比差异 */
  --vxe-ui-layout-background-color: var(--bg-panel);
  --vxe-ui-table-header-background-color: var(--bg-panel);
  --vxe-ui-table-footer-background-color: var(--bg-panel);
  --vxe-ui-table-row-hover-background-color: rgba(255, 255, 255, 0.04);
  --vxe-ui-table-row-striped-background-color: var(--bg-panel);
  --vxe-ui-table-row-current-background-color: rgba(0, 162, 232, 0.15);

  /* 自定义滚动条：可见、可拖 */
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}
/* 自定义滚动条样式 —— 应用到 vxe-table 内任何可滚动节点 */
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-track,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-track,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-track {
  background: transparent;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb:hover,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb:hover,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* vxe-table 内置的所有装饰性边框容器，统统隐藏/透明化 */
.table-wrapper :deep(.vxe-table--border-line),
.table-wrapper :deep(.vxe-table--column-line),
.table-wrapper :deep(.vxe-table--row-line) {
  border-color: transparent;
}
.table-wrapper :deep(.vxe-table--border-line) { display: none !important; }

/* 清除 fixed 左右列的 box-shadow（包括 scrolling-middle 状态下的"分隔阴影"） */
.table-wrapper :deep(.vxe-table--fixed-left-wrapper),
.table-wrapper :deep(.vxe-table--fixed-right-wrapper) {
  box-shadow: none !important;
  background-color: transparent; /* 避免继承 panel 背景形成颜色对比 */
}

/* 兜底：清掉所有 header/body wrapper 的右边线/边阴影/轮廓 */
.table-wrapper :deep(.vxe-table--header-wrapper),
.table-wrapper :deep(.vxe-table--body-wrapper),
.table-wrapper :deep(.vxe-table--footer-wrapper),
.table-wrapper :deep(.vxe-table--header),
.table-wrapper :deep(.vxe-table--body),
.table-wrapper :deep(.vxe-table--footer) {
  border-right: 0 !important;
  border-top: 0 !important;
  border-left: 0 !important;
  box-shadow: none !important;
  outline: 0 !important;
}

/* 最后兜底：vxe-table 内任何可能的右 1px 线条伪元素，一并去掉 */
.table-wrapper :deep(.vxe-table)::after,
.table-wrapper :deep(.vxe-table)::before,
.table-wrapper :deep(.vxe-table--header-wrapper)::after,
.table-wrapper :deep(.vxe-table--header-wrapper)::before {
  display: none !important;
  border: 0 !important;
}
.table-wrapper :deep(.vxe-body--column) {
  border-right: none !important;
}

/* 表头行：清掉 vxe-header--row / vxe-header--column 的右边线 */
.table-wrapper :deep(.vxe-header--row),
.table-wrapper :deep(.vxe-header--row .vxe-header--column),
.table-wrapper :deep(.vxe-header--row .vxe-header--column:last-child),
.table-wrapper :deep(.vxe-header--row .col--fixed-right) {
  border-right: 0 !important;
  background-image: none !important;
}

/* Gutter 列（表头/表体滚动条占位列）—— 多行表头每行都有一个，vxe-table
   border--default/full 下通过 background-image 画底部边界线；
   这里把所有边界线、背景色、阴影全部干掉，杜绝右侧白线 */
.table-wrapper :deep(.vxe-table--header-wrapper .vxe-header--row .vxe-header--gutter),
.table-wrapper :deep(.vxe-table--body-wrapper .vxe-body--row .vxe-body--gutter),
.table-wrapper :deep(.vxe-header--gutter),
.table-wrapper :deep(.vxe-body--gutter),
.table-wrapper :deep(.col--gutter) {
  border: 0 !important;
  background-image: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 表头 */
.table-wrapper :deep(.vxe-table--header) {
  background: #1a2332;
}
.table-wrapper :deep(.vxe-header--column) {
  background: #1a2332;
  color: var(--color-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
  height: 40px;
  /* 表头文字单行完整显示，永不换行/省略 */
  white-space: nowrap;
}
/* 表头 title 与排序图标同行显示：flex 布局杜绝换行，排序图标不挤压 title */
.table-wrapper :deep(.vxe-header--column > .vxe-cell) {
  display: flex;
  align-items: center;
  overflow: hidden;
  gap: 0.04rem;
}
.table-wrapper :deep(.vxe-header--column > .vxe-cell .vxe-cell--title) {
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.table-wrapper :deep(.vxe-header--column > .vxe-cell .vxe-cell--sort) {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 0;
  line-height: 1;
}
/* 垂直双箭头布局压缩高度，避免撑高表头 */
.table-wrapper :deep(.vxe-header--column .vxe-cell--sort-vertical-layout) {
  height: 1.2em;
  gap: 0;
}
.table-wrapper :deep(.vxe-header--column .vxe-cell--sort-vertical-layout .vxe-sort--asc-btn),
.table-wrapper :deep(.vxe-header--column .vxe-cell--sort-vertical-layout .vxe-sort--desc-btn) {
  height: 0.5em;
  line-height: 1;
}
/* 居中列（待下发消息数量）保持居中 */
.table-wrapper :deep(.vxe-header--column.col--center > .vxe-cell) {
  justify-content: center;
}

/* 表体行 */
.table-wrapper :deep(.vxe-body--row) {
  border-bottom: 1px solid var(--color-border);
  background: var(--bg-panel);
}
.table-wrapper :deep(.vxe-body--row.row--hover),
.table-wrapper :deep(.vxe-body--row:hover) {
  background: #233044 !important;
}
.table-wrapper :deep(.vxe-table--body) {
  background: var(--bg-panel);
}
.table-wrapper :deep(.vxe-table--body-wrapper) {
  background: var(--bg-panel);
}
.table-wrapper :deep(.vxe-body--column) {
  color: var(--color-text);
  font-size: 13px;
}

/* 复选框列 */
.table-wrapper :deep(.vxe-checkbox--icon) {
  color: var(--color-muted);
}
.table-wrapper :deep(.vxe-checkbox.is--checked .vxe-checkbox--icon) {
  color: var(--color-primary);
}

/* 序号列 */
.table-wrapper :deep(.vxe-seq--column .vxe-cell) {
  color: var(--color-muted);
}

/* 固定列阴影 */
.table-wrapper :deep(.vxe-table--fix-left) {
  background: var(--bg-panel);
}
.table-wrapper :deep(.vxe-table--fix-right) {
  background: var(--bg-panel);
}

/* 滚动条 */
.table-wrapper :deep(.vxe-table--body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}
.table-wrapper :deep(.vxe-table--body-wrapper::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* 状态指示器 —— 图标与文字分离，灰色系 */
.status-indicator {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}

.status-indicator .status-icon {
  width: 18px;
  height: 18px;
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

.status-indicator.online .status-icon {
  filter: none;
}

.status-indicator.offline {
  color: #8a99ab;
}

.status-indicator.offline .status-text {
  color: #d0d5dd;
  background: rgba(255, 255, 255, 0.08);
}

.status-indicator.offline .status-icon {
  filter: grayscale(1) brightness(1.4) contrast(0.8);
}

/* 操作按钮 */
.actions {
  display: flex;
  align-items: center;
  /* 统一左对齐：按钮组从操作列左边缘起依次向右排开
     与表头"操作"两个字共用同一条左基线 */
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding-right: 12px; /* 与表头一起让操作列整体距离右边留一点空隙 */
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

.actions .action-btn.btn-primary {
  background: #22c55e;
  color: #fff;
}

.actions .action-btn.btn-primary:hover {
  background: #16a34a;
}

.actions .action-btn.btn-danger {
  background: #ef4444;
  color: #fff;
}

.actions .action-btn.btn-danger:hover {
  background: #dc2626;
}

.actions .action-btn.btn-recall {
  background: #f59e0b;
  color: #fff;
}

.actions .action-btn.btn-recall:hover {
  background: #d97706;
}

/* 置灰状态：待下发数量为 0 时不可点击 */
.actions .action-btn:disabled,
.actions .action-btn:disabled:hover {
  background: #6b7280;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
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

  .filter-left,
  .filter-right {
    flex-wrap: wrap;
    width: 100%;
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
  height: 100%;
  max-height: calc(100vh - 60px); /* 减去 layout header 高度，超出后内部消化 */
  padding: 16px;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  display: flex;
  flex-direction: column;
  overflow: hidden;
}.theme-white.page-wrapper *,
.theme-white.page-wrapper *::before,
.theme-white.page-wrapper *::after {
  box-sizing: border-box;
}.theme-white /* 内容卡片 */
.page-panel {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 15px 24px 16px;

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
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
}.theme-white .btn-outline {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}.theme-white .btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}.theme-white .btn-danger {
  background: #ff4d4f;
  color: #ffffff;
}.theme-white .btn-danger:hover {
  background: #ff7875;
}.theme-white /* ------------------- Filter Bar ------------------- */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}.theme-white .filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}.theme-white .filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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
  flex: 1;
  min-height: 0;
  overflow: hidden;
}.theme-white /* ====== vxe-table 深色主题覆盖 ====== */
/* 把 --color-border 在表格作用域内重定向为背景色，让表头/表体的分隔线也"消失"
   （.btn-outline 在 .table-wrapper 之外，不受影响） */
.table-wrapper {
  --color-border: var(--bg-panel);
  overflow: hidden; /* 外层截断，table 自己负责滚动 */
}.theme-white .table-wrapper :deep(.vxe-table) {
  /* 表格整体背景：去外边框 + 继承父容器 flex 高度 */
  background: var(--bg-panel);
  color: var(--color-text);
  border: 0;
  outline: 0;
  box-shadow: none;
  height: 100%;

  /* 终极方案：把 vxe-table 内置所有"边框线"相关 CSS 变量全部指向背景色
     包括 border--default/full/outer/inner 下用 linear-gradient 画的分隔线 */
  --vxe-ui-table-border-color: var(--bg-panel);
  --vxe-ui-table-border-width: 0;
  --vxe-ui-table-checkbox-range-border-color: var(--bg-panel);
  --vxe-ui-table-cell-area-border-color: var(--bg-panel);
  --vxe-ui-table-cell-main-area-extension-border-color: var(--bg-panel);
  --vxe-ui-table-cell-extend-area-border-color: var(--bg-panel);
  --vxe-ui-table-cell-copy-area-border-color: var(--bg-panel);
  /* 滚动状态下 fixed 列的"分隔阴影"也清零 */
  --vxe-ui-table-fixed-right-scrolling-box-shadow: none;
  --vxe-ui-table-fixed-left-scrolling-box-shadow: none;
  /* 渲染层/表头/底部行/选中行的背景都向面板色对齐，避免产生任何对比差异 */
  --vxe-ui-layout-background-color: var(--bg-panel);
  --vxe-ui-table-header-background-color: var(--bg-panel);
  --vxe-ui-table-footer-background-color: var(--bg-panel);
  --vxe-ui-table-row-hover-background-color: rgba(0, 0, 0, 0.04);
  --vxe-ui-table-row-striped-background-color: var(--bg-panel);
  --vxe-ui-table-row-current-background-color: rgba(24, 144, 255, 0.12);

  /* 自定义滚动条：可见、可拖 */
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}.theme-white /* 自定义滚动条样式 —— 应用到 vxe-table 内任何可滚动节点 */
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-track,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-track,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-track {
  background: transparent;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb:hover,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb:hover,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white /* vxe-table 内置的所有装饰性边框容器，统统隐藏/透明化 */
.table-wrapper :deep(.vxe-table--border-line),
.theme-white .table-wrapper :deep(.vxe-table--column-line),
.theme-white .table-wrapper :deep(.vxe-table--row-line) {
  border-color: transparent;
}.theme-white .table-wrapper :deep(.vxe-table--border-line) { display: none !important; }.theme-white /* 清除 fixed 左右列的 box-shadow（包括 scrolling-middle 状态下的"分隔阴影"） */
.table-wrapper :deep(.vxe-table--fixed-left-wrapper),
.theme-white .table-wrapper :deep(.vxe-table--fixed-right-wrapper) {
  box-shadow: none !important;
  background-color: transparent; /* 避免继承 panel 背景形成颜色对比 */
}.theme-white /* 兜底：清掉所有 header/body wrapper 的右边线/边阴影/轮廓 */
.table-wrapper :deep(.vxe-table--header-wrapper),
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper),
.theme-white .table-wrapper :deep(.vxe-table--footer-wrapper),
.theme-white .table-wrapper :deep(.vxe-table--header),
.theme-white .table-wrapper :deep(.vxe-table--body),
.theme-white .table-wrapper :deep(.vxe-table--footer) {
  border-right: 0 !important;
  border-top: 0 !important;
  border-left: 0 !important;
  box-shadow: none !important;
  outline: 0 !important;
}.theme-white /* 最后兜底：vxe-table 内任何可能的右 1px 线条伪元素，一并去掉 */
.table-wrapper :deep(.vxe-table)::after,
.theme-white .table-wrapper :deep(.vxe-table)::before,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::after,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::before {
  display: none !important;
  border: 0 !important;
}.theme-white .table-wrapper :deep(.vxe-body--column) {
  border-right: none !important;
}.theme-white /* 表头行：清掉 vxe-header--row / vxe-header--column 的右边线 */
.table-wrapper :deep(.vxe-header--row),
.theme-white .table-wrapper :deep(.vxe-header--row .vxe-header--column),
.theme-white .table-wrapper :deep(.vxe-header--row .vxe-header--column:last-child),
.theme-white .table-wrapper :deep(.vxe-header--row .col--fixed-right) {
  border-right: 0 !important;
  background-image: none !important;
}.theme-white /* Gutter 列（表头/表体滚动条占位列）—— 多行表头每行都有一个，vxe-table
   border--default/full 下通过 background-image 画底部边界线；
   这里把所有边界线、背景色、阴影全部干掉，杜绝右侧白线 */
.table-wrapper :deep(.vxe-table--header-wrapper .vxe-header--row .vxe-header--gutter),
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper .vxe-body--row .vxe-body--gutter),
.theme-white .table-wrapper :deep(.vxe-header--gutter),
.theme-white .table-wrapper :deep(.vxe-body--gutter),
.theme-white .table-wrapper :deep(.col--gutter) {
  border: 0 !important;
  background-image: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}.theme-white /* 表头 */
.table-wrapper :deep(.vxe-table--header) {
  background: #f5f7fa;
}.theme-white .table-wrapper :deep(.vxe-header--column) {
  background: #f5f7fa;
  color: var(--color-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
  height: 40px;
  /* 表头文字单行完整显示，永不换行/省略 */
  white-space: nowrap;
}.theme-white /* 表体行 */
.table-wrapper :deep(.vxe-body--row) {
  border-bottom: 1px solid var(--color-border);
  background: var(--bg-panel);
}.theme-white .table-wrapper :deep(.vxe-body--row.row--hover),
.theme-white .table-wrapper :deep(.vxe-body--row:hover) {
  background: rgba(24, 144, 255, 0.05) !important;
}.theme-white .table-wrapper :deep(.vxe-table--body) {
  background: var(--bg-panel);
}.theme-white .table-wrapper :deep(.vxe-table--body-wrapper) {
  background: var(--bg-panel);
}.theme-white .table-wrapper :deep(.vxe-body--column) {
  color: var(--color-text);
  font-size: 13px;
}.theme-white /* 复选框列 */
.table-wrapper :deep(.vxe-checkbox--icon) {
  color: var(--color-muted);
}.theme-white .table-wrapper :deep(.vxe-checkbox.is--checked .vxe-checkbox--icon) {
  color: var(--color-primary);
}.theme-white /* 序号列 */
.table-wrapper :deep(.vxe-seq--column .vxe-cell) {
  color: var(--color-muted);
}.theme-white /* 固定列阴影 */
.table-wrapper :deep(.vxe-table--fix-left) {
  background: var(--bg-panel);
}.theme-white .table-wrapper :deep(.vxe-table--fix-right) {
  background: var(--bg-panel);
}.theme-white /* 滚动条 */
.table-wrapper :deep(.vxe-table--body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}.theme-white .table-wrapper :deep(.vxe-table--body-wrapper::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}.theme-white /* 状态指示器 —— 图标与文字分离，灰色系 */
.status-indicator {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 1;
}.theme-white .status-indicator .status-icon {
  width: 18px;
  height: 18px;
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
}.theme-white .status-indicator.online .status-icon {
  filter: none;
}.theme-white .status-indicator.offline {
  color: #909399;
}.theme-white .status-indicator.offline .status-text {
  color: #909399;
  background: rgba(0, 0, 0, 0.04);
}.theme-white .status-indicator.offline .status-icon {
  filter: grayscale(1) brightness(1.4) contrast(0.8);
}.theme-white /* 操作按钮 */
.actions {
  display: flex;
  align-items: center;
  /* 统一左对齐：按钮组从操作列左边缘起依次向右排开
     与表头"操作"两个字共用同一条左基线 */
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding-right: 12px; /* 与表头一起让操作列整体距离右边留一点空隙 */
}.theme-white .actions .action-btn {
  height: 28px;
  padding: 0 12px;
  background: #ffffff;
  border: none;
  border-radius: 4px;
  color: #1a1a1a;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}.theme-white .actions .action-btn:hover {
  opacity: 0.85;
}.theme-white /* 监控视频/回路列表（无颜色变体的纯 action-btn）边框参照定时控制详情按钮 */
.actions .action-btn:not(.btn-primary):not(.btn-danger):not(.btn-recall) {
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
}.theme-white .actions .action-btn:not(.btn-primary):not(.btn-danger):not(.btn-recall):hover {
  border-color: #1890ff !important;
  color: #1890ff !important;
  opacity: 0.85;
}.theme-white .actions .action-btn.btn-primary {
  background: #52c41a;
  color: #fff;
}.theme-white .actions .action-btn.btn-primary:hover {
  background: #389e0d;
}.theme-white .actions .action-btn.btn-danger {
  background: #ff4d4f;
  color: #fff;
}.theme-white .actions .action-btn.btn-danger:hover {
  background: #ff7875;
}.theme-white .actions .action-btn.btn-recall {
  background: #f59e0b;
  color: #fff;
}.theme-white .actions .action-btn.btn-recall:hover {
  background: #d97706;
}.theme-white /* 置灰状态：待下发数量为 0 时不可点击 */
.actions .action-btn:disabled,
.theme-white .actions .action-btn:disabled:hover {
  background: #6b7280;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
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
  }.theme-white .filter-left,
.theme-white .filter-right {
    flex-wrap: wrap;
    width: 100%;
  }.theme-white .select {
    width: 100%;
  }}
</style>
