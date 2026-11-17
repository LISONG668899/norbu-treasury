import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import FootNav from './components/FootNav.vue'
import Catalog from './components/Catalog.vue'
import SavedList from './components/SavedList.vue'
import MessageForm from './components/MessageForm.vue'
import MediaImage from './components/MediaImage.vue'
// 字体：藏文 Noto Serif Tibetan（自带，见 custom.css）；中文 思源宋体（简 / 繁）；英文 EB Garamond。
// 中文字体按字切成上百个小块，浏览器只下载页面上用到的字，很快。
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/500.css'
import '@fontsource/noto-serif-tc/400.css'
import '@fontsource/noto-serif-tc/500.css'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/500.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 页面里可直接使用这些组件
    app.component('Catalog', Catalog)
    app.component('SavedList', SavedList)
    app.component('MessageForm', MessageForm)
    app.component('MediaImage', MediaImage)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(SiteHeader),
      'layout-bottom': () => h(FootNav)
    })
  }
}
