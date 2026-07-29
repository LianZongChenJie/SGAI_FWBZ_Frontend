<template>
  <PageWrapper title="抄表日志">
    <BasicTable @register="registerTable" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { PageWrapper } from '/@/components/Page';
  import { getLogList } from './log.api';

  // 表格列配置
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '60px',
      customRender: ({ index }) => index + 1,
    },
    {
      title: '周期',
      dataIndex: 'cycleType',
      key: 'cycleType',
    },
    {
      title: '计量周期',
      dataIndex: 'taskDate',
      key: 'taskDate',
    },
    {
      title: '仪表编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
    },
    {
      title: '仪表名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '本期读数',
      dataIndex: 'newReading',
      key: 'newReading',
    },
    {
      title: '当期用量',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: '抄表人',
      dataIndex: 'reader',
      key: 'reader',
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ];

  // 表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '仪表编号',
      field: 'deviceCode',
      component: 'Input',
      componentProps: {
        placeholder: '请输入仪表编号',
      },
    },
    {
      label: '仪表名称',
      field: 'deviceName',
      component: 'Input',
      componentProps: {
        placeholder: '请输入仪表名称',
      },
    },
    {
      label: '抄表时间',
      field: 'createTime',
      component: 'RangePicker',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
        showTime: false,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];
  const { tableContext } = useListPage({
    designScope: 'reading-log-table',
    tableProps: {
      api: async (params) => {
        let res = await getLogList(params);
        res.records.forEach((item, index) => {
          item.deviceCode = item.meterInfo.deviceCode;
          item.deviceName = item.meterInfo.deviceName;
        });
        return res;
      },

      columns: columns,
      showActionColumn: false,
      showTableSetting: false,
      size: 'middle',
      rowKey: 'id',
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
      formConfig: {
        schemas: searchFormSchema,
        submitOnReset: true,
        resetFunc: async () => {
          console.log('重置搜索条件');
        },
        rowProps: { gutter: 24, justify: 'start', align: 'middle' },
        baseColProps: { span: 6 },
        baseRowStyle: { width: '100%' },
        labelCol: { style: { width: 'auto' } },
        fieldMapToTime: [['createTime', ['taskDateStart', 'taskDateEnd'], 'YYYY-MM-DD']],
      },
    },
  });
  const [registerTable] = tableContext;
</script>

<style scoped>
  .cycle-day {
    background: #e6f7ff;
    color: #1890ff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .cycle-week {
    background: #f6ffed;
    color: #52c41a;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .cycle-month {
    background: #fff7e6;
    color: #faad14;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .cycle-quarter {
    background: #f3e8ff;
    color: #722ed1;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .cycle-year {
    background: #fff1f0;
    color: #ff4d4f;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .usage-text {
    color: #2857ff;
    font-weight: 500;
  }
</style>
