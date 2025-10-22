<template>

  <div class="linkage-ontro-sStrategy-list-box">
    <div class="step-box" v-if="props.type === 'create'">
      <a-steps
        :current="current"
        :items="stpesItems"
      ></a-steps>
    </div>
    <div class="info-title">
      策略定义
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
          <span>
            <ProfileOutlined />&ensp;策略基本信息
          </span>
        </div>
        <div class="list-form">
          <a-row
            :gutter="16"
            class="row-with-margin"
          >
            <a-col :span="5">
              <a-form-item
                label="策略编号"
                name="strategyCode"
              >
                <a-input v-model:value="formState.strategyCode" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="策略名称"
                name="strategyName"
                :rules="[{ required: true, message: '请输入策略名称' }]"
              >
                <a-input v-model:value="formState.strategyName" :disabled="current !== 0 && props.type !== 'edit'"/>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="应用场景"
                name="strategyScene"
                :rules="[{ required: true, message: '请输入应用场景' }]"
              >
                <a-input v-model:value="formState.strategyScene" :disabled="current !== 0 && props.type !== 'edit'"/>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="策略目标"
                name="strategyTarget"
                :rules="[{ required: true, message: '请输入策略目标' }]"
              >
                <a-input v-model:value="formState.strategyTarget" :disabled="current !== 0 && props.type !== 'edit'"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row
            :gutter="16"
            class="row-with-margin"
          >
            <a-col :span="5">
              <a-form-item
                label="单体空间"
                name="spaceId"
              >
                <a-tree-select
                  v-model:value="formState.spaceId"
                  :tree-data="spaceTreeData"
                  placeholder="请选择空间位置"
                  :fieldNames="treeSelect"
                  show-search
                  allowClear
                  :disabled="current !== 0 && props.type !== 'edit'"
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="分组属性"
                name="groupId"
              >
                <!-- <a-tree-select
                  v-model:value="formState.groupId"
                  :tree-data="spaceTreeData"
                  placeholder="请选择空间位置"
                  :fieldNames="treeSelect"
                  show-search
                  allowClear
                /> --> 
                <a-input v-model:value="formState.groupId" :disabled="current !== 0 && props.type !== 'edit'"/>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="复合专业"
                name="compositeSpecialtyFlag"
                :rules="[{ required: true, message: '请输入复合专业' }]"
              >
                <a-select v-model:value="formState.compositeSpecialtyFlag" :disabled="current !== 0 && props.type !== 'edit'">
                  <a-select-option :value="1">是</a-select-option>
                  <a-select-option :value="0">否</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="专业"
                name="professionalId"
              >
                <!-- <a-select
                  v-model:value="formState.professionalId"
                  :disabled="formState.compositeSpecialtyFlag"
                  :options="categoryOption"
                >
                </a-select> -->
                <a-tree-select
                  v-model:value="formState.professionalId"
                  :tree-data="categoryOption"
                  placeholder="请选择专业"
                  :disabled="formState.compositeSpecialtyFlag || (current !== 0 && props.type !== 'edit') "
                  :fieldNames="treeSelect"
                  show-search
                  allowClear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row
            :gutter="16"
            class="row-with-margin"
          >
            
            <a-col :span="5">
              <a-form-item
                label="模式类型"
                name="modelType"
                :rules="[{ required: true, message: '请输入模式类型' }]"
              >
                <a-select v-model:value="formState.modelType" :disabled="current !== 0 && props.type !== 'edit'">
                  <a-select-option value="自动">自动</a-select-option>
                  <a-select-option value="手动">手动</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row
            :gutter="16"
            class="row-with-margin"
            v-for="(item,index) in formState.patterningRelatedList"
            :key="index"
          >
            <a-col :span="5">
              <a-form-item
                label="模式引用"
                :name="['patterningRelatedList', index, 'postAssociationId']"
              >
                <div class="arr-list-box">
                  <a-input v-model:value="item.postAssociationName" @click="selectPatternReference(index)" :disabled="current !== 0 && props.type !== 'edit'"/>
                  &emsp;
                  <div
                    class="icon-box"
                    v-if="props.type !== 'check' || current !== 0"
                  >
                    <a>
                      <PlusOutlined
                        v-if="(index === (formState.patterningRelatedList.length - 1)) && (current === 0 || props.type === 'edit')"
                        style="font-size: 20px;"
                        @click="addPatterningRelated"
                      />
                      <DeleteOutlined
                        v-else-if="current === 0 || props.type === 'edit'"
                        style="font-size: 20px;"
                        @click="deletePatterningRelated(index)"
                      />
                    </a>
                  </div>
                </div>
              </a-form-item>
            </a-col>

          </a-row>
        </div>
        <div class="list-title" v-show="current > 0 || props.type === 'edit'">
          <span>执行设备类型</span><a
            @click="addPatterningPoint"
            v-if="props.type !== 'check' && current === 1 || props.type === 'edit'"
          >添加</a>
        </div>
        <div class="list-form" v-show="current > 0 || props.type === 'edit'">
          <a-row
            :gutter="16"
            v-for="(item,index) in formState.patterningPointList"
            :key="index"
            style="margin-bottom: 10px;"
          >
            <a-col :span="5">
              <a-form-item
                label="执行设备"
                :name="['patterningPointList', index, 'deviceName']"
                :rules="[{ required: true, message: '请选择执行设备' }]"
              >
                <a-input
                  v-model:value="item.deviceName"
                  @click="selectDevice(1, index)"
                  :disabled="current !== 1 && props.type !== 'edit'"
                />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item
                label="空间位置"
                :name="['patterningPointList', index, 'spaceName']"
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
                :name="['patterningPointList', index, 'pointId']"
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
              <a-form-item
                label="点位设定"
                :name="['patterningPointList', index, 'conditionValue']"
                :rules="[{ required: true, message: '请输入数值' }]"
              >
                <div class="arr-list-box">
                  <a-input-group compact>
                    <a-select
                      v-model:value="item.pointName"
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
                      :disabled="current !== 1 && props.type !== 'edit'"
                    />
                  </a-input-group>
                  &emsp;
                  <div
                    class="icon-box"
                    v-if="props.type !== 'check' && (current !== 1 || props.type !== 'edit')"
                  >
                    <a @click="(index)">
                      <MinusOutlined style="font-size: 20px;" />
                    </a>
                    &emsp;
                    <a @click="addPatterningPoint">
                      <PlusOutlined style="font-size: 20px;" v-show="index === (formState.patterningPointList.length - 1)"/>
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
        v-show="current !== 2 && props.type === 'create'"
        style="margin-right: 18px;"
      >下一步</a-button>
      <a-button @click="cancel" style="margin-right: 18px;">返回</a-button>
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
    <pattern-reference-table-modal ref="referenceRef" :setReferenceName="setReferenceName"/>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, createVNode, onMounted, nextTick } from 'vue';
