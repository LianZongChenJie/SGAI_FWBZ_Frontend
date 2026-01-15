<template>
  <div class="my-topo-components-main-box">
    <div class="container-box">
      <div class="tree-box">
        <a-tree :tree-data="treeData" v-model:checkedKeys="checkedKeys" @select="handleSelect">
          <template #title="{ title, key, dataRef }">
            <a-popover>
              <template #content>
                {{ title }}
              </template>
              <span class="truncated-text">
                {{ truncateText(title, 10) }}
              </span>
            </a-popover>
          </template>
        </a-tree>
      </div>
      <div class="dinalu-topo-box">
        <div ref="container" id="dianLuTopo">

        </div>
        <div class="full-screen" @click="fullScreen(1)">
          <ExpandOutlined />&ensp;全屏查看
        </div>
        <!-- <div v-else class="full-screen" @click="fullScreen(0)"><CompressOutlined  />&ensp;返回</div> -->
      </div>
    </div>
    <FullScreenModal :path="topoPath" ref="fullScreenModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons-vue';
import FullScreenModal from './FullScreenModal.vue';
import { ref, onMounted, nextTick } from 'vue';

const props = defineProps({
  path: {
    type: String,
    default: 'kongTiao.json'
  }
})

const isFull = ref(0);

const fullScreenModalRef = ref();

const treeData = ref([
  {
    title: '4号楼',
    key: '2',
    path: 'jinAnQiao/4haoLou.json',
    children: [
      { title: '1#变压器', key: '2-5' },
      { title: '2#变压器', key: '2-6' },
      { title: '3#变压器', key: '2-7' },
      { title: '4#变压器', key: '2-8' },
    ],
  },
  {
    title: '5号楼(总楼)',
    key: '3',
    path: 'jinAnQiao/zongPeiDian.json',
    children: [
      { title: '1#变压器', key: '3-5' },
      { title: '2#变压器', key: '3-6' },
      { title: '3#变压器', key: '3-7' },
      { title: '4#变压器', key: '3-8' },
    ],
  },
  {
    title: '9号楼',
    key: '4',
    path: '9号楼全.json',
    children: [
      { title: '1#变压器', key: '4-5' },
      { title: '2#变压器', key: '4-6' },
    ],
  },
]);

const checkedKeys = ref<string[]>(['2']);

const topoPath = ref<any>('');

const handleSelect = (keys, e, selectedNodes) => {
  // 强制单选：数组长度最多为1
  // checkedKeys.value = keys.length > 0 ? [keys[keys.length - 1]] : [];
  if (!e.node.parent) {
    topoPath.value = treeData.value.find((item) => item.key === keys[0])?.path;
  }
  initEvent();
};

const container = ref();

const gv = ref();
const dm = ref();

onMounted(() => {
  topoPath.value = props.path
  initEvent();
});

// 清除拓扑图内容
const clearTopoContent = () => {
  if (dm.value) {
    dm.value.clear(); // 清除数据模型中的所有数据
  }
  if (gv.value && container.value) {
    // 清除容器内的所有子元素
    while (container.value.firstChild) {
      container.value.removeChild(container.value.firstChild);
    }
  }
};

const initEvent = async () => {
  await nextTick();
  if (!container.value) return;

  // 清除之前的内容
  clearTopoContent();

  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(container.value, {
    fill: false, // 关闭自动填充
  });

  gv.value.isMovable = function () {
    return false;
  }; // 禁止移动
  gv.value.getSelectWidth = function () {
    return 0;
  }; // 禁止选中
  gv.value.deserialize(`storage/displays/jinAnQiao/${props.path}`, function (json, dm, gv, data) {

    // gv.mi(function (e) {
    //   if (e.kind === 'clickData') {
    //     var isShow = e.data.a('isShow');
    //     let targetNode = dm.getDataByTag(`1AA16Modal`);
    //     // if (isShow) {
    //     //   targetNode.a('touMingDu', 0);
    //     // } else {
    //     //   targetNode.a('touMingDu', 1);
    //     // }
    //     e.data.a('isShow', !isShow);
    //   }
    // });

    gv.fitContent(); // 适配内容
  });
};

const fullScreen = (type) => {
  isFull.value = type;
  if (type) {
    fullScreenModalRef.value.showModal();
  } else {
  }
};

// 截断文本函数
const truncateText = (text, length = 10) => {
  const maxLength = length
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped lang="less">
.my-topo-components-main-box {
  height: 84vh;
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

    >span {
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
      overflow: auto;
    }

    .dinalu-topo-box {
      position: relative;
      width: 79%;
      height: 100%;
      margin: 0 auto;
      /* 居中显示 */
      overflow: hidden;
      position: relative;

      .full-screen {
        color: #000;
        position: absolute;
        top: 15px;
        left: 15px;

        &:hover {
          cursor: pointer;
          color: #00000085;
        }
      }
    }

    #dianLuTopo {
      height: 100%;
      width: 100%;
      position: absolute;
    }
  }
}
</style>