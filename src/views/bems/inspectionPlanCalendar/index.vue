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
          <el-calendar v-model="currentDate">
            <template #date-cell="{ data }">
              <div class="calendar-cell">
                <div class="date-header">
                  <span class="date-number">{{ data.day.split('-').slice(2).join('') }}</span>
                  <span v-if="isToday(data.day)" class="today-badge">今天</span>
                </div>
                <div class="plan-list">
                  <div
                    v-for="plan in getPlansForDate(data.day)"
                    :key="plan.id"
                    class="plan-item"
                    :title="plan.name"
                    @click="viewPlanDetail(plan)"
                  >
                    <el-tag :size="'small'" :type="getPlanType(plan.status)">
                      {{ plan.name }}
                    </el-tag>
                  </div>
                  <div v-if="getPlansForDate(data.day).length > 3" class="more-plans">
                    还有 {{ getPlansForDate(data.day).length - 3 }} 项...
                  </div>
                </div>
              </div>
            </template>
          </el-calendar>
        </div>

        <!-- 计划详情弹框 -->
        <el-dialog
          v-model="detailVisible"
          title="计划详情"
          width="600px"
          :append-to-body="true"
        >
          <el-descriptions :column="1" border>
            <el-descriptions-item label="计划名称">{{ currentPlan.name }}</el-descriptions-item>
            <el-descriptions-item label="计划日期">{{ currentPlan.date }}</el-descriptions-item>
            <el-descriptions-item label="维保周期">{{ currentPlan.cycle }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ currentPlan.principal }}</el-descriptions-item>
            <el-descriptions-item label="执行科组">{{ currentPlan.department }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ currentPlan.weibaoType }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getPlanType(currentPlan.status)">{{ currentPlan.status }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import moment from 'moment'
import { ArrowLeft, ArrowRight, Search, RefreshRight } from '@element-plus/icons-vue'
import { getMonthPlanApi } from './Standardized.api'

// 搜索表单
const searchForm = ref({
  month: moment().format('YYYY-MM'),
})

// 当前日期
const currentDate = ref(new Date())

// 计划数据（按日期索引）
const planData = ref<Record<string, any[]>>({})

// 详情弹框
const detailVisible = ref(false)
const currentPlan = ref<any>({})

// 判断是否是今天
const isToday = (date: string) => {
  return moment(date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
}

// 获取计划类型（用于标签颜色）
const getPlanType = (status: string) => {
  const typeMap: Record<string, string> = {
    '未开始': 'info',
    '进行中': 'warning',
    '已完成': 'success',
    '已逾期': 'danger',
  }
  return typeMap[status] || 'info'
}

// 获取指定日期的计划
const getPlansForDate = (date: string) => {
  const plans = planData.value[date] || []
  // 最多显示3条，避免格子过于拥挤
  return plans.slice(0, 3)
}

// 查看计划详情
const viewPlanDetail = (plan: any) => {
  currentPlan.value = plan
  detailVisible.value = true
}

// 工具函数：获取指定日期的当月范围
const getMonthRangeByMoment = (momentDate) => {
  if (!momentDate || !momentDate.isValid()) {
    ElMessage.error('无效的日期')
    return null
  }

  const firstDay = momentDate.clone().startOf('month')
  const lastDay = momentDate.clone().endOf('month')

  return {
    firstDay: firstDay.format('YYYY-MM-DD'),
    lastDay: lastDay.format('YYYY-MM-DD'),
    daysInMonth: lastDay.date(),
    month: momentDate.format('YYYY年MM月'),
    moment: {
      firstDay,
      lastDay
    }
  }
}

// 加载计划数据
const loadPlanData = async () => {
  try {
    // 将 "YYYY-MM" 格式转换为 moment 对象
    const momentDate = moment(currentDate.value, 'YYYY-MM')
    const monthResult = getMonthRangeByMoment(momentDate)
    const res = await getMonthPlanApi({
      startTime: monthResult?.firstDay + ' 00:00:00',
      endTime: monthResult?.lastDay + ' 00:00:00',
      labelType: '巡检',
    })
    if (res) {
      // 将计划数据按日期索引
      const indexedData: Record<string, any[]> = {}
      res.forEach((plan: any) => {
        const date = plan.planBeginTime.split(' ')[0]
        if (!indexedData[date]) {
          indexedData[date] = []
        }
        indexedData[date].push(plan)
      })
      planData.value = indexedData
    } else {
      planData.value = {}
    }
  } catch (error) {
    console.error('加载计划数据失败:', error)
    planData.value = {}
  }
}

// 月份切换
const handleMonthChange = () => {
  loadPlanData()
}

// 上个月
const prevMonth = () => {
  currentDate.value = moment(currentDate.value).subtract(1, 'months').toDate()
  loadPlanData()
}

// 下个月
const nextMonth = () => {
  currentDate.value = moment(currentDate.value).add(1, 'months').toDate()
  loadPlanData()
}

// 重置
const resetSearchForm = () => {
  currentDate.value = new Date()
  loadPlanData()
}

// 页面加载时获取数据
onMounted(() => {
  loadPlanData()
})
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
