<template>
  <div
    class="electric-energy-chart"
    ref="electricEnergy"
  >

  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onBeforeUnmount, onMounted } from 'vue';
import { getPieChartDataApi } from '../Standardized.api';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';

const props = defineProps({
  point: {
    type: Number,
    default: 5
  },
  title: {
    type: String,
    default: '电能分布图'
  },
  formData: {
    type: Object,
    default: {}
  },
  pushErrorMessage: {
    type: Function,
    default: () => {}
  }
})

// 深度监听profile对象
watch(
  () => props.formData,
  (newProfile) => {
    initChart()
  },
  { deep: true }
);

// 定义容器ref
const electricEnergy = ref();

let chartInstance: any = null;

// 模拟数据
const getData = async () => {
  let params = {
    pointId: props.point ? props.point : 5,
    dateType: props.formData.dateType ? props.formData.dateType : 'month',
    startDate: props.formData.analysisTime ? props.formData.analysisTime[0] : '2025-04-01',
    endDate: props.formData.analysisTime ? props.formData.analysisTime[1] : '2025-05-01',
  };
  let res = await getPieChartDataApi(params);
  let parentArr = res.seriesData.filter((item) => !item.parentName);
  let childrenArr = res.seriesData.filter((item) => item.parentName);
  return {
    categories: parentArr.map((item) => {
      return {
        name: item.name,
        value: item.value,
      };
    }),
    devices: childrenArr.map((item) => {
      return {
        category: item.parentName,
        name: item.name,
        value: item.value,
      };
    }),
  };
};

const getSoftRandomColor = (index) => {
  const colors = ['#76b7b2', '#64a0eb', '#e15759',, '#b07aa1', '#ff9da7', '#4e79a7', '#59a14f', '#edc948', '#bab0ac',];
  return colors[index];
};

const initChart = async () => {
  if (!electricEnergy.value) return;

  chartInstance = echarts.init(electricEnergy.value);

  const data = await getData();

  // 颜色映射
  // const colorMap = {
  //   特殊用电: '#c23531',
  //   动力用电: '#2f4554',
  //   照明插座用电: '#61a0a8',
  //   暖通用电: '#d48265',
  //   总用电: '#91c7ae',
  // };

  const colorMap = {};
  data.categories.forEach((item, index) => {
    colorMap[item.name] = getSoftRandomColor(index);
  });

  // 为设备生成更深的颜色
  const deviceColors = {};
  data.devices.forEach((device) => {
    if (!deviceColors[device.category]) {
      deviceColors[device.category] = [];
    }
    // 基于主色生成渐变色
    deviceColors[device.category].push(echarts.color.lift(colorMap[device.category], -0.2 * (deviceColors[device.category].length + 1)));
  });

  // 准备系列数据
  const series = [
    // 内圈饼图 - 大类占比
    {
      name: '用电大类',
      type: 'pie',
      radius: [0, '50%'],
      center: ['50%', '50%'],
      label: {
        position: 'inner',
        formatter: '{d}%',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
      },
      labelLine: {
        show: false,
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff',
      },
      data: data.categories.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: colorMap[item.name] },
      })),
    },
    // 外圈环形图 - 设备占比
    {
      name: '设备用电',
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '50%'],
      label: {
        show: true,
        formatter: '{d}%',
        fontSize: 12,
        color: '#333',
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 10,
        smooth: 0.2,
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff',
      },
      data: data.devices.map((device) => ({
        name: `${device.category}-${device.name}`, // 修改为与图例一致的命名格式
        value: device.value,
        category: device.category,
        deviceName: device.name, // 保留原始设备名
        itemStyle: {
          color: deviceColors[device.category].shift() || colorMap[device.category],
        },
      })),
    },
  ];

  // 准备图例数据
  const categoryLegendData = data.categories.map((item) => item.name);
  const deviceLegendData = data.devices.map((device) => `${device.category}-${device.name}`);

  // 图表配置
  const option = {
    title: {
      text: props.title,
      left: 'start',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.seriesName === '用电大类') {
          return `${params.name}<br/>占比: ${params.percent}%`;
        } else {
          const parts = params.name.split('-');
          return `${parts[0]} - ${parts[1]}<br/>占比: ${params.percent}%`;
        }
      },
    },
    legend: [
      // 左侧大类图例
      {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        data: categoryLegendData,
        formatter: function (name) {
          const item = data.categories.find((d) => d.name === name);
          return [`{value|${item.value} kw.h}`, `{name|${item.name}}`].join('\n');
        },
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          rich: {
            name: {
              fontSize: 14,
              color: '#000',
              padding: [0, 0, 8, 0],
            },
            value: {
              fontSize: 16,
              color: '#f59e5c',
              padding: [10, 0, 4, 0],
            },
          },
        },
        itemStyle: {
          borderWidth: 0,
        },
        selectedMode: 'multiple',
        selector: ['all', 'inverse'],
        selectorPosition: 'end',
        selectorLabel: {
          fontSize: 10,
          margin: 3,
        },
      },
      // 右侧设备图例
      {
        orient: 'vertical',
        right: 'right',
        top: 'center',
        data: deviceLegendData,
        formatter: function (name) {
          const parts = name.split('-');
          const device = data.devices.find((d) => d.name === parts[1] && d.category === parts[0]);
          // return `${parts[1]}: ${device.value}%`;
          return `${parts[1]}`;
        },
        textStyle: {
          fontSize: 12,
        },
        itemStyle: {
          borderWidth: 0,
        },
        selectedMode: 'multiple',
        selector: ['all', 'inverse'],
        selectorPosition: 'end',
        selectorLabel: {
          fontSize: 10,
          margin: 3,
        },
      },
    ],
    series,
    // 响应式配置
    grid: {
      left: 150,
      right: 150,
      top: 60,
      bottom: 20,
      containLabel: true,
    },
  };

  chartInstance.setOption(option);

  // 图例点击事件处理
  chartInstance.on('legendselectchanged', function (params) {
    const { name, selected } = params;

    // 处理大类图例点击
    const category = data.categories.find((item) => item.name === name);
    if (category) {
      // 隐藏/显示该大类及其所有设备
      const deviceNames = data.devices.filter((d) => d.category === name).map((d) => `${name}-${d.name}`);

      const newSelected = { ...selected };
      deviceNames.forEach((deviceName) => {
        newSelected[deviceName] = selected[name];
      });
      chartInstance.setOption({
        legend: [{ selected: newSelected }, { selected: newSelected }],
      });
      return;
    }

    // 处理设备图例点击
    const parts = name.split('-');
    if (parts.length === 2) {
      const [categoryName, deviceName] = parts;
      const device = data.devices.find((d) => d.name === deviceName && d.category === categoryName);
      if (device) {
        // 更新图表显示
        chartInstance.setOption({
          legend: [{ selected: selected }, { selected: selected }],
        });
      }
    }
  });
};

// 根据大类获取颜色，保持内外环颜色关联
const getCategoryColor = (category, categories) => {
  const index = categories.findIndex((item) => item.name === category);
  const colorList = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570'];
  return colorList[index % colorList.length];
};

// 更新视图
const uploadChart = (form) => {
  console.log('uploadChart---------------->', form);
}

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

defineExpose({
  uploadChart
})
</script>

<style scoped lang="less">
.electric-energy-chart {
  height: 100%;
  width: 100%;
}
</style>