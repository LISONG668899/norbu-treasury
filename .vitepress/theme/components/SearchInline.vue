<script setup lang="ts">
// 搜索框本身就是输入框：点一下直接打字，结果在框的正下方展开，不再弹出第二个搜索框。
// · 停止打字约半秒自动搜索；点框内右侧的“搜索”按钮、按回车或手机键盘上的“搜索”键，立即搜索并收起键盘
// · 点结果进入经文；点别处、按 Esc 或点 × 收起结果
// · 藏文按音节点切分，所有音节都要命中（分词规则在 config.mts 的 search 设置里）
import localSearchIndex from '@localSearchIndex'
import MiniSearch from 'minisearch'
import { createApp, markRaw, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { dataSymbol, useData, useRouter, withBase } from 'vitepress'
import { pathToFile } from 'vitepress/dist/client/app/utils.js'
import { useI18n } from '../i18n'

interface Hit { path: string; title: string; snippet: string }

const { t, lang } = useI18n()
// 藏文字形上下伸展大，输入框里的藏文需要单独对齐（见 custom.css .pk-search-input.is-bo）
const hasBo = (s: string) => /[\u0F00-\u0FFF]/.test(s)
const vpData = useData()
const router = useRouter()

const root = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const q = ref('')
const open = ref(false)
const busy = ref(false)
const done = ref(false)
const hits = shallowRef<Hit[]>([])
let composing = false
let timer: ReturnType<typeof setTimeout> | undefined
let runId = 0

// ---------- 索引（第一次搜索时才下载） ----------
let index: MiniSearch | null = null
async function getIndex() {
  if (index) return index
  const ms = (vpData.theme.value.search as any)?.options?.miniSearch || {}
  const json = (await (localSearchIndex as any)['root']?.())?.default
  index = markRaw(
    MiniSearch.loadJSON(json, {
      fields: ['title', 'titles', 'text'],
      storeFields: ['title', 'titles'],
      ...(ms.options || {}),
      searchOptions: { prefix: true, ...(ms.searchOptions || {}) }
    })
  )
  return index
}
const split = (s: string) => s.split(/[\s\p{Z}\p{P}༄-༔༴༶༸༺-༽]+/u).filter(Boolean)

// ---------- 摘录：取页面正文，截取第一个命中处前后一段 ----------
const textCache = new Map<string, string>()
async function pageText(path: string) {
  if (textCache.has(path)) return textCache.get(path)!
  let text = ''
  try {
    const file = pathToFile(path)
    const mod = file ? await import(/* @vite-ignore */ file) : null
    const comp = mod?.default ?? mod
    if (comp?.render || comp?.setup) {
      const app = createApp(comp)
      app.config.warnHandler = () => {}
      app.provide(dataSymbol, vpData)
      const div = document.createElement('div')
      app.mount(div)
      text = (div.querySelector('.rz-text') || div).textContent || ''
      app.unmount()
    }
  } catch (e) {}
  text = text.replace(/\s+/g, ' ').trim()
  textCache.set(path, text)
  return text
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function makeSnippet(text: string, terms: string[]) {
  if (!text) return ''
  let at = -1
  for (const w of terms) {
    const i = text.indexOf(w)
    if (i >= 0 && (at < 0 || i < at)) at = i
  }
  const start = Math.max(0, at - 40)
  let s = text.slice(start, start + 140)
  s = (start > 0 ? '… ' : '') + esc(s) + (start + 140 < text.length ? ' …' : '')
  const re = new RegExp(terms.sort((a, b) => b.length - a.length).map((w) => reEsc(esc(w))).join('|'), 'g')
  return terms.length ? s.replace(re, (m) => `<mark>${m}</mark>`) : s
}

// ---------- 搜索 ----------
async function run() {
  const query = q.value.trim()
  const my = ++runId
  if (!query) { hits.value = []; done.value = false; return }
  open.value = true
  busy.value = true
  const idx = await getIndex()
  if (my !== runId) return
  const seen = new Set<string>()
  const raw = idx.search(query).filter((r: any) => {
    const p = String(r.id).split('#')[0]
    if (seen.has(p)) return false
    seen.add(p)
    return true
  }).slice(0, 20)
  const terms = split(query)
  const list: Hit[] = []
  for (const r of raw as any[]) {
    const path = String(r.id).split('#')[0]
    const text = await pageText(path)
    if (my !== runId) return
    list.push({ path, title: r.title, snippet: makeSnippet(text, terms) })
  }
  hits.value = list
  busy.value = false
  done.value = true
}

watch(q, () => {
  clearTimeout(timer)
  if (!q.value.trim()) { hits.value = []; done.value = false; return }
  if (!composing) timer = setTimeout(run, 500)
})
function onEnter() {
  clearTimeout(timer)
  run()
  input.value?.blur()          // 手机上收起键盘，结果完整露出来
}
function clear() {
  q.value = ''
  hits.value = []
  done.value = false
  input.value?.focus()
}
function go(h: Hit) {
  open.value = false
  input.value?.blur()
  router.go(withBase(h.path))
}

// 点别处 / Esc 收起
function onDocDown(e: Event) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { open.value = false; input.value?.blur() }
}
onMounted(() => {
  document.addEventListener('pointerdown', onDocDown)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="pk-search">
    <form class="pk-searchbox" role="search" @submit.prevent="onEnter">
      <input
        ref="input"
        v-model="q"
        class="pk-search-input"
        :class="{ 'is-bo': hasBo(q) || (!q && lang === 'bo') }"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        maxlength="64"
        :placeholder="t('search')"
        :aria-label="t('search')"
        @focus="open = true"
        @compositionstart="composing = true"
        @compositionend="composing = false; q = ($event.target as HTMLInputElement).value"
      />
      <button v-if="q" class="pk-search-clear" type="button" :aria-label="t('clear')" @click="clear">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
      <!-- 右侧只放搜索图标，点它等同回车 -->
      <button class="pk-search-go" type="submit" :aria-label="t('searchBtn')" :title="t('searchBtn')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
          <circle cx="10.6" cy="10.6" r="6.25" stroke="currentColor" stroke-width="1.8" />
          <path d="M15.15 15.15 21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
    </form>

    <div v-if="open && q.trim() && (busy || done)" class="pk-search-panel">
      <p v-if="busy && !hits.length" class="pk-search-status">{{ t('searching') }}</p>
      <p v-else-if="done && !hits.length" class="pk-search-status">{{ t('noResult') }}</p>
      <a
        v-for="h in hits"
        :key="h.path"
        class="pk-search-hit"
        :href="withBase(h.path)"
        @click.prevent="go(h)"
      >
        <span class="pk-search-hit-title">{{ h.title }}</span>
        <span v-if="h.snippet" class="pk-search-hit-text" v-html="h.snippet" />
      </a>
    </div>
  </div>
</template>
