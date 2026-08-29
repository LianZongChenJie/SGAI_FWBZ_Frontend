<template>
  <div class="add-modal-wrapper" :class="themeClass">
    <a-modal
      v-model:open="open"
      title="启用定时任务"
      :footer="null"
      width="560px"
      :destroyOnClose="true"
      :maskClosable="false"
      :getContainer="container"
      wrapClassName="timer-enable-modal"
    >
      <!-- 顶部提示条 -->
      <div class="modal-tip">
        <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>请配置周期范围、执行日期和执行时间以启用该定时任务</span>
      </div>

      <a-form
        v-if="open"
        ref="formRef"
        :model="formState"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 19 }"
        autocomplete="off"
        class="dark-form"
      >
        <!-- 周期范围 -->
        <a-form-item label="周期范围" name="date" :rules="[{ required: true, message: '请选择周期范围' }]">
          <a-range-picker v-model:value="formState.date" style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </a-form-item>

        <!-- 执行日期 -->
        <a-form-item label="执行日期" name="weeks" :rules="[{ required: true, message: '请选择执行日期' }]">
          <a-checkbox-group v-model:value="formState.weeks" name="checkboxgroup" :options="weekOptions" />
        </a-form-item>

        <!-- 执行时间 -->
        <a-form-item label="执行时间" name="executionTime" :rules="[{ required: true, message: '请选择执行时间' }]">
          <a-time-picker v-model:value="formState.executionTime" value-format="HH:mm:ss" style="width: 100%" />
        </a-form-item>
      </a-form>

      <!-- 底部操作按钮 -->
      <div class="modal-footer">
        <button class="btn btn-cancel" @click="closeModal">取消</button>
        <button class="btn btn-reset" @click="onReset">重置</button>
        <button class="btn btn-confirm" :disabled="loading" @click="onSubmit">
          {{ loading ? '提交中...' : '确定' }}
        </button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, reactive, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { getPlanTimeApi, enablePlanApi } from '@/api/equipmentMonitoring';

// 全屏时由父组件传入地图卡片作为挂载容器（getContainer），避免原生全屏/CSS 降级全屏下弹框被遮挡
const props = defineProps<{
  container?: any;
}>();

const emit = defineEmits<{
  success: [];
}>();

/* ==================== 弹框状态 ==================== */
const open = ref(false);
const formRef = ref<FormInstance>();
const loading = ref(false);
const targetId = ref('');

/* ==================== 表单字段定义 ==================== */
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
  planId: '',
});

/* ==================== 周选项 ==================== */
const weekOptions = [
  { label: '周一', value: '1' },
  { label: '周二', value: '2' },
  { label: '周三', value: '3' },
  { label: '周四', value: '4' },
  { label: '周五', value: '5' },
  { label: '周六', value: '6' },
  { label: '周日', value: '7' },
];

/* ==================== 方法 ==================== */

/** 打开弹框 */
async function showModal(row: any) {
  formState.id = '';
  formState.weeks = [];
  formState.executionTime = '';
  formState.date = [];
  targetId.value = row.id;

  try {
    const res = await getPlanTimeApi({ planId: row.id });
    if (res) {
      formState.id = res.id;
      formState.date = [res.startDate, res.endDate];
      formState.executionTime = res.executionTime;
      formState.weeks = res.enabledWeek ? res.enabledWeek.split(',') : [];
    }
  } catch (err) {
    console.error('获取计划时间信息失败：', err);
  }

  open.value = true;
  nextTick(() => {
    formRef.value?.clearValidate();
  });
}

/** 关闭弹框 */
function closeModal() {
  open.value = false;
  formRef.value?.resetFields();
}

/** 重置 */
function onReset() {
  formState.date = [];
  formState.weeks = [];
  formState.executionTime = '';
  formRef.value?.clearValidate();
}

