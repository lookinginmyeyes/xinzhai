/** 与 TabBar 一致：这些路径不显示底部导航，也不应保留 pb-16 */
export function shouldHideTabBar(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith('/chat') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/about')
  );
}