import { DeleteOutlined, PlusOutlined, MinusOutlined, ExclamationCircleOutlined, ProfileOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { Modal } from 'ant-design-vue';
import { createStandardizedManagementtlApi, getPontByDeviceIdApi, getStandardizedManagemenDetailApi, editStandardizedManagemenApi, spaceTree, deviceCategoryTree } from '../Standardized.api';
import DeviceTableModal from './DeviceTableModal.vue';
import PatternReferenceTableModal from './PatternReferenceTableModal.vue';

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

const formRef = ref();
const deviceRef = ref();
const referenceRef = ref();

const current = ref<number>(0);
const steps = [
  {
    title: '策略基本信息填写',
    content: 'First-content',
  },
  {
    title: '执行设备类型',
    content: 'Second-content',
  },
  {
    title: '确认',
    content: 'Last-content',
  },
];
const stpesItems = steps.map((item) => ({ key: item.title, title: item.title }));

const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

const categoryOption = ref([]);

// 表单数据
const formState = reactive<any>({
  id: '',
  strategyCode: '',
  strategyName: '',
  strategyTarget: '',
  spaceId: '',
  spaceName: '',
  groupId: '',
  groupName: '',
  compositeSpecialtyFlag: '',
  professionalId: '',
  modelType: '',
  patterningRelatedList: [
    {
      postAssociationId: '',
      postAssociationName: '',
    },
  ],
  patterningPointList: [],
});

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

// 添加模式引用
const addPatterningRelated = () => {
  let length = formState.patterningRelatedList?.length;
  if (length && !formState.patterningRelatedList[length - 1]?.postAssociationId) {
    formRef.value;
    // .validate()
    // .then(() => {})
    // .catch((error) => {
    //   console.log('error', error);
    // });
    formRef.value
      .validateFields([['patterningRelatedList', formState.patterningRelatedList.length - 1, 'postAssociationId']])
      .then((values) => {
        console.log('校验通过:', values.postAssociationId);
      })
      .catch((err) => {
        console.log('校验失败:', err);
      });
    return;
  } else {
    formState.patterningRelatedList.push({
      postAssociationId: '',
      postAssociationName: '',
    });
  }
};
// 删除模式引用
const deletePatterningRelated = (index) => {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除不可恢复，是否确定删除?',
    onOk() {
      formState.patterningRelatedList.splice(index,1);
      message.success('删除成功！');
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {
      
    },
  });
};

