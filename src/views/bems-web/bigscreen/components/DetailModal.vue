<template>
  <a-modal
    v-model:open="visible"
    :title="null"
    :footer="null"
    :closable="false"
    width="1100px"
    :bodyStyle="{ padding: 0, maxHeight: '720px', overflow: 'hidden' }"
    wrapClassName="bigscreen-modal"
    @cancel="handleClose"
  >
    <template v-if="modalContent">
      <div class="modal-box" :style="{ '--modal-accent': modalContent.accent }">
        <!-- 顶部装饰条 -->
        <div class="modal-box-top-bar"></div>
        <!-- 头部 -->
        <div class="modal-header">
          <div class="modal-title" :style="{ color: modalContent.accent }">{{ modalContent.title }}</div>
          <button class="modal-close" @click="handleClose">✕</button>
        </div>
        <!-- 内容区 -->
        <div class="modal-body">
          <!-- 统计卡片 -->
          <div class="modal-stats">
            <div class="modal-stat-card" v-for="(stat, i) in modalContent.stats" :key="i">
              <div class="modal-stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
              <div class="modal-stat-label">{{ stat.label }}</div>
            </div>
          </div>

          <!-- 双栏内容 -->
          <div class="modal-two-col">
            <!-- 左栏 -->
            <div class="modal-panel">
              <div class="modal-panel-title">{{ leftPanelData.title }}</div>
              <!-- 表格类型 -->
              <table v-if="modalContent.leftPanel.type === 'table'" class="modal-table">
                <thead>
                  <tr>
                    <th v-for="(col, i) in leftTableCols" :key="i" :style="col.width ? { width: col.width + 'px' } : {}">{{ col.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in leftTableRows" :key="ri">
                    <td v-for="(col, ci) in leftTableCols" :key="ci">
                      <template v-if="typeof row[col.key] === 'object'">
                        <span :style="{ color: row[col.key].color, fontWeight: 600 }">{{ row[col.key].text }}</span>
                      </template>
                      <template v-else>{{ row[col.key] }}</template>
                    </td>
                  </tr>
                </tbody>
              </table>
              <!-- 条形图类型 -->
              <div v-else class="modal-hbar">
                <div class="modal-hbar-item" v-for="(bar, i) in leftBarItems" :key="i">
                  <span class="modal-hbar-label">{{ bar.label }}</span>
                  <div class="modal-hbar-track">
                    <div class="modal-hbar-fill" :class="bar.color" :style="{ width: bar.percent + '%' }"></div>
                  </div>
                  <span class="modal-hbar-value">{{ bar.value }}</span>
                </div>
                <div v-if="leftBarFooter" class="modal-hbar-footer">{{ leftBarFooter }}</div>
              </div>
            </div>

            <!-- 右栏 -->
            <div class="modal-panel">
              <div class="modal-panel-title">{{ rightPanelData.title }}</div>
              <table v-if="modalContent.rightPanel.type === 'table'" class="modal-table">
                <thead>
                  <tr>
                    <th v-for="(col, i) in rightTableCols" :key="i" :style="col.width ? { width: col.width + 'px' } : {}">{{ col.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in rightTableRows" :key="ri">
                    <td v-for="(col, ci) in rightTableCols" :key="ci">
                      <template v-if="typeof row[col.key] === 'object'">
                        <span :style="{ color: row[col.key].color, fontWeight: 600 }">{{ row[col.key].text }}</span>
                      </template>
                      <template v-else>{{ row[col.key] }}</template>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="modal-hbar">
                <div class="modal-hbar-item" v-for="(bar, i) in rightBarItems" :key="i">
                  <span class="modal-hbar-label">{{ bar.label }}</span>
                  <div class="modal-hbar-track">
                    <div class="modal-hbar-fill" :class="bar.color" :style="{ width: bar.percent + '%' }"></div>
                  </div>
                  <span class="modal-hbar-value">{{ bar.value }}</span>
                </div>
                <div v-if="rightBarFooter" class="modal-hbar-footer">{{ rightBarFooter }}</div>
              </div>
            </div>
          </div>

          <!-- 额外表格 -->
          <div v-if="modalContent.extraTable" style="margin-top: 16px;">
            <div class="modal-panel-title">{{ modalContent.extraTable.title }}</div>
            <table class="modal-table">
              <thead>
                <tr>
                  <th v-for="(col, i) in extraTableCols" :key="i" :style="col.width ? { width: col.width + 'px' } : {}">{{ col.title }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ri) in modalContent.extraTable.rows" :key="ri">
                  <td v-for="(col, ci) in extraTableCols" :key="ci">
                    <template v-if="typeof row[col.key] === 'object'">
                      <span :style="{ color: row[col.key].color, fontWeight: 600 }">{{ row[col.key].text }}</span>
                    </template>
                    <template v-else>{{ row[col.key] }}</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 趋势图 -->
          <div v-if="modalContent.trend" style="margin-top: 16px;">
            <div class="modal-panel-title">{{ modalContent.trend.title }}</div>
            <div class="modal-chart">
              <div class="mini-chart">
                <div
                  v-for="(bar, i) in modalContent.trend.bars"
                  :key="i"
                  class="bar"
                  :style="{ height: bar.height + '%', '--bar-color': bar.color }"
                ></div>
              </div>
              <span class="chart-footer">{{ modalContent.trend.footer }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ModalContent, ModalTableData, ModalBarData } from '../data/modalData';

defineOptions({ name: 'DetailModal' });

const visible = ref(false);
const modalContent = ref<ModalContent | null>(null);

function open(key: string, data: Record<string, ModalContent>) {
  const content = data[key];
  if (content) {
    modalContent.value = content;
    visible.value = true;
  }
}

function handleClose() {
  visible.value = false;
  modalContent.value = null;
}

defineExpose({ open });

// ===== computed =====
const leftPanelData = computed(() => modalContent.value?.leftPanel.data as ModalTableData | ModalBarData | undefined);
const rightPanelData = computed(() => modalContent.value?.rightPanel.data as ModalTableData | ModalBarData | undefined);

const leftTableCols = computed(() => (leftPanelData.value as ModalTableData)?.columns || []);
const leftTableRows = computed(() => (leftPanelData.value as ModalTableData)?.rows || []);
const leftBarItems = computed(() => (leftPanelData.value as ModalBarData)?.items || []);
const leftBarFooter = computed(() => (leftPanelData.value as ModalBarData)?.footer);

const rightTableCols = computed(() => (rightPanelData.value as ModalTableData)?.columns || []);
const rightTableRows = computed(() => (rightPanelData.value as ModalTableData)?.rows || []);
const rightBarItems = computed(() => (rightPanelData.value as ModalBarData)?.items || []);
const rightBarFooter = computed(() => (rightPanelData.value as ModalBarData)?.footer);

const extraTableCols = computed(() => modalContent.value?.extraTable?.columns || []);
</script>

<style scoped>
.modal-box {
  background: linear-gradient(135deg, rgba(10, 25, 50, 0.95) 0%, rgba(5, 15, 35, 0.98) 100%);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-box-top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--modal-accent, #38bdf8), transparent);
  z-index: 3;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(8, 20, 40, 0.6);
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.modal-close:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.3);
  color: #f87171;
}
.modal-body {
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
  position: relative;
  z-index: 2;
}
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.15); border-radius: 2px; }

/* 统计卡片 */
.modal-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.modal-stat-card {
  background: rgba(15, 35, 65, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 6px;
  padding: 14px;
  text-align: center;
}
.modal-stat-value {
  font-size: 24px;
  font-weight: 800;
  font-family: 'DIN Alternate', 'Arial Black', sans-serif;
  color: #f1f5f9;
}
.modal-stat-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

/* 双栏布局 */
.modal-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.modal-panel {
  background: rgba(8, 20, 40, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 6px;
  padding: 14px;
}
.modal-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #38bdf8;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
}

/* 自定义表格 */
.modal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.modal-table th {
  color: #64748b;
  font-weight: 500;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  background: rgba(8, 20, 40, 0.4);
}
.modal-table td {
  padding: 8px 12px;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
}
.modal-table tr:hover td {
  background: rgba(56, 189, 248, 0.04);
}

/* 自定义横向条形图 */
.modal-hbar {
  margin: 6px 0;
}
.modal-hbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}
.modal-hbar-label {
  width: 80px;
  color: #94a3b8;
  text-align: right;
  flex-shrink: 0;
}
.modal-hbar-track {
  flex: 1;
  height: 16px;
  background: rgba(148, 163, 184, 0.06);
  border-radius: 3px;
  overflow: hidden;
}
.modal-hbar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}
.modal-hbar-fill.blue { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
.modal-hbar-fill.green { background: linear-gradient(90deg, #16a34a, #4ade80); }
.modal-hbar-fill.orange { background: linear-gradient(90deg, #ea580c, #fb923c); }
.modal-hbar-fill.purple { background: linear-gradient(90deg, #7c3aed, #c084fc); }
.modal-hbar-fill.red { background: linear-gradient(90deg, #dc2626, #f87171); }
.modal-hbar-value {
  width: 50px;
  color: #e2e8f0;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}
.modal-hbar-footer {
  margin-top: 12px;
  font-size: 12px;
  color: #94a3b8;
}

/* 趋势图 */
.modal-chart {
  height: 160px;
  background: rgba(56, 189, 248, 0.02);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
}
.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 80px;
}
.mini-chart .bar {
  width: 12px;
  background: linear-gradient(180deg, var(--bar-color, #38bdf8), rgba(56, 189, 248, 0.15));
  border-radius: 2px 2px 0 0;
  transition: height 0.8s ease;
}
.chart-footer {
  font-size: 12px;
  color: #64748b;
}
</style>

<style>
/* a-modal 容器暗色化 */
.bigscreen-modal .ant-modal {
  top: 50px;
}
.bigscreen-modal .ant-modal-content {
  background: transparent !important;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5) !important;
  padding: 0 !important;
  overflow: hidden !important;
}
.bigscreen-modal .ant-modal-close {
  display: none;
}
.bigscreen-modal .ant-modal-mask {
  background: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(4px);
}
</style>
