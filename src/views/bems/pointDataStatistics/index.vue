<template>
  <a-menu
    v-model:selectedKeys="current"
    mode="horizontal"
    :items="items"
    @click="menuClick"
    style="justify-content: center"
  />
  <div class="point-data-statistics">
    <div class="metering-point-tree">
      <div class="cascade-box">
        是否级联：
        <a-switch
          v-model:checked="isCascade"
          checked-children="是"
          un-checked-children="否"
          @change="cascadeTypeChange"
        />
      </div>
      <a-tree
        v-model:checkedKeys="checkedKeys"
        :tree-data="treeData"
        checkable
        :default-expand-all="true"
        :field-names="{ title: 'nodeName', key: 'id' }"
        :checkStrictly="true"
        @check="handleTreeCheck"
      />
    </div>
    <div class="right-content">
      <div class="chart-container">
        <a-radio-group
          v-model:value="dateType"
          button-style="solid"
          @change="ragioChange"
        >
          <!-- <a-radio-button value="hour">时能耗</a-radio-button> -->
          <a-radio-button value="date">日能耗</a-radio-button>
          <a-radio-button value="month">月能耗</a-radio-button>
          <a-radio-button value="year">年能耗</a-radio-button>
        </a-radio-group>

        <template v-if="dateType !== 'hour'">
          &emsp;
          日期：<a-date-picker
            v-model:value="date"
            :picker="dateType"
            valueFormat="YYYY-MM-DD"
          />
        </template>
        <template v-else>
          &emsp;
          开始时间：
          <a-date-picker
            v-model:value="time"
            @ok="handleTimeChange"
            valueFormat="YYYY-MM-DD HH"
            :showTime="showTime"
          />
          &emsp;
          ——
          &emsp;
          结束时间：{{ lastTime }}
        </template>
        &nbsp;
        <a-button
          type="primary"
          @click="findData"
        >查询</a-button>
        <!-- &nbsp;
        <a-button
          type="primary"
          :icon="h(VerticalAlignBottomOutlined )"
          @click="handleExport"
        >导出</a-button> -->

        <div class="switch-box">
          <a-radio-group
            v-model:value="isLine"
            @change="chartTypeChange"
          >
            <a-radio-button value="line">
              <LineChartOutlined style="font-size: 18px;" />
            </a-radio-button>
            <a-radio-button value="bar">
              <BarChartOutlined style="font-size: 18px;" />
            </a-radio-button>
          </a-radio-group>
          <!-- <a-switch
            v-model:checked="isLine"
            checked-children="折线图"
            un-checked-children="柱状图"
            @change="chartTypeChange"
          /> -->

        </div>
        <div
          id="chart"
          class="chart-placeholder"
        ></div>
      </div>
      <div class="table-container">
        <a-table
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="false"
          bordered
          tableLayout="fixed"
          :scroll="{ x: 1500, y: 180 }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, shallowRef, h } from 'vue';
import { findHour, findDay, findMonth, findYear, energyFlowType, energyFlowTree, test } from './index.api';
import * as echarts from 'echarts';
import { MenuProps, message } from 'ant-design-vue';
import { VerticalAlignBottomOutlined, LineChartOutlined, BarChartOutlined } from '@ant-design/icons-vue';
// import { exportExcel, exportTableToExcel } from '@/utils/export';

const date = ref<string>();
const time = ref<string>();
const lastTime = ref<string>();
const chartInstance: any = shallowRef(null);

const dateType = ref<string>('month');

const current = ref<string[]>([]);
const items = ref<MenuProps['items']>([]);
const energyFlowTreeType = ref<any>({
  type: '',
  name: '',
});

const showTime = ref({
  format: 'HH',
  hourStep: 1,
});

const treeData = ref<any[]>([]);
const checkedKeys = ref<any>([]);

const isLine = ref('line');
const isCascade = ref<boolean>(false);

// 表格列配置
const tableColumns = ref<any[]>([]);
// 表格数据
const tableData = ref<any[]>([]);

const tableHeaders = ref<any[]>([]);

const excelName = ref('');

const findEnergyFlowType = async () => {
  const result = await energyFlowType();
  items.value = result.map((item) => ({
    label: item.label,
    key: item.value,
  }));
  energyFlowTreeType.value.type = result[0].value;
  energyFlowTreeType.value.name = result[0].label;
  current.value.push(result[0].value);
  const target = items.value?.find((item) => (item as any).key === current.value[0]);
  excelName.value = target.label;
};

