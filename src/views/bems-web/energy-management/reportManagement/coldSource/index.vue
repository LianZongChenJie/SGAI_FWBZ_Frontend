<template>
  <div class="jeecg-basic-table jeecg-basic-table-form-container">
    <a-form class="cold-source-form" ref="formSateRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row>
        <a-col :span="6">
          <a-form-item label="描述" name="desc">
            <a-input placeholder="请输入描述" v-model:value="formState.desc" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="起始时间" name="startTime">
            <a-date-picker
              style="width: 100%"
              placeholder="选择开始时间"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="formState.startTime"
            ></a-date-picker>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="结束时间" name="endTime">
            <a-date-picker
              style="width: 100%"
              placeholder="选择结束时间"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="formState.endTime"
            ></a-date-picker>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            &emsp;
            <a-button type="primary" :icon="h(SearchOutlined)" @click="reload">查询</a-button>
            &nbsp;
            <a-button :icon="h(RedoOutlined)" @click="resetSearch">重置</a-button>
            &nbsp;
            <a-button type="primary" :icon="h(VerticalAlignBottomOutlined)" @click="handleExport">导出</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- 表格 -->
    <BasicTable @register="registerTable"> </BasicTable>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, h } from 'vue';
  import { VerticalAlignBottomOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons-vue';
  import { getList, exportData } from './index.api';
  import { BasicColumn, BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';

  // 固定采集点id
  const TAG_ID = 587;

  // 毫秒数转换为日期
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      minWidth: 80,
      width: 120,
      customRender: ({ index }) => index + 1,
    },
    {
      title: '采集点id',
      dataIndex: 'tagId',
      key: 'tagId',
      minWidth: 80,
      width: 120,
      resizable: true,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      minWidth: 80,
      width: 200,
      resizable: true,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      minWidth: 80,
      width: 120,
      resizable: true,
    },
    {
      title: '采集时间',
      dataIndex: 'dataTime',
      key: 'dataTime',
      minWidth: 80,
      width: 180,
      resizable: true,
      sorter: (a, b) => new Date(a.dataTime).getTime() - new Date(b.dataTime).getTime(),
      sortDirections: ['ascend', 'descend'],
    },
  ];

  const formState = ref({
    desc: null,
    startTime: formatTime(new Date().getTime() - 24 * 60 * 60 * 1000),
    endTime: formatTime(new Date().getTime()),
  });

  // 定义表格数据
  const dataSource = ref([]);

  // 分页配置
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: dataSource.value.length,
    showTotal: (total: number) => `共 ${total} 条记录`,
    onChange: (page: number, pageSize: number) => {
      pagination.value.current = page;
      pagination.value.pageSize = pageSize;
      reload();
    },
  });

  const loadData = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    const params = {
      pageNo: pageNo,
      pageSize: pageSize,
      tagId: TAG_ID,
      ...formState.value,
    };
    const res = await getList(params);
    dataSource.value = res.records;
    pagination.value.total = res.total;
    pagination.value.pageSize = res.size;
    return {
      records: res.records,
      total: res.total,
    };
  };

  // 重置查询
  const resetSearch = async () => {
    formState.value.desc = null;
    formState.value.startTime = formatTime(new Date().getTime() - 24 * 60 * 60 * 1000);
    formState.value.endTime = formatTime(new Date().getTime());
    pagination.value.current = 1;
    reload();
  };

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      api: loadData,
      columns: columns as BasicColumn[],
      showActionColumn: false,
      size: 'middle',
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
      showTableSetting: false,
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload }] = tableContext;

  const handleExport = async () => {
    let res = await exportData({
      ...formState.value,
      tagId: TAG_ID,
    });
    let name = '冷源历史数据';
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xlsx';
    let url = window.URL.createObjectURL(new Blob([res], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  onMounted(async () => {
    reload();
  });
</script>

<style lang="less" scoped>
  .cold-source-form {
    :deep(.ant-col-18) {
      max-width: 100%;
    }
  }
</style>
