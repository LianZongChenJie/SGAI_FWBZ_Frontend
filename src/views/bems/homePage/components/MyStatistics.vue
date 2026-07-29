<template>
  <div class="device-list-main-box">
    <div class="sub-machine-box">
      <div
        class="machine-item"
      >
        <div class="machine-name">
          节能总量
        </div>
        <div class="machine-number">
          <div
            class="actual-number"
            :style="{width: '100%'}"
          >
            <div style="position: absolute; right: 6px;">
              {{ total }}
            </div>
          </div>
        </div>
      </div>
      <div style="width: 25%; text-align: start;font-size: 16px;padding-left: 16px;">
        其中：
      </div>
      <div
        class="machine-item"
        v-for="(machineItem,index) in deviceList[isActive].list"
        :key="index"
      >
        <div class="machine-name">
          {{ machineItem.projectType }}
        </div>
        <div class="machine-number">
          <div
            class="actual-number"
            :style="{width: (machineItem.value / total * 100) + '%'}"
          >
          </div>
          <div style="position: absolute; right: 6px;">
            {{ machineItem.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted } from 'vue';
import { HomeOutlined, BarsOutlined, WalletOutlined, UserOutlined } from '@ant-design/icons-vue';
import { getEnergyConservationStatisticsApi } from '../Standardized.api'

// 高亮显示index
const isActive = ref(0);

// 设备列表
const deviceList = ref([
  {
    deviceName: '暖通设备',
    list: [
      {
        projectType: '管理节能',
        value: 12,
        value2: 8,
      },
      {
        projectType: '工艺改造',
        value: 11,
        value2: 5,
      },
      {
        projectType: '算法控制',
        value: 18,
        value2: 10,
      },
      {
        projectType: '综合节能',
        value: 25,
        value2: 20,
      },
    ],
  }
]);

const total = ref(0)

// 点击切换设备
const handleSwitch = (index) => {
  isActive.value = index;
};

onMounted(async() => { 
  let res = await getEnergyConservationStatisticsApi()
  total.value = res.total
  res.list.forEach((item,index) => {
    res.list[index].value = Number.parseFloat(item.value).toFixed(2)
  })
  
  deviceList.value[0].list = res.list
  
})
</script>

<style lang="less" scoped>
.device-list-main-box {
  height: 100%;
  width: 100%;

  .list-box {
    height: 60px;
    display: flex;
    justify-content: center;

    .device-item {
      height: 100%;
      width: 20%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      font-size: 16px;

      > div {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .device-icon {
        align-items: flex-end;
      }

      &:hover {
        cursor: pointer;
      }
    }
    #isActive {
      color: #15adf3;
    }
  }

  .sub-machine-box {
    height: calc(100%);
    width: 100%;
    overflow: auto;

    .machine-item {
      width: 100%;
      height: 30px;
      display: flex;
      align-items: center;
      padding-right: 16px;
      margin-bottom: 10px;

      .machine-name {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 25%;
        font-size: 16px;
        height: 100%;
      }
      .machine-number {
        position: relative;
        width: 75%;
        height: 70%;
        border-radius: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .actual-number {
          position: relative;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          background-color: #6abcff;
          height: 100%;
          border-radius: 30px;
        }
      }
    }
  }

  .sub-machine-box {
    overflow: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */
  }

  .sub-machine-box::-webkit-scrollbar {
    display: none; /* Chrome, Safari 和 Opera */
  }
}
</style>