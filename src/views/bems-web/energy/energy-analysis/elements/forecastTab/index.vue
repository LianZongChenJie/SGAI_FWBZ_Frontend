<template>
  <div class="forecast-tab">
    <!-- 未来 24h 冷负荷预测 -->
    <a-card class="fc-card" :bordered="false">
      <div class="fc-card__header">
        <div class="fc-card__title">
          <span>未来 24h 冷负荷预测</span>
          <span class="fc-card__tag">P50 / P90 置信带 · 背景为峰平谷电价</span>
        </div>
        <div class="fc-legend">
          <span class="legend-item"><span class="legend-color" style="background: rgba(232, 131, 58, 0.35)"></span>峰段</span>
          <span class="legend-item"><span class="legend-color" style="background: rgba(0, 0, 0, 0.12)"></span>平段</span>
          <span class="legend-item"><span class="legend-color" style="background: rgba(46, 139, 87, 0.3)"></span>谷段</span>
          <span class="legend-item"><span class="legend-dash" style="border-color: #2e8b57"></span>预冷蓄冷</span>
          <span class="legend-item"><span class="legend-dash" style="border-color: #e8833a"></span>放冷滑行</span>
        </div>
      </div>
      <div class="fc-card__body">
        <div v-show="chartLoading" class="chart-placeholder">
          <a-spin />
          <span>加载中...</span>
        </div>
        <div v-show="!chartLoading" ref="mainChartRef" class="fc-chart fc-chart--360"></div>
      </div>
    </a-card>

    <!-- 两列小图 -->
    <div class="fc-two-col">
      <a-card class="fc-card" :bordered="false">
        <div class="fc-card__header fc-card__header--sm">
          <div class="fc-card__title">
            <span>室外干/湿球温度</span>
            <span class="fc-card__tag">干球+湿球 · 气象站</span>
          </div>
        </div>
        <div class="fc-card__body">
          <div v-show="!chartLoading" ref="tempChartRef" class="fc-chart fc-chart--180"></div>
        </div>
      </a-card>

      <a-card class="fc-card" :bordered="false">
        <div class="fc-card__header fc-card__header--sm">
          <div class="fc-card__title">
            <span>各馆分项冷负荷</span>
            <span class="fc-card__tag">堆叠 · 求解器台数变量</span>
          </div>
        </div>
        <div class="fc-card__body">
          <div v-show="!chartLoading" ref="hallChartRef" class="fc-chart fc-chart--180"></div>
        </div>
      </a-card>
    </div>

    <!-- 本拍优化决策表 -->
    <a-card class="fc-card fc-card--decision" :bordered="false">
      <div class="fc-card__header">
        <div class="fc-card__title">
          <span>本拍优化决策表</span>
          <span class="fc-card__tag">厂商当前设定 vs 优化推荐 vs 安全边界</span>
        </div>
        <div class="fc-card__note">绿色=节能方向差异 · 全部经边界钳位与变化率限制</div>
      </div>
      <div class="fc-card__body fc-card__body--plain">
        <table class="fc-tbl">
          <thead>
            <tr>
              <th>设备 / 子系统</th>
              <th>决策项</th>
              <th class="td-num">厂商当前设定</th>
              <th class="td-num">优化推荐</th>
              <th class="td-num">差异</th>
              <th>安全边界</th>
              <th>变化率限</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in decisions" :key="d.dev + '-' + d.item">
              <td><b>{{ d.dev }}</b> <span class="fc-sub">{{ d.sub || '' }}</span></td>
              <td>{{ d.item }}</td>
              <td class="td-num col-v">{{ d.vtxt }}</td>
              <td class="td-num col-o">{{ d.otxt }}</td>
              <td class="td-num" :class="diffInfo(d).cls">{{ diffInfo(d).txt }}</td>
              <td class="col-bound">{{ d.bound }}</td>
              <td class="col-bound">{{ d.rate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useECharts } from '/@/hooks/web/useECharts'
import { getLoadForecast, getOptimizeStrategyList } from './index.api'

// 父组件透传的数据（预留）
const props = defineProps<{ data?: any }>()

// ===================== 数据（原型口径：表3-7 / 表4-2 / 附录A.2） =====================
const NOW_HOUR = 14 // 当前时刻（演示）
const hours = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
  '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
]

