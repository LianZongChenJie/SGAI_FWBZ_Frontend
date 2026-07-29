<template>
  <div class="environmenta-monitoring-main-box">
    <div
      class="page-main"
      v-loading="loading"
    >
      <!-- 加载地图容器 -->
      <div
        id="mapContainer"
        style="height: 100%"
      ></div>
      <div
        v-if="drawer"
        class="drawer-div"
        :class="drawerClass"
        :style="{ height: isRemote == 5 ? '500px' : 'initial' }"
      >
        <!-- :class="isRemote ? 'drawer-sb' : 'drawer-xf'" -->
        <i
          class="a-icon-close"
          @click="handleClose"
        ></i>
        <a-form
          class="drawer-form"
          size="mini"
          inline
          laba-width="135px"
          laba-position="right"
        >
          <div v-if="isRemote == 1">
            <a-form-item label="跳转：">
              <a
                @click="jumpPage"
                style="cursor: pointer; color"
              >人员通行记录页面</a>
            </a-form-item>

            <a-form-item label="设备名称：">
              <span>{{ drawerInfo.name }}</span>
            </a-form-item>
            <a-form-item label="规格型号：">
              <span>{{ drawerInfo?.model }}</span>
            </a-form-item>
            <a-form-item label="CAD图纸编码：">
              <span>{{ drawerInfo.drawingCode }}</span>
            </a-form-item>
            <a-form-item label="所属系统：">
              <span>{{ drawerInfo.specialitySystem }}</span>
            </a-form-item>
            <a-form-item label="所属科组：">
              <span>{{ drawerInfo.managementGroup }}</span>
            </a-form-item>
            <a-form-item label="门禁状态：">
              <span>{{ parkingGateText }}</span>
            </a-form-item>
            <a-form-item label="通讯状态：">
              <span>{{ tongxStatusText }}</span>
            </a-form-item>
            <a-form-item label="通行方式：">
              <span>{{ drawerInfo.trafficModes }}</span>
            </a-form-item>
            <a-form-item label="出门按钮：">
              <span>{{ button }}</span>
            </a-form-item>
            <a-form-item label="点位描述：">
              <span>{{ description }}</span>
            </a-form-item>
            <a-form-item label="门状态：">
              <span>{{ drawerStatusText }}</span>
            </a-form-item>
            <a-form-item label="负责人：">
              <span>{{ drawerInfo.personLiable }}</span>
            </a-form-item>

            <a-form-item
              label="远程控制："
              class="remote-span"
            >
              <span>
                <a-button
                  type="primary"
                  size="mini"
                  @click="handleOption('常开')"
                  :disabled="isOpen"
                  v-permission="'tube-open'"
                >常开</a-button>
              </span>
              <span>
                <a-button
                  type="primary"
                  size="mini"
                  @click="handleOption('常闭')"
                  :disabled="isClose"
                  v-permission="'tube-close'"
                >常闭</a-button>
              </span>
              <span>
                <!-- <a-button
                type="primary"
                size="mini"
                @click="handleOption('取消')"
                :disabled="isCancel"
                v-permission="'tube-cancel'"
                >正常</a-button
              > -->
                <a-button
                  type="primary"
                  size="mini"
                  @click="handleOption('门闭')"
                  :disabled="isCancel"
                  v-permission="'tube-cancel'"
                >门闭</a-button>
              </span>
              <span>
                <a-button
                  type="primary"
                  size="mini"
                  @click="handleOption('门开')"
                  v-permission="'tube-single-open'"
                  :disabled="isSingleOpen"
                >门开</a-button>
              </span>
            </a-form-item>
            <a-form-item label="">
              <span style="color: #f56c6c">门禁常开时，点【门闭】恢复；门禁常闭时，点【门开】恢复。</span>
            </a-form-item>

          </div>
          <div v-else-if="isRemote == 2">
            <a-form-item label="当前值：">
              <span>{{ xfObj.gaojingVal }}</span>
            </a-form-item>
            <!--<a-form-item label="告警值：">
            <span>{{ xfObj.gaojingVal }}</span>
          </a-form-item>-->
          </div>
          <div v-else-if="isRemote == 3">
            <a-form-item label="设备名称：">
              <span>{{ drawerInfo.name }}</span>
            </a-form-item>
            <a-form-item label="mac地址：">
              <span>{{ drawerInfo.model }}</span>
            </a-form-item>
            <a-form-item label="所属系统：">
              <span>{{ drawerInfo.specialitySystem }}</span>
            </a-form-item>
            <a-form-item label="所属科组：">
              <span>{{ drawerInfo.managementGroup }}</span>
            </a-form-item>
            <a-form-item label="电量：">
              <span>{{ drawerInfo.personLiable }}</span>
            </a-form-item>
            <a-form-item label="负责人：">
              <span>{{ drawerInfo.personLiable }}</span>
            </a-form-item>
            <a-form-item
              label="远程控制："
              class="remote-span"
            >
              <span>
                <a-button
                  type="primary"
                  size="mini"
                  @click="handleNBOption('门开')"
                  v-permission="'tube-nb-single-open'"
                >门开</a-button>
              </span>
            </a-form-item>
          </div>
          <div
            v-else-if="isRemote == 5"
            style="margin-top: 20px"
          >
            <a-form-item label="设备名称：">
              <span>{{ drawerInfo.name }}</span>
            </a-form-item>
            <a-form-item label="设备类型：">
              <span>{{ drawerInfo.type }}</span>
            </a-form-item>
            <a-form-item label="楼层：">
              <span>{{ drawerInfo.spaceLayer }}</span>
            </a-form-item>
            <a-form-item label="CAD图纸编码：">
              <span>{{ drawerInfo.drawingCode }}</span>
            </a-form-item>
            <a-form-item label="位置描述：">
              <span>{{ drawerInfo.positionDesc }}</span>
            </a-form-item>
            <a-form-item label="上级设备：">
              <span>{{ deviceObj.parentName }}</span>
            </a-form-item>
            <a-form-item label="子设备：">
              <span v-if="deviceObj.childName">{{
              deviceObj.childName.join()
            }}</span>
            </a-form-item>
            <a-form-item label="当前值：">
              <span>{{ deviceObj.current }}</span>
            </a-form-item>
          </div>
        </a-form>
      </div>
      <div
        class="mask"
        v-if="drawer"
        @click.stop.prevent="clickMask($event)"
      ></div>
    </div>
    <a-modal
    v-model:open="openModal"
    title="新增报警类别"
    width="600px"
  >
    <template #footer>
      <a-button
        key="back"
        @click="closeModal"
      >关闭</a-button>
      <a-button
        key="submit"
        type="primary"
        @click="handleOk"
      >提交</a-button>
    </template>
    <div class="alarm-level-foem-box">
    '设备信息'
  </div>
  </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

