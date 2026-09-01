<template>
  <div class="overview-tab">
    <div class="stat-cards">
      <StatCard
        label="照明回路总数"
        :value="statData.loopTotal"
        :change-text="statData.loopTotalChange"
        trend=""
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
        label="当前开启"
        :value="statData.openLoop"
        :change-text="statData.saveRate"
        trend=""
        color="orange"
        :icon="SparkleIcon"
      />
      <StatCard
        label="今日能耗"
        :value="statData.todayEnergy"
        :change-text="statData.todayEnergyChange"
        trend=""
        color="purple"
        :icon="LightningIcon"
      />
    </div>

    <div class="overview-sections">
      <!-- 照明回路分布图 -->
      <a-card class="overview-card" :bordered="false">
        <template #title>
          <span class="card-title-icon">🗺️</span>
          照明回路分布图
        </template>
        <template #extra>
          <span class="realtime-tag">实时</span>
        </template>
        <div class="map-placeholder">
          <div class="map-placeholder__icon">🗺️</div>
          <div class="map-placeholder__title">照明回路平面分布图</div>
          <div class="map-placeholder__desc">绿色=开启 | 灰色=关闭 | 红色=故障</div>
        </div>
      </a-card>

      <!-- 场景模式 -->
      <a-card class="overview-card" :bordered="false">
        <template #title>
          <span class="card-title-icon">🎨</span>
          场景模式
        </template>
        <template #extra>
          <a-button type="primary">+ 新增场景</a-button>
        </template>
        <div class="scene-grid">
          <div v-for="scene in sceneList" :key="scene.key" class="scene-item">
            <div class="scene-item__icon">{{ scene.icon }}</div>
            <div class="scene-item__info">
              <div class="scene-item__name">{{ scene.name }}</div>
              <div class="scene-item__desc">{{ scene.desc }}</div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 定时控制策略 -->
    <a-card class="strategy-card" :bordered="false">
      <template #title>
        <span class="card-title-icon">⏰</span>
        定时控制策略
      </template>
      <template #extra>
        <a-button type="primary">+ 新增策略</a-button>
      </template>
      <a-table
        :columns="strategyColumns"
        :data-source="strategyList"
        :pagination="false"
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
const SparkleIcon = () => h('span', { style: 'font-size: 20px;' }, '🌟')
const LightningIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')

// 统计数据（预留接口）
const statData = reactive({
  loopTotal: '2,340',
  loopTotalChange: '456 新增',
  onlineLoop: '2,338',
  onlineLoopRate: '99.9% 在线率',
  openLoop: '1,245',
  saveRate: '12% 节能中',
  todayEnergy: '3,420',
  todayEnergyChange: '15% kWh'
})

// 场景模式数据
const sceneList = ref([
  { key: 'exhibition', name: '展会模式', desc: '全开 100%亮度', icon: '🌅' },
  { key: 'daily', name: '日常模式', desc: '公共区域 80%', icon: '🏢' },
  { key: 'energy', name: '节能模式', desc: '必要区域 50%', icon: '🌙' },
  { key: 'emergency', name: '应急模式', desc: '应急照明 100%', icon: '🚨' },
])

// 定时控制策略列
const strategyColumns = [
  { title: '策略名称', dataIndex: 'name', key: 'name',width: 100 ,ellipsis: true },
  { title: '执行时间', dataIndex: 'time', key: 'time', width: 100 },
  { title: '目标回路', dataIndex: 'target', key: 'target', width: 100, ellipsis: true },
  { title: '执行动作', dataIndex: 'execute', key: 'execute', width: 150, ellipsis: true },
  { title: '重复周期', dataIndex: 'cycle', key: 'cycle', width: 100 },
  { title: '状态', key: 'status', width: 90, align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center' },
]

// 定时控制策略数据
const strategyList = ref([
  { id: '1', name: '早间开灯', time: '07:00', target: '公共区域全部', execute: '开启 → 80%亮度', cycle: '每日', status: '启用' },
  { id: '2', name: '午间调光', time: '12:00', target: '展厅区域', execute: '调光 → 60%亮度', cycle: '每日', status: '启用' },
  { id: '3', name: '晚间关灯', time: '22:00', target: '非必要区域', execute: '关闭', cycle: '每日', status: '启用' },
  { id: '4', name: '展会日全开', time: '08:00', target: '全部回路', execute: '开启 → 100%亮度', cycle: '展会日', status: '条件触发' },
])

onMounted(() => {
  console.log('能源优化 - 概览')
})
</script>

<style scoped lang="less">
.overview-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .overview-sections {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .overview-card {
      flex: 1;
      min-width: 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      :deep(.ant-card-head) {
        border-bottom: 1px solid #f0f0f0;
      }

      :deep(.ant-card-head-title) {
        font-weight: 600;
      }

      .card-title-icon {
        margin-right: 8px;
      }

      .realtime-tag {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size:14px;
        color: #389e0d;
        background: #e6f7e6;
      }

      .map-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 360px;
        border: 1px dashed #91d5ff;
        border-radius: 8px;
        background: #e6f7ff;

        &__icon {
          font-size: 56px;
          margin-bottom: 12px;
        }

        &__title {
          font-size: 16px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 8px;
        }

        &__desc {
          font-size:16px;
          color: rgba(0, 0, 0, 0.45);
        }
      }

      .scene-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .scene-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        background: #f6ffed;
        border: 1px solid #d9f7be;

        &__icon {
          font-size: 28px;
        }

        &__info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        &__name {
          font-size:16px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
        }

        &__desc {
          font-size:14px;
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }
  }

  .strategy-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.ant-card-head-title) {
      font-weight: 600;
    }

    .card-title-icon {
      margin-right: 8px;
    }

    .status-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size:14px;
      white-space: nowrap;

      &.status-enabled {
        color: #389e0d;
        background: #e6f7e6;
      }

      &.status-trigger {
        color: #d48806;
        background: #fffbe6;
      }
    }
  }
}
</style>
