<template>
  <div class="cost-analysis">
    <div class="button-box">
      <a-button>配置</a-button>
    </div>
    <div class="analysis-box">
      <div class="analysis-item electricity-analysis">
        <CostAnalysisItem :title="'电'" :pieId="'electricityPie'" :barId="'electricityBar'" :total-suffix="'KW.H'" :category="'electricity'" />
        <div class="divider-item"></div>
      </div>
      <div class="analysis-item water-analysis">
        <CostAnalysisItem :title="'水'" :pieId="'waterPie'" :barId="'waterBar'" :total-suffix="'吨'" :category="'electricity'" />
        <div class="divider-item"></div>
      </div>
      <div class="analysis-item heat-analysis">
        <CostAnalysisItem :title="'热'" :pieId="'heatPie'" :barId="'heatBar'" :total-suffix="'kcar'" :category="'electricity'" />
        <div class="divider-item"></div>
      </div>
      <div class="analysis-item table-box">

      </div>
    </div>
    <ConfigurationModal />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CostAnalysisItem from './CostAnalysisItem.vue'
import ConfigurationModal from './ConfigurationModal.vue'

</script>

<style lang="scss" scoped>
.cost-analysis {
  display: flex;
  flex-wrap: wrap;
  height: 82vh;
  width: 100%;
  padding: 0 16px;

  .button-box {
    width: 100%;
    height: 40px;
    text-align: end;
  }

  .analysis-box {
    background-color: #fff;
    height: calc(100% - 40px);
    width: 100%;
    padding: 20px 30px;
    overflow: auto;
    .analysis-item {
      height: 370px;
      .divider-item{
        width: 96%;
        margin: 20px 0;
        margin-left: 2%;
        border-top: 2px solid #bdbbbb;
      }
    }

    .electricity-analysis{
      border: 2px solid #bdbbbb;
      border-bottom: none;
    }
    .water-analysis, .heat-analysis{
      border-left: 2px solid #bdbbbb;
      border-right: 2px solid #bdbbbb;
    }
    .table-box{
      border: 2px solid #bdbbbb;
      border-top: none;
    }
  }
}
</style>