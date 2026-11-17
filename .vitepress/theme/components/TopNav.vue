<script setup lang="ts">
// 右上角导航：主页 · 关于我们 · 收藏 · 词典 · 留言 ｜ 色调 · 语言
// 图标为管理员提供的成套线描（24×24、线宽 1.7），颜色随主题变化。
// 电脑上图标下方显示文字；手机上只显示图标（文字作为提示与无障碍标签保留）。
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
    <a class="pk-nav-btn" :class="{ on: on('/about') }" :href="link('/about/')" :title="t('about')" :aria-label="t('about')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="7.25" r="3.25" /><path d="M2.75 20v-1.5a6.25 6.25 0 0 1 12.5 0V20ZM16 4.25a3.25 3.25 0 0 1 0 6.5M17.75 13a5.5 5.5 0 0 1 3.5 5.15V20h-3" />
      </svg>
      <span>{{ t('about') }}</span>
    </a>
    <a class="pk-nav-btn" :class="{ on: on('/saved') }" :href="link('/saved/')" :title="t('saved')" :aria-label="t('saved')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6.25 3.25h11.5v17.5L12 16.5l-5.75 4.25Z" />
      </svg>
      <span>{{ t('saved') }}</span>
    </a>
    <a class="pk-nav-btn" :class="{ on: on('/dictionary') }" :href="link('/dictionary/')" :title="t('dictionary')" :aria-label="t('dictionary')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5.25 18.25V5a2 2 0 0 1 2-2h12.5v14.5H7.25a1.75 1.75 0 0 0 0 3.5h12.5M19.75 17.5V21M8 3v14.5" />
        <path d="m10.5 13 1.6-5.5 1.6 5.5m-2.65-1.8h2.1m4.5-1.8V13m0-2.9c-.8-1.1-2.35-.6-2.35 1.05s1.55 2.15 2.35 1.05" />
      </svg>
      <span>{{ t('dictionary') }}</span>
    </a>
    <a class="pk-nav-btn" :class="{ on: on('/message') }" :href="link('/message/')" :title="t('message')" :aria-label="t('message')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m8 15 2-7 6.25-4.5 4.25 4.25L16 14l-8 1Zm0 0 5.25-5.25M10 8l6 6M3.5 20c2.3-2.3 4.4-2.6 6.2-1.4s3.1 1.55 5.2.6c1.55-.7 3.3-.9 5.6-.45" />
      </svg>
      <span>{{ t('message') }}</span>
    </a>

    <span class="pk-nav-sep" aria-hidden="true"></span>

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
