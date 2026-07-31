<template>
  <div class="equip-page">
    <div class="stat-cards">
      <StatCard
        label="设备总数"
        :value="statData.todayPower"
        change-text="较昨日下降 5.2%"
        trend="down"
        color="blue"
        :icon="ThunderboltOutlined"
      />
      <StatCard
        label="在线数量"
        :value="statData.todayWater"
        change-text="较昨日上升 2.1%"
        trend="up"
        color="green"
        :icon="ShopOutlined"
      />
      <StatCard
        label="区域数量"
        :value="statData.carbonEmission"
        change-text="较昨日下降 3.8%"
        trend="down"
        color="orange"
        :icon="CloudOutlined"
      />
      <StatCard
        label="运行中设备"
        :value="statData.deviceRate"
        change-text="较昨日上升 1.2%"
        trend="up"
        color="purple"
        :icon="SettingOutlined"
      />
    </div>
    <div class="equip-management">
        <EquipmengManagementDetails
            title="⚙️ 设备信息管理"
            :data="equipData"
            :loading="equipLoading"
            :pagination="equipPagination"
            @add="handleAddEquip"
            @edit="handleEditEquip"
            @detail="handleDetailEquip"
            @table-change="handleTableChange"
            @filter-change="handleFilterChange"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { StatCard} from '/@/views/bems-web/components';
import { EquipmengManagementDetails } from './elements/index';
import {
  ThunderboltOutlined,
  ShopOutlined,
  CloudOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'

interface EquipmentItem {
  id: string
  device_code: string     // 设备编号
  device_name: string     // 设备名称
  category_id: number     // 设备类别id
  model_id: number        // 设备模型id
  magnification: string   // 倍率
  device_type: number     // 设备分类 (1: 仪表, 2: 设备)
  run_state: number       // 运行状态 (0: 离线, 1: 在线)
}

const statData = ref({
  todayPower: '111',
  todayWater: '222',
  carbonEmission: '333',
  deviceRate: '444',
})

// ===== 设备数据 =====
const equipData = ref<EquipmentItem[]>([
  {
    id: '1',
    device_code: 'EQ-2026-001',
    device_name: '温度传感器A1',
    category_id: 123123231,
    model_id: 10342342341,
    magnification: '10x',
    device_type: 2,
    run_state: 1,
  },
  {
    id: '2',
    device_code: 'EQ-2026-002',
    device_name: '压力仪表B2',
    category_id: 1231231232,
    model_id: 102311323,
    magnification: '20x',
    device_type: 1,
    run_state: 1,
  },
  {
    id: '3',
    device_code: 'EQ-2026-003',
    device_name: '流量计C3',
    category_id: 12312333,
    model_id: 101231233,
    magnification: '15x',
    device_type: 1,
    run_state: 0,
  },
])
const equipLoading = ref(false)
const equipPagination = ref({
  current: 1,
  pageSize: 10,
  total: 3,
})

// ===== 事件处理 =====
const handleAddEquip = () => {
  console.log('新增设备')
  // TODO: 新增设备
}
const handleEditEquip = () => {
  console.log('编辑设备')
  // TODO: 编辑设备
}

const handleDetailEquip = (record: EquipmentItem) => {
  console.log('查看设备详情:', record)
  // TODO: 查看设备详情
}

const handleTableChange = (pagination: { current: number; pageSize: number }) => {
  console.log('表格分页变化:', pagination)
  equipPagination.value.current = pagination.current
  equipPagination.value.pageSize = pagination.pageSize
  // TODO: 重新请求数据
}

const handleFilterChange = (filters: { venue: string; type: string }) => {
  console.log('筛选条件变化:', filters)
  // TODO: 根据筛选条件重新请求数据
}
</script>

<style scoped lang="less">
.equip-page {
  padding: 15px;

  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 5px;
  }

  .equip-management {
    margin-top: 20px;
  }
}
</style>