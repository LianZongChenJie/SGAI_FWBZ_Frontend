<template>
  <div class="page-main maintenance-plan-mangent-main-box" v-loading="loading">
    <el-container>
      <el-main>
        <div class="search-box clearfix">
          <el-form class="form-main" ref="searchFormRef" :model="searchForm" inline label-position="right" label-width="100px">
            <el-form-item label="时间：">
              <el-date-picker
                v-model="searchForm.planBeginTime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="时间"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="计划名称：">
              <el-input v-model="searchForm.name" clearable placeholder="计划名称"></el-input>
            </el-form-item>
            <el-form-item label="执行人：">
              <el-input v-model="searchForm.executor" clearable placeholder="执行人"></el-input>
            </el-form-item>
            <el-form-item>
              <div class="search-box-button">
                <el-button size="default" type="primary" :icon="RefreshRight" @click="resetSearchForm">重置</el-button>
                <el-button size="default" type="primary" :icon="Search" @click="search()">查询</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="search-tools">
          <a-popconfirm title="确认删除这些数据？" ok-text="确定" cancel-text="取消" @confirm="deletePlanEvent()">
            <el-button size="default" type="primary" :icon="Delete" v-permission="'plan-del'">删除计划</el-button>
          </a-popconfirm>
        </div>
        <el-table :data="planList" tooltip-effect="dark" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" :selectable="selectEnable" width="40" align="center"></el-table-column>
          <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
          <!--          <el-table-column prop="" label="任务ID" align="center"></el-table-column>-->
          <el-table-column prop="name" label="计划名称" align="center" show-overflow-tooltip min-width="140"></el-table-column>
          <!--          <el-table-column prop="taskTypeName" label="计划类型" align="center" show-overflow-tooltip></el-table-column>-->
          <el-table-column prop="createTime" label="创建时间" align="center" width="160"></el-table-column>
          <el-table-column prop="weibaoType" label="维保类型" align="center" show-overflow-tooltip width="100"></el-table-column>
          <el-table-column prop="principalGroup" label="执行科组" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="executor" label="执行人" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="planBeginTime" label="开始时间" align="center" width="100">
            <!-- <template slot-scope="{ row }">{{
              row.planBeginTime.split(' ')[0]
            }}</template> -->
            <template v-slot="scope">
              {{ scope.row.planBeginTime.split(' ')[0] }}
            </template>
          </el-table-column>
          <el-table-column prop="planEndTime" label="结束时间" align="center" width="100">
            <!-- <template slot-scope="{ row }">{{
              row.planEndTime.split(' ')[0]
            }}</template> -->
            <template v-slot="scope">
              {{ scope.row.planEndTime.split(' ')[0] }}
            </template>
          </el-table-column>
          <el-table-column prop="planState" label="状态" align="center" width="80"></el-table-column>
          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template v-slot="scope">
              <a-popconfirm title="确认即时生效？" ok-text="确定" cancel-text="取消" @confirm="toEffective(scope.row)">
                <el-button type="text" v-if="scope.row.planState === '待派发'" v-permission="'plan-effective'">即时生效</el-button>
              </a-popconfirm>
              <el-button type="text" v-if="scope.row.planState === '待派发'" @click="showEditDialog(scope.row)" v-permission="'plan-edit'"
                >修改</el-button
              >
              <el-button type="text" @click="showDetailDialog(scope.row)" v-permission="'plan-detail'">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-box">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
            :current-page="page"
            :page-sizes="[10, 20, 50]"
            :page-size="pagesize"
            :total="total"
            layout="total,prev, pager, next, sizes,jumper"
            v-show="planList.length"
          ></el-pagination>
        </div>
      </el-main>
    </el-container>
    <!-- 计划修改弹出框 -->
    <el-dialog :close-on-click-modal="false" title="设备维保计划修改" v-model="editDialogVisible" width="960px" :before-close="closePlanDialog">
      <div class="table-title"> <div></div>维保计划信息 </div>
      <el-form ref="planFormRef" :model="planForm" :rules="planFormRules" size="small" label-width="108px">
        <el-row :gutter="30" class="el-form-row">
          <el-col :span="12">
            <el-form-item label="计划名称：" prop="name">
              <el-input v-model="planForm.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!--2021-12-17 执行人回带 负责人自己填 -->
            <el-form-item label="执行人：" prop="executor">
              <el-input v-model="planForm.executor" :disabled="true"></el-input>
              <!-- <el-autocomplete class="inline-input" v-model="planForm.executor" :fetch-suggestions="querySearch" placeholder="" @select="handleSelectExecutor" clearable></el-autocomplete> -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="30" class="el-form-row">
          <el-col :span="12">
            <el-form-item label="执行科组：" prop="principalGroup">
              <el-cascader
                ref=""
                placeholder=""
                v-model="managementGroup"
                :options="groupOptions"
                :props="props"
                :clearable="false"
                style="width: 100%"
                :show-all-levels="false"
                @change="getOrg"
              ></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建人：">
              <el-input v-model="planForm.creatorName" disabled></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="负责人：" prop="principal">
              <el-input v-model="planForm.principal"></el-input> -->
          <!-- <el-autocomplete class="inline-input" v-model="planForm.principal" :fetch-suggestions="querySearch" placeholder="" @select="handleSelect" clearable></el-autocomplete> -->
          <!-- </el-form-item>
          </el-col> -->
        </el-row>
        <!--<el-row :gutter="30" class="el-form-row">
          <el-col :span="12">
            <el-form-item label="循环周期：" prop="cycle">
              <el-input-number v-model="planForm.cycle" controls-position="right" :min="1" ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位：" prop="unit">
              <el-select v-model="planForm.unit">
                <el-option v-for="(val, index ) in planCycleUnitMap" :label="val" :value="val" :key="index"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>-->
        <el-row :gutter="30" class="el-form-row">
          <el-col :span="12">
            <el-form-item label="开始时间：" prop="planBeginTime">
              <el-date-picker
                type="date"
                v-model="planForm.planBeginTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                :picker-options="startPickerOptions"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间：" prop="planEndTime">
              <el-date-picker
                type="date"
                v-model="planForm.planEndTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                :picker-options="endPickerOptions"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="30" class="el-form-row">
          <el-col :span="12">
            <el-form-item label="创建时间：">
              <el-input v-model="planForm.createTime" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="closePlanDialog()">取 消</el-button>
        <el-button type="primary" :disabled="saving" @click="savePlan()">确 定</el-button>
      </template>
    </el-dialog>
    <!-- 计划详情弹出框 -->
    <el-dialog :close-on-click-modal="false" class="dialog-box" title="设备维保计划详情" v-model="detailDialogVisible" width="1300px">
      <el-scrollbar class="scrollbar-hidden-x dialog-scrollbar">
        <div class="dialog-scrollbar-main">
          <div class="page-main">
            <el-container>
              <!-- <el-header>
                <ul>
                  <li v-for="(item, index) in tabArr" :key="index" :class="{ active: index === activeIndex }"
                    @click="activeIndex = index">
                    {{ item }}
                  </li>
                </ul>
              </el-header> -->
              <el-container v-if="activeIndex == 0">
                <el-main>
                  <div class="table-title"> <div></div>维保计划信息 </div>
                  <el-descriptions
                    title=""
                    :column="2"
                    border
                    :labelStyle="{
                      width: '20%',
                    }"
                    :contentStyle="{
                      width: '100px',
                      overflow: 'hidden',
                      'white-space': 'nowrap',
                      'text-overflow': 'ellipsis',
                    }"
                  >
                    <el-descriptions-item label="任务计划ID">{{ planDetail.id }}</el-descriptions-item>
                    <el-descriptions-item label="维保计划名称">{{ planDetail.name }}</el-descriptions-item>
                    <el-descriptions-item label="维保类型">{{ planDetail.weibaoType }}</el-descriptions-item>
                    <el-descriptions-item label="执行人">{{ planDetail.executor }}</el-descriptions-item>
                    <el-descriptions-item label="执行科组">{{ planDetail.principalGroup }}</el-descriptions-item>
                    <!-- <el-descriptions-item label="负责人">{{ planDetail.principal }}</el-descriptions-item> -->
                    <!-- <el-descriptions-item label="区域">{{ planDetail.area }}</el-descriptions-item> -->
                    <el-descriptions-item label="循环周期">{{ planDetail.cycle }}</el-descriptions-item>
                    <el-descriptions-item label="计划开始时间">{{ planDetail.planBeginTime.split(' ')[0] }}</el-descriptions-item>
                    <el-descriptions-item label="计划结束时间">{{ planDetail.planEndTime.split(' ')[0] }}</el-descriptions-item>
                    <el-descriptions-item label="实际开始时间">{{ planDetail.realBeginTime }}</el-descriptions-item>
                    <el-descriptions-item label="实际结束时间">{{ planDetail.realEndTime }}</el-descriptions-item>
                    <el-descriptions-item label="实际响应时间">{{ planDetail.realResponseTime }}</el-descriptions-item>
                    <el-descriptions-item label=""></el-descriptions-item>
                  </el-descriptions>
                  <div class="table-title"> <div></div>操作记录 </div>
                  <el-table :data="recordList" border>
                    <el-table-column label="时间" prop="operationTime" align="center"></el-table-column>
                    <el-table-column label="操作名称" prop="operationName" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="操作人" prop="operatorName" align="center" show-overflow-tooltip></el-table-column>
                    <!-- <el-table-column label="操作内容" prop="" align="center" show-overflow-tooltip></el-table-column> -->
                  </el-table>
                </el-main>
              </el-container>
              <!-- <el-container v-else-if="activeIndex == 1">
                <el-main>
                  <span class="table-title">维保设备信息</span>
                  <div>
                    <eq-tube :eqTable="deviceList" :isFlag="isTable" :paramsId="paramsId"></eq-tube>
                  </div>
                </el-main>
              </el-container> -->
              <!-- <el-container v-else>
                <el-main>
                  <span class="table-title">维保工单信息</span>
                  <el-table :data="maintenanceList" border :labelStyle="labelStyle" :contentStyle="contentStyle">
                    <el-table-column label="任务单号" prop="orderCode" align="center"></el-table-column>
                    <el-table-column label="问题描述" prop="device" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="优先级" prop="priorityType" align="center"
                      show-overflow-tooltip></el-table-column>
                    <el-table-column label="故障设备" prop="device" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="报修时间" prop="createdTime" width="160" align="center"></el-table-column>
                    <el-table-column label="执行人" prop="executor" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="工单状态" prop="orderState" align="center"
                      show-overflow-tooltip></el-table-column>
                  </el-table>
                </el-main>
              </el-container> -->
              <!-- 空间信息  隐藏 -->
              <!-- <el-container v-show="activeIndex == 3">
                <el-main>
                  <el-table :data="spaceList" border>
                    <el-table-column label="空间ID" prop="id" align="center"></el-table-column>
                    <el-table-column label="空间名称" prop="fullName" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="层" prop="layer" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="空间类型" prop="typeCode" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="所属建筑" prop="building" width="160" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="区域" prop="layerSubregion" align="center" show-overflow-tooltip></el-table-column>
                    <el-table-column label="面积(㎡)" prop="area" align="center" width="100"></el-table-column>
                  </el-table>
                </el-main>
              </el-container> -->
            </el-container>
          </div>
        </div>
      </el-scrollbar>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  // import { Search, RefreshRight, Delete } from '@element-plus/icons-vue'
  import { getPlanmangebtListApi, getPlanDetailApi, executeNowApi, getUnitOrgListApi, saveOrUpdateOneApi, removeByIdsApi } from './Standardized.api';
  import { message } from 'ant-design-vue';

  const isTable = ref(true);
  const rowInfo = ref({});
  const isTube = ref(false);
  const props = ref({
    children: 'children',
    label: 'name',
    checkStrictly: true,
    value: 'id',
  });
  const loading = ref(false);

  const searchFormRef = ref();
  const searchForm = ref({
    planBeginTime: '',
    name: '',
    executor: '',
  });
  const page = ref(1);
  const pagesize = ref(10);
  const total = ref(2);
  const planList = ref([]);
  const multipleSelection = ref<any>([]);
  const editDialogVisible = ref(false);
  const managementGroup = ref<any>([]); //科组级联
  const userOptions = ref([]);
  const groupOptions = ref<any>([]);
  const planFormRef = ref();
  const planForm = ref({
    id: null,
    name: '',
    department: '',
    departmentId: '',
    executor: '',
    principalGroup: '',
    principalGroupId: '',
    principal: '',

    planBeginTime: '',
    planEndTime: '',
    creatorName: '',
    createTime: '',
  });
  const planFormRules = {
    name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
    principalGroup: [
      {
        required: true,
        message: '请选择负责执行科组',
        trigger: 'change',
      },
    ],
    planBeginTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    planEndTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  };
  const planCycleUnitMap = ref(['日', '月', '季度', '年']);
  const startPickerOptions = ref({
    disabledDate(date) {
      return date.getTime() <= Date.now();
    },
  });
  const endPickerOptions = ref({
    disabledDate: (date) => {
      if (planForm.value.planBeginTime) {
        return date.getTime() <= new Date(planForm.value.planBeginTime);
      } else {
        return date.getTime() <= Date.now();
      }
    },
  });
  const saving = ref(false);
  const innerLoading = ref(false);
  const detailDialogVisible = ref(false);
  const tabArr = ref(['维保信息']);
  const activeIndex = ref(0);
  const planDetail: any = ref({ planBeginTime: '', planEndTime: '' });
  const recordList = ref([]);
  const deviceList = ref([]);
  const maintenanceList = ref([]);
  const spaceList = ref([]);
  const paramsId = ref(null);

  const cancelTube = () => {
    this.isTube = false;
  };
  //进入地图页面
  // getTubeInfo(row) {
  //   this.isTube = true;
  //   this.rowInfo = row;
  //   this.isTable = true;
  // },
  // 查找所有父节点
  const getAllParentArr = (list, id) => {
    for (let i in list) {
      if (list[i].id === id) {
        //查询到返回该数组对象
        return [list[i].id];
      }
      if (list[i].children) {
        let node = this.getAllParentArr(list[i].children, id);
        if (node !== undefined) {
          //查询到把父节点连起来 并排序
          return [].concat(list[i].id).concat(node);
        }
      }
    }
  };
  //<!-即时生效 -->
  const toEffective = async (row) => {
    const data = {
      planId: row.id,
    };
    let res = await executeNowApi(data);
    if (res === null) {
      getPlanList();
      message.success('生效成功！');
    } else {
      message.error('生效失败！');
    }
  };
  const handleSelectExecutor = (val) => {
    this.planForm.executor = val.value;
  };
  const handleSelect = (val) => {
    this.planForm.principal = val.value;
  };
  const querySearch = (queryString, cb) => {
    var userOptions = this.userOptions;
    var results = queryString ? userOptions.filter(this.createFilter(queryString)) : userOptions;
    cb(results);
  };
  const createFilter = (queryString) => {
    return (restaurant) => {
      return restaurant.value && restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
    };
  };
  const getUserOptions = () => {
    getPersonList()
      .then((res) => {
        const data = res || [];
        this.userOptions = data.map((v) => {
          v.value = v.userName;
          return v;
        });
      })
      .catch(() => {});
  };
  const selectEnable = (row, index) => {
    if (row.planState === '待派发') {
      return true;
    } else {
      return false;
    }
  };
  const getPlanList = async () => {
    const data = {
      page: page.value,
      pagesize: pagesize.value,
      createTime: '',
      labelType: 'Inspection',
    };
    for (const key in searchForm.value) {
      if (searchForm.value[key]) {
        data[key] = searchForm.value[key];
      }
    }
    let res = await getPlanmangebtListApi(data);
    planList.value = res.records;
    total.value = res.total;
  };

  const handleSizeChange = (val) => {
    page.value = 1;
    pagesize.value = val;
    getPlanList();
  };
  const handleCurrentChange = (val) => {
    page.value = val;
    getPlanList();
  };
  const search = () => {
    page.value = 1;
    getPlanList();
  };
  const resetSearchForm = () => {
    for (let key in searchForm.value) {
      searchForm.value[key] = '';
    }
    getPlanList();
  };
  function handleSelectionChange(val) {
    multipleSelection.value = val;
  }
  async function deletePlanEvent() {
    if (!multipleSelection.value.length) {
      message.warning('请选择要删除的数据项！');
      return;
    }
    let res = await removeByIdsApi(multipleSelection.value.map((item) => item.id));
    if (res === null) {
      message.success('删除成功！');
      page.value = 1;
      getPlanList();
    } else {
      message.error('删除失败！');
    }
  }
  async function showEditDialog(row) {
    let res = await getUnitOrgList();
    for (const key in row) {
      if (row[key] == '-') {
        row[key] = '';
      }
    }
    for (const key in planForm.value) {
      planForm.value[key] = row[key];
    }
    if (row.departmentId) {
      // this.managementGroup = row.principalGroupId.split(",").map(Number);
      managementGroup.value = getAllParentArr(groupOptions.value, row.departmentId);
      console.log('this.managementGroup', managementGroup.value, groupOptions.value);
    }
    editDialogVisible.value = true;
  }

  //查询科组
  async function getUnitOrgList() {
    let res = await getUnitOrgListApi();
    if (res) {
      groupOptions.value = res;
    }
  }
  // 获取选中节点的name id赋值给addForm 中的teamName  teamId
  function getOrg(val) {
    let ids = val[val.length - 1];
    let obj = groupOptions.value.find((item) => item.id == ids);
    planForm.value.department = obj.name;
    planForm.value.departmentId = ids;
    planForm.value.principalGroup = obj.name;
    planForm.value.principalGroupId = val.join(',');
  }

  function savePlan() {
    planFormRef.value.validate(async (valid) => {
      if (!valid) return;
      saving.value = true;
      let res = await saveOrUpdateOneApi(planForm.value);
      saving.value = false;
      if (res === null) {
        message.success('保存操作成功！');
        closePlanDialog();
        getPlanList();
      } else {
        message.error('保存失败！');
      }
    });
  }
  function closePlanDialog() {
    editDialogVisible.value = false;
    // planForm.value = JSON.parse(JSON.stringify(defaultData.value))
    managementGroup.value = [];
  }
  async function showDetailDialog(row) {
    activeIndex.value = 0;
    detailDialogVisible.value = true;
    innerLoading.value = true;
    paramsId.value = row.id;
    let res = await getPlanDetailApi({ planId: row.id });
    if (res) {
      planDetail.value = res;
      // console.log("planDetail", planDetail);
      recordList.value = res.operateRecordList ? res.operateRecordList : [];
      // deviceList = res.deviceList ? res.deviceList : [];
      if (res.deviceList.length) {
        deviceList.value = res.deviceList;
        rowInfo.value = deviceList.value[0];
      }
      spaceList.value = res.spaceDOList ? res.spaceDOList : [];
      maintenanceList.value = res.workOrderList ? res.workOrderList : [];
    }
  }

  onMounted(async () => {
    // defaultData.value = JSON.parse(JSON.stringify(planForm.value))
    await getPlanList();
    // getUserOptions()
    // await getUnitOrgList()
  });
</script>

<style lang="less" scoped>
  .maintenance-plan-mangent-main-box {
    background-color: #fff;

    .pagination-box {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 6px;
      padding-right: 6px;
    }

    .table-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-left: 6px;
      height: 30px;
      font-weight: 600;
      color: #000;
      font-size: 15px;

      > div {
        height: 60%;
        width: 0;
        margin-right: 6px;
        border-right: 6px solid rgb(19, 142, 243);
      }
    }
  }
</style>
