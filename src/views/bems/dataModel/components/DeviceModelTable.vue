<template>
  <div class="device-model">
    <div class="title-box">
      <DatabaseFilled style="font-size: 18px; color: #000;" />&ensp;设备模型
    </div>
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
      @row-click="selectTargetModel"
    >
      <!-- 表格顶部按钮 -->
      <template #tableTitle>
        <a-button
          type="primary"
          :icon="h(PlusOutlined)"
          @click="handleAdd"
        >
          新增
        </a-button>
        <a-popconfirm
          title="确认删除选中数据？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="confirmDeleteBatc()"
        >
          <a-button
            type="primary"
            danger
            style="margin-left: 8px"
            :icon="h(DeleteOutlined)"
          >
            批量删除
          </a-button>
        </a-popconfirm>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click="handleedit(record)">
              <EditOutlined />编辑
            </a>
            <a-popconfirm
              title="确认删除该条数据？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="confirmDelete(record)"
            >
              <a style="color: red;">
                <DeleteOutlined style="color: red;" />删除
              </a>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-if="column.key === 'categoryId'">
          <!-- 自动算法 -->
          {{ getCategory(record) }}
        </template>
      </template>
    </BasicTable>
    <a-modal
      v-model:visible="modalVisible"
      :title="isUpdate ? '编辑模型' : '新增模型'"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <div style="padding: 10px;">
        <a-form
          :model="formState"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          layout="inline"
        >
          <!-- 输入框 -->
          <a-col :span="12">
            <a-form-item
              label="名称"
              name="modelName"
              :rules="[{ required: true, message: '请输入名称' }]"
            >
              <a-input
                v-model:value="formState.modelName"
                placeholder="请输入名称"
              />
            </a-form-item>
          </a-col>

          <!-- 下拉选择框 -->
          <a-col :span="12">
            <a-form-item
              label="专业"
              name="categoryId"
              :rules="[{ required: true, message: '请选择专业' }]"
            >
              <a-select
                v-model:value="formState.categoryId"
                placeholder="请选择专业"
                :options="categoryList"
              />
            </a-form-item>
          </a-col>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getCategoryDataList, getDeviceModelList, addModel, updateModel, deleteModel, deleteBatchModel } from './Model.api';
import { DatabaseFilled } from '@ant-design/icons-vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { h, onMounted, reactive, nextTick } from 'vue';
import { PlusOutlined, DeleteOutlined, InboxOutlined, EditOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { Item } from 'ant-design-vue/es/menu';
import { log } from 'console';

const props = defineProps({
  getTargetModel: { type: Function, default: () => {} },
});

// 表格列配置
const columns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'modelName',
    key: 'modelName',
  },
  {
    title: '专业',
    dataIndex: 'categoryId',
    key: 'categoryId',
  },
  {
    title: '操作',
    dataIndex: 'active',
    key: 'active',
  },
];

const categoryList = ref<[{ label: string; value: string }]>([{ label: '', value: '' }]);
//表单搜索字段
let searchFormSchema: FormSchema[] = [
  {
    label: '设备名称', //显示label
    field: 'modelName', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
  {
    label: '所属专业', //显示label
    field: 'categoryId', //查询字段
    component: 'ApiSelect', //渲染的组件
    componentProps: {
      api: getCategoryDataList,
      labelField: 'title',
      valueField: 'key',
      immediate: true,
      resultField: 'records',
    },
  },
];

// 获取表格数据
const getData = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    modelName: getFieldsValue().modelName && getFieldsValue().modelName !== '**' ? getFieldsValue().modelName : undefined,
    categoryId: getFieldsValue().categoryId ? getFieldsValue().categoryId : undefined,
  };
  let res = await getDeviceModelList(params);
  dataSource.value = res.records;
  return {
    records: res.records, // 当前页数据
    total: res.total, // 总记录数
  };
};

// 表格数据
const dataSource = ref([]);

const customResetFunc = async () => {};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    api: getData,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
    rowkey: 'id',
    //定义rowSelection的类型，默认是checkbox多选，可以设置成radio单选
    rowSelection: { type: 'checkbox' },
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
      labelCol: { style: { width: '70px' } },
    },
  },
});
// 获取专业列表
const getCategoryList = async () => {
  let res = await getCategoryDataList();
  categoryList.value = res.map((item) => {
    return {
      label: item.title,
      value: item.key,
    };
  });
};
// 获取数据列表
const getCategory = (record) => {
  let targetItem = categoryList.value.find((item) => {
    return record.categoryId.toString() === item.value;
  });
  return targetItem?.label;
};

// BasicTable绑定注册
const [registerTable, { reload, getForm }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

const modalVisible = ref<boolean>(false);
const isUpdate = ref<boolean>(false);
const modelId = ref<number>();
// 表单数据
const formState = reactive({
  modelName: '',
  categoryId: '',
});
// 打开新增弹框
const handleAdd = () => {
  isUpdate.value = false;
  modalVisible.value = true;
};

// 打开编辑弹框
const handleedit = (record) => {
  formState.categoryId = record.categoryId + '';
  formState.modelName = record.modelName;
  modelId.value = record.id;
  isUpdate.value = true;
  modalVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (isUpdate.value) {
    await updateModel({ id: modelId.value, ...formState });
  } else {
    await addModel(formState);
  }
  modalVisible.value = false;
  // 刷新表格
  reload();
  // 重置表单
  resetForm();
};

// 取消操作
const handleCancel = () => {
  resetForm();
  modalVisible.value = false;
};

// 确认删除
const confirmDelete = async (record) => {
  await deleteModel({ id: record.id.toString() });
  message.success('删除成功！');
  // 刷新表格
  reload();
};

// 重置表单
const resetForm = () => {
  formState.modelName = '';
  formState.categoryId = '';
};

const confirmDeleteBatc = async () => {
  console.log(selectedRowKeys.value);
  if (!selectedRowKeys.value.length) {
    message.error('未选择任何数据！');
  } else {
    let ids = selectedRowKeys.value.reduce((ids, item) => {
      return item + ',' + ids;
    });
    await deleteBatchModel({ ids: ids });
    message.success('删除成功！');
    // 刷新表格
    reload();
  }
};

// 选择某个行
const selectTargetModel = (record) => {
  props.getTargetModel(record);
};

onMounted(async () => {
  await getCategoryList();
  nextTick(() => {
    selectTargetModel(dataSource.value[0]);
  });
});
</script>

<style scoped lang="less">
.device-model {
  padding: 10px;
  .title-box {
    height: 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 10px;
    font-size: 18px;
    font-weight: 600;
    color: #000;
  }
}
</style>