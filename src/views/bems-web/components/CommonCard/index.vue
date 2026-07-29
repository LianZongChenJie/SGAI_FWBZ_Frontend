<!--
 * @component CommonCard
 * @description 总览仪表盘通用卡片可跳转路由
 -->
<template>
  <a-card
    class="common-card"
    :bordered="false"
    hoverable
    @click="handleClick"
  >
    <div class="common-card__body">
      <component :is="icon" class="common-card__icon" :style="{ background: iconBgColor }" />
      <span class="common-card__title">{{ title }}</span>
    </div>
  </a-card>
</template>

<script setup lang="ts">

defineOptions({ name: 'CommonCard' })
import { useRouter } from 'vue-router';

interface Props {
  /** 图标组件 */
  icon: Component;
  /** 标题文字 */
  title: string;
  /** 跳转路由路径 */
  to: string;
  /** 图标背景颜色 */
  iconBgColor?: string;
}


const props = withDefaults(defineProps<Props>(), {
  iconBgColor: '#e6f7ff',
});

const router = useRouter();

const handleClick = () => {
//   const props = defineProps<Props>();
  router.push(props.to);
};
</script>

<style scoped lang="less">
.common-card {
  min-width: 220px;
  min-height: 140px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.ant-card-body) {
    padding: 16px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    font-size: 26px;
    color: #1890ff;
    border-radius: 8px;
    padding: 8px;
  }

  &__title {
    font-size: 13px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    text-align: center;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: #1890ff;
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.2);
  }
}
</style>