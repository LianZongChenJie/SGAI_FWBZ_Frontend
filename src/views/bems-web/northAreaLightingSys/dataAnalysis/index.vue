<template>
  <div class="runtime-analysis" :class="themeClass">
    <a-tabs v-model:activeKey="activeKey" class="dark-tabs">
      <a-tab-pane tab="运行时长" key="run-time" forceRender>
        <a-row :gutter="16">
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <span class="title-icon blue"></span>
                <span>各地块运行时长（本月）</span>
              </div>
              <div class="chart-container" ref="runtimeChartRef"></div>
            </div>
          </a-col>
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <BarChartOutlined class="title-icon chart-icon" />
                <span>运行时长对比</span>
              </div>
              <a-table
                :columns="runtimeCompareColumns"
                :data-source="runtimeCompareData"
                :pagination="false"
                :loading="loading"
                class="dark-table"
                row-key="area"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'area'">
                    <span class="area-name">{{ record.area }}</span>
                    <span class="area-sub">{{ record.areaName }}</span>
                  </template>
                  <template v-if="column.key === 'yoy'">
                    <span :class="['yoy-text', record.yoy >= 0 ? 'up' : 'down']">
                      {{ record.yoy >= 0 ? '+' : '' }}{{ record.yoy }}%
                    </span>
                  </template>
                </template>
              </a-table>
            </div>
          </a-col>
        </a-row>
      </a-tab-pane>

      <a-tab-pane tab="用电量" key="electri-city" forceRender>
        <a-row :gutter="16">
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <ThunderboltOutlined class="title-icon chart-icon" />
                <span>各地块用电量趋势（近30天）</span>
              </div>
              <div class="chart-container" ref="trendChartRef"></div>
            </div>
          </a-col>
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <PieChartOutlined class="title-icon chart-icon" />
                <span>用电成本分析</span>
              </div>
              <div class="chart-container" ref="costChartRef"></div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <div class="data-card">
              <div class="card-title">
                <ContainerOutlined class="title-icon chart-icon" />
                <span>用电明细</span>
              </div>
              <a-table
                :columns="electricityColumns"
                :data-source="electricityData"
                :pagination="false"
                :loading="loading"
                class="dark-table"
                row-key="area"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'area'">
                    <span class="area-name">{{ record.area }}</span>
                    <span class="area-sub">{{ record.areaName }}</span>
                  </template>
                  <template v-if="column.key === 'mom'">
                    <span :class="['yoy-text', record.mom >= 0 ? 'up' : 'down']">
                      {{ record.mom >= 0 ? '+' : '' }}{{ record.mom }}%
                    </span>
                  </template>
                  <template v-if="column.key === 'cost'">
                    <span class="cost-text">¥{{ record.cost.toLocaleString() }}</span>
                  </template>
                </template>
              </a-table>
            </div>
          </a-col>
        </a-row>
      </a-tab-pane>

      <a-tab-pane tab="运行特性" key="run-info" forceRender>
        <a-row :gutter="16">
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <DashboardOutlined class="title-icon chart-icon" />
                <span>园区整体运行特性</span>
              </div>
              <div class="chart-container" ref="featureChartRef"></div>
            </div>
          </a-col>
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <!-- <MoonOutlined class="title-icon chart-icon" /> -->
                <span>夜间运行模式分析</span>
              </div>
              <div class="chart-container" ref="nightChartRef"></div>
            </div>
          </a-col>
        </a-row>
      </a-tab-pane>

      <a-tab-pane tab="故障分析" key="fault-info" forceRender>
        <a-row :gutter="16">
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <WarningOutlined class="title-icon chart-icon warning" />
                <span>故障类型分布</span>
              </div>
              <div class="chart-container" ref="faultTypeChartRef"></div>
            </div>
          </a-col>
          <a-col :xl="12" :lg="24" :md="24" class="mb-16">
            <div class="data-card">
              <div class="card-title">
                <LineChartOutlined class="title-icon chart-icon warning" />
                <span>故障趋势（近30天）</span>
              </div>
              <div class="chart-container" ref="faultTrendChartRef"></div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <div class="data-card">
              <div class="card-title">
                <FileTextOutlined class="title-icon chart-icon warning" />
                <span>故障明细</span>
              </div>
              <a-table
                :columns="faultColumns"
                :data-source="faultData"
                :pagination="false"
                :loading="loading"
                class="dark-table"
                row-key="id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :class="['status-tag', `status-${record.status}`]">
                      {{ statusMap[record.status] }}
                    </a-tag>
                  </template>
                  <template v-if="column.key === 'action'">
                    <a-button
                      v-if="record.status === 'pending'"
                      type="primary"
                      size="small"
                      class="action-btn primary"
                      @click="handleAction(record)"
                    >
                      转工单
                    </a-button>
                    <a-button
                      v-else-if="record.status === 'processing'"
                      type="primary"
                      size="small"
                      class="action-btn primary"
                      @click="handleAction(record)"
                    >
                      查看
                    </a-button>
                    <a-button
                      v-else
                      size="small"
                      class="action-btn default"
                      @click="handleAction(record)"
                    >
                      详情
                    </a-button>
                  </template>
                </template>
              </a-table>
            </div>
          </a-col>
        </a-row>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import {
  BarChartOutlined,
  ThunderboltOutlined,
  PieChartOutlined,
  ContainerOutlined,
  DashboardOutlined,
  WarningOutlined,
  LineChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue';

const activeKey = ref('run-time');
const loading = ref(false);
const runtimeChartRef = ref(null);
const trendChartRef = ref(null);
const costChartRef = ref(null);
const featureChartRef = ref(null);
const nightChartRef = ref(null);
const faultTypeChartRef = ref(null);
const faultTrendChartRef = ref(null);
let runtimeChart = null;
let trendChart = null;
let costChart = null;
let featureChart = null;
let nightChart = null;
let faultTypeChart = null;
let faultTrendChart = null;

// ================= 运行时长 Tab 数据 =================
const runtimeData = [
  { name: 'A1', value: 5280, color: '#1890ff' },
  { name: 'A2', value: 8640, color: '#22c55e' },
  { name: 'B1', value: 4320, color: '#f59e0b' },
  { name: 'B2', value: 7920, color: '#ef4444' },
  { name: 'C1', value: 12480, color: '#8b5cf6' },
];

const runtimeCompareColumns = [
  { title: '地块', key: 'area', dataIndex: 'area', align: 'left' },
  { title: '回路数', key: 'loops', dataIndex: 'loops', align: 'center' },
  { title: '总运行时长', key: 'totalTime', dataIndex: 'totalTime', align: 'center' },
  { title: '平均时长', key: 'avgTime', dataIndex: 'avgTime', align: 'center' },
  { title: '同比', key: 'yoy', dataIndex: 'yoy', align: 'center' },
];

const runtimeCompareData = [
  { area: 'C1', areaName: '科技大厦', loops: 56, totalTime: '12,480 h', avgTime: '8.2 h/日', yoy: 5 },
  { area: 'A2', areaName: '服贸会场馆', loops: 36, totalTime: '8,640 h', avgTime: '8.0 h/日', yoy: 2 },
  { area: 'B2', areaName: '滨水绿道', loops: 42, totalTime: '7,920 h', avgTime: '7.5 h/日', yoy: -3 },
  { area: 'A1', areaName: '冬奥广场', loops: 24, totalTime: '5,760 h', avgTime: '8.0 h/日', yoy: 1 },
  { area: 'B1', areaName: '工业遗址公园', loops: 18, totalTime: '4,320 h', avgTime: '7.8 h/日', yoy: 4 },
];

// ================= 用电量 Tab 数据 =================
const trendDates = ['5/23', '5/28', '6/2', '6/7', '6/12', '6/17', '6/22'];
const trendSeries = [
  { name: 'A1', color: '#0ea5e9', data: [300, 290, 330, 320, 350, 360, 380] },
  { name: 'A2', color: '#22c55e', data: [500, 485, 520, 540, 565, 585, 605] },
  { name: 'C1', color: '#f59e0b', data: [700, 685, 725, 745, 775, 795, 815] },
];

const costData = [
  { name: 'C1科技大厦', value: 24850, color: '#0ea5e9' },
  { name: 'A2服贸会', value: 18420, color: '#22c55e' },
  { name: 'B2滨水绿道', value: 14560, color: '#f59e0b' },
  { name: 'A1冬奥广场', value: 11340, color: '#ef4444' },
  { name: 'B1工业公园', value: 8960, color: '#8b5cf6' },
];

const electricityColumns = [
  { title: '地块', key: 'area', dataIndex: 'area', align: 'left' },
  { title: '本月用电', key: 'currentMonth', dataIndex: 'currentMonth', align: 'center' },
  { title: '上月用电', key: 'lastMonth', dataIndex: 'lastMonth', align: 'center' },
  { title: '环比', key: 'mom', dataIndex: 'mom', align: 'center' },
  { title: '估算电费', key: 'cost', dataIndex: 'cost', align: 'center' },
  { title: '单耗（KWH/㎡）', key: 'unitConsumption', dataIndex: 'unitConsumption', align: 'center' },
];

const electricityData = [
  { area: 'C1', areaName: '科技大厦', currentMonth: '24,850', lastMonth: '23,100', mom: 7.6, cost: 29820, unitConsumption: 8.2 },
  { area: 'A2', areaName: '服贸会场馆', currentMonth: '18,420', lastMonth: '17,850', mom: 3.2, cost: 22104, unitConsumption: 6.5 },
  { area: 'B2', areaName: '滨水绿道', currentMonth: '14,560', lastMonth: '15,200', mom: -4.2, cost: 17472, unitConsumption: 4.1 },
  { area: 'A1', areaName: '冬奥广场', currentMonth: '11,340', lastMonth: '10,800', mom: 5.0, cost: 13608, unitConsumption: 5.8 },
  { area: 'B1', areaName: '工业遗址公园', currentMonth: '8,960', lastMonth: '8,400', mom: 6.7, cost: 10752, unitConsumption: 3.9 },
];

// ================= 运行特性 Tab 数据 =================
const featureHours = ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00', '24:00'];
const featureSeries = [
  { name: '功率(KW)', type: 'line', yAxisIndex: 0, color: '#0ea5e9', data: [0, 0, 0, 0, 0, 320, 280] },
  { name: '设备在线率', type: 'line', yAxisIndex: 1, color: '#22c55e', data: [100, 100, 100, 100, 100, 100, 100] },
];

const nightDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const nightData = [0, 0, 0, 0, 9.0, 10.0, 10.0];

// ================= 故障分析 Tab 数据 =================
const faultTypeData = [
  { name: '通信故障', value: 12, color: '#ef4444' },
  { name: '功率异常', value: 9, color: '#f59e0b' },
  { name: '电压异常', value: 6, color: '#0ea5e9' },
  { name: '离线故障', value: 7, color: '#8b5cf6' },
  { name: '定时失败', value: 2, color: '#22c55e' },
];

const faultTrendData = [5, 3, 8, 4, 6, 2, 3];

const faultColumns = [
  { title: '时间', key: 'time', dataIndex: 'time', align: 'left' },
  { title: '地块', key: 'area', dataIndex: 'area', align: 'center' },
  { title: '设备', key: 'device', dataIndex: 'device', align: 'center' },
  { title: '故障类型', key: 'type', dataIndex: 'type', align: 'center' },
  { title: '描述', key: 'desc', dataIndex: 'desc', align: 'left' },
  { title: '状态', key: 'status', dataIndex: 'status', align: 'center' },
  { title: '处理', key: 'action', align: 'center' },
];

const statusMap = {
  pending: '未处理',
  processing: '处理中',
  resolved: '已修复',
};

const faultData = [
  { id: 1, time: '2026-06-22 18:11', area: 'B2', device: '回路07', type: '通信故障', desc: 'PLC通信超时，数据中断', status: 'pending' },
  { id: 2, time: '2026-06-21 23:46', area: 'A2', device: '回路11', type: '用电异常', desc: '功率突增35%，超过阈值', status: 'processing' },
  { id: 3, time: '2026-06-20 19:05', area: 'C1', device: '回路22', type: '离线故障', desc: '设备离线超过2小时', status: 'resolved' },
];

const handleAction = (record) => {
  console.log('处理故障', record);
};

const commonTooltip = {
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  borderColor: '#1e293b',
  textStyle: { color: '#e2e8f0' },
};

const initRuntimeChart = () => {
  if (!runtimeChartRef.value) return;
  runtimeChart = echarts.init(runtimeChartRef.value);
  runtimeChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...commonTooltip,
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0];
        return `${item.name}<br/>${item.marker}${item.seriesName}: ${item.value.toLocaleString()} h`;
      },
    },
    legend: {
      data: ['本月运行时长(h)'],
      textStyle: { color: '#94a3b8' },
      top: 0,
      right: 0,
    },
    grid: { left: '2%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: runtimeData.map((item) => item.name),
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      min: 4000,
      max: 13000,
      interval: 1000,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b', fontSize: 12 },
    },
    series: [
      {
        name: '本月运行时长(h)',
        type: 'bar',
        data: runtimeData.map((item) => ({ value: item.value, itemStyle: { color: item.color } })),
        barWidth: '45%',
      },
    ],
  });
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  trendChart = echarts.init(trendChartRef.value);
  trendChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { ...commonTooltip, trigger: 'axis' },
    legend: {
      data: trendSeries.map((s) => s.name),
      textStyle: { color: '#94a3b8' },
      top: 0,
      left: 'center',
      itemWidth: 22,
      itemHeight: 10,
    },
    grid: { left: '2%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendDates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      min: 300,
      max: 900,
      interval: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b', fontSize: 12 },
    },
    series: trendSeries.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: s.color },
      lineStyle: { width: 2.5, color: s.color },
    })),
  });
};

