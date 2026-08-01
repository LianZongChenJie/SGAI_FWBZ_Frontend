<template>
  <div class="device-model">
    <a-card :title="cardTitle" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增
        </a-button>
      </template>

      <BasicTable @register="registerTable">
        <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click="handleedit(record)"> <EditOutlined />编辑 </a>
            <a-popconfirm title="确认删除该条数据？" ok-text="确定" cancel-text="取消" @confirm="confirmDelete(record)">
              <a style="color: red"> <DeleteOutlined style="color: red" />删除 </a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BasicTable>
    </a-card>
    <a-modal
      v-model:visible="modalVisible"
      :title="isUpdate ? '编辑模型属性' : '新增模型属性'"
      width="500px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <div>
        <a-form ref="formRef" :model="formState" :label-col="{ span: 4 }" layout="horizontal">
          <!-- 输入框 -->
          <a-form-item label="属性名称" name="attributeName" :rules="[{ required: true, message: '请输入属性名称' }]">
            <a-input v-model:value="formState.attributeName" placeholder="请输入属性名称" />
          </a-form-item>
          <a-form-item label="属性单位" name="unit" :rules="[{ required: false, message: '请输入属性单位' }]">
            <a-input v-model:value="formState.unit" placeholder="请输入属性单位" />
          </a-form-item>
          <a-form-item label="属性编码" name="attributeCode" :rules="[{ required: true, message: '请输入属性编码' }]">
            <a-input v-model:value="formState.attributeCode" placeholder="请输入属性编码" />
          </a-form-item>
          <!-- 下拉选择框 -->
          <a-form-item label="读写级别" name="readwriteLevel" :rules="[{ required: true, message: '请选择读写级别' }]">
            <a-select v-model:value="formState.readwriteLevel" placeholder="请选择读写级别" :options="levelOption" />
          </a-form-item>
          <a-form-item label="排序" name="sort" :rules="[{ required: true, message: '请输入排序' }]">
            <a-input v-model:value="formState.sort" placeholder="请输入排序" oninput="value = value.replace(/[^0-9]/g, '')" />
          </a-form-item>
          <!-- 动态表单项 -->
          <a-form-item label="转换">
            <div v-for="(item, index) in formState.valueConfig" :key="index" class="dynamic-form-item">
              <a-row :gutter="16" style="margin-bottom: 10px">
                <a-col :span="9">
                  <a-input v-model:value="item.key" placeholder="请输入key" />
                </a-col>
                <a-col :span="9">
                  <a-input v-model:value="item.value" placeholder="请输入value" />
                </a-col>
                <a-col :span="4" style="display: flex; align-items: center; justify-content: flex-start">
                  <a-button type="danger" style="color: #ff4d4f" :icon="h(DeleteOutlined)" @click="removeAttribute(index)"> 删除 </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" :icon="h(PlusOutlined)" @click="addAttribute"> 添加 </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { getDeviceModelAttribute, addModelAttribute, updateModelAttribute, deleteModelAttribute } from './Model.api';
  import { DatabaseFilled } from '@ant-design/icons-vue';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { h } from 'vue';
  import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';

  const tableTitle = ref('');
  const cardTitle = computed(() => `🔧 设备模型属性(${tableTitle.value})`);
  const formRef = ref();
  let targetModel = reactive<any>({});

  // 表格列配置
  const columns: BasicColumn[] = [
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
      title: '操作',
      dataIndex: 'active',
      key: 'active',
    },
  ];

  const levelOption = ref([
    {
      label: '只读',
      value: '0',
    },
    {
      label: '读写',
      value: '1',
    },
  ]);

  // 获取表格数据
  const getData = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    let params = {
      modelId: targetModel.id,
      pageNo: pageNo,
      pageSize: pageSize,
    };
    let res = await getDeviceModelAttribute(params);
    dataSource.value = res.records;
    return {
      records: res.records, // 当前页数据
      total: res.total, // 总记录数
    };
  };

  // 表格数据
  const dataSource = ref([]);
  const total = ref<number>(0);

  const pagination = ref({
    pageNo: 1,
    pageSize: 10,
  });

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      api: getData,
      columns: columns,
      showActionColumn: false,
      size: 'middle',
      showTableSetting: false,
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload }] = tableContext;

  const modalVisible = ref<boolean>(false);
  const isUpdate = ref<boolean>(false);
  const attributeId = ref<number>();
  // 表单数据
  const formState = reactive({
    attributeName: '',
    attributeCode: '',
    unit: '',
    readwriteLevel: '',
    sort: '',
    valueConfig: [] as { key: string; value: string }[],
  });
  // 添加属性
  const addAttribute = () => {
    formState.valueConfig.push({ key: '', value: '' });
  };

  // 删除属性
  const removeAttribute = (index) => {
    formState.valueConfig.splice(index, 1);
  };

  // 打开新增弹框
  const handleAdd = () => {
    isUpdate.value = false;
    // 重置附加属性为空数组
    formState.valueConfig = [];
    modalVisible.value = true;
  };

  // 打开编辑弹框
  const handleedit = (record) => {
    formState.attributeName = record.attributeName;
    formState.attributeCode = record.attributeCode;
    formState.unit = record.unit;
    formState.readwriteLevel = record.readwriteLevel;
    formState.sort = record.sort;
    // 设置附加属性，若没有则为空数组
    formState.valueConfig = JSON.parse(record.valueConfig) || [];
    attributeId.value = record.id;
    isUpdate.value = true;
    modalVisible.value = true;
    console.log(formState.valueConfig);
  };

  // 提交表单
  const handleSubmit = async () => {
    formRef.value
      .validate()
      .then(async () => {
        let params = {
          modelId: targetModel.id,
          attributeName: formState.attributeName,
          attributeCode: formState.attributeCode,
          unit: formState.unit,
          readwriteLevel: formState.readwriteLevel,
          sort: parseInt(formState.sort),
          valueConfig: JSON.stringify(formState.valueConfig),
        };
        if (isUpdate.value) {
          await updateModelAttribute({ id: attributeId.value, ...params });
          // message.success('修改成功！');
        } else {
          await addModelAttribute([params]);
          // message.success('创建成功！');
        }
        formRef.value.resetFields();
        // 刷新表格
        reload();
        // 重置表单
        resetForm();
        modalVisible.value = false;
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  // 取消操作
  const handleCancel = () => {
    resetForm();
    modalVisible.value = false;
  };

  // 确认删除
  const confirmDelete = async (record) => {
    await deleteModelAttribute({ id: record.id.toString() });
    message.success('删除成功！');
    // 刷新表格
    reload();
  };

  // 重置表单
  const resetForm = () => {
    formState.attributeName = '';
    formState.attributeCode = '';
    formState.unit = '';
    formState.readwriteLevel = '';
    formState.sort = '';
    // 重置附加属性为空数组
    formState.valueConfig = [];
  };

  const setTargetModel = async (target) => {
    tableTitle.value = target.modelName;
    targetModel = { ...target };
    reload();
  };

  onMounted(async () => {});

  // 暴露方法给父组件
  defineExpose({
    setTargetModel,
  });
</script>

<style scoped lang="less">
  .device-model {
    :deep(.ant-card) {
      border-radius: 8px;
    }
  }
</style>
