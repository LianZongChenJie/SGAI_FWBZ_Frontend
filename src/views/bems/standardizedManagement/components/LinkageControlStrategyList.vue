<template>

  <div class="linkage-ontro-sStrategy-list-box">
    <div class="step-box" v-if="props.type === 'create'">
      <a-steps
        :current="current"
        :items="stpesItems"
      ></a-steps>
    </div>
    <div class="info-title">
      联动控制策略列表
    </div>
    <div class="info-list">
      <a-form
        :model="formState"
        ref="formRef"
        layout="inline"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        :disabled="props.type === 'check'"
      >
        <div class="list-title">
          策略基本信息
        </div>
        <div class="list-form">
          <a-row :gutter="16">
            <a-col
              :span="5"
              v-if="props.type !== 'create'"
            >
              <a-form-item
                label="策略编号"
                name="strategyCode"
                :rules="[{ required: true, message: '请输入策略编号' }]"
              >
                <a-input
                  v-model:value="formState.strategyCode"
                  :disabled="current !== 0"
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="策略名称"
                name="strategyName"
                :rules="[{ required: true, message: '请输入策略名称' }]"
              >
                <a-input
                  v-model:value="formState.strategyName"
                  :disabled="current !== 0"
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="策略目标"
                name="strategyTarget"
                :rules="[{ required: true, message: '请输入策略目标' }]"
              >
                <a-input
                  v-model:value="formState.strategyTarget"
                  :disabled="current !== 0"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        <div
          class="list-title"
          v-show="current > 0 || props.type === 'edit'"
        >
          <span>前置设备设置</span><a
            @click="addFrontPoint"
            v-if="props.type !== 'check' && current === 1 || props.type === 'edit'"
          >添加</a>
        </div>
        <div
          class="list-form"
          v-show="current > 0 || props.type === 'edit'"
        >
          <a-row
            :gutter="16"
            v-for="(item, index) in formState.frontPointList"
            :key="index"
            style="margin-bottom: 10px;"
          >
            <a-col :span="5">
              <a-form-item
                label="启动设备"
                :name="['frontPointList', index, 'deviceName']"
                :rules="[{ required: true, message: '请输入启动设备' }]"
              >
                <a-input
                  v-model:value="item.deviceName"
                  @click="selectDevice(0, index)"
                  :disabled="current !== 1  && props.type !== 'edit'"
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="空间位置"
                :name="['frontPointList', index, 'spaceName']"
              >
                <a-input
                  v-model:value="item.spaceName"
                  disabled
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="点位选择"
                :name="['frontPointList', index, 'pointId']"
                :rules="[{ required: true, message: '请选择点位' }]"
              >
                <a-select
                  v-model:value="item.pointId"
                  :options="item.devicePointData"
                  :disabled="current !== 1 && props.type !== 'edit'"
                >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="点位设定" :name="['frontPointList', index, 'operator']" :rules="[{ required: true, message: '请设置点位' }]">
                <div class="arr-list-box">
                  <a-input-group compact>
                    <a-form-item
                      :name="['frontPointList', index, 'operator']"
                      :rules="[{ required: true, message: '请设置点位' }]"
                      no-style
                    >
                      <a-select
                        v-model:value="item.operator"
                        style="width: 30%"
                        :options="operatorList"
                        :disabled="current !== 1 && props.type !== 'edit'"
                      >
                      </a-select>
                    </a-form-item>
                    <a-form-item
                      :name="['frontPointList', index, 'conditionValue']"
                      :rules="[{ required: true, message: '请输入数值' }]"
                      no-style
                    >
                      <a-input
                        v-model:value="item.conditionValue"
                        style="width: 70%"
                        placeholder="数值"
                        type="number"
                        :disabled="current !== 1 && props.type !== 'edit'"
                      />
                    </a-form-item>
                  </a-input-group>
                  &emsp;
                  <div
                    class="icon-box"
                    v-if="props.type !== 'check' && current === 1 && props.type !== 'edit'"
                  >
                    <a @click="deleteFrontPoint(index)">
                      <MinusOutlined style="font-size: 20px;" />
                    </a>
                    &emsp;
                    <a @click="addFrontPoint" v-show="index === (formState.frontPointList.length - 1)">
                      <PlusOutlined style="font-size: 20px;" />
                    </a>
                  </div>
                </div>
              </a-form-item>
            </a-col>

          </a-row>
        </div>
        <div
          class="list-title"
          v-show="current > 1 || props.type === 'edit'"
        >
          <span>联动设备控制</span><a
            @click="addRearPoint"
            v-if="props.type !== 'check'"
          >添加</a>
        </div>
        <div
          class="list-form"
          v-show="current > 1 || props.type === 'edit'"
        >
          <a-row
            :gutter="16"
            v-for="(item,index) in formState.rearPointList"
            :key="index"
            style="margin-bottom: 10px;"
          >
            <a-col :span="5">
              <a-form-item
                label="联动设备"
                :name="['rearPointList', index, 'deviceName']"
                :rules="[{ required: true, message: '请选择联动设备' }]"
              >
                <a-input
                  v-model:value="item.deviceName"
                  @click="selectDevice(1, index)"
                  :disabled="current !== 2  && props.type !== 'edit'"
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="空间位置"
                :name="['rearPointList', index, 'spaceName']"
              >
                <a-input
                  v-model:value="item.spaceName"
                  disabled
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="点位选择"
                :name="['rearPointList', index, 'pointId']"
                :rules="[{ required: true, message: '请选择点位' }]"
              >
                <a-select
                  v-model:value="item.pointId"
                  :options="item.devicePointData"
                  :disabled="current !== 2 && props.type !== 'edit'"
                >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="点位设定"
                :name="['rearPointList', index, 'conditionValue']"
                :rules="[{ required: true, message: '请输入数值' }]"
              >
                <div class="arr-list-box">
                  <a-input-group compact>
                    <a-select
                      v-model:value="item.operator"
                      style="width: 30%"
                      :options="operatorList"
                      disabled
                    >
                    </a-select>
                    <a-input
                      v-model:value="item.conditionValue"
                      style="width: 70%"
                      placeholder="数值"
                      type="number"
                      :disabled="current !== 2 && props.type !== 'edit'"
                    />
                  </a-input-group>
                  &emsp;
                  <div
                    class="icon-box"
                    v-if="props.type !== 'check' && (current === 2 || props.type === 'edit')"
                  >
                    <a @click="deleteRearPoint(index)">
                      <MinusOutlined style="font-size: 20px;" />
                    </a>
                    &emsp;
                    <a @click="addRearPoint" v-show="index === (formState.rearPointList.length - 1)">
                      <PlusOutlined style="font-size: 20px;" />
                    </a>
                  </div>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </div>
    <div class="button-box">
      <a-button
        @click="previousStep"
        v-show="current !== 0 && props.type === 'create'"
        style="margin-right: 18px;"
      >上一步</a-button>
      <a-button
        type="primary"
        @click="nextStep"
        v-show="current !== 3 && props.type === 'create'"
        style="margin-right: 18px;"
      >下一步</a-button>
      <a-button
        @click="cancel"
        style="margin-right: 18px;"
      >返回</a-button>
      <a-button
        type="primary"
        @click="onSubmit"
        v-if="props.type !== 'check' && current === 3 || props.type === 'edit'"
      >保存</a-button>

    </div>
    <device-table-modal
      ref="deviceRef"
      :setDeviceName="setDeviceName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, createVNode, onMounted } from 'vue';
