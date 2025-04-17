<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="menuClick" style="justify-content: center" />
  <!-- 日能耗、月能耗、年能耗 -->
  <a-radio-group v-model:value="dateRangeType" button-style="solid" @change="radioChange">
    <a-radio-button v-for="item in dateRangeTypeList" :key="item.value" :value="item.value">{{ item.label }}</a-radio-button>
  </a-radio-group>
  日期：<a-date-picker v-model:value="date" :picker="dateRangeType" valueFormat="YYYY-MM-DD" />
  &nbsp;
  <a-button type="primary" @click="getEnergyDiagramList">查询</a-button>
  &nbsp;
  <a-radio-group v-model:value="chartType" name="radioGroup">
    <a-radio value="1">桑基图</a-radio>
    <a-radio value="2">能流图</a-radio>
  </a-radio-group>
  <div class="energy-flow" v-show="chartType === '1' || chartType === ''" ref="sanchitou"> </div>
  <div class="energy-flow" v-show="chartType === '2' || chartType === ''" ref="jsmindContainer"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import 'jsmind/style/jsmind.css';
  import JsMind from 'jsmind';
  import { energyFlowType, findDay, findMonth, findYear } from './index.api';
  import { MenuProps } from 'ant-design-vue';
  import * as echarts from 'echarts/core';
  import { TitleComponent, TooltipComponent } from 'echarts/components';
  import { SankeyChart } from 'echarts/charts';
  import { CanvasRenderer } from 'echarts/renderers';

  echarts.use([TitleComponent, TooltipComponent, SankeyChart, CanvasRenderer]);

  const jsmindContainer = ref<HTMLDivElement | null>(null);

  let jm: any = null;
  const energyFlowTreeType = ref<any>({
    type: '',
    name: '',
  });
  const data = ref<any>();
  const current = ref<string[]>([]);
  const items = ref<MenuProps['items']>([]);
  const dateRangeType = ref('date');
  const dateRangeTypeList = ref([
    {
      label: '日能耗',
      value: 'date',
    },
    {
      label: '月能耗',
      value: 'month',
    },
    {
      label: '年能耗',
      value: 'year',
    },
  ]);
  const date = ref<string>('');
  const chartType = ref<string>('');

  let chart: echarts.ECharts | null = null;
  const sanchitou = ref<HTMLDivElement | null>(null);
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
    getEnergyDiagramList();
  };
  const radioChange = () => {
    getEnergyDiagramList();
  };

  const getEnergyDiagramList = async () => {
    const params = {
      type: energyFlowTreeType.value.type,
      date: date.value,
    };

    if (dateRangeType.value === 'date') {
      data.value = await findDay(params);
    } else if (dateRangeType.value === 'month') {
      data.value = await findMonth(params);
    } else if (dateRangeType.value === 'year') {
      data.value = await findYear(params);
    } else {
      dateRangeType.value = 'date';
      data.value = await findDay(params);
    }
    loadingMind();
    loadingSanchitou();
  };

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
    data.value.forEach((item) => {
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

  const getNodeLingStyle = (node) => {
    // 判断字符串中包含损耗
    if (node.nodeName.includes('损')) {
      return { color: '#F70000', opacity: 1 };
    }
  };

  const loadingMind = () => {
    if (jm) {
      (jsmindContainer.value as HTMLDivElement).innerHTML = '';
      jm = null;
    }
    nextTick(() => {
      jm = new JsMind({
        container: jsmindContainer.value, //渲染的体
        editable: false, //是否可以编辑
        // theme: 'red', //主题色
        enable_drag_and_drop: false, // 禁用节点的拖拽（包括折叠功能）
        // support_html : true,    // 是否支持节点里的HTML元素，如数据中topic 的html属性
        view: {
          draggable: false, // 当容器不能完全容纳思维导图时，是否允许拖动画布代替鼠标滚动
          line_style: 'curved', /// 思维导图线条的样式，直线(straight)或者曲线(curved)
        },
        layout: {
          pspace: 0, // 节点与连接线之间的水平间距（用于容纳节点收缩/展开控制器）
        },
        default_event_handle: {
          select_node: (node: any) => {
            console.log('Selected node:', node);
            node.selected = true;
          },
        },
      });
      window.addEventListener('resize', handleResize);
    });
    const mind = {
      meta: {
        name: 'Example',
      },
      format: 'node_array',
      data: [],
    };
    data.value.forEach((item: any) => {
      if (item.parentId === 0) {
        mind.data.push({
          id: item.id + '',
          isroot: true,
          topic: `${item.nodeName}<br>用电量：${item.value}kwh`,
        });
      } else {
        mind.data.push({
          id: item.id + '',
          parentid: item.parentId + '',
          topic: `${item.nodeName}<br>用电量：${item.value}kwh`,
        });
      }
    });
    nextTick(() => {
      jm.show(mind);
    });
  };

  const handleResize = () => {
    if (jm) {
      jm.resize();
    }
  };

  onMounted(async () => {
    if (jsmindContainer.value) {
      console.log('jsmindContainer:', jsmindContainer.value); // Check jsmindContainer value

      // Initialize jsMind
    } else {
      console.error('jsmindContainer is null'); // Log an error if jsmindContainer is null
    }
    if (sanchitou.value) {
      chart = echarts.init(sanchitou.value);
    }
    chartType.value = '1';
    date.value = new Date().toISOString().split('T')[0];

    await findEnergyFlowType();
    await getEnergyDiagramList();
  });
</script>

<style lang="less" scoped>
  .energy-flow {
    width: 100%;
    height: calc(100% - 80px);
    /* Optional styles */
    /* 隐藏所有节点的折叠图标 */
    jmexpander {
      display: none !important;
    }
    jmnode {
      border: 1px solid #666;
    }
    .selected {
      background-color: #fff !important;
      color: #000 !important;
    }
  }
</style>
