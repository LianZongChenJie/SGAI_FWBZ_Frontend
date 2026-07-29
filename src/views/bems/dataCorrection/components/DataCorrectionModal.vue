<template>
  <a-modal
    v-model:open="open"
    :title="modalTitle"
    @ok="handleOk"
    width="600px"
    :footer="null"
  >
    <div
      class="form-box"
      v-if="open"
    >
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <a-form-item
          label="最终值"
          name="value"
          :rules="[{ required: true, message: '请输入最终值！' }]"
        >
          <a-input v-model:value="formState.value" />
        </a-form-item>
      </a-form>
      <div class="button-box">
        <a-button @click="handleReset ">取消</a-button>
        &emsp;
        &emsp;
        <a-button
          type="primary"
          @click="handleSubmit"
        >保存</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { message } from 'ant-design-vue';
//引入依赖
import { useForm, BasicForm, FormSchema } from '/@/components/Form';
import { editDataValue } from '../Device.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

const id = ref('');

// 弹框标题
const modalTitle = ref<string>('数据修正');

const formState = ref<Record<string, any>>({
  id: '',
  value: '',
});

// 打开弹框
const showModal = async (record) => {
  open.value = true;
  formState.value = { ...record };
};

// 提交表单
const handleSubmit = async () => {
  try {
    let res = await editDataValue([
      {
        id: formState.value.id,
        value: formState.value.value + '',
      },
    ]);
      message.success('修正成功！')
      props.reload()
      open.value = false;
  } catch (error) {
    console.error('表单验证失败:', error);
  } finally {
  }
};

// 重置表单
const handleReset = () => {
  resetFields();
  open.value = false;
};

// 关闭弹框
const handleOk = (e: MouseEvent) => {
  console.log(e);
  open.value = false;
};

const resetFields = () => {
  formState.value.value = '';
};

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.form-box {
  padding: 16px;
  padding-left: 0;

  .button-box {
    display: flex;
    justify-content: center;
  }
}
</style>