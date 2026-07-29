<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="维保任务详情" @cancel="cancel" @ok="handleOk" width="800px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="基本信息"
        ><div class="maintenance-task-detail">
          <el-form :model="taskData" label-width="120px">
            <!-- 基本信息 -->
            <el-row>
              <el-col :span="12">
                <el-form-item label="任务名称：">
                  <span>{{ taskData.taskName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年份：">
                  <span>{{ taskData.year }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组织机构编码：">
                  <span>{{ taskData.orgCode }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="周次：">
                  <span>{{ taskData.weekNumber }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="任务开始时间：">
                  <span>{{ taskData.plannedStartTime }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="任务结束时间：">
                  <span>{{ taskData.plannedEndTime }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实际开始时间：">
                  <span>{{ taskData.actualStartTime || '未开始' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实际结束时间：">
                  <span>{{ taskData.actualEndTime || '未结束' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态：">
                  <span>{{ taskData.status }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备注说明：">
                  <span>{{ taskData.completionRemark || '无' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="执行人：">
                  <span>{{ taskData.executorName || '未分配' }}</span>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 拓展字段 -->
            <el-form-item label="拓展字段：">
              <el-table :data="taskData.taskFieldData" style="width: 100%" align="center">
                <el-table-column prop="fieldName" label="字段名称" />
                <el-table-column prop="fieldValue" label="字段值" />
              </el-table>
            </el-form-item>

            <el-form-item label="备注" v-if="isExecute">
              <el-input v-model="completionRemark" type="textarea" placeholder="请输入备注信息" />
            </el-form-item>
          </el-form> </div
      ></a-tab-pane>
      <a-tab-pane key="2" tab="关联设备">
        <linkedDevice :taskId="taskId" :status="status" />
      </a-tab-pane>
      <a-tab-pane key="3" tab="关联空间">
        <linkedSpace :taskId="taskId" :status="status" />
      </a-tab-pane>
      <a-tab-pane key="4" tab="操作日志">
        <operationLog :taskId="taskId" />
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  const emit = defineEmits(['success']);
  import { getDetail, execute } from './task.api';
  import linkedDevice from './linkedDevice.vue';
  import linkedSpace from './linkedSpace.vue';
  import operationLog from './operationLog.vue';
  const activeKey = ref('1');
  const taskId = ref(null);
  const isExecute = ref(false);
  const completionRemark = ref('');
  const status = ref('');
  // 导入 API
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    taskId.value = data.id;
    isExecute.value = data.isExecute ? true : false;
    status.value = data.status;
    setModalProps({ loading: true });
    try {
      //   实际项目中从API获取数据
      const res = await getDetail(data.id);
      taskData.value = res;
    } finally {
      setModalProps({ loading: false });
    }
  });
  const handleOk = async () => {
    if (isExecute.value) {
      await execute({
        taskId: taskId.value,
        completionRemark: completionRemark.value,
      });
      emit('success');
    }
    closeModal();
  };
  const cancel = () => {
    activeKey.value = '1';
  };
  const taskData = ref({
    taskName: '',
    year: '',
    orgCode: '',
    weekNumber: '',
    plannedStartTime: '',
    plannedEndTime: '',
    actualStartTime: null,
    actualEndTime: null,
    status: '',
    completionRemark: '',
    executorName: '',
    taskFieldData: [],
  });
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
