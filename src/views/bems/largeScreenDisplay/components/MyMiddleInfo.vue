<template>
  <div class="my-middle-info">
    <div class="model-box"></div>
    <div class="title-box">
      <MyTitle :title="'安消防主题'" />
    </div>
    <div class="handling-status">
      <div class="handling-title">
        处理情况
      </div>
      <div class="status-info-box">
        <div class="status-item">
          <MyHandlingStatus />
        </div>
        <div class="status-item">
          <MyHandlingStatus :title="'异常处理及时率'" />
        </div>
        <div class="status-item">
          <MyHandlingStatus :title="'火灾处理及时率'" />
        </div>
      </div>
    </div>
    <div class="certificate-status">
      <div class="certificate-title">
        持证状态
      </div>
      <div class="people-info">
        <div class="fire-room-duty">
          <div>
            消防室值守&ensp;<span>{{ '1000' }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/certifiedIcon.png">&ensp;持证人数&ensp;<span>{{ '900' }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/notCertifiedIcon.png">&ensp;未持证人数&ensp;<span style="color: red;">{{ '100' }}</span>&ensp;人
          </div>
        </div>
        <div class="maintenance-personnel">
          <div>
            维保人员&ensp;<span>{{ '1000' }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/certifiedIcon.png">&ensp;持证人数&ensp;<span>{{ '900' }}</span>&ensp;人
          </div>
          <div>
            <img src="@/assets/images/notCertifiedIcon.png">&ensp;未持证人数&ensp;<span style="color: red;">{{ '100' }}</span>&ensp;人
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyTitle from './MyTitle.vue';
import MyHandlingStatus from './MyHandlingStatus.vue';
</script>

<style lang="less" scoped>
.my-middle-info {
  height: 100%;
  width: 100%;

  .model-box {
    width: 100%;
    height: 55%;
    background-image: url('@/assets/images/homePage.png');
    background-size: 100% 100%;
  }
  .title-box {
    margin-top: 5px;
    height: 30px;
  }
  .handling-status,
  .certificate-status {
    width: 100%;
    height: 20%;
    margin-top: 5px;
    background-image: url('@/assets/images/hadnleingStatus.png');
    background-size: 100% 100%;

    .handling-title,
    .certificate-title {
      color: #fff;
      height: 20%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-end;
      padding-left: 6%;
      font-size: 16px;
    }

    .status-info-box {
      height: 80%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;

      .status-item {
        width: 20%;
        height: 90%;
      }
    }

    .people-info {
      height: 80%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      > div {
        height: 100%;
        width: 50%;
        border-right: 1px dashed #eeba0f;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        align-content: center;

        > div {
          color: #fff;
          width: 80%;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 25%;
          font-size: 16px;

          >span{
            font-size: 22px;
            color: #70e3f8;
          }
        }
      }

      .maintenance-personnel {
        border-left: 1px dashed #eeba0f;
        border-right: none;
      }
    }
  }

  .certificate-status {
    height: 19.5%;
  }
}
</style>