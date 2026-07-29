<template>
  <a-modal
    v-model:open="open"
    title="转事件工单"
    @ok="handleOk"
    @cancel="closeModal"
  >
    <div class="trannsfer-form-box">
      <a-form
        :model="workOrderDetail"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        ref="formRef"
        :rules="rules"
      >
        <a-row>
          <a-col :span="20">
            <a-form-item
              label="联系人"
              name="contractPeople"
              :rules="[{ required: true, message: '请输入联系人!' }]"
            >
              <a-input
                v-model:value="workOrderDetail.contractPeople"
                placeholder="请输入联系人"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="20">
            <a-form-item
              label="联系电话"
              name="contractPhone"
              :rules="[{ required: true, message: '请输入联系电话!' }]"
            >
              <a-input
                v-model:value="workOrderDetail.contractPhone"
                placeholder="请输入联系电话"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="20">
            <a-form-item
              label="详细地址"
              name="spaceId"
              :rules="[{ required: true, message: '请输入详细地址!' }]"
            >
              <a-cascader
                v-model:value="workOrderDetail.spaceId"
                :options="options"
                :field-names="fieldNames"
                placeholder="请输入详细地址"
                @change="handleAddress"
              />
            </a-form-item>
          </a-col>

        </a-row>
        <a-row>
          <a-col :span="20">
            <a-form-item
              label="问题描述"
              name="description"
              :rules="[{ required: true, message: '请输入问题描述!' }]"
            >
              <a-input
                v-model:value="workOrderDetail.description"
                placeholder="请输入问题描述"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, toRaw, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getEventSpaceApi, transferEventApi } from '../Standardized.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {}
  }
})

const open = ref<boolean>(false);

const formRef = ref();

// // 验证规则
// const rules = {
//   contractPhone: [
//     {
//       required: true,
//       message: '联系电话不能为空!',
//       trigger: 'blur'
//     },
//     {
//       pattern: /^1[3-9]\d{9}$/,
//       message: '请输入正确的联系电话!',
//       trigger: 'blur'
//     }
//   ]
// };

const options = ref([
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          {
            value: 'xihu',
            label: '西湖',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '北京',
    children: [
      {
        value: 'nanjing',
        label: '石景山',
        children: [
          {
            value: 'zhonghuamen',
            label: '首钢园',
          },
        ],
      },
    ],
  },
]);

const fieldNames = ref({
  label: 'name',
  // label: 'label',
  value: 'id',
  // value: 'value',
  children: 'children',
});

const workOrderDetail = ref<any>({
  recordId: '',
  contractPeople: '',
  contractPhone: [],
  spaceId: '',
  address: '',
  spaceName: '',
  description: '',
});

// 打开弹框
const showModal = async (record) => {
  await getEventSpace();

  for (let key in workOrderDetail.value) {
    workOrderDetail.value[key] = record[key];
  }
  workOrderDetail.value.description = record.alarmContent;
  workOrderDetail.value.spaceId = '';
  workOrderDetail.value.recordId = record.id;
  // await getWorkOrderDetail(record.id)
  open.value = true;
};

// 获取地址树结构
const getEventSpace = async () => {
  let res = await getEventSpaceApi();
  options.value = res;
};

// 选择地址
const handleAddress = (val, val2) => {
  workOrderDetail.value.address = val2.map((item) => item.name).join(',');
};

const handleOk = async (e: MouseEvent) => {
  formRef.value
    .validate()
    .then(async () => {
      workOrderDetail.value.spaceId = workOrderDetail.value.spaceId[workOrderDetail.value.spaceId.length - 1];
      let res = await transferEventApi(workOrderDetail.value);
      message.success('转工单成功！');
      closeModal();
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const closeModal = () => {
  for (let key in workOrderDetail.value) {
    workOrderDetail.value[key] = '';
  }
  open.value = false;
  props.reload()
};

onMounted(async () => {});

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
.trannsfer-form-box {
  padding-top: 12px;
}
</style>