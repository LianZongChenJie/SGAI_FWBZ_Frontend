<template>
  <div class="environmental-quality-main-box">
    <div class="title">
      环境品质
      <div class="my-tabs-box">
        <!-- <MyTabs
          :handleSwitchDate="handleSwitchDate"
          :tabsTitle="tabsTitle"
        /> -->
      </div>
    </div>
    <div class="weather-box">
      <div class="temperature-and-weather">
        <div class="temperature-box">
          {{ wendu }}°
        </div>
        <div class="weather-name-box">
          <div class="weather-icon" :id="weatherId">

          </div>
          <div>
            {{ weaterData.type }}
          </div>
        </div>
        <div class="air-quality">
          质量：{{ quality }}
        </div>
      </div>
      <div
        class="brief-data"
        v-if="weaterData.low"
      >
        今天：{{ weaterData.low.split(' ')[1] }} ~ {{ weaterData.high.split(' ')[1] }}&emsp;<img
          src="@/assets/images/wind.png"
          alt=""
        >&nbsp;{{ weaterData.fx }}&nbsp;{{ weaterData.fl }}&emsp;<img
          src="@/assets/images/humidity.png"
          alt=""
        >&nbsp;湿度&nbsp;{{ shidu }}
      </div>
      <div
        class="brief-data"
        v-if="weaterDataTomo.low"
      >
        明天：{{ weaterDataTomo.low.split(' ')[1] }} ~ {{ weaterDataTomo.high.split(' ')[1] }}&emsp;<img
          src="@/assets/images/wind.png"
          alt=""
        >&nbsp;{{ weaterDataTomo.fx }}&nbsp;{{ weaterDataTomo.fl }}
      </div>
      <div class="brief-data">
        {{ ganmao }}
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';

const weatherId = ref('icon1')

const weaterData = ref<any>({});
const weaterDataTomo = ref<any>({});

const wendu = ref('');
const shidu = ref('');
const quality = ref('');
const ganmao = ref('');

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

const getWeaterData = async () => {
  const res = await axios.get('http://10.168.56.101/weather');
  wendu.value = res.data.data.wendu;
  shidu.value = res.data.data.shidu;
  quality.value = res.data.data.quality;
  ganmao.value = res.data.data.ganmao;
  weaterData.value = res.data.data.forecast[0];
  weaterDataTomo.value = res.data.data.forecast[1];
  if (weaterData.value.type == '晴') {
    weatherId.value = 'icon1'
  } else {
    if (weaterData.value.type == '阴') {
      weatherId.value = 'icon2'
    } else {
      if (weaterData.value.type == '雾') {
        weatherId.value = 'icon3'
      } else {
        if (weaterData.value.type.indexOf('多云') != -1) {
          weatherId.value = 'icon4'
        } else {
          if (
            weaterData.value.type.indexOf('阵雨') != -1 ||
            weaterData.value.type.indexOf('小雨') != -1 ||
            weaterData.value.type.indexOf('中雨') != -1 ||
            weaterData.value.type.indexOf('大雨') != -1 ||
            weaterData.value.type.indexOf('暴雨') != -1
          ) {
            weatherId.value = 'icon5'
          } else {
            if (
              weaterData.value.type.indexOf('阵雪') != -1 ||
              weaterData.value.type.indexOf('小雪') != -1 ||
              weaterData.value.type.indexOf('中雪') != -1 ||
              weaterData.value.type.indexOf('大雪') != -1 ||
              weaterData.value.type.indexOf('暴雪') != -1
            ) {
              weatherId.value = 'icon6'
            } else {
              if (weaterData.value.type.indexOf('霾') != -1 || weaterData.value.type.indexOf('雾霾') != -1) {
                weatherId.value = 'icon7'
              } else {
                if (weaterData.value.type.indexOf('尘') != -1 || weaterData.value.type.indexOf('沙') != -1) {
                  weatherId.value = 'icon8'
                } else {
                  weatherId.value = 'icon1'
                }
              }
            }
          }
        }
      }
    }
  }
};

onMounted(async () => {
  await getWeaterData();
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
  const annotations: any = [];
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

      .info-item {
        display: flex;
        align-items: center;
        height: 100%;
        width: 30%;

        .icon-box {
          height: 80%;
          width: 20%;
          background-size: 100% 100%;
          margin-right: 10px;
        }
        #rhIcon {
          background-image: url('@/assets/images/RHIcon.png');
        }
        #wenduIcon {
          background-image: url('@/assets/images//wenduIcon.png');
        }
        #fenbeiIcon {
          background-image: url('@/assets/images/fenbeiIcon.png');
          height: 60%;
          width: 30%;
        }

        .data-box {
          font-size: 20px;
          color: #fab113;
          font-weight: 600;
        }
      }
    }
  }

  .weather-box {
    height: calc(100% - 30px);
    width: 100%;
    padding: 16px 21px;

    .weater-title {
      height: 30px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-left: 16px;
      font-size: 18px;
    }
    .weater-info-box {
      height: calc(100% - 30px);
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-content: center;
      align-items: center;

      .weater-icon {
        width: 120px;
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        align-content: center;

        > div {
          height: calc(100% - 140px);
          width: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 20px;
        }

        > img {
          height: 120px;
          width: 120px;
        }
      }

      .weater-data {
        height: 100%;
        width: calc(100% - 130px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        align-content: space-around;
        flex-wrap: wrap;

        > div {
          height: 50px;
          width: 33%;
        }
      }
    }

    .temperature-and-weather {
      height: 100px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      > div {
        height: 100%;
        width: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        align-content: center;
      }

      .temperature-box {
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
        margin: 0;
        padding: 0;
        font-weight: 400;
        float: left;
        font-size: 60px;
        color: #1a1a1a;
      }

      .weather-name-box {
        > div {
          width: 100%;
          text-align: center;
        }
        .weather-icon {
          height: 40px;
          width: 40px;
          background-size: 100% 100%;
          // background-image: url('/weatherIcon/00.png');
        }

        #icon1 {
          background-image: url('@/assets/images/00.png');
        }
        #icon2 {
          background-image: url('@/assets/images/02.png');
        }
        #icon3 {
          background-image: url('@/assets/images/18.png');
        }
        #icon4 {
          background-image: url('@/assets/images/01.png');
        }
        #icon5 {
          background-image: url('@/assets/images/04.png');
        }
        #icon6 {
          background-image: url('@/assets/images/15.png');
        }
        #icon7 {
          background-image: url('@/assets/images/53.png');
        }
        #icon8 {
          background-image: url('@/assets/images/20.png');
        }
      }
    }
    .brief-data {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 30px;
      font-size: 14px;
      color: #1a1a1a;
      font-weight: 400;
      > img {
        height: 16px;
        width: 16px;
      }
    }
  }
}
</style>