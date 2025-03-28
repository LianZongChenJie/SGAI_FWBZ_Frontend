<template>
  <div class="metering-point-list jeecg-basic-table jeecg-basic-table-form-container">
    <!-- 添加查询表单 -->
    <div class="query-form">
      <a-form layout="inline" :model="queryParams" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
        <a-form-item label="项目编号">
          <a-input v-model:value="queryParams.pointCode" placeholder="请输入项目编号" allow-clear />
        </a-form-item>
        <a-form-item label="项目名称">
          <a-input v-model:value="queryParams.pointName" placeholder="请输入项目名称" allow-clear />
        </a-form-item>
        <a-form-item label="设备类别">
          <a-tree-select
            v-model:value="queryParams.categoryId"
            :tree-data="categoryTreeData"
            placeholder="请选择设备类别"
            allow-clear
            style="width: 200px"
            :field-names="{
              children: 'children',
              label: 'title',
              value: 'key',
            }"
          />
        </a-form-item>
        <a-form-item label="空间位置">
          <a-tree-select
            v-model:value="queryParams.spaceId"
            :tree-data="spaceTreeData"
            placeholder="请选择空间位置"
            allow-clear
            style="width: 200px"
            :field-names="{
              children: 'children',
              label: 'title',
              value: 'key',
            }"
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

    <div class="table-toolbar">
      <a-button type="primary" @click="handleAdd">
        <plus-outlined />
        新增
      </a-button>
    </div>

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
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" @click="handleFormula(record)">编辑公式</a-button>
            <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <MeteringPointModal
      ref="modalRef"
      :is-update="isUpdate"
      :category-tree="categoryTreeData"
      :space-tree="spaceTreeData"
      :unit-list="unitList"
      @success="handleSuccess"
    />

    <FormulaModal ref="formulaModalRef" :category-tree="categoryTreeData" :space-tree="spaceTreeData" @success="handleFormulaSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { selectPoint, categoryTree, spaceTree, unitList as getUnitList, deletePoint } from '../index.api';
  import { message, Modal } from 'ant-design-vue';
  import MeteringPointModal from './MeteringPointModal.vue';
  import FormulaModal from './FormulaModal.vue';
  import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  interface MeteringPoint {
    id: string;
    pointCode: string;
    pointName: string;
    categoryId: string;
    spaceId: string;
    meteringUnit: string;
  }
  // 查询参数
  const queryParams = ref({
    pointCode: '',
    pointName: '',
    categoryId: undefined,
    spaceId: undefined,
  });

  const loading = ref<boolean>(false);
  const dataSource = ref<MeteringPoint[]>([]);
  const total = ref<number>(0);
  const pagination = ref<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });

  const modalRef = ref();
  const isUpdate = ref(false);

  // 添加树形数据
  const categoryTreeData = ref<any[]>([]);
  const spaceTreeData = ref<any[]>([]);

  // 添加计量单位数据
  const unitList = ref<any[]>([]);

  // 获取所有下拉数据
  const fetchTreeData = async () => {
    try {
      const [categoryRes, spaceRes, unitRes] = await Promise.all([categoryTree(), spaceTree(), getUnitList()]);
      categoryTreeData.value = categoryRes;
      spaceTreeData.value = spaceRes;
      unitList.value = unitRes;
    } catch (error) {
      console.error('获取数据失败', error);
      message.error('获取数据失败');
    }
  };
  // 初始化时获取树形数据
  fetchTreeData();
  // 查询方法
  const handleQuery = () => {
    pagination.value.current = 1; // 重置到第一页
    fetchData();
  };

  // 重置方法
  const handleReset = () => {
    queryParams.value = {
      pointCode: '',
      pointName: '',
      categoryId: undefined,
      spaceId: undefined,
    };
    handleQuery();
  };
  // 表格变化处理（分页、排序、筛选）
  const handleTableChange = (pag: TablePaginationConfig) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    fetchData();
  };

  // 修改获取表格数据的方法，添加查询参数
  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await selectPoint({
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        ...queryParams.value,
        pointName: queryParams.value.pointName ? '*' + queryParams.value.pointName + '*' : undefined,
        pointCode: queryParams.value.pointCode ? '*' + queryParams.value.pointCode + '*' : undefined,
      });
      dataSource.value = res.records;
      total.value = res.total;
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    } finally {
      loading.value = false;
    }
  };
  // 初始加载数据
  fetchData();

  const columns: TableColumnsType = [
    {
      title: '项目编号',
      dataIndex: 'pointCode',
      key: 'pointCode',
      width: 120,
    },
    {
      title: '项目名称',
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
        const node = findTreeNode(categoryTreeData.value, text);
        return node?.title || text;
      },
    },
    {
      title: '空间位置',
      dataIndex: 'spaceId',
      key: 'spaceId',
      width: 120,
      customRender: ({ text }) => {
        const node = findTreeNode(spaceTreeData.value, text);
        return node?.value || text;
      },
    },
    {
      title: '计量单位',
      dataIndex: 'meteringUnit',
      key: 'meteringUnit',
      width: 100,
      customRender: ({ text }) => {
        const unit = unitList.value.find((item) => item.id === text);
        return unit?.name || text;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
    },
  ];

  // 递归查找树节点
  const findTreeNode = (tree: any[], key: string): any => {
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

  // 新增
  const handleAdd = () => {
    isUpdate.value = false;
    modalRef.value.openModal();
  };

  // 编辑
  const handleEdit = (record: MeteringPoint) => {
    console.log('record', record);

    isUpdate.value = true;
    modalRef.value?.openModal({
      id: record.id,
      pointCode: record.pointCode,
      pointName: record.pointName,
      categoryId: record.categoryId,
      spaceId: record.spaceId,
      meteringUnit: record.meteringUnit,
    });
  };
  // 删除记录
  const handleDelete = (record: MeteringPoint) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目编号为 ${record.pointCode} 的记录吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await deletePoint({ id: record.id }, fetchData);
        } catch (error) {
          console.error(error);
        }
      },
    });
  };
  // 表单提交成功
  const handleSuccess = () => {
    fetchData();
  };

  // 编辑公式
  const formulaModalRef = ref();
  const handleFormula = (record: MeteringPoint) => {
    formulaModalRef.value?.openModal(record);
  };

  // 公式配置成功
  const handleFormulaSuccess = () => {
    message.success('公式配置成功');
    fetchData();
  };
</script>
<style lang="less" scoped>
  .metering-point-list {
    flex: 1;
    padding: 10px;
  }
</style>
