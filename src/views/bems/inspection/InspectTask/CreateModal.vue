<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="新建巡检任务" @ok="handleSubmit" :width="900" :minHeight="550">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import { addInspectTask, getTaskNumber } from './InspectTask.api';
  // import { getAllGroups } from './InspectTask.api';
  // import { getSpaceTree } from './InspectTask.api';
  import dayjs from 'dayjs';

  export default defineComponent({
    name: 'CreateModal',
    components: { BasicModal, BasicForm },
    setup(_, { emit }) {
      const groupsOptions = ref([
        { id: '1', name: '巡检组A' },
        { id: '2', name: '巡检组B' },
        { id: '3', name: '巡检组C' },
      ]);
      const spaceTreeData = ref([
        {
          id: '1',
          spaceName: '厂区A',
          childrens: [
            { id: '1-1', spaceName: '1号车间', childrens: [] },
            { id: '1-2', spaceName: '2号车间', childrens: [] },
          ],
        },
        {
          id: '2',
          spaceName: '厂区B',
          childrens: [
            { id: '2-1', spaceName: '3号车间', childrens: [] },
            { id: '2-2', spaceName: '4号车间', childrens: [] },
          ],
        },
      ]);

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        setModalProps({ confirmLoading: false });

        await resetFields();

        const taskNo = await getTaskNumber();
        setFieldsValue({ taskNo: taskNo });
      });

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 120,
        schemas: [
          {
            field: 'taskNo',
            label: '任务编号',
            component: 'Input',
            required: true,
            componentProps: {
              placeholder: '请输入任务编号',
            },
            dynamicDisabled: true,
          },
          {
            field: 'name',
            label: '巡检任务名称',
            component: 'Input',
            required: true,
            componentProps: {
              placeholder: '请输入巡检任务名称',
            },
          },
          {
            field: 'groupId',
            label: '执行组别',
            component: 'Select',
            componentProps: {
              options: groupsOptions,
              fieldNames: { label: 'name', value: 'id' },
              placeholder: '请选择执行组别',
              allowClear: true,
            },
            required: true,
          },
          {
            field: 'executionTime',
            label: '执行时间',
            component: 'RangePicker',
            componentProps: {
              format: 'YYYY-MM-DD HH:mm:ss',
              valueFormat: 'YYYY-MM-DD HH:mm:ss',
              showTime: { format: 'HH:mm' },
              placeholder: ['开始日期', '结束日期'],
              disabledDate: (current: any) => {
                return current && current < dayjs().startOf('day');
              },
            },
            required: true,
          },
          {
            field: 'spaceId',
            label: '执行位置',
            component: 'TreeSelect',
            componentProps: {
              treeData: spaceTreeData,
              fieldNames: { label: 'spaceName', value: 'id', children: 'childrens' },
              showSearch: true,
              treeCheckable: false,
              placeholder: '请选择执行位置',
              allowClear: true,
            },
            required: true,
          },
        ],
        showActionButtonGroup: false,
      });

      function findSpaceName(tree: any[], id: string): string {
        for (const node of tree) {
          if (node.id === id) {
            return node.spaceName;
          }
          if (node.childrens && node.childrens.length) {
            const result = findSpaceName(node.childrens, id);
            if (result) return result;
          }
        }
        return '';
      }

      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });
          const groupItem = groupsOptions.value.find((item: any) => item.id === values.groupId);
          const spaceName = findSpaceName(spaceTreeData.value, values.spaceId);

          const executionTimeArr = typeof values.executionTime === 'string' ? values.executionTime.split(',') : values.executionTime;
          const formData = {
            taskNo: values.taskNo,
            name: values.name,
            groupId: values.groupId,
            groupName: groupItem?.name || '',
            startTime: executionTimeArr[0],
            endTime: executionTimeArr[1],
            spaceId: values.spaceId,
            spaceName: spaceName,
          };
       

          await addInspectTask(formData);
          message.success('创建成功');
          closeModal();
          emit('success');
        } catch (error) {
          console.error('创建巡检任务失败:', error);
          message.error('创建失败');
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return {
        registerModal,
        registerForm,
        handleSubmit,
      };
    },
  });
</script>
