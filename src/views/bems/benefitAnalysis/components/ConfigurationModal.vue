<template>
  <a-modal
    v-model:open="open"
    title="配置"
    width="1200px"
    :footer="null"
  >
    <div class="configuration-modal">
      <div class="electricity-configuration">
        <div class="title-box">
          电
        </div>
        <div class="electricity-form-box">
          <a-form
            :model="electricityForm"
            ref="electricityFormRef"
            class="electricity-form"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-row>
              <a-col :span="12">
                <a-form-item
                  label="计费方式"
                  name="billingMethod"
                  :rules="[{ required: true, message: '请选择计费方式' }]"
                >
                  <a-select
                    placeholder="请选择计费方式"
                    v-model:value="electricityForm.billingMethod"
                    :options="methodOptions"
                  >
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-show="!electricityForm.billingMethod">
              <a-col :span="12">
                <a-form-item
                  label="固定单价"
                  name="billingMethod"
                  :rules="[{ required: true, message: '请输入固定单价' }]"
                >
                  <a-input
                    placeholder="请输入固定单价"
                    v-model:value="electricityForm.billingMethod"
                  >
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-show="electricityForm.billingMethod">
              <a-col :span="12">
                <a-form-item
                  label="尖电价"
                  name="ruleCode"
                  :rules="[{ required: true, message: '请输入尖电价' }]"
                >
                  <a-input
                    placeholder="请输入尖电价"
                    v-model:value="electricityForm.billingMethod"
                  >
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="峰电价"
                  name="ruleCode"
                  :rules="[{ required: true, message: '请输入峰电价' }]"
                >
                  <a-input
                    placeholder="请输入峰电价"
                    v-model:value="electricityForm.billingMethod"
                  >
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-show="electricityForm.billingMethod">
              <a-col :span="12">
                <a-form-item
                  label="平电价"
                  name="ruleCode"
                  :rules="[{ required: true, message: '请输入平电价' }]"
                >
                  <a-input
                    placeholder="请输入平电价"
                    v-model:value="electricityForm.billingMethod"
                  >
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="谷电价"
                  name="ruleCode"
                  :rules="[{ required: true, message: '请输入谷电价' }]"
                >
                  <a-input
                    placeholder="请输入谷电价"
                    v-model:value="electricityForm.billingMethod"
                  >
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row
              v-show="electricityForm.billingMethod"
              class="border-row"
            >
              <a-col :span="24">
                <a-form-item
                  label="适用月份"
                  name="month1"
                  :rules="[{ required: true, message: '请选择适用月份', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 21 }"
                >
                  <a-checkbox-group
                    v-model:value="electricityForm.month1"
                    name="checkboxgroup"
                  >
                    <a-row>
                      <a-col
                        :span="2"
                        v-for="(item,index) in monthOptions"
                        :key="index"
                      >
                        <a-checkbox :value="item.value">{{ item.label }}</a-checkbox>
                      </a-col>
                    </a-row>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="尖时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择尖时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="峰时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择峰时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="平时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择平时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="谷时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择谷时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row
              v-show="electricityForm.billingMethod"
              class="border-row"
              style="margin-top: 15px;"
            >
              <a-col :span="24">
                <a-form-item
                  label="适用月份"
                  name="month1"
                  :rules="[{ required: true, message: '请选择适用月份', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 21 }"
                >
                  <a-checkbox-group
                    v-model:value="electricityForm.month1"
                    name="checkboxgroup"
                  >
                    <a-row>
                      <a-col
                        :span="2"
                        v-for="(item,index) in monthOptions"
                        :key="index"
                      >
                        <a-checkbox :value="item.value">{{ item.label }}</a-checkbox>
                      </a-col>
                    </a-row>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="尖时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择尖时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="峰时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择峰时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="平时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择平时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col>
                <a-form-item
                  label="谷时段"
                  name="month1"
                  :rules="[{ required: true, message: '请选择谷时段', type: 'array' }]"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-select
                    v-model:value="electricityForm.month1"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择时段"
                    :showArrow="true"
                    :options="[...Array(25)].map((_, i) => ({ value: (i + 10).toString(36) + (i + 1) }))"
                  ></a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <div class="button-box">
              <a-button>保存</a-button>
            </div>
          </a-form>
        </div>
      </div>
      <div class="water-heat-configuration">
        <div class="water-configuration">
          <div class="title-box">
            水
          </div>
          <div class="water-form-box">
            <a-form
              :model="waterForm"
              ref="waterFormRef"
              class="water-form"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 16 }"
            >
              <a-row>
                <a-col :span="24">
                  <a-form-item
                    label="计费方式"
                    name="billingMethod"
                    :rules="[{ required: true, message: '请选择计费方式' }]"
                  >
                    <a-select
                      placeholder="请选择计费方式"
                      v-model:value="waterForm.billingMethod"
                      :options="methodOptionsWater"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row v-show="!waterForm.billingMethod">
                <a-col :span="24">
                  <a-form-item
                    label="固定单价"
                    name="billingMethod"
                    :rules="[{ required: true, message: '请输入固定单价' }]"
                  >
                    <a-input
                      placeholder="请输入固定单价"
                      v-model:value="waterForm.billingMethod"
                    >
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row
                class="border-row"
                v-show="waterForm.billingMethod"
              >
                <a-form-item
                  label="第一阶段"
                  name="billingMethod"
                  :rules="[{ required: true, message: '请输入尖电价' }]"
                >
                  <a-input-group>
                    <a-row :gutter="4">
                      <a-col :span="12">
                        <a-input v-model:value="waterForm.value1" />
                        <div class="input-tip">最大水量</div>
                      </a-col>
                      <a-col :span="12">
                        <a-input v-model:value="waterForm.value2" />
                        <div class="input-tip">单价</div>
                      </a-col>
                    </a-row>
                  </a-input-group>
                </a-form-item>
              </a-row>
              <a-row
                class="border-row"
                v-show="waterForm.billingMethod"
                style="margin-top: 15px;"
              >
                <a-form-item
                  label="第二阶段"
                  name="billingMethod"
                  :rules="[{ required: true, message: '请输入尖电价' }]"
                >
                  <a-input-group>
                    <a-row :gutter="4">
                      <a-col :span="8">
                        <a-input v-model:value="waterForm.value1" />
                        <div class="input-tip">最小水量</div>
                      </a-col>
                      <a-col :span="8">
                        <a-input v-model:value="waterForm.value1" />
                        <div class="input-tip">最大水量</div>
                      </a-col>
                      <a-col :span="8">
                        <a-input v-model:value="waterForm.value2" />
                        <div class="input-tip">单价</div>
                      </a-col>
                    </a-row>
                  </a-input-group>
                </a-form-item>
              </a-row>
              <a-row
                class="border-row"
                v-show="waterForm.billingMethod"
                style="margin-top: 15px;"
              >
                <a-form-item
                  label="第三阶段"
                  name="billingMethod"
                  :rules="[{ required: true, message: '请输入尖电价' }]"
                >
                  <a-input-group>
                    <a-row :gutter="4">
                      <a-col :span="12">
                        <a-input v-model:value="waterForm.value1" />
                        <div class="input-tip">最小水量</div>
                      </a-col>
                      <a-col :span="12">
                        <a-input v-model:value="waterForm.value2" />
                        <div class="input-tip">单价</div>
                      </a-col>
                    </a-row>
                  </a-input-group>
                </a-form-item>
              </a-row>
              <div class="button-box">
                <a-button>保存</a-button>
              </div>
            </a-form>
          </div>
        </div>
        <div class="heat-configuration">
          <div class="title-box">
            热
          </div>
          <div class="heat-form-box">
            <a-form
              :model="heatForm"
              ref="heatFormRef"
              class="heat-form"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 16 }"
            >
              <a-row>
                <a-col :span="24">
                  <a-form-item
                    label="计费方式"
                    name="billingMethod"
                    :rules="[{ required: true, message: '请选择计费方式' }]"
                  >
                    <a-select
                      placeholder="请选择计费方式"
                      v-model:value="heatForm.billingMethod"
                      :options="methodOptionsheat"
                    >
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row v-show="!heatForm.billingMethod">
                <a-col :span="24">
                  <a-form-item
                    label="固定单价"
                    name="billingMethod"
                    :rules="[{ required: true, message: '请输入固定单价' }]"
                  >
                    <a-input
                      placeholder="请输入固定单价"
                      v-model:value="heatForm.billingMethod"
                    >
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <div class="button-box">
                <a-button>保存</a-button>
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

