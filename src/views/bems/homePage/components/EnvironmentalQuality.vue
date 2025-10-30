<template>
  <div class="environmental-quality-main-box">
    <div class="title">
      环境品质
      <div class="my-tabs-box">
        <MyTabs
          :handleSwitchDate="handleSwitchDate"
          :tabsTitle="tabsTitle"
        />
      </div>
    </div>
    <div class="charts-box">
      <div
        class="dashboard-chart"
        ref="dashboardChartRef"
      >

      </div>
      <div
        class="boxplot-chart"
        ref="boxplotChart"
        id="boxplotChart"
      >

      </div>
      <div class="other-info">
        <div class="info-item">
          <div class="icon-box" id="rhIcon">

          </div>
          <div class="data-box">
            55%RH
          </div>
        </div>
        <div class="info-item">
          <div class="icon-box" id="wenduIcon">

          </div>
          <div class="data-box">
            26℃
          </div>
        </div>
        <div class="info-item">
          <div class="icon-box" id="fenbeiIcon">

          </div>
          <div class="data-box">
            35分贝
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import MyTabs from './MyTabs.vue';

const tabsTitle = {
  left: '歌剧院',
  middle: '音乐厅',
  right: '戏剧院',
};

const dashboardChartRef = ref(null);
let dashboardChartInstance: any = null;

// 盒须图数据
const boxplotData = ref({
  min: 10,
  q1: 15,
  median: 20,
  q3: 25,
  max: 30,
  mean: 21,
});

const unit = ref('℃');

watch(
  () => boxplotData,
  () => {
    updateBoxplotChart();
  },
  { deep: true }
);

const boxplotChart = ref(null);
let boxplotChartInstance: any = null;

// 切换时间
const handleSwitchDate = (type) => {
  console.log('handleSwitchDate----------------->', type);
};

onMounted(() => {
  initChart();
  initBoxplotChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (dashboardChartInstance) {
    dashboardChartInstance.dispose();
    dashboardChartInstance = null;
  }
  window.removeEventListener('resize', handleResize);

  if (boxplotChartInstance) {
    boxplotChartInstance.dispose();
    boxplotChartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  if (dashboardChartInstance) {
    dashboardChartInstance.resize();
  }
  if (boxplotChartInstance) {
    boxplotChartInstance.resize();
  }
};

const initChart = () => {
  if (!dashboardChartRef.value) return;

  dashboardChartInstance = echarts.init(dashboardChartRef.value);

  const option = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
    },
    series: [
      {
        name: 'Pressure',
        type: 'gauge',
        radius: '100%', // 调整仪表盘大小 (百分比或像素值)
        center: ['50%', '55%'],
        progress: {
          show: true,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          offsetCenter: [0, '50%'],
        },
        data: [
          {
            value: 19,
            name: 'CO2',
          },
        ],
      },
    ],
  };

  dashboardChartInstance.setOption(option);

  // // 更新数据时的动画效果
  // setInterval(() => {
  //   dashboardChartInstance.setOption({
  //     series: [
  //       {
  //         data: [
  //           {
  //             value: currentValue.value
  //           }
  //         ]
  //       }
  //     ]
  //   });
  // }, 2000);
};

const initBoxplotChart = () => {
  if (!boxplotChart.value) return;

  boxplotChartInstance = echarts.init(boxplotChart.value);
  updateBoxplotChart();
};

