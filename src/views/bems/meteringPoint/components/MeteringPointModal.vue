<template>
  <a-modal
    :title="props.isUpdate ? '编辑计量点' : '新增计量点'"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirmLoading="confirmLoading"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="项目编号" name="pointCode">
        <a-input v-model:value="formData.pointCode" placeholder="请输入项目编号" />
      </a-form-item>
      <a-form-item label="项目名称" name="pointName">
        <a-input v-model:value="formData.pointName" placeholder="请输入项目名称" />
      </a-form-item>
      <a-form-item label="设备类别" name="categoryId">
        <a-tree-select
          v-model:value="formData.categoryId"
          :tree-data="props.categoryTree"
          placeholder="请选择设备类别"
          :field-names="{
            children: 'children',
            label: 'title',
            value: 'key',
          }"
        />
      </a-form-item>
      <a-form-item label="空间位置" name="spaceId">
        <a-tree-select
          v-model:value="formData.spaceId"
          :tree-data="props.spaceTree"
          placeholder="请选择空间位置"
          :field-names="{
            children: 'children',
            label: 'title',
            value: 'key',
          }"
        />
      </a-form-item>
      <a-form-item label="计量单位" name="meteringUnit">
        <a-select v-model:value="formData.meteringUnit" placeholder="请选择计量单位">
          <a-select-option v-for="item in props.unitList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import { addPoint, editPoint } from '../index.api'; // 导入API

  const props = defineProps<{
    isUpdate?: boolean;
    record?: any;
    categoryTree?: any[]; // 设备类别树
    spaceTree?: any[]; // 空间位置树
    unitList?: any[]; // 计量单位列表
  }>();

  const emit = defineEmits(['register', 'success']);

  const visible = ref<boolean>(false);
  const confirmLoading = ref<boolean>(false);
  const formRef = ref<FormInstance>();

  const formData = reactive({
    id: '',
    pointCode: '',
    pointName: '',
    categoryId: undefined,
    spaceId: undefined,
    meteringUnit: '',
  });

  const rules = {
    pointCode: [{ required: true, message: '请输入项目编号' }],
    pointName: [{ required: true, message: '请输入项目名称' }],
    categoryId: [{ required: true, message: '请选择设备类别' }],
    spaceId: [{ required: true, message: '请选择空间位置' }],
    meteringUnit: [{ required: true, message: '请输入计量单位' }],
  };

  // 打开弹窗
  const openModal = (data?: any) => {
    console.log('data', data);
    if (props.isUpdate && data) {
      // 使用解构赋值确保只复制需要的字段
      const { id, pointCode, pointName, categoryId, spaceId, meteringUnit } = data;
      Object.assign(formData, {
        id,
        pointCode,
        pointName,
        categoryId,
        spaceId,
        meteringUnit,
      });
    }
    visible.value = true;
  };

  // 关闭弹窗
  const closeModal = () => {
    visible.value = false;
    formRef.value?.resetFields();
    Object.assign(formData, {
      id: '',
      pointCode: '',
      pointName: '',
      categoryId: undefined,
      spaceId: undefined,
      meteringUnit: '',
    });
  };

  // 确定
  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true;
      try {
        const api = props.isUpdate ? editPoint : addPoint;
        await api(formData);
        emit('success');
        closeModal();
      } catch (error) {
        console.error(error);
      } finally {
        confirmLoading.value = false;
      }
    });
  };

  // 取消
  const handleCancel = () => {
    closeModal();
  };

  // 暴露方法给父组件
  defineExpose({
    openModal,
  });
</script>