const initCostChart = () => {
  if (!costChartRef.value) return;
  costChart = echarts.init(costChartRef.value);
  costChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...commonTooltip,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      data: costData.map((item) => item.name),
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0,
      left: 'center',
      itemWidth: 14,
      itemHeight: 10,
    },
    series: [
      {
        name: '用电成本',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '58%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 0, borderColor: '#111827', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, color: '#e2e8f0', formatter: '{b}\n{d}%' } },
        data: costData.map((item) => ({ value: item.value, name: item.name, itemStyle: { color: item.color } })),
      },
    ],
  });
};

const initFeatureChart = () => {
  if (!featureChartRef.value) return;
  featureChart = echarts.init(featureChartRef.value);
  featureChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { ...commonTooltip, trigger: 'axis' },
    legend: {
      data: featureSeries.map((s) => s.name),
      textStyle: { color: '#94a3b8' },
      top: 0,
      left: 'center',
      itemWidth: 22,
      itemHeight: 10,
    },
    grid: { left: '2%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: featureHours,
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 350,
        interval: 50,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { color: '#64748b', fontSize: 12 },
      },
      {
        type: 'value',
        min: 95,
        max: 105,
        interval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#64748b', fontSize: 12, formatter: '{value}%' },
      },
    ],
    series: featureSeries.map((s) => ({
      name: s.name,
      type: s.type,
      yAxisIndex: s.yAxisIndex,
      data: s.data,
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: s.color },
      lineStyle: { width: 2.5, color: s.color },
    })),
  });
};

