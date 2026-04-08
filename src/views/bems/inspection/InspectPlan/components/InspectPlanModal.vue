<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="1000">
    <BasicForm @register="registerForm">
      <template #title>
        <div class="info-title"> 基本信息11 </div>
      </template>
      <template #footer>
        <div class="info-title"> 执行周期 </div>
      </template>
      <template #disposable>
        <a-select v-model:value="formState.disposable" @change="handleExecuteCycleChange">
          <a-option v-for="item in executeCycleOptions" :key="item.label" :label="item.name" :value="item.label"></a-option>
        </a-select>
      </template>
      <template #timeType>
        <a-select v-model:value="formState.timeType" @change="handleDate" style="min-width: 100px">
          <a-option v-for="(item, index) in timeTypeOptions" :key="index" :value="item.value">{{ item.label }}</a-option>
        </a-select>
      </template>
      <template #frequency>
        <div style="display: flex; align-items: center">
          <span style="margin-right: 8px">每</span>
          <a-input-number v-model:value="formState.frequency" :min="1" style="width: 100%" />
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
            placeholder="请选择具体时间"
          />
        </div>
      </template>
      <template #frequencyDisplay>
        <div class="frequency-display" v-if="formState.disposable === '周期时间'">
          <div class="frequency-text"> 每 {{ formState.frequency }}{{ timeTypeText }} 的 </div>
          <div class="frequency-tags">
            <a-tag v-for="(tag, index) in formState.specificTime" :key="index" color="blue">
              <span v-if="formState.timeType === 'year'">{{ tag[0] }}{{ tag[1] }}</span>
              <span v-else>{{ tag[0] }}</span>
            </a-tag>
          </div>
        </div>
      </template>
      <template #broad>
        <div class="broad-container">
          <a-input v-model:value="formState.broad" style="width: 120px; margin-right: 8px" />
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
  import { ref, computed, unref, reactive, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import { addFormSchema } from '../InspectPlan.data';
  import { addInspectPlan, getPlanNumber } from '../InspectPlan.api';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { Menu, MenuItem } from 'ant-design-vue';

  const emit = defineEmits(['register', 'success']);

  const isUpdate = ref(false);
  const title = computed(() => (isUpdate.value ? '编辑巡检计划' : '新增巡检计划11'));
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

  // 表单状态
  const formState = reactive({
    disposable: '固定时间',
    timeType: '',
    specificTime: [],
    broad: '',
    broadUnit: '时',
    frequency: '',
    time: [],
  });

  const mockGroupOptions = [
    { id: '1', name: '巡检组A' },
    { id: '2', name: '巡检组B' },
    { id: '3', name: '巡检组C' },
  ];

  const mockSpaceTreeData = [
    {
      id: '1',
      spaceName: '国家大剧院',
      childrens: [
        { id: '1-1', spaceName: '一层大厅', childrens: [] },
        { id: '1-2', spaceName: '二层展厅', childrens: [] },
        { id: '1-3', spaceName: '三层设备间', childrens: [] },
      ],
    },
    {
      id: '2',
      spaceName: '北京艺术中心',
      childrens: [
        { id: '2-1', spaceName: '音乐厅', childrens: [] },
        { id: '2-2', spaceName: '剧场', childrens: [] },
      ],
    },
    {
      id: '3',
      spaceName: '台湖艺术中心',
      childrens: [
        { id: '3-1', spaceName: '排练厅', childrens: [] },
        { id: '3-2', spaceName: '演出厅', childrens: [] },
      ],
    },
  ];

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

  function getDayMonth(a: number, b: number, t: string) {
    const arr: any[] = [];
    for (let i = a; i < b; i++) {
      if (t === 'day') {
        const val = i < 10 ? '0' + i : i;
        arr.push({ label: val + '时', value: val + '时' });
      } else {
        arr.push({ label: i + '日', value: i + '日' });
      }
    }
    return arr;
  }

  function getYearDay(a: number, b: number) {
    const arr: any[] = [];
    for (let i = a; i < b; i++) {
      arr.push({ label: i + '月', value: i + '月', children: getDayMonth(1, 32, 'month') });
    }
    return arr;
  }

  const weekDay = getWeekDay();
  const dayTime = getDayMonth(0, 24, 'day');
  const monthDay = getDayMonth(1, 32, 'month');
  const yearDay = getYearDay(1, 13);
  const frequencyTimeOptions = ref<any[]>([]);

  // 执行方式选项
  const executeCycleOptions = [
    { label: '固定时间', name: '固定时间' },
    { label: '周期时间', name: '周期时间' },
  ];

  // 时间类型选项
  const timeTypeOptions = [
    { label: '天', value: 'day' },
    { label: '周', value: 'week' },
    { label: '月', value: 'month' },
    { label: '年', value: 'year' },
  ];

  function handleDate(value: string) {
    formState.timeType = value;
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

  function handleBroadUnitChange({ key }: any) {
    formState.broadUnit = key;
  }

  function handleExecuteCycleChange(value: string) {
    formState.disposable = value;
    setFieldsValue({ disposable: value });
    updateSchema([
      {
        field: 'frequency',
        ifShow: value === '周期时间',
      },
      {
        field: 'timeType',
        ifShow: value === '周期时间',
      },
      {
        field: 'specificTime',
        ifShow: value === '周期时间',
      },
      {
        field: 'frequencyDisplay',
        ifShow: value === '周期时间',
      },
      {
        field: 'broad',
        ifShow: value === '周期时间',
      },
    ]);
    if (value === '固定时间') {
      formState.timeType = '';
      formState.specificTime = [];
      formState.frequency = '';
      formState.broad = '';
      formState.broadUnit = '时';
    }
  }

  const [registerForm, { setFieldsValue, resetFields, validate, setProps, getFieldsValue, updateSchema }] = useForm({
    labelWidth: 120,
    schemas: addFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (!isUpdate.value) {
      await resetFields();
      setFieldsValue({ planNo: 'XJ-' + Date.now(), groupId: mockGroupOptions[0].id, disposable: '固定时间' });
      formState.disposable = '固定时间';
      formState.timeType = '';
      formState.specificTime = [];
      formState.broad = '';
      formState.broadUnit = '时';
    } else {
      await setFieldsValue(data.record);
      formState.disposable = data.record.disposable ? (data.record.disposable === false ? '周期时间' : '固定时间') : '固定时间';
      formState.timeType = data.record.timeType || '';
      formState.specificTime = data.record.specificTime
        ? data.record.specificTime.split(',').map((item: string) => {
            if (formState.timeType === 'year') {
              const parts = item.match(/(\d+月)(\d+日)/);
              return parts ? [parts[1], parts[2]] : [item];
            }
            return [item];
          })
        : [];
      formState.broad = data.record.broad || '';
      formState.broadUnit = data.record.broadUnit || '时';
    }

    try {
      const planNumberRes = await getPlanNumber();
      setFieldsValue({ planNo: planNumberRes });
    } catch (e) {
      setFieldsValue({ planNo: 'XJ-' + Date.now() });
    }

    nextTick(() => {
      updateSchema([
        {
          field: 'frequency',
          ifShow: formState.disposable === '周期时间',
        },
        {
          field: 'timeType',
          ifShow: formState.disposable === '周期时间',
        },
        {
          field: 'specificTime',
          ifShow: formState.disposable === '周期时间',
        },
        {
          field: 'frequencyDisplay',
          ifShow: formState.disposable === '周期时间',
        },
        {
          field: 'broad',
          ifShow: formState.disposable === '周期时间',
        },
      ]);
    });

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
          treeData: mockSpaceTreeData,
          fieldNames: { label: 'spaceName', value: 'id', children: 'childrens' },
          showSearch: true,
          treeCheckable: true,
          multiple: true,
          onChange: (value: any, labelList: any) => {
            if (value && value.length) {
              spaceId.value = value.join(',');
              ddarr.value = (labelList || []).join(',');
            } else {
              spaceId.value = '';
              ddarr.value = '';
            }
          },
        },
      },
    ]);
  });

  async function handleSubmit() {
    try {
      // 先同步自定义组件的值到表单
      setFieldsValue({
        frequency: formState.frequency,
        timeType: formState.timeType,
        specificTime: formState.specificTime,
        broad: formState.broad,
        broadUnit: formState.broadUnit,
      });

      const values = await validate();
      setModalProps({ confirmLoading: true });

      const params = { ...values };
      params.spaceId = spaceId.value;
      params.spaceName = ddarr.value;

      // 数据处理
      if (formState.specificTime && formState.specificTime.length) {
        const arr = formState.specificTime.map((item: any) => item.join(''));
        params.specificTime = arr.join(',');
      }

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

      const finalParams = {
        name: params.name,
        planNo: params.planNo,
        description: params.description,
        disposable: formState.disposable === '周期时间' ? false : true,
        spaceId: params.spaceId,
        spaceName: params.spaceName,
        start: params.time ? params.time[0] : '',
        end: params.time ? params.time[1] : '',
        cycle: params.frequency ? params.frequency : '',
        unit: params.unit ? params.unit : '',
        groupName: params.groupName ? params.groupName : '',
        groupId: params.groupId ? params.groupId : '',
        specificTime: params.specificTime,
        broad: formState.broad || '',
        broadUnit: formState.broadUnit || '时',
      };

      const res = await addInspectPlan(finalParams);
      message.success('操作成功');
      closeModal();
      emit('success', res);
    } catch (error) {
      message.error('操作失败');
      throw error;
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
