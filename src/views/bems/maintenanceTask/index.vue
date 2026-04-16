<template>
  <div>
    <BasicTable @register="registerTable">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <Detail @register="registerDetail" @success="reload" />
    <Edit @register="registerEdit" @success="reload" />
    <Execute @register="registerExecute" @success="reload" />
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { TableAction, ActionItem } from '/@/components/Table';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { getList } from './task.api';
  import { columns } from './task.data';
  import Detail from './detail.vue';
  import Edit from './edit.vue';
  import Execute from './execute.vue';
  import { useModal } from '@/components/Modal';
  import moment from 'moment';
  import { queryDepartTreeSync } from '@/views/system/depart/depart.api';

  // 组织机构树数据
  const orgTreeData = ref<any[]>([]);
  // 存储获取表单实例的方法
  let getFormInstance: (() => any) | null = null;

  // 自定义重置函数，只重置任务名称
  const handleReset = () => {
    const formInstance = getFormInstance?.();
    if (formInstance) {
      formInstance.setFieldsValue({ taskName: undefined });
    }
    return false; // 阻止默认重置行为
  };

  // 加载组织机构根节点数据
  async function loadOrgTreeData() {
    try {
      const result = await queryDepartTreeSync();
      if (Array.isArray(result) && result.length > 0) {
        orgTreeData.value = transformTreeData(result);
        // 设置默认选中第一个组织机构
        const firstOrgId = result[0].id;
        const formInstance = getFormInstance?.();
        if (formInstance) {
          formInstance.setFieldsValue({ orgCode: firstOrgId });
        }
        // 触发查询
        reload();
      }
    } catch (error) {
      console.error('加载组织机构数据失败:', error);
    }
  }

  // 转换树数据格式以匹配 TreeSelect 组件
  function transformTreeData(data: any[]): any[] {
    return data.map((item) => ({
      title: item.departName,
      value: item.id,
      key: item.id,
      children: item.children ? transformTreeData(item.children) : [],
      isLeaf: item.isLeaf,
    }));
  }

  onMounted(() => {
    loadOrgTreeData();
  });
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      api: getList,
      columns: columns,
      showIndexColumn: true,
      formConfig: {
        schemas: [
          {
            label: '年份',
            field: 'year',
            defaultValue: moment().format('YYYY'),
            component: 'DatePicker',
            componentProps: {
              picker: 'year',
              format: 'YYYY',
              valueFormat: 'YYYY',
              placeholder: '请选择年份',
              clearable: false,
            },
          },
          {
            label: '组织机构',
            field: 'orgCode',
            component: 'TreeSelect',
            componentProps: {
              treeData: orgTreeData,
              fieldNames: { label: 'title', value: 'value', children: 'children' },
              placeholder: '请选择组织机构',
              treeDefaultExpandAll: false,
              allowClear: true,
            },
          },
          {
            label: '任务名称',
            field: 'taskName',
            component: 'Input',
          },
        ],
        // 自定义重置函数，只重置任务名称
        resetFunc: handleReset,
      },
      actionColumn: {
        width: 140,
        fixed: 'right',
      },
    },
    // 禁用自动加载，等待组织机构加载完成后再手动触发
    autoFetch: false,
  });
  const [registerTable, { getForm, reload }] = tableContext;
  // 保存获取表单实例的方法
  getFormInstance = getForm;
  const [registerDetail, { openModal: openDetail }] = useModal();
  const [registerEdit, { openModal: openEdit }] = useModal();
  const [registerExecute, { openModal: openExecute }] = useModal();
  function getTableAction(record): ActionItem[] {
    const actions = [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
    // 只有未开始状态的任务可以编辑
    if (record.status === '未开始') {
      actions.push({
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      });
    }
    // 根据任务状态判断是否显示执行按钮
    if (record.status !== '已执行') {
      actions.push({
        label: '执行',
        onClick: handleExecute.bind(null, record),
      });
    }

    return actions;
  }
  const handleDetail = (record) => {
    openDetail(true, record);
  };
  const handleEdit = (record) => {
    openEdit(true, record);
  };
  const handleExecute = (record) => {
    openDetail(true, { ...record, isExecute: true });
  };
</script>
