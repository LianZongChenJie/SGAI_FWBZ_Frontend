<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="冷源机组总数"
        :value="8"
        change-text="↑ 2 新增"
        trend="up"
        color="blue"
        :icon="ColdSourceTotalIcon"
      />
      <StatCard
        label="运行中"
        :value="7"
        change-text="87.5% 运行率"
        trend="up"
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="今日制冷量"
        :value="'12,456'"
        change-text="↑ 8.5% RT"
        trend="up"
        color="orange"
        :icon="TodayCoolingIcon"
      />
      <StatCard
        label="平均COP"
        :value="'5.8'"
        change-text="↑ 0.4 较上周"
        trend="up"
        color="purple"
        :icon="AvgCopIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>❄️冷源系统实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
          <a-select v-model:value="filterType" placeholder="全部机组" style="width: 140px" allow-clear>
            <a-select-option value="">全部机组</a-select-option>
            <a-select-option value="离心机">离心机</a-select-option>
            <a-select-option value="螺杆机">螺杆机</a-select-option>
            <a-select-option value="磁悬浮">磁悬浮</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch">🔍 查询</a-button>
          </div>
          <button class="collapse-btn" @click="collapsedTable = !collapsedTable">
<CaretDownOutlined v-if="!collapsedTable" />
          <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div class="card-body" v-show="!collapsedTable">
        <a-table
          :dataSource="filteredTableData"
          :columns="columns"
          :pagination="{ pageSize: 10 }"
          :scroll="{ x: 1100 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag v-if="record.status === '运行'" color="green">运行</a-tag>
              <a-tag v-else-if="record.status === '待机'" color="orange">待机</a-tag>
              <a-tag v-else color="red">故障</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="collapse-row">
      <div class="collapse-row__header">
        <h3>📊 图表区域</h3>
        <button class="collapse-btn" @click="collapsedCharts = !collapsedCharts">
          <CaretDownOutlined v-if="!collapsedCharts" />
          <CaretUpOutlined v-else />
        </button>
      </div>
    <div class="two-col" v-show="!collapsedCharts">
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">📈</span>
            <span>冷源系统能效趋势(COP)</span>
          </div>
          <span class="card-note">逐时 COP · 停机无数据 · 轴范围 2~10</span>
        </div>
        <div class="analysis-card__body">
          <div v-if="hasCopData" ref="copChartRef" class="venue-chart"></div>
          <div v-else class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">📊</span>
            <span>制冷量</span>
          </div>
          <span class="card-note">逐时制冷量 kW · 额定 4400/2500 kW</span>
        </div>
        <div class="analysis-card__body">
          <div v-if="hasCapacityData" ref="capacityChartRef" class="venue-chart"></div>
          <div v-else class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 冷源系统 -->
    <!-- <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 冷源系统</h3>
        <div class="header-right">
          <a-tag color="purple">实时</a-tag>
          <button class="collapse-btn" @click="collapsedProcess = !collapsedProcess">
<CaretDownOutlined v-if="!collapsedProcess" />
          <CaretUpOutlined v-else />
          </button>
          <button class="collapse-btn" @click="toggleProcessFullscreen">
            <FullscreenOutlined v-if="!processFullscreen" />
            <FullscreenExitOutlined v-else />
          </button>
        </div>
      </div>
      <div class="card-body" v-show="!collapsedProcess">
        <div class="chart-placeholder" style="min-height: 300px">
          <div class="chart-icon">🏭</div>
          <div class="chart-text">冷源系统工艺流程监控图</div>
          <div style="font-size:14px; color: #a0aec0; margin-top: 8px">
            冷却塔 → 冷却水泵 → 冷水机组 → 冷冻水泵 → 分水器 → 末端空调 → 集水器 → 回冷水机组 | 实时水温/流量/压力叠加显示
          </div>
        </div>
    </div> -->
    <!-- </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, nextTick } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { useECharts } from '/@/hooks/web/useECharts'
import { getColdCopData, getColdCapacityData } from '../chartData'
import { buildTrendOption } from '../chartOptions'

// 自定义 emoji 图标组件
const ColdSourceTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '❄️')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const TodayCoolingIcon = () => h('span', { style: 'font-size: 20px;' }, '🧊')
const AvgCopIcon = () => h('span', { style: 'font-size: 20px;' }, '📈')

defineOptions({ name: 'ColdTab' })

// 折叠状态
const collapsedTable = ref(false)
const collapsedCharts = ref(false)
const collapsedProcess = ref(false)

// 工艺图全屏
const processFullscreen = ref(false)
const toggleProcessFullscreen = () => {
  processFullscreen.value = !processFullscreen.value
}

defineProps<{
  data?: any
}>()

// 筛选条件
const filterType = ref('')

