<template>
  <div class="water-supply-and-drainage" ref="waterSupplyDrainage" id="waterSupplyDrainageTopo">

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const waterSupplyDrainage = ref()

const gv = ref();
const dm = ref();

onMounted(() => {
  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(waterSupplyDrainage.value, {
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
  gv.value.deserialize('storage/displays/jiPaiShui.json', function (json, dm, gv, data) {
    const targetNode1 = dm.getDataByTag('dongShiZhengTag');
    const targetNode2 = dm.getDataByTag('xiShiZhengTag');
    const targetNode3 = dm.getDataByTag('xiJuYuanTag');
    const targetNode4 = dm.getDataByTag('yinYueTingTag');
    console.log('targetNode1------------>', targetNode1.a);
    if (targetNode1) {
      targetNode1.a('value', '15');
    }
    if (targetNode2) {
      targetNode2.a('value', '17');
    }
    if (targetNode3) {
      targetNode3.a('value', '5');
    }
    if (targetNode4) {
      targetNode4.a('value', '11');
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
.water-supply-and-drainage {
  margin: 0px 10px;
  width: 100%;
  height: 81vh;
  overflow: auto;
  background-color: #fff;
}
</style>