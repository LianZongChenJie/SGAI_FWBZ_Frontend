<template>
  <div class="carbon-emission-trend">
    <div class="overview-box">
      <div class="overview-item">
        <div class="day-title">当日</div>
        <div class="overview-title">实际排放量(t)</div>
        <div class="overview-number">{{dayData.value}}</div>
        <div
          v-if="!dayData.increase?.includes('-')"
          class="overview-trends"
        >较前日&nbsp;<div>{{dayData.increase}}
            <ArrowUpOutlined />
          </div>
        </div>
        <div
          v-else
          class="overview-trends"
        >较前日&nbsp;<div style="color: #22e6e6;">{{dayData.increase}}
            <ArrowDownOutlined style="color: #22e6e6;"/>
          </div>
        </div>
        <div class="expected-box">
          预计排放量&nbsp;<div>{{dayData.prediction}}
          </div>
        </div>
      </div>
      <div class="overview-item overview-item-week">
        <div class="day-title">本周</div>
        <div class="overview-title">实际排放量(t)</div>
        <div class="overview-number">{{weekData.value}}</div>
        <div
          v-if="!weekData.increase?.includes('-')"
          class="overview-trends"
        >较前日&nbsp;<div>{{weekData.increase}}
            <ArrowUpOutlined />
          </div>
        </div>
        <div
          v-else
          class="overview-trends"
          :id="weekData.increase?.includes('-') ? 'declineNumber' : ''"
        >较上周&nbsp;<div style="color: #22e6e6;">{{monthData.increase}}
            <ArrowDownOutlined style="color: #22e6e6;"/>
          </div>
        </div>
        <div class="expected-box">
          预计排放量&nbsp;<div>{{weekData.prediction}}
          </div>
        </div>
      </div>
      <div class="overview-item overview-item-month">
        <div class="day-title">本月</div>
        <div class="overview-title">实际排放量(t)</div>
        <div class="overview-number">{{monthData.value}}</div>
        <div
          v-if="!monthData.increase?.includes('-')"
          class="overview-trends"
        >较上月&nbsp;<div>{{monthData.increase}}
            <ArrowUpOutlined />
          </div>
        </div>
        <div
          v-else
          class="overview-trends"
        >较上月&nbsp;<div style="color: #22e6e6;">{{monthData.increase}}
            <ArrowDownOutlined style="color: #22e6e6;"/>
          </div>
        </div>
        <div class="expected-box">
          预计排放量&nbsp;<div>{{monthData.prediction}}
          </div>
        </div>
      </div>
      <div class="overview-item overview-item-quarter">
        <div class="day-title">本季度</div>
        <div class="overview-title">实际排放量(t)</div>
        <div class="overview-number">{{quarterData.value}}</div>
        <div
          v-if="!quarterData.increase?.includes('-')"
          class="overview-trends"
        >较上季度&nbsp;<div>{{quarterData.increase}}
            <ArrowUpOutlined />
          </div>
        </div>
        <div
          v-else
          class="overview-trends"
        >较上季度&nbsp;<div style="color: #22e6e6;">{{quarterData.increase}}
            <ArrowDownOutlined style="color: ;"/>
          </div>
        </div>
        <div class="expected-box">
          预计排放量&nbsp;<div>{{quarterData.prediction}}
          </div>
        </div>
      </div>
      <div class="overview-item overview-item-year">
        <div class="day-title">本年</div>
        <div class="overview-title">实际排放量(t)</div>
        <div class="overview-number">{{yearData.value}}</div>
        <div
          v-if="!yearData.increase?.includes('-')"
          class="overview-trends"
        >较去年&nbsp;<div>{{yearData.increase}}
            <ArrowUpOutlined />
          </div>
        </div>
        <div
          v-else
          class="overview-trends"
        >较去年&nbsp;<div style="color: #22e6e6;">{{yearData.increase}}
            <ArrowDownOutlined style="color: #22e6e6;"/>
          </div>
        </div>
        <div class="expected-box">
          预计排放量&nbsp;<div>{{yearData.prediction}}
          </div>
        </div>
      </div>
    </div>
    <div class="trend-forecast">
      <TrendForecast
        :title="'24H'"
        :id="'24HTrendChart'"
      />
    </div>
    <div class="trend-forecast">
      <TrendForecast
        :title="''"
        :id="'trendChart'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import TrendForecast from './TrendForecast.vue';
