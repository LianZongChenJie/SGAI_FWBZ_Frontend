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
            {{ item.categoryName }}
          </div>
          <div class="progress-box">
            <a-progress
              class="custom-progress"
              :percent="(item.onLineNum / item.totalNum * 100)"
              size="small"
              trailColor="#fff"
              :strokeColor="item.strokeColor"
              :format="percent => `${item.onLineNum}`"
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
          <template #index="{ text, record, index }">
            {{ index + 1 }}
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'code'">
              <div class="content-box">{{ record.code }}</div>
            </template>
            <template v-if="column.dataIndex === 'deviceCategoryId'">
              <a-tooltip
                :title="findTreeNodeTitle(treeData, record.deviceCategoryId)"
                placement="topLeft"
              >
                <div class="content-box">{{ findTreeNodeTitle(treeData, record.deviceCategoryId) }}</div>
              </a-tooltip>
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
import {
  getAlarmRecordListForMonthApi,
  getDeviceRunStateStatisticApi,
  getRunStatusStatisticApi,
  eventDistributionApi,
  categoryTree,
} from '../Standardized.api';

const colorList = ['#003b90', '#f7ab00', '#5eac62', '#009dff'];

const deviceList = ref([
  {
    categoryName: '消防报警点位',
    onLineNum: '2691',
    totalNum: '3000',
    strokeColor: '#003b90',
  },
]);

const eventWorkOrderRef = ref();

let eventWorkOrderInstance: any = null;

const columns = [
  {
    title: '序号',
    dataIndex: 'idex',
    key: 'idex',
    slots: { customRender: 'index' },
    width: '60px',
    align: 'center'
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
    align: 'center'
  },
  {
    title: '设备分类',
    dataIndex: 'deviceCategoryId',
    key: 'deviceCategoryId',
    align: 'center'
  },
  {
    title: '报警信息',
    dataIndex: 'alarmCategoryName',
    key: 'alarmCategoryName',
    align: 'center'
  },
  {
    title: '报警时间',
    dataIndex: 'alarmTime',
    key: 'alarmTime',
    align: 'center'
  },
];

const treeData = ref([]);

// 获取设备类别树数据
const getCategoryTree = async () => {
  try {
    const res = await categoryTree({});
    treeData.value = res;
  } catch (error) {
    console.error('获取设备类别失败:', error);
  }
};

// 查找树节点的标题
const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
  if (!treeData || !Array.isArray(treeData)) {
    return '';
  }

  const find = (nodes: any[]): string => {
    for (const node of nodes) {
      if (String(node.key) === String(key)) {
        return node.value;
      }
      if (node.children && Array.isArray(node.children)) {
        const title = find(node.children);
        if (title) return title;
      }
    }
    return '';
  };
  return find(treeData);
};

const data = ref([]);

const echartData = ref<any>([]);

const customRow = (conlumn) => {
  conlumn.forEach((e, index) => {
    conlumn[index].color = '#000';
  });
};

// 获取事件分布数据
const eventDistribution = async () => {
  let res = await eventDistributionApi();
  echartData.value = [...res];
};

// 获取报警列表数据
const getAlarmRecordListForMonth = async () => {
  let res = await getAlarmRecordListForMonthApi({
    pageNo: 1,
    pageSize: 50,
  });
  data.value = res.records;
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
        data: echartData.value,
      },
    ],
  };

  // 应用配置项
  eventWorkOrderInstance.setOption(option);
  window.addEventListener('resize', handleResize);
};

// 响应窗口大小变化
const handleResize = () => {
  if (eventWorkOrderInstance) {
    eventWorkOrderInstance.resize();
  }
};

// 获取在线状态数据
const getDeviceOnlineData = async () => {
  const res1 = await getDeviceRunStateStatisticApi({ configPath: 'jinanqiao:device_status:measurement' });
  const res3 = await getRunStatusStatisticApi();
  const res3Map = res3.map((item) => {
    return {
      categoryName: item.categoryName,
      onLineNum: item.onlineNum,
      totalNum: item.totalNum,
    };
  });
  const resList = [...res1, ...res3Map];
  deviceList.value = resList.map((item, index) => {
    return {
      categoryName: item.categoryName,
      onLineNum: item.onLineNum,
      totalNum: item.totalNum,
      strokeColor: colorList[index % 5],
    };
  });
  deviceList.value.push();
};

onMounted(async () => {
  await getCategoryTree();
  await eventDistribution();
  await getDeviceOnlineData();
  await getAlarmRecordListForMonth();
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
      justify-content: flex-start;
      align-content: space-around;
      height: 82%;
      width: 100%;
      overflow: auto;
      padding-left: 5%;

      .device-item {
        margin-right: 5%;
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
          width: 100%;
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