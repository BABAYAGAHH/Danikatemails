export function getSafeClientRedirectPath(
  url: string | null | undefined,
  fallbackPath: string
) {
  if (!url) {
    return fallbackPath;
  }

  if (url.startsWith("/")) {
    return url;
  }

  if (typeof window === "undefined") {
    return fallbackPath;
  }

  try {
    const parsed = new URL(url, window.location.origin);

    if (parsed.origin !== window.location.origin) {
      return fallbackPath;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallbackPath;
  } catch {
    return fallbackPath;
  }
}
