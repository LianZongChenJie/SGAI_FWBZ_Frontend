<template>
  <a-tabs
    v-model:activeKey="activeKey"
    centered
    class="full-height-tabs"
    :destroyInactiveTabPane="true"
    @change="handleTabs"
  >
    <a-tab-pane
      v-for="(item,index) in tabsList"
      :key="index + 1"
      :tab="item.name"
    >
      <div class="energy-consumption-analysis">
        <div class="charts-box">
          <div :class="(index % 2) === 0 ? 'left-echart-item' : 'right-echart-item'"  v-for="(item,index) in chartsList" :key="index">
            <ElectricEnergyChart v-if="item.chartType === 'pie'" :title="item.chartName" :point="item.pointId" :formData="formData"/>
            <TotalPowerConsumption v-else-if="item.chartType === 'bar'" :title="item.chartName" :point="item.pointId" :formData="formData"/>
            <LightingSocket v-else-if="item.chartType === 'line'" :title="item.chartName" :point="item.pointId" :formData="formData"/>
            <HVACSubItems v-else-if="item.chartType === 'stackedColumn'" :title="item.chartName" :point="item.pointId" :formData="formData"/>
          </div>
          <!-- <div class="right-echart-item">
            <TotalPowerConsumption />
          </div>
          <div class="left-echart-item">
            <LightingSocket />
          </div>
          <div class="right-echart-item">
            <HVACSubItems />
          </div>
          <div class="left-echart-item">
            <PowerConsumption />
          </div>
          <div class="right-echart-item">
            <SpecialElectricityUsage />
          </div> -->
        </div>
        <div class="data-box">
          <RightDataComponent ref="rightDataComponentRef" :benchmarkOptions="benchmarkOptions" :searchChartData="searchChartData" :point="rightPoint" />
        </div>
      </div>
    </a-tab-pane>
  </a-tabs>

</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import RightDataComponent from './components/RightDataComponent.vue';
import ElectricEnergyChart from './components/ElectricEnergyChart.vue';
import TotalPowerConsumption from './components/TotalPowerConsumption.vue';
import LightingSocket from './components/LightingSocket.vue';
import HVACSubItems from './components/HVACSubItems.vue';
import PowerConsumption from './components/PowerConsumption.vue';
import SpecialElectricityUsage from './components/SpecialElectricityUsage.vue';
import { getTabsDataApi, getChartsListApi, getBenchmarkListApi } from './Standardized.api';
import { message } from 'ant-design-vue';

// tabs配置列表
const tabsList = ref<any>([]);

// 当前页签id
const configId = ref('');

// charts配置列表
const chartsList = ref<any>([]);

// chartsRef
const pieRef = ref()

const rightDataComponentRef = ref()

// 基准select下拉框数据
const benchmarkOptions = ref<any>([]);

const formData = ref<any>({})

const activeKey = ref(1);

const rightPoint = ref()

onMounted(async () => {
  await getTabsList();
  await getChartsList();
  
});

// 获取tabs配置列表
const getTabsList = async () => {
  let res = await getTabsDataApi();
  tabsList.value = [...res];
  configId.value = tabsList.value.find((itme, index) => index + 1 === activeKey.value).id;
};

// 切换tabs
const handleTabs = async (activeKey) => {
  configId.value = tabsList.value.find((itme, index) => index + 1 === activeKey).id;
  chartsList.value = [];
  await getChartsList();
};

// 获取charts配置列表
const getChartsList = async () => {
  let res = await getChartsListApi({ configId: configId.value });
  chartsList.value = [...res];
  rightPoint.value = chartsList.value.find(item => item.chartType === 'bar').pointId
  // rightDataComponentRef.value.getExceptionPromptData()
  await getBenchmarkList();
};

// 获取基准配置列表
const getBenchmarkList = async () => {
  let res = await getBenchmarkListApi({ configId: configId.value });
  benchmarkOptions.value = [...res];
};

// 查询
const searchChartData = (form) => {
  formData.value = {...form}
  if(formData.value.dateType === 'year') {
    formData.value.analysisTime[0] = formData.value.analysisTime[0].split('-')[0] + '-01-01'
    formData.value.analysisTime[1] = formData.value.analysisTime[1].split('-')[0] + '-01-01'
    formData.value.referenceTime[0] = formData.value.referenceTime[0].split('-')[0] + '-01-01'
    formData.value.referenceTime[1] = formData.value.referenceTime[1].split('-')[0] + '-01-01'
  }
}
</script>

<style scoped lang="less">
.energy-consumption-analysis {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  overflow: auto;
  width: 100%;
  padding: 20px 10px 0px 10px;
  height: 82vh;
  .charts-box {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: flex-start;
    width: 73%;
    height: 140%;

    .left-echart-item,
    .right-echart-item {
      padding: 10px;
      height: 367px;
      border-radius: 5px;
      background-color: #fff;
      margin-bottom: 24px;
    }
    .left-echart-item {
      width: 52%;
    }
    .right-echart-item {
      width: 46%;
    }
  }
  .data-box {
    width: 23%;
    height: 140%;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;

    .exception-prompt {
      width: 100%;
      height: 32%;
      border: 1px solid green;
    }

    .content-settings {
      width: 100%;
      height: 65%;
      border: 1px solid green;
    }
  }
}
</style>