import start from '@/assets/img/start.png';
import end from '@/assets/img/end.png';
// import screenfull from 'screenfull';
// import { groundFloor, flData } from '@/utils';
import { groundFloor, getPointData } from '../Standardized.api'

const flData = [
  {
    label: 'RF',
    value: 'DX0003480110900001',
  },
  {
    label: 'F5',
    value: 'DX0003480110800001',
  },
  {
    label: 'F4M夹2',
    value: 'DX0003480111400001',
  },
  {
    label: 'F4M夹',
    value: 'DX0003480110700001',
  },
  {
    label: 'F4M',
    value: 'DX0003480111300001',
  },
  {
    label: 'F4',
    value: 'DX0003480110600001',
  },
  {
    label: 'F3',
    value: 'DX0003480110500001',
  },
  {
    label: 'F2M',
    value: 'DX0003480110400001',
  },
  {
    label: 'F2',
    value: 'DX0003480110300001',
  },
  {
    label: 'F1M',
    value: 'DX0003480110200001',
  },
  {
    label: 'F1',
    value: 'DX0003480110100001',
  },
  {
    label: 'B1M',
    value: 'DX0003480100200001',
  },
  {
    label: 'B1',
    value: 'DX0003480100100001',
  },
  {
    label: 'B2',
    value: 'DX0003480100300001',
  },
  {
    label: 'B3',
    value: 'DX0003480100400001',
  }
]

const openModal = ref(false)

const uriUrl = ref('');
// 蓝牙点位
const blueToothTime = ref('');
const blueToothList = ref<any>([]);
const markerBlue = ref<any>([]);

const dataObj = ref<any>({});
const floorArr = ref<any>([]);
const questionMean = ref({
  false: { text: '否' },
  true: { text: '是' },
});
const button = ref('');
const legendArr = ref<any>([]);
const toolTip = ref(null);
const spaceCodeList = ref<any>([]);
const isMap = ref<boolean>(true);
const systemId = ref('');
const keyValue = ref<number>(0);
const floorId = ref<string>('DX0002250110100001'); //默认显示F1层
const spaceLayerList = ref<any>([]); //楼层
const xfObj = ref<any>({});
const pathUrl = ref('');
const isOpen = ref(false); //常开
const isClose = ref(false); //常闭
const isRemote = ref<number>(4);
const isSingleOpen = ref<boolean>(true); //门开
const isCancel = ref(false); //正常or取消
const channel = ref<any>({});
const stationNoInfo = ref<any>({});
const relayInfo = ref<any>({});
const btnVisible = ref(false);
const drawerStatusText = ref('');
const parkingGateStatus = ref<any>(null);
const tongxStatus = ref<any>(null);
const drawerInfo = ref<any>({});
const drawer = ref(false);
const direction = ref('rtl');
const buildingId = ref('');
const map = ref<any>(null);
const floorCtrl = ref<any>(null);
const regionData = ref<any>([]);
const specialityIdGroup = ref<any>([]);
const data = ref<any>([]);
const activeIndex = ref<number>(0);
const navArr = ref([
  { id: '553,881', name: '摄像机' },
  { id: '606,939', name: '门禁' },
  { id: 329, name: '消防' },
  { id: 0, name: '蓝牙' },
]);
const props = ref({
  children: 'children',
  label: 'name',
  checkStrictly: true,
  value: 'id',
});
const searchForm = ref<any>({
  multipleSpecialtyId: '',
  spaceId: '',
  name: '',
  spaceLayer: 'F1',
  drawingCode: '',
  spaceCode: '',
  layerScope: 'F1',
});
const pointData = ref<any>([]);
const marker = ref<any>([]);
const popoverPosition = ref({
  left: 0,
  top: 0,
});
const description = ref(''); //点位描述
// const start = ref(null);
// const end = ref(null);
const imageUrl = ref('');
const retrievalFlag = ref<boolean>(true);
const openDate = ref<any>([]);
const carData = ref<any>([]);
const lookFlag = ref([true, false, false]);
const btnLoading = ref(false);
const loading = ref(false);
const defaultProps = ref({
  value: 'id',
  children: 'relatedObjs',
  checkStrictly: true,
  label: 'fullName',
});
const sourceSpaceId = ref(null);
const dialogVisible = ref(false);
const dialogLiveVisible = ref(false);
const shortBtnloading = ref(false);
const titles = ref('');
const imgSrc = ref('');
// 储存截图后的生成的base64图片
const cutImgSrc = ref('');
// 判断当前是否处于截图状态
// cameraId = ref("")
// markerFlag = ref<boolean>(true)
const spaceLayer = ref('');
const floorActive = ref<number>(0);
const deviceObj = ref<any>({});

// 刷新参数放到这里去触发，就可以刷新相同界面了
watch(data, () => {
  keyValue.value++;
});

const parentIdOfPage = computed(() => {
  return this.$route.meta.parentId;
});

const drawerClass = computed(() => {
  const drawerMap = {
    1: 'drawer-sb',
    2: 'drawer-xf',
    3: 'drawer-camera',
    4: '',
  };
  return drawerMap[isRemote.value];
});

const parkingGateText = computed(() => {
  let text;
  const paramValue = parkingGateStatus.value && parkingGateStatus.value.paramValue;
  switch (paramValue) {
    case '1':
      text = '正常';
      break;
    case '2':
      text = '常开';
      break;
    case '3':
      text = '常闭';
      break;
    default:
      text = '-';
      break;
  }
  return text;
});

const tongxStatusText = computed(() => {
  let text1;
  let color;
  const paramValue = tongxStatus.value && tongxStatus.value.paramValue;
  switch (paramValue) {
    case '1':
      text1 = '在线';
      color = '#4CD668';
      break;
    case '0':
      text1 = '离线';
      color = '#333';
      break;
    default:
      text1 = '-';
      color: '';
      break;
  }
  return text1;
});

onMounted(async () => {
  await getSpaceLayerList();
  await getRegionData();
  //await findSpaceCode();
  await initMap();
  //await getActiveVal(0);
});

