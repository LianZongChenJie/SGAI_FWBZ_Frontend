<template>
  <a-modal
    v-model:open="open"
    :title="modalType ? '编辑能源价格' : '新增能源价格'"
    width="800px"
    @cancel="closeModal"
    :footer="null"
  >
    <div style="padding-bottom: 6px;">
      <div class="configuration-modal">
        <div class="electricity-configuration">
          <div class="electricity-form-box">
            <a-form
              :model="formState"
              ref="electricityFormRef"
              class="electricity-form"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 12 }"
            >
              <a-row>
                <a-col :span="12">
                  <a-form-item
                    label="计费类别"
                    name="categoryId"
                    :rules="[{ required: true, message: '请选择计费类别' }]"
                  >
                    <a-select
                      placeholder="请选择计费类别"
                      v-model:value="formState.categoryId"
                      :fieldNames="fieldNames"
                      :options="categoryTreeData"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col
                  :span="12"
                >
                  <a-form-item
                    label="计费方式"
                    name="billingWay"
                    :rules="[{ required: true, message: '请选择计费方式' }]"
                  >
                    <a-select
                      placeholder="请选择计费方式"
                      v-model:value="formState.billingWay"
                      :options="methodOptions"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row v-if="formState.categoryId && formState.billingWay === '2'">
                <a-col :span="12">
                  <a-form-item
                    label="固定单价"
                    name="fixedUnitPrice"
                    :rules="[{ required: true, message: '请输入固定单价' }]"
                  >
                    <a-input
                      placeholder="请输入固定单价"
                      v-model:value="formState.fixedUnitPrice"
                      type="number"
                    >
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row v-if="formState.categoryId && formState.billingWay === '1'">
                <a-col :span="12">
                  <a-form-item
                    label="尖电价"
                    name="tipPrice"
                    :rules="[{ required: true, message: '请输入尖电价' }]"
                  >
                    <a-input
                      placeholder="请输入尖电价"
                      v-model:value="formState.tipPrice"
                      type="number"
                    >
                    </a-input>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item
                    label="峰电价"
                    name="peakPrice"
                    :rules="[{ required: true, message: '请输入峰电价' }]"
                  >
                    <a-input
                      placeholder="请输入峰电价"
                      v-model:value="formState.peakPrice"
                      type="number"
                    >
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row v-if="formState.categoryId && formState.billingWay === '1'">
                <a-col :span="12">
                  <a-form-item
                    label="平电价"
                    name="flatPrice"
                    :rules="[{ required: true, message: '请输入平电价' }]"
                  >
                    <a-input
                      placeholder="请输入平电价"
                      v-model:value="formState.flatPrice"
                      type="number"
                    >
                    </a-input>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item
                    label="谷电价"
                    name="valleyPrice"
                    :rules="[{ required: true, message: '请输入谷电价' }]"
                  >
                    <a-input
                      placeholder="请输入谷电价"
                      v-model:value="formState.valleyPrice"
                      type="number"
                    >
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row
                v-if="formState.categoryId && formState.billingWay === '1'"
                class="border-row"
              >
                <a-col :span="24">
                  <a-form-item
                    label="适用月份"
                    name="applyMonths1"
                    :rules="[{ required: true, message: '请选择适用月份', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 21 }"
                  >
                    <a-checkbox-group
                      v-model:value="formState.applyMonths1"
                      name="checkboxgroup"
                    >
                      <a-row>
                        <a-col
                          :span="2"
                          v-for="(item,index) in monthOptions"
                          :key="index"
                        >
                          <a-checkbox
                            :value="item.value"
                            :disabled='getDisabled(0,item)'
                          >{{ item.label }}</a-checkbox>
                        </a-col>
                      </a-row>
                    </a-checkbox-group>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="尖时段"
                    name="tipTimeSlot1"
                    :rules="[{ required: true, message: '请选择尖时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.tipTimeSlot1"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="峰时段"
                    name="peakTimeSlot1"
                    :rules="[{ required: true, message: '请选择峰时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.peakTimeSlot1"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="平时段"
                    name="flatTimeSlot1"
                    :rules="[{ required: true, message: '请选择平时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.flatTimeSlot1"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="谷时段"
                    name="valleyTimeSlot1"
                    :rules="[{ required: true, message: '请选择谷时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.valleyTimeSlot1"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row
                v-if="formState.categoryId && formState.billingWay === '1'"
                class="border-row"
                style="margin-top: 15px;"
              >
                <a-col :span="24">
                  <a-form-item
                    label="适用月份"
                    name="applyMonths2"
                    :rules="[{ required: true, message: '请选择适用月份', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 21 }"
                  >
                    <a-checkbox-group
                      v-model:value="formState.applyMonths2"
                      name="checkboxgroup"
                    >
                      <a-row>
                        <a-col
                          :span="2"
                          v-for="(item,index) in monthOptions"
                          :key="index"
                        >
                          <a-checkbox
                            :value="item.value"
                            :disabled='getDisabled(1,item)'
                          >{{ item.label }}</a-checkbox>
                        </a-col>
                      </a-row>
                    </a-checkbox-group>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="尖时段"
                    name="tipTimeSlot2"
                    :rules="[{ required: true, message: '请选择尖时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.tipTimeSlot2"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="峰时段"
                    name="peakTimeSlot2"
                    :rules="[{ required: true, message: '请选择峰时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.peakTimeSlot2"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="平时段"
                    name="flatTimeSlot2"
                    :rules="[{ required: true, message: '请选择平时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.flatTimeSlot2"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
                <a-col>
                  <a-form-item
                    label="谷时段"
                    name="valleyTimeSlot2"
                    :rules="[{ required: true, message: '请选择谷时段', type: 'array' }]"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 20 }"
                  >
                    <a-select
                      v-model:value="formState.valleyTimeSlot2"
                      mode="multiple"
                      style="width: 100%"
                      placeholder="请选择时段"
                      :showArrow="true"
                      :options="timeOptions"
                    ></a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row
                class="border-row"
                v-if="formState.categoryId && formState.billingWay === '3'"
              >
                <a-col :span="24">
                  <a-form-item
                    label="第一阶段"
                    name="step1Max"
                    :rules="[{ required: true, message: '' }]"
                    :label-col="{ span: 3 }"
                  >
                    <a-input-group>
                      <a-row :gutter="4">
                        <a-col :span="12">
                          <a-form-item
                            name="step1Max"
                            :rules="[{ required: true, message: '请输入最大量' }]"
                          >
                            <a-input
                              v-model:value="formState.step1Max"
                              type="number"
                            />
                            <div class="input-tip">最大量</div>
                          </a-form-item>
                        </a-col>
                        <a-col :span="12">
                          <a-form-item
                            name="step1UnitPrice"
                            :rules="[{ required: true, message: '请输入单价' }]"
                          >
                            <a-input
                              v-model:value="formState.step1UnitPrice"
                              type="number"
                            />
                            <div class="input-tip">单价</div>
                          </a-form-item>
                        </a-col>
                      </a-row>
                    </a-input-group>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row
                class="border-row"
                v-if="formState.categoryId && formState.billingWay === '3'"
                style="margin-top: 15px;"
              >
                <a-col :span="24">
                  <a-form-item
                    label="第二阶段"
                    name="step2Min"
                    :rules="[{ required: true, message: '请输入尖电价' }]"
                    :label-col="{ span: 3 }"
                  >
                    <a-input-group>
                      <a-row :gutter="4">
                        <a-col :span="8">
                          <a-form-item
                            name="step2Min"
                            :rules="[{ required: true, message: '请输入最小量' }]"
                          >
                            <a-input
                              v-model:value="formState.step2Min"
                              type="number"
                            />
                            <div class="input-tip">最小量</div>
                          </a-form-item>
                        </a-col>
                        <a-col :span="8">
                          <a-form-item
                            name="step2Max"
                            :rules="[{ required: true, message: '请输入最大量' }]"
                          >
                            <a-input
                              v-model:value="formState.step2Max"
                              type="number"
                            />
                            <div class="input-tip">最大量</div>
                          </a-form-item>
                        </a-col>
                        <a-col :span="8">
                          <a-form-item
                            name="step2UnitPrice"
                            :rules="[{ required: true, message: '请输入单价' }]"
                          >
                            <a-input
                              v-model:value="formState.step2UnitPrice"
                              type="number"
                            />
                            <div class="input-tip">单价</div>
                          </a-form-item>
                        </a-col>
                      </a-row>
                    </a-input-group>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row
                class="border-row"
                v-if="formState.categoryId && formState.billingWay === '3'"
                style="margin-top: 15px;"
              >
                <a-col :span="24">
                  <a-form-item
                    label="第三阶段"
                    name="step3Min"
                    :rules="[{ required: true, message: '请输入尖电价' }]"
                    :label-col="{ span: 3 }"
                  >
                    <a-input-group>
                      <a-row :gutter="4">
                        <a-col :span="12">
                          <a-form-item
                            name="step3Min"
                            :rules="[{ required: true, message: '请输入最小水量' }]"
                          >
                            <a-input
                              v-model:value="formState.step3Min"
                              type="number"
                            />
                            <div class="input-tip">最小水量</div>
                          </a-form-item>
                        </a-col>
                        <a-col :span="12">
                          <a-form-item
                            name="step3UnitPrice"
                            :rules="[{ required: true, message: '请输入单价' }]"
                          >
                            <a-input
                              v-model:value="formState.step3UnitPrice"
                              type="number"
                            />
                            <div class="input-tip">单价</div>
                          </a-form-item>

                        </a-col>
                      </a-row>
                    </a-input-group>
                  </a-form-item>
                </a-col>
              </a-row>
              <div
                class="button-box"
                v-if="formState.categoryId"
              >
                <a-button @click="onSubmit">保存</a-button>
              </div>
            </a-form>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { categoryTree, addEnergyPriceApi, editEnergyPriceApi } from '../EnergyPrice.api';
