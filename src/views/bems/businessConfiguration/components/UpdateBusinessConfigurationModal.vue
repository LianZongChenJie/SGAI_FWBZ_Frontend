<template>
  <a-modal
    v-model:open="open"
    title="新增报警类别"
    width="600px"
  >
    <template #footer>
      <a-button
        key="back"
        @click="closeModal"
      >关闭</a-button>
      <a-button
        key="submit"
        type="primary"
        @click="handleOk"
      >提交</a-button>
    </template>
    <div class="alarm-level-foem-box">
    <a-form
      :model="formState"
      name="basic"
      ref="formRef"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
      <a-form-item
        label="值"
        name="configValue"
        :rules="[{ required: true, message: '请输入类别编号!' }]"
      >
        <a-input v-model:value="formState.configValue" />
      </a-form-item>
    </a-form>
  </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, onMounted } from 'vue';
import { editBusinessConfigApi } from '../Standardized.api';
import { message } from 'ant-design-vue';

const props = defineProps({
  targetItem: {
    type: Object,
    default: {
      name: '测试name',
    },
  },
  reload: {
    type: Function,
    default: () => {}
  }
});

const open = ref<boolean>(false);
const type = ref('create')

const formRef = ref()

interface FormState {
  configValue: string;
  configKey: string;
}

const formState = reactive<FormState>({
  configValue: '',
  configKey: '',
});

// 打开弹框
const showModal = async (key, targetItem?) => {
  type.value = key
  if(key === 'edit') {
    formState.configValue = targetItem.configValue;
    formState.configKey = targetItem.configKey;
  }
  open.value = true;
};

const handleOk = (e: MouseEvent) => {
  formRef.value
    .validate()
    .then(async () => {
      if(type.value === 'create') {
        
      } else {
        await editBusinessConfigApi(toRaw(formState))
        message.success('修改成功！');
        props.reload()
      }
      formRef.value.resetFields();
      open.value = false;
    })
    .catch(error => {
      console.log('error', error);
    });
};

const closeModal = () => {
  formState.configKey = '';
  formState.configValue = '';
  open.value = false;
};

onMounted(async () => {});

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
.alarm-level-foem-box{
  padding: 20px 0 0 0;
}
</style>