// 表格列定义
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 70,
    customRender: ({ index }: { index: number }) => index + 1,
  },
  { title: '机组编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '冷冻水出水', dataIndex: 'chilledOut', key: 'chilledOut', width: 110 },
  { title: '冷冻水回水', dataIndex: 'chilledIn', key: 'chilledIn', width: 110 },
  { title: '冷却水出水', dataIndex: 'coolingOut', key: 'coolingOut', width: 110 },
  { title: '冷却水回水', dataIndex: 'coolingIn', key: 'coolingIn', width: 110 },
  { title: '制冷量', dataIndex: 'capacity', key: 'capacity', width: 100 },
  { title: '运行功率', dataIndex: 'power', key: 'power', width: 100 },
  { title: 'COP', dataIndex: 'cop', key: 'cop', width: 80 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 表格数据
const tableData = [
  { code: 'CH-A-01', type: '磁悬浮', status: '运行', chilledOut: '6°C', chilledIn: '12°C', coolingOut: '32°C', coolingIn: '28°C', capacity: '1,200 RT', power: '780 kW', cop: '6.2' },
  { code: 'CH-A-02', type: '磁悬浮', status: '运行', chilledOut: '6°C', chilledIn: '12°C', coolingOut: '33°C', coolingIn: '29°C', capacity: '1,100 RT', power: '750 kW', cop: '5.9' },
  { code: 'CH-B-01', type: '离心机', status: '运行', chilledOut: '7°C', chilledIn: '13°C', coolingOut: '34°C', coolingIn: '30°C', capacity: '1,500 RT', power: '1,100 kW', cop: '5.5' },
  { code: 'CH-B-02', type: '离心机', status: '待机', chilledOut: '--', chilledIn: '--', coolingOut: '--', coolingIn: '--', capacity: '0 RT', power: '0 kW', cop: '--' },
  { code: 'CH-C-01', type: '螺杆机', status: '运行', chilledOut: '7°C', chilledIn: '13°C', coolingOut: '35°C', coolingIn: '31°C', capacity: '800 RT', power: '620 kW', cop: '5.2' },
]

// 筛选逻辑
const filteredTableData = computed(() => {
  return tableData.filter((item) => {
    const matchType = !filterType.value || item.type === filterType.value
    return matchType
  })
})

const handleSearch = () => {
  console.log('查询:', { type: filterType.value })
}

// 冷源系统能效趋势(COP)图表
const copChartRef = ref<HTMLDivElement>()
const hasCopData = ref(false)
const { setOptions: setCopChartOptions } = useECharts(copChartRef as any)

// 制冷量图表
const capacityChartRef = ref<HTMLDivElement>()
const hasCapacityData = ref(false)
const { setOptions: setCapacityChartOptions } = useECharts(capacityChartRef as any)

/** 渲染冷源 COP 与制冷量图表（mock 数据） */
const loadCharts = async () => {
  await nextTick()
  // 图1 COP 趋势
  const copData = getColdCopData()
  const copSeries = (copData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!copData.xaxis.length || !copSeries.length) {
    hasCopData.value = false
  } else {
    hasCopData.value = true
    await nextTick()
    setCopChartOptions(buildTrendOption(copData.xaxis, copSeries, 'COP', false, undefined, 2, 10))
  }

  // 图2 制冷量
  const capData = getColdCapacityData()
  const capSeries = (capData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  if (!capData.xaxis.length || !capSeries.length) {
    hasCapacityData.value = false
  } else {
    hasCapacityData.value = true
    await nextTick()
    setCapacityChartOptions(buildTrendOption(capData.xaxis, capSeries, 'kW'))
  }
}

onMounted(() => {
  loadCharts()
})
</script>

<style scoped lang="less">
.tab-page {

  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -24px 16px;
      padding: 0 24px 12px;
      border-bottom: 1px solid #f0f0f0;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .filter-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-left: auto;
      }
    }

    .card-body {
      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        background: #fafbfc;
        border: 1px dashed #e5e6e8;
        border-radius: 8px;
        padding: 24px;

        .chart-icon {
          font-size: 40px;
          color: #1677ff;
          margin-bottom: 12px;
        }

        .chart-text {
          font-size:16px;
          color: #86909c;
        }
      }
    }
  }

  
  .analysis-card {
    flex: 1;
    min-width: 300px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 16px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -16px 16px;
      padding: 0 16px 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__icon {
      font-size: 18px;
    }

    &__icon2 {
      font-size: 54px;
    }

    .card-note {
      color: rgba(0, 0, 0, 0.45);
      font-size:14px;
      text-align: right;
    }

    &__body {
      height: 320px;
      background: #f7f9fc;
      border-radius: 8px;
      overflow: hidden;
    }

    .temp-tabs {
      display: inline-flex;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      overflow: hidden;
    }

    .temp-tab {
      padding: 4px 14px;
      font-size:16px;
      color: rgba(0, 0, 0, 0.65);
      background: #ffffff;
      border: none;
      outline: none;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #1890ff;
      }

      &.active {
        color: #ffffff;
        background: #1890ff;
      }

      &:not(:last-child) {
        border-right: 1px solid #d9d9d9;
      }
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;

      &__text {
        font-size:16px;
        color: rgba(0, 0, 0, 0.45);
      }
    }

    .venue-chart {
      width: 100%;
      height: 100%;
    }
  }

.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .collapse-row {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 -24px 16px;
      padding: 0 24px 12px;
      border-bottom: 1px solid #f0f0f0;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size:14px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>