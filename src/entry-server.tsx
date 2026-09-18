import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import V5App from "./versions/v5-multipage/App";
import {
  createHeadBag,
  HeadProvider,
  serializeHeadTags,
  type HeadState,
} from "./versions/v5-multipage/components/HeadContext";
import {
  htmlOutPath,
  publicPaths,
  routerLocationForPath,
} from "./versions/v5-multipage/content/routes";
import { SITEMAP_LASTMOD } from "./versions/v5-multipage/content/schema";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export type RenderResult = {
  html: string;
  head: HeadState;
};

export {
  htmlOutPath,
  publicPaths,
  routerLocationForPath,
  serializeHeadTags,
  SITEMAP_LASTMOD,
};

/** Server render of the production multipage app for a given URL path. */
export function render(url: string): RenderResult {
  const head = createHeadBag();
  const html = renderToString(
    <HeadProvider head={head}>
      <StaticRouter basename={routerBasename} location={url}>
        <V5App />
      </StaticRouter>
    </HeadProvider>,
  );
  return { html, head };
}
