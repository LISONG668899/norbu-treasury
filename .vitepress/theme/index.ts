import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import FootNav from './components/FootNav.vue'
import Catalog from './components/Catalog.vue'
import SavedList from './components/SavedList.vue'
import MessageForm from './components/MessageForm.vue'
import MediaImage from './components/MediaImage.vue'
// 字体：藏文用自带的 Noto Serif Tibetan Web；中文、英文与竹巴噶举网站相同（Inter + 系统黑体：苹方 / 微软雅黑），见 custom.css
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
