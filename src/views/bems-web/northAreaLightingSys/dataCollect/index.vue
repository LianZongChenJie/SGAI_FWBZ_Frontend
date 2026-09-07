<template>
  <section class="page-wrapper" :class="themeClass">
    <a-tabs v-model:activeKey="activeTab" class="dark-tabs">
      <!-- 接口开发标签页 -->
      <a-tab-pane key="interface" tab="接口开发">
        <div class="page-panel">
          <header class="page-header">
            <div class="left">
              <svg class="icon-wrench" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <h1 class="title">厂商接口对接状态</h1>
            </div>
            <div class="right">
              <button class="btn btn-primary" @click="onOpenAddModal">+ 新增接口</button>
            </div>
          </header>
          <a-spin :spinning="tableLoading" tip="加载中...">
            <div class="table-wrapper">
              <table class="device-table">
                <thead>
                  <tr>
                    <th>厂商</th>
                    <th>协议类型</th>
                    <th>接口地址</th>
                    <th>所属地块</th>
                    <th>数据类型</th>
                    <th>状态</th>
                    <th>最后同步</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in interfaceData" :key="row.id">
                    <td>{{ row.manufacturer }}</td>
                    <td>{{ row.protocolType }}</td>
                    <td>{{ row.interfaceAddress }}</td>
                    <td>{{ row.spaceName }}</td>
                    <td>{{ row.dataType }}</td>
                    <td>
                      <span class="status-badge-table" :class="row.statusClass">{{ row.status }}</span>
                    </td>
                    <td>{{ row.lastSyncTime }}</td>
                    <td class="actions">
                      <!-- <button class="action-btn" @click="onOpenEditModal(row)">编辑</button> -->
                      <button class="action-btn">测试</button>
                      <button class="action-btn" @click="onOpenEditModal(row)">配置</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </a-spin>
        </div>
      </a-tab-pane>

      <!-- 数据归集标签页 -->
      <a-tab-pane key="collect" tab="数据归集" forceRender>
        <div class="dashboard-grid">
          <!-- 左上：数据归集统计 -->
          <div class="panel chart-panel">
            <div class="panel-header">
              <span class="panel-icon blue"></span>
              <span class="panel-title">数据归集统计</span>
            </div>
            <div ref="chartRef" class="chart-box"></div>
          </div>

          <!-- 右上：数据类型分布 -->
          <div class="panel">
            <div class="panel-header">
              <span class="panel-icon red"></span>
              <span class="panel-title">数据类型分布</span>
            </div>
            <div class="progress-list">
              <div class="progress-item">
                <div class="progress-label">
                  <span class="progress-dot blue"></span>
                  <span>实时数据（电流/电压/功率）</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-track">
                    <div class="progress-fill blue" style="width: 45%;"></div>
                  </div>
                  <span class="progress-value">45%</span>
                </div>
              </div>
              <div class="progress-item">
                <div class="progress-label">
                  <span class="progress-dot green"></span>
                  <span>开关量数据（开关状态）</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-track">
                    <div class="progress-fill green" style="width: 30%;"></div>
                  </div>
                  <span class="progress-value">30%</span>
                </div>
              </div>
              <div class="progress-item">
                <div class="progress-label">
                  <span class="progress-dot orange"></span>
                  <span>触发类数据（报警/事件）</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-track">
                    <div class="progress-fill orange" style="width: 15%;"></div>
                  </div>
                  <span class="progress-value">15%</span>
                </div>
              </div>
              <div class="progress-item">
                <div class="progress-label">
                  <span class="progress-dot red"></span>
                  <span>视频数据</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-track">
                    <div class="progress-fill red" style="width: 10%;"></div>
                  </div>
                  <span class="progress-value">10%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 下方：实时数据流 -->
          <div class="panel full-width">
            <div class="panel-header">
              <span class="panel-icon blue"></span>
              <span class="panel-title">实时数据流</span>
            </div>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>时间戳</th>
                    <th>地块</th>
                    <th>设备</th>
                    <th>数据项</th>
                    <th>值</th>
                    <th>类型</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in streamData" :key="row.id">
                    <td>{{ row.time }}</td>
                    <td>{{ row.area }}</td>
                    <td>{{ row.device }}</td>
                    <td>{{ row.item }}</td>
                    <td>{{ row.value }}</td>
                    <td>
                      <span class="type-tag" :class="row.typeClass">{{ row.type }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </section>

  <!-- 新增/编辑弹框 -->
  <AddModal ref="addModalRef" @success="onModalSuccess" />
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';
import AddModal from './compoments/addModal.vue';
import { dataCollectListApi } from '@/api/dataCollect';

const activeTab = ref('interface');
const chartRef = ref<HTMLDivElement>();

/* --------------------- 厂商接口数据 --------------------- */
const interfaceData = ref<any[]>([]);
const tableLoading = ref(false);

interface InterfaceRow {
  id: string;
  manufacturer: string;
  protocolType: string;
  interfaceAddress: string;
  spaceName: string;
  dataType: string;
  status: string;
  statusClass: string;
  lastSyncTime: string;
}

/** 获取列表数据 */
async function fetchList() {
  tableLoading.value = true;
  try {
    const res = await dataCollectListApi({});
    console.log('res', res);
    if (res.records && Array.isArray(res.records) && res.records.length > 0) {
      const list: InterfaceRow[] = (res.records || []).map((item: any) => ({
        id: item.id || '',
        manufacturer: item.manufacturer || item.manufacturer || '',
        protocolType: item.protocolTypeType || item.protocolType || '',
        interfaceAddress: item.interfaceinterfaceAddress || item.interfaceAddress || '',
        spaceName: item.spaceName || '',
        dataType: item.dataType || '',
        status: item.status || '正常',
        statusClass: item.status === '异常' ? 'delay' : item.status === '离线' ? 'offline' : 'online',
        lastSyncTime: item.lastSyncTime || item.updateTime || '--',
      }));
      interfaceData.value = list;
    } else {
      message.error(res.message || res.msg || '获取列表数据失败');
    }
  } catch (err: any) {
    message.error(err?.message || err?.msg || '请求异常，请检查网络');
  } finally {
    tableLoading.value = false;
  }
}

/* --------------------- 实时数据流 --------------------- */
const streamData = ref([
  { id: 1, time: '2026-06-22 14:00:52', area: 'A1', device: '回路01', item: '功率', value: '3.21 kW', type: '实时', typeClass: 'realtime' },
  { id: 2, time: '2026-06-22 14:00:51', area: 'A2', device: '回路03', item: '开关状态', value: '开启', type: '开关量', typeClass: 'switch' },
  { id: 3, time: '2026-06-22 14:00:51', area: 'B2', device: '回路07', item: '报警', value: '通信超时', type: '触发', typeClass: 'trigger' },
  { id: 4, time: '2026-06-22 14:00:50', area: 'C1', device: '回路12', item: '电压', value: '220.1 V', type: '实时', typeClass: 'realtime' },
  { id: 5, time: '2026-06-22 14:00:49', area: 'A1', device: '回路02', item: '开关状态', value: '开启', type: '开关量', typeClass: 'switch' },
]);

/* --------------------- ECharts 初始化 --------------------- */
let chartInstance: echarts.ECharts | null = null;

/* --------------------- Modal 操作 --------------------- */
const addModalRef = ref<InstanceType<typeof AddModal>>();

function onOpenAddModal() {
  addModalRef.value?.showModal('add');
}

function onOpenEditModal(row: Record<string, any>) {
  addModalRef.value?.showModal('edit', row);
}

function onModalSuccess() {
  fetchList();
}

function initChart() {
  if (!chartRef.value) return;
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(chartRef.value);

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    legend: {
      data: ['实时数据', '开关量'],
      textStyle: { color: '#a0aabf' },
      top: 0,
      right: 0,
      itemWidth: 16,
      itemHeight: 4,
    },
    grid: {
      left: 10,
      right: 10,
      top: 40,
      bottom: 10,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
      axisLine: { lineStyle: { color: '#303d50' } },
      axisLabel: { color: '#a0aabf', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#303d50', type: 'dashed' } },
      axisLabel: { color: '#a0aabf', fontSize: 11 },
    },
    series: [
      {
        name: '实时数据',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#00a2e8', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,162,232,0.25)' },
            { offset: 1, color: 'rgba(0,162,232,0.02)' },
          ]),
        },
        data: [120, 80, 60, 80, 160, 360, 420],
      },
      {
        name: '开关量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#52c41a', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82,196,26,0.25)' },
            { offset: 1, color: 'rgba(82,196,26,0.02)' },
          ]),
        },
        data: [200, 200, 60, 60, 160, 340, 360],
      },
    ],
  };

  chartInstance.setOption(option);
}

