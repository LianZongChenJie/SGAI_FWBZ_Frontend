<template>
  <div class="log-tab">
    <div class="stat-cards">
      <StatCard
        label="今日控制次数"
        :value="statData.controlCount"
        :change-text="statData.controlCountChange"
        trend="up"
        color="blue"
        :icon="BarChartIcon"
      />
      <StatCard
      
        label="策略自动执行"
        :value="statData.autoExecute"
        :change-text="statData.autoExecuteRate"
        trend=""
        color="green"
        :icon="RobotIcon"
      />
      <StatCard
        label="手动控制"
        :value="statData.manualControl"
        :change-text="statData.manualControlRate"
        trend=""
        color="orange"
        :icon="PointerIcon"
      />
      <StatCard
        label="联动触发"
        :value="statData.linkTrigger"
        :change-text="statData.linkTriggerRate"
        trend=""
        color="purple"
        :icon="LinkIcon"
      />
    </div>

    <!-- 控制历史查询 -->
    <a-card class="log-card" :bordered="false">
      <template #title>
        <span class="card-title-icon">📋</span>
        控制历史查询
      </template>
      <template #extra>
        <div class="log-filter">
          <a-date-picker v-model:value="logFilter.date" placeholder="选择日期" />
          <a-select v-model:value="logFilter.strategy" placeholder="全部策略" style="width: 130px">
            <a-select-option value="">全部策略</a-select-option>
            <a-select-option value="展会模式-全开">展会模式-全开</a-select-option>
            <a-select-option value="日常模式-标准">日常模式-标准</a-select-option>
            <a-select-option value="节能模式-低耗">节能模式-低耗</a-select-option>
            <a-select-option value="清洁模式-局部">清洁模式-局部</a-select-option>
          </a-select>
          <a-select v-model:value="logFilter.controlMode" placeholder="全部控制方式" style="width: 130px">
            <a-select-option value="">全部控制方式</a-select-option>
            <a-select-option value="定时触发">定时触发</a-select-option>
            <a-select-option value="手动控制">手动控制</a-select-option>
            <a-select-option value="联动触发">联动触发</a-select-option>
          </a-select>
          <a-select v-model:value="logFilter.scene" placeholder="全部场景" style="width: 130px">
            <a-select-option value="">全部场景</a-select-option>
            <a-select-option value="展会">展会</a-select-option>
            <a-select-option value="日常">日常</a-select-option>
            <a-select-option value="节能">节能</a-select-option>
            <a-select-option value="应急">应急</a-select-option>
            <a-select-option value="清洁">清洁</a-select-option>
          </a-select>
          <a-button type="primary">🔍查询</a-button>
          <a-button>📥导出</a-button>
        </div>
      </template>
      <a-table
        :columns="logColumns"
        :data-source="logList"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'result'">
            <span class="status-tag status-enabled">{{ record.result }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small">详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 统计图表 -->
    <div class="chart-sections">
      <!-- 控制方式占比 -->
      <a-card class="chart-card" :bordered="false">
        <template #title>
          <span class="card-title-icon">📈</span>
          控制方式占比
        </template>
        <div class="chart-placeholder">
          <div class="chart-placeholder__icon">🍩</div>
          <div class="chart-placeholder__title">控制方式分布饼图</div>
          <div class="chart-placeholder__desc">定时 57% | 手动 29% | 联动 14%</div>
        </div>
      </a-card>

      <!-- 各场景控制次数 -->
      <a-card class="chart-card" :bordered="false">
        <template #title>
          <span class="card-title-icon">📊</span>
          各场景控制次数
        </template>
        <div class="chart-placeholder">
          <div class="chart-placeholder__icon">📊</div>
          <div class="chart-placeholder__title">各场景控制次数柱状图</div>
          <div class="chart-placeholder__desc">展会 / 日常 / 节能 / 应急 / 清洁</div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, h, onMounted, ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'

// emoji 图标组件
const BarChartIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const RobotIcon = () => h('span', { style: 'font-size: 20px;' }, '🤖')
const PointerIcon = () => h('span', { style: 'font-size: 20px;' }, '👆')
const LinkIcon = () => h('span', { style: 'font-size: 20px;' }, '🔗')

// 统计数据（预留接口）
const statData = reactive({
  controlCount: '156',
  controlCountChange: '23 较昨日',
  autoExecute: '89',
  autoExecuteRate: '57% 占比',
  manualControl: '45',
  manualControlRate: '29% 占比',
  linkTrigger: '22',
  linkTriggerRate: '14% 占比'
})

onMounted(() => {
  console.log('能源优化 - 日志')
})

// 控制历史查询筛选
const logFilter = reactive({
  date: null,
  strategy: '',
  controlMode: '',
  scene: ''
})

// 控制历史查询列
const logColumns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 70, align: 'center' },
  { title: '策略名称', dataIndex: 'strategyName', key: 'strategyName', width: 100, ellipsis: true },
  { title: '控制时间', dataIndex: 'controlTime', key: 'controlTime', width: 150, align: 'center' },
  { title: '控制场景', dataIndex: 'scene', key: 'scene', width: 100, align: 'center' },
  { title: '控制回路/组合', dataIndex: 'target', key: 'target', width: 180, ellipsis: true },
  { title: '执行动作', dataIndex: 'execute', key: 'execute', width: 130 },
  { title: '控制方式', dataIndex: 'controlMode', key: 'controlMode', width: 110, align: 'center' },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100, align: 'center' },
  { title: '执行结果', key: 'result', width: 100, align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center' },
]

