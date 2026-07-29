<template>
  <div class="home-page-main-box">
    <div class="left-box">
      <EnergySafety />
    </div>
    <div class="right-box">
      <div class="top-box">
        <div class="environmental-quality-safety">
          <div class="environmental-quality">
            <EnvironmentalQuality />
          </div>
          <div class="safety-box">
            <div class="title">
              用能安全
            </div>
            <div class="place-list">
              <div class="data-title">
                <div style="width: 30px;">

                </div>
                <div>

                </div>
                <div>
                  当前负荷(kW)
                </div>
                <div>
                  额定负荷(kW)
                </div>
                <div>
                  负荷率
                </div>
              </div>
              <div class="data-box">
                <div
                  class="data-item"
                  v-for="(item,index) in placeList"
                  :key="index"
                >
                  <div class="icon-box">

                  </div>
                  <div>
                    {{ item.name }}
                  </div>
                  <div>
                    {{item.ratedLoad}}
                  </div>
                  <div>
                    {{item.currentLoad}}
                  </div>
                  <div>
                    {{item.loadRate}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="device-status">
          <EquipmentOperatingStatus />
        </div>
      </div>
      <div class="bottom-box">
        <EnergyAndCoal />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EnergySafety from './components/EnergySafety.vue';
import EnvironmentalQuality from './components/EnvironmentalQuality.vue';
import EquipmentOperatingStatus from './components/EquipmentOperatingStatus.vue';
import EnergyAndCoal from './components/EnergyAndCoal.vue';

import { getEnergyUseSafetyApi } from './Standardized.api';

const placeList = ref([
  {
    name: '测试数据1',
    ratedLoad: '123',
    currentLoad: '68',
    loadRate: '50%',
  },
]);

onMounted(async () => {
  let res = await getEnergyUseSafetyApi();
  placeList.value = [...res];
});
</script>



<style lang="less" scoped>
.home-page-main-box {
  width: 100%;
  height: 88vh;
  padding: 0 14px;
  display: flex;
  justify-content: space-between;

  .left-box {
    height: 100%;
    width: 32%;
    background-color: #fff;
    border-radius: 10px;
  }

  .right-box {
    height: 100%;
    width: 66%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: space-between;
    border-radius: 10px;

    .top-box {
      height: 66%;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .environmental-quality-safety,
      .device-status {
        height: 100%;
        width: 48.5%;
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
        border-radius: 10px;

        .environmental-quality {
          height: 48.5%;
          width: 100%;
          background-color: #fff;
          border-radius: 10px;
        }

        .safety-box {
          border-radius: 10px;
          height: 48.5%;
          width: 100%;
          background-color: #fff;
          border-radius: 10px;
          padding: 6px;
          .title {
            height: 40px;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 12px;
            background-color: #eaf0fc;
          }

          .place-list {
            padding: 0 12px;
            height: calc(100% - 40px);
            width: 100%;

            .data-title {
              height: 40px;
              width: 100%;
              display: flex;
              align-items: center;

              div {
                display: flex;
                height: 100%;
                width: 24%;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              }
            }
            .data-box {
              height: calc(100% - 40px);
              overflow: auto;
              .data-item {
                height: 40px;
                width: 100%;
                display: flex;
                align-items: center;

                div {
                  display: flex;
                  height: 100%;
                  width: 24%;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                }

                .icon-box {
                  width: 30px;
                  height: 30px;
                  background-image: url('@/assets/images/flish.png');
                  background-size: 100% 100%;
                }
              }
            }
          }
        }
      }
    }

    .bottom-box {
      height: 32%;
      width: 100%;
    }
  }

  // .top-box {
  //   height: 68.5%;
  //   width: 100%;
  //   display: flex;
  //   justify-content: space-between;

  //   .left-box,
  //   .middle-box,
  //   .right-box {
  //     height: 100%;
  //     width: 32%;
  //   }

  //   .middle-box {
  //     .energy-consumption-statistics,
  //     .environmental-quality {
  //       height: 48.5%;
  //       width: 100%;
  //       background-color: #fff;
  //       border-radius: 10px;
  //     }

  //     .environmental-quality {
  //       margin-top: 3%;
  //     }
  //   }

  //   .right-box {
  //     border-radius: 10px;
  //   }
  // }
  // .bottom-box {
  //   height: 30%;
  //   width: 100%;
  //   margin-top: 1%;
  // }
}
</style>