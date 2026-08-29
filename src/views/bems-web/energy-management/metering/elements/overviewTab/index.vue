<template>
  <div class="overview-tab">
    <div class="stat-cards">
      <StatCard
        label="计量表计总数"
        :value="statData.count"
        :change-text="statData.addCount"
        trend=""
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="表计在线率"
        :value="statData.onlineRate"
        :change-text="statData.meterOnlineStatus"
        trend=""
        color="green"
        :icon="CheckCircleOutlined"
      />
      <StatCard
        label="今日用电量"
        :value="statData.electricCount"
        :change-text="statData.electricCountDoD"
        trend=""
        color="orange"
        :icon="PlugIcon"
      />
      <StatCard
        label="今日用水量"
        :value="statData.waterCount"
        :change-text="statData.waterCountDoD"
        trend=""
        color="purple"
        :icon="WaterDropIcon"
      />
    </div>

    <!-- 分析模块：各场馆用电对比 / 用能结构分析 -->
    <div class="analysis-cards">
      <!-- 各场馆用电对比 -->
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">📊</span>
            <span>各场馆用电对比</span>
          </div>
          <div class="venue-electricity-tabs">
            <button
              v-for="tab in venueElectricityTabs"
              :key="tab.key"
              :class="['venue-electricity-tab', { active: venueElectricityActive === tab.key }]"
              @click="handleVenueElectricityTabChange(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="analysis-card__body">
          <div v-show="venueLoading" class="chart-placeholder">
            <a-spin />
            <div class="chart-placeholder__text">加载中...</div>
          </div>
          <div
            v-show="!venueLoading && venueChartData.length === 0"
            class="chart-placeholder"
          >
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
          <div v-show="!venueLoading && venueChartData.length > 0" ref="venueChartRef" class="venue-chart"></div>
        </div>
      </a-card>

      <!-- 用能结构分析 -->
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">🥧</span>
            <span>用能结构分析</span>
          </div>
          <div class="venue-electricity-tabs">
            <button
              v-for="tab in structureTabs"
              :key="tab.key"
              :class="['venue-electricity-tab', { active: structureActive === tab.key }]"
              @click="handleStructureTabChange(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div class="analysis-card__body">
          <div v-show="structureLoading" class="chart-placeholder">
            <a-spin />
            <div class="chart-placeholder__text">加载中...</div>
          </div>
          <div
            v-show="!structureLoading && structureChartData.length === 0"
            class="chart-placeholder"
          >
            <span class="analysis-card__icon2">🍩</span>
            <div class="chart-placeholder__text">暂无数据</div>
          </div>
          <div v-show="!structureLoading && structureChartData.length > 0" ref="structureChartRef" class="venue-chart"></div>
        </div>
      </a-card>
    </div>

    <!-- 计量表计数据 -->
    <a-card class="meter-data-card" :bordered="false">
      <div class="meter-data-card__header">
        <div class="meter-data-card__title">
          <span class="meter-data-card__icon">📋</span>
          <span>计量表计数据</span>
        </div>
        <div class="meter-data-card__actions">
          <a-tree-select
            v-model:value="meterType"
            :tree-data="categoryTreeData"
            :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
            placeholder="设备类型"
            allow-clear
            tree-default-expand-all
            class="meter-data-card__select"
            @change="handleSearch"
          />
          <a-tree-select
            v-model:value="meterSpace"
            :tree-data="spaceTreeData"
            :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
            placeholder="设备位置"
            allow-clear
            tree-default-expand-all
            class="meter-data-card__select"
            @change="handleSearch"
          />
          <a-button type="primary" @click="handleSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            🔍查询
          </a-button>
          <a-button @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            📥导出报表
          </a-button>
        </div>
      </div>
      <a-table
        :columns="meterColumns"
        :data-source="meterData"
        :pagination="pagination"
        size="middle"
        class="meter-data-card__table"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'runState'">
            <span
              class="status-tag"
              :class="{
                'status-tag--normal':  record.runState === '在线',
                'status-tag--offline': record.runState === '离线'
              }"
            >
              {{ record.runState }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleDetail(record)">详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
    <!-- 详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="详情" width="800px" :footer="null">
      <a-spin :spinning="detailLoading">
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="表计编号">{{ detailRecord?.deviceCode ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="名称">{{ detailRecord?.deviceName ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="表计类型">{{ findTreeNodeTitle(categoryTreeData, detailRecord?.categoryId) || detailRecord?.categoryId || '--' }}</a-descriptions-item>
          <a-descriptions-item label="安装位置">{{ findTreeNodePath(spaceTreeData, detailRecord?.spaceId) || detailRecord?.spaceId || '--' }}</a-descriptions-item>
          <a-descriptions-item label="备注">{{ detailRecord?.remark ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="最后采集时间">{{ detailRecord?.lastGatherTime ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="今日读数">{{ detailRecord?.value ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="今日用量">{{ detailRecord?.dayTotal ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="本月累计">{{ detailRecord?.mouthTotal ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <span
              class="status-tag"
              :class="{
                'status-tag--normal':  detailRecord?.runState === '在线',
                'status-tag--offline': detailRecord?.runState === '离线'
              }"
            >
              {{ detailRecord?.runState ?? '--' }}
            </span>
          </a-descriptions-item>
          <template v-for="attr in detailAttributes" :key="attr.code || attr.configId">
            <a-descriptions-item :label="attr.label || attr.name || '--'">{{ attr.value ?? '--' }}</a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, nextTick } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue'
// 引用一次，抑制 vetur 未使用警告（仅用于模板）
void ThunderboltOutlined
void CheckCircleOutlined
void SearchOutlined
void ExportOutlined
import { useECharts } from '/@/hooks/web/useECharts'
import { exportExcel } from '/@/utils/export'
import {
  getEnergyMeteringStatistics,
  getMeasuringListWithMouth,
  findDayByConfig,
  findMonthByConfig,
  findYearByConfig,
  findDayVenueElectricity,
  findMonthVenueElectricity,
  findYearVenueElectricity,
  getDeviceAttrList,
} from './index.api'
import { getVenueInfoList, getCategoryTreeData, spaceTree } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api'

// 自定义 emoji 图标组件（插头和水滴）
const PlugIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  count: '--',
  addCount: '',
  onlineRate: '--',
  meterOnlineStatus: '',
  electricCount: '--',
  electricCountDoD: '',
  waterCount: '--',
  waterCountDoD: '',
})

// 计量表计数据筛选
const meterType = ref<string | undefined>(undefined)
const meterSpace = ref<string | undefined>(undefined)

const venueOptions = ref([{ value: '', label: '全部场馆' }])

// 获取场馆列表
const fetchVenueList = async () => {
  try {
    const res = await getVenueInfoList({})
    const list = Array.isArray(res) ? res : (res.records || res.data || [])
    const map: Record<string, string> = {}
    venueOptions.value = [
      { value: '', label: '全部场馆' },
      ...list.map((item: any) => {
        const name = item.venueName || item.name || item.id
        map[item.id] = name
        return { value: item.id, label: name }
      }),
    ]
    venueMap.value = map
  } catch (e) {
    console.error('获取场馆列表失败:', e)
  }
}

const meterColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 70,
    customRender: ({ index }: { index: number }) =>
      (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  { title: '表计编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 150},
  { title: '名称', dataIndex: 'deviceName', key: 'deviceName', width: 150},
  {
    title: '表计类型',
    dataIndex: 'categoryId',
    key: 'categoryId',
    width: 120,
    customRender: ({ text }: any) => {
      if (!text) return '-'
      return findTreeNodeTitle(categoryTreeData.value, text) || text
    }
  },
  {
    title: '安装位置',
    dataIndex: 'spaceId',
    key: 'spaceId',
    width: 150,
    customRender: ({ text }: any) => {
      if (!text) return ''
      return findTreeNodePath(spaceTreeData.value, text) || text
    }
  },
  { title: '今日读数', dataIndex: 'value', key: 'value', width: 100 },
  { title: '今日用量', dataIndex: 'dayTotal', key: 'dayTotal', width: 100 },
  { title: '本月累计', dataIndex: 'mouthTotal', key: 'mouthTotal', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 100 },
  { title: '状态', dataIndex: 'runState', key: 'runState', width: 100 },
  { title: '最后采集时间', dataIndex: 'lastGatherTime', key: 'lastGatherTime', width: 120 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' },
]

// 分类树数据（表计类型映射）
const categoryTreeData = ref<any[]>([])

// 空间树数据（安装位置映射）
const spaceTreeData = ref<any[]>([])

// 场馆名称映射 { venueId: venueName }
const venueMap = ref<Record<string, string>>({})

// 递归查找树节点，根据 key 返回对应 title
const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
  if (!treeData || !Array.isArray(treeData)) return ''
  const find = (nodes: any[]): string => {
    for (const node of nodes) {
      if (String(node.key) === String(key)) {
        return node.title || node.value || node.label
      }
      if (node.children && Array.isArray(node.children)) {
        const title = find(node.children)
        if (title) return title
      }
    }
    return ''
  }
  return find(treeData)
}

// 递归查找树节点完整路径，返回从根节点到目标节点的拼接文字
const findTreeNodePath = (treeData: any[], key: string | number, separator = '-'): string => {
  if (!treeData || !Array.isArray(treeData)) return ''
  const findPath = (nodes: any[], path: string[]): string[] | null => {
    for (const node of nodes) {
      const label = node.title || node.value || node.label || ''
      const currentPath = [...path, label]
      if (String(node.key) === String(key)) {
        return currentPath
      }
      if (node.children && Array.isArray(node.children)) {
        const result = findPath(node.children, currentPath)
        if (result) return result
      }
    }
    return null
  }
  const result = findPath(treeData, [])
  return result ? result.join(separator) : ''
}

// 加载分类树数据
const loadCategoryTree = async () => {
  try {
    const res = await getCategoryTreeData()
    categoryTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载分类树数据失败:', e)
  }
}

// 加载空间树数据
const loadSpaceTree = async () => {
  try {
    const res = await spaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  pageSizeOptions: ['10', '20', '50', '100'],
})

const meterData = ref([])

// 构建查询参数
const buildMeterParams = (pageNo: number, pageSize: number) => {
  const params: any = { pageNo, pageSize }
  if (meterType.value) params.categoryIds = meterType.value
  if (meterSpace.value) params.spaceId = meterSpace.value
  return params
}

// 加载计量表计数据
const loadMeterData = async (pageNo = pagination.current, pageSize = pagination.pageSize) => {
  try {
    const params = buildMeterParams(pageNo, pageSize)
    const res = await getMeasuringListWithMouth(params)
    pagination.total = res.total ?? 0
    meterData.value = (res.records || res || []).map((item: any, idx: number) => ({
      key: item.deviceId ?? idx,
      deviceCode: item.deviceCode ?? '-',
      deviceName: item.deviceName ?? '-',
      categoryId: item.categoryId ?? '-',
      venueId: item.venueId ?? '-',
      spaceId: item.spaceId ?? '-',
      value: item.value ?? '-',
      dayTotal: item.dayTotal ?? '-',
      mouthTotal: item.mouthTotal ?? '-',
      runState: item.runState ?? '-',
      remark: item.remark ?? '-',
      lastGatherTime: item.lastGatherTime ?? '-',

    }))
  } catch (e) {
    console.error('加载计量表计数据失败:', e)
  }
}

// 查询按钮
const handleSearch = () => {
  pagination.current = 1
  loadMeterData(1, pagination.pageSize)
}

// 导出报表
const handleExport = () => {
  if (meterData.value.length === 0) {
    return
  }
  const headers = [
    { title: '表计编号', key: 'deviceCode' },
    {
      title: '表计类型',
      key: 'categoryId',
      formatter: (val: string) => findTreeNodeTitle(categoryTreeData.value, val) || val,
    },
    {
      title: '安装位置',
      key: 'spaceId',
      formatter: (val: string) => {
        if (!val) return ''
        return findTreeNodePath(spaceTreeData.value, val) || val
      },
    },
    { title: '今日读数', key: 'value' },
    { title: '今日用量', key: 'dayTotal' },
    { title: '本月累计', key: 'mouthTotal' },
    { title: '状态', key: 'runState' },
  ]
  exportExcel({
    tableData: meterData.value,
    headers,
    fileName: '计量表计数据报表',
  })
}

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadMeterData(pag.current, pag.pageSize)
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
    const res = await getDeviceAttrList({ deviceId: record.key || record.deviceId })
    detailAttributes.value = res?.records || res?.data || res || []
  } catch (e) {
    console.error('查询设备属性失败:', e)
    detailAttributes.value = []
  } finally {
    detailLoading.value = false
  }
}

// 加载概览数据
const loadOverviewData = async () => {
  try {
    const res = await getEnergyMeteringStatistics()
    statData.count = res.count ?? statData.count
    statData.addCount = res.addCount ?? statData.addCount
    statData.onlineRate = res.onlineRate ?? statData.onlineRate
    statData.meterOnlineStatus = res.meterOnlineStatus ?? statData.meterOnlineStatus
    statData.electricCount = res.electricCount ?? statData.electricCount
    statData.electricCountDoD = res.electricCountDoD ?? statData.electricCountDoD
    statData.waterCount = res.waterCount ?? statData.waterCount
    statData.waterCountDoD = res.waterCountDoD ?? statData.waterCountDoD
  } catch (e) {
    console.error('加载能源计量概览数据失败:', e)
  }
}

// ===== 各场馆用电量柱状图 =====
const venueChartRef = ref<HTMLDivElement>()
const venueChartData = ref<any[]>([])
const venueLoading = ref(false)
const { setOptions: setVenueChartOptions } = useECharts(venueChartRef as any)

const venueElectricityTabs: { key: 'day' | 'month' | 'year'; label: string }[] = [
  { key: 'day', label: '日' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
]
const venueElectricityActive = ref<'day' | 'month' | 'year'>('month')

const handleVenueElectricityTabChange = (key: 'day' | 'month' | 'year') => {
  venueElectricityActive.value = key
  loadVenueElectricity(key)
}

/** 加载各场馆用电量数据 */
const loadVenueElectricity = async (type: 'day' | 'month' | 'year' = 'month') => {
  venueLoading.value = true
  try {
    const apiMap = {
      day: findDayVenueElectricity,
      month: findMonthVenueElectricity,
      year: findYearVenueElectricity,
    }
    const res = await apiMap[type]()
    // 响应格式：{ result: { chat: { xaxis, chatSeriesList } } } 或已解包 { chat: { ... } }
    const chatData = res?.chat || res?.result?.chat || res?.data?.chat || {}
    const xaxis = chatData.xaxis || []
    const seriesList = (chatData.chatSeriesList || chatData.seriesList || []) as any[]
    const filteredList = seriesList.filter((item: any) => item.name !== '合计')
    venueChartData.value = filteredList
    // 必须先结束 loading 状态，让图表 div 渲染到 DOM，再设置图表选项
    venueLoading.value = false
    await nextTick()
    if (xaxis.length > 0 && filteredList.length > 0) {
      renderVenueChart(xaxis, filteredList)
    }
  } catch (e) {
    console.error('加载各场馆用电数据失败:', e)
    venueLoading.value = false
  }
}

/** 渲染场馆用电柱状图 - 参照 pointDataStatistics 多系列格式 */
const renderVenueChart = (xaxis: string[], seriesList: { name: string; data: number[] }[]) => {
  setVenueChartOptions({
    tooltip: { trigger: 'axis', show: true },
    legend: {
      type: 'scroll',
      data: seriesList.map((item) => item.name),
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: xaxis,
      axisLabel: {
        color: '#666',
        fontSize: 12,
        rotate: xaxis.length > 6 ? 30 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        margin: 15,
        overflow: 'truncate',
        color: '#666',
        fontSize: 12,
      },
    },
    series: seriesList.map((item) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      barWidth: '20px',
    })),
  })
}

// ===== 用能结构分析饼图 =====
const structureChartRef = ref<HTMLDivElement>()
const structureChartData = ref<{ name: string; value: number }[]>([])
const structureLoading = ref(false)
const { setOptions: setStructureChartOptions } = useECharts(structureChartRef as any)

const structureTabs: { key: 'day' | 'month' | 'year'; label: string }[] = [
  { key: 'day', label: '日' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
]
const structureActive = ref<'day' | 'month' | 'year'>('month')

const handleStructureTabChange = (key: 'day' | 'month' | 'year') => {
  structureActive.value = key
  loadStructureData(key)
}

const PIE_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']

/** 加载用能结构占比数据 */
const loadStructureData = async (type: 'day' | 'month' | 'year' = 'month') => {
  structureLoading.value = true
  try {
    const apiMap = {
      day: findDayByConfig,
      month: findMonthByConfig,
      year: findYearByConfig,
    }
    const res = await apiMap[type]()
    // 响应格式：{ result: { chat: { xaxis, chatSeriesList } } }
    const chatData = res?.chat || res?.result?.chat || res?.data?.chat || {}
    const seriesList = (chatData.chatSeriesList || chatData.seriesList || []) as any[]
    const filteredList = seriesList.filter((item: any) => item.name !== '合计')
    // 饼图：每系列第一个数据点即为该时段的值
    const pieData = filteredList.map((item: any) => ({
      name: item.name,
      value: Array.isArray(item.data) && item.data.length > 0 ? Number(item.data[0]) || 0 : 0,
    }))
    structureChartData.value = pieData
    // 必须先结束 loading 状态，让图表 div 渲染到 DOM，再设置图表选项
    structureLoading.value = false
    await nextTick()
    if (pieData.length > 0) {
      renderStructureChart(pieData)
    }
  } catch (e) {
    console.error('加载用能结构数据失败:', e)
    structureLoading.value = false
  }
}

/** 渲染用能结构饼图 */
const renderStructureChart = (data: { name: string; value: number }[]) => {
  setStructureChartOptions({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `<div style="font-weight:600;margin-bottom:4px;">${params.name}</div>
          <div>占比：<span style="font-weight:600;">${params.percent}%</span></div>`
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#666', fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
          scaleSize: 10,
        },
        data: data.map((item, idx) => ({
          ...item,
          itemStyle: { color: PIE_COLORS[idx % PIE_COLORS.length] },
        })),
      },
    ],
  })
}

onMounted(() => {
  loadOverviewData()
  loadMeterData()
  // fetchVenueList()
  loadCategoryTree()
  loadSpaceTree()
  loadVenueElectricity('month')
  loadStructureData('month')
})
</script>

<style scoped lang="less">
.overview-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .analysis-cards {
    display: flex;
    gap: 16px;
    margin-top: 20px;
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

    &__tag {
      display: inline-block;
      padding: 2px 10px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.65);
      background: #f5f5f5;
      border-radius: 4px;

      &--realtime {
        color: #1890ff;
        background: #e6f7ff;
      }
    }

    &__body {
      height: 240px;
      background: #f7f9fc;
      border-radius: 8px;
      overflow: hidden;
    }

    .venue-electricity-tabs {
      display: inline-flex;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      overflow: hidden;
    }

    .venue-electricity-tab {
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

      &__legend {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.35);
      }
    }

    .venue-chart {
      width: 100%;
      height: 100%;
    }
  }

  .meter-data-card {
    margin-top: 20px;
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

    &__actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__select {
      width: 200px;
    }

    &__table {
      :deep(.ant-table-thead > tr > th) {
        background: #fafafa;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 600;
      }

      :deep(.ant-table-tbody > tr > td) {
        color: rgba(0, 0, 0, 0.65);
      }
    }

    .status-tag {
      display: inline-block;
      padding: 4px 12px;
      font-size: 12px;
      border-radius: 12px;

      &--normal {
        color: #389e0d;
        background: #e6f7e6;
      }

      &--offline {
        color: #cf1322;
        background: #fff1f0;
      }
    }

    .ant-pagination {
      margin-top: 16px;
      padding: 8px 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;

      :deep(.ant-pagination-total-text) {
        margin-right: auto;
        color: rgba(0, 0, 0, 0.65);
      }

      :deep(.ant-pagination-options) {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      :deep(.ant-pagination-options-quick-jumper) {
        color: rgba(0, 0, 0, 0.65);

        input {
          width: 48px;
          margin: 0 8px;
        }
      }
    }
  }
}
</style>