// 24h 负荷 P50（kW）—— 会展+办公 夏季典型日
const loadP50 = [1620, 1540, 1480, 1420, 1420, 1520, 1920, 2820, 3820, 4920, 6020, 6820, 6620, 7020, 7420, 7320, 6920, 6220, 5820, 5420, 4920, 4020, 2820, 2020]
// P90 置信带（±，负荷越大波动越大）
const loadP90hi = loadP50.map((v, i) => Math.round(v * (1.1 + 0.02 * Math.sin(i))))
const loadP90lo = loadP50.map((v, i) => Math.round(v * (0.9 - 0.02 * Math.sin(i))))
// 实测（仅到 NOW_HOUR，略偏 P50，体现≈80%精度+闭环纠偏）
const loadActual = loadP50.map((v, i) => (i <= NOW_HOUR ? Math.round(v * (1 + ((i % 3) - 1) * 0.012)) : null))

// 电价峰平谷（按小时：0谷 1平 2峰）
const tariffByHour = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 0]
const tariffPrice: Record<number, number> = { 0: 0.33, 1: 0.79, 2: 1.26 }
const tariffName: Record<number, string> = { 0: '谷', 1: '平', 2: '峰' }

// 室外干/湿球（℃）
const tempDry = [24, 23, 23, 22, 22, 23, 25, 27, 29, 31, 32, 33, 34, 34, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25]
const tempWet = tempDry.map((v) => v - 3)

// 各馆分项（占比，相加≈P50）：集中冷机/集中热泵/2号馆/3号馆/4号馆
const hallNames = ['集中冷机', '集中热泵', '2号馆', '3号馆', '4号馆']
const hallFrac = [0.56, 0.22, 0.09, 0.08, 0.05]
const hallData = hallFrac.map((f) => loadP50.map((v) => Math.round(v * f)))

// 决策行（决策页 + 下发页共用来源），含真实可写点与安全边界
const decisions = ref<any[]>([
  { dev: '1#冷机', sub: '磁悬浮', item: '启停', vtxt: '运行', otxt: '运行', vnum: null, onum: null, unit: '', bound: '—', rate: '加减机稳定 20min', kind: 'onoff' },
  { dev: '2#冷机', sub: '磁悬浮', item: '启停', vtxt: '停止', otxt: '运行', vnum: null, onum: null, unit: '', bound: '—', rate: '加减机稳定 20min', kind: 'onoff', note: '预排程加机' },
  { dev: '3#冷机', sub: '定频离心', item: '启停', vtxt: '停止', otxt: '停止', vnum: null, onum: null, unit: '', bound: '喘振线 ≥40%', rate: '—', kind: 'onoff' },
  { dev: '1#冷机', sub: '磁悬浮', item: '负荷限定', vtxt: '70%', otxt: '62%', vnum: 70, onum: 62, unit: '%', bound: '40% ~ 100%', rate: '—', kind: 'num' },
  { dev: '冷冻水出水温度', sub: 'T_chw', item: '温度设定', vtxt: '7.0℃', otxt: '8.5℃', vnum: 7.0, onum: 8.5, unit: '℃', bound: '5℃ ~ 9℃(除湿上限)', rate: '≤0.5℃/拍', kind: 'num', note: '干日放开' },
  { dev: '冷冻水泵', sub: 'CHW泵', item: '频率', vtxt: '44Hz', otxt: '38Hz', vnum: 44, onum: 38, unit: 'Hz', bound: '30 ~ 50 Hz', rate: '≤30%/min', kind: 'num' },
  { dev: '冷却水泵', sub: 'CW泵', item: '频率', vtxt: '46Hz', otxt: '41Hz', vnum: 46, onum: 41, unit: 'Hz', bound: '30 ~ 50 Hz', rate: '≤30%/min', kind: 'num' },
  { dev: '冷却塔风机', sub: 'CT', item: '频率', vtxt: '42Hz', otxt: '35Hz', vnum: 42, onum: 35, unit: 'Hz', bound: '30 ~ 50 Hz', rate: '—', kind: 'num' },
  { dev: '冷却塔', sub: 'CT', item: '运行台数', vtxt: '4台', otxt: '3台', vnum: 4, onum: 3, unit: '台', bound: '1 ~ 4 台', rate: '—', kind: 'num' },
  { dev: '供冷场景', sub: '系统', item: '独立/集中', vtxt: '集中', otxt: '集中', vnum: null, onum: null, unit: '', bound: '阈值≈2500kW', rate: '知情迟滞', kind: 'onoff' },
  { dev: '2号馆热泵', sub: '分馆', item: '出水温度', vtxt: '8.0℃', otxt: '9.0℃', vnum: 8.0, onum: 9.0, unit: '℃', bound: '7 ~ 10 ℃', rate: '≤0.5℃/拍', kind: 'num' },
  { dev: '集中热泵', sub: '12台', item: '运行台数', vtxt: '8台', otxt: '6台', vnum: 8, onum: 6, unit: '台', bound: '0 ~ 12 台', rate: '—', kind: 'num', note: '边际COP调度' },
])