const initMap = () => {
  buildingId.value = 'B000A11DNQ'; //bdid
  map.value = new window.DaxiMap.Map('mapContainer', {
    token: '', //开发者Token
    appName: 'HelloWorld', //开发者应用名称
    baseMapPath: '../map/',
    scenePath: '../data',
    buildingId: buildingId.value, //建筑bdid
    defaultZoomLevel: 17,
    defaultCenter: { lon: 116.7195877453, lat: 39.8865742316 },
    showOutDoorMap: false,
    mapDataPath: '../data',
  });
  //在地图加载成功的回调中加载
  map.value.on('loadComplete', () => {
    initFloorControl(map.value);
    initZoomControl(map.value);
    initViewModeControl(map.value);
    // 当室内场景可见时，显示楼层控件，如果没有可以显示的室内场景，隐藏楼层控件
    changeVal('F1');
    map.value.on('onIndoorBuildingActive', (sender, building) => {
      if (building) {
        floorCtrl.value.updateMap(building);
        floorCtrl.value.setVisible(true);
        // this.map.changeFloor(this.buildingId, "DX0002250110100001");
      } else {
        floorCtrl.value.setVisible(false);
      }
    });
  });
  map.value.on("mapClicked", (sender, data) => {
    console.log('点击坐标---------------------->：', sender, data);
  })
  // window.addEventListener('beforeunload', (e) => beforeunloadHandler(e)); //浏览器关闭监听
};

//获取设备类型的id
const getActiveVal = (val) => {
  blueToothList.value = [];
  console.log('val===>', val);

  resetSearchForm();
  floorArr.value = [];
  if (floorArr.value) {
    floorArr.value.setVisible(true);
  }
  searchForm.value.multipleSpecialtyId = navArr.value[val].id;
  activeIndex.value = val;
  const floor = flData.find((item) => item.label == searchForm.value.spaceLayer);
  if (floor) {
    floorId.value = floor.value;
    map.value.changeFloor(buildingId.value, floorId.value);
  }
  changeLegendArr(val);
  const params = {
    clientId: 'gjdjypark',
    id: navArr.value[val].id,
  };
  this.rq({
    baseURL: this.deviceURL,
    url: '/admin/deviceType/queryDeviceTypeTreeById',
    method: 'get',
    params: params,
  })
    .then((res) => {
      if (res.code === 1000 || res.code === 1001) {
        data.value = res.data;
      }
    })
    .catch(() => (loading.value = false));
};

const clickMask = ($event) => {
  $event.stopPropagation();
};

//楼层
const getSpaceLayerList = () => {
  let params = {
    spaceTypeCode: 'A04',
    clientId: 'gjdjypark',
  };
  // groundFloor(params).then((res) => {
  //   if (res.code === 1001 || res.code == 1000) {
  //     const data = res.data;
  //     data.forEach((item) => {
  //       item.fullName = item.fullName.split('-').join('.');
  //     });
  //     spaceLayerList.value = data;
  //     searchForm.value.spaceLayer = spaceLayerList.value.find(item => item.fullName == "B1").fullName;
  //     getSpaceInfo();
  //   }
  // });
};

const getSpaceVal = (val) => {
  if (val && val.length) {
    searchForm.value.spaceId = val[val.length - 1];
  }
};

//设备位置
const getRegionData = () => {
  const params = {
    sourceSpaceId: sourceSpaceId.value,
    spaceTypeCode: 'A05',
    clientId: 'gjdjypark',
  };
  // groundFloor(params)
  //   .then((res) => {
  //     if (res.code == 1001) {
  //       regionData.value = res.data;
  //     }
  //   })
  //   .catch((err) => {
  //     loading.value = false;
  //   });
};

const getHKrtspUrl = () => {
  this.rq({
    url: '/roma/camera/getHKrtspUrl',
    method: 'get',
    // contentType: "application/x-www-form-urlencoded",
    params: { cameraIndexCode: this.systemId },
  })
    .then((res) => {
      uriUrl.value = encodeURIComponent(res.msg);
    })
    .catch(() => {});
};

//选择楼层
const changeVal = (val) => {
  blueToothList.value = [];
  if (val) {
    searchForm.value.spaceLayer = val;
    searchForm.value.layerScope = val;
    const obj = spaceLayerList.value.find((item) => item.fullName == val);
    if (obj) {
      sourceSpaceId.value = obj.id;
    }
    const floor = flData.find((item) => item.label == val);
    // console.log('changeVal', floor)
    if (floor) {
      floorArr.value = [];
      floorId.value = floor.value;
      if (pointData.value.length > 0) {
        console.log('this.pointData===>', pointData.value);
        pointData.value.forEach((v) => {
          if (v.layerScope) {
            var layerScopeArr = v.layerScope.split(',') || [];
          }
          if (v.spaceLayer == floor.label || (v.layerScope && layerScopeArr.includes(floor.label))) {
            map.value.changeFloor(buildingId.value, floorId.value);
            addMaker(map.value, v.longitude, v.latitude, v.id, v);
          }
        });
      }

      // 循环添加蓝牙点位
      // if (this.blueToothList.length > 0) {
      //   this.blueToothList.forEach((v) => {
      //     this.map.changeFloor(this.buildingId, this.floorId);
      //     this.addBlueToothMaker(
      //       this.map,
      //       v.geometry.coordinates[0],
      //       v.geometry.coordinates[1],
      //       v.id,
      //       v
      //     );
      //   });
      // }

      if (searchForm.value.name) {
        // 当名称有值时 把当前楼层传入自有楼层控件数组  大溪地图楼层控件不显示
        floorArr.value.push(searchForm.value.spaceLayer);
        floorActive.value = 0;
        floorCtrl.value.setVisible(false);
      } else {
        floorCtrl.value.setVisible(true);
      }
      map.value.changeFloor(buildingId.value, floorId.value);
    }
  } else {
    searchForm.value.spaceLayer = '';
    floorId.value = '';
    searchForm.value.layerScope = '';
  }
  addPoint(116.7195877453,39.8865742316)
  addPoint(116.71951241519082,39.88628913930174)
  getRegionData();
};

//NB锁门开
const handleNBOption = (type) => {
  const arr = [];
  const obj = {
    dId: drawerInfo.value.did,
    name: drawerInfo.value.name,
    operateType: type,
    preStatus: parkingGateText.value,
    specialityId: drawerInfo.value.specialityId,
    specialtyName: drawerInfo.value.specialtyName,
    value: 4,
    reason: '',
  };
  arr.push(obj);
  // console.log("NB锁门开", drawerInfo.value, "arr===", arr);
  this.rq({
    baseURL: this.deviceURL,
    url: '/admin/device/account/nbRemoteOpen',
    method: 'get',
    params: { id: drawerInfo.value.id },
  }).then((res) => {
    if (res.code == 1000 || res.code == 1001) {
      sendRemoteRecord(arr);
      getSpaceInfo();
      drawer.value = false;
      this.$message({
        message: '操作成功',
        type: 'success',
        center: true,
      });
    } else {
      this.$message({
        message: res.msg,
        type: 'warning',
        center: true,
      });
    }
  });
};

