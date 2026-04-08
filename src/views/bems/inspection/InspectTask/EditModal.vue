<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="编辑巡检任务" @ok="handleSubmit" :width="800">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import { updateInspectTask, getAllGroups, getSystem } from './InspectTask.api';

  export default defineComponent({
    name: 'EditModal',
    components: { BasicModal, BasicForm },
    setup(_, { emit }) {
      const groupsOptions = ref([]);
      const systemOptions = ref([]);

      const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
        setModalProps({ confirmLoading: false });

        const [groups, systems] = await Promise.all([getAllGroups({ search_EQ_type: 'execution' }), getSystem()]);

        if (groups.code === 1001) {
          groupsOptions.value = groups.data;
        }
        if (systems.code === 1001) {
          systemOptions.value = systems.data;
        }

        setFieldsValue(data.record);
      });

      const [registerForm, { setFieldsValue, validate }] = useForm({
        labelWidth: 120,
        schemas: [
          {
            field: 'taskNo',
            label: '任务编号',
            component: 'Input',
            required: true,
            disabled: true,
          },
          {
            field: 'name',
            label: '工单名称',
            component: 'Input',
            required: true,
          },
          {
            field: 'groupId',
            label: '执行组别',
            component: 'Select',
            componentProps: {
              options: groupsOptions,
              fieldNames: { label: 'name', value: 'id' },
            },
            required: true,
          },
          {
            field: 'systemId',
            label: '系统',
            component: 'Select',
            componentProps: {
              options: systemOptions,
            },
            required: true,
          },
          {
            field: 'start',
            label: '开始时间',
            component: 'DatePicker',
            componentProps: {
              format: 'YYYY-MM-DD HH:mm:ss',
              showTime: true,
            },
            required: true,
          },
          {
            field: 'end',
            label: '结束时间',
            component: 'DatePicker',
            componentProps: {
              format: 'YYYY-MM-DD HH:mm:ss',
              showTime: true,
            },
            required: true,
          },
          {
            field: 'remark',
            label: '备注',
            component: 'InputTextArea',
          },
        ],
        showActionButtonGroup: false,
      });

      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });
          await updateInspectTask(values);
          message.success('更新成功');
          closeModal();
          emit('success');
        } catch (error) {
          message.error('更新失败');
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
