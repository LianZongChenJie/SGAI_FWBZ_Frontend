<template>
  <div :class="prefixCls" class="login-page">
    <!-- 语言切换 -->
    <AppLocalePicker
      class="absolute top-4 right-4 enter-x"
      :showText="false"
    />

    <!-- 登录卡片 -->
    <div class="login-box">
      <!-- Logo 区域 -->
      <div class="login-logo">
        <div class="icon">🏢</div>
        <h1>会展小镇服务保障平台</h1>
        <p>智慧会展 · 数字孪生 · AI驱动</p>
      </div>

      <!-- 登录表单 -->
      <div v-show="type === 'login'">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            @keyup.enter="login"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="login"
          />
        </div>
        <div class="form-group">
          <label>验证码</label>
          <div class="captcha-row">
            <input
              v-model="formData.inputCode"
              type="text"
              placeholder="请输入验证码"
              @keyup.enter="login"
            />
            <div class="captcha-img" @click="handleChangeCheckCode">
              <img
                v-if="randCodeData.requestCodeSuccess"
                :src="randCodeData.randCodeImage"
                alt="验证码"
              />
              <img
                v-else
                :src="codeImg"
                alt="验证码"
              />
            </div>
          </div>
        </div>
        <button class="login-btn" @click="login">登 录</button>
        <div class="login-features">
          <div class="login-feature">
            <div class="num">8</div>
            <div class="txt">功能模块</div>
          </div>
          <div class="login-feature">
            <div class="num">30+</div>
            <div class="txt">子系统对接</div>
          </div>
          <div class="login-feature">
            <div class="num">AI</div>
            <div class="txt">智能分析</div>
          </div>
        </div>
      </div>

      <!-- 忘记密码 -->
      <div v-show="type === 'forgot'" :class="`${prefixCls}-form`">
        <MiniForgotpad
          ref="forgotRef"
          @go-back="goBack"
          @success="handleSuccess"
        />
      </div>

      <!-- 注册 -->
      <div v-show="type === 'register'" :class="`${prefixCls}-form`">
        <MiniRegister
          ref="registerRef"
          @go-back="goBack"
          @success="handleSuccess"
        />
      </div>

      <!-- 扫码登录 -->
      <div v-show="type === 'codeLogin'" :class="`${prefixCls}-form`">
        <MiniCodelogin
          ref="codeRef"
          @go-back="goBack"
          @success="handleSuccess"
        />
      </div>
    </div>

    <!-- 第三方登录相关弹框 -->
    <ThirdModal ref="thirdModalRef"></ThirdModal>

    <!-- 图片验证码弹窗 -->
    <CaptchaModal
      @register="captchaRegisterModal"
      @ok="getLoginCode"
    />
  </div>
</template>

