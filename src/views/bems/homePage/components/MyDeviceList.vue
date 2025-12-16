<template>
  <div class="device-list-main-box">
    <div class="list-box">
      <div
        class="device-item"
        :id="(isActive === index) ? 'isActive' : ''"
        v-for="(item,index) in deviceList"
        :key="index"
        @click="handleSwitch(index)"
      >
        <div class="device-icon">
          <HomeOutlined v-if="index === 0" />
          <BarsOutlined v-else-if="index === 1" />
          <WalletOutlined v-else-if="index === 2" />
          <UserOutlined v-else-if="index === 3" />
        </div>
        <div class="device-name">
          {{ item.deviceName }}
        </div>
      </div>
    </div>
    <div class="sub-machine-box">
      <div
        class="machine-item"
        v-for="(machineItem,index) in deviceList[isActive].list"
        :key="index"
      >
        <div class="machine-name">
          {{ machineItem.categoryName }}
        </div>
        <div class="machine-number">
          <div
            class="actual-number"
            :style="{width: (machineItem.onLineNum / machineItem.totalNum * 100) + '%',backgroundColor: (index % 3 === 1) ? '#f0b922' : ''}"
          >
            <div style="position: absolute; right: 6px;">
              {{ machineItem.onLineNum }}
            </div>
          </div>
          <div style="position: absolute; right: 6px;">
            {{ machineItem.totalNum }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { HomeOutlined, BarsOutlined, WalletOutlined, UserOutlined } from '@ant-design/icons-vue';
import { getDeviceRunStateStatisticApi, getRunStatusStatisticApi, } from '../Standardized.api';

// 高亮显示index
const isActive = ref(0);

// 设备列表
const deviceList = ref([
  // {
  //   deviceName: '暖通设备',
  //   list: [
  //     {
  //       name: '多连机',
  //       value1: 12,
  //       value2: 10,
  //     },
  //     {
  //       name: '风机盘管',
  //       value1: 11,
  //       value2: 5,
  //     },
  //     {
  //       name: '新风机',
  //       value1: 18,
  //       value2: 10,
  //     },
  //     {
  //       name: '红外空调',
  //       value1: 25,
  //       value2: 20,
  //     },
  //     {
  //       name: '屋顶机',
  //       value1: 30,
  //       value2: 19,
  //     },
  //   ],
  // },
  {
    deviceName: '照明设备',
    list: [
      {
        categoryName: '多连机',
        totalNum: 12,
        onLineNum: 8,
      },
      {
        name: '红外空调',
        value1: 25,
        value2: 20,
      },
      {
        name: '屋顶机',
        value1: 30,
        value2: 19,
      },
    ],
  },
  {
    deviceName: '计量设备',
    list: [
      {
        name: '风机盘管',
        value1: 11,
        value2: 5,
      },
      {
        name: '新风机',
        value1: 18,
        value2: 10,
      },
      {
        name: '红外空调',
        value1: 25,
        value2: 20,
      },
      {
        name: '屋顶机',
        value1: 30,
        value2: 19,
      },
    ],
  },
  {
    deviceName: '动力设备',
    list: [
      {
        name: '多连机',
        value1: 12,
        value2: 8,
      },
      {
        name: '风机盘管',
        value1: 11,
        value2: 5,
      },
      {
        name: '新风机',
        value1: 18,
        value2: 10,
      },
      {
        name: '红外空调',
        value1: 25,
        value2: 20,
      },
      {
        name: '屋顶机',
        value1: 30,
        value2: 19,
      },
      {
        name: '新风机2',
        value1: 8,
        value2: 5,
      },
      {
        name: '多连机2',
        value1: 29,
        value2: 24,
      },
      {
        name: '红外空调2',
        value1: 18,
        value2: 14,
      },
    ],
  },
]);

// 点击切换设备
const handleSwitch = (index) => {
  isActive.value = index;
};

// 获取在线状态数据
const getDeviceOnlineData = async () => {
  let res1 = await getDeviceRunStateStatisticApi({ configPath: 'jinanqiao:device_status:measurement'})
  let res2 = await getDeviceRunStateStatisticApi({ configPath: 'jinanqiao:device_status:power'})
  let res3 = await getRunStatusStatisticApi()
  deviceList.value[0].list = res3
  deviceList.value[1].list = res1
  deviceList.value[2].list = res2
}

onMounted(async () => {
  await getDeviceOnlineData()
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
    height: calc(100% - 60px);
    width: 100%;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

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
        height: 100%;
      }
      .machine-number {
        position: relative;
        width: 75%;
        height: 70%;
        background-color: #e4e4e4;
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