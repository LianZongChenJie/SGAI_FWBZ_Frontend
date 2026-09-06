<template>
  <div class="building-control-table">
    <div class="table-toolbar">
      <div class="header-actions">
        <a-tree-select
          v-model:value="searchForm.categoryId"
          placeholder="设备类型"
          allow-clear
          show-search
          tree-default-expand-all
          :tree-data="categoryTreeData"
          :field-names="{ label: 'title', value: 'key', children: 'children' }"
          style="width: 200px; margin-right: 8px;"
          @change="handleCategoryChange"
        />
        <a-input
          v-model:value="searchForm.deviceName"
          placeholder="设备名称"
          allow-clear
          style="width: 160px; margin-right: 8px;"
          @pressEnter="handleSearch"
        />
        <a-input
          v-model:value="searchForm.remark"
          placeholder="备注"
          allow-clear
          style="width: 160px; margin-right: 8px;"
          @pressEnter="handleSearch"
        />
        <a-select
          v-model:value="searchForm.runState"
          placeholder="状态"
          allow-clear
          style="width: 120px; margin-right: 8px;"
          :options="runStateOptions"
          @change="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button type="primary" @click="handleCreate" style="margin-left: 8px;">新建</a-button>
        <a-button type="primary" :loading="deviceTableExportLoading" @click="handleDeviceTableExport" style="margin-left: 8px;">
          <DownloadOutlined v-if="!deviceTableExportLoading" />
          导出
        </a-button>
      </div>
    </div>
    <div class="device-space">
      <div class="space-table">
        <DeviceTable
          ref="deviceTableRef"
          :categoryKeys="currentCategoryKeys"
          :category-tree-data="treeData"
          :space-tree-data="spaceTreeData"
          :search-params="searchForm"
          @edit="handleEdit"
          @delete="handleDelete"
          @detail="handleDetail"
          @add="handleCreate"
          @refresh="handleRefresh"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import DeviceTable from './DeviceTable.vue';
import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
import { getPermissionTree, getEquipmentTree } from '../Device.api';

// 调用类型：buildingControl-楼控，metering-电表
type CallerType = 'buildingControl' | 'metering';

const props = defineProps<{
  callerType: CallerType; // 调用来源类型，决定请求哪个设备类型接口
  treeData: any[]; // categoryTreeData（用于新建/编辑弹窗）
  spaceTreeData: any[]; // spaceTreeData
  categorySelectTreeData: any[]; // 设备类别树数据（用于新建/编辑弹窗）
}>();

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', record: any): void;
  (e: 'delete', record: any): void;
  (e: 'detail', record: any): void;
  (e: 'refresh', params: any): void;
  (e: 'success'): void;
}>();

const deviceTableRef = ref();

// 设备类型树数据（从接口获取）
const categoryTreeData = ref<any[]>([]);

// 搜索表单
const searchForm = reactive({
  categoryId: undefined as string | undefined, // 设备类型 ID
  deviceName: '',
  spaceName: '',
  remark: '',
  runState: undefined as string | undefined,
});

// 当前筛选的 categoryKeys（根据选择的设备类型计算）
const currentCategoryKeys = computed(() => {
  if (!searchForm.categoryId) return [];
  // 查找选择的节点及其所有子节点的 key
  const keys: string[] = [];
  const findNode = (nodes: any[], targetKey: string): any => {
    for (const node of nodes) {
      if (String(node.key) === String(targetKey)) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findNode(node.children, targetKey);
        if (found) return found;
      }
    }
    return null;
  };
  const collectKeys = (node: any) => {
    if (!node) return;
    keys.push(String(node.key));
    if (node.children && node.children.length > 0) {
      node.children.forEach(collectKeys);
    }
  };
  const selectedNode = findNode(categoryTreeData.value, searchForm.categoryId);
  collectKeys(selectedNode);
  return keys;
});

// 状态下拉选项
const runStateOptions = [
  { label: '在线', value: '在线' },
  { label: '离线', value: '离线' },
];

// 获取第一个节点的 key
const getFirstNodeKey = (nodes: any[]): string | undefined => {
  if (!nodes || nodes.length === 0) return undefined;
  return String(nodes[0].key);
};

// 获取设备类型树数据
const fetchCategoryTree = async () => {
  try {
    let res;
    if (props.callerType === 'metering') {
      // 电表调用：请求仪表权限树
      res = await getPermissionTree();
    } else {
      // 楼控调用：请求设备权限树
      res = await getEquipmentTree();
    }
    categoryTreeData.value = res || [];
    console.log(`[BuildingControlTable] ${props.callerType} 设备类型数据:`, res);

    // 默认选中第一个设备类型
    const firstKey = getFirstNodeKey(res || []);
    if (firstKey) {
      searchForm.categoryId = firstKey;
      // 触发一次搜索
      setTimeout(() => {
        handleSearch();
      }, 0);
    }
  } catch (error) {
    console.error('获取设备类型树失败:', error);
  }
};

// 设备类型变化
const handleCategoryChange = () => {
  handleSearch();
};

// 搜索按钮：触发 DeviceTable 重新加载
const handleSearch = () => {
  deviceTableRef.value?.reload();
};

onMounted(() => {
  fetchCategoryTree();
});

// 楼控设备导出 loading
const deviceTableExportLoading = ref(false);

/** 通用导出方法 */
const downloadBlob = (res: any, name: string) => {
  const blobOptions = { type: 'application/vnd.ms-excel' };
  const fileSuffix = '.xlsx';
  const url = window.URL.createObjectURL(new Blob([res], blobOptions));
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', name + fileSuffix);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/** 楼控设备导出 */
const handleDeviceTableExport = async () => {
  deviceTableExportLoading.value = true;
  try {
    const sp = searchForm;
    const res = await defHttp.get({
      url: '/fwbz/deviceData/deviceExport',
      params: {
        deviceName: sp.deviceName || undefined,
        remark: sp.remark || undefined,
        runState: sp.runState || undefined,
        categoryIds: currentCategoryKeys.value.length > 0 ? currentCategoryKeys.value.join(',') : undefined,
      },
      responseType: 'blob',
    }, { isTransformResponse: false });
    downloadBlob(res, '设备列表');
  } catch (error) {
    console.error('导出设备列表失败:', error);
  } finally {
    deviceTableExportLoading.value = false;
  }
};

// 新建设备
function handleCreate() {
  emit('create');
}

// 编辑设备
const handleEdit = (record: any) => {
  emit('edit', record);
};

// 设备详情
const handleDetail = (record: any) => {
  emit('detail', record);
};

const handleDelete = async (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除设备 "${record.deviceName}" 吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        const { deleteDevice } = await import('../Device.api');
        await deleteDevice({ id: record.id }, handleSuccess());
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
  });
};

const handleRefresh = (params: any) => {
  emit('refresh', params);
};

// 表单提交成功后的回调
function handleSuccess() {
  emit('success');
}

// 暴露 reload 方法给父组件调用
defineExpose({
  reload: () => {
    deviceTableRef.value?.reload();
  }
});
</script>

<style lang="less" scoped>

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;

  .header-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.device-space {
  .space-table {
    width: 100%;
  }
  .jeecg-basic-table-form-container {
    padding: 0 !important;
  }
}
</style>
