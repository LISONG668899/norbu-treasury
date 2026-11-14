<script setup lang="ts">
// 经文段落翻译（Claude Haiku 5.5）：打开后每段末尾出现“译”按钮，点哪段译哪段。
// 译文语言 = 当前界面语言（藏文界面时默认译成简体中文）。
// 后端：functions/api/translate.js —— 只翻译本站自己的段落，译过的段落存起来不重复付费。
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { useI18n } from '../i18n'

const route = useRoute()
const { lang, t } = useI18n()
const on = ref(false)

const SEL = '.rz-text p.bo, .rz-text p.bo-verse'
const target = () => (lang.value === 'bo' ? 'zh' : lang.value)

function clear() {
  document.querySelectorAll('.pk-tr-btn, .pk-tr').forEach((el) => el.remove())
}

async function translate(i: number, p: Element, btn: HTMLButtonElement) {
  const next = p.nextElementSibling
  if (next && next.classList.contains('pk-tr')) { next.remove(); return }   // 再点一次收起
  const box = document.createElement('div')
  box.className = 'pk-tr'
  box.textContent = t('trLoading')
  p.after(box)
  btn.disabled = true
  try {
    const r = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: route.path, index: i, lang: target() })
    })
    const j = await r.json().catch(() => ({}))
    if (r.ok && j.ok) {
      box.textContent = j.text
      const note = document.createElement('span')
      note.className = 'pk-tr-note'
      note.textContent = t('trNote')
      box.appendChild(note)
    } else {
      box.classList.add('err')
      box.textContent =
        j.error === 'not-configured' ? t('trOff') : j.error === 'daily-limit' ? t('trLimit') : t('trFail')
    }
  } catch {
    box.classList.add('err')
    box.textContent = t('trFail')
  } finally {
    btn.disabled = false
  }
}

function attach() {
  clear()
  document.querySelectorAll(SEL).forEach((p, i) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'pk-tr-btn'
    btn.textContent = t('trBtn')
    btn.addEventListener('click', () => translate(i, p, btn))
    p.appendChild(btn)
  })
}

function toggle() {
  on.value = !on.value
  on.value ? attach() : clear()
}

watch(() => route.path, () => { on.value = false; clear() })
watch(lang, () => { if (on.value) attach() })
onBeforeUnmount(clear)
</script>

<template>
  <button class="pk-save pk-trtoggle" :class="{ on }" type="button" @click="toggle">
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 5h9M8.5 3v2M6 5c.8 3 3 5.5 6 7M11 5c-.8 3.5-3.5 6.5-7 8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
      <path d="M12.5 21l4-10 4 10M14 17.5h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span>{{ on ? t('translateOff') : t('translate') }}</span>
  </button>
</template>
