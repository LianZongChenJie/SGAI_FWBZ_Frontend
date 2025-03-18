<template>
  <div>
    <!-- 新增按钮 -->
    <a-button type="primary" @click="showModal" style="margin-bottom: 16px">新增</a-button>

    <!-- 新增表单弹窗 -->
    <a-modal v-model:visible="visible" title="新增属性" @ok="handleOk" @cancel="handleCancel">
      <a-form :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="名称">
          <a-input v-model:value="formState.label" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item label="标识">
          <a-input v-model:value="formState.code" placeholder="请输入标识" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formState.sort" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 表格 -->
    <a-table :columns="columns" :data-source="data" :pagination="false" bordered size="middle">
      <template #action="{ record }">
        <a-space>
          <a @click="handleEdit(record)">编辑</a>
          <a @click="handleDelete(record)">删除</a>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
  import { get } from 'http';
  import { onMounted, ref } from 'vue';
  import { list, add, deleteById, update } from './index.api';

  // 表单相关状态
  const visible = ref(false);
  const formState = ref({
    label: '',
    code: '',
    sort: 0,
  });

  // 显示弹窗
  const showModal = () => {
    resetForm();
    visible.value = true;
  };

  // 提交表单
  const handleOk = async () => {
    if (formState.value.id) {
      await update(formState.value);
    } else {
      await add(formState.value);
    }
    await getData();
    visible.value = false;
  };

  // 取消表单
  const handleCancel = () => {
    visible.value = false;
  };

  // 清空表单
  const resetForm = () => {
    formState.value = {
      label: '',
      code: '',
      sort: 0,
    };
  };

  // 表格列配置
  const columns = ref([
    {
      title: '序号',
      key: 'index',
      customRender: ({ index }) => index + 1,
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '标识',
      dataIndex: 'code',
      key: 'code',
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
      slots: { customRender: 'action' },
    },
  ]);

  // 编辑操作
  const handleEdit = (record) => {
    formState.value = { ...record };
    visible.value = true;
  };

  // 删除操作
  const handleDelete = async (record) => {
    // 这里添加删除逻辑
    await deleteById({ id: record.id });
    getData();
    console.log('删除记录:', record);
  };
  const data = ref([]);
  const getData = async () => {
    const rest = await list();
    data.value = rest;
  };
  onMounted(() => {
    getData();
  });
</script>

<style scoped>
  .ant-table {
    margin-top: 16px;
  }
</style>
