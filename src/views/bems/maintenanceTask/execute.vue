<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="更新任务设备关联说明" @cancel="handleCancel" @ok="handleOk" width="500px">
    <div class="maintenance-task-detail">
      <el-form :model="taskData" label-width="60px">
        <!-- 基本信息 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注：">
              <el-input v-model="taskData.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </BasicModal>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { updateTaskDevice } from './task.api';
  // 导入 API
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log(data,"13");
    id.value = data.id;
  });
  const id = ref('');
  const taskData = ref({
    remark: '',
  });
  const handleOk = () => {
    handleExecute();
  };
  const handleCancel = () => {
    remark.value = '';
    taskData.value.remark = '';
  };
  const handleExecute = async () => {
    setModalProps({ loading: true });
    await updateTaskDevice({
      id: id.value,
      ...taskData.value,
    });
    setModalProps({ loading: false });
    closeModal();
  };
</script>

<style scoped>
  .maintenance-task-detail {
    padding: 10px;
  }

  .el-form-item {
    margin-bottom: 15px;
  }

  .el-table {
    margin-top: 10px;
  }
</style>
