<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" showFooter :width="adaptiveWidth" :title="title" @ok="handleSubmit">
    <BasicForm @register="registerForm" class="menuForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  import { fjpgDeviceEditApi } from '../Standardized.api';
  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const { adaptiveWidth } = useDrawerAdaptiveWidth();
  const formSchema = ref<FormSchema[]>([
    {
      field: 'INDOOR_TEMP',
      label: '室内温度',
      component: 'Input',
    },
    {
      field: 'TEMP_SETTING',
      label: '温度设定',
      component: 'Input',
    },
    {
      field: 'RUNNING_MODE',
      label: '运行模式',
      component: 'Input',
    },
    {
      field: 'RUNNING_STATUS',
      label: '运行状态',
      component: 'Input',
    },
    {
      field: 'KEYLOCK',
      label: '键盘锁定',
      component: 'Input',
    },
    {
      field: 'FAN_SPEED_MODE',
      label: '风速模式',
      component: 'Input',
    },
  ]);
  const title = ref('');
  const attributes = ref<any>();
  const [registerForm, { setProps, resetFields, setFieldsValue, updateSchema, validate, clearValidate }] = useForm({
    labelCol: {
      md: { span: 4 },
      sm: { span: 6 },
    },
    wrapperCol: {
      md: { span: 20 },
      sm: { span: 18 },
    },
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  const singleConfig = ref<any>();
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    console.log(data.record, 'data');
    setDrawerProps({ confirmLoading: false });
    if (data.isMultiple) {
      title.value = '批量操作';
      attributes.value = [];
      data.record.forEach((item) => {
        item.attributes.forEach((attr) => {
          attributes.value.push(attr);
        });
      });
      singleConfig.value = data.record[0].attributes;
    } else {
      title.value = data.record.spaceName + '-' + data.record.deviceCode;
      attributes.value = data.record.attributes;
      singleConfig.value = data.record.attributes;
      setFieldsValue(data.record);
    }
    singleConfig.value.forEach((item) => {
      if (item.valueConfig) {
        item.options = JSON.parse(item.valueConfig.options);
      }
    });
    const newSchema = [];
    formSchema.value.forEach((item) => {
      singleConfig.value.forEach((attr) => {
        if (attr.attributeCode === item.field && attr.options) {
          item.component = 'Select';
          item.componentProps = {
            options: attr.options,
          };
        }
        newSchema.push(item);
      });
    });
    updateSchema(newSchema);

    console.log(attributes.value, 'attributes.value');
  });
  //提交事件
  async function handleSubmit() {
    const params: any = [];
    try {
      const values = await validate();
      for (const key in values) {
        for (const item of attributes.value) {
          if (item.attributeCode === key) {
            params.push({
              deviceAttributeId: item.id,
              values: values[key],
            });
          }
        }
      }
      console.log(params);
      setDrawerProps({ confirmLoading: true });
      //提交表单
      await fjpgDeviceEditApi(params);
      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
