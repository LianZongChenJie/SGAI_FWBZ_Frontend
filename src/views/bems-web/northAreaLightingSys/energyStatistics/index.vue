<template>
  <div class="energy-statistics" :class="themeClass">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <a-radio-group v-model:value="statType" class="stat-type">
        <a-radio value="area">按区域</a-radio>
        <a-radio value="box">按箱子</a-radio>
      </a-radio-group>
    </div>

    <!-- 图表区：能耗排名 + 占比 -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-title">
          <span class="title-bar"></span>
          能耗排名（今日 kWh，降序 Top15）
        </div>
        <div ref="rankChartRef" class="chart-box rank-chart"></div>
      </div>
      <div class="chart-card">
        <div class="card-title">
          <span class="title-bar"></span>
          占比（Top5 + 其他）
        </div>
        <div ref="pieChartRef" class="chart-box pie-chart"></div>
      </div>
    </div>

    <!-- Top5 逐时趋势对比 -->
    <div class="chart-card">
      <div class="card-title">
        <span class="title-bar"></span>
        Top5 逐时趋势对比（kW）
      </div>
      <div ref="trendChartRef" class="chart-box trend-chart"></div>
    </div>

    <!-- 汇总表 / 箱子遥测 / 区间查询 -->
    <div class="chart-card">
      <a-tabs v-model:activeKey="summaryTab" class="summary-tabs">
        <a-tab-pane key="summary" tab="汇总表">
          <div class="card-title">
            <span class="title-bar"></span>
            <!-- 汇总表 -->
            <span class="title-tip">（仅展示网关维度数据）</span>
          </div>
          <!-- 查询条件 -->
          <div class="range-filter-bar">
            <div class="filter-item">
              <span class="filter-label">区域</span>
              <a-select
                v-model:value="summaryFilters.areaName"
                placeholder="全部区域"
                :options="summaryAreaOptions"
                allowClear
                show-search
                option-filter-prop="label"
                style="width: 180px"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">箱子名称</span>
              <a-input
                v-model:value="summaryFilters.boxName"
                placeholder="请输入箱子名称"
                allowClear
                style="width: 200px"
              />
            </div>
            <a-button type="primary" @click="onSummaryQuery">查询</a-button>
            <a-button @click="onSummaryReset">重置</a-button>
            <a-button @click="onExportSummary">导出数据</a-button>
          </div>
          <a-table
            :columns="summaryColumns"
            :data-source="filteredSummaryData"
            row-key="key"
            :pagination="false"
            :loading="summaryLoading"
            class="summary-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'installed'">
                {{ record.installed.toFixed(1) }}
              </template>
              <template v-else-if="column.key === 'today'">
                {{ record.today.toFixed(1) }}
              </template>
              <template v-else-if="column.key === 'month'">
                {{ record.month.toFixed(1) }}
              </template>
              <template v-else-if="column.key === 'ratio'">
                <span :class="['ratio-text', record.ratio !== '0.0%' ? 'has-children' : '']">
                  {{ record.ratio }}
                </span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 箱子遥测（与汇总表、区间查询并列） -->
        <a-tab-pane key="boxTelemetry" tab="箱子遥测">
          <div class="card-title">
            <span class="title-bar"></span>
            <span class="title-tip">（来自MQ推送 DataType=7：交流电压/电流/功率/电量）</span>
          </div>
          <!-- 查询条件 -->
          <div class="range-filter-bar">
            <div class="filter-item">
              <span class="filter-label">区域</span>
              <a-select
                v-model:value="boxFilters.districtId"
                placeholder="全部片区"
                :options="boxDistrictOptions"
                allowClear
                show-search
                option-filter-prop="label"
                style="width: 180px"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">箱子名称</span>
              <a-input
                v-model:value="boxFilters.boxName"
                placeholder="请输入区域名称"
                allowClear
                style="width: 200px"
              />
            </div>
            <a-button type="primary" @click="onBoxQuery">查询</a-button>
            <a-button @click="onBoxReset">重置</a-button>
            <a-button @click="onExportBox">导出数据</a-button>
          </div>
          <a-table
            :columns="boxColumns"
            :data-source="filteredBoxData"
            row-key="id"
            :loading="boxLoading"
            :pagination="false"
            class="summary-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'voltage'">
                A:{{ fmtNum(record.voltageA) }} B:{{ fmtNum(record.voltageB) }} C:{{ fmtNum(record.voltageC) }} V
              </template>
              <template v-else-if="column.key === 'current'">
                A:{{ fmtNum(record.currentA) }} B:{{ fmtNum(record.currentB) }} C:{{ fmtNum(record.currentC) }} A
              </template>
              <template v-else-if="column.key === 'power'">
                有功:{{ fmtNum(record.activePower) }}kW
                无功:{{ fmtNum(record.reactivePower) }}kVar
                现在:{{ fmtNum(record.apparentPower) }}kVA
                功率因数:{{ fmtNum(record.powerFactor) }}
              </template>
              <template v-else-if="column.key === 'collectTime'">
                {{ record.collectTime ? formatTime(record.collectTime) : '-' }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" @click="openBoxDetail(record)">详情</a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="range" tab="区间查询">
          <!-- 顶部查询条件 -->
          <div class="range-filter-bar">
            <div class="filter-item">
              <span class="filter-label">区域</span>
              <a-select
                v-model:value="rangeFilters.districtId"
                placeholder="全部区域"
                :options="regionOptions"
                allowClear
                style="width: 130px"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">箱子名称</span>
              <a-input
                v-model:value="rangeFilters.gateway"
                placeholder="请输入区域名称"
                allowClear
                style="width: 150px"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">开始时间</span>
              <a-date-picker
                v-model:value="rangeFilters.startTime"
                placeholder="开始时间"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                style="width: 160px"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">结束时间</span>
              <a-date-picker
                v-model:value="rangeFilters.endTime"
                placeholder="结束时间"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                style="width: 160px"
              />
            </div>
            <a-button type="primary" @click="onRangeQuery">查询</a-button>
            <a-button @click="onRangeReset">重置</a-button>
            <a-button @click="onExportRange">导出数据</a-button>
          </div>

          <!-- 表格 -->
          <a-table
            :columns="rangeColumns"
            :data-source="filteredRangeData"
            row-key="key"
            :pagination="false"
            :loading="rangeLoading"
            class="summary-table"
          />
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 箱子遥测详情弹窗 -->
    <a-modal
      v-model:open="boxDetailVisible"
      title="箱子详情"
      :footer="null"
      width="1100px"
      :destroyOnClose="true"
      :maskClosable="false"
      wrapClassName="box-telemetry-modal"
      :getContainer="false"
      @cancel="closeBoxDetail"
    >
      <!-- 标题 -->
      <section class="modal-title">
        <div class="title-left">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div class="title-text">
            <span class="title-label">箱子详情</span>
            <span class="title-value">{{ boxDetailRecord?.areaName || boxDetailRecord?.gatewayCode || '' }}</span>
          </div>
        </div>
        <div class="title-actions"></div>
      </section>

      <!-- 时间范围 -->
      <div class="modal-tip">
        <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="tip-text">查询时间范围</span>
        <a-date-picker
          v-model:value="boxDetailStartTime"
          placeholder="开始时间"
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          class="time-input"
        />
        <span class="tip-sep">~</span>
        <a-date-picker
          v-model:value="boxDetailEndTime"
          placeholder="结束时间"
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          class="time-input"
        />
        <button class="btn btn-primary query-btn" @click="loadBoxDetailHistory">查询</button>
        <a-radio-group v-model:value="boxDetailChartType" size="small" class="chart-type-radio">
          <a-radio-button value="table">表格</a-radio-button>
          <a-radio-button value="line">折线</a-radio-button>
          <a-radio-button value="bar">柱状</a-radio-button>
        </a-radio-group>
      </div>

      <!-- 属性多页签 + 表格/图表 -->
      <section class="table-container">
        <a-tabs
          v-model:activeKey="boxDetailField"
          type="card"
          size="small"
          :popupClassName="themeClass === 'theme-black' ? 'box-tabs-dropdown-black' : 'box-tabs-dropdown-white'"
        >
          <a-tab-pane v-for="f in BOX_FIELDS" :key="f.key" :tab="`${f.label}(${f.unit})`">
            <!-- 表格视图：按当前属性显示 -->
            <div v-if="boxDetailChartType === 'table'" class="detail-table-wrap" v-loading="boxDetailLoading">
              <table class="device-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>采集时间</th>
                    <th>采集值({{ f.unit }})</th>
                  </tr>
                </thead>
              </table>
              <div class="table-scroll">
                <table class="device-table">
                  <tbody>
                    <tr v-for="(item, idx) in boxDetailHistory" :key="item.id">
                      <td>{{ idx + 1 }}</td>
                      <td>{{ formatTime(item.collectTime) }}</td>
                      <td>{{ item[f.key] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>

        <!-- 图表视图（折线/柱状）：独立固定容器，渲染当前激活属性 -->
        <div
          v-if="boxDetailChartType !== 'table'"
          ref="boxDetailChartRef"
          style="width: 100%; height: 400px; margin-top: 12px;"
        ></div>
      </section>

      <!-- 底部操作按钮 -->
      <div class="modal-footer">
        <span class="total-count">共 <b class="count-num">{{ boxDetailHistory.length }}</b> 条</span>
        <div class="footer-actions">
          <a-button class="btn-cancel" @click="closeBoxDetail">取消</a-button>
          <a-button class="btn-confirm" type="primary" @click="closeBoxDetail">确定</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';
import { UploadOutlined, CaretRightFilled, CaretDownFilled } from '@ant-design/icons-vue';
import {
  getEnergyRanking,
  getEnergyProportion,
  getEnergyHourlyTrend,
  getEnergySummaryList,
  getBoxTelemetryList,
  getBoxTelemetryHistory,
  getEnergyMeterReads,
} from '@/api/equipmentMonitoring';
import { getAllDistrictTag } from '@/api/baseSettingBqZm';
import { exportExcel } from '/@/utils/export';

/* ============================ 顶部工具栏 ============================ */
const statType = ref('area'); // area: 按区域 / box: 按箱子

/* ============================ 汇总表 / 区间查询 Tabs ============================ */
const summaryTab = ref('summary'); // summary: 汇总表 / range: 区间查询

/* ============================ 区间查询 ============================ */
interface RangeFilter {
  /** 区域标签 id */
  districtId?: string;
  /** 网关编号 */
  gateway?: string;
  /** 开始时间 yyyy-MM-dd HH:mm:ss */
  startTime?: string;
  /** 结束时间 yyyy-MM-dd HH:mm:ss */
  endTime?: string;
}

const rangeFilters = ref<RangeFilter>({});

/** 区域下拉选项（与基础设置-全部区域一致：value 为标签 id，label 为区域名） */
const regionOptions = ref<{ label: string; value: string }[]>([]);

/** 获取区域下拉选项 */
const loadRegionOptions = async () => {
  try {
    const res = await getAllDistrictTag('1');
    const list = Array.isArray(res) ? res : (res?.records ?? []);
    regionOptions.value = list.map((item: { id: string; districtName: string }) => ({
      label: item.districtName,
      value: String(item.id),
    }));
    buildSummaryAreaOptions();
  } catch (err) {
    console.error('获取区域选项失败：', err);
  }
};

/** 区间查询表列 */
const rangeColumns = [
  { title: '区域', key: 'region', dataIndex: 'region', align: 'center' as const },
  { title: '箱子名称', key: 'boxName', dataIndex: 'boxName', align: 'center' as const },
  { title: '开始时间', key: 'startTime', dataIndex: 'startTime', align: 'center' as const },
  { title: '开始表底', key: 'startReading', dataIndex: 'startReading', align: 'center' as const },
  { title: '结束时间', key: 'endTime', dataIndex: 'endTime', align: 'center' as const },
  { title: '结束表底', key: 'endReading', dataIndex: 'endReading', align: 'center' as const },
  { title: '累计用电量(kWh)', key: 'totalKwh', dataIndex: 'totalKwh', align: 'center' as const },
];

/** 区间查询结果（默认空，由初始化/查询动作触发） */
const rangeData = ref<any[]>([]);

/** 区间查询前端过滤后的数据（区域选择 / 箱子名称输入时实时过滤） */
const filteredRangeData = computed(() => {
  let list = rangeData.value;
  const districtId = rangeFilters.value.districtId;
  if (districtId) {
    const name = regionNameMap.value[String(districtId)];
    if (name) list = list.filter((r) => r.region === name);
  }
  const gateway = rangeFilters.value.gateway?.trim();
  if (gateway) list = list.filter((r) => r.boxName.includes(gateway));
  return list;
});

/** 区间查询表格加载状态 */
const rangeLoading = ref(false);

/** 表底抄表记录字段归一化（兼容不同返回字段名） */
const mapRangeRow = (it: any, idx: number): any => {
  return {
    key: idx,
    region: it.districtName ?? it.region ?? it.areaName ?? it.name ?? '-',
    boxName: it.boxName ?? it.meterName ?? it.deviceName ?? it.boxNo ?? it.meterNo ?? '-',
    startTime: it.startTime ?? it.beginTime ?? it.readStartTime ?? '-',
    startReading: it.startReading ?? it.beginReading ?? it.startMeterRead ?? it.startMeterValue ?? 0,
    endTime: it.endTime ?? it.finishTime ?? it.readEndTime ?? '-',
    endReading: it.endReading ?? it.finishReading ?? it.endMeterRead ?? it.endMeterValue ?? 0,
    totalKwh: it.totalKwh ?? it.energy ?? it.consumeEnergy ?? it.kwh ?? it.totalEnergy ?? 0,
  };
};

/** 拉取区间查询（表底抄表记录）数据 */
const loadMeterReads = async (params?: Record<string, any>) => {
  rangeLoading.value = true;
  try {
    const res = await getEnergyMeterReads(params ?? {});
    const list = Array.isArray(res) ? res : res?.records ?? res?.list ?? res?.rows ?? [];
    rangeData.value = list.map((it: any, idx: number) => mapRangeRow(it, idx));
  } catch (err) {
    console.error('区间查询加载失败：', err);
  } finally {
    rangeLoading.value = false;
  }
};

const onRangeQuery = () => {
  loadMeterReads({ ...rangeFilters.value });
};

const onRangeReset = () => {
  rangeFilters.value = {};
  rangeData.value = [];
};

/** 导出区间查询表格数据为 Excel（导出当前过滤后的数据，与表格显示一致） */
const onExportRange = () => {
  if (!filteredRangeData.value.length) {
    // eslint-disable-next-line no-alert
    alert('暂无可导出的数据');
    return;
  }
  const rows = filteredRangeData.value.map((row, idx) => ({
    index: idx + 1,
    region: row.region,
    boxName: row.boxName,
    startTime: row.startTime,
    startReading: row.startReading,
    endTime: row.endTime,
    endReading: row.endReading,
    totalKwh: row.totalKwh,
  }));
  exportExcel({
    tableData: rows,
    fileName: '区间查询数据',
    headers: [
      { key: 'index', title: '序号' },
      { key: 'region', title: '区域' },
      { key: 'boxName', title: '箱子名称' },
      { key: 'startTime', title: '开始时间' },
      { key: 'startReading', title: '开始表底' },
      { key: 'endTime', title: '结束时间' },
      { key: 'endReading', title: '结束表底' },
      { key: 'totalKwh', title: '累计用电量(kWh)' },
    ],
  });
};

/** 上传能耗 Excel（真实场景替换为 defHttp.uploadFile 接口） */
const handleUpload = (file: File) => {
  message.success(`文件「${file.name}」上传成功，能耗数据已更新`);
  return false; // 阻止默认上传行为
};

/* ============================ 能耗排名（横向柱状图） ============================ */
interface RankItem {
  name: string;
  value: number;
}

/** 按区域维度：今日 kWh 降序 Top15 */
const rankAreaData: RankItem[] = [
  { name: '服贸会项目 / 待确认映射', value: 849.3 },
  { name: '三高炉项目 / 本体', value: 624.4 },
  { name: '冬训中心项目 / 冰球馆', value: 619.2 },
  { name: '三高炉项目 / 秀池木栈道', value: 575.7 },
  { name: '制氧南项目 / 赛道', value: 380.4 },
  { name: '冬训中心项目 / 速滑馆', value: 352.8 },
  { name: '服贸会项目 / 展馆A区', value: 331.5 },
  { name: '脱硫车间项目 / 主车间', value: 298.6 },
  { name: '金安桥项目 / 桥面', value: 275.4 },
  { name: '制氧南项目 / 冷却塔', value: 258.3 },
  { name: '三高炉项目 / 高炉广场', value: 244.9 },
  { name: '冬训中心项目 / 冰壶馆', value: 231.7 },
  { name: '服贸会项目 / 展馆B区', value: 220.5 },
  { name: '一高炉项目 / 炉体', value: 212.4 },
  { name: '脱硫车间项目 / 群明湖北侧', value: 206.9 },
];

/** 当前展示的排名数据（接口数据加载成功后覆盖 mock） */
const rankArea = ref<RankItem[]>(rankAreaData);

/** 按箱子维度：今日 kWh 降序 Top15 */
const rankBoxData: RankItem[] = [
  { name: '服贸会项目 / 待确认映射 / 箱A', value: 320.5 },
  { name: '三高炉项目 / 本体 / 1号箱', value: 298.2 },
  { name: '冬训中心项目 / 冰球馆 / 箱A', value: 286.4 },
  { name: '服贸会项目 / 待确认映射 / 箱B', value: 275.8 },
  { name: '三高炉项目 / 本体 / 2号箱', value: 254.1 },
  { name: '三高炉项目 / 秀池木栈道 / 栈道南', value: 232.6 },
  { name: '冬训中心项目 / 冰球馆 / 箱B', value: 218.9 },
  { name: '制氧南项目 / 赛道 / 箱A', value: 205.3 },
  { name: '三高炉项目 / 秀池木栈道 / 栈道北', value: 198.7 },
  { name: '服贸会项目 / 展馆A区 / 箱A', value: 186.4 },
  { name: '制氧南项目 / 赛道 / 箱B', value: 175.1 },
  { name: '脱硫车间项目 / 主车间 / 箱A', value: 168.9 },
  { name: '冬训中心项目 / 速滑馆 / 箱A', value: 155.2 },
  { name: '服贸会项目 / 展馆B区 / 箱A', value: 143.6 },
  { name: '金安桥项目 / 桥面 / 箱A', value: 132.8 },
];

/** 当前展示的箱子排名数据（接口数据加载成功后覆盖 mock） */
const rankBox = ref<RankItem[]>(rankBoxData);

const rankChartRef = ref<HTMLDivElement | null>(null);
let rankChart: echarts.ECharts | null = null;

const initRankChart = () => {
  if (!rankChartRef.value) return;
  rankChart = echarts.init(rankChartRef.value);
  updateRankChart(statType.value);
};

const tooltipBg = 'rgba(15, 23, 42, 0.92)';
const tooltipBorder = '#334155';
const axisLabelColor = '#94a3b8';
const splitLineColor = 'rgba(148, 163, 184, 0.14)';
const axisLineColor = '#334155';

const updateRankChart = (type: string) => {
  if (!rankChart) return;
  const data = type === 'area' ? rankArea.value : rankBox.value;
  rankChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(14, 165, 233, 0.08)' } },
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/>今日能耗：${item.value.toFixed(1)} kWh`;
      },
    },
    grid: { left: '2%', right: '14%', bottom: '2%', top: '2%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 1000,
      interval: 200,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: axisLabelColor, fontSize: 12 },
      splitLine: { lineStyle: { color: splitLineColor } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: data.map((item) => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#cbd5e1',
        fontSize: 12,
        width: 170,
        overflow: 'truncate',
      },
    },
    series: [
      {
        type: 'bar',
        data: data.map((item) => item.value),
        barWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0369a1' },
            { offset: 1, color: '#38bdf8' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: '#e2e8f0',
          fontSize: 12,
          formatter: (params: any) => params.value.toFixed(1),
        },
      },
    ],
  });
};

/* ============================ 占比（环形图） ============================ */
const pieColors = ['#38bdf8', '#f59e0b', '#10b981', '#facc15', '#f472b6', '#475569'];

const getPieData = () => {
  const top5 = rankArea.value.slice(0, 5);
  const others = rankArea.value.slice(5).reduce((sum, item) => sum + item.value, 0);
  return [
    ...top5.map((item) => ({ name: item.name, value: item.value })),
    { name: '其他', value: Number(others.toFixed(1)) },
  ];
};

/** 占比图数据（proportion 接口加载成功后覆盖 mock） */
const pieData = ref(getPieData());

const pieChartRef = ref<HTMLDivElement | null>(null);
let pieChart: echarts.ECharts | null = null;

const renderPie = () => {
  if (!pieChart) return;
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: '#f1f5f9' },
      formatter: '{b}<br/>{c} kWh（{d}%）',
    },
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      textStyle: { color: '#94a3b8', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['42%', '46%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold', formatter: '{b}\n{d}%' },
        },
        itemStyle: { borderRadius: 4, borderColor: '#1e293b', borderWidth: 2 },
        data: pieData.value.map((item, index) => ({
          ...item,
          itemStyle: { color: pieColors[index % pieColors.length] },
        })),
      },
    ],
  });
};

const initPieChart = () => {
  if (!pieChartRef.value) return;
  pieChart = echarts.init(pieChartRef.value);
  renderPie();
};

/* ============================ Top5 逐时趋势（折线图） ============================ */
const trendHours = ref(Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`));
/** 全园：18:00 后开启，飙升至峰值并保持至 22:00 后回落（接口数据加载成功后覆盖） */
const parkTrend = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2800, 2960, 2920, 2880, 2850, 600];
/** 当前展示的逐时趋势系列（hourlyTrend 接口加载成功后覆盖） */
const trendSeriesData = ref<{ name: string; data: number[] }[]>([{ name: '全园', data: parkTrend }]);
const trendColors = ['#38bdf8', '#f59e0b', '#10b981', '#facc15', '#f472b6'];

const trendChartRef = ref<HTMLDivElement | null>(null);
let trendChart: echarts.ECharts | null = null;

const renderTrend = () => {
  if (!trendChart) return;
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: '#f1f5f9' },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/>${item.marker}${item.seriesName}：${item.value.toLocaleString()} kW`;
      },
    },
    legend: {
      data: trendSeriesData.value.map((s) => s.name),
      top: 0,
      right: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#94a3b8', fontSize: 12 },
    },
    grid: { left: '2%', right: '3%', bottom: '2%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendHours.value,
      axisLine: { lineStyle: { color: axisLineColor } },
      axisTick: { show: false },
      axisLabel: { color: axisLabelColor, fontSize: 12, interval: 2 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 3000,
      interval: 500,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: splitLineColor } },
      axisLabel: { color: axisLabelColor, fontSize: 12 },
    },
    series: trendSeriesData.value.map((s, idx) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: trendColors[idx % trendColors.length] },
      lineStyle: { width: 2.5, color: trendColors[idx % trendColors.length] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(56, 189, 248, 0.28)' },
          { offset: 1, color: 'rgba(56, 189, 248, 0.02)' },
        ]),
      },
    })),
  });
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  trendChart = echarts.init(trendChartRef.value);
  renderTrend();
};

/* ============================ 汇总表（列表，仅网关维度） ============================ */
/** 汇总表列表项 */
interface SummaryRow {
  key: string;
  areaName: string;
  boxName: string;
  meterCount: number;
  installed: number;
  today: number;
  month: number;
  ratio: string;
}

/** 汇总表查询条件（区域、箱子名称） */
const summaryFilters = ref<{ areaName?: string; boxName?: string }>({});

/** 区域下拉选项：value 用片区id，label 用片区名称 */
const summaryAreaOptions = ref<{ label: string; value: string }[]>([]);

/** 构建汇总表区域下拉（value 为片区id） */
const buildSummaryAreaOptions = () => {
  summaryAreaOptions.value = regionOptions.value.map((o) => ({ label: o.label, value: o.value }));
};

/** 汇总表列表数据（默认空，由接口加载） */
const summaryData = ref<SummaryRow[]>([]);

/** 区域 id → 区域名称映射（用于前端按区域过滤） */
const regionNameMap = computed(() => {
  const map: Record<string, string> = {};
  regionOptions.value.forEach((o) => {
    map[String(o.value)] = o.label;
  });
  return map;
});

/** 汇总表前端过滤后的数据（区域选择 / 箱子名称输入时实时过滤） */
const filteredSummaryData = computed(() => {
  let list = summaryData.value;
  const areaId = summaryFilters.value.areaName;
  if (areaId) {
    const name = regionNameMap.value[String(areaId)];
    if (name) list = list.filter((r) => r.areaName === name);
  }
  const boxName = summaryFilters.value.boxName?.trim();
  if (boxName) list = list.filter((r) => r.boxName.includes(boxName));
  return list;
});

/** 汇总表表格加载状态 */
const summaryLoading = ref(false);

const summaryColumns = [
  { title: '区域', key: 'areaName', dataIndex: 'areaName', align: 'center' as const },
  { title: '箱子名称', key: 'boxName', dataIndex: 'boxName', align: 'center' as const },
  { title: '电表', key: 'meterCount', dataIndex: 'meterCount', align: 'center' as const },
  { title: '装机(kW)', key: 'installed', dataIndex: 'installed', align: 'center' as const },
  { title: '今日(kWh)', key: 'today', dataIndex: 'today', align: 'center' as const },
  { title: '今日占比', key: 'ratio', dataIndex: 'ratio', align: 'center' as const },
  { title: '本月(kWh)', key: 'month', dataIndex: 'month', align: 'center' as const },
];

/* ============================ 接口数据加载 ============================ */
/** 生成当天日期字符串，sep='-' → 2026-08-13；sep='' → 20260813 */
function formatDate(sep: string): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}${sep}${m}${sep}${day}`;
}

