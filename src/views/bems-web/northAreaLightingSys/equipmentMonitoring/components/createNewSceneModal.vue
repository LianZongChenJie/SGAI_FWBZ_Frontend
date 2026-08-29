<template>
  <a-modal
    v-model:open="visible"
    :title="title"
    width="1100px"
    wrapClassName="create-scene-modal"
    :footer="null"
    top="20px"
    :maskClosable="false"
    @cancel="onCancel"
   :class="themeClass">
    <!-- ==================== 表单 + 表格 统一 Loading 容器 ==================== -->
    <div v-loading="tableLoading || submitLoading" class="modal-body-content">
      <!-- ==================== 单一 <a-form> 包裹，使用 <a-row>/<a-col> 栅格布局 ==================== -->
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        class="dark-form"
        :label-col="{ style: { width: '72px' } }"
        :disabled="isDetail || isExecute"
        autocomplete="off"
      >
        <!-- ==================== Tab：场景 / 节目（tab 置于最上方） ==================== -->
        <a-tabs
          v-model:activeKey="activeTab"
          class="create-scene-tabs"
          :class="{ 'scene-only': !showProgramTab }"
          :destroy-inactive-tab-pane="false"
        >
          <!-- ==================== Tab 1：场景 ==================== -->
          <a-tab-pane key="scene" tab="场景">
            <!-- ==================== 搜索项（仅场景 tab 下展示） ==================== -->
            <div class="search-section" v-if="!isDetail">
              <div class="section-title">搜索项</div>
              <!-- 第 1 行：控制类型 / 区域 / 名称 -->
              <a-row :gutter="10">
                <a-col :span="8">
                  <a-form-item label="控制类型" name="relType">
                    <div style="width:100%">
                      <a-select
                        style="width:100%"
                        v-model:value="formData.relType"
                        placeholder="请选择控制类型"
                        :options="relTypeOptions"
                        allowClear
                        @change="handleChangeRelType"
                      />
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="区域">
                    <div style="width:100%">
                      <a-select
                        style="width:100%"
                        v-model:value="filterSpaceName"
                        :options="spaceOptions"
                        placeholder="请选择区域"
                        allowClear
                        show-search
                        :filter-option="handleFilterTagOption"
                        :loading="spaceLoading"
                      />
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label="名称">
                    <div style="width:100%">
                      <a-input
                        style="width:100%"
                        v-model:value="filterAreaName"
                        placeholder="请输入名称"
                        allowClear
                        autocomplete="off"
                      />
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
              <!-- 第 2 行：回路名称 -->
              <a-row :gutter="10">
                <a-col :span="8" v-if="formData.relType === '回路'">
                  <a-form-item label="回路名称">
                    <div style="width:100%">
                      <a-input
                        style="width:100%"
                        v-model:value="filterCircuitName"
                        placeholder="请输入回路名称"
                        allowClear
                        autocomplete="off"
                      />
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :span="formData.relType === '回路' ? 16 : 24"></a-col>
              </a-row>
            </div>

            <!-- ==================== 数据表格 ==================== -->
            <div class="form-section">
              <div class="section-title">数据</div>
              <a-row :gutter="10">
                <a-col :span="24">
                  <div class="table-wrapper">
                    <vxe-table
                      ref="tableRef"
                      :key="formData.relType"
                      :data="filteredTableData"
                      :loading="tableLoading || tableFilterLoading"
                      :row-config="{ keyField: 'id', height: 32 }"
                      :checkbox-config="{ checkField: '_checked' }"
                      max-height="420"
                      border="none"
                      @checkbox-change="onCheckboxChange"
                      @checkbox-all="onCheckboxAll"
                    >
                      <vxe-column type="checkbox" width="45" fixed="left" v-if="!isDetail"></vxe-column>
                      <vxe-column type="seq" title="序号" width="60" fixed="left"></vxe-column>
                      <vxe-column field="districtName" title="区域" min-width="120" show-overflow></vxe-column>
                      <vxe-column field="areaName" title="名称" min-width="140" show-overflow></vxe-column>
                      <vxe-column field="circuitName" title="回路名称" min-width="160" show-overflow v-if="formData.relType === '回路'"></vxe-column>
                      <vxe-column field="electricCurrent" title="电流" min-width="100" v-if="formData.relType === '回路'">
                        <template #default="{ row }">
                          {{ row.electricCurrent != null ? row.electricCurrent : '-' }}
                        </template>
                      </vxe-column>
                    </vxe-table>
                  </div>
                </a-col>
              </a-row>
            </div>

          </a-tab-pane>

          <!-- ==================== Tab 2：节目（独立节目接口数据表格；详情/执行模式下按 programSceneIds 显隐） ==================== -->
          <a-tab-pane key="program" tab="节目" v-if="showProgramTab">
            <div class="form-section">
              <div class="section-title">节目场景</div>
              <a-row :gutter="10">
                <a-col :span="24">
                  <div class="table-wrapper">
                    <vxe-table
                      ref="programTableRef"
                      :data="displayProgramSceneList"
                      :loading="programLoading"
                      :row-config="{ keyField: 'id', height: 32 }"
                      :checkbox-config="{ checkField: '_checked' }"
                      max-height="420"
                      border="none"
                      @checkbox-change="onProgramCheckboxChange"
                      @checkbox-all="onProgramCheckboxAll"
                    >
                      <vxe-column type="checkbox" width="45" fixed="left" v-if="!isDetail"></vxe-column>
                      <vxe-column type="seq" title="序号" width="60" fixed="left"></vxe-column>
                      <vxe-column field="programName" title="节目名称" min-width="180" show-overflow></vxe-column>
                      <vxe-column field="sysOrgCode" title="所属区域" width="90" align="center"></vxe-column>
                      <vxe-column field="updateTime" title="上次操作时间" width="180" align="center" v-if="mode !== 'add'"></vxe-column>
                    </vxe-table>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
        </a-tabs>

        <!-- ==================== 场景信息（公共区域，不随 tab 切换） ==================== -->
        <div class="form-section scene-info">
          <div class="section-title">场景信息</div>
          <a-row :gutter="10">
            <a-col :span="12">
              <a-form-item label="标签" name="tagName">
                <div style="width:100%">
                  <a-select
                    style="width:100%"
                    v-model:value="formData.tagName"
                    placeholder="请选择标签"
                    :options="tagOptions"
                    allowClear
                    :filter-option="handleFilterTagOption"
                    :loading="tagLoading"
                  />
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="场景名称" name="planName">
                <div style="width:100%">
                  <a-input
                    style="width:100%"
                    v-model:value="formData.planName"
                    placeholder="请输入场景名称"
                    allowClear
                    autocomplete="off"
                  />
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </div>

    <!-- ==================== Modal 底部操作按钮 ==================== -->
    <div class="modal-footer" v-if="!isDetail">
      <button class="btn btn-cancel" @click="onCancel">取消</button>
      <button v-if="isExecute" class="btn btn-submit" :class="executeAction === '关闭' ? 'danger' : ''" :loading="submitLoading" @click="onSubmit">{{ executeAction }}</button>
      <button v-else class="btn btn-submit" :loading="submitLoading" @click="onSubmit">确认创建</button>
    </div>
  </a-modal>

  <!-- 统一二次确认弹框（执行模式：展示所选数据后确认） -->
  <ConfirmModal ref="confirmModalRef" />
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, reactive, computed, nextTick, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { getAreaListAll, getCircuitListAll, editLightingPlanAPiNew, addLightingPlanAPiNew, planDetailApiNew, getLightingProgramList, postSceneSwitchApi } from '@/api/equipmentMonitoring'
import { getAllDistrictTag } from '@/api/baseSettingBqZm';
import ConfirmModal from './ConfirmModal.vue';

// 对应src\views\bems\lightingControl\components\TimingControlModal.vue
// ==================== Emits ====================
const emit = defineEmits<{
  success: [];
}>();

// ==================== 状态 ====================
const visible = ref(false);
const submitLoading = ref(false);
const mode = ref<'add' | 'edit' | 'detail' | 'execute'>('add');
// 执行模式动作（开启/关闭）
const executeAction = ref<'开启' | '关闭'>('开启');
const editRecord = ref<any>(null);
const formRef = ref<FormInstance>();
const activeTab = ref<'scene' | 'program'>('scene');
const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null);

const title = computed(() =>
  mode.value === 'add' ? '创建新场景'
  : mode.value === 'edit' ? '编辑场景'
  : mode.value === 'execute' ? `${executeAction.value}场景`
  : '场景详情'
);
const isDetail = computed(() => mode.value === 'detail');
const isExecute = computed(() => mode.value === 'execute');
// 表单数据
const formData = reactive({
  relType: '',
  operationType: '',
  tagName: undefined as string | undefined,
  planName: '',
});

// 表单校验规则
const formRules = {
  relType: [{ required: true, message: '请选择控制类型' }],
  operationType: [{ required: true, message: '请选择操控类型' }],
  tagName: [{ required: true, message: '请选择标签' }],
  planName: [{ required: true, message: '请输入名称' }],
};

// 控制类型下拉选项
const relTypeOptions = ref([
  { label: '回路', value: '回路' },
  { label: '区域', value: '区域' },
]);

// 操控类型下拉选项
const operationTypeOptions = ref([
  { label: '开启', value: '开启' },
  { label: '关闭', value: '关闭' },
]);

// 地块下拉选项（调用 getAllSpace 接口获取）
const spaceOptions = ref<{ label: string; value: string }[]>([]);
const spaceLoading = ref(false);

// 标签下拉选项（优先走 store 缓存）
const tagOptions = ref<{ label: string; value: string, tagId: string}[]>([]);
const tagLoading = ref(false);

// 表格过滤 loading
const tableFilterLoading = ref(false);

// 默认表单值
const defaultForm = {
  relType: '',
  operationType: '',
  tagName: undefined as string | undefined,
  planName: '',
};

// 表格数据
const tableData = ref<any[]>([]);

// vxe-table 实例引用
const tableRef = ref();

// 复选框勾选
const selectedRowKeys = ref<string[]>([]);

// ==================== 节目 tab（独立节目接口数据） ====================
const programSceneList = ref<any[]>([]);
const programLoading = ref(false);
const programTableRef = ref();
const programSelectedKeys = ref<string[]>([]);
// 详情/执行模式：detail 接口返回的 programSceneIds（逗号分隔字符串，解析为数组），驱动节目 tab 显隐
const detailProgramSceneIds = ref<string[]>([]);

/**
 * 节目 tab 展示列表：
 * - 详情/执行模式：仅展示 detail 接口 programSceneIds 关联的节目
 * - 新建/编辑模式：展示全部节目
 */
const displayProgramSceneList = computed(() => {
  if (mode.value === 'detail' || mode.value === 'execute') {
    if (!detailProgramSceneIds.value.length) return [];
    const idSet = new Set(detailProgramSceneIds.value.map(String));
    return programSceneList.value.filter((item) => idSet.has(String(item.id)));
  }
  return programSceneList.value;
});

/**
 * 节目 tab 是否展示：
 * - 详情/执行模式：仅当 detail 接口返回的 programSceneIds 非空时才展示
 * - 新建/编辑模式：始终展示
 */
const showProgramTab = computed(() => {
  if (mode.value === 'detail' || mode.value === 'execute') {
    return detailProgramSceneIds.value.length > 0;
  }
  return true;
});

// 节目 tab 被隐藏时回退到「场景」tab，避免空白页
watch(showProgramTab, (show) => {
  if (!show) activeTab.value = 'scene';
});

