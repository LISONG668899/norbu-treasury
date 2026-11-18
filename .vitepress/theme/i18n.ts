// ============================================================
// 界面多语言（翻译网站结构：按钮、导航、提示语、目录名称；经文正文永远只用藏文）
// ------------------------------------------------------------
// 用 VitePress 自带的多语言网址：
//   /           藏文（根目录，经文页面只放在这里）
//   /zh/        简体中文      /zh-hant/  繁體中文      /en/  English
// /zh/ 等目录由 scripts/gen-locales.mjs 在构建时根据藏文目录页自动生成，不必手写。
// 经文页只有一份（藏文网址），其按钮语言跟随读者上次选择的语言（存在本机浏览器）。
// 页面上不混排：选哪种语言，界面和目录就只显示哪种文字；经文正文永远是藏文。
// 目录的译名写在藏文页 frontmatter：页面标题用 title_i18n，目录条目用每项的 i18n。
// ============================================================
import { computed, ref } from 'vue'
import { useData, useRoute } from 'vitepress'

export const LANGS = [
  { code: 'bo', label: 'བོད་ཡིག', prefix: '/' },
  { code: 'zh', label: '简体中文', prefix: '/zh/' },
  { code: 'zht', label: '繁體中文', prefix: '/zh-hant/' },
  { code: 'en', label: 'English', prefix: '/en/' }
] as const

export type Lang = (typeof LANGS)[number]['code']

const KEY = 'pk-lang'
/** 读者上次选择的语言（只用于经文页的按钮语言） */
export const pref = ref<Lang>('bo')

export function loadPref() {
  try {
    const v = localStorage.getItem(KEY) as Lang | null
    if (v && LANGS.some((l) => l.code === v)) pref.value = v
  } catch {}
}
export function setPref(v: Lang) {
  pref.value = v
  try { localStorage.setItem(KEY, v) } catch {}
}

