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
        label="类别编号"
        name="alarmCategoryCode"
        :rules="[{ required: true, message: '请输入类别编号!' }]"
      >
        <a-input v-model:value="formState.alarmCategoryCode" />
      </a-form-item>
      <a-form-item
        label="类别名称"
        name="alarmCategoryName"
        :rules="[{ required: true, message: '请输入类别名称!' }]"
      >
        <a-input v-model:value="formState.alarmCategoryName" />
      </a-form-item>
      <a-form-item
        label="类别序号"
        name="sort"
        :rules="[{ required: true, message: '请输入类别序号!' }]"
      >
        <a-input v-model:value="formState.sort" type="number"/>
      </a-form-item>
    </a-form>
  </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, onMounted } from 'vue';
import { addAlarmCategoryApi, editAlarmCategoryApi } from '../Standardized.api';
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
  id: string;
  alarmCategoryCode: string;
  alarmCategoryName: string;
  sort: string;
}

const formState = reactive<FormState>({
  id: '',
  alarmCategoryCode: '',
  alarmCategoryName: '',
  sort: '',
});

// 打开弹框
const showModal = async (key, targetItem?) => {
  type.value = key
  if(key === 'edit') {
    formState.id = targetItem.id;
    formState.alarmCategoryCode = targetItem.alarmCategoryCode;
    formState.alarmCategoryName =targetItem.alarmCategoryName;
    formState.sort = targetItem.sort;
  }
  open.value = true;
};

const handleOk = (e: MouseEvent) => {
  formRef.value
    .validate()
    .then(async () => {
      if(type.value === 'create') {
        await addAlarmCategoryApi(toRaw(formState))
        message.success('创建成功！');
        props.reload()
      } else {
        await editAlarmCategoryApi(toRaw(formState))
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
  formState.alarmCategoryCode = '';
  formState.alarmCategoryName ='';
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