<template>
  <a-modal
    v-model:open="open"
    width="100%"
    wrap-class-name="full-modal"
    @cancel="handleClose"
    @ok="handleClose"
  >
    <div
      class="full-screen"
      ref="fullScreenContainer"
    >

    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = defineProps({
  path: {
    type: String,
    default: '音乐厅配电室模拟屏.json',
  },
});

const open = ref<boolean>(false);

const gv = ref();
const dm = ref();

const fullScreenContainer = ref();

const showModal = () => {
  open.value = true;
  initEvent();
};

const handleClose = () => {
  clearTopoContent();
  open.value = false;
};

// 清除拓扑图内容
const clearTopoContent = () => {
  if (dm.value) {
    dm.value.clear(); // 清除数据模型中的所有数据
  }
  if (gv.value && fullScreenContainer.value) {
    // 清除容器内的所有子元素
    while (fullScreenContainer.value.firstChild) {
      fullScreenContainer.value.removeChild(fullScreenContainer.value.firstChild);
    }
  }
};

const initEvent = async () => {
  await nextTick();
  if (!fullScreenContainer.value) return;

  // 清除之前的内容
  clearTopoContent();

  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(fullScreenContainer.value, {
    fill: false, // 关闭自动填充
  });

  gv.value.isMovable = function () {
    return false;
  }; // 禁止移动
  gv.value.getSelectWidth = function () {
    return 0;
  }; // 禁止选中
  gv.value.deserialize(`storage/displays/${props.path}`, function (json, dm, gv, data) {

    gv.mi(function (e) {
      if(e.kind === 'clickData' ) {
        var isShow = e.data.a('isShow');
          let targetNode = dm.getDataByTag(`1AA16Modal`);
          if(isShow) {
            targetNode.a('touMingDu', 0);
          } else {
            targetNode.a('touMingDu', 1);
          }
          e.data.a('isShow', !isShow);
      }
    });

    gv.fitContent(); // 适配内容
  });
};

defineExpose({
  showModal,
  handleClose,
});
</script>

<style lang="less" scoped>

.full-screen {
  height: 100%;
  width: 100%;
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