const updateBoxplotChart = () => {
  const option = {
    title: {
      text: '温场分布情况',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const data = boxplotData.value;
        return `
          <div style="text-align: left">
            <div>最大值: ${data.max}${unit.value}</div>
            <div>上四分位数(Q3): ${data.q3}${unit.value}</div>
            <div>中位数: ${data.median}${unit.value}</div>
            <div>平均值: ${data.mean}${unit.value}</div>
            <div>下四分位数(Q1): ${data.q1}${unit.value}</div>
            <div>最小值: ${data.min}${unit.value}</div>
          </div>
        `;
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '10%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['温场分布'],
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: `温度(${unit.value})`,
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#999',
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '温场分布',
        type: 'boxplot',
        data: [
          {
            value: [boxplotData.value.min, boxplotData.value.q1, boxplotData.value.median, boxplotData.value.q3, boxplotData.value.max],
            itemStyle: {
              color: '#5470C6',
              borderColor: '#334B80',
            },
          },
        ],
        itemStyle: {
          color: '#5470C6',
          borderColor: '#334B80',
        },
        emphasis: {
          itemStyle: {
            color: '#3A56B0',
            borderColor: '#1A2B60',
          },
        },
        // 显示平均值点
        markPoint: {
          data: [
            {
              name: '平均值',
              type: 'average',
              valueIndex: 2,
              symbol: 'circle',
              symbolSize: 10,
              itemStyle: {
                color: '#EE6666',
              },
              label: {
                formatter: '平均: {c}' + unit.value,
                position: 'top',
              },
            },
          ],
        },
      },
    ],
    // 添加标注线
    // graphic: createAnnotations(boxplotData.value, unit.value),
  };
  boxplotChartInstance.setOption(option);
};

// 创建标注图形
const createAnnotations = (data, unit) => {
  const annotations:any = [];
  const positions = [
    { value: data.min, name: '最小值', color: '#91CC75' },
    { value: data.q1, name: '下四分位数(Q1)', color: '#5470C6' },
    { value: data.median, name: '中位数', color: '#EE6666' },
    { value: data.q3, name: '上四分位数(Q3)', color: '#5470C6' },
    { value: data.max, name: '最大值', color: '#91CC75' },
    { value: data.mean, name: '平均值', color: '#EE6666' },
  ];

  positions.forEach((pos, index) => {
    annotations.push({
      type: 'group',
      left: index < 3 ? '25%' : '75%', // 左右分布标注
      top: 'center',
      children: [
        {
          type: 'line',
          shape: { x1: 0, y1: 0, x2: index < 3 ? 40 : -40, y2: 0 },
          style: {
            stroke: pos.color,
            lineWidth: 1,
            lineDash: [4, 4],
          },
        },
        {
          type: 'polygon',
          shape: {
            points:
              index < 3
                ? [
                    [40, 0],
                    [30, -5],
                    [30, 5],
                  ]
                : [
                    [-40, 0],
                    [-30, -5],
                    [-30, 5],
                  ],
          },
          style: { fill: pos.color },
        },
        {
          type: 'text',
          style: {
            text: `${pos.name}: ${pos.value}${unit}`,
            fill: pos.color,
            fontSize: 12,
          },
          position: index < 3 ? [50, -10] : [-50, -10],
        },
      ],
      bounding: 'raw',
      y: index,
    });
  });

  return annotations;
};

// 获取Y轴像素位置
const getPixelYPosition = (value) => {
  if (!boxplotChartInstance) return 0;
  return boxplotChartInstance.convertToPixel({ yAxisIndex: 0 }, value) - boxplotChartInstance.convertToPixel({ yAxisIndex: 0 }, 0);
};
</script>

<style lang="less" scoped>
.environmental-quality-main-box {
  height: 100%;
  width: 100%;
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
    .my-tabs-box {
      height: 90%;
      width: 30%;
      padding: 4px 0;
    }
  }

  .charts-box {
    height: calc(100% - 30px);
    width: 100%;
    padding: 12px 12px;
    display: flex;
    flex-wrap: wrap;
    .dashboard-chart {
      width: 45%;
      height: calc(100% - 30px);
    }
    .boxplot-chart {
      width: 55%;
      height: calc(100% - 30px);
    }
    .other-info {
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 30px;

      .info-item{
        display: flex;
        align-items: center;
        height: 100%;
        width: 30%;

        .icon-box{
          height: 80%;
          width: 20%;
          background-size: 100% 100%;
          margin-right: 10px;
        }
        #rhIcon{
          background-image: url('@/assets/images/RHIcon.png');
        }
        #wenduIcon{
          background-image: url('@/assets/images//wenduIcon.png')
        }
        #fenbeiIcon{
          background-image: url('@/assets/images/fenbeiIcon.png');
          height: 60%;
          width: 30%;
        }

        .data-box{
          font-size: 20px;
          color: #fab113;
          font-weight: 600;
        }
      }
    }
  }
}
</style>