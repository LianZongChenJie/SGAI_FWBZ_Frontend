<template>
  <div class="device-table">
    <BasicTable @register="registerTable">
      <!-- 表格顶部按钮 -->
      <template #tableTitle>
        <a-button v-if="hasPermission('bems:device_data:amend')" type="primary" :icon="h(EditOutlined)"
          @click="editFunc"> 编辑 </a-button>
        <a-button v-if="hasPermission('bems:device_data:amend')" :icon="h(DeliveredProcedureOutlined)"
          style="margin-left: 8px" @click="saveFunc">
          保存
        </a-button>
        <a-button v-if="hasPermission('bems:device_data:amend')" type="primary" :icon="h(DeliveredProcedureOutlined)"
          style="margin-left: 8px" @click="recalculate">
          重新计算
        </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'value' && isSave">
          <!-- 自动算法 -->
          <a-input v-model:value="record.value"></a-input>
        </template>
        <template v-else-if="column.key === 'value' && !isSave">
          {{ record.value }}
        </template>
        <template v-if="column.key === 'automaticAlgorithm'">
          <!-- 自动算法 -->
          <a-switch :checked="record.automaticAlgorithm == '1'" :disabled="false"
            @change="(checked) => handleAutomaticAlgorithmChange(record, checked)" />
        </template>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import { selectDevice, updateAutomaticAlgorithm, editDataValue, recalculateApi } from '../Device.api';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { h } from 'vue';
  import { EditOutlined, DeliveredProcedureOutlined } from '@ant-design/icons-vue';
  import { usePermissionStore } from '/@/store/modules/permission';

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
  });

  // 是否修改
  const isSave = ref<boolean>(false);

  // 获取当前用户权限列表
  const store = usePermissionStore();
  const permissionList = computed(() => store.$state.permCodeList || []);

  /**
   * 检查是否有权限
   * @param {string|Array} permission 权限标识
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!permission) return true;

    const currentPermissions = permissionList.value;

    if (Array.isArray(permission)) {
      return permission.some((perm) => currentPermissions.includes(perm));
    }

    return currentPermissions.includes(permission);
  };

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
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    // {
    //   title: '计量单位',
    //   dataIndex: 'unitName',
    //   key: 'unitName',
    // },
    {
      title: '起始值',
      dataIndex: 'startValue',
      key: 'startValue',
    },
    {
      title: '结束值',
      dataIndex: 'endValue',
      key: 'endValue',
    },
    {
      title: '计算值',
      dataIndex: 'computeValue',
      key: 'computeValue',
    },
    {
      title: '修正值',
      key: 'updValue',
      dataIndex: 'updValue',
    },
    {
      title: '最终值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '修正人',
      dataIndex: 'updateBy',
      key: 'updateBy',
    },
    // {
    //   title: '自动修正',
    //   dataIndex: 'automaticAlgorithm',
    //   key: 'automaticAlgorithm',
    // },
  ];

  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      field: 'date',
      label: '时间',
      component: 'DatePicker',
      defaultValue: new Date(new Date().getTime() - 1000 * 60 * 60),
      componentProps: {
        showTime: {
          format: 'HH',
          hourStep: 1,
        },
        format: 'YYYY-MM-DD HH',
        placeholder: '选择具体小时',
      },
    },
    {
      label: '设备名称/设备编号', //显示label
      field: 'deviceName', //查询字段
      component: 'JInput', //渲染的组件
      // slot: 'name', //设置默认值
    },
  ];

  // 表格数据
  const dataSource = ref([]);
  const total = ref<number>(0);
  const pagination = ref({
    pageNo: 1,
    pageSize: 10,
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
  const loadData = async () => {
    let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();
    try {
      const params = {
        pageNo: pagination.value.pageNo,
        pageSize: 9999999,
        nameOrCode: searchData.deviceName ? searchData.deviceName.split('*')[1] : undefined,
        categoryIds: props.categoryKeys ? props.categoryKeys.join(',') : undefined,
        spaceIds: props.spaceKeys ? props.spaceKeys.join(',') : undefined,
        dateTime: searchData.date ? searchData.date : undefined,
      };
      console.log('request params:', params); // 调试日志
      const res = await selectDevice(params);
      dataSource.value = res.records;
      total.value = res.total;
      return dataSource.value;
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
        current: pagination.value.pageNo,
        pageSize: pagination.value.pageSize,
        pageSizeOptions: ['10', '20', '30', '50'],
      },
      showTableSetting:false,
      formConfig: {
        schemas: searchFormSchema,
        submitOnReset: true,
        //重置按钮的自定义事件
        resetFunc: customResetFunc,
        //默认row行配置,当 layout 为 horizontal 生效
        rowProps: { gutter: 24, justify: 'start', align: 'middle' },
        //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
        baseColProps: { span: 6 },
        //row行的样式
        baseRowStyle: { width: '100%' },
        labelCol: { style: { width: 'auto' } },
      },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm, getPaginationRef, getDataSource }] = tableContext;

  // 监听选中节点变化
  watch(
    () => props.categoryKeys,
    (newVal, oldVal) => {
      pagination.value.pageNo = 1;
      loadData();
      reload();
    }
  );
  watch(
    () => props.spaceKeys,
    (newVal, oldVal) => {
      pagination.value.pageNo = 1;
      loadData();
      reload();
    }
  );

  // 初始加载
  onMounted(() => {
    loadData();
  });

  // 操作方法
  const editFunc = (record: any) => {
    console.log('修改--------->');
    isSave.value = true;
  };

  const saveFunc = async (record: any) => {
    let params = currentPageData.value.map((item) => {
      return {
        id: item.id,
        value: item.value + '',
      };
    });
    let res = await editDataValue(params);
    isSave.value = false;
  };

  // 获取当前页数据
  const currentPageData = computed(() => {
    const pagination = getPaginationRef();
    const dataSource = getDataSource();

    if (!pagination || !dataSource) return [];

    const { current = 1, pageSize = 10 } = pagination;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return dataSource.slice(startIndex, endIndex);
  });

  // 重新计算
const recalculate = async () => {
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  await recalculateApi({ hour: searchData.date ? searchData.date : undefined })
}

  // 暴露 reload 方法给父组件
  defineExpose({
    reload: () => {
      pagination.value.pageNo = 1;
      loadData();
    },
  });
</script>

<style lang="less" scoped></style>
