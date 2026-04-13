<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="1000">
    <BasicForm @register="registerForm" />
    
    <div class="rule-content-section">
      <div class="section-header">
        <h3>巡检规则内容</h3>
        <a-button type="primary" @click="addRuleContentBlock">
          <PlusOutlined />
          新增规则内容
        </a-button>
      </div>

      <!-- 规则内容块列表 -->
      <div v-for="(block, blockIndex) in ruleContentBlocks" :key="block.id" class="rule-content-block">
        <!-- 巡检项目标题 -->
        <div class="project-name-section">
          <div class="project-name-row">
            <div class="project-name-label">巡检项目标题</div>
            <div class="project-name-input">
              <a-input v-model:value="block.projectName" placeholder="请输入巡检项目标题" />
            </div>
            <div class="block-actions">
              <a-button type="text" danger @click="removeRuleContentBlock(blockIndex)">
                <DeleteOutlined />
              </a-button>
            </div>
          </div>
        </div>

        <!-- 巡检规则字段列表 -->
        <div v-for="(item, fieldIndex) in block.fields" :key="item.id" class="rule-field-item">
          <a-row :gutter="16" align="middle">
            <a-col :span="5">
              <div class="form-item-left">
                <div class="form-label">巡检项</div>
                <div class="form-input">
                  <a-input v-model:value="item.name" placeholder="请输入巡检项" />
                </div>
              </div>
            </a-col>
            <a-col :span="5">
              <div class="form-item-left">
                <div class="form-label">巡检内容</div>
                <div class="form-input">
                  <a-input v-model:value="item.content" placeholder="请输入巡检内容" />
                </div>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="form-item-left">
                <div class="form-label">内容范围</div>
                <div class="form-input">
                  <a-select
                    v-model:value="item.type"
                    placeholder="请选择"
                    @change="handleTypeChange(item)"
                    style="width: 100%"
                  >
                    <a-select-option v-for="option in typeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </a-select-option>
                  </a-select>
                </div>
              </div>
            </a-col>
            <a-col :span="7">
              <div v-if="item.type === '选择'" class="extra-input">
                <div class="form-item-left">
                  <div class="form-label">选项</div>
                  <div class="form-input">
                    <a-input v-model:value="item.choice" placeholder="请输入选项，以逗号隔开" />
                  </div>
                </div>
              </div>
              <div v-if="item.type === '判断'" class="extra-input">
                <div style="display: inline-block; width: 48%; margin-right: 4%;">
                  <div class="form-item-left">
                    <div class="form-label">True=</div>
                    <div class="form-input">
                      <a-input v-model:value="item.trueMark" placeholder="请输入内容" />
                    </div>
                  </div>
                </div>
                <div style="display: inline-block; width: 48%;">
                  <div class="form-item-left">
                    <div class="form-label">False=</div>
                    <div class="form-input">
                      <a-input v-model:value="item.falseMark" placeholder="请输入内容" />
                    </div>
                  </div>
                </div>
              </div>
            </a-col>
            <a-col :span="3" class="field-actions">
              <a-button type="text" danger @click="removeRuleField(blockIndex, fieldIndex)">
                <DeleteOutlined />
              </a-button>
            </a-col>
          </a-row>
        </div>

        <!-- 块内添加按钮 -->
        <div class="block-add-button">
          <a-button type="primary" @click="addRuleField(blockIndex)">
            添加
          </a-button>
        </div>

        <div v-if="blockIndex < ruleContentBlocks.length - 1" class="block-divider"></div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { addPlanRule, getSpecialty, getPlanRuleNo } from './PlanRules.api';

  interface RuleField {
    id: number;
    name: string;
    content: string;
    type: string;
    choice: string;
    trueMark: string;
    falseMark: string;
  }

  interface RuleContentBlock {
    id: number;
    projectName: string;
    fields: RuleField[];
  }

  export default defineComponent({
    name: 'AddModal',
    components: { BasicModal, BasicForm, PlusOutlined, DeleteOutlined },
    setup(_, { emit }) {
      const isUpdate = ref(false);
      const title = computed(() => (isUpdate.value ? '编辑巡检规则' : '新增巡检规则'));
      const specialtyOptions = ref([
        { name: '消防系统', value: '消防系统' },
        { name: '消防水系统', value: '消防水系统' },
        { name: '消防排烟系统', value: '消防排烟系统' },
        { name: '电气系统', value: '电气系统' },
        { name: '安全出口', value: '安全出口' },
        { name: '应急照明', value: '应急照明' },
        { name: '防火门', value: '防火门' }
      ]);
      const ruleContentBlocks = ref<RuleContentBlock[]>([createRuleContentBlock()]);
      const formRefs = ref<any[][]>([]);

      const typeOptions = [
        { label: '文本', value: '文本' },
        { label: '数字', value: '数字' },
        { label: '判断', value: '判断' },
        { label: '选择', value: '选择' },
      ];

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        setModalProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;

        await resetFields();

        if (!isUpdate.value) {
          const no = await getPlanRuleNo();
      
          setFieldsValue({
            ruleNo: no,
          });
          ruleContentBlocks.value = [createRuleContentBlock()];
        } else {
          setFieldsValue(data.record);
          if (data.record.ruleSubjectList && data.record.ruleSubjectList.length > 0) {
            // 转换为新的块结构
            ruleContentBlocks.value = [{
              id: Date.now(),
              projectName: data.record.ruleSubjectList[0]?.projectName || '',
              fields: data.record.ruleSubjectList.map(item => ({
                id: item.id || Date.now(),
                name: item.name,
                content: item.content,
                type: item.subjectType,
                choice: item.choice,
                trueMark: item.trueMark,
                falseMark: item.falseMark,
              })),
            }];
          } else {
            ruleContentBlocks.value = [createRuleContentBlock()];
          }
        }

        // 假数据已在 setup 开始时初始化
      });

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 120,
        schemas: [
          {
            field: 'ruleNo',
            label: '巡检规则编号',
            component: 'Input',
            required: true,
            disabled: true,
          },
          {
            field: 'name',
            label: '巡检规则名称',
            component: 'Input',
            required: true,
          },
          {
            field: 'inspectObject',
            label: '巡检对象',
            component: 'Select',
            componentProps: {
              options: specialtyOptions,
              fieldNames: { label: 'name', value: 'name' },
            },
            required: true,
          },
          {
            field: 'ruleType',
            label: '规则类型',
            component: 'Select',
            componentProps: {
              options: [
                { label: '日巡检', value: '日巡检' },
                { label: '周巡检', value: '周巡检' },
                { label: '月巡检', value: '月巡检' },
                { label: '季巡检', value: '季巡检' },
                { label: '半年巡检', value: '半年巡检' },
                { label: '年巡检', value: '年巡检' },
                { label: '其他', value: '其他' },
              ],
            },
            required: true,
          },
          {
            field: 'recommendedDays',
            label: '建议工作天数',
            component: 'InputNumber',
            rules: [
              { required: true, message: '请输入建议工作天数' },
              { pattern: /^\d+$/, message: '只能输入数字' },
            ],
          },
          {
            field: 'description',
            label: '备注(选填)',
            component: 'InputTextArea',
            componentProps: {
              maxlength: 100,
              showCount: true,
              rows: 3,
            },
          },
        ],
        showActionButtonGroup: false,
      });

      function createRuleField(): RuleField {
        return {
          id: Date.now(),
          name: '',
          content: '',
          type: '文本',
          choice: '',
          trueMark: '',
          falseMark: '',
        };
      }

      function createRuleContentBlock(): RuleContentBlock {
        return {
          id: Date.now(),
          projectName: '',
          fields: [createRuleField()],
        };
      }

      function setFormRef(el: any, blockIndex: number, fieldIndex: number) {
        if (el) {
          if (!formRefs.value[blockIndex]) {
            formRefs.value[blockIndex] = [];
          }
          formRefs.value[blockIndex][fieldIndex] = el;
        }
      }

      function addRuleContentBlock() {
        ruleContentBlocks.value.push(createRuleContentBlock());
      }

      function removeRuleContentBlock(blockIndex: number) {
        ruleContentBlocks.value.splice(blockIndex, 1);
        formRefs.value.splice(blockIndex, 1);
        if (ruleContentBlocks.value.length === 0) {
          ruleContentBlocks.value = [createRuleContentBlock()];
        }
      }

      function addRuleField(blockIndex: number) {
        ruleContentBlocks.value[blockIndex].fields.push(createRuleField());
      }

      function removeRuleField(blockIndex: number, fieldIndex: number) {
        ruleContentBlocks.value[blockIndex].fields.splice(fieldIndex, 1);
        if (formRefs.value[blockIndex]) {
          formRefs.value[blockIndex].splice(fieldIndex, 1);
        }
        if (ruleContentBlocks.value[blockIndex].fields.length === 0) {
          ruleContentBlocks.value[blockIndex].fields.push(createRuleField());
        }
      }

      function handleTypeChange(item: RuleField) {
        if (item.type !== '选择') {
          item.choice = '';
        }
        if (item.type !== '判断') {
          item.trueMark = '';
          item.falseMark = '';
        }
      }

      function getRuleFieldRules(item: RuleField) {
        return {
          name: [{ required: true, message: '请输入巡检项' }],
          content: [{ required: true, message: '请输入巡检内容' }],
          type: [{ required: true, message: '请选择内容范围' }],
          choice: [
            {
              required: item.type === '选择',
              message: '请输入选项',
            },
          ],
          trueMark: [
            {
              required: item.type === '判断',
              message: '请输入为True的内容',
            },
          ],
          falseMark: [
            {
              required: item.type === '判断',
              message: '请输入为False的内容',
            },
          ],
        };
      }

      async function validateRuleContents(): Promise<boolean> {
        let isValid = true;

        for (let blockIndex = 0; blockIndex < ruleContentBlocks.value.length; blockIndex++) {
          const block = ruleContentBlocks.value[blockIndex];
          if (!block.projectName) {
            message.warning('请输入巡检项目标题');
            isValid = false;
          }

          for (let fieldIndex = 0; fieldIndex < block.fields.length; fieldIndex++) {
            const formRef = formRefs.value[blockIndex]?.[fieldIndex];
            if (formRef) {
              try {
                await formRef.validate();
              } catch (error) {
                isValid = false;
              }
            }
          }
        }

        return isValid;
      }

      async function handleSubmit() {
        try {
          const basicValues = await validate();

          if (ruleContentBlocks.value.length === 0) {
            message.warning('请添加巡检规则内容');
            return;
          }

          const ruleContentValid = await validateRuleContents();
          if (!ruleContentValid) {
            return;
          }

          setModalProps({ confirmLoading: true });

          // 转换为API需要的格式
          const ruleSubjectList = ruleContentBlocks.value.flatMap(block =>
            block.fields.map(field => ({
              ...field,
              projectName: block.projectName,
              subjectType: field.type,
            }))
          );

          const formData = {
            ...basicValues,
            ruleSubjectList,
          };

          await addPlanRule(formData);
          message.success('操作成功');
          closeModal();
          emit('success');
        } catch (error) {
          message.error('操作失败');
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return {
        registerModal,
        registerForm,
        title,
        specialtyOptions,
        ruleContentBlocks,
        typeOptions,
        setFormRef,
        addRuleContentBlock,
        removeRuleContentBlock,
        addRuleField,
        removeRuleField,
        handleTypeChange,
        getRuleFieldRules,
        handleSubmit,
      };
    },
  });
