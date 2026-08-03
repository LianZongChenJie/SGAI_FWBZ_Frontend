<template>
  <a-modal
    v-model:visible="visible"
    title="新增场馆"
    width="680px"
    :confirm-loading="submitLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-row :gutter="0">
        <a-col :span="12">
          <a-form-item label="场馆名称" name="venueName">
            <a-input v-model:value="formData.venueName" placeholder="请输入场馆名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="位置" name="location">
            <a-input v-model:value="formData.location" placeholder="请输入位置" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="朝向" name="orientation">
            <a-input v-model:value="formData.orientation" placeholder="请输入朝向" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="楼层" name="floors">
            <a-input v-model:value="formData.floors" placeholder="请输入楼层" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="建筑面积" name="area">
            <a-input v-model:value="formData.area" placeholder="请输入建筑面积" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="层高" name="ceilingH">
            <a-input v-model:value="formData.ceilingH" placeholder="请输入层高" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="采光条件" name="lighting">
            <a-input v-model:value="formData.lighting" placeholder="请输入采光条件" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="可施工" name="buildable">
            <a-switch
              v-model:checked="buildableChecked"
              checked-children="是"
              un-checked-children="否"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="基础条件"
            name="basicFacility"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-checkbox-group v-model:value="basicFacilityList" :options="facilityOptions" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { addVenueInfo } from '../../index.api'

const visible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

/** 基础条件可选项 */
const facilityOptions = [
  { label: '配电', value: '配电' },
  { label: '空调', value: '空调' },
  { label: '网络齐全', value: '网络齐全' },
]

/** 复选框选中的值（数组） */
const basicFacilityList = ref<string[]>([])

/** 可施工开关 */
const buildableChecked = ref(false)

/** 表单数据 */
const formData = reactive({
  venueName: '',
  location: '',
  orientation: '',
  floors: '',
  area: '',
  ceilingH: '',
  lighting: '',
  buildable: 0,
  basicFacility: '',
})

/** 表单校验规则 */
const rules = {
  venueName: [{ required: true, message: '请输入场馆名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
}

/** 打开弹窗 */
const open = () => {
  resetForm()
  visible.value = true
}

/** 重置表单 */
const resetForm = () => {
  formData.venueName = ''
  formData.location = ''
  formData.orientation = ''
  formData.floors = ''
  formData.area = ''
  formData.ceilingH = ''
  formData.lighting = ''
  formData.buildable = 0
  formData.basicFacility = ''
  basicFacilityList.value = []
  buildableChecked.value = false
  formRef.value?.resetFields()
}

/** 提交表单 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true

    // 将复选框数组转为逗号分隔字符串
    formData.basicFacility = basicFacilityList.value.join('/')
    // 开关值转为 1/0
    formData.buildable = buildableChecked.value ? 1 : 0

    await addVenueInfo({ ...formData })
    visible.value = false
    emit('success')
  } catch (error) {
    console.error('新增场馆失败:', error)
  } finally {
    submitLoading.value = false
  }
}

/** 取消 */
const handleCancel = () => {
  visible.value = false
  resetForm()
}

const emit = defineEmits<{
  success: []
}>()

defineExpose({ open })
</script>
