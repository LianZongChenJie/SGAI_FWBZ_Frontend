<template>
  <div class="config-tab">
    <div class="stat-cards">
      <StatCard
        label="照明回路总数"
        :value="statData.loopTotal"
        :change-text="statData.loopTotalChange"
        trend="up"
        color="blue"
        :icon="BulbIcon"
      />
      <StatCard
        label="在线回路"
        :value="statData.onlineLoop"
        :change-text="statData.onlineLoopRate"
        trend=""
        color="green"
        :icon="CheckIcon"
      />
      <StatCard
        label="已配置组合"
        :value="statData.configGroup"
        :change-text="statData.configGroupChange"
        trend="down"
        color="orange"
        :icon="LinkIcon"
      />
      <StatCard
        label="模式策略数"
        :value="statData.strategyCount"
        :change-text="statData.strategyChange"
        trend="down"
        color="purple"
        :icon="MaskIcon"
      />
    </div>

    <!-- 基础回路信息 -->
    <a-card class="config-card" :bordered="false">
      <template #title>
        <span class="card-title-icon">🔌</span>
        基础回路信息
      </template>
      <template #extra>
        <div class="circuit-filter">
          <a-select v-model:value="circuitFilter.venue" placeholder="全部场馆" style="width: 120px">
            <a-select-option value="">全部场馆</a-select-option>
            <a-select-option value="A馆">A馆</a-select-option>
            <a-select-option value="B馆">B馆</a-select-option>
            <a-select-option value="C馆">C馆</a-select-option>
          </a-select>
          <a-select v-model:value="circuitFilter.floor" placeholder="全部楼层" style="width: 120px">
            <a-select-option value="">全部楼层</a-select-option>
            <a-select-option value="F1">F1</a-select-option>
            <a-select-option value="F2">F2</a-select-option>
          </a-select>
          <a-select v-model:value="circuitFilter.area" placeholder="全部区域" style="width: 120px">
            <a-select-option value="">全部区域</a-select-option>
            <a-select-option value="大厅">大厅</a-select-option>
            <a-select-option value="展厅">展厅</a-select-option>
            <a-select-option value="走廊">走廊</a-select-option>
            <a-select-option value="会议厅">会议厅</a-select-option>
          </a-select>
          <a-button type="primary">查询</a-button>
          <a-button>导出</a-button>
        </div>
      </template>
      <a-table
        :columns="circuitColumns"
        :data-source="circuitList"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <span
              class="status-tag"
              :class="{
                'status-enabled': record.status.includes('开启'),
                'status-dimmed': record.status.includes('调光')
              }"
            >
              {{ record.status }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small">编辑</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 回路组合配置 -->
    <a-card class="config-card" :bordered="false">
      <template #title>
        <span class="card-title-icon">🔗</span>
        回路组合配置
      </template>
      <template #extra>
        <a-button type="primary">+ 新增组合</a-button>
      </template>
      <a-table
        :columns="groupColumns"
        :data-source="groupList"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <span class="status-tag status-enabled">{{ record.status }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small">编辑</a-button>
            <a-button type="link" size="small" danger>删除</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 模式控制策略配置 -->
    <a-card class="config-card" :bordered="false">
      <template #title>
        <span class="card-title-icon">🎨</span>
        模式控制策略配置
      </template>
      <template #extra>
        <a-button type="primary">+ 新增策略</a-button>
      </template>
      <a-table
        :columns="modeColumns"
        :data-source="modeList"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <span
              class="status-tag"
              :class="record.status === '启用' ? 'status-enabled' : 'status-trigger'"
            >
              {{ record.status }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small">编辑</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, h, onMounted, ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// emoji 图标组件
const BulbIcon = () => h('span', { style: 'font-size: 20px;' }, '💡')
const CheckIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const LinkIcon = () => h('span', { style: 'font-size: 20px;' }, '🔗')
const MaskIcon = () => h('span', { style: 'font-size: 20px;' }, '🎭')

// 统计数据（预留接口）
const statData = reactive({
  loopTotal: '2,340',
  loopTotalChange: '456 新增',
  onlineLoop: '2,338',
  onlineLoopRate: '99.9% 在线率',
  configGroup: '24',
  configGroupChange: '6 新增',
  strategyCount: '18',
  strategyChange: '4 新增'
})

onMounted(() => {
  console.log('能源优化 - 配置')
})

// 基础回路信息筛选
const circuitFilter = reactive({
  venue: '',
  floor: '',
  area: ''
})

// 基础回路信息列
const circuitColumns = [
  { title: '回路编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '回路名称', dataIndex: 'name', key: 'name', width: 150, ellipsis: true },
  { title: '所属场馆', dataIndex: 'venue', key: 'venue', width: 100 },
  { title: '楼层', dataIndex: 'floor', key: 'floor', width: 80 },
  { title: '区域', dataIndex: 'area', key: 'area', width: 100 },
  { title: '灯具类型', dataIndex: 'lampType', key: 'lampType', width: 120 },
  { title: '锁定功率', dataIndex: 'power', key: 'power', width: 110 },
  { title: '调光方式', dataIndex: 'dimming', key: 'dimming', width: 110 },
  { title: '当前状态', key: 'status', width: 110, align: 'center' },
  { title: '操作', key: 'action', width: 90, align: 'center' },
]

// 基础回路信息数据
const circuitList = ref([
  { id: '1', code: 'LT-A-101', name: 'A馆F1大厅主照明', venue: 'A馆', floor: 'F1', area: '大厅', lampType: 'LED筒灯', power: '15W×48', dimming: '0-10V', status: '开启 80%' },
  { id: '2', code: 'LT-A-102', name: 'A馆F2展厅照明A区', venue: 'A馆', floor: 'F2', area: '展厅', lampType: 'LED轨道灯', power: '30W×36', dimming: 'DALI', status: '开启 100%' },
  { id: '3', code: 'LT-A-103', name: 'A馆F2展厅照明B区', venue: 'A馆', floor: 'F2', area: '展厅', lampType: 'LED轨道灯', power: '30W×36', dimming: 'DALI', status: '开启 100%' },
  { id: '4', code: 'LT-A-201', name: 'A馆F1走廊照明', venue: 'A馆', floor: 'F1', area: '走廊', lampType: 'LED灯带', power: '10W×60', dimming: '0-10V', status: '调光 50%' },
  { id: '5', code: 'LT-B-101', name: 'B馆F1会议厅主照明', venue: 'B馆', floor: 'F1', area: '会议厅', lampType: 'LED面板灯', power: '40W×24', dimming: 'DALI', status: '开启 80%' },
  { id: '6', code: 'LT-B-201', name: 'B馆F1走廊照明', venue: 'B馆', floor: 'F1', area: '走廊', lampType: 'LED灯带', power: '10W×45', dimming: '0-10V', status: '开启 60%' },
  { id: '7', code: 'LT-C-101', name: 'C馆F1展厅主照明', venue: 'C馆', floor: 'F1', area: '展厅', lampType: 'LED投光灯', power: '50W×32', dimming: 'DALI', status: '开启 100%' },
  { id: '8', code: 'LT-C-201', name: 'C馆F1走廊照明', venue: 'C馆', floor: 'F1', area: '走廊', lampType: 'LED灯带', power: '10W×50', dimming: '0-10V', status: '开启 60%' },
])

// 回路组合配置列
const groupColumns = [
  { title: '组合名称', dataIndex: 'name', key: 'name', width: 110, ellipsis: true },
  { title: '包含回路', dataIndex: 'circuits', key: 'circuits', width: 150, ellipsis: true },
  { title: '回路数量', dataIndex: 'count', key: 'count', width: 100, align: 'center' },
  { title: '总功率', dataIndex: 'totalPower', key: 'totalPower', width: 110 },
  { title: '应用场景', dataIndex: 'scene', key: 'scene', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 120 },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 130, align: 'center' },
]

// 回路组合配置数据
const groupList = ref([
  { id: '1', name: 'A馆F1大厅全照明', circuits: 'LT-A-101, LT-A-102, LT-A-103', count: 3, totalPower: '2,160W', scene: '展会/活动', createTime: '2026-05-15', status: '启用' },
  { id: '2', name: 'A馆F2展厅全照明', circuits: 'LT-A-201, LT-A-202, LT-A-203, LT-A-204', count: 4, totalPower: '4,320W', scene: '展会/活动', createTime: '2026-05-15', status: '启用' },
  { id: '3', name: 'B馆会议厅全照明', circuits: 'LT-B-101, LT-B-102, LT-B-103', count: 3, totalPower: '2,880W', scene: '会议/论坛', createTime: '2026-05-20', status: '启用' },
  { id: '4', name: '公共区域走廊照明', circuits: 'LT-A-201, LT-B-201, LT-C-201, LT-A-301', count: 4, totalPower: '2,050W', scene: '日常/节能', createTime: '2026-05-18', status: '启用' },
  { id: '5', name: 'C馆F1展厅全照明', circuits: 'LT-C-101, LT-C-102, LT-C-103', count: 3, totalPower: '4,800W', scene: '展会/活动', createTime: '2026-05-22', status: '启用' },
])

// 模式控制策略配置列
const modeColumns = [
  { title: '策略名称', dataIndex: 'name', key: 'name', width: 130, ellipsis: true },
  { title: '触发条件', dataIndex: 'trigger', key: 'trigger', width: 150, ellipsis: true },
  { title: '目标组合/回路', dataIndex: 'target', key: 'target', width: 150, ellipsis: true },
  { title: '执行动作', dataIndex: 'actionName', key: 'actionName', width: 120 },
  { title: '亮度设定', dataIndex: 'brightness', key: 'brightness', width: 100, align: 'center' },
  { title: '生效时段', dataIndex: 'period', key: 'period', width: 130, align: 'center' },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 90, align: 'center' },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center' },
]

// 模式控制策略配置数据
const modeList = ref([
  { id: '1', name: '展会模式-全开', trigger: '手动触发/展会排期', target: '全部回路组合', actionName: '开启并调光', brightness: '100%', period: '08:00-20:00', priority: '高', status: '启用' },
  { id: '2', name: '日常模式-标准', trigger: '定时触发/工作日', target: '公共区域组合', actionName: '开启并调光', brightness: '80%', period: '07:00-22:00', priority: '中', status: '启用' },
  { id: '3', name: '节能模式-低耗', trigger: '定时触发/非展会日', target: '必要区域组合', actionName: '开启并调光', brightness: '50%', period: '18:00-07:00', priority: '中', status: '启用' },
  { id: '4', name: '应急模式-全亮', trigger: '消防联动/手动触发', target: '全部回路组合', actionName: '强制开启', brightness: '100%', period: '全天', priority: '最高', status: '待命' },
  { id: '5', name: '清洁模式-局部', trigger: '手动触发', target: '走廊+卫生间组合', actionName: '开启并调光', brightness: '70%', period: '22:00-06:00', priority: '低', status: '启用' },
])
</script>

<style scoped lang="less">
.config-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
  }

  .config-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 16px;

    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.ant-card-head-title) {
      font-weight: 600;
    }

    .card-title-icon {
      margin-right: 8px;
    }

    .circuit-filter {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      white-space: nowrap;

      &.status-enabled {
        color: #389e0d;
        background: #e6f7e6;
      }

      &.status-trigger {
        color: #d48806;
        background: #fffbe6;
      }

      &.status-dimmed {
        color: #d48806;
        background: #fffbe6;
      }
    }
  }
}
</style>
