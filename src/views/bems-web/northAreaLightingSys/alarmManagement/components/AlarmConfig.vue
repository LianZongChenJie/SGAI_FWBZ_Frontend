<template>
  <div class="alarm-config" :class="themeClass">
    <div class="config-layout">
      <!-- 左侧：报警条件配置 -->
      <div class="config-form-card">
        <div class="card-title">
          <span class="title-icon">⚠️</span>
          <span>报警条件配置</span>
        </div>

        <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical" class="config-form">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="报警名称" name="ruleName">
                <a-input v-model:value="formState.ruleName" placeholder="请输入报警名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="监测对象" name="circuitCode">
                <a-select v-model:value="formState.circuitCode" placeholder="请选择监测对象">
                    <a-select-option value="all">全部回路</a-select-option>
                    <a-select-option value="A1">A1地块</a-select-option>
                    <a-select-option value="A2">A2地块</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="报警条件" name="alarmCondition">
                <a-select v-model:value="formState.alarmCondition" placeholder="请选择报警条件">
                  <a-select-option value="功率 > 阈值">功率 &gt; 阈值</a-select-option>
                  <a-select-option value="电压 < 阈值">电压 &lt; 阈值</a-select-option>
                  <a-select-option value="离线时长 > 阈值">离线时长 &gt; 阈值</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="阈值" name="threshold">
                <a-input v-model:value="formState.threshold" placeholder="请输入阈值">
                  <template #addonAfter>kW</template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="报警等级" name="alarmLevel">
                <a-select v-model:value="formState.alarmLevel" placeholder="请选择报警等级">
                  <a-select-option v-for="item in alarmLevelList" :key="item.id" :value="item.alarmLevelName">
                    {{ item.alarmLevelName }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="通知方式" name="notifyWay">
                <a-select v-model:value="formState.notifyWay" placeholder="请选择通知方式">
                  <a-select-option value="平台消息">平台消息</a-select-option>
                  <a-select-option value="短信">短信</a-select-option>
                  <a-select-option value="邮件">邮件</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <div class="form-actions">
            <a-button type="primary" @click="handleSave">保存配置</a-button>
          </div>
        </a-form>
      </div>

      <!-- 右侧：报警类别与等级 -->
      <div class="config-table-card">
        <div class="card-title">
          <span class="title-icon title-icon-blue">📋</span>
          <span>报警类别与等级</span>
        </div>

        <a-table
          :columns="columns"
          :data-source="categoryList"
          :pagination="false"
          row-key="id"
          class="config-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'color'">
              <span class="color-dot" :style="{ background: record.colorValue }"></span>
              {{ record.color }}
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { reactive, ref, onMounted } from 'vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import { getAlarmLevelListApi, getAlarmCategoryListApi, getCircuitListApi, saveAlarmConfigApi } from '../alarmManagement.api';

const formRef = ref<FormInstance>();

const formState = reactive({
  alarmName: '功率超限报警',
  monitorTarget: 'A1地块',
  alarmCondition: '功率 > 阈值',
  threshold: '6.0',
  alarmLevel: '重要',
  notifyMethod: '短信',
});

const formRules: Record<string, Rule[]> = {
  ruleName: [{ required: true, message: '请输入报警名称', trigger: 'blur' }],
  circuitCode: [{ required: true, message: '请选择监测对象', trigger: 'change' }],
  alarmCondition: [{ required: true, message: '请选择报警条件', trigger: 'change' }],
  threshold: [{ required: true, message: '请输入阈值', trigger: 'blur' }],
  alarmLevel: [{ required: true, message: '请选择报警等级', trigger: 'change' }],
  notifyWay: [{ required: true, message: '请选择通知方式', trigger: 'change' }],
};

const alarmLevelList = ref<any[]>([]);
const categoryList = ref<any[]>([]);
const circuitList = ref<any[]>([]);

const loadAlarmLevels = async () => {
  const res = await getAlarmLevelListApi();
  const list = res?.result || res || [];
  alarmLevelList.value = Array.isArray(list) ? list : [];
};

const loadCategoryList = async () => {
  const res = await getAlarmCategoryListApi();
  const list = res?.result || res || [];
  categoryList.value = (Array.isArray(list) ? list : []).map((item: any) => ({
    ...item,
    colorValue: levelColorMap[item.alarmLevelName] || '#1890ff',
    color: item.alarmLevelName === '一般' ? '蓝色' : item.alarmLevelName === '紧急' || item.alarmLevelName === '非常紧急' ? '红色' : '橙色',
  }));
};

const loadCircuitList = async () => {
  const res = await getCircuitListApi({ pageNo: 1, pageSize: 999 });
  const list = res?.records || res?.result?.records || res?.result || res || [];
  circuitList.value = Array.isArray(list) ? list : [];
  console.log(circuitList.value, 444);
};

onMounted(() => {
  loadAlarmLevels();
  loadCategoryList();
  loadCircuitList();
});

const levelColorMap: Record<string, string> = {
  '紧急': '#ff4d4f',
  '非常紧急': '#ff4d4f',
  '重要': '#fa8c16',
  '一般': '#1890ff',
};

const columns = [
  { title: '类别', dataIndex: 'alarmCategoryName', key: 'alarmCategoryName' },
  { title: '等级', dataIndex: 'alarmLevelName', key: 'alarmLevelName' },
  { title: '颜色', dataIndex: 'color', key: 'color' },
  { title: '通知方式', dataIndex: 'noticeWay', key: 'noticeWay' },
];

const handleSave = async () => {
  try {
    await formRef.value?.validateFields();
  } catch {
    return;
  }

  // 从报警条件中提取操作符
  const operatorMap: Record<string, string> = { '功率 > 阈值': '>', '电压 < 阈值': '<', '离线时长 > 阈值': '>' };
  const operator = operatorMap[formState.alarmCondition] || '>';

  // 查找报警等级对应的ID
  const levelItem = alarmLevelList.value.find((l) => l.alarmLevelName === formState.alarmLevel);

  // 因为没有数据暂时写死points
  const points =  [
        {
            "deviceId": 1,
            "deviceName": "北区照明电表001",
            "pointId": 1,
            "pointName": "电流",
            "timeGranularity": "hour",
            "operator": ">",
            "conditionValue": "100"
        }
    ]

  // 生成ruleCode: RA + yyyyMMddHHmmss
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ruleCode = `RA${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const params = {
    ruleCode,  
    ruleName: formState.ruleName,
    alarmLevelId: levelItem?.id,
    alarmLevelName: formState.alarmLevel,
    noticeWay: formState.noticeWay,
    pointType: 'instant',
    frequency: 5,
    frequencyUnit: 'm',
    noticeUser: 'admin',
    points,
  };

  try {
    await saveAlarmConfigApi(params);
    message.success('报警配置保存成功');
  } catch (error: any) {
    message.error(error?.message || '保存失败，请稍后重试');
  }
};
</script>

<style scoped lang="less">
.alarm-config {
  .config-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .config-form-card,
  .config-table-card {
    background: rgba(7, 15, 24, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    padding: 20px 20px;

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 24px;

      .title-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        color: #2b2b2b;
        font-size: 16px;
      }
    }
  }

  .config-form {
    :deep(.ant-form-item-label > label) {
      color: rgba(255, 255, 255, 0.75);
      font-size: 14px;
    }

    :deep(.ant-input),
    :deep(.ant-select-selector) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
      color: #fff;

      &::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }
    }

    :deep(.ant-select-selection-item) {
      color: #fff !important;
    }

    :deep(.ant-select-arrow) {
      color: rgba(255, 255, 255, 0.45);
    }

    :deep(.ant-select-dropdown) {
      background: #1a1a2e;

      .ant-select-item {
        color: #fff !important;

        &.ant-select-item-option-selected {
          background: rgba(24, 144, 255, 0.2) !important;
        }

        &.ant-select-item-option-active {
          background: rgba(255, 255, 255, 0.08) !important;
        }
      }
    }

    :deep(.ant-input-group-addon) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.65);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }
  }

  .config-table {
    :deep(.ant-table) {
      background: transparent;
      color: #fff;
      .ant-table-thead > tr > th {
        background: transparent;
        color: rgba(255, 255, 255, 0.88);
        font-weight: 700;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        border-right: 1px solid rgba(255, 255, 255, 0.12);
        padding: 14px 18px;
        text-align: left;

        &:last-child {
          border-right: none;
        }
      }

      .ant-table-tbody > tr > td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.88);
        padding: 16px 18px;
        vertical-align: middle;
      }

      .ant-table-tbody > tr:hover > td {
        background: rgba(255, 255, 255, 0.02);
      }
    }

    .color-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.15) inset;
    }
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white.alarm-config {
  .config-layout  {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .config-form-card,
  .config-table-card  {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 20px 20px;

    .card-title  {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 24px;

      .title-icon  {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        color: #2b2b2b;
        font-size: 16px;
      }}}

  .config-form  {
    :deep(.ant-form-item-label > label)  {
      color: #606266;
      font-size: 14px;
    }

    :deep(.ant-input),
    :deep(.ant-select-selector)  {
      background: #ffffff;
      border-color: #dcdfe6;
      color: #303133;

      &::placeholder  {
        color: rgba(0, 0, 0, 0.35);
      }}

    :deep(.ant-select-selection-item)  {
      color: #303133 !important;
    }

    :deep(.ant-select-arrow)  {
      color: rgba(0, 0, 0, 0.45);
    }

    :deep(.ant-select-dropdown)  {
      background: #ffffff;

      .ant-select-item  {
        color: #303133 !important;

        &.ant-select-item-option-selected  {
          background: rgba(24, 144, 255, 0.12) !important;
        }

        &.ant-select-item-option-active  {
          background: rgba(0, 0, 0, 0.04) !important;
        }}}

    :deep(.ant-input-group-addon)  {
      background: #f5f7fa;
      border-color: #dcdfe6;
      color: #606266;
    }

    .form-actions  {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }}

  .config-table  {
    :deep(.ant-table)  {
      background: transparent;
      color: #303133;
      .ant-table-thead > tr > th  {
        background: #f5f7fa;
        color: #606266;
        font-weight: 700;
        border-bottom: 1px solid #e4e7ed;
        border-right: 1px solid #e4e7ed;
        padding: 14px 18px;
        text-align: left;

        &:last-child  {
          border-right: none;
        }}

      .ant-table-tbody > tr > td  {
        border-bottom: 1px solid #f0f0f0;
        color: #303133;
        padding: 16px 18px;
        vertical-align: middle;
      }

      .ant-table-tbody > tr:hover > td  {
        background: rgba(0, 0, 0, 0.04);
      }}

    .color-dot  {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.15) inset;
    }}}
</style>