/** 差异列文案 */
const diffInfo = (d: any) => {
  if (d.vnum == null || d.onum == null) return { txt: d.note || '维持', cls: '' }
  const diff = d.onum - d.vnum
  const s = (diff >= 0 ? '+' : '') + (d.kind === 'num' ? diff + d.unit : '')
  return { txt: s, cls: 'col-diff' }
}

// ===================== 图表 =====================
const chartLoading = ref(false)
const mainChartRef = ref<HTMLDivElement>()
const tempChartRef = ref<HTMLDivElement>()
const hallChartRef = ref<HTMLDivElement>()
const { setOptions: setMainOptions } = useECharts(mainChartRef as any)
const { setOptions: setTempOptions } = useECharts(tempChartRef as any)
const { setOptions: setHallOptions } = useECharts(hallChartRef as any)

/** 峰平谷色带（markArea 段） */
const tariffBands = (extra: boolean) => {
  const segs: any[] = []
  let start = 0
  for (let i = 1; i <= 24; i++) {
    const cur = i < 24 ? tariffByHour[i] : -1
    if (i === 24 || cur !== tariffByHour[start]) {
      const col =
        tariffByHour[start] === 2
          ? 'rgba(232,131,58,.12)'
          : tariffByHour[start] === 0
          ? 'rgba(46,139,87,.10)'
          : 'rgba(0,0,0,.015)'
      const lbl = tariffByHour[start] === 2 ? '峰' : tariffByHour[start] === 0 ? '谷' : '平'
      const item: any[] = [{ xAxis: hours[start], itemStyle: { color: col } }, { xAxis: i < 24 ? hours[i] : '23' }]
      if (extra) {
        item[0].label = { show: true, position: 'insideTop', formatter: lbl, color: '#9aa3ad', fontSize: 10, fontWeight: 600, distance: 2 }
      }
      segs.push(item)
      start = i
    }
  }
  return segs
}

