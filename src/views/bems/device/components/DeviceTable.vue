<template>
  <div class="device-table">
    <BasicTable
      @register="registerTable"
      :pagination="pagination"
    >
      <template #tableTitle>
        <a-button
          type="primary"
          :icon="h(PlusOutlined)"
          @click="handleCreated"
        >新建</a-button>
        <a-button
          type="primary"
          :icon="h(VerticalAlignBottomOutlined )"
          @click="handleExport"
        >导出</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a @click="handleDetail(record)">详情</a>
            <a
              @click="handleDelete(record)"
              style="color: red;"
            >删除</a>
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
import { PlusOutlined, VerticalAlignBottomOutlined   } from '@ant-design/icons-vue';
import { useMethods } from '@/hooks/system/useMethods.ts';

const props = defineProps<{
  categoryKeys?: string[]; // 类别树节点
  spaceKeys?: string[]; // 空间树节点
  categoryTreeData: any[];
  spaceTreeData: any[];
}>();

const emit = defineEmits(['edit', 'delete', 'refresh', 'detail']);

// 搜索参数
const searchParams = ref({
  deviceName: '',
  runState: '',
});

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
const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: '80px',
    customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
  },
  {
    title: '设备编号',
    dataIndex: 'deviceCode',
    key: 'deviceCode',
  },
  {
    title: '设备类型',
    dataIndex: 'categoryId',
    key: 'categoryId',
    width: '120px',
    customRender: ({ text }) => {
      if (!text) return '';
      return findTreeNodeTitle(props.categoryTreeData, text) || text;
    },
  },
  {
    title: '设备位置',
    dataIndex: 'spaceId',
    key: 'spaceId',
    customRender: ({ text }) => {
      if (!text) return '';
      return findTreeNodeTitle(props.spaceTreeData, text) || text;
    },
  },
  {
    title: '倍率',
    dataIndex: 'magnification',
    key: 'magnification',
    width: '80px',
  },
  {
    title: '状态',
    dataIndex: 'runState',
    key: 'runState',
    width: '80px',
  },
  {
    title: '最后通讯时间',
    dataIndex: 'lastGatherTime',
    key: 'lastGatherTime',
  },
  // {
  //   title: '排序',
  //   dataIndex: 'sort',
  //   key: 'sort',
  // },
  {
    title: '操作',
    key: 'action',
  },
  {
    title: '自动算法',
    dataIndex: 'automaticAlgorithm',
    key: 'automaticAlgorithm',
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '设备名称/设备编号', //显示label
    field: 'deviceName', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
  {
    label: '设备状态', //显示label
    field: 'runState', //查询字段
    component: 'Select',
    componentProps: {
      options: [
        { label: '在线', value: '在线' },
        { label: '离线', value: '离线' },
        // 这里需要根据实际数据补充选项
      ],
    },
  },
];

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
    let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();
    const params = {
      pageNo: pageNo,
      pageSize: pageSize,
      nameOrCode: searchData.deviceName ? searchData.deviceName.split('*')[1] : undefined,
      runState: searchData.runState ? searchData.runState : undefined,
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
  searchParams.value.deviceName = '';
}

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    api: loadData,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
    showTableSetting: false,
    formConfig: {
      schemas: searchFormSchema,
      submitOnReset: true,
      //重置按钮的自定义事件
      resetFunc: customResetFunc,
      //默认row行配置,当 layout 为 horizontal 生效
      rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 8 },
      //row行的样式
      baseRowStyle: { width: '100%' },
      labelCol: { style: { width: '130px' } },
    },
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
  let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();
  let res = await exportData({
    nameOrCode: searchData.deviceName ? searchData.deviceName.split('*')[1] : undefined,
      runState: searchData.runState ? searchData.runState : undefined,
      categoryIds: props.categoryKeys ? props.categoryKeys.join(',') : undefined,
      spaceIds: props.spaceKeys ? props.spaceKeys.join(',') : undefined,
      deviceType: '1'
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
  reload: () => {
    loadData();
  },
});
</script>

<style lang="less" scoped>
</style>
