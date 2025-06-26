<template>
  <div class="carbon-flow-chart-box">
    <div class="title-box">
      <MyCarbonTitle :title="'碳流图'" />
    </div>
    <div
      class="chart-box"
      ref="carbonFlowChart"
    >

    </div>
  </div>
</template>

<script setup lang="ts">
import MyCarbonTitle from './MyCarbonTitle.vue';
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const carbonFlowChart = ref();

const initChart = () => {
  const chart = echarts.init(carbonFlowChart.value);

  // 准备图例数据 - 通常使用节点分类
  const categories = [
    { name: '净购入电力碳排放', itemStyle: { color: '#333' } },
    { name: '人员活动碳排放', itemStyle: { color: '#5470c6' } },
    { name: '车辆碳排放', itemStyle: { color: '#91cc75' } },
    { name: '油车排放', itemStyle: { color: '#fac858' } },
    { name: '空调', itemStyle: { color: '#ee6666' } },
    { name: '照明', itemStyle: { color: '#333' } },
    { name: '办公', itemStyle: { color: '#333' } },
    { name: '1号楼', itemStyle: { color: '#333' } },
    { name: '2号楼', itemStyle: { color: '#333' } },
    { name: '3号楼', itemStyle: { color: '#333' } },
    { name: '4号楼', itemStyle: { color: '#333' } },
    { name: '5号楼', itemStyle: { color: '#333' } },
    { name: '6号楼', itemStyle: { color: '#333' } },
    { name: '7号楼', itemStyle: { color: '#333' } },
  ];

  // 桑基图数据
  const option = {
    // 纵向图例配置
    legend: {
      data: categories.map((item) => item.name),
      right: '0%', // 左侧对齐
      top: '15%', // 标题下方
      orient: 'vertical', // 纵向排列
      align: 'left', // 左对齐
      textStyle: {
        fontSize: 12,
        width: 80, // 固定文字宽度
        overflow: 'truncate', // 文字过长时截断
      },
      formatter: function (name) {
        // 确保文字不会超出
        return name.length > 6 ? name.substring(0, 6) + '...' : name;
      },
    },
    grid: {
      left: '22%', // 为纵向图例留出足够空间
      right: '3%',
      top: '20%',
      bottom: '3%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: '{b}: {c} tCO₂e',
    },
    series: [
      {
        type: 'sankey',
        nodeAlign: 'left',
        layoutIterations: 0,
        emphasis: {
          focus: 'adjacency',
        },
        data: [
          { name: '净购入电力碳排放' },
          { name: '人员活动碳排放' },
          { name: '车辆碳排放' },
          { name: '油车排放' },
          { name: '空调' },
          { name: '照明' },
          { name: '办公' },
          { name: '1号楼' },
          { name: '2号楼' },
          { name: '3号楼' },
          { name: '4号楼' },
          { name: '5号楼' },
          { name: '6号楼' },
          { name: '7号楼' },
        ],
        links: [
          // 净购入电力碳排放分解
          { source: '净购入电力碳排放', target: '1号楼', value: 300 },
          { source: '净购入电力碳排放', target: '2号楼', value: 108 },
          { source: '净购入电力碳排放', target: '3号楼', value: 111 },
          { source: '净购入电力碳排放', target: '4号楼', value: 95 },
          { source: '净购入电力碳排放', target: '5号楼', value: 123 },
          { source: '净购入电力碳排放', target: '6号楼', value: 75 },
          { source: '净购入电力碳排放', target: '7号楼', value: 83 },

          // 人员活动碳排放分解
          { source: '人员活动碳排放', target: '车辆碳排放', value: 150 },
          { source: '人员活动碳排放', target: '1号楼', value: 50 },
          { source: '人员活动碳排放', target: '2号楼', value: 51 },
          { source: '人员活动碳排放', target: '3号楼', value: 31 },
          { source: '人员活动碳排放', target: '4号楼', value: 54 },
          { source: '人员活动碳排放', target: '5号楼', value: 47 },
          { source: '人员活动碳排放', target: '6号楼', value: 39 },
          { source: '人员活动碳排放', target: '7号楼', value: 61 },

          // 车辆碳排放进一步分解
          { source: '车辆碳排放', target: '油车排放', value: 150 },

          // 1号楼进一步分解
          { source: '1号楼', target: '空调', value: 150 },
          { source: '1号楼', target: '照明', value: 150 },
          { source: '1号楼', target: '办公', value: 150 },
        ],
        lineStyle: {
          color: 'source',
          curveness: 0.5,
        },
        itemStyle: {
          color: '#1f77b4',
          borderColor: '#1f77b4',
        },
        label: {
          color: '#333',
          fontSize: 12,
        },
        levels: [
          {
            depth: 0,
            itemStyle: {
              color: '#1f77b4',
            },
            lineStyle: {
              color: 'source',
              opacity: 0.6,
            },
          },
          {
            depth: 1,
            itemStyle: {
              color: '#ff7f0e',
            },
          },
          {
            depth: 2,
            itemStyle: {
              color: '#2ca02c',
            },
          },
        ],
      },
    ],
  };

  chart.setOption(option);

  // 响应式调整
  window.addEventListener('resize', function () {
    chart.resize();
  });
};

onMounted(() => {
  initChart();
});
</script>

<style lang="less" scoped>
.carbon-flow-chart-box {
  height: 100%;
  width: 100%;

  .chart-box {
    height: calc(100% - 30px);
    width: 100%;
  }
}
</style>