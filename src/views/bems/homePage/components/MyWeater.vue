<template>
  <div class="three-day-forecast">
    <div class="forecast-days">
      <div v-for="day in forecastData" :key="day.date" class="forecast-day">
        <div class="day-name">{{ formatDay(day.date) }}</div>
        <div class="weather-icon">
          <img :src="day.day.condition.icon" :alt="day.day.condition.text">
        </div>
        <div class="temp-range">
          <span class="max-temp">{{ day.day.maxtemp_c }}°</span>
          <span class="min-temp">{{ day.day.mintemp_c }}°</span>
        </div>
        <div class="weather-condition">{{ day.day.condition.text }}</div>
        <div class="weather-details">
          <div class="detail-item">
            <i class="wi wi-strong-wind"></i>
            <span>{{ day.day.maxwind_kph }} km/h</span>
          </div>
          <div class="detail-item">
            <i class="wi wi-humidity"></i>
            <span>{{ day.day.avghumidity }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '近三天天气预报'
  },
  forecastData: {
    type: Array,
    required: true,
    default: () => [
      {
        date: '2023-05-01',
        day: {
          maxtemp_c: 26,
          mintemp_c: 18,
          condition: {
            text: '晴天',
            icon: 'https://cdn.weatherapi.com/weather/64x64/day/113.png'
          },
          maxwind_kph: 15,
          avghumidity: 65
        }
      },
      {
        date: '2023-05-02',
        day: {
          maxtemp_c: 24,
          mintemp_c: 16,
          condition: {
            text: '多云',
            icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png'
          },
          maxwind_kph: 12,
          avghumidity: 70
        }
      },
      {
        date: '2023-05-03',
        day: {
          maxtemp_c: 22,
          mintemp_c: 14,
          condition: {
            text: '小雨',
            icon: 'https://cdn.weatherapi.com/weather/64x64/day/176.png'
          },
          maxwind_kph: 10,
          avghumidity: 80
        }
      }
    ]
  }
});

const formatDay = (dateStr) => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};
</script>

<style scoped>
.three-day-forecast {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.forecast-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
}

.forecast-days {
  display: flex;
  justify-content: space-around;
  gap: 15px;
}

.forecast-day {
  flex: 1;
  text-align: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.forecast-day:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.day-name {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #444;
}

.weather-icon img {
  width: 64px;
  height: 64px;
}

.temp-range {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
  font-size: 1.2rem;
}

.max-temp {
  color: #ff6b6b;
  font-weight: bold;
}

.min-temp {
  color: #748ffc;
}

.weather-condition {
  margin: 10px 0;
  color: #666;
}

.weather-details {
  margin-top: 15px;
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 5px 0;
  color: #555;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .forecast-days {
    flex-direction: column;
  }
  
  .forecast-day {
    margin-bottom: 15px;
  }
}
</style>
