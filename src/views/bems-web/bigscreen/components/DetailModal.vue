<template>
  <a-modal
    v-model:open="visible"
    :title="null"
    :footer="null"
    :closable="false"
    width="70%"
    :bodyStyle="{ padding: 0, overflow: 'hidden' }"
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

          <!-- 接口状态监控列表（物联网弹窗） -->
          <div v-if="modalContent.interfaceStatusList" class="modal-panel" style="margin-bottom: 16px;">
            <div class="modal-panel-title">📡 接口状态监控</div>
            <div class="modal-table-wrap is-scroll">
              <table class="modal-table">
                <thead>
                  <tr>
                    <th>系统名称</th>
                    <th style="width: 120px;">接口协议</th>
                    <th>接口地址</th>
                    <th style="width: 80px;">状态</th>
                    <th style="width: 100px;">响应时间</th>
                    <th style="width: 160px;">最后心跳</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in interfaceStatusData" :key="idx">
                    <td>{{ item.sysName || '--' }}</td>
                    <td>{{ item.protocolTypeName || '--' }}</td>
                    <td style="word-break: break-all;">{{ item.interfacePath || '--' }}</td>
                    <td>
                      <span :style="{ color: getInterfaceStateColor(item.state), fontWeight: 600 }">
                        {{ getInterfaceStateText(item.state) }}
                      </span>
                    </td>
                    <td>{{ item.responseTime != null ? item.responseTime + 'ms' : '-' }}</td>
                    <td>{{ item.requestTime || '--' }}</td>
                  </tr>
                  <tr v-if="interfaceStatusData.length === 0">
                    <td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 双栏内容（物联网弹窗仅展示接口状态列表，隐藏双栏） -->
          <div v-if="!modalContent.interfaceStatusList" class="modal-two-col">
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
                      <template v-if="row[col.key] !== null && typeof row[col.key] === 'object'">
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
              <div v-if="modalContent.rightPanel.type === 'table'" class="modal-table-wrap" :class="{ 'is-scroll': rightTableScrollable }">
                <table class="modal-table">
                  <thead>
                    <tr>
                      <th v-for="(col, i) in rightTableCols" :key="i" :style="col.width ? { width: col.width + 'px' } : {}">{{ col.title }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, ri) in rightTableRows" :key="ri">
                      <td v-for="(col, ci) in rightTableCols" :key="ci">
                        <template v-if="row[col.key] !== null && typeof row[col.key] === 'object'">
                          <span :style="{ color: row[col.key].color, fontWeight: 600 }">{{ row[col.key].text }}</span>
                        </template>
                        <template v-else>{{ row[col.key] }}</template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

          <!-- 趋势柱状图 -->
          <div v-if="modalContent.trend" class="trend-chart-section">
            <div class="modal-panel-title">{{ modalContent.trend.title }}</div>
            <!-- 多系列图例 -->
            <div v-if="modalContent.trend.series && modalContent.trend.series.length > 1" class="trend-legend">
              <span v-for="(s, i) in modalContent.trend.series" :key="i" class="trend-legend-item">
                <i :style="{ background: s.color }"></i>{{ s.name }}
              </span>
            </div>
            <div class="trend-bar-chart">
              <!-- y轴 -->
              <div class="trend-y-axis">
                <span v-for="v in yAxisTicks" :key="v">{{ v }}</span>
              </div>
              <!-- 图表区域 -->
              <div class="trend-chart-area">
                <!-- 网格线 -->
                <div class="trend-grid">
                  <div v-for="(_, i) in yAxisTicks" :key="'g' + i" class="trend-grid-line"></div>
                </div>
                <!-- 分组柱子容器 -->
                <div class="trend-bars-row">
                  <div class="trend-bar-col" v-for="(xl, xi) in modalContent.trend.xAxis" :key="xi">
                    <div class="trend-bar-group">
                      <div class="trend-bar-group-item" v-for="(s, si) in modalContent.trend.series" :key="si">
                        <span class="trend-bar-val">{{ s.values[xi] ?? '' }}</span>
                        <div
                          class="trend-bar-fill multi"
                          :style="{
                            height: trendMaxVal > 0 ? Math.round((s.values[xi] / trendMaxVal) * 100) + '%' : '0%',
                            background: s.color,
                          }"
                        ></div>
                      </div>
                    </div>
                    <span class="trend-bar-xlabel">{{ xl }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="trend-footer">{{ modalContent.trend.footer }}</div> -->
          </div>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ModalContent, ModalTableData, ModalBarData, ModalBarItem } from '../data/modalData';

