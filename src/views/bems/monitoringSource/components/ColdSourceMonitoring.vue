<template>
  <div class="cold-source-monitoring">
    <div class="base-info-box">
      <div class="cold-source-system">
        <div class="total-box">
          <div class="title-box">
            冷源系统季节能效比
          </div>
          <div
            class="data-item"
            v-for="(item,index) in data"
            :key="index"
            :style="{ width: item.value + '%'}"
          >
            <div class="data-number">
              {{ item.value }}
            </div>
            <div
              class="color-box"
              :style="{ backgroundColor: item.color }"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="cold-water">
        <div class="icon-box icon1">

        </div>
        <div class="data-box">
          <div class="number-box">{{ '0.99' }}</div>
          <div>{{ '冷水机组季节能耗比' }}</div>
        </div>
      </div>
      <div class="cold-water">
        <div class="icon-box icon2">

        </div>
        <div class="data-box">
          <div class="number-box">{{ '410.80' }}</div>
          <div>{{ '冷冻水输送系数' }}</div>
        </div>
      </div>
      <div class="cold-water">
        <div class="icon-box icon3">

        </div>
        <div class="data-box">
          <div class="number-box">{{ '1864.37' }}</div>
          <div>{{ '冷却水输送系数' }}</div>
        </div>
      </div>
    </div>
    <div class="tupo-box">
      <div
        class="code-tupo-box"
        ref="coldSourceMonitoring"
      >

      </div>
    </div>
    <div class="cooling-efficiency-box">
      <CoolingEfficiencyChart />
    </div>
    <div class="scatter-plot-box">
      <ScatterPlotChart />
    </div>
  </div>
</template>

<script setup lang="ts">
import CoolingEfficiencyChart from './CoolingEfficiencyChart.vue';
import ScatterPlotChart from './ScatterPlotChart.vue';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const data = [
  { name: '类别A', value: 35, color: '#5470c6' },
  { name: '类别B', value: 30, color: '#91cc75' },
  { name: '类别C', value: 20, color: '#fac858' },
  { name: '类别D', value: 15, color: '#ee6666' },
];

const coldSourceMonitoring = ref();

const gv = ref();
const dm = ref();

onMounted(() => {
  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(coldSourceMonitoring.value, {
    fill: false, // 关闭自动填充
  });
  initTopo();
});