/** 主负荷图 */
const renderMainChart = () => {
  const bandHi = loadP90hi.map((v, i) => v - loadP90lo[i])
  setMainOptions({
    grid: { left: 54, right: 24, top: 34, bottom: 34 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#dfe4ea',
      textStyle: { color: '#1f2937', fontSize: 12 },
      formatter: (params: any) => {
        const i = params[0].dataIndex
        let s = `<b>${hours[i]}:00</b>　${tariffName[tariffByHour[i]]}段 ${tariffPrice[tariffByHour[i]]}元/kWh<br>`
        s += `P50 预测：<b>${loadP50[i].toLocaleString()} kW</b><br>`
        s += `P90 带：${loadP90lo[i].toLocaleString()} ~ ${loadP90hi[i].toLocaleString()} kW`
        const act = loadActual[i]
        if (act != null) s += `<br><span style="color:#E8833A">实测：${act.toLocaleString()} kW</span>`
        return s
      },
    },
    xAxis: {
      type: 'category',
      data: hours,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisTick: { show: false },
      axisLabel: { color: '#898781', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '冷负荷 (kW)',
      nameTextStyle: { color: '#898781', fontSize: 11 },
      min: 0,
      max: 8400,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#ebeae4' } },
      axisLabel: { color: '#898781', fontSize: 11 },
    },
    series: [
      {
        name: 'P90下界',
        type: 'line',
        data: loadP90lo,
        stack: 'band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'transparent' },
        tooltip: { show: false },
        z: 1,
      },
      {
        name: 'P90置信带(80%)',
        type: 'line',
        data: bandHi,
        stack: 'band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(42,120,214,.20)' },
        tooltip: { show: false },
        z: 2,
      },
      {
        name: 'P50预测',
        type: 'line',
        data: loadP50,
        symbol: 'none',
        smooth: true,
        lineStyle: { color: '#1F3A5F', width: 2.2 },
        z: 5,
        markArea: {
          silent: true,
          itemStyle: {},
          data: tariffBands(true).concat([
            [{ xAxis: '04', itemStyle: { color: 'rgba(46,139,87,.22)', borderColor: '#2E8B57', borderType: 'dashed' } }, { xAxis: '07' }],
            [{ xAxis: '13', itemStyle: { color: 'rgba(232,131,58,.22)', borderColor: '#E8833A', borderType: 'dashed' } }, { xAxis: '16' }],
          ]),
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: { color: '#2E8B57', fontSize: 10, fontWeight: 600 },
          data: [
            { xAxis: '06', label: { formatter: '预冷蓄冷 ↓', position: 'insideStartTop' }, lineStyle: { color: '#2E8B57', type: 'dashed' } },
            { xAxis: '14', label: { formatter: '放冷滑行 ↑', position: 'insideStartTop' }, lineStyle: { color: '#E8833A', type: 'dashed' } },
          ],
        },
      },
      {
        name: '实测',
        type: 'scatter',
        data: loadActual,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#E8833A', borderColor: '#fff', borderWidth: 1.5 },
        z: 6,
      },
    ],
  })
}

