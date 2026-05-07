<template>
  <div class="my-topo-components-main-box">
    <div class="container-box">
      <div class="tree-box">
        <a-tree
          :tree-data="treeData"
          v-model:checkedKeys="checkedKeys"
          :fieldNames="{ title: 'spaceName', key: 'spaceId', children: 'children' }"
          @select="handleSelect"
        >
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
      <div class="dinalu-topo-box">
        <div ref="container" id="dianLuTopo"> </div>
        <div class="full-screen" @click="fullScreen(1)"> <ExpandOutlined />&ensp;全屏查看 </div>
        <div v-if="isShow" class="control-div" :style="{ top: targetTop, left: targetLeft }">
          <div class="title-box"> {{ modalTitle }}: </div>
          <div class="select-box" v-if="isSelect">
            <a-select v-model:value="selectValue" :options="selectOptions" style="width: 100%">
              <!-- <a-select-option value="1">开</a-select-option>
              <a-select-option value="0">关</a-select-option> -->
            </a-select>
          </div>
          <div class="select-box" v-else>
            <a-input type="number" v-model:value="deviceValue" style="width: 100%"> </a-input>
          </div>
          <div class="button-box">
            <a-button @click="cancel">取消</a-button>
            <a-button type="primary" @click="submitControl">确定</a-button>
          </div>
        </div>
        <!-- <div v-else class="full-screen" @click="fullScreen(0)"><CompressOutlined  />&ensp;返回</div> -->
      </div>
    </div>
    <FullScreenModal
      :path="topoPath"
      :deviceCode="deviceCode"
      :categoryId="props.categoryId"
      :deviceList="props.deviceList"
      :isControlArr="isControlArr"
      ref="fullScreenModalRef"
    />
  </div>
</template>

