<template>
  <div class="pressure-sensor-main-box">
    <div class="button-box">
      <span>
        设备总数：{{ count }}&emsp;在线：{{ online }}&emsp;离线：{{ offline }}
      </span>
      <a-button type="primary" @click="reload">刷新</a-button>
    </div>
    <div class="card-item" v-for="(item, index) in deviceList" :key="index">
      <div class="title-box">
        <div class="device-name">
          {{ item.deviceName }}
        </div>
        <div class="device-status">
          <div>
            <div v-if="item.runState === '在线'"
              style="background-color: #e5f7e9;padding: 4px 12px;display: flex;align-items: center;font-size: 14px;">
              <div style="height: 15px; width: 15px; border-radius: 15px;background-color: #00b42a;font-size: 14px;">
              </div>&nbsp;{{ '在线' }}
            </div>
            <div v-else
              style="background-color: #e8e8e9;padding: 4px 12px;display: flex;align-items: center;font-size: 14px;">
              <div style="height: 15px; width: 15px; border-radius: 15px;background-color: #000;font-size: 14px;"></div>
              &nbsp;{{ '离线' }}
            </div>
          </div>
          <div>
            {{ item.lastGatherTime }}
          </div>
        </div>
      </div>
      <div class="point-list-box">

        <div class="point-item" :id='(item.attributes.length === 1 ? "only" : "")' v-for="(pointItem, pointIndex) in item.attributes" :key="pointIndex">
          <div style="font-size: 22px; color: #2b8aff;">
            {{ pointItem.value }}
          </div>
          <div style="font-size: 14px;">
            {{ pointItem.attributeName }}&nbsp;{{ pointItem.unit }}
          </div>
          <div style="color: #7c7d7e; text-align: center;">
            {{ pointItem.gatherTime }}
          </div>
        </div>
      </div>
      <div v-if="item.runState !== '在线'" class="mask-layer">

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { findDeviceAndAttributeApi, deviceRunStateStatisticsApi } from '../Standardized.api';

const props = defineProps({
  apiParams: {
    type: String,
    default: '26',
  },
  isFilter: {
    type: Boolean,
    default: false
  }
});

const deviceList = ref<any[]>([]);

const count = ref('0');
const online = ref('0');
const offline = ref('0');

const reload = async () => {
  await getData()
  await deviceRunStateStatistics()
}

const getData = async () => {
  let res = await findDeviceAndAttributeApi({
    page: 1,
    pageSize: 99,
    categoryIds: props.apiParams,
  });
  deviceList.value = res.records;
  if(props.isFilter) {
    for (let i = 0; i < res.records.length; i++) {
      deviceList.value[i].attributes = res.records[i].attributes.filter(item => {
        if ((item.attributeName === '瞬时流量' || item.attributeName === '流体速度')) return item
      })
    }
  } else {
    for (let i = 0; i < res.records.length; i++) {
      deviceList.value[i].attributes = res.records[i].attributes.filter(item => {
        if (item.attributeName === '压力') return item
      })
    }
  }

};

const deviceRunStateStatistics = async () => {
  let res = await deviceRunStateStatisticsApi({ categoryId: props.apiParams });
  count.value = res.count;
  online.value = res.online;
  offline.value = res.offline;
};
// 初始加载
onMounted(async () => {
  await getData();
  await deviceRunStateStatistics();
});
</script>

<style lang="less" scoped>
.pressure-sensor-main-box {
  height: 81vh;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  overflow: auto;
  background-color: #fff;
  padding-top: 12px;
  padding-left: 1.2%;

  .button-box {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 1.5%;
    margin-bottom: 16px;

    >span {
      font-size: 18px;
    }
  }

  .card-item {
    margin-right: 2%;
    width: 23%;
    height: 28%;
    padding: 6px 12px 12px;
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 20px;
    border: 1px solid #adadad;
    position: relative;

    .title-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60px;
      font-size: 18px;

      .device-status>div {
        height: 50%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
    }

    .point-list-box {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      height: calc(100% - 60px);
      width: 100%;
      padding: 6px;
      background-color: #f7f8fa;
      overflow: auto;

      .point-item {
        padding: 0 20px;
        height: 90%;
        width: 45%;
        margin-left: 2.5%;
        background-color: #fff;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        align-content: center;
        margin-bottom: 12px;

        >div {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      #only {
        width: 96%;
      }
    }

    .mask-layer {
      top: 70px;
      left: 5%;
      position: absolute;
      height: calc(100% - 80px);
      width: 88%;
      background-color: #ebecec69;
    }
  }
}
</style>
