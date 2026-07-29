<template>
    <div class="venue-scheduling">
        <div class="stat-cards">
            <StatCard label="今日用电量" :value="statData.todayPower" change-text="较昨日下降 5.2%" trend="down" color="blue"
                :icon="ThunderboltOutlined" />
            <StatCard label="今日用水量" :value="statData.todayWater" change-text="较昨日上升 2.1%" trend="up" color="green"
                :icon="ShopOutlined" />
            <StatCard label="碳排放量" :value="statData.carbonEmission" change-text="较昨日下降 3.8%" trend="down" color="orange"
                :icon="CloudOutlined" />
            <StatCard label="设备运行率" :value="statData.deviceRate" change-text="较昨日上升 1.2%" trend="up" color="purple"
                :icon="SettingOutlined" />
        </div>
        <div class="event-schedule">
            <EventSchedule
                title="📅 今日会展活动"
                :data="scheduleData"
                @add="handleAddEvent"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { StatCard } from '/@/views/bems-web/components';
import EventSchedule, { DaySchedule } from './elements/eventSchedule/index.vue';
import {
    ThunderboltOutlined,
    ShopOutlined,
    CloudOutlined,
    SettingOutlined,
} from '@ant-design/icons-vue'

const statData = {
    todayPower: '1,286 kWh',
    todayWater: '326 m³',
    carbonEmission: '852 kg',
    deviceRate: '96.5%',
    alarmTotal: '3 条',
    savings: '¥ 12,580',
}

const scheduleData: DaySchedule[] = [
  {
    date: '06/08',
    label: '周一 06/08',
    events: [
      {
        time: '08:00-18:00',
        name: '智能制造博览会',
        location: 'A馆1-3层',
        attendees: 8000,
        color: '#1677ff'
      }
    ]
  },
  {
    date: '06/09',
    label: '周二 06/09',
    events: [
      {
        time: '08:00-18:00',
        name: '智能制造博览会',
        location: 'A馆1-3层',
        attendees: 8000,
        color: '#1677ff'
      },
      {
        time: '09:00-17:00',
        name: '新能源产业论坛',
        location: 'B馆会议',
        attendees: 2500,
        color: '#faad14'
      },
      {
        time: '14:00-20:00',
        name: '夏季汽车消费展',
        location: 'C馆室外',
        attendees: 5000,
        color: '#52c41a'
      }
    ]
  },
  {
    date: '06/10',
    label: '周三 06/10',
    events: [
      {
        time: '09:00-17:00',
        name: '数字文创交易会',
        location: 'A馆4层',
        attendees: 6000,
        color: '#1677ff'
      }
    ]
  },
  {
    date: '06/11',
    label: '周四 06/11',
    events: [
      {
        time: '09:00-18:00',
        name: '数字文创交易会',
        location: 'A馆4层',
        attendees: 6000,
        color: '#1677ff'
      }
    ]
  },
  {
    date: '06/12',
    label: '周五 06/12',
    events: [
      {
        time: '10:00-16:00',
        name: '国际教育装备展',
        location: 'B馆1-2层',
        attendees: 4000,
        color: '#722ed1'
      }
    ]
  }
]

const handleAddEvent = () => {
  console.log('新增排期')
  // TODO: 打开新增排期弹窗
}
</script>

<style lang="less">
.venue-scheduling {
    padding: 16px
}

.stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}
.event-schedule {
    margin-top: 20px;
}
</style>