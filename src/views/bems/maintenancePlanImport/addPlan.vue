<template>
  <el-dialog :close-on-click-modal="false" :title="title" width="800px" v-model="dialogVisible" @close="handleClose">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="基本信息"
        ><el-form ref="addPlanForm" :model="form" label-width="120px" :rules="rules" v-loading="loading">
          <el-row>
            <el-col :span="12">
              <el-form-item label="计划名称" prop="planName">
                <el-input v-model="form.planName" placeholder="请输入计划名称" />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="年份" prop="year">
                <el-date-picker v-model="form.year" type="year" placeholder="请选择年份" style="width: 100%" />
              </el-form-item>
            </el-col> -->
            <!-- <el-col :span="12">
              <el-form-item label="组织机构" prop="orgCode">
                <el-tree-select
                  v-model="form.orgCode"
                  :props="treeProps"
                  :load="leafLoad"
                  :data="orgTree"
                  lazy
                  check-strictly
                  style="width: 100%"
                  @node-click="handleNodeClick"
                />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="系统名称" prop="systemName">
                <el-input v-model="form.systemName" placeholder="请输入系统名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="维保周期" prop="maintenanceCycle">
                <el-input type="number" v-model="form.maintenanceCycle" min="1" placeholder="请输入维保周期" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="周期单位" prop="cycleUnit">
                <el-select v-model="form.cycleUnit" placeholder="请选择周期单位" style="width: 100%">
                  <el-option label="日" value="日" />
                  <el-option label="周" value="周" />
                  <el-option label="月" value="月" />
                  <el-option label="季" value="季" />
                  <el-option label="年" value="年" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="建议频次" prop="suggestedFrequency">
                <el-input type="number" min="1" v-model="form.suggestedFrequency" placeholder="请输入建议频次" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="持续执行时间" prop="continuousDuration">
                <el-input type="number" min="1" v-model="form.continuousDuration" placeholder="请输入持续执行时间">
                  <template #append>
                    日
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门" prop="department">
                <el-input v-model="form.department" placeholder="请输入部门" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="配置字段信息" prop="optionalFields">
                <div v-for="(field, index) in form.optionalFields" :key="index" class="optional-field" style="width: 100%">
                  <el-input v-model="field.fieldName" placeholder="字段名" disabled style="width: 48%; margin-right: 4%" />
                  <el-input v-model="field.fieldValue" placeholder="字段值" style="width: 48%" />
                </div>
              </el-form-item>
            </el-col>
          </el-row> </el-form
      ></el-tab-pane>
      <el-tab-pane label="时间安排" name="时间安排">
        <el-table :data="weeklyTree" border>
          <el-table-column prop="weekTitle" label="月份" width="80" />
          <el-table-column label="周次">
            <template #default="{ row }">
              <el-input
                v-for="week in row.children"
                :key="week.weekNumber"
                :placeholder="'第' + week.weekNumber + '周'"
                v-model="weeklyInputs[week.weekNumber]"
                style="width: 100px; margin-right: 8px; margin-bottom: 8px"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { getFiledConfig, getWeekDistribution, addPlan, editPlan, planDetail } from './Standardized.api';
  import { queryDepartTreeSync } from '@/views/system/depart/depart.api.ts';
  const dialogVisible = ref(false);
  const props = defineProps({
    title: {
      type: String,
      default: '新增计划',
    },
  });
  const weeklyTree = ref<any[]>([]);
  const weeklyInputs = ref<Record<string, string>>({});
  const activeName = ref('基本信息');
  const addPlanForm = ref();
  const orgTree = ref<any[]>([]);
  const loading = ref(false);
  const treeProps = {
    label: 'departName',
    children: 'children',
    isLeaf: 'isLeaf',
  };
  const emit = defineEmits(['submit']);

  const form = ref({
    planName: '',
    year: '2026',
    orgCode: '',
    systemName: '',
    maintenanceCycle: '',
    cycleUnit: '',
    suggestedFrequency: '',
    continuousDuration: '',
    department: '',
    weeklyConfig: '',
    optionalFields: [] as any[],
  });

  const rules = ref({
    planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
    year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
    orgCode: [{ required: true, message: '请输入组织机构编码', trigger: 'blur' }],
    systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
    maintenanceCycle: [{ required: true, message: '请输入维保周期', trigger: 'blur' }],
    cycleUnit: [{ required: true, message: '请输入周期单位', trigger: 'blur' }],
    suggestedFrequency: [{ required: true, message: '请输入建议频次', trigger: 'blur' }],
    continuousDuration: [{ required: true, message: '请输入持续执行时间', trigger: 'blur' }],
    department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  });

  const handleClose = () => {
    activeName.value = '基本信息';
    dialogVisible.value = false;
    addPlanForm.value.resetFields();
    weeklyInputs.value = {};
  };
  const showDialog = async (row, from) => {
    loading.value = true;
    dialogVisible.value = true;
    await loadRootTreeData();
    getWeekDistributionHandle();
    if (row) {
      const { id, planName, year, orgCode, systemName, maintenanceCycle, cycleUnit, suggestedFrequency, continuousDuration, department } = row;
      planDetail(id).then((res) => {
        weeklyInputs.value = JSON.parse(res.weeklyConfig || '{}');
        form.value.optionalFields = res.fieldInfoList;
        loading.value = false;
      });
      form.value = {
        id,
        planName,
        year,
        orgCode,
        systemName,
        maintenanceCycle,
        cycleUnit,
        suggestedFrequency,
        continuousDuration,
        department,
      };
    } else {
      form.value.year = from.year;
      form.value.orgCode = from.orgCode;
      getFiledConfigHandle();
      loading.value = false;
    }
  };
  const getFiledConfigHandle = () => {
    getFiledConfig(form.value.orgCode).then((res) => {
      form.value.optionalFields = res;
    });
  };
  const handleNodeClick = (node) => {
    form.value.orgCode = node.id;
    getFiledConfigHandle();
  };

  async function loadRootTreeData() {
    try {
      orgTree.value = [];
      const result = await queryDepartTreeSync();
      if (Array.isArray(result) && result.length > 0) {
        orgTree.value = result;
        // 默认选择第一个选项
        // form.value.orgCode = result[0].id;
      }
    } catch (error) {
      console.error('加载根节点数据失败:', error);
    }
  }
  const leafLoad = (node, resolve) => {
    if (node.isLeaf) return resolve([]);
    queryDepartTreeSync({ pid: node.data.id }).then((res) => {
      resolve(res);
    });
  };
  const getWeekDistributionHandle = () => {
    getWeekDistribution({
      year: form.value.year,
    }).then((res) => {
      weeklyTree.value = [];
      for (const key in res.monthWeekMap) {
        weeklyTree.value.push({
          weekTitle: key + '月',
          children: res.monthWeekMap[key],
        });
      }
      console.log(weeklyTree.value);
    });
  };
  const submitForm = () => {
    // 过滤空值，转为 JSON 字符串
    form.value.weeklyConfig = JSON.stringify(Object.fromEntries(Object.entries(weeklyInputs.value).filter(([_, v]) => v)));
    // 验证表单
    addPlanForm.value.validate((valid) => {
      console.log(valid);
      if (valid) {
        if (props.title === '新增计划') {
          addPlan(form.value).then(() => {
            dialogVisible.value = false;
            emit('submit', form.value);
          });
        } else {
          editPlan(form.value).then(() => {
            dialogVisible.value = false;
            emit('submit', form.value);
          });
        }
      }
    });
    // emit('submit', form.value);
  };
  const handleClick = (tab) => {
    activeName.value = tab.name;
  };
  defineExpose({ showDialog });
</script>

<style scoped>
  .optional-field {
    margin-top: 10px;
  }
</style>
