<template>
  <div>
    <BasicTable @register="registerTable">
      <template #form-spaceId="{ model, field }">
        <a-tree-select v-model:value="model[field]" :tree-data="spaceTreeData" placeholder="请选择空间位置"
          :fieldNames="treeSelect" show-search allowClear />
      </template>
      <!-- 表格顶部按钮 -->
      <template #tableTitle>
        <a-button v-if="hasPermission('bems:alarmRule:add')" type="primary" :icon="h(EditOutlined)"
          @click="addStrategy"> 新增 </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'device'">
          <a @click.stop="checkDetail(record)">{{ record.strategyName }}</a>
        </template>
        
        <template v-if="column.key === 'frequency'">
          {{ getFrequency(record) }}
        </template>
        <template v-if="column.key === 'status'">
          {{ Number(record.enabledStatus) ? '已启用' : '已禁用' }}
        </template>
        <template v-else-if="column.key === 'automaticAlgorithm'">
          <!-- 自动算法 -->
          <a-switch
            :checked="record.enabledStatus == '1'"
            :disabled="(record.enabledStatus == '1') ? !hasPermission('bems:alarmRule:startRule') : !hasPermission('bems:alarmRule:stopRule')"
            @change="(checked) => handleAutomaticAlgorithmChange(record, checked)"
          />
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a v-if="hasPermission('bems:alarmRule:edit')" @click="handleEdit(record)">编辑</a>
            <a @click="checkDetail(record)">详情</a>
            
            <a-popconfirm title="确认删除该条数据？" ok-text="确定" cancel-text="取消" @confirm="confirmDelete(record)">
              <a style="color: red;" >删除</a>
                </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <alarm-rules-modal ref="deviceRef" :type="type" :editItem="editItem" :closeModal="closeModal"/>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { h } from 'vue';
import { EditOutlined } from '@ant-design/icons-vue';
import { usePermissionStore } from '/@/store/modules/permission';
import AlarmRulesModal from './AlarmRulesModal.vue'
import { getAlarmRulesListApi, getAlarmLevelListApi, getAlarmCategoryListApi, enableAlarmRuleslApi, disableAlarmRuleslApi, deleteAlarmRulesApi } from '../Standardized.api'

const showForm = ref<boolean>(false);

const deviceRef = ref()

// 打开类型
const type = ref('')
const editItem = ref<any>()

const pagination = ref({
  pageNo: 1,
  pageSize: 10,
});

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

// 表格列配置
const columns: BasicColumn[] = [
  {
    title: '编号',
    dataIndex: 'index',
    key: 'index',
    width: '80px',
    customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
  },
  {
    title: '规则编号',
    dataIndex: 'ruleCode',
    key: 'ruleCode',
    resizable: true,
    sorter: (a, b) => (a.ruleCode || '').localeCompare(b.ruleCode || ''),
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    key: 'ruleName',
    resizable: true,
    sorter: (a, b) => (a.ruleName || '').localeCompare(b.ruleName || ''),
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '报警类型',
    dataIndex: 'alarmCategoryName',
    key: 'alarmCategoryName',
    resizable: true,
    sorter: (a, b) => (a.alarmCategoryName || '').localeCompare(b.alarmCategoryName || ''),
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '报警等级',
    dataIndex: 'alarmLevelName',
    key: 'alarmLevelName',
    resizable: true,
  },
  {
    title: '报警频率',
    dataIndex: 'frequency',
    key: 'frequency',
    resizable: true,
  },
  {
    title: '状态',
    key: 'automaticAlgorithm',
    dataIndex: 'automaticAlgorithm',
    resizable: true,
  },
  {
    title: '操作',
    key: 'action',
    dataIndex: 'action',
  }
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '规则信息', //显示label
    field: 'ruleInfo', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
  {
    label: '报警类型', 
    field: 'alarmCategoryId', 
    component: 'ApiSelect', 
    componentProps: {
      api: getAlarmCategoryListApi,
      labelField: 'alarmCategoryName',
      valueField: 'id',
      immediate: true,
      resultField: 'records',
    },
  },
  {
    label: '报警等级', 
    field: 'alarmLevelId', 
    component: 'ApiSelect', 
    componentProps: {
      api: getAlarmLevelListApi,
      labelField: 'alarmLevelName',
      valueField: 'id',
      immediate: true,
      resultField: 'records',
    }, 
  },
];

