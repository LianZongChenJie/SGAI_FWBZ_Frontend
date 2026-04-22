<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="1000">
    <BasicForm @register="registerForm">
      <template #title>
        <div class="info-title"> 基本信息 </div>
      </template>
      <template #footer>
        <div class="info-title"> 执行周期 </div>
      </template>
      <template #disposable>
        <a-select
          v-model:value="formState.disposable"
          @change="handleExecuteCycleChange"
          :options="executeCycleOptions"
          :field-names="{ label: 'name', value: 'value' }"
          style="width: 100%"
        />
      </template>
      <template #timeType>
        <a-select v-model:value="formState.timeType" :options="timeTypeOptions" @change="handleDate" style="min-width: 100px" />
      </template>
      <template #frequency>
        <div style="display: flex; align-items: center">
          <span style="margin-right: 8px">每</span>
          <a-input-number v-model:value="formState.frequency" :min="1" style="width: 100%" @change="handleFrequencyChange" />
        </div>
      </template>
      <template #specificTime>
        <div class="specific-time-container">
          <span class="specific-time-label">的</span>
          <a-cascader
            :options="frequencyTimeOptions"
            v-model:value="formState.specificTime"
            :field-names="{ label: 'label', value: 'value', children: 'children' }"
            :multiple="true"
            separator=""
            style="width: 100%"
            @change="handleSpecificTimeChange"
          />
        </div>
      </template>
      <template #frequencyDisplay>
        <div class="frequency-display" v-if="formState.disposable === true">
          <div class="frequency-text"> 每 {{ formState.frequency }}{{ timeTypeText }} 的 </div>
          <div class="frequency-tags">
            <a-tag v-for="(tag, index) in formState.specificTime" :key="index" color="blue">
              <span>{{ formatSpecificTimeTag(tag) }}</span>
            </a-tag>
          </div>
        </div>
      </template>
      <template #broad>
        <div class="broad-container">
          <a-input v-model:value="formState.broad" style="width: 120px; margin-right: 8px" @input="handleBroadInput" />
          <a-dropdown :trigger="['click']">
            <a-button type="primary" size="small">
              {{ formState.broadUnit }}
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="handleBroadUnitChange">
                <a-menu-item key="时">时</a-menu-item>
                <a-menu-item key="天">天</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, reactive, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import { addFormSchema } from '../InspectPlan.data';
  import { addInspectPlan, getPlanNumber } from '../InspectPlan.api';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { getTreeData } from '../InspectPlan.api';
  const emit = defineEmits(['register', 'success']);

  type TimeType = 'day' | 'week' | 'month' | 'year';
  type SpecificTimeValue = string[] | string;
  interface TimeOption {
    label: string;
    value: string;
    children?: TimeOption[];
  }
  interface SpaceTreeNode {
    id: string;
    spaceName: string;
    childrens: SpaceTreeNode[];
  }
  interface FormState {
    disposable: boolean;
    timeType: TimeType | '';
    specificTime: SpecificTimeValue[];
    broad: string;
    broadUnit: '时' | '天';
    frequency: number | '';
  }
  interface ValidateError {
    errorFields?: unknown[];
  }

  const isUpdate = ref(false);
  const title = computed(() => (isUpdate.value ? '编辑巡检计划' : '新增巡检计划'));
  const spaceId = ref('');
  const ddarr = ref('');

  // 时间类型文本
  const timeTypeText = computed(() => {
    switch (formState.timeType) {
      case 'day':
        return '天';
      case 'week':
        return '周';
      case 'month':
        return '月';
      case 'year':
        return '年';
      default:
        return '';
    }
  });

  // 表单状态：默认固定时间(false)，周期时间(true)
  const formState = reactive<FormState>({
    disposable: false, // ✅ 新增默认固定时间，逻辑：false=固定时间 true=周期时间
    timeType: '',
    specificTime: [],
    broad: '',
    broadUnit: '时',
    frequency: '',
  });

  const mockGroupOptions = [
    { id: '1', name: '巡检组A' },
    { id: '2', name: '巡检组B' },
    { id: '3', name: '巡检组C' },
  ];

  const mockSpaceTreeData = ref([]);

  function getWeekDay() {
    return [
      { label: '星期一', value: '星期一' },
      { label: '星期二', value: '星期二' },
      { label: '星期三', value: '星期三' },
      { label: '星期四', value: '星期四' },
      { label: '星期五', value: '星期五' },
      { label: '星期六', value: '星期六' },
      { label: '星期日', value: '星期日' },
    ];
  }

  function getDayMonth(a: number, b: number, t: 'day' | 'month'): TimeOption[] {
    const arr: TimeOption[] = [];
    for (let i = a; i < b; i++) {
      if (t === 'day') {
        const val = i < 10 ? '0' + i : i;
        arr.push({ label: val + ':00', value: val + ':00' });
      } else {
        arr.push({ label: i, value: i });
      }
    }
    return arr;
  }

  function getYearDay(a: number, b: number): TimeOption[] {
    const arr: TimeOption[] = [];
    for (let i = a; i < b; i++) {
      arr.push({ label: i + '月', value: i + '月', children: getDayMonth(1, 32, 'month') });
    }
    return arr;
  }

  const weekDay = getWeekDay();
  const dayTime = getDayMonth(0, 24, 'day');
  const monthDay = getDayMonth(1, 32, 'month');
  const yearDay = getYearDay(1, 13);
  const frequencyTimeOptions = ref<TimeOption[]>([]);

  // ✅ 执行方式选项：严格对应逻辑：false=固定时间 true=周期时间
  const executeCycleOptions = [
    { label: '固定时间', value: false, name: '固定时间' },
    { label: '周期时间', value: true, name: '周期时间' },
  ];

  // 时间类型选项
  const timeTypeOptions = [
    { label: '天', value: 'day' },
    { label: '周', value: 'week' },
    { label: '月', value: 'month' },
    { label: '年', value: 'year' },
  ];

  function handleDate(value: TimeType) {
    formState.timeType = value;
    syncFieldAndClearValidate('timeType', value);
    if (value === 'day') {
      frequencyTimeOptions.value = dayTime;
    } else if (value === 'week') {
      frequencyTimeOptions.value = weekDay;
    } else if (value === 'month') {
      frequencyTimeOptions.value = monthDay;
    } else {
      frequencyTimeOptions.value = yearDay;
    }
    updateSchema([
      {
        field: 'specificTime',
        componentProps: {
          options: frequencyTimeOptions.value,
        },
      },
    ]);
  }

  function handleFrequencyChange(value: number | null) {
    const n = value === null || value === undefined ? undefined : Number(value);
    syncFieldAndClearValidate('frequency', Number.isNaN(n as number) ? undefined : n);
  }

  function normalizeSpecificTime(value: unknown): SpecificTimeValue[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => {
      if (Array.isArray(item)) return item.length > 0;
      return item !== null && item !== undefined && String(item).trim() !== '';
    }) as SpecificTimeValue[];
  }

  function handleSpecificTimeChange(value: unknown) {
    console.log('value', value);
    const normalized = normalizeSpecificTime(value);
    console.log('normalized', normalized);
    formState.specificTime = normalized;
    syncFieldAndClearValidate('specificTime', normalized.length ? normalized : undefined);
  }

  function handleBroadInput(e: Event) {
    const val = (e.target as HTMLInputElement)?.value ?? '';
    formState.broad = val;
    syncFieldAndClearValidate('broad', val || undefined);
  }

  function handleBroadUnitChange({ key }: { key: string }) {
    formState.broadUnit = key === '天' ? '天' : '时';
  }

  function handleExecuteCycleChange(value: boolean) {
    formState.disposable = value;
    setFieldsValue({ disposable: value });
    updateSchema([
      {
        field: 'frequency',
        ifShow: value === true,
      },
      {
        field: 'timeType',
        ifShow: value === true,
      },
      {
        field: 'specificTime',
        ifShow: value === true,
      },
      {
        field: 'frequencyDisplay',
        ifShow: value === true,
      },
      {
        field: 'broad',
        ifShow: value === true,
      },
    ]);
    if (value === false) {
      formState.timeType = '';
      formState.specificTime = [];
      formState.frequency = '';
      formState.broad = '';
      formState.broadUnit = '时';
      setFieldsValue({
        timeType: undefined,
        specificTime: undefined,
        frequency: undefined,
        broad: undefined,
      });
      clearValidate(['frequency', 'timeType', 'specificTime', 'broad']);
    }
  }

  const [registerForm, { setFieldsValue, resetFields, validate, clearValidate, updateSchema }] = useForm({
    labelWidth: 120,
    schemas: addFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
  });

  function syncFieldAndClearValidate(field: 'timeType' | 'frequency' | 'specificTime' | 'broad', value: unknown) {
    setFieldsValue({ [field]: value });
    clearValidate([field]);
  }

  function formatSpecificTimeTag(tag: SpecificTimeValue): string {
    console.log('tag', tag);
    if (Array.isArray(tag)) {
      return tag.join('');
    }
    return String(tag);
  }

  // 自定义 slot 绑定在 formState 上，需同步到 BasicForm 内部模型
  watch(
    () => formState.disposable,
    (v) => setFieldsValue({ disposable: v }),
    { flush: 'sync' }
  );
  watch(
    () => formState.frequency,
    (v) => {
      const n = v === '' || v === null || v === undefined ? undefined : Number(v);
      setFieldsValue({ frequency: Number.isNaN(n as number) ? undefined : n });
    },
    { flush: 'sync' }
  );
  watch(
    () => formState.timeType,
    (v) => setFieldsValue({ timeType: v || undefined }),
    { flush: 'sync' }
  );
  watch(
    () => formState.specificTime,
    (v) => setFieldsValue({ specificTime: v?.length ? v : undefined }),
    { deep: true, flush: 'sync' }
  );
  watch(
    () => formState.broad,
    (v) => setFieldsValue({ broad: v }),
    { flush: 'sync' }
  );

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    mockSpaceTreeData.value = await getTreeData();
    if (!isUpdate.value) {
      await resetFields();
      // ✅ 新增时强制默认固定时间(false)，确保下拉框默认选中
      formState.disposable = false;
      setFieldsValue({
        planNo: 'XJ-' + Date.now(),
        groupId: mockGroupOptions[0].id,
        disposable: false,
      });
      formState.timeType = '';
      formState.frequency = '';
      formState.specificTime = [];
      formState.broad = '';
      formState.broadUnit = '时';
    } else {
      await setFieldsValue(data.record);
      // ✅ 编辑时严格使用后端布尔值，false=固定时间 true=周期时间
      formState.disposable = !!data.record.disposable;
      formState.timeType = data.record.timeType || '';
      const cycleNum = Number(data.record.cycle);
      const freqNum = Number(data.record.frequency);
      formState.frequency =
        data.record.cycle != null && data.record.cycle !== '' && !Number.isNaN(cycleNum)
          ? cycleNum
          : data.record.frequency != null && data.record.frequency !== '' && !Number.isNaN(freqNum)
            ? freqNum
            : '';
      formState.specificTime = data.record.specificTime
        ? data.record.specificTime.split(',').map((item: string): SpecificTimeValue => {
            if (formState.timeType === 'year') {
              const parts = item.match(/(\d+月)(\d+日)/);
              return parts ? [parts[1], parts[2]] : [item];
            }
            return [item];
          })
        : [];
      formState.broad = data.record.broad || '';
      formState.broadUnit = data.record.broadUnit || '时';
      if (formState.timeType) {
        handleDate(formState.timeType);
      }
    }

    try {
      const planNumberRes = await getPlanNumber();
      setFieldsValue({ planNo: planNumberRes });
    } catch (e) {
      setFieldsValue({ planNo: 'XJ-' + Date.now() });
    }

    updateSchema([
      {
        field: 'groupId',
        componentProps: {
          options: mockGroupOptions,
          fieldNames: { label: 'name', value: 'id' },
          placeholder: '请选择执行组别',
          allowClear: true,
        },
      },
      {
        field: 'spaceId',
        componentProps: {
          treeData: mockSpaceTreeData.value,
          fieldNames: { label: 'title', value: 'key', children: 'children' },
          showSearch: true,
          treeCheckable: true,
          multiple: true,
          treeCheckStrictly: true,
          showCheckedStrategy: 'SHOW_ALL',
          onChange: (value) => {
            console.log('value', value);
            if (value && value.length) {
              spaceId.value = value.map((item) => item.value).join(',');
              ddarr.value = value.map((item) => item.label).join(',');
            } else {
              spaceId.value = '';
              ddarr.value = '';
            }
          },
        },
      },
      {
        field: 'disposable',
        component: 'Input',
        slot: 'disposable',
      },
      {
        field: 'frequency',
        component: 'Input',
        slot: 'frequency',
      },
      {
        field: 'timeType',
        component: 'Input',
        slot: 'timeType',
      },
      {
        field: 'specificTime',
        component: 'Input',
        slot: 'specificTime',
      },
      {
        field: 'frequencyDisplay',
        component: 'Input',
        slot: 'frequencyDisplay',
      },
      {
        field: 'broad',
        component: 'Input',
        slot: 'broad',
      },
    ]);
  });

  async function handleSubmit() {
    console.log('formState', formState);
    let specificTime = formState.specificTime;
    try {
      await setFieldsValue({
        disposable: formState.disposable,
        timeType: formState.timeType || undefined,
        frequency: formState.frequency === '' || formState.frequency == null ? undefined : Number(formState.frequency),
        specificTime: normalizeSpecificTime(formState.specificTime).length ? normalizeSpecificTime(formState.specificTime) : undefined,
        broad: formState.broad || undefined,
      });
      const values = await validate();
      setModalProps({ confirmLoading: true });
      const params = { ...values };
      params.spaceId = spaceId.value;
      params.spaceName = ddarr.value;
      console.log('params', params, params.unit, params.timeType, params.unit === '年');
      if (params.timeType == 'year') {
        console.log('进入年', specificTime);
        let string = '';
        specificTime.forEach((item) => {
          string += (Array.isArray(item) ? item.join('') : String(item)) + '日,';
        });
        console.log('string1', string);
        params.specificTime = string.slice(0, -1);
      }
      //   const arr = normalizeSpecificTime(formState.specificTime).map((item) => {
      //     const str = Array.isArray(item) ? item.join('') : String(item);
      //     const num = str.replace(/[^0-9]/g, '');
      //     if (formState.timeType === 'day') {
      //       return `${num.padStart(2, '0')}:00`;
      //     }
      //     return num;
      //   });
      //   params.specificTime = arr.join(',');
      // }

      if (params.groupId) {
        const group = mockGroupOptions.find((item) => item.id === params.groupId);
        if (group) {
          params.groupName = group.name;
        }
      }

      if (formState.timeType === 'day') {
        params.unit = '天';
      } else if (formState.timeType === 'week') {
        params.unit = '周';
      } else if (formState.timeType === 'month') {
        params.unit = '月';
      } else if (formState.timeType === 'year') {
        params.unit = '年';
      }
      console.log('params', params);
      const timeArr = typeof params.time === 'string' ? params.time.split(',') : params.time;
      console.log('timeArr', timeArr, typeof params.time === 'string');

      // ✅ 最终提交参数：严格对应逻辑：false=固定时间 true=周期时间
      const finalParams = {
        name: params.name,
        planNo: params.planNo,
        description: params.description,
        disposable: formState.disposable, // 纯布尔值，后端完美接收
        spaceId: params.spaceId,
        spaceName: params.spaceName,
        startTime: timeArr ? timeArr[0] : '',
        endTime: timeArr ? timeArr[1] : '',
        cycle: params.frequency ? params.frequency : '',
        unit: params.unit ? params.unit : '',
        groupName: params.groupName ? params.groupName : '',
        groupId: params.groupId ? params.groupId : '',
        specificTime: params.specificTime,
        broad: formState.broad || '',
        broadUnit: formState.broadUnit || '时',
        state: '未开始',
      };
      const res = await addInspectPlan(finalParams);
      message.success('操作成功');
      closeModal();
      emit('success', res);
    } catch (error: unknown) {
      if ((error as ValidateError)?.errorFields) {
        return;
      }
      message.error('操作失败');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .info-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    color: #333;
  }

  :deep(.ant-input-number) {
    width: 100%;
  }

  .specific-time-container {
    display: flex;
    align-items: center;

    .specific-time-label {
      margin-right: 8px;
      white-space: nowrap;
    }
  }

  .broad-container {
    display: flex;
    align-items: center;
  }

  .frequency-display {
    margin-top: 12px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;

    .frequency-text {
      margin-bottom: 8px;
      font-size: 14px;
      color: #333;
    }

    .frequency-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
</style>
