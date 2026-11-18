// ============================================================
// 选段机器翻译：POST /api/translate-text   { path, text, lang }
// 读者在经文里用鼠标（手机上用手指）选中任意一段，点“机器翻译”，译成 简体 / 繁體 / English。
// ------------------------------------------------------------
// 引擎：
//   1. 默认 Dharmamitra / MITRA 佛典翻译引擎（日本东北大学；免费，无需密钥）。
//      浏览器不能直接连它（对方的响应头有问题），所以由本站服务器代为请求——
//      这就是慧译通项目里那个 Cloudflare Worker 做的事，这里直接放在本站里，不必另外部署。
//   2. MITRA 出错或超时，且设置了 ANTHROPIC_API_KEY 时，改用 Claude（见 translate.js 的说明）。
//
// 防滥用：
//   · 只翻译本站经文里真实存在的文字：服务器按 path 自己取这一页，核对所选文字确在页中，
//     别人无法拿这个接口当免费翻译器。
//   · 每次最多 1500 字符。
//   · 若绑定了 KV（变量名 TRANSLATIONS），译过的文字存起来，下次同样的选段直接返回，不再请求。
//     没有绑定也能用，只是每次都重新翻译。
//
// 礼节：Dharmamitra 是免费公开的服务。正式公开前，请写信到 dharmamitra-project@gmail.com 告知对方。
// ============================================================

import { extractParagraphs, decodeHtml as decode } from './translate.js'

const MITRA_URL = 'https://dharmamitra.org/api-search/cat-translate/v1/translate'
const MITRA_TIMEOUT_MS = 95000   // 对方说明长文可能要 60 秒；对方网关 100 秒截断
const MAX_LEN = 1500

// MITRA 的目标语种是“文字标签”，不是代码；繁体由译风说明要求（说明里不能夹汉字）
const MITRA_TARGET = { zh: 'modern chinese', zht: 'modern chinese', en: 'english' }
const MITRA_STYLE = {
  zh: 'Translate faithfully and readably into modern Simplified Chinese prose, using established Chinese Buddhist terminology. Keep the meaning of every clause. Output only the translation.',
  zht: 'Translate faithfully and readably into modern Chinese prose written entirely in Traditional Chinese characters (not Simplified), using established Chinese Buddhist terminology. Keep the meaning of every clause. Output only the translation.',
  en: 'Translate faithfully and readably into modern English prose, using standard English Buddhist terminology and conventional phonetic forms of Tibetan names. Keep the meaning of every clause. Output only the translation.'
}

const CLAUDE_MODEL = 'claude-haiku-5-5'
const CLAUDE_TARGET = {
  zh: 'Simplified Chinese (简体中文)',
  zht: 'Traditional Chinese (繁體中文, use traditional characters only)',
  en: 'English'
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  })

// 比较时去掉一切空白：选中的文字可能跨行、跨段
const squash = (s) => s.replace(/\s+/g, '')

async function sha(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function viaMitra(text, lang) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), MITRA_TIMEOUT_MS)
  try {
    const r = await fetch(MITRA_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        input_tibetan: text,
        input_chinese: '',
        input_pali: '',
        input_sanskrit: '',
        focus: 'tibetan',
        target_language: MITRA_TARGET[lang],
        context: 'Classical Tibetan Buddhist literature (Drukpa Kagyu tradition).',
        style_instruction: MITRA_STYLE[lang]
      }),
      signal: ctrl.signal
    })
    if (!r.ok) throw new Error('mitra ' + r.status)
    const data = await r.json()
    const out = typeof data?.translation === 'string' ? data.translation.trim() : ''
    if (!out) throw new Error('mitra empty')
    return out
  } finally {
    clearTimeout(timer)
  }
}

async function viaClaude(text, lang, env) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: env.TRANSLATE_MODEL || CLAUDE_MODEL,
      max_tokens: 3000,
      system:
        `You are an expert translator of classical Tibetan Buddhist literature. ` +
        `Translate the Tibetan passage the user sends into ${CLAUDE_TARGET[lang]}. ` +
        `Translate faithfully and readably; keep the meaning of every clause. ` +
        `Output only the translation. If the passage begins or ends mid-sentence, translate it as it stands.`,
      messages: [{ role: 'user', content: text }]
    })
  })
  if (!r.ok) throw new Error('claude ' + r.status)
  const data = await r.json()
  const out = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
  if (!out) throw new Error('claude empty')
  return out
}

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch { return json({ ok: false, error: 'bad-request' }, 400) }
  const p = String(body?.path || '')
  const lang = String(body?.lang || '')
  const text = String(body?.text || '').replace(/\s+/g, ' ').trim()
  if (!MITRA_TARGET[lang] || !p.startsWith('/') || p.includes('..') || p.length > 300 ||
      text.length < 2 || text.length > MAX_LEN || !/[ༀ-࿿]/.test(text)) {
    return json({ ok: false, error: text.length > MAX_LEN ? 'too-long' : 'bad-request' }, 400)
  }

  // 核对：所选文字必须出自这一页的经文
  const pageRes = await env.ASSETS.fetch(new Request(new URL(p, request.url).toString()))
  if (!pageRes.ok) return json({ ok: false, error: 'not-found' }, 404)
  const html = await pageRes.text()
  // 经文区（.rz-text）全部文字，含篇名；取不到时退回按段落取
  const block = html.match(/<div class="rz-text"[^>]*>([\s\S]*?)<\/div>/)
  const pageText = squash(block ? decode(block[1]) : extractParagraphs(html).join(''))
  if (!pageText.includes(squash(text))) return json({ ok: false, error: 'not-on-page' }, 403)

  // 译过的直接返回
  const key = `sel:${lang}:${await sha(text)}`
  if (env.TRANSLATIONS) {
    const hit = await env.TRANSLATIONS.get(key, 'json').catch(() => null)
    if (hit?.text) return json({ ok: true, text: hit.text, engine: hit.engine, cached: true })
  }

  let out = ''
  let engine = 'mitra'
  try {
    out = await viaMitra(text, lang)
  } catch (e) {
    if (env.ANTHROPIC_API_KEY) {
      try { out = await viaClaude(text, lang, env); engine = 'claude' } catch {}
    }
  }
  if (!out) return json({ ok: false, error: 'upstream' }, 502)

  if (env.TRANSLATIONS) {
    await env.TRANSLATIONS.put(key, JSON.stringify({ text: out, engine, at: Date.now() })).catch(() => {})
  }
  return json({ ok: true, text: out, engine })
}

export async function onRequest() {
  return json({ ok: false, error: 'method-not-allowed' }, 405)
}
