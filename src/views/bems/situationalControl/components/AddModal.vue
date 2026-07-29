<template>
  <div class="device-box-modal">
    <a-modal
      v-model:open="open"
      :title="type === 'create' ? '新建' : '编辑'"
      :footer="null"
      width="500px"
      @cancel="reset"
      :destroyOnClose="true"
    >
      <div class="form-box">
        <a-form
          ref="formSateRef"
          :model="formState"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-row :gutter="8">
            <a-col :span="24">
              <a-form-item
                label="空间名称"
                name="spaceName"
                :rules="[{ required: true, message: '请输入空间名称!' }]"
              >
                <a-input placeholder="请输入空间名称" v-model:value="formState.spaceName" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="节目名称"
                name="groupName"
                :rules="[{ required: true, message: '请输入节目名称!' }]"
              >
                <a-input placeholder="请输入节目名称" v-model:value="formState.groupName" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="关联类型"
                name="relType"
                :rules="[{ required: true, message: '请选择关联类型!' }]"
              >
                <a-select placeholder="请选择关联类型" v-model:value="formState.relType">
                  <a-select-option value="1">总控系统</a-select-option>
                  <a-select-option value="2"> 回路</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="formState.relType === '1'">
              <a-form-item
                label="节目ID"
                name="groupId"
                :rules="[{ required: true, message: '请选择关总控系统节目!' }]"
              >
                <a-input placeholder="请输入节目ID" v-model:value="formState.groupId" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <div class="button-box">
          <a-button
            v-if="type === 'create'"
            @click="reset"
          >
            重置
          </a-button>
          &emsp;
          <a-button @click="closeModal">
            取消
          </a-button>
          &emsp;
          <a-button
            type="primary"
            @click="onSubmit"
          >
            确定
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { addScenariosApi, editScenariosApi } from '../Standardized.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

const formSateRef = ref();

interface FormState {
  id: string | null;
  spaceName: string | null;
  groupName: string | null;
  relType: string | null;
  groupId: string | null;
}

// 弹框类型
const type = ref('create');

const formState = ref<FormState>({
  id: null,
  spaceName: null,
  groupName: null,
  relType: null,
  groupId: null,
});

const categoryTreeData = ref([]);

// 打开弹框
const showModal = async (types, record: any = {}) => {
  if (types) {
    type.value = 'edit';
    formState.value.id = record.id;
    formState.value.spaceName = record.spaceName;
    formState.value.groupName = record.groupName + '';
    formState.value.relType = record.relType;
    formState.value.groupId = record.groupId;
  } else {
    type.value = 'create';
  }
  open.value = true;
};

// 提交
const onSubmit = () => {
  formSateRef.value
    .validate()
    .then(async () => {
      if (type.value === 'create') {
        await addScenariosApi(toRaw(formState.value));
        message.success('新增成功！');
      } else {
        await editScenariosApi({
          id: formState.value.id,
          spaceName: formState.value.spaceName,
          groupName: formState.value.groupName,
          relType: formState.value.relType,
          groupId: formState.value.groupId,
        });
        message.success('修改成功！');
      }
      formSateRef.value.resetFields();
      props.reload();
      open.value = false;
    })
    .catch((error) => {
      console.log('error', error);
    });
};

// 重置
const reset = () => {
  formSateRef.value.resetFields();
  formState.value.id = null
  formState.value.spaceName = null
  formState.value.groupName = null
  formState.value.relType = null
  formState.value.groupId = null
};

const closeModal = () => {
  reset();
  open.value = false;
};


onMounted(async () => {
  
});

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
.form-box {
  width: 100%;
  padding: 5px 10px;
  padding-right: 0px;

  .button-box {
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>