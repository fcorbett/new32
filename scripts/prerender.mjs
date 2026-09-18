/**
 * Post-build prerender of all public routes into docs/*.html.
 * Uses the production SSR bundle (vite build --ssr) so imagetools
 * URLs resolve to /assets/* — not the /@imagetools/* dev middleware paths.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const docsDir = path.resolve(root, "docs");
const indexPath = path.resolve(docsDir, "index.html");
const ssrEntry = path.resolve(docsDir, ".ssr/entry-server.js");

function viteBasePath() {
  const raw = process.env.VITE_BASE_PATH;
  if (raw === undefined || raw === "" || raw === "/") return "/";
  const trimmed = raw.replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}/` : "/";
}

function stripShellHead(html) {
  return html
    .replace(/<title>[^<]*<\/title>\s*/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/i, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/i, "")
    .replace(/<meta\s+name=["']robots["'][^>]*>\s*/i, "")
    .replace(/<meta\s+(?:property|name)=["']og:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, "");
}

function injectRoot(html, appHtml) {
  if (html.includes('<div id="root"></div>')) {
    return html.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );
  }
  if (html.includes('id="root"')) {
    return html.replace(
      /<div id="root">[\s\S]*?<\/div>\s*(?=<script type="module")/,
      `<div id="root">${appHtml}</div>\n    `,
    );
  }
  throw new Error('Could not find #root in docs/index.html');
}

function injectHead(html, headTags) {
  const cleaned = stripShellHead(html);
  if (!cleaned.includes("</head>")) {
    throw new Error("Could not find </head> in HTML template");
  }
  return cleaned.replace("</head>", `    ${headTags}\n  </head>`);
}

/** Home-only LCP preload must not appear on interior routes. */
function stripHomeHeroPreload(html) {
  return html.replace(
    /\s*<link\s+rel="preload"\s+as="image"[^>]*nicole-goddard-team-hero[^>]*>\s*/gi,
    "\n",
  );
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function main() {
  if (!fs.existsSync(indexPath)) {
    console.error("docs/index.html missing — run vite build first");
    process.exit(1);
  }
  if (!fs.existsSync(ssrEntry)) {
    console.error("docs/.ssr/entry-server.js missing — run vite SSR build first");
    process.exit(1);
  }

  const {
    render,
    publicPaths,
    htmlOutPath,
    routerLocationForPath,
    serializeHeadTags,
    SITEMAP_LASTMOD,
  } = await import(pathToFileURL(ssrEntry).href);

  const template = fs.readFileSync(indexPath, "utf-8");
  const base = viteBasePath();
  const paths = publicPaths();
  const allJobs = [
    ...paths.map((p) => ({ path: p, out: htmlOutPath(p), notFound: false })),
    { path: "__404__", out: "404.html", notFound: true },
  ];

  let written = 0;
  for (const job of allJobs) {
    const location = job.notFound
      ? routerLocationForPath("this-page-does-not-exist", base)
      : routerLocationForPath(job.path, base);

    const { html: appHtml, head } = render(location);

    if (!appHtml || appHtml.trim().length === 0) {
      console.error(
        `Prerender produced empty HTML for location "${location}"`,
      );
      process.exit(1);
    }
    if (appHtml.includes("/@imagetools/")) {
      console.error("Prerender produced /@imagetools/ URLs — SSR bundle is wrong");
      process.exit(1);
    }
    if (job.notFound && !head.robots?.includes("noindex")) {
      console.error("404 prerender missing noindex robots meta");
      process.exit(1);
    }
    if (job.notFound && head.canonical !== "https://new32dental.com/") {
      console.error(
        `404 prerender canonical must be the homepage (got "${head.canonical}")`,
      );
      process.exit(1);
    }

    let html = injectRoot(template, appHtml);
    html = injectHead(html, serializeHeadTags(head));
    if (job.path !== "") {
      html = stripHomeHeroPreload(html);
    }

    const outFile = path.resolve(docsDir, job.out);
    ensureDir(outFile);
    fs.writeFileSync(outFile, html);
    written += 1;
    console.log(`Prerendered ${location} → docs/${job.out}`);
  }

  const aboutIndex = path.resolve(docsDir, "about/index.html");
  const aboutHtml = path.resolve(docsDir, "about.html");
  if (!fs.existsSync(aboutIndex)) {
    console.error("docs/about/index.html missing — htmlOutPath('about') is wrong");
    process.exit(1);
  }
  if (fs.existsSync(aboutHtml)) {
    console.error("docs/about.html must not exist (collides with about/ directory)");
    process.exit(1);
  }

  const sitemapUrls = paths.map((p) => {
    const loc = p
      ? `https://new32dental.com/${p}`
      : "https://new32dental.com/";
    return `  <url><loc>${loc}</loc><lastmod>${SITEMAP_LASTMOD}</lastmod></url>`;
  });
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join("\n")}
</urlset>
`;
  fs.writeFileSync(path.resolve(docsDir, "sitemap.xml"), sitemap);
  console.log(`Wrote docs/sitemap.xml (${paths.length} URLs)`);
  console.log(`Prerendered ${written} HTML files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