<script lang="ts" setup name="login-mini">
import { getCaptcha, getCodeInfo } from '/@/api/sys/user';
import { computed, onMounted, reactive, ref, toRaw, unref } from 'vue';
import codeImg from '/@/assets/images/checkcode.png';
import { Rule } from '/@/components/Form';
import { useUserStore } from '/@/store/modules/user';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { SmsEnum } from '/@/views/sys/login/useLogin';
import ThirdModal from '/@/views/sys/login/ThirdModal.vue';
import MiniForgotpad from './MiniForgotpad.vue';
import MiniRegister from './MiniRegister.vue';
import MiniCodelogin from './MiniCodelogin.vue';
import logoImg from '/@/assets/loginmini/icon/jeecg_logo.png';
import { AppLocalePicker } from '/@/components/Application';
import { useLocaleStore } from '/@/store/modules/locale';
import { useDesign } from '/@/hooks/web/useDesign';
import { useAppInject } from '/@/hooks/web/useAppInject';
import { GithubFilled, WechatFilled, DingtalkCircleFilled, createFromIconfontCN } from '@ant-design/icons-vue';
import CaptchaModal from '@/components/jeecg/captcha/CaptchaModal.vue';
import { useModal } from '@/components/Modal';
import { ExceptionEnum } from '@/enums/exceptionEnum';

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2316098_umqusozousr.js',
});
const { prefixCls } = useDesign('mini-login');
const { notification, createMessage } = useMessage();
const userStore = useUserStore();
const { t } = useI18n();
const localeStore = useLocaleStore();
const showLocale = localeStore.getShowPicker;
const randCodeData = reactive<any>({
  randCodeImage: '',
  requestCodeSuccess: false,
  checkKey: null,
});
const rememberMe = ref<string>('0');
const activeIndex = ref<string>('accountLogin');
const type = ref<string>('login');
const formData = reactive<any>({
  inputCode: '',
  username: '',
  password: '',
});
const phoneFormData = reactive<any>({
  mobile: '',
  smscode: '',
});
const loginRef = ref();
const thirdModalRef = ref();
const codeRef = ref();
const showInterval = ref<boolean>(true);
const timeRuning = ref<number>(60);
const timer = ref<any>(null);
const forgotRef = ref();
const registerRef = ref();
const loginLoading = ref<boolean>(false);
const { getIsMobile } = useAppInject();
const [captchaRegisterModal, { openModal: openCaptchaModal }] = useModal();
defineProps({
  sessionTimeout: {
    type: Boolean,
  },
});

function handleChangeCheckCode() {
  formData.inputCode = '';
  randCodeData.checkKey = 1629428467008;
  getCodeInfo(randCodeData.checkKey).then((res) => {
    randCodeData.randCodeImage = res;
    randCodeData.requestCodeSuccess = true;
  });
}

function loginClick(type) {
  activeIndex.value = type;
}

async function loginHandleClick() {
  if (unref(activeIndex) === 'accountLogin') {
    accountLogin();
  } else {
    phoneLogin();
  }
}

async function accountLogin() {
  if (!formData.username) {
    createMessage.warn(t('sys.login.accountPlaceholder'));
    return;
  }
  if (!formData.password) {
    createMessage.warn(t('sys.login.passwordPlaceholder'));
    return;
  }
  try {
    loginLoading.value = true;
    const { userInfo } = await userStore.login(
      toRaw({
        password: formData.password,
        username: formData.username,
        captcha: formData.inputCode,
        checkKey: randCodeData.checkKey,
        mode: 'none',
      })
    );
    if (userInfo) {
      notification.success({
        message: t('sys.login.loginSuccessTitle'),
        description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realname}`,
        duration: 3,
      });
    }
  } catch (error) {
    notification.error({
      message: t('sys.api.errorTip'),
      description: error.message || t('sys.login.networkExceptionMsg'),
      duration: 3,
    });
    handleChangeCheckCode();
  } finally {
    loginLoading.value = false;
  }
}

async function phoneLogin() {
  if (!phoneFormData.mobile) {
    createMessage.warn(t('sys.login.mobilePlaceholder'));
    return;
  }
  if (!phoneFormData.smscode) {
    createMessage.warn(t('sys.login.smsPlaceholder'));
    return;
  }
  try {
    loginLoading.value = true;
    const { userInfo }: any = await userStore.phoneLogin({
      mobile: phoneFormData.mobile,
      captcha: phoneFormData.smscode,
      mode: 'none',
    });
    if (userInfo) {
      notification.success({
        message: t('sys.login.loginSuccessTitle'),
        description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realname}`,
        duration: 3,
      });
    }
  } catch (error) {
    notification.error({
      message: t('sys.api.errorTip'),
      description: error.message || t('sys.login.networkExceptionMsg'),
      duration: 3,
    });
  } finally {
    loginLoading.value = false;
  }
}

