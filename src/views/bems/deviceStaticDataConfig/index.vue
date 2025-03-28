<template>
  <div class="device-static-data jeecg-basic-table jeecg-basic-table-form-container">
    <!-- 添加搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
        <a-form-item label="类型">
          <a-select v-model:value="searchForm.type" placeholder="请选择类型" allowClear style="width: 200px">
            <a-select-option v-for="item in typeData" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签">
          <a-input v-model:value="searchForm.label" placeholder="请输入标签" allowClear style="width: 200px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-operations">
      <a-button type="primary" @click="handleAdd">
        <plus-outlined />
        新增
      </a-button>
    </div>

    <!-- 修改表格配置，移除分页相关属性 -->
    <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'valueType'">
          {{ getValueTypeName(record.valueType) }}
        </template>
        <template v-if="column.key === 'type'">
          {{ getTypeName(record.type) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定删除?" @confirm="() => handleDelete(record)">
              <a class="danger-text">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:visible="modalVisible" :title="modalTitle" @ok="handleModalOk" @cancel="handleModalCancel" :confirmLoading="confirmLoading">
      <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="类型" name="type">
          <a-select v-model:value="formData.type" placeholder="请选择类型">
            <a-select-option v-for="item in typeData" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签" name="label">
          <a-input v-model:value="formData.label" placeholder="请输入标签" />
        </a-form-item>
        <a-form-item label="值类型" name="valueType">
          <a-select v-model:value="formData.valueType" placeholder="请选择值类型">
            <a-select-option v-for="item in valueTypeData" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="数据源" name="valueData" v-if="formData.valueType === 'select'">
          <a-input v-model:value="formData.valueData" placeholder='请输入数据源，格式如：["选项1","选项2"]' />
        </a-form-item>
        <a-form-item label="排序" name="sort">
          <a-input-number v-model:value="formData.sort" placeholder="请输入排序" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import { getList, saveConfig, editConfig, deleteConfig } from './index.api';

  // 表格列配置
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '标签',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
    },
    {
      title: '数据源',
      dataIndex: 'valueData',
      key: 'valueData',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
    },
  ];

  // 值类型映射
  const valueTypeMap = {
    input: '输入框',
    select: '下拉选择',
    datePicker: '日期选择',
  };

  const getValueTypeName = (type: string) => valueTypeMap[type] || type;
  const getTypeName = (type: string) => {
    const item = typeData.find((item) => item.key === type);
    return item ? item.label : type;
  };

  // 表格数据
  const dataSource = ref<any[]>([]);
  const loading = ref<boolean>(false);

  const typeData = [
    {
      label: '基本信息',
      key: 'base',
    },
    {
      label: '技术参数',
      key: 'tech',
    },
    {
      label: '服务厂商',
      key: 'vendor',
    },
  ];

  const valueTypeData = [
    {
      label: '输入框',
      value: 'input',
    },
    {
      label: '下拉选择',
      value: 'select',
    },
    {
      label: '日期选择',
      value: 'datePicker',
    },
  ];

  // 表单数据
  const modalVisible = ref<boolean>(false);
  const modalTitle = ref<string>('新增配置');
  const confirmLoading = ref<boolean>(false);
  const formRef = ref();
  // 修改表单数据的初始值
  const formData = reactive({
    id: '',
    type: '',
    label: '',
    valueType: undefined,
    valueData: '',
    sort: 0,
  });

  // 在表单校验规则中添加排序字段的验证
  const rules = {
    type: [{ required: true, message: '请输入类型' }],
    label: [{ required: true, message: '请输入标签' }],
    valueType: [{ required: true, message: '请选择值类型' }],
    sort: [{ required: true, message: '请输入排序' }],
    valueData: [
      {
        validator: async (_rule: any, value: string) => {
          if (formData.valueType !== 'select') return Promise.resolve();
          if (!value) return Promise.reject('请输入数据源');
          try {
            JSON.parse(value);
            return Promise.resolve();
          } catch (error) {
            return Promise.reject('数据源格式不正确');
          }
        },
      },
    ],
  };

  // 新增按钮点击
  const handleAdd = () => {
    modalTitle.value = '新增配置';
    // 重置表单数据
    Object.assign(formData, {
      id: '',
      type: '',
      label: '',
      valueType: undefined,
      valueData: '',
      sort: 0,
    });
    modalVisible.value = true;
  };

  // 编辑按钮点击
  const handleEdit = (record: any) => {
    modalTitle.value = '编辑配置';
    // 填充表单数据
    Object.assign(formData, {
      id: record.id,
      type: record.type,
      label: record.label,
      valueType: record.valueType,
      valueData: record.valueData,
      sort: record.sort || 0,
    });
    modalVisible.value = true;
  };

  // 删除按钮点击
  const handleDelete = async (record: any) => {
    try {
      await deleteConfig({ id: record.id });
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 弹窗确认
  const handleModalOk = () => {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true;
      try {
        // 处理数据源格式
        if (formData.valueType === 'select' && formData.valueData) {
          try {
            // 验证数据源格式是否正确
            JSON.parse(formData.valueData);
          } catch (error) {
            message.error('数据源格式不正确');
            return;
          }
        }

        if (formData.id) {
          await editConfig(formData);
        } else {
          await saveConfig(formData);
        }
        modalVisible.value = false;
        fetchData();
      } catch (error) {
        message.error(formData.id ? '编辑失败' : '新增失败');
      } finally {
        confirmLoading.value = false;
      }
    });
  };

  // 弹窗取消
  const handleModalCancel = () => {
    modalVisible.value = false;
    formRef.value?.resetFields();
  };

  // 修改获取数据方法，添加搜索参数
  const fetchData = async () => {
    loading.value = true;
    try {
      const params = {
        ...searchForm,
      };
      const res = await getList(params);
      dataSource.value = res;
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  // 添加搜索表单数据
  const searchForm = reactive({
    type: undefined,
    label: '',
  });

  // 添加搜索方法
  const handleSearch = () => {
    fetchData();
  };

  // 添加重置方法
  const handleReset = () => {
    searchForm.type = undefined;
    searchForm.label = '';
    fetchData();
  };

  // 初始化
  fetchData();

  // 删除以下重复的代码：
  // 1. 第一个 fetchData 函数定义
  // 2. 第二个 fetchData 函数定义
</script>

<style lang="less" scoped>
  .device-static-data {
    padding: 16px;
    background-color: #fff;

    .search-form :deep(.ant-form-item) {
      margin-right: 20px;
      margin-bottom: 16px;
    }

    .table-operations {
      margin-bottom: 16px;
    }

    .danger-text {
      color: #ff4d4f;
    }
  }
</style>
