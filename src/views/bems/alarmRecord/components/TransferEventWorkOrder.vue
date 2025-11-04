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
    >
      <a-row>
        <a-col :span="20">
          <a-form-item
            label="联系人"
            name="value1"
            :rules="[{ required: true, message: '请输入联系人!' }]"
          >
            <a-input
              v-model:value="workOrderDetail.value1"
              placeholder="请输入联系人"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="20">
          <a-form-item
            label="联系电话"
            name="value2"
            :rules="[{ required: true, message: '请输入联系电话!' }]"
          >
            <a-input
              v-model:value="workOrderDetail.value2"
              placeholder="请输入联系电话"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="20">
          <a-form-item
            label="详细地址"
            name="value3"
            :rules="[{ required: true, message: '请输入详细地址!' }]"
          >
            <a-cascader v-model:value="workOrderDetail.value3" :options="options" :field-names="fieldNames" placeholder="请输入详细地址" />
          </a-form-item>
        </a-col>

      </a-row>
      <a-row>
        <a-col :span="20">
          <a-form-item
            label="问题描述"
            name="value4"
            :rules="[{ required: true, message: '请输入问题描述!' }]"
          >
            <a-input
              v-model:value="workOrderDetail.value4"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getEventSpaceApi,transferEventApi } from '../Standardized.api';

const open = ref<boolean>(false);

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
  await getEventSpace()
  workOrderDetail.value.id = record.id
  // for(let key in workOrderDetail.value) {
  //     workOrderDetail.value[key] = record[key]
  //   }
  // workOrderDetail.value = record;
  // await getWorkOrderDetail(record.id)
  open.value = true;
};

// 获取地址树结构
const getEventSpace = async () => {
 let res = await getEventSpaceApi()
 options.value = res
}

const handleOk = async (e: MouseEvent) => {
  // let res = await transferEventApi(workOrderDetail.value)
  message.success('转工单成功！');
  open.value = false;
};

const closeModal = () => {
  workOrderDetail.value.value1 = ''
  workOrderDetail.value.value2 = ''
  workOrderDetail.value.value3 = []
  workOrderDetail.value.value4 = ''
  open.value = false;
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