const open = ref<boolean>(false);

const electricityFormRef = ref();
// 电计费方式options
const methodOptions = [
  {
    label: '固定计价',
    value: 0,
  },
  {
    label: '峰谷分时计价',
    value: 1,
  },
];
// 月份options
const monthOptions = [
  {
    label: '01',
    value: 1,
  },
  {
    label: '02',
    value: 2,
  },
  {
    label: '03',
    value: 3,
  },
  {
    label: '04',
    value: 4,
  },
  {
    label: '05',
    value: 5,
  },
  {
    label: '06',
    value: 6,
  },
  {
    label: '07',
    value: 7,
  },
  {
    label: '08',
    value: 8,
  },
  {
    label: '09',
    value: 9,
  },
  {
    label: '10',
    value: 10,
  },
  {
    label: '11',
    value: 11,
  },
  {
    label: '12',
    value: 12,
  },
];

// 电的表单数据
const electricityForm = ref({
  billingMethod: 1,
  month1: [],
});

const waterFormRef = ref();
// 水计费方式options
const methodOptionsWater = [
  {
    label: '固定计价',
    value: 0,
  },
  {
    label: '阶梯计价',
    value: 1,
  },
];

// 水的表单数据
const waterForm = ref({
  billingMethod: 1,
  month1: [],
  value1: '',
  value2: '',
});

const heatFormRef = ref();
// 热计费方式options
const methodOptionsheat = [
  {
    label: '固定计价',
    value: 0,
  }
];

// 热的表单数据
const heatForm = ref({
  billingMethod: 0,
  month1: [],
  value1: '',
  value2: '',
});
</script>

<style lang="less" scoped>
.configuration-modal {
  height: 710px;
  width: 1200px;
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
    width: 64%;
    height: 99%;
    border: 1px solid #b9b9b9;
  }

  .electricity-form-box {
    height: 670px;
    width: 100%;
    padding-top: 12px;

    .border-row {
      border: 1px solid #a0a0a0;
      margin: 0 10px;
      padding-top: 10px;
    }
  }

  .water-form-box {
    padding-top: 12px;

    .border-row {
      border: 1px solid #a0a0a0;
      margin: 0 10px;
      padding-top: 10px;
    }

    .input-tip {
      text-align: center;
    }
  }

  .heat-form-box {
    padding-top: 12px;
  }

  .water-heat-configuration {
    width: 35.5%;
    height: 100%;

    .water-configuration {
      height: 63%;
      width: 100%;
      border: 1px solid #b9b9b9;

      .water-form-box {
        height: calc(100% - 30px);
      }
    }

    .heat-configuration {
      margin-top: 2%;
      height: 35%;
      width: 100%;
      border: 1px solid #b9b9b9;
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