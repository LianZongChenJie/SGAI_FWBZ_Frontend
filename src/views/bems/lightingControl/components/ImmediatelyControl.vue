<template>
  <div class="">
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
    >
      <template #toolbar>
        <a-button
          type="primary"
          @click="reload()"
        >刷新</a-button>
        &emsp;
        <a-popconfirm
          title="确认全开所选区域？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="openAll"
        >
          <a-button
            v-if="hasPermission('bems:areafullyopen')"
            type="primary"
          >全开</a-button>
        </a-popconfirm>
        &emsp;

        <a-popconfirm
          title="确认全关所选区域？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="closeAll"
        >
          <a-button
            v-if="hasPermission('bems:areafullyclose')"
            type="primary"
            danger
          >全关</a-button>
        </a-popconfirm>

      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="showVideoIframeModal(record)">监控视频</a>
            &emsp;
            <a @click.stop="showLoopList(record)">回路列表</a>
            &emsp;
            <a-popconfirm
              :title="'确认全开'+ record.areaName +'？'"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleOpen(record)"
            >
              <a v-if="hasPermission('bems:areafullyopen')">全开</a>
            </a-popconfirm>
            &emsp;

            <a-popconfirm
              :title="'确认全关'+ record.areaName +'？'"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleClose(record)"
            >
              <a
                v-if="hasPermission('bems:areafullyclose')"
                style="color:  red;"
              >全关</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <LoopListModal
      ref="loopListModalRef"
      :reload="reload"
    />
  </div>
  <VideoIframeModal ref="videoIframeModalRef"/>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermissionStore } from '/@/store/modules/permission';
import { getAreaListPageApi, setAreaOpenApi, setAreaCloseApi } from '../Standardized.api';
import VideoIframeModal from './VideoIframeModal.vue'
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
const getAreaListPage = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
  };
  let res = await getAreaListPageApi(params);
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
  console.log('closeAll--------------------->', selectedRowKeys.value);
};

// 全关
const closeAll = async () => {
  console.log('closeAll--------------------->', selectedRowKeys.value);
};

const handleOpen = async (record) => {
  await setAreaOpenApi({
    id: record.id,
  });
  reload();
  message.success('全开成功！');
};

const handleClose = async (record) => {
  await setAreaCloseApi({
    id: record.id,
  });
  reload();
  message.success('全关成功！');
};

// 工单详情
const showLoopList = (record) => {
  loopListModalRef.value.showModal(record);
};

const showVideoIframeModal = (record) => {
  videoIframeModalRef.value.showModal(record.monitorAdr)
}

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