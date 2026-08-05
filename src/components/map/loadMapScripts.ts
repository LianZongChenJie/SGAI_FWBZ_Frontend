/**
 * 动态加载地图所需的外部脚本（require.min.js / daximapapi.min.js 等）
 * 解决：在 index.html 全局引入 require.min.js 会注册 AMD define，
 *       导致 Vite 预构建的 UMD 模块（如 nprogress）走 AMD 路径，
 *       引发 nProgress.start is not a function 错误。
 *
 * 用法：在地图组件 onMounted 中调用 await loadMapScripts()，再初始化地图。
 */

let loadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 如果页面中已经存在该 script，直接 resolve
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // 保证顺序执行
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadMapScripts(): Promise<void> {
  // 单例：只加载一次
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    await loadScript('/map/require.min.js');
    await loadScript('/map/daximapapi.min.js');
    await loadScript('/road.js');
    // 关键：加载完成后立即隔离 AMD define，防止后续 Vite 模块
    // （如 nprogress）检测到 window.define 走 AMD 路径
    const _savedDefine = (window as any).define;
    (window as any).define = undefined;

    // 如果后续地图内部仍需要 AMD define（一般不需要），可恢复：
    // setTimeout(() => { (window as any).define = _savedDefine; }, 0);
  })();

  return loadPromise;
}
