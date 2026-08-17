export function isAllowedDemoUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.toLowerCase() === 'echo.free.beeceptor.com'
    );
  } catch {
    return false;
  }
}
