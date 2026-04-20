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
              <a-form-item label="控制类型" name="relType">
                <span>{{ formState.relType }}</span>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="名称" name="planName">
                <span>{{ formState.planName }}</span>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row style="margin-bottom: 12px">
            <a-table
              class="custom-hover-table"
              :dataSource="dataSource"
              :columns="filteredColumns"
              :pagination="false"
              size="middle"
              bordered
              @change="handleChange"
              :loading="tableLoading"
              :scroll="{ y: 400 }"
            >
              <template #index="{ text, record, index }">
                {{ index + 1 }}
              </template>
            </a-table>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="开始时间" name="executionTime">
                <span>{{ formState.executionTime }}</span>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="操控类型" name="operationType">
                <span>{{ formState.operationType }}</span>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="周期范围">
                <span>{{ formState.startDate + ' 至 ' + formState.endDate }}</span>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <a-form-item label="执行日期" :labelCol="{ span: 4 }">
                <span>{{ formState.enabledWeek }}</span>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUnmounted, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { getCircuitListPageApi, getAreaListPageApi, addLightingPlanAPi, editLightingPlanAPi } from '../Standardized.api';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { planDetailApi } from '../Standardized.api';
  const { hasPermission } = usePermission();
  const tableLoading = ref<boolean>(false);
  const props = defineProps({
    reload: {
      type: Function,
      default: () => {},
    },
  });

  const open = ref<boolean>(false);
  const weekList = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const title = ref('定时控制计划详情');
  const id = ref('');
  const formState = ref({
    relType: '回路',
    planName: '',
    relIds: '',
    executionTime: '',
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

  const filterWeek = (week) => {
    console.log(week, 'week');
    if (!week) {
      return '';
    }
    let weekArr = week.split(',');
    return weekArr.map((item) => weekList[item - 1]).join('、') || '';
  };
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
  const ids: any = ref([]);
  // 打开弹框
  const showDrawer = async (record?) => {
    open.value = true;
    tableLoading.value = true;
    await getPlanDetail(record.id);
    tableLoading.value = false;
  };

  const closeModal = () => {
    id.value = '';
    formState.value.planName = '';
    formState.value.executionTime = '';
    formState.value.operationType = '';
    pagination.current = 1;
    pagination.pageSize = 10;
    ids.value = [];
    open.value = false;
  };
  const getPlanDetail = async (id) => {
    try {
      const res = await planDetailApi({ id });
      formState.value = res;
      formState.value.enabledWeek = filterWeek(res.enabledWeek);
      if (res.relType === '回路') {
        dataSource.value = res.circuitList;
      } else {
        dataSource.value = res.areaList;
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };
  // 组件卸载时清理定时器
  onUnmounted(() => {
    // 清空之前的选择
    id.value = '';
    ids.value = [];
    formState.value.planName = '';
    formState.value.executionTime = '';
    formState.value.operationType = '';
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
