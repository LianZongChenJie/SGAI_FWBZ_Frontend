<template>
  <div class="maintenance-task">
    <el-container>
      <el-main>
        <div class="search-box">
          <el-form :model="searchForm" size="default" inline label-position="right">
            <el-form-item label="年份：">
              <el-date-picker v-model="searchForm.year" type="year" format="YYYY" value-format="YYYY" :clearable="false" />
            </el-form-item>
            <el-form-item label="组织机构：">
              <el-tree-select v-model="orgCode" :props="treeProps" :load="leafLoad" :data="orgTree" lazy check-strictly style="width: 240px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="search">查询</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="table-actions">
          <el-button type="primary" :icon="Plus" @click="handleOpenAddFile">新增文件</el-button>
        </div>

        <el-table :data="tableData" row-key="id" border tooltip-effect="dark" v-loading="loading" :tree-props="{ children: 'children' }">
          <el-table-column prop="name" label="任务周期/文件" min-width="240" show-overflow-tooltip />
          <el-table-column prop="nodeTypeName" label="类型" width="120" align="center" />
          <el-table-column prop="fileUrl" label="文件地址" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.fileUrl">{{ row.fileUrl }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createBy" label="创建人" width="120" align="center">
            <template #default="{ row }">
              {{ row.createBy || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="170" align="center">
            <template #default="{ row }">
              {{ row.createTime || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.nodeTypeName === '周次'" link type="primary" size="small" @click="handleWeekDetail(row)">周工作计划</el-button>
              <el-button v-else-if="row.nodeTypeName === '文件分类'" link type="primary" size="small" @click="handleUploadFromClassification(row)">上传文件</el-button>
              <el-popconfirm v-else-if="row.recordId" title="确认删除该记录？" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

    <el-dialog v-model="detailVisible" :title="weekDetailTitle" width="1200px" :close-on-click-modal="false">
      <el-table :data="weekDetailList" border v-loading="detailLoading" class="week-detail-table" max-height="520px">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="sheetName" label="系统大类" align="center" show-overflow-tooltip />
        <el-table-column prop="systemMain" label="主系统名称" align="center" show-overflow-tooltip />
        <el-table-column prop="systemSub" label="子系统名称" show-overflow-tooltip />
        <el-table-column prop="componentCategory" label="机件类别" show-overflow-tooltip />
        <el-table-column prop="installationLocation" label="安装位置" align="center" show-overflow-tooltip />
        <el-table-column prop="serviceArea" label="服务区域" align="center" show-overflow-tooltip />
        <el-table-column prop="maintenanceItems" label="维保项目" align="center" show-overflow-tooltip />
        <el-table-column prop="suggestedFrequency" label="建议频率/时间" align="center" />
        <el-table-column prop="responsiblePerson" label="负责人" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addVisible" title="新增文件" width="520px" :close-on-click-modal="false" @closed="resetAddForm">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="年份">
          <el-input v-model="addForm.year" disabled />
        </el-form-item>
        <el-form-item label="周次" prop="weekNumber">
          <el-input-number v-model="addForm.weekNumber" :min="1" :max="53" controls-position="right" style="width: 100%" :disabled="lockContext" />
        </el-form-item>
        <el-form-item label="文件类型" prop="fileType">
          <el-select v-model="addForm.fileType" placeholder="请选择文件类型" style="width: 100%" :disabled="lockContext">
            <el-option v-for="item in fileTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件" prop="fileUrl">
          <JUpload v-model:value="addForm.fileUrl" text="上传" :max-count="1" :multiple="false" :replace-last-one="true" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="addSaving" @click="handleAddSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import moment from 'moment';
  import { Plus, Search } from '@element-plus/icons-vue';
  import JUpload from '/@/components/Form/src/jeecg/components/JUpload/JUpload.vue';
  import { addTask, deleteTask, getList, getWeekList } from './task.api';
  import { queryDepartTreeSync } from '@/views/system/depart/depart.api.ts';

  defineOptions({
    name: 'MaintenanceTask',
  });

  type FileType = 'FORECAST' | 'JOB_INSTRUCTION' | 'COMPLETION';

  interface FileItem {
    id: number | string;
    fileUrl?: string;
    createBy?: string;
    createTime?: string;
  }

  interface WeekItem {
    weekNumber: number;
    forecastFiles?: FileItem[];
    jobInstructionFiles?: FileItem[];
    completionFiles?: FileItem[];
  }

  interface MonthItem {
    month: number;
    weeks?: WeekItem[];
  }

  interface WorkPlanItem {
    id: number;
    createBy?: string;
    createTime?: string;
    year?: number;
    sheetName?: string;
    systemMain?: string;
    systemSub?: string;
    componentCategory?: string;
    installationLocation?: string;
    serviceArea?: string;
    maintenanceItems?: string;
    suggestedFrequency?: string;
    responsiblePerson?: string;
    weeklyConfig?: string;
  }

  interface TreeNode {
    id: string;
    recordId?: number | string;
    name: string;
    nodeTypeName: string;
    year?: string;
    orgCode?: string;
    month?: number;
    weekNumber?: number;
    fileType?: FileType;
    forecastCount?: number;
    jobInstructionCount?: number;
    completionCount?: number;
    fileUrl?: string;
    createBy?: string;
    createTime?: string;
    children?: TreeNode[];
  }

  interface AddForm {
    year: string;
    weekNumber: number | undefined;
    orgCode: string;
    fileType: FileType | '';
    fileUrl: string;
  }

  const loading = ref(false);
  const detailLoading = ref(false);
  const detailVisible = ref(false);
  const detailData = ref<Partial<TreeNode>>({});
  const weekDetailList = ref<WorkPlanItem[]>([]);
  const weekDetailTitle = computed(() => (detailData.value.weekNumber ? `第${detailData.value.weekNumber}周工作计划` : '周工作计划'));

  const addVisible = ref(false);
  const addSaving = ref(false);
  const addFormRef = ref();
  const lockContext = ref(false);

  const orgCode = ref('');
  const orgTree = ref<any[]>([]);
  const tableData = ref<TreeNode[]>([]);
  const searchForm = ref({
    year: moment().format('YYYY'),
    orgCode: '',
  });

  const addForm = reactive<AddForm>({
    year: moment().format('YYYY'),
    weekNumber: undefined,
    orgCode: '',
    fileType: '',
    fileUrl: '',
  });

  const addRules = {
    weekNumber: [{ required: true, message: '请输入周次', trigger: 'blur' }],
    fileType: [{ required: true, message: '请选择文件类型', trigger: 'change' }],
    fileUrl: [{ required: true, message: '请上传文件', trigger: 'change' }],
  };

  const treeProps = {
    label: 'departName',
    children: 'children',
    isLeaf: 'isLeaf',
  };

  const fileTypeOptions: Array<{ label: string; value: FileType }> = [
    { label: '实施预报表', value: 'FORECAST' },
    { label: '作业书', value: 'JOB_INSTRUCTION' },
    { label: '完成表', value: 'COMPLETION' },
  ];

  const fileTypeMap: Array<{
    field: 'forecastFiles' | 'jobInstructionFiles' | 'completionFiles';
    label: string;
    value: FileType;
  }> = [
    { field: 'forecastFiles', label: '实施预报表', value: 'FORECAST' },
    { field: 'jobInstructionFiles', label: '作业书', value: 'JOB_INSTRUCTION' },
    { field: 'completionFiles', label: '完成表', value: 'COMPLETION' },
  ];

  const normalizeResult = (res) => {
    return res?.result || res || {};
  };

  const buildFileNodes = (files: FileItem[] = [], parentId: string, typeName: string) => {
    return files.map((file, index) => ({
      id: `${parentId}-file-${file.id || index}`,
      recordId: file.id,
      name: file.fileUrl || `${typeName}${index + 1}`,
      nodeTypeName: '文件',
      fileUrl: file.fileUrl,
      createBy: file.createBy,
      createTime: file.createTime,
    }));
  };

  const buildTreeData = (months: MonthItem[] = []) => {
    return months.map((monthItem) => {
      const monthId = `month-${monthItem.month}`;

      return {
        id: monthId,
        name: `${monthItem.month}月`,
        nodeTypeName: '月份',
        children: (monthItem.weeks || []).map((weekItem) => {
          const weekId = `${monthId}-week-${weekItem.weekNumber}`;

          return {
            id: weekId,
            name: `第${weekItem.weekNumber}周`,
            nodeTypeName: '周次',
            year: searchForm.value.year,
            orgCode: orgCode.value,
            month: monthItem.month,
            weekNumber: weekItem.weekNumber,
            forecastCount: weekItem.forecastFiles?.length || 0,
            jobInstructionCount: weekItem.jobInstructionFiles?.length || 0,
            completionCount: weekItem.completionFiles?.length || 0,
            children: fileTypeMap.map((type) => {
              const files = weekItem[type.field] || [];

              return {
                id: `${weekId}-${type.field}`,
                name: `${type.label}（${files.length}）`,
                nodeTypeName: '文件分类',
                year: searchForm.value.year,
                orgCode: orgCode.value,
                weekNumber: weekItem.weekNumber,
                fileType: type.value,
                children: buildFileNodes(files, `${weekId}-${type.field}`, type.label),
              };
            }),
          };
        }),
      };
    });
  };

  const getTaskList = async () => {
    loading.value = true;
    try {
      const res = await getList({
        year: searchForm.value.year,
        orgCode: orgCode.value,
      });
      const result = normalizeResult(res);
      tableData.value = buildTreeData(result.months || []);
    } finally {
      loading.value = false;
    }
  };

  const search = () => {
    getTaskList();
  };

  const resetAddForm = () => {
    addForm.year = searchForm.value.year;
    addForm.weekNumber = undefined;
    addForm.orgCode = orgCode.value;
    addForm.fileType = '';
    addForm.fileUrl = '';
    addFormRef.value?.clearValidate();
  };

  const handleOpenAddFile = () => {
    if (!orgCode.value) {
      ElMessage.warning('请选择组织机构');
      return;
    }

    addForm.year = searchForm.value.year;
    addForm.orgCode = orgCode.value;
    addForm.weekNumber = undefined;
    addForm.fileType = '';
    addForm.fileUrl = '';
    lockContext.value = false;
    addVisible.value = true;
  };

  // 从「文件分类」行进入：上下文已确定，锁定周次与文件类型，仅上传文件
  const handleUploadFromClassification = (row: TreeNode) => {
    addForm.year = row.year || searchForm.value.year;
    addForm.orgCode = row.orgCode || orgCode.value;
    addForm.weekNumber = row.weekNumber;
    addForm.fileType = row.fileType || '';
    addForm.fileUrl = '';
    lockContext.value = true;
    addVisible.value = true;
  };

  const handleAddSubmit = async () => {
    if (!addFormRef.value) {
      return;
    }

    await addFormRef.value.validate();
    addSaving.value = true;
    try {
      await addTask({
        year: Number(addForm.year),
        weekNumber: addForm.weekNumber,
        orgCode: addForm.orgCode,
        fileType: addForm.fileType,
        fileUrl: addForm.fileUrl,
      });
      ElMessage.success('新增成功');
      addVisible.value = false;
      await getTaskList();
    } finally {
      addSaving.value = false;
    }
  };

  const handleWeekDetail = async (row: TreeNode) => {
    detailData.value = row;
    weekDetailList.value = [];
    detailVisible.value = true;
    detailLoading.value = true;
    try {
      const res = await getWeekList({
        year: row.year,
        weekNumber: row.weekNumber,
      });
      weekDetailList.value = res?.result || res || [];
    } finally {
      detailLoading.value = false;
    }
  };

  const handleDelete = async (row: TreeNode) => {
    if (!row.recordId) {
      return;
    }

    loading.value = true;
    try {
      await deleteTask({ id: row.recordId });
      ElMessage.success('删除成功');
      await getTaskList();
    } finally {
      loading.value = false;
    }
  };

  const leafLoad = async (node, resolve) => {
    if (node.level === 0) {
      loading.value = true;
      try {
        const res = await queryDepartTreeSync();
        orgTree.value = res || [];
        resolve(res);

        if (!orgCode.value && res && res.length > 0) {
          orgCode.value = res[0].id;
          await getTaskList();
        }
      } finally {
        loading.value = false;
      }
      return;
    }

    loading.value = true;
    try {
      const res = await queryDepartTreeSync({ pid: node.data.id });
      resolve(res);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    searchForm.value.year = moment().format('YYYY');
  });
</script>

<style lang="less" scoped>
  .maintenance-task {
    height: 88vh;
    background-color: #fff;

    .search-box {
      display: flex;
      margin-bottom: 10px;
    }

    .table-actions {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 10px;
    }

    :deep(.el-table__header th.el-table__cell) {
      height: 48px;
      background-color: #fbfbfb;
    }

    .week-detail-table {
      margin-top: 12px;
    }
  }
</style>
