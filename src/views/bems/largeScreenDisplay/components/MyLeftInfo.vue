<template>
  <div class="my-left-info">
    <div class="title-box">
      <MyTitle :title="'能源主题'" />
    </div>
    <div class="cumulative-electricity-water">
      <div class="electricity-box">
        <div>当日累计用电(kw.h)</div>
        <div class="electricity-value-box">{{ electricityValue }}</div>
      </div>
      <div class="water-box">
        <div>当日累计用水(t)</div>
        <div class="water-value-box">{{ waterValue }}</div>
      </div>
    </div>
    <div class="charts-box">
      <div class="electricity-chart-box">
        <div class="electricity-title">
          用电分析
        </div>
        <div class="cumulative-data-box">
          <div>
            <div>
              年累计
            </div>
            <div class="cumulative-value">
              {{ yearElectricityValue }}
            </div>
          </div>
          <div>
            <div>
              月累计
            </div>
            <div class="cumulative-value">
              {{ monthElectricityValue }}
            </div>
          </div>
          <div>
            <div>
              当日累计
            </div>
            <div class="cumulative-value">
              {{ electricityValue }}
            </div>
          </div>
        </div>
        <div
          id="electricityChart"
          ref="electricityChartRef"
        ></div>
      </div>
      <div class="water-chart-box">
        <div class="water-title">
          当日用水趋势
        </div>
        <div class="cumulative-data-box">
          <div>
            <div>
              年累计
            </div>
            <div class="cumulative-value">
              {{ yearWaterValue }}
            </div>
          </div>
          <div>
            <div>
              月累计
            </div>
            <div class="cumulative-value">
              {{ monthWaterValue }}
            </div>
          </div>
          <div>
            <div>
              当日累计
            </div>
            <div class="cumulative-value">
              {{ waterValue }}
            </div>
          </div>
        </div>
        <div
          id="waterChart"
          ref="waterChartRef"
        ></div>
      </div>
      <div class="electricity-ranking-box">
        <div class="ranking-title">
          本月用电排名
        </div>
        <!-- <div class="my-tab-button">
          <div class="button-box">
            <div :id="selectTarget === 1 ? 'selectTarget' : ''" @click="handleSelect(1)">
              专业
            </div>
            <div class="border-box"></div>
            <div :id="selectTarget === 2 ? 'selectTarget' : ''" @click="handleSelect(2)">
              建筑
            </div>
            <div class="border-box"></div>
            <div :id="selectTarget === 3 ? 'selectTarget' : ''" @click="handleSelect(3)">
              商户
            </div>
          </div>
        </div> -->
        <div id="rankingChart" ref="rankingChartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyTitle from './MyTitle.vue';
import * as echarts from 'echarts';
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { getPointDataForToDayApi, getPointDataForThisMonthApi, getPointDataForThisYearApi, getPointDataMonthlyComparisonTrendApi, getPointDataMonthlyRankingApi } from '../Standardized.api'
import { resetOptions } from 'showdown';

const electricityValue = ref('1600');

const waterValue = ref('43');

const yearElectricityValue = ref('854600');
const monthElectricityValue = ref('854600');

const yearWaterValue = ref('854600');
const monthWaterValue = ref('854600');

// 用电量ref
const electricityChartRef = ref();
const waterChartRef = ref();
const rankingChartRef = ref();
// 初始化图表
let electricityInstance: any = null;
let waterInstance: any = null;
let rankingInstance: any = null;

// 用电量趋势数据
const eleCurrentMonthData = ref<any>([]);
const eleLastMonthData = ref<any>([]);
const eleLastYearData = ref<any>([]);
const currentDays = ref<any>([]);

// 用水量趋势数据
const waterCurrentMonthData = ref<any>([]);
const waterLastMonthData = ref<any>([]);
const waterLastYearData = ref<any>([]);

// 选择的目标
const selectTarget = ref(1)

const data = ref([
  { name: "灯光改造", value: 100 },
  { name: "空调优化", value: 80 },
  { name: "窗帘控制", value: 90 },
  { name: "新风优化", value: 40 },
  { name: "机组调节", value: 50 },
]);

// 更新数据
const updateData = async () => {

  let resElectricity= await getPointDataMonthlyComparisonTrendApi({ configPath:'jinanqiao:electricity' })
  let resWater = await getPointDataMonthlyComparisonTrendApi({ configPath:'jinanqiao:water' })

  // 获取当前月份的天数
  currentDays.value = resElectricity.xaxis

  // 生成模拟数据
  eleCurrentMonthData.value = resElectricity.chatSeriesList[0].data;
  waterCurrentMonthData.value = resWater.chatSeriesList[0].data;

  // 上月数据
  eleLastMonthData.value = resElectricity.chatSeriesList[1].data
  waterLastMonthData.value = resWater.chatSeriesList[1].data

  // 去年同月数据
  eleLastYearData.value = resElectricity.chatSeriesList[2].data
  waterLastYearData.value = resWater.chatSeriesList[2].data
};

