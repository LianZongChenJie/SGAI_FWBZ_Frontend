<template>
  <div class="my-right-info">
    <div class="title-box">
      <MyTitle :title="'机电主题'" />
    </div>
    <div class="online-situation">
      <div class="online-situation-title">
        设备设施在线情况
      </div>
      <div class="device-list">
        <div
          class="device-item"
          v-for="(item,index) in deviceList"
          :key="index"
        >
          <div class="device-name">
            {{ item.name }}
          </div>
          <div class="progress-box">
            <a-progress
              class="custom-progress"
              :percent="(item.value / item.total * 100)"
              size="small"
              trailColor="#fff"
              :strokeColor="item.strokeColor"
              :format="percent => `${item.value}`"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="event-work-order">
      <div class="event-work-order-title">
        事件工单分析
      </div>
      <div
        id="eventWorkOrderChart"
        ref="eventWorkOrderRef"
      ></div>
    </div>
    <div class="fault-alarm-list">
      <div class="fault-alarm-list-title">
        故障告警列表
      </div>
      <div class="fault-alarm-table-box">
        <a-table
          class="fault-alarm-table"
          :columns="columns"
          :data-source="data"
          small="small"
          :pagination="false"
          :scroll="{ y: 220 }"
          :customHeaderRow="customRow"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'code'">
              <div class="content-box">{{ record.code }}</div>
            </template>
            <template v-if="column.dataIndex === 'content'">
              <div class="content-box">{{ record.content }}</div>
            </template>
            <template v-if="column.dataIndex === 'status'">
              <div class="content-box"><span :style="{color: record.status === '已完成' ? '#53985e' : '#fff'}">{{ record.status }}</span></div>
            </template>
            <template v-if="column.dataIndex === 'urgencyLevel'">
              <div class="content-box"><span :style="{color: record.urgencyLevel === '紧急' ? '#da0215' : '#fff'}">{{ record.urgencyLevel }}</span></div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyTitle from './MyTitle.vue';
import * as echarts from 'echarts';
import { ref, computed, onUnmounted, onMounted } from 'vue';

const deviceList = ref([
  {
    name: '消防报警点位',
    value: '2691',
    total: '3000',
    strokeColor: '#003b90',
  },
  {
    name: '消防末端数量',
    value: '109',
    total: '150',
    strokeColor: '#003b90',
  },
  {
    name: '燃气报警设备',
    value: '123',
    total: '123',
    strokeColor: '#f7ab00',
  },
  {
    name: '消防水泵数量',
    value: '23',
    total: '30',
    strokeColor: '#f7ab00',
  },
  {
    name: '动火离人设备',
    value: '85',
    total: '85',
    strokeColor: '#5eac62',
  },
  {
    name: '用电监测数量',
    value: '5',
    total: '5',
    strokeColor: '#5eac62',
  },
  {
    name: '厨房自动灭火设备',
    value: '60',
    total: '60',
    strokeColor: '#009dff',
  },
  {
    name: '视频监控',
    value: '21',
    total: '21',
    strokeColor: '#009dff',
  },
]);

const eventWorkOrderRef = ref();

let eventWorkOrderInstance: any = null;

const columns = [
  {
    title: '故障编号',
    dataIndex: 'code',
    key: 'code',
    width: 120,
  },
  {
    title: '告警内容',
    dataIndex: 'content',
    key: 'content',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
  },
  {
    title: '紧急程度',
    dataIndex: 'urgencyLevel',
    key: 'urgencyLevel',
    width: 90,
  },
];

const data = [
  {
    code: '20250730125638680',
    content: '9#楼咪咕咖啡，一层女卫隔断门.',
    status: '处理中',
    urgencyLevel: '紧急',
  },
  {
    code: '20250730125638681',
    content: '2#楼电梯厅太热',
    status: '已完成',
    urgencyLevel: '一般',
  },
  {
    code: '20250730125638681',
    content: '楼电梯厅太热',
    status: '处理中',
    urgencyLevel: '一般',
  },
  {
    code: '20250730125638681',
    content: '楼电梯厅太热',
    status: '处理中',
    urgencyLevel: '一般',
  },
  {
    code: '20250730125638680',
    content: '9#楼咪咕咖啡，一层女卫隔断门.',
    status: '处理中',
    urgencyLevel: '紧急',
  },
];

const customRow = (conlumn) => {
  conlumn.forEach((e, index) => {
    conlumn[index].color = '#000';
  });
};

