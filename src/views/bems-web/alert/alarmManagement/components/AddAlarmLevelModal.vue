<template>
  <a-modal
    v-model:open="open"
    title="新增报警级别"
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
        label="等级编号"
        name="alarmLevelCode"
        :rules="[{ required: true, message: '请输入等级编号!' }]"
      >
        <a-input v-model:value="formState.alarmLevelCode" />
      </a-form-item>
      <a-form-item
        label="等级名称"
        name="alarmLevelName"
        :rules="[{ required: true, message: '请输入等级名称!' }]"
      >
        <a-input v-model:value="formState.alarmLevelName" />
      </a-form-item>
      <a-form-item
        label="等级序号"
        name="sort"
        :rules="[{ required: true, message: '请输入等级序号!' }]"
      >
        <a-input v-model:value="formState.sort" type="number"/>
      </a-form-item>
    </a-form>
  </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, onMounted } from 'vue';
import { addAlarmLevelApi, editAlarmLevelApi } from '../Standardized.api';

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
  id: string;
  alarmLevelCode: string;
  alarmLevelName: string;
  sort: string;
}

const formState = reactive<FormState>({
  id: '',
  alarmLevelCode: '',
  alarmLevelName: '',
  sort: '',
});

// 打开弹框
const showModal = async (key, targetItem?) => {
  type.value = key
  if(key === 'edit') {
    formState.id = targetItem.id;
    formState.alarmLevelCode = targetItem.alarmLevelCode;
    formState.alarmLevelName =targetItem.alarmLevelName;
    formState.sort = targetItem.sort;
  }
  open.value = true;
};

const handleOk = (e: MouseEvent) => {
  formRef.value
    .validate()
    .then(async () => {
      if(type.value === 'create') {
        await addAlarmLevelApi(toRaw(formState))
        props.reload()
      } else {
        await editAlarmLevelApi(toRaw(formState))
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
  formState.alarmLevelCode = '';
  formState.alarmLevelName ='';
  formState.sort = '';
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