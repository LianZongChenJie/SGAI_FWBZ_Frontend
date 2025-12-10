<template>
  <div class="equipment-operating-status-main-box">
    <div class="device-box">
      <div class="title">
        设备运行状态（在线/离线）
      </div>
      <div class="device-list-box">
        <MyDeviceList />
      </div>
    </div>
    <div class="alarm-info-box">
      <div class="alarm-title">
        报警信息
      </div>
      <div class="alarm-statistics">
        <div class="statistics-item">
          <div class="statistics-title">
            本月报警次数
          </div>
          <div class="statistics-data">
            {{ alarmBaseData.value }}
          </div>
        </div>

        <div class="statistics-item">
          <div class="statistics-title">
            同比
          </div>
          <div class="statistics-data">
            {{ alarmBaseData.yoy }}
          </div>
        </div>
        <div class="statistics-item">
          <div class="statistics-title">
            环比
          </div>
          <div class="statistics-data">
            {{ alarmBaseData.mom }}
          </div>
        </div>
      </div>
      <div class="alarm-item-box">
        <div
          class="alarm-item"
          v-for="(item,index) in alarmList"
          :key="index"
        >
          <div class="icon-box"></div>
          <div class="base-info">
            <div class="position-and-time">
              <div class="position-box">
                {{ item.deviceName }}
              </div>
              <div class="time-box">
                {{ item.alarmTime }}
              </div>
            </div>
            <div class="alarm-type">
              {{ item.alarmCategoryName }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import MyDeviceList from './MyDeviceList.vue';
import { getAlarmStatisticsApi, getAlarmRecordListForMonthApi } from '../Standardized.api';

const alarmBaseData = ref({
  mom: '',
  value: '',
  yoy: '',
});

// 设备状态数据
const deviceStatusData = ref({
  alreadyResponded: [
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
  ],
  notResponding: [
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
  ],
  selfRecovery: [
    {
      code: '1',
      name: '空调机组',
      position: '过滤网堵塞报警',
      status: 1,
    },
    {
      code: '2',
      name: '水泵',
      position: '故障报警',
      status: 0,
    },
    {
      code: '3',
      name: '水箱',
      position: '低液位报警',
      status: 1,
    },
  ],
});

const tableDataSourse: any = ref([]);

const alarmList = ref([
  {
    deviceName: '1#馆用水',
    alarmTime: '2025-03-28 10:35:28',
    alarmCategoryName: '能耗超值报警',
  },
  {
    deviceName: '信息机房',
    alarmTime: '2025-3-28 10:30:28',
    alarmCategoryName: '环境温度36°C过高报器',
  },
  {
    deviceName: '2号楼一层会议室',
    alarmTime: '2025-3-28 09:10:15',
    alarmCategoryName: '故障报警',
  },
  {
    deviceName: '1#馆用水',
    alarmTime: '2025-03-28 10:35:28',
    alarmCategoryName: '能耗超值报警',
  },
  {
    deviceName: '信息机房',
    alarmTime: '2025-3-28 10:30:28',
    alarmCategoryName: '环境温度36°C过高报器',
  },
  {
    deviceName: '2号楼一层会议室',
    alarmTime: '2025-3-28 09:10:15',
    alarmCategoryName: '故障报警',
  },
]);

// 获取告警信息
const getAlarmStatistics = async () => {
  let res = await getAlarmStatisticsApi();
  alarmBaseData.value.value = res.value ? res.value : '0';
  alarmBaseData.value.yoy = res.yoy ? res.yoy : '0';
  alarmBaseData.value.mom = res.mom ? res.mom : '0';
};

// 获取报警列表数据
const getAlarmRecordListForMonth = async () => {
  let res = await getAlarmRecordListForMonthApi({
    pageNo: 1,
    pageSize: 50,
  });
  alarmList.value = res.records;
};



onMounted(async () => {
  tableDataSourse.value = [...deviceStatusData.value.alreadyResponded];
  await getAlarmStatistics();
  await getAlarmRecordListForMonth();
});
</script>

<style lang="less" scoped>
.equipment-operating-status-main-box {
  height: 100%;
  width: 100%;
  padding: 6px 6px;
  background-color: #fff;
  border-radius: 10px;

  .device-box {
    height: 48.5%;
    border-radius: 10px;

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
      }
    }

    .device-list-box {
      margin-top: 10px;
      height: calc(100% - 40px);
      width: 100%;
    }
  }

  .alarm-info-box {
    margin-top: 3%;
    height: calc(48.5 - 30px);
    width: 100%;
  }

  .alarm-info-box {
    border-radius: 10px;
    height: 49%;

    .alarm-title {
      height: 40px;
      width: 100%;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 0 12px;
      background-color: #eaf0fc;
    }

    .alarm-statistics {
      height: 60px;
      width: 100%;
      display: flex;

      .statistics-item {
        height: 100%;
        width: 33%;

        .statistics-title,
        .statistics-data {
          height: 25px;
          width: 100%;
          font-size: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .statistics-data {
          height: 35px;
          align-content: flex-start;
          font-size: 22px;
          font-weight: 600;
          color: #f7c830;
        }
      }
    }
    .alarm-item-box {
      height: calc(100% - 100px);
      width: 100%;
      overflow: auto;

      .alarm-item {
        padding: 0 20px 0 12px;
        height: 50px;
        margin-top: 8px;
        width: 100%;
        display: flex;
        justify-content: space-between;

        .icon-box {
          height: 50px;
          width: 50px;
          background-image: url('@/assets/images/alarmIcon.png');
          background-size: 100% 100%;
        }

        .base-info {
          height: 50px;
          width: calc(100% - 70px);

          .position-and-time {
            height: 25px;
            width: 100%;
            display: flex;
            align-items: center;

            .position-box,
            .time-box {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: flex-start;
              font-size: 16px;
            }
            .position-box {
              flex: 1;
              overflow: hidden; /* 隐藏溢出内容 */
              white-space: nowrap; /* 防止文本换行 */
              text-overflow: ellipsis; /* 显示省略号 */
            }
            .time-box {
              margin-left: 12px;
              justify-content: flex-end;
            }
          }

          .alarm-type {
            height: 25px;
            width: 100%;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
        }
      }
    }
  }
}
</style>