/* 监听 tab 切换，延迟 resize 保证图表容器已正确渲染 */
watch(activeTab, (val) => {
  if (val === 'collect') {
    nextTick(() => {
      setTimeout(() => {
        chartInstance?.resize();
      }, 100);
    });
  }
});

/* 窗口大小变化时自动 resize */
function onWindowResize() {
  chartInstance?.resize();
}

onMounted(() => {
  window.addEventListener('resize', onWindowResize);
  fetchList();
  nextTick(() => {
    initChart();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<style scoped>
/* ------------------- 颜色变量 ------------------- */
.page-wrapper {
  --bg-page: #0b111e;
  --bg-panel: #1b2533;
  --color-text: #ffffff;
  --color-muted: #a0aabf;
  --color-primary: #00a2e8;
  --color-primary-hover: #0090cf;
  --color-border: #303d50;
  --color-green: #52c41a;
  --color-orange: #f59e0b;
  --color-red: #ff4d4f;

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

/* ------------------- 内容卡片 ------------------- */
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

/* ------------------- Device Table ------------------- */
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

/* 列宽比例 — 最后同步(时间列)占比最大 */
.device-table th:nth-child(1),
.device-table td:nth-child(1) { width: 12%; }
.device-table th:nth-child(2),
.device-table td:nth-child(2) { width: 10%; }
.device-table th:nth-child(3),
.device-table td:nth-child(3) { width: 18%; }
.device-table th:nth-child(4),
.device-table td:nth-child(4) { width: 15%; }
.device-table th:nth-child(5),
.device-table td:nth-child(5) { width: 12%; }
.device-table th:nth-child(6),
.device-table td:nth-child(6) { width: 8%; }
.device-table th:nth-child(7),
.device-table td:nth-child(7) { width: 12%; }
.device-table th:nth-child(8),
.device-table td:nth-child(8) { width: 10%; }

.status-badge-table {
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

.status-badge-table.online {
  color: var(--color-green);
  background: rgba(82, 196, 26, 0.15);
}

.status-badge-table.delay {
  color: var(--color-orange);
  background: rgba(245, 158, 11, 0.15);
}

.status-badge-table.offline {
  color: var(--color-red);
  background: rgba(255, 77, 79, 0.15);
}

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

/* ------------------- Dashboard 网格 ------------------- */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.panel {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 16px 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.panel-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.panel-icon.blue {
  background: var(--color-primary);
}

.panel-icon.red {
  background: var(--color-red);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

/* ------------------- Chart ------------------- */
.chart-panel {
  min-height: 280px;
}

.chart-box {
  width: 100%;
  height: 240px;
}

/* ------------------- Progress List ------------------- */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text);
}

.progress-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.progress-dot.blue {
  background: var(--color-primary);
}

.progress-dot.green {
  background: var(--color-green);
}

.progress-dot.orange {
  background: var(--color-orange);
}

.progress-dot.red {
  background: var(--color-red);
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.progress-fill.blue {
  background: var(--color-primary);
}

.progress-fill.green {
  background: var(--color-green);
}

.progress-fill.orange {
  background: var(--color-orange);
}

.progress-fill.red {
  background: var(--color-red);
}

.progress-value {
  font-size: 12px;
  color: var(--color-muted);
  min-width: 36px;
  text-align: right;
}

/* ------------------- Spin Loading 暗色适配 ------------------- */
:deep(.ant-spin-container) {
  min-height: 200px;
}

:deep(.ant-spin-text) {
  color: var(--color-muted);
}

/* ------------------- Table ------------------- */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}

.data-table thead th {
  color: var(--color-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}

.data-table tbody td {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* 列宽比例 — 时间戳(时间列)占比最大 */
.data-table th:nth-child(1),
.data-table td:nth-child(1) { width: 15%; }
.data-table th:nth-child(2),
.data-table td:nth-child(2) { width: 20%; }
.data-table th:nth-child(3),
.data-table td:nth-child(3) { width: 20%; }
.data-table th:nth-child(4),
.data-table td:nth-child(4) { width: 20%; }
.data-table th:nth-child(5),
.data-table td:nth-child(5) { width: 15%; }
.data-table th:nth-child(6),
.data-table td:nth-child(6) { width: 15%; }

.type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 22px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
}

.type-tag.realtime {
  color: var(--color-primary);
  background: rgba(0, 162, 232, 0.15);
}

.type-tag.switch {
  color: var(--color-green);
  background: rgba(82, 196, 26, 0.15);
}

.type-tag.trigger {
  color: var(--color-red);
  background: rgba(255, 77, 79, 0.15);
}

/* ------------------- Tabs 深色样式 ------------------- */
:deep(.dark-tabs .ant-tabs-nav) {
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

:deep(.dark-tabs .ant-tabs-nav::before) {
  border-bottom: none;
}

:deep(.dark-tabs .ant-tabs-tab) {
  color: var(--color-muted);
  font-size: 14px;
  padding: 8px 0;
  margin-right: 24px;
}

:deep(.dark-tabs .ant-tabs-tab:hover) {
  color: var(--color-text);
}

:deep(.dark-tabs .ant-tabs-tab-active) {
  color: var(--color-primary) !important;
}

:deep(.dark-tabs .ant-tabs-ink-bar) {
  background: var(--color-primary);
  height: 2px;
}

/* ------------------- 响应式 ------------------- */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .page-panel {
    padding: 16px;
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
  --color-green: #52c41a;
  --color-orange: #f59e0b;
  --color-red: #ff4d4f;

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
}.theme-white /* ------------------- 内容卡片 ------------------- */
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
}.theme-white .btn {
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
}.theme-white /* ------------------- Device Table ------------------- */
.device-table {
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
}.theme-white .device-table tbody td {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}.theme-white .device-table tbody tr:last-child td {
  border-bottom: none;
}.theme-white .device-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.04);
}.theme-white /* 列宽比例 — 最后同步(时间列)占比最大 */
.device-table th:nth-child(1),
.theme-white .device-table td:nth-child(1) { width: 12%; }.theme-white .device-table th:nth-child(2),
.theme-white .device-table td:nth-child(2) { width: 10%; }.theme-white .device-table th:nth-child(3),
.theme-white .device-table td:nth-child(3) { width: 18%; }.theme-white .device-table th:nth-child(4),
.theme-white .device-table td:nth-child(4) { width: 15%; }.theme-white .device-table th:nth-child(5),
.theme-white .device-table td:nth-child(5) { width: 12%; }.theme-white .device-table th:nth-child(6),
.theme-white .device-table td:nth-child(6) { width: 8%; }.theme-white .device-table th:nth-child(7),
.theme-white .device-table td:nth-child(7) { width: 12%; }.theme-white .device-table th:nth-child(8),
.theme-white .device-table td:nth-child(8) { width: 10%; }.theme-white .status-badge-table {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
}.theme-white .status-badge-table.online {
  color: var(--color-green);
  background: rgba(82, 196, 26, 0.15);
}.theme-white .status-badge-table.delay {
  color: var(--color-orange);
  background: rgba(245, 158, 11, 0.15);
}.theme-white .status-badge-table.offline {
  color: var(--color-red);
  background: rgba(255, 77, 79, 0.15);
}.theme-white .actions {
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
}.theme-white /* ------------------- Dashboard 网格 ------------------- */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}.theme-white .full-width {
  grid-column: 1 / -1;
}.theme-white .panel {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 16px 20px;
}.theme-white .panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}.theme-white .panel-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}.theme-white .panel-icon.blue {
  background: var(--color-primary);
}.theme-white .panel-icon.red {
  background: var(--color-red);
}.theme-white .panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}.theme-white /* ------------------- Chart ------------------- */
.chart-panel {
  min-height: 280px;
}.theme-white .chart-box {
  width: 100%;
  height: 240px;
}.theme-white /* ------------------- Progress List ------------------- */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}.theme-white .progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}.theme-white .progress-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text);
}.theme-white .progress-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}.theme-white .progress-dot.blue {
  background: var(--color-primary);
}.theme-white .progress-dot.green {
  background: var(--color-green);
}.theme-white .progress-dot.orange {
  background: var(--color-orange);
}.theme-white .progress-dot.red {
  background: var(--color-red);
}.theme-white .progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}.theme-white .progress-track {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  overflow: hidden;
}.theme-white .progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}.theme-white .progress-fill.blue {
  background: var(--color-primary);
}.theme-white .progress-fill.green {
  background: var(--color-green);
}.theme-white .progress-fill.orange {
  background: var(--color-orange);
}.theme-white .progress-fill.red {
  background: var(--color-red);
}.theme-white .progress-value {
  font-size: 12px;
  color: var(--color-muted);
  min-width: 36px;
  text-align: right;
}.theme-white /* ------------------- Spin Loading 暗色适配 ------------------- */
:deep(.ant-spin-container) {
  min-height: 200px;
}.theme-white :deep(.ant-spin-text) {
  color: var(--color-muted);
}.theme-white /* ------------------- Table ------------------- */
.table-wrapper {
  overflow-x: auto;
}.theme-white .data-table {
  width: 100%;
  border-collapse: collapse;
}.theme-white .data-table th,
.theme-white .data-table td {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}.theme-white .data-table thead th {
  color: var(--color-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}.theme-white .data-table tbody td {
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}.theme-white .data-table tbody tr:last-child td {
  border-bottom: none;
}.theme-white .data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}.theme-white /* 列宽比例 — 时间戳(时间列)占比最大 */
.data-table th:nth-child(1),
.theme-white .data-table td:nth-child(1) { width: 15%; }.theme-white .data-table th:nth-child(2),
.theme-white .data-table td:nth-child(2) { width: 20%; }.theme-white .data-table th:nth-child(3),
.theme-white .data-table td:nth-child(3) { width: 20%; }.theme-white .data-table th:nth-child(4),
.theme-white .data-table td:nth-child(4) { width: 20%; }.theme-white .data-table th:nth-child(5),
.theme-white .data-table td:nth-child(5) { width: 15%; }.theme-white .data-table th:nth-child(6),
.theme-white .data-table td:nth-child(6) { width: 15%; }.theme-white .type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 22px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
}.theme-white .type-tag.realtime {
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.12);
}.theme-white .type-tag.switch {
  color: var(--color-green);
  background: rgba(82, 196, 26, 0.15);
}.theme-white .type-tag.trigger {
  color: var(--color-red);
  background: rgba(255, 77, 79, 0.15);
}.theme-white /* ------------------- Tabs 深色样式 ------------------- */
:deep(.dark-tabs .ant-tabs-nav) {
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}.theme-white :deep(.dark-tabs .ant-tabs-nav::before) {
  border-bottom: none;
}.theme-white :deep(.dark-tabs .ant-tabs-tab) {
  color: var(--color-muted);
  font-size: 14px;
  padding: 8px 0;
  margin-right: 24px;
}.theme-white :deep(.dark-tabs .ant-tabs-tab:hover) {
  color: var(--color-text);
}.theme-white :deep(.dark-tabs .ant-tabs-tab-active) {
  color: var(--color-primary) !important;
}.theme-white :deep(.dark-tabs .ant-tabs-ink-bar) {
  background: var(--color-primary);
  height: 2px;
}

