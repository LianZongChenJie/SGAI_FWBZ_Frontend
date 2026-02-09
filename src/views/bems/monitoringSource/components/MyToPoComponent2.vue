<template>
  <div class="my-topo-components-main-box">
    <div class="container-box">
      <div class="tree-box">
        <a-tree :tree-data="treeData" v-model:checkedKeys="checkedKeys"
          :fieldNames="{ title: 'spaceName', key: 'spaceId', children: 'children' }" @select="handleSelect">
          <template #title="{ spaceName, key, dataRef }">
            <a-popover>
              <template #content>
                {{ spaceName }}
              </template>
              <span class="truncated-text">
                {{ truncateText(spaceName, 10) }}
              </span>
            </a-popover>
          </template>
        </a-tree>
      </div>
      <div class="device-topo-box">
        <div class="topo-item" v-for="(item,index) in deviceList" :key="index">
          <ToPoItem :deviceId="item.id" :deviceCode="item.deviceCode" :path="props.path"/>
        </div>
      </div>
    </div>
    <FullScreenModal :path="topoPath" ref="fullScreenModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons-vue';
import FullScreenModal from './FullScreenModal.vue';
import ToPoItem from './ToPoItem.vue';
import { ref, onMounted, nextTick } from 'vue';
import { findSpaceDeviceByCategoryldApi, getByDeviceIdApi } from '../Standardized.api'

const props = defineProps({
  path: {
    type: String,
    default: 'kongTiao.json'
  },
  categoryId: {
    type: String,
    default: '8'
  },
  deviceList: {
    type: Array,
    default: []
  },
})

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

  const deviceList:any = ref([])

const checkedKeys = ref<string[]>(['2']);

const topoPath = ref<any>('');

const handleSelect = async (keys, e, selectedNodes) => {
  console.log('deviceList---------------->', e.node.devices);
  deviceList.value = []
  deviceList.value = [...e.node.devices]
};

const findSpaceDeviceByCategoryld = async () => {
  let res = await findSpaceDeviceByCategoryldApi({
    categoryId: props.categoryId
  })
  handleSelect([getFirstDeviceIdDFS(res).spaceId], {node: getFirstDeviceIdDFS(res) }, {})
  treeData.value = res
}
function getFirstDeviceIdDFS(treeData) {
  if (!treeData || !Array.isArray(treeData)) {
    return null;
  }

  // 递归函数
  const findFirstDevice = (nodes) => {
    for (const node of nodes) {

      // 2. 然后递归检查子节点
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        const result = findFirstDevice(node.children);
        if (result !== null) {
          return result;
        }
      } else {
        return node
      }
    }

    return null;
  };
  return findFirstDevice(treeData);
}

onMounted(async () => {

  topoPath.value = props.path
  await findSpaceDeviceByCategoryld()
});

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
    .device-topo-box {
      background-color: #fff;
      border-radius: 10px;
    }

    .tree-box {
      width: 20%;
      z-index: 10;
      overflow: auto;
    }

    .device-topo-box {
      padding: 12px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-content: flex-start;
      width: 79%;
      height: 100%;
      margin: 0 auto;
      /* 居中显示 */
      overflow: auto;

      .topo-item {
        height: 32%;
        width: 24%;
        margin-right: 0.5%;
        margin-bottom: 0.5%;
        border: 1px solid rgb(209, 207, 207);
      }
    }

    #dianLuTopo {
      height: 30%;
      width: 25%;
      position: absolute;
    }
  }
}
</style>