// 初始化图表
const initElectricityChart = () => {
  if (!electricityChartRef.value) return;

  // 初始化ECharts实例
  electricityInstance = echarts.init(electricityChartRef.value);

  // 配置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`;
        for (let i = 0; i < params.length; i++) {
          result += `${params[i].marker}${params[i].seriesName}: <b>${params[i].value} kWh</b><br/>`;
        }
        return result;
      },
    },
    legend: {
      data: ['当月', '上月', '去年本月'],
      top: 10,
      textStyle: {
        color: '#fff', // 设置图例文字颜色为白色
      },
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '5px',
      top: '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: currentDays.value,
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        color: '#fff',
      },
    },
    yAxis: {
      type: 'value',
      name: '用电量 (kWh)',
      nameTextStyle: {
        color: '#fff',
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        color: '#fff',
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee',
        },
      },
    },
    series: [
      {
        name: '当月',
        type: 'line',
        data: eleCurrentMonthData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#5470c6',
        },
        lineStyle: {
          width: 3,
          color: '#5470c6',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(84, 112, 198, 0.5)',
              },
              {
                offset: 1,
                color: 'rgba(84, 112, 198, 0.1)',
              },
            ],
          },
        },
      },
      {
        name: '上月',
        type: 'line',
        data: eleLastMonthData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#91cc75',
        },
        lineStyle: {
          width: 3,
          color: '#91cc75',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(145, 204, 117, 0.5)',
              },
              {
                offset: 1,
                color: 'rgba(145, 204, 117, 0.1)',
              },
            ],
          },
        },
      },
      {
        name: '去年本月',
        type: 'line',
        data: eleLastYearData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#ee6666',
        },
        lineStyle: {
          width: 3,
          color: '#ee6666',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(238, 102, 102, 0.5)',
              },
              {
                offset: 1,
                color: 'rgba(238, 102, 102, 0.1)',
              },
            ],
          },
        },
      },
    ],
  };

  // 应用配置项
  electricityInstance.setOption(option);
  window.addEventListener("resize", handleResize);
};

// 初始化图表
const initWaterChart = () => {
  if (!waterChartRef.value) return;

  // 初始化ECharts实例
  waterInstance = echarts.init(waterChartRef.value);

  // 配置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`;
        for (let i = 0; i < params.length; i++) {
          result += `${params[i].marker}${params[i].seriesName}: <b>${params[i].value} t</b><br/>`;
        }
        return result;
      },
    },
    legend: {
      data: ['当月', '上月', '去年本月'],
      top: 10,
      textStyle: {
        color: '#fff', // 设置图例文字颜色为白色
      },
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '5px',
      top: '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: currentDays.value,
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        color: '#fff',
      },
    },
    yAxis: {
      type: 'value',
      name: '用水量 (t)',
      nameTextStyle: {
        color: '#fff',
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        color: '#fff',
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee',
        },
      },
    },
    series: [
      {
        name: '当月',
        type: 'line',
        data: waterCurrentMonthData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#5470c6',
        },
        lineStyle: {
          width: 3,
          color: '#5470c6',
        },
      },
      {
        name: '上月',
        type: 'line',
        data: waterLastMonthData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#91cc75',
        },
        lineStyle: {
          width: 3,
          color: '#91cc75',
        },
      },
      {
        name: '去年本月',
        type: 'line',
        data: waterLastYearData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#ee6666',
        },
        lineStyle: {
          width: 3,
          color: '#ee6666',
        },
      },
    ],
  };

  // 应用配置项
  waterInstance.setOption(option);
  window.addEventListener("resize", handleResize);
};

// 响应窗口大小变化
const handleResize = () => {
  if (electricityInstance) {
    electricityInstance.resize();
  }
  if (waterInstance) {
    waterInstance.resize();
  }
  if (rankingInstance) {
    rankingInstance.resize();
  }
};

// 切换排名目标
const handleSelect = (key) => {
  selectTarget.value = key
}

// 获取排名数据
const getPointDataMonthlyRanking = async () => {
  let res = await getPointDataMonthlyRankingApi({ configPath: 'jinanqiao:ranking'})
  data.value = [...res]
}