const menuClick: MenuProps['onClick'] = ({ item }) => {
  const { key, label } = item.originItemValue;
  excelName.value = label;
  energyFlowTreeType.value = { type: key, name: label };
  checkedKeys.value = [];
  findTreeData();
};

const findTreeData = async () => {
  checkedKeys.value = [];
  if (energyFlowTreeType.value.type != '') {
    treeData.value = await energyFlowTree({ type: energyFlowTreeType.value.type });
    if (treeData.value.length > 0) {
      if (isCascade.value) {
        // 级联模式：选中第一个节点及其所有后代
        const idArr = getNodeAndDescendantIds(treeData.value, treeData.value[0].id);
        checkedKeys.value.push(...idArr);
      } else {
        // 非级联模式：只选中第一个节点
        checkedKeys.value.push(treeData.value[0].id);
      }
      findData();
    }
  }
};

// 递归获取节点及其所有后代ID
const getNodeAndDescendantIds = (treeData: any[], targetId: string | number): (string | number)[] => {
  const resultIds: (string | number)[] = [];

  const findAndCollect = (nodes: any[], targetId: string | number): boolean => {
    for (const node of nodes) {
      if (node.id === targetId) {
        // 找到目标节点，收集它及其后代
        collectIds(node);
        return true;
      }

      if (node.children && node.children.length > 0) {
        if (findAndCollect(node.children, targetId)) {
          return true;
        }
      }
    }
    return false;
  };

  const collectIds = (node: any) => {
    resultIds.push(node.id);

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        // collectIds(child);
        resultIds.push(child.id);
      }
    }
  };

  findAndCollect(treeData, targetId);
  return resultIds;
};

// 树节点勾选事件处理
const handleTreeCheck = (checkedKeysParam: any, { node, checked }: any) => {
  if (isCascade.value) {
    // 级联模式
    if (checked) {
      // 勾选节点及其所有后代
      const idArr = getNodeAndDescendantIds(treeData.value, node.id);
      checkedKeys.value = Array.from(new Set([...checkedKeys.value.checked, ...idArr]));
    } else {
      // 取消勾选节点及其所有后代
      const idArr = getNodeAndDescendantIds(treeData.value, node.id);
      checkedKeys.value = checkedKeys.value.checked.filter((key: any) => !idArr.includes(key));
    }
  } else {
    console.log('checked-------------->', checked, checkedKeys.value);

    // 非级联模式：单选
    if (checked) {
      // 勾选当前节点，清空其他选择
      // checkedKeys.value.checked.push(node.id)
    } else {
      checkedKeys.value.checked.findIndex((item) => item === node.id);
      checkedKeys.value.checked = checkedKeys.value.checked.filter((item) => item !== node.id);
      // 如果取消勾选当前节点，清空所有选择
      // checkedKeys.value = [];
    }
  }
};

const ragioChange = () => {
  findData();
};

const findData = async () => {
  // 根据不同的级联模式获取选中的keys
  let selectedKeys = [];
  if (isCascade.value) {
    // 级联模式：checkedKeys是数组
    selectedKeys = checkedKeys.value;
  } else {
    // 非级联模式：checkedKeys可能是数组
    selectedKeys = Array.isArray(checkedKeys.value) ? checkedKeys.value : Array.isArray(checkedKeys.value.checked) ? checkedKeys.value.checked : [];
  }

  // 校验是否选择树节点
  if (selectedKeys.length === 0) {
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
    energyFlowDiagramIds: selectedKeys.join(','),
  };

  var res;
  if (dateType.value === 'month') {
    res = await findMonth(params);
  } else if (dateType.value === 'year') {
    res = await findYear(params);
  } else if (dateType.value === 'date') {
    res = await findDay(params);
  } else {
    dateType.value = 'hour';
    if ((time.value as string).length < 15) time.value = time.value + ':00:00';
    res = await findHour({
      hour: time.value,
      energyFlowDiagramIds: selectedKeys.join(','),
    });
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
    }
    tableColumns.value.push({
      title: item.label,
      dataIndex: item.field,
      key: item.field,
      align: 'center',
      width: width,
    });
  });

  tableHeaders.value = tableColumns.value.map((item) => {
    return {
      key: item.key,
      title: item.title,
    };
  });

  tableColumns.value.forEach((item) => {
    if (item.title === '名称' || item.title === '合计') {
      item.fixed = 'left';
    }
  });
};

const chartType = ref<string>('line');