/** 兼容多种返回结构：数组 / { records } / { list } / { data } / { result } */
function normalizeList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== 'object') return [];
  const v = res.records ?? res.list ?? res.result ?? res.data ?? res.rows;
  return Array.isArray(v) ? v : [];
}

/** 排名项字段兼容映射（name/value 多字段回退） */
function mapRankItem(it: any): RankItem {
  return {
    name: it.name || it.regionName || it.areaName || it.spaceName || it.circuitName || it.deviceName || it.boxName || '-',
    value: Number(it.value ?? it.energy ?? it.kwh ?? it.consumption ?? it.today ?? 0),
  };
}

/** 维度映射：按区域 → zone，按箱子 → box */
const levelByStatType = () => (statType.value === 'area' ? 'zone' : 'box');

/** 能耗排名（随维度切换，今天，Top 15） */
const loadRanking = async () => {
  try {
    const res = await getEnergyRanking({ level: levelByStatType(), top: 15 });
    const list = normalizeList(res)
      .map(mapRankItem)
      .filter((i) => i.value > 0);
    if (!list.length) return;
    if (statType.value === 'area') {
      rankArea.value = list;
    } else {
      rankBox.value = list;
    }
    updateRankChart(statType.value);
  } catch (err) {
    console.error('能耗排名加载失败：', err);
  }
};