import { PlusOutlined, MinusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { Modal } from 'ant-design-vue';
import { createLinkageControlApi, getPontByDeviceIdApi, getLinkageControlDetailApi, editLinkageControlApi } from '../Standardized.api';
import DeviceTableModal from './DeviceTableModal.vue';

const props = defineProps({
  closeStrategy: {
    type: Function,
    default: () => {},
  },
  type: {
    type: String,
    default: '',
  },
  editItem: {
    type: Object,
    default: {},
  },
});

const current = ref<number>(0);

const steps = [
  {
    title: '策略基本信息填写',
    content: 'First-content',
  },
  {
    title: '前置设备设置',
    content: 'Second-content',
  },
  {
    title: '联动设备控制',
    content: 'Last-content',
  },
  {
    title: '确认',
    content: 'Last-content',
  },
];
const stpesItems = steps.map((item) => ({ key: item.title, title: item.title }));

const formRef = ref();
const deviceRef = ref();

// 表单数据
const formState = reactive<any>({
  id: '',
  strategyCode: '',
  strategyName: '',
  strategyTarget: '',
  frontPointList: [],
  rearPointList: [],
});

const deviceType = ref<number>();
const targetIndex = ref<number>(0);

const operatorList = [
  {
    label: '<',
    value: '<',
  },
  {
    label: '<=',
    value: '<=',
  },
  {
    label: '>=',
    value: '>=',
  },
  {
    label: '>',
    value: '>',
  },
  {
    label: '=',
    value: '=',
  },
  {
    label: '!=',
    value: '!=',
  },
];

// 添加前置设备
const addFrontPoint = () => {
  let length = formState.frontPointList?.length;
  if (
    length &&
    (!formState.frontPointList[length - 1]?.deviceName ||
      !formState.frontPointList[length - 1]?.pointId ||
      !formState.frontPointList[length - 1]?.operator ||
      !formState.frontPointList[length - 1]?.conditionValue)
  ) {
    formRef.value
      .validateFields([
        ['frontPointList', formState.frontPointList.length - 1, 'deviceName'],
        ['frontPointList', formState.frontPointList.length - 1, 'pointId'],
        ['frontPointList', formState.frontPointList.length - 1, 'operator'],
        ['frontPointList', formState.frontPointList.length - 1, 'conditionValue'],
      ])
      .then(() => {})
      .catch((error) => {
        console.log('error', error);
      });
    return;
  } else {
    formState.frontPointList.push({
      deviceId: '',
      deviceName: '',
      spaceName: '',
      pointId: '',
      pointName: '',
      operator: '',
      conditionValue: '',
      devicePointData: [],
    });
  }
};
// 删除前置设备
const deleteFrontPoint = (index) => {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除不可恢复，是否确定删除?',
    onOk() {
      formState.frontPointList.splice(index,1);
      message.success('删除成功！');
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

// 添加联动设备
const addRearPoint = () => {
  let length = formState.rearPointList?.length;
  if (
    length &&
    (!formState.rearPointList[length - 1]?.deviceName ||
      !formState.rearPointList[length - 1]?.pointId ||
      !formState.rearPointList[length - 1]?.conditionValue)
  ) {
    formRef.value
      .validateFields([
        ['rearPointList', formState.rearPointList.length - 1, 'deviceName'],
        ['rearPointList', formState.rearPointList.length - 1, 'pointId'],
        ['rearPointList', formState.rearPointList.length - 1, 'conditionValue'],
      ])
      .then(() => {})
      .catch((error) => {
        console.log('error', error);
      });
    return;
  } else {
    formState.rearPointList.push({
      deviceId: '',
      deviceName: '',
      spaceName: '',
      pointId: '',
      pointName: '',
      operator: '=',
      conditionValue: '',
    });
  }
};
// 删除联动设备
const deleteRearPoint = (index) => {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除不可恢复，是否确定删除?',
    onOk() {
      formState.rearPointList.splice(index,1);
      message.success('删除成功！');
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

// 选择设备绑定
const selectDevice = (type: number, index: number) => {
  deviceType.value = type;
  targetIndex.value = index;
  deviceRef.value.showModal();
};

// 确认设备
const setDeviceName = async (type, record) => {
  if (deviceType.value) {
    formState.rearPointList[targetIndex.value].deviceName = record.deviceName;
    let deviceId = '';
    if (type) {
      formState.rearPointList[targetIndex.value].deviceId = record.id;
      deviceId = record.id;
    } else {
      formState.rearPointList[targetIndex.value].deviceId = record.deviceId;
      deviceId = record.deviceId;
    }
    let res = await getPontByDeviceIdApi({ deviceId: deviceId });
    // let res = await getPontByDeviceIdApi({ deviceId: 108 });
    formState.rearPointList[targetIndex.value].devicePointData = res.map((item) => {
      return {
        value: item.id,
        label: item.attributeName,
      };
    });
  } else {
    formState.frontPointList[targetIndex.value].deviceName = record.deviceName;
    let deviceId = '';
    if (type) {
      formState.frontPointList[targetIndex.value].deviceId = record.id;
      deviceId = record.id;
    } else {
      formState.frontPointList[targetIndex.value].deviceId = record.deviceId;
      deviceId = record.deviceId;
    }
    let res = await getPontByDeviceIdApi({ deviceId: deviceId });
    // let res = await getPontByDeviceIdApi({ deviceId: 108 });
    formState.frontPointList[targetIndex.value].devicePointData = res.map((item) => {
      return {
        value: item.id,
        label: item.attributeName,
      };
    });
  }
  deviceRef.value.closeModal();
};

// 提交表单
const onSubmit = async () => {
  if (!formState.frontPointList.length || !formState.rearPointList.length) {
    message.error('请添加设备');
    return;
  }
  formRef.value
    .validate()
    .then(async () => {
      if (props.type === 'create') {
        await createLinkageControlApi(toRaw(formState));
        message.success('创建成功！');
      } else {
        await editLinkageControlApi(toRaw(formState));
        message.success('修改成功！');
      }
      resetForm();
      props.closeStrategy();
    })
    .catch((error) => {
      console.log('error', error);
    });
};

// 返回
const cancel = () => {
  resetForm();
  props.closeStrategy();
};

// 重置表单
const resetForm = () => {
  formRef.value.resetFields();
};

const nextStep = () => {
  switch (current.value) {
    case 0:
    formRef.value
        .validateFields([
        'strategyName',
        'strategyTarget',
        ])
        .then(() => {
          current.value++;
        })
        .catch((error) => {
          console.log('error', error);
        });
      break;
    case 1:
      let frontPointListLength = formState.frontPointList?.length;
      formRef.value
        .validateFields([
          ['frontPointList', frontPointListLength - 1, 'deviceName'],
          ['frontPointList', frontPointListLength - 1, 'pointId'],
          ['frontPointList', frontPointListLength - 1, 'conditionValue'],
        ])
        .then(() => {
          current.value++;
        })
        .catch((error) => {
          console.log('error', error);
        });
      break;
    case 2:
      let rearPointListLength = formState.rearPointList?.length;
      formRef.value
        .validateFields([
          ['rearPointList', rearPointListLength - 1, 'deviceName'],
          ['rearPointList', rearPointListLength - 1, 'pointId'],
          ['rearPointList', rearPointListLength - 1, 'conditionValue'],
        ])
        .then(() => {
          current.value++;
        })
        .catch((error) => {
          console.log('error', error);
        });
      break;
    case 3:
      current.value++;
      break;
  }
};

const previousStep = () => {
  current.value--;
};

onMounted(async () => {
  if (props.type === 'edit' || props.type === 'check') {
    let res = await getLinkageControlDetailApi({ id: props.editItem.id });
    formState.id = props.editItem.id;
    formState.strategyCode = res.strategyCode;
    formState.strategyName = res.strategyName;
    formState.strategyTarget = res.strategyTarget;
    if (!Array.isArray(res.rearPointList)) {
      formState.rearPointList = [];
    } else {
      deviceType.value = 1;
      formState.rearPointList = res.rearPointList;
      formState.rearPointList.forEach((item) => {
        setDeviceName(0, item);
      });
    }
    if (!Array.isArray(res.frontPointList)) {
      formState.frontPointList = [];
    } else {
      deviceType.value = 0;
      formState.frontPointList = res.frontPointList;
      formState.frontPointList.forEach((item) => {
        setDeviceName(0, item);
      });
    }
  }
});
</script>

<style scoped lang="less">
.linkage-ontro-sStrategy-list-box {
  .step-box {
    padding: 24px 15%;
    margin-bottom: 12px;
  }
  .info-title {
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background-color: #374352;
    border-radius: 5px 5px 0 0;
  }

  .info-list {
    padding: 0 16px 16px 16px;
    border: 1px solid #d4d0d0;

    .list-title {
      width: 100%;
      height: 40px;
      padding-left: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #d4d0d0;
      margin-top: 10px;
    }

    .list-form {
      width: 100%;
      margin-top: 16px;
      margin-bottom: 10px;
      .icon-box {
        display: flex;
        align-items: center;
      }

      .arr-list-box {
        display: flex;
        align-items: center;
      }
    }
  }

  .button-box {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>