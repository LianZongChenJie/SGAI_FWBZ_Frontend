<template>
  <div class="operation-monitoring-table-main-box">
    <div class="load-operation-status">
      <div class="table-title">
        <div class="icon-box"></div>
        <span>总配电实时负荷运行情况</span>
      </div>
      <div class="place-list">
        <div class="data-title">
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
        <div class="data-box small-magrin">
          <div
            class="data-item"
            v-for="(item,index) in placeList"
            :key="index"
          >
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
    <div class="load-operation-status">
      <div class="table-title">
        <div class="icon-box"></div>
        <span>4号楼实时负荷运行情况</span>
      </div>
      <div class="place-list">
        <div class="data-title">
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
          <div class="data-item" v-for="(item, index) in placeList4" :key="index">
            <div>
              {{ item.name }}
            </div>
            <div>
              {{ item.ratedLoad }}
            </div>
            <div>
              {{ item.currentLoad }}
            </div>
            <div>
              {{ item.loadRate }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="load-operation-status">
      <div class="table-title">
        <div class="icon-box"></div>
        <span>9号楼实时负荷运行情况</span>
      </div>
      <div class="place-list">
        <div class="data-title">
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
          <div class="data-item" v-for="(item, index) in placeList9" :key="index">
            <div>
              {{ item.name }}
            </div>
            <div>
              {{ item.ratedLoad }}
            </div>
            <div>
              {{ item.currentLoad }}
            </div>
            <div>
              {{ item.loadRate }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="alarm-handling-status">
      <div class="table-title">
        <div class="icon-box"></div>
        <span>今日报警处理情况</span>
      </div>
      <div
        class="alarm-chart"
        ref="chartContainer"
      >

      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { getEnergyUseSafetyApi } from '../Standardized.api';

const placeList = ref([
  {
    name: '测试数据1',
    ratedLoad: '123',
    currentLoad: '68',
    loadRate: '50%',
  },
]);

const placeList4 = ref([
  {
    name: '测试数据1',
    ratedLoad: '123',
    currentLoad: '68',
    loadRate: '50%',
  },
]);

const placeList9 = ref([
  {
    name: '测试数据1',
    ratedLoad: '123',
    currentLoad: '68',
    loadRate: '50%',
  },
]);

const chartContainer = ref(null); // 引用图表容器

onMounted(async () => {
  let res1 = await getEnergyUseSafetyApi({});
  let res2 = await getEnergyUseSafetyApi({ configKey: 'by:energyUseSafety:4'});
  let res3 = await getEnergyUseSafetyApi({ configKey: 'by:energyUseSafety:9' });
  placeList.value = [...res1];
  placeList4.value = [...res2];
  placeList9.value = [...res3];

  // initChart();
});

const initChart = () => {
  // 初始化 ECharts 实例
  const myChart = echarts.init(chartContainer.value);

  // 模拟数据
  const data = [
    { value: 85, total: 120 },
    { value: 70, total: 100 },
    { value: 90, total: 150 },
    { value: 60, total: 80 },
    { value: 95, total: 130 },
  ];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        const data = params[0].data;
        return `
              ${params[0].name}<br/>
              完成度: ${data.value}%<br/>
              总数量: ${data.total}条
            `;
      },
    },
    grid: {
      top: '15%',
      right: '5%',
      bottom: '5%',
      left: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['1#', '2#', '3#', '4#', '5#'],
      axisLabel: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '完成度 (%)',
      nameTextStyle: {
        fontSize: 12,
        padding: [0, 0, 0, -30],
      },
      axisLabel: {
        formatter: '{value}%',
        fontSize: 12,
      },
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee',
        },
      },
    },
    series: [
      {
        name: '报警处理',
        type: 'bar',
        data: data,
        // 显示背景色
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)',
          borderColor: 'rgba(180, 180, 180, 0.3)',
          borderWidth: 1,
          borderType: 'solid',
        },
        // 柱子样式
        itemStyle: {
          color: function (params) {
            // 根据完成度设置不同颜色
            const value = params.data.value;
            if (value >= 90) return '#52c41a'; // 优秀 - 绿色
            if (value >= 80) return '#1890ff'; // 良好 - 蓝色
            if (value >= 60) return '#faad14'; // 一般 - 黄色
            return '#f5222d'; // 较差 - 红色
          },
          borderRadius: [4, 4, 0, 0],
          borderWidth: 1,
          borderColor: '#fff',
        },
        // 柱子标签配置 - 在柱子内部显示完成度
        label: {
          show: true,
          position: 'insideBottom',
          distance: 10,
          formatter: '{c}%',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
        },
        barWidth: '40%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
      {
        name: '总数量',
        type: 'bar',
        // 隐藏的实际柱子，只用于显示顶部的总数量标签
        data: data.map((item) => 100), // 设置高度为100%，确保标签在顶部
        barWidth: '40%',
        itemStyle: {
          color: 'transparent', // 透明柱子
        },
        // 在背景色顶端显示总数量
        label: {
          show: true,
          position: 'top',
          formatter: function (params) {
            // 获取对应索引的数据
            const index = params.dataIndex;
            return `${data[index].total}个`;
          },
          color: '#333',
          fontSize: 13,
          fontWeight: 'bold',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: '#d9d9d9',
          borderWidth: 1,
          borderRadius: 4,
          padding: [4, 8],
          shadowBlur: 2,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
        },
        z: 2, // 确保这个系列在上面
      },
    ],
  };

  // 渲染图表
  myChart.setOption(option);

  // 可选：响应式调整图表大小
  window.addEventListener('resize', () => {
    myChart.resize();
  });
};
</script>

<style scoped lang="less">
.operation-monitoring-table-main-box {
  height: 100%;
  width: 100%;

  border-radius: 10px;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  .load-operation-status,
  .alarm-handling-status {
    height: 100%;
    width: 32%;
    background-color: #fff;
    border-radius: 10px;

    .table-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 40px;
      padding-left: 12px;
      .icon-box {
        height: 20px;
        border-left: 5px solid #8080ff;
        margin-right: 10px;
      }
      > span {
        font-size: 18px;
        color: #506f8e;
        font-weight: 600;
      }
    }

    .place-list {
      padding: 0 24px;
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
          width: 25%;
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
            width: 25%;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          }
        }
      }

      .small-magrin {
        
        .data-item {
          height: 37px;
        }
      }
    }
  }
  .alarm-handling-status {
    .alarm-chart {
      height: calc(100% - 50px);
      width: 100%;
    }
  }

  .table-box {
    height: calc(100% - 40px);
    margin-top: 10px;
  }
}
</style>