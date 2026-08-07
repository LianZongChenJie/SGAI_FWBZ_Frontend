<template>
  <a-modal :title="formData.id ? '编辑项目' : '新增项目'" :visible="visible" @ok="handleOk" @cancel="handleCancel" :confirmLoading="confirmLoading">
    <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="上级节点">
        <a-tree-select
          v-model:value="formData.parentId"
          :tree-data="props.ruleTree"
          placeholder="请选择上级节点"
          :field-names="{ label: 'title', value: 'key' }"
        />
      </a-form-item>
      <a-form-item label="项目编号" name="nodeCode">
        <a-input v-model:value="formData.nodeCode" placeholder="请输入项目编号" disabled />
      </a-form-item>
      <a-form-item label="项目名称" name="nodeName">
        <a-input v-model:value="formData.nodeName" placeholder="请输入项目名称" />
      </a-form-item>
      <a-form-item label="设备类别" name="categoryId">
        <a-tree-select
          v-model:value="formData.categoryId"
          :tree-data="props.categoryTree"
          placeholder="请选择设备类别"
          :field-names="{
            children: 'children',
            label: 'title',
            value: 'key',
          }"
          @change="selectCategoryId"
        />
      </a-form-item>
      <a-form-item label="空间位置" name="spaceId">
        <a-tree-select
          v-model:value="formData.spaceId"
          :tree-data="props.spaceTree"
          placeholder="请选择空间位置"
          :field-names="{
            children: 'children',
            label: 'title',
            value: 'key',
          }"
          @change="selectSpaceId"
        />
      </a-form-item>
      <a-form-item label="计量单位" name="meteringUnit">
        <a-select v-model:value="formData.meteringUnit" placeholder="请选择计量单位">
          <a-select-option v-for="item in props.unitList" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number v-model:value="formData.sort" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { addMeasureRule, editMeasureRule } from '../index.api';
  import { message } from 'ant-design-vue';

  const props = defineProps<{
    record?: any;
    categoryTree?: any[]; // 设备类别树
    spaceTree?: any[]; // 空间位置树
    unitList?: any[]; // 计量单位列表
    ruleTree?: any[]; // 规则树
    type: any;
  }>();

  const emit = defineEmits(['register', 'success']);

  const visible = ref<boolean>(false);
  const confirmLoading = ref<boolean>(false);
  const formRef = ref<FormInstance>();

  const formData = reactive({
    id: undefined,
    type: '',
    parentId: undefined,
    nodeCode: '',
    nodeName: '',
    categoryId: null,
    spaceId: null,
    meteringUnit: undefined,
    sort: 0,
  });

  const rules = {
    // nodeCode: [{ required: true, message: '请输入项目编号' }],
    nodeName: [{ required: true, message: '请输入项目名称' }],
    categoryId: [{ required: true, message: '请选择设备类别' }],
    spaceId: [{ required: true, message: '请选择空间位置' }],
    meteringUnit: [{ required: true, message: '请输入计量单位' }],
    sort: [{ required: true, message: '请输入排序' }],
  };

  // 打开弹窗
  const openModal = (data?: any) => {
    console.log(data,"data");
    formData.type = props.type;
    if (data && data.id) {
      // 使用解构赋值确保只复制需要的字段
      const { id, parentId, type, nodeCode, nodeName, categoryId, spaceId, meteringUnit, sort } = data;
      Object.assign(formData, {
        id,
        parentId,
        type,
        nodeCode,
        nodeName,
        categoryId,
        spaceId,
        meteringUnit,
        sort,
      });
    }
    visible.value = true;
  };

  // 关闭弹窗
  const closeModal = () => {
    formRef.value?.resetFields();
    Object.assign(formData, {
      id: undefined,
      parentId: undefined,
      nodeode: '',
      nodeName: '',
      categoryId: undefined,
      spaceId: undefined,
      meteringUnit: '',
    });
    visible.value = false;
  };

  // 确定
  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      confirmLoading.value = true;
      try {
        const api = formData.id ? editMeasureRule : addMeasureRule;
        let res = await api(formData);
        if (res && res.code === 500) {
          // message.error(res.message)
        } else {
          emit('success');
          closeModal();
        }
      } catch (error) {
        console.error(error);
      } finally {
        confirmLoading.value = false;
      }
    });
  };
  const selectCategoryId = (value, item, val) => {
    if (val.triggerNode && val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      formData.categoryId = null;
      return;
    }
  };

  const selectSpaceId = (value, item, val) => {
    if (val.triggerNode && val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      formData.spaceId = null;
      return;
    }
  };
  // 取消
  const handleCancel = () => {
    closeModal();
  };

  // 暴露方法给父组件
  defineExpose({
    openModal,
  });
</script>
