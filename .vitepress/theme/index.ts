import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { withBase } from 'vitepress'
import SiteHeader from './components/SiteHeader.vue'
import Catalog from './components/Catalog.vue'
import MediaImage from './components/MediaImage.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 页面里可直接使用 <Catalog /> 与 <MediaImage id="…" />
    app.component('Catalog', Catalog)
    app.component('MediaImage', MediaImage)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(SiteHeader),
      'layout-bottom': () =>
        h('footer', { class: 'rz-footer' }, [
          h('img', { class: 'rz-footer-icon', src: withBase('/logo.png'), alt: '' }),
          h('div', { class: 'rz-footer-text' }, '© ༢༠༢༧ འབྲུག་པ་བཀའ་བརྒྱུད་ཀྱི་དམ་ཆོས་ཡིད་བཞིན་ནོར་བུ།')
        ])
    })
  }
}
