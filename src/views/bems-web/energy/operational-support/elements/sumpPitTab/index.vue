<template>
  <div class="tab-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        label="集水坑总数"
        :value="statsData.count"
        color="blue"
        :icon="TotalIcon"
      />
      <StatCard
        label="正常"
        :value="statsData.online"
        color="green"
        :icon="RunningIcon"
      />
      <StatCard
        label="高液位告警"
        :value="statsData.alarm"
        color="orange"
        :icon="AlarmIcon"
      />
      <StatCard
        label="故障"
        :value="statsData.fault"
        color="purple"
        :icon="FaultIcon"
      />
    </div>

    <!-- 实时监测表格 -->
    <div class="card">
      <div class="card-header">
        <h3>🕳️集水坑实时监测</h3>
        <div class="header-right">
          <div class="filter-bar">
          <a-select v-model:value="filterStatus" placeholder="全部状态" style="width: 140px" allow-clear>
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="正常">正常</a-select-option>
            <a-select-option value="高液位">高液位</a-select-option>
            <a-select-option value="故障">故障</a-select-option>
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
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag v-if="record.status === '正常'" color="green">正常</a-tag>
              <a-tag v-else-if="record.status === '高液位'" color="orange">高液位</a-tag>
              <a-tag v-else color="red">故障</a-tag>
            </template>
            <template v-if="column.key === 'pumpStatus'">
              <a-tag v-if="record.pumpStatus === '运行'" color="green">运行</a-tag>
              <a-tag v-else-if="record.pumpStatus === '停止'" color="red">停止</a-tag>
              <a-tag v-else color="orange">故障</a-tag>
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
            <span>液位趋势曲线</span>
          </div>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">各集水坑液位趋势</div>
          </div>
        </div>
      </a-card>
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">💧</span>
            <span>排水泵运行统计</span>
          </div>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">各排水泵运行时长统计</div>
          </div>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 工艺图监控 - 集水坑系统 -->
    <div class="card" :class="{ 'process-fullscreen': processFullscreen }">
      <div class="card-header">
        <h3>🏭工艺图监控 - 集水坑系统</h3>
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
      <div class="card-body process-body" v-show="!collapsedProcess">
        <div class="process-layout">
          <!-- 左侧：空间位置树 -->
          <div class="process-tree">
            <div class="process-tree__header">设备位置</div>
            <a-tree
              v-model:selectedKeys="selectedSpaceKeys"
              :tree-data="spaceTreeData"
              :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
              default-expand-all
              :style="{ maxHeight: '500px', overflow: 'auto' }"
              @select="handleSpaceSelect"
            />
          </div>
          <!-- 右侧：工艺图 -->
          <div class="process-schematic">
            <Sump :values="{}" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { CaretDownOutlined, CaretUpOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { StatCard } from '/@/views/bems-web/components'
import { spaceTree } from './index.api'
import Sump from '../../building-automation/sump.vue'

// 自定义 emoji 图标组件
const TotalIcon = () => h('span', { style: 'font-size: 20px;' }, '🕳️')
const RunningIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const AlarmIcon = () => h('span', { style: 'font-size: 20px;' }, '⚠️')
const FaultIcon = () => h('span', { style: 'font-size: 20px;' }, '🔧')

defineOptions({ name: 'SumpPitTab' })

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

// 工艺图 - 左侧树 & 右侧Sump组件
const selectedSpaceKeys = ref<string[]>([])
const spaceTreeData = ref<any[]>([])

/** 查找树中第一个叶子节点 */
const findFirstLeafKey = (nodes: any[]): string | null => {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      return String(node.key)
    }
    const leafKey = findFirstLeafKey(node.children)
    if (leafKey) return leafKey
  }
  return null
}

