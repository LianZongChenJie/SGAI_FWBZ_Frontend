/**
 * ============================================================
 * 大屏可视化统一自适应方案（rem + flex + vw/vh）
 * ============================================================
 * 设计基准：1920 × 1080
 *
 * 使用方式（页面 script setup 中调用一次即可）：
 *   import { useScreenScale } from '../useScreenScale';
 *   useScreenScale();
 *
 * 单位规范（写样式时遵循）：
 *   - rem：尺寸细节（padding / margin / gap / width / font-size / border-radius / box-shadow 等）
 *     换算规则：设计稿 px ÷ 100 = rem（如 14px → 0.14rem），1rem = 100px @1920
 *   - flex：一切布局优先使用弹性布局撑满/平分，禁止写死高度
 *   - vw / vh：整屏级定位、大面板尺寸、留白（如面板宽 17.7vw、距顶 8.3vh）
 *   - 1px 细线边框：保留 px（视觉恒定细线，不做缩放）
 *   - 地图容器：显式 font-size: 16px 隔离，防止地图 SDK 内部 UI 继承根字号
 *
 * 机制：进入页面时按视口宽度动态设置 html 根字号，
 * 窗口尺寸变化时自动更新；组件卸载后恢复原根字号，不影响其他页面。
 * 注意：根字号带 1920 宽度下限——视口小于 1920（如 Windows 缩放后
 * 只剩 1536/1280 CSS 像素）时按 1920 计算，字体保持设计稿大小不缩水；
 * 视口大于 1920（2K/4K）时等比放大。
 */
import { onMounted, onUnmounted } from 'vue';

/** 设计稿宽度 */
const DESIGN_WIDTH = 1920;
/** 1rem = 100px @1920（根字号 = 100 * 视口宽度 / 1920） */
const REM_BASE = 100;
/** 宽度下限：视口小于 1920 时不再缩小，防止字体整体偏小 */
const MIN_WIDTH = 1920;

export function useScreenScale() {
  /** 进入页面前的 html 根字号（卸载时恢复） */
  let prevFontSize = '';

  const updateRootFontSize = () => {
    const el = document.documentElement;
    const width = Math.max(el.clientWidth || window.innerWidth, MIN_WIDTH);
    el.style.fontSize = ((width / DESIGN_WIDTH) * REM_BASE).toFixed(4) + 'px';
  };

  onMounted(() => {
    prevFontSize = document.documentElement.style.fontSize;
    updateRootFontSize();
    window.addEventListener('resize', updateRootFontSize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateRootFontSize);
    document.documentElement.style.fontSize = prevFontSize || '';
  });

  return { updateRootFontSize };
}
