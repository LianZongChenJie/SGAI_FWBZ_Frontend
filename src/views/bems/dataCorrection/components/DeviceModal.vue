<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { TreeSelect } from 'ant-design-vue';
  import { saveOrUpdate } from '../Device.api';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  // 表单配置
  const formSchema = [
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

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
    rowProps: { gutter: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      await setFieldsValue({
        ...data.record,
        id: data.record.id, // 确保 id 被设置
      });
    }

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
</script>

<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100%;
  }
</style>
