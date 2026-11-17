// ============================================================
// 构建时收集所有藏文页面的目录信息（标题、译名、目录清单、是否经文页），
// 供目录组件判断：某一函有没有内容、只有一函时直接列出文章等。
// 只读根目录（藏文）页面；/zh/ /zh-hant/ /en/ 是自动生成的副本，不重复收集。
// ============================================================
import { createContentLoader } from 'vitepress'

export interface PageInfo {
  title: string
  title_i18n?: Record<string, string>
  text?: boolean
  items: { title: string; link?: string; i18n?: Record<string, string> }[]
}

declare const data: Record<string, PageInfo>
export { data }

export default createContentLoader('**/*.md', {
  transform(raw) {
    const out: Record<string, PageInfo> = {}
    for (const p of raw) {
      if (/^\/(zh|zh-hant|en)\//.test(p.url)) continue
      const fm = p.frontmatter || {}
      out[p.url] = {
        title: String(fm.title || ''),
        title_i18n: fm.title_i18n,
        text: fm.text === true,
        items: (fm.catalog && fm.catalog.items) || []
      }
    }
    return out
  }
})