const handleOption = (type) => {
  const arr = [];
  const obj = {
    dId: drawerInfo.value.did,
    name: drawerInfo.value.name,
    operateType: type,
    preStatus: parkingGateText.value,
    specialityId: drawerInfo.value.specialityId,
    specialtyName: drawerInfo.value.specialtyName,
    value: 1,
    reason: '',
  };
  arr.push(obj);
  // dataObj.value = {
  //   stationNo: stationNoInfo.value.paramValue,
  //   channel: parseInt(channel.value.paramValue),
  // };
  if (type != '取消') {
    if (type == '常开') {
      isOpen.value = true;
      isClose.value = false;
      isCancel.value = false;
      pathUrl.value = '/roma-apply/roma/hikvision/reformer/interface/remotecontrol/urgentopen';
      dataObj.value = {
        indexCode: stationNoInfo.value.paramValue,
        channel: parseInt(channel.value.paramValue),
      };
    } else if (type == '常闭') {
      isOpen.value = false;
      isClose.value = true;
      isCancel.value = false;
      pathUrl.value = '/roma-apply/roma/hikvision/reformer/interface/remotecontrol/urgentclose';
      dataObj.value = {
        indexCode: stationNoInfo.value.paramValue,
        channel: parseInt(channel.value.paramValue),
      };
    } else if (type == '门开') {
      dataObj.value = {
        indexCode: stationNoInfo.value.paramValue,
        channel: parseInt(channel.value.paramValue),
      };
      isSingleOpen.value = true;
      isOpen.value = false;
      isClose.value = false;
      isCancel.value = false;
      //门开
      pathUrl.value = '/roma-apply/roma/hikvision/reformer/interface/remotecontrol/opendoor';
    } else if (type == '门闭') {
      dataObj.value = {
        indexCode: stationNoInfo.value.paramValue,
        channel: parseInt(channel.value.paramValue),
      };
      isSingleOpen.value = true;
      isOpen.value = false;
      isClose.value = false;
      isCancel.value = false;
      //门闭
      pathUrl.value = '/roma-apply/roma/hikvision/reformer/interface/remotecontrol/closedoor';
    }
    this.rq({
      baseURL: this.iotURL,
      url: pathUrl.value,
      method: 'post',
      data: dataObj.value,
    }).then((res) => {
      if (res.code == 1000 || res.code == 1001) {
        sendRemoteRecord(arr);
        getSpaceInfo();
        drawer.value = false;
        this.$message({
          message: '操作成功',
          type: 'success',
          center: true,
        });
      } else {
        this.$message({
          message: res.msg,
          type: 'warning',
          center: true,
        });
      }
    });
  } else {
    //常开
    // console.log('*****stationNoInfo.value',stationNoInfo.value)
    isOpen.value = false;
    isClose.value = false;
    isCancel.value = false;
    isSingleOpen.value = false;
    pathUrl.value = '/roma-apply/roma/ocs/reformer/interface/remotecontrol/cancelurgent';
    //  dataObj.value = {//TODO 待设备全部升级后，注释掉此行代码\
    //   stationNo: stationNoInfo.value.paramValue,
    //   channel: parseInt(channel.value.paramValue),
    // };
    dataObj.value = {
      doorId: relayInfo.value.paramValue,
    };
    this.rq({
      baseURL: this.iotURL,
      url: pathUrl.value,
      method: 'post',
      data: dataObj.value,
    }).then((res) => {
      if (res.code == 1000 || res.code == 1001) {
        //  捕获异常
        try {
          if (res.data.retJSON.result.result == '200') {
            this.$message({
              message: '操作成功',
              type: 'success',
              center: true,
            });
          } else {
            this.$message({
              message: '操作失败',
              type: 'warning',
              center: true,
            });
          }
        } catch (e) {
          this.$message({
            message: '操作失败',
            type: 'warning',
            center: true,
          });
        }
        sendRemoteRecord(arr);
        getSpaceInfo();
        drawer.value = false;
        //   this.$message({
        //   message: "操作成功",
        //   type: "success",
        //   center: true,
        // });
      } else {
        this.$message({
          message: res.msg,
          type: 'warning',
          center: true,
        });
      }
    });
  }
};

const sendRemoteRecord = (data) => {
  this.rq({
    baseURL: this.deviceURL,
    url: '/admin/mq/sender/sendMessageBatch',
    method: 'post',
    data: data,
  })
    .then((res) => {
      if (res.code === 1000 || res.code === 1001) {
        // this.$message.success(res.msg ? res.msg : "操作成功!");
      } else {
        this.$message.error(res.msg);
      }
    })
    .catch(() => {});
};

const handleClose = () => {
  // this.getSpaceInfo();
  drawer.value = false;
};

const getEqVal = (val) => {
  if (val && val.length != 0) {
    specialityIdGroup.value = val;
    searchForm.value.multipleSpecialtyId = val[val.length - 1];
  } else {
    specialityIdGroup.value = [];
    searchForm.value.multipleSpecialtyId = navArr.value[activeIndex.value].id;
  }
};

const clearMarkers = () => {
  pointData.value = [];
  map.value.removeAllMarkerAndRoutes();
};

const resetSearchForm = () => {
  clearMarkers();
  for (var item in searchForm.value) {
    if (item == 'spaceLayer') {
      searchForm.value[item] = 'F1';
    } else {
      searchForm.value[item] = '';
    }
  }
  specialityIdGroup.value = [];
};

// 获取蓝牙数据
const getBlueToothList = () => {
  this.rq({
    url: '/daximapSservice/queryBleList',
    method: 'get',
    params: { floorId: floorId.value },
  }).then((res) => {
    if (res.code == 1001) {
      let clearData = JSON.parse(res.data.result);
      console.log('蓝牙数据===>', clearData.features);
      if (clearData.features.length != 0) {
        blueToothList.value = clearData.features;
      }

      // 把之前的蓝牙点位删掉
      map.value.removeAllMarkerAndRoutes();
      // 循环添加蓝牙点位
      if (blueToothList.value.length > 0) {
        blueToothList.value.forEach((v) => {
          map.value.changeFloor(buildingId, floorId);
          addBlueToothMaker(map, v.geometry.coordinates[0], v.geometry.coordinates[1], v.id, v);
        });
      } else {
        this.$message({
          message: '没有查到数据',
          type: 'error',
          center: true,
        });
      }
    } else {
      this.$message({
        message: '没有查到数据',
        type: 'error',
        center: true,
      });
    }
  });
};