/** 能耗占比（随维度切换，当天） */
const loadProportion = async () => {
  try {
    const res = await getEnergyProportion({ level: levelByStatType(), date: formatDate('-') });
    const list = normalizeList(res)
      .map((it: any) => ({
        name: it.name || it.regionName || it.areaName || it.deviceName || '其他',
        value: Number(it.value ?? it.energy ?? it.kwh ?? it.proportion ?? 0),
      }))
      .filter((i) => i.value > 0);
    if (!list.length) return;
    pieData.value = list;
    renderPie();
  } catch (err) {
    console.error('能耗占比加载失败：', err);
  }
};

/** Top5 逐时趋势对比（按地块，当天） */
const loadTrend = async () => {
  try {
    const res = await getEnergyHourlyTrend({ level: 'parcel', date: formatDate('') });
    let hours: string[] = [];
    let series: { name: string; data: number[] }[] = [];
    if (Array.isArray(res)) {
      // 平铺数组：[{ name, data }]
      series = res.map((s: any) => ({
        name: s.name || s.seriesName || s.deviceName || '-',
        data: (s.data || s.values || s.points || []).map(Number),
      }));
    } else if (res && typeof res === 'object') {
      // 对象：{ hours: [], series: [{ name, data }] }
      hours = res.hours || res.timeList || res.times || res.xAxis || [];
      const arr = res.series || res.dataList || res.seriesList || [];
      series = arr.map((s: any) => ({
        name: s.name || s.seriesName || s.deviceName || '-',
        data: (s.data || s.values || s.points || []).map(Number),
      }));
    }
    if (!series.length) return;
    if (hours.length) trendHours.value = hours;
    trendSeriesData.value = series;
    renderTrend();
  } catch (err) {
    console.error('逐时趋势加载失败：', err);
  }
};