import { AnyARecord } from 'node:dns';
import { close } from 'node:fs';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {}
  }
})

const open = ref<boolean>(false);

// 操作类型
const modalType = ref(0);

const electricityFormRef = ref();

// 计费类别options
const categoryTreeData = ref<any>([]);
const fieldNames = {
  label: 'title',
  value: 'key',
};

// 电计费方式options
const methodOptions = [
  {
    label: '峰谷分时计价',
    value: '1',
  },
  {
    label: '固定计价',
    value: '2',
  },
  {
    label: '阶梯计价',
    value: '3',
  },
];
// 月份options
const monthOptions = [
  {
    label: '01',
    value: '01',
  },
  {
    label: '02',
    value: '02',
  },
  {
    label: '03',
    value: '03',
  },
  {
    label: '04',
    value: '04',
  },
  {
    label: '05',
    value: '05',
  },
  {
    label: '06',
    value: '06',
  },
  {
    label: '07',
    value: '07',
  },
  {
    label: '08',
    value: '08',
  },
  {
    label: '09',
    value: '09',
  },
  {
    label: '10',
    value: '10',
  },
  {
    label: '11',
    value: '11',
  },
  {
    label: '12',
    value: '12',
  },
];
// 时间options
const timeOptions = [
  {
    label: '0:00',
    value: '0:00',
  },
  {
    label: '1:00',
    value: '1:00',
  },
  {
    label: '2:00',
    value: '2:00',
  },
  {
    label: '3:00',
    value: '3:00',
  },
  {
    label: '4:00',
    value: '4:00',
  },
  {
    label: '5:00',
    value: '5:00',
  },
  {
    label: '6:00',
    value: '6:00',
  },
  {
    label: '7:00',
    value: '7:00',
  },
  {
    label: '8:00',
    value: '8:00',
  },
  {
    label: '9:00',
    value: '9:00',
  },
  {
    label: '10:00',
    value: '10:00',
  },
  {
    label: '11:00',
    value: '11:00',
  },
  {
    label: '12:00',
    value: '12:00',
  },
  {
    label: '13:00',
    value: '13:00',
  },
  {
    label: '14:00',
    value: '14:00',
  },
  {
    label: '15:00',
    value: '15:00',
  },
  {
    label: '16:00',
    value: '16:00',
  },
  {
    label: '17:00',
    value: '17:00',
  },
  {
    label: '18:00',
    value: '18:00',
  },
  {
    label: '19:00',
    value: '19:00',
  },
  {
    label: '20:00',
    value: '20:00',
  },
  {
    label: '21:00',
    value: '21:00',
  },
  {
    label: '22:00',
    value: '22:00',
  },
  {
    label: '23:00',
    value: '23:00',
  },
];