defineOptions({ name: 'DetailModal' });

const visible = ref(false);
const modalContent = ref<ModalContent | null>(null);
const currentModalKey = ref('');
/** 接口状态监控列表数据（物联网弹窗） */
const interfaceStatusData = ref<any[]>([]);

/** 接口状态文本映射 */
function getInterfaceStateText(state?: number): string {
  switch (state) {
    case 1: return '在线';
    case 0: return '离线';
    case 2: return '异常';
    default: return '--';
  }
}

/** 接口状态颜色映射 */
function getInterfaceStateColor(state?: number): string {
  switch (state) {
    case 1: return '#4ade80';
    case 0: return '#f87171';
    case 2: return '#fb923c';
    default: return '#94a3b8';
  }
}

function getLevelColor(level: string): string {
  const map: Record<string, string> = {
    非常紧急: '#ef4444',
    紧急: '#f97316',
    一般: '#38bdf8',
  };
  return map[level] || '#38bdf8';
}

function open(key: string, data: Record<string, ModalContent>, alarmRecords?: any[], alarmStats?: any, alarmTrend?: any, electricityData?: any, energyStatsData?: any, trendData?: any, venueData?: any) {
  const content = data[key];
  if (content) {
    currentModalKey.value = key;
    // 深拷贝避免修改原始 modalData
    modalContent.value = JSON.parse(JSON.stringify(content));
    // 告警弹窗：用接口统计数据覆盖 stats 和左栏图表
    if (key === 'alarm' && alarmStats) {
      const stats = modalContent.value!.stats;
      if (alarmStats.count != null) stats[0].value = String(alarmStats.count);          // 今日告警
      if (alarmStats.completedCount != null) stats[1].value = String(alarmStats.completedCount); // 已处理
      if (alarmStats.untreatedCount != null) stats[2].value = String(alarmStats.untreatedCount); // 待处理
      if (alarmStats.seriousCount != null) stats[3].value = String(alarmStats.seriousCount);     // 严重告警

      // categoryIdMap → leftPanel.data.items
      if (alarmStats.categoryIdMap && modalContent.value!.leftPanel.type === 'bar') {
        const barData = modalContent.value!.leftPanel.data as ModalBarData;
        const colorList = ['orange', 'blue', 'red', 'purple', 'green'];
        const entries = Object.entries(alarmStats.categoryIdMap) as [string, any][];
        const total = entries.reduce((sum, [, v]) => sum + Number(v), 0);
        barData.items = entries.map(([key, value], idx): ModalBarItem => ({
          label: key,
          color: colorList[idx % colorList.length],
          percent: total > 0 ? Math.round((Number(value) / total) * 100) : 0,
          value: `${value}条`,
        }));
      }

      // averageProcessingTime 覆盖 footer
      const at = alarmStats.averageProcessingTime;
      if (at != null && modalContent.value!.leftPanel.type === 'bar') {
        const barData = modalContent.value!.leftPanel.data as ModalBarData;
        barData.footer = `平均响应时间: ${at}分钟 | 平均处理时间: ${at}分钟`;
      }
    }
    // 节能低碳弹窗：用近7日能耗趋势接口数据渲染柱状图
    else if (key === 'energy' && trendData && modalContent.value?.trend) {
      const colorList = ['#38bdf8', '#fb923c', '#4ade80', '#f87171', '#a78bfa', '#eab308', '#ec4899'];
      // 格式1: { xaxis, chatSeriesList }
      if (trendData.xaxis && trendData.chatSeriesList) {
        const xaxis: string[] = trendData.xaxis;
        const chatSeriesList: any[] = trendData.chatSeriesList;
        const allNums: number[] = [];
        modalContent.value.trend.xAxis = xaxis;
        modalContent.value.trend.series = chatSeriesList.map((s: any, idx: number) => {
          const values: number[] = (s.data || []).map((v: any) => Number(v) || 0);
          allNums.push(...values);
          return { name: s.name || `系列${idx + 1}`, color: colorList[idx % colorList.length], values };
        });
        if (allNums.length > 0) {
          const max = Math.max(...allNums);
          modalContent.value.trend.bars = xaxis.flatMap((xl, xi) =>
            (modalContent.value!.trend?.series ?? []).map((s) => ({
              height: max > 0 ? Math.round(((s.values[xi] ?? 0) / max) * 100) : 0,
              color: s.color,
              label: xl,
              value: s.values[xi] ?? 0,
            })),
          );
        }
      }
      // 格式2: 纯数组 [val1, val2, ...]
      else if (Array.isArray(trendData)) {
        const values: number[] = trendData.map((v: any) => Number(v) || 0);
        const max = Math.max(...values);
        modalContent.value.trend.bars = values.map((v, i) => ({
          height: max > 0 ? Math.round((v / max) * 100) : 0,
          color: colorList[i % colorList.length],
          label: `第${i + 1}天`,
          value: v,
        }));
      }
      // 格式3: { list/records/data: [{ date, value }, ...] }
      else if (trendData.list || trendData.records || trendData.data) {
        const list = trendData.list || trendData.records || trendData.data;
        if (Array.isArray(list) && list.length > 0) {
          const values: number[] = list.map((item: any) => Number(item.value || item.electricity || item.count || 0));
          const labels = list.map((item: any, i: number) => item.date || item.label || item.name || `第${i + 1}天`);
          const max = Math.max(...values, 1);
          modalContent.value.trend.bars = values.map((v, i) => ({
            height: max > 0 ? Math.round((v / max) * 100) : 0,
            color: colorList[i % colorList.length],
            label: labels[i],
            value: v,
          }));
        }
      }
    }
    // 告警弹窗：用接口趋势数据覆盖底部柱状图（xaxis + chatSeriesList）
    if (key === 'alarm' && alarmTrend) {
      const xaxis: string[] = alarmTrend.xaxis ?? alarmTrend.xAxis ?? [];
      const chatSeriesList: any[] = alarmTrend.chatSeriesList ?? [];
      if (xaxis.length > 0 && chatSeriesList.length > 0 && modalContent.value?.trend) {
        const colorList = ['#fb923c', '#38bdf8', '#4ade80', '#f87171', '#a78bfa', '#eab308', '#ec4899'];
        const allNums: number[] = [];
        modalContent.value.trend.xAxis = xaxis;
        modalContent.value.trend.series = chatSeriesList.map((s: any, idx: number) => {
          const values: number[] = (s.data || []).map((v: any) => Number(v) || 0);
          allNums.push(...values);
          return { name: s.name || `系列${idx + 1}`, color: colorList[idx % colorList.length], values };
        });
        // 同步计算 bars 用于 yAxisTicks 等兼容
        if (allNums.length > 0) {
          const max = Math.max(...allNums);
          const flatBars = xaxis.flatMap((xl, xi) =>
            (modalContent.value!.trend?.series ?? []).map((s) => ({
              height: max > 0 ? Math.round(((s.values[xi] ?? 0) / max) * 100) : 0,
              color: s.color,
              label: xl,
              value: s.values[xi] ?? 0,
            })),
          );
          modalContent.value.trend.bars = flatBars;
        }
      }
    }
    // 节能低碳弹窗：用近7日能耗趋势接口数据渲染柱状图
    else if (key === 'energy' && trendData && modalContent.value?.trend) {
      const colorList = ['#38bdf8', '#fb923c', '#4ade80', '#f87171', '#a78bfa', '#eab308', '#ec4899'];
      // 格式1: { xaxis, chatSeriesList }
      if (trendData.xaxis && trendData.chatSeriesList) {
        const xaxis: string[] = trendData.xaxis;
        const chatSeriesList: any[] = trendData.chatSeriesList;
        const allNums: number[] = [];
        modalContent.value.trend.xAxis = xaxis;
        modalContent.value.trend.series = chatSeriesList.map((s: any, idx: number) => {
          const values: number[] = (s.data || []).map((v: any) => Number(v) || 0);
          allNums.push(...values);
          return { name: s.name || `系列${idx + 1}`, color: colorList[idx % colorList.length], values };
        });
        if (allNums.length > 0) {
          const max = Math.max(...allNums);
          modalContent.value.trend.bars = xaxis.flatMap((xl, xi) =>
            (modalContent.value!.trend?.series ?? []).map((s) => ({
              height: max > 0 ? Math.round(((s.values[xi] ?? 0) / max) * 100) : 0,
              color: s.color,
              label: xl,
              value: s.values[xi] ?? 0,
            })),
          );
        }
      }
      // 格式2: 纯数组 [val1, val2, ...]
      else if (Array.isArray(trendData)) {
        const values: number[] = trendData.map((v: any) => Number(v) || 0);
        const max = Math.max(...values);
        modalContent.value.trend.bars = values.map((v, i) => ({
          height: max > 0 ? Math.round((v / max) * 100) : 0,
          color: colorList[i % colorList.length],
          label: `第${i + 1}天`,
          value: v,
        }));
      }
      // 格式3: { list/records/data: [{ date, value }, ...] }
      else if (trendData.list || trendData.records || trendData.data) {
        const list = trendData.list || trendData.records || trendData.data;
        if (Array.isArray(list) && list.length > 0) {
          const values: number[] = list.map((item: any) => Number(item.value || item.electricity || item.count || 0));
          const labels = list.map((item: any, i: number) => item.date || item.label || item.name || `第${i + 1}天`);
          const max = Math.max(...values, 1);
          modalContent.value.trend.bars = values.map((v, i) => ({
            height: max > 0 ? Math.round((v / max) * 100) : 0,
            color: colorList[i % colorList.length],
            label: labels[i],
            value: v,
          }));
        }
      }
    }
    // 告警弹窗：用接口真实数据覆盖右栏表格
    if (alarmRecords && alarmRecords.length > 0 && key === 'alarm' && modalContent.value!.rightPanel.type === 'table') {
      const tableData = modalContent.value!.rightPanel.data as ModalTableData;
      tableData.rows = alarmRecords.map((r: any) => ({
        time: r.alarmTime ? r.alarmTime.split(' ').pop() : '',
        type: r.alarmCategoryName || '',
        location: r.spaceName || '',
        level: { text: r.alarmLevelName || '', color: getLevelColor(r.alarmLevelName) },
      }));
    }
    // 用电量弹窗：能耗统计 → stats 今日用电kWh、环比昨日
    if (key === 'kpiPower' && energyStatsData) {
      const stats = modalContent.value!.stats;
      if (energyStatsData.electricCount != null) stats[0].value = String(energyStatsData.electricCount);
      if (energyStatsData.electricCountDoD != null) stats[1].value = String(energyStatsData.electricCountDoD);
    }
    // 用电量弹窗：用电分时数据 → leftPanel 各时段用电分布表格
    if (key === 'kpiPower' && electricityData && electricityData.length > 0 && modalContent.value!.leftPanel.type === 'table') {
      const tableData = modalContent.value!.leftPanel.data as ModalTableData;
      tableData.rows = electricityData.map((item: any) => ({
        timePeriod: item.timePeriod ?? '',
        electricity: item.electricity ?? '',
        proportion: item.proportion ?? '',
        moM: typeof item.moM === 'object' ? item.moM : { text: item.moM ?? '', color: '' },
      }));
    }
    // 用电量弹窗：各场馆用电数据 → rightPanel 各场馆用电对比表格
    if (key === 'kpiPower' && venueData && venueData.length > 0 && modalContent.value!.rightPanel.type === 'table') {
      const tableData = modalContent.value!.rightPanel.data as ModalTableData;
      tableData.rows = venueData.map((item: any) => ({
        name: item.name ?? '',
        electricity: item.electricity ?? '',
        electricityProportion: item.electricityProportion ?? '',
        electricityMoM: typeof item.electricityMoM === 'object' ? item.electricityMoM : { text: item.electricityMoM ?? '', color: '' },
      }));
    }
    // 节能低碳/用电量弹窗：用近7日能耗趋势接口数据渲染柱状图
    if ((key === 'energy' || key === 'kpiPower') && trendData && modalContent.value?.trend) {
      const colorList = ['#38bdf8', '#fb923c', '#4ade80', '#f87171', '#a78bfa', '#eab308', '#ec4899'];
      // 格式1: { xaxis, chatSeriesList }
      if (trendData.xaxis && trendData.chatSeriesList) {
        const xaxis: string[] = trendData.xaxis;
        const chatSeriesList: any[] = trendData.chatSeriesList;
        const allNums: number[] = [];
        modalContent.value.trend.xAxis = xaxis;
        modalContent.value.trend.series = chatSeriesList.map((s: any, idx: number) => {
          const values: number[] = (s.data || []).map((v: any) => Number(v) || 0);
          allNums.push(...values);
          return { name: s.name || `系列${idx + 1}`, color: colorList[idx % colorList.length], values };
        });
        if (allNums.length > 0) {
          const max = Math.max(...allNums);
          modalContent.value.trend.bars = xaxis.flatMap((xl, xi) =>
            (modalContent.value!.trend?.series ?? []).map((s) => ({
              height: max > 0 ? Math.round(((s.values[xi] ?? 0) / max) * 100) : 0,
              color: s.color,
              label: xl,
              value: s.values[xi] ?? 0,
            })),
          );
        }
      }
      // 格式2: 纯数组 [val1, val2, ...]
      else if (Array.isArray(trendData)) {
        const values: number[] = trendData.map((v: any) => Number(v) || 0);
        const max = Math.max(...values);
        modalContent.value.trend.bars = values.map((v, i) => ({
          height: max > 0 ? Math.round((v / max) * 100) : 0,
          color: colorList[i % colorList.length],
          label: `第${i + 1}天`,
          value: v,
        }));
      }
      // 格式3: { list/records/data: [{ date, value }, ...] }
      else if (trendData.list || trendData.records || trendData.data) {
        const list = trendData.list || trendData.records || trendData.data;
        if (Array.isArray(list) && list.length > 0) {
          const values: number[] = list.map((item: any) => Number(item.value || item.electricity || item.count || 0));
          const labels = list.map((item: any, i: number) => item.date || item.label || item.name || `第${i + 1}天`);
          const max = Math.max(...values, 1);
          modalContent.value.trend.bars = values.map((v, i) => ({
            height: max > 0 ? Math.round((v / max) * 100) : 0,
            color: colorList[i % colorList.length],
            label: labels[i],
            value: v,
          }));
        }
      }
    }
    // 深拷贝触发 Vue 响应式，确保所有嵌套引用变更，computed 重新计算
    modalContent.value = JSON.parse(JSON.stringify(modalContent.value!)) as ModalContent;
    // 物联网弹窗：从 modalContent 读取接口状态监控列表数据
    if (key === 'iot' && (modalContent.value as any)._interfaceList) {
      interfaceStatusData.value = (modalContent.value as any)._interfaceList;
    }
    visible.value = true;
  }
}

