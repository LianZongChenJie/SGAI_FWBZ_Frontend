<template>
  <div class="device-table">
    <BasicTable @register="registerTable" :pagination="pagination">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a @click="handleDetail(record)">详情</a>
            <!-- 查看按钮：排除 categoryIds 为 25、43、62 的设备 -->
            <a v-if="!excludedCategoryIds.includes(record.categoryId)" @click="handleView(record)">查看</a>
            <!-- <a @click="handleDelete(record)" style="color: red">删除</a> -->
          </a-space>
        </template>
        <template v-else-if="column.key === 'automaticAlgorithm'">
          <!-- 自动算法 -->
          <a-switch
            :checked="record.automaticAlgorithm == '1'"
            :disabled="false"
            @change="(checked) => handleAutomaticAlgorithmChange(record, checked)"
          />
        </template>
      </template>
    </BasicTable>

    <!-- 查看弹窗：图表 -->
    <a-modal
      v-model:open="viewVisible"
      :title="viewRecord?.deviceName || '设备详情'"
      width="80vw"
      :body-style="{ padding: '16px 24px' }"
      :footer="null"
      :confirm-loading="viewLoading"
      destroy-on-close
    >
      <a-spin :spinning="viewLoading">
        <!-- 自定义可滚动 Tab 条（带左右切换按钮） -->
        <div class="device-view-tab-bar">
          <button class="device-view-tab-arrow" @click="scrollViewTabs(-1)" :disabled="!canScrollLeft">
            <LeftOutlined />
          </button>
          <div ref="viewTabScrollRef" class="device-view-tab-scroll" @scroll="updateViewScrollState">
            <button
              v-for="attr in viewAttributes"
              :key="attr.label || attr.attributeName"
              :class="['device-view-tab-item', { active: activeTabKey === (attr.label || attr.attributeName) }]"
              @click="handleTabClick(attr)"
            >
              {{ attr.label || attr.attributeName }}
            </button>
          </div>
          <button class="device-view-tab-arrow" @click="scrollViewTabs(1)" :disabled="!canScrollRight">
            <RightOutlined />
          </button>
        </div>

        <!-- 图表头部：标题 + 粒度切换 + 日期选择 -->
        <div class="chart-header-bar">
          <div class="chart-header-actions">
            
            <a-range-picker
              v-model:value="dateRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              show-time
              style="width: 320px"
              @change="handleDateRangeChange"
            />
            <a-radio-group v-model:value="granularity" button-style="solid" size="small" @change="handleGranularityChange">
              <a-radio-button value="15min">分钟</a-radio-button>
              <a-radio-button value="hour">小时</a-radio-button>
              <a-radio-button value="day">天</a-radio-button>
            </a-radio-group>
          </div>
        </div>

        <!-- 折线图容器 -->
        <div class="chart-container">
          <div ref="chartRef" class="chart"></div>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, h, nextTick } from 'vue';
  import type { Ref } from 'vue';
  import echarts from '/@/utils/lib/echarts';
  import { selectDevice, updateAutomaticAlgorithm, exportData } from '../Device.api';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getDeviceAttrList } from '/@/views/bems-web/energy/operational-support/elements/acTab/index.api';
  import { buildTrendOption } from '/@/views/bems-web/energy/operational-support/elements/chartOptions';
  import { iconAreaCommon } from '/@/views/bems-web/energy/operational-support/index.api';
  import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';

  const props = defineProps<{
    categoryKeys?: string[]; // 类别树节点
    spaceKeys?: string[]; // 空间树节点
    categoryTreeData: any[];
    spaceTreeData: any[];
    searchParams?: {
      deviceName?: string;
      spaceName?: string;
      remark?: string;
      runState?: string;
    };
  }>();

  // 排除的 categoryIds：25、43、62 不渲染查看按钮
  const excludedCategoryIds = [25, 43, 62];
  
  const emit = defineEmits(['edit', 'delete', 'refresh', 'detail', 'add']);

  // 查找树节点的标题
  const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
    if (!treeData || !Array.isArray(treeData)) {
      return '';
    }

    const find = (nodes: any[]): string => {
      for (const node of nodes) {
        if (String(node.key) === String(key)) {
          return node.value;
        }
        if (node.children && Array.isArray(node.children)) {
          const title = find(node.children);
          if (title) return title;
        }
      }
      return '';
    };
    return find(treeData);
  };

  // 表格列配置
  const columns = ref<any[]>([
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      minWidth: 80,
      width: 100,
      resizable: true,
      sorter: (a, b) => a.deviceName.localeCompare(b.deviceName), // 自定义排序函数
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      minWidth: 80,
      width: 100,
      resizable: true,
      sorter: (a, b) => a.deviceCode.localeCompare(b.deviceCode), // 自定义排序函数
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: '设备类型',
      dataIndex: 'categoryId',
      key: 'categoryId',
      customRender: ({ text }) => {
        if (!text) return '';
        return findTreeNodeTitle(props.categoryTreeData, text) || text;
      },
      minWidth: 80,
      width: 100,
      resizable: true,
    },
    {
      title: '设备位置',
      dataIndex: 'spaceId',
      key: 'spaceId',
      customRender: ({ text }) => {
        if (!text) return '';
        return findTreeNodeTitle(props.spaceTreeData, text) || text;
      },
      minWidth: 80,
      width: 100,
      resizable: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      minWidth: 80,
      width: 100,
      resizable: true,
    },
    {
      title: '状态',
      dataIndex: 'runState',
      key: 'runState',
      minWidth: 80,
      width: 90,
      resizable: true,
    },
    {
      title: '最后通讯时间',
      dataIndex: 'lastGatherTime',
      key: 'lastGatherTime',
      minWidth: 120,
      width: 150,
      sorter: (a, b) => new Date(a.lastGatherTime).getTime() - new Date(b.lastGatherTime).getTime(), // 按时间戳排序
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
    },
    
  ]);

  // 表格数据
  const dataSource = ref([]);
  const total = ref<number>(0);

  // 分页配置
  const pagination = ref({
    pageSize: 10,
    showSizeChanger: true,
  });

  // 自动算法切换
  const handleAutomaticAlgorithmChange = (record: any, checked: boolean) => {
    try {
      const params = {
        id: record.id,
        automaticAlgorithm: checked ? '1' : '0',
      };
      updateAutomaticAlgorithm(params);
      record.automaticAlgorithm = checked ? '1' : '0';
    } catch (error) {
      record.automaticAlgorithm = checked ? '0' : '1';
      console.error('自动算法切换失败:', error);
    }
  };

  // 加载数据
  const loadData = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    try {
      const sp = props.searchParams || {};
      const params = {
        pageNo: pageNo,
        pageSize: pageSize,
        deviceName: sp.deviceName || undefined,
        spaceName: sp.spaceName || undefined,
        remark: sp.remark || undefined,
        runState: sp.runState || undefined,
        categoryIds: props.categoryKeys ? props.categoryKeys.join(',') : undefined,
        spaceIds: props.spaceKeys ? props.spaceKeys.join(',') : undefined,
      };
      const res = await selectDevice(params);
      // 返回格式必须包含records和total
      return {
        records: res.records, // 当前页数据
        total: res.total, // 总记录数
      };
      // return dataSource.value;
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  async function customResetFunc() {
    // 重置由父组件控制
  }

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      api: loadData,
      columns: columns,
      showActionColumn: false,
      showIndexColumn: true,
      bordered: false,
      canResize: false,
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
      showTableSetting: false,
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm }] = tableContext;

  // 监听选中节点变化，确保有值后再请求
  watch(
    () => props.categoryKeys,
    (newVal) => {
      if (newVal && newVal.length > 0) {
        reload();
      }
    }
  );
  watch(
    () => props.spaceKeys,
    (newVal) => {
      if (newVal && newVal.length > 0) {
        reload();
      }
    }
  );

  // 初始加载
  onMounted(() => {
    // loadData();
  });

  // 操作方法
  const handleEdit = (record: any) => {
    emit('edit', record);
    reload();
  };

  const handleDelete = (record: any) => {
    emit('delete', record);
    reload();
  };

  const handleDetail = (record: any) => {
    emit('detail', record);
  };

  const handleCreated = () => {
    emit('add');
    reload();
  };

  const handleExport = async () => {
    const sp = props.searchParams || {};
    let res = await exportData({
      deviceName: sp.deviceName || undefined,
      spaceName: sp.spaceName || undefined,
      remark: sp.remark || undefined,
      runState: sp.runState || undefined,
      categoryIds: props.categoryKeys ? props.categoryKeys.join(',') : undefined,
      spaceIds: props.spaceKeys ? props.spaceKeys.join(',') : undefined,
      deviceType: '1',
    });
    let name = '仪表台账';
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xlsx';
    let url = window.URL.createObjectURL(new Blob([res], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
  };

  /* ============== 查看弹窗相关 ============== */
  const viewVisible = ref(false);
  const viewLoading = ref(false);
  const viewRecord = ref<any>(null);
  const viewAttributes = ref<any[]>([]);
  const activeTabKey = ref<string>('');
  // 图表容器和实例（单一图表模式）
  const chartRef = ref<HTMLDivElement>();
  let chartInstance: echarts.ECharts | null = null;

  // Tab 滚动相关
  const viewTabScrollRef = ref<HTMLDivElement>();
  const canScrollLeft = ref(false);
  const canScrollRight = ref(false);

  // 粒度选择：15min/hour/day，默认 hour
  const granularity = ref<string>('hour');
  // 日期区间选择：[startTime, endTime]，默认不选择
  const dateRange = ref<[string, string] | []>([]);

  /** 查看按钮点击 */
  const handleView = async (record: any) => {
    viewRecord.value = record;
    viewVisible.value = true;
    viewLoading.value = true;
    viewAttributes.value = [];
    activeTabKey.value = '';
    // 重置筛选条件
    granularity.value = 'hour';
    dateRange.value = [];
    // 清除旧的图表实例
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }

    try {
      const res = await getDeviceAttrList({ deviceId: record.id });
      const list = res?.records || res?.data || res || [];
      viewAttributes.value = Array.isArray(list) ? list : [];
      // 默认选中第一个 tab
      if (viewAttributes.value.length > 0) {
        const firstAttr = viewAttributes.value[0];
        const tabKey = firstAttr.label || firstAttr.attributeName;
        activeTabKey.value = tabKey;
        // 使用 nextTick 渲染第一个 tab 的图表，等待 DOM 更新
        nextTick(() => {
          renderChart(firstAttr);
        });
      }
      // 更新滚动状态
      nextTick(() => updateViewScrollState());
    } catch (e) {
      console.error('查询设备属性失败:', e);
      viewAttributes.value = [];
    } finally {
      viewLoading.value = false;
    }
  };

  /** Tab 点击 */
  const handleTabClick = (attr: any) => {
    const key = attr.label || attr.attributeName;
    activeTabKey.value = key;
    renderChart(attr);
  };

  /** 滚动 view tab 条 */
  const scrollViewTabs = (direction: number) => {
    const el = viewTabScrollRef.value;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  /** 更新箭头可用状态 */
  const updateViewScrollState = () => {
    const el = viewTabScrollRef.value;
    if (!el) return;
    canScrollLeft.value = el.scrollLeft > 0;
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  };

  /** 粒度变化 */
  const handleGranularityChange = () => {
    const attr = viewAttributes.value.find(
      (item) => (item.label || item.attributeName) === activeTabKey.value
    );
    if (attr) {
      renderChart(attr);
    }
  };

  /** 日期区间变化 */
  const handleDateRangeChange = () => {
    const attr = viewAttributes.value.find(
      (item) => (item.label || item.attributeName) === activeTabKey.value
    );
    if (attr) {
      renderChart(attr);
    }
  };

  /** 渲染折线图 */
  const renderChart = async (attr: any) => {
    const container = chartRef.value;
    if (!container) return;

    try {
      // 获取或创建图表实例
      if (!chartInstance) {
        chartInstance = echarts.init(container);
      }

      // 构建入参
      const params: any = {
        deviceIds: String(viewRecord.value.id),
        attributeName: attr.label || attr.attributeName,
        granularity: granularity.value,
      };
      // 添加日期区间参数
      if (dateRange.value && dateRange.value.length === 2) {
        params.startTime = dateRange.value[0];
        params.endTime = dateRange.value[1];
      }

      const res = await iconAreaCommon(params) as any;
      const data = res?.data || res || {};
      const xaxis = data.xaxis || data.xAxis || data.timeList || [];
      const series = (data.chatSeriesList || data.seriesList || data.series || []).filter((s: any) => s.name !== '合计');

      if (!xaxis.length || !series.length) {
        chartInstance.clear();
        return;
      }

      // 不传单位，去掉 ppm 等后缀
      const option = buildTrendOption(xaxis, series, '', true);
      chartInstance.setOption(option, true);
    } catch (error) {
      console.error('加载图表数据失败:', error);
    }
  };

  // 暴露 reload 方法给父组件
  defineExpose({
    reload: (opt?: any) => {
      reload(opt);
    },
  });
</script>

<style lang="less" scoped>
  .device-table {
    :deep(.jeecg-basic-table .ant-table-wrapper) {
      margin-top: 0 !important;
    }

    :deep(.ant-table-wrapper) {
      padding: 0;
      background-color: transparent;
      border-radius: 0;
      overflow: visible;
    }

    :deep(.ant-table-container) {
      overflow: visible;
    }

    :deep(.ant-table-header) {
      position: relative;
    }

    :deep(.ant-pagination) {
      margin: 15px 0 0;
    }
  }

  .attr-detail {
    margin-bottom: 16px;
  }

  .chart-container {
    width: 100%;
    min-height: 450px;
  }

  .chart {
    width: 100%;
    height: 450px;
  }

  /* 查看弹窗 - 自定义可滚动 Tab 条 */
  .device-view-tab-bar {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    position: relative;
  }

  .device-view-tab-arrow {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      color: #1677ff;
      border-color: #1677ff;
    }

    &:disabled {
      color: #d9d9d9;
      cursor: not-allowed;
    }
  }

  .device-view-tab-scroll {
    flex: 1;
    overflow-x: auto;
    display: flex;
    align-items: center;
    gap: 0;
    scrollbar-width: none; /* Firefox */
    padding: 0 4px;

    &::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }
  }

  .device-view-tab-item {
    flex-shrink: 0;
    padding: 6px 14px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      color: #1677ff;
    }

    &.active {
      color: #1677ff;
      border-bottom-color: #1677ff;
      font-weight: 500;
    }
  }

  /* 图表头部操作栏 */
  .chart-header-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;
    padding: 0;

    .chart-header-title {
      font-size: 15px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }

    .chart-header-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      :deep(.ant-radio-button-wrapper) {
        color: #595959;
        height: 32px;
        line-height: 30px;
      }

      :deep(.ant-radio-button-wrapper-checked) {
        color: #fff;
        background-color: #1890ff;
        border-color: #1890ff;
      }

      :deep(.ant-picker) {
        height: 32px;
      }
    }
  }

  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    background: #fafafa;
    border-radius: 4px;

    .chart-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .chart-placeholder-text {
      color: #999;
      font-size: 14px;
    }
  }
</style>
