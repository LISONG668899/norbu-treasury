// ============================================================
// 留言接口：POST /api/message  （Cloudflare Pages Function，随网站自动部署）
// 只保存：时间、留言内容、读者自愿填写的联系方式。不保存 IP、浏览器等任何信息。
// 需要在 Cloudflare Pages 项目 → Settings → Bindings 里绑定一个 KV 命名空间，
// 变量名填 MESSAGES。管理员在 Cloudflare 后台 → Workers KV → 该命名空间里查看留言。
// ============================================================

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })

export async function onRequestPost({ request, env }) {
  if (!env.MESSAGES) return json({ ok: false, error: 'not-configured' }, 500)

  let data
  try {
    data = await request.json()
  } catch {
    return json({ ok: false, error: 'bad-request' }, 400)
  }

  // 机器人会填写隐藏栏位：假装成功，直接丢弃
  if (data && data.website) return json({ ok: true })

  const text = String((data && data.text) || '').trim().slice(0, 3000)
  const contact = String((data && data.contact) || '').trim().slice(0, 200)
  if (text.length < 2) return json({ ok: false, error: 'empty' }, 400)

  const time = new Date().toISOString()
  const key = `${time}_${crypto.randomUUID().slice(0, 8)}`
  // 一年后自动删除，避免无限累积
  await env.MESSAGES.put(key, JSON.stringify({ time, text, contact }), {
    expirationTtl: 365 * 24 * 3600
  })
  return json({ ok: true })
}

export async function onRequest() {
  return json({ ok: false, error: 'method-not-allowed' }, 405)
}
