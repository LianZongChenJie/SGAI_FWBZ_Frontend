<template>
  <div class="energy-optimization">
    <div class="energy-optimization__box">
      <div class="energy-optimization__title">能源优化</div>
      <div v-if="loading" class="energy-optimization__tip">正在登录能源优化系统，请稍候…</div>
      <div v-else class="energy-optimization__error">登录失败，请检查网络或账号配置后重试</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Login1 } from './index.api'

/** 登录成功后的跳转地址 */
const REDIRECT_URL = 'http://10.22.154.2:888/appWebtopoPreview/appWebtopoPreview'
/** 登录账号 */
const LOGIN_USERNAME = 'user001'
const LOGIN_PASSWORD = '123456'
/** 写入 cookie 的 token 键名 */
const TOKEN_KEY = 'Admin-Token'

const loading = ref(true)

/** 将 token 写入 cookie（path=/，默认 1 小时有效） */
function setCookie(name: string, value: string, hours = 1): void {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

/** 初始化：调用登录接口获取 token -> 写入 cookie -> 跳转目标页面 */
async function initLogin(): Promise<void> {
  try {
    const res = await Login1({ username: LOGIN_USERNAME, password: LOGIN_PASSWORD })
    // defHttp 默认解包 result，token 可能为字符串或对象字段
    const token = typeof res === 'string' ? res : res?.token
    if (!token) {
      throw new Error('响应中未找到 token 字段')
    }
    setCookie(TOKEN_KEY, token)
    window.location.href = REDIRECT_URL
  } catch (e) {
    console.error('能源优化自动登录失败:', e)
    loading.value = false
  }
}

onMounted(() => {
  initLogin()
})
</script>

<style scoped lang="scss">
.energy-optimization {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  &__box {
    text-align: center;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
  }

  &__tip {
    margin-top: 12px;
    font-size: 14px;
    color: #8c8c8c;
  }

  &__error {
    margin-top: 12px;
    font-size: 14px;
    color: #e8833a;
  }
}
</style>
