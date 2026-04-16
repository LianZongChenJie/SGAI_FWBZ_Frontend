<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="isCalendar ? '任务详情' : '编辑维保任务'"
    @cancel="cancel"
    @ok="handleOk"
    width="1000px"
  >
    <a-tabs v-model:activeKey="activeKey">
      <!-- 基本信息标签页 -->
      <a-tab-pane key="1" tab="基本信息">
        <a-form v-if="!isCalendar" ref="formRef" :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
          <!-- 基本信息 -->
          <a-form-item label="任务名称" name="taskName" :rules="[{ required: true, message: '请输入任务名称' }]">
            <a-input v-model:value="formData.taskName" placeholder="请输入任务名称" />
          </a-form-item>
          <a-form-item label="计划开始时间" name="plannedStartTime">
            <a-date-picker
              v-model:value="formData.plannedStartTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择计划开始时间"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="计划结束时间" name="plannedEndTime">
            <a-date-picker
              v-model:value="formData.plannedEndTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择计划结束时间"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="执行人" name="executorName">
            <a-input v-model:value="formData.executorName" placeholder="请输入执行人" />
          </a-form-item>
          <a-form-item label="部门" name="department">
            <a-input v-model:value="formData.department" placeholder="请输入部门" />
          </a-form-item>

          <!-- 拓展字段 -->
          <a-divider orientation="left">拓展字段</a-divider>
          <a-form-item v-for="field in formData.taskFieldData" :key="field.fieldCode" :label="field.fieldName || field.fieldCode">
            <a-input v-model:value="field.fieldValue" :placeholder="'请输入' + (field.fieldName || field.fieldCode)" />
          </a-form-item>
        </a-form>
        <el-descriptions v-else :column="2" border>
          <el-descriptions-item label="计划名称">{{ taskData.taskName }}</el-descriptions-item>
          <el-descriptions-item label="年份">{{ taskData.year }}</el-descriptions-item>
          <el-descriptions-item label="周次">{{ taskData.weekNumber }}</el-descriptions-item>
          <el-descriptions-item label="组织机构编码">{{ taskData.orgCode }}</el-descriptions-item>
          <el-descriptions-item label="任务开始时间">{{ taskData.plannedStartTime }}</el-descriptions-item>
          <el-descriptions-item label="任务结束时间">{{ taskData.plannedEndTime }}</el-descriptions-item>
          <el-descriptions-item label="实际开始时间">{{ taskData.actualStartTime || '未开始' }}</el-descriptions-item>
          <el-descriptions-item label="实际结束时间">{{ taskData.actualEndTime || '未结束' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getPlanType(taskData.status)">{{ taskData.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注说明">{{ taskData.completionRemark || '无' }}</el-descriptions-item>
          <el-descriptions-item label="执行人">{{ taskData.executorName || '未分配' }}</el-descriptions-item>
        </el-descriptions>
      </a-tab-pane>

      <!-- 关联设备标签页 -->
      <a-tab-pane key="2" tab="关联设备">
        <linkedDevice :taskId="formData.id" :status="'未开始'" :isEditMode="true" @refresh="handleRefresh" />
      </a-tab-pane>

      <!-- 关联空间标签页 -->
      <a-tab-pane key="3" tab="关联空间">
        <linkedSpace :taskId="formData.id" :status="'未开始'" :isEditMode="true" />
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  const emit = defineEmits(['success']);
  import { getDetail, updateTask } from './task.api';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import linkedDevice from './linkedDevice.vue';
  import linkedSpace from './linkedSpace.vue';
  const props = defineProps({
    isCalendar: {
      type: Boolean,
      default: false,
    },
  });
  const activeKey = ref('1');
  const formRef = ref();
  const formData = ref({
    id: undefined,
    taskName: '',
    plannedStartTime: undefined,
    plannedEndTime: undefined,
    executorName: '',
    department: '',
    taskFieldData: [],
  });
  const loading = ref(false);
  const taskData = ref<any>({});
  const getPlanType = (status: string) => {
    const typeMap: Record<string, string> = {
      已执行: 'info',
      未开始: 'warning',
      进行中: 'success',
      已延期: 'danger',
    };
    return typeMap[status] || 'info';
  };
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ loading: true, confirmLoading: false });
    try {
      const res = await getDetail(data.id);
      taskData.value = res;
      formData.value = {
        id: res.id,
        taskName: res.taskName,
        plannedStartTime: res.plannedStartTime ? dayjs(res.plannedStartTime) : undefined,
        plannedEndTime: res.plannedEndTime ? dayjs(res.plannedEndTime) : undefined,
        executorName: res.executorName,
        department: res.department,
        taskFieldData: res.taskFieldData || [],
      };
    } finally {
      setModalProps({ loading: false });
    }
  });

  const handleOk = async () => {
    try {
      if (props.isCalendar) {
        activeKey.value = '1';
        emit('success');
        closeModal();
        return;
      }
      await formRef.value.validate();
      setModalProps({ confirmLoading: true });

      const params = {
        id: formData.value.id,
        taskName: formData.value.taskName,
        plannedStartTime: formData.value.plannedStartTime ? formData.value.plannedStartTime.format('YYYY-MM-DD HH:mm:ss') : null,
        plannedEndTime: formData.value.plannedEndTime ? formData.value.plannedEndTime.format('YYYY-MM-DD HH:mm:ss') : null,
        executorName: formData.value.executorName,
        department: formData.value.department,
        taskFieldData: formData.value.taskFieldData.map((item) => ({
          fieldCode: item.fieldCode,
          fieldValue: item.fieldValue,
        })),
      };

      await updateTask(params);
      emit('success');
      closeModal();
    } catch (error) {
      console.error('更新失败:', error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  };

  const cancel = () => {
    activeKey.value = '1';
    formRef.value?.resetFields();
  };

  const handleRefresh = () => {
    // 可以在这里处理刷新逻辑
  };
</script>

<style scoped>
  .ant-divider {
    margin: 16px 0;
  }
</style>