// 表单数据
const formState = ref<any>({
  id: null,
  categoryId: null,
  billingWay: '1',
  fixedUnitPrice: null,
  step1Max: null,
  step1UnitPrice: null,
  step2Min: null,
  step2Max: null,
  step2UnitPrice: null,
  step3Min: null,
  step3UnitPrice: null,
  tipPrice: null,
  peakPrice: null,
  flatPrice: null,
  valleyPrice: null,
  applyMonths1: [],
  tipTimeSlot1: [],
  peakTimeSlot1: [],
  flatTimeSlot1: [],
  valleyTimeSlot1: [],
  applyMonths2: [],
  tipTimeSlot2: [],
  peakTimeSlot2: [],
  flatTimeSlot2: [],
  valleyTimeSlot2: [],
});

// 打开弹框
const showModal = async (type, record:any = {}) => {
  modalType.value = type;
  await getCategoryTreeData();
  if (type) {
    for(let key in formState.value) {
      formState.value[key] = record[key]
    }
    formState.value.categoryId += ''
    formState.value.applyMonths1 = formState.value.applyMonths1 ? formState.value.applyMonths1.split(',') : ''
    formState.value.applyMonths2 = formState.value.applyMonths2 ? formState.value.applyMonths2.split(',') : ''
  } else {
  }
  open.value = true;
};

