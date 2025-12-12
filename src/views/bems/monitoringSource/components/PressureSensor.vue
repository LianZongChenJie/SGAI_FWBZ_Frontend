<template>
  <div class="pressure-sensor-main-box">
    <div class="button-box">
      <a-button
        type="primary"
        @click="getData"
      >刷新</a-button>
    </div>
    <div
      class="card-item"
      v-for="(item,index) in deviceList"
      :key="index"
    >
      <div class="title-box">
        <div class="device-name">
          {{ item.deviceName }}
        </div>
        <div class="device-status">
          <div>
            <div
              v-if="item.runState === '在线'"
              style="background-color: #e5f7e9;padding: 4px 12px;display: flex;align-items: center;font-size: 14px;"
            >
              <div style="height: 15px; width: 15px; border-radius: 15px;background-color: #00b42a;font-size: 14px;"></div>&nbsp;{{ '在线' }}
            </div>
            <div
              v-else
              style="background-color: #e8e8e9;padding: 4px 12px;display: flex;align-items: center;font-size: 14px;"
            >
              <div style="height: 15px; width: 15px; border-radius: 15px;background-color: #000;font-size: 14px;"></div>&nbsp;{{ '离线' }}
            </div>
          </div>
          <div>
            {{ item.createTime }}
          </div>
        </div>
      </div>
      <div class="point-list-box">
        <div
          v-if="item.runState !== '在线'"
          class="mask-layer"
        >

        </div>
        <div
          class="point-item"
          v-for="(pointItem,pointIndex) in item.attributes"
          :key="pointIndex"
        >
          <div style="font-size: 22px; color: #2b8aff;">
            {{ pointItem.value }}
          </div>
          <div style="font-size: 16px;">
            {{ pointItem.attributeName }}&nbsp;{{ pointItem.unit }}
          </div>
          <div style="color: #7c7d7e;">
            {{ pointItem.gatherTime }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { findDeviceAndAttributeApi } from '../Standardized.api';

const deviceList = ref<any[]>([]);

const getData = async () => {
  let res = await findDeviceAndAttributeApi({
    page: 1,
    pageSize: 99,
    categoryIds: '26',
  });
  deviceList.value = res.records;
};
// 初始加载
onMounted(async () => {
  await getData();
});
</script>

<style lang="less" scoped>
.pressure-sensor-main-box {
  height: 81vh;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: space-around;
  overflow: auto;
  background-color: #fff;
  padding-top: 12px;
  padding-left: 1.2%;

  .button-box {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 1.5%;
    margin-bottom: 16px;
  }

  .card-item {
    margin-right: 1.2%;
    width: 32%;
    height: 35%;
    padding: 6px 12px 12px;
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 20px;
    border: 1px solid #adadad;

    .title-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60px;
      font-size: 18px;
      .device-status > div {
        height: 50%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
    }

    .point-list-box {
      position: relative;
      height: calc(100% - 60px);
      width: 100%;
      padding: 6px;
      background-color: #f7f8fa;

      .point-item {
        padding: 0 20px;
        height: 100%;
        background-color: #fff;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        align-content: center;

        > div {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
      }

      .mask-layer {
        top: 0;
        left: 0;
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: #ebecec69;
      }
    }
  }
}
</style>
