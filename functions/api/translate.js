// ============================================================
// 段落翻译接口：POST /api/translate   { path, index, lang }
// 用 Claude Haiku 5.5 把本站经文的某一段译成 简体 / 繁體 / English。
// ------------------------------------------------------------
// 安全与省钱：
//   · 只翻译本站自己的段落：服务器按 path + index 自己从网页里取原文，不接受外来文字，
//     所以别人无法拿这个接口当免费翻译器。
//   · 译过的段落存在 KV 里，同一段同一语言永远只付一次费；原文改动后自动重译。
//   · 每天有费用上限（默认 1 美元），超过当天就暂停，次日自动恢复。
//
// 开通方法（Cloudflare → Workers & Pages → 本项目 → Settings）：
//   1. Variables and Secrets：添加 Secret，名称 ANTHROPIC_API_KEY，值为你的 API 密钥
//   2. Bindings：添加 KV namespace，变量名 TRANSLATIONS（新建一个命名空间）
//   3. 可选变量：DAILY_LIMIT_USD（每日上限，美元，默认 1）
//                TRANSLATE_MODEL（默认 claude-haiku-5-5，以后可换 claude-sonnet-5-5）
//   未设置密钥时，网页上点“译”会显示“翻译功能尚未开通”，不影响其他功能。
// ============================================================

const DEFAULT_MODEL = 'claude-haiku-5-5'
// 每百万 token 的美元价格（用于每日上限计算；换模型时请一并更新）
const PRICES = {
  'claude-haiku-5-5': { in: 0.1, out: 0.5 },
  'claude-sonnet-5-5': { in: 2, out: 10 }
}

const TARGETS = {
  zh: 'Simplified Chinese (简体中文)',
  zht: 'Traditional Chinese (繁體中文, use traditional characters only)',
  en: 'English'
}

const system = (lang) =>
  `You are an expert translator of classical Tibetan Buddhist literature. ` +
  `Translate the Tibetan passage the user sends into ${TARGETS[lang]}. ` +
  `Translate faithfully and readably; keep the meaning of every clause. ` +
  (lang === 'en'
    ? `Use standard English Buddhist terminology and conventional phonetic forms of Tibetan names. `
    : `Use established Chinese Buddhist terminology (as in the translations of Khenpo Sodargye 索达吉堪布) and conventional Chinese renderings of names. `) +
  `Output only the translation: no notes, no transliteration, no preface. ` +
  `If the passage begins or ends mid-sentence, translate it as it stands.`

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, '&')
    .trim()

/** 与网页端顺序一致：.rz-text 里的 p.bo 与 p.bo-verse，按出现先后 */
export function extractParagraphs(html) {
  const out = []
  const re = /<p class="(?:bo|bo-verse(?: [^"]*)?)"[^>]*>([\s\S]*?)<\/p>/g
  let m
  while ((m = re.exec(html))) out.push(decode(m[1]))
  return out
}

async function sha(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY || !env.TRANSLATIONS) return json({ ok: false, error: 'not-configured' }, 503)

  let body
  try { body = await request.json() } catch { return json({ ok: false, error: 'bad-request' }, 400) }
  const p = String(body?.path || '')
  const index = Number(body?.index)
  const lang = String(body?.lang || '')
  if (!TARGETS[lang] || !p.startsWith('/') || p.includes('..') || p.length > 300 ||
      !Number.isInteger(index) || index < 0 || index > 20000) {
    return json({ ok: false, error: 'bad-request' }, 400)
  }

  // 从本站取原文
  const pageRes = await env.ASSETS.fetch(new Request(new URL(p, request.url).toString()))
  if (!pageRes.ok) return json({ ok: false, error: 'not-found' }, 404)
  const source = extractParagraphs(await pageRes.text())[index]
  if (!source) return json({ ok: false, error: 'not-found' }, 404)

  // 已译过：直接返回
  const model = env.TRANSLATE_MODEL || DEFAULT_MODEL
  const key = `tr:${model}:${lang}:${await sha(source)}`
  const cached = await env.TRANSLATIONS.get(key)
  if (cached) return json({ ok: true, text: cached, cached: true })

  // 每日费用上限
  const day = new Date().toISOString().slice(0, 10)
  const spendKey = `spend:${day}`
  const spent = parseFloat((await env.TRANSLATIONS.get(spendKey)) || '0')
  const limit = parseFloat(env.DAILY_LIMIT_USD || '1')
  if (spent >= limit) return json({ ok: false, error: 'daily-limit' }, 429)

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: system(lang),
      messages: [{ role: 'user', content: source }]
    })
  })
  if (!r.ok) return json({ ok: false, error: 'upstream', status: r.status }, 502)
  const data = await r.json()
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
  if (!text) return json({ ok: false, error: 'upstream' }, 502)

  const price = PRICES[model] || PRICES[DEFAULT_MODEL]
  const cost = ((data.usage?.input_tokens || 0) * price.in + (data.usage?.output_tokens || 0) * price.out) / 1e6
  await env.TRANSLATIONS.put(spendKey, String(spent + cost), { expirationTtl: 3 * 24 * 3600 })
  await env.TRANSLATIONS.put(key, text)
  return json({ ok: true, text })
}

export async function onRequest() {
  return json({ ok: false, error: 'method-not-allowed' }, 405)
}