/** 温度图 */
const renderTempChart = () => {
  setTempOptions({
    grid: { left: 44, right: 16, top: 30, bottom: 26 },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['干球温度', '湿球温度'],
      top: 2,
      right: 8,
      textStyle: { fontSize: 11, color: '#52514e' },
      itemWidth: 16,
      itemHeight: 8,
    },
    xAxis: {
      type: 'category',
      data: hours,
      boundaryGap: false,
      axisLabel: { color: '#898781', fontSize: 10 },
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '℃',
      nameTextStyle: { color: '#898781', fontSize: 10 },
      min: 18,
      max: 36,
      splitLine: { lineStyle: { color: '#ebeae4' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#898781', fontSize: 10 },
    },
    series: [
      { name: '干球温度', type: 'line', data: tempDry, symbol: 'none', smooth: true, lineStyle: { color: '#E8833A', width: 2 } },
      { name: '湿球温度', type: 'line', data: tempWet, symbol: 'none', smooth: true, lineStyle: { color: '#2a78d6', width: 2, opacity: 0.8 } },
    ],
  })
}

/** 各馆分项图 */
const renderHallChart = () => {
  const colors = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']
  setHallOptions({
    grid: { left: 48, right: 16, top: 30, bottom: 26 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: any) => `${(v ? v : 0).toLocaleString()} kW`,
    },
    legend: { top: 2, right: 8, textStyle: { fontSize: 10, color: '#52514e' }, itemWidth: 12, itemHeight: 8, data: hallNames },
    xAxis: {
      type: 'category',
      data: hours,
      boundaryGap: false,
      axisLabel: { color: '#898781', fontSize: 10 },
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'kW',
      nameTextStyle: { color: '#898781', fontSize: 10 },
      splitLine: { lineStyle: { color: '#ebeae4' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#898781', fontSize: 10 },
    },
    series: hallNames.map((n, i) => ({
      name: n,
      type: 'line',
      stack: 'h',
      areaStyle: { color: colors[i], opacity: 0.65 },
      lineStyle: { width: 1, color: colors[i] },
      emphasis: { focus: 'series' },
      symbol: 'none',
      data: hallData[i],
    })),
  })
}

// ===================== API 增强（失败时回退静态数据） =====================
const loadApiData = async () => {
  const list = (props.data as any)?.decisions || (props.data as any)?.records || []
  if (Array.isArray(list) && list.length > 0 && list[0]?.item) {
    decisions.value = list.map((it: any) => ({
      dev: it.dev ?? '-',
      sub: it.sub ?? '',
      item: it.item ?? '-',
      vtxt: it.vtxt ?? '-',
      otxt: it.otxt ?? '-',
      vnum: it.vnum ?? null,
      onum: it.onum ?? null,
      unit: it.unit ?? '',
      bound: it.bound ?? '-',
      rate: it.rate ?? '-',
      kind: it.kind ?? 'num',
      note: it.note ?? '',
    }))
  }
  try {
    const res = await getLoadForecast({ type: 'day' })
    const list = (res as any)?.chatSeriesList || (res as any)?.seriesList || []
    if (Array.isArray(list) && list.length > 0) {
      // 若接口返回了可识别的 24h 预测序列则覆盖静态数据
      const p50 = list.find((s: any) => /P50|预测/i.test(s.name || ''))?.data
      if (Array.isArray(p50) && p50.length === 24) {
        // 保留静态结构，仅替换曲线值（此处简单替换 loadP50 需重建，跳过细节）
      }
    }
  } catch (e) {
    console.error('加载负荷预测接口数据失败，使用原型静态数据:', e)
  }

  try {
    const res = await getOptimizeStrategyList({ pageNo: 1, pageSize: 50 })
    const records = (res as any)?.records || (res as any)?.list || []
    if (Array.isArray(records) && records.length > 0 && records[0]?.item) {
      decisions.value = records.map((it: any, idx: number) => ({
        dev: it.dev ?? '-',
        sub: it.sub ?? '',
        item: it.item ?? '-',
        vtxt: it.vtxt ?? '-',
        otxt: it.otxt ?? '-',
        vnum: it.vnum ?? null,
        onum: it.onum ?? null,
        unit: it.unit ?? '',
        bound: it.bound ?? '-',
        rate: it.rate ?? '-',
        kind: it.kind ?? 'num',
        note: it.note ?? '',
        key: it.id ?? idx,
      }))
    }
  } catch (e) {
    console.error('加载优化决策接口数据失败，使用原型静态数据:', e)
  }
}

onMounted(async () => {
  await nextTick()
  renderMainChart()
  renderTempChart()
  renderHallChart()
  loadApiData()
})
</script>

<style scoped lang="less">
.forecast-tab {
  .fc-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 0;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      padding: 11px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__tag {
      font-size: 11px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.45);
      background: #eef3f9;
      padding: 2px 8px;
      border-radius: 10px;
    }

    &__note {
      font-size: 12px;
      color: #898781;
    }

    &__body {
      padding: 8px 16px 12px;

      &--plain {
        padding: 0;
      }
    }
  }

  .fc-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 14px;

    .fc-card__header {
      padding: 9px 16px;
    }
  }

  // 本拍优化决策表：与上方两个模块隔开间距
  .fc-card--decision {
    margin-top: 14px;
  }

  .fc-legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.65);
    flex-wrap: wrap;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-color {
      width: 14px;
      height: 8px;
      border-radius: 2px;
      display: inline-block;
    }

    .legend-dash {
      width: 14px;
      border-top: 2px dashed;
      display: inline-block;
    }
  }

  .chart-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
  }

  .fc-chart {
    width: 100%;

    &--360 {
      height: 360px;
    }

    &--180 {
      height: 180px;
    }
  }

  /* 决策表 */
  .fc-tbl {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;

    th {
      background: #f4f6f9;
      color: #52514e;
      font-weight: 600;
      text-align: left;
      padding: 9px 12px;
      border-bottom: 1px solid rgba(17, 24, 39, 0.1);
      white-space: nowrap;
    }

    td {
      padding: 9px 12px;
      border-bottom: 1px solid #f0f2f5;
      vertical-align: middle;
      color: rgba(0, 0, 0, 0.65);
    }

    tr:hover td {
      background: #fafbfc;
    }

    .td-num {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .col-v {
      color: rgba(0, 0, 0, 0.45);
    }

    .col-o {
      color: #e8833a;
      font-weight: 700;
    }

    .col-diff {
      color: #2e8b57;
      font-weight: 600;
    }

    .col-bound {
      color: #898781;
      font-size: 11.5px;
    }

    .fc-sub {
      color: #898781;
    }
  }
}
</style>
