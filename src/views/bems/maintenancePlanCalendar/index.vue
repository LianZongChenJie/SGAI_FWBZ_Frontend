<template>
  <div class="maintenance-plan-calendar">
    <el-container>
      <el-main>
        <div class="search-box clearfix">
          <el-form class="form-main" ref="searchForm" :model="searchForm" size="default" inline label-position="right">
            <el-form-item label="月份：">
              <el-date-picker
                v-model="currentDate"
                type="month"
                format="YYYY年MM月"
                value-format="YYYY-MM"
                :clearable="false"
                @change="handleMonthChange"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="ArrowLeft" @click="prevMonth()">上个月</el-button>
              <el-button type="primary" :icon="ArrowRight" @click="nextMonth()">下个月</el-button>
            </el-form-item>
          </el-form>
          <div class="search-box-button">
            <el-button size="default" type="primary" :icon="RefreshRight" @click="resetSearchForm">重置</el-button>
            <el-button size="default" type="primary" :icon="Search" @click="loadPlanData">查询</el-button>
          </div>
        </div>

        <div class="calendar-container">
          <el-calendar v-model="currentDate" ref="calendar">
            <template #header="{ date }">
              <span>{{ date }}</span>
              <el-button-group>
                <el-button size="small" @click="selectDate('prev-year')">上一年</el-button>
                <el-button size="small" @click="selectDate('prev-month')">上个月</el-button>
                <el-button size="small" @click="selectDate('today')">今天</el-button>
                <el-button size="small" @click="selectDate('next-month')">下个月</el-button>
                <el-button size="small" @click="selectDate('next-year')">下一年</el-button>
              </el-button-group>
            </template>
            <template #date-cell="{ data }">
              <div class="calendar-cell">
                <div class="date-header">
                  <span class="date-number">{{ data.day.split('-').slice(2).join('') }}</span>
                  <span v-if="isToday(data.day)" class="today-badge">今天</span>
                </div>
                <div class="plan-list" style="overflow-x: hidden">
                  <div v-for="plan in getPlansForDate(data.day)" :key="plan.id" class="plan-item" :title="plan.name" @click="viewPlanDetail(plan)">
                    <el-tag :size="'small'" :type="getPlanType(plan.status)">
                      {{ plan.taskName }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-calendar>
        </div>

        <!-- 计划详情弹框 -->
        <el-dialog v-model="detailVisible" title="计划详情" width="600px" :append-to-body="true">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="计划名称">{{ currentPlan.taskName }}</el-descriptions-item>
            <el-descriptions-item label="年份">{{ currentPlan.year }}</el-descriptions-item>
            <el-descriptions-item label="周次">{{ currentPlan.weekNumber }}</el-descriptions-item>
            <el-descriptions-item label="组织机构编码">{{ currentPlan.orgCode }}</el-descriptions-item>
            <el-descriptions-item label="任务开始时间">{{ currentPlan.plannedStartTime }}</el-descriptions-item>
            <el-descriptions-item label="任务开始时间">{{ currentPlan.plannedEndTime }}</el-descriptions-item>
            <el-descriptions-item label="实际开始时间">{{ currentPlan.actualStartTime || '未开始' }}</el-descriptions-item>
            <el-descriptions-item label="实际结束时间">{{ currentPlan.actualEndTime || '未结束' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getPlanType(currentPlan.status)">{{ currentPlan.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="备注说明">{{ currentPlan.completionRemark || '无' }}</el-descriptions-item>
            <el-descriptions-item label="执行人">{{ currentPlan.executorName || '未分配' }}</el-descriptions-item>
          </el-descriptions>
          <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
    <taskDetail :isCalendar="true" @success="detailSuccess" @register="registerDetail" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import moment from 'moment';
  import { ArrowLeft, ArrowRight, Search, RefreshRight } from '@element-plus/icons-vue';
  import { getMonthPlanApi } from './Standardized.api';
  import taskDetail from '../maintenanceTask/edit.vue';
  import { useModal } from '@/components/Modal';
  const [registerDetail, { openModal: openDetail }] = useModal();
  // 搜索表单
  const searchForm = ref({
    month: moment().format('YYYY-MM'),
  });
  const calendar = ref();
  // 当前日期
  const currentDate = ref(moment().format('YYYY-MM'));

  // 计划数据（按日期索引）
  const planData = ref<Record<string, any[]>>({});

  // 详情弹框
  const detailVisible = ref(false);
  const currentPlan = ref<any>({});

  // 判断是否是今天
  const isToday = (date: string) => {
    return moment(date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
  };

  // 获取计划类型（用于标签颜色）
  const getPlanType = (status: string) => {
    const typeMap: Record<string, string> = {
      已执行: 'info',
      未开始: 'warning',
      进行中: 'success',
      已延期: 'danger',
    };
    return typeMap[status] || 'info';
  };

  // 获取指定日期的计划
  const getPlansForDate = (date: string) => {
    const plans = planData.value[date] || [];
    // 最多显示3条，避免格子过于拥挤
    return plans;
  };

  // 查看计划详情
  const viewPlanDetail = (plan: any) => {
    openDetail(true, plan);
  };

  // 工具函数：获取指定日期的当月范围
  const getMonthRangeByMoment = (momentDate) => {
    if (!momentDate || !momentDate.isValid()) {
      ElMessage.error('无效的日期');
      return null;
    }

    const firstDay = momentDate.clone().startOf('month');
    const lastDay = momentDate.clone().endOf('month');

    return {
      firstDay: firstDay.format('YYYY-MM-DD'),
      lastDay: lastDay.format('YYYY-MM-DD'),
      daysInMonth: lastDay.date(),
      month: momentDate.format('YYYY年MM月'),
      moment: {
        firstDay,
        lastDay,
      },
    };
  };

  // 加载计划数据
  const loadPlanData = async () => {
    try {
      // 将 "YYYY-MM" 格式转换为 moment 对象
      const momentDate = moment(currentDate.value, 'YYYY-MM');
      const monthResult = getMonthRangeByMoment(momentDate);
      const res = await getMonthPlanApi({
        yearMonth: monthResult?.firstDay.slice(0, 7),
      });
      if (res) {
        // 将计划数据按日期索引
        const indexedData: Record<string, any[]> = {};
        res.forEach((plan: any) => {
          console.log(plan, 'plan');
          let date = '';
          if (plan.status == '已执行') {
            date = plan.actualEndTime.slice(0, 10);
          } else {
            let startTime = new Date(plan.plannedStartTime).getTime();
            let nowTime = new Date().getTime();
            console.log(startTime, nowTime, 'startTime, nowTime');
            if (startTime < nowTime) {
              date = moment().format('YYYY-MM-DD');
            } else {
              date = plan.plannedStartTime.slice(0, 10);
            }
          }
          if (!indexedData[date]) {
            indexedData[date] = [];
          }
          indexedData[date].push(plan);
        });
        planData.value = indexedData;
      } else {
        planData.value = {};
      }
      console.log(planData.value, 'planData.value');
    } catch (error) {
      console.error('加载计划数据失败:', error);
      planData.value = {};
    }
  };

  // 月份切换
  const handleMonthChange = () => {
    console.log(currentDate.value, 'currentDate.value');
    loadPlanData();
  };

  // 上个月
  const prevMonth = () => {
    currentDate.value = moment(currentDate.value).subtract(1, 'months').format('YYYY-MM');
    loadPlanData();
  };

  // 下个月
  const nextMonth = () => {
    currentDate.value = moment(currentDate.value).add(1, 'months').format('YYYY-MM');
    loadPlanData();
  };

  // 重置
  const resetSearchForm = () => {
    currentDate.value = moment().format('YYYY-MM');
    loadPlanData();
  };
  const selectDate = (val: string) => {
    switch (val) {
      case 'today':
        currentDate.value = moment().format('YYYY-MM');
        loadPlanData();
        return;
      case 'prev-year':
        currentDate.value = moment(currentDate.value).subtract(1, 'years').format('YYYY-MM');
        loadPlanData();
        return;
      case 'prev-month':
        currentDate.value = moment(currentDate.value).subtract(1, 'months').format('YYYY-MM');
        loadPlanData();
        return;
      case 'next-month':
        currentDate.value = moment(currentDate.value).add(1, 'months').format('YYYY-MM');
        loadPlanData();
        return;
      case 'next-year':
        currentDate.value = moment(currentDate.value).add(1, 'years').format('YYYY-MM');
        loadPlanData();
        return;
    }
  };
  // 详情成功回调
  const detailSuccess = (data: any) => {
    console.log(data, 'detailSuccess');
  };
  // 页面加载时获取数据
  onMounted(() => {
    loadPlanData();
  });
</script>

<style lang="less" scoped>
  .maintenance-plan-calendar {
    height: 88vh;
    background-color: #fff;

    .search-box {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .form-main {
        flex: 1;
      }

      .search-box-button {
        display: inline-block;
        margin-left: 20px;
      }
    }

    .calendar-container {
      :deep(.el-calendar) {
        .el-calendar__header {
          padding: 12px 20px;
          border-bottom: 1px solid #ebeef5;
        }

        .el-calendar__body {
          padding: 12px 20px 20px;
          th {
            padding: 12px 0;
          }
        }

        .el-calendar-table {
          .el-calendar-day {
            height: 120px;
            padding: 4px;
            transition: all 0.3s;

            &:hover {
              background-color: #f5f7fa;
            }
          }

          td.is-selected .el-calendar-day {
            background-color: #ecf5ff;
          }

          td.is-today .el-calendar-day {
            background-color: #fdf6ec;
          }
        }
      }
    }

    .calendar-cell {
      height: 100%;
      display: flex;
      flex-direction: column;

      .date-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .date-number {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }

        .today-badge {
          font-size: 10px;
          padding: 1px 4px;
          background-color: #f56c6c;
          color: #fff;
          border-radius: 4px;
        }
      }

      .plan-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .plan-item {
          cursor: pointer;
          transition: transform 0.2s;

          &:hover {
            transform: translateX(2px);
          }

          :deep(.el-tag) {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .more-plans {
          font-size: 12px;
          color: #909399;
          text-align: center;
          margin-top: 2px;
        }
      }
    }
  }
</style>
