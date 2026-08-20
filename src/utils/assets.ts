/**
 * Utility function to resolve asset URLs with the correct Vite base URL
 * (e.g. for GitHub Pages or subfolder deployments like /portfolio-v2/)
 */
export function getAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const baseUrl = import.meta.env.BASE_URL || "/";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${cleanBase}${cleanPath}`;
}
