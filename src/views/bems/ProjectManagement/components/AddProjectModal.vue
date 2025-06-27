<template>
  <a-modal
    v-model:open="open"
    :title="modalTitle"
    @ok="handleOk"
    width="1000px"
    :footer="null"
  >
    <div class="form-box">
      <BasicForm
        @register="registerForm"
        :schemas="formSchemas"
        :model="formState"
        :labelWidth="100"
        :showActionButtonGroup="false"
      >
      <!--  添加input的插槽  -->
    <template #projectCycle="{ model, field }">
      <a-input v-model:value="model[field]" type="number" placeholder="请输入项目周期">
      </a-input>
    </template>
    <template #projectBudget="{ model, field }">
      <a-input v-model:value="model[field]" type="number" placeholder="请输入项目预算">
      </a-input>
    </template>
    <template #incomeCycle="{ model, field }">
      <a-input v-model:value="model[field]" type="number" placeholder="请输入收益周期">
      </a-input>
    </template>
      </BasicForm>
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
import { addProjectApi, getProjectStatusApi, getProjectProjectSubjectApi, editProjectApi } from '../Standardized.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

const type = ref(0);

const id = ref('');

// 弹框标题
const modalTitle = ref<string>('新增');

//自定义表单字段
const formSchemas: FormSchema[] = [
  {
    field: 'projectName',
    component: 'JInput',
    label: '项目名称',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
  },
  {
    field: 'projectEstablishmentTime',
    component: 'DatePicker',
    label: '立项时间',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    field: 'projectCycle',
    component: 'InputNumber',
    label: '项目周期',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    slot: 'projectCycle'
  },
  {
    field: 'projectBudget',
    component: 'InputNumber',
    label: '项目预算',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    slot: 'projectBudget'
  },
  {
    field: 'projectSubject',
    component: 'ApiSelect',
    label: '项目主体',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    componentProps: {
      api: getProjectProjectSubjectApi,
    },
  },
  {
    field: 'incomeCycle',
    component: 'InputNumber',
    label: '收益周期',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    slot: 'incomeCycle'
  },
  {
    field: 'projectFiles',
    component: 'JUpload',
    // helpMessage: '无限制上传',
    label: '项目文件',
    colProps: {
      span: 24, // 24/3=8
    },
  },
  {
    field: 'projectGoal',
    component: 'InputTextArea',
    label: '项目目标',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 24, // 24/3=8
    },
  },
  {
    field: 'projectStatus',
    component: 'ApiSelect',
    label: '项目状态',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    componentProps: {
      api: getProjectStatusApi,
    },
  },
  {
    field: 'projectResultAttachments',
    component: 'JUpload',
    // helpMessage: '无限制上传',
    label: '项目成果',
    colProps: {
      span: 24, // 24/3=8
    },
  },
];

/**
 * BasicForm绑定注册;
 */
const [registerForm, { validate, resetFields, setFieldsValue }] = useForm();

const formState = ref<Record<string, any>>({
  id: '',
  projectName: '',
  projectEstablishmentTime: '',
  projectCycle: '',
  projectBudget: '',
  projectSubject: '',
  incomeCycle: '',
  projectFiles: [],
  projectGoal: '',
  projectStatus: '',
  projectResultAttachments: '',
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
  sysOrgCode: '',
});

// 打开弹框
const showModal = async (types, record) => {
  open.value = true;
  type.value = types;
  id.value = record.id;
  if (types) {
    modalTitle.value = '修改';
    console.log('record------------>', record);
    await nextTick();
    formSchemas.forEach((item) => {
      let key = item.field;
      setFieldsValue({
        key: record[item.field],
      });
    });
    setFieldsValue(record);
  } else {
    modalTitle.value = '新增';
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    const values = await validate();
    let params = {
      ...values,
    };
    params.projectName = params.projectName.includes('*') ? params.projectName.split('*')[1] : params.projectName;
    if (type.value) {
      params.id = id.value;
      let res = await editProjectApi(params);
      if (res) {
        // message.success('启用成功！');
        resetFields();
        open.value = false;
        props.reload();
      }
    } else {
      let res = await addProjectApi(params);
      if (res) {
        // message.success('启用成功！');
        resetFields();
        open.value = false;
        props.reload();
      }
    }
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