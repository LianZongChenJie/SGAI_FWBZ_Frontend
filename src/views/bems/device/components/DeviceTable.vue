<template>
  <div class="device-table">
    <a-row class="table-header">
      <a-col :span="6">
        <a-input-search v-model:value="searchParams.deviceName" placeholder="设备名称/设备编号" enter-button @search="handleSearch" />
      </a-col>
    </a-row>

    <a-table
      :columns="columns"
      :data-source="dataSource"
      :scroll="{ y: 400 }"
      :row-key="(record) => record.id"
      :pagination="{
        total: total,
        current: pagination.pageNo,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a @click="handleDelete(record)">删除</a>
            <a @click="handleDetail(record)">详情</a>
          </a-space>
        </template>
        <template v-else-if="column.key === 'automaticAlgorithm'">
          <!-- 自动算法 -->
          <a-switch
            :checked="record.automaticAlgorithm == '1'"
            :disabled="false"
            @change="(checked) => handleAutomaticAlgorithmChange(record, checked)"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import { selectDevice, updateAutomaticAlgorithm } from '../Device.api';
  import DeviceModal from './DeviceModal.vue';
  import { useModal } from '@/components/Modal';

  const props = defineProps<{
    categoryKeys?: string[]; // 类别树节点
    spaceKeys?: string[]; // 空间树节点
    categoryTreeData: any[];
    spaceTreeData: any[];
  }>();

  const emit = defineEmits(['edit', 'delete', 'refresh', 'detail']);

  // 搜索参数
  const searchParams = ref({
    deviceName: '',
  });

  // 查找树节点的标题
  const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
    if (!treeData || !Array.isArray(treeData)) {
      return '';
    }

    const find = (nodes: any[]): string => {
      for (const node of nodes) {
        if (String(node.key) === String(key)) {
          return node.value;
        }
        if (node.children && Array.isArray(node.children)) {
          const title = find(node.children);
          if (title) return title;
        }
      }
      return '';
    };
    return find(treeData);
  };

  // 表格列配置
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
    },
    {
      title: '设备类型',
      dataIndex: 'categoryId',
      key: 'categoryId',
      customRender: ({ text }) => {
        if (!text) return '';
        return findTreeNodeTitle(props.categoryTreeData, text) || text;
      },
      width: 100,
    },
    {
      title: '设备位置',
      dataIndex: 'spaceId',
      key: 'spaceId',
      customRender: ({ text }) => {
        if (!text) return '';
        return findTreeNodeTitle(props.spaceTreeData, text) || text;
      },
    },
    {
      title: '倍率',
      dataIndex: 'magnification',
      key: 'magnification',
      width: 80,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
    },
    {
      title: '操作',
      key: 'action',
    },
    {
      title: '自动算法',
      dataIndex: 'automaticAlgorithm',
      key: 'automaticAlgorithm',
      width: 100,
    },
  ];

  // 表格数据
  const dataSource = ref([]);
  const total = ref<number>(0);
  const pagination = ref({
    pageNo: 1,
    pageSize: 10,
  });

  // 搜索处理
  const handleSearch = () => {
    pagination.value.pageNo = 1;
    loadData();
  };

  // 表格分页变化
  const handleTableChange = (pag: any) => {
    pagination.value.pageNo = pag.current;
    pagination.value.pageSize = pag.pageSize;
    loadData();
  };

  // 自动算法切换
  const handleAutomaticAlgorithmChange = (record: any, checked: boolean) => {
    try {
      const params = {
        id: record.id,
        automaticAlgorithm: checked ? '1' : '0',
      };
      updateAutomaticAlgorithm(params);
      record.automaticAlgorithm = checked ? '1' : '0';
    } catch (error) {
      record.automaticAlgorithm = checked ? '0' : '1';
      console.error('自动算法切换失败:', error);
    }
  };

  // 加载数据
  const loadData = async () => {
    try {
      const params = {
        pageNo: pagination.value.pageNo,
        pageSize: pagination.value.pageSize,
        deviceCode: searchParams.value.deviceName ? '*' + searchParams.value.deviceName + '*' : undefined,
        deviceName: searchParams.value.deviceName ? '*' + searchParams.value.deviceName + '*' : undefined,
        categoryId_MultiString: props.categoryKeys ? props.categoryKeys.join(',') : undefined,
        spaceId_MultiString: props.spaceKeys ? props.spaceKeys.join(',') : undefined,
      };
      console.log('request params:', params); // 调试日志
      const res = await selectDevice(params);
      dataSource.value = res.records;
      total.value = res.total;
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  // 监听选中节点变化
  watch(
    () => props.categoryKeys,
    (newVal, oldVal) => {
      pagination.value.pageNo = 1;
      loadData();
    }
  );
  watch(
    () => props.spaceKeys,
    (newVal, oldVal) => {
      pagination.value.pageNo = 1;
      loadData();
    }
  );

  // 初始加载
  onMounted(() => {
    loadData();
  });

  // 操作方法
  const handleEdit = (record: any) => {
    emit('edit', record);
  };

  const handleDelete = (record: any) => {
    emit('delete', record);
  };

  const handleDetail = (record: any) => {
    emit('detail', record);
  };

  // 暴露 reload 方法给父组件
  defineExpose({
    reload: () => {
      pagination.value.pageNo = 1;
      loadData();
    },
  });
</script>

<style lang="less" scoped>
  .device-table {
    .table-header {
      margin-bottom: 16px;
    }
  }
</style>
