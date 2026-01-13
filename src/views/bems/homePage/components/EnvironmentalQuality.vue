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
      <div class="left-box">
        <div class="top-box">
          <div class="weather-icon" :id="weatherId">

          </div>
          <div class="weater-type-box">
            {{ weaterData.type }}
          </div>
          <div class="weater-number-box">
            {{ wendu }}°
          </div>
        </div>
        <div class="middle-box">
          <div>
            <div>
              <img src="@/assets/images/pm25.png" alt="">&ensp;pm2.5
            </div>
            <div>
              {{ weaterData.pm25 }}
            </div>
          </div>
          <div>
            <div>
              <img src="@/assets/images/humidity.png" alt="">&ensp;湿度
            </div>
            <div>
              {{ shidu }}
            </div>
          </div>
          <div>
            <div>
              <img src="@/assets/images/wind.png" alt="">&ensp;{{ weaterData.fx }}
            </div>
            <div>
              {{ weaterData.fl }}
            </div>
          </div>
        </div>
        <div class="bottom-box">
          <div>
            空气质量
          </div>
          <div style="font-size: 12px;">
            {{ quality + ' ' + ganmao }}
          </div>
        </div>
      </div>
      <div class="right-box">
        <div class="weather-item">
          <div class="left-box">
            <div>
              {{ zuotian.ymd ? zuotian.ymd.split('-')[1] + '月' + zuotian.ymd.split('-')[2] + '日' : '无' }}
            </div>
            <div>
              <div class="weather-icon" :id="zuotian.icon">

              </div>
            </div>
          </div>
          <div class="day-box">
            <div>
              昨天
            </div>
            <div>
              <div>
                {{ zuotian.low ? zuotian.low.split(' ')[1] : '无' }} ~ {{ zuotian.high ?
                  zuotian.high.split(' ')[1] : '无' }}
              </div>
            </div>
          </div>
        </div>
        <div class="border-box"></div>
        <div class="weather-item">
          <div class="left-box">
            <div>
              {{ weaterData.ymd ? weaterData.ymd.split('-')[1] + '月' + weaterData.ymd.split('-')[2] + '日' : '无' }}
            </div>
            <div>
              <div class="weather-icon" :id="weatherId">

              </div>
            </div>
          </div>
          <div class="day-box">
            <div>
              今天
            </div>
            <div>
              <div>
                {{ weaterData.low ? weaterData.low.split(' ')[1] : '无' }} ~ {{ weaterData.high ?
                  weaterData.high.split(' ')[1] : '无' }}
              </div>
            </div>
          </div>
        </div>
        <div class="border-box"></div>
        <div class="weather-item">
          <div class="left-box">
            <div>
              {{ mingtian.ymd ? mingtian.ymd.split('-')[1] + '月' + mingtian.ymd.split('-')[2] + '日' : '无' }}
            </div>
            <div>
              <div class="weather-icon" :id="mingtian.icon">
              </div>
            </div>
          </div>
          <div class="day-box">
            <div>
              明天
            </div>
            <div>
              <div>
                {{ mingtian.low ? mingtian.low.split(' ')[1] : '无' }} ~ {{ mingtian.high ?
                  mingtian.high.split(' ')[1] : '无' }}
              </div>
            </div>
          </div>
        </div>
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

const zuotian = ref({
  low: '',
  high: '',
  ymd: '',
  type: '',
  icon: '',
})