function handleClose() {
  visible.value = false;
  modalContent.value = null;
  currentModalKey.value = '';
  interfaceStatusData.value = [];
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

/** 右栏表格是否需要滚动（会展服务弹窗停车场状态表格） */
const rightTableScrollable = computed(() => currentModalKey.value === 'exhibition');

/** y轴刻度（最大值的 0%/25%/50%/75%/100%） */
const yAxisTicks = computed(() => {
  const max = trendMaxVal.value;
  if (max === 0) return ['0', '', '', '', '0'];
  return [String(max), String(Math.round(max * 0.75)), String(Math.round(max * 0.5)), String(Math.round(max * 0.25)), '0'];
});

/** 趋势图所有系列中的最大值 */
const trendMaxVal = computed(() => {
  const series = modalContent.value?.trend?.series;
  if (!series || series.length === 0) return 0;
  return Math.max(...series.flatMap((s) => s.values));
});
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
  max-height: 80vh;
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.modal-body::-webkit-scrollbar { display: none; } /* Chrome/Safari/Edge */

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
  font-size:14px;
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
  display: flex;
  flex-direction: column;
}
.modal-panel-title {
  font-size:16px;
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
  font-size:16px;
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

/* 表格滚动容器 */
.modal-table-wrap {
  width: 100%;
}
.modal-table-wrap.is-scroll {
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(56, 189, 248, 0.3) transparent;
}
.modal-table-wrap.is-scroll::-webkit-scrollbar {
  width: 4px;
}
.modal-table-wrap.is-scroll::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.3);
  border-radius: 2px;
}
.modal-table-wrap.is-scroll::-webkit-scrollbar-track {
  background: transparent;
}
/* 滚动模式下表头固定 */
.modal-table-wrap.is-scroll .modal-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(8, 20, 40);
}