// 初始化图表
const loadChart = (chart) => {
  const option = {
    tooltip: { trigger: 'axis', show: true },
    legend: {
      type: 'scroll',
      data: [],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: [],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        margin: 15, // 增加轴标签与轴线之间的距离
        overflow: 'truncate', // 过长时截断，或设置为'break'换行
      },
    },
    series: [],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        bottom: 50,
        height: 20,
        start: 0,
        end: 50, // 初始显示50%数据
        maxValueSpan: 15,
      },
    ],
  };
  option.xAxis.data = chart.xaxis;
  chart.chatSeriesList.pop();
  option.series = chart.chatSeriesList.map((item) => {
    return {
      name: item.name,
      type: chartType.value,
      data: item.data,
      barWidth: '20px',
    };
  });
  option.legend.data = chart.chatSeriesList.map((item) => item.name);
  console.log('option', option);
  chartInstance.value?.clear();
  chartInstance.value?.setOption(option);
};

// 监听窗口大小变化，调整图表大小
const resizeChart = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

// 选择时间
const handleTimeChange = (dates) => {
  dates = dates + ':00:00';
  const timestamp = new Date(dates.replace(/-/g, '/')).getTime() + 60 * 60 * 1000;
  lastTime.value = formatTime(timestamp);
};

// const handleExport = async () => {
//   exportExcel({
//     tableData: tableData.value,
//     headers: tableHeaders.value,
//     fileName: excelName.value,
//   });
// };

onMounted(async () => {
  const chartDom = document.getElementById('chart');
  if (chartDom) {
    chartInstance.value = echarts.init(chartDom);
  }

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const year = lastMonth.getFullYear();
  const month = String(lastMonth.getMonth() + 2).padStart(2, '0');
  const day = String(lastMonth.getDate()).padStart(2, '0');
  date.value = `${year}-${month}-${day}`;

  await findEnergyFlowType();
  await findTreeData();
  window.addEventListener('resize', resizeChart);

  const now2 = new Date();
  const year2 = now2.getFullYear();
  const month2 = String(now2.getMonth() + 1).padStart(2, '0');
  const day2 = String(now2.getDate()).padStart(2, '0');
  const hours = String(now2.getHours()).padStart(2, '0');
  const minutes = String(now2.getMinutes()).padStart(2, '0');
  const seconds = String(now2.getSeconds()).padStart(2, '0');

  lastTime.value = `${year2}-${month2}-${day2} ${hours}:${minutes}:${seconds}`;
  const timestamp = new Date(lastTime.value.replace(/-/g, '/')).getTime() - 60 * 60 * 1000;

  time.value = formatTime(timestamp);
});

// 毫秒数转换为日期
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const chartTypeChange = (val) => {
  if (val.target.value === 'line') {
    chartType.value = 'line';
  } else {
    chartType.value = 'bar';
  }
  if (tableData.value.length > 0) {
    findData();
  }
};

const cascadeTypeChange = async () => {
  // 清空之前的选择项
  checkedKeys.value = [];

  // 重新初始化选择
  if (treeData.value.length > 0) {
    if (isCascade.value) {
      // 级联模式：选中第一个节点及其所有后代
      const idArr = getNodeAndDescendantIds(treeData.value, treeData.value[0].id);
      checkedKeys.value.push(...idArr);
    } else {
      // 非级联模式：只选中第一个节点
      checkedKeys.value.push(treeData.value[0].id);
    }

    // 重新查询数据
    await findData();
  }
};

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
});
</script>

<style lang="less" scoped>
#chart {
  width: 100%;
  height: calc(100% - 40px);
  margin-top: 16px;
}

.point-data-statistics {
  display: flex;
  height: calc(100vh - 180px);
  background-color: #fff;
  .metering-point-tree {
    width: 280px;
    height: 100%;
    padding: 4px;
    background-color: #f8f8f8;
    border-right: 1px solid #e8e8e8;
    overflow: auto;

    .cascade-box {
      display: flex;
      height: 40px;
      width: 100%;
      align-items: center;
      justify-content: flex-start;
    }
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
        height: calc(100% - 30px);
        color: #999;
        font-size: 16px;
        background-color: #fff;
        border: 1px dashed #e8e8e8;
        border-radius: 4px;
      }

      .switch-box {
        display: flex;
        justify-content: flex-end;
        padding-right: 12px;
        width: 100%;
      }
    }
    .table-container {
      height: 30%;
    }
  }
}
</style>