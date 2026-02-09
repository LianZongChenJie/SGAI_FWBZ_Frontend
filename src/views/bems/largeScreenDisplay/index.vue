<template>
  <div
    class="large-screen-display"
    ref="fullscreenElement"
  >
    <div class="large-screen-border-box">
      <div class="logo-title-box">
        <div class="logo-box"></div>
        <div class="time-and-screen-box">
          <div>{{ formatTime(nowTime) }}</div>
          <div class="screen-button" @click="toggleFullscreen">{{ screenStr }}</div>
        </div>
      </div>
      <div class="large-screen-info-box">
        <div class="left-info-box">
          <MyLeftInfo />
        </div>
        <div class="middle-info-box">
          <MyMiddleInfo />
        </div>
        <div class="right-info-box">
          <MyRightInfo />
        </div>
      </div>
      <div class="large-screen-title">
        <MyTitle :title="'金安桥智慧管控平台'" :style="titleStyle"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyTitle from './components/MyTitle.vue'
import MyLeftInfo from './components/MyLeftInfo.vue'
import MyMiddleInfo from './components/MyMiddleInfo.vue'
import MyRightInfo from './components/MyRightInfo.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue';

const fullscreenElement = ref(null);

const screenStr = ref('进入全屏')

const titleStyle = {
  color: '#8ed4eb',
  fontSize: '30px'
}

// 时间
const nowTime = ref();

let timer: any = null;
onMounted(() => {
  timer = setInterval(() => {
    nowTime.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});

// 格式化时间
const formatTime = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 切换全屏函数
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    screenStr.value = '缩小'
    // 进入全屏
    if (fullscreenElement.value.requestFullscreen) {
      fullscreenElement.value.requestFullscreen();
    } else if (fullscreenElement.value.webkitRequestFullscreen) {
      fullscreenElement.value.webkitRequestFullscreen();
    } else if (fullscreenElement.value.msRequestFullscreen) {
      fullscreenElement.value.msRequestFullscreen();
    }
  } else {
    screenStr.value = '进入全屏'
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
};
</script>

<style lang="less" scoped>
.large-screen-display {
  position: relative;
  height: 100vh;
  width: 100%;
  background-image: url('/src/assets/images/largeScreenBackground.png');
  background-size: 100% 100%;
  padding: 12px;

  .large-screen-border-box {
    height: 100%;
    width: 100%;
    background-image: url('/src/assets/images/largeScreenBorder.png');
    background-size: 100% 100%;

    .logo-title-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 5%;

      .logo-box {
        height: 90%;
        width: 150px;
        background-image: url('/src/assets/images/sgLogo.png');
        background-size: 100% 100%;
      }

      .time-and-screen-box {
        height: 90%;
        width: 300px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 12px;

        > div {
          color: #fff;
          font-size: 18px;
        }

        .screen-button:hover {
          cursor: pointer;
        }
      }
    }

    .large-screen-info-box {
      height: calc(100% - 50px);
      width: 100%;
      display: flex;
      justify-content: space-between;
      // padding: 0 2%;

      >div {
        height: 100%;
        width: 30%;
      }

      .left-info-box,.right-info-box {
        width: 28.5%;
      }

      .middle-info-box {
        width: 42%;
        height: 95%;
        margin-top: 2.5%;
      }
    }

    .large-screen-title{
      position: absolute;
      height: 55px;
      width: 44%;
      top: 1.5%;
      left: 28%;
    }
  }
}
</style>