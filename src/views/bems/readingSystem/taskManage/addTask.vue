<template>
  <a-modal v-model:open="visible" :title="modalTitle" width="520px" :confirm-loading="saveLoading" @ok="handleSave" @cancel="handleCancel">
    <a-form :model="formData" layout="vertical" style="padding: 20px" ref="formEl">
      <!-- 任务项名称 -->
      <a-form-item label="任务项名称" name="taskItemName" :rules="[{ required: true, message: '请输入任务项名称' }]">
        <a-input v-model:value="formData.taskItemName" :disabled="isUpdate" placeholder="请输入任务项名称" />
      </a-form-item>

      <!-- 能源类型 -->
      <a-form-item label="能源类型" name="energyType" :rules="[{ required: true, message: '请选择能源类型' }]">
        <a-tree-select
          v-model:value="formData.energyType"
          :tree-data="deviceType"
          :field-names="treeFieldNames"
          :disabled="isUpdate"
          allow-clear
          placeholder="请选择能源类型"
          @change="handleEnergyTypeChange"
        />
      </a-form-item>

      <!-- 选择仪表 -->
      <a-form-item label="选择仪表（可多选）" name="meterIds" :rules="[{ required: true, type: 'array', message: '请选择仪表' }]">
        <a-select v-model:value="formData.meterIds" mode="multiple" placeholder="请先选择能源类型" :disabled="!formData.energyType">
          <a-select-option v-for="meter in deviceList" :key="meter.id" :value="meter.id">
            {{ meter.deviceName }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 周期类型 -->
      <a-form-item label="周期类型" name="cycleType" :rules="[{ required: true, message: '请选择抄表周期' }]">
        <a-select v-model:value="formData.cycleType" placeholder="请选择抄表周期" @change="handleCycleTypeChange">
          <a-select-option value="daily">日抄表</a-select-option>
          <a-select-option value="weekly">周抄表</a-select-option>
          <a-select-option value="monthly">月抄表</a-select-option>
          <a-select-option value="quarterly">季抄表</a-select-option>
          <a-select-option value="yearly">年抄表</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 时间范围 -->
      <a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间" name="startDate" :rules="[{ required: true, message: '请选择开始时间' }]">
              <a-date-picker v-model:value="formData.startDate" :picker="picker" placeholder="年/月/日" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间" name="endDate" :rules="[{ required: true, message: '请选择结束时间' }]">
              <a-date-picker v-model:value="formData.endDate" :picker="picker" placeholder="年/月/日" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form-item>

      <!-- 抄表人 -->
      <a-form-item label="抄表人" name="executor" :rules="[{ required: true, message: '请输入抄表人' }]">
        <a-input v-model:value="formData.executor" placeholder="请输入抄表人" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, nextTick, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';
  import { addManualTaskItem, editManualTaskItem, getDeviceList } from './task.api';

  const props = defineProps({
    deviceType: {
      type: Array,
      default: () => [],
    },
  });
  const emit = defineEmits(['success']);

  const formEl = ref();
  // 模态框可见性
  const visible = ref(false);
  const saveLoading = ref(false);
  const isUpdate = ref(false);
  const currentId = ref<string | number | undefined>();
  const picker = ref<'date' | 'week' | 'month' | 'quarter' | 'year'>('date');
  const modalTitle = computed(() => (isUpdate.value ? '修改任务项' : '新建任务项'));
  const treeFieldNames = {
    label: 'title',
    value: 'key',
    children: 'children',
  };

  // 表单数据
  const formData = reactive({
    taskItemName: '',
    energyType: undefined as string | number | undefined,
    meterIds: [] as Array<string | number>,
    cycleType: '',
    startDate: null as any,
    endDate: null as any,
    executor: '',
  });
  const deviceList = ref([]);

  // 能源类型改变时清空已选仪表
  function handleEnergyTypeChange(value, item, val) {
    if (!value) {
      formData.meterIds = [];
      deviceList.value = [];
      return;
    }

    if (val?.triggerNode?.props?.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      formData.energyType = undefined;
      return;
    }
    getDeviceListHandle();
    formData.meterIds = [];
  }

  function getDeviceListHandle() {
    return getDeviceList({ categoryIds: formData.energyType }).then((res) => {
      deviceList.value = res || [];
    });
  }
  // 取消按钮
  function handleCancel() {
    visible.value = false;
    resetForm();
  }

  // 保存按钮
  async function handleSave() {
    try {
      await formEl.value.validate();
      saveLoading.value = true;
      const submitData = buildSubmitData();
      if (isUpdate.value) {
        await editManualTaskItem(submitData);
      } else {
        await addManualTaskItem(submitData);
      }
      message.success(isUpdate.value ? '修改任务项成功' : '新增任务项成功');
      visible.value = false;
      resetForm();
      emit('success');
    } catch (error) {
      const err = error as any;
      if (err?.errorFields) {
        return;
      }
      message.error(isUpdate.value ? '修改任务项失败' : '新增任务项失败');
    } finally {
      saveLoading.value = false;
    }
  }

  // 重置表单
  function resetForm() {
    formData.taskItemName = '';
    currentId.value = undefined;
    isUpdate.value = false;
    formData.energyType = undefined;
    formData.meterIds = [];
    formData.cycleType = '';
    formData.startDate = null;
    formData.endDate = null;
    formData.executor = '';
    deviceList.value = [];
  }

  // 显示模态框
  async function showModal(record?: any) {
    resetForm();
    if (record) {
      isUpdate.value = true;
      currentId.value = record.id;
      formData.taskItemName = record.taskItemName || '';
      formData.energyType = record.energyType;
      formData.meterIds = parseMeterIds(record.meterIds);
      formData.cycleType = getCycleFormValue(record.cycleType);
      formData.startDate = record.startDate ? dayjs(record.startDate) : null;
      formData.endDate = record.endDate ? dayjs(record.endDate) : null;
      formData.executor = record.executor || '';
      handleCycleTypeChange();
      await nextTick();
      await getDeviceListHandle();
    }
    visible.value = true;
  }

  // 隐藏模态框
  function hideModal() {
    visible.value = false;
    resetForm();
  }

  // 周期类型改变时更新日期选择器
  function handleCycleTypeChange() {
    switch (formData.cycleType) {
      case 'daily':
        picker.value = 'date';
        break;
      case 'weekly':
        picker.value = 'week';
        break;
      case 'monthly':
        picker.value = 'month';
        break;
      case 'quarterly':
        picker.value = 'quarter';
        break;
      case 'yearly':
        picker.value = 'year';
        break;
      default:
        picker.value = 'date';
        break;
    }
  }

  function buildSubmitData() {
    const data = {
      taskItemName: formData.taskItemName,
      energyType: Number(formData.energyType),
      meterIds: formData.meterIds.join(','),
      cycleType: getCycleTypeValue(),
      startDate: formatDateValue(formData.startDate),
      endDate: formatDateValue(formData.endDate),
      executor: formData.executor,
    };

    return isUpdate.value ? { id: currentId.value, ...data } : data;
  }

  function getCycleTypeValue() {
    const cycleTypeMap: Record<string, string> = {
      daily: '日',
      weekly: '周',
      monthly: '月',
      quarterly: '季',
      yearly: '年',
    };

    return cycleTypeMap[formData.cycleType] || formData.cycleType;
  }

  function getCycleFormValue(value: string) {
    const cycleTypeMap: Record<string, string> = {
      日: 'daily',
      周: 'weekly',
      月: 'monthly',
      季: 'quarterly',
      年: 'yearly',
    };

    return cycleTypeMap[value] || value;
  }

  function parseMeterIds(value: string | number[] | undefined) {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    return String(value)
      .split(',')
      .filter(Boolean)
      .map((item) => (/^\d+$/.test(item) ? Number(item) : item));
  }

  function formatDateValue(value) {
    if (!value) {
      return '';
    }

    return typeof value?.format === 'function' ? value.format('YYYY-MM-DD') : value;
  }

  function findTreeNode(tree: any[], value: string | number | undefined): any {
    if (value === undefined || value === null) {
      return null;
    }

    for (const node of tree || []) {
      const nodeValue = getNodeValue(node);
      if (String(nodeValue) === String(value)) {
        return node;
      }

      const childNode = findTreeNode(node.children || [], value);
      if (childNode) {
        return childNode;
      }
    }

    return null;
  }

  function normalizeMeterOptions(nodes: any[]) {
    const leafNodes = getLeafNodes(nodes);
    return leafNodes.map((node) => {
      const value = node.id ?? node.value ?? node.key;
      const code = node.deviceCode || node.code;
      const name = node.deviceName || node.title || node.name;

      return {
        value,
        label: code ? `${code} - ${name}` : name,
      };
    });
  }

  function getLeafNodes(nodes: any[]): any[] {
    return (nodes || []).flatMap((node) => {
      if (node.children?.length) {
        return getLeafNodes(node.children);
      }

      return [node];
    });
  }

  function getNodeValue(node: any) {
    return node?.key ?? node?.value ?? node?.id;
  }

  // 暴露方法供父组件调用
  defineExpose({
    showModal,
    hideModal,
  });
</script>

<style scoped>
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
  }
</style>
