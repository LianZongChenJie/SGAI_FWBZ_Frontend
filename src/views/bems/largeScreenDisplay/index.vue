<template>
  <div
    class="large-screen-display"
    ref="fullscreenElement"
  >
    <div class="large-screen-border-box">
      <div class="logo-title-box">
        <div class="logo-box">

        </div>
        <div class="time-and-screen-box">

        </div>
      </div>
      <div class="large-screen-info-box">

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const fullscreenElement = ref(null);

// 切换全屏函数
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    if (fullscreenElement.value.requestFullscreen) {
      fullscreenElement.value.requestFullscreen();
    } else if (fullscreenElement.value.webkitRequestFullscreen) {
      fullscreenElement.value.webkitRequestFullscreen();
    } else if (fullscreenElement.value.msRequestFullscreen) {
      fullscreenElement.value.msRequestFullscreen();
    }
  } else {
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
  height: 100vh;
  width: 100%;
  border: 1px solid red;
  background-image: url('/src/assets/images/largeScreenBackground.png');
  background-size: 100% 100%;

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
      border: 1px solid red;

      .logo-box {
        height: 90%;
        width: 150px;
        border: 1px solid red;
        background-image: url('/src/assets/images/sgLogo.png');
        background-size: 100% 100%;
      }

      .time-and-screen-box {
        height: 90%;
        width: 200px;
        border: 1px solid red;
      }
    }

    .large-screen-info-box {
      height: calc(100% - 50px);
      width: 100%;
    }
  }
}
</style>