const initNightChart = () => {
  if (!nightChartRef.value) return;
  nightChart = echarts.init(nightChartRef.value);
  nightChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...commonTooltip,
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} h',
    },
    legend: {
      data: ['开启时长(h)'],
      textStyle: { color: '#94a3b8' },
      top: 0,
      right: 0,
    },
    grid: { left: '2%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: nightDays,
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      min: 8.0,
      max: 10.0,
      interval: 0.2,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b', fontSize: 12 },
    },
    series: [
      {
        name: '开启时长(h)',
        type: 'bar',
        data: nightData,
        barWidth: '45%',
        itemStyle: { color: '#0ea5e9' },
      },
    ],
  });
};

const initFaultTypeChart = () => {
  if (!faultTypeChartRef.value) return;
  faultTypeChart = echarts.init(faultTypeChartRef.value);
  faultTypeChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...commonTooltip,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      data: faultTypeData.map((item) => item.name),
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0,
      left: 'center',
      itemWidth: 24,
      itemHeight: 20,
    },
    series: [
      {
        name: '故障类型',
        type: 'pie',
        radius: '65%',
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#111827', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, color: '#e2e8f0', formatter: '{b}\n{d}%' } },
        data: faultTypeData.map((item) => ({ value: item.value, name: item.name, itemStyle: { color: item.color } })),
      },
    ],
  });
};

