<template>
  <div class="energy-and-coal">
    <div class="coal-box">
      <div class="coal-title">
        碳足迹
      </div>
      <div class="coal-statistics">
        <div
          class="statistics-item"
          v-for="(item,index) in statisticsList"
          :key="index"
        >
          <div
            class="statistics-title"
            :style="{'background-color': item.color}"
          >
            {{ item.title }}
          </div>
          <div class="data-title">
            实际排放量(吨)
          </div>
          <div
            class="statistics-data"
            :style="{'color': item.color}"
          >
            {{ item.value }}
          </div>
          <div class="comparison-value">
            {{item.comparisonTitle}}&emsp;<span :id="(item.compareValue !== '--') && item.compareValue.includes('-') ? '' : 'rising'">{{ item.compareValue }}
              <FallOutlined
                v-if="(item.compareValue !== '--') && item.compareValue.includes('-')"
                style="color: #1edf1e;"
              />
              <RiseOutlined
                v-else
                style="color: red;"
              />
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { FallOutlined, RiseOutlined } from '@ant-design/icons-vue';
import {
  getCarbonFootprintApi,
} from '../Standardized.api';


const statisticsList = ref([
  {
    color: '#edad24',
    title: '今日',
    comparisonTitle: '较昨日',
    value: '759259292192.1',
    compareValue: '+2.5%',
  },
  {
    color: '#ffa626',
    title: '本周',
    comparisonTitle: '较上周',
    value: '72.1',
    compareValue: '+2.5%',
  },
  {
    color: '#ff8f43',
    title: '本月',
    comparisonTitle: '较上月',
    value: '72.1',
    compareValue: '+2.5%',
  },
  {
    color: '#ff755d',
    title: '本季度',
    comparisonTitle: '较上季度',
    value: '72.1',
    compareValue: '+2.5%',
  },
  {
    color: '#ff6271',
    title: '本年',
    comparisonTitle: '较去年',
    value: '72.1',
    compareValue: '--2.5%',
  },
]);

const unit = ref('吨');

// 获取碳足迹数据
const getCarbonFootprint = async () => {
  let res = await getCarbonFootprintApi();
  statisticsList.value[0].value = res.todayCarbonEmission;
  statisticsList.value[0].compareValue = res.todayCarbonEmissionCompare;

  statisticsList.value[1].value = res.weekCarbonEmission;
  statisticsList.value[1].compareValue = res.weekCarbonEmissionCompare;

  statisticsList.value[2].value = res.monthCarbonEmission;
  statisticsList.value[2].compareValue = res.monthCarbonEmissionCompare;

  statisticsList.value[3].value = res.quarterCarbonEmission;
  statisticsList.value[3].compareValue = res.quarterCarbonEmissionCompare;

  statisticsList.value[4].value = res.yearCarbonEmission;
  statisticsList.value[4].compareValue = res.yearCarbonEmissionCompare;
};

onMounted(() => {
  getCarbonFootprint();
});

</script>

<style lang="less" scoped>
.energy-and-coal {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;

  .coal-box {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 10px;
    padding: 6px 12px;

    .coal-title {
      height: 30px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .coal-statistics {
      height: calc(100% - 30px);
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      background-color: #f0eeee;

      .statistics-item {
        width: 19%;
        height: 96%;
        background-color: #fff;
        border-radius: 5px;

        .statistics-title {
          padding: 0 8px;
          height: 50px;
          width: 100%;
          font-size: 26px;
          color: #fff;
          font-weight: 600;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          background-color: #edad24;
          border-radius: 5px 5px 0 0;
        }

        .data-title {
          width: 100%;
          font-size: 22px;
          font-weight: 600;
          padding-left: 10%;
          margin-top: 10%;
        }

        .statistics-data {
          font-size: 40px;
          font-weight: 600;
          padding-left: 10%;
          color: #edad24;
          overflow: hidden; /* 隐藏溢出内容 */
          white-space: nowrap; /* 防止文本换行 */
          text-overflow: ellipsis; /* 显示省略号 */
        }

        .comparison-value {
          padding-left: 10%;
          width: 100%;
          font-size: 18px;

          > span {
            color: #1edf1e;
          }

          #rising {
            color: red;
          }
        }
      }
    }
  }
}
</style>