/** 汇总表列表行字段映射（兼容多种返回字段名） */
function mapSummaryRow(it: any, idx: number): SummaryRow {
  const ratioRaw = it.ratio ?? it.proportion ?? it.percent;
  const ratioStr =
    ratioRaw === null || ratioRaw === undefined || ratioRaw === ''
      ? '0.0%'
      : String(ratioRaw).includes('%')
        ? String(ratioRaw)
        : `${Number(ratioRaw).toFixed(1)}%`;
  return {
    key: String(idx),
    // 默认取片区名称，后端未返回时回退区域名称
    areaName: String(it.districtName ?? it.areaName ?? it.regionName ?? it.name ?? '-'),
    boxName: String(it.boxName ?? it.gatewayName ?? it.gatewayCode ?? it.gateway ?? '-'),
    meterCount: Number(it.meters ?? it.meterCount ?? it.meterNum ?? it.meter ?? 0),
    installed: Number(it.kw ?? it.installed ?? it.installedPower ?? it.capacity ?? it.power ?? 0),
    today: Number(it.today ?? it.todayEnergy ?? it.todayKwh ?? it.energy ?? 0),
    month: Number(it.month ?? it.monthEnergy ?? it.monthKwh ?? 0),
    ratio: ratioStr,
  };
}

/** 能耗汇总表列表（仅网关维度，支持区域/箱子名称过滤） */
const loadSummary = async () => {
  summaryLoading.value = true;
  try {
    const res = await getEnergySummaryList({ date: formatDate('-'), ...summaryFilters.value });
    const list = normalizeList(res);
    if (!list.length) {
      summaryData.value = [];
      return;
    }
    summaryData.value = list.map(mapSummaryRow);
  } catch (err) {
    console.error('能耗汇总加载失败：', err);
  } finally {
    summaryLoading.value = false;
  }
};

/** 汇总表查询 */
const onSummaryQuery = () => {
  loadSummary();
};

/** 汇总表重置 */
const onSummaryReset = () => {
  summaryFilters.value = {};
  loadSummary();
};

/** 导出汇总表表格数据为 Excel（导出当前过滤后的数据，与表格显示一致） */
const onExportSummary = () => {
  if (!filteredSummaryData.value.length) {
    // eslint-disable-next-line no-alert
    alert('暂无可导出的数据');
    return;
  }
  const rows = filteredSummaryData.value.map((row, idx) => ({
    index: idx + 1,
    areaName: row.areaName,
    boxName: row.boxName,
    meterCount: row.meterCount,
    installed: row.installed.toFixed(1),
    today: row.today.toFixed(1),
    ratio: row.ratio,
    month: row.month.toFixed(1),
  }));
  exportExcel({
    tableData: rows,
    fileName: '能耗汇总表',
    headers: [
      { key: 'index', title: '序号' },
      { key: 'areaName', title: '区域' },
      { key: 'boxName', title: '箱子名称' },
      { key: 'meterCount', title: '电表' },
      { key: 'installed', title: '装机(kW)' },
      { key: 'today', title: '今日(kWh)' },
      { key: 'ratio', title: '今日占比' },
      { key: 'month', title: '本月(kWh)' },
    ],
  });
};

/* ============================ 箱子遥测 ============================ */
/** 箱子遥测查询条件：区域(片区id) + 箱子名称(区域名) */
const boxFilters = ref<{ districtId?: number; boxName?: string }>({});

/** 片区下拉（value=片区id，label=片区名，复用 regionOptions） */
const boxDistrictOptions = computed(() => regionOptions.value);

/** 箱子遥测列表 */
const boxData = ref<any[]>([]);
const boxLoading = ref(false);

/** 箱子遥测过滤后的数据（按片区/区域名过滤） */
const filteredBoxData = computed(() => {
  let list = boxData.value;
  const districtId = boxFilters.value.districtId;
  if (districtId) {
    const name = regionNameMap.value[String(districtId)];
    if (name) {
      list = list.filter((it) => it.districtName === name);
    }
  }
  const boxName = boxFilters.value.boxName?.trim();
  if (boxName) {
    list = list.filter((it) => it.areaName && it.areaName.includes(boxName));
  }
  return list;
});

/** 箱子遥测列：区域=片区名，箱子=区域名 */
const boxColumns = [
  { title: '序号', key: 'index', align: 'center' as const, width: 60, customRender: ({ index }) => index + 1 },
  { title: '区域', key: 'districtName', align: 'center' as const, dataIndex: 'districtName', customRender: ({ text }) => text || '-' },
  { title: '箱子', key: 'areaName', align: 'center' as const, dataIndex: 'areaName', customRender: ({ text }) => text || '-' },
  { title: '三相电压', key: 'voltage', align: 'center' as const },
  { title: '三相电流', key: 'current', align: 'center' as const },
  { title: '功率', key: 'power', align: 'center' as const },
  { title: '累积电量(kWh)', key: 'totalEnergy', align: 'center' as const, dataIndex: 'totalEnergy', customRender: ({ text }) => fmtNum(text) },
  { title: '最后采集时间', key: 'collectTime', align: 'center' as const, width: 180 },
  { title: '操作', key: 'action', align: 'center' as const, width: 100, fixed: 'right' as const },
];

/** 加载箱子遥测列表 */
const loadBoxTelemetry = async (params?: Record<string, any>) => {
  boxLoading.value = true;
  try {
    const res = await getBoxTelemetryList(params ?? {});
    boxData.value = Array.isArray(res) ? res : (res && res.result) || [];
  } catch (e) {
    console.error('箱子遥测加载失败', e);
    boxData.value = [];
  } finally {
    boxLoading.value = false;
  }
};

