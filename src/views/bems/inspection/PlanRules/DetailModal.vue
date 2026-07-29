<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="巡检规则详情" :width="1000" :showOkBtn="false" :loading="loading">
    <!-- 基本信息 -->
    <Description @register="registerDesc" :data="detailData" :column="2" />

    <!-- 巡检规则内容 -->
    <div v-if="detailData.ruleSubjectList && detailData.ruleSubjectList.length > 0" class="rule-content-section">
      <h3 class="section-title">巡检规则内容</h3>

      <!-- 规则内容块列表 -->
      <div v-for="(block, blockIndex) in groupedRuleContent" :key="blockIndex" class="rule-content-block">
        <!-- 巡检项目标题 -->
        <div class="project-name-section">
          <h4 class="project-name">{{ block.projectName || `项目 ${blockIndex + 1}` }}</h4>
        </div>

        <!-- 巡检规则字段列表 -->
        <div class="rule-fields-table">
          <table class="table">
            <thead>
              <tr>
                <th>巡检项</th>
                <th>巡检内容</th>
                <th>内容范围</th>
                <th>选项/判断值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, fieldIndex) in block.fields" :key="fieldIndex">
                <td>{{ item.name }}</td>
                <td>{{ item.content }}</td>
                <td>{{ item.subjectType }}</td>
                <td>
                  <div v-if="item.subjectType === '选择'">
                    {{ item.choice }}
                  </div>
                  <div v-else-if="item.subjectType === '判断'"> True={{ item.trueMark }}, False={{ item.falseMark }} </div>
                  <div v-else> - 无 - </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="blockIndex < groupedRuleContent.length - 1" class="block-divider"></div>
      </div>
    </div>

    <!-- 无规则内容提示 -->
    <div v-else class="no-content">
      <Empty description="暂无巡检规则内容" />
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Description, useDescription } from '/@/components/Description';
  import { Empty } from 'ant-design-vue';
  import { getPlanRuleDetail, getPatrolInspectionObjects } from './PlanRules.api';

  export default defineComponent({
    name: 'DetailModal',
    components: { BasicModal, Description, Empty },
    setup() {
      const detailData = ref({});
      const loading = ref(false);
      const [registerModal, { setModalProps }] = useModalInner(async (data) => {
        setModalProps({ confirmLoading: true });
        loading.value = true;
        try {
          const res = await getPlanRuleDetail({ ruleId: data.record.id });
          const patrolInspectionObjectsRes = await getPatrolInspectionObjects();
          console.log('获取的编号：', res);
          detailData.value = res;
          detailData.value.inspectObject = patrolInspectionObjectsRes.find((item) => item.value === res.inspectObject)?.label || '-';
        } catch (error) {
          console.error('获取巡检规则详情失败:', error);
        } finally {
          setModalProps({ confirmLoading: false });
        }
        loading.value = false;
      });

      // 分组规则内容，按项目名称分组
      const groupedRuleContent = computed(() => {
        if (!detailData.value.ruleSubjectList || detailData.value.ruleSubjectList.length === 0) {
          return [];
        }

        const groups = new Map();
        detailData.value.ruleSubjectList.forEach((item) => {
          const projectName = item.projectName || '未命名项目';
          if (!groups.has(projectName)) {
            groups.set(projectName, {
              projectName,
              fields: [],
            });
          }
          groups.get(projectName).fields.push(item);
        });

        return Array.from(groups.values());
      });

      const [registerDesc] = useDescription({
        schema: [
          {
            field: 'ruleNo',
            label: '规则编号',
          },
          {
            field: 'name',
            label: '规则名称',
          },
          {
            field: 'inspectObject',
            label: '巡检对象',
          },
          {
            field: 'ruleType',
            label: '规则类型',
          },
          {
            field: 'recommendedDays',
            label: '建议工作天数',
          },
          {
            field: 'description',
            label: '备注',
            span: 2,
          },
        ],
      });

      return {
        registerModal,
        registerDesc,
        detailData,
        groupedRuleContent,
        loading,
      };
    },
  });
</script>

<style lang="less" scoped>
  .rule-content-section {
    margin-top: 24px;
    padding: 0;

    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .rule-content-block {
      margin-bottom: 24px;
      padding: 20px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      background: #fafafa;

      .project-name-section {
        margin-bottom: 16px;

        .project-name {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #1890ff;
        }
      }

      .rule-fields-table {
        background: #fff;
        border-radius: 4px;
        overflow: hidden;

        .table {
          width: 100%;
          border-collapse: collapse;

          th,
          td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #f0f0f0;
          }

          th {
            background-color: #fafafa;
            font-weight: 500;
            color: #333;
          }

          tr:hover {
            background-color: #f5f5f5;
          }
        }
      }

      .block-divider {
        height: 2px;
        background-color: #1890ff;
        margin-top: 20px;
      }
    }
  }

  .no-content {
    margin-top: 40px;
    text-align: center;
  }

  /* 调整描述组件的间距 */
  :deep(.ant-descriptions) {
    margin-bottom: 0;
  }

  /* 调整模态框的内边距 */
  :deep(.ant-modal-body) {
    padding: 24px;
  }
</style>
