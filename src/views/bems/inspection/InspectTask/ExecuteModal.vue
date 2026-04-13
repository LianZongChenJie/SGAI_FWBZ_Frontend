<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="执行巡检任务" @ok="handleSubmit" :width="1000">
    <div v-loading="loading">
      <!-- 基本信息部分 -->
      <Description @register="registerDesc" :data="repairForm" :column="2" />

      <div style="margin-top: 16px">
        <!-- 巡检规则部分 -->
        <div class="dialog-scrollbar-main">
          <h2 class="info-title">巡检规则</h2>
          <a-table
            v-if="data && data.length"
            :data-source="data"
            :columns="ruleColumns"
            :pagination="false"
            bordered
            size="small"
            row-key="id"
          />
          <a-empty v-else description="暂无巡检规则" />
        </div>

        <!-- 巡检作业内容部分 -->
        <div class="dialog-scrollbar-main">
          <h2 class="info-title">巡检作业内容</h2>
          <a-collapse v-model:active-key="activeNames" v-if="subGroup && typeof subGroup === 'object' && Object.keys(subGroup).length">
            <a-collapse-panel v-for="(item, index) in subGroup" :key="index" :header="index">
              <a-collapse v-model:active-key="activeNamess">
                <a-collapse-panel v-for="(items, subIndex) in item" :key="subIndex" :header="subIndex" style="padding: 0 0 0 20px">
                  <a-table
                    v-if="items && Array.isArray(items) && items.length"
                    :data-source="items"
                    :columns="contentColumns"
                    :pagination="false"
                    bordered
                    size="small"
                    row-key="id"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'answer'">
                        <a-radio-group v-if="record.type === '判断'" v-model:value="record.answer" @change="(e) => handleInspeResul(record.id, e.target.value)">
                          <a-radio v-for="(item, idx) in [record.trueMark, record.falseMark]" :key="idx" :value="item">{{ item }}</a-radio>
                        </a-radio-group>
                        <a-input v-else-if="record.type === '文本'" v-model:value="record.answer" @change="(e) => handleInspeResul(record.id, e.target.value)" type="textarea" placeholder="请输入文本" :rows="1" />
                        <a-select v-else-if="record.type === '选择'" v-model:value="record.answer" @change="(value) => handleInspeResul(record.id, value)" placeholder="请选择">
                          <a-option v-for="(item, idx) in record.choice" :key="idx" :value="item">{{ item }}</a-option>
                        </a-select>
                        <a-input v-else-if="record.type === '数字'" v-model:value="record.answer" @change="(e) => handleInspeResul(record.id, e.target.value)" type="number" placeholder="请输入数字" />
                      </template>
                    </template>
                  </a-table>
                  <a-empty v-else description="暂无数据" />
                </a-collapse-panel>
              </a-collapse>
            </a-collapse-panel>
          </a-collapse>
          <a-empty v-else description="暂无巡检作业内容" />
        </div>

        <!-- 巡检结果 -->
      <div class="dialog-scrollbar-main">
        <h2 class="info-title">巡检结果</h2>
        <div style="margin-top: 8px">
          <div style="display: flex; align-items: flex-start; margin-bottom: 12px">
            <label style="width: 80px; font-weight: 500">巡检结果：</label>
            <a-select v-model:value="ruleForm.result" placeholder="请选择巡检结果" style="flex: 1">
              <a-option value="正常">正常</a-option>
              <a-option value="异常">异常</a-option>
            </a-select>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 12px">
            <label style="width: 80px; font-weight: 500">说明：</label>
            <a-input type="textarea" v-model:value="ruleForm.description" style="flex: 1" />
          </div>
        </div>
        <h2 class="info-title" style="margin-top: 16px">总结</h2>
        <div style="margin-top: 8px">
          <div style="display: flex; align-items: flex-start">
            <label style="width: 80px; font-weight: 500">总结：</label>
            <a-input type="textarea" v-model:value="ruleForm.summary" style="flex: 1" />
          </div>
        </div>
      </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Description, useDescription } from '/@/components/Description';
  import { message } from 'ant-design-vue';
  import { getInspectTaskDetail } from './InspectTask.api';

  export default defineComponent({
    name: 'ExecuteModal',
    components: { BasicModal, Description },
    setup(_, { emit }) {
      const subGroup = ref<Recordable>({});
      const activeNames = ref<string[]>([]);
      const activeNamess = ref<string[]>([]);
      const loading = ref(false);
      const repairForm = ref<Recordable>({});
      const data = ref<any[]>([]);
      const ruleForm = ref<Recordable>({});

      const [registerDesc] = useDescription({
        schema: [
          { field: 'taskNo', label: '工单编号' },
          { field: 'name', label: '巡检任务名称' },
          { field: 'groupName', label: '执行组别' },
          { field: 'spaceName', label: '执行位置' },
          {
            field: 'start',
            label: '开始时间',
            customRender: ({ value }) => (value ? formatTime(value) : '--'),
          },
          {
            field: 'end',
            label: '结束时间',
            customRender: ({ value }) => (value ? formatTime(value) : '--'),
          },
          { field: 'state', label: '执行状态' },
        ],
      });

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        setModalProps({ confirmLoading: false });
        loading.value = true;
        try {
          if (data.record && data.record.id) {
            await loadDetail(data.record.id);
          }
        } finally {
          loading.value = false;
        }
      });

      async function loadDetail(taskId: string) {
        try {
          const res = await getInspectTaskDetail({ taskId });
          const resultData =res?.records || res?.data || res || {};
          
          // 处理基本信息
          repairForm.value = resultData || {};
          if (resultData.start && resultData.end) {
            repairForm.value.executionTime = [resultData.start, resultData.end];
          }
          
          // 处理巡检规则
          data.value = resultData?.ruleList || [];
          
          // 处理巡检结果
          ruleForm.value = {
            result: resultData?.result || '',
            description: resultData?.description || '',
            summary: resultData?.summary || ''
          };
          
          // 处理巡检作业内容
          subGroup.value = resultData?.subGroup || {};
          
          // 处理选择类型的巡检项
          for (const key1 in subGroup.value) {
            for (const key2 in subGroup.value[key1]) {
              for (let i = 0; i < subGroup.value[key1][key2].length; i++) {
                if (subGroup.value[key1][key2][i].type === '选择' && typeof subGroup.value[key1][key2][i].choice === 'string') {
                  subGroup.value[key1][key2][i].choice = subGroup.value[key1][key2][i].choice.split(',');
                }
              }
            }
          }
          
          // 展开所有折叠面板
          activeNames.value = [];
          activeNamess.value = [];
          if (subGroup.value && typeof subGroup.value === 'object') {
            Object.entries(subGroup.value).forEach(([k, v]: [string, any]) => {
              if (v && typeof v === 'object') {
                activeNames.value.push(k);
                Object.keys(v).forEach((kk) => {
                  activeNamess.value.push(kk);
                });
              }
            });
          }
        } catch (error) {
          console.error('加载详情失败:', error);
          subGroup.value = {};
          activeNames.value = [];
          activeNamess.value = [];
        }
      }

      // 处理巡检项执行结果
      function handleInspeResul(id: string, val: any) {
        for (const key1 in subGroup.value) {
          for (const key2 in subGroup.value[key1]) {
            for (let i = 0; i < subGroup.value[key1][key2].length; i++) {
              if (subGroup.value[key1][key2][i].id === id) {
                subGroup.value[key1][key2][i].answer = val;
              }
            }
          }
        }
      }

      // 巡检规则列
      const ruleColumns = [
        { title: '任务编号', dataIndex: 'ruleNo', align: 'center', ellipsis: true },
        { title: '规则名称', dataIndex: 'name', align: 'center' },
        { title: '巡检对象', dataIndex: 'inspectObject', align: 'center', ellipsis: true },
        { title: '规则类型', dataIndex: 'type', align: 'center', ellipsis: true },
        { title: '建议工作天数', dataIndex: 'recommendedDays', align: 'center' },
      ];

      // 巡检作业内容列
      const contentColumns = [
        { title: '巡检项', dataIndex: 'name', align: 'center', ellipsis: true },
        { title: '巡检内容', dataIndex: 'content', align: 'center' },
        { title: '执行结果', dataIndex: 'answer', key: 'answer', align: 'center' },
        { title: '执行时间', dataIndex: 'executeTime', align: 'center' },
      ];

      async function handleSubmit() {
        try {
          // 处理巡检作业内容数据
          let taskSubjectList: any[] = [];
          let obj = JSON.parse(JSON.stringify(subGroup.value));
          
          for (const key1 in obj) {
            for (const key2 in obj[key1]) {
              for (let i = 0; i < obj[key1][key2].length; i++) {
                if (obj[key1][key2][i].type === '选择' && Array.isArray(obj[key1][key2][i].choice)) {
                  obj[key1][key2][i].choice = obj[key1][key2][i].choice.join(',');
                }
                taskSubjectList.push(obj[key1][key2][i]);
              }
            }
          }
          
          // 构建提交数据
          let params = {
            id: repairForm.value.id,
            summary: ruleForm.value.summary,
            description: ruleForm.value.description,
            result: ruleForm.value.result,
            taskSubjectList,
            state: '已完成'
          };
          
          console.log('提交数据:', params);
          
          setModalProps({ confirmLoading: true });
          message.success('执行成功');
          closeModal();
          emit('success');
        } catch (error) {
          message.error('执行失败');
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      function formatTime(time: string) {
        return time ? time.substring(0, 16) : '--';
      }

      return {
        registerModal,
        registerDesc,
        handleSubmit,
        subGroup,
        activeNames,
        activeNamess,
        contentColumns,
        ruleColumns,
        repairForm,
        data,
        ruleForm,
        loading,
        handleInspeResul,
        formatTime,
      };
    },
  });
</script>

<style scoped>
  .dialog-scrollbar-main {
    margin-bottom: 20px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;
  }
  
  .info-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    padding-left: 10px;
    border-left: 2px solid #1890ff;
  }
  
  .info-title-summary {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    padding-left: 10px;
    border-left: 2px solid #1890ff;
  }
  
  :deep(.ant-collapse-item) {
    margin-bottom: 10px;
  }
  
  :deep(.ant-collapse-header) {
    font-weight: bold;
  }
</style>