const getSpaceInfo = () => {
  console.log('getSpaceInfo-------------->');
  if (activeIndex.value == 3) {
    // 获取蓝牙数据
    getBlueToothList();
    return;
  }

  clearMarkers();
  //查询列表
  btnLoading.value = true;
  const data = {
    type: '设备台账',
    xfFlag: activeIndex.value == 2 ? true : false,
  };
  for (var item in searchForm.value) {
    if (searchForm.value[item]) {
      data[item] = searchForm.value[item];
    }
  }
  getPointData(data).then((res) => {
    
    btnLoading.value = false;
    floorArr.value = [];
    if (res.code == 1000 || res.code == 1001) {
      pointData.value = [];
      console.log('res.data', res.data);
      if (res.data && Object.keys(res.data).length != 0) {
        pointData.value = res.d.valuea.layerScope.concat(res.data.noLayer);
        if (!pointData.value.length) return;
        // 如果floorId存在 则进入对应的楼层 否则 默认进入数组第一个数据所在楼层
        //根据数组第一个楼层的floorId匹配对应的楼层
        var floor:any = {};
        if (floorId.value) {
          floor = flData.find((item) => item.value == floorId.value);
        } else {
          floor = flData.find((item) => item.label == pointData.value[0].spaceLayer);
          if (floor) {
            searchForm.value.spaceLayer = floor.label;
            floorId.value = floor.value;
          }
        }
        if (searchForm.value.name) {
          // 先把 当前楼层塞进数组
          // 在循环中 判断非电梯摄像机 将其塞进数组并去重
          floorArr.value.push(searchForm.value.spaceLayer);
          floorActive.value = 0;
          // const mapObj = {}
          pointData.value.forEach((item) => {
            if (!item.deviceFullCode.startsWith('AFJKSXDT')) {
              //过滤层
              // if (!mapObj[item.spaceLayer]) {
              //   mapObj[item.spaceLayer] = true
              //   floorArr.push(item.spaceLayer)
              // }
              let index = floorArr.value.findIndex((itemChild) => itemChild === item.spaceLayer);
              if (index == -1) {
                floorArr.value.push(item.spaceLayer);
              }
              // console.log('mapObj', mapObj, 'floorArr', floorArr)
            }
          });
        }
        pointData.value.forEach((v) => {
          if (activeIndex.value == 0) {
            v.typeFlag = '摄像头';
          }

          var layerScopeArrs: any = [];
          if (v.layerScope) {
            var layerScopeArrs = v.layerScope.split(',') || [];
          }
          if (v.spaceLayer == floor.label || (v.layerScope && layerScopeArrs.includes(floor.label))) {
            map.value.changeFloor(buildingId.value, floorId.value);
            searchForm.value.spaceLayer = floor.label;
            // if(activeIndex != 2) {
            //   if (v.fullCode.startsWith("AFMJ")) {
            if (v.devicePropertyDOList != '-') {
              handleDevicePropertyDOList(v.devicePropertyDOList, v);
            } else {
              v.communicationText = '正常';
            }
            //   }
            // }
            //  - 0.00002
            addMaker(map.value, v.longitude, v.latitude, v.id, v);
            return v;
          }
        });
      } else {
        this.$message({
          message: '没查到任何数据',
          type: 'error',
          center: true,
        });
      }
    } else {
      this.$message({ message: res.msg, type: 'error', center: true });
    }

    setTimeout(() => {
      if (floorArr.value.length) {
        floorCtrl.value.setVisible(false);
      } else {
        floorCtrl.value.setVisible(true);
      }
    }, 100);
  });
};

//切换图例
const changeLegendArr = (params) => {
  let arr: any = [];
  switch (params) {
    case 0:
      arr = [
        { name: '人脸识别', class: 'rlClass' },
        { name: '车牌识别', class: 'cpClass' },
        { name: '电梯监控', class: 'dtClass' },
        { name: '普通', class: 'otherClass' },
      ];
      break;
    case 1:
      arr = [
        { name: '常闭', class: 'dtClass' },
        { name: '正常', class: 'otherClass' },
        { name: '常开', class: 'normalClass' },
      ];
      break;
    case 2:
      arr = [];
    default:
      arr = [];
      break;
  }
  legendArr.value = arr;
};

const handleDevicePropertyDOList = (list, item) => {
  list = list || [];
  item.color = '';
  item.communicationText = '正常';
  // console.log('list',list)
  list.forEach((v) => {
    if (v.deviceParam == '门禁状态') {
      let text1;
      const paramValue = v.paramValue;
      switch (paramValue) {
        case '1':
          text1 = '正常';
          break;
        case '2':
          text1 = '常开';
          break;
        case '3':
          text1 = '常闭';
          break;
        default:
          text1 = '正常';
          break;
      }
      item.communicationText = text1;
    }
  });
};

const initCompassControl = (map) => {
  // 创建指北针的参数
  var options = {
    anchor: 'TopLeft', // 锚点
    pos: { x: 16, y: 16 }, // 相对于锚点的位置
  };
  // 创建指北针
  var compassCtrl = new window.DaxiMap.CompassControl(map, options);
  compassCtrl.setVisible(true);
  compassCtrl.setPosition(16, 30);
  compassCtrl.setAnchor('TopRight');
};

const initZoomControl = (map) => {
  var options = {
    anchor: 'BottomRight', // 锚点
    pos: { x: 16, y: 16 }, // 相对于锚点的位置
    visible: true, // 是否显示
  };
  var zoomCtrl = new window.DaxiMap.ZoomControl(map, options);
  zoomCtrl.setVisible(true);
  zoomCtrl.setAnchor('BottomRight');
  map.on('floorChanged', (sender, data) => {
    floorId.value = data.floorId;
    const item = flData.find((item) => item.value == floorId.value);
    if (item) {
      searchForm.value.spaceLayer = item.label;
      if (pointData.value.length > 0) {
        pointData.value.forEach((v) => {
          if (v.layerScope) {
            var layerScopeArr = v.layerScope.split(',') || [];
          }
          if (v.spaceLayer == item.label || (v.layerScope && layerScopeArr.includes(item.label))) {
            if (v.fullCode.startsWith('AFMJ') && activeIndex.value != 2) {
              if (v.devicePropertyDOList != '-') {
                handleDevicePropertyDOList(v.devicePropertyDOList, v);
              } else {
                v.communicationText = '正常';
              }
            }
            map.changeFloor(buildingId.value, floorId.value);
            addMaker(map.value, v.longitude, v.latitude, v.id, v);
          }
        });
      }

      // 循环添加蓝牙点位
      if (blueToothList.value.length > 0) {
        blueToothList.value.forEach((v) => {
          map.value.changeFloor(buildingId.value, floorId.value);
          addBlueToothMaker(map.value, v.geometry.coordinates[0], v.geometry.coordinates[1], v.id, v);
        });
      }
    }
  });
};

const initViewModeControl = (map) => {
  // 创建 2D/3D切换控件的参数
  var options = {
    anchor: 'TopRight', // 锚点
    pos: { x: 16, y: 60 }, // 相对于锚点的位置
    visible: true, // 是否显示
  };
  // 创建 2D/3D切换控件控件
  var viewModeCtrl = new window.DaxiMap.ViewModeControl(map, options);
  // 修改 2D/3D切换控件的位置
  viewModeCtrl.setPosition(16, 300);
};

