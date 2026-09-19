import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

/**
 * Resolve Vite `base` from VITE_BASE_PATH.
 * Unset / empty / "/" → domain root (DreamHost staging/production).
 */
function resolveBase(): string {
  const raw = process.env.VITE_BASE_PATH
  if (raw === undefined || raw === '' || raw === '/') return '/'
  const trimmed = raw.replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/**
 * Injects responsive AVIF preload for the home hero (imagesrcset + imagesizes).
 */
function heroImagePreload(): Plugin {
  const avifByBytes: { fileName: string; bytes: number }[] = []
  let base = '/'

  return {
    name: 'hero-image-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset') continue
        if (
          typeof file.fileName === 'string' &&
          /nicole-goddard-team-hero/i.test(file.fileName) &&
          /\.avif$/i.test(file.fileName)
        ) {
          const source = file.source
          const bytes =
            typeof source === 'string'
              ? Buffer.byteLength(source)
              : source.byteLength
          avifByBytes.push({ fileName: file.fileName, bytes })
        }
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (avifByBytes.length === 0) return html
        // Smaller file ≈ smaller width (480 < 800 < 1024)
        const sorted = [...avifByBytes]
          .sort((a, b) => a.bytes - b.bytes)
          .slice(0, 3)
        const widths = [480, 800, 1024].slice(0, sorted.length)
        const toUrl = (fileName: string) =>
          `${base}${fileName.replace(/^\/+/, '')}`
        const srcset = sorted
          .map((c, i) => `${toUrl(c.fileName)} ${widths[i]}w`)
          .join(', ')
        const href = toUrl(sorted[0].fileName)
        const sizes = '(min-width: 1024px) 50vw, 100vw'
        const tag = `<link rel="preload" as="image" href="${href}" imagesrcset="${srcset}" imagesizes="${sizes}" type="image/avif" fetchpriority="high" />`
        return html.replace('</head>', `    ${tag}\n  </head>`)
      },
    },
  }
}

/**
 * Inlines the built CSS into index.html so the stylesheet is not render-blocking.
 * Safe while the bundle stays small (~7 KiB); prerender copies this into every route.
 */
function inlineCriticalCss(): Plugin {
  return {
    name: 'inline-critical-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html

        return html.replace(
          /<link\s+rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
          (match, href: string) => {
            const assetKey = Object.keys(bundle).find(
              (k) =>
                k.endsWith('.css') &&
                (href.endsWith(k) || href.endsWith(`/${k}`)),
            )
            if (!assetKey) return match
            const asset = bundle[assetKey]
            if (!asset || asset.type !== 'asset') return match
            const source =
              typeof asset.source === 'string'
                ? asset.source
                : Buffer.from(asset.source).toString('utf8')
            const escaped = source.replace(/<\/style/gi, '<\\/style')
            return `<style>${escaped}</style>`
          },
        )
      },
    },
  }
}

export default defineConfig({
  base: resolveBase(),
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-router')) return 'react-router'
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
  plugins: [
    figmaAssetResolver(),
    imagetools({
      defaultDirectives: new URLSearchParams(),
    }),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    heroImagePreload(),
    inlineCriticalCss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