// 初始化事件工单图表
const initEventWorkOrderChart = () => {
  if (!eventWorkOrderRef.value) return;

  // 初始化ECharts实例
  eventWorkOrderInstance = echarts.init(eventWorkOrderRef.value);

  const option = {
    legend: {
      top: 'top',
      textStyle: {
        color: '#fff', // 设置图例文字颜色为白色
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      textStyle: {
        color: '#fff',
      },
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        // dataView: { show: true, readOnly: false },
        // restore: { show: true },
        // saveAsImage: { show: true },
      },
    },
    series: [
      {
        type: 'pie',
        startAngle: 360,
        endAngle: 180,
        radius: [30, 150],
        center: ['50%', '25%'],
        roseType: 'area',
        label: {
          show: true,
          formatter: '{b}: {c}',
          color: 'rgba(255, 255, 255, 0.8)',
        },
        labelLine: {
          length: 15,
          length2: 5,
          smooth: true,
        },
        // itemStyle: {
        //   borderRadius: 8,
        // },
        data: [
          { value: 40, name: '保洁类' },
          { value: 70, name: '照明类' },
          { value: 100, name: '安防类' },
          { value: 140, name: '消费类' },
          { value: 170, name: '环境类' },
          { value: 160, name: '制冷站' },
          { value: 180, name: '能源类' },
        ],
      },
    ],
  };

  // 应用配置项
  eventWorkOrderInstance.setOption(option);
  window.addEventListener('resize', eventWorkOrderInstance.resize);
};

// 响应窗口大小变化
const handleResize = () => {
  if (eventWorkOrderInstance) {
    eventWorkOrderInstance.resize();
  }
};

onMounted(() => {
  initEventWorkOrderChart();
});

// 清理
onUnmounted(() => {
  if (eventWorkOrderInstance) {
    eventWorkOrderInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="less" scoped>
.my-right-info {
  height: 100%;
  width: 100%;
  padding-right: 5%;

  .title-box {
    height: 40px;
    padding: 0 2%;
  }

  .online-situation {
    height: calc(30% - 50px);
    width: 100%;
    background-image: url('@/assets/images/onlineSituation.png');
    background-size: 100% 100%;

    .online-situation-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-left: 8%;
      font-size: 16px;
      height: 18%;
      width: 100%;
      color: #fff;
    }

    .device-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-content: space-around;
      height: 82%;
      width: 100%;

      .device-item {
        width: 45%;
        height: 20%;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;

        .device-name {
          color: #fff;
          height: 50%;
          width: 100%;
        }

        .progress-box {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 50%;
          width: 75%;
        }
      }
    }
  }
  .event-work-order {
    margin-top: 7px;
    height: 33%;
    width: 100%;
    background-image: url('@/assets/images/eventWorkOrder.png');
    background-size: 100% 100%;

    .event-work-order-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-left: 8%;
      font-size: 16px;
      height: 14%;
      width: 100%;
      color: #fff;
    }

    #eventWorkOrderChart {
      height: 86%;
      width: 100%;
    }
  }
  .fault-alarm-list {
    margin-top: 7px;
    height: 36%;
    width: 100%;
    background-image: url('@/assets/images/faultAlarmList.png');
    background-size: 100% 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .fault-alarm-list-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-left: 8%;
      font-size: 16px;
      height: 13%;
      width: 100%;
      color: #fff;
    }

    .fault-alarm-table-box {
      height: 87%;
      width: 98%;
    }
  }
}
</style>

<style lang="less">
.my-right-info {
  .online-situation {
    .device-list {
      .device-item {
        .progress-box {
          .custom-progress .ant-progress-text {
            color: white !important;
            font-weight: bold;
          }
        }
      }
    }
  }

  .fault-alarm-list {
    .fault-alarm-table-box {
      .ant-table {
        background: none;

        .content-box {
          overflow: hidden !important;
          white-space: nowrap !important; /* 禁止文本换行 */
          text-overflow: ellipsis !important; /* 使用省略号表示文本省略 */
        }

        .ant-table-cell {
          color: #fff !important;
          background: none !important;
        }
      }

      /* 自定义表格表头样式 */
      .fault-alarm-table .ant-table-thead > tr > th {
        border-top: 1px solid #275d76 !important; /* 实线边框 */
        border-bottom: 1px solid #275d76 !important; /* 实线边框 */
        color: #3dcea1 !important; /* 绿色文字 */
        font-weight: 600;
        text-align: center;
        padding: 12px 8px;
        font-size: 16px;
      }
      /* 第一个表头单元格 */
      .custom-table .ant-table-thead > tr > th:first-child {
        border-left: 1px solid #275d76 !important; /* 实线边框 */
      }
      /* 最后一个表头单元格 */
      .custom-table .ant-table-thead > tr > th:last-child {
        border-right: 1px solid #275d76 !important; /* 实线边框 */
      }
    }
  }
}
</style>