const initFloorControl = (map) => {
  // 创建楼层切换控件的参数
  var options = {
    anchor: 'TopRight', // 锚点
    pos: { x: 16, y: 16 }, // 相对于锚点的位置
    visible: true, // 是否显示
  };
  // 创建楼层切换控件
  floorCtrl.value = new window.DaxiMap.FloorControl(map, options);
  floorCtrl.value.setVisible(true);
  floorCtrl.value.setPosition(16, 140);
};

const addMaker = (map, x, y, id, item) => {
  var imgUrl;
  var colorUrl = '_blue.png';
  if (activeIndex.value == 0) {
    if (item.fullCode.startsWith('AFJKSXRL')) {
      //‘人脸抓拍摄像机'
      colorUrl = '_rl.png';
      imgUrl = 'camera';
    } else if (item.fullCode.startsWith('AFJKSXDT')) {
      //‘电梯摄像机'
      colorUrl = '_dt.png';
      imgUrl = 'camera';
    } else if (item.fullCode.startsWith('AFJKSXCL')) {
      //‘车牌抓拍摄像机'
      colorUrl = '_cp.png';
      imgUrl = 'camera';
    } else if (item.fullCode.startsWith('AFJKSXRCXS')) {
      //‘球机摄像机'
      colorUrl = '_blue.png';
      imgUrl = 'cee';
    } else {
      //其他
      imgUrl = 'camera';
      colorUrl = '_blue.png';
    }
  } else if (activeIndex.value == 1) {
    if (item.fullCode.startsWith('AFMJQDMJSX')) {
      // console.log('item.communicationText',item.communicationText)
      imgUrl = 'door';
      if (item.communicationText == '正常') {
        colorUrl = '_blue.png';
      } else if (item.communicationText == '常开') {
        colorUrl = '_yellow.png';
      } else {
        colorUrl = '_red.png';
      }
      // console.log('imgUrl',imgUrl,'colorUrl',colorUrl)
    } else if (item.fullCode.startsWith('AFMJQDNBSB')) {
      imgUrl = 'lock';
      colorUrl = '_blue.png';
    } else {
      imgUrl = 'marker';
      colorUrl = '_blue.png';
    }
  } else {
    imgUrl = 'marker';
  }
  //图标标注对象
  const that = this;
  var markerInfo = {
    id: id,
    lon: x, //经度坐标
    lat: y, //纬度坐标
    floorId: floorId.value, // 楼层ID
    bdid: buildingId.value,
    imageUrl: '../images/' + imgUrl + colorUrl, //显示的图片
    highlightImageUrl: '../images/' + imgUrl + '_green.png', //高亮的图片
    scale: 0.5, //缩放值
    onClick: (event) => {
      // const data = pointData.value.filter((item) => item.id == event._options.id);
      
      // showEvent(data[0], event);
    },
    onMouseOver: (event) => {
      var options = event._options;
      var params = {
        height: 30, //init,
        radius: 6,
        linearOffset: 5,
        showCLoseButton: false,
        floorId: options.floorId,
        text: item.name,
        lnglat: [options['lon'], options['lat']],
      };
      toolTip.value = map.addToolTip(params);
    },
    onMouseLeave: (event) => {
      removePopup();
    },
  };
  //添加到地图
  marker.value.push(map.addMarker(markerInfo));
};

const addPoint = (x,y) => {
    var markerInfo = {
    lon: x, //经度坐标
    lat: y, //纬度坐标
    floorId: floorId.value, // 楼层ID
    bdid: buildingId.value,
    imageUrl: '../../../../../public/images/camera_blue.png', //显示的图片
    highlightImageUrl: '../../../../../public/images/camera_green.png', //高亮的图片
    onClick: (event) => {
      openModal.value = true
      // const data = pointData.value.filter((item) => item.id == event._options.id);
      // showEvent(data[0], event);
    },
    onMouseOver: (event) => {
      var options = event._options;
      var params = {
        height: 30, //init,
        radius: 6,
        linearOffset: 5,
        showCLoseButton: false,
        floorId: options.floorId,
        text: 'testPoint',
        lnglat: [options['lon'], options['lat']],
      };
      toolTip.value = map.value.addToolTip(params);
    },
    onMouseLeave: (event) => {
      removePopup();
    },
  };
  console.log('添加点位-------markerInfo------>', markerInfo);
  //添加到地图
  map.value.addMarker(markerInfo);
}

const timeCompare = (str1, str2) => {
  str1 = new Date(str1).getTime();
  str2 = new Date(str2).getTime();
  return str1 > str2;
};

// 添加蓝牙点位
const addBlueToothMaker = (map, x, y, id, item) => {
  console.log('蓝牙参数==>', map, x, y, id, item);
  // console.log("时间选择==>",new Date(this.blueToothTime).getTime(), new Date(item.properties.update_time).getTime());
  // console.log("时间选择比较==>",this.timeCompare(this.blueToothTime, item.properties.update_time));

  //图标标注对象
  const that = this;
  var markerInfo = {
    id: id,
    lon: x, //经度坐标
    lat: y, //纬度坐标
    floorId: floorId.value, // 楼层ID
    bdid: buildingId.value,
    imageUrl: item.properties.update_time
      ? timeCompare(blueToothTime.value, item.properties.update_time)
        ? '../images/bluetooth_hui.png'
        : '../images/blueTooth.png'
      : '../images/bluetooth_hui.png', //显示的图片
    // highlightImageUrl: "../images/" + imgUrl + "_green.png", //高亮的图片
    scale: 0.2, //缩放值
    onClick: (event) => {
      addBlueToothMaker(map, x, y, id, item);
    },
    onMouseOver: (event) => {
      var options = event._options;
      var params = {
        height: 30, //init,
        radius: 6,
        linearOffset: 5,
        showCLoseButton: false,
        floorId: options.floorId,
        html: `电量: ${item.properties.battery}%  <br /> 最近巡检时间: ${
          item.properties.update_time ? (timeCompare(blueToothTime.value, item.properties.update_time) ? '无' : item.properties.update_time) : '无'
        }`,
        lnglat: [options['lon'], options['lat']],
      };
      toolTip.value = map.addToolTip(params);
    },
    onMouseLeave: (event) => {
      removePopup();
    },
  };
  //添加到地图
  markerBlue.value.push(map.addMarker(markerInfo));
};

const liveClick = () => {
  // this.markerFlag = false
};

