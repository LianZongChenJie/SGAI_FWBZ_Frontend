<template>
  <div class="device-box-modal">
    <a-modal
      v-model:open="open"
      :destroyOnClose="true"
      :title="(props.type === 'create' ? '新增' : (props.type === 'edit') ? '修改' : '查看')"
      width="1200px"
      @cancel="cancelModal"
    >
      <template #footer>
        <a-button
          key="back"
          @click="closeModal"
        >取消</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="onSubmit"
        >确认</a-button>
      </template>
      <div class="linkage-ontro-sStrategy-list-box">
        <div class="info-list">
          <a-form
            :model="formState"
            ref="formRef"
            layout="inline"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :disabled="props.type === 'check'"
          >
            <!-- <div class="list-title">
          策略基本信息
        </div> -->
            <div class="list-form">
              <a-row
                :gutter="16"
                class="row-with-margin"
              >
                <a-col :span="8">
                  <a-form-item
                    label="规则编号"
                    name="ruleCode"
                    :rules="[{ required: true, message: '请输入规则编号' }]"
                  >
                    <a-input
                      v-model:value="formState.ruleCode"
                      placeholder="请输入规则编号"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item
                    label="规则名称"
                    name="ruleName"
                    :rules="[{ required: true, message: '请输入规则名称' }]"
                  >
                    <a-input
                      v-model:value="formState.ruleName"
                      placeholder="请输入规则名称"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item
                    label="报警类别"
                    name="alarmCategoryId"
                    :rules="[{ required: true, message: '请选择报警类别' }]"
                  >
                    <a-select
                      placeholder="请选择报警类别"
                      v-model:value="formState.alarmCategoryId"
                      :options="categoryOption"
                      @change="selectCategory"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row
                :gutter="16"
                class="row-with-margin"
              >
                <a-col :span="8">
                  <a-form-item
                    label="报警等级"
                    name="alarmLevelId"
                    :rules="[{ required: true, message: '请选择报警等级' }]"
                  >
                    <a-select
                      v-model:value="formState.alarmLevelId"
                      :options="levelOption"
                      placeholder="请选择报警等级"
                      @change="selectLevel"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item
                    label="报警频率"
                    name="frequency"
                    :rules="[{ required: true, message: '请输入报警频率' }]"
                  >
                    <a-input-group compact>
                      <a-input
                        v-model:value="formState.frequency"
                        style="width: 70%"
                        placeholder="请输入"
                      />
                      <a-select
                        v-model:value="formState.frequencyUnit"
                        style="width: 30%"
                        placeholder="请选择"
                        :options="unitOption"
                      >
                      </a-select>
                    </a-input-group>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item
                    label="报警形式"
                    name="pointType"
                    :rules="[{ required: true, message: '请选择报警形式' }]"
                  >
                    <a-select
                      v-model:value="formState.pointType"
                      :options="pointTypeOption"
                      @change="changePointType"
                      placeholder="请选择报警形式"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <!-- <a-row
                :gutter="16"
                class="row-with-margin"
              >
                <a-col :span="8">
                  <a-form-item
                    label="通知对象"
                    name="noticeUser"
                  >
                    <a-input
                      v-model:value="formState.noticeUserName"
                      @click="selectNoticeUser()"
                      placeholder="请选择通知对象"
                    />
                  </a-form-item>
                </a-col>
              </a-row> -->
            </div>
            <div class="list-title">
              <span>管理设备设置</span><a
                @click="addRearPoint"
                v-if="props.type !== 'check'"
              >添加</a>
            </div>
            <div class="list-form">
              <a-row
                :gutter="16"
                v-for="(item,index) in formState.points"
                :key="index"
              >
                <a-col :span="7">
                  <a-form-item
                    label="选择设备"
                    :name="['points', index, 'deviceName']"
                    :rules="[{ required: true, message: '请选择执行设备' }]"
                  >
                    <a-input
                      v-model:value="item.deviceName"
                      @click="selectDevice(index)"
                    />
                  </a-form-item>
                </a-col>
                <a-col
                  :span="7"
                  v-if="formState.pointType === 'instant' || formState.pointType === 'virtual'"
                >
                  <a-form-item
                    label="点位选择"
                    :name="['points', index, 'pointId']"
                    :rules="[{ required: true, message: '请选择点位' }]"
                  >
                    <a-select
                      v-model:value="item.pointId"
                      :options="item.devicePointData"
                      @change="handleChangeDevicePoint"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col
                  :span="7"
                  v-else
                >
                  <a-form-item
                    label="时间粒度"
                    :name="['points', index, 'timeGranularity']"
                    :rules="[{ required: true, message: '请选择时间粒度' }]"
                  >
                    <a-select
                      v-model:value="item.timeGranularity"
                      :options="timeOptions"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item
                    label="点位设定"
                    :name="['points', index, 'conditionValue']"
                    :rules="[{ required: true, message: '请输入数值' }]"
                  >
                    <a-input-group compact>
                      <a-select
                        v-model:value="item.operator"
                        style="width: 30%"
                        :options="operatorList"
                      >
                      </a-select>
                      <a-input
                        v-model:value="item.conditionValue"
                        style="width: 70%"
                        placeholder="数值"
                        type="number"
                      />
                    </a-input-group>
                  </a-form-item>
                </a-col>
                <div
                  class="icon-box"
                  v-if="props.type !== 'check'"
                >
                  <a @click="deleteRearPoint">
                    <MinusOutlined style="font-size: 20px;" />
                  </a>
                  &emsp;
                  <a @click="addRearPoint">
                    <PlusOutlined style="font-size: 20px;" />
                  </a>
                </div>
              </a-row>
            </div>
          </a-form>
        </div>
        <!-- <div class="button-box">
      <a-button @click="cancel">返回</a-button>
      &emsp;
      <a-button
        type="primary"
        @click="onSubmit"
        v-if="props.type !== 'check'"
      >保存</a-button>
    </div> -->
        <device-table-modal
          ref="deviceRef"
          :setDeviceName="setDeviceName"
          :isInstant="isInstant"
        />
        <device-tree-modal
          ref="deviceTreeRef"
          :setDeviceName="setDeviceName"
          :isInstant="isInstant"
        />
        <notice-user-table-modal
          ref="noticeUserRef"
          :setNoticeUser="setNoticeUser"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, createVNode, onMounted } from 'vue';
