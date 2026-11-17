<script setup lang="ts">
// 右上角导航（明黄页眉里）：主页 · 色调 · 语言。图标下方一律显示文字，任何设备都一样。
// 关于我们 · 收藏 · 词典 · 留言 在页面最底部（FootNav.vue）。
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { useI18n, localePath, rootPathOf, type Lang } from '../i18n'
import LangMenu from './LangMenu.vue'

const emit = defineEmits<{ (e: 'lang', v: Lang): void }>()
const { isDark } = useData()
const route = useRoute()
const { lang, t } = useI18n()
const here = computed(() => rootPathOf(route.path))
const on = (p: string) => (p === '/' ? here.value === '/' : here.value.startsWith(p))
const link = (p: string) => withBase(localePath(lang.value, p))
function toggleTone() { isDark.value = !isDark.value }
</script>

<template>
  <nav class="pk-nav" :aria-label="t('home')">
    <a class="pk-nav-btn" :class="{ on: on('/') }" :href="link('/')" :title="t('home')" :aria-label="t('home')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3.25 10.25 12 3.5l8.75 6.75M5.5 8.55V19a1.5 1.5 0 0 0 1.5 1.5h3V15a2 2 0 0 1 4 0v5.5h3a1.5 1.5 0 0 0 1.5-1.5V8.55" />
      </svg>
      <span>{{ t('home') }}</span>
    </a>
    <button class="pk-nav-btn pk-tone" type="button" :title="t('tone')" :aria-label="t('tone')" @click="toggleTone">
      <svg class="ic-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" fill="currentColor" />
        <g stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </g>
      </svg>
      <svg class="ic-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M20.7 14.6A8.5 8.5 0 0 1 9.4 3.3a8.5 8.5 0 1 0 11.3 11.3z" />
      </svg>
      <span>{{ t('tone') }}</span>
    </button>
    <LangMenu :lang="lang" :label="t('language')" @pick="(v) => emit('lang', v)" />
  </nav>
</template>
