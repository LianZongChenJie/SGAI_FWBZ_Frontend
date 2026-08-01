<template>
  <div class="overview-tab">
    <div class="stat-cards">
      <StatCard
        label="计量表计总数"
        :value="statData.meterTotal"
        :change-text="statData.meterTotalChange"
        trend="up"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="表计在线率"
        :value="statData.meterOnlineRate"
        :change-text="statData.meterOnlineStatus"
        trend=""
        color="green"
        :icon="CheckCircleOutlined"
      />
      <StatCard
        label="今日用电量"
        :value="statData.todayPower"
        :change-text="statData.todayPowerChange"
        trend="down"
        color="orange"
        :icon="PlugIcon"
      />
      <StatCard
        label="今日用水量"
        :value="statData.todayWater"
        :change-text="statData.todayWaterChange"
        trend="down"
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
          <span class="analysis-card__tag">本月</span>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">📊</span>
            <div class="chart-placeholder__text">各场馆用电量柱状对比图</div>
          </div>
        </div>
      </a-card>

      <!-- 用能结构分析 -->
      <a-card class="analysis-card" :bordered="false">
        <div class="analysis-card__header">
          <div class="analysis-card__title">
            <span class="analysis-card__icon">🥧</span>
            <span>用能结构分析</span>
          </div>
          <span class="analysis-card__tag analysis-card__tag--realtime">实时</span>
        </div>
        <div class="analysis-card__body">
          <div class="chart-placeholder">
            <span class="analysis-card__icon2">🍩</span>
            <div class="chart-placeholder__text">用能类型占比饼图</div>
            <div class="chart-placeholder__legend">
              空调 45% | 照明 25% | 动力 18% | 其他 12%
            </div>
          </div>
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
          <a-select
            v-model:value="meterType"
            placeholder="全部类型"
            class="meter-data-card__select"
            :options="typeOptions"
          />
          <a-select
            v-model:value="meterVenue"
            placeholder="全部场馆"
            class="meter-data-card__select"
            :options="venueOptions"
          />
          <a-button type="primary">
            <template #icon>
              <SearchOutlined />
            </template>
            🔍查询
          </a-button>
          <a-button>
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
        :pagination="false"
        size="middle"
        class="meter-data-card__table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <span class="status-tag status-tag--normal">{{ record.status }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small">详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue'

// 自定义 emoji 图标组件（插头和水滴）
const PlugIcon = () => h('span', { style: 'font-size: 20px;' }, '🔌')
const WaterDropIcon = () => h('span', { style: 'font-size: 20px;' }, '💧')

// 统计数据（预留接口，当前为模拟数据）
const statData = reactive({
  meterTotal: '245',
  meterTotalChange: '56 新增',
  meterOnlineRate: '100%',
  meterOnlineStatus: '全部正常',
  todayPower: '42,156',
  todayPowerChange: '6.8% kWh',
  todayWater: '856',
  todayWaterChange: '3.2% m³',
})

// 计量表计数据筛选
const meterType = ref<string | undefined>(undefined)
const meterVenue = ref<string | undefined>(undefined)

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'electric', label: '电表' },
  { value: 'water', label: '水表' },
  { value: 'gas', label: '气表' },
]

const venueOptions = [
  { value: '', label: '全部场馆' },
  { value: 'A', label: 'A馆' },
  { value: 'B', label: 'B馆' },
  { value: 'C', label: 'C馆' },
]

const meterColumns = [
  { title: '表计编号', dataIndex: 'code', key: 'code' },
  { title: '表计类型', dataIndex: 'type', key: 'type' },
  { title: '安装位置', dataIndex: 'location', key: 'location' },
  { title: '今日读数', dataIndex: 'todayReading', key: 'todayReading' },
  { title: '今日用量', dataIndex: 'todayUsage', key: 'todayUsage' },
  { title: '本月累计', dataIndex: 'monthTotal', key: 'monthTotal' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' },
]

const meterData = [
  { key: '1', code: 'EM-A-001', type: '电表', location: 'A馆-总配电室', todayReading: '1,245,678.5', todayUsage: '12,456 kWh', monthTotal: '356,789 kWh', status: '正常' },
  { key: '2', code: 'WM-A-001', type: '水表', location: 'A馆-水泵房', todayReading: '456,789.2', todayUsage: '256 m³', monthTotal: '7,234 m³', status: '正常' },
  { key: '3', code: 'EM-B-001', type: '电表', location: 'B馆-总配电室', todayReading: '892,345.1', todayUsage: '8,923 kWh', monthTotal: '245,678 kWh', status: '正常' },
  { key: '4', code: 'GM-C-001', type: '气表', location: 'C馆-锅炉房', todayReading: '123,456.8', todayUsage: '456 m³', monthTotal: '12,345 m³', status: '正常' },
  { key: '5', code: 'EM-C-001', type: '电表', location: 'C馆-总配电室', todayReading: '678,901.3', todayUsage: '6,789 kWh', monthTotal: '189,012 kWh', status: '正常' },
]

// 加载概览数据（预留接口）
const loadOverviewData = async () => {
  // TODO: 调用概览数据接口，例如：
  // const res = await getEnergyMeteringOverview()
  // statData.meterTotal = res.meterTotal
  // statData.meterTotalChange = res.meterTotalChange
  // ...
  console.log('加载能源计量概览数据')
}

onMounted(() => {
  loadOverviewData()
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
    margin-top: 16px;
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
      margin-bottom: 16px;
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
  }

  .meter-data-card {
    margin-top: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 16px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
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
      width: 140px;
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
    }
  }
}
</style>
