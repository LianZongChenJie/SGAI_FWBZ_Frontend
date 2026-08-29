/**
 * 北区照明系统主题切换
 * sessionStorage.UserRoles（queryUserRoles 接口返回的数组）包含 'bqzm' → 黑色主题（theme-black）
 * 其他情况（不包含或没有 UserRoles 这个 key）→ 白色主题（theme-white）
 */
export function useScreenTheme() {
  let isBlack = false;
  try {
    const roles = JSON.parse(sessionStorage.getItem('UserRoles') || '[]');
    isBlack =
      Array.isArray(roles) &&
      roles.some((r) => String(r).toLowerCase() === 'bqzm');
  } catch (e) {
    isBlack = false;
  }
  return {
    themeClass: isBlack ? 'theme-black' : 'theme-white',
  };
}
