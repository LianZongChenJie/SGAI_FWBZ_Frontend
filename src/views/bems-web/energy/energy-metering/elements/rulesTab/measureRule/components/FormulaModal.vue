<template>
  <a-modal
    :key="modalKey"
    title="公式配置"
    :visible="visible"
    :footer="null"
    @cancel="handleCancel"
    width="1000px"
    :style="{ top: '20px' }"
    :body-style="{ padding: '24px' }"
    :destroyOnClose="true"
  >
    <div class="formula-container">
      <!-- 左侧文本块 -->
      <div class="left-panel">
        <span style="font-size: 16px; font-weight: 600">{{ nodeName }}</span>
        <div class="text-block">
          <div class="block-title">公式内容</div>
          <a-textarea v-model:value="formulaContent" :rows="8" placeholder="请输入公式内容" />
        </div>
        <div>
          <a-button type="primary" @click="handleParse">解析</a-button>
          <a-button type="primary" @click="handleSave">保存</a-button>
        </div>
        <div class="text-block">
          <div class="block-title">公式说明</div>
          <a-textarea v-model:value="formulaDescription" :rows="8" placeholder="请输入公式说明" />
        </div>
      </div>

      <!-- 右侧表格和查询条件 -->
      <div class="right-panel">
        <!-- 查询表单 -->
        <div class="query-form">
          <a-form layout="inline" :model="queryParams">
            <a-form-item>
              <a-input v-model:value="queryParams.keyword" placeholder="请输入名称/编号" allow-clear style="width: 200px" />
            </a-form-item>
            <a-form-item>
              <a-tree-select
                v-model:value="queryParams.categoryId"
                :tree-data="props.categoryTree"
                placeholder="请选择设备类别"
                allow-clear
                style="width: 200px"
                :field-names="{
                  children: 'children',
                  label: 'title',
                  value: 'key',
                }"
                @change="selectCategoryId"
              />
            </a-form-item>
            <a-form-item>
              <a-tree-select
                v-model:value="queryParams.spaceId"
                :tree-data="props.spaceTree"
                placeholder="请选择空间位置"
                allow-clear
                style="width: 200px"
                :field-names="{
                  children: 'children',
                  label: 'title',
                  value: 'key',
                }"
                @change="selectSpaceId"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleQuery">查询</a-button>
                <a-button @click="handleReset">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>

        <!-- 设备列表表格 -->
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="{
            total: total,
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }"
          @change="handleTableChange"
          size="small"
          :scroll="{ y: 280 }"
          :customRow="onRowDoubleClick"
        />
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { pointList, analyticFormula, saveFormula } from '../index.api';
  import { message, Modal } from 'ant-design-vue';

  const props = defineProps<{
    categoryTree?: any[];
    spaceTree?: any[];
  }>();

  const emit = defineEmits(['success', 'cancel']);

  const type = ref<string>(''); // 新增的 type propert
  const parentId = ref<number | null>(null); // 新增的 parentId property

  const visible = ref<boolean>(false);
  const formulaContent = ref<string>('');
  const formulaDescription = ref<string>('');
  const dataSource = ref<any[]>([]);
  const loading = ref<boolean>(false);
  const total = ref<number>(0);
  const pagination = ref<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });
  const nodeName = ref('');

  // 修改查询参数
  const queryParams = ref({
    keyword: undefined, // 新增关键字查询参数
    categoryId: null,
    spaceId: null,
  });

  // 添加当前编辑的记录ID
  const currentId = ref<string>('');

  // 添加一个唯一key来强制组件重新渲染
  const modalKey = ref<number>(0);

  const onRowDoubleClick = (record: any) => {
    return {
      onDblclick: () => {
        formulaContent.value += `[${record.pointCode}]`;
      },
    };
  };

  // 获取点位列表数据
  const fetchDeviceList = async () => {
    loading.value = true;
    try {
      const res = await pointList({
        type: type.value,
        parentId: parentId.value,
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        pointCode: queryParams.value.keyword ? queryParams.value.keyword : undefined,
        pointName: queryParams.value.keyword ? queryParams.value.keyword : undefined,
        ...queryParams.value,
      });
      dataSource.value = res.records;
      total.value = res.total;
    } catch (error) {
      message.error('获取数据列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 查询方法
  const handleQuery = () => {
    pagination.value.current = 1; // 重置到第一页
    fetchDeviceList();
  };

  // 修改重置方法
  const handleReset = () => {
    queryParams.value = {
      keyword: undefined, // 重置关键字
      categoryId: null,
      spaceId: null,
    };
    handleQuery();
  };

  // 表格变化处理（分页、排序、筛选）
  const handleTableChange = (pag: TablePaginationConfig) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    fetchDeviceList();
  };

  // 表格列定义
  const columns: TableColumnsType = [
    {
      title: '编号',
      dataIndex: 'pointCode',
      key: 'pointCode',
      width: 120,
    },
    {
      title: '名称',
      dataIndex: 'pointName',
      key: 'pointName',
      width: 150,
    },
    {
      title: '设备类别',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 120,
      customRender: ({ text }) => {
        const node = findTreeNode(props.categoryTree, text);
        return node?.title || text;
      },
    },
    {
      title: '空间位置',
      dataIndex: 'spaceId',
      key: 'spaceId',
      width: 120,
      customRender: ({ text }) => {
        const node = findTreeNode(props.spaceTree, text);
        return node?.value || text;
      },
    },
  ];

  // 递归查找树节点
  const findTreeNode = (tree: any[] = [], key: string): any => {
    for (const node of tree) {
      if (node.key == key) {
        return node;
      }
      if (node.children) {
        const found = findTreeNode(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // 修改 openModal 方法
  const openModal = (record?: any) => {
    // 增加key，强制组件重新渲染
    modalKey.value += 1;
    visible.value = true;

    // 重置所有状态
    resetState();
    nodeName.value = record.nodeCode + '-' + record.nodeName;
    if (record) {
      currentId.value = record.id;
      formulaContent.value = record.formula || '';
      formulaDescription.value = record.description || '';
      type.value = record.type;
      parentId.value = record.id;
    }
    // 解析公式
    if (formulaContent.value) {
      handleParse();
    }
    // 重置分页并加载设备列表
    pagination.value.current = 1;
    fetchDeviceList();
  };

  // 添加重置状态的方法
  const resetState = () => {
    currentId.value = '';
    formulaContent.value = '';
    formulaDescription.value = '';
    dataSource.value = [];
    pagination.value = {
      current: 1,
      pageSize: 10,
    };
    queryParams.value = {
      keyword: undefined,
      categoryId: undefined,
      spaceId: undefined,
    };
    loading.value = false;
    total.value = 0;
  };

  // 修改保存方法
  const handleSave = async () => {
    try {
      // 确认保存
      Modal.confirm({
        title: '确认保存',
        content: '确定要保存当前公式配置吗？',
        async onOk() {
          try {
            await saveFormula({
              id: currentId.value || undefined, // 如果是新增则不传id
              formula: formulaContent.value,
            });
            emit('success');
            message.success('保存成功');
            visible.value = false;
            resetState();
          } catch (error) {
            console.error('保存公式失败', error);
            message.error('保存失败，请重试');
          }
        },
      });
    } catch (error) {
      console.error('解析公式失败', error);
      message.error('公式格式有误，请检查后重试');
    }
  };

  // 修改取消方法
  const handleCancel = () => {
    visible.value = false;
    resetState();
    emit('cancel');
  };

  // 添加解析方法
  const handleParse = async () => {
    if (!formulaContent.value) {
      message.warning('请先输入公式内容');
      return;
    }

    try {
      const res = await analyticFormula({ formula: formulaContent.value });
      formulaDescription.value = res;
    } catch (error) {
      console.error('公式解析失败', error);
      message.error('公式解析失败，请检查公式格式');
    }
  };
  const selectCategoryId = (value, item, val) => {
    if (val.triggerNode && val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      queryParams.value.categoryId = null;
      return;
    }
  };

  const selectSpaceId = (value, item, val) => {
    if (val.triggerNode && val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      queryParams.value.spaceId = null;
      return;
    }
  };
  // 暴露方法给父组件
  defineExpose({
    openModal,
  });
</script>

<style lang="less" scoped>
  .formula-container {
    display: flex;
    gap: 16px;
    height: 500px;

    .left-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;

      // 按钮容器样式
      div:not(.text-block) {
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 8px 0;
        flex-shrink: 0; // 按钮区域不压缩
      }

      .text-block {
        height: calc(50% - 24px); // 减去按钮区域和间距的高度
        min-height: 0; // 允许压缩
        display: flex;
        flex-direction: column;
        gap: 8px;

        .block-title {
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
          flex-shrink: 0; // 标题不压缩
        }

        .ant-textarea {
          flex: 1;
          resize: none;
          height: 0; // 让文本域填充剩余空间
        }
      }
    }

    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 0;

      .query-form {
        padding: 16px 0;
        flex-shrink: 0;
      }

      :deep(.ant-table-wrapper) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;

        .ant-spin-nested-loading {
          flex: 1;
          min-height: 0;

          .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;

            .ant-table {
              flex: 1;
              overflow: hidden;
              .ant-table-body {
                overflow-y: auto !important;
                height: calc(100% - 40px) !important;
              }

              .ant-table-container {
                height: 100%;
              }
            }

            .ant-pagination {
              margin: 16px 0;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
</style>