/** 处理日期格式 YYYY-MM-DD */
function convertTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 提交 */
async function onSubmit() {
  try {
    await formRef.value!.validate();

    loading.value = true;
    const params = {
      planId: targetId.value,
      id: formState.id,
      startDate: convertTime(new Date(formState.date[0])),
      endDate: convertTime(new Date(formState.date[1])),
      enabledWeek: formState.weeks.join(','),
      executionTime: formState.executionTime,
    };

    await enablePlanApi(params);
    message.success('启用成功！');
    formRef.value?.resetFields();
    open.value = false;
    emit('success');
  } catch (err: any) {
    // 表单校验失败由 antd 自带提示，不作额外处理
    if (err?.errorFields) return;
    message.error(err?.message || err?.msg || '请求异常，请检查网络');
  } finally {
    loading.value = false;
  }
}

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
/* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 20px;
  background: rgba(0, 212, 255, 0.06);
  border-left: 3px solid #00d4ff;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  color: #8a9ab0;
  filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.12));

  .tip-icon {
    width: 18px;
    height: 18px;
    color: #00d4ff;
    flex-shrink: 0;
  }
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 6px 6px;
  position: relative;
}

.btn {
  height: 32px;
  padding: 0 18px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  color: #7fa6d4;
  border: 1px solid rgba(0, 212, 255, 0.25);

  &:hover {
    border-color: #00d4ff;
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.06);
  }
}

.btn-reset {
  background: rgba(255, 255, 255, 0.06);
  color: #7fa6d4;
  border: 1px solid rgba(0, 212, 255, 0.25);

  &:hover {
    border-color: #00d4ff;
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
}

.btn-confirm {
  background: linear-gradient(135deg, #00d4ff, #0088cc);
  color: #061224;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>

/* ==================== 全局 Modal 覆盖（科技感 v2 —— 对齐 createNewSceneModal） ==================== */
<style lang="less">
/* 遮罩层 */
body .timer-enable-modal {
  background: rgba(2, 8, 23, 0.78) !important;
  backdrop-filter: blur(2px);

  /* ---- 弹框主体 ---- */
  .ant-modal-content {
    position: relative;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow:
      0 0 0 1px rgba(0, 212, 255, 0.45),
      0 0 24px rgba(0, 212, 255, 0.25),
      0 0 60px rgba(0, 212, 255, 0.10),
      0 12px 40px rgba(0, 0, 0, 0.7) !important;
    overflow: visible !important;
  }

  /* 渐变描边（关键发光边框） */
  .ant-modal-content::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(0, 212, 255, 0.95) 0%,
      rgba(0, 212, 255, 0.25) 35%,
      rgba(77, 159, 255, 0.55) 65%,
      rgba(0, 255, 209, 0.85) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  /* 四角 L 型装饰 */
  .ant-modal-content::after {
    content: "";
    position: absolute;
    inset: -4px;
    pointer-events: none;
    z-index: 2;
    background:
      /* TL */ linear-gradient(#00d4ff, #00d4ff) top left / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) top left / 2px 18px no-repeat,
      /* TR */ linear-gradient(#00d4ff, #00d4ff) top right / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) top right / 2px 18px no-repeat,
      /* BL */ linear-gradient(#00d4ff, #00d4ff) bottom left / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) bottom left / 2px 18px no-repeat,
      /* BR */ linear-gradient(#00d4ff, #00d4ff) bottom right / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) bottom right / 2px 18px no-repeat;
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.35));
  }

  /* ---- 头部 ---- */
  .ant-modal-header {
    padding: 18px 24px !important;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.08) 0%, transparent 100%) !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.20) !important;
    border-radius: 6px 6px 0 0 !important;
  }

  /* 标题前小竖条（科技标识） */
  .ant-modal-title {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    color: #e6f4ff !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    letter-spacing: 1px !important;
  }

  .ant-modal-title::before {
    content: "";
    display: block;
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #00d4ff, #00ffd1);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.35);
    border-radius: 1px;
    flex-shrink: 0;
  }

  /* ---- 关闭按钮（科技感，hover 旋转 90°） ---- */
  .ant-modal-close {
    width: 28px !important;
    height: 28px !important;
    border-radius: 4px !important;
    background: rgba(0, 212, 255, 0.04) !important;
    border: 1px solid rgba(0, 212, 255, 0.15) !important;
    transition: all 0.25s !important;
    top: 14px !important;
    right: 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    &:hover {
      background: rgba(0, 212, 255, 0.12) !important;
      border-color: #00d4ff !important;
      transform: rotate(90deg);
    }
  }

  .ant-modal-close-x {
    color: #7fa6d4 !important;
    line-height: 28px !important;
  }

  /* ---- 内容区 ---- */
  .ant-modal-body {
    padding: 24px !important;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    color: #c9dfff;
  }

  /* ---- 底部 ---- */
  .ant-modal-footer {
    display: none !important;
  }

  /* ==================== 表单覆盖 ==================== */
  .dark-form {
    margin-bottom: 10px;

    .ant-form-item {
      width: 100% !important;
      margin-right: 0;
      margin-bottom: 16px !important;
    }

    .ant-form-item-row {
      width: 100% !important;
    }

    .ant-form-item-control {
      flex: 1 1 0 !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .ant-form-item-control-input {
      width: 100% !important;
    }

    .ant-form-item-control-input-content {
      width: 100% !important;
    }

    .ant-form-item-label > label {
      color: #8fa3bf !important;
      font-size: 13px !important;
      font-weight: 400 !important;
    }

    .ant-form-item-label > label.ant-form-item-required::before {
      color: #ff4d4f !important;
    }

    /* RangePicker */
    .ant-picker {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      border-radius: 4px !important;
      width: 100%;
      min-height: 36px !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #00d4ff !important;
      }

      &.ant-picker-focused {
        border-color: #00d4ff !important;
        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      .ant-picker-input > input {
        color: #ffffff !important;
        font-size: 12px !important;

        &::placeholder {
          color: #5a6a80 !important;
        }
      }

      .ant-picker-suffix {
        color: #5a6a80 !important;
      }

      .ant-picker-clear {
        background: #1b2533 !important;
        color: #5a6a80 !important;
      }

      .ant-picker-separator {
        color: #5a6a80 !important;
      }
    }

    /* Checkbox 深色适配 */
    .ant-checkbox-wrapper {
      color: #c0c8d4 !important;
      font-size: 13px !important;
      margin-right: 16px !important;
      margin-bottom: 4px !important;
    }

    .ant-checkbox-inner {
      background: #1b2533 !important;
      border-color: #303d50 !important;
    }

    .ant-checkbox-checked .ant-checkbox-inner {
      background: linear-gradient(135deg, #00d4ff, #0088cc) !important;
      border-color: #00d4ff !important;
      box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
    }

    .ant-checkbox-wrapper:hover .ant-checkbox-inner {
      border-color: #00d4ff !important;
    }

    .ant-checkbox-input:focus + .ant-checkbox-inner {
      border-color: #00d4ff !important;
    }

    /* 校验 */
    .ant-form-item-explain-error {
      font-size: 12px !important;
      color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-picker {
      border-color: #ff4d4f !important;
    }
  }
}

/* ==================== DatePicker/TimePicker 下拉面板（全局深色） ==================== */
.ant-picker-dropdown {
  .ant-picker-panel-container {
    background: #1b2533 !important;
    border: 1px solid #303d50 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
    border-radius: 4px !important;

    .ant-picker-header {
      border-bottom-color: #303d50 !important;
    }

    .ant-picker-header button {
      color: #a0aabf !important;

      &:hover {
        color: #00d4ff !important;
      }
    }

    .ant-picker-body th,
    .ant-picker-content th {
      color: #5a6a80 !important;
    }

    .ant-picker-cell {
      color: #c0c8d4 !important;
    }

    .ant-picker-cell-in-view {
      color: #ffffff !important;
    }

    .ant-picker-cell-selected .ant-picker-cell-inner {
      background: linear-gradient(135deg, #00d4ff, #0088cc) !important;
    }

    .ant-picker-cell-today .ant-picker-cell-inner::before {
      border-color: #00d4ff !important;
    }

    .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end):not(.ant-picker-cell-range-hover-start):not(.ant-picker-cell-range-hover-end) .ant-picker-cell-inner {
      background: rgba(0, 212, 255, 0.1) !important;
    }

    .ant-picker-cell-disabled {
      color: rgba(255, 255, 255, 0.2) !important;

      &::before {
        background: rgba(255, 255, 255, 0.04) !important;
      }
    }

    .ant-picker-footer {
      border-top-color: #303d50 !important;
    }

    /* ===== TimePicker 时间列面板 ===== */
    .ant-picker-time-panel-column {
      border-right-color: #303d50 !important;

      .ant-picker-time-panel-cell-inner {
        color: #c0c8d4 !important;

        &:hover {
          background: rgba(0, 212, 255, 0.12) !important;
        }
      }

      .ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
        color: #ffffff !important;
        background: linear-gradient(135deg, #00d4ff, #0088cc) !important;
        font-weight: 500 !important;
      }
    }
  }

  /* TimePicker 底部确定按钮 */
  .ant-picker-ok {
    .ant-btn-primary {
      color: #061224 !important;
      background: linear-gradient(135deg, #00d4ff, #0088cc) !important;
      border: none !important;
      font-weight: 600 !important;

      &:hover {
        background: linear-gradient(135deg, #00b8e6, #0070a8) !important;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.35);
      }
    }
  }
}

/* ==================== Select 下拉面板（全局深色） ==================== */
.ant-select-dropdown {
  background: #1b2533 !important;
  border: 1px solid #303d50 !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;

  .ant-select-item {
    color: #c0c8d4 !important;
    font-size: 12px !important;
    min-height: 28px !important;
    line-height: 28px !important;
    transition: background 0.15s !important;

    &:hover {
      background: rgba(0, 212, 255, 0.1) !important;
    }
  }

  .ant-select-item-option-selected {
    background: rgba(0, 212, 255, 0.15) !important;
    color: #00c6ff !important;
    font-weight: 500 !important;
  }

  .ant-select-item-option-active {
    background: rgba(255, 255, 255, 0.04) !important;
  }

  .ant-select-item-empty {
    color: #5a6a80 !important;
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white /* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 20px;
  background: rgba(24, 144, 255, 0.08);
  border-left: 3px solid #1890ff;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  color: #606266;
  filter: none;

  .tip-icon  {
    width: 18px;
    height: 18px;
    color: #1890ff;
    flex-shrink: 0;
  }}.theme-white /* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px dashed rgba(24, 144, 255, 0.2);
  background: #fafbfc;
  border-radius: 0 0 6px 6px;
  position: relative;
}.theme-white .btn {
  height: 32px;
  padding: 0 18px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}.theme-white .btn-cancel {
  background: transparent;
  color: #606266;
  border: 1px solid rgba(24, 144, 255, 0.35);

  &:hover  {
    border-color: #1890ff;
    color: #1890ff;
    background: rgba(24, 144, 255, 0.08);
  }}.theme-white .btn-reset {
  background: rgba(24, 144, 255, 0.06);
  color: #606266;
  border: 1px solid rgba(24, 144, 255, 0.35);

  &:hover  {
    border-color: #1890ff;
    color: #1890ff;
    background: rgba(24, 144, 255, 0.1);
  }}.theme-white .btn-confirm {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: #ffffff;
  font-weight: 600;

  &:hover  {
    opacity: 0.9;
    box-shadow: 0 0 12px rgba(24, 144, 255, 0.3);
  }

  &:disabled  {
    opacity: 0.5;
    cursor: not-allowed;
  }}
</style>

<style lang="less">
body.theme-white /* 遮罩层 */
.timer-enable-modal {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);

  /* ---- 弹框主体 ---- */
  .ant-modal-content  {
    position: relative;
    background: #ffffff !important;
    border-radius: 6px !important;
    border: 1px solid #e4e7ed !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15) !important;
    overflow: visible !important;
  }

  /* 渐变描边（关键发光边框） */
  .ant-modal-content::before  {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(24, 144, 255, 0.95) 0%,
      rgba(24, 144, 255, 0.25) 35%,
      rgba(77, 159, 255, 0.55) 65%,
      rgba(24, 144, 255, 0.85) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  /* 四角 L 型装饰 */
  .ant-modal-content::after  {
    content: "";
    position: absolute;
    inset: -4px;
    pointer-events: none;
    z-index: 2;
    background:
      /* TL */ linear-gradient(#1890ff, #1890ff) top left / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) top left / 2px 18px no-repeat,
      /* TR */ linear-gradient(#1890ff, #1890ff) top right / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) top right / 2px 18px no-repeat,
      /* BL */ linear-gradient(#1890ff, #1890ff) bottom left / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) bottom left / 2px 18px no-repeat,
      /* BR */ linear-gradient(#1890ff, #1890ff) bottom right / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) bottom right / 2px 18px no-repeat;
    filter: drop-shadow(0 0 6px rgba(24, 144, 255, 0.25));
  }

  /* ---- 头部 ---- */
  .ant-modal-header  {
    padding: 18px 24px !important;
    background: #fafbfc !important;
    border-bottom: 1px solid #e4e7ed !important;
    border-radius: 6px 6px 0 0 !important;
  }

  /* 标题前小竖条（科技标识） */
  .ant-modal-title  {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    color: #303133 !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    letter-spacing: 1px !important;
  }

  .ant-modal-title::before  {
    content: "";
    display: block;
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #1890ff, #40a9ff);
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.25);
    border-radius: 1px;
    flex-shrink: 0;
  }

  /* ---- 关闭按钮（科技感，hover 旋转 90°） ---- */
  .ant-modal-close  {
    width: 28px !important;
    height: 28px !important;
    border-radius: 4px !important;
    background: rgba(24, 144, 255, 0.04) !important;
    border: 1px solid rgba(24, 144, 255, 0.15) !important;
    transition: all 0.25s !important;
    top: 14px !important;
    right: 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    &:hover  {
      background: rgba(24, 144, 255, 0.12) !important;
      border-color: #1890ff !important;
      transform: rotate(90deg);
    }}

  .ant-modal-close-x  {
    color: #909399 !important;
    line-height: 28px !important;
  }

  /* ---- 内容区 ---- */
  .ant-modal-body  {
    padding: 24px !important;
    background: #ffffff !important;
    color: #303133;
  }

  /* ---- 底部 ---- */
  .ant-modal-footer  {
    display: none !important;
  }

  /* ==================== 表单覆盖 ==================== */
  .dark-form  {
    margin-bottom: 10px;

    .ant-form-item  {
      width: 100% !important;
      margin-right: 0;
      margin-bottom: 16px !important;
    }

    .ant-form-item-row  {
      width: 100% !important;
    }

    .ant-form-item-control  {
      flex: 1 1 0 !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .ant-form-item-control-input  {
      width: 100% !important;
    }

    .ant-form-item-control-input-content  {
      width: 100% !important;
    }

    .ant-form-item-label > label  {
      color: #606266 !important;
      font-size: 13px !important;
      font-weight: 400 !important;
    }

    .ant-form-item-label > label.ant-form-item-required::before  {
      color: #ff4d4f !important;
    }

    /* RangePicker */
    .ant-picker  {
      background: #ffffff !important;
      border: 1px solid #dcdfe6 !important;
      border-radius: 4px !important;
      width: 100%;
      min-height: 36px !important;
      transition: all 0.2s !important;

      &:hover  {
        border-color: #1890ff !important;
      }

      &.ant-picker-focused  {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), 0 0 8px rgba(24, 144, 255, 0.12) !important;
      }

      .ant-picker-input > input  {
        color: #303133 !important;
        font-size: 12px !important;

        &::placeholder  {
          color: #909399 !important;
        }}

      .ant-picker-suffix  {
        color: #909399 !important;
      }

      .ant-picker-clear  {
        background: #ffffff !important;
        color: #909399 !important;
      }

      .ant-picker-separator  {
        color: #909399 !important;
      }}

    /* Checkbox 浅色适配 */
    .ant-checkbox-wrapper  {
      color: #303133 !important;
      font-size: 13px !important;
      margin-right: 16px !important;
      margin-bottom: 4px !important;
    }

    .ant-checkbox-inner  {
      background: #ffffff !important;
      border-color: #dcdfe6 !important;
    }

    .ant-checkbox-checked .ant-checkbox-inner  {
      background: #1890ff !important;
      border-color: #1890ff !important;
      box-shadow: 0 0 6px rgba(24, 144, 255, 0.3);
    }

    .ant-checkbox-wrapper:hover .ant-checkbox-inner  {
      border-color: #1890ff !important;
    }

    .ant-checkbox-input:focus + .ant-checkbox-inner  {
      border-color: #1890ff !important;
    }

    /* 校验 */
    .ant-form-item-explain-error  {
      font-size: 12px !important;
      color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-picker  {
      border-color: #ff4d4f !important;
    }}}.theme-white /* ==================== DatePicker/TimePicker 下拉面板（全局浅色） ==================== */
.ant-picker-dropdown {
  .ant-picker-panel-container  {
    background: #ffffff !important;
    border: 1px solid #e4e7ed !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
    border-radius: 4px !important;

    .ant-picker-header  {
      border-bottom-color: #e4e7ed !important;
    }

    .ant-picker-header button  {
      color: #606266 !important;

      &:hover  {
        color: #1890ff !important;
      }}

    .ant-picker-body th,
    .ant-picker-content th  {
      color: #909399 !important;
    }

    .ant-picker-cell  {
      color: #c0c4cc !important;
    }

    .ant-picker-cell-in-view  {
      color: #303133 !important;
    }

    .ant-picker-cell-selected .ant-picker-cell-inner  {
      background: #1890ff !important;
    }

    .ant-picker-cell-today .ant-picker-cell-inner::before  {
      border-color: #1890ff !important;
    }

    .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end):not(.ant-picker-cell-range-hover-start):not(.ant-picker-cell-range-hover-end) .ant-picker-cell-inner  {
      background: rgba(24, 144, 255, 0.08) !important;
    }

    .ant-picker-cell-disabled  {
      color: rgba(0, 0, 0, 0.25) !important;

      &::before  {
        background: rgba(0, 0, 0, 0.04) !important;
      }}

    .ant-picker-footer  {
      border-top-color: #e4e7ed !important;
    }

    /* ===== TimePicker 时间列面板 ===== */
    .ant-picker-time-panel-column  {
      border-right-color: #e4e7ed !important;

      .ant-picker-time-panel-cell-inner  {
        color: #303133 !important;

        &:hover  {
          background: rgba(24, 144, 255, 0.08) !important;
        }}

      .ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner  {
        color: #ffffff !important;
        background: #1890ff !important;
        font-weight: 500 !important;
      }}}

  /* TimePicker 底部确定按钮 */
  .ant-picker-ok  {
    .ant-btn-primary  {
      color: #ffffff !important;
      background: linear-gradient(135deg, #1890ff, #096dd9) !important;
      border: none !important;
      font-weight: 600 !important;

      &:hover  {
        background: linear-gradient(135deg, #40a9ff, #096dd9) !important;
        box-shadow: 0 0 10px rgba(24, 144, 255, 0.35);
      }}}}.theme-white /* ==================== Select 下拉面板（全局浅色） ==================== */
.ant-select-dropdown {
  background: #ffffff !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;

  .ant-select-item  {
    color: #303133 !important;
    font-size: 12px !important;
    min-height: 28px !important;
    line-height: 28px !important;
    transition: background 0.15s !important;

    &:hover  {
      background: rgba(24, 144, 255, 0.08) !important;
    }}

  .ant-select-item-option-selected  {
    background: rgba(24, 144, 255, 0.1) !important;
    color: #1890ff !important;
    font-weight: 500 !important;
  }

  .ant-select-item-option-active  {
    background: rgba(0, 0, 0, 0.04) !important;
  }

  .ant-select-item-empty  {
    color: #909399 !important;
  }}
</style>
