<template>
  <div class="my-topo-components-main-box">
    <div class="container-box">
      <div class="device-topo-box">
        <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button type="primary" preIcon="ant-design:export-outlined" @click="batchOperation"> 批量操作</a-button>
          </template>
          <template #form-spaceId="{ model, field }">
            <a-tree-select
              v-model:value="model[field]"
              show-search
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              allow-clear
              :tree-data="treeData"
              :field-names="{
                children: 'children',
                label: 'spaceName',
                value: 'spaceId',
              }"
              placeholder="请选择设备位置"
              tree-node-filter-prop="label"
            />
          </template>
          <!--操作栏-->
          <template #action="{ record }">
            <TableAction :actions="getTableAction(record)" />
          </template>
        </BasicTable>
      </div>
    </div>
    <FJPGDrawer @register="registerDrawer" @success="handleSuccess" :showFooter="showFooter" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { fjpgDeviceApi, findSpaceDeviceByCategoryldApi } from '../Standardized.api';
  import { ActionItem, BasicColumn, BasicTable, FormSchema, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useDrawer } from '/@/components/Drawer';
  import FJPGDrawer from './FJPGDrawer.vue';
  import { ElMessage } from 'element-plus';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const showFooter = ref(true);
  const searchFormSchema: FormSchema[] = [
    {
      label: '设备编号',
      field: 'deviceCode',
      component: 'JInput',
    },
    {
      field: 'spaceId',
      component: 'JTreeSelect',
      label: '设备位置',
      slot: 'spaceId',
    },
  ];
  const columns: BasicColumn[] = [
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      align: 'center',
      resizable: true,
      width: 170,
    },
    {
      title: '设备位置',
      dataIndex: 'spaceName',
      align: 'center',
      resizable: true,
      width: 170,
    },
    {
      title: '室内温度℃',
      dataIndex: 'INDOOR_TEMP',
      align: 'center',
      resizable: true,
      width: 170,
    },
    {
      title: '温度设定℃',
      dataIndex: 'TEMP_SETTING',
      align: 'center',
      resizable: true,
      width: 170,
    },
    {
      title: '运行模式',
      dataIndex: 'RUNNING_MODE',
      align: 'center',
      resizable: true,
      width: 170,
    },
    {
      title: '运行状态',
      dataIndex: 'RUNNING_STATUS',
      align: 'center',
      resizable: true,
      width: 170,
    },
    {
      title: '键盘锁定',
      dataIndex: 'KEYLOCK',
      align: 'center',
      resizable: true,
      width: 170,
    },
    {
      title: '风速模式',
      dataIndex: 'FAN_SPEED_MODE',
      align: 'center',
      resizable: true,
      width: 170,
    },
  ];
  const loadData = async () => {
    try {
      let { getFieldsValue } = getForm();
      const searchData = getFieldsValue();
      console.log(searchData);
      const params = {
        categoryId: 40,
        nameOrCode: searchData.deviceCode ? searchData.deviceCode.split('*')[1] : undefined,
        spaceId: searchData.spaceId,
      };
      await findSpaceDeviceByCategoryld();
      const res = await fjpgDeviceApi(params);
      res.forEach((item) => {
        item.attributes.forEach((attr) => {
          if (attr.valueConfig) {
            attr.label = JSON.parse(attr.valueConfig).find((i) => i.key === attr.value)?.value;
          } else {
            attr.label = attr.value;
          }
          item[attr.attributeCode] = attr.label;
        });
        item.spaceName = findTreeNodeTitle(treeData.value, item.spaceId);
      });
      return {
        records: res, // 当前页数据
      };
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
    if (!Array.isArray(treeData)) return [];
    const targetKey = String(key);

    // 递归：返回找到的路径 / null
    const dfs = (nodes: SpaceTreeNode[], path: string[]): string[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.spaceName];
        // 命中节点直接返回当前完整路径
        if (String(node.spaceId) === targetKey) {
          return currentPath;
        }
        // 有子节点递归查找
        if (node.children?.length) {
          const result = dfs(node.children, currentPath);
          // 子树找到结果，向上透传
          if (result) return result;
        }
      }
      return null;
    };

    const fullPath = dfs(treeData, []);
    return fullPath ? fullPath.join('-') : '';
  };
  const findSpaceDeviceByCategoryld = async () => {
    let res = await findSpaceDeviceByCategoryldApi({
      categoryId: 40,
    });
    treeData.value = res;
  };
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-ajax',
    tableProps: {
      title: '风机盘管',
      api: loadData,
      columns: columns,
      actionColumn: {
        width: 120,
      },
      formConfig: {
        schemas: searchFormSchema,
        submitOnReset: true,
      },
      pagination: false,
      rowSelection: {
        type: 'checkbox',
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { reload, getForm }, { rowSelection, selectedRows }] = tableContext;
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
    ];
  }

  function handleEdit(record) {
    openDrawer(true, { record, isMultiple: false });
  }
  const treeData = ref([]);
  const handleSuccess = () => {
    reload();
  };
  const batchOperation = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要操作的设备');
      return;
    }
    openDrawer(true, { record: selectedRows.value, isMultiple: true });
  };
</script>

<style scoped lang="less">
  .my-topo-components-main-box {
    padding: 0 12px;
    .container-box {
      .device-topo-box {
        background-color: #fff;
        border-radius: 10px;
      }
      .device-topo-box {
        padding: 12px;
        margin: 0 auto;
        /* 居中显示 */
        overflow: auto;
      }
    }
  }
</style>
