<template>
  <a-modal
    v-model:visible="visible"
    title="新增排期"
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
          <a-form-item label="活动名称" name="activeName">
            <a-input v-model:value="formData.activeName" placeholder="请输入活动名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="选择场馆" name="venueId">
            <a-select
              v-model:value="formData.venueId"
              placeholder="请选择场馆"
              show-search
              :filter-option="filterVenueOption"
              :options="venueOptions"
              :field-names="{ label: 'venueName', value: 'id' }"
              @change="handleVenueChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="开始日期" name="startDate">
            <a-date-picker
              v-model:value="formData.startDate"
              style="width: 100%"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始日期"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="开始时间" name="startTime">
            <a-time-picker
              v-model:value="formData.startTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              placeholder="请选择开始时间"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="结束时间" name="endTime">
            <a-time-picker
              v-model:value="formData.endTime"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 100%"
              placeholder="请选择结束时间"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="活动层数" name="venueFloors">
            <a-input v-model:value="formData.venueFloors" placeholder="请输入活动层数" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="预计人数" name="peopleQuantity">
            <a-input-number v-model:value="formData.peopleQuantity" style="width: 100%" :min="0" placeholder="请输入预计人数" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { addExhibition, getVenueList } from '../../index.api'
import type { ExhibitionRequest, VenueItem } from '../../index.api'

const visible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

/** 场馆下拉选项 */
const venueOptions = ref<VenueItem[]>([])

/** 表单数据 */
const formData = reactive<ExhibitionRequest>({
  activeName: '',
  venueId: undefined,
  venueName: '',
  startDate: '',
  startTime: '',
  endTime: '',
  venueFloors: '',
  peopleQuantity: undefined,
})

/** 表单校验规则 */
const rules = {
  activeName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  venueId: [{ required: true, message: '请选择场馆', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
}

/** 场馆下拉模糊搜索 */
const filterVenueOption = (input: string, option: any) => {
  const name = option?.venueName || ''
  return name.toLowerCase().includes(input.toLowerCase())
}

/** 场馆选择变化时同步场馆名称 */
const handleVenueChange = (_value: any, option: any) => {
  formData.venueName = option?.venueName || ''
}

/** 获取场馆列表 */
const fetchVenueOptions = async () => {
  try {
    const res = await getVenueList()
    venueOptions.value = res || []
  } catch (error) {
    console.error('获取场馆列表失败:', error)
  }
}

/** 打开弹窗 */
const open = () => {
  resetForm()
  fetchVenueOptions()
  visible.value = true
}

/** 重置表单 */
const resetForm = () => {
  formData.activeName = ''
  formData.venueId = undefined
  formData.venueName = ''
  formData.startDate = ''
  formData.startTime = ''
  formData.endTime = ''
  formData.venueFloors = ''
  formData.peopleQuantity = undefined
  formRef.value?.resetFields()
}

/** 提交表单 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    await addExhibition({ ...formData })
    message.success('新增排期成功')
    visible.value = false
    emit('success')
  } catch (error) {
    console.error('新增排期失败:', error)
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
