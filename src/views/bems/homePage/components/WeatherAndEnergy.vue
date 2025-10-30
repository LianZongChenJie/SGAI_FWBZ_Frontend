<template>
  <div class="weather-and-energy">
    <div class="wrather-box">
      <div class="title">
        天气及能耗预测
      </div>
      <div class="my-weather-box">
        <MyWeater title="北京未来三天天气"
      :forecast-data="weatherData"/>
      </div>
    </div>
    <div class="use-electricity" ref="useElectricityRef">

    </div>
    <div class="use-water" ref="useWaterRef">

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

import MyWeater from './MyWeater.vue'

// 实际应用中，这里应该从API获取数据
const weatherData = ref([
  {
    date: '2023-05-01',
    day: {
      maxtemp_c: 28,
      mintemp_c: 16,
      condition: {
        text: '晴天',
        icon: 'https://cdn.weatherapi.com/weather/64x64/day/113.png'
      },
      maxwind_kph: 12,
      avghumidity: 45
    }
  },
  {
    date: '2023-05-02',
    day: {
      maxtemp_c: 25,
      mintemp_c: 15,
      condition: {
        text: '多云',
        icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png'
      },
      maxwind_kph: 10,
      avghumidity: 60
    }
  },
  {
    date: '2023-05-03',
    day: {
      maxtemp_c: 22,
      mintemp_c: 14,
      condition: {
        text: '小雨',
        icon: 'https://cdn.weatherapi.com/weather/64x64/day/176.png'
      },
      maxwind_kph: 8,
      avghumidity: 75
    }
  }
]);

const useElectricityRef = ref(null);
const useWaterRef = ref(null);
let electricityChart:any = null;
let waterChart:any = null;

// 模拟数据 - 实际应用中替换为API获取的数据
const electricityChartData = ref({
  dates: ['5/1', '5/2', '5/3', '5/4', '5/5', '5/6', '5/7'],
  actualUsage: [320, 340, 365, 380, 400, 390, 410],
  predictedUsage: [330, 350, 370, 390, 410, 400, 420],
  temperatures: [22, 24, 26, 28, 25, 23, 21]
});

// 水数据
const waterData = ref({
      dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      actualUsage: [120, 132, 145, 160, 172, 190, 210],
      predictedUsage: [115, 130, 150, 165, 180, 195, 215]
    })

    const unit = ref('吨')

const initElectricityChart = () => {
  if (!useElectricityRef.value) return;
  
  electricityChart = echarts.init(useElectricityRef.value);
  
  const option = {
    title: {
      text: '近七日用电趋势及预测',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: params => {
        let result = `${params[0].axisValue}<br>`;
        params.forEach(item => {
          const unit = item.seriesName.includes('温度') ? '°C' : 'kWh';
          result += `${item.marker} ${item.seriesName}: ${item.value}${unit}<br>`;
        });
        return result;
      }
    },
    legend: {
      data: ['实际用电量', '预测用电量', '温度'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: electricityChartData.value.dates,
        axisPointer: {
          type: 'shadow'
        },
        axisLabel: {
          interval: 0
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '用电量 (kWh)',
        min: 0,
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '温度 (°C)',
        min: 0,
        axisLabel: {
          formatter: '{value}'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '实际用电量',
        type: 'bar',
        barWidth: '30%',
        data: electricityChartData.value.actualUsage,
        itemStyle: {
          color: '#5470C6'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}kWh'
        }
      },
      {
        name: '预测用电量',
        type: 'bar',
        barWidth: '30%',
        data: electricityChartData.value.predictedUsage,
        itemStyle: {
          color: '#91CC75'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}kWh'
        }
      },
      {
        name: '温度',
        type: 'line',
        yAxisIndex: 1,
        data: electricityChartData.value.temperatures,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#EE6666'
        },
        lineStyle: {
          width: 3
        },
        label: {
          show: true,
          formatter: '{c}°C'
        }
      }
    ]
  };

  electricityChart.setOption(option);
};

const initWaterChart = () => {
  if (!useWaterRef.value) return;
  
  waterChart = echarts.init(useWaterRef.value);
  updateChart();
};

const updateChart = () => {
  if (!waterChart) return;
  
  const option = {
    title: {
      text: '近七日用水趋势及预测',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: params => {
        let result = `${params[0].axisValue}<br>`;
        params.forEach(item => {
          result += `${item.marker} ${item.seriesName}: ${item.value}${unit.value}<br>`;
        });
        return result;
      }
    },
    legend: {
      data: ['实际用水量', '预测用水量'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: waterData.value.dates,
      axisLabel: {
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: `用水量(${unit.value})`,
      axisLine: {
        show: true
      },
      axisLabel: {
        formatter: `{value}${unit.value}`
      }
    },
    series: [
      {
        name: '实际用水量',
        type: 'line',
        data: waterData.value.actualUsage,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#5470C6'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
          ])
        },
        label: {
          show: true,
          formatter: `{c}${unit.value}`,
          position: 'top'
        }
      },
      {
        name: '预测用水量',
        type: 'line',
        data: waterData.value.predictedUsage,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#91CC75'
        },
        lineStyle: {
          width: 3,
          type: 'dashed'
        },
        label: {
          show: true,
          formatter: `{c}${unit.value}`,
          position: 'top'
        }
      }
    ]
  };

  waterChart.setOption(option);
};


const handleResize = () => {
  if (electricityChart) {
    electricityChart.resize();
  }
  if (waterChart) {
    waterChart.resize();
  }
};

onMounted(() => {
  initElectricityChart();
  initWaterChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (electricityChart) {
    electricityChart.dispose();
  }
  if (waterChart) {
    waterChart.dispose();
  }
  window.removeEventListener('resize', handleResize);
});


</script>

<style lang="less" scoped>
.weather-and-energy {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 10px;
  padding: 6px 12px;
  > div {
    width: 32%;
    height: 100%;

    .title {
      height: 30px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .my-weather-box{
      height: calc(100% - 30px);
    }
  }
}
</style>