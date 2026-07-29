<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :title="title"
    :width="800"
    @ok="handleSubmit"
    @visibleChange="visibleChange"
  >
    <BasicForm
      v-if="!isUpdate"
      @register="registerForm"
    >
      <template #modelId="{ model, field }">
        <a-select
          placeholder="请选择设备模型"
          v-model:value="model[field]"
          :options="categoryOption"
          :disabled="isUpdate"
        >
        </a-select>
      </template>
    </BasicForm>
    <a-tabs
      v-else
      v-model:activeKey="activeKey"
    >
      <a-tab-pane
        key="1"
        tab="基本信息"
        destroyInactiveTabPane="true"
      >
        <BasicForm @register="registerForm">
          <template #modelId="{ model, field }">
            <a-select
              placeholder="请选择设备模型"
              v-model:value="model[field]"
              :options="categoryOption"
              :disabled="isUpdate"
            >
            </a-select>
          </template>
        </BasicForm>
      </a-tab-pane>
      <a-tab-pane
        key="2"
        tab="设备属性"
        force-render
      >
        <a-button
          type="primary"
          :icon="h(PlusOutlined)"
          @click="addItem"
        >新增</a-button>
        <a-table
          :dataSource="dataSource"
          :columns="columns"
          bordered
          :scroll="{ y: 150 }"
          size="middle"
          :pagination="false"
          @change="handleDeviceTableChange"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="['sort', 'readwriteLevel', 'attributeCode', 'unit', 'attributeName'].includes(column.dataIndex)">
              <div>
                <a-input
                  v-if="editableData[record.key]"
                  v-model:value="editableData[record.key][column.dataIndex]"
                  style="margin: -5px 0"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <div class="editable-row-operations">
                <span v-if="editableData[record.key]">
                  <a-typography-link @click="save(record.key)"><a>保存</a></a-typography-link>
                  &ensp;
                  <a-popconfirm
                    title="确认取消?"
                    @confirm="cancel(record)"
                  >
                    <a>取消</a>
                  </a-popconfirm>
                </span>
                <span v-else>
                  <a @click="edit(record.key)">编辑</a>&ensp;
                  <a-popconfirm
                    title="确认删除该条数据？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="confirmDelete(record)"
                  >
                    <a style="color: red;">删除</a>
                  </a-popconfirm>

                </span>
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, computed, unref, h, reactive, nextTick } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { PlusOutlined } from '@ant-design/icons-vue';
import { TreeSelect } from 'ant-design-vue';
import { saveOrUpdate, getDeviceAttribute, getListByDeviceId, saveData, addData, deleteItem } from '../Device.api';
import { cloneDeep } from 'lodash-es';
import { message } from 'ant-design-vue';
import type { UnwrapRef } from 'vue';

const devicePagination = ref({
  pageNo: 1,
  pageSize: 10,
  total: 10,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50'],
  showTotal: (total) => `共${total}条`,
});

const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const activeKey = ref('1');
const dataSource = ref();
const columns = [
  {
    title: '属性名称',
    dataIndex: 'attributeName',
    key: 'attributeName',
  },
  {
    title: '属性单位',
    dataIndex: 'unit',
    key: 'unit',
  },
  {
    title: '属性编码',
    dataIndex: 'attributeCode',
    key: 'attributeCode',
  },
  {
    title: '读写级别',
    dataIndex: 'readwriteLevel',
    key: 'readwriteLevel',
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const categoryOption = ref();
const selectCategoryId = async (value) => {
  let res = await getDeviceAttribute({ categoryId: value });
  (categoryOption.value = res.map((item) => {
    return {
      value: item.id,
      label: item.modelName,
    };
  })),
    // 更新表单项
    await updateSchema([
      {
        label: '设备模型',
        field: 'modelId',
        component: 'Select',
        required: true,
        componentProps: {
          options: categoryOption.value,
        },
      },
    ]);
};

// 表单配置
const formSchema: any = [
  {
    label: 'id',
    field: 'id',
    component: 'Input',
    show: false, // 隐藏此字段
  },
  {
    label: '设备编号',
    field: 'deviceCode',
    component: 'Input',
    required: true,
  },
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    required: true,
  },
  {
    label: '设备类别',
    field: 'categoryId',
    component: 'TreeSelect',
    required: true,
    componentProps: {
      treeData: [], // 将由父组件通过 setFieldsValue 设置
      placeholder: '请选择设备类别',
      fieldNames: {
        label: 'title',
        key: 'key',
        value: 'key',
      },
      onChange: selectCategoryId,
    },
  },
  {
    label: '设备位置',
    field: 'spaceId',
    component: 'TreeSelect',
    required: true,
    componentProps: {
      treeData: [], // 将由父组件通过 setFieldsValue 设置
      placeholder: '请选择设备位置',
      fieldNames: {
        label: 'title',
        key: 'key',
        value: 'key',
      },
    },
  },
  {
    label: '倍率',
    field: 'magnification',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 0,
      precision: 2,
    },
  },
  {
    label: '自动算法',
    field: 'automaticAlgorithm',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '开', value: '1' },
        { label: '关', value: '0' },
        // 这里需要根据实际数据补充选项
      ],
    },
  },
  {
    label: '设备模型',
    field: 'modelId',
    component: 'Select',
    slot: 'modelId',
    // componentProps: {
    //   options: categoryOption.value
    // },
  },
  {
    label: '排序',
    field: 'sort',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      precision: 0,
    },
  },
  {
    label: '备注',
    field: 'remark',
    component: 'Input',
  },
];
const id = ref('');
const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: 120,
  schemas: formSchema,
  showActionButtonGroup: false,
  baseColProps: { span: 12 },
  rowProps: { gutter: 24 },
});

