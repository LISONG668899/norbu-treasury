<script setup lang="ts">
// 语言选择：地球图标（下方显示当前语言简称）；点开是一张小卡片，每种语言用它自己的文字书写，当前项打勾。
// 点卡片外任意处或按 Esc 关闭。
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { LANGS, type Lang } from '../i18n'

const props = defineProps<{ lang: Lang; label: string }>()
const emit = defineEmits<{ (e: 'pick', v: Lang): void }>()

const SHORT: Record<Lang, string> = { bo: 'བོད', zh: '简', zht: '繁', en: 'EN' }
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const short = computed(() => SHORT[props.lang])

function pick(v: Lang) {
  open.value = false
  if (v !== props.lang) emit('pick', v)
}
function onDoc(e: Event) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') open.value = false }
onMounted(() => { document.addEventListener('click', onDoc); document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey) })
</script>

<template>
  <div ref="root" class="pk-langmenu">
    <button
      class="pk-nav-btn pk-lang"
      type="button"
      :aria-label="label"
      :title="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="open = !open"
    >
      <!-- 语言图标（管理员提供，2026-11-18）；颜色随旁边按钮（currentColor） -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.75" />
        <path d="M3.25 12h17.5M12 3.25c-5.15 4.65-5.15 12.85 0 17.5 5.15-4.65 5.15-12.85 0-17.5Z" />
      </svg>
      <span>{{ label }}</span>
    </button>
    <ul v-if="open" class="pk-lang-pop" role="listbox">
      <li v-for="l in LANGS" :key="l.code">
        <button type="button" role="option" :aria-selected="l.code === lang" :class="{ on: l.code === lang }" :lang="l.code === 'zht' ? 'zh-Hant' : l.code" @click="pick(l.code)">
          <span>{{ l.label }}</span>
          <svg v-if="l.code === lang" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