const mingtian = ref({
  low: '',
  high: '',
  ymd: '',
  type: '',
  icon: '',
})

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
  // const res = await axios.get('http://10.168.56.101/weather');
  const res = await axios.get('/api/weather/city/101010100');

  zuotian.value.low = res.data.data.yesterday.low
  zuotian.value.high = res.data.data.yesterday.high
  zuotian.value.ymd = res.data.data.yesterday.ymd
  zuotian.value.type = res.data.data.yesterday.type
  mingtian.value.low = res.data.data.forecast[1].low
  mingtian.value.high = res.data.data.forecast[1].high
  mingtian.value.ymd = res.data.data.forecast[1].ymd
  mingtian.value.type = res.data.data.forecast[1].type

  console.log('getWeaterData----------------->', res.data.data);

  wendu.value = res.data.data.wendu;
  shidu.value = res.data.data.shidu;
  quality.value = res.data.data.quality;
  ganmao.value = res.data.data.ganmao;
  weaterData.value = res.data.data.forecast[0]; 
  weaterData.value.pm25 = res.data.data.pm25; 
  weaterDataTomo.value = res.data.data.forecast[1];
  weatherId.value = getWeatherIcom(weaterData.value.type)
  zuotian.value.icon = getWeatherIcom(zuotian.value.type)
  mingtian.value.icon = getWeatherIcom(mingtian.value.type)
};

const getWeatherIcom = (type) => {
  let icon = ''
  if (type == '晴') {
    icon = 'icon1'

  } else {
    if (type == '阴') {
      icon = 'icon2'

    } else {
      if (type == '雾') {
        icon = 'icon3'

      } else {
        if (type.indexOf('多云') != -1) {
          icon = 'icon4'

        } else {
          if (
            type.indexOf('阵雨') != -1 ||
            type.indexOf('小雨') != -1 ||
            type.indexOf('中雨') != -1 ||
            type.indexOf('大雨') != -1 ||
            type.indexOf('暴雨') != -1
          ) {
            icon = 'icon5'

          } else {
            if (
              type.indexOf('阵雪') != -1 ||
              type.indexOf('小雪') != -1 ||
              type.indexOf('中雪') != -1 ||
              type.indexOf('大雪') != -1 ||
              type.indexOf('暴雪') != -1
            ) {
              icon = 'icon6'
 
            } else {
              if (type.indexOf('霾') != -1 || type.indexOf('雾霾') != -1) {
                icon = 'icon7'
            
              } else {
                if (type.indexOf('尘') != -1 || type.indexOf('沙') != -1) {
                  icon = 'icon8'

                } else {
                  icon = 'icon1'
                  
                }
              }
            }
          }
        }
      }
    }
  }
  return icon
}

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

  .weather-icon {
    height: 70px;
    width: 70px;
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
    display: flex;
    justify-content: space-around;

    .left-box {
      height: 100%;
      width: 60%;

      >div {
        height: 27%;
      }

      .top-box {
        height: 40%;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        >div {
          display: flex;
          align-items: flex-end;
          height: 70px;
        }

        .weather-icon {
          height: 70px;
          width: 70px;
          background-size: 100% 100%;
          // background-image: url('/weatherIcon/00.png');
        }

        .weater-type-box {
          display: flex;
          justify-content: center;
          width: 30%;
          font-size: 20px;
        }

        .weater-number-box {
          font-size: 40px;
          font-weight: 600;
        }
      }

      .middle-box {
        display: flex;
        justify-content: space-around;

        >div {
          height: 100%;
          width: 29%;
          border: 1px solid #696969;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgb(155, 154, 154);

          >img {
            height: 20px;
          }

          >div {
            width: 100%;
            height: 50%;
            display: flex;
            justify-content: center;
          }
        }
      }

      .bottom-box {
        margin-top: 4%;
        border: 1px solid #696969;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgb(155, 154, 154);
        padding: 0 12px;
      }
    }

    .right-box {
      height: 100%;
      width: 36%;
      padding: 0 6px;
      display: flex;
      flex-wrap: wrap;
      align-content: space-around;
      justify-content: center;
      border: 1px solid #acaaaa;
      border-radius: 20px;

      .weather-item {
        width: 100%;
        height: 30%;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        >div {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          width: 50%;
          height: 100%;

          .weather-icon {
            height: 30px;
            width: 30px;
          }

          >div {
            font-weight: 600;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50%;
            width: 100%;
          }
        }
      }

      .border-box {
        height: 0;
        width: 80%;
        border-top: 1px solid #adacac;
      }
    }
  }
}
</style>