const initRankingChart = () => {
  if (!rankingChartRef.value) return;
  rankingInstance = echarts.init(rankingChartRef.value);

  const option = {
    // title: {
    //   text: "节能改造数据漏斗图",
    //   left: "center",
    // },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c}",
    },
    legend: {
      data: data.value.map((item) => item.name),
      left: "left", // 图例放在左侧
      top: 'center',
      orient: "vertical", // 垂直排列
      textStyle: {
        color: '#fff', // 设置图例文字颜色为白色
      },
    },
    series: [
      {
        name: "节能改造",
        type: "funnel",
        left: "20%", // 调整图表位置，避免和图例重叠
        top: 20,
        bottom: 20,
        width: "70%",
        min: 0,
        max: 100,
        minSize: "0%",
        maxSize: "100%",
        sort: "descending", // 数据从大到小排序
        gap: 2,
        label: {
          show: true,
          position: "inside", // 数据标签显示在内部
          formatter: "{b}: {c}", // 显示名称、数值
        },
        labelLine: {
          show: true, // 显示连接线
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid",
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 18,
          },
        },
        data: data.value,
      },
    ],
  };

  rankingInstance.setOption(option);
  window.addEventListener("resize", handleResize);
};

// 获取当日点位水电数据
const getPointData = async () => {
  electricityValue.value = await getPointDataForToDayApi({ configPath:'jinanqiao:electricity' })
  waterValue.value = await getPointDataForToDayApi({ configPath:'jinanqiao:water' })

  monthElectricityValue.value = await getPointDataForThisMonthApi({ configPath:'jinanqiao:electricity' })
  monthWaterValue.value = await getPointDataForThisMonthApi({ configPath:'jinanqiao:water' })

  yearElectricityValue.value = await getPointDataForThisYearApi({ configPath:'jinanqiao:electricity' })
  yearWaterValue.value = await getPointDataForThisYearApi({ configPath:'jinanqiao:water' })
}

onMounted(async () => {
  await getPointData()
  await updateData();
  await getPointDataMonthlyRanking()
  initElectricityChart();
  initWaterChart();
  initRankingChart()
});

// 清理
onUnmounted(() => {
  if (electricityInstance) {
    electricityInstance.dispose();
  }
  if (waterInstance) {
    waterInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="less" scoped>
.my-left-info {
  height: 100%;
  width: 100%;

  .title-box {
    height: 40px;
    padding: 0 2%;
  }

  .cumulative-electricity-water {
    width: 90%;
    margin-left: 5%;
    height: 11.5%;
    display: flex;
    justify-content: space-around;
    align-items: center;

    > div {
      height: 90%;
      width: 45%;
      background-image: url('@/assets/images/cumulative-electricity.png');
      background-size: 100% 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-content: center;

      > div {
        height: 50%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }

      .electricity-value-box,
      .water-value-box {
        font-size: 26px;
        color: #dd9b07;
        align-items: flex-start;
      }
      .water-value-box {
        color: #70e3f8;
      }
    }

    .water-box {
      background-image: url('@/assets/images/cumulative-water.png');
    }
  }

  .charts-box {
    padding-left: 2%;
    width: 100%;
    height: calc(88.5% - 64px);
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: space-around;

    > div {
      width: 100%;
      height: 32.5%;
      background-image: url('@/assets/images/electricityOrWater.png');
      background-size: 100% 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      .electricity-title,
      .water-title,
      .ranking-title {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: 11%;
        font-size: 16px;
        height: 18%;
        width: 100%;
        color: #fff;
      }

      .cumulative-data-box {
        height: 18%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        > div {
          width: 25%;
          height: 100%;

          > div {
            width: 100%;
            height: 50%;
            font-size: 16px;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .cumulative-value {
            color: #b6eff5;
          }
        }
      }

      #electricityChart {
        height: 62%;
        width: 92%;
      }

      #waterChart {
        height: 62%;
        width: 92%;
      }
    }

    .water-chart-box {
      margin-top: 12px;
    }

    .electricity-ranking-box {
      background-image: url('@/assets/images/electricityRanking.png');
      margin-left: 2%;
      margin-top: 12px;

      // .my-tab-button{
      //   width: 100%;
      //   height: 36px;
      //   display: flex;
      //   align-items: center;
      //   justify-content: flex-end;
      //   padding-right: 12px;

      //   >div {
      //     height: 100%;
      //     width: 180px;
      //     border: 1px solid #4affff;
      //     border-radius: 10px;
      //     display: flex;
      //     justify-content: space-around;
      //     align-items: center;

      //     >div {
      //       color: #fff;
      //       display: flex;
      //       align-items: center;
      //       justify-content: center;
      //       font-size: 16px;
      //       height: 70%;

      //       &:hover {
      //         cursor: pointer;
      //       }
      //     }

      //     #selectTarget {
      //       border-bottom: 2px solid #4afefe;
      //     }

      //     .border-box{
      //       height: 90%;
      //       width: 0;
      //       border-left: 2px solid #246b82;
      //     }
      //   }
      // }

      #rankingChart{
        height: calc(82%);
        width: 92%;
      }
    }
  }
}
</style>