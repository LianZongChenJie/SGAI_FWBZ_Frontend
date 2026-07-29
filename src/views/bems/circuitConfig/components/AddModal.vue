<template>
  <div class="device-box-modal">
    <a-modal v-model:open="open" :title="type === 'create' ? '新建' : '编辑'" :footer="null" width="500px" @cancel="reset" :destroyOnClose="true">
      <div class="form-box">
        <a-form ref="formSateRef" :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" autocomplete="off" v-if="open">
          <a-row :gutter="8">
            <a-col :span="24">
              <a-form-item label="回路名称" name="name" :rules="[{ required: true, message: '请输入回路名称!' }]">
                <a-input placeholder="请输入回路名称" v-model:value="formState.name" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="回路编号" name="num" :rules="[{ required: true, message: '请输入回路编号!' }]">
                <a-input placeholder="请输入回路编号" v-model:value="formState.num" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="所在区域" name="spaceId" :rules="[{ required: true, message: '请选择所在区域!' }]">
                <a-tree-select
                  v-model:value="formState.spaceId"
                  :tree-data="spaceTreeData"
                  placeholder="请选择所在区域"
                  :fieldNames="treeSelect"
                  show-search
                  allowClear
                />
              </a-form-item>
            </a-col>
            <!-- <a-col :span="24">
              <a-form-item label="安装位置" name="position">
                <a-input v-model:value="formState.position" />
              </a-form-item>
            </a-col> -->
          </a-row>
        </a-form>
        <div class="button-box">
          <a-button v-if="type === 'create'" @click="reset">
            重置
          </a-button>
          &emsp;
          <a-button @click="closeModal">
            取消
          </a-button>
          &emsp;
          <a-button type="primary" @click="onSubmit">
            确定
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { addCircuitApi, editCircuitApi, spaceTree, categoryTree } from '../Standardized.api'

const props = defineProps({
  reload: {
    type: Function,
    default: () => {}
  }
})

const open = ref<boolean>(false);

const formSateRef = ref()

interface FormState {
  id: string | null;
  name: string | null;
  spaceId: string | null; 
  num: string | null; 
  position: string | null; 
}

// 弹框类型
const type = ref('create')

const formState = ref<FormState>({
  id: '',
  name: '',
  spaceId: '',
  num: '',
  position: ''
});

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

const categoryTreeData = ref([]);

// 打开弹框
const showModal = async (types, record:any = {}) => {
  if(types) {
    type.value = 'edit'
    formState.value.id = record.id
    formState.value.name = record.name
    formState.value.spaceId = record.spaceId + ''
    formState.value.num = record.num
    formState.value.position = record.position
  } else {
    type.value = 'create'
  }
  open.value = true
}

// 提交
const onSubmit = () => {
  formSateRef.value
    .validate()
    .then(async () => {
      if (type.value === 'create') {
        await addCircuitApi(toRaw(formState.value));
        message.success('新增成功！');
      } else {
        await editCircuitApi({
          id: formState.value.id,
          name: formState.value.name,
          num: formState.value.num,
          spaceId: formState.value.spaceId,
          position: formState.value.position,
        });
        message.success('修改成功！');
      }
      formState.value.position=''
      formSateRef.value.resetFields();
      props.reload()
      open.value = false;
    })
    .catch((error) => {
      console.log('error', error);
    });
}

// 重置
const reset = () => {
  formSateRef.value.resetFields();
  formState.value.id = null
  formState.value.name = null
  formState.value.spaceId = null
  formState.value.num = null
  formState.value.position = null
}

const closeModal = () => {
  reset()
  open.value = false;
}

// 获取设备位置树数据
const getSpaceTree = async () => {
  try {
    const res = await spaceTree({});
    spaceTreeData.value = res;
  } catch (error) {
    console.error('获取设备位置失败:', error);
  }
};

// 获取设备类别树数据
const getCategoryTree = async () => {
  try {
    const res = await categoryTree({});
    categoryTreeData.value = res;
  } catch (error) {
    console.error('获取设备类别失败:', error);
  }
};


const transformToCascaderFormat = (treeData) => {
  return treeData.map(item => {
    const cascaderItem = {
      value: item.key, // 使用 id 作为 value
      label: item.title,
      children: []
    }
    if (item.children && item.children.length > 0) {
      cascaderItem.children = transformToCascaderFormat(item.children)
    }
    return cascaderItem
  })
}

const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

onMounted(async () => {
  await getCategoryTree()
  await getSpaceTree()
})

defineExpose({
  showModal,
  closeModal
})
</script>

<style scoped lang="less">
  .form-box {
    width: 100%;
    padding: 5px 10px;
    padding-right: 0px;
  
      .button-box {
        padding: 0 12px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
</style>