const showEvent = (event, nativeEvent) => {
  // 当前计划气泡
  drawerInfo.value = event;
  if (activeIndex.value != 2) {
    //门状态
    const drawerStatus = drawerInfo.value.devicePropertyDOList.find((item) => {
      return item.deviceParam == '开关';
    });
    const paramValue = drawerStatus && drawerStatus.paramValue;

    if (paramValue == '0') {
      drawerStatusText.value = '关';
      // isClose = false;
      isSingleOpen.value = false;
    } else if (paramValue == '1') {
      drawerStatusText.value = '开';
      // isOpen = false;
      isSingleOpen.value = false;
    } else {
      drawerStatusText.value = '-';
    }
    const devicePropertyDOList = drawerInfo.value.devicePropertyDOList;
    //门禁状态
    parkingGateStatus.value = drawerInfo.value.devicePropertyDOList.find((item) => {
      return item.deviceParam == '门禁状态';
    });

    //通讯状态
    tongxStatus.value = drawerInfo.value.devicePropertyDOList.find((item) => {
      return item.deviceParam == '通讯状态';
    });

    if (drawerInfo.value.type == '门禁锁') {
      drawer.value = true;
      if (parkingGateText.value == '常开') {
        console.log('常开');
        isOpen.value = true;
        isClose.value = false;
        isCancel.value = false;
        isSingleOpen.value = false;
      } else if (parkingGateText.value == '常闭') {
        console.log('常闭');
        isOpen.value = false;
        isClose.value = true;
        isCancel.value = false;
        isSingleOpen.value = false;
      } else {
        console.log('正常');
        isOpen.value = false;
        isClose.value = false;
        isCancel.value = false;
        isSingleOpen.value = false;
      }
      isRemote.value = 1;
      if (questionMean.value[drawerInfo.value.button] && questionMean.value[drawerInfo.value.button].text) {
        button.value = questionMean.value[drawerInfo.value.button].text;
      }
      relayInfo.value = drawerInfo.value.devicePropertyDOList.find((item) => {
        return item.paramCode == 'relay';
      }); // console.log('relayInfo===', relayInfo)
      stationNoInfo.value = drawerInfo.value.devicePropertyDOList.find((item) => {
        return item.paramCode == 'stationNO';
      });

      channel.value = drawerInfo.value.devicePropertyDOList.find((item) => {
        return item.deviceParam == 'channel';
      });
      //  console.log('drawerInfo',drawerInfo,' channel===', channel)
      //  channel = drawerInfo.devicePropertyDOList.find((item) =>
      //  item.paramCode == "channel"

      // );
      // console.log('stationNoInfo===', stationNoInfo)
      //  console.log('channel*****===', channel)
      //点位描述
      description.value = drawerInfo.value.devicePropertyDOList.find((item) => {
        return item.deviceParam == '点位描述';
      }).paramValue;
    } else if (drawerInfo.value.fullCode.startsWith('XF')) {
      //20231214  zx
      // drawer = true;
      // isRemote = 2;
      let arr = drawerInfo.value.devicePropertyDOList;
      if (arr.length) {
        arr.forEach((item) => {
          if (item.deviceParam == '当前值') {
            xfObj.value.gaojingVal = item.paramValue;
          }
        });
      }
      var options = nativeEvent._options;
      var params = {
        height: 50, //init,
        radius: 6,
        linearOffset: 5,
        showCLoseButton: true,
        floorId: options['floorId'],
        // text: "当前值",
        html: `<div style='padding:6px 3px;'><span class='poperClass'>${drawerInfo.value.type}:</span><span>${
          xfObj.value.gaojingVal ? xfObj.value.gaojingVal : '无'
        }</span><div>`, //dom string
        lnglat: [options['lon'], options['lat']],
        // "maxWidth"
      };

      removePopup();
      toolTip.value = map.value.addToolTip(params);
      // console.log("******drawerInfo111", drawerInfo);
    } else if (drawerInfo.value.typeFlag == '摄像头') {
      drawer.value = false;
      // isRemote = 3;
      if (drawerInfo.value.systemId) {
        dialogVisible.value = true;
        // console.log("******drawerInfo111", drawerInfo.systemId);
        systemId.value = drawerInfo.value.systemId;
        titles.value = drawerInfo.value.name;
        getHKrtspUrl();
      } else {
        this.$message({
          message: '暂未维护摄像头ID',
          type: 'warning',
          center: true,
        });
      }
    } else if (drawerInfo.value.type == 'NB锁') {
      drawer.value = true;
      isRemote.value = 3;
    } else {
      drawer.value = false;
      isRemote.value = 4;
    }
  }
  if (activeIndex.value == 2) {
    childListById(drawerInfo.value.deviceId);
    drawer.value = true;
    isRemote.value = 5;
  }
  const open = () => {
    console.log('drawer--------------->');
    setTimeout(() => (drawer.value = true), 10);
  };
  if (drawer.value) {
    // drawer = false;
    setTimeout(open, 10);
  } else {
    // open();
  }
};

const childListById = (id) => {
  this.rq({
    baseURL: this.deviceURL,
    url: '/admin/device/account/queryParentDeviceOrChildListById',
    method: 'get',
    params: {
      deviceId: id,
    },
  }).then((res) => {
    deviceObj.value = res.data;
  });
};

const removePopup = () => {
  if (toolTip.value != null) {
    toolTip.value.removeFromMap();
    toolTip.value = null;
  }
};

const closeLiveDialog = () => {
  dialogVisible.value = false;
  // this.markerFlag = true
};

const getShortcutPic = () => {
  //获取摄像头直播截图
  shortBtnloading.value = true;
  this.rq({
    url: '/roma/media/getShortcutPicDto',
    method: 'get',
    params: {
      cameraId: systemId.value,
    },
  })
    .then((res) => {
      shortBtnloading.value = false;
      if (res.resultCode === 0) {
        dialogLiveVisible.value = true;
        imgSrc.value = res.url;
        downLoadName = res.url.substring(30, 67);
        setTimeout(() => {
          cut();
        });
      } else {
        this.$message({
          message: '获取截图失败',
          type: 'warning',
          center: true,
        });
      }
    })
    .catch((res) => {
      shortBtnloading.value = false;
    });
};

const downloadIamge = (imgsrc, name) => {
  var image = new Image();
  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);
    var url = canvas.toDataURL('image/png');
    var a = document.createElement('a');
    var event = new MouseEvent('click');
    a.download = name || 'photo';
    a.href = url;
    a.dispatchEvent(event);
  };
  image.src = imgsrc;
};

const saveShortcutPic = () => {
  //保存截图
  // var save_link = document.createElement('a');
  // if(!this.cutImgSrc) {
  //   save_link.href = this.imgSrc;
  // } else {
  //   save_link.href = this.cutImgSrc;
  // }
  let url;
  cutImgSrc.value ? (url = cutImgSrc.value) : (url = imgSrc.value);
  downloadIamge(url, downLoadName.value);
  // save_link.download = this.downLoadName;
  // var clickevent = document.createEvent('MouseEvents');
  // clickevent.initEvent('click', true, false);
  // save_link.dispatchEvent(clickevent);
};

