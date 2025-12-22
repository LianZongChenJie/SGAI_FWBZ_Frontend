<template>
  <a-modal
    v-model:open="open"
    title="定时任务"
    width="500px"
    @ok="handleOk" 
    @cancel="closeModal"
  ><div class="enable-form-box">
    <a-form
      :model="formState"
      name="basic"
      ref="formRef"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item
        label="周期范围"
        name="date"
        :rules="[{ required: true, message: '请选择周期范围' }]"
      >
        <a-range-picker v-model:value="formState.date" style="width: 100%;" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
      </a-form-item>
      <a-form-item
        label="执行日期"
        name="weeks"
        :rules="[{ required: true, message: '请选择执行日期' }]"
      >
        <a-checkbox-group v-model:value="formState.weeks" name="checkboxgroup" :options="weekOptions" />
      </a-form-item>

      <a-form-item
        name="executionTime"
        label="执行时间"
        :rules="[{ required: true, message: '请选择执行时间' }]"
      >
        <a-time-picker v-model:value="formState.executionTime" value-format="HH:mm:ss" style="width: 100%;" />
      </a-form-item>
    </a-form>
  </div>
    
  </a-modal>

</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { enablePlanApi, getPlanTimeApi } from '../Standardized.api'
import { message } from 'ant-design-vue';
// import moment from 'moment';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {}
  }
})

const open = ref(false);
const formRef = ref()
interface FormState {
  date: Array<any>;
  weeks: Array<string>;
  executionTime: string;
  id: string;
  planId: string;
}

const formState = reactive<FormState>({
  date: [],
  weeks: [],
  executionTime: '',
  id: '',
  planId: ''
});

const targetId = ref()

  // 周选项配置
  const weekOptions = [
    { label: '周一', value: '1' },
    { label: '周二', value: '2' },
    { label: '周三', value: '3' },
    { label: '周四', value: '4' },
    { label: '周五', value: '5' },
    { label: '周六', value: '6' },
    { label: '周日', value: '7' },
  ];

// 打开弹框
const openModal = async (id: string) => {
  let res = await getPlanTimeApi({planId: id})
  if(res) {
    formState.id = res.id
    formState.date = [res.startDate, res.endDate]
    formState.executionTime = res.executionTime
    formState.weeks = res.enabledWeek.split(',')
  }
  targetId.value = id
  open.value = true;
};

// 提交
const handleOk = (e: MouseEvent) => {
  formRef.value
    .validate()
    .then(async () => {
      const params = {
        planId: targetId.value,
        id: formState.id,
        startDate: convertTime(new Date(formState.date[0])),
        endDate: convertTime(new Date(formState.date[1])),
        enabledWeek: formState.weeks.join(','),
        executionTime: formState.executionTime,
      }
      await enablePlanApi(params)
      message.success('启用成功！');
      formRef.value.resetFields();
      props.reload()
      open.value = false;
    }).catch((error) => {
      console.log('error', error);
    });
};

// 取消
const closeModal = () => {
  formRef.value.resetFields();
  open.value = false;
}

// 处理时间日期
const convertTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate
}

defineExpose({
  openModal,
});
</script>

<style scoped lang="less">
.enable-form-box{
  padding: 20px 0 0 0;
}
</style>