<script setup lang="ts">
  import { ExpandOutlined, CompressOutlined } from '@ant-design/icons-vue';
  import FullScreenModal from './FullScreenModal.vue';
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import { findSpaceDeviceByCategoryldApi, getByDeviceIdApi, controlDeviceApi } from '../Standardized.api';
  import { message } from 'ant-design-vue';

  const props = defineProps({
    path: {
      type: String,
      default: 'kongTiao.json',
    },
    categoryId: {
      type: String,
      default: '8',
    },
    deviceList: {
      type: Array,
      default: [],
    },
  });

  const isFull = ref(0);
  const isShow = ref(false);
  const isSelect = ref(true);
  const selectOptions = ref([
    {
      value: '1',
      label: '运行',
    },
    {
      value: '0',
      label: '停止',
    },
  ]);
  const selectValue = ref('0');
  const deviceValue = ref('');

  const targetTop = ref('100px');
  const targetLeft = ref('100px');
  const targetId = ref('');

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

  const isControlArr = ref<any>([]);
  const deviceDataList = ref<any>([]);

  const checkedKeys = ref<string[]>(['2']);

  const topoPath = ref<any>('');
  const deviceCode = ref<string>('');
  const currentDeviceId = ref<string>('');
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  const modalTitle = ref('');

  const handleSelect = (keys, e, selectedNodes) => {
    if (keys[0].includes('d')) {
      currentDeviceId.value = keys[0];
      deviceCode.value = getPathByKey(keys[0]).split('/').join('-');
      getByDeviceId(keys[0]);
    }
    // 强制单选：数组长度最多为1
    // checkedKeys.value = keys.length > 0 ? [keys[keys.length - 1]] : [];
    // if (!e.node.parent) {
    //   topoPath.value = treeData.value.find((item) => item.key === keys[0])?.path;
    // }
    // initEvent();
  };

  const getByDeviceId = async (id, refreshTopo = true) => {
    let res = await getByDeviceIdApi({
      deviceId: id.split('d')[1],
    });
    console.log('reHUiShou-----------res---------->', res);
    deviceDataList.value = res;
    console.log('reHUiShou----------deviceDataList---------->', deviceDataList.value);
    const codeArr = res.map((item) => item.attributeCode);
    console.log('reHUiShou----------codeArr---------->', props.deviceList, codeArr);
    isControlArr.value = props.deviceList.filter((item: any) => codeArr.includes(item.key));
    console.log('reHUiShou----------isControlArr----------->', isControlArr.value);
    isControlArr.value.forEach((item) => {
      for (let i = 0; i < deviceDataList.value.length; i++) {
        if (deviceDataList.value[i].attributeCode === item.key) {
          // item.value = Number(deviceDataList.value[i].value).toFixed(2)
          // item.unit = deviceDataList.value[i].unit;
          item.id = deviceDataList.value[i].id;
          item.readwriteLevel = deviceDataList.value[i].readwriteLevel;
          item.valueConfig = JSON.parse(deviceDataList.value[i].valueConfig);
          if (item.isTransfor) {
            if (item.valueConfig && item.valueConfig != null) {
              let arr = [] as any[];
              item.valueConfig.forEach((item) => {
                arr.push({
                  value: item.key,
                  label: item.value,
                });
              });
              item.options = arr;
            }

            item.value = deviceDataList.value[i].value;
            for (let j = 0; j < 2; j++) {
              if (item.value === item.options[j].value) {
                item.value = item.options[j].label;
              }
            }
            console.log('reHUiShou----------item.options---------->', item.options, item);
          } else {
            console.log('reHUiShou----------item.value---------->', deviceDataList.value[i], Number(deviceDataList.value[i].value).toFixed(2));
            item.value = Number(deviceDataList.value[i].value).toFixed(2);
          }
          // item.value = deviceDataList.value[i].value
        }
      }
    });
    if (refreshTopo) {
      initEvent();
    } else {
      updateTopoData();
    }
  };

  const container = ref();

  const gv = ref();
  const dm = ref();

  const findSpaceDeviceByCategoryld = async () => {
    let res = await findSpaceDeviceByCategoryldApi({
      categoryId: props.categoryId,
    });
    handleSelect(['d' + getFirstDeviceIdDFS(res).id], getFirstDeviceIdDFS(res).target, {});
    treeData.value = mergeDevicesToChildren(res);
    deviceCode.value = getPathByKey('d' + getFirstDeviceIdDFS(res).id)
      .split('/')
      .join('-');
  };

  function mergeDevicesToChildren(treeData) {
    // 如果数据为空或不是数组，直接返回
    if (!treeData || !Array.isArray(treeData)) {
      return treeData || [];
    }

    // 递归处理每个节点
    const processNode = (node) => {
      // 创建新节点，保持原有结构
      const newNode: any = {
        spaceId: node.spaceId,
        spaceName: node.spaceName,
        children: [],
        devices: [],
      };

      // 如果当前节点有devices，将它们转换为children格式
      if (node.devices && Array.isArray(node.devices) && node.devices.length > 0) {
        // 将devices转换为children格式
        const deviceChildren = node.devices.map((device) => ({
          spaceId: 'd' + device.id, // 使用设备的id作为spaceId
          spaceName: device.deviceName, // 使用设备的deviceName作为spaceName
          children: [], // 设备没有子节点
          devices: [], // 设备没有设备子节点
        }));

        // 将设备节点添加到children中
        newNode.children.push(...deviceChildren);
      }

      // 如果当前节点有children，递归处理并添加到children中
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        // 处理子节点
        const processedChildren = node.children.map(processNode);
        // 将处理后的子节点添加到children中
        newNode.children.push(...processedChildren);
      }

      return newNode;
    };

    // 处理根节点数组
    return treeData.map(processNode);
  }

  function getFirstDeviceIdDFS(treeData) {
    if (!treeData || !Array.isArray(treeData)) {
      return null;
    }

    // 递归函数
    const findFirstDevice = (nodes) => {
      for (const node of nodes) {
        // 1. 首先检查当前节点的devices数组
        if (node.devices && Array.isArray(node.devices) && node.devices.length > 0) {
          return {
            id: node.devices[0].id,
            target: node.devices[0],
          }; // 返回第一个设备的id
        }

        // 2. 然后递归检查子节点
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          const result = findFirstDevice(node.children);
          if (result !== null) {
            return result;
          }
        }
      }

      return null;
    };

    return findFirstDevice(treeData);
  }

  // 递归查找节点路径
  function findNodePath(tree, targetKey, path = []) {
    for (const node of tree) {
      // 将当前节点加入路径
      const currentPath: any = [...path, node.spaceName];
      // 如果找到目标节点，返回路径
      if (node.spaceId === targetKey) {
        return currentPath;
      }

      // 如果有子节点，递归查找
      if (node.children && node.children.length > 0) {
        const result = findNodePath(node.children, targetKey, currentPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  // 根据ID获取路径字符串
  function getPathStringById(id) {
    const path = findNodePath(treeData.value, id);

    if (path) {
      return path.join(' / ');
    }
    return '';
  }

  // 你也可以通过方法直接获取特定ID的路径
  function getPathByKey(key) {
    const result = getPathStringById(key);
    console.log(`ID ${key} 的路径：`, result);
    return result;
  }

  onMounted(async () => {
    topoPath.value = props.path;
    await findSpaceDeviceByCategoryld();
    refreshTimer = setInterval(() => {
      if (currentDeviceId.value) {
        getByDeviceId(currentDeviceId.value, false);
      }
    }, 6000);
  });

  onUnmounted(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
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
      console.log('reHUiShou----------json---------->', json, dm, gv, deviceCode.value);
      // let targetNode = dm.getDataByTag(`1AA16Modal`);
      dm.getDataByTag(`deviceCode`).a('deviceCode', deviceCode.value);
      dm.getDataByTag(`deviceCode`).a('deviceCode', deviceCode.value);
      isControlArr.value.forEach((item, index) => {
        console.log('reHUiShou----------itema---------->', item, dm.getDataByTag(item.code));
        dm.getDataByTag(item.code).a(item.valueKey, item.value + (item.unit ? item.unit : ''));
        // console.log('reHUiShou--------------------->', item.code, item.valueKey);
      });
      gv.mi(function (e) {
        if (e.kind === 'clickData' && e.data && isControlArr.value.find((item) => item.code === e.data._tag).readwriteLevel === '1') {
          const targetItem = isControlArr.value.find((item) => item.code === e.data._tag);
          modalTitle.value = targetItem.name;
          targetId.value = targetItem.id;
          isShow.value = targetItem.value;
          isShow.value = true;
          isSelect.value = targetItem.isSelect;
          targetTop.value = e.event.layerY + 'px';
          targetLeft.value = e.event.layerX + 'px';
          selectValue.value = targetItem.value;
          console.log('targetItem', targetItem);
          if (targetItem.isSelect) {
            selectOptions.value = targetItem.options;
          } else {
            selectOptions.value = [
              {
                value: '1',
                label: '运行',
              },
              {
                value: '0',
                label: '停止',
              },
            ];
          }
        } else {
          isShow.value = false;
        }

        // if (e.kind === 'clickData') {
        // var isShow = e.data.a('isShow');
        // let targetNode = dm.getDataByTag(`1AA16Modal`);
        // if (isShow) {
        //   targetNode.a('touMingDu', 0);
        // } else {
        //   targetNode.a('touMingDu', 1);
        // }
        // e.data.a('isShow', !isShow);
        // }
      });

      gv.fitContent(); // 适配内容
    });
  };

  const updateTopoData = () => {
    if (!dm.value) return;

    const deviceCodeNode = dm.value.getDataByTag(`deviceCode`);
    if (deviceCodeNode) {
      deviceCodeNode.a('deviceCode', deviceCode.value);
    }

    isControlArr.value.forEach((item) => {
      const targetNode = dm.value.getDataByTag(item.code);
      if (targetNode) {
        targetNode.a(item.valueKey, item.value + (item.unit ? item.unit : ''));
      }
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
    const maxLength = length;
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  const submitControl = async () => {
    if (!selectValue.value) message.error('请输入操作指令！');
    let res = await controlDeviceApi({
      deviceAttributeId: targetId.value,
      value: isSelect.value ? selectValue.value : deviceValue.value,
    });
    if (!res) {
      isShow.value = false;
      message.success('操作成功！');
    }
  };

  const cancel = () => {
    targetId.value = '';
    isShow.value = false;
  };
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

        .control-div {
          padding: 3px 12px;
          top: 100px;
          left: 100px;
          position: absolute;
          height: 130px;
          width: 200px;
          border: 2px solid #adadad;
          background-color: #fff;

          > div {
            height: 40px;
            width: 100%;
          }

          .title-box {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            font-size: 16px;
          }

          .select-box {
            height: 40px;
            width: 100%;
          }

          .button-box {
            display: flex;
            align-items: center;
            justify-content: space-around;
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
