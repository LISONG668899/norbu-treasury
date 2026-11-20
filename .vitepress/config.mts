import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { fileURLToPath, URL } from 'node:url'

// ============================================================
// PUNDARIKA · པདྨ་དཀར་པོ། · 站点总配置
// 以竹巴噶举网站（drukpa-library）为底本修改：纯藏文、无简繁切换；收录不限于竹巴噶举。
// ============================================================

const SITE_URL = 'https://www.lotustrove.org'   // 主网址；不带 www 的 lotustrove.org 会自动跳到这里
const SITE_TITLE = 'པདྨ་དཀར་པོ།'
const SITE_TITLE_ZH = '白莲'   // 仅作备注，网页上不显示
const APP_NAME = 'PUNDARIKA'

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

  // ===== 多语言网址（VitePress 自带）=====
  // 根目录 = 藏文；/zh/ /zh-hant/ /en/ 由 scripts/gen-locales.mjs 自动生成，只翻译网站结构
  locales: {
    root: { label: 'བོད་ཡིག', lang: 'bo' },
    zh: { label: '简体中文', lang: 'zh-CN', link: '/zh/', description: '白莲 · 藏文佛典' },
    'zh-hant': { label: '繁體中文', lang: 'zh-TW', link: '/zh-hant/', description: '白蓮 · 藏文佛典' },
    en: { label: 'English', lang: 'en', link: '/en/', description: 'Pundarika · Tibetan Buddhist texts' }
  },

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
    // viewport-fit=cover：页面画到屏幕最边上（含 iPhone 底部横条那一窄条），这一窄条由页面自己的底条填色，
    // 浅色明黄、深色深蓝，跟着色调走；不加的话手机会用固定的黄色去填，深色模式下就露出一条黄边
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,viewport-fit=cover' }],
    // 浏览器顶栏颜色：按系统色调给初始值，切换色调时 SiteHeader.vue 再同步
    ['meta', { name: 'theme-color', content: '#608ca5', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#1c1c1c', media: '(prefers-color-scheme: dark)' }],
    // 安卓手机的部分浏览器（三星、小米、华为等）用 theme-color 给底部工具条或导航条上色，且只在页面打开时读一次。
    // 这里在页面一开始就按读者选的色调把它定好：深色是深蓝，浅色是原来的颜色，不再露出一条金黄/明黄
    ['script', {}, '(function(){try{var s=localStorage.getItem(\'vitepress-theme-appearance\');var d=s===\'dark\'||((!s||s===\'auto\')&&window.matchMedia(\'(prefers-color-scheme: dark)\').matches);var c=d?\'#1c1c1c\':\'#608ca5\';var m=document.querySelectorAll(\'meta[name=\"theme-color\"]\');for(var i=0;i<m.length;i++){m[i].setAttribute(\'content\',c);m[i].removeAttribute(\'media\');}}catch(e){}})()'],
    // 声明不同意 AI 训练使用本站内容（配合 public/robots.txt 与 Cloudflare 的 AI 爬虫拦截）
    ['meta', { name: 'robots', content: 'noai, noimageai' }],
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
      theme_color: '#608ca5',
      background_color: '#608ca5',
      // 安卓已安装的 App：系统处于深色时，状态栏和底部导航条用深蓝（支持此项的浏览器才生效）
      user_preferences: { color_scheme_dark: { theme_color: '#1c1c1c', background_color: '#121212' } },
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
      runtimeCaching: [
        ...(MEDIA_BASE
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
        : [])
      ]
    }
  }
}))