const cut = () => {
  var thiz = this;
  thiz.draw.value = true; //显示“取消截图”的按钮
  var img = document.getElementById('img');
  var wrap = document.getElementById('clip-img-w');
  var width = wrap.offsetWidth;
  var height = wrap.offsetHeight;
  var clipcanvas = document.getElementById('clipcanvas');
  var drawcanvas = document.getElementById('drawcanvas');
  clipcanvas.width = width;
  clipcanvas.height = height;
  drawcanvas.width = width;
  drawcanvas.height = height;
  var clipCtx = drawcanvas.getContext('2d');
  var clipImg = document.createElement('img');
  clipImg.classList.add('img_anonymous');
  clipImg.crossOrigin = 'anonymous';
  clipImg.src = imgSrc.value;
  var timg = clipImg.cloneNode();
  wrap.appendChild(clipImg);
  clipImg.onload = function () {
    var x = Math.floor((width - width.value) / 2);
    var y = Math.floor((height - height.value) / 2);
    clipCtx.drawImage(this, 0, 0, timg.width, timg.height, x, y, width.value, height.value);
  };

  var ctx = clipcanvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.strokeStyle = 'rgba(0,143,255,1)';
  var start = null;
  var clipArea = {}; //裁剪范围
  clipcanvas.onmousedown = function (e) {
    start = {
      x: e.layerX,
      y: e.layerY,
    };
  };
  clipcanvas.onmousemove = function (e) {
    if (start) {
      fill(start.x, start.y, e.offsetX - start.x, e.offsetY - start.y);
    }
  };
  document.addEventListener('mouseup', function () {
    if (start) {
      start = null;
      var url = startClip(clipArea);
      // img.src= url;
      //生成base64格式的图
      cutImgSrc.value = url;
    }
  });
  function fill(x, y, w, h) {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    //遮罩层
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, width, height);
    //画框
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(x, y, w, h);
    //描边
    ctx.globalCompositeOperation = 'source-over';
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    // ctx.lineTo(x,y);
    ctx.stroke();
    ctx.closePath();
    clipArea = {
      x,
      y,
      w,
      h,
    };
  }
  function startClip(area) {
    var canvas = document.createElement('canvas');
    canvas.width = area.w;
    canvas.height = area.h;
    var data = clipCtx.getImageData(area.x, area.y, area.w, area.h);
    var context = canvas.getContext('2d');
    context.putImageData(data, 0, 0);
    return canvas.toDataURL('image/png', 1);
  }
};

/**
 * 取消截图
 */
const cancelCut = (type) => {
  init();
  cutImgSrc.value = '';
  cut();
  if (!type || type == 'close') {
    dialogLiveVisible.value = false;
  }
};

/**
 * 打开弹窗的时候初始化
 */
const init = () => {
  // canvas清空画布
  var wrap = document.getElementById('clip-img-w');
  var width = wrap.offsetWidth;
  var height = wrap.offsetHeight;
  var clipcanvas = document.getElementById('clipcanvas');
  var drawcanvas = document.getElementById('drawcanvas');
  clipcanvas.width = width;
  clipcanvas.height = height;
  drawcanvas.width = width;
  drawcanvas.height = height;
  var clipCtx = drawcanvas.getContext('2d');
  var ctx = clipcanvas.getContext('2d');
  clipCtx.clearRect(0, 0, drawcanvas.width, drawcanvas.height);
  ctx.clearRect(0, 0, clipcanvas.width, clipcanvas.height);
  //移除鼠标事件
  clipcanvas.onmousedown = null;
  clipcanvas.onmousemove = null;
  document.removeEventListener('mouseup', fn(), false);
  function fn() {}

  // 移除创建的img节点,避免重复创建
  if ($('.img_anonymous').length > 0) {
    $('.img_anonymous').remove();
  }

  //避免同一张图没有更新
  cutImgSrc.value = imgSrc.value;
};

const fullIframe = () => {
  //双击全屏
  const element = document.getElementById('iframe'); //指定全屏区域元素
  // if (screenfull.isEnabled) {
  //   screenfull.request(element);
  // }
};

//查询门编码
const findSpaceCode = () => {
  loading.value = true;
  const data = {
    name: '',
    spaceId: '',
  };
  for (let item in searchForm.value) {
    data[item] = searchForm.value[item];
  }
  this.rq({
    baseURL: this.deviceUR.value,
    url: '/admin/device/control/querySpaceCodeAboutDoor',
    method: 'get',
  })
    .then((res) => {
      loading.value = false;
      if (res.code == 1001 || res.code == 1000) {
        spaceCodeList.value = res.data;
      } else {
        $message.error(res.msg);
      }
    })
    .catch(() => {
      loading.value = false;
    });
};

const changeCode = (val) => {
  searchForm.value.spaceCode = val;
};

const floorChange = (item, index) => {
  // console.log('***floorChange', item, index)
  floorActive.value = index;
  const floorId = flData.find((item2) => item2.label == item).value;
  map.value.changeFloor(buildingId.value, floorId);
  changeVal(item);
};

const jumpPage = () => {
  // 跳转人员通行记录
  this.$router.push({
    path: 'psAcsRecord',
    name: 'psAcsRecord',
    params: {
      name: drawerInfo.value.name,
    },
  });
};
</script>

<style lang="less" scoped>
.environmenta-monitoring-main-box {
  height: 100%;
  width: 100%;

  .page-main {
    position: relative;
    height: calc(100vh);
    color: #2c3e50;
    #mapContainer {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    //   .poperClass{
    //   color: red !important;;
    // }
  }
}
</style>

<style>
.mask {
  position: fixed;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.75);
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  -webkit-transition: opacity 0.3s;
  transition: opacity 0.3s;
}
.drawer-div {
  position: fixed;
  right: 100px;
  bottom: 0;
  top: 30px;
  z-index: 2010;
  background: white;
  width: 30%;
}
.drawer-div .a-icon-close {
  position: absolute;
  right: 20px;
  z-index: 1111;
  top: 20px;
}
.drawer-sb {
  height: calc(100vh - 300px);
  padding: 30px;
}
.drawer-xf {
  height: 100px !important;
  padding: 30px;
}
.drawer-camera {
  height: 300px !important;
  padding: 20px;
}
.is-iframe {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
}
.retrieva-content__box .a-form-item__label {
  color: #919eb9 !important;
}
.drawer-form {
  /* padding: 0 30px; */
  width: 100%;
  height: 100%;
}
.drawer-form .a-form-item.a-form-item--mini {
  display: block;
}
.drawer-footer {
  text-align: right;
  margin-right: 30px;
}
.remote-span span {
  margin: 0 5px;
}
</style>