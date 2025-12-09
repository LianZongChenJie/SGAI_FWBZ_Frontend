<template>
  <a-spin :spinning="loading">
    <a-form class="deviceDynamicForm" ref="formRef" :model="formData" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
      <!-- 修改为使用 grid 布局的容器 -->
      <div class="form-grid-container">
        <template v-for="(item, index) in formItems" :key="index">
          <a-form-item :label="item.label" :name="item.label">
            <a-space>
              <!-- 输入框类型 -->
              <a-input v-if="item.valueType === 'input'" v-model:value="formData[item.configId]" placeholder="请输入" :disabled="formDisabled" />
              <!-- 下拉选择类型 -->
              <a-select v-else-if="item.valueType === 'select'" v-model:value="formData[item.configId]" placeholder="请选择" :disabled="formDisabled">
                <a-select-option v-for="(option, idx) in parseValueData(item.valueData || '[]')" :key="idx" :value="option">
                  {{ option }}
                </a-select-option>
              </a-select>
              <!-- 日期选择类型 -->
              <a-date-picker
                v-else-if="item.valueType === 'datePicker'"
                v-model:value="formData[item.configId]"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                :disabled="formDisabled"
              />
              <!-- 仅展示 -->
              <span v-else-if="item.valueType === 'show'">{{ item.value }}</span>
            </a-space>
          </a-form-item>
        </template>
      </div>
      <a-form-item>
        <!-- 修改为靠右对齐 -->
        <div class="button-box">
          <a-button @click="resetForm">取消</a-button>
          <a-button type="primary" @click="submitForm">保存</a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Modal } from 'ant-design-vue';
  import type { Dayjs } from 'dayjs';
  import { watch } from 'vue';

  interface FormItem {
    configId: number;
    label: string;
    valueType: 'input' | 'select' | 'datePicker';
    valueData?: string;
    value: string;
  }

  interface FormData {
    configId: number;
    value: string;
  }

  const props = withDefaults(
    defineProps<{
      formDisabled?: boolean;
      formItems?: FormItem[];
      loading?: boolean;
      showAction?: boolean;
    }>(),
    {
      formDisabled: false,
      showAction: true,
    }
  );

  const emit = defineEmits(['delete', 'update:formItems', 'save', 'cancel']);

  // 表单数据
  const formData = reactive<Record<string, string | Dayjs>>({});

  const formRef = ref();

  // 解析valueData字符串为数组
  const parseValueData = (valueData: string) => {
    try {
      return JSON.parse(valueData);
    } catch {
      return [];
    }
  };

  // 表单提交方法
  const submitForm = async () => {
    try {
      const staticData: FormData[] = [];
      for (const key in formData) {
        staticData.push({
          configId: parseInt(key),
          value: formData[key] as string,
        });
      }
      console.log('staticData', staticData);
      emit('save', staticData);
    } catch (error) {
      return false;
    }
  };

  // 重置表单
  const resetForm = () => {
    emit('cancel');
  };

  // 设置表单数据
  const setFormData = (data: Record<string, any>) => {
    Object.assign(formData, data);
  };

  defineExpose({
    submitForm,
    resetForm,
    setFormData,
    formData,
  });

  // 监听 formItems 的变化
  watch(
    () => props.formItems,
    (newFormItems, oldFormItems) => {
      // 当 formItems 发生变化时，重置表单数据
      Object.keys(formData).forEach((key) => delete formData[key]);
      if (newFormItems) {
        newFormItems.forEach((item) => {
          formData[item.configId] = item.value ? item.value : '';
        });
      }
    },
    { deep: true }
  );
</script>

<style lang="less">
  .deviceDynamicForm {
    padding-top: 8px;
    .ant-space {
      display: flex;
      align-items: center;
    }

    /* 可以添加更多样式调整按钮间距等 */
    .ant-form-item div button {
      margin-left: 8px;
    }

    .ant-space-item {
      width: 100%;
      .ant-picker {
        width: 100%;
      }
    }
    /* 新增 grid 布局样式 */
    .form-grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr); /* 定义三列布局 */
    }

    .button-box {
      width: 200%;
      text-align: center;
    }
  }
  
</style>