/** 箱子遥测查询：携带查询条件重新请求列表接口 */
const onBoxQuery = () => {
  loadBoxTelemetry({ ...boxFilters.value });
};

/** 箱子遥测重置 */
const onBoxReset = () => {
  boxFilters.value = {};
};

/** 导出箱子遥测表格数据为 Excel（导出当前过滤后的数据，与表格显示一致） */
const onExportBox = () => {
  if (!filteredBoxData.value.length) {
    // eslint-disable-next-line no-alert
    alert('暂无可导出的数据');
    return;
  }
  const rows = filteredBoxData.value.map((row, idx) => ({
    index: idx + 1,
    districtName: row.districtName,
    areaName: row.areaName,
    voltage: `A:${fmtNum(row.voltageA)} B:${fmtNum(row.voltageB)} C:${fmtNum(row.voltageC)} V`,
    current: `A:${fmtNum(row.currentA)} B:${fmtNum(row.currentB)} C:${fmtNum(row.currentC)} A`,
    power: `有功:${fmtNum(row.activePower)}kW`,
    totalEnergy: fmtNum(row.totalEnergy),
    collectTime: row.collectTime,
  }));
  exportExcel({
    tableData: rows,
    fileName: '箱子遥测数据',
    headers: [
      { key: 'index', title: '序号' },
      { key: 'districtName', title: '区域' },
      { key: 'areaName', title: '箱子' },
      { key: 'voltage', title: '三相电压' },
      { key: 'current', title: '三相电流' },
      { key: 'power', title: '功率' },
      { key: 'totalEnergy', title: '累积电量(kWh)' },
      { key: 'collectTime', title: '最后采集时间' },
    ],
  });
};

/** 数值格式化 */
const fmtNum = (v) => {
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toFixed(2);
};

/** 时间格式化 */
const formatTime = (t) => {
  if (!t) return '-';
  // 后端返回形如 "2026-08-28 17:40:59" 或 ISO
  if (typeof t === 'string') return t.replace('T', ' ').substring(0, 19);
  return new Date(t).toLocaleString();
};

/* ---- 箱子遥测详情弹窗 ---- */
const boxDetailVisible = ref(false);
const boxDetailRecord = ref<any>(null);
interface BoxTelemetryHistoryItem {
  id: string | number;
  collectTime?: string;
  [key: string]: any;
}
const boxDetailHistory = ref<BoxTelemetryHistoryItem[]>([]);
const boxDetailLoading = ref(false);
const boxDetailField = ref('voltageA');
const boxDetailStartTime = ref(null);
const boxDetailEndTime = ref(null);
const boxDetailChartType = ref('table'); // table | line | bar
const boxDetailChartRef = ref(null);
let boxDetailChart = null;

/** 13 个属性配置（key、label、unit） */
const BOX_FIELDS = [
  { key: 'voltageA', label: 'A相电压', unit: 'V' },
  { key: 'voltageB', label: 'B相电压', unit: 'V' },
  { key: 'voltageC', label: 'C相电压', unit: 'V' },
  { key: 'currentA', label: 'A相电流', unit: 'A' },
  { key: 'currentB', label: 'B相电流', unit: 'A' },
  { key: 'currentC', label: 'C相电流', unit: 'A' },
  { key: 'activePower', label: '有功功率', unit: 'kW' },
  { key: 'reactivePower', label: '无功功率', unit: 'kVar' },
  { key: 'apparentPower', label: '现在功率', unit: 'kVA' },
  { key: 'powerFactor', label: '功率因数', unit: '' },
  { key: 'totalEnergy', label: '累积电量', unit: 'kWh' },
];

/** 打开箱子详情 */
const openBoxDetail = async (record) => {
  boxDetailRecord.value = record;
  boxDetailVisible.value = true;
  boxDetailField.value = 'voltageA';
  boxDetailChartType.value = 'table';
  boxDetailHistory.value = [];
  // 默认查最近1天
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  boxDetailStartTime.value = start.toISOString().slice(0, 19).replace('T', ' ');
  boxDetailEndTime.value = end.toISOString().slice(0, 19).replace('T', ' ');
  await loadBoxDetailHistory();
};

/** 关闭弹窗 */
const closeBoxDetail = () => {
  boxDetailVisible.value = false;
  if (boxDetailChart) { boxDetailChart.dispose(); boxDetailChart = null; }
};

/** 加载箱子历史 */
const loadBoxDetailHistory = async () => {
  if (!boxDetailRecord.value) return;
  boxDetailLoading.value = true;
  try {
    const res = await getBoxTelemetryHistory({
      gatewayCode: boxDetailRecord.value.gatewayCode,
      start: boxDetailStartTime.value,
      end: boxDetailEndTime.value,
    });
    boxDetailHistory.value = Array.isArray(res) ? res : (res && res.result) || [];
    nextTick(() => renderBoxChart());
  } catch (e) {
    console.error('箱子历史加载失败', e);
  } finally {
    boxDetailLoading.value = false;
  }
};

/** 渲染折线/柱状图（echarts） */
const renderBoxChart = async () => {
  if (boxDetailChartType.value === 'table') {
    if (boxDetailChart) { boxDetailChart.dispose(); boxDetailChart = null; }
    return;
  }
  const echarts = await import('echarts');
  const el = boxDetailChartRef.value;
  if (!el) return;
  boxDetailChart = echarts.init(el);
  const fieldDef = BOX_FIELDS.find((f) => f.key === boxDetailField.value);
  const data = (boxDetailHistory.value || []).map((it) => [
    it.collectTime ? formatTime(it.collectTime) : '',
    Number(it[boxDetailField.value] ?? 0),
  ]);
  boxDetailChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map((d) => d[0]) },
    yAxis: { type: 'value', name: fieldDef?.unit || '' },
    series: [{
      type: boxDetailChartType.value === 'line' ? 'line' : 'bar',
      data: data.map((d) => d[1]),
      smooth: boxDetailChartType.value === 'line',
      itemStyle: { color: '#1890ff' },
      areaStyle: boxDetailChartType.value === 'line' ? { color: 'rgba(24,144,255,0.2)' } : undefined,
    }],
  });
};

/** 监听图表类型/属性/时间变化 */
watch([boxDetailChartType, boxDetailField], () => {
  nextTick(() => renderBoxChart());
});

/* ============================ 维度切换与生命周期 ============================ */
watch(statType, (type) => {
  nextTick(() => {
    updateRankChart(type);
  });
  // 维度切换时重新拉取排名与占比
  loadRanking();
  loadProportion();
});

const handleResize = () => {
  rankChart?.resize();
  pieChart?.resize();
  trendChart?.resize();
};

onMounted(() => {
  initRankChart();
  initPieChart();
  initTrendChart();
  window.addEventListener('resize', handleResize);
  // 加载真实接口数据（失败时保留 mock 兜底）
  loadRanking();
  loadProportion();
  loadTrend();
  loadSummary();
  // 初始化拉取区间查询（表底抄表记录）
  loadMeterReads();
  // 初始化拉取箱子遥测列表
  loadBoxTelemetry();
  // 初始化区域下拉选项（全部区域）
  loadRegionOptions();
});

onUnmounted(() => {
  rankChart?.dispose();
  pieChart?.dispose();
  trendChart?.dispose();
  rankChart = null;
  pieChart = null;
  trendChart = null;
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.energy-statistics {
  --bg: #0f172a;
  --panel: #1e293b;
  --border: #334155;
  --text: #f1f5f9;
  --text2: #94a3b8;
  --primary: #0ea5e9;

  /* 撑满视口并内部滚动：全局 html overflow:hidden，需自行开启滚动 */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 16px;
  background: #0f172a;

  /* 深色主题滚动条（全局滚动条透明度低不可见，此处覆盖为青色） */
}

.energy-statistics::-webkit-scrollbar {
  width: 6px;
}
.energy-statistics::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
}
.energy-statistics::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.5);
  border-radius: 6px;
}
.energy-statistics::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.8);
}

/* ---------- 顶部工具栏 ---------- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.stat-type :deep(.ant-radio-wrapper) {
  font-size: 14px;
  margin-right: 20px;
  color: var(--text2);
}

.stat-type :deep(.ant-radio-wrapper:hover),
.stat-type :deep(.ant-radio-wrapper:hover .ant-radio-inner) {
  border-color: var(--primary);
}

.stat-type :deep(.ant-radio-inner) {
  background: #16233a;
  border-color: #334155;
}

.stat-type :deep(.ant-radio-checked .ant-radio-inner) {
  border-color: var(--primary);
  background: var(--primary);
}

.stat-type :deep(.ant-radio-checked .ant-radio-inner::after) {
  background-color: #ffffff;
}

.stat-type :deep(.ant-radio-checked + span) {
  color: #e2e8f0;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: #ffffff;
  padding: 7px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: linear-gradient(135deg, #0369a1, #38bdf8);
}

/* ---------- 图表卡片 ---------- */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.title-bar {
  width: 4px;
  height: 16px;
  background: var(--primary);
  border-radius: 2px;
}

