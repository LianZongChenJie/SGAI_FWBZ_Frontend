<template>
  <div class="loop-list-modal">
    <a-drawer
      v-model:open="open"
      class="custom-class"
      root-class-name="root-class-name"
      :root-style="{ color: 'blue' }"
      style="color: red"
      :title="title"
      placement="right"
      size="large"
      @close="closeModal"
    >
      <div class="form-box">
        <a-form :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off" ref="formRef">
          <a-row>
            <a-col :span="12">
              <a-form-item label="控制类型" name="relType" :rules="[{ required: true, message: '请选择控制类型！' }]">
                <a-select v-model:value="formState.relType" :options="typeOptions" @change="handleChangeRelType" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="名称" name="planName" :rules="[{ required: true, message: '请输入名称！' }]">
                <a-input v-model:value="formState.planName" :allowClear="true" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row style="margin-bottom: 12px">
            <a-table
              class="custom-hover-table"
              :dataSource="dataSource"
              :columns="filteredColumns"
              :pagination="false"
              bordered
              @change="handleChange"
              :scroll="{ y: 400 }"
              :rowSelection="rowSelection"
              :rowKey="getRowKey"
              :loading="tableLoading"
            >
              <template #index="{ text, record, index }">
                {{ index + 1 }}
              </template>
            </a-table>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="操控类型" name="operationType" :rules="[{ required: true, message: '请选择操控类型！' }]">
                <a-select v-model:value="formState.operationType" :options="controlOptions" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-form-item>
              <a-button type="primary" @click="submit" :loading="saveLoading">保存</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUnmounted, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { getCircuitListAll, getAreaListAll, addLightingPlanAPi, editLightingPlanAPi } from '../Standardized.api';
  import { usePermission } from '/@/hooks/web/usePermission';
  import Loading from '/@/components/Loading/src/Loading.vue';
  const { hasPermission } = usePermission();
  const tableLoading = ref<boolean>(false);
  const props = defineProps({
    reload: {
      type: Function,
      default: () => {},
    },
  });

  const open = ref<boolean>(false);

  const formRef = ref();
  const saveLoading = ref<boolean>(false);
  const title = ref('新增定时控制计划');
  const id = ref('');

  const typeOptions = [
    {
      label: '回路',
      value: '回路',
    },
    {
      label: '区域',
      value: '区域',
    },
  ];

  const controlOptions = [
    {
      label: '开启',
      value: '开启',
    },
    {
      label: '关闭',
      value: '关闭',
    },
  ];

  const formState = ref({
    relType: '回路',
    planName: '',
    relIds: '',
    operationType: '',
  });

  const baseColumns = [
    {
      title: '序号',
      dataIndex: 'idex',
      key: 'idex',
      slots: { customRender: 'index' },
      align: 'center',
    },
    {
      title: '区域名称',
      dataIndex: 'areaName',
      key: 'areaName',
      align: 'center',
    },
    {
      title: '回路名称',
      dataIndex: 'circuitName',
      key: 'circuitName',
      align: 'center',
    },
  ];

  // 计算属性：根据控制类型过滤列
  const filteredColumns = computed(() => {
    if (formState.value.relType === '回路') {
      // 回路类型：显示所有列
      return baseColumns;
    } else {
      // 区域类型：过滤掉回路名称列
      return baseColumns.filter((column) => column.key !== 'circuitName');
    }
  });

  let dataSource: any = ref([]);

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 🎯 核心：跨页选择状态管理
  // 使用 Map 存储所有选中的行，key 为行的唯一标识，value 为行数据
  const selectedRows = ref<Map<string | number, any>>(new Map());
  // 当前页选中的 key（用于控制表格复选框显示）
  const selectedRowKeys = ref<(string | number)[]>([]);
  // 已选择的ids
  const selectedList: any = ref([]);

  const ids: any = ref([]);

  // 获取行的唯一标识
  const getRowKey = (record: any) => {
    return record.id;
  };

  // 🎯 核心：行选择配置
  const rowSelection = computed(() => {
    return {
      selectedRowKeys: selectedRowKeys.value,
      onChange: (selectedKeys: (string | number)[], selectedRowsData: any[]) => {
        // 更新当前页选中状态
        selectedRowKeys.value = selectedKeys;

        // 更新全局选中数据
        const currentPageKeys = new Set(dataSource.value.map((row) => getRowKey(row)));

        // 处理选中状态变化
        selectedRowsData.forEach((row) => {
          const rowKey = getRowKey(row);
          selectedRows.value.set(rowKey, rowKey);
        });

        // 处理取消选中
        currentPageKeys.forEach((key) => {
          if (!selectedKeys.includes(key)) {
            selectedRows.value.delete(key);
          }
        });

        // 更新表单ID
        updateSelectedIds();
      },
      onSelect: (record: any, selected: boolean) => {
        const rowKey = getRowKey(record);

        if (selected) {
          selectedRows.value.set(rowKey, rowKey);
        } else {
          selectedRows.value.delete(rowKey);
        }

        updateSelectedIds();
      },
      onSelectAll: (selected: boolean, selectedRowsData: any[]) => {
        const currentPageKeys = dataSource.value.map((row) => getRowKey(row));

        if (selected) {
          // 全选当前页：添加当前页所有行到选中集合
          dataSource.value.forEach((row) => {
            const rowKey = getRowKey(row);
            selectedRows.value.set(rowKey, rowKey);
          });
          selectedRowKeys.value = currentPageKeys;
        } else {
          // 取消全选当前页：只移除当前页的行
          currentPageKeys.forEach((key) => {
            selectedRows.value.delete(key);
          });
          selectedRowKeys.value = [];
        }

        updateSelectedIds();
      },
      getCheckboxProps: (record: any) => ({
        // 可以在这里设置禁用的条件
        // disabled: record.status === 'disabled'
      }),
    };
  });

  // 更新表单中选中的ID
  const updateSelectedIds = () => {
    const ids: string[] = [];
    selectedRows.value.forEach((item: any) => {
      // 从key中提取ID（去掉前缀）
      const key = item.key as string;
      ids.push(key);
    });
    formState.value.relIds = ids.join(',');
  };

  // 清空所有选择
  const clearSelection = () => {
    selectedRows.value.clear();
    selectedRowKeys.value = [];
    formState.value.relIds = '';
    message.success('已清空选择');
  };

  // 🎯 核心：更新当前页选中状态（分页切换时调用）
  const updateCurrentPageSelection = () => {
    const currentPageKeys = dataSource.value.map((row) => getRowKey(row));
    selectedRowKeys.value = currentPageKeys.filter((key) => selectedRows.value.has(key));
  };

  // 打开弹框
  const showDrawer = async (isUpdate, record?) => {
    open.value = true;
    tableLoading.value = true;
    if (isUpdate) {
      id.value = record.id;
      formState.value.relType = record.relType;
      formState.value.planName = record.planName;
      ids.value = record.relIds.split(',');
      formState.value.operationType = record.operationType;
      title.value = '编辑定时控制计划';
    } else {
      title.value = '新增定时控制计划';
    }

    // 清空之前的选择
    selectedRows.value.clear();
    selectedRowKeys.value = [];

    if (formState.value.relType === '回路') {
      await loadCircuitData();
    } else {
      await loadAreaData();
    }
    selectedList.value = [];
    dataSource.value.forEach((item) => {
      if (ids.value.includes(String(item.id))) {
        selectedList.value.push(item);
      }
    });
    // 如果有传入已选中的列表，则回显
    if (selectedList.value && selectedList.value.length > 0) {
      ids.value.forEach((item) => {
        // const rowKey = getRowKey(item);
        selectedRows.value.set(Number(item), Number(item));
      });
    }
    if (formState.value.relType === '回路') {
      await loadCircuitData();
    } else {
      await loadAreaData();
    }
    tableLoading.value = false;
    // 更新状态
    updateSelectedIds();
  };

  const closeModal = () => {
    id.value = '';
    formState.value.planName = '';
    formState.value.operationType = '';
    pagination.current = 1;
    pagination.pageSize = 10;
    ids.value = [];
    // 清空之前的选择
    selectedRows.value.clear();
    selectedRowKeys.value = [];
    open.value = false;
  };

  const handleChange = async (page) => {
    pagination.current = page.current;
    pagination.pageSize = page.pageSize;
    if (formState.value.relType === '回路') {
      await loadCircuitData();
    } else {
      await loadAreaData();
    }
    // 更新状态
    updateSelectedIds();
  };

  const handleChangeRelType = async () => {
    // 切换类型时清空选择（因为数据结构不同）
    clearSelection();
    if (formState.value.relType === '回路') {
      await loadCircuitData();
    } else {
      await loadAreaData();
    }
  };

  // 加载数据
  const loadAreaData = async () => {
    try {
      const params = {};
      const res = await getAreaListAll(params);
      dataSource.value = res;

      // 🎯 重要：更新当前页选中状态
      updateCurrentPageSelection();
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  // 加载数据
  const loadCircuitData = async () => {
    try {
      const params = {};
      const res = await getCircuitListAll(params);
      dataSource.value = res;

      // 🎯 重要：更新当前页选中状态
      updateCurrentPageSelection();
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const submit = async () => {
    formRef.value?.validate().then(async () => {
      saveLoading.value = true;
      let params = {
        ...formState.value,
        relIds: Array.from(selectedRows.value.values()).join(','),
      };
      if (id.value) {
        let res = await editLightingPlanAPi({
          id: id.value,
          ...params,
        });
        if (res && res.code == 500) {
          saveLoading.value = false;
          return;
        } else {
          message.success('编辑成功！');
        }
      } else {
        let res = await addLightingPlanAPi(params);
        if (res && res.code == 500) {
          saveLoading.value = false;
          return;
        } else {
          message.success('新增成功！');
        }
      }
      id.value = '';
      open.value = false;
      saveLoading.value = false;
      props.reload();
    });
  };

  // 组件卸载时清理定时器
  onUnmounted(() => {
    // 清空之前的选择
    selectedRows.value.clear();
    selectedRowKeys.value = [];
    id.value = '';
    ids.value = [];
    formState.value.planName = '';
    formState.value.operationType = '';
    saveLoading.value = false;
  });

  defineExpose({
    showDrawer,
    closeModal,
  });
</script>

<style scoped lang="less">
  .table-box {
    padding: 5px 10px;
  }

  .custom-hover-table {
    --hover-bg-color: #f0f9ff;
    --active-bg-color: #e6f7ff;
  }

  /* 行 hover 效果 */
  .custom-hover-table :deep(.ant-table-tbody > tr:hover > td) {
    background: var(--hover-bg-color) !important;
  }

  /* 行点击效果 */
  .custom-hover-table :deep(.ant-table-tbody > tr:active > td) {
    background: var(--active-bg-color) !important;
  }

  /* 过渡动画 */
  .custom-hover-table :deep(.ant-table-tbody > tr > td) {
    transition: background-color 0.2s ease;
  }
</style>
