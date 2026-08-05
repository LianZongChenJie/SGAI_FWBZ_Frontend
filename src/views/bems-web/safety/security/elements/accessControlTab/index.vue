<template>
  <div class="access-control-tab">
    <!-- 门禁统计卡片行 -->
    <div class="stats-row">
      <StatCard
        v-for="(item, index) in accessControlStatCards"
        :key="index"
        :label="item.title"
        :value="item.value"
        :change-text="item.context"
        :color="accessControlCardConfig[index]?.color || 'blue'"
        :icon="accessControlCardConfig[index]?.icon"
      />
    </div>

    <!-- 门禁地点列表 -->
    <div class="card">
      <div class="card-header">
        <h3><GatewayOutlined /> 门禁地点列表</h3>
        <a-button type="primary" :loading="syncLoading" @click="handleSyncAccessControlStatus">
          <SyncOutlined v-if="!syncLoading" />
          同步门禁状态
        </a-button>
      </div>
      <div class="card-body">
        <a-table
          :columns="doorColumns"
          :data-source="doorData"
          :pagination="doorPagination"
          :loading="doorLoading"
          row-key="indexCode"
          size="small"
          @change="handleDoorTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'doorState'">
              <a-tag :color="doorStateMap[record.doorState]?.color">
                {{ doorStateMap[record.doorState]?.text }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleViewDoorDetail(record)">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 门禁设备列表 -->
    <div class="card">
      <div class="card-header">
        <h3><ClusterOutlined /> 门禁设备列表</h3>
      </div>
      <div class="card-body">
        <a-table
          :columns="deviceColumns"
          :data-source="deviceData"
          :pagination="devicePagination"
          :loading="deviceLoading"
          row-key="indexCode"
          size="small"
          @change="handleDeviceTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'online'">
              <a-badge :status="record.online === '1' ? 'success' : 'default'" :text="record.online === '1' ? '在线' : '离线'" />
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 门禁事件详情弹窗 -->
    <a-modal
      v-model:visible="eventModalVisible"
      title="门禁事件列表"
      width="900px"
      :footer="null"
    >
      <div class="event-modal-body">
        <a-table
          :columns="eventColumns"
          :data-source="eventData"
          :pagination="eventPagination"
          :loading="eventLoading"
          row-key="id"
          size="small"
          @change="handleEventTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'inAndOutType'">
              <a-tag :color="inAndOutTypeMap[record.inAndOutType]?.color">
                {{ inAndOutTypeMap[record.inAndOutType]?.text }}
              </a-tag>
            </template>
            
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  getAccessControlSummary,
  getAccessControlDoorList,
  getAccessControlDeviceList,
  syncAccessControlStatus,
  getAccessControlEventList,
} from '../../index.api'
import type { StatItem, DoorListVO, AcsDeviceListVO, DoorEventListVO } from '../../index.api'
import {
  CheckCircleOutlined,
  WarningOutlined,
  GatewayOutlined,
  ClusterOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AccessControlTab' })

/** 门禁卡片颜色与图标配置 */
const accessControlCardConfig = [
  { color: 'blue' as const, icon: GatewayOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: ClusterOutlined },
  { color: 'red' as const, icon: WarningOutlined },
]

const accessControlStatCards = ref<StatItem[]>([])

const fetchAccessControlStatCards = async () => {
  try {
    const res = await getAccessControlSummary()
    accessControlStatCards.value = res || []
  } catch (error) {
    console.error('获取门禁统计卡片数据失败:', error)
  }
}

/** 门禁地点列表 */
const doorColumns = [
  { title: '门禁地点名称', dataIndex: 'name', key: 'name' },
  { title: '门禁地点编号', dataIndex: 'doorNo', key: 'doorNo' },
  { title: '安装位置', dataIndex: 'installLocation', key: 'installLocation' },
  { title: '区域名称', dataIndex: 'regionName', key: 'regionName' },
  { title: '门状态', dataIndex: 'doorState', key: 'doorState' },
  { title: '操作', key: 'action', width: 80 },
]

/** 门状态映射 (0=初始状态, 1=开门状态, 2=关门状态, 3=离线状态) */
const doorStateMap: Record<string, { text: string; color: string }> = {
  '0': { text: '初始状态', color: 'default' },
  '1': { text: '开门状态', color: 'green' },
  '2': { text: '关门状态', color: 'blue' },
  '3': { text: '离线状态', color: 'red' },
}

const doorData = ref<DoorListVO[]>([])
const doorLoading = ref(false)
const doorPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const fetchDoorData = async () => {
  doorLoading.value = true
  try {
    const res = await getAccessControlDoorList({
      pageNo: doorPagination.value.current,
      pageSize: doorPagination.value.pageSize,
    })
    doorData.value = res.records || []
    doorPagination.value.total = res.total || 0
    doorPagination.value.pageSize = res.size || 10
    doorPagination.value.current = res.current || 1
  } catch (error) {
    console.error('获取门禁地点列表失败:', error)
  } finally {
    doorLoading.value = false
  }
}

const handleDoorTableChange = (pag: any) => {
  doorPagination.value.current = pag.current
  doorPagination.value.pageSize = pag.pageSize
  fetchDoorData()
}

/** 同步门禁状态 */
const syncLoading = ref(false)
const handleSyncAccessControlStatus = async () => {
  syncLoading.value = true
  try {
    await syncAccessControlStatus()
    message.success('同步门禁状态成功')
    fetchDoorData()
  } catch (error) {
    console.error('同步门禁状态失败:', error)
    message.error('同步门禁状态失败')
  } finally {
    syncLoading.value = false
  }
}

/** 门禁设备列表 */
const deviceColumns = [
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: '设备编号', dataIndex: 'deviceCode', key: 'deviceCode' },
  { title: '设备IP', dataIndex: 'ip', key: 'ip' },
  { title: '厂商', dataIndex: 'manufacturer', key: 'manufacturer' },
  { title: '区域名称', dataIndex: 'regionName', key: 'regionName' },
  { title: '在线状态', dataIndex: 'online', key: 'online' },
]

