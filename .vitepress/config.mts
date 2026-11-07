import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { fileURLToPath, URL } from 'node:url'

// ============================================================
// 竹巴噶举妙法如意宝藏 · 站点总配置
// 以竹巴噶举网站（drukpa-library）为底本修改：纯藏文、无简繁切换。
// ============================================================

const SITE_URL = 'https://example.org'          // ← 域名确定后改这里
const SITE_TITLE = 'དཔལ་འབྲུག་པའི་དམ་ཆོས་ནོར་བུའི་བང་མཛོད།'
const SITE_TITLE_ZH = '竹巴噶举妙法如意宝藏'   // 仅作备注，网页上不显示
const APP_NAME = 'ནོར་བུའི་བང་མཛོད'

// ===== 图片/大文件存放地址（Cloudflare R2 对象存储）=====
// 唐卡高清图、PDF 原件等大文件不放进本仓库，而是放在 R2，网页里只放链接。
// 本地开发时留空，图片从本地 public/media/ 文件夹读取（该文件夹不进仓库）；
// 上线时在 Cloudflare Pages 的环境变量里设置 VITE_MEDIA_BASE，
// 例如 https://media.example.org ，无需改动任何页面。
// 页面里统一用 <MediaImage path="thangka/xxx" /> 引用，见 theme/media.ts。
const MEDIA_BASE = (process.env.VITE_MEDIA_BASE || '').replace(/\/$/, '')

export default withPwa(defineConfig({
  base: '/',
  lang: 'bo',

  title: SITE_TITLE,
  titleTemplate: `:title | ${APP_NAME}`,
  description: SITE_TITLE,

  // 链接用 /chos-mdzod/ka/ 这样的短英文路径：藏文路径会被编码成很长的 %E0%BD… 串
  cleanUrls: false,
  srcExclude: ['README.md'],   // 说明文件不生成网页
  sitemap: { hostname: SITE_URL },
  lastUpdated: false,

  vite: {
    define: {
      __MEDIA_BASE__: JSON.stringify(MEDIA_BASE)
    },
    resolve: {
      alias: [
        {
          // 与竹巴噶举网站相同：用定制搜索框替换自带的，按回车才搜索
          find: /^.*\/VPLocalSearchBox\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/SiteSearchBox.vue', import.meta.url)
          )
        }
      ]
    }
  },

  head: [
    ['link', { rel: 'preload', href: '/fonts/NotoSerifTibetan-bo.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#9a5b2e' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-title', content: APP_NAME }]
  ],

  // 深色模式开关：顶部“色调”按钮切换，默认跟随系统
  appearance: true,

  themeConfig: {
    // 顶部导航栏由 theme/components/SiteHeader.vue 自绘，这里只保留搜索设置
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        disableQueryPersistence: true,

        // 正文用 HTML 书写，补一个隐形标题让整页进入索引（同竹巴噶举网站）
        _render: (src, env, md) => {
          const html = md.render(src, env)
          if (env.frontmatter?.search === false) return ''
          if (/^(README)\.md$/i.test(env.relativePath)) return ''
          const title = String(env.frontmatter?.title || '').trim() || SITE_TITLE
          return `<h1>${title}<a class="header-anchor" href="#"></a></h1>\n` + html
        },

        // ===== 藏文分词 =====
        // 藏文不用空格，按音节点（ཙེག་ U+0F0B）和标点切成音节；
        // 查询时要求所有音节都命中（AND），最后一个音节允许前缀匹配。
        // 注意：函数会被原样送到浏览器执行，内部不能引用外部变量。
        miniSearch: {
          options: {
            tokenize: (text) =>
              text.split(/[\s\p{Z}\p{P}༄-༔༴༶༸༺-༽]+/u).filter(Boolean)
          },
          searchOptions: {
            tokenize: (text) =>
              text.split(/[\s\p{Z}\p{P}༄-༔༴༶༸༺-༽]+/u).filter(Boolean),
            combineWith: 'AND',
            fuzzy: false,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 }
          }
        },

        translations: {
          button: { buttonText: 'འཚོལ།', buttonAriaLabel: 'འཚོལ།' },
          modal: {
            displayDetails: 'ཞིབ་ཕྲ།',
            resetButtonTitle: 'གསལ་བ།',
            backButtonTitle: 'ཁ་རྒྱག',
            noResultsText: 'འཚོལ་འབྲས་མ་རྙེད།',
            footer: { selectText: 'འདེམས།', navigateText: 'སྤོ།', closeText: 'ཁ་རྒྱག' }
          }
        }
      }
    }
  },

  // ===== PWA =====
  // 只预缓存网站本身（页面、脚本、字体、小图标）。
  // R2 上的唐卡图片和 PDF 一律不预缓存，避免手机后台下载几个 GB。
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png'],
    manifest: {
      id: '/',
      name: SITE_TITLE,
      short_name: APP_NAME,
      description: SITE_TITLE,
      lang: 'bo',
      theme_color: '#9a5b2e',
      background_color: '#f3efe6',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico}'],
      globIgnores: ['media/**'],
      maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      cleanupOutdatedCaches: true,
      // 浏览过的 R2 缩略图可以缓存少量（最多 300 张、30 天），原图不缓存
      runtimeCaching: MEDIA_BASE
        ? [
            {
              // 用正则（会被写进 service worker 文件，不能用函数引用外部变量）
              urlPattern: new RegExp('^' + MEDIA_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/.*/thumb\\.'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'media-thumbs',
                expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 3600 }
              }
            }
          ]
        : []
    }
  }
}))
