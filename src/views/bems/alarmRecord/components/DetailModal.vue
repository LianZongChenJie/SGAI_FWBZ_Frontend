<template>
  <div class="device-box-modal">
    <a-modal v-model:open="open" title="报警详情" @ok="handleOk" @cancel="closeModal" width="500px">
      <div class="form-box">
        <a-descriptions
          :column="2"
        >
          <a-descriptions-item label="报警设备">{{alarmDetail.deviceName}}</a-descriptions-item>
          <a-descriptions-item label="报警时间">{{alarmDetail.alarmTime}}</a-descriptions-item>
          <a-descriptions-item label="报警位置">{{alarmDetail.spaceName}}</a-descriptions-item>
          <a-descriptions-item label="报警类型">{{alarmDetail.alarmCategoryName}}</a-descriptions-item>
          <a-descriptions-item label="报警级别">{{alarmDetail.alarmLevelName}}</a-descriptions-item>
          <a-descriptions-item label="报警阈值">{{alarmDetail.conditionValue}}</a-descriptions-item>
          <a-descriptions-item label="报警值">{{alarmDetail.value}}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';

const open = ref<boolean>(false);

const alarmDetail = ref<any>({});

// 打开弹框
const showModal = async (record) => {
  alarmDetail.value = record
  console.log('alarmDetail-------------------->', alarmDetail.value);
  open.value = true
}

const handleOk = (e: MouseEvent) => {
  open.value = false;
};

const closeModal = () => {
  open.value = false;
}

onMounted(async () => {

})

defineExpose({
  showModal,
  closeModal
})
</script>

<style scoped lang="less">
  .form-box {
    width: 100%;
    padding: 10px;
    padding-bottom: 0;
    }
</style>