// 切到「节目」tab 时同步勾选状态（编辑模式：表格首次挂载后确保 vxe-table 内部 checkbox 状态与 programSelectedKeys 一致）
watch(activeTab, (tab) => {
  if (tab === 'program' && mode.value === 'edit') {
    nextTick(() => {
      checkProgramRowsByIds(programSelectedKeys.value);
    });
  }
});

/** vxe-table 复选框变化（节目 tab，含表头全选/反选）：从节目全量列表汇总 _checked 状态 */
function onProgramCheckboxChange() {
  programSelectedKeys.value = programSceneList.value
    .filter((item: any) => item._checked)
    .map((item: any) => String(item.id));
}

function onProgramCheckboxAll() {
  programSelectedKeys.value = programSceneList.value
    .filter((item: any) => item._checked)
    .map((item: any) => String(item.id));
}

/** 加载节目列表（独立节目接口 /bems/lighting/program/list，所有模式统一加载） */
async function loadProgramSceneList() {
  programLoading.value = true;
  try {
    const data = await getLightingProgramList({ pageNo: 1, pageSize: 999 });
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const records = Array.isArray(data)
      ? data
      : (data?.records || data?.list || data?.result || data?.data || []);
    programSceneList.value = (records as any[]).map((item) => ({
      ...item,
      areaCount: item.relIds ? String(item.relIds).split(',').length : 0,
      // 时间字段兼容：接口可能返回 updateDate / createTime
      updateTime: item.updateTime || item.updateDate || item.createTime || '',
    }));
  } catch (err) {
    console.error('加载节目列表失败：', err);
    programSceneList.value = [];
  } finally {
    programLoading.value = false;
  }
}

/** 根据 programSceneIds 勾选节目行 */
function checkProgramRowsByIds(ids: string[]) {
  if (!ids.length) return;
  const idSet = new Set(ids.map(String));
  programSceneList.value.forEach((item) => (item._checked = idSet.has(String(item.id))));
  const checkedRows = programSceneList.value.filter((item) => idSet.has(String(item.id)));
  if (checkedRows.length) {
    programTableRef.value?.setCheckboxRow(checkedRows, true);
  }
}

// ==================== 本地筛选 ====================
const filterSpaceName = ref<string | undefined>(undefined);
const filterAreaName = ref('');
const filterCircuitName = ref('');
const debouncedAreaName = ref('');
const debouncedCircuitName = ref('');

let areaDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let circuitDebounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(filterAreaName, (val) => {
  tableFilterLoading.value = true;
  if (areaDebounceTimer) clearTimeout(areaDebounceTimer);
  areaDebounceTimer = setTimeout(() => {
    debouncedAreaName.value = val;
    nextTick(() => { tableFilterLoading.value = false; });
  }, 300);
});
watch(filterCircuitName, (val) => {
  tableFilterLoading.value = true;
  if (circuitDebounceTimer) clearTimeout(circuitDebounceTimer);
  circuitDebounceTimer = setTimeout(() => {
    debouncedCircuitName.value = val;
    nextTick(() => { tableFilterLoading.value = false; });
  }, 300);
});

const filteredTableData = computed(() => {
  let data = tableData.value;
  if (filterSpaceName.value) {
    // 下拉 value 为区域标签 id，映射回区域后与表格 districtName 比对
    const option = spaceOptions.value.find((o) => o.value === filterSpaceName.value);
    const targetName = option?.label;
    if (targetName) {
      data = data.filter((item) => item.districtName === targetName);
    }
  }
  if (debouncedAreaName.value) {
    const kw = debouncedAreaName.value.toLowerCase();
    data = data.filter((item) => (item.areaName || '').toLowerCase().includes(kw));
  }
  if (debouncedCircuitName.value) {
    const kw = debouncedCircuitName.value.toLowerCase();
    data = data.filter((item) => (item.circuitName || '').toLowerCase().includes(kw));
  }
  return data;
});

/** 下拉框本地搜索过滤 */
function handleFilterTagOption(input: string, option: any) {
  return (option.label || '').toLowerCase().includes(input.toLowerCase());
}

/** 清空筛选条件 */
function clearFilters() {
  filterSpaceName.value = undefined;
  filterAreaName.value = '';
  filterCircuitName.value = '';
  debouncedAreaName.value = '';
  debouncedCircuitName.value = '';
}

// ==================== 方法 ====================

/** vxe-table 复选框变化（含表头全选/反选）：从全量数据汇总 _checked 行，保证切换筛选条件后跨地块勾选不丢失 */
function onCheckboxChange() {
  selectedRowKeys.value = tableData.value
    .filter((item: any) => item._checked)
    .map((item: any) => String(item.id));
}

function onCheckboxAll() {
  selectedRowKeys.value = tableData.value
    .filter((item: any) => item._checked)
    .map((item: any) => String(item.id));
}

/** 清空所有勾选 */
function clearSelection() {
  selectedRowKeys.value = [];
  tableRef.value?.clearCheckboxRow();
}

/** 取消 */
function onCancel() {
  closeModal();
}

/** 提交（含表单校验） */
async function onSubmit() {
  // 执行模式：不走表单校验，直接二次确认所选内容后调开启/关闭接口
  if (mode.value === 'execute') {
    return submitExecute();
  }
  try {
    await formRef.value!.validate();
    console.log('提交触发---')
    if(submitLoading.value) {
      return;
    }
    submitLoading.value = true;
    // 根据选中的标签value值，查找下拉数组tagOptions对应的tagId，赋值给let tagId到submitData
    const selectedTag = tagOptions.value.find((item) => item.value === formData.tagName);
    const tagId = selectedTag?.tagId || '';
    const submitData = {
      ...formData,
      relIds: Array.from(selectedRowKeys.value).join(','),
      tagId,
      programSceneIds: programSelectedKeys.value.join(','),
      ...(editRecord.value?.id ? { id: editRecord.value.id } : {}),
    };
     // 根据类型调用对应 API
    const api = mode.value === 'add' ? addLightingPlanAPiNew : editLightingPlanAPiNew;
    await api(submitData).then(res => {
      console.log('接口返回');
      console.log('res', res);
      if(!res) {
        message.success(mode.value === 'add' ? '新建场景成功！' : '编辑场景成功！');
        closeModal();
        emit('success');
      }
     
    });
   
  } catch (err: any) {
    // 表单校验失败：自动跳到必填字段所在的「场景」tab，错误提示由 antd 自带
    console.log(err)
    if (err?.errorFields) {
      activeTab.value = 'scene';
      return;
    }
  } finally {
    submitLoading.value = false;
  }
}

/** 执行模式提交：二次确认展示所选数据，确认后调用开启/关闭 API */
async function submitExecute() {
  const action = executeAction.value;
  // 场景与节目均未勾选时提示；支持单独勾选场景或单独勾选节目
  const hasScene = selectedRowKeys.value.length > 0;
  const hasProgram = programSelectedKeys.value.length > 0;
  if (!hasScene && !hasProgram) {
    message.warning('请至少勾选一条数据');
    return;
  }
  // 拼接所选内容用于二次确认展示
  const sceneNames = tableData.value
    .filter((item: any) => selectedRowKeys.value.includes(String(item.id)))
    .map((item: any) => item.areaName || item.circuitName || item.name || String(item.id));
  const programNames = programSceneList.value
    .filter((item: any) => programSelectedKeys.value.includes(String(item.id)))
    .map((item: any) => item.programName || item.planName || item.name || String(item.id));
  let content = `确定要<strong class="tip-action">${action}</strong>以下内容吗？`;
  // 场景信息：仅勾选了场景数据时展示
  if (hasScene) content += `<br/>${formData.relType}：${sceneNames.join('、')}`;
  if (hasProgram) content += `<br/>节目：${programNames.join('、')}`;
  confirmModalRef.value?.showModal({
    content,
    okText: action,
    // 固定 px 宽度：避免受页面 rem 基准影响导致弹框过小，内容较多时可展示更多信息
    width: '640px',
    onOk: async () => {
      try {
        const params: any = {
          operationType: action,
          relType: formData.relType,
          sceneId: editRecord.value?.id,
        };
        // 勾选了场景数据才携带 relIds
        if (hasScene) {
          params.relIds = selectedRowKeys.value.join(',');
        }
        // 勾选了节目才携带 programSceneIds，避免多余参数
        if (hasProgram) {
          params.programSceneIds = programSelectedKeys.value.join(',');
        }
        await postSceneSwitchApi(params);
        message.success(`${action}成功!`);
        closeModal();
        emit('success');
      } catch (err: any) {
        message.error(err?.message || `${action}失败`);
      }
    },
  });
}

/** 加载地块下拉选项 — 调用 getAllDistrictTag 接口（兼容分页结构与纯数组返回） */
async function loadSpaceOptions() {
  try {
    spaceLoading.value = true;
    const res = await getAllDistrictTag();
    const list = Array.isArray(res)
      ? res
      : (res?.records || res?.list || res?.data || res?.result || []);
    spaceOptions.value = list.map((item: any) => ({
      label: item.districtName,
      value: String(item.id),
    }));
  } catch {
    spaceOptions.value = [];
  } finally {
    spaceLoading.value = false;
  }
}

/** 加载标签下拉选项 — 调用 getAllDistrictTag 接口（兼容分页结构与纯数组返回） */
async function loadTagOptions() {
  if (tagOptions.value.length) return;
  try {
    tagLoading.value = true;
    const res = await getAllDistrictTag();
    const list = Array.isArray(res)
      ? res
      : (res?.records || res?.list || res?.data || res?.result || []);
    console.log('获取标签，', list);
    tagOptions.value = [
      { label: '全部区域', value: '全部区域', tagId: '' },
      ...(list as any[]).map((item: any) => ({
        label: item.districtName,
        value: item.districtName,
        tagId: String(item.id),
      })),
    ];
  } finally {
    tagLoading.value = false;
  }
}

/** 根据 relIds 勾选表格行 */
function checkRowsByRelIds(ids: string[]) {
  if (!ids.length) return;
  const idSet = new Set(ids.map(String));
  // 在源数据上标记 _checked（vxe-table checkField 依此渲染勾选态）
  tableData.value.forEach((item) => (item._checked = idSet.has(String(item.id))));
  // 同步 vxe-table 内部状态
  const checkedRows = tableData.value.filter((item) => idSet.has(String(item.id)));
  if (checkedRows.length) {
    tableRef.value?.setCheckboxRow(checkedRows, true);
  }
}

/** 将勾选的行排到列表最前（稳定排序，仅编辑模式打开时调用一次；返回新数组，需重新赋值以触发表格重新渲染） */
function sortCheckedToTop(list: any[]) {
  const checked: any[] = [];
  const unchecked: any[] = [];
  list.forEach((item) => (item._checked ? checked.push(item) : unchecked.push(item)));
  return [...checked, ...unchecked];
}

