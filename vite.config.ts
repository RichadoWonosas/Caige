import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { mkdir, writeFile } from 'node:fs/promises'

const sitesStaticWorker = () => ({
  name: 'sites-static-worker',
  apply: 'build' as const,
  async closeBundle() {
    await mkdir('dist/server', { recursive: true })
    await writeFile('dist/server/index.js', `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || request.method !== 'GET') return response
    const url = new URL(request.url)
    if (/\\.[a-z0-9]+$/i.test(url.pathname)) return response
    return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request))
  }
}
export default worker
`)
  },
})

export default defineConfig({
  base: '/Caige/',
  plugins: [
    vue(),
    tailwindcss(),
    sitesStaticWorker(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
        suppressWarnings: true,
      },
      manifest: {
        id: '/Caige/',
        name: 'Caige · 猜歌吃鸡',
        short_name: 'Caige',
        description: '猜歌与字符竞猜的本地优先计分工具',
        lang: 'zh-Hans',
        start_url: '/Caige/',
        scope: '/Caige/',
        display: 'standalone',
        background_color: 'hsl(222 47% 11%)',
        theme_color: 'hsl(222 47% 11%)',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,ico,json}'],
        navigateFallback: 'index.html'
      }
    })
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts']
  }
})
