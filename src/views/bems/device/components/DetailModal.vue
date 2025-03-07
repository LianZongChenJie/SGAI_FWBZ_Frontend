<template>
  <a-modal :visible="visible" title="设备详情" @cancel="handleCancel" :footer="null" width="800px">
    <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="handleClick" />
    <DynamicForm :formItems="staticData" :loading="formLoading" @save="handleSave" @cancel="visible = false" />
  </a-modal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import DynamicForm from './DynamicForm.vue';
  import { MenuProps } from 'ant-design-vue';
  import { staticDataList, staticDataSave } from '../Device.api';

  const visible = ref(false);
  const handleCancel = () => {
    visible.value = false;
  };
  const handleClick = (item: any) => {
    findStaticData(item.key, deviceId.value);
  };
  const current = ref<string[]>(['base']);
  const items = ref<MenuProps['items']>([
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
  ]);

  const deviceId = ref<number>();
  const staticData = ref<any>([]);
  const formLoading = ref(false);

  const handleSave = async (formData) => {
    const param = {
      deviceId: deviceId.value,
      staticDataList: formData,
    };
    try {
      formLoading.value = true;
      await staticDataSave(param);
    } catch {
      console.log('保存失败');
    }
    formLoading.value = false;
  };

  const findStaticData = async (type: string, deviceId: number) => {
    formLoading.value = true;
    const param = {
      type: type,
      deviceId: deviceId,
    };
    const res = await staticDataList(param);
    staticData.value = res;
    formLoading.value = false;
  };

  defineExpose({
    openModal: (id: number) => {
      visible.value = true;
      deviceId.value = id;
      findStaticData('base', id);
    },
  });
</script>
<style lang="less" scoped></style>