/* 自定义横向条形图 */
.modal-hbar {
  margin: 6px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  justify-content: center;
}
.modal-hbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size:16px;
}
.modal-hbar-label {
  width: 80px;
  color: #94a3b8;
  text-align: right;
  flex-shrink: 0;
}
.modal-hbar-track {
  flex: 1;
  height: 20px;
  background: rgba(148, 163, 184, 0.06);
  border-radius: 4px;
  overflow: hidden;
}
.modal-hbar-fill {
  height: 100%;
  border-radius: 4px;
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
  font-size:14px;
  flex-shrink: 0;
}
.modal-hbar-footer {
  margin-top: 12px;
  font-size:14px;
  color: #94a3b8;
}

/* ===== 趋势柱状图 ===== */
.trend-chart-section {
  margin-top: 16px;
  background: rgba(8, 20, 40, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 6px;
  padding: 14px;
}
/* 多系列图例 */
.trend-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 8px 0 0;
}
.trend-legend-item {
  font-size:13px;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 5px;
}
.trend-legend-item i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}
.trend-bar-chart {
  display: flex;
  height: 180px;
  margin-top: 8px;
}
.trend-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40px;
  flex-shrink: 0;
  padding-right: 6px;
}
.trend-y-axis span {
  font-size: 10px;
  color: #64748b;
  text-align: right;
  line-height: 1;
}
.trend-chart-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}
.trend-grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.trend-grid-line {
  height: 0;
  border-bottom: 1px dashed rgba(56, 189, 248, 0.08);
}
.trend-bars-row {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  position: relative;
  z-index: 1;
  padding-bottom: 22px;
}
.trend-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  position: relative;
  flex: 1;
}
/* 分组柱内联 */
.trend-bar-group {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 100%;
}
.trend-bar-group-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}
.trend-bar-val {
  font-size: 10px;
  color: #e2e8f0;
  font-weight: 600;
  margin-bottom: 3px;
  font-family: 'DIN Alternate', 'Arial Black', sans-serif;
  flex-shrink: 0;
}
.trend-bar-fill {
  width: 16px;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 0.6s ease;
  flex-shrink: 0;
}
.trend-bar-fill.multi {
  width: 12px;
}
.trend-bar-xlabel {
  font-size: 10px;
  color: #94a3b8;
  position: absolute;
  bottom: 0;
  white-space: nowrap;
  transform: translateY(100%);
  padding-top: 4px;
}
.trend-footer {
  margin-top: 8px;
  font-size:14px;
  color: #64748b;
  text-align: center;
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