import { PlusOutlined, MinusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { Modal } from 'ant-design-vue';
import {
  getAlarmLevelListApi,
  getAlarmCategoryListApi,
  getAlarmRulesDetailApi,
  getPontByDeviceIdApi,
  addAlarmRulesApi,
  editAlarmRulesApi,
  userList,
} from '../Standardized.api';
import DeviceTableModal from './DeviceTableModal.vue';
import DeviceTreeModal from './DeviceTreeModal.vue';
import NoticeUserTableModal from './NoticeUserTableModal.vue';

const props = defineProps({
  closeModal: {
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

const open = ref<boolean>(false);

const isInstant = ref(false);

const formRef = ref();
const noticeUserRef = ref();
const deviceRef = ref();
const deviceTreeRef = ref();

// 等级数据
const levelOption = ref([]);
// 类别数据
const categoryOption = ref([]);
// 频率单位数据
const unitOption = [
  {
    label: '秒',
    value: 's',
  },
  {
    label: '分',
    value: 'm',
  },
  {
    label: '时',
    value: 'h',
  },
  {
    label: '天',
    value: 'd',
  },
];
// 点位类型数据
const pointTypeOption = [
  {
    label: '瞬时',
    value: 'instant',
  },
  {
    label: '累计',
    value: 'accumulate',
  },
  {
    label: '虚拟表',
    value: 'virtual',
  },
];
// 用户数据
const noticeUserOptions = ref<any>([]);
const timeOptions = [
  {
    label: '小时',
    value: 'hour',
  },
  {
    label: '日',
    value: 'day',
  },
  {
    label: '月',
    value: 'month',
  },
  {
    label: '年',
    value: 'year',
  },
];

// 表单数据
const formState = reactive<any>({
  id: '',
  ruleCode: '',
  ruleName: '',
  alarmCategoryId: null,
  alarmCategoryName: null,
  alarmLevelId: null,
  alarmLevelName: null,
  frequency: '',
  frequencyUnit: null,
  pointType: null,
  noticeUserName: '',
  // noticeUser: [],
  points: [],
  pointName: '',
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

// 设置Name
const selectCategory = (id) => {
  formState.alarmCategoryName = categoryOption.value.find((item) => item.value === id).label;
};
const selectLevel = (id) => {
  formState.alarmLevelName = levelOption.value.find((item) => item.value === id).label;
};

const changePointType = (value) => {
  if (value === 'instant') {
    isInstant.value = true;
  } else {
    isInstant.value = false;
  }
  formState.points = [];
};

// 选择通知对象
const selectNoticeUser = () => {
  noticeUserRef.value.showModal();
};

const handleChangeDevicePoint = (va1, val2) => {
  console.log('handleChangeDevicePoint---------------->', va1, val2);
  formState.pointName = val2.label;
};

// 添加联动设备
const addRearPoint = () => {
  let length = formState.points?.length;
  if (
    length &&
    (!formState.points[length - 1]?.deviceName ||
      !formState.points[length - 1]?.pointId ||
      !formState.points[length - 1]?.operator ||
      !formState.points[length - 1]?.conditionValue)
  ) {
    formRef.value
      .validate()
      .then(() => {})
      .catch((error) => {
        console.log('error', error);
      });
    return;
  } else {
    formState.points.push({
      deviceId: '',
      deviceName: '',
      timeGranularity: '',
      pointId: '',
      pointName: '',
      operator: null,
      conditionValue: '',
    });
  }
};
// 删除联动设备
const deleteRearPoint = (target) => {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除不可恢复，是否确定删除?',
    onOk() {
      formState.points.pop();
      message.success('删除成功！');
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

// 选择设备绑定
const selectDevice = (index: number) => {
  targetIndex.value = index;
  if (formState.pointType === 'virtual') {
    deviceTreeRef.value.showModal();
  } else {
    deviceRef.value.showModal();
  }
};

// 选择通知用户
const setNoticeUser = (selectedRowKeys) => {
  formState.noticeUser = selectedRowKeys.join(',');
  formState.noticeUserName = selectedRowKeys.reduce((total, item, index) => {
    for (let i = 0; i < noticeUserOptions.value.length; i++) {
      if (noticeUserOptions.value[i].value === item) {
        return total + noticeUserOptions.value[i].label + ',';
      }
    }
  }, '');
};

// 确认设备
const setDeviceName = async (type, record) => {
  formState.points[targetIndex.value].deviceName = record.deviceName;
  let deviceId = '';
  if (type) {
    formState.points[targetIndex.value].deviceId = record.id;
    deviceId = record.id;
  } else {
    formState.points[targetIndex.value].deviceId = record.deviceId;
    deviceId = record.deviceId;
  }

  let res = await getPontByDeviceIdApi({ deviceId: deviceId });
  // let res = await getPontByDeviceIdApi({ deviceId: 108 });
  formState.points[targetIndex.value].devicePointData = res.map((item) => {
    return {
      value: item.id,
      label: item.attributeName,
    };
  });
  if (!formState.points[targetIndex.value].devicePointData.length) {
    formState.points[targetIndex.value].pointId = '';
  }
  deviceRef.value.closeModal();
};

// 提交表单
const onSubmit = async () => {
  if (!formState.points.length) {
    message.error('请添加设备');
    return;
  }
  formRef.value
    .validate()
    .then(async () => {
      if (props.type === 'create') {
        let res = await addAlarmRulesApi(toRaw(formState));
        if (!res) {
          message.success('新增成功！');
          resetForm();
          props.closeModal();
          open.value = false;
        } else {
          message.error('新增失败！');
        }
      } else {
        let res = await editAlarmRulesApi(toRaw(formState));
        
        if (!res) {
          message.success('修改成功！');
          resetForm();
          props.closeModal();
          open.value = false;
        } else {
          message.error('修改失败！');
        }
        // message.success('修改成功！');
      }
    })
    .catch((error) => {
      console.log('error', error);
    });
};

// 返回
const cancel = () => {
  resetForm();
  props.closeModal();
};

// 重置表单
const resetForm = () => {
  formRef.value.resetFields();
};

// 获取用户列表
const getUserList = async () => {
  const params = {
    pageNo: 1,
    pageSize: 99,
    userName: formState.userName ? '*' + formState.userName + '*' : undefined,
  };
  let users = await userList(params);
  noticeUserOptions.value = users.records.map((item) => {
    return {
      label: item.realname,
      value: item.id,
    };
  });
};

// 获取下拉框数据源
const getOptionsData = async () => {
  let res1 = await getAlarmLevelListApi();
  levelOption.value = res1.map((item) => {
    return {
      label: item.alarmLevelName,
      value: item.id,
    };
  });
  let res2 = await getAlarmCategoryListApi();
  categoryOption.value = res2.map((item) => {
    return {
      label: item.alarmCategoryName,
      value: item.id,
    };
  });
};

onMounted(async () => {
  await getUserList();
  await getOptionsData();
});

// 打开弹框
const showModal = async () => {
  await getUserList();
  await getOptionsData();
  if (props.type === 'edit' || props.type === 'check') {
    let res = await getAlarmRulesDetailApi({ id: props.editItem.id });
    formState.id = props.editItem.id;
    formState.ruleCode = res.ruleCode;
    formState.ruleName = res.ruleName;
    formState.alarmCategoryId = res.alarmCategoryId;
    formState.alarmCategoryName = res.alarmCategoryName;
    formState.alarmLevelId = res.alarmLevelId;
    formState.alarmLevelName = res.alarmLevelName;
    formState.frequency = res.frequency;
    formState.frequencyUnit = res.frequencyUnit;
    formState.pointType = res.pointType;
    formState.noticeUserName = res.noticeUserName;
    formState.noticeUser = res.noticeUser;
    formState.points = res.points;
    if (!Array.isArray(res.points)) {
      formState.points = [];
    } else {
      formState.points = res.points;
      formState.points.forEach((item) => {
        setDeviceName(0, item);
      });
    }
  }
  open.value = true;
};

// 关闭弹框
const closeModal = () => {
  formState.deviceName = '';
  formState.spaceId = [];
  formState.categoryId = [];
  resetForm();
  open.value = false;
};

const cancelModal = () => {
  resetForm();
  formRef.value.resetFields();
  formState.id = null;
  formState.ruleCode = null;
  formState.ruleName = null;
  formState.alarmCategoryId = null;
  formState.alarmCategoryName = null;
  formState.alarmLevelId = null;
  formState.alarmLevelName = null;
  formState.frequency = null;
  formState.frequencyUnit = null;
  formState.pointType = null;
  formState.noticeUserName = null;
  formState.noticeUser = null;
  formState.points = [];
};

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
.linkage-ontro-sStrategy-list-box {
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

      .row-with-margin {
        margin-bottom: 16px;
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
.form-box {
  width: 100%;
  padding: 5px 10px;
  padding-right: 0px;

  .button-box {
    display: flex;
    align-items: center;
  }
}
.table-box {
  padding: 5px 10px;
}

.custom-hover-table {
  --hover-bg-color: #f0f9ff;
  --active-bg-color: #e6f7ff;
}

/* 行 hover 效果 */
.custom-hover-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--hover-bg-color) !important;
}

/* 行点击效果 */
.custom-hover-table :deep(.ant-table-tbody > tr:active > td) {
  background: var(--active-bg-color) !important;
}

/* 过渡动画 */
.custom-hover-table :deep(.ant-table-tbody > tr > td) {
  transition: background-color 0.2s ease;
}
</style>