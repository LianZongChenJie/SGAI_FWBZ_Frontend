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
            <div>
                <VenueManagement
                  title="🏢 场馆信息管理"
                  :data="venueData"
                  :loading="venueLoading"
                  :pagination-total="venuePagination.total"
                  @add="handleAddVenue"
                  @detail="handleVenueDetail"
                  @table-change="handleTableChange"
                />
            </div>
        </div>

        <!-- 新增场馆弹窗 -->
        <VenueFormModal ref="venueFormModalRef" @success="handleAddSuccess" />

        <!-- 新增排期弹窗 -->
        <EventFormModal ref="eventFormModalRef" @success="handleAddEventSuccess" />

        <!-- 场馆详情弹窗 -->
        <a-modal
          v-model:visible="detailVisible"
          :title="`${currentVenueName} - 展商信息`"
          :footer="null"
          width="800px"
          destroy-on-close
        >
          <a-table
            :columns="detailColumns"
            :data-source="detailList"
            :loading="detailLoading"
            :pagination="false"
            row-key="id"
            size="middle"
          >
            <template #emptyText>
              <a-empty description="暂无展商信息" />
            </template>
          </a-table>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { StatCard } from '/@/views/bems-web/components';
import { EventSchedule, VenueManagement } from './elements/index';
import VenueFormModal from './elements/venueManagement/VenueFormModal.vue';
import { getVenueInfoList, getExhibitionList, getExhibitionMonthList, delExhibition, getSummaryCardList, getDetailList } from './index.api';
import type { VenueItem, ActiveMeetInfo, StatItem, ExhibitorInfo } from './index.api';
import type { DaySchedule } from './elements/eventSchedule/index.api';
import EventFormModal from './elements/eventSchedule/EventFormModal.vue';
import {
    ThunderboltOutlined,
    ShopOutlined,
    CloudOutlined,
    SettingOutlined,
    CaretDownOutlined,
    CaretUpOutlined,
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

// ===== 详情弹窗 =====
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailList = ref<ExhibitorInfo[]>([])
const currentVenueName = ref('')

const fetchDetailList = async (venueId: number) => {
  detailLoading.value = true
  try {
    const res = await getDetailList({ venueId }) as any
    detailList.value = Array.isArray(res) ? res : (res?.records || res?.data || [])
  } catch (error) {
    console.error('获取详情列表失败:', error)
    detailList.value = []
  } finally {
    detailLoading.value = false
  }
}

const handleVenueDetail = (record: VenueItem) => {
  currentVenueName.value = record.venueName || ''
  detailVisible.value = true
  detailList.value = []
  if (record.id) {
    fetchDetailList(record.id)
  }
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

// 详情弹窗表格列定义
const detailColumns = [
  { title: '展位号', dataIndex: 'boothNumber', key: 'boothNumber', width: 120 },
  { title: '专题展名称', dataIndex: 'thematicTxhibitionTitle', key: 'thematicTxhibitionTitle', width: 180 },
  { title: '展商名称（中文）', dataIndex: 'exhibitorNameCn', key: 'exhibitorNameCn', width: 200 },
  { title: '展商名称（英文）', dataIndex: 'exhibitorNameEn', key: 'exhibitorNameEn', width: 200 },
]

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

.venue-management-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid #f0f0f0;
    background: white;
    border-radius: 12px 12px 0 0;

    h3 {
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
    }
}

.ant-card-extra {
  display: flex;
  .collapse-btn {
    margin-left: 12px;
  }
}

.collapse-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size:14px;
    color: #666;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
        color: #1677ff;
        border-color: #1677ff;
    }
}
  
 
</style>