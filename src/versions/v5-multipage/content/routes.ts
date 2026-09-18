import { FOOTER_LEGAL_ITEMS, NAV_ITEMS, pages } from "./nav";
import { teamMembers } from "./team";

/** Public indexable paths (no leading slash, empty string = home). */
export function publicPaths(): string[] {
  const paths = [
    pages.home.path,
    ...NAV_ITEMS.map((item) => item.path),
    ...teamMembers.map((m) => `about/${m.slug}`),
    ...FOOTER_LEGAL_ITEMS.map((item) => item.path),
  ];
  return paths;
}

/** Router location for StaticRouter (includes Vite base / basename). */
export function routerLocationForPath(path: string, basePath: string): string {
  const base =
    !basePath || basePath === "/"
      ? ""
      : `/${basePath.replace(/^\/+|\/+$/g, "")}`;
  if (!path) return `${base}/` || "/";
  return `${base}/${path}`;
}

/**
 * Output HTML path under docs/ for a public path.
 * Nested sections (currently `/about` + bios) must use `about/index.html`
 * so Apache can serve `/about` from a real directory without colliding
 * with `about.html`.
 */
export function htmlOutPath(path: string): string {
  if (!path) return "index.html";
  if (path === "about") return "about/index.html";
  return `${path}.html`;
}
