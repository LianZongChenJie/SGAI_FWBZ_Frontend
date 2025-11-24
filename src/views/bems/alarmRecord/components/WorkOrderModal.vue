<template>
  <a-modal
    v-model:open="open"
    title="工单详情"
    @ok="handleOk"
    width="100vw"
    @cancel="closeModal"
    wrap-class-name="full-modal"
  >
    <a-form
      :model="workOrderDetail"
      name="basic"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <div class="work-order-title-box">
        <div class="text-box">
          <div class="icon-box"></div>
          事件信息
        </div>
        <div class="status-box">
          {{ '已转工单' }}
        </div>
      </div>
      <a-row>
        <a-col :span="6">
          <a-form-item
            label="编号"
            name="code"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.code"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="创建时间"
            name="createdTime"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.createdTime"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="联系人"
            name="contractPeople"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.contractPeople"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="联系电话"
            name="contractPhone"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.contractPhone"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="6">
          <a-form-item
            label="报事分类"
            name="orderType"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.orderType"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="区域"
            name="spaceName"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.spaceName"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="详细地址"
            name="address"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.address"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="紧急程度"
            name="username"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.value8"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="6">
          <a-form-item
            label="是否租区内"
            name="isArea"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.isArea"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="是否有偿"
            name="isPaid"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.isPaid"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="是否代客报事"
            name="forCustomer"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.forCustomer"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="价格"
            name="price"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.price"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="6">
          <a-form-item
            label="创建人"
            name="creatPeopleId"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.creatPeopleId"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 20 }"
            label="问题描述"
            name="description"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.description"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="图片"
            name="username"
          >
            <a-input
              :bordered="false"
              v-model:value="workOrderDetail.username"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <div class="work-order-title-box">
        <div class="text-box">
          <div class="icon-box">

          </div>
          事件记录
        </div>
      </div>
      <div
        class="event-item"
        v-for="(item,index) in workList"
        :key="index"
      >
        <div class="transfer-ticket-title">
          {{item.flowCode}}
        </div>
        <div class="transfer-ticket-box">
          <div class="transfer-ticket-item">
            {{item.operatorName}} {{item.operationTime}} {{item.operationName}}
          </div>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { getWorkOrderDetailApi, getWorkOrderDetailInfoApi } from '../Standardized.api';

const open = ref<boolean>(false);

const workOrderDetail = ref<any>({
  code: '20251030155919500',
  createdTime: '2025-10-30 15:59:20',
  contractPeople: '32',
  contractPhone: '1888888888',
  orderType: '报事报修',
  spaceName: '基础物业项目部',
  address: '石景山万达，石景山万达，E座，26层（电梯29层）',
  isPaid: '是',
  forCustomer: '否',
  price: '否',
  creatPeopleId: '1',
  description: '1',
  value13: '刘鹏',
  value14: '1',
});

const workList = ref([
  {
    flowCode: '转工单',
    operatorName: '刘鹏',
    operationTime: '2025-10-30 15:59:29',
    operationName: '转工单',
  },
  {
    flowCode: '提交事件',
    operatorName: '刘鹏',
    operationTime: '2025-10-30 15:59:29',
    operationName: '转工单',
  },
]);

// 打开弹框
const showModal = async (record) => {
  // workOrderDetail.value = record;
  await getWorkOrderDetail(record.id);
  open.value = true;
};

// 获取工单详情
const getWorkOrderDetail = async (id) => {
  let res = await getWorkOrderDetailApi({ eventId: id });
  if(res.event) workOrderDetail.value = res.event
  if(res.operateRecords.length) workList.value = res.operateRecords
};

const handleOk = (e: MouseEvent) => {
  open.value = false;
};

const closeModal = () => {
  open.value = false;
};

onMounted(async () => {});

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
.work-order-title-box {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 16px;
  margin-bottom: 12px;

  .text-box {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .icon-box {
      height: 20px;
      border-right: 4px solid #439eff;
      margin-right: 8px;
    }
  }
}

.event-item {
  .transfer-ticket-title {
    padding-left: 40px;
    height: 30px;
    font-size: 14px;
  }
  .transfer-ticket-box {
    padding-left: 40px;
    .transfer-ticket-item {
      height: 30px;
      color: #9b9a9a;
    }
  }
}
</style>

<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
  }
}
</style>