// 控制历史查询数据
const logList = ref([
  { id: '1', index: 1, strategyName: '展会模式-全开', controlTime: '2026-06-09 08:00:05', scene: '展会', target: 'A馆F1大厅全照明(3回路)', execute: '开启 → 100%亮度', controlMode: '定时触发', operator: '系统', result: '成功' },
  { id: '2', index: 2, strategyName: '日常模式-标准', controlTime: '2026-06-09 07:00:02', scene: '日常', target: '公共区域走廊照明(4回路)', execute: '开启 → 80%亮度', controlMode: '定时触发', operator: '系统', result: '成功' },
  { id: '3', index: 3, strategyName: '--', controlTime: '2026-06-09 13:35:18', scene: '日常', target: 'LT-B-201(B馆F1走廊)', execute: '调光 → 50%亮度', controlMode: '手动控制', operator: '张工', result: '成功' },
  { id: '4', index: 4, strategyName: '节能模式-低耗', controlTime: '2026-06-09 12:00:00', scene: '节能', target: 'A馆F2展厅全照明(4回路)', execute: '调光 → 60%亮度', controlMode: '定时触发', operator: '系统', result: '成功' },
  { id: '5', index: 5, strategyName: '--', controlTime: '2026-06-09 11:20:45', scene: '展会', target: 'LT-A-102(A馆F2展厅A区)', execute: '开启 → 100%亮度', controlMode: '手动控制', operator: '李工', result: '成功' },
  { id: '6', index: 6, strategyName: '--', controlTime: '2026-06-09 10:15:33', scene: '应急', target: '全部回路组合(24回路)', execute: '强制开启 → 100%亮度', controlMode: '联动触发', operator: '系统', result: '成功' },
  { id: '7', index: 7, strategyName: '清洁模式-局部', controlTime: '2026-06-09 06:30:00', scene: '清洁', target: '走廊+卫生间组合(6回路)', execute: '开启 → 70%亮度', controlMode: '定时触发', operator: '系统', result: '成功' },
  { id: '8', index: 8, strategyName: '日常模式-标准', controlTime: '2026-06-09 06:00:00', scene: '日常', target: 'B馆会议厅全照明(3回路)', execute: '开启 → 80%亮度', controlMode: '定时触发', operator: '系统', result: '成功' },
  { id: '9', index: 9, strategyName: '--', controlTime: '2026-06-09 09:45:12', scene: '日常', target: 'LT-C-101(C馆F1展厅)', execute: '关闭', controlMode: '手动控制', operator: '王工', result: '成功' },
  { id: '10', index: 10, strategyName: '展会模式-全开', controlTime: '2026-06-09 08:00:05', scene: '展会', target: 'C馆F1展厅全照明(3回路)', execute: '开启 → 100%亮度', controlMode: '定时触发', operator: '系统', result: '成功' },
])
</script>

<style scoped lang="less">
.log-tab {
  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .log-card {
    margin-bottom: 20px;
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

    .log-filter {
      display: flex;
      align-items: center;
      gap: 8px;
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
    }
  }

  .chart-sections {
    display: flex;
    gap: 16px;

    .chart-card {
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

      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 260px;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        background: #f5f7fa;

        &__icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        &__title {
          font-size:16px;
          color: rgba(0, 0, 0, 0.45);
          margin-bottom: 8px;
        }

        &__desc {
          font-size:14px;
          color: rgba(0, 0, 0, 0.35);
        }
      }
    }
  }
}
</style>