/** 加载空间位置树 */
const loadSpaceTree = async () => {
  try {
    const res = await spaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res.data || res.records || [])
    // 默认选中第一个叶子节点
    if (spaceTreeData.value.length > 0) {
      const firstKey = findFirstLeafKey(spaceTreeData.value)
      if (firstKey) {
        selectedSpaceKeys.value = [firstKey]
      }
    }
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

/** 根据选中的空间节点切换 */
const handleSpaceSelect = (keys: (string | number)[]) => {
  if (!keys || keys.length === 0) return
  const key = String(keys[0])
  selectedSpaceKeys.value = [key]
}

onMounted(() => {
  loadSpaceTree()
})

// 统计数据
const statsData = {
  count: 14,
  online: 11,
  alarm: 2,
  fault: 1,
}

// 筛选条件
const filterStatus = ref('')

// 表格列定义
const columns = [
  { title: '集水坑编号', dataIndex: 'code', key: 'code', width: 120 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 150 },
  { title: '运行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '当前液位(m)', dataIndex: 'level', key: 'level', width: 130 },
  { title: '高液位阈值(m)', dataIndex: 'highLevel', key: 'highLevel', width: 140 },
  { title: '排水泵1', dataIndex: 'pump1', key: 'pump1', width: 110 },
  { title: '排水泵2', dataIndex: 'pump2', key: 'pump2', width: 110 },
  { title: '今日排水量(m³)', dataIndex: 'todayDrainage', key: 'todayDrainage', width: 150 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 80, fixed: 'right' },
]

// 表格数据
const tableData = [
  { code: 'SP-A-01', location: 'A馆-B2-车库', status: '正常', level: '0.8', highLevel: '1.5', pump1: '停止', pump2: '停止', todayDrainage: '12.5' },
  { code: 'SP-A-02', location: 'A馆-B1-设备间', status: '高液位', level: '1.6', highLevel: '1.5', pump1: '运行', pump2: '停止', todayDrainage: '28.0' },
  { code: 'SP-B-01', location: 'B馆-B2-车库', status: '正常', level: '0.6', highLevel: '1.5', pump1: '停止', pump2: '停止', todayDrainage: '8.2' },
  { code: 'SP-B-02', location: 'B馆-B1-机房', status: '正常', level: '0.9', highLevel: '1.5', pump1: '停止', pump2: '停止', todayDrainage: '15.5' },
  { code: 'SP-C-01', location: 'C馆-B2-车库', status: '故障', level: '--', highLevel: '1.5', pump1: '故障', pump2: '停止', todayDrainage: '0' },
  { code: 'SP-C-02', location: 'C馆-B1-设备间', status: '正常', level: '0.7', highLevel: '1.5', pump1: '停止', pump2: '停止', todayDrainage: '10.8' },
  { code: 'SP-D-01', location: 'D馆-B2-车库', status: '高液位', level: '1.7', highLevel: '1.5', pump1: '运行', pump2: '运行', todayDrainage: '45.0' },
  { code: 'SP-D-02', location: 'D馆-B1-机房', status: '正常', level: '0.5', highLevel: '1.5', pump1: '停止', pump2: '停止', todayDrainage: '6.5' },
]

// 筛选逻辑
const filteredTableData = computed(() => {
  return tableData.filter((item) => {
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchStatus
  })
})

const handleSearch = () => {
  console.log('查询:', { status: filterStatus.value })
}
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

.process-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  border-radius: 0;
  margin: 0;
  padding: 20px;
  overflow: auto;
  background: #fff;
}

.process-body {
  .process-layout {
    display: flex;
    gap: 16px;
    min-height: 500px;
  }

  .process-tree {
    flex-shrink: 0;
    width: 240px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;

    &__header {
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      color: #1d2129;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.ant-tree) {
      padding: 8px;
    }
  }

  .process-schematic {
    flex: 1;
    position: relative;
    border: 1px solid #e5e6e8;
    border-radius: 8px;
    overflow: hidden;
    background: linear-gradient(rgba(53, 108, 132, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(53, 108, 132, 0.05) 1px, transparent 1px);
    background-size: 18px 18px;
    background-color: #082332;
    min-height: 500px;
  }
}
</style>
