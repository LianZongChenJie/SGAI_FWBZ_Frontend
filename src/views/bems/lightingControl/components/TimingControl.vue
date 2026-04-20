<template>
  <div class="">
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="addTimingControl">新增</a-button>
        &emsp;
        <a-button type="primary" @click="reload()">刷新</a-button>
      </template>
      <template #form-relType="{ model, field }">
        <a-select placeholder="请选择控制类型" v-model:value="model[field]" :options="options"> </a-select>
      </template>
      <template #form-startTime="{ model, field }">
        <a-time-picker v-model:value="model[field]" valueFormat="HH:mm:ss" @change="handleChangeStartTime" />
      </template>
      <template #form-endTime="{ model, field }">
        <a-time-picker v-model:value="model[field]" valueFormat="HH:mm:ss" @change="handleChangeEndTime" />
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'active'">
          <a-space>
            <a v-if="record.status === '禁用'" @click.stop="updatePlan(record)">编辑</a>
            <a v-else @click.stop="handleDetail(record)">详情</a>
            &emsp;
            <a-popconfirm
              v-if="record.status !== '启用'"
              title="确认删除该条数据？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a style="color: red"> 删除 </a>
            </a-popconfirm>
            &emsp;
            <a v-if="record.status !== '启用'" @click="handleEnable(record)"> 启用 </a>

            <template v-else>
              &emsp;
              <a-popconfirm title="确认禁用该条计划？" ok-text="确定" cancel-text="取消" @confirm="handleDisable(record)">
                <a style="color: red"> 禁用 </a>
              </a-popconfirm>
            </template>
            <a-popconfirm
              v-if="record.status == '启用'"
              title="确认立即执行该条计划？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleExecuteNow(record.id)"
            >
              <a> 立即执行 </a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <TimingControlModal ref="timingControlModalRef" :reload="reload" />
    <TimingControlDetail ref="timingControlDetailRef" :reload="reload" />
    <EnableModal ref="enableModalRef" :reload="reload" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { usePermissionStore } from '/@/store/modules/permission';
  import {
    getAreaListPageApi,
    setAreaOpenApi,
    deleteLightingPlanAPi,
    getLightingPlanAPi,
    enableApi,
    disableApi,
    executeNow,
  } from '../Standardized.api';
  import { message } from 'ant-design-vue';
  import TimingControlModal from './TimingControlModal.vue';
  import TimingControlDetail from './TimingControlDetail.vue';
  import EnableModal from './EnableModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  const weekList = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  // const filterWeek = computed((week) => {

  // });
  const filterWeek = (week) => {
    console.log(week, 'week');
    if (!week) {
      return '';
    }
    let weekArr = week.split(',');
    return weekArr.map((item) => weekList[item - 1]).join('、') || '';
  };
  // 详情弹框
  const timingControlModalRef = ref();
  const timingControlDetailRef = ref();
  const enableModalRef = ref();

  const options = ref([
    {
      label: '回路',
      value: '回路',
    },
    {
      label: '区域',
      value: '区域',
    },
  ]);

  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '控制类型', //显示label
      field: 'relType', //查询字段
      component: 'JInput', //渲染的组件
      slot: 'relType', //设置默认值
    },
    {
      label: '开始时间', //显示label
      field: 'startTime', //查询字段
      component: 'RangePicker', //渲染的组件
      slot: 'startTime', //设置默认值
    },
    {
      label: '结束时间', //显示label
      field: 'endTime', //查询字段
      component: 'RangePicker', //渲染的组件
      slot: 'endTime', //设置默认值
    },
  ];

  // 表格列配置
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '80px',
      customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
    },
    {
      title: '类型',
      dataIndex: 'relType',
      key: 'relType',
    },
    {
      title: '名称',
      dataIndex: 'planName',
      key: 'planName',
      sorter: (a, b) => a.planName.localeCompare(b.planName),
    },
    {
      title: '时间',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: '120px',
    },
    {
      title: '时间范围',
      dataIndex: 'date',
    },
    {
      title: '周期',
      dataIndex: 'weeks',
      width: '300px',
    },
    {
      title: '控制指令',
      dataIndex: 'operationType',
      key: 'operationType',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      dataIndex: 'active',
      key: 'active',
      width: '180px',
    },
  ];

  // 获取表格数据
  const getAreaListPage = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();

    let params = {
      relType: searchData.relType ? searchData.relType : undefined,
      startTime: searchData.startTime ? searchData.startTime : undefined,
      endTime: searchData.endTime ? searchData.endTime : undefined,
      pageNo: pageNo,
      pageSize: pageSize,
    };
    let res = await getLightingPlanAPi(params);
    console.log(res.records, 'res', res);
    res.records.map((item) => {
      if (item.executionInfo) {
        item.weeks = filterWeek(item.executionInfo.enabledWeek);
        item.date = item.executionInfo.startDate + '~' + item.executionInfo.endDate;
      }
    });
    console.log(res.records, 'ress', res);
    return {
      records: res.records, // 当前页数据
      total: res.total, // 总记录数
    };
  };

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      // dataSource: dataSource.value,
      api: getAreaListPage,
      columns: columns,
      showActionColumn: false,
      size: 'middle',
      showTableSetting: false,
      rowKey: 'id',
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
      formConfig: {
        schemas: searchFormSchema,
        // 默认展开
        showAdvancedButton: false,
        // 默认展开
        submitOnReset: true,
        //重置按钮的自定义事件
        resetFunc: async () => {
          console.log('重置--------------->');
        },
        //默认row行配置,当 layout 为 horizontal 生效
        rowProps: { gutter: 24, justify: 'start', align: 'middle' },
        //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
        baseColProps: { span: 6 },
        //row行的样式
        baseRowStyle: { width: '100%' },
        labelCol: { style: { width: 'auto' } },
      },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm }] = tableContext;

  const handleDelete = async (record) => {
    await deleteLightingPlanAPi({
      id: record.id,
    });
    reload();
    message.success('删除成功！');
  };

  const handleEnable = async (record) => {
    enableModalRef.value.openModal(record.id);
    // await enableApi({
    //   id: record.id,
    // });
    // reload();
    // message.success('启用成功！');
  };

  const handleDisable = async (record) => {
    await disableApi({
      id: record.id,
    });
    reload();
    message.success('禁用成功！');
  };

  const addTimingControl = () => {
    timingControlModalRef.value.showDrawer(false);
  };
  // 工单详情
  const updatePlan = (record) => {
    timingControlModalRef.value.showDrawer(true, record);
  };
  const handleDetail = (record) => {
    timingControlDetailRef.value.showDrawer(record);
  };

  /**
   * 处理开始时间变更事件
   * 当开始时间变更时，验证开始时间是否早于结束时间
   *
   * @param val 变更后的开始时间值
   */
  const handleChangeStartTime = (val) => {
    let { getFieldsValue, setFieldsValue } = getForm();
    const searchData = getFieldsValue();
    if (searchData.endTime) {
      setFieldsValue({
        startTime: null,
      });
      if (compareTime(searchData.startTime, searchData.endTime) < 0) {
        message.error('开始时间不能晚于结束时间！');
      }
    }
  };

  const handleChangeEndTime = (val) => {
    let { getFieldsValue, setFieldsValue } = getForm();
    const searchData = getFieldsValue();
    if (searchData.startTime) {
      compareTime(searchData.startTime, searchData.endTime);
      if (compareTime(searchData.startTime, searchData.endTime) < 0) {
        setFieldsValue({
          endTime: null,
        });
        message.error('结束时间不能早于结开始时间！');
      }
    }
  };

  const compareTime = (timeStr1, timeStr2) => {
    // 创建一个基准日期，这里使用1970-01-01，你也可以用其他任意日期
    const baseDate = '1970-01-01 ';
    const date1 = new Date(baseDate + timeStr1);
    const date2 = new Date(baseDate + timeStr2);
    return date2.getTime() - date1.getTime();
  };

  const handleExecuteNow = async (id) => {
    await executeNow({
      id: id,
    });
    reload();
    message.success('立即执行成功！');
  };

  const handleExecuteNowSuccess = async (id) => {
    await executeNow({
      id: id,
    });
    reload();
    message.success('立即执行成功！');
  };

  onMounted(async () => {
    // await getOptionsData();
  });
</script>

<style scoped lang="less">
  .checked-box {
    display: flex;
    justify-content: flex-start;
    align-content: center;
  }

  .reload-button {
    width: 100%;
    height: 40%;
    display: flex;
    align-items: center;
    justify-items: flex-end;
    border: 1px solid red;
  }
</style>