import { ref, onMounted } from 'vue';
import {
  getTrendForecastDayData,
  getTrendForecastDayWeek,
  getTrendForecastDayMonth,
  getTrendForecastDayQuarter,
  getTrendForecastDayYear,
} from '../standardized.api';

const dayData = ref<any>({});
const weekData = ref<any>({});
const monthData = ref<any>({});
const quarterData = ref<any>({});
const yearData = ref<any>({});

onMounted(async () => {
  let dayRes = await getTrendForecastDayData();
  let weekRes = await getTrendForecastDayWeek();
  let monthRes = await getTrendForecastDayMonth();
  let quarterRes = await getTrendForecastDayQuarter();
  let yearRes = await getTrendForecastDayYear();
  dayData.value = { ...dayRes };
  weekData.value = { ...weekRes };
  monthData.value = { ...monthRes };
  quarterData.value = { ...quarterRes };
  yearData.value = { ...yearRes };
});
</script>

<style lang="less" scoped>
.carbon-emission-trend {
  display: flex;
  flex-wrap: wrap;
  height: 82vh;
  width: 100%;
  padding: 10px 10px;
  margin: 0 10px;
  border: 1px solid rgb(122, 121, 121);
  overflow: auto;

  .overview-box {
    height: 260px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;

    .overview-item {
      width: 19%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-content: flex-start;
      border-radius: 5px;
      background-color: #fff;

      div {
        width: 80%;
        text-align: start;
      }

      .day-title {
        height: 60px;
        line-height: 60px;
        text-align: start;
        width: 100%;
        font-size: 28px;
        border-radius: 10px 10px 0 0;
        background-color: #e7b329;
        font-weight: 600;
        padding-left: 16px;
        color: #fff;
      }

      .overview-title {
        font-size: 24px;
        font-weight: 600;
        margin-top: 16px;
        color: #000;
      }
      .overview-number {
        font-size: 30px;
        color: #e7b329;
      }
      .carcon-bumber {
        color: #f3c940;
      }
      .overview-trends {
        display: flex;
        font-size: 16px;
        justify-content: flex-start;
        align-items: center;
        color: #8a8989;
        height: 40px;

        div {
          color: #f34040;
          width: 40%;
        }
      }
      .expected-box {
        display: flex;
        margin-top: 5px;
        font-size: 16px;
        height: 30px;
        padding-left: 10px;
        justify-content: flex-start;
        align-items: center;
        color: #d7c57c;
        border-radius: 5px;
        background-color: #fbf5e9;

        div {
          width: 40%;
          font-weight: 600;
        }
      }
    }
    .overview-item-week {
      .day-title {
        background-color: #faa435;
      }
      .overview-number {
        color: #faa435;
      }
      .carcon-bumber {
        color: #faa435;
      }
      .overview-trends {
        color: #8a8989;
        div {
          color: #faa435;
        }
      }
      .expected-box {
        color: #faa435;
        border-radius: 5px;
        background-color: #fef8e8;
      }
    }
    .overview-item-month {
      .day-title {
        background-color: #fd9359;
      }
      .overview-number {
        color: #fd9359;
      }
      .carcon-bumber {
        color: #fd9359;
      }
      .overview-trends {
        color: #8a8989;
        div {
          color: #fd9359;
        }
      }
      .expected-box {
        color: #fd9359;
        border-radius: 5px;
        background-color: #fdf3e2;
      }
    }
    .overview-item-quarter {
      .day-title {
        background-color: #fe7966;
      }
      .overview-number {
        color: #fe7966;
      }
      .carcon-bumber {
        color: #fe7966;
      }
      .overview-trends {
        color: #8a8989;
        div {
          color: #fe7966;
        }
      }
      .expected-box {
        color: #fe7966;
        border-radius: 5px;
        background-color: #fcf3ec;
      }
    }
    .overview-item-year {
      .day-title {
        background-color: #fc6e7a;
      }
      .overview-number {
        color: #fc6e7a;
      }
      .carcon-bumber {
        color: #fc6e7a;
      }
      .overview-trends {
        color: #8a8989;
        div {
          color: #fc6e7a;
        }
        #declineNumber {
          color: #22e6e6 !important;
        }
      }

      .expected-box {
        color: #fc6e7a;
        border-radius: 5px;
        background-color: #ffeef2;
      }
    }
  }

  .trend-forecast {
    height: 350px;
    width: 100%;
    padding: 5px;
    margin-top: 12px;
    background-color: #fff;
  }
}
</style>