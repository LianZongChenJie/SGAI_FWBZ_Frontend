<template>
  <a-modal :visible="visible" title="设备详情" @cancel="handleCancel" :footer="null" width="800px">
    <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="handleClick" />
    <DynamicForm :formItems="staticData" :showAction="showAction" :loading="formLoading" @save="handleSave" @cancel="visible = false" />
  </a-modal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import DynamicForm from './DynamicForm.vue';
  import { MenuProps } from 'ant-design-vue';
  import { staticDataList, staticDataSave, attributeDataList } from '../Device.api';

  const visible = ref(false);
  const handleCancel = () => {
    current.value = ['base']
    visible.value = false;
  };
  const handleClick = (item: any) => {
    if (item.key == 'point') {
      showAction.value = false;
      // 获取采集点位信息
      findAttributeData(deviceId.value);
    } else {
      showAction.value = true;
      findStaticData(item.key, deviceId.value);
    }
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
    {
      label: '采集点位',
      key: 'point',
    },
  ]);

  const deviceId = ref<number>();
  const staticData = ref<any>([]);
  const showAction = ref(false);
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
    try {
      formLoading.value = true;
      const param = {
        type: type,
        deviceId: deviceId,
      };
      const res = await staticDataList(param);
      staticData.value = res;
    } catch {
      console.log('获取失败');
    }
    formLoading.value = false;
  };

  const findAttributeData = async (deviceId: number) => {
    try {
      formLoading.value = true;
      const param = {
        deviceId: deviceId,
      };
      const res = await attributeDataList(param);
      staticData.value = res;
    } catch {
      console.log('获取失败');
    }
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
