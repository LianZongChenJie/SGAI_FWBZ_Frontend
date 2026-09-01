<template>
  <div class="add-modal-wrapper" :class="themeClass">
    <a-modal
      v-model:open="open"
      :title="modalTitle"
      :footer="null"
      width="560px"
      :destroyOnClose="true"
      :maskClosable="false"
      wrapClassName="dark-tech-modal"
    >
      <!-- 顶部提示条 -->
      <div class="modal-tip">
        <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{{ type === 'add' ? '请填写以下信息以新增一条接口记录' : '请修改接口配置信息' }}</span>
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
        <!-- 厂商 -->
        <a-form-item label="厂商" name="manufacturer" :rules="[{ required: true, message: '请输入厂商名称' }]">
          <a-input
            v-model:value="formState.manufacturer"
            placeholder="请输入厂商名称，如：西门子、施耐德"
            allowClear
          />
        </a-form-item>

        <!-- 协议类型 -->
        <a-form-item label="协议类型" name="protocolType" :rules="[{ required: true, message: '请选择协议类型' }]">
          <a-select
            v-model:value="formState.protocolType"
            placeholder="请选择协议类型"
            :options="protocolTypeOptions"
            allowClear
          />
        </a-form-item>

        <!-- 接口地址 -->
        <a-form-item label="接口地址" name="interfaceAddress" :rules="[{ required: true, message: '请输入接口地址' }]">
          <a-input
            v-model:value="formState.interfaceAddress"
            placeholder="请输入接口地址，如：opc.tcp://192.168.1.10:4840"
            allowClear
          />
        </a-form-item>

        <!-- 所属地块 -->
        <!-- <a-form-item label="所属地块" name="plot" :rules="[{ required: true, message: '请选择所属地块' }]">
          <a-select
            v-model:value="formState.plot"
            placeholder="请选择所属地块"
            :options="plotOptions"
            allowClear
            showSearch
          />
        </a-form-item> -->

        <!-- 数据类型 -->
        <!-- <a-form-item label="数据类型" name="dataType" :rules="[{ required: true, message: '请选择数据类型' }]">
          <a-select
            v-model:value="formState.dataType"
            placeholder="请选择数据类型"
            mode="multiple"
            :options="dataTypeOptions"
            allowClear
          />
        </a-form-item> -->
        <a-form-item label="数据类型" name="dataType" :rules="[{ required: true, message: '请选择数据类型' }]">
          <a-select
            v-model:value="formState.dataType"
            placeholder="请选择数据类型"
            :options="dataTypeOptions"
            allowClear
          />
        </a-form-item>

        <!-- 状态（编辑时显示） -->
        <a-form-item v-if="type === 'edit'" label="状态" name="status" :rules="[{ required: true, message: '请选择状态' }]">
          <a-select
            v-model:value="formState.status"
            placeholder="请选择状态"
            :options="statusOptions"
            allowClear
          />
        </a-form-item>
      </a-form>

      <!-- 底部操作按钮 -->
      <div class="modal-footer">
        <a-button class="btn-cancel" @click="closeModal">取消</a-button>
        <a-button v-if="type === 'add'" class="btn-reset" @click="onReset">重置</a-button>
        <a-button class="btn-confirm" type="primary" :loading="loading" @click="onSubmit">确定</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { dataCollectAddApi, dataCollectEditApi } from '@/api/dataCollect';

const emit = defineEmits<{
  success: [];
}>();

/* ==================== 弹框状态 ==================== */
const open = ref(false);
const type = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();
const loading = ref(false);

/* ==================== 表单字段定义 ==================== */
interface InterfaceForm {
  id: string;
  manufacturer: string;
  protocolType: string;
  interfaceAddress: string;
  // plot: string;
  dataType: string;
  status: string;
}

const defaultForm: InterfaceForm = {
  id: '',
  manufacturer: '',
  protocolType: '',
  interfaceAddress: '',
  // plot: '',
  dataType: '',
  status: '正常',
};