const initFaultTrendChart = () => {
  if (!faultTrendChartRef.value) return;
  faultTrendChart = echarts.init(faultTrendChartRef.value);
  faultTrendChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...commonTooltip,
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c}',
    },
    legend: {
      data: ['故障数'],
      textStyle: { color: '#94a3b8' },
      top: 0,
      right: '15%',
    },
    grid: { left: '2%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendDates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      min: 2,
      max: 8,
      interval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b', fontSize: 12 },
    },
    series: [
      {
        name: '故障数',
        type: 'line',
        data: faultTrendData,
        smooth: false,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 2.5, color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.4)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.05)' },
          ]),
        },
      },
    ],
  });
};

const handleResize = () => {
  if (runtimeChart) runtimeChart.resize();
  if (trendChart) trendChart.resize();
  if (costChart) costChart.resize();
  if (featureChart) featureChart.resize();
  if (nightChart) nightChart.resize();
  if (faultTypeChart) faultTypeChart.resize();
  if (faultTrendChart) faultTrendChart.resize();
};

const chartResizeMap = {
  'run-time': () => runtimeChart?.resize(),
  'electri-city': () => { trendChart?.resize(); costChart?.resize(); },
  'run-info': () => { featureChart?.resize(); nightChart?.resize(); },
  'fault-info': () => { faultTypeChart?.resize(); faultTrendChart?.resize(); },
};

