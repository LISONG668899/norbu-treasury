// ============================================================
// 自动生成三种语言的目录页：/zh/（简体） /zh-hant/（繁體） /en/（English）
// ------------------------------------------------------------
// 只需维护藏文目录页（根目录）。每次 npm run docs:dev / docs:build 时，
// 本脚本把每个“非经文”的藏文页面复制到三个语言目录：
//   · 页面标题换成 title_i18n 里该语言的译名（浏览器标签页也显示该语言）；目录条目的译名由目录组件按语言显示
//   · 目录链接改到同语言网址；指向经文页（text: true）的链接保持藏文网址不变
// 经文页不复制——正文只有藏文一份。生成的目录已列入 .gitignore，不必上传。
// ============================================================
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const LOCALES = [
  { dir: 'zh', key: 'zh', fallback: null },
  { dir: 'zh-hant', key: 'zht', fallback: 'zh' },
  { dir: 'en', key: 'en', fallback: null }
]
const SKIP = new Set(['node_modules', '.vitepress', '.git', 'public', 'functions', 'scripts', ...LOCALES.map((l) => l.dir)])

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.')) continue
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (name.endsWith('.md') && name !== 'README.md') out.push(full)
  }
  return out
}

const split = (src) => {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  return m ? { fm: m[1], body: m[2] } : { fm: '', body: src }
}

// 网址 → 文件；判断哪些是经文页
const files = walk(ROOT)
const urlOf = (file) => {
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  return '/' + rel.replace(/index\.md$/, '').replace(/\.md$/, '.html')
}
const textUrls = new Set()
for (const f of files) {
  const { fm } = split(fs.readFileSync(f, 'utf8'))
  if (/^text:\s*true\s*$/m.test(fm)) textUrls.add(urlOf(f))
}

// 解析一行内联映射：{ zh: 简体, zht: 繁體, en: "English" }
function parseInlineMap(s) {
  const out = {}
  const inner = s.trim().replace(/^\{|\}$/g, '')
  for (const m of inner.matchAll(/(\w+)\s*:\s*("([^"]*)"|'([^']*)'|[^,]+)/g)) {
    out[m[1]] = (m[3] ?? m[4] ?? m[2]).trim()
  }
  return out
}
const yamlStr = (s) => JSON.stringify(s)

// 清理旧的生成目录
for (const l of LOCALES) fs.rmSync(path.join(ROOT, l.dir), { recursive: true, force: true })

let count = 0
for (const f of files) {
  const url = urlOf(f)
  if (textUrls.has(url)) continue
  const { fm, body } = split(fs.readFileSync(f, 'utf8'))
  const ti = fm.match(/^title_i18n:\s*(\{.*\})\s*$/m)
  const map = ti ? parseInlineMap(ti[1]) : {}

  for (const l of LOCALES) {
    const tr = map[l.key] || (l.fallback ? map[l.fallback] : '') || ''
    let out = fm
      // 链接改到本语言网址（经文页除外）
      .replace(/^(\s*link:\s*)(\/\S*)\s*$/gm, (all, pre, link) =>
        textUrls.has(link) ? all : `${pre}/${l.dir}${link}`)
    if (tr) {
      out = out.replace(/^title:\s*.+$/m, `title: ${yamlStr(tr)}`)
    }
    if (!/^search:/m.test(out)) out += "\nsearch: false"
    out = `# 此文件由 scripts/gen-locales.mjs 自动生成，请勿手改（改藏文原页即可）\n${out}`
    const dest = path.join(ROOT, l.dir, path.relative(ROOT, f))
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, `---\n${out}\n---\n${body}`)
    count++
  }
}
console.log(`gen-locales: ${count} 个语言页面已生成（经文页 ${textUrls.size} 篇保持藏文网址）`)