const formState = ref<InterfaceForm>({ ...defaultForm });

/* ==================== 下拉选项 ==================== */
const protocolTypeOptions = [
  { label: 'OPC UA', value: 'OPC UA' },
  { label: 'Modbus TCP', value: 'Modbus TCP' },
  { label: 'MQTT', value: 'MQTT' },
  { label: 'HTTP API', value: 'HTTP API' },
  { label: 'SDK', value: 'SDK' },
];

const plotOptions = [
  { label: 'A1 地块', value: 'A1' },
  { label: 'A2 地块', value: 'A2' },
  { label: 'B1 地块', value: 'B1' },
  { label: 'B2 地块', value: 'B2' },
  { label: 'C1 地块', value: 'C1' },
  { label: 'C2 地块', value: 'C2' },
];

const dataTypeOptions = [
  { label: '实时数据/开关量', value: '实时数据/开关量' },
  { label: '实时数据/模拟量', value: '实时数据/模拟量' },
  { label: '开关量/模拟量', value: '开关量/模拟量' },
  { label: '视频/监控', value: '视频/监控' },
];

const statusOptions = [
  { label: '正常', value: '正常' },
  { label: '异常', value: '异常' },
  { label: '离线', value: '离线' },
];

/* ==================== 弹框标题 ==================== */
const modalTitle = computed(() => (type.value === 'add' ? '新增接口' : '编辑接口'));

/* ==================== 暴露给父组件的方法 ==================== */
interface InterfaceRow {
  id?: string;
  manufacturer?: string;
  protocolType?: string;
  interfaceAddress?: string;
  // plot?: string;
  // dataType?: string | string[];
  dataType?: string;
  status?: string;
}

function showModal(mode: 'add' | 'edit', record?: InterfaceRow) {
  type.value = mode;
  if (mode === 'add') {
    formState.value = { ...defaultForm };
  } else if (mode === 'edit' && record) {
    formState.value = {
      id: record.id || '',
      manufacturer: record.manufacturer || '',
      protocolType: record.protocolType || '',
      interfaceAddress: record.interfaceAddress || '',
      // plot: record.plot || '',
      dataType: record.dataType || '',
      // dataType: Array.isArray(record.dataType)
      //   ? record.dataType
      //   : record.dataType
      //     ? record.dataType.split('/')
      //     : [],
      status: record.status || '正常',
    };
  }
  open.value = true;
  // 清除校验残留
  nextTick(() => {
    formRef.value?.clearValidate();
  });
}

function closeModal() {
  open.value = false;
  formRef.value?.resetFields();
  formState.value = { ...defaultForm };
}

/* ==================== 表单事件 ==================== */
function onReset() {
  formState.value = { ...defaultForm };
  formRef.value?.clearValidate();
}