const initTopo = () => {
  gv.value.isMovable = function () {
    return false;
  }; // 禁止移动
  gv.value.getSelectWidth = function () {
    return 0;
  }; // 禁止选中
  gv.value.deserialize('storage/displays/beiyi/lengYuanJianKong.json', function (json, dm, gv, data) {
    const targetNode1 = dm.getDataByTag('lqt1-1');
    const targetNode2 = dm.getDataByTag('lqt1-2');
    const targetNode3 = dm.getDataByTag('lqt1-3');
    const targetNode4 = dm.getDataByTag('lqt2-1');
    const targetNode5 = dm.getDataByTag('fenShuiQi');
    console.log('targetNode------------------>', targetNode1,targetNode2,targetNode3,targetNode4);
    targetNode5.a('FSQGJYpressureValue', '66℃');
    if (targetNode1) {
      targetNode1.a('loadValue', '26');
      targetNode1.a('lqtCode', '1-1');
    }
    if (targetNode2) {
      targetNode2.a('loadValue', '74');
      targetNode2.a('lqtCode', '1-2');
    }
    if (targetNode3) {
      targetNode3.a('loadValue', '54');
      targetNode3.a('lqtCode', '1-3');
    }
    if (targetNode4) {
      targetNode4.a('loadValue', '783');
      targetNode4.a('lqtCode', '2-1');
    }
    // setInterval(() => {
    //   if (targetNode1) {
    //     let str1 = Math.random() * 10 + '';
    //     targetNode1.a('PValue', str1);
    //     let str2 = Math.random() * 10 + '';
    //     targetNode1.a('UaValue', str2);
    //     let str3 = Math.random() * 10 + '';
    //     targetNode1.a('UbValue', str3);
    //     let str4 = Math.random() * 10 + '';
    //     targetNode1.a('UcValue', str4);
    //     let str5 = Math.random() * 10 + '';
    //     targetNode1.a('IaValue', str5);
    //     let str6 = Math.random() * 10 + '';
    //     targetNode1.a('IbValue', str6);
    //     let str7 = Math.random() * 10 + '';
    //     targetNode1.a('IcValue', str7);
    //     let str8 = Math.random() * 10 + '';
    //     targetNode1.a('PFValue', str8);
    //     let str9 = Math.random() * 10 + '';
    //     targetNode1.a('FValue', str9);
    //     let str10 = Math.random() * 10 + '';
    //     targetNode1.a('EPValue', str10);
    //     let str11 = Math.random() * 10 + '';
    //     targetNode1.a('LFValue', str11);
    //   }
    //   if (targetNode2) {
    //     let str1 = Math.random() * 10 + '';
    //     targetNode2.a('PValue', str1);
    //     let str2 = Math.random() * 10 + '';
    //     targetNode2.a('UaValue', str2);
    //     let str3 = Math.random() * 10 + '';
    //     targetNode2.a('UbValue', str3);
    //     let str4 = Math.random() * 10 + '';
    //     targetNode2.a('UcValue', str4);
    //     let str5 = Math.random() * 10 + '';
    //     targetNode2.a('IaValue', str5);
    //     let str6 = Math.random() * 10 + '';
    //     targetNode2.a('IbValue', str6);
    //     let str7 = Math.random() * 10 + '';
    //     targetNode2.a('IcValue', str7);
    //     let str8 = Math.random() * 10 + '';
    //     targetNode2.a('PFValue', str8);
    //     let str9 = Math.random() * 10 + '';
    //     targetNode2.a('FValue', str9);
    //     let str10 = Math.random() * 10 + '';
    //     targetNode2.a('EPValue', str10);
    //     let str11 = Math.random() * 10 + '';
    //     targetNode2.a('LFValue', str11);
    //   }
    //   if (targetNode3) {
    //     let str1 = Math.random() * 10 + '';
    //     targetNode3.a('PValue', str1);
    //     let str2 = Math.random() * 10 + '';
    //     targetNode3.a('UaValue', str2);
    //     let str3 = Math.random() * 10 + '';
    //     targetNode3.a('UbValue', str3);
    //     let str4 = Math.random() * 10 + '';
    //     targetNode3.a('UcValue', str4);
    //     let str5 = Math.random() * 10 + '';
    //     targetNode3.a('IaValue', str5);
    //     let str6 = Math.random() * 10 + '';
    //     targetNode3.a('IbValue', str6);
    //     let str7 = Math.random() * 10 + '';
    //     targetNode3.a('IcValue', str7);
    //     let str8 = Math.random() * 10 + '';
    //     targetNode3.a('PFValue', str8);
    //     let str9 = Math.random() * 10 + '';
    //     targetNode3.a('FValue', str9);
    //     let str10 = Math.random() * 10 + '';
    //     targetNode3.a('EPValue', str10);
    //     let str11 = Math.random() * 10 + '';
    //     targetNode3.a('LFValue', str11);
    //   }
    //   if (targetNode4) {
    //     let str1 = Math.random() * 10 + '';
    //     targetNode4.a('PValue', str1);
    //     let str2 = Math.random() * 10 + '';
    //     targetNode4.a('UaValue', str2);
    //     let str3 = Math.random() * 10 + '';
    //     targetNode4.a('UbValue', str3);
    //     let str4 = Math.random() * 10 + '';
    //     targetNode4.a('UcValue', str4);
    //     let str5 = Math.random() * 10 + '';
    //     targetNode4.a('IaValue', str5);
    //     let str6 = Math.random() * 10 + '';
    //     targetNode4.a('IbValue', str6);
    //     let str7 = Math.random() * 10 + '';
    //     targetNode4.a('IcValue', str7);
    //     let str8 = Math.random() * 10 + '';
    //     targetNode4.a('PFValue', str8);
    //     let str9 = Math.random() * 10 + '';
    //     targetNode4.a('FValue', str9);
    //     let str10 = Math.random() * 10 + '';
    //     targetNode4.a('EPValue', str10);
    //     let str11 = Math.random() * 10 + '';
    //     targetNode4.a('LFValue', str11);
    //   }
    // }, 5000);
    gv.fitContent(); // 适配内容
  });
};
</script>

<style lang="less" scoped>
.cold-source-monitoring {
  margin: 0px 10px;
  width: 100%;
  height: 81vh;
  overflow: auto;
  background-color: #fff;

  .base-info-box {
    
    padding: 0 16px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100px;
    width: 100%;

    .cold-source-system {
      width: 40%;
      height: 100%;
      border-radius: 10px;
      box-shadow: 2px 2px 2px 2px #dfdddd;
      padding: 0 12px;
      display: flex;

      .total-box {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
        flex-wrap: wrap;

        .title-box {
          width: 100%;
        }

        .data-item {
          height: 60px;

          .data-number {
            width: 100%;
            text-align: end;
          }

          .color-box {
            width: 100%;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
          }
        }
      }
    }

    .cold-water {
      width: 19%;
      height: 100%;
      box-shadow: 2px 2px 2px 2px #dfdddd;
      padding: 0 12px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      border-radius: 10px;

      .icon-box {
        height: 80px;
        width: 80px;
        border-radius: 5px;
      }
      .icon1 {
        background-image: url('/src/assets/images/coldWaterIcon1.png');
        background-size: 100% 100%;
      }
      .icon2 {
        background-image: url('/src/assets/images/coldWaterIcon2.png');
        background-size: 100% 100%;
      }
      .icon3 {
        background-image: url('/src/assets/images/coldWaterIcon3.png');
        background-size: 100% 100%;
      }
      .data-box {
        height: 80px;
        width: calc(100% - 80px);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        align-content: center;
        padding-left: 16px;

        div {
          width: 100%;
        }

        .number-box {
          font-size: 24px;
          font-weight: 600;
        }
      }
    }
  }

  .tupo-box {
    position: relative;
    height: 80vh;
    width: 100%;
    padding: 0 16px;

    .code-tupo-box {
      position: absolute;
      height: 100%;
      width: 100%;
    }
  }

  .cooling-efficiency-box {
    padding-top: 8px;
    margin-top: 16px;
    height: 40vh;
    width: 100%;
    background-color: #f1efef;
  }

  .scatter-plot-box {
    height: 80vh;
    width: 100%;
    background-color: #f1efef;
  }
}
</style>