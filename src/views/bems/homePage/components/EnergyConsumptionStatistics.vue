<template>
  <div class="energy-consumption-statistics-main-box">
    <div class="title">
      能耗统计
      <div class="my-tabs-box">
        <MyTabs :handleSwitchDate="handleSwitchDate" />
      </div>
    </div>
    <div class="info-box">
      <div class="info-item" v-for="(item,index) in infoData" :key="index">
        <div class="icon-box">
          <div class="icon-style" :id="(item.name === '水(m³)') ? 'waterIcon' : (item.name === '电(kWh)' ? 'electricityIcon' : (item.name === '冷热量(Gj)' ? 'hotIcon' : 'gasIcon'))">

          </div>
        </div>
        <div class="info">
          <div>{{ item.name }}</div>
          <div>{{ item.value }}</div>
        </div>
        <div class="info">
          <div>同比</div>
          <div>{{ item.yoy }}<FallOutlined v-if="(item.yoy !== '--') && item.yoy.includes('-')" style="color: #1edf1e;" /><RiseOutlined v-else style="color: red;"/></div>
        </div>
        <div class="info">
          <div>环比</div>
          <div>{{ item.mom }} <FallOutlined v-if="(item.mom !== '--') && item.mom.includes('-')" style="color: #1edf1e;" /><RiseOutlined v-else style="color: red;"/></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MyTabs from './MyTabs.vue';
import { FallOutlined, RiseOutlined  } from '@ant-design/icons-vue';
import {
  getWaterEnergyConsumptionStatisticsDayApi,
  getWaterEnergyConsumptionStatisticsMonthApi,
  getWaterEnergyConsumptionStatisticsYearApi,
  getelEctricityEnergyConsumptionStatisticsDayApi,
  getelEctricityEnergyConsumptionStatisticsMonthApi,
  getelEctricityEnergyConsumptionStatisticsYearApi,
} from '../Standardized.api';

const infoData = ref([
  {
    name: '水(m³)',
    value: '33',
    yoy: '0.00',
    mom: '-53.85'
  },
  {
    name: '电(kWh)',
    value: '22540',
    yoy: '0.00',
    mom: '-57.05'
  },
  {
    name: '冷热量(Gj)',
    value: '28',
    yoy: '0.00',
    mom: '-54.35'
  },
])
// 切换时间
const handleSwitchDate = async(type) => {
  getData(type)
};

// 获取数据
const getData = async (type) => {
  let resWater:any
  let resEctricity:any
  if(type === 1) {
    resWater = await getWaterEnergyConsumptionStatisticsDayApi()
    resEctricity = await getelEctricityEnergyConsumptionStatisticsDayApi()
  } else if(type === 2) {
    resWater = await getWaterEnergyConsumptionStatisticsMonthApi()
    resEctricity = await getelEctricityEnergyConsumptionStatisticsMonthApi()
  } else {
    resWater = await getWaterEnergyConsumptionStatisticsYearApi()
    resEctricity = await getelEctricityEnergyConsumptionStatisticsYearApi()
  } 
  infoData.value[0].value = resWater.value
  infoData.value[0].yoy = resWater.yoy
  infoData.value[0].mom = resWater.mom

  infoData.value[1].value = resEctricity.value
  infoData.value[1].yoy = resEctricity.yoy
  infoData.value[1].mom = resEctricity.mom
}

onMounted( async () => {
  await getData(1)
})
</script>

<style lang="less" scoped>
.energy-consumption-statistics-main-box {
  height: 100%;
  width: 100%;

  .title {
    height: 40px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    background-color: #eaf0fc;
    .my-tabs-box {
      height: 90%;
      width: 30%;
      padding: 4px 0;
    }
  }

  .info-box {
    height: calc(100% - 30px);
    width: 100%;
    padding: 12px 24px;
    display: flex;
    flex-wrap: wrap;
    align-content: space-around;

    .info-item {
      display: flex;
      height: 30%;
      width: 100%;

      > div {
        width: 25%;
        height: 100%;
      }
      .icon-box {
        display: flex;
        justify-content: center;
        align-items: center;

        .icon-style {
          height: 55px;
          width: 55px;
          background-size: 100% 100%;
        }

        #waterIcon {
          background-image: url('@/assets/images/waterIcon2.png');
        }
        #electricityIcon {
          background-image: url('@/assets/images/electricityIcon2.png');
        }
        #hotIcon {
          background-image: url('@/assets/images/hotIcon2.png');
        }
        #gasIcon {
          background-image: url('@/assets/images/gasIcon.png');
        }
      }

      .info {
        display: flex;
        align-content: center;
        flex-wrap: wrap;
        > div {
          display: flex;
          align-items: center;
          font-size: 18px;
          width: 100%;
          height: 40%;
        }
      }
    }
  }
}
</style>