</script>

<style lang="less" scoped>
.rule-content-section {
  margin-top: 20px;
  padding: 0;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .rule-content-block {
    margin-bottom: 24px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    background: #fafafa;
    
    .project-name-section {
      margin-bottom: 16px;
      
      .project-name-row {
        display: flex;
        align-items: center;
        
        .project-name-label {
          width: 120px;
          font-weight: 500;
          text-align: right;
          margin-right: 16px;
        }
        
        .project-name-input {
          flex: 1;
        }
        
        .block-actions {
          margin-left: 16px;
        }
      }
    }
    
    .rule-field-item {
      margin-bottom: 12px;
      padding: 12px;
      background: #fff;
      border-radius: 4px;
      
      .field-actions {
        display: flex;
        justify-content: flex-end;
      }
      
      .form-item-left {
        display: flex;
        align-items: center;
        
        .form-label {
          width: 80px;
          font-weight: 500;
          text-align: right;
          margin-right: 12px;
        }
        
        .form-input {
          flex: 1;
        }
      }
    }
    
    .block-add-button {
      margin-top: 12px;
      text-align: right;
    }
    
    .block-divider {
      height: 2px;
      background-color: #1890ff;
      margin-top: 20px;
    }
  }
  
  .extra-input {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    
    .label-prefix {
      margin-right: 8px;
      font-weight: 500;
    }
  }
}

/* 调整表单项目的间距 */
.ant-form-item {
  margin-bottom: 12px;
}

/* 调整模态框的内边距 */
.ant-modal-body {
  padding: 20px;
}
</style>
