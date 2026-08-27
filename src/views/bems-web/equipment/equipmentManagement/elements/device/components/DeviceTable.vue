<template>
  <div class="device-table">
    <BasicTable @register="registerTable" :pagination="pagination">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a @click="handleDetail(record)">详情</a>
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
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, h } from 'vue';
  import { selectDevice, updateAutomaticAlgorithm, exportData } from '../Device.api';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMethods } from '@/hooks/system/useMethods.ts';

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

  const emit = defineEmits(['edit', 'delete', 'refresh', 'detail']);

  // 搜索参数（由父组件传入）

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
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '60px',
      customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
    },
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
    // {
    //   title: '排序',
    //   dataIndex: 'sort',
    //   key: 'sort',
    // },
    {
      title: '操作',
      key: 'action',
      width: 110,
    },
    {
      title: '自动算法',
      dataIndex: 'automaticAlgorithm',
      key: 'automaticAlgorithm',
      width: 100,
    },
  ]);

  //表单搜索字段
  // const searchFormSchema: FormSchema[] = [
  //   {
  //     label: '设备名称/设备编号', //显示label
  //     field: 'deviceName', //查询字段
  //     component: 'JInput', //渲染的组件
  //     // slot: 'name', //设置默认值
  //   },
  //   {
  //     label: '设备状态', //显示label
  //     field: 'runState', //查询字段
  //     component: 'Select',
  //     componentProps: {
  //       options: [
  //         { label: '在线', value: '在线' },
  //         { label: '离线', value: '离线' },
  //         // 这里需要根据实际数据补充选项
  //       ],
  //     },
  //   },
  // ];

  // 表格数据
  const dataSource = ref([]);
  const total = ref<number>(0);

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
      size: 'middle',
      bordered: false,
      canResize: false,
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
      showTableSetting: false,
      // formConfig: {
      //   schemas: searchFormSchema,
      //   submitOnReset: true,
      //   //重置按钮的自定义事件
      //   resetFunc: customResetFunc,
      //   //默认row行配置,当 layout 为 horizontal 生效
      //   rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      //   //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //   baseColProps: { span: 8 },
      //   //row行的样式
      //   baseRowStyle: { width: '100%' },
      //   labelCol: { style: { width: '130px' } },
      // },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm }] = tableContext;

  // 监听选中节点变化
  watch(
    () => props.categoryKeys,
    (newVal, oldVal) => {
      reload();
    }
  );
  watch(
    () => props.spaceKeys,
    (newVal, oldVal) => {
      reload();
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
    let fileSuffix = '.xls';
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

  // 暴露 reload 方法给父组件
  defineExpose({
    reload: (opt?: any) => {
      reload(opt);
    },
  });
</script>

<style lang="less" scoped>
  .device-table {
    :deep(.ant-table-wrapper) {
      padding: 0;
      background-color: transparent;
      border-radius: 0;
    }

    :deep(.ant-pagination) {
      margin: 15px 0 0;
    }
  }
</style>
