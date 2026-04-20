<template>
  <div class="">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #toolbar>
        <a-button type="primary" @click="reload()">刷新</a-button>
        &emsp;
        <a-popconfirm title="确认全开所选区域？" ok-text="确定" cancel-text="取消" @confirm="openAll">
          <a-button v-if="hasPermission('bems:areafullyopen')" type="primary">全开</a-button>
        </a-popconfirm>
        &emsp;

        <a-popconfirm title="确认全关所选区域？" ok-text="确定" cancel-text="取消" @confirm="closeAll">
          <a-button v-if="hasPermission('bems:areafullyclose')" type="primary" danger>全关</a-button>
        </a-popconfirm>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="showVideoIframeModal(record)">监控视频</a>
            &emsp;
            <a @click.stop="showLoopList(record)">回路列表</a>
            &emsp;
            <a-popconfirm :title="'确认全开' + record.areaName + '？'" ok-text="确定" cancel-text="取消" @confirm="handleOpen(record)">
              <a v-if="hasPermission('bems:areafullyopen')">全开</a>
            </a-popconfirm>
            &emsp;

            <a-popconfirm :title="'确认全关' + record.areaName + '？'" ok-text="确定" cancel-text="取消" @confirm="handleClose(record)">
              <a v-if="hasPermission('bems:areafullyclose')" style="color: red">全关</a>
            </a-popconfirm>
          </a-space>
        </template>

        <template v-if="column.key === 'status'">
          <img v-if="record.status === '关闭'" style="width: 20px; height: 20px" src="@/assets/images/lightClose.png" alt="" />
          <img v-else style="width: 20px; height: 20px" src="@/assets/images/lightOpen.png" alt="" />
          &nbsp;{{ record.status }}
        </template>
      </template>
    </BasicTable>
    <LoopListModal ref="loopListModalRef" :reload="reload" />
  </div>
  <VideoIframeModal ref="videoIframeModalRef" />
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { getAreaListPageApi, setAreaOpenApi, setAreaCloseApi, getRelName } from '../Standardized.api';
  import VideoIframeModal from './VideoIframeModal.vue';
  import { message } from 'ant-design-vue';
  import LoopListModal from './LoopListModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();

  // 详情弹框
  const loopListModalRef = ref();
  const videoIframeModalRef = ref();

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
      dataIndex: 'relName',
      key: 'relName',
    },
    {
      title: '区域名称',
      dataIndex: 'areaName',
      key: 'areaName',
      sorter: (a, b) => a.areaName.localeCompare(b.areaName), // 自定义排序函数
      sortDirections: ['ascend', 'descend'],
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
      width: '260px',
    },
  ];

  // 获取表格数据
  // const getAreaListPage = async (pageParams, formParams) => {
  //   const { pageNo, pageSize } = pageParams;
  //   let params = {
  //     pageNo: pageNo,
  //     pageSize: pageSize,
  //   };
  //   let res = await getAreaListPageApi(params);
  //   return {
  //     records: res.records, // 当前页数据
  //     total: res.total, // 总记录数
  //   };
  // };

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      // dataSource: dataSource.value,
      api: getAreaListPageApi,
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
        schemas: [
          {
            label: '类型',
            field: 'relName',
            component: 'ApiSelect',
            componentProps: {
              api: async () => {
                let res = await getRelName({});
                let arr = [] as any[];
                res.forEach((item) => {
                  arr.push({
                    label: item,
                    value: item,
                  });
                });
                return arr;
              },
              labelField: 'label',
              valueField: 'value',
            },
          },
        ],
      },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 检查是否有权限
   * @param {string|Array} permission 权限标识
   * @returns {boolean}
   */
  const store = usePermissionStore();
  const permissionList = computed(() => store.$state.permCodeList || []);
  const hasPermissions = (permission: string) => {
    if (!permission) return true;

    const currentPermissions = permissionList.value;

    if (Array.isArray(permission)) {
      return permission.some((perm) => currentPermissions.includes(perm));
    }

    return currentPermissions.includes(permission);
  };

  // 全开
  const openAll = async () => {
    if (!selectedRowKeys.value.length) return message.error('请勾选区域！');
    selectedRowKeys.value.forEach(async (item) => {
      // handleOpen({id: item })
      await setAreaOpenApi({
        id: item,
      });
    });
    reload();
    message.success('操作成功！');
  };

  // 全关
  const closeAll = async () => {
    if (!selectedRowKeys.value.length) return message.error('请勾选区域！');
    selectedRowKeys.value.forEach(async (item) => {
      // handleClose({id: item })
      await setAreaCloseApi({
        id: item,
      });
    });
    reload();
    message.success('操作成功！');
  };

  const handleOpen = async (record) => {
    await setAreaOpenApi({
      id: record.id,
    });
    reload();
    message.success('操作成功！');
  };

  const handleClose = async (record) => {
    await setAreaCloseApi({
      id: record.id,
    });
    reload();
    message.success('操作成功！');
  };

  // 工单详情
  const showLoopList = (record) => {
    loopListModalRef.value.showModal(record);
  };

  const showVideoIframeModal = (record) => {
    videoIframeModalRef.value.showModal(record.monitorAdr);
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
