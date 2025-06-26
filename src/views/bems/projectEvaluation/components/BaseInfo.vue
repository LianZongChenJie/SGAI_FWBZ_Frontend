<template>
  <div class="project-evaluation-base-info">
    <div class="info-item">
      <div class="icon-box">
        <img src="/src/assets/images/investmentSituation.png" alt="">
      </div>
      <div class="title-box">
        项目投资情况
      </div>
      <div class="date-box">
        {{ overviewData.investmentAmount }}万元
      </div>
    </div>
    <div class="info-item energy-saving-benefits">
      <div class="icon-box">
        <img src="/src/assets/images/energySavingBenefits.png" alt="">
      </div>
      <div class="title-box">
        项目节能收益
      </div>
      <div class="date-box">
        {{ overviewData.energySavingBenefits }}万元
      </div>
    </div>
    <div class="info-item">
      <div class="icon-box">
        <img src="/src/assets/images/investmentReturnRatio.png" alt="">
      </div>
      <div class="title-box">
        项目投资收益比
      </div>
      <div class="date-box">
        {{ overviewData.investmentReturnRatio }}，五年期
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getProjectOverviewApi,
} from '../Standardized.api'

// 总览数据
const overviewData = ref({
  investmentReturnRatio: '',
  energySavingBenefits: '',
  investmentAmount: '',
})

onMounted(async () => {
  let res = await getProjectOverviewApi()
  overviewData.value.investmentReturnRatio = res.investmentReturnRatio
  overviewData.value.energySavingBenefits = res.energySavingBenefits
  overviewData.value.investmentAmount = res.investmentAmount
})
</script>

<style lang="less" scoped>
.project-evaluation-base-info {
  height: 100%;
  width: 100%;

  .info-item {
    height: 33%;
    width: 100%;
    padding: 10px 20px;
    display: flex;

    div{
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .icon-box{
      width: 30%;

      img{
        height: 70%;
        width: 60%;
      }
    }
    .title-box,.date-box{
      width: 35%;
      justify-content: flex-start;
      font-size: 18px;
    }
    .date-box{
      font-weight: 600;
    }
  }
  .energy-saving-benefits{
    border-top: 1px solid #bebebe;
    border-bottom: 1px solid #bebebe;
  }
}
</style>