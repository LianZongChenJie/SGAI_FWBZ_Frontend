<template>
  <div class="maintenance-plan-import">
    <el-container>
      <el-main>
        <div class="search-box clearfix">
          <el-form class="form-main" ref="searchForm" :model="searchForm" size="default" inline label-position="right">
            <el-form-item label="年份：">
              <!-- <el-date-picker type="year" v-model="searchForm.year" value-format="yyyy"
                :clearable="false"></el-date-picker> -->
              <el-date-picker v-model="year" type="year" format="YYYY" value-format="YYYY" :clearable="false" @change="handleYear" />
            </el-form-item>
            <el-form-item label="组织机构：">
              <el-tree-select v-model="orgCode" :props="treeProps" :load="leafLoad" :data="orgTree" lazy check-strictly style="width: 240px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="ArrowLeftBold" @click="prevYear()">上一年</el-button>
              <el-button type="primary" :icon="ArrowRightBold" @click="nextYear()">下一年</el-button>
            </el-form-item>
          </el-form>
          <div class="search-box-button">
            <!-- <el-button size="default" type="primary" :icon="RefreshRight" @click="resetSearchForm">重置</el-button> -->
            <el-button size="default" type="primary" :icon="Search" @click="search()">查询</el-button>
          </div>
        </div>
        <div class="search-tools">
          <!-- <el-button
            size="default"
            type="primary"
            :icon="Download"
            @click="downloadUrl(true)"
            v-permission="'daoru-download'"
            :loading="downloadUrlLoading"
            ><a style="color: #fff; text-decoration: none">下载模板</a></el-button
          > -->
          <el-button
            size="default"
            type="primary"
            :icon="Upload"
            @click="
              dialogVisible = true;
              isDownload = false;
              importYear = moment().format('YYYY');
              importOrgCode = firstOrgCode;
            "
            v-permission="'daoru-leadingin'"
            >导入计划</el-button
          >
          <!-- <el-button size="default" type="primary" :icon="Plus" @click="addPlanHandle('新增计划')" v-permission="'daoru-add'">新增计划</el-button> -->
          <el-button size="default" type="primary" @click="generateTasks">批量生成维保任务</el-button>
          <!-- <el-button size="default" type="primary" :icon="Delete" @click="deletePlanEvent()" v-permission="'daoru-del'">删除计划</el-button> -->
        </div>
        <el-table
          ref="multiLevelTable"
          class="multi-level-header"
          :data="planList"
          tooltip-effect="dark"
          :span-method="objectSpanMethod"
          border
          v-loading="loading"
        >
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column
            v-for="(column, index) in tableHeader"
            :key="index"
            :label="column.name"
            :prop="column.field"
            align="center"
            :width="column.columnWidth"
            show-overflow-tooltip
          >
            <template v-slot="scope">
              <template v-if="column.children">
                <el-table-column v-for="column1 in column.children" :key="column1.name" :label="column1.name" align="center">
                  <el-table-column
                    v-for="column2 in column1.children"
                    :key="column2.field"
                    :label="column2.name"
                    :prop="column2.field"
                    align="center"
                    min-width="120"
                  />
                </el-table-column>
              </template>
              <template v-else>
                <span v-if="column.field === 'associatedDevice' || column.field === 'associatedSpace'">
                  {{ scope.row[column.field] ? '是' : '否' }}
                </span>
                <span v-else>{{ scope.row[column.field] }}</span>
              </template>
            </template>
          </el-table-column>
          <!-- <el-table-column fixed="right" label="操作" width="230" align="center">
            <template #default="scope">
              <el-button link type="primary" @click="addPlanHandle('编辑计划', scope.row)" size="small"> 编辑 </el-button>
              <el-popconfirm class="box-item" title="确认删除该计划？" @confirm="deletePlanEvent(scope.row)" placement="top">
                <template #reference>
                  <el-button link type="primary" size="small"> 删除 </el-button>
                </template>
              </el-popconfirm>
              <el-button link type="primary" @click="registerDeviceHandle(scope.row.id)" size="small"> 关联设备 </el-button>
              <el-button link type="primary" @click="registerSpaceHandle(scope.row.id)" size="small"> 关联空间 </el-button>
            </template>
          </el-table-column> -->
        </el-table>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 40]"
          :size="size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalNum"
          style="margin-top: 10px; float: right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-main>
    </el-container>
    <!-- 导入计划弹出框 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="isDownload ? '下载计划' : '导入计划'"
      width="480px"
      v-model="dialogVisible"
      :before-close="closeImport"
    >
      <!-- <el-upload ref="upload" :headers="headers" :action="`${this.deviceURL}/admin/planModel/importTemplate`" :auto-upload="false" accept=".xlsx,.xls" :file-list="fileList" :show-file-list="true" :on-change="fileChange" :on-success="uploadSuccess"> -->
      <el-form class="form-main" ref="importForm" :model="importForm" size="default" label-position="right" label-width="100px">
        <el-form-item label="年份：">
          <el-date-picker v-model="importYear" type="year" format="YYYY" value-format="YYYY" :clearable="false" />
        </el-form-item>
        <el-form-item label="组织机构：">
          <el-tree-select v-model="importOrgCode" :props="treeProps" :load="leafLoad" :data="orgTree" lazy check-strictly style="width: 240px" />
        </el-form-item>
      </el-form>
      <el-upload
        ref="upload"
        action=""
        :auto-upload="false"
        accept=".xlsx,.xls"
        :file-list="fileList"
        :show-file-list="true"
        :on-change="fileChange"
        :http-request="planUpload"
        v-if="!isDownload"
      >
        <template #trigger>
          <el-button type="primary">选取文件</el-button>
        </template>

        <template #tip>
          <div style="color: #f36767">只能上传excel文件</div>
        </template>
      </el-upload>
      <el-alert v-if="errorMessage" :title="errorMessage" type="error" />
      <template #footer>
        <el-button @click="closeImport">取 消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="downloadUrlLoading" :disabled="saving">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 新增计划组件 -->
    <add-plan ref="addPlanRef" @submit="handleSubmit" :title="planTitle" />
    <!-- 关联设备组件 -->
    <linked-device @register="registerDevice" />
    <!-- 关联空间组件 -->
    <linked-space @register="registerSpace" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import moment from 'moment';
  import { ArrowRightBold, ArrowLeftBold, Search, RefreshRight, Upload, Download, Delete, Plus } from '@element-plus/icons-vue';
  import { constants } from 'node:buffer';
  import { getPlanListApi, importTemplateApi, exportTemplateApi, deletePlan, generateTasksByBatch } from './Standardized.api';
  import { set } from 'nprogress';
  import AddPlan from './addPlan.vue';
  import { queryDepartTreeSync } from '@/views/system/depart/depart.api.ts';
  import { ElMessage, ComponentSize } from 'element-plus';
  import type { TableColumnCtx } from 'element-plus';
  import linkedDevice from './linkedDevice.vue';
  import linkedSpace from './linkedSpace.vue';
  import { useModal } from '@/components/Modal';
  import { message } from 'ant-design-vue';
  const handleYear = (val) => {
    console.log('handleYear--------------->', val);
  };

  const upload = ref();
  const year = ref(moment().format('YYYY'));
  const addPlanRef = ref();
  const loading = ref(false);
  const firstOrgCode = ref('');
  const currentPage = ref(1);
  const pageSize = ref(10);
  const size = ref<ComponentSize>('default');
  const errorMessage = ref('');
  const totalNum = ref(0);
  const searchForm = ref<{
    year: string;
    orgCode: string;
  }>({
    year: moment().format('YYYY'),
    orgCode: '',
  });
  const importForm = ref<{
    year: string;
    orgCode: string;
  }>({
    year: moment().format('YYYY'),
    orgCode: '',
  });
  interface User {
    id: string;
    name: string;
    amount1: string;
    amount2: string;
    amount3: number;
  }
  interface SpanMethodProps {
    row: User;
    column: TableColumnCtx<User>;
    rowIndex: number;
    columnIndex: number;
  }
  const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: SpanMethodProps) => {
    // 获取当前列的 prop
    const prop = column.property;

    // 检查是否有合并信息
    if (prop && spanArr.value[prop]) {
      const span = spanArr.value[prop][rowIndex];
      if (span > 0) {
        return {
          rowspan: span,
          colspan: 1,
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0,
        };
      }
    }

    return undefined;
  };
  const importYear = ref(moment().format('YYYY'));
  const importOrgCode = ref('');
  const isDownload = ref(false);
  const orgTreeSelect = ref();
  const cacheData = ref<any[]>([]);
  const orgCode = ref('');
  const orgTree = ref<any[]>([]);
  const treeProps = {
    label: 'departName',
    children: 'children',
    isLeaf: 'isLeaf',
  };
  const planList = ref([]);
  const dialogVisible = ref(false);
  const addPlanDialogVisible = ref(false);
  const fileList: any = ref([]);
  const tableHeader: any = ref([]);
  const saving = ref(false);
  const planTitle = ref('新增计划');
  const downloadUrlLoading = ref(false);
  // 用于存储每一列的合并信息
  const spanArr = ref({});
  const downloadUrl = async (a) => {
    isDownload.value = a;
    importYear.value = moment().format('YYYY');
    importOrgCode.value = firstOrgCode.value;
    dialogVisible.value = true;
  };

  // 计算合并信息
  const calculateSpan = (data) => {
    // 初始化 spanArr
    spanArr.value = {};

    if (!data || data.length === 0) return;

    // 只对需要合并的字段进行合并（根据实际表格列配置）
    const mergeFields = tableHeader.value.map((col) => col.field);

    mergeFields.forEach((field) => {
      let count = 1; // 记录当前连续相同值的数量
      const arr = [];

      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          // 第一行
          arr.push(1);
        } else {
          // 与上一行比较
          if (data[i][field] === data[i - 1][field]) {
            count++;
            arr.push(0); // 标记为需要合并的行
          } else {
            // 不同值，重置计数
            arr.push(count);
            count = 1;
          }
        }

        // 最后一行
        if (i === data.length - 1) {
          arr[arr.length - count] = count; // 更新起始行的合并数量
        }
      }

      spanArr.value[field] = arr;
    });
  };

  const getPlanList = async () => {
    loading.value = true;
    let res = await getPlanListApi({
      year: year.value,
      orgCode: orgCode.value,
      pageNo: currentPage.value,
      pageSize: pageSize.value,
    });
    if (res) {
      let tHeader = res.tableHeader.children || [];
      let list = res.planModelList || [];
      tHeader.forEach((v, idx) => {
        const widthMap = {
          0: 160,
          1: 100,
        };
        v.columnWidth = widthMap[idx] || 90;
      });
      tableHeader.value = tHeader;
      planList.value = list;
      totalNum.value = res.total || 0;

      // 计算合并信息
      calculateSpan(list);
    }
    loading.value = false;
  };

  const search = async () => {
    // page.value = 1
    await getPlanList();
  };
  const resetSearchForm = () => {
    searchForm.value.year = moment().format('YYYY');
  };
  const prevYear = () => {
    year.value = moment(year.value).subtract(1, 'years').format('YYYY');
  };
  const nextYear = () => {
    year.value = moment(year.value).add(1, 'years').format('YYYY');
  };
  const submitUpload = async () => {
    downloadUrlLoading.value = true;

    if (isDownload.value) {
      let res = await exportTemplateApi({
        year: importYear.value,
        orgCode: importOrgCode.value,
      });
      message.success('下载成功');
      dialogVisible.value = false;
      if (res) {
        downloadUrlLoading.value = false;
        let name = `${year.value}年设备维保模板`;
        let blobOptions = { type: 'application/vnd.ms-excel' };
        let fileSuffix = '.xls';
        let url = window.URL.createObjectURL(new Blob([res], blobOptions));
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', name + fileSuffix);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); //下载完成移除元素
        window.URL.revokeObjectURL(url); //释放掉blob对象
      } else {
        // 返回json
        // this.$message.warning(res.data.msg)
      }
      return;
    }
    console.log(fileList.value, '1234');
    if (fileList.value[0]) {
      upload.value.submit();
    } else {
      downloadUrlLoading.value = false;
      ElMessage.error('请先上传文件');
    }
  };
  const closeImport = () => {
    dialogVisible.value = false;
    downloadUrlLoading.value = false;
    errorMessage.value = '';
    upload.value.clearFiles();
  };
  const uploadSuccess = async (res) => {
    if (res.code === 1000 || res.code === 1001) {
      // this.$message.success(res.msg ? res.msg : '上传成功！')
      // this.$refs.upload.clearFiles()
      dialogVisible.value = false;
      await getPlanList();
    } else {
      // this.$message.error(res.msg)
    }
  };

  //导入计划---改
  const planUpload = async () => {
    console.log('123');
    const data = new FormData();
    data.append('file', fileList.value[0].raw);
    data.append('year', importYear.value);
    data.append('orgCode', importOrgCode.value);
    saving.value = true;
    let res = await importTemplateApi(data);
    saving.value = false;
    downloadUrlLoading.value = false;
    if (res.success === false) {
      upload.value.clearFiles();
      fileList.value = [];
      errorMessage.value = res.message;
    } else {
      ElMessage.success('导入成功');
      closeImport();
    }
    getPlanList();
    // this.rq({
    //   headers: { 'Content-Type': 'multipart/form-data' },
    //   baseURL: this.deviceURL,
    //   url: '/admin/planModel/importTemplate',
    //   method: 'post',
    //   data: data,
    //   responseType: 'blob',
    // })
    //   .then(async (res) => {
    //     saving.value = false
    //     if (res.type === 'application/vnd.ms-excel') {
    //       const blob = new Blob([res], {
    //         type: 'application/vnd.ms-excel;charset=UTF-8',
    //       })
    //       // 文件下载
    //       let link = document.createElement('a')
    //       const url = URL.createObjectURL(blob)
    //       link.href = url
    //       link.setAttribute('download', `消防导入结果.xlsx`)
    //       link.click()
    //       link = null
    //       window.URL.revokeObjectURL(url)
    //       // $refs.upload.clearFiles()
    //       dialogVisible.value = false
    //       await getPlanList()
    //     }
    //   })
    //   .catch((err) => {
    //     saving.value = false
    //     // this.$message.error(err)
    //     console.error(err)
    //   })
  };
  const fileChange = (file, list) => {
    if (list.length > 0) {
      fileList.value = [list[list.length - 1]]; // 覆盖上一次的文件
    }
  };
  const deletePlanEvent = (row) => {
    deletePlan(row.id).then((res) => {
      getPlanList();
    });
  };
  const addPlanHandle = (type, row?) => {
    planTitle.value = type;
    addPlanRef.value.showDialog(row, { year: year.value, orgCode: orgCode.value });
  };
  const handleSubmit = async () => {
    searchForm.value.year = moment().format('yyyy');
    await getPlanList();
  };
  // async function loadRootTreeData() {
  //   try {
  //     loading.value = true;
  //     orgTree.value = [];
  //     const result = await queryDepartTreeSync();
  //     if (Array.isArray(result) && result.length > 0) {
  //       orgTree.value = result;
  //       // 默认选择第一个选项
  //       orgCode.value = result[0].id;
  //     }
  //   } finally {
  //     loading.value = false;
  //   }
  // }
  const leafLoad = async (node, resolve) => {
    // 🌳 root 节点
    if (node.level === 0) {
      const res = await queryDepartTreeSync();
      resolve(res);

      // ✅ 关键：只在第一次加载时设置默认选中
      if (!orgCode.value && res && res.length > 0) {
        orgCode.value = res[0].id;
        firstOrgCode.value = res[0].id;
        await getPlanList();
      }

      return;
    }

    // 🌿 子节点
    const res = await queryDepartTreeSync({ pid: node.data.id });
    resolve(res);
  };
  // 批量生成维保任务
  const generateTasks = async () => {
    generateTasksByBatch({
      year: year.value,
      orgCode: orgCode.value,
    }).then((res) => {
      // getPlanList();
      ElMessage({
        message: '批量生成维保任务成功！',
        type: 'success',
      });
    });
  };
  const handleSizeChange = (val: number) => {
    pageSize.value = val;
    getPlanList();
  };
  const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    getPlanList();
  };
  onMounted(async () => {
    loading.value = true;
    // await loadRootTreeData();
    searchForm.value.year = moment().format('yyyy');
  });
  const [registerDevice, { openModal: openRegisterDevice }] = useModal();
  const [registerSpace, { openModal: openRegisterSpace }] = useModal();
  const registerDeviceHandle = (id) => {
    openRegisterDevice(true, id);
  };
  const registerSpaceHandle = (id) => {
    openRegisterSpace(true, id);
  };
</script>

<style lang="less" scoped>
  .maintenance-plan-import {
    height: 88vh;
    background-color: #fff;

    .search-box {
      display: flex;
    }

    .search-tools {
      margin-bottom: 10px;
    }
  }
</style>