/* ------------------- 响应式 ------------------- */
@media (max-width: 768px)  {.theme-white .dashboard-grid {
    grid-template-columns: 1fr;
  }.theme-white .full-width {
    grid-column: 1 / -1;
  }.theme-white .page-panel {
    padding: 16px;
  }}
</style>

<!-- ===== 数据采集新增/编辑弹框（addModal.vue .dark-tech-modal）全局覆盖，由本页承载 ===== -->
<style lang="less">
.dark-tech-modal {
  .ant-modal-content {
    background: #141d2b !important;
    border: 1px solid #303d50 !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 162, 232, 0.08) !important;
    overflow: hidden;

    /* 顶部蓝色渐变光条 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00a2e8, transparent);
      opacity: 0.6;
    }
  }

  .ant-modal-header {
    background: #1b2533 !important;
    border-bottom: 1px solid #303d50 !important;
    padding: 18px 24px 14px !important;
    border-radius: 8px 8px 0 0 !important;
  }

  .ant-modal-title {
    color: #ffffff !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    letter-spacing: 0.5px !important;
  }

  .ant-modal-close {
    color: #a0aabf !important;
    top: 18px !important;
    right: 20px !important;
    width: 28px !important;
    height: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
    transition: all 0.2s !important;

    &:hover {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }

  .ant-modal-body {
    padding: 20px 24px 24px !important;
    background: #141d2b !important;
  }

  .ant-modal-footer {
    display: none !important;
  }

  /* ==================== 表单覆盖 ==================== */
  .dark-form {
    .ant-form-item-label > label {
      color: #a0aabf !important;
      font-size: 13px !important;
      font-weight: 400 !important;
    }

    .ant-form-item-label > label.ant-form-item-required::before {
      color: #ff4d4f !important;
    }

    /* Input 外层包裹器（修复白色间隙） */
    .ant-input-affix-wrapper {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #00a2e8 !important;
      }

      &.ant-input-affix-wrapper-focused {
        border-color: #00a2e8 !important;
        box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      /* 内部 input 透明，让 wrapper 背景统一显示 */
      .ant-input {
        background: transparent !important;
        border: none !important;
        color: #ffffff !important;
        font-size: 13px !important;
        height: 34px !important;
        box-shadow: none !important;

        &::placeholder {
          color: #5a6a80 !important;
        }
      }

      .ant-input-clear-icon {
        color: #5a6a80 !important;
        background: transparent !important;

        &:hover {
          color: #a0aabf !important;
        }
      }
    }

    /* 无 allowClear 时的普通 input */
    .ant-input:not(.ant-input-affix-wrapper .ant-input) {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      font-size: 13px !important;
      height: 36px !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #00a2e8 !important;
      }

      &:focus,
      &.ant-input-focused {
        border-color: #00a2e8 !important;
        box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      &::placeholder {
        color: #5a6a80 !important;
      }
    }

    /* Select */
    .ant-select-selector {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      min-height: 36px !important;
      font-size: 13px !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #00a2e8 !important;
      }
    }

    .ant-select-focused .ant-select-selector {
      border-color: #00a2e8 !important;
      box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }

    .ant-select-arrow {
      color: #5a6a80 !important;
    }

    .ant-select-clear {
      color: #5a6a80 !important;
      background: #1b2533 !important;

      &:hover {
        color: #a0aabf !important;
      }
    }

    .ant-select-selection-placeholder {
      color: #5a6a80 !important;
    }

    /* 单选 / 多选 选中文字统一高亮（仅文字色，无背景） */
    .ant-select-selection-item {
      color: #00c6ff !important;
      font-size: 13px !important;
    }

    /* 多选 Tag 专属样式（背景+边框，仅多选模式） */
    .ant-select-multiple .ant-select-selection-item {
      background: rgba(0, 162, 232, 0.12) !important;
      border: 1px solid rgba(0, 162, 232, 0.25) !important;
      color: #00c6ff !important;
      border-radius: 3px !important;
      font-size: 12px !important;

      .ant-select-selection-item-content {
        color: #00c6ff !important;
      }

      .ant-select-selection-item-remove {
        color: #00a2e8 !important;

        &:hover {
          color: #ffffff !important;
        }
      }
    }

    /* 校验 */
    .ant-form-item-explain-error {
      font-size: 12px !important;
      color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-select-selector {
      border-color: #ff4d4f !important;
    }
  }
}

/* ==================== Select 下拉面板（深色，仅本页 addModal 弹层） ==================== */
.ant-select-dropdown.dc-add-popup {
  background: #1b2533 !important;
  border: 1px solid #303d50 !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;

  .ant-select-item {
    color: #c0c8d4 !important;
    font-size: 13px !important;
    min-height: 32px !important;
    line-height: 32px !important;
    transition: background 0.15s !important;

    &:hover {
      background: rgba(0, 162, 232, 0.1) !important;
    }
  }

  .ant-select-item-option-selected {
    background: rgba(0, 162, 232, 0.15) !important;
    color: #00c6ff !important;
    font-weight: 500 !important;
  }

  .ant-select-item-option-active {
    background: rgba(255, 255, 255, 0.04) !important;
  }

  .ant-select-item-empty {
    color: #5a6a80 !important;
  }
}
</style>
