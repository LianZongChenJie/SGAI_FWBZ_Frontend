<template>
  <div class="point-data-statistics-container">
    <!-- 左侧列表 -->
    <div class="left-list">
      <ul>
        <li v-for="item in listData" :key="item.id">
          <input type="checkbox" :checked="selectedItems.includes(item.id)" @click.stop="handleCheckboxClick(item.id)" />
          {{ item.pointName }}
        </li>
      </ul>
    </div>
    <!-- 右侧图表 -->
    <div class="right-content">
      <div class="chart-container">
        <a-radio-group v-model:value="dateType" button-style="solid">
          <a-radio-button value="day">日能耗</a-radio-button>
          <a-radio-button value="month">月能耗</a-radio-button>
          <a-radio-button value="year">年能耗</a-radio-button>
        </a-radio-group>
        日期：<a-date-picker v-model:value="date" />
        <a-button type="primary">查询</a-button>
        <!-- 这里放置图表组件 -->
        <div id="chart" class="chart-placeholder"> </div>
      </div>
      <!-- 图表下方的表格 -->
      <div class="table-container">
        <a-table :columns="tableColumns" :data-source="tableData" :pagination="false" bordered size="middle" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import { pointAll } from './index.api';
  import * as echarts from 'echarts';

  const date = ref();
  const chartInstance = ref(null);

  const dateType = ref('day');

  // 模拟列表数据
  const listData = ref([]);

  // 选中的列表项
  const selectedItem = ref(null);
  // 多选列表项
  const selectedItems = ref<number[]>([]);

  const findAllPoint = async () => {
    const res = await pointAll();
    listData.value = res;
  };

  // 处理复选框点击事件
  const handleCheckboxClick = (id: number) => {
    const index = selectedItems.value.indexOf(id);
    if (index === -1) {
      selectedItems.value.push(id);
    } else {
      selectedItems.value.splice(index, 1);
    }
  };

  // 初始化图表
  const initChart = () => {
    const chartDom = document.getElementById('chart');
    if (chartDom) {
      chartInstance.value = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['戏剧院F1空调电表1', '戏剧院F1空调电表2', '戏剧院F1空调电表3'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['2025/01/01', '2025/01/02', '2025/01/03', '2025/01/04', '2025/01/05', '2025/01/06', '2025/01/07'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '戏剧院F1空调电表1',
            type: 'line',
            stack: '总量',
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: '戏剧院F1空调电表2',
            type: 'line',
            stack: '总量',
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: '戏剧院F1空调电表3',
            type: 'line',
            stack: '总量',
            data: [150, 232, 201, 154, 190, 330, 410],
          },
        ],
      };
      chartInstance.value.setOption(option);
    }
  };

  // 监听窗口大小变化，调整图表大小
  const resizeChart = () => {
    if (chartInstance.value) {
      chartInstance.value.resize();
    }
  };

  onMounted(() => {
    findAllPoint();
    initChart();
    window.addEventListener('resize', resizeChart);
  });

  // 组件卸载时移除事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', resizeChart);
  });

  // 表格列配置
  const tableColumns = ref([
    {
      title: '能耗',
      dataIndex: 'metric',
      key: 'metric',
      width: 120,
    },
    {
      title: '2025/01/01',
      dataIndex: 'day1',
      key: 'day1',
      align: 'right',
    },
    {
      title: '2025/01/02',
      dataIndex: 'day2',
      key: 'day2',
      align: 'right',
    },
    {
      title: '2025/01/03',
      dataIndex: 'day3',
      key: 'day3',
      align: 'right',
    },
    {
      title: '2025/01/04',
      dataIndex: 'day4',
      key: 'day4',
      align: 'right',
    },
    {
      title: '2025/01/05',
      dataIndex: 'day5',
      key: 'day5',
      align: 'right',
    },
    {
      title: '2025/01/06',
      dataIndex: 'day6',
      key: 'day6',
      align: 'right',
    },
    {
      title: '2025/01/07',
      dataIndex: 'day7',
      key: 'day7',
      align: 'right',
    },
  ]);

  // 表格数据
  const tableData = ref([
    { key: '1', metric: '戏剧院F1空调电表1', day1: 120, day2: 132, day3: 101, day4: 134, day5: 90, day6: 230, day7: 210 },
    { key: '2', metric: '戏剧院F1空调电表2', day1: 220, day2: 182, day3: 191, day4: 234, day5: 290, day6: 330, day7: 310 },
    { key: '3', metric: '戏剧院F1空调电表3', day1: 150, day2: 232, day3: 201, day4: 154, day5: 190, day6: 330, day7: 410 },
  ]);
</script>

<style lang="less">
  .point-data-statistics-container {
    display: flex;
    height: calc(100vh - 110px);
    background-color: #fff;

    .right-content {
      flex: 1;
      height: 100%;
      padding: 16px;

      .chart-container {
        height: 70%;
        background-color: #f8f8f8;
        border-radius: 4px;
        padding: 16px;

        .chart-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #999;
          font-size: 16px;
          background-color: #fff;
          border: 1px dashed #e8e8e8;
          border-radius: 4px;
        }
      }
    }

    .left-list {
      width: 230px;
      height: 100%;
      overflow-y: auto;
      border-right: 1px solid #e8e8e8;
      padding: 8px 0;
      background-color: #fafafa;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        padding: 8px 16px;
        margin: 4px 0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #333;

        &:hover {
          background-color: #e6f7ff;
          color: #1890ff;
        }

        // 移除.active样式
      }
    }
    #chart {
      width: 100%;
      height: calc(100% - 40px); // 减去日期选择器和按钮的高度
      margin-top: 16px;
    }

    .table-container {
      height: 30%;
      background-color: #fff;
      border-radius: 1px;
      border: 1px solid #e8e8e8;
      overflow: auto; // 添加滚动条
    }

    // 设置表格固定表头
    .ant-table {
      .ant-table-container {
        .ant-table-body {
          overflow: auto !important;
          max-height: calc(100vh - 400px); // 根据实际高度调整
        }
      }
    }
  }
</style>