watch(activeKey, (newKey) => {
  nextTick(() => {
    setTimeout(() => {
      chartResizeMap[newKey]?.();
    }, 100);
  });
});

const loadData = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 300));
  loading.value = false;
};

onMounted(() => {
  loadData();
  initRuntimeChart();
  initTrendChart();
  initCostChart();
  initFeatureChart();
  initNightChart();
  initFaultTypeChart();
  initFaultTrendChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (runtimeChart) { runtimeChart.dispose(); runtimeChart = null; }
  if (trendChart) { trendChart.dispose(); trendChart = null; }
  if (costChart) { costChart.dispose(); costChart = null; }
  if (featureChart) { featureChart.dispose(); featureChart = null; }
  if (nightChart) { nightChart.dispose(); nightChart = null; }
  if (faultTypeChart) { faultTypeChart.dispose(); faultTypeChart = null; }
  if (faultTrendChart) { faultTrendChart.dispose(); faultTrendChart = null; }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.runtime-analysis {
  padding: 16px;
  background: #0b1120;
  min-height: 100%;
}

.dark-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
  border-bottom: 1px solid #303d50;
}

.dark-tabs :deep(.ant-tabs-nav::before) {
  border-bottom: none;
}

.dark-tabs :deep(.ant-tabs-tab) {
  color: #a0aabf;
  font-size: 14px;
  padding: 8px 0;
  margin-right: 24px;
}

.dark-tabs :deep(.ant-tabs-tab:hover) {
  color: #ffffff;
}

.dark-tabs :deep(.ant-tabs-tab-active) {
  color: #00a2e8 !important;
}

.dark-tabs :deep(.ant-tabs-ink-bar) {
  background: #00a2e8;
  height: 2px;
}

.mb-16 {
  margin-bottom: 16px;
}

.data-card {
  background: #111827;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f1f5f9;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.title-icon {
  width: 4px;
  height: 16px;
  border-radius: 2px;
}

.title-icon.blue {
  background: #38bdf8;
}

.title-icon.chart-icon {
  width: auto;
  height: auto;
  color: #f59e0b;
  font-size: 16px;
}

.title-icon.chart-icon.warning {
  color: #ef4444;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.placeholder {
  color: #64748b;
  text-align: center;
  padding: 80px 0;
}

/* 深色表格 */
.dark-table :deep(.ant-table) {
  background: transparent;
  color: #e2e8f0;
}

.dark-table :deep(.ant-table-thead > tr > th) {
  background: #0f172a;
  color: #94a3b8;
  border-bottom: 1px solid #1e293b;
  font-weight: 500;
}

.dark-table :deep(.ant-table-tbody > tr > td) {
  background: transparent;
  color: #e2e8f0;
  border-bottom: 1px solid #1e293b;
}

.dark-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #1e293b !important;
}

