<template>
  <div id="chart" style="width: 100%; height: 100%"></div>
</template>
<script lang="ts" setup>
  import * as echarts from 'echarts';
  import { onMounted, ref, shallowRef } from 'vue';
  import { findHourData } from '../index.api';

  const props = defineProps({
    params: {
      type: Object,
      required: true,
    },
  });

  const showEmpty = ref<boolean>(false); // 用于存储错误消息

  const chartInstance = shallowRef(null);

  const loadData = async () => {
    const res = await findHourData(props.params);
    if (res.length === 0) {
      showEmpty.value = true;
      return;
    }
    const option = {
      xAxis: {
        type: 'category',
        data: [],
      },
      tooltip: {
        trigger: 'axis',
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [],
          type: 'line',
        },
      ],
    };
    res.forEach((item: any) => {
      option.xAxis.data.push(item.time);
      option.series[0].data.push(item.value);
    });
    chartInstance.value.setOption(option);
  };
  onMounted(() => {
    const chartDom = document.getElementById('chart');
    if (chartDom) {
      chartInstance.value = echarts.init(chartDom);
    }
    loadData();
  });
</script>
<style lang="less" scoped></style>