// 添加执行设备
const addPatterningPoint = () => {
  let length = formState.patterningPointList?.length;
  if (
    length &&
    (!formState.patterningPointList[length - 1]?.deviceName ||
      !formState.patterningPointList[length - 1]?.pointId ||
      !formState.patterningPointList[length - 1]?.conditionValue)
  ) {
    formRef.value
      .validateFields([
        ['patterningPointList', formState.patterningPointList.length - 1, 'deviceName'],
        ['patterningPointList', formState.patterningPointList.length - 1, 'pointId'],
        ['patterningPointList', formState.patterningPointList.length - 1, 'conditionValue'],
      ])
      .then(() => {})
      .catch((error) => {
        console.log('error', error);
      });
    return;
  } else {
    formState.patterningPointList.push({
      deviceId: '',
      deviceName: '',
      spaceId: '',
      spaceName: '',
      pointId: '',
      pointName: '=',
      conditionValue: '',
    });
  }
};
// 删除执行设备
const deleteRearPoint = (index) => {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除不可恢复，是否确定删除?',
    onOk() {
      formState.patterningPointList.splice(index,1);
      message.success('删除成功！');
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

// 选择模式引用
const selectPatternReference = (index) => {
  targetIndex.value = index;
  referenceRef.value.showModal();
}

//确认引用
const setReferenceName = (record) => {
  formState.patterningRelatedList[targetIndex.value].postAssociationId = record.id
  formState.patterningRelatedList[targetIndex.value].postAssociationName = record.strategyName
  referenceRef.value.closeModal();
}

// 选择设备绑定
const selectDevice = (type: number, index: number) => {
  targetIndex.value = index;
  deviceRef.value.showModal();
};

// 确认设备
const setDeviceName = async (type,record) => {
  let deviceId =''
  if (type) {
      formState.patterningPointList[targetIndex.value].deviceId = record.id;
      deviceId = record.id;
    } else {
      formState.patterningPointList[targetIndex.value].deviceId = record.deviceId;
      deviceId = record.deviceId;
    }
    formState.patterningPointList[targetIndex.value].deviceName = record.deviceName;
    let res = await getPontByDeviceIdApi({ deviceId: deviceId})
    formState.patterningPointList[targetIndex.value].devicePointData = res.map((item) => {
      return {
        value: item.id,
        label: item.attributeName,
      };
    });
  
  deviceRef.value.closeModal();
};

// 提交表单
const onSubmit = async () => {
  formRef.value
    .validate()
    .then(async () => {
      if (props.type === 'create') {
        await createStandardizedManagementtlApi(toRaw(formState));
        message.success('创建成功！');
      } else {
        await editStandardizedManagemenApi(toRaw(formState));
        message.success('修改成功！');
      }
      resetForm();
      props.closeStrategy();
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const nextStep = () => {
  switch (current.value) {
    case 0:
    formRef.value
        .validateFields([
        'strategyName',
        'strategyTarget',
        'strategyScene',
        'compositeSpecialtyFlag',
        'modelType'
        ])
        .then(() => {
          current.value++;
        })
        .catch((error) => {
          console.log('error', error);
        });
      break;
    case 1:
      let patterningPointListLength = formState.patterningPointList?.length;
      formRef.value
        .validateFields([
          ['patterningPointList', patterningPointListLength - 1, 'deviceName'],
          ['patterningPointList', patterningPointListLength - 1, 'pointId'],
          ['patterningPointList', patterningPointListLength - 1, 'conditionValue'],
        ])
        .then(() => {
          current.value++;
        })
        .catch((error) => {
          console.log('error', error);
        });
      break;
    case 2:
        current.value++;
      break;
  }
};

const previousStep = () => {
  current.value--;
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

onMounted(async () => {
  nextTick(async () => {
  const spaceRes = await spaceTree();
  const categoryRes = await deviceCategoryTree({});
  spaceTreeData.value = spaceRes;
  categoryOption.value = categoryRes;
  if (props.type === 'edit' || props.type === 'check') {
    let res = await getStandardizedManagemenDetailApi({ id: props.editItem.id });
    formState.id = props.editItem.id;
    formState.strategyCode = res.strategyCode;
    formState.strategyName = res.strategyName;
    formState.strategyTarget = res.strategyTarget;
    formState.spaceId = res.spaceId;
    formState.spaceName = res.spaceName;
    formState.groupId = res.groupId;
    formState.groupName = res.groupName;
    formState.compositeSpecialtyFlag = Number(res.compositeSpecialtyFlag);
    formState.modelType = res.modelType;
    formState.professionalId = res.professionalId;
    formState.strategyScene = res.strategyScene;
    if (!Array.isArray(res.patterningPointList)) {
      formState.patterningPointList = [];
    } else {
      formState.patterningPointList = res.patterningPointList;
      formState.patterningPointList.forEach((item) => {
        setDeviceName(0,item);
      });
    }
  }
  })
});

</script>

<style scoped lang="less">
.linkage-ontro-sStrategy-list-box {
  .step-box {
    padding: 24px 20%;
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
      color: #275fba;
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

      .row-with-margin {
        margin-bottom: 16px;
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