// 获取计费分类数据
const getCategoryTreeData = async () => {
  let res = await categoryTree({});
  categoryTreeData.value = [...res];
  console.log('categoryTreeData------------>', categoryTreeData.value);
};

// 获取是否禁用
const getDisabled = (type, target) => {
  if (type) {
    return formState.value.applyMonths1.find((item) => item === target.value);
  } else {
    return formState.value.applyMonths2.find((item) => item === target.value);
  }
};

// 提交
const onSubmit = () => {
  electricityFormRef.value
    .validate()
    .then(async () => {
      let params: any = {};
      switch (formState.value.billingWay) {
        case '1':
          params = {
            tipPrice: formState.value.tipPrice,
            peakPrice: formState.value.peakPrice,
            flatPrice: formState.value.flatPrice,
            valleyPrice: formState.value.valleyPrice,
            applyMonths1: formState.value.applyMonths1.join(','),
            tipTimeSlot1: formState.value.tipTimeSlot1.join(','),
            peakTimeSlot1: formState.value.peakTimeSlot1.join(','),
            flatTimeSlot1: formState.value.flatTimeSlot1.join(','),
            valleyTimeSlot1: formState.value.valleyTimeSlot1.join(','),
            applyMonths2: formState.value.applyMonths2.join(','),
            tipTimeSlot2: formState.value.tipTimeSlot2.join(','),
            peakTimeSlot2: formState.value.peakTimeSlot2.join(','),
            flatTimeSlot2: formState.value.flatTimeSlot2.join(','),
            valleyTimeSlot2: formState.value.valleyTimeSlot2.join(','),
          };
          break;
        case '2':
          params = {
            fixedUnitPrice: Number(formState.value.fixedUnitPrice),
          };
          break;
        case '3':
          params = {
            step1Max: formState.value.step1Max,
            step1UnitPrice: formState.value.step1UnitPrice,
            step2Min: formState.value.step2Min,
            step2Max: formState.value.step2Max,
            step2UnitPrice: formState.value.step2UnitPrice,
            step3Min: formState.value.step3Min,
            step3UnitPrice: formState.value.step3UnitPrice,
          };
          break;
      }
      params['categoryId'] = formState.value.categoryId
      params['billingWay'] = formState.value.billingWay
      let res = ''
      if(formState.value.id) {
        params['id'] = formState.value.id
        res = await editEnergyPriceApi(params)
      } else {
        res = await addEnergyPriceApi(params)
      }
      if(!res) {
        message.success('保存成功！');
        electricityFormRef.value.resetFields();
        props.reload()
        open.value = false;
      } else{
        message.error('保存失败！');
      }
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const closeModal = () => {
  formState.value = {
  id: null,
  categoryId: null,
  billingWay: '1',
  fixedUnitPrice: null,
  step1Max: null,
  step1UnitPrice: null,
  step2Min: null,
  step2Max: null,
  step2UnitPrice: null,
  step3Min: null,
  step3UnitPrice: null,
  tipPrice: null,
  peakPrice: null,
  flatPrice: null,
  valleyPrice: null,
  applyMonths1: [],
  tipTimeSlot1: [],
  peakTimeSlot1: [],
  flatTimeSlot1: [],
  valleyTimeSlot1: [],
  applyMonths2: [],
  tipTimeSlot2: [],
  peakTimeSlot2: [],
  flatTimeSlot2: [],
  valleyTimeSlot2: [],
}
}

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.configuration-modal {
  // height: 710px;
  width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;

  .title-box {
    padding: 0 16px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #b9b9b9;
  }

  .button-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }

  .electricity-configuration {
    width: 100%;
    height: 99%;
    border: 1px solid #b9b9b9;
  }

  .electricity-form-box {
    // height: 670px;
    width: 100%;
    padding-top: 12px;
    padding-bottom: 12px;

    .border-row {
      border: 1px solid #a0a0a0;
      margin: 0 10px;
      padding-top: 10px;
    }
  }
}
</style>

<style lang="less">
.electricity-form .ant-form-item {
  margin-bottom: 11px;
}
.water-form .ant-form-item {
  margin-bottom: 15px;
}
</style>