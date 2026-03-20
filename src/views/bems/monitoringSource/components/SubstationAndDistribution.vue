<template>
  <div class="substation-distribution-main-box">
    <div class="base-info-box">
      <!-- <div class="date-box">
        <div class="date-item">
          <date-item :title="'今日报警数'" :number="'6'"/>
        </div>
        <div class="date-item">
          <date-item :title="'昨日报警数'" :number="'8'"/>
        </div>
        <div class="date-item">
          <date-item :title="'环比'" :number="'15%'"/>
        </div>
        <div class="date-item">
          <date-item :title="'本月报警数'" :number="'60'"/>
        </div>
        <div class="date-item">
          <date-item :title="'上月报警数'" :number="'80'"/>
        </div>
        <div class="date-item">
          <date-item :title="'环比'" :number="'15'"/>
        </div>
      </div> -->
      <!-- <div class="table-box"> -->
        <operation-monitoring-table />
      <!-- </div> -->
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
        display: flex;
        justify-content: center;
        align-items: center;
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