<template>
    <div class="venue-scheduling">
        <div class="stat-cards">
            <StatCard
                v-for="(item, index) in statCards"
                :key="index"
                :label="item.title"
                :value="item.value"
                :change-text="item.context"
                :color="cardConfig[index]?.color || 'blue'"
                :icon="cardConfig[index]?.icon"
            />
        </div>
        <div class="event-schedule">
            <EventSchedule
                title="📅 活动排期"
                :data="scheduleData"
                :loading="scheduleLoading"
                @add="handleAddEvent"
                @delete="handleDeleteEvent"
                @change-period="handlePeriodChange"
            />
        </div>
        <div class="venue-management">
            <VenueManagement
              title="🏢 场馆信息管理"
              :data="venueData"
              :loading="venueLoading"
              @add="handleAddVenue"
              @detail="handleVenueDetail"
              @table-change="handleTableChange"
            />
        </div>

        <!-- 新增场馆弹窗 -->
        <VenueFormModal ref="venueFormModalRef" @success="handleAddSuccess" />

        <!-- 新增排期弹窗 -->
        <EventFormModal ref="eventFormModalRef" @success="handleAddEventSuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { StatCard } from '/@/views/bems-web/components';
import { EventSchedule, VenueManagement } from './elements/index';
import VenueFormModal from './elements/venueManagement/VenueFormModal.vue';
import { getVenueInfoList, getExhibitionList, getExhibitionMonthList, delExhibition, getSummaryCardList } from './index.api';
import type { VenueItem, ActiveMeetInfo, StatItem } from './index.api';
import type { DaySchedule } from './elements/eventSchedule/index.api';
import EventFormModal from './elements/eventSchedule/EventFormModal.vue';
import {
    ThunderboltOutlined,
    ShopOutlined,
    CloudOutlined,
    SettingOutlined,
} from '@ant-design/icons-vue'

// ===== 统计卡片 =====
const cardConfig = [
  { color: 'blue' as const, icon: ThunderboltOutlined },
  { color: 'green' as const, icon: ShopOutlined },
  { color: 'orange' as const, icon: CloudOutlined },
  { color: 'purple' as const, icon: SettingOutlined },
]

const statCards = ref<StatItem[]>([])

const fetchStatCards = async () => {
  try {
    const res = await getSummaryCardList()
    statCards.value = res || []
  } catch (error) {
    console.error('获取统计卡片数据失败:', error)
  }
}

// ===== 场馆数据 =====
const venueData = ref<VenueItem[]>([])
const venueLoading = ref(false)
const venuePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const fetchVenueData = async () => {
  venueLoading.value = true
  try {
    const res = await getVenueInfoList({
      pageNo: venuePagination.value.current,
      pageSize: venuePagination.value.pageSize,
    })
    // 假设后端返回 { records: VenueItem[], total: number }
    venueData.value = res.records || []
    venuePagination.value.total = res.total || 0
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  } finally {
    venueLoading.value = false
  }
}

// ===== 会展活动数据 =====
const scheduleData = ref<DaySchedule[]>([])
const scheduleLoading = ref(false)
const schedulePeriod = ref<string>('week')

const fetchScheduleData = async () => {
  scheduleLoading.value = true
  try {
    if (schedulePeriod.value === 'week') {
      const res = await getExhibitionList()
      scheduleData.value = res || []
    } else {
      // 本月：取第一天和最后一天作为入参
      const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD')
      const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD')
      const res = await getExhibitionMonthList({ startDate: startOfMonth, endDate: endOfMonth })
      // listPage 接口返回扁平的活动列表，需按 startDate 分组为 DaySchedule 格式
      const rawList: any[] = Array.isArray(res) ? res : (res?.records || [])
      const groupedMap = new Map<string, any[]>()
      rawList.forEach((item: any) => {
        const dateKey = item.startDate ? dayjs(item.startDate).format('YYYY-MM-DD') : ''
        if (!dateKey) return
        if (!groupedMap.has(dateKey)) {
          groupedMap.set(dateKey, [])
        }
        groupedMap.get(dateKey)!.push(item)
      })
      scheduleData.value = Array.from(groupedMap.entries()).map(([date, list]) => ({ date, list }))
    }
  } catch (error) {
    console.error('获取会展活动列表失败:', error)
  } finally {
    scheduleLoading.value = false
  }
}

const handlePeriodChange = (period: string) => {
  schedulePeriod.value = period
  fetchScheduleData()
}

onMounted(() => {
  fetchStatCards()
  fetchVenueData()
  fetchScheduleData()
})

const venueFormModalRef = ref()

const handleAddVenue = () => {
  venueFormModalRef.value?.open()
}

const handleAddSuccess = () => {
  fetchVenueData()
}

const handleVenueDetail = (record: VenueItem) => {
  console.log('查看详情:', record)
  // TODO: 跳转详情页或打开详情弹窗
}

const handleTableChange = (paginationData: any) => {
  venuePagination.value.current = paginationData.current
  venuePagination.value.pageSize = paginationData.pageSize
  fetchVenueData()
}

const eventFormModalRef = ref()

const handleAddEvent = () => {
  eventFormModalRef.value?.open()
}

const handleAddEventSuccess = () => {
  fetchScheduleData()
}

/** 删除会展活动 */
const handleDeleteEvent = async (event: ActiveMeetInfo) => {
  try {
    await delExhibition({ id: event.id! })
    fetchScheduleData()
  } catch (error) {
    console.error('删除会展活动失败:', error)
  }
}
</script>

<style lang="less">

.stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}
.event-schedule, .venue-management {
    margin-top: 20px;
}
  
 
</style>