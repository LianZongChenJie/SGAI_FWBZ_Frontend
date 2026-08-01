<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="menuClick" style="justify-content: center; display: none" />
  <div class="point-data-statistics">
    <div class="metering-point-tree">
      <div class="cascade-box">
        是否级联：
        <a-switch v-model:checked="isCascade" checked-children="是" un-checked-children="否" @change="cascadeTypeChange" />
      </div>
      <a-tree
        v-model:checkedKeys="checkedKeys"
        :tree-data="treeData"
        checkable
        :default-expand-all="true"
        :field-names="{ title: 'title', key: 'key' }"
        :checkStrictly="true"
        @check="handleTreeCheck"
      >
        <template #title="{ title, key, dataRef }">
          <a-popover>
            <template #content>
              {{ title }}
            </template>
            <span class="truncated-text">
              {{ current[0] === 'specialty' ? truncateText(title, 17) : truncateText(title, 10) }}
            </span>
          </a-popover>
        </template>
      </a-tree>
    </div>
    <div class="right-content">
      <div class="switch-box">
        <a-button
          :class="['chart-type-btn',{ active: isLine === 'line' }]"
          @click="switchChartType('line')"
        >
          📈折线图
        </a-button>
        <a-button
          :class="['chart-type-btn', { active: isLine === 'bar' }]"
          @click="switchChartType('bar')"
        >
          📊柱状图
        </a-button>
        <a-button
          :class="['chart-type-btn', { active: isLine === 'table' }]"
          @click="switchChartType('table')"
        >
          📋表格
        </a-button>
      </div>
      <div class="chart-container">
        <div v-show="isLine === 'table'" class="table-box">
          <a-table :columns="tableColumns" :data-source="tableData" :pagination="false" bordered tableLayout="fixed" :scroll="{ x: 1500, y: 650 }" />
        </div>
        <div v-show="isLine !== 'table'" id="chart" class="chart-placeholder"></div>
      </div>
      <!-- <div v-show="isLine !== 'table'" class="table-container">
        <a-table :columns="tableColumns" :data-source="tableData" :pagination="false" bordered tableLayout="fixed"
          :scroll="{ x: 1500, y: 180 }" />
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, ref, shallowRef, computed, watch } from 'vue';
  import { findHour, findDay, findMonth, findYear, energyFlowType, energyFlowTree } from './index.api';
  import * as echarts from 'echarts';
  import { MenuProps, message } from 'ant-design-vue';
  import { LineChartOutlined, BarChartOutlined, InsertRowAboveOutlined } from '@ant-design/icons-vue';
  import { exportExcel } from '@/utils/export';

  const props = defineProps<{
    dateType?: string
    date?: string
    time?: string
  }>()

  const emit = defineEmits(['update:dateType', 'update:date', 'update:time'])

  const dateType = computed({
    get: () => props.dateType ?? 'month',
    set: (val) => emit('update:dateType', val),
  })
  const date = computed({
    get: () => props.date ?? '',
    set: (val) => emit('update:date', val),
  })
  const time = computed({
    get: () => props.time ?? '',
    set: (val) => emit('update:time', val),
  })

  const lastTime = ref<string>();
  const chartInstance: any = shallowRef(null);

  const current = ref<string[]>([]);
  const items = ref<MenuProps['items']>([]);
  const energyFlowTreeType = ref<any>({
    type: '',
    name: '',
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
          // 级联模式：选中第一个节点及其直接子节点
          const idArr = getNodeAndChildrenIds(treeData.value, treeData.value[0].key);
          checkedKeys.value.push(...idArr);
        } else {
          // 非级联模式：只选中第一个节点
          checkedKeys.value.push(treeData.value[0].key);
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
        if (node.key === targetId) {
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
      resultIds.push(node.key);

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          collectIds(child);
        }
      }
    };

    findAndCollect(treeData, targetId);
    return resultIds;
  };

  // 获取节点及其直接子节点ID
  const getNodeAndChildrenIds = (treeData: any[], targetId: string | number): (string | number)[] => {
    const resultIds: (string | number)[] = [];

    const findAndCollect = (nodes: any[], targetId: string | number): boolean => {
      for (const node of nodes) {
        if (node.key === targetId) {
          // 找到目标节点，收集它及其直接子节点
          resultIds.push(node.key);
          if (node.children && node.children.length > 0) {
            for (const child of node.children) {
              resultIds.push(child.key);
            }
          }
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

    findAndCollect(treeData, targetId);
    return resultIds;
  };

  // 树节点勾选事件处理
  const handleTreeCheck = (checkedKeysParam: any, { node, checked }: any) => {
    if (isCascade.value) {
      // 级联模式
      if (checked) {
        // 勾选节点及其直接子节点
        const idArr = getNodeAndChildrenIds(treeData.value, node.key);
        checkedKeys.value = Array.from(new Set([...checkedKeys.value.checked, ...idArr]));
      } else {
        // 取消勾选节点及其直接子节点
        const idArr = getNodeAndChildrenIds(treeData.value, node.key);
        checkedKeys.value = checkedKeys.value.checked.filter((key: any) => !idArr.includes(key));
      }
    } else {
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
      // console.log('sort-------tableHeaderList-------->', item, tableData.value)
      // 根据内容设置列宽
      let width = 100;
      if (item.label === '名称') {
        width = 150;
      }
      if (isWeekend(item.field)) {
        tableColumns.value.push({
          title: item.label,
          dataIndex: item.field,
          sorter: (a, b) => {
            if (item.field === 'name') {
              return a[item.field].localeCompare(b[item.field]);
            } else {
              return a[item.field] - b[item.field];
            }
          }, // 自定义排序函数
          key: item.field,
          align: 'center',
          width: width,
          customCell: () => {
            return {
              style: {
                'background-color': '#1890ff',
                // 可以添加其他样式
              },
            };
          },
        });
      } else {
        tableColumns.value.push({
          title: item.label,
          dataIndex: item.field,
          sorter: (a, b) => {
            if (item.field === 'name') {
              return a[item.field].localeCompare(b[item.field]);
            } else {
              return a[item.field] - b[item.field];
            }
          }, // 自定义排序函数
          key: item.field,
          align: 'center',
          width: width,
        });
      }
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

  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6; // 0=周日, 6=周六
  };

  const chartType = ref<string>('line');

  // 切换图表类型
  const switchChartType = (type: string) => {
    isLine.value = type;
    if (type === 'line') {
      chartType.value = 'line';
    } else {
      chartType.value = 'bar';
    }
    if (tableData.value.length > 0) {
      findData();
    }
  };

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
      // dataZoom: [
      //   {
      //     type: 'slider',
      //     show: true,
      //     xAxisIndex: 0,
      //     bottom: 50,
      //     height: 20,
      //     start: 0,
      //     end: 50, // 初始显示50%数据
      //     maxValueSpan: 15,
      //   },
      // ],
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

  const handleExport = async () => {
    exportExcel({
      tableData: tableData.value,
      headers: tableHeaders.value,
      fileName: excelName.value,
    });
  };

  defineExpose({ findData, handleExport })

  // 日期类型切换时自动查询（与 BEMS 原版 ragioChange 逻辑一致）
  watch(dateType, () => {
    findData()
  })

  onMounted(async () => {
    const chartDom = document.getElementById('chart');
    if (chartDom) {
      chartInstance.value = echarts.init(chartDom);
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;
    emit('update:date', defaultDate);

    await findEnergyFlowType();
    await findTreeData();
    window.addEventListener('resize', resizeChart);

    // 监听目标元素
    const targetDiv = document.getElementById('chart');
    if (targetDiv) {
      resizeObserver.observe(targetDiv);
    }

    const now2 = new Date();
    const year2 = now2.getFullYear();
    const month2 = String(now2.getMonth() + 1).padStart(2, '0');
    const day2 = String(now2.getDate()).padStart(2, '0');
    const hours = String(now2.getHours()).padStart(2, '0');
    const minutes = String(now2.getMinutes()).padStart(2, '0');
    const seconds = String(now2.getSeconds()).padStart(2, '0');

    lastTime.value = `${year2}-${month2}-${day2} ${hours}:${minutes}:${seconds}`;
    const timestamp = new Date(lastTime.value.replace(/-/g, '/')).getTime() - 60 * 60 * 1000;

    emit('update:time', formatTime(timestamp));
  });

  // 创建一个ResizeObserver实例
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // entry.target 是监听的目标元素
      const { width, height } = entry.contentRect;
      resizeChart();
      // 获取更多尺寸信息
      const { offsetWidth, offsetHeight, clientWidth, clientHeight } = entry.target;

      // 触发自定义事件
      const event = new CustomEvent('sizechange', {
        detail: { width, height },
      });
      entry.target.dispatchEvent(event);
    }
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
        // 级联模式：选中第一个节点及其直接子节点
        const idArr = getNodeAndChildrenIds(treeData.value, treeData.value[0].key);
        console.log('idArr', idArr);
        checkedKeys.value.push(...idArr);
      } else {
        // 非级联模式：只选中第一个节点
        checkedKeys.value.push(treeData.value[0].key);
      }

      // 重新查询数据
      await findData();
    }
  };

  // 截断文本函数
  const truncateText = (text, length = 10) => {
    const maxLength = length;
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  // 组件卸载时移除事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', resizeChart);
  });
</script>

<style lang="less" scoped>
  #chart {
    width: 100%;
    height: 100%;
  }

  .point-data-statistics {
    display: flex;
    height: calc(100vh - 270px);

    .metering-point-tree {
      flex: 0 0 240px;
      min-width: 200px;
      height: 100%;
      padding: 12px;
      border-right: 1px solid #f0f0f0;

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
      min-width: 0;

      .switch-box {
        display: flex;
        justify-content: flex-end;
        padding-right: 12px;
        padding-bottom: 8px;
        gap: 10px;
        width: 100%;

        .chart-type-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          font-size: 14px;
          color: #595959;
          background-color: #fff;
          border: 1px solid #d9d9d9;
          border-radius: 4px;

          &.active {
            color: #1890ff;
            border-color: #1890ff;
            background-color: #e6f7ff;
          }
        }
      }

      .chart-container {
        height: calc(100% - 48px);
        background-color: #f7f9fc;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        overflow: hidden;

        .chart-placeholder {
          width: 100%;
          height: 100%;
        }

        .table-box {
          height: 90%;
        }
      }

      .table-container {
        height: 30%;
      }
    }
  }

  :deep(.ant-tree-node-content-wrapper) {
    white-space: nowrap;
  }
</style>