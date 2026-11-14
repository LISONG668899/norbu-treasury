<script setup lang="ts">
// 底部导航：主页 · 关于我们 · 收藏 · 留言（图标为管理员提供的成套线描，颜色随主题变化）
// 页面短时停在页尾；页面长时贴住屏幕底部，随时可点
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { useI18n, localePath, rootPathOf } from '../i18n'

const route = useRoute()
const { lang, t } = useI18n()
const here = computed(() => rootPathOf(route.path))
const on = (p: string) => here.value.startsWith(p)
const link = (p: string) => withBase(localePath(lang.value, p))
</script>

<template>
  <nav class="pk-bottomnav">
    <a :href="link('/')" :class="{ on: here === '/' }">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3.25 10.25 12 3.5l8.75 6.75M5.5 8.55V19a1.5 1.5 0 0 0 1.5 1.5h3V15a2 2 0 0 1 4 0v5.5h3a1.5 1.5 0 0 0 1.5-1.5V8.55" />
      </svg>
      <span>{{ t('home') }}</span>
    </a>
    <a :href="link('/about/')" :class="{ on: on('/about') }">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="7.25" r="3.25" /><path d="M2.75 20v-1.5a6.25 6.25 0 0 1 12.5 0V20ZM16 4.25a3.25 3.25 0 0 1 0 6.5M17.75 13a5.5 5.5 0 0 1 3.5 5.15V20h-3" />
      </svg>
      <span>{{ t('about') }}</span>
    </a>
    <a :href="link('/saved/')" :class="{ on: on('/saved') }">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 6.1C9.6 4.35 6.3 4.15 3.25 5.15v14c3.05-1 6.35-.8 8.75.95 2.4-1.75 5.7-1.95 8.75-.95v-14c-3.05-1-6.35-.8-8.75.95ZM12 6.1v14" />
      </svg>
      <span>{{ t('saved') }}</span>
    </a>
    <a :href="link('/message/')" :class="{ on: on('/message') }">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m8 15 2-7 6.25-4.5 4.25 4.25L16 14l-8 1Zm0 0 5.25-5.25M10 8l6 6M3.5 20c2.3-2.3 4.4-2.6 6.2-1.4s3.1 1.55 5.2.6c1.55-.7 3.3-.9 5.6-.45" />
      </svg>
      <span>{{ t('message') }}</span>
    </a>
  </nav>
</template>