.title-tip {
  font-size: 12px;
  font-weight: 400;
  color: var(--text2);
}

.chart-box {
  width: 100%;
}

.rank-chart {
  height: 420px;
}

.pie-chart {
  height: 420px;
}

.trend-chart {
  height: 320px;
}

/* ---------- 汇总表 / 区间查询 Tabs ---------- */
.summary-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 4px;
}

.summary-tabs :deep(.ant-tabs-nav::before) {
  border-bottom: 1px solid rgba(51, 65, 85, 0.6);
}

.summary-tabs :deep(.ant-tabs-tab) {
  padding: 6px 2px;
  color: var(--text2);
  font-size: 17px;
}

.summary-tabs :deep(.ant-tabs-tab:hover) {
  color: #38bdf8;
}

.summary-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #38bdf8;
  font-weight: 600;
}

.summary-tabs :deep(.ant-tabs-ink-bar) {
  background: var(--primary);
}

.summary-tabs :deep(.ant-tabs-content-holder) {
  border: none;
}

.range-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
}

.range-placeholder :deep(.ant-empty-description) {
  color: var(--text2);
}

/* ---------- 区间查询 ---------- */
.range-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 6px 4px 18px;
}

.range-filter-bar .filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-filter-bar .filter-label {
  color: var(--text2);
  font-size: 14px;
  white-space: nowrap;
}

.range-filter-bar :deep(.ant-input-affix-wrapper),
.range-filter-bar :deep(.ant-input),
.range-filter-bar :deep(.ant-select-selector),
.range-filter-bar :deep(.ant-picker) {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(71, 85, 105, 0.6);
  color: #ffffff !important;
}

/* 输入框文字 */
.range-filter-bar :deep(.ant-input),
.range-filter-bar :deep(.ant-input-affix-wrapper input),
.range-filter-bar :deep(.ant-input-affix-wrapper .ant-input) {
  color: #ffffff !important;
}

/* 选择器选中项文字 */
.range-filter-bar :deep(.ant-select-selection-item) {
  color: #ffffff !important;
}

/* 日期选择器输入文字 */
.range-filter-bar :deep(.ant-picker-input > input) {
  color: #ffffff !important;
}

.range-filter-bar :deep(.ant-select-selection-placeholder),
.range-filter-bar :deep(.ant-input::placeholder),
.range-filter-bar :deep(.ant-picker-input > input::placeholder) {
  color: var(--text3, #64748b);
}

/* ---------- 汇总表 ---------- */
/* 全面覆盖 antd 表格默认白色背景 */
.summary-table :deep(.ant-table),
.summary-table :deep(.ant-table-container),
.summary-table :deep(.ant-table-content),
.summary-table :deep(.ant-table-cell),
.summary-table :deep(.ant-table-cell-fix-left),
.summary-table :deep(.ant-table-cell-fix-right) {
  font-size: 14px;
  background: transparent !important;
}

.summary-table :deep(.ant-table-thead > tr > th) {
  background: #16233a !important;
  color: #94a3b8 !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(51, 65, 85, 0.6) !important;
}

/* 去掉表头单元格之间的垂直小白线（antd 用 th::before 绘制表头分隔竖线） */
.summary-table :deep(.ant-table-thead > tr > th::before) {
  display: none !important;
}

/* 压暗行分隔线：antd 非 bordered 表格实际用 border-top 画线（默认 #f0f0f0 亮色），需覆盖 border-top */
.summary-table :deep(.ant-table-tbody > tr > td),
.summary-table :deep(.ant-table-tbody .ant-table-cell),
.summary-table :deep(.ant-table-wrapper .ant-table-tbody > tr > td),
.summary-table :deep(.ant-table-wrapper .ant-table-tbody .ant-table-cell) {
  background: transparent !important;
  color: #e2e8f0;
  border-top: 1px solid rgba(51, 65, 85, 0.18) !important;
  border-bottom: none !important;
}

.summary-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(14, 165, 233, 0.1) !important;
}

.summary-table :deep(.ant-table-row-expand-icon) {
  background: transparent;
  border-color: var(--border);
  color: var(--text2);
}

.expand-arrow {
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.expand-arrow:hover {
  color: #38bdf8;
}

.summary-table :deep(.ant-table-expanded-row > td) {
  background: rgba(15, 23, 42, 0.6) !important;
}

.summary-table :deep(.ant-table-cell-row-hover) {
  background: rgba(14, 165, 233, 0.08) !important;
}

.summary-table :deep(.ant-table-placeholder) {
  background: transparent !important;
}

/* 区间查询表格加载中：spinner 使用主题青色 */
.summary-table :deep(.ant-spin) {
  color: #38bdf8;
}

.ratio-text {
  font-weight: 500;
  color: #e2e8f0;
}

.ratio-text.has-children {
  color: var(--primary);
}

/* ---------- 响应式 ---------- */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped>
.theme-white.energy-statistics {
  --bg: #f5f7fa;
  --panel: #ffffff;
  --border: #e4e7ed;
  --text: #303133;
  --text2: #909399;
  --primary: #1890ff;

  /* 撑满视口并内部滚动：全局 html overflow:hidden，需自行开启滚动 */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fa;

  /* 深色主题滚动条（全局滚动条透明度低不可见，此处覆盖为青色） */
}.theme-white.energy-statistics::-webkit-scrollbar {
  width: 6px;
}.theme-white.energy-statistics::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
}.theme-white.energy-statistics::-webkit-scrollbar-thumb {
  background: rgba(24, 144, 255, 0.4);
  border-radius: 6px;
}.theme-white.energy-statistics::-webkit-scrollbar-thumb:hover {
  background: rgba(24, 144, 255, 0.6);
}.theme-white /* ---------- 顶部工具栏 ---------- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}.theme-white .stat-type :deep(.ant-radio-wrapper) {
  font-size: 14px;
  margin-right: 20px;
  color: var(--text2);
}.theme-white .stat-type :deep(.ant-radio-wrapper:hover),
.theme-white .stat-type :deep(.ant-radio-wrapper:hover .ant-radio-inner) {
  border-color: var(--primary);
}.theme-white .stat-type :deep(.ant-radio-inner) {
  background: #ffffff;
  border-color: #dcdfe6;
}.theme-white .stat-type :deep(.ant-radio-checked .ant-radio-inner) {
  border-color: var(--primary);
  background: var(--primary);
}.theme-white .stat-type :deep(.ant-radio-checked .ant-radio-inner::after) {
  background-color: #ffffff;
}.theme-white .stat-type :deep(.ant-radio-checked + span) {
  color: #1890ff;
}.theme-white .upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #ffffff;
  padding: 7px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}.theme-white .upload-btn:hover {
  background: linear-gradient(135deg, #40a9ff, #66b1ff);
}.theme-white /* ---------- 图表卡片 ---------- */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}.theme-white .chart-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}.theme-white .card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}.theme-white .title-bar {
  width: 4px;
  height: 16px;
  background: var(--primary);
  border-radius: 2px;
}.theme-white .title-tip {
  font-size: 12px;
  font-weight: 400;
  color: var(--text2);
}.theme-white .chart-box {
  width: 100%;
}.theme-white .rank-chart {
  height: 420px;
}.theme-white .pie-chart {
  height: 420px;
}.theme-white .trend-chart {
  height: 320px;
}.theme-white /* ---------- 汇总表 ---------- */
/* 全面覆盖 antd 表格默认白色背景 */
.summary-table :deep(.ant-table),
.theme-white .summary-table :deep(.ant-table-container),
.theme-white .summary-table :deep(.ant-table-content),
.theme-white .summary-table :deep(.ant-table-cell),
.theme-white .summary-table :deep(.ant-table-cell-fix-left),
.theme-white .summary-table :deep(.ant-table-cell-fix-right) {
  font-size: 14px;
  background: transparent !important;
}.theme-white .summary-table :deep(.ant-table-thead > tr > th) {
  background: #f5f7fa !important;
  color: #606266 !important;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed !important;
}.theme-white /* 去掉表头单元格之间的垂直小白线（antd 用 th::before 绘制表头分隔竖线） */
.summary-table :deep(.ant-table-thead > tr > th::before) {
  display: none !important;
}.theme-white /* 压暗行分隔线：antd 非 bordered 表格实际用 border-top 画线（默认 #f0f0f0 亮色），需覆盖 border-top */
.summary-table :deep(.ant-table-tbody > tr > td),
.theme-white .summary-table :deep(.ant-table-tbody .ant-table-cell),
.theme-white .summary-table :deep(.ant-table-wrapper .ant-table-tbody > tr > td),
.theme-white .summary-table :deep(.ant-table-wrapper .ant-table-tbody .ant-table-cell) {
  background: transparent !important;
  color: #303133;
  border-top: 1px solid #f0f0f0 !important;
  border-bottom: none !important;
}.theme-white .summary-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(24, 144, 255, 0.08) !important;
}.theme-white .summary-table :deep(.ant-table-row-expand-icon) {
  background: transparent;
  border-color: var(--border);
  color: var(--text2);
}.theme-white .expand-arrow {
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}.theme-white .expand-arrow:hover {
  color: #1890ff;
}.theme-white .summary-table :deep(.ant-table-expanded-row > td) {
  background: #fafafa !important;
}.theme-white .summary-table :deep(.ant-table-cell-row-hover) {
  background: rgba(24, 144, 255, 0.06) !important;
}.theme-white .summary-table :deep(.ant-table-placeholder) {
  background: transparent !important;
}.theme-white .ratio-text {
  font-weight: 500;
  color: #303133;
}.theme-white .ratio-text.has-children {
  color: var(--primary);
}.theme-white /* ---------- 汇总表 / 区间查询 Tabs ---------- */
.summary-tabs :deep(.ant-tabs-nav::before) {
  border-bottom: 1px solid #e4e7ed;
}.theme-white .summary-tabs :deep(.ant-tabs-tab) {
  color: #909399;
}.theme-white .summary-tabs :deep(.ant-tabs-tab:hover) {
  color: #1890ff;
}.theme-white .summary-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1890ff;
}.theme-white .summary-tabs :deep(.ant-tabs-ink-bar) {
  background: #1890ff;
}.theme-white /* ---------- 区间查询查询条件（第一行） ---------- */
.range-filter-bar :deep(.ant-input-affix-wrapper),
.theme-white .range-filter-bar :deep(.ant-input),
.theme-white .range-filter-bar :deep(.ant-select-selector),
.theme-white .range-filter-bar :deep(.ant-picker) {
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
  color: #303133 !important;
}.theme-white .range-filter-bar :deep(.ant-input),
.theme-white .range-filter-bar :deep(.ant-input-affix-wrapper input),
.theme-white .range-filter-bar :deep(.ant-input-affix-wrapper .ant-input) {
  color: #303133 !important;
}.theme-white .range-filter-bar :deep(.ant-select-selection-item) {
  color: #303133 !important;
}.theme-white .range-filter-bar :deep(.ant-picker-input > input) {
  color: #303133 !important;
}.theme-white .range-filter-bar :deep(.ant-select-selection-placeholder),
.theme-white .range-filter-bar :deep(.ant-input::placeholder),
.theme-white .range-filter-bar :deep(.ant-picker-input > input::placeholder) {
  color: #909399 !important;
}.theme-white .range-filter-bar .filter-label {
  color: #606266;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1200px)  {.theme-white .charts-grid {
    grid-template-columns: 1fr;
  }}