const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {

  // 设置树形数据
  const { categoryTreeData, spaceTreeData } = data;
  formSchema.forEach((schema) => {
    if (schema.field === 'categoryId') {
      schema.componentProps.treeData = categoryTreeData;
    }
    if (schema.field === 'spaceId') {
      schema.componentProps.treeData = spaceTreeData;
    }
  });
  resetFields();
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;
  await selectCategoryId(data.record.categoryId);
  await nextTick()
  if (unref(isUpdate)) {
    id.value = data.record.id;
    getData(data.record.id);
    await setFieldsValue({
      ...data.record,
      id: data.record.id, // 确保 id 被设置
    });
  }

  
});

const title = computed(() => (!unref(isUpdate) ? '新增设备' : '编辑设备'));

async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    await saveOrUpdate(values, unref(isUpdate));
    closeModal();
    emit('success');
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    setModalProps({ confirmLoading: false });
  }
}

const getData = async (id) => {
  let res = await getListByDeviceId({ 
    deviceId: id,
    pageNo: 1,
    pageSize: 999,
   });
  devicePagination.value.total = res.total;
  dataSource.value = res.records;
  dataSource.value.forEach((item, index) => {
    item.key = index;
  });
};

const isNullAndUnDef = ref(false);
const addItem = () => {
  isNullAndUnDef.value = true;
  editableData[dataSource.value.length] = {
    key: dataSource.value.length,
    attributeCode: '',
    attributeName: '',
    readwriteLevel: '',
    sort: '',
    unit: '',
    deviceId: id.value,
  };
  dataSource.value.push({
    key: dataSource.value.length,
    attributeCode: '',
    attributeName: '',
    readwriteLevel: '',
    sort: '',
    unit: '',
    deviceId: id.value,
  });
};

interface DataItem {
  key: string;
  name: string;
  age: number;
  address: string;
}

const data: DataItem[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i.toString(),
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

const editableData = reactive({});

const edit = (key: string) => {
  editableData[key] = cloneDeep(dataSource.value.filter((item) => key === item.key)[0]);
};
const save = async (key: string) => {
  Object.assign(dataSource.value.filter((item) => key === item.key)[0], editableData[key]);
  if (editableData[key].id) {
    await saveData(editableData[key]);
  } else {
    await addData(editableData[key]);
    await getData(id.value);
  }
  delete editableData[key];
};
const confirmDelete = (record) => {
  deleteData(record);
};
const deleteData = async (record) => {
  if (record.id) {
    await deleteItem({ id: record.id });
    message.success('删除成功！');
    await getData(id.value);
  } else {
    delete editableData[record.key];
    dataSource.value.pop();
  }
};
const cancel = (record) => {
  activeKey.value = '1';
  if (!record.id) {
    dataSource.value.pop();
  }
  delete editableData[record.key];
};

const visibleChange = (value) => {
  if (!value) {
    activeKey.value = '1';
  }
};

const handleDeviceTableChange = async (pagination) => {
  devicePagination.value.pageNo = pagination.current;
  await getData(id.value);
};
</script>

<style lang="less" scoped>
:deep(.ant-input-number) {
  width: 100%;
}
</style>
