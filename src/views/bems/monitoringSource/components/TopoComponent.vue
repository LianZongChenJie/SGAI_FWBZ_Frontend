<template>
  <div class="topo-component-main-box">
    <div class="topo-title">
      <div class="icon-box"></div>
      <span>变配电工艺监测</span>
    </div>
    <div class="container-box">
      <div class="tree-box">
        <a-tree
          :tree-data="treeData"
          v-model:checkedKeys="checkedKeys"
          checkable
          @check="handleSelect"
        />
      </div>
      <div
        class="dinalu-topo-box"
      >
      <div ref="container" id="dianLuTopo">

      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const treeData = ref([
  {
    title: '变配电系统',
    key: '1',
    children: [
      { title: '戏剧院1#配电室', key: '2' },
      { title: '歌剧院2#配电室', key: '3' },
      { title: '音乐厅3#配电室', key: '4' },
    ],
  },
]);

const checkedKeys = ref<string[]>(['0-0-0', '0-0-1']);

const handleSelect = (keys) => {
  // 强制单选：数组长度最多为1
  checkedKeys.value = keys.length > 0 ? [keys[keys.length - 1]] : [];
};

const container = ref();

const gv = ref();
const dm = ref();
onMounted(() => {
  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(container.value, {
    fill: false, // 关闭自动填充
  });
  initEvent();
});

const initEvent = () => {
  gv.value.isMovable = function () {
    return false;
  }; // 禁止移动
  gv.value.getSelectWidth = function () {
    return 0;
  }; // 禁止选中
  gv.value.deserialize('storage/displays/xijuyuan1.json', function (json, dm, gv, data) {
    const targetNode1 = dm.getDataByTag('byq1Tag');
    const targetNode2 = dm.getDataByTag('byq2Tag');
    const targetNode3 = dm.getDataByTag('byq3Tag');
    const targetNode4 = dm.getDataByTag('byq4Tag');
    if (targetNode1) {
      targetNode1.a('byqCode', '1');
    }
    if (targetNode2) {
      targetNode2.a('byqCode', '2');
    }
    if (targetNode3) {
      targetNode3.a('byqCode', '3');
    }
    if (targetNode4) {
      targetNode4.a('byqCode', '4');
    }
    setInterval(() => {
      if (targetNode1) {
        let str1 = Math.random() * 10 + '';
        targetNode1.a('PValue', str1);
        let str2 = Math.random() * 10 + '';
        targetNode1.a('UaValue', str2);
        let str3 = Math.random() * 10 + '';
        targetNode1.a('UbValue', str3);
        let str4 = Math.random() * 10 + '';
        targetNode1.a('UcValue', str4);
        let str5 = Math.random() * 10 + '';
        targetNode1.a('IaValue', str5);
        let str6 = Math.random() * 10 + '';
        targetNode1.a('IbValue', str6);
        let str7 = Math.random() * 10 + '';
        targetNode1.a('IcValue', str7);
        let str8 = Math.random() * 10 + '';
        targetNode1.a('PFValue', str8);
        let str9 = Math.random() * 10 + '';
        targetNode1.a('FValue', str9);
        let str10 = Math.random() * 10 + '';
        targetNode1.a('EPValue', str10);
        let str11 = Math.random() * 10 + '';
        targetNode1.a('LFValue', str11);
      }
      if (targetNode2) {
        let str1 = Math.random() * 10 + '';
        targetNode2.a('PValue', str1);
        let str2 = Math.random() * 10 + '';
        targetNode2.a('UaValue', str2);
        let str3 = Math.random() * 10 + '';
        targetNode2.a('UbValue', str3);
        let str4 = Math.random() * 10 + '';
        targetNode2.a('UcValue', str4);
        let str5 = Math.random() * 10 + '';
        targetNode2.a('IaValue', str5);
        let str6 = Math.random() * 10 + '';
        targetNode2.a('IbValue', str6);
        let str7 = Math.random() * 10 + '';
        targetNode2.a('IcValue', str7);
        let str8 = Math.random() * 10 + '';
        targetNode2.a('PFValue', str8);
        let str9 = Math.random() * 10 + '';
        targetNode2.a('FValue', str9);
        let str10 = Math.random() * 10 + '';
        targetNode2.a('EPValue', str10);
        let str11 = Math.random() * 10 + '';
        targetNode2.a('LFValue', str11);
      }
      if (targetNode3) {
        let str1 = Math.random() * 10 + '';
        targetNode3.a('PValue', str1);
        let str2 = Math.random() * 10 + '';
        targetNode3.a('UaValue', str2);
        let str3 = Math.random() * 10 + '';
        targetNode3.a('UbValue', str3);
        let str4 = Math.random() * 10 + '';
        targetNode3.a('UcValue', str4);
        let str5 = Math.random() * 10 + '';
        targetNode3.a('IaValue', str5);
        let str6 = Math.random() * 10 + '';
        targetNode3.a('IbValue', str6);
        let str7 = Math.random() * 10 + '';
        targetNode3.a('IcValue', str7);
        let str8 = Math.random() * 10 + '';
        targetNode3.a('PFValue', str8);
        let str9 = Math.random() * 10 + '';
        targetNode3.a('FValue', str9);
        let str10 = Math.random() * 10 + '';
        targetNode3.a('EPValue', str10);
        let str11 = Math.random() * 10 + '';
        targetNode3.a('LFValue', str11);
      }
      if (targetNode4) {
        let str1 = Math.random() * 10 + '';
        targetNode4.a('PValue', str1);
        let str2 = Math.random() * 10 + '';
        targetNode4.a('UaValue', str2);
        let str3 = Math.random() * 10 + '';
        targetNode4.a('UbValue', str3);
        let str4 = Math.random() * 10 + '';
        targetNode4.a('UcValue', str4);
        let str5 = Math.random() * 10 + '';
        targetNode4.a('IaValue', str5);
        let str6 = Math.random() * 10 + '';
        targetNode4.a('IbValue', str6);
        let str7 = Math.random() * 10 + '';
        targetNode4.a('IcValue', str7);
        let str8 = Math.random() * 10 + '';
        targetNode4.a('PFValue', str8);
        let str9 = Math.random() * 10 + '';
        targetNode4.a('FValue', str9);
        let str10 = Math.random() * 10 + '';
        targetNode4.a('EPValue', str10);
        let str11 = Math.random() * 10 + '';
        targetNode4.a('LFValue', str11);
      }
      console.log('setInterval----------->');
    }, 5000);
    gv.fitContent(); // 适配内容
  });
};

</script>

<style scoped lang="less">
.topo-component-main-box {
  height: 100%;
  padding: 0 12px;

  .topo-title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 30px;
    padding-left: 18px;
    .icon-box {
      height: 20px;
      border-left: 5px solid #8080ff;
      margin-right: 10px;
    }
    > span {
      font-size: 18px;
      color: #506f8e;
      font-weight: 600;
    }
  }
  .container-box {
    height: calc(100% - 30px);
    display: flex;
    justify-content: space-between;
    .tree-box,
    .dinalu-topo-box {
      background-color: #fff;
      border-radius: 10px;
    }
    .tree-box {
      width: 20%;
      z-index: 10;
    }
    .dinalu-topo-box {
      position: relative;
      width: 79%;
      height: 100%;
      margin: 0 auto; /* 居中显示 */
      overflow: hidden;
    }
    #dianLuTopo{
      height: 100%;
      width: 100%;
      position: absolute;
    }
  }
}
</style>