<template>
  <div class="device-box-modal">
    <a-modal
      v-model:open="open"
      :title="type === 'create' ? '新建' : '编辑'"
      :footer="null"
      
      width="500px"
    >
      <div class="form-box">
        <a-form
          ref="formSateRef"
          :model="formState"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
          :rules="rules"
        >
          <a-row :gutter="8">
            <a-col :span="24">
              <a-form-item
                label="空间名称"
                name="spaceName"
                :rules="[{ required: true, message: '请输入空间名称!' }]"
              >
                <a-input v-model:value="formState.spaceName" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="场景名称"
                name="planName"
                :rules="[{ required: true, message: '请输入节目名称!' }]"
              >
                <a-input v-model:value="formState.planName" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="执行日期"
                name="exeDate"
                :rules="[{ required: true, message: '请选择关联类型!' }]"
              >
                <a-date-picker
                  v-model:value="formState.exeDate"
                  style="width: 100%;"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="执行时间"
                name="exeTime"
              >
                <a-time-picker
                  v-model:value="formState.exeTime"
                  :disabled="!formState.exeDate"
                  style="width: 100%;"
                  format="HH:mm:ss"
                  value-format="HH:mm:ss"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="停止时间"
                name="stopTime"
              >
                <a-time-picker
                  v-model:value="formState.stopTime"
                  :disabled="!formState.exeTime"
                  style="width: 100%;"
                  format="HH:mm:ss"
                  value-format="HH:mm:ss"
                />
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
import { addPlanControlApi, editPlanControlApi } from '../Standardized.api';

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
  planName: string | null;
  exeDate: string | null;
  exeTime: string | null;
  stopTime: string | null;
}

// 弹框类型
const type = ref('create');

const formState = ref<FormState>({
  id: null,
  spaceName: null,
  planName: null,
  exeDate: null,
  exeTime: null,
  stopTime: null,
});

// 验证规则
const rules = {
  exeDate: [
    { required: false, message: '请选择执行日期' },
  ],
  exeTime: [
    { required: true, message: '请选择执行时间' },
    {
      validator: (_, value) => {
        if (!formState.value.exeDate || !value) return Promise.resolve();
        
        // 验证执行时间是否在当天的00:00:00到23:59:59之间
        const [hours, minutes, seconds] = value.split(':').map(Number);
        if (hours < 0 || hours > 23 || 
            minutes < 0 || minutes > 59 || 
            seconds < 0 || seconds > 59) {
          return Promise.reject('请输入有效的时间格式(HH:mm:ss)');
        }
        return Promise.resolve();
      },
    },
  ],
  stopTime: [
    { required: true, message: '请选择停止时间' },
    {
      validator: (_, value) => {
        if (!formState.value.exeTime || !value) return Promise.resolve();
        
        // 验证停止时间格式
        const [stopHours, stopMinutes, stopSeconds] = value.split(':').map(Number);
        if (stopHours < 0 || stopHours > 23 || 
            stopMinutes < 0 || stopMinutes > 59 || 
            stopSeconds < 0 || stopSeconds > 59) {
          return Promise.reject('请输入有效的时间格式(HH:mm:ss)');
        }
        
        // 验证停止时间不能早于执行时间
        const [execHours, execMinutes, execSeconds] = formState.value.exeTime.split(':').map(Number);
        if (stopHours < execHours) {
          return Promise.reject('停止时间不能早于执行时间');
        } else if (stopHours === execHours) {
          if (stopMinutes < execMinutes) {
            return Promise.reject('停止时间不能早于执行时间');
          } else if (stopMinutes === execMinutes && stopSeconds < execSeconds) {
            return Promise.reject('停止时间不能早于执行时间');
          }
        }
        
        return Promise.resolve();
      },
    },
  ],
};

// 打开弹框
const showModal = async (types, record: any = {}) => {
  if (types) {
    type.value = 'edit';
    formState.value.id = record.id;
    formState.value.spaceName = record.spaceName;
    formState.value.planName = record.planName + '';
    formState.value.exeDate = record.exeDate;
    formState.value.exeTime = record.exeTime;
    formState.value.stopTime = record.stopTime;
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
        await addPlanControlApi(toRaw(formState.value));
        message.success('新增成功！');
      } else {
        await editPlanControlApi({
          id: formState.value.id,
          spaceName: formState.value.spaceName,
          planName: formState.value.planName,
          exeDate: formState.value.exeDate,
          exeTime: formState.value.exeTime,
          stopTime: formState.value.stopTime,
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
};

const closeModal = () => {
  reset();
  open.value = false;
};

onMounted(async () => {});

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