/** 打开弹框 */
async function showModal(type: 'add' | 'edit' | 'detail' | 'execute', record?: any, action?: '开启' | '关闭') {
  mode.value = type;
  if (type === 'execute') executeAction.value = action || '开启';
  detailProgramSceneIds.value = [];
  formRef.value?.resetFields();
  clearFilters();
  visible.value = true;
  // 预加载地块和标签下拉选项
  loadSpaceOptions();
  loadTagOptions();
  // 预加载节目列表（节目 tab 数据源，所有模式统一加载；详情/执行模式按 detailProgramSceneIds 过滤展示）
  await loadProgramSceneList();
  if (type === 'add') {
    Object.assign(formData, { ...defaultForm });
    selectedRowKeys.value = [];
    programSelectedKeys.value = [];
    editRecord.value = null;
    // 默认区域
    formData.relType = '区域';
    // 表单 + 表格一起进入 loading
    tableLoading.value = true;
    try {
      await loadAreaData(); // 区域
    } finally {
      await nextTick();
      setTimeout(() => {
        tableLoading.value = false;
      }, 200);
    }
  } else if (type === 'edit' && record) {
    editRecord.value = record;
    // 回填表单数据
    formData.relType = record.relType || '';
    formData.planName = record.planName || '';
    formData.tagName = record.tagName || '';
    // relIds 是逗号分隔的字符串，转数组
    const relIdArr = record.relIds ? String(record.relIds).split(',').filter(Boolean) : [];
    selectedRowKeys.value = [...relIdArr];
    // 根据 relType 加载全量数据，再勾选
    tableLoading.value = true;
    try {
      if (record.relType === '回路') {
        await loadCircuitData();
      } else {
        await loadAreaData();
      }
      await nextTick();
      checkRowsByRelIds(relIdArr);
      // 编辑模式：勾选的数据排到最前（赋值新数组，触发表格按新顺序渲染）
      tableData.value = sortCheckedToTop(tableData.value);
    } finally {
      await nextTick();
      setTimeout(() => {
        tableLoading.value = false;
      }, 200);
    }
    // ===== 节目：编辑时默认勾选属于该场景的节目（依据 record.programSceneIds） =====
    const rawProgramIds = record.programSceneIds ?? '';
    const programIdArr = Array.isArray(rawProgramIds)
      ? rawProgramIds.map(String)
      : String(rawProgramIds).split(',').filter(Boolean);
    programSelectedKeys.value = [...programIdArr];
    // 重置所有行勾选状态后，再勾选属于该场景的节目
    programSceneList.value.forEach((item) => (item._checked = false));
    if (programIdArr.length) {
      checkProgramRowsByIds(programIdArr);
    }
    // 编辑模式：勾选的数据排到最前（赋值新数组，触发表格按新顺序渲染）
    programSceneList.value = sortCheckedToTop(programSceneList.value);
  } else if ((type === 'detail' || type === 'execute') && record) {
    console.log('record', record);
    editRecord.value = record;
    formData.relType = record.relType || '';
    formData.operationType = record.operationType || '';
    formData.planName = record.planName || '';
     formData.tagName = record.tagName || '';
    selectedRowKeys.value = record.relIds ? [...record.relIds] : [];
    // 表单 + 表格一起进入 loading
    tableLoading.value = true;
    try {
      await getDetailInit();
      // 执行模式：默认不勾选（清空 record.relIds 预填的选中项，用户自行选择）
      if (type === 'execute') {
        selectedRowKeys.value = [];
        programSelectedKeys.value = [];
        programSceneList.value.forEach((item) => (item._checked = false));
      }
    } finally {
      await nextTick();
      setTimeout(() => {
        tableLoading.value = false;
      }, 200);
    }
  }

  
  // 清除校验残留
  nextTick(() => {
    formRef.value?.clearValidate();
  });
}

/** 关闭弹框 */
function closeModal() {
  visible.value = false;
  formRef.value?.resetFields();
  clearFilters();
}

/** 切换控制类型 */
const handleChangeRelType = async () => {
  // 切换类型时清空筛选和选择（因为数据结构不同）
  clearFilters();
  clearSelection();
  // 表单 + 表格一起进入 loading
  tableLoading.value = true;
  try {
    if (formData.relType === '回路') {
      await loadCircuitData();
    } else {
      await loadAreaData();
    }
  } finally {
    // 接口返回后延迟关闭 loading，确保表格 DOM 渲染完成
    await nextTick();
    setTimeout(() => {
      tableLoading.value = false;
    }, 200);
  }
};

// 加载loading标识
const tableLoading = ref(false);

/** 回路/区域全量数据缓存（弹框内不新增回路/区域，可安全复用；接口数据变更后刷新页面即可） */
const circuitCache = ref<any[] | null>(null);
const areaCache = ref<any[] | null>(null);

/** 获取回路列表数据（优先走缓存，避免每次打开弹框重复请求） */
async function loadCircuitData() {
  if (circuitCache.value) {
    tableData.value = circuitCache.value;
    return;
  }
  try {
    const params = {};
    const data = await getCircuitListAll(params);
    if (data) {
      tableData.value = Array.isArray(data) ? data : [];
      circuitCache.value = tableData.value;
    }
  } catch (err) {
    console.error('Failed to load equipment list:', err);
  }
}

/** 获取区域列表数据（优先走缓存，避免每次打开弹框重复请求） */
async function loadAreaData() {
  if (areaCache.value) {
    tableData.value = areaCache.value;
    return;
  }
  try {
    const params = {};
    const data = await getAreaListAll(params);
    if (data) {
      tableData.value = Array.isArray(data) ? data : [];
      areaCache.value = tableData.value;
    }
  } catch (err) {
    console.error('Failed to load equipment list:', err);
  }
}
// 获取详情
const getDetailInit = async () => {
  try {
    const params = {
      id: editRecord.value.id
    };
    const data = await planDetailApiNew(params);
    console.log('获取数据：', data);
    if (data) {
      // 解析 detail 接口返回的 programSceneIds（兼容字符串逗号分隔 / 数组），驱动节目 tab 显隐
      const rawIds = data.programSceneIds ?? '';
      detailProgramSceneIds.value = Array.isArray(rawIds)
        ? rawIds.map(String)
        : String(rawIds).split(',').filter(Boolean);
      if(editRecord.value.relType === '区域') {
        tableData.value = Array.isArray(data.areaList) ? data.areaList : [];
      } else if(editRecord.value.relType === '回路') {
        tableData.value = Array.isArray(data.circuitList) ? data.circuitList : [];
      }
    }
  } catch (err) {
    console.error('Failed to load equipment list:', err);
  }
}

defineExpose({ showModal, closeModal });
</script>

<style scoped lang="less">
/* ==================== Tab（场景 / 节目）深色科技风 ==================== */
.create-scene-tabs {
  margin-bottom: 4px;

  /* 仅剩「场景」tab 时隐藏 tab 导航栏，直接展示内容 */
  &.scene-only {
    :deep(.ant-tabs-nav) {
      display: none;
    }

    :deep(.ant-tabs-content-holder) {
      border: none;
    }
  }

  :deep(.ant-tabs-nav) {
    margin-bottom: 12px;
    width: 100%;

    &::before {
      border-bottom: 1px solid rgba(0, 212, 255, 0.15);
    }
  }

  /* tab 导航占满整行，两个 tab 平分 */
  :deep(.ant-tabs-nav-list) {
    width: 100%;
    display: flex;
  }

  :deep(.ant-tabs-tab) {
    flex: 1;
    margin: 0;
    padding: 8px 0;
    justify-content: center;
    color: #7fa6d4;
    font-size: 13px;
    letter-spacing: 0.5px;
    transition: all 0.2s;

    &:hover {
      color: #00d4ff;
    }
  }

  /* 文字水平居中 */
  :deep(.ant-tabs-tab-btn) {
    display: block;
    width: 100%;
    text-align: center;
  }

  :deep(.ant-tabs-tab.ant-tabs-tab-active) {
    background: linear-gradient(180deg, rgba(0, 212, 255, 0.25), rgba(0, 212, 255, 0.06));
    box-shadow:
      inset 0 1.5px 0 rgba(0, 212, 255, 0.9),
      inset 1px 0 0 rgba(0, 212, 255, 0.3),
      inset -1px 0 0 rgba(0, 212, 255, 0.3);
    border-radius: 6px 6px 0 0;
  }

  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: #00eaff !important;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(0, 234, 255, 0.6);
  }

  :deep(.ant-tabs-ink-bar) {
    background: linear-gradient(90deg, #00d4ff, #00ffd1) !important;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
    border-radius: 2px;
  }
}

/* ==================== Grid 统一布局：每行3列 ==================== */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px 24px;
  margin-bottom: 20px;

  /* form-item 在 grid 内不产生额外 margin */
  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  /* form-item 内的控件铺满 */
  :deep(.ant-form-item .ant-select),
  :deep(.ant-form-item .ant-input-affix-wrapper) {
    width: 100%;
  }
}

/* 筛选单元格 */
.filter-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  white-space: nowrap;
  flex-shrink: 0;
  color: #8ba9d4;
  font-size: 13px;
}

.filter-cell :deep(.ant-select),
.filter-cell :deep(.ant-input-affix-wrapper) {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
}

.filter-cell :deep(.ant-select-selector) {
  background: #0d243c !important;
  border: 1px solid #2a4a6c !important;
}

.filter-cell :deep(.ant-input-affix-wrapper) {
  background: #0d243c !important;
  border: 1px solid #2a4a6c !important;
}

/* 操作按钮单元格：固定在最后一列、右对齐 */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  grid-column: 3;
}