</style>

<style lang="less">
/* ==================== 箱子遥测详情弹窗（参照回路列表弹窗风格） ==================== */
.box-telemetry-modal {
  background: rgba(2, 8, 23, 0.78) !important;
  backdrop-filter: blur(2px);

  .ant-modal-content {
    position: relative;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.45), 0 0 24px rgba(0, 212, 255, 0.25), 0 0 60px rgba(0, 212, 255, 0.1), 0 12px 40px rgba(0, 0, 0, 0.7) !important;
    overflow: visible !important;
  }
  .ant-modal-header {
    position: relative;
    background: linear-gradient(180deg, rgba(0, 30, 55, 0.02) 0%, rgba(0, 30, 55, 0.35) 100%) !important;
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
    padding: 24px;
    max-height: 72vh;
    overflow-y: auto;
  }

  /* 标题区 */
  .modal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    margin-top: -12px;
    margin-bottom: 16px;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.02));
    border: 1px solid rgba(0, 212, 255, 0.35);
    border-radius: 4px;
  }
  .title-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .title-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: #00d4ff;
    filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.6));
  }
  .title-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .title-label {
    font-size: 12px;
    color: rgba(176, 199, 224, 0.8);
    letter-spacing: 1px;
  }
  .title-value {
    font-size: 16px;
    font-weight: 700;
    color: #e8f4ff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 340px;
  }
  .title-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  /* 时间范围条 */
  .modal-tip {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px 16px;
    margin-bottom: 16px;
    background: rgba(15, 40, 69, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.15);
    border-radius: 4px;
  }
  .tip-icon {
    width: 14px;
    height: 14px;
    color: #00d4ff;
    flex-shrink: 0;
  }
  .tip-text {
    font-size: 13px;
    color: #b0c7e0;
    white-space: nowrap;
  }
  .tip-sep {
    color: #7fa6d4;
  }
  .time-input {
    width: 170px;
  }
  .chart-type-radio {
    margin-left: auto;
  }

  /* 内容区 */
  .table-container {
    position: relative;
    padding: 12px;
    background: rgba(15, 40, 69, 0.35);
    border: 1px solid rgba(0, 212, 255, 0.15);
    border-radius: 4px;
  }

  /* 表格（与回路控制弹窗 device-table 一致） */
  .detail-table-wrap {
    margin-top: 12px;
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
  .device-table th:nth-child(1),
  .device-table td:nth-child(1) {
    width: 15%;
  }
  .device-table th:nth-child(2),
  .device-table td:nth-child(2) {
    width: 45%;
  }
  .device-table th:nth-child(3),
  .device-table td:nth-child(3) {
    width: 40%;
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

  /* 底部 */
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 20px -24px -24px;
    padding: 14px 24px;
    background: rgba(10, 30, 55, 0.6);
    border-top: 1px solid rgba(0, 212, 255, 0.15);
    border-radius: 0 0 6px 6px;
  }
  .total-count {
    font-size: 13px;
    color: #b0c7e0;
  }
  .count-num {
    font-size: 18px;
    font-weight: 700;
    color: #00d4ff;
    margin: 0 2px;
  }
  .footer-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .btn-cancel,
  .btn-confirm {
    min-width: 84px;
  }

  /* 按钮 */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 16px;
    font-size: 13px;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: #b0c7e0;
  }
  .btn-primary {
    background: linear-gradient(135deg, #00b4ff, #0070e0);
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 150, 255, 0.35);
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, #33c2ff, #1884ec);
    box-shadow: 0 4px 16px rgba(0, 150, 255, 0.5);
  }

  /* antd 输入框 */
  .ant-input {
    background: rgba(15, 40, 69, 0.6) !important;
    border: 1px solid rgba(0, 212, 255, 0.25) !important;
    color: #e8f4ff !important;
    &::placeholder {
      color: #7fa6d4 !important;
    }
    &:hover,
    &:focus {
      border-color: #00d4ff !important;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.2) !important;
    }
  }

  /* antd 日期选择器 */
  .ant-picker {
    background: rgba(15, 40, 69, 0.6) !important;
    border: 1px solid rgba(0, 212, 255, 0.25) !important;
    .ant-picker-input > input {
      color: #e8f4ff !important;
      &::placeholder {
        color: #7fa6d4 !important;
      }
    }
    .ant-picker-suffix {
      color: #00d4ff !important;
    }
    .ant-picker-clear {
      background: transparent !important;
      color: #7fa6d4 !important;
    }
    &:hover,
    &:focus {
      border-color: #00d4ff !important;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.2) !important;
    }
  }

  /* antd 单选按钮组 */
  .ant-radio-button-wrapper {
    background: transparent !important;
    border-color: rgba(0, 212, 255, 0.25) !important;
    color: #b0c7e0 !important;
    &:hover {
      color: #00d4ff !important;
    }
    &.ant-radio-button-wrapper-checked {
      background: rgba(0, 212, 255, 0.12) !important;
      border-color: #00d4ff !important;
      color: #00d4ff !important;
      &::before {
        background-color: #00d4ff !important;
      }
    }
  }

  /* antd 页签 */
  .ant-tabs-top > .ant-tabs-nav {
    margin-bottom: 12px;
  }
  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
    background: rgba(15, 40, 69, 0.6) !important;
    border: 1px solid rgba(0, 212, 255, 0.18) !important;
    color: #8a9ab0 !important;
    &:hover {
      color: #00d4ff !important;
    }
  }
  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
    background: rgba(0, 212, 255, 0.12) !important;
    border-color: #00d4ff !important;
    .ant-tabs-tab-btn {
      color: #00d4ff !important;
      font-weight: 600;
    }
  }
  .ant-tabs-ink-bar {
    background: #00d4ff !important;
  }

  /* antd 表格 */
  .ant-table {
    background: transparent !important;
    font-size: 13px;
  }
  .ant-table-container,
  .ant-table-content,
  .ant-table-tbody,
  .ant-table-thead {
    background: transparent !important;
  }
  .ant-table-thead > tr > th {
    background: rgba(0, 162, 232, 0.12) !important;
    color: #a0d4ff !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.18) !important;
    font-weight: 500;
  }
  .ant-table-tbody > tr > td {
    color: #d8e4f0 !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.12) !important;
    background: transparent !important;
  }
  .ant-table-tbody > tr:hover > td {
    background: rgba(0, 212, 255, 0.06) !important;
  }
  .ant-table-placeholder .ant-empty-description {
    color: #7fa6d4 !important;
  }
  .ant-table-cell-scrollbar {
    box-shadow: none !important;
  }

  /* antd 分页 */
  .ant-pagination li .ant-pagination-item {
    background: transparent !important;
    border-color: rgba(0, 212, 255, 0.2) !important;
    a {
      color: #b0c7e0 !important;
    }
    &:hover {
      border-color: #00d4ff !important;
      a {
        color: #00d4ff !important;
      }
    }
  }
  .ant-pagination .ant-pagination-item-active {
    background: rgba(0, 212, 255, 0.12) !important;
    border-color: #00d4ff !important;
    a {
      color: #00d4ff !important;
    }
  }
  .ant-pagination .ant-pagination-prev button,
  .ant-pagination .ant-pagination-next button {
    background: transparent !important;
    border-color: rgba(0, 212, 255, 0.2) !important;
    color: #b0c7e0 !important;
  }
  .ant-pagination .ant-pagination-item-disabled a,
  .ant-pagination .ant-pagination-disabled button {
    color: rgba(176, 199, 224, 0.35) !important;
  }
}
</style>