async function onSubmit() {
  try {
    await formRef.value!.validate();

    loading.value = true;
    const submitData = { ...formState.value };

    // 根据类型调用对应 API
    const api = type.value === 'add' ? dataCollectAddApi : dataCollectEditApi;
    const res = await api(submitData);
    console.log('接口返回');
    console.log('res', res);
    // 判断接口返回：code=200 且 result 包含"成功"
    if (res.code === 200 && String(res.result || res.msg || '').includes('成功')) {
      message.success(type.value === 'add' ? '新增接口成功！' : '编辑接口成功！');
      closeModal();
      emit('success');
    } else {
      message.error(res.message || res.msg || '操作失败，请重试');
    }
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
  background: rgba(0, 162, 232, 0.06);
  border-left: 3px solid #00a2e8;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  color: #8a9ab0;

  .tip-icon {
    width: 18px;
    height: 18px;
    color: #00a2e8;
    flex-shrink: 0;
  }
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  margin: 0 -24px -24px;
  border-top: 1px solid #303d50;
  margin-top: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 24px;
    right: 24px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 162, 232, 0.4), transparent);
  }

  :deep(.ant-btn) {
    height: 34px;
    padding: 0 20px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 400;
    transition: all 0.2s;
  }

  .btn-cancel {
    background: transparent !important;
    border: 1px solid #303d50 !important;
    color: #a0aabf !important;

    &:hover {
      border-color: #5a6a80 !important;
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.04) !important;
    }
  }

  .btn-reset {
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid #303d50 !important;
    color: #a0aabf !important;

    &:hover {
      border-color: #5a6a80 !important;
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }
  }

  .btn-confirm {
    background: linear-gradient(135deg, #00a2e8, #0080c0) !important;
    border: none !important;
    color: #ffffff !important;

    &:hover {
      background: linear-gradient(135deg, #0090cf, #0070a8) !important;
      box-shadow: 0 0 12px rgba(0, 162, 232, 0.35);
    }
  }
}
</style>

/* ==================== 全局 Modal 覆盖（深色科技风） ==================== */
<style lang="less">
.dark-tech-modal {
  .ant-modal-content {
    background: #141d2b !important;
    border: 1px solid #303d50 !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 162, 232, 0.08) !important;
    overflow: hidden;

    /* 顶部蓝色渐变光条 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00a2e8, transparent);
      opacity: 0.6;
    }
  }

  .ant-modal-header {
    background: #1b2533 !important;
    border-bottom: 1px solid #303d50 !important;
    padding: 18px 24px 14px !important;
    border-radius: 8px 8px 0 0 !important;
  }

  .ant-modal-title {
    color: #ffffff !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    letter-spacing: 0.5px !important;
  }

  .ant-modal-close {
    color: #a0aabf !important;
    top: 18px !important;
    right: 20px !important;
    width: 28px !important;
    height: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
    transition: all 0.2s !important;

    &:hover {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }

  .ant-modal-body {
    padding: 20px 24px 24px !important;
    background: #141d2b !important;
  }

  .ant-modal-footer {
    display: none !important;
  }

  /* ==================== 表单覆盖 ==================== */
  .dark-form {
    .ant-form-item-label > label {
      color: #a0aabf !important;
      font-size: 13px !important;
      font-weight: 400 !important;
    }

    .ant-form-item-label > label.ant-form-item-required::before {
      color: #ff4d4f !important;
    }

    /* Input 外层包裹器（修复白色间隙） */
    .ant-input-affix-wrapper {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #00a2e8 !important;
      }

      &.ant-input-affix-wrapper-focused {
        border-color: #00a2e8 !important;
        box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      /* 内部 input 透明，让 wrapper 背景统一显示 */
      .ant-input {
        background: transparent !important;
        border: none !important;
        color: #ffffff !important;
        font-size: 13px !important;
        height: 34px !important;
        box-shadow: none !important;

        &::placeholder {
          color: #5a6a80 !important;
        }
      }

      .ant-input-clear-icon {
        color: #5a6a80 !important;
        background: transparent !important;

        &:hover {
          color: #a0aabf !important;
        }
      }
    }

    /* 无 allowClear 时的普通 input */
    .ant-input:not(.ant-input-affix-wrapper .ant-input) {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      font-size: 13px !important;
      height: 36px !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #00a2e8 !important;
      }

      &:focus,
      &.ant-input-focused {
        border-color: #00a2e8 !important;
        box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      &::placeholder {
        color: #5a6a80 !important;
      }
    }

    /* Select */
    .ant-select-selector {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      min-height: 36px !important;
      font-size: 13px !important;
      transition: all 0.2s !important;

      &:hover {
        border-color: #00a2e8 !important;
      }
    }

    .ant-select-focused .ant-select-selector {
      border-color: #00a2e8 !important;
      box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }

    .ant-select-arrow {
      color: #5a6a80 !important;
    }

    .ant-select-clear {
      color: #5a6a80 !important;
      background: #1b2533 !important;

      &:hover {
        color: #a0aabf !important;
      }
    }

    .ant-select-selection-placeholder {
      color: #5a6a80 !important;
    }

    /* 单选 / 多选 选中文字统一高亮（仅文字色，无背景） */
    .ant-select-selection-item {
      color: #00c6ff !important;
      font-size: 13px !important;
    }

    /* 多选 Tag 专属样式（背景+边框，仅多选模式） */
    .ant-select-multiple .ant-select-selection-item {
      background: rgba(0, 162, 232, 0.12) !important;
      border: 1px solid rgba(0, 162, 232, 0.25) !important;
      color: #00c6ff !important;
      border-radius: 3px !important;
      font-size: 12px !important;

      .ant-select-selection-item-content {
        color: #00c6ff !important;
      }

      .ant-select-selection-item-remove {
        color: #00a2e8 !important;

        &:hover {
          color: #ffffff !important;
        }
      }
    }

    /* 校验 */
    .ant-form-item-explain-error {
      font-size: 12px !important;
      color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-select-selector {
      border-color: #ff4d4f !important;
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
    font-size: 13px !important;
    min-height: 32px !important;
    line-height: 32px !important;
    transition: background 0.15s !important;

    &:hover {
      background: rgba(0, 162, 232, 0.1) !important;
    }
  }

  .ant-select-item-option-selected {
    background: rgba(0, 162, 232, 0.15) !important;
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
  background: rgba(24, 144, 255, 0.06);
  border-left: 3px solid #1890ff;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
  color: #909399;

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
  gap: 12px;
  padding: 16px 24px;
  margin: 0 -24px -24px;
  border-top: 1px solid #dcdfe6;
  margin-top: 20px;
  position: relative;

  &::before  {
    content: '';
    position: absolute;
    top: -1px;
    left: 24px;
    right: 24px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.4), transparent);
  }

  :deep(.ant-btn)  {
    height: 34px;
    padding: 0 20px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 400;
    transition: all 0.2s;
  }

  .btn-cancel  {
    background: transparent !important;
    border: 1px solid #dcdfe6 !important;
    color: #606266 !important;

    &:hover  {
      border-color: #1890ff !important;
      color: #1890ff !important;
      background: rgba(24, 144, 255, 0.08) !important;
    }}

  .btn-reset  {
    background: rgba(24, 144, 255, 0.04) !important;
    border: 1px solid #dcdfe6 !important;
    color: #606266 !important;

    &:hover  {
      border-color: #1890ff !important;
      color: #1890ff !important;
      background: rgba(24, 144, 255, 0.06) !important;
    }}

  .btn-confirm  {
    background: linear-gradient(135deg, #1890ff, #096dd9) !important;
    border: none !important;
    color: #ffffff !important;

    &:hover  {
      background: linear-gradient(135deg, #40a9ff, #096dd9) !important;
      box-shadow: 0 0 12px rgba(24, 144, 255, 0.35);
    }}}
</style>

<style lang="less">
.theme-white .dark-tech-modal {
  .ant-modal-content  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(24, 144, 255, 0.08) !important;
    overflow: hidden;

    /* 顶部蓝色渐变光条 */
    &::before  {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #1890ff, transparent);
      opacity: 0.6;
    }}

  .ant-modal-header  {
    background: #ffffff !important;
    border-bottom: 1px solid #dcdfe6 !important;
    padding: 18px 24px 14px !important;
    border-radius: 8px 8px 0 0 !important;
  }

  .ant-modal-title  {
    color: #303133 !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    letter-spacing: 0.5px !important;
  }

  .ant-modal-close  {
    color: #606266 !important;
    top: 18px !important;
    right: 20px !important;
    width: 28px !important;
    height: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
    transition: all 0.2s !important;

    &:hover  {
      color: #1890ff !important;
      background: rgba(24, 144, 255, 0.08) !important;
    }}

  .ant-modal-body  {
    padding: 20px 24px 24px !important;
    background: #ffffff !important;
  }

  .ant-modal-footer  {
    display: none !important;
  }

  /* ==================== 表单覆盖 ==================== */
  .dark-form  {
    .ant-form-item-label > label  {
      color: #606266 !important;
      font-size: 13px !important;
      font-weight: 400 !important;
    }

    .ant-form-item-label > label.ant-form-item-required::before  {
      color: #ff4d4f !important;
    }

    /* Input 外层包裹器（修复白色间隙） */
    .ant-input-affix-wrapper  {
      background: #ffffff !important;
      border: 1px solid #dcdfe6 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      transition: all 0.2s !important;

      &:hover  {
        border-color: #1890ff !important;
      }

      &.ant-input-affix-wrapper-focused  {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      /* 内部 input 透明，让 wrapper 背景统一显示 */
      .ant-input  {
        background: transparent !important;
        border: none !important;
        color: #303133 !important;
        font-size: 13px !important;
        height: 34px !important;
        box-shadow: none !important;

        &::placeholder  {
          color: #909399 !important;
        }}

      .ant-input-clear-icon  {
        color: #909399 !important;
        background: transparent !important;

        &:hover  {
          color: #606266 !important;
        }}}

    /* 无 allowClear 时的普通 input */
    .ant-input:not(.ant-input-affix-wrapper .ant-input)  {
      background: #ffffff !important;
      border: 1px solid #dcdfe6 !important;
      color: #303133 !important;
      border-radius: 4px !important;
      font-size: 13px !important;
      height: 36px !important;
      transition: all 0.2s !important;

      &:hover  {
        border-color: #1890ff !important;
      }

      &:focus,
      &.ant-input-focused  {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      &::placeholder  {
        color: #909399 !important;
      }}

    /* Select */
    .ant-select-selector  {
      background: #ffffff !important;
      border: 1px solid #dcdfe6 !important;
      color: #303133 !important;
      border-radius: 4px !important;
      min-height: 36px !important;
      font-size: 13px !important;
      transition: all 0.2s !important;

      &:hover  {
        border-color: #1890ff !important;
      }}

    .ant-select-focused .ant-select-selector  {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }

    .ant-select-arrow  {
      color: #909399 !important;
    }

    .ant-select-clear  {
      color: #909399 !important;
      background: #ffffff !important;

      &:hover  {
        color: #606266 !important;
      }}

    .ant-select-selection-placeholder  {
      color: #909399 !important;
    }

    /* 单选 / 多选 选中文字统一高亮（仅文字色，无背景） */
    .ant-select-selection-item  {
      color: #1890ff !important;
      font-size: 13px !important;
    }

    /* 多选 Tag 专属样式（背景+边框，仅多选模式） */
    .ant-select-multiple .ant-select-selection-item  {
      background: rgba(24, 144, 255, 0.12) !important;
      border: 1px solid rgba(24, 144, 255, 0.25) !important;
      color: #1890ff !important;
      border-radius: 3px !important;
      font-size: 12px !important;

      .ant-select-selection-item-content  {
        color: #1890ff !important;
      }

      .ant-select-selection-item-remove  {
        color: #1890ff !important;

        &:hover  {
          color: #ff4d4f !important;
        }}}

    /* 校验 */
    .ant-form-item-explain-error  {
      font-size: 12px !important;
      color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-select-selector  {
      border-color: #ff4d4f !important;
    }}}.theme-white /* ==================== Select 下拉面板（全局深色） ==================== */
.ant-select-dropdown {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;

  .ant-select-item  {
    color: #606266 !important;
    font-size: 13px !important;
    min-height: 32px !important;
    line-height: 32px !important;
    transition: background 0.15s !important;

    &:hover  {
      background: rgba(24, 144, 255, 0.1) !important;
    }}

  .ant-select-item-option-selected  {
    background: rgba(24, 144, 255, 0.15) !important;
    color: #1890ff !important;
    font-weight: 500 !important;
  }

  .ant-select-item-option-active  {
    background: rgba(24, 144, 255, 0.06) !important;
  }

  .ant-select-item-empty  {
    color: #909399 !important;
  }}
</style>