// 获取表格数据
const getLinkageControlList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
        pageSize: pageSize,
    ruleCode: searchData.ruleInfo ? searchData.ruleInfo.split('*')[1] : undefined,
    ruleName: searchData.ruleInfo ? searchData.ruleInfo.split('*')[1] : undefined,
    alarmCategoryId: searchData.alarmCategoryId ? searchData.alarmCategoryId : undefined,
    alarmLevelId: searchData.alarmLevelId ? searchData.alarmLevelId : undefined,
  }
  let res = await getAlarmRulesListApi(params)
  return res.records
}

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    // dataSource: dataSource.value,
    api: getLinkageControlList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    rowKey: 'id',
    showTableSetting:false,
    pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
    formConfig: {
      schemas: searchFormSchema,
      // 默认展开
      showAdvancedButton: false,
      submitOnReset: true,
      //重置按钮的自定义事件
      resetFunc: async () => {
        console.log('重置--------------->');
      },
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

/**
 * 检查是否有权限
 * @param {string|Array} permission 权限标识
 * @returns {boolean}
 */
const store = usePermissionStore();
const permissionList = computed(() => store.$state.permCodeList || []);
const hasPermission = (permission:string) => {
  if (!permission) return true;

  const currentPermissions = permissionList.value;

  if (Array.isArray(permission)) {
    return permission.some((perm) => currentPermissions.includes(perm));
  }

  return currentPermissions.includes(permission);
};

// 新增
const addStrategy = () => {
  type.value = 'create'
  deviceRef.value.showModal()
}

// 频率单位数据
const unitOption = [
  {
    label: '秒',
    value: 's',
  },
  {
    label: '分',
    value: 'm',
  },
  {
    label: '时',
    value: 'h',
  },
  {
    label: '天',
    value: 'd',
  },
];
const getFrequency = (record) => {
  return record.frequency  + '' + unitOption.find(item => record.frequencyUnit === item.value)?.label
}

// 禁用、启用控制
const handleAutomaticAlgorithmChange = async (record, checked) => {
  if(checked) {
    await handleEnable(record)
  } else {
    await handleDisable(record)
  }
  // 刷新表格
  reload();
}

// 启用
const handleEnable = async (record) => {
  await enableAlarmRuleslApi({ id: record.id })
  reload()
}

// 禁用
const handleDisable = async (record) => {
  await disableAlarmRuleslApi({ id: record.id })
  reload()
}

// 编辑
const handleEdit = (record) => {
  editItem.value = record
  type.value = 'edit'
  deviceRef.value.showModal()
}

// 查看
const checkDetail = (record) => {
  editItem.value = record
  type.value = 'check'
  deviceRef.value.showModal()
}

// 关闭弹框
const closeModal = () => {
  reload()
}

const confirmDelete = async (record) => {
  await deleteAlarmRulesApi({id: record.id})
  // 刷新表格
  reload();
}

// 删除
const handleDelete = async (record) => {
  
}

// 表单数据
const formState = reactive({
  name: '',
  age: undefined,
  email: '',
  phone: '',
  address: ''
});

// 提交表单
const onFinish = values => {
  console.log('Received values:', values);
};

onMounted(async () => {
  
})
</script>

<style scoped lang="less">
.expand-box{
  margin-left: 10px;
  font-size: 16px;
}
.info-box{
  .info-title{
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background-color: #374352;
    border-radius: 5px 5px 0 0;
  }
  .info-list{
    padding: 16px;
    .list-title{
      width: 100%;
      height: 40px;
      padding-left: 10px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #d4d0d0;
    }
    .list-form{
      width: 100%;
      margin-top: 16px;
    }
  }
}
</style>