/** 网址所属语言；根目录返回 null */
export function localeOf(path: string): Lang | null {
  for (const l of LANGS) if (l.code !== 'bo' && path.startsWith(l.prefix)) return l.code
  return null
}
/** 去掉语言前缀，得到对应的藏文网址 */
export function rootPathOf(path: string): string {
  const l = localeOf(path)
  if (!l) return path
  const pre = LANGS.find((x) => x.code === l)!.prefix
  return '/' + path.slice(pre.length)
}
/** 某页面在指定语言下的网址 */
export function localePath(lang: Lang, rootPath: string): string {
  const pre = LANGS.find((x) => x.code === lang)!.prefix
  return pre + rootPath.replace(/^\//, '')
}

const UI: Record<string, Record<Lang, string>> = {
  translate:   { bo: 'ཡིག་སྒྱུར།', zh: '翻译', zht: '翻譯', en: 'Translate' },
  translateOff:{ bo: 'ཡིག་སྒྱུར་འཇོག', zh: '关闭翻译', zht: '關閉翻譯', en: 'Hide translation' },
  trBtn:       { bo: 'སྒྱུར།', zh: '译', zht: '譯', en: 'Tr.' },
  trLoading:   { bo: 'སྒྱུར་བཞིན་པ།…', zh: '翻译中……', zht: '翻譯中……', en: 'Translating…' },
  trNote:      { bo: 'འཕྲུལ་ཆས་ཡིག་སྒྱུར། དཔྱད་གཞི་ཙམ།', zh: '机器翻译 · 仅供参考', zht: '機器翻譯 · 僅供參考', en: 'Machine translation · for reference only' },
  trOff:       { bo: 'ཡིག་སྒྱུར་ད་དུང་སྤྱོད་མི་ཐུབ།', zh: '翻译功能尚未开通', zht: '翻譯功能尚未開通', en: 'Translation is not available yet' },
  trLimit:     { bo: 'དེ་རིང་གི་ཚད་ཟིན་སོང་།', zh: '今日翻译额度已用完，请明天再试', zht: '今日翻譯額度已用完，請明天再試', en: 'Daily translation limit reached — please try tomorrow' },
  trFail:      { bo: 'སྒྱུར་མ་ཐུབ།', zh: '翻译失败，请稍后再试', zht: '翻譯失敗，請稍後再試', en: 'Translation failed — please try again later' },
  search:      { bo: 'དཔེ་ཆ་འཚོལ་གནས།', zh: '全文搜索', zht: '全文搜尋', en: 'Search' },
  tone:        { bo: 'ཁ་དོག', zh: '色调', zht: '色調', en: 'Theme' },
  language:    { bo: 'སྐད་ཡིག', zh: '语言', zht: '語言', en: 'Language' },
  about:       { bo: 'ང་ཚོའི་སྐོར།', zh: '关于我们', zht: '關於我們', en: 'About' },
  home:        { bo: 'མདུན་ངོས།', zh: '首页', zht: '首頁', en: 'Home' },
  dictionary:  { bo: 'ཚིག་མཛོད།', zh: '词典', zht: '詞典', en: 'Dictionary' },
  siteName:    { bo: 'པདྨ་དཀར་པོ།', zh: '白莲花', zht: '白蓮花', en: 'PUNDARIKA' },
  saved:       { bo: 'ཉར་ཚགས།', zh: '收藏', zht: '收藏', en: 'Saved' },
  message:     { bo: 'བསམ་འཆར།', zh: '留言', zht: '留言', en: 'Message' },
  searchBtn:   { bo: 'འཚོལ།', zh: '搜索', zht: '搜尋', en: 'Search' },
  searching:   { bo: 'འཚོལ་བཞིན་པ། …', zh: '正在搜索…', zht: '正在搜尋…', en: 'Searching…' },
  noResult:    { bo: 'འཚོལ་འབྲས་མ་རྙེད།', zh: '没有找到', zht: '沒有找到', en: 'No results' },
  clear:       { bo: 'གསལ་བ།', zh: '清除', zht: '清除', en: 'Clear' },
  empty:       { bo: 'ཡིག་ཆ་རྗེས་སུ་འགོད་རྒྱུ།', zh: '内容即将上线', zht: '內容即將上線', en: 'Coming soon' },
  save:        { bo: 'ཉར་ཚགས་སུ་འཇུག', zh: '收藏', zht: '收藏', en: 'Save' },
  unsave:      { bo: 'ཉར་ཚགས་ལས་ཕྱིར་འདོན།', zh: '取消收藏', zht: '取消收藏', en: 'Remove' },
  savedTitle:  { bo: 'ཉར་ཚགས་བྱས་པའི་དཔེ་ཆ།', zh: '我的收藏', zht: '我的收藏', en: 'My saved texts' },
  mtBtn:       { bo: 'འཕྲུལ་ཆས་ཡིག་སྒྱུར།', zh: '机器翻译', zht: '機器翻譯', en: 'Machine translation' },
  mtLoading:   { bo: 'སྒྱུར་བཞིན་པ། …', zh: '正在翻译…（可能需要十几秒）', zht: '正在翻譯…（可能需要十幾秒）', en: 'Translating… (this may take a few seconds)' },
  mtNote:      { bo: 'འཕྲུལ་ཆས་ཡིག་སྒྱུར། དཔྱད་གཞི་ཙམ། · Dharmamitra / MITRA', zh: '机器翻译，仅供参考 · 译文由 Dharmamitra / MITRA 提供', zht: '機器翻譯，僅供參考 · 譯文由 Dharmamitra / MITRA 提供', en: 'Machine translation, for reference only · by Dharmamitra / MITRA' },
  mtSave:      { bo: 'ཡིག་སྒྱུར་ཉར་ཚགས།', zh: '收藏译文', zht: '收藏譯文', en: 'Save translation' },
  mtSaved:     { bo: 'ཉར་ཚགས་བྱས་ཟིན།', zh: '已收藏', zht: '已收藏', en: 'Saved' },
  mtCopy:      { bo: 'འདྲ་བཤུས།', zh: '复制', zht: '複製', en: 'Copy' },
  mtCopied:    { bo: 'འདྲ་བཤུས་ཟིན།', zh: '已复制', zht: '已複製', en: 'Copied' },
  mtTooLong:   { bo: 'ཡི་གེ་མང་དྲགས། ཉུང་དུ་གཏོང་རོགས།', zh: '选得太长了，请少选一些（1500 字符以内）', zht: '選得太長了，請少選一些（1500 字元以內）', en: 'Selection too long — please choose less (max 1500 characters)' },
  savedTr:     { bo: 'ཉར་ཚགས་བྱས་པའི་ཡིག་སྒྱུར།', zh: '收藏的译文', zht: '收藏的譯文', en: 'Saved translations' },
  savedTexts:  { bo: 'ཉར་ཚགས་བྱས་པའི་དཔེ་ཆ།', zh: '收藏的经典', zht: '收藏的經典', en: 'Saved texts' },
  savedNone:   { bo: 'ད་དུང་ཉར་ཚགས་བྱས་པ་མེད།', zh: '还没有收藏的经典', zht: '還沒有收藏的經典', en: 'Nothing saved yet' },
  savedNote:   {
    bo: 'ཉར་ཚགས་འདི་ཁྱེད་ཀྱི་བརྡ་འཕྲིན་ཡོ་བྱད་འདིའི་ནང་ཁོ་ནར་ཉར་ཡོད།',
    zh: '收藏只保存在您这台设备的浏览器里，本站不收集任何读者信息。', zht: '收藏只保存在您這台裝置的瀏覽器裡，本站不收集任何讀者資訊。',
    en: 'Saved items stay in this browser on this device only. We collect no reader data.'
  },
  resume:      { bo: 'མུ་མཐུད་དུ་ཀློག', zh: '继续阅读', zht: '繼續閱讀', en: 'Continue reading' },
  remove:      { bo: 'ཕྱིར་འདོན།', zh: '移除', zht: '移除', en: 'Remove' },
  msgTitle:    { bo: 'དོ་དམ་པར་བསམ་འཆར་འབུལ་བ།', zh: '给管理员留言', zht: '給管理員留言', en: 'Message the editors' },
  msgText:     { bo: 'བསམ་འཆར་འདིར་འབྲི།', zh: '请写下您的留言', zht: '請寫下您的留言', en: 'Write your message here' },
  msgContact:  {
    bo: 'འབྲེལ་གཏུག་བྱ་ཐབས།（དགོས་མཁོ་མེད།）',
    zh: '联系方式（可不填）', zht: '聯絡方式（可不填）',
    en: 'Contact (optional)'
  },
  msgSend:     { bo: 'འབུལ།', zh: '发送', zht: '發送', en: 'Send' },
  msgSending:  { bo: 'འབུལ་བཞིན་པ།…', zh: '发送中……', zht: '發送中……', en: 'Sending…' },
  msgOk:       { bo: 'བསམ་འཆར་འབྱོར་སོང་། ཐུགས་རྗེ་ཆེ།', zh: '已收到，谢谢！', zht: '已收到，謝謝！', en: 'Received — thank you!' },
  msgFail:     { bo: 'འབུལ་མ་ཐུབ། ཡང་བསྐྱར་ཚོད་ལྟ་གནང་རོགས།', zh: '发送失败，请稍后再试', zht: '發送失敗，請稍後再試', en: 'Could not send. Please try again later.' },
  msgNote:     {
    bo: 'ང་ཚོས་ཁྱེད་ཀྱི་མིང་དང་ IP སོགས་ཉར་ཚགས་མི་བྱེད།',
    zh: '本站不记录您的姓名、IP 等任何个人信息；只有您自愿填写的联系方式会随留言保存。', zht: '本站不記錄您的姓名、IP 等任何個人資訊；只有您自願填寫的聯絡方式會隨留言保存。',
    en: 'We do not record your name, IP address or any other personal data — only what you choose to write.'
  }
}

/** 取某语言的译名：繁体缺时用简体；藏文或缺译名时返回空 */
export function pick(i18n: Partial<Record<Lang, string>> | undefined, l: Lang): string {
  if (!i18n || l === 'bo') return ''
  if (l === 'zht') return i18n.zht || i18n.zh || ''
  return i18n[l] || ''
}

/** 在组件里使用：const { lang, t, name } = useI18n()
 *  name(藏文, 译名表)：藏文界面显示藏文；其他语言显示该语言译名（没有译名就显示藏文）。
 *  每次只显示一种文字，不混排。 */
export function useI18n() {
  const route = useRoute()
  const { frontmatter } = useData()
  const lang = computed<Lang>(() => {
    const l = localeOf(route.path)
    if (l) return l
    return frontmatter.value.text === true ? pref.value : 'bo'
  })
  const t = (key: string) => {
    const e = UI[key]
    return e ? e[lang.value] || e.bo : key
  }
  const name = (bo: string, i18n?: Partial<Record<Lang, string>>) => pick(i18n, lang.value) || bo
  return { lang, t, name }
}