const deviceData = ref<AcsDeviceListVO[]>([])
const deviceLoading = ref(false)
const devicePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const fetchDeviceData = async () => {
  deviceLoading.value = true
  try {
    const res = await getAccessControlDeviceList({
      pageNo: devicePagination.value.current,
      pageSize: devicePagination.value.pageSize,
    })
    deviceData.value = res.records || []
    devicePagination.value.total = res.total || 0
    devicePagination.value.pageSize = res.size || 10
    devicePagination.value.current = res.current || 1
  } catch (error) {
    console.error('获取门禁设备列表失败:', error)
  } finally {
    deviceLoading.value = false
  }
}

const handleDeviceTableChange = (pag: any) => {
  devicePagination.value.current = pag.current
  devicePagination.value.pageSize = pag.pageSize
  fetchDeviceData()
}

/** 门禁事件弹窗 */
const eventModalVisible = ref(false)
const eventData = ref<DoorEventListVO[]>([])
const eventLoading = ref(false)
const eventPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})
const currentDeviceIndexCode = ref('')

const eventColumns = [
  { title: '事件名称', dataIndex: 'eventName', key: 'eventName' },
  { title: '门禁地点名称', dataIndex: 'doorName', key: 'doorName' },
  { title: '人员姓名', dataIndex: 'personName', key: 'personName' },
  { title: '卡号', dataIndex: 'cardNo', key: 'cardNo' },
  { title: '进出类型', dataIndex: 'inAndOutType', key: 'inAndOutType' },
  { title: '事件时间', dataIndex: 'eventTime', key: 'eventTime' },
]

/** 进出类型映射 */
const inAndOutTypeMap: Record<number, { text: string; color: string }> = {
  1: { text: '进', color: 'green' },
  0: { text: '出', color: 'blue' },
  '-1': { text: '未知', color: 'default' },
}

const fetchEventData = async () => {
  eventLoading.value = true
  try {
    const res = await getAccessControlEventList({
      pageNo: eventPagination.value.current,
      pageSize: eventPagination.value.pageSize,
      doorIndexCode: currentDeviceIndexCode.value,
    })
    eventData.value = res.records || []
    eventPagination.value.total = res.total || 0
    eventPagination.value.pageSize = res.size || 10
    eventPagination.value.current = res.current || 1
  } catch (error) {
    console.error('获取门禁事件列表失败:', error)
  } finally {
    eventLoading.value = false
  }
}

const handleEventTableChange = (pag: any) => {
  eventPagination.value.current = pag.current
  eventPagination.value.pageSize = pag.pageSize
  fetchEventData()
}

const handleViewDoorDetail = (record: DoorListVO) => {
  currentDeviceIndexCode.value = record.indexCode || ''
  eventPagination.value.current = 1
  eventModalVisible.value = true
  fetchEventData()
}

onMounted(() => {
  fetchAccessControlStatCards()
  fetchDoorData()
  fetchDeviceData()
})
</script>

<style scoped lang="less">
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
  }

  .card-body {
    padding: 22px;
  }
}

.event-modal-body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
