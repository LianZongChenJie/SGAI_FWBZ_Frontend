<template>
  <a-modal
    v-model:open="open"
    :title="modalTitle"
    @ok="handleOk"
    width="1000px"
    :footer="null"
  >
    <div
      class="form-box"
      v-if="open"
    >
      <BasicForm
        @register="registerForm"
        :schemas="formSchemas"
        :model="formState"
        :labelWidth="100"
        :showActionButtonGroup="false"
      >
        <!--  添加input的插槽  -->
        <template #projectCycle="{ model, field }">
          <a-input
            v-model:value="model[field]"
            type="number"
            placeholder="请输入项目周期"
          >
          </a-input>
        </template>
        <template #projectBudget="{ model, field }">
          <a-input
            v-model:value="model[field]"
            type="number"
            placeholder="请输入项目预算"
          >
          </a-input>
        </template>
        <template #fullPointId="{ model, field }">
          <a-cascader
            v-model:value="model[field]"
            :options="pointIdOptions"
            :field-names="pointIdFieldNames"
            change-on-select
            check-strictly
            placeholder="请选择（可选任意层级）"
            @change="handleChange"
          />
        </template>
        <template #deviceIds="{ model, field }">
          <a-select
            v-model:value="model[field]"
            :options="options"
            mode="multiple"
            :fieldNames="fieldNames"
            placeholder="请选择关联设备"
          >
          </a-select>
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
import {
  addProjectApi,
  getProjectStatusApi,
  getProjectTypeApi,
  getProjectProjectSubjectApi,
  editProjectApi,
  selectDevice,
  getMeteringPointApi,
} from '../Standardized.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

const type = ref(0);

const id = ref('');

// 设备options
const options = ref<any>([]);
const fieldNames = {
  label: 'deviceName',
  key: 'id',
  value: 'id',
};

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
  // {
  //   field: 'projectCompletionTime',
  //   component: 'DatePicker',
  //   label: '结项时间',
  //   colProps: {
  //     span: 8, // 24/3=8
  //   },
  //   componentProps: {
  //     format: 'YYYY-MM-DD HH:mm:ss',
  //     valueFormat: 'YYYY-MM-DD HH:mm:ss',
  //   },
  // },
  {
    field: 'projectCycle',
    component: 'InputNumber',
    label: '项目周期',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    slot: 'projectCycle',
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
    slot: 'projectBudget',
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
    field: 'projectType',
    component: 'ApiSelect',
    label: '节能类型',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 8, // 24/3=8
    },
    componentProps: {
      api: getProjectTypeApi,
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
    field: 'fullPointId',
    component: 'Select',
    label: '计量规则(范围)',
    //自动触发检验，布尔类型
    required: true,
    colProps: {
      span: 12, // 24/3=8
    },
    labelWidth: '140px',
    slot: 'fullPointId',
  },
  {
    field: 'measurementTime',
    component: 'DatePicker',
    label: '节能计量启动时间',
    //自动触发检验，布尔类型
    // required: true,
    helpMessage: '默认为保存时间',
    colProps: {
      span: 12, // 24/3=8
    },
    labelWidth: '170px',
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
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
  // {
  //   field: 'projectStatus',
  //   component: 'Select',
  //   label: '项目状态',
  //   //自动触发检验，布尔类型
  //   required: true,
  //   colProps: {
  //     span: 8, // 24/3=8
  //   },
  //   defaultValue: '1',
  //   // componentProps: {
  //   //   api: getProjectStatusApi,
  //   // },
  //   componentProps: {
  //     options: [
  //       { label: '执行中', value: '1' },
  //       { label: '已暂停', value: '2' },
  //       { label: '已完成', value: '3' },
  //       // 这里需要根据实际数据补充选项
  //     ],
  //   },
  // },
  // {
  //   field: 'projectResultAttachments',
  //   component: 'JUpload',
  //   // helpMessage: '无限制上传',
  //   label: '项目成果',
  //   colProps: {
  //     span: 24, // 24/3=8
  //   },
  // },
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
  fullPointId: '',
  pointId: '',
  projectType: '',
});

// 获取点位数据树
const getMeteringPoint = async () => {
  let res = await getMeteringPointApi();
  pointIdOptions.value = res;
};

// 获取设备数据
const getDeviceOptions = async () => {
  let res = await selectDevice({
    pageNo: 1,
    pageSize: 9999999,
  });
  options.value = [...res.records];
};

const selectedValue = ref([]);

const pointIdOptions = ref([
  {
    value: 'zhejiang',
    label: '浙江省',
    children: [
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          {
            value: 'xihu',
            label: '西湖区',
          },
          {
            value: 'xiasha',
            label: '下沙区',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      {
        value: 'nanjing',
        label: '南京市',
        children: [
          {
            value: 'zhonghuamen',
            label: '中华门',
          },
        ],
      },
    ],
  },
]);

const pointIdFieldNames = ref({
  label: 'nodeName',
  // label: 'label',
  value: 'id',
  // value: 'value',
  children: 'children',
});

const handleChange = (value, selectedOptions) => {
  console.log('选中的值:', value);
  console.log('选中的选项:', selectedOptions);

  // 过滤掉第一层选项
  if (value.length > 0 && selectedOptions.length > 0) {
    // 检查是否选择了第一层
    if (selectedOptions.length === 1) {
      setFieldsValue({
        fullPointId: '',
      });
      return;
    }

    // 处理有效的选择（非第一层）
    processValidSelection(value, selectedOptions);
  }
};

// 处理有效的选择
const processValidSelection = (value, selectedOptions) => {
  // 这里可以处理你的业务逻辑
  console.log('有效的选择:', value);
};

// 打开弹框
const showModal = async (types, record) => {
  await getMeteringPoint();
  record.deviceIds ? (record.deviceIds = record.deviceList.map((item) => item.id)) : undefined;
  await getDeviceOptions();
  open.value = true;
  type.value = types;
  id.value = record.id;
  let pointArr = record.fullPointId.split(',').map((item) => Number(item));
  if (types) {
    modalTitle.value = '修改';
    formSchemas.forEach((item) => {
      let key = item.field;
      setFieldsValue({
        key: record[item.field],
      });
    });
    await nextTick();
    setFieldsValue(record);
    setFieldsValue({
      fullPointId: pointArr,
    });
  } else {
    modalTitle.value = '新增';
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    const values = await validate();
    let pointIdArr = values.fullPointId.split(',');
    values.pointId = pointIdArr[pointIdArr.length - 1];
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