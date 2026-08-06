<template>
  <div class="event-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <StatCard
        v-for="(card, index) in statCards"
        :key="index"
        :label="card.title || '--'"
        :value="card.value ?? '--'"
        :change-text="card.context || ''"
        :color="statCardConfigs[index]?.color || 'blue'"
        :icon="statCardConfigs[index]?.icon"
      />
    </div>

    <!-- 会前筹备清单 -->
    <div class="card">
      <div class="card-header">
        <h3><ScheduleOutlined /> 会前筹备清单</h3>
        <div class="header-right">
          <a-select
            v-model:value="selectedMeetId"
            style="width: 240px"
            placeholder="请选择会展活动"
            :loading="meetLoading"
            @change="handleMeetChange"
          >
            <a-select-option v-for="item in meetList" :key="item.id" :value="item.id">
              {{ item.activeName }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="card-body">
        <a-spin :spinning="listLoading">
          <!-- 无数据空状态 -->
          <div v-if="!checklistData?.data || checklistData.data.length === 0" class="empty-placeholder">
            <div class="empty-icon"><InboxOutlined /></div>
            <div class="empty-text">暂无筹备数据</div>
          </div>
          <template v-else>
            <div class="checklist-grid">
              <div
                class="checklist-group"
                v-for="group in checklistData.data"
                :key="group.typeId"
              >
                <h4 class="group-title">
                  {{ group.typeName || '--' }}
                </h4>
                <div class="info-list">
                  <div
                    class="info-item"
                    v-for="item in group.typeData || []"
                    :key="item.preparationInfoId"
                  >
                    <span class="info-label">{{ item.preparationInfoName || '--' }}</span>
                    <div class="info-right">
                      <span
                        class="info-value"
                        :class="{ 'done': item.status === 1, 'pending': item.status !== 1 }"
                      >
                        <template v-if="item.status === 1">
                          {{`${item.realValue} /${item.preparationValue}`}}
                          ✅ 已完成
                        </template>
                        <template v-else>
                          {{`${item.realValue} /${item.preparationValue}`}}
                        </template>
                      </span>
                      <a-button
                        v-if="item.status !== 1"
                        type="primary"
                        size="small"
                        @click="handleFinish(item)"
                      >
                        完成
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 筹备进度 -->
            <div class="progress-section">
              <h4 class="group-title">筹备进度</h4>
              <!-- 总体进度 -->
              <div class="progress-item overall">
                <span class="progress-label">总体进度</span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :class="getOverallPercent() >= 80 ? 'green' : 'orange'"
                    :style="{ width: getOverallPercent() + '%' }"
                  ></div>
                </div>
                <span
                  class="progress-value"
                  :style="{ color: getOverallPercent() >= 80 ? '#38a169' : '#dd6b20' }"
                >{{ getOverallPercent() }}%</span>
              </div>
              <!-- 各分组进度 -->
              <div class="progress-item" v-for="group in checklistData.data" :key="group.typeId">
                <span class="progress-label">{{ group.typeName || '--' }}</span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :class="getProgressPercent(group) >= 80 ? 'green' : 'orange'"
                    :style="{ width: getProgressPercent(group) + '%' }"
                  ></div>
                </div>
                <span
                  class="progress-value"
                  :style="{ color: getProgressPercent(group) >= 80 ? '#38a169' : '#dd6b20' }"
                >{{ getProgressPercent(group) }}%</span>
              </div>
            </div>
          </template>
        </a-spin>
      </div>
    </div>

    <!-- 会前数据预测研判 -->
    <div class="card">
      <div class="card-header">
        <h3><BarChartOutlined /> 会前数据预测研判</h3>
        <span class="tag tag-purple">AI辅助</span>
      </div>
      <div class="card-body">
        <div class="two-col">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">展会能耗预测曲线</div>
            <div class="chart-sub">基于历史同类展会数据与天气预测</div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">客流预测分布</div>
            <div class="chart-sub">预测峰值 6,500人 | 出现在 11:00-13:00</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { StatCard } from '/@/views/bems-web/components';
import {
  ScheduleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  AuditOutlined,
  BarChartOutlined,
  InboxOutlined,
} from '@ant-design/icons-vue';
import {
  getSummary,
  getPreparationList,
  finishPreparationItem,
  getActiveMeetList,
} from './index.api';
import type { StatCardVO, PreparationChecklistVO, PreparationDetailVO } from './index.api';
import type { ActiveMeetInfo } from '/@/views/bems-web/overview/index.api';

defineOptions({ name: 'EventPrePage' });

// ===== 统计卡片配置（图标/颜色固定，数据来自后端） =====
const statCardConfigs = [
  { color: 'blue' as const, icon: ScheduleOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: CalendarOutlined },
  { color: 'purple' as const, icon: AuditOutlined },
];
const statCards = ref<StatCardVO[]>([]);

const fetchSummary = async () => {
  try {
    const res = await getSummary();
    statCards.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error('获取卡片汇总失败:', error);
  }
};

// ===== 会展活动下拉 =====
const meetList = ref<ActiveMeetInfo[]>([]);
const meetLoading = ref(false);
const selectedMeetId = ref<number | undefined>(undefined);

const fetchMeetList = async () => {
  meetLoading.value = true;
  try {
    const res = await getActiveMeetList({ pageNo: 1, pageSize: 100 });
    meetList.value = res?.records || [];
    // 默认选择第一个
    if (meetList.value.length > 0 && meetList.value[0].id != null) {
      selectedMeetId.value = meetList.value[0].id;
      await fetchPreparationList(selectedMeetId.value);
    }
  } catch (error) {
    console.error('获取会展活动列表失败:', error);
  } finally {
    meetLoading.value = false;
  }
};

const handleMeetChange = (val: number) => {
  fetchPreparationList(val);
};

// ===== 会前筹备清单 =====
const listLoading = ref(false);
const checklistData = ref<PreparationChecklistVO>({});
const finishingId = ref<number | null>(null);

const fetchPreparationList = async (id?: number) => {
  if (!id) {
    checklistData.value = {};
    return;
  }
  listLoading.value = true;
  try {
    const res = await getPreparationList({ id });
    checklistData.value = res || {};
  } catch (error) {
    console.error('获取会前筹备清单失败:', error);
  } finally {
    listLoading.value = false;
  }
};

// 完成筹备项
const handleFinish = async (item: PreparationDetailVO) => {
  console.log('handleFinish', item);
  if (item.preparationInfoId == null) return;
  finishingId.value = item.preparationInfoId;
  try {
    await finishPreparationItem({
      preparationInfoId: item.preparationInfoId,
      preparationValue: item.preparationValue ?? 0,
      realValue: item.realValue ?? 0,
    });
    message.success('已完成');
    // 刷新筹备清单
    await fetchPreparationList(selectedMeetId.value);
  } catch (error) {
    console.error('完成筹备项失败:', error);
  } finally {
    finishingId.value = null;
  }
};

// 计算总体进度百分比，取 checklistData.preparationProgress
const getOverallPercent = () => {
  const progress = checklistData.value?.preparationProgress;
  if (progress) {
    const num = parseFloat(progress);
    if (!isNaN(num)) return Math.min(100, Math.max(0, num));
  }
  return 0;
};

// 计算分组完成进度百分比
const getProgressPercent = (group: { typeData?: PreparationDetailVO[]; preparationProgress?: string }) => {
  // 优先使用后端返回的 preparationProgress
  if (group.preparationProgress) {
    const num = parseFloat(group.preparationProgress);
    if (!isNaN(num)) return Math.min(100, Math.max(0, num));
  }
  // 根据 typeData 自行计算
  const data = group.typeData || [];
  if (data.length === 0) return 0;
  const done = data.filter((d) => d.status === 1).length;
  return Math.round((done / data.length) * 100);
};

onMounted(() => {
  fetchSummary();
  fetchMeetList();
});
</script>

<style scoped lang="less">
.event-page { padding: 0; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;

  .card-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-blue { background: #bee3f8; color: #2a4365; }
    .tag-purple { background: #e9d8fd; color: #553c9a; }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .card-body { padding: 22px; }
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.checklist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.checklist-group {
  .group-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;

  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .info-label {
      font-size: 13px;
      color: #718096;
    }

    .info-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-value {
      font-size: 13px;
      font-weight: 600;

      &.done { color: #38a169; }
      &.pending { color: #dd6b20; }
    }
  }
}

.progress-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .group-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;
  }
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;

  &.overall {
    .progress-label { font-weight: 600; color: #2d3748; }
    .progress-bar { height: 10px; }
    .progress-fill { border-radius: 5px; }
    .progress-value { font-weight: 700; }
  }

  &:last-child { margin-bottom: 0; }

  .progress-label {
    font-size: 13px;
    color: #4a5568;
    min-width: 80px;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #edf2f7;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;

    &.green { background: #38a169; }
    &.orange { background: #dd6b20; }
  }

  .progress-value {
    font-size: 13px;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }
}

.empty-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 260px;
  padding: 30px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }
}

.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 280px;
  padding: 30px;

  .chart-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .chart-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }

  .chart-sub {
    font-size: 12px;
    color: #a0aec0;
    margin-top: 8px;
  }
}
</style>