/* ==================== 搜索项分组（高亮蓝 / 高饱和蓝） ==================== */
.search-section {
  margin-bottom: 8px;
  padding: 10px 14px 12px;
  /* 原型图：搜索项区域为更高亮、更高饱和度的蓝，与下方深蓝形成对比 */
  background: linear-gradient(180deg, #205385 0%, #1b4876 100%);
  border: 1px solid #4a7aaf;
  border-radius: 6px;
  box-shadow:
    inset 0 0 28px rgba(0, 212, 255, 0.08),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(0, 212, 255, 0.06),
    0 4px 14px rgba(0, 30, 60, 0.4);

  :deep(.section-title) {
    margin-bottom: 6px;
    color: #b3e5ff !important;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1.2px;
    position: relative;
    padding-left: 12px;
    text-transform: uppercase;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 13px;
      background: linear-gradient(180deg, #ffffff 0%, #00d4ff 100%);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.8);
    }

    /* 标题后增加装饰横线（科技感） */
    &::after {
      content: '';
      flex: 1;
      margin-left: 10px;
      height: 1px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(0, 212, 255, 0.15) 50%, transparent 100%);
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 12px;
    width: 100% !important;
  }
  :deep(.ant-form-item-row) {
    width: 100% !important;
  }
  :deep(.ant-form-item-control) {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  :deep(.ant-form-item-control-input) {
    width: 100% !important;
  }
  :deep(.ant-form-item-control-input-content) {
    width: 100% !important;
  }

  /* 深色主题 - select（高亮蓝区域内：稍深的输入框背景以区分容器） */
  :deep(.ant-select-selector) {
    background: #0f2c4f !important;
    border: 1px solid #3d6fa3 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-select-selector:hover) {
    border-color: #00d4ff !important;
    box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.25);
  }
  :deep(.ant-select-focused .ant-select-selector) {
    border-color: #00d4ff !important;
    box-shadow:
      0 0 0 2px rgba(0, 212, 255, 0.3),
      0 0 10px rgba(0, 212, 255, 0.25) !important;
  }
  :deep(.ant-select-selection-item),
  :deep(.ant-select-selection-placeholder) {
    font-size: 12px !important;
  }
  :deep(.ant-select-selection-item) { color: #ffffff !important; }
  :deep(.ant-select-selection-placeholder) { color: #7a96b5 !important; font-size: 12px !important; }
  :deep(.ant-select-arrow) {
    color: #7a96b5 !important;
    position: absolute !important;
    right: 8px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
    line-height: 1 !important;
    height: auto !important;
  }
  :deep(.ant-select-arrow svg),
  :deep(.ant-select-arrow i) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  :deep(.ant-select-clear) {
    background: #0f2c4f !important;
  }

  /* 深色主题 - input */
  :deep(.ant-input-affix-wrapper) {
    background: #0f2c4f !important;
    border: 1px solid #3d6fa3 !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-input-affix-wrapper:hover) {
    border-color: #00d4ff !important;
    box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.25);
  }
  :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused) {
    border-color: #00d4ff !important;
    box-shadow:
      0 0 0 2px rgba(0, 212, 255, 0.3),
      0 0 10px rgba(0, 212, 255, 0.25) !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input) {
    background: transparent !important;
    border: none !important;
    color: #ffffff !important;
    font-size: 12px !important;
    height: 30px !important;
    line-height: 30px !important;
    padding: 0 !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input::placeholder) {
    color: #7a96b5 !important;
  }
  :deep(.ant-input-affix-wrapper .ant-input-clear-icon) {
    height: auto !important;
    line-height: 1 !important;
    font-size: 12px !important;
    color: #7a96b5 !important;
  }

  /* 表单label */
  :deep(.ant-form-item-label > label) {
    color: #c9e0f5 !important;
    font-size: 12px !important;
    height: 28px !important;
  }
  :deep(.ant-form-item-required::before) {
    color: #ff7875 !important;
    display: inline-block !important;
    margin-right: 4px !important;
  }
}

/* ==================== 表单分组（表格区/场景信息区） ==================== */
.form-section {
  position: relative;
  margin-bottom: 8px;
  padding: 10px 14px 12px;
  background: rgba(6, 22, 42, 0.55);
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-left: 3px solid rgba(0, 212, 255, 0.35);
  border-radius: 6px;
  box-shadow:
    inset 0 0 24px rgba(0, 162, 232, 0.05),
    0 0 0 1px rgba(0, 162, 232, 0.04);

  :deep(.section-title) {
    margin-bottom: 8px;
    color: #6ecfef;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1.2px;
    position: relative;
    padding-left: 12px;
    text-transform: uppercase;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 13px;
      background: linear-gradient(180deg, #00d4ff 0%, #00a2e8 100%);
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(0, 212, 255, 0.6);
    }

    /* 标题后装饰线 */
    &::after {
      content: '';
      flex: 1;
      margin-left: 10px;
      height: 1px;
      background: linear-gradient(90deg, rgba(0, 212, 255, 0.25) 0%, transparent 100%);
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 12px;
    width: 100% !important;
  }
  :deep(.ant-form-item-row) {
    width: 100% !important;
  }
  :deep(.ant-form-item-control) {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  :deep(.ant-form-item-control-input) {
    width: 100% !important;
  }
  :deep(.ant-form-item-control-input-content) {
    width: 100% !important;
  }

  /* 深色主题 - select */
  :deep(.ant-select-selector) {
    background: #0d243c !important;
    border: 1px solid #2a4a6c !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-select-selector:hover) {
    border-color: #00a2e8 !important;
    box-shadow: 0 0 0 1px rgba(0, 162, 232, 0.15);
  }
  :deep(.ant-select-focused .ant-select-selector) {
    border-color: #00d4ff !important;
    box-shadow:
      0 0 0 2px rgba(0, 162, 232, 0.25),
      0 0 8px rgba(0, 162, 232, 0.2) !important;
  }
  :deep(.ant-select-selection-item),
  :deep(.ant-select-selection-placeholder) {
    font-size: 12px !important;
  }
  :deep(.ant-select-selection-item) { color: #ffffff !important; }
  :deep(.ant-select-selection-placeholder) { color: #5a6a80 !important; font-size: 12px !important; }
  :deep(.ant-select-arrow) {
    color: #5a6a80 !important;
    position: absolute !important;
    right: 8px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
    line-height: 1 !important;
    height: auto !important;
  }
  :deep(.ant-select-arrow svg),
  :deep(.ant-select-arrow i) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  :deep(.ant-select-clear) {
    background: #0d243c !important;
    color: #5a6a80 !important;
  }

  /* 深色主题 - input */
  :deep(.ant-input-affix-wrapper) {
    background: #0d243c !important;
    border: 1px solid #2a4a6c !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-input-affix-wrapper:hover) {
    border-color: #00a2e8 !important;
    box-shadow: 0 0 0 1px rgba(0, 162, 232, 0.15);
  }
  :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused) {
    border-color: #00d4ff !important;
    box-shadow:
      0 0 0 2px rgba(0, 162, 232, 0.25),
      0 0 8px rgba(0, 162, 232, 0.2) !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input) {
    background: transparent !important;
    border: none !important;
    color: #ffffff !important;
    font-size: 12px !important;
    height: 30px !important;
    line-height: 30px !important;
    padding: 0 !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input::placeholder) {
    color: #5a6a80 !important;
  }
  :deep(.ant-input-affix-wrapper .ant-input-clear-icon) {
    height: auto !important;
    line-height: 1 !important;
    font-size: 12px !important;
    color: #5a6a80 !important;
  }

  /* 表单label - 不加装饰点，避免与必填*重叠；保留必填*（红色，标准规范） */
  :deep(.ant-form-item-label > label) {
    color: #b0c0d6 !important;
    font-size: 12px !important;
    height: 28px !important;
  }
  :deep(.ant-form-item-required::before) {
    color: #ff4d4f !important;
    display: inline-block !important;
    margin-right: 4px !important;
  }
}

/* ==================== 场景信息 section —— 复用搜索项高亮蓝样式 ==================== */
.form-section.scene-info {
  background: linear-gradient(180deg, #205385 0%, #1b4876 100%);
  border: 1px solid #4a7aaf;
  box-shadow:
    inset 0 0 28px rgba(0, 212, 255, 0.08),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(0, 212, 255, 0.06),
    0 4px 14px rgba(0, 30, 60, 0.4);

  :deep(.section-title) {
    color: #b3e5ff !important;
  }

  :deep(.section-title::before) {
    background: linear-gradient(180deg, #ffffff 0%, #00d4ff 100%) !important;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.8) !important;
  }

  :deep(.section-title::after) {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(0, 212, 255, 0.15) 50%, transparent 100%) !important;
  }

  :deep(.ant-select-focused .ant-select-selector),
  :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused) {
    border-color: #00d4ff !important;
    box-shadow:
      0 0 0 2px rgba(0, 212, 255, 0.25),
      0 0 8px rgba(0, 212, 255, 0.2) !important;
  }

  :deep(.ant-select-selector:hover),
  :deep(.ant-input-affix-wrapper:hover) {
    border-color: #00d4ff !important;
    box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.2) !important;
  }
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 6px 6px;
}

.btn {
  height: 32px;
  padding: 0 18px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  color: #7fa6d4;
  border: 1px solid rgba(0, 212, 255, 0.25);

  &:hover {
    border-color: #00d4ff;
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.06);
  }
}

.btn-submit {
  background: linear-gradient(135deg, #00d4ff, #0088cc);
  color: #061224;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
  }
}

/* 执行模式关闭按钮（红色警示） */
.btn-submit.danger {
  background: linear-gradient(135deg, #ff4d4f, #d9363e);
  color: #ffffff;

  &:hover {
    box-shadow: 0 0 12px rgba(255, 77, 79, 0.3);
  }
}

/* ==================== 表格区域 —— vxe-table 深色主题 ==================== */
.table-wrapper {
  overflow: hidden;
  margin-bottom: 4px;
  background: rgba(8, 23, 40, 0.65);
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 4px;
  box-shadow: inset 0 0 16px rgba(0, 212, 255, 0.04);
}

.table-wrapper :deep(.vxe-table) {
  background: transparent;
  color: #ffffff;
  border: 0;
  outline: 0;
  box-shadow: none;

  --vxe-ui-table-border-color: #1f2b3d;
  --vxe-ui-table-border-width: 0;
  --vxe-ui-table-checkbox-range-border-color: #00d4ff;
  --vxe-ui-table-cell-area-border-color: #00d4ff;
  --vxe-ui-table-cell-main-area-extension-border-color: #00d4ff;
  --vxe-ui-table-cell-extend-area-border-color: #00d4ff;
  --vxe-ui-table-cell-copy-area-border-color: #00d4ff;
  --vxe-ui-table-fixed-right-scrolling-box-shadow: none;
  --vxe-ui-table-fixed-left-scrolling-box-shadow: none;
  --vxe-ui-layout-background-color: transparent;
  --vxe-ui-table-header-background-color: #1b2533;
  --vxe-ui-table-footer-background-color: #141d2b;
  --vxe-ui-table-row-hover-background-color: rgba(0, 212, 255, 0.06);
  --vxe-ui-table-row-striped-background-color: transparent;
  --vxe-ui-table-row-current-background-color: rgba(0, 162, 232, 0.18);
  --vxe-ui-table-row-hover-current-background-color: rgba(0, 162, 232, 0.22);

  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

/* 表头：加底部青光描边 + 列首左侧装饰 */
.table-wrapper :deep(.vxe-table .vxe-header--wrapper),
.table-wrapper :deep(.vxe-header--row) {
  background: linear-gradient(180deg, #1f2b3d 0%, #1b2533 100%) !important;
}

.table-wrapper :deep(.vxe-table .vxe-header--wrapper) {
  position: relative;
  border-bottom: 1px solid #2a3a52;
  box-shadow: 0 1px 0 0 rgba(0, 212, 255, 0.1);
}

.table-wrapper :deep(.vxe-table .vxe-header--column) {
  font-weight: 500 !important;
  font-size: 12px !important;
  color: #8fa3bf !important;
  letter-spacing: 0.3px;
}

/* 表体行：hover 青色高亮 + 左侧条 */
.table-wrapper :deep(.vxe-table .vxe-body--row) {
  transition: background 0.2s;
  position: relative;
}

.table-wrapper :deep(.vxe-table .vxe-body--row:hover) {
  background: rgba(0, 212, 255, 0.06) !important;
  box-shadow: inset 2px 0 0 0 rgba(0, 212, 255, 0.6);
}

.table-wrapper :deep(.vxe-table .vxe-body--row.row--checked) {
  background: rgba(0, 162, 232, 0.18) !important;
  box-shadow: inset 2px 0 0 0 #00d4ff;
}

/* 行内单元格字号、行高紧凑 */
.table-wrapper :deep(.vxe-table .vxe-body--column) {
  font-size: 12px !important;
  color: #d6e0ee !important;
}

/* 复选框主题 */
.table-wrapper :deep(.vxe-table .vxe-checkbox--icon) {
  border-color: #4a5a70 !important;
  background: #1b2533 !important;
}
.table-wrapper :deep(.vxe-table .vxe-checkbox--checked .vxe-checkbox--icon) {
  background: #00a2e8 !important;
  border-color: #00d4ff !important;
  box-shadow: 0 0 6px rgba(0, 162, 232, 0.5);
}

/* 自定义滚动条 */
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-track,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-track,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-track {
  background: transparent;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb:hover,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb:hover,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 表头行：去掉右边线 */
.table-wrapper :deep(.vxe-header--row),
.table-wrapper :deep(.vxe-header--row .vxe-header--column),
.table-wrapper :deep(.vxe-header--row .vxe-header--column:last-child),
.table-wrapper :deep(.vxe-header--row .col--fixed-right) {
  border-right: 0 !important;
  background-image: none !important;
}

/* Gutter 列：去掉所有边界线、背景色 */
.table-wrapper :deep(.vxe-table--header-wrapper .vxe-header--row .vxe-header--gutter),
.table-wrapper :deep(.vxe-table--body-wrapper .vxe-body--row .vxe-body--gutter),
.table-wrapper :deep(.vxe-header--gutter),
.table-wrapper :deep(.vxe-body--gutter),
.table-wrapper :deep(.col--gutter) {
  border: 0 !important;
  background-image: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}
</style>

/* ==================== 全局 Modal 覆盖（深色科技风） ==================== */
<style lang="less">
.create-scene-modal {
  .ant-modal {
    top: 10px !important;
  }
}

/* ==================== create-scene-modal 弹框样式（科技感强化 v2） ==================== */
/* 设计决策:
   ① 背景对比: #0f2845 / #143358 蓝,与项目背景 #020817 形成明度落差
   ② 渐变描边 + 三层 box-shadow 发光,模拟 LED 灯条
   ③ 四角 L 型装饰: 工业仪表盘风格
   ④ 信息卡 accent 左边条
   ⑤ 状态徽章: 青绿色软徽章 */
body .create-scene-modal {
  /* 遮罩层 */
  background: rgba(2, 8, 23, 0.78) !important;
  backdrop-filter: blur(2px);

  .ant-modal {
    overflow: visible !important;
  }

  /* ---- 弹框主体 ---- */
  .ant-modal-content {
    position: relative;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow:
      0 0 0 1px rgba(0, 212, 255, 0.45),
      0 0 24px rgba(0, 212, 255, 0.25),
      0 0 60px rgba(0, 212, 255, 0.10),
      0 12px 40px rgba(0, 0, 0, 0.7) !important;
    overflow: visible !important;
  }

  /* 渐变描边(关键发光边框) */
  .ant-modal-content::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(0, 212, 255, 0.95) 0%,
      rgba(0, 212, 255, 0.25) 35%,
      rgba(77, 159, 255, 0.55) 65%,
      rgba(0, 255, 209, 0.85) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  /* 四角 L 型装饰 */
  .ant-modal-content::after {
    content: "";
    position: absolute;
    inset: -4px;
    pointer-events: none;
    z-index: 2;
    background:
      /* TL */ linear-gradient(#00d4ff, #00d4ff) top left / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) top left / 2px 18px no-repeat,
      /* TR */ linear-gradient(#00d4ff, #00d4ff) top right / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) top right / 2px 18px no-repeat,
      /* BL */ linear-gradient(#00d4ff, #00d4ff) bottom left / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) bottom left / 2px 18px no-repeat,
      /* BR */ linear-gradient(#00d4ff, #00d4ff) bottom right / 18px 2px no-repeat,
                linear-gradient(#00d4ff, #00d4ff) bottom right / 2px 18px no-repeat;
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.35));
  }

  /* ---- 头部 ---- */
  .ant-modal-header {
    padding: 18px 24px !important;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.08) 0%, transparent 100%) !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.20) !important;
    border-radius: 6px 6px 0 0 !important;
  }

  /* 标题前小竖条(科技标识) */
  .ant-modal-title {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    color: #e6f4ff !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    letter-spacing: 1px !important;
  }

  .ant-modal-title::before {
    content: "";
    display: block;
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #00d4ff, #00ffd1);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.35);
    border-radius: 1px;
    flex-shrink: 0;
  }

  /* ---- 关闭按钮(科技感, hover 旋转 90°) ---- */
  .ant-modal-close {
    width: 28px !important;
    height: 28px !important;
    border-radius: 4px !important;
    background: rgba(0, 212, 255, 0.04) !important;
    border: 1px solid rgba(0, 212, 255, 0.15) !important;
    transition: all 0.25s !important;
    top: 14px !important;
    right: 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    &:hover {
      background: rgba(0, 212, 255, 0.12) !important;
      border-color: #00d4ff !important;
      transform: rotate(90deg);
    }
  }

  .ant-modal-close-x {
    color: #7fa6d4 !important;
    line-height: 28px !important;
  }

  /* ---- 内容区 ---- */
  .ant-modal-body {
    padding: 24px !important;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    color: #c9dfff;
  }

  /* ---- 底部 ---- */
  .ant-modal-footer {
    display: none !important;
  }
}



  /* ==================== 表单覆盖 ==================== */
  .dark-form {
    margin-bottom: 10px;

    /* Row 撑满表单宽度 */
    .ant-row {
      width: 100%;
    }

    /* Form item 撑满列宽 */
    .ant-form-item {
      width: 100% !important;
      margin-right: 0;
      margin-bottom: 12px !important;
    }

    .ant-form-item-row {
      width: 100% !important;
    }

    /* 控件区域 flex 撑满 */
    .ant-form-item-control {
      flex: 1 1 0 !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .ant-form-item-control-input {
      width: 100% !important;
    }

    .ant-form-item-control-input-content {
      width: 100% !important;
    }

    /* 控件自身铺满（强制 block-level） */
    .ant-input-affix-wrapper,
    .ant-select {
      width: 100% !important;
      max-width: 100% !important;
      flex: 1 1 auto !important;
    }

    /* input 是原生元素，用 block 不用 flex */
    .ant-input {
      width: 100% !important;
      max-width: 100% !important;
    }

    .ant-form-item-label > label {
      color: #8fa3bf !important;
      font-size: 12px !important;
      font-weight: 400 !important;
    }

    .ant-form-item-label > label.ant-form-item-required::before {
      color: #ff4d4f !important;
    }

    /* Input 外层包裹器（统一高度 32px，强制锁定，不受 size="small" 与全局样式污染影响） */
    .ant-input-affix-wrapper {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      padding: 0 11px !important;
      box-sizing: border-box !important;

      &:hover {
        border-color: #00a2e8 !important;
      }

      &.ant-input-affix-wrapper-focused {
        border-color: #00a2e8 !important;
        box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      /* 内部 input 透明，让 wrapper 背景统一显示 */
      .ant-input {
        background: transparent !important;
        border: none !important;
        color: #ffffff !important;
        font-size: 12px !important;
        height: 30px !important;
        line-height: 30px !important;
        padding: 0 !important;

        &::placeholder {
          color: #5a6a80 !important;
        }
      }

      .ant-input-clear-icon {
        color: #5a6a80 !important;
        background: transparent !important;

        &:hover {
          color: #a0aabf !important;
        }
      }
    }

    /* 无 allowClear 时的普通 input */
    .ant-input:not(.ant-input-affix-wrapper .ant-input) {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      transition: all 0.2s !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      padding: 0 11px !important;
      line-height: 30px !important;
      box-sizing: border-box !important;

      &:hover {
        border-color: #00a2e8 !important;
      }

      &:focus,
      &.ant-input-focused {
        border-color: #00a2e8 !important;
        box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
      }

      &::placeholder {
        color: #5a6a80 !important;
      }
    }

    /* Select */
    .ant-select-selector {
      background: #1b2533 !important;
      border: 1px solid #303d50 !important;
      color: #ffffff !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      padding: 0 11px !important;
      box-sizing: border-box !important;

      &:hover {
        border-color: #00a2e8 !important;
      }
    }

    .ant-select-focused .ant-select-selector {
      border-color: #00a2e8 !important;
      box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }

    .ant-select-arrow {
      color: #5a6a80 !important;
      position: absolute !important;
      right: 8px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      margin-top: 0 !important;
      line-height: 1 !important;
      height: auto !important;
    }

    .ant-select-arrow svg,
    .ant-select-arrow i {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .ant-select-clear {
      color: #5a6a80 !important;
      background: #1b2533 !important;

      &:hover {
        color: #a0aabf !important;
      }
    }

    .ant-select-selection-placeholder {
      color: #5a6a80 !important;
    }

    /* 单选 / 多选 选中文字统一高亮（仅文字色，无背景） */
    .ant-select-selection-item {
      color: #00c6ff !important;
      font-size: 12px !important;
    }

    /* 多选 Tag 专属样式（背景+边框，仅多选模式） */
    .ant-select-multiple .ant-select-selection-item {
      background: rgba(0, 162, 232, 0.12) !important;
      border: 1px solid rgba(0, 162, 232, 0.25) !important;
      color: #00c6ff !important;
      border-radius: 3px !important;
      font-size: 12px !important;

      .ant-select-selection-item-content {
        color: #00c6ff !important;
      }

      .ant-select-selection-item-remove {
        color: #00a2e8 !important;

        &:hover {
          color: #ffffff !important;
        }
      }
    }

    /* 校验 */
    .ant-form-item-explain-error {
      font-size: 12px !important;
      color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-select-selector {
      border-color: #ff4d4f !important;
    }
  }

/* ==================== 筛选单元格（Grid 内非表单控件）深色主题 ==================== */
.create-scene-modal .layout-grid .filter-cell {
  .ant-input-affix-wrapper {
    background: #1b2533 !important;
    border: 1px solid #303d50 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    transition: all 0.2s !important;
    display: flex !important;
    align-items: center !important;

    &:hover {
      border-color: #00a2e8 !important;
    }

    &.ant-input-affix-wrapper-focused {
      border-color: #00a2e8 !important;
      box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }

    .ant-input {
      background: transparent !important;
      border: none !important;
      color: #ffffff !important;
      font-size: 12px !important;

      &::placeholder {
        color: #5a6a80 !important;
      }
    }

    .ant-input-clear-icon {
      color: #5a6a80 !important;
      background: transparent !important;

      &:hover {
        color: #a0aabf !important;
      }
    }
  }

  /* 无 allowClear 时的普通 input（直接渲染的 input.ant-input） */
  .ant-input:not(.ant-input-affix-wrapper .ant-input) {
    background: #1b2533 !important;
    border: 1px solid #303d50 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    transition: all 0.2s !important;

    &:hover {
      border-color: #00a2e8 !important;
    }

    &:focus,
    &.ant-input-focused {
      border-color: #00a2e8 !important;
      box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }

    &::placeholder {
      color: #5a6a80 !important;
    }
  }

  .ant-select-selector {
    background: #1b2533 !important;
    border: 1px solid #303d50 !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    transition: all 0.2s !important;
    display: flex !important;
    align-items: center !important;

    &:hover {
      border-color: #00a2e8 !important;
    }
  }

  .ant-select-focused .ant-select-selector {
    border-color: #00a2e8 !important;
    box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  }

  .ant-select-arrow {
    color: #5a6a80 !important;
  }

  .ant-select-clear {
    color: #5a6a80 !important;
    background: #1b2533 !important;

    &:hover {
      color: #a0aabf !important;
    }
  }

  .ant-select-selection-placeholder {
    color: #5a6a80 !important;
  }
}

/* ==================== Disabled 状态深色覆盖（扁平非嵌套，最高优先级） ==================== */
body .create-scene-modal {
  .ant-input-affix-wrapper-disabled,
  .ant-input-affix-wrapper-disabled .ant-input,
  .ant-input-disabled,
  .ant-input[disabled] {
    background: #1b2533 !important;
    color: #ffffff !important;
    border-color: #303d50 !important;
    -webkit-text-fill-color: #ffffff !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
  }

  .ant-select-disabled .ant-select-selector {
    background: #1b2533 !important;
    color: #ffffff !important;
    border-color: #303d50 !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
  }

  .ant-select-disabled .ant-select-selection-item,
  .ant-select-disabled .ant-select-selection-placeholder {
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
    opacity: 1 !important;
  }
}

/* ==================== Select 下拉面板（全局深色） ==================== */
.ant-select-dropdown {
  background: #1b2533 !important;
  border: 1px solid #303d50 !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;

  .ant-select-item {
    color: #c0c8d4 !important;
    font-size: 12px !important;
    min-height: 28px !important;
    line-height: 28px !important;
    transition: background 0.15s !important;

    &:hover {
      background: rgba(0, 162, 232, 0.1) !important;
    }
  }

  .ant-select-item-option-selected {
    background: rgba(0, 162, 232, 0.15) !important;
    color: #00c6ff !important;
    font-weight: 500 !important;
  }

  .ant-select-item-option-active {
    background: rgba(255, 255, 255, 0.04) !important;
  }

  .ant-select-item-empty {
    color: #5a6a80 !important;
  }
}

/* ==================== 终极保险：表单控件高度锁定 ==================== */
/* 问题：组件卸载/重挂时 scoped data-v-xxx 选择器与 .dark-form 类可能存在瞬时不匹配，*/
/* 导致切几次页面后下拉框与输入框高度不一致。*/
/* 解法：用 body 前缀提升特异性到 (0,4,0)，并绕过 .dark-form 直接定位到所有控件。*/
/* 由于本块位于全局样式末尾，源序优先，叠加 !important + body 前缀确保永远生效。*/
body .create-scene-modal .ant-input-affix-wrapper,
body .create-scene-modal .ant-input-affix-wrapper-sm,
body .create-scene-modal .ant-input-affix-wrapper-lg {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  line-height: 32px !important;
  padding: 0 11px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
}

body .create-scene-modal .ant-input-affix-wrapper > input.ant-input,
body .create-scene-modal .ant-input-affix-wrapper > input.ant-input-sm,
body .create-scene-modal .ant-input-affix-wrapper > input.ant-input-lg {
  height: 30px !important;
  min-height: 30px !important;
  max-height: 30px !important;
  line-height: 30px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  background: transparent !important;
  font-size: 12px !important;
}

body .create-scene-modal .ant-input:not(.ant-input-affix-wrapper .ant-input):not(.ant-input-group .ant-input),
body .create-scene-modal input.ant-input.ant-input-sm,
body .create-scene-modal input.ant-input.ant-input-lg {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  line-height: 32px !important;
  padding: 0 11px !important;
  box-sizing: border-box !important;
  font-size: 12px !important;
}

body .create-scene-modal .ant-select .ant-select-selector,
body .create-scene-modal .ant-select .ant-select-selector.ant-select-selector-sm,
body .create-scene-modal .ant-select .ant-select-selector.ant-select-selector-lg {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  line-height: 32px !important;
  padding: 0 11px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
}

body .create-scene-modal .ant-select {
  height: 32px !important;
  line-height: 32px !important;
}

body .create-scene-modal .ant-select .ant-select-selection-item,
body .create-scene-modal .ant-select .ant-select-selection-placeholder {
  line-height: 30px !important;
  font-size: 12px !important;
}

body .create-scene-modal .ant-input-number,
body .create-scene-modal .ant-input-number-input {
  height: 32px !important;
  line-height: 32px !important;
}

/* 防止第一列 a-col 因为 align-items 默认 stretch 导致高度不一致 */
body .create-scene-modal .ant-row {
  align-items: flex-start !important;
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white /* ==================== Tab（场景 / 节目）浅色主题 ==================== */
.create-scene-tabs {
  margin-bottom: 4px;

  /* 仅剩「场景」tab 时隐藏 tab 导航栏，直接展示内容 */
  &.scene-only  {
    :deep(.ant-tabs-nav)  {
      display: none;
    }

    :deep(.ant-tabs-content-holder)  {
      border: none;
    }}

  :deep(.ant-tabs-nav)  {
    margin-bottom: 12px;
    width: 100%;

    &::before  {
      border-bottom: 1px solid rgba(24, 144, 255, 0.15);
    }}

  /* tab 导航占满整行，两个 tab 平分 */
  :deep(.ant-tabs-nav-list)  {
    width: 100%;
    display: flex;
  }

  :deep(.ant-tabs-tab)  {
    flex: 1;
    margin: 0;
    padding: 8px 0;
    justify-content: center;
    color: #606266;
    font-size: 13px;
    letter-spacing: 0.5px;
    transition: all 0.2s;

    &:hover  {
      color: #1890ff;
    }}

  /* 文字水平居中 */
  :deep(.ant-tabs-tab-btn)  {
    display: block;
    width: 100%;
    text-align: center;
  }

  :deep(.ant-tabs-tab.ant-tabs-tab-active)  {
    background: linear-gradient(180deg, rgba(24, 144, 255, 0.12), rgba(24, 144, 255, 0.04));
    box-shadow:
      inset 0 1.5px 0 rgba(24, 144, 255, 0.8),
      inset 1px 0 0 rgba(24, 144, 255, 0.2),
      inset -1px 0 0 rgba(24, 144, 255, 0.2);
    border-radius: 6px 6px 0 0;
  }

  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn)  {
    color: #1890ff !important;
    font-weight: 700;
  }

  :deep(.ant-tabs-ink-bar)  {
    background: #1890ff !important;
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.4);
    border-radius: 2px;
  }}.theme-white /* ==================== Grid 统一布局：每行3列 ==================== */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px 24px;
  margin-bottom: 20px;

  /* form-item 在 grid 内不产生额外 margin */
  :deep(.ant-form-item)  {
    margin-bottom: 0;
  }

  /* form-item 内的控件铺满 */
  :deep(.ant-form-item .ant-select),
  :deep(.ant-form-item .ant-input-affix-wrapper)  {
    width: 100%;
  }}.theme-white /* 筛选单元格 */
.filter-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}.theme-white .filter-label {
  white-space: nowrap;
  flex-shrink: 0;
  color: #606266;
  font-size: 13px;
}.theme-white .filter-cell :deep(.ant-select),
.theme-white .filter-cell :deep(.ant-input-affix-wrapper) {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
}.theme-white .filter-cell :deep(.ant-select-selector) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
}.theme-white .filter-cell :deep(.ant-input-affix-wrapper) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
}.theme-white /* 操作按钮单元格：固定在最后一列、右对齐 */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  grid-column: 3;
}.theme-white /* ==================== 搜索项分组（淡蓝底，与白色模态区分） ==================== */
.search-section {
  margin-bottom: 8px;
  padding: 10px 14px 12px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
    0 4px 14px rgba(0, 0, 0, 0.06);

  :deep(.section-title)  {
    margin-bottom: 6px;
    color: #303133 !important;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1.2px;
    position: relative;
    padding-left: 12px;
    text-transform: uppercase;
    display: flex;
    align-items: center;

    &::before  {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 13px;
      background: linear-gradient(180deg, #1890ff 0%, #40a9ff 100%);
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(24, 144, 255, 0.4);
    }

    /* 标题后增加装饰横线（科技感） */
    &::after  {
      content: '';
      flex: 1;
      margin-left: 10px;
      height: 1px;
      background: linear-gradient(90deg, rgba(24, 144, 255, 0.25) 0%, rgba(24, 144, 255, 0.08) 50%, transparent 100%);
    }}

  :deep(.ant-form-item)  {
    margin-bottom: 12px;
    width: 100% !important;
  }
  :deep(.ant-form-item-row)  {
    width: 100% !important;
  }
  :deep(.ant-form-item-control)  {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  :deep(.ant-form-item-control-input)  {
    width: 100% !important;
  }
  :deep(.ant-form-item-control-input-content)  {
    width: 100% !important;
  }

  /* 浅色主题 - select（淡蓝底区域内：白色输入框背景以区分容器） */
  :deep(.ant-select-selector)  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    color: #303133 !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-select-selector:hover)  {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.25);
  }
  :deep(.ant-select-focused .ant-select-selector)  {
    border-color: #1890ff !important;
    box-shadow:
      0 0 0 2px rgba(24, 144, 255, 0.15),
      0 0 8px rgba(24, 144, 255, 0.12) !important;
  }
  :deep(.ant-select-selection-item),
  :deep(.ant-select-selection-placeholder)  {
    font-size: 12px !important;
  }
  :deep(.ant-select-selection-item)  { color: #303133 !important; }
  :deep(.ant-select-selection-placeholder)  { color: #909399 !important; font-size: 12px !important; }
  :deep(.ant-select-arrow)  {
    color: #909399 !important;
    position: absolute !important;
    right: 8px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
    line-height: 1 !important;
    height: auto !important;
  }
  :deep(.ant-select-arrow svg),
  :deep(.ant-select-arrow i)  {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  :deep(.ant-select-clear)  {
    background: #ffffff !important;
  }

  /* 浅色主题 - input */
  :deep(.ant-input-affix-wrapper)  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-input-affix-wrapper:hover)  {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.25);
  }
  :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused)  {
    border-color: #1890ff !important;
    box-shadow:
      0 0 0 2px rgba(24, 144, 255, 0.15),
      0 0 8px rgba(24, 144, 255, 0.12) !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input)  {
    background: transparent !important;
    border: none !important;
    color: #303133 !important;
    font-size: 12px !important;
    height: 30px !important;
    line-height: 30px !important;
    padding: 0 !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input::placeholder)  {
    color: #909399 !important;
  }
  :deep(.ant-input-affix-wrapper .ant-input-clear-icon)  {
    height: auto !important;
    line-height: 1 !important;
    font-size: 12px !important;
    color: #909399 !important;
  }

  /* 表单label */
  :deep(.ant-form-item-label > label)  {
    color: #606266 !important;
    font-size: 12px !important;
    height: 28px !important;
  }
  :deep(.ant-form-item-required::before)  {
    color: #ff7875 !important;
    display: inline-block !important;
    margin-right: 4px !important;
  }}.theme-white /* ==================== 表单分组（表格区/场景信息区） ==================== */
.form-section {
  position: relative;
  margin-bottom: 8px;
  padding: 10px 14px 12px;
  background: #fafbfc;
  border: 1px solid #e4e7ed;
  border-left: 3px solid rgba(24, 144, 255, 0.45);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  :deep(.section-title)  {
    margin-bottom: 8px;
    color: #1890ff;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1.2px;
    position: relative;
    padding-left: 12px;
    text-transform: uppercase;
    display: flex;
    align-items: center;

    &::before  {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 13px;
      background: linear-gradient(180deg, #1890ff 0%, #40a9ff 100%);
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(24, 144, 255, 0.3);
    }

    /* 标题后装饰线 */
    &::after  {
      content: '';
      flex: 1;
      margin-left: 10px;
      height: 1px;
      background: linear-gradient(90deg, rgba(24, 144, 255, 0.2) 0%, transparent 100%);
    }}

  :deep(.ant-form-item)  {
    margin-bottom: 12px;
    width: 100% !important;
  }
  :deep(.ant-form-item-row)  {
    width: 100% !important;
  }
  :deep(.ant-form-item-control)  {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  :deep(.ant-form-item-control-input)  {
    width: 100% !important;
  }
  :deep(.ant-form-item-control-input-content)  {
    width: 100% !important;
  }

  /* 浅色主题 - select */
  :deep(.ant-select-selector)  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    color: #303133 !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-select-selector:hover)  {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.15);
  }
  :deep(.ant-select-focused .ant-select-selector)  {
    border-color: #1890ff !important;
    box-shadow:
      0 0 0 2px rgba(24, 144, 255, 0.15),
      0 0 8px rgba(24, 144, 255, 0.1) !important;
  }
  :deep(.ant-select-selection-item),
  :deep(.ant-select-selection-placeholder)  {
    font-size: 12px !important;
  }
  :deep(.ant-select-selection-item)  { color: #303133 !important; }
  :deep(.ant-select-selection-placeholder)  { color: #909399 !important; font-size: 12px !important; }
  :deep(.ant-select-arrow)  {
    color: #909399 !important;
    position: absolute !important;
    right: 8px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
    line-height: 1 !important;
    height: auto !important;
  }
  :deep(.ant-select-arrow svg),
  :deep(.ant-select-arrow i)  {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  :deep(.ant-select-clear)  {
    background: #ffffff !important;
    color: #909399 !important;
  }

  /* 浅色主题 - input */
  :deep(.ant-input-affix-wrapper)  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 11px !important;
    box-sizing: border-box !important;
    transition: all 0.2s !important;
  }
  :deep(.ant-input-affix-wrapper:hover)  {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.15);
  }
  :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused)  {
    border-color: #1890ff !important;
    box-shadow:
      0 0 0 2px rgba(24, 144, 255, 0.15),
      0 0 8px rgba(24, 144, 255, 0.1) !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input)  {
    background: transparent !important;
    border: none !important;
    color: #303133 !important;
    font-size: 12px !important;
    height: 30px !important;
    line-height: 30px !important;
    padding: 0 !important;
  }
  :deep(.ant-input-affix-wrapper > input.ant-input::placeholder)  {
    color: #909399 !important;
  }
  :deep(.ant-input-affix-wrapper .ant-input-clear-icon)  {
    height: auto !important;
    line-height: 1 !important;
    font-size: 12px !important;
    color: #909399 !important;
  }

  /* 表单label - 不加装饰点，避免与必填*重叠；保留必填*（红色，标准规范） */
  :deep(.ant-form-item-label > label)  {
    color: #606266 !important;
    font-size: 12px !important;
    height: 28px !important;
  }
  :deep(.ant-form-item-required::before)  {
    color: #ff4d4f !important;
    display: inline-block !important;
    margin-right: 4px !important;
  }}.theme-white /* ==================== 场景信息 section —— 复用搜索项高亮蓝样式 ==================== */
.form-section.scene-info {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
    0 4px 14px rgba(0, 0, 0, 0.06);

  :deep(.section-title)  {
    color: #1890ff !important;
  }

  :deep(.section-title::before)  {
    background: linear-gradient(180deg, #1890ff 0%, #40a9ff 100%) !important;
    box-shadow: 0 0 6px rgba(24, 144, 255, 0.4) !important;
  }

  :deep(.section-title::after)  {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.25) 0%, rgba(24, 144, 255, 0.08) 50%, transparent 100%) !important;
  }

  :deep(.ant-select-focused .ant-select-selector),
  :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused)  {
    border-color: #1890ff !important;
    box-shadow:
      0 0 0 2px rgba(24, 144, 255, 0.15),
      0 0 8px rgba(24, 144, 255, 0.12) !important;
  }

  :deep(.ant-select-selector:hover),
  :deep(.ant-input-affix-wrapper:hover)  {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.2) !important;
  }}.theme-white .modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px solid #e4e7ed;
  background: #fafbfc;
  border-radius: 0 0 6px 6px;
}.theme-white .btn {
  height: 32px;
  padding: 0 18px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}.theme-white .btn-cancel {
  background: #ffffff;
  color: #606266;
  border: 1px solid #dcdfe6;

  &:hover  {
    border-color: #1890ff;
    color: #1890ff;
    background: rgba(24, 144, 255, 0.06);
  }}.theme-white .btn-submit {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: #ffffff;
  font-weight: 600;

  &:hover  {
    opacity: 0.9;
    box-shadow: 0 0 12px rgba(24, 144, 255, 0.3);
  }}.theme-white /* 执行模式关闭按钮（红色警示） */
.btn-submit.danger {
  background: linear-gradient(135deg, #ff4d4f, #d9363e);
  color: #ffffff;

  &:hover  {
    box-shadow: 0 0 12px rgba(255, 77, 79, 0.3);
  }}.theme-white /* ==================== 表格区域 —— vxe-table 浅色主题 ==================== */
.table-wrapper {
  overflow: hidden;
  margin-bottom: 4px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}.theme-white .table-wrapper :deep(.vxe-table) {
  background: transparent;
  color: #303133;
  border: 0;
  outline: 0;
  box-shadow: none;

  --vxe-ui-table-border-color: #e4e7ed;
  --vxe-ui-table-border-width: 0;
  --vxe-ui-table-checkbox-range-border-color: #1890ff;
  --vxe-ui-table-cell-area-border-color: #1890ff;
  --vxe-ui-table-cell-main-area-extension-border-color: #1890ff;
  --vxe-ui-table-cell-extend-area-border-color: #1890ff;
  --vxe-ui-table-cell-copy-area-border-color: #1890ff;
  --vxe-ui-table-fixed-right-scrolling-box-shadow: none;
  --vxe-ui-table-fixed-left-scrolling-box-shadow: none;
  --vxe-ui-layout-background-color: transparent;
  --vxe-ui-table-header-background-color: #f5f7fa;
  --vxe-ui-table-footer-background-color: #fafbfc;
  --vxe-ui-table-row-hover-background-color: rgba(0, 0, 0, 0.04);
  --vxe-ui-table-row-striped-background-color: transparent;
  --vxe-ui-table-row-current-background-color: rgba(24, 144, 255, 0.1);
  --vxe-ui-table-row-hover-current-background-color: rgba(24, 144, 255, 0.12);

  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}.theme-white /* 表头：加底部蓝描边 + 列首左侧装饰 */
.table-wrapper :deep(.vxe-table .vxe-header--wrapper),
.theme-white .table-wrapper :deep(.vxe-header--row) {
  background: #f5f7fa !important;
}.theme-white .table-wrapper :deep(.vxe-table .vxe-header--wrapper) {
  position: relative;
  border-bottom: 1px solid #e4e7ed;
}.theme-white .table-wrapper :deep(.vxe-table .vxe-header--column) {
  font-weight: 500 !important;
  font-size: 12px !important;
  color: #606266 !important;
  letter-spacing: 0.3px;
}.theme-white /* 表体行：hover 蓝色高亮 + 左侧条 */
.table-wrapper :deep(.vxe-table .vxe-body--row) {
  transition: background 0.2s;
  position: relative;
}.theme-white .table-wrapper :deep(.vxe-table .vxe-body--row:hover) {
  background: rgba(0, 0, 0, 0.04) !important;
  box-shadow: inset 2px 0 0 0 rgba(24, 144, 255, 0.6);
}.theme-white .table-wrapper :deep(.vxe-table .vxe-body--row.row--checked) {
  background: rgba(24, 144, 255, 0.1) !important;
  box-shadow: inset 2px 0 0 0 #1890ff;
}.theme-white /* 行内单元格字号、行高紧凑 */
.table-wrapper :deep(.vxe-table .vxe-body--column) {
  font-size: 12px !important;
  color: #303133 !important;
}.theme-white /* 复选框主题 */
.table-wrapper :deep(.vxe-table .vxe-checkbox--icon) {
  border-color: #dcdfe6 !important;
  background: #ffffff !important;
}.theme-white .table-wrapper :deep(.vxe-table .vxe-checkbox--checked .vxe-checkbox--icon) {
  background: #1890ff !important;
  border-color: #1890ff !important;
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.3);
}.theme-white /* 自定义滚动条 */
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-track,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-track,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-track {
  background: transparent;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb:hover,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb:hover,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white /* 表头行：去掉右边线 */
.table-wrapper :deep(.vxe-header--row),
.theme-white .table-wrapper :deep(.vxe-header--row .vxe-header--column),
.theme-white .table-wrapper :deep(.vxe-header--row .vxe-header--column:last-child),
.theme-white .table-wrapper :deep(.vxe-header--row .col--fixed-right) {
  border-right: 0 !important;
  background-image: none !important;
}.theme-white /* Gutter 列：去掉所有边界线、背景色 */
.table-wrapper :deep(.vxe-table--header-wrapper .vxe-header--row .vxe-header--gutter),
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper .vxe-body--row .vxe-body--gutter),
.theme-white .table-wrapper :deep(.vxe-header--gutter),
.theme-white .table-wrapper :deep(.vxe-body--gutter),
.theme-white .table-wrapper :deep(.col--gutter) {
  border: 0 !important;
  background-image: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}
</style>

<style lang="less">
.theme-white .create-scene-modal {
  .ant-modal  {
    top: 10px !important;
  }}body.theme-white .create-scene-modal {
  /* ==================== create-scene-modal 弹框样式（白色主题） ==================== */
  /* 遮罩层 */
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);

  .ant-modal  {
    overflow: visible !important;
  }

  /* ---- 弹框主体 ---- */
  .ant-modal-content  {
    position: relative;
    background: #ffffff !important;
    border-radius: 6px !important;
    border: 1px solid #e4e7ed !important;
    box-shadow:
      0 6px 24px rgba(0, 0, 0, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.08) !important;
    overflow: visible !important;
  }

  /* 渐变描边(关键发光边框) */
  .ant-modal-content::before  {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(24, 144, 255, 0.6) 0%,
      rgba(24, 144, 255, 0.2) 35%,
      rgba(64, 169, 255, 0.4) 65%,
      rgba(24, 144, 255, 0.55) 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  /* 四角 L 型装饰 */
  .ant-modal-content::after  {
    content: "";
    position: absolute;
    inset: -4px;
    pointer-events: none;
    z-index: 2;
    background:
      /* TL */ linear-gradient(#1890ff, #1890ff) top left / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) top left / 2px 18px no-repeat,
      /* TR */ linear-gradient(#1890ff, #1890ff) top right / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) top right / 2px 18px no-repeat,
      /* BL */ linear-gradient(#1890ff, #1890ff) bottom left / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) bottom left / 2px 18px no-repeat,
      /* BR */ linear-gradient(#1890ff, #1890ff) bottom right / 18px 2px no-repeat,
                linear-gradient(#1890ff, #1890ff) bottom right / 2px 18px no-repeat;
  }

  /* ---- 头部 ---- */
  .ant-modal-header  {
    padding: 18px 24px !important;
    background: #fafbfc !important;
    border-bottom: 1px solid #e4e7ed !important;
    border-radius: 6px 6px 0 0 !important;
  }

  /* 标题前小竖条(品牌标识) */
  .ant-modal-title  {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    color: #303133 !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    letter-spacing: 1px !important;
  }

  .ant-modal-title::before  {
    content: "";
    display: block;
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #1890ff, #40a9ff);
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
    border-radius: 1px;
    flex-shrink: 0;
  }

  /* ---- 关闭按钮 ---- */
  .ant-modal-close  {
    width: 28px !important;
    height: 28px !important;
    border-radius: 4px !important;
    background: rgba(24, 144, 255, 0.04) !important;
    border: 1px solid rgba(24, 144, 255, 0.15) !important;
    transition: all 0.25s !important;
    top: 14px !important;
    right: 16px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    &:hover  {
      background: rgba(24, 144, 255, 0.1) !important;
      border-color: #1890ff !important;
      transform: rotate(90deg);
    }}

  .ant-modal-close-x  {
    color: #909399 !important;
    line-height: 28px !important;
  }

  /* ---- 内容区 ---- */
  .ant-modal-body  {
    padding: 24px !important;
    background: #ffffff !important;
    color: #303133;
  }

  /* ---- 底部 ---- */
  .ant-modal-footer  {
    display: none !important;
  }}.theme-white /* ==================== 表单覆盖 ==================== */
  .dark-form {
    margin-bottom: 10px;

    /* Row 撑满表单宽度 */
    .ant-row  {
      width: 100%;
    }

    /* Form item 撑满列宽 */
    .ant-form-item  {
      width: 100% !important;
      margin-right: 0;
      margin-bottom: 12px !important;
    }

    .ant-form-item-row  {
      width: 100% !important;
    }

    /* 控件区域 flex 撑满 */
    .ant-form-item-control  {
      flex: 1 1 0 !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .ant-form-item-control-input  {
      width: 100% !important;
    }

    .ant-form-item-control-input-content  {
      width: 100% !important;
    }

    /* 控件自身铺满（强制 block-level） */
    .ant-input-affix-wrapper,
    .ant-select  {
      width: 100% !important;
      max-width: 100% !important;
      flex: 1 1 auto !important;
    }

    /* input 是原生元素，用 block 不用 flex */
    .ant-input  {
      width: 100% !important;
      max-width: 100% !important;
    }

    .ant-form-item-label > label  {
      color: #606266 !important;
      font-size: 12px !important;
      font-weight: 400 !important;
    }

    .ant-form-item-label > label.ant-form-item-required::before  {
      color: #ff4d4f !important;
    }

    /* Input 外层包裹器（统一高度 32px，强制锁定，不受 size="small" 与全局样式污染影响） */
    .ant-input-affix-wrapper  {
      background: #ffffff !important;
      border: 1px solid #dcdfe6 !important;
      color: #303133 !important;
      border-radius: 4px !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      padding: 0 11px !important;
      box-sizing: border-box !important;

      &:hover  {
        border-color: #1890ff !important;
      }

      &.ant-input-affix-wrapper-focused  {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), 0 0 8px rgba(24, 144, 255, 0.12) !important;
      }

      /* 内部 input 透明，让 wrapper 背景统一显示 */
      .ant-input  {
        background: transparent !important;
        border: none !important;
        color: #303133 !important;
        font-size: 12px !important;
        height: 30px !important;
        line-height: 30px !important;
        padding: 0 !important;

        &::placeholder  {
          color: #909399 !important;
        }}

      .ant-input-clear-icon  {
        color: #909399 !important;
        background: transparent !important;

        &:hover  {
          color: #606266 !important;
        }}}

    /* 无 allowClear 时的普通 input */
    .ant-input:not(.ant-input-affix-wrapper .ant-input)  {
      background: #ffffff !important;
      border: 1px solid #dcdfe6 !important;
      color: #303133 !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      transition: all 0.2s !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      padding: 0 11px !important;
      line-height: 30px !important;
      box-sizing: border-box !important;

      &:hover  {
        border-color: #1890ff !important;
      }

      &:focus,
      &.ant-input-focused  {
        border-color: #1890ff !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), 0 0 8px rgba(24, 144, 255, 0.12) !important;
      }

      &::placeholder  {
        color: #909399 !important;
      }}

    /* Select */
    .ant-select-selector  {
      background: #ffffff !important;
      border: 1px solid #dcdfe6 !important;
      color: #303133 !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      transition: all 0.2s !important;
      display: flex !important;
      align-items: center !important;
      height: 32px !important;
      min-height: 32px !important;
      max-height: 32px !important;
      padding: 0 11px !important;
      box-sizing: border-box !important;

      &:hover  {
        border-color: #1890ff !important;
      }}

    .ant-select-focused .ant-select-selector  {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), 0 0 8px rgba(24, 144, 255, 0.12) !important;
    }

    .ant-select-arrow  {
      color: #909399 !important;
      position: absolute !important;
      right: 8px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      margin-top: 0 !important;
      line-height: 1 !important;
      height: auto !important;
    }

    .ant-select-arrow svg,
    .ant-select-arrow i  {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .ant-select-clear  {
      color: #909399 !important;
      background: #ffffff !important;

      &:hover  {
        color: #606266 !important;
      }}

    .ant-select-selection-placeholder  {
      color: #909399 !important;
    }

    /* 单选 / 多选 选中文字统一高亮（仅文字色，无背景） */
    .ant-select-selection-item  {
      color: #1890ff !important;
      font-size: 12px !important;
    }

    /* 多选 Tag 专属样式（背景+边框，仅多选模式） */
    .ant-select-multiple .ant-select-selection-item  {
      background: rgba(24, 144, 255, 0.08) !important;
      border: 1px solid rgba(24, 144, 255, 0.2) !important;
      color: #1890ff !important;
      border-radius: 3px !important;
      font-size: 12px !important;

      .ant-select-selection-item-content  {
        color: #1890ff !important;
      }

      .ant-select-selection-item-remove  {
        color: #1890ff !important;

        &:hover  {
          color: #096dd9 !important;
        }}}

    /* 校验 */
    .ant-form-item-explain-error  {
      font-size: 12px !important;
      color: #ff4d4f !important;
    }

    .ant-form-item-has-error .ant-input,
    .ant-form-item-has-error .ant-select-selector  {
      border-color: #ff4d4f !important;
    }}.theme-white /* ==================== 筛选单元格（Grid 内非表单控件）浅色主题 ==================== */
.create-scene-modal .layout-grid .filter-cell {
  .ant-input-affix-wrapper  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    color: #303133 !important;
    border-radius: 4px !important;
    transition: all 0.2s !important;
    display: flex !important;
    align-items: center !important;

    &:hover  {
      border-color: #1890ff !important;
    }

    &.ant-input-affix-wrapper-focused  {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), 0 0 8px rgba(24, 144, 255, 0.12) !important;
    }

    .ant-input  {
      background: transparent !important;
      border: none !important;
      color: #303133 !important;
      font-size: 12px !important;

      &::placeholder  {
        color: #909399 !important;
      }}

    .ant-input-clear-icon  {
      color: #909399 !important;
      background: transparent !important;

      &:hover  {
        color: #606266 !important;
      }}}

  /* 无 allowClear 时的普通 input（直接渲染的 input.ant-input） */
  .ant-input:not(.ant-input-affix-wrapper .ant-input)  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    color: #303133 !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    transition: all 0.2s !important;

    &:hover  {
      border-color: #1890ff !important;
    }

    &:focus,
    &.ant-input-focused  {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), 0 0 8px rgba(24, 144, 255, 0.12) !important;
    }

    &::placeholder  {
      color: #909399 !important;
    }}

  .ant-select-selector  {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    color: #303133 !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    transition: all 0.2s !important;
    display: flex !important;
    align-items: center !important;

    &:hover  {
      border-color: #1890ff !important;
    }}

  .ant-select-focused .ant-select-selector  {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), 0 0 8px rgba(24, 144, 255, 0.12) !important;
  }

  .ant-select-arrow  {
    color: #909399 !important;
  }

  .ant-select-clear  {
    color: #909399 !important;
    background: #ffffff !important;

    &:hover  {
      color: #606266 !important;
    }}

  .ant-select-selection-placeholder  {
    color: #909399 !important;
  }}body.theme-white /* ==================== Disabled 状态浅色覆盖（扁平非嵌套，最高优先级） ==================== */
.create-scene-modal {
  .ant-input-affix-wrapper-disabled,
  .ant-input-affix-wrapper-disabled .ant-input,
  .ant-input-disabled,
  .ant-input[disabled]  {
    background: #f5f5f5 !important;
    color: #c0c4cc !important;
    border-color: #e4e7ed !important;
    -webkit-text-fill-color: #c0c4cc !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
  }

  .ant-select-disabled .ant-select-selector  {
    background: #f5f5f5 !important;
    color: #c0c4cc !important;
    border-color: #e4e7ed !important;
    opacity: 1 !important;
    cursor: not-allowed !important;
  }

  .ant-select-disabled .ant-select-selection-item,
  .ant-select-disabled .ant-select-selection-placeholder  {
    color: #c0c4cc !important;
    -webkit-text-fill-color: #c0c4cc !important;
    opacity: 1 !important;
  }}.theme-white /* ==================== Select 下拉面板（全局浅色） ==================== */
.ant-select-dropdown {
  background: #ffffff !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;

  .ant-select-item  {
    color: #303133 !important;
    font-size: 12px !important;
    min-height: 28px !important;
    line-height: 28px !important;
    transition: background 0.15s !important;

    &:hover  {
      background: rgba(24, 144, 255, 0.08) !important;
    }}

  .ant-select-item-option-selected  {
    background: rgba(24, 144, 255, 0.1) !important;
    color: #1890ff !important;
    font-weight: 500 !important;
  }

  .ant-select-item-option-active  {
    background: rgba(0, 0, 0, 0.04) !important;
  }

  .ant-select-item-empty  {
    color: #909399 !important;
  }}.theme-white /* ==================== 终极保险：表单控件高度锁定 ==================== */
/* 问题：组件卸载/重挂时 scoped data-v-xxx 选择器与 .dark-form 类可能存在瞬时不匹配，*/
/* 导致切几次页面后下拉框与输入框高度不一致。*/
/* 解法：用 body 前缀提升特异性到 (0,
.theme-white 4,
.theme-white 0)，并绕过 .dark-form 直接定位到所有控件。*/
/* 由于本块位于全局样式末尾，源序优先，叠加 !important + body 前缀确保永远生效。*/
body .create-scene-modal .ant-input-affix-wrapper,
body.theme-white .create-scene-modal .ant-input-affix-wrapper-sm,
body.theme-white .create-scene-modal .ant-input-affix-wrapper-lg {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  line-height: 32px !important;
  padding: 0 11px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
}body.theme-white .create-scene-modal .ant-input-affix-wrapper > input.ant-input,
body.theme-white .create-scene-modal .ant-input-affix-wrapper > input.ant-input-sm,
body.theme-white .create-scene-modal .ant-input-affix-wrapper > input.ant-input-lg {
  height: 30px !important;
  min-height: 30px !important;
  max-height: 30px !important;
  line-height: 30px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  background: transparent !important;
  font-size: 12px !important;
}body.theme-white .create-scene-modal .ant-input:not(.ant-input-affix-wrapper .ant-input):not(.ant-input-group .ant-input),
body.theme-white .create-scene-modal input.ant-input.ant-input-sm,
body.theme-white .create-scene-modal input.ant-input.ant-input-lg {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  line-height: 32px !important;
  padding: 0 11px !important;
  box-sizing: border-box !important;
  font-size: 12px !important;
}body.theme-white .create-scene-modal .ant-select .ant-select-selector,
body.theme-white .create-scene-modal .ant-select .ant-select-selector.ant-select-selector-sm,
body.theme-white .create-scene-modal .ant-select .ant-select-selector.ant-select-selector-lg {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  line-height: 32px !important;
  padding: 0 11px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
}body.theme-white .create-scene-modal .ant-select {
  height: 32px !important;
  line-height: 32px !important;
}body.theme-white .create-scene-modal .ant-select .ant-select-selection-item,
body.theme-white .create-scene-modal .ant-select .ant-select-selection-placeholder {
  line-height: 30px !important;
  font-size: 12px !important;
}body.theme-white .create-scene-modal .ant-input-number,
body.theme-white .create-scene-modal .ant-input-number-input {
  height: 32px !important;
  line-height: 32px !important;
}body.theme-white /* 防止第一列 a-col 因为 align-items 默认 stretch 导致高度不一致 */
.create-scene-modal .ant-row {
  align-items: flex-start !important;
}
</style>
