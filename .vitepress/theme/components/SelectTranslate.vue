<script setup lang="ts">
// 选段机器翻译：在经文里选中任意文字（电脑用鼠标拖选，手机长按后拖动），
// 选区下方出现“机器翻译”小按钮 → 点一下，下方弹出译文卡片 → 可“收藏译文”“复制”。
// 收藏的译文存在本机浏览器，在“收藏”页里查看。
// 后端：functions/api/translate-text.js（Dharmamitra / MITRA 引擎，免费、无需密钥）
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vitepress'
import { useI18n, rootPathOf } from '../i18n'
import { isTrSaved, loadSavedTr, toggleTr, trId } from '../saved'

const props = defineProps<{ title: string }>()
const route = useRoute()
const { lang, t } = useI18n()
const target = computed(() => (lang.value === 'bo' ? 'zh' : lang.value))

// 选区下方的小按钮
const btn = ref<{ top: number; left: number } | null>(null)
let picked = ''

// 译文卡片
const card = ref(false)
const source = ref('')
const result = ref('')
const status = ref<'idle' | 'busy' | 'ok' | 'err'>('idle')
const errMsg = ref('')
const copied = ref(false)
const cardLang = ref('zh')
const id = computed(() => trId(rootPathOf(route.path), source.value, cardLang.value))
const saved = computed(() => status.value === 'ok' && isTrSaved(id.value))

let timer: ReturnType<typeof setTimeout> | undefined
function check() {
  const sel = window.getSelection()
  const root = document.querySelector('.rz-text')
  if (!sel || sel.isCollapsed || !sel.rangeCount || !root) { btn.value = null; return }
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) { btn.value = null; return }
  const text = sel.toString().replace(/\s+/g, ' ').trim()
  if (text.length < 2 || !/[ༀ-࿿]/.test(text)) { btn.value = null; return }
  const rects = range.getClientRects()
  const r = rects.length ? rects[rects.length - 1] : range.getBoundingClientRect()
  const half = 90
  btn.value = {
    top: r.bottom + window.scrollY + 12,
    left: Math.min(Math.max(r.left + r.width / 2 + window.scrollX, half + 8), window.innerWidth - half - 8)
  }
  picked = text
}
const later = () => { clearTimeout(timer); timer = setTimeout(check, 180) }

async function run() {
  const text = picked
  btn.value = null
  if (!text) return
  source.value = text
  result.value = ''
  copied.value = false
  cardLang.value = target.value
  card.value = true
  if (text.length > 1500) { status.value = 'err'; errMsg.value = t('mtTooLong'); return }
  status.value = 'busy'
  try {
    const r = await fetch('/api/translate-text', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: rootPathOf(route.path), text, lang: cardLang.value })
    })
    const j = await r.json().catch(() => ({}))
    if (r.ok && j.ok && text === source.value) {
      result.value = j.text
      status.value = 'ok'
    } else if (text === source.value) {
      status.value = 'err'
      errMsg.value = j.error === 'too-long' ? t('mtTooLong') : t('trFail')
    }
  } catch {
    if (text === source.value) { status.value = 'err'; errMsg.value = t('trFail') }
  }
}

function onSave() {
  if (status.value !== 'ok') return
  toggleTr({
    id: id.value,
    path: rootPathOf(route.path),
    title: props.title,
    source: source.value,
    text: result.value,
    lang: cardLang.value
  })
}
async function onCopy() {
  try {
    await navigator.clipboard.writeText(result.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {}
}
function close() { card.value = false; status.value = 'idle' }

onMounted(() => {
  loadSavedTr()
  document.addEventListener('selectionchange', later)
  document.addEventListener('pointerup', later)
})
onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', later)
  document.removeEventListener('pointerup', later)
})
watch(() => route.path, () => { btn.value = null; close() })
</script>

<template>
  <Teleport to="body">
    <!-- 选区下方的“机器翻译”按钮；按下时不让选区消失 -->
    <button
      v-if="btn"
      class="pk-mt-btn"
      type="button"
      :style="{ top: btn.top + 'px', left: btn.left + 'px' }"
      @mousedown.prevent
      @pointerdown.prevent
      @click="run"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M4 5h9M8.5 3v2M6 5c.8 3 3 5.5 6 7M11 5c-.8 3.5-3.5 6.5-7 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M12.5 21l4-10 4 10M14 17.5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>{{ t('mtBtn') }}</span>
    </button>

    <!-- 译文卡片 -->
    <div v-if="card" class="pk-mt-card" role="dialog" :aria-label="t('mtBtn')">
      <div class="pk-mt-head">
        <span class="pk-mt-label">{{ t('mtBtn') }}</span>
        <button class="pk-mt-x" type="button" :aria-label="t('clear')" @click="close">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="pk-mt-body">
        <p class="pk-mt-src">{{ source }}</p>
        <p v-if="status === 'busy'" class="pk-mt-status">{{ t('mtLoading') }}</p>
        <p v-else-if="status === 'err'" class="pk-mt-status err">{{ errMsg }}</p>
        <p v-else-if="status === 'ok'" class="pk-mt-out" :lang="cardLang === 'en' ? 'en' : cardLang === 'zht' ? 'zh-TW' : 'zh-CN'">{{ result }}</p>
      </div>
      <div v-if="status === 'ok'" class="pk-mt-foot">
        <span class="pk-mt-note">{{ t('mtNote') }}</span>
        <div class="pk-mt-ops">
          <button class="pk-btn-sm" type="button" @click="onCopy">{{ copied ? t('mtCopied') : t('mtCopy') }}</button>
          <button class="pk-btn-sm pk-mt-save" :class="{ on: saved }" type="button" @click="onSave">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">
              <path d="M6.25 3.25h11.5v17.5L12 16.5l-5.75 4.25Z" :fill="saved ? 'currentColor' : 'none'" />
            </svg>
            {{ saved ? t('mtSaved') : t('mtSave') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
