<template>
  <div class="carbon-flow-chart-box">
    <div class="title-box">
      <MyCarbonTitle :title="'碳流图'" />
    </div>
    <div class="chart-box" ref="carbonFlowChart"> </div>
  </div>
</template>

<script setup lang="ts">
  import MyCarbonTitle from './MyCarbonTitle.vue';
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import { TitleComponent, TooltipComponent } from 'echarts/components';
  import { SankeyChart } from 'echarts/charts';
  import { CanvasRenderer } from 'echarts/renderers';
  import { getCarbonFlowChartApi } from '../standardized.api';

  let chart: echarts.ECharts | null = null;

  const carbonFlowChart = ref();
  const data1 = ref<any>();

  const loadingSanchitou = () => {
    // 绘制桑基图
    const option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        valueFormatter: function (value: any) {
          return value - 1;
        },
      },
      series: [
        {
          type: 'sankey',
          data: [],
          links: [],
          nodeAlign: 'left',
          layoutIterations: 0,
          emphasis: {
            focus: 'adjacency',
          },
          levels: [
            {
              depth: 0,
              itemStyle: {
                color: '#fbb4ae',
              },
              lineStyle: {
                color: 'source',
                opacity: 0.6,
              },
            },
            {
              depth: 1,
              itemStyle: {
                color: '#b3cde3',
              },
              lineStyle: {
                color: 'source',
                opacity: 0.6,
              },
            },
            {
              depth: 2,
              itemStyle: {
                color: '#ccebc5',
              },
              lineStyle: {
                color: 'source',
                opacity: 0.6,
              },
            },
            {
              depth: 3,
              itemStyle: {
                color: '#decbe4',
              },
              lineStyle: {
                color: 'source',
                opacity: 0.6,
              },
            },
          ],
          lineStyle: {
            curveness: 0.5,
          },
        },
      ],
    };
    data1.value.forEach((item) => {
      option.series[0].data.push({
        name: item.nodeName,
        itemStyle: getNodeLingStyle(item),
      });
      if (item.parentId != 0) {
        option.series[0].links.push({
          source: item.parentNodeName,
          target: item.nodeName,
          value: item.value ? item.value + 1 : 1,
          lineStyle: getNodeLingStyle(item),
        });
      }
    });
    chart?.setOption(option);
  };

  const getCarbonFlowChartData = async () => {
    const res1 = await getCarbonFlowChartApi();
    console.log('1213123', res1);
    data1.value = res1;
    loadingSanchitou();
  };

  const getNodeLingStyle = (node) => {
    // 判断字符串中包含损耗
    if (node.nodeName.includes('损')) {
      return { color: '#F70000', opacity: 1 };
    }
  };
  onMounted(() => {
    if (carbonFlowChart.value) {
      chart = echarts.init(carbonFlowChart.value);
    }
    // 获取碳流图数据
    getCarbonFlowChartData();
    console.log('1231232312132123', data1.value);
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
