<template>
  <div class="substation-distribution-main-box">
    <div class="base-info-box">
      <div class="date-box">
        <div class="date-item">
          <date-item :title="'高压配电室(个)'" :number="'3'"/>
        </div>
        <div class="date-item">
          <date-item :title="'变压器(个)'" :number="'10'"/>
        </div>
        <div class="date-item">
          <date-item :title="'总装机容量(kVA)'" :number="'17700'"/>
        </div>
        <div class="date-item">
          <date-item :title="'当前总功率(kW)'" :number="'5000'"/>
        </div>
        <div class="date-item">
          <date-item :title="'当日总耗电(kWh)'" :number="'36889'"/>
        </div>
        <div class="date-item">
          <date-item :title="'当日报警(个)'" :number="'12'"/>
        </div>
      </div>
      <div class="table-box">
        <operation-monitoring-table />
      </div>
    </div>
    <div class="topo-box">
      <topo-component />
    </div>
  </div>  
</template>

<script setup lang="ts">
import DateItem from './DateItem.vue'
import OperationMonitoringTable from './OperationMonitoringTable.vue'
import TopoComponent from './TopoComponent.vue'
import { ref } from 'vue';

</script>

<style scoped lang="less">
.substation-distribution-main-box{
  padding: 0 20px;
  width: 100%;
  height: 80vh;
  .base-info-box{
    height: 40%;
    display: flex;
    justify-content: space-around;
    .date-box{
      background-color: #fff;
      border-radius: 10px;
      width: 34%;
      height: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
      .date-item{
        width: 30%;
        height: 48%;
      }
    }
    .table-box{
      width: 65%;
      height: 100%;
    }
  }
  .topo-box{
    height: 60%;
    width: 100%;
  }
}
</style>