.area-name {
  display: inline-block;
  color: #e2e8f0;
  font-weight: 500;
  min-width: 40px;
}

.area-sub {
  color: #94a3b8;
  margin-left: 8px;
}

.yoy-text {
  font-weight: 500;
}

.yoy-text.up {
  color: #22c55e;
}

.yoy-text.down {
  color: #ef4444;
}

.cost-text {
  color: #f59e0b;
  font-weight: 500;
}

/* 故障状态标签 */
.status-tag {
  border: none;
  background: transparent;
  font-size: 12px;
}

.status-tag :deep(.ant-tag) {
  margin: 0;
}

.status-pending {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.status-processing {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
}

.status-resolved {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
}

/* 操作按钮 */
.action-btn {
  min-width: 64px;
  border-radius: 4px;
  font-size: 12px;
}

.action-btn.primary {
  background: #0ea5e9;
  border-color: #0ea5e9;
  color: #fff;
}

.action-btn.primary:hover {
  background: #0284c7;
  border-color: #0284c7;
  color: #fff;
}

.action-btn.default {
  background: transparent;
  border-color: #475569;
  color: #e2e8f0;
}

.action-btn.default:hover {
  border-color: #94a3b8;
  color: #fff;
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped>
.theme-white.runtime-analysis {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100%;
}.theme-white .dark-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}.theme-white .dark-tabs :deep(.ant-tabs-nav::before) {
  border-bottom: none;
}.theme-white .dark-tabs :deep(.ant-tabs-tab) {
  color: #606266;
  font-size: 14px;
  padding: 8px 0;
  margin-right: 24px;
}.theme-white .dark-tabs :deep(.ant-tabs-tab:hover) {
  color: #1890ff;
}.theme-white .dark-tabs :deep(.ant-tabs-tab-active) {
  color: #1890ff !important;
}.theme-white .dark-tabs :deep(.ant-tabs-ink-bar) {
  background: #1890ff;
  height: 2px;
}.theme-white .mb-16 {
  margin-bottom: 16px;
}.theme-white .data-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}.theme-white .card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}.theme-white .title-icon {
  width: 4px;
  height: 16px;
  border-radius: 2px;
}.theme-white .title-icon.blue {
  background: #1890ff;
}.theme-white .title-icon.chart-icon {
  width: auto;
  height: auto;
  color: #f59e0b;
  font-size: 16px;
}.theme-white .title-icon.chart-icon.warning {
  color: #ef4444;
}.theme-white .chart-container {
  width: 100%;
  height: 320px;
}.theme-white .placeholder {
  color: #909399;
  text-align: center;
  padding: 80px 0;
}.theme-white /* 浅色表格 */
.dark-table :deep(.ant-table) {
  background: transparent;
  color: #303133;
}.theme-white .dark-table :deep(.ant-table-thead > tr > th) {
  background: #f5f7fa;
  color: #606266;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
}.theme-white .dark-table :deep(.ant-table-tbody > tr > td) {
  background: transparent;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
}.theme-white .dark-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(24, 144, 255, 0.05) !important;
}.theme-white .area-name {
  display: inline-block;
  color: #303133;
  font-weight: 500;
  min-width: 40px;
}.theme-white .area-sub {
  color: #909399;
  margin-left: 8px;
}.theme-white .yoy-text {
  font-weight: 500;
}.theme-white .yoy-text.up {
  color: #52c41a;
}.theme-white .yoy-text.down {
  color: #ff4d4f;
}.theme-white .cost-text {
  color: #f59e0b;
  font-weight: 500;
}.theme-white /* 故障状态标签 */
.status-tag {
  border: none;
  background: transparent;
  font-size: 12px;
}.theme-white .status-tag :deep(.ant-tag) {
  margin: 0;
}.theme-white .status-pending {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}.theme-white .status-processing {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
}.theme-white .status-resolved {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.12);
}.theme-white /* 操作按钮 */
.action-btn {
  min-width: 64px;
  border-radius: 4px;
  font-size: 12px;
}.theme-white .action-btn.primary {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}.theme-white .action-btn.primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  color: #fff;
}.theme-white .action-btn.default {
  background: transparent;
  border-color: #dcdfe6;
  color: #606266;
}.theme-white .action-btn.default:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>
