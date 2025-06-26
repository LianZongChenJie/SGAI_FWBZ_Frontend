<template>
  <div class="project-management-main-box">
    <div class="title-info-box">
      <div>
        <div class="title-box">已完成/总数</div>
        <div class="number-box">{{ statisticsData.completedCount + '/' + statisticsData.totalCount }}</div>
      </div>
      <div>
        <div class="title-box">投资额(万元)</div>
        <div class="number-box">{{ statisticsData.investmentAmountCount }}</div>
      </div>
      <div>
        <div class="title-box">已收收益(万元)</div>
        <div class="number-box">{{ statisticsData.completedCount }}</div>
      </div>
    </div>
    <div class="table-box">
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <a-button
            type="primary"
            :icon="h(PlusOutlined)"
            @click="addProject"
          > 新增 </a-button>
        </template>
        <template #form-alarmLevelId="{ model, field }">
          <a-select
            v-model:value="model[field]"
            :options="statusOptions"
            placeholder="请选择项目状态"
          >
          </a-select>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click.stop="handleEdit(record)">编辑</a>
              <a-popconfirm
                title="是否删除？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a style="color: red;">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
          <template v-if="column.key === 'projectStatus'">
            <p>{{ getSatus(record) }}</p>
          </template>
          <template v-if="column.key === 'projectSubject'">
            <p>{{ getSubject(record) }}</p>
          </template>
          <template v-if="column.key === 'projectFiles'">
            <a @click="downloadFile(record.projectFiles, record.projectFiles)">{{ record.projectFiles }}</a>
          </template>
          <template v-if="column.key === 'projectResultAttachments'">
            <a  @click="downloadFile(record.projectResultAttachments, record.projectResultAttachments)">{{ record.projectResultAttachments }}</a>
          </template>
        </template>
      </BasicTable>
    </div>
    <AddProjectModal
      ref="addProjectModalRef"
      :reload="reload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { h } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { getProjectStatisticsApi } from './Standardized.api';
import AddProjectModal from './components/AddProjectModal.vue';
import { getProjectManagementListApi, deleteProjectApi, getProjectByIdApi,  getProjectStatusApi, getProjectProjectSubjectApi, } from './Standardized.api';

const statusOptions = ref<any>([]);
const subjectOptions = ref<any>([]);

// 头部统计数据
const statisticsData = ref({
  completedCount: 0,
  investmentAmountCount: 0,
  totalCount: 0,
  finishCount: 0,
});

// 表格列配置
const columns: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
  },
  {
    title: '立项时间',
    dataIndex: 'projectEstablishmentTime',
    key: 'projectEstablishmentTime',
  },
  {
    title: '项目周期(月)',
    dataIndex: 'projectCycle',
    key: 'projectCycle',
  },
  {
    title: '项目预算(万元)',
    dataIndex: 'projectBudget',
    key: 'projectBudget',
  },
  {
    title: '项目主体',
    dataIndex: 'projectSubject',
    key: 'projectSubject',
  },
  {
    title: '收益周期(月)',
    dataIndex: 'incomeCycle',
    key: 'incomeCycle',
  },
  {
    title: '项目文件',
    dataIndex: 'projectFiles',
    key: 'projectFiles',
  },
  {
    title: '项目目标',
    dataIndex: 'projectGoal',
    key: 'projectGoal',
  },
  {
    title: '项目状态',
    dataIndex: 'projectStatus',
    key: 'projectStatus',
  },
  {
    title: '项目成果附件',
    dataIndex: 'projectResultAttachments',
    key: 'projectResultAttachments',
  },
  {
    title: '操作',
    key: 'action',
  },
];

const pagination = ref({
  pageNo: 1,
  pageSize: 10,
});

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '项目时间', //显示label
    field: 'time', //查询字段
    component: 'RangePicker', //渲染的组件
    // slot: 'name', //设置默认值
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    label: '项目状态',
    field: 'projectStatus',
    component: 'JInput',
    slot: 'alarmLevelId',
  },
  {
    label: '项目名称',
    field: 'projectName',
    component: 'JInput',
  },
];

// modalRef
const addProjectModalRef = ref();

// 获取统计信息
const getProjectStatisticsApi = async () => {
  let res: any = await getProjectStatisticsApi();
  statisticsData.value.completedCount = res.completedCount;
  statisticsData.value.investmentAmountCount = res.investmentAmountCount;
  statisticsData.value.totalCount = res.totalCount;
};

// 获取表格数据
const getProjectlList = async () => {
  await getStatusAndSubjecData()
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: '1',
    pageSize: 999999999,
    projectStatus: searchData.projectStatus ? searchData.projectStatus : undefined,
    projectName: searchData.projectName ? searchData.projectName.split('*')[1] : undefined,
    startDate: searchData.time ? searchData.time.split(',')[0] + ' 00:00:00' : undefined,
    endDate: searchData.time ? searchData.time.split(',')[1] + ' 23:59:59' : undefined,
  };
  let res = await getProjectManagementListApi(params);
  return res.records;
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    // dataSource: dataSource.value,
    api: getProjectlList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    rowKey: 'id',
    pagination: {
      current: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
      pageSizeOptions: ['10', '20', '30', '50'],
    },
    formConfig: {
      schemas: searchFormSchema,
      // 默认展开
      showAdvancedButton: false,
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
const [registerTable, { reload, getForm, getPaginationRef, getDataSource }] = tableContext;

// 获取状态及主体数据
const getStatusAndSubjecData = async () => {
 let statusRes = await getProjectStatusApi()
 let subjectRes = await getProjectProjectSubjectApi()
 statusOptions.value = [...statusRes]
 subjectOptions.value = [...subjectRes]
}

const getSatus = (record) => {
  return statusOptions.value.find(item => item.value === record.projectStatus).label
}

const getSubject = (record) => {
  return subjectOptions.value.find(item => item.value === record.projectSubject).label
}

// 下载文件
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download'; // 设置默认文件名
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 新增项目
const addProject = () => {
  addProjectModalRef.value.showModal(0, {});
};

// 编辑项目
const handleEdit = async (record) => {
  let res = await getProjectByIdApi({ id: record.id });
  addProjectModalRef.value.showModal(1, res);
};

// 删除项目
const handleDelete = async (record) => {
  let res = await deleteProjectApi({ id: record.id });
  reload();
};

onMounted(async () => {
  await getStatusAndSubjecData()
})
</script>

<style lang="less" scoped>
.project-management-main-box {
  height: 100%;
  width: 100%;

  .title-info-box {
    display: flex;
    justify-content: center;
    height: 80px;
    width: 100%;

    div {
      width: 15%;
      height: 100%;

      div {
        width: 100%;
        height: 50%;
        text-align: center;
      }

      .title-box {
        font-size: 16px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      .number-box {
        font-size: 22px;
        font-weight: 600;
      }
    }
  }

  .table-box {
    height: calc(100% - 80px);
    width: 100%;
    padding: 10px 10px;
    background-color: #fff;
  }
}
</style>