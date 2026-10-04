export function isPublicRecipePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/recipes" ||
    /^\/recipes\/[a-z0-9]{32}$/.test(pathname)
  );
}

export function isOnlineOnlyPath(pathname: string) {
  return (
    /^\/(admin|sign-in|sign-up)(\/|$)/.test(pathname) ||
    /^\/recipes\/(new(?:\/|$)|[^/]+\/edit(?:\/|$))/.test(pathname)
  );
}