<style lang="less">
/* ==================== 箱子遥测详情弹窗（白色主题覆盖） ==================== */
.theme-white .box-telemetry-modal {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);

  .ant-modal-content {
    position: relative;
    background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%) !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.35), 0 8px 30px rgba(0, 21, 41, 0.18) !important;
    overflow: visible !important;
  }
  .ant-modal-header {
    position: relative;
    background: #fafbfc !important;
    border-bottom: 1px solid rgba(24, 144, 255, 0.12) !important;
    padding: 16px 24px !important;
    border-radius: 6px 6px 0 0 !important;
    margin-bottom: 0 !important;
  }
  .ant-modal-title {
    position: relative;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding-left: 12px;
    text-shadow: 0 0 12px rgba(24, 144, 255, 0.4);
  }
  .ant-modal-title::before {
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
  .ant-modal-close {
    top: 16px !important;
    right: 20px !important;

    .ant-modal-close-x {
      color: #606266 !important;
      font-size: 18px !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover {
        color: #1890ff !important;
        transform: rotate(90deg);
      }
    }
  }
  .ant-modal-body {
    padding: 24px;
    max-height: 72vh;
    overflow-y: auto;
  }

  .modal-title {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.08), rgba(24, 144, 255, 0.02));
    border: 1px solid rgba(24, 144, 255, 0.35);
  }
  .title-icon {
    color: #1890ff;
    filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.4));
  }
  .title-label {
    color: #909399;
  }
  .title-value {
    color: #303133;
  }

  .modal-tip {
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
  }
  .tip-icon {
    color: #1890ff;
  }
  .tip-text {
    color: #606266;
  }
  .tip-sep {
    color: #909399;
  }

  .table-container {
    background: #ffffff;
    border: 1px solid #e4e7ed;
  }

  /* 表格（与回路控制弹窗 device-table 一致） */
  .device-table thead th {
    color: #606266;
    border-bottom: 1px solid #e4e7ed;
  }
  .device-table tbody td {
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
  }
  .device-table tbody tr:last-child td {
    border-bottom: none;
  }
  .device-table tbody tr:hover {
    background: rgba(24, 144, 255, 0.05);
  }
  .table-scroll {
    min-height: 400px;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: auto;
    border-top: none;
    padding-right: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.04);

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.04);
      border-radius: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.35);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);

      &:hover {
        background: rgba(0, 0, 0, 0.35);
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
      }
    }
    &::-webkit-scrollbar-thumb:active {
      background: rgba(0, 0, 0, 0.35);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.18);
    }
  }

  .modal-footer {
    background: #fafbfc;
    border-top: 1px solid #e4e7ed;
  }
  .total-count {
    color: #606266;
  }
  .count-num {
    color: #1890ff;
  }

  .btn {
    color: #606266;
  }
  .btn-primary {
    background: linear-gradient(135deg, #1890ff, #096dd9);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, #40a9ff, #1890ff);
  }

  .ant-input {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    color: #303133 !important;
    &::placeholder {
      color: #909399 !important;
    }
    &:hover,
    &:focus {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
    }
  }

  .ant-picker {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    .ant-picker-input > input {
      color: #303133 !important;
      &::placeholder {
        color: #909399 !important;
      }
    }
    .ant-picker-suffix {
      color: #1890ff !important;
    }
    .ant-picker-clear {
      background: transparent !important;
      color: #909399 !important;
    }
    &:hover,
    &:focus {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
    }
  }

  .ant-radio-button-wrapper {
    background: #ffffff !important;
    border-color: #dcdfe6 !important;
    color: #606266 !important;
    &:hover {
      color: #1890ff !important;
    }
    &.ant-radio-button-wrapper-checked {
      background: #1890ff !important;
      border-color: #1890ff !important;
      color: #ffffff !important;
      &::before {
        background-color: #1890ff !important;
      }
    }
  }

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
    background: #f5f7fa !important;
    border: 1px solid #e4e7ed !important;
    color: #606266 !important;
    &:hover {
      color: #1890ff !important;
    }
  }
  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
    background: #ffffff !important;
    border-color: #1890ff !important;
    .ant-tabs-tab-btn {
      color: #1890ff !important;
      font-weight: 600;
    }
  }
  .ant-tabs-ink-bar {
    background: #1890ff !important;
  }

  .ant-table-thead > tr > th {
    background: #f5f7fa !important;
    color: #303133 !important;
    border-bottom: 1px solid #ebeef5 !important;
  }
  .ant-table-tbody > tr > td {
    color: #303133 !important;
    border-bottom: 1px solid #ebeef5 !important;
    background: #ffffff !important;
  }
  .ant-table-tbody > tr:hover > td {
    background: #e6f7ff !important;
  }
  .ant-table-placeholder .ant-empty-description {
    color: #909399 !important;
  }

  .ant-pagination li .ant-pagination-item {
    background: #ffffff !important;
    border-color: #dcdfe6 !important;
    a {
      color: #606266 !important;
    }
    &:hover {
      border-color: #1890ff !important;
      a {
        color: #1890ff !important;
      }
    }
  }
  .ant-pagination .ant-pagination-item-active {
    background: #1890ff !important;
    border-color: #1890ff !important;
    a {
      color: #ffffff !important;
    }
  }
  .ant-pagination .ant-pagination-prev button,
  .ant-pagination .ant-pagination-next button {
    background: #ffffff !important;
    border-color: #dcdfe6 !important;
    color: #606266 !important;
  }
  .ant-pagination .ant-pagination-item-disabled a,
  .ant-pagination .ant-pagination-disabled button {
    color: rgba(96, 98, 102, 0.35) !important;
  }
}

/* 箱子详情 Tabs「更多」下拉菜单（通过 popupClassName 控制主题） */
.box-tabs-dropdown-black .ant-tabs-dropdown-menu {
  background: rgba(15, 40, 69, 0.96) !important;
  border: 1px solid rgba(0, 212, 255, 0.25) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
}
.box-tabs-dropdown-black .ant-tabs-dropdown-menu-item {
  color: #e8f4ff !important;
  &:hover {
    background: rgba(0, 212, 255, 0.12) !important;
  }
}
.box-tabs-dropdown-black .ant-tabs-dropdown-menu-item-active {
  background: rgba(0, 212, 255, 0.2) !important;
  color: #00d4ff !important;
}
.box-tabs-dropdown-white .ant-tabs-dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #e4e7ed !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
.box-tabs-dropdown-white .ant-tabs-dropdown-menu-item {
  color: #606266 !important;
  &:hover {
    background: rgba(24, 144, 255, 0.08) !important;
  }
}
.box-tabs-dropdown-white .ant-tabs-dropdown-menu-item-active {
  background: rgba(24, 144, 255, 0.12) !important;
  color: #1890ff !important;
}
</style>
