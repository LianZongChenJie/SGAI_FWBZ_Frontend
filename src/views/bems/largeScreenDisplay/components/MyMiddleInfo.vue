<template>
  <div class="my-middle-info">
    <div class="model-box"></div>
    <div class="title-box">
      <MyTitle :title="'安消防主题'" />
    </div>
    <div class="handling-status">
      <div class="handling-title">
        处理情况
      </div>
      <div class="status-info-box">
        <div class="status-item">
          <MyHandlingStatus :value="rateNum.fireRate"/>
        </div>
        <div class="status-item">
          <MyHandlingStatus :title="'异常处理及时率'" :value="rateNum.exceptionRate"/>
        </div>
        <div class="status-item">
          <MyHandlingStatus :title="'故障处理及时率'" :value="rateNum.exceptionRate"/>
        </div>
      </div>
    </div>
    <div class="certificate-status">
      <div class="certificate-title">
        持证状态
      </div>
      <div class="people-info">
        <div class="fire-room-duty">
          <div>
            消防室值守&ensp;<span>{{ peopleNum.onDuty }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/certifiedIcon.png">&ensp;持证人数&ensp;<span>{{ peopleNum.onDutyCertificate }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/notCertifiedIcon.png">&ensp;未持证人数&ensp;<span style="color: red;">{{ peopleNum.onDutyNoCertificate }}</span>&ensp;人
          </div>
        </div>
        <div class="maintenance-personnel">
          <div>
            维保人员&ensp;<span>{{ peopleNum.maintenance }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/certifiedIcon.png">&ensp;持证人数&ensp;<span>{{ peopleNum.maintenanceCertificate }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/notCertifiedIcon.png">&ensp;未持证人数&ensp;<span style="color: red;">{{ peopleNum.maintenanceNoCertificate }}</span>&ensp;人
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyTitle from './MyTitle.vue';
import MyHandlingStatus from './MyHandlingStatus.vue';
import { ref, onMounted } from 'vue'
import { 
  getSituationStatisticApi,
  getScreenFireControlRoomApi,
} from '../Standardized.api'

const rateNum = ref({
  fireRate: '0',
  faultRate: '0',
  exceptionRate: '0',
})

const peopleNum = ref({
  onDutyNoCertificate: '0',
  maintenanceNoCertificate: '0',
  maintenanceCertificate: '0',
  onDutyCertificate: '0',
  onDuty: '0',
  maintenance: '0',
})

onMounted(async () => {
 await getSituationStatistic()
 await getScreenFireControlRoom()
})


const getSituationStatistic = async () => {
 let res:any = await getSituationStatisticApi()
  for(let key in res) {
  rateNum.value[key] = res[key] * 100 + '%'
 }
}


const getScreenFireControlRoom = async () => {
 let res:any = await getScreenFireControlRoomApi()
 for(let key in res) {
  peopleNum.value[key] = res[key]
 }
}
</script>

<style lang="less" scoped>
.my-middle-info {
  height: 100%;
  width: 100%;

  .model-box {
    width: 100%;
    height: 55%;
    background-image: url('@/assets/images/homePage.png');
    background-size: 100% 100%;
  }
  .title-box {
    margin-top: 5px;
    height: 30px;
  }
  .handling-status,
  .certificate-status {
    width: 100%;
    height: 20%;
    margin-top: 5px;
    background-image: url('@/assets/images/hadnleingStatus.png');
    background-size: 100% 100%;

    .handling-title,
    .certificate-title {
      color: #fff;
      height: 20%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-end;
      padding-left: 6%;
      font-size: 16px;
    }

    .status-info-box {
      height: 80%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;

      .status-item {
        width: 20%;
        height: 90%;
      }
    }

    .people-info {
      height: 80%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      > div {
        height: 100%;
        width: 50%;
        border-right: 1px dashed #eeba0f;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        align-content: center;

        > div {
          color: #fff;
          width: 80%;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 25%;
          font-size: 16px;

          >span{
            font-size: 22px;
            color: #70e3f8;
          }
        }
      }

      .maintenance-personnel {
        border-left: 1px dashed #eeba0f;
        border-right: none;
      }
    }
  }

  .certificate-status {
    height: calc(19.5% - 12px);
    margin-top: 12px;
  }
}
</style>