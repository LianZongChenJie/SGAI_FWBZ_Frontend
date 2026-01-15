<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="menuClick"
    style="justify-content: center" />
  <div class="point-data-statistics">
    <div class="metering-point-tree">
      <a-tree v-model:checkedKeys="checkedKeys" :tree-data="treeData" checkable checkStrictly :default-expand-all="true"
        :field-names="{ title: 'nodeName', key: 'id' }" >
       <template #title="{ title, key, dataRef }">
          <a-popover>
            <template #content>
              {{ title }}
            </template>
            <span class="truncated-text">
              {{ truncateText(title, 10) }}
            </span>
          </a-popover>
        </template>
      </a-tree>
    </div>
    <div class="right-content">
      <div class="chart-container">
        <a-radio-group v-model:value="dateType" button-style="solid" @change="ragioChange">
          <a-radio-button value="date">日能耗</a-radio-button>
          <a-radio-button value="month">月能耗</a-radio-button>
          <a-radio-button value="year">年能耗</a-radio-button>
        </a-radio-group>
        日期：<a-date-picker v-model:value="date" :picker="dateType" valueFormat="YYYY-MM-DD" />
        &nbsp;
        <a-button type="primary" @click="findData">查询</a-button>

        <!-- 这里放置图表组件 -->
        <div id="chart" class="chart-placeholder"></div>
      </div>
      <!-- 图表下方的表格 -->
      <div class="table-container">
        <a-table :columns="tableColumns" :data-source="tableData" :pagination="false" bordered tableLayout="fixed"
          :scroll="{ x: 1500, y: 220 }"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
  import { findDay, findMonth, findYear, energyFlowType, energyFlowTree, test } from '../Standardized.api';
  import * as echarts from 'echarts';
  import { MenuProps, message } from 'ant-design-vue';

  const date = ref<string>();
  const chartInstance = shallowRef(null);

  const dateType = ref<string>('month');

  const current = ref<string[]>([]);
  const items = ref<MenuProps['items']>([]);
  const energyFlowTreeType = ref<any>({
    type: '',
    name: '',
  });

  const treeData = ref<any[]>([]);
  const checkedKeys = ref<{ checked: string[] | number[]; halfChecked: string[] | number[] }>({
    checked: [],
    halfChecked: [],
  });

  // 表格列配置
  const tableColumns = ref<any[]>([]);
  // 表格数据
  const tableData = ref<any[]>([]);

  const findEnergyFlowType = async () => {
    const result = await energyFlowType();
    items.value = result.map((item) => ({
      label: item.label,
      key: item.value,
    }));
    energyFlowTreeType.value.type = result[0].value;
    energyFlowTreeType.value.name = result[0].label;
    current.value.push(result[0].value);
  };

  const menuClick: MenuProps['onClick'] = ({ item }) => {
    const { key, label } = item.originItemValue;
    energyFlowTreeType.value = { type: key, name: label };
    checkedKeys.value = [];
    findTreeData();
  };
  const findTreeData = async () => {
    checkedKeys.value = {
      checked: [],
      halfChecked: [],
    };
    if (energyFlowTreeType.value.type != '') {
      treeData.value = await energyFlowTree({ type: energyFlowTreeType.value.type });
      if (treeData.value.length > 0) {
        checkedKeys.value.checked.push(treeData.value[0].id);
        findData();
      }
    }
  };

  const ragioChange = () => {
    findData();
  };

  const exportExcel = () => {
    console.log('test');
    test();
  };

  const findData = async () => {
    // 校验是否选择树节点
    if (checkedKeys.value.checked?.length === 0) {
      // 提示用户选择树节点
      message.warning('请选择计量点位');
      return;
    }
    // 校验是否选择日期
    if (date.value === '') {
      message.warning('请选择日期');
      return;
    }
    const params = {
      day: date.value,
      energyFlowDiagramIds: checkedKeys.value.checked.join(','),
    };
    var res;
    if (dateType.value === 'month') {
      res = await findMonth(params);
    } else if (dateType.value === 'year') {
      res = await findYear(params);
    } else if (dateType.value === 'date') {
      res = await findDay(params);
    } else {
      dateType.value = 'date';
      res = await findDay(params);
    }
    // 处理图表数据
    loadChart(res.chat);

    // 处理表格数据
    tableColumns.value = [];
    tableData.value = res.table.tableDataList;
    res.table.tableHeaderList.forEach((item) => {
      // 根据内容设置列宽
      let width = 100;
      if (item.label === '名称') {
        width = 150;
        item.fixed = 'left'
      }
      tableColumns.value.push({
        title: item.label,
        dataIndex: item.field,
        key: item.field,
        align: 'center',
        width: width,
      });
    });
    tableColumns.value.forEach(item => {
      if (item.title === '名称' || item.title === '合计') {
        item.fixed = 'left'
      }
    })
  };

  // 初始化图表
  const loadChart = (chart) => {
    const option = {
      tooltip: { trigger: 'axis', show: true },
      legend: {
        data: [],
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
        data: [],
      },
      yAxis: {
        type: 'value',
      },
      series: [],
    };
    option.xAxis.data = chart.xaxis;
    option.series = chart.chatSeriesList.map((item) => {
      return {
        name: item.name,
        type: 'line',
        data: item.data,
      };
    });
    option.legend.data = chart.chatSeriesList.map((item) => item.name);
    console.log('option', option);
    chartInstance.value?.clear(); // 清空图表数据
    chartInstance.value?.setOption(option);
  };

  // 监听窗口大小变化，调整图表大小
  const resizeChart = () => {
    if (chartInstance.value) {
      chartInstance.value.resize();
    }
  };

  onMounted(async () => {
    const chartDom = document.getElementById('chart');
    if (chartDom) {
      chartInstance.value = echarts.init(chartDom);
    }
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
    const day = String(lastMonth.getDate()).padStart(2, '0');
    // 设置日期为上月当前日期
    // date.value = new Date().toISOString().split('T')[0];
    date.value = `${year}-${month}-${day}`;
    await findEnergyFlowType();
    await findTreeData();
    window.addEventListener('resize', resizeChart);
  });

  // 截断文本函数
const truncateText = (text, length = 10) => {
  const maxLength = length
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

  // 组件卸载时移除事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', resizeChart);
  });
</script>

<style lang="less" scoped>
  #chart {
    width: 100%;
    height: calc(100% - 40px); // 减去日期选择器和按钮的高度
    margin-top: 16px;
  }

  .point-data-statistics {
    display: flex;
    height: calc(100vh - 180px);
    background-color: #fff;
    .metering-point-tree {
      flex: 1;
      padding-right: 24px !important;
      height: 100%;
      padding: 4px;
      background-color: #f8f8f8;
      border-right: 1px solid #e8e8e8;
    }

    .right-content {
      flex: 1;
      height: 100%;
      padding: 4px;
      width: calc(100% - 280px);

      .chart-container {
        height: 70%;
        background-color: #f8f8f8;
        border-radius: 4px;
        padding: 5px;

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
      .table-container {
        height: 30%;
      }
    }
  }
</style>
