<template>
  <div class="my-handling-status">
    <div class="icon-box">
      <div
        class="date-box"
        id="backgroundBox"
      >
        <div class="value-box">
          {{ props.value }}
        </div>
        <div>
          今日
        </div>
      </div>
    </div>
    <div class="status-title">
      {{ props.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: '98%'
  },
  title: {
    type: String,
    default: '火灾处理及时率'
  }
})

</script>

<style lang="less" scoped>
.my-handling-status {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;

  .icon-box {
    height: 60%;
    width: 50%;
    border: 1px solid #185b88;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    > div {
      height: 96%;
      width: 96%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      align-content: center;
      border: 1px solid #10a3ca;
      border-radius: 100%;

      > div {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        color: #fff;
      }

      .value-box {
        font-size: 20px;
        align-items: flex-end;
      }
    }
  }

  .status-title {
    height: 30%;
    width: 100%;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>