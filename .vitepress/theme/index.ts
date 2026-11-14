import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { withBase } from 'vitepress'
import SiteHeader from './components/SiteHeader.vue'
import BottomNav from './components/BottomNav.vue'
import Catalog from './components/Catalog.vue'
import SavedList from './components/SavedList.vue'
import MessageForm from './components/MessageForm.vue'
import MediaImage from './components/MediaImage.vue'
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
      'layout-bottom': () => [
        h(BottomNav),
        h('footer', { class: 'pk-footer' }, [
          h('img', { class: 'pk-footer-icon', src: withBase('/logo-vajra.png'), alt: '' }),
          h('div', { class: 'pk-footer-text' }, '© 2027 PUNDARIKA')
        ])
      ]
    })
  }
}
