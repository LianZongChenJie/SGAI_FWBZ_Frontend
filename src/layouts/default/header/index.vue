<template>
  <Header :class="getHeaderClass">
    <!-- left: breadcrumb -->
    <div :class="`${prefixCls}-left`">
      <div class="breadcrumb">
        <span>首页</span>
        <span class="separator">/</span>
        <span class="current">{{ breadcrumbTitle }}</span>
      </div>
    </div>

    <!-- right: action items -->
    <div :class="`${prefixCls}-action`">
      <!-- 告警 -->
      <div class="topbar-item bell-out-lined" @click="goToAlertHandle">
        <span>🔔</span>
        <span>告警</span>
        <span class="badge">{{ alarmCount }}</span>
      </div>

      <!-- 日期 -->
      <div class="topbar-item">
        <span>📅</span>
        <span>{{ currentDate }}</span>
      </div>

      <!-- 大屏可视化 -->
      <div class="topbar-item bigscreen-btn" @click="openBigscreen">
        <span>📊</span>
        <span>大屏可视化</span>
      </div>

      <!-- 用户信息（带下拉菜单-仅退出登录） -->
      <Dropdown placement="bottomRight" class="topbar-item user-dropdown">
        <span class="user-info-trigger">
          <div class="user-avatar">{{ userNameInitial }}</div>
          <span class="user-name">{{ userName }}</span>
        </span>
        <template #overlay>
          <Menu @click="handleUserMenuClick">
            <MenuItem itemKey="logout" text="退出登录" icon="ion:power-outline" />
          </Menu>
        </template>
      </Dropdown>
    </div>
  </Header>
  <LoginSelect ref="loginSelectRef" @success="loginSelectOk" />
</template>
<script lang="ts">
  import { defineComponent, computed, ref, unref, onMounted, toRaw, defineAsyncComponent } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { propTypes } from '/@/utils/propTypes';
  import { Layout, Dropdown, Menu } from 'ant-design-vue';

  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';

  import { useAppInject } from '/@/hooks/web/useAppInject';
  import { useDesign } from '/@/hooks/web/useDesign';

  import { getAlarmStatistics } from '/@/views/bems-web/overview/index.api';

  import LoginSelect from '/@/views/sys/login/LoginSelect.vue';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';

  export default defineComponent({
    name: 'LayoutHeader',
    components: {
      Header: Layout.Header,
      Dropdown,
      Menu,
      MenuItem: defineAsyncComponent(() => import('./components/user-dropdown/DropMenuItem.vue')),
      LoginSelect,
    },
    props: {
      fixed: propTypes.bool,
    },
    setup(props) {
      const { prefixCls } = useDesign('layout-header');
      const userStore = useUserStore();
      const route = useRoute();
      const router = useRouter();
      const { getHeaderTheme } = useHeaderSetting();

      const { getIsMobile } = useAppInject();

      // 计算面包屑标题
      const breadcrumbTitle = computed(() => {
        const matched = route.matched;
        // 跳过根路由和bems-web布局路由
        const matchedRoutes = matched.filter((r) => r.name && r.path !== '/' && r.path !== '/bems-web');
        // 如果是二级路由，显示 "一级/二级"
        if (matchedRoutes.length >= 2) {
          const parentTitle = matchedRoutes[matchedRoutes.length - 2]?.meta?.title || '';
          const currentTitle = matchedRoutes[matchedRoutes.length - 1]?.meta?.title || '';
          return `${parentTitle} / ${currentTitle}`;
        }
        // 如果是一级路由，直接显示标题
        if (matchedRoutes.length === 1) {
          return matchedRoutes[0]?.meta?.title || '';
        }
        return '';
      });

      // 当前日期
      const currentDate = computed(() => {
        return dayjs().format('YYYY-MM-DD');
      });

      // 用户信息
      const userName = computed(() => {
        return userStore.getUserInfo?.realname || '管理员';
      });

      const userNameInitial = computed(() => {
        const name = userName.value;
        return name.charAt(0);
      });

      const getHeaderClass = computed(() => {
        const theme = unref(getHeaderTheme);
        return [
          prefixCls,
          {
            [`${prefixCls}--fixed`]: props.fixed,
            [`${prefixCls}--mobile`]: unref(getIsMobile),
            [`${prefixCls}--${theme}`]: theme,
          },
        ];
      });

      // 用户下拉菜单点击处理 - 仅退出登录
      function handleUserMenuClick({ key }: Record<string, any>) {
        if (key === 'logout') {
          userStore.confirmLoginOut();
        }
      }

      // 打开大屏可视化（当前页面跳转）
      function openBigscreen() {
        router.push('/bigscreen');
      }

      /**
       * 首页多租户部门弹窗逻辑
       */
      const loginSelectRef = ref();

      function showLoginSelect() {
        //update-begin---author:liusq  Date:20220101  for：判断登录进来是否需要弹窗选择租户----
        //判断是否是登陆进来
        const loginInfo = toRaw(userStore.getLoginInfo) || {};
        if (!!loginInfo.isLogin) {
          loginSelectRef.value.show(loginInfo);
        }
        //update-end---author:liusq  Date:20220101  for：判断登录进来是否需要弹窗选择租户----
      }

      function loginSelectOk() {
        console.log('成功。。。。。');
      }

      // 告警数量（待处理告警）
      const alarmCount = ref(0);

      // 获取待处理告警数量（取 untreatedCount 字段）
      async function fetchAlarmCount() {
        try {
          const res = await getAlarmStatistics();
          if (res != null) {
            alarmCount.value = res.untreatedCount ?? 0;
          }
        } catch {
          // 静默处理
        }
      }

      // 跳转到告警处理页面
      function goToAlertHandle() {
        router.push('/fwbz/alert/handle');
      }

      onMounted(() => {
        showLoginSelect();
        fetchAlarmCount();
      });

      return {
        prefixCls,
        getHeaderClass,
        getIsMobile,
        loginSelectRef,
        loginSelectOk,
        breadcrumbTitle,
        currentDate,
        userName,
        userNameInitial,
        alarmCount,
        handleUserMenuClick,
        openBigscreen,
        goToAlertHandle,
      };
    },
  });
</script>
<style lang="less">
  @import './index.less';
  //update-begin---author:scott ---date:2022-09-30  for：默认隐藏顶部菜单面包屑-----------
  //顶部欢迎语展示样式
  @prefix-cls: ~'@{namespace}-layout-header';
  
  .ant-layout .@{prefix-cls} {
    display: flex;
    padding: 0 8px;
    // update-begin--author:liaozhiyang---date:20240407---for：【QQYUN-8762】顶栏高度
    height: @header-height;
    // update-end--author:liaozhiyang---date:20240407---for：【QQYUN-8762】顶栏高度
    align-items: center;
    
    .headerIntroductionClass {
      margin-right: 4px;
      margin-bottom: 2px;
      border-bottom: 0px;
      border-left: 0px;
    }
    
    &--light {
      .headerIntroductionClass {
        color: #000;
      }
    }
    //update-end---author:scott ---date::2022-09-30  for：默认隐藏顶部菜单面包屑--------------
  }
</style>