async function getLoginCode() {
  if (!phoneFormData.mobile) {
    createMessage.warn(t('sys.login.mobilePlaceholder'));
    return;
  }
  const result = await getCaptcha({ mobile: phoneFormData.mobile, smsmode: SmsEnum.FORGET_PASSWORD }).catch((res) => {
    if (res.code === ExceptionEnum.PHONE_SMS_FAIL_CODE) {
      openCaptchaModal(true, {});
    }
  });
  if (result) {
    const TIME_COUNT = 60;
    if (!unref(timer)) {
      timeRuning.value = TIME_COUNT;
      showInterval.value = false;
      timer.value = setInterval(() => {
        if (unref(timeRuning) > 0 && unref(timeRuning) <= TIME_COUNT) {
          timeRuning.value = timeRuning.value - 1;
        } else {
          showInterval.value = true;
          clearInterval(unref(timer));
          timer.value = null;
        }
      }, 1000);
    }
  }
}

function onThirdLogin(type) {
  thirdModalRef.value.onThirdLogin(type);
}

function forgetHandelClick() {
  type.value = 'forgot';
  setTimeout(() => {
    forgotRef.value.initForm();
  }, 300);
}

function goBack() {
  activeIndex.value = 'accountLogin';
  type.value = 'login';
}

function handleSuccess(value) {
  Object.assign(formData, value);
  Object.assign(phoneFormData, { mobile: '', smscode: '' });
  type.value = 'login';
  activeIndex.value = 'accountLogin';
  handleChangeCheckCode();
}

function registerHandleClick() {
  type.value = 'register';
  setTimeout(() => {
    registerRef.value.initForm();
  }, 300);
}

function codeHandleClick() {
  type.value = 'codeLogin';
  setTimeout(() => {
    codeRef.value.initFrom();
  }, 300);
}

const login = () => {
  loginHandleClick()
}

onMounted(() => {
  handleChangeCheckCode();
});
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-mini-login';

.@{prefix-cls} {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #3182ce 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='20' cy='20' r='2' fill='rgba(255,255,255,0.1)'/%3E%3Ccircle cx='80' cy='40' r='3' fill='rgba(255,255,255,0.08)'/%3E%3Ccircle cx='40' cy='80' r='2' fill='rgba(255,255,255,0.1)'/%3E%3Ccircle cx='70' cy='70' r='1.5' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    pointer-events: none;
  }

  .login-box {
    background: rgba(255, 255, 255, 0.95);
    padding: 50px 45px;
    border-radius: 16px;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
    width: 420px;
    position: relative;
    z-index: 1;

    .login-logo {
      text-align: center;
      margin-bottom: 35px;

      .icon {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #3182ce, #2c5282);
        border-radius: 14px;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 32px;
      }

      h1 {
        font-size: 24px;
        color: #1a365d;
        margin-bottom: 8px;
        font-weight: 600;
      }

      p {
        font-size: 13px;
        color: #718096;
      }
    }

    .form-group {
      margin-bottom: 22px;

      label {
        display: block;
        font-size: 13px;
        color: #4a5568;
        margin-bottom: 8px;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 14px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        font-size: 14px;
        color: #2d3748;
        transition: all 0.3s;
        background: #fff;
        outline: none;
        box-sizing: border-box;

        &:focus {
          border-color: #3182ce;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
        }

        &::placeholder {
          color: #a0aec0;
          font-size: 13px;
        }
      }

      .captcha-row {
        display: flex;
        gap: 10px;

        input {
          flex: 1;
        }

        .captcha-img {
          width: 100px;
          height: 42px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }

    .login-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #3182ce, #2c5282);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      letter-spacing: 4px;
      margin-top: 10px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(49, 130, 206, 0.35);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .login-features {
      display: flex;
      justify-content: space-around;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;

      .login-feature {
        text-align: center;

        .num {
          font-size: 20px;
          font-weight: 700;
          color: #3182ce;
        }

        .txt {
          font-size: 11px;
          color: #718096;
          margin-top: 4px;
        }
      }
    }
  }
}
</style>

<style lang="less">
@prefix-cls: ~'@{namespace}-mini-login';

html[data-theme='dark'] {
  .@{prefix-cls} {
    background-color: #293146 !important;
    background-image: none;

    &::before {
      background-image: url(/@/assets/svg/login-bg-dark.svg);
    }
  }
}
</style>