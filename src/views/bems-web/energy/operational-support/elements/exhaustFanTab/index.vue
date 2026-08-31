<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="排风机总数"
        :value="statsData.count"
        color="blue"
        :icon="TotalIcon"
      />
      <StatCard
        label="运行中"
        :value="statsData.online"
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="今日能耗"
        :value="statsData.energyConsumption"
        unit="kWh"
        color="orange"
        :icon="EnergyIcon"
      />
      <StatCard
        label="平均风量"
        :value="statsData.avgAirVolume"
        unit="m³/h"
        color="purple"
        :icon="AirVolumeIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>💨排风机实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
          <a-input v-model:value="searchForm.deviceName" placeholder="设备名称" allow-clear style="width: 160px" @pressEnter="handleSearch" />
          <a-select v-model:value="searchForm.runState" placeholder="状态" allow-clear style="width: 120px" @change="handleSearch">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
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
          :dataSource="tableData"
          :columns="columns"
          :pagination="pagination"
          :loading="tableLoading"
          :scroll="{ x: 1100 }"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'runState'">
              <a-tag v-if="record.runState === '在线'" color="green">在线</a-tag>
              <a-tag v-else color="red">离线</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleDetail(record)">详情</a-button>
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
            <span>排风系统能耗趋势</span>
          </div>
          <span class="card-note">今日 00:00–23:00 · 逐时 kWh</span>
        </div>
        <div class="analysis-card__body">
          <div ref="energyChartRef" class="venue-chart"></div>
        </div>
      </a-card>
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">📊</span>
            <span>排风压差分析</span>
          </div>
          <span class="card-note">各排风机风管压差 · 逐时 Pa</span>
        </div>
        <div class="analysis-card__body">
          <div ref="pressureChartRef" class="venue-chart"></div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 排风系统 -->
    <div class="card">
      <div class="card-header">
        <h3>🏭工艺图监控 - 排风系统</h3>
        <div class="header-right">
          <a-tag color="blue">实时</a-tag>
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
          <div class="chart-text">排风系统工艺流程监控图</div>
          <div style="font-size: 12px; color: #a0aec0; margin-top: 8px">
            室内排风口 → 排风管道 → 排风机 → 排风出口 | 实时风量/风压/能耗叠加显示
          </div>
        </div>
    </div>
    </div>

    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="详情" width="800px" :footer="null">
      <a-spin :spinning="detailLoading">
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="设备名称">{{ detailRecord?.deviceName ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="设备编号">{{ detailRecord?.deviceCode ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="设备位置">{{ detailRecord?.spaceName ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="备注">{{ detailRecord?.remark ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag v-if="detailRecord?.runState === '在线'" color="green">在线</a-tag>
            <a-tag v-else color="red">离线</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="最后通讯时间">{{ detailRecord?.lastGatherTime ?? '--' }}</a-descriptions-item>
          <template v-for="attr in detailAttributes" :key="attr.code || attr.configId">
            <a-descriptions-item :label="attr.label">{{ attr.value ?? '--' }}</a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, h } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { selectDevice, getDeviceAttrList, getExhaustFanStatistics } from './index.api'
import { useECharts } from '/@/hooks/web/useECharts'
import { getExhaustEnergyData, getExhaustPressureData } from '../chartData'
import { buildTrendOption } from '../chartOptions'

// 自定义 emoji 图标组件
const TotalIcon = () => h('span', { style: 'font-size: 20px;' }, '💨')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const EnergyIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const AirVolumeIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')

defineOptions({ name: 'ExhaustFanTab' })

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

// 统计数据
const statsData = ref({
  count: '--',
  online: '--',
  energyConsumption: '--',
  avgAirVolume: '--',
})

/** 加载汇总统计数据 */
const loadStatistics = async () => {
  try {
    const res = await getExhaustFanStatistics()
    const data = res?.data ?? res ?? {}
    statsData.value.count = data.count ?? '--'
    statsData.value.online = data.online ?? '--'
    statsData.value.energyConsumption = data.energyConsumption ?? '--'
    statsData.value.avgAirVolume = data.avgAirVolume ?? '--'
  } catch (e) {
    console.error('获取排风机统计数据失败:', e)
  }
}

// 搜索表单
const searchForm = reactive({
  deviceName: '',
  runState: undefined as string | undefined,
})

// 表格列定义（参考楼控设备列表）
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    customRender: ({ index }: { index: number }) =>
      (currentPage.value - 1) * pageSize.value + index + 1,
  },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 120 },
  { title: '设备编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 120 },
  { title: '设备位置', dataIndex: 'spaceName', key: 'spaceName', width: 140 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 100 },
  { title: '状态', dataIndex: 'runState', key: 'runState', width: 90 },
  { title: '最后通讯时间', dataIndex: 'lastGatherTime', key: 'lastGatherTime', width: 160 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' as const },
]

// 表格数据
const tableData = ref<any[]>([])
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const tableTotal = ref(0)

const pagination = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: tableTotal.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
}))

/** 加载表格数据 */
const loadTableData = async () => {
  tableLoading.value = true
  try {
    const res = await selectDevice({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      categoryIds: '50',
      deviceName: searchForm.deviceName || undefined,
      runState: searchForm.runState || undefined,
    })
    const list = res?.records || []
    tableData.value = list
    tableTotal.value = res?.total || 0
  } catch (error) {
    console.error('加载排风机列表失败:', error)
    tableData.value = []
    tableTotal.value = 0
  } finally {
    tableLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadTableData()
}

const handleTableChange = (pag: any) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  loadTableData()
}

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailRecord = ref<any>(null)
const detailAttributes = ref<any[]>([])
const handleDetail = async (record: any) => {
  detailRecord.value = record
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await getDeviceAttrList({ deviceId: record.id || record.deviceId })
    detailAttributes.value = res?.records || res?.data || res || []
  } catch (e) {
    console.error('查询设备属性失败:', e)
    detailAttributes.value = []
  } finally {
    detailLoading.value = false
  }
}

// 排风系统能耗趋势图表
const energyChartRef = ref<HTMLDivElement>()
const { setOptions: setEnergyChartOptions } = useECharts(energyChartRef as any)

// 排风压差分析图表
const pressureChartRef = ref<HTMLDivElement>()
const { setOptions: setPressureChartOptions } = useECharts(pressureChartRef as any)

/** 渲染排风系统能耗趋势与压差分析图表（mock 数据） */
const loadCharts = async () => {
  await nextTick()
  // 图1 能耗趋势
  const energyData = getExhaustEnergyData()
  const energySeries = (energyData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  setEnergyChartOptions(buildTrendOption(energyData.xaxis, energySeries, 'kWh'))

  // 图2 压差分析
  const pressData = getExhaustPressureData()
  const pressSeries = (pressData.chatSeriesList || []).filter((s: any) => s.name !== '合计')
  setPressureChartOptions(buildTrendOption(pressData.xaxis, pressSeries, 'Pa'))
}

onMounted(() => {
  loadStatistics()
  loadTableData()
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
          font-size: 14px;
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
      font-size: 12px;
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
      font-size: 13px;
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
        font-size: 14px;
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
  width: 28px;
  height: 28px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>
