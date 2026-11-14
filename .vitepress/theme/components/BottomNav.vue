<script setup lang="ts">
// 底部导航（按示意图，去掉“人头”）：主页 · 收藏 · 留言
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
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        <path d="M10.2 20v-4.2a1.8 1.8 0 0 1 3.6 0V20" fill="none" stroke="currentColor" stroke-width="1.7" />
      </svg>
      <span>{{ t('home') }}</span>
    </a>
    <a :href="link('/saved/')" :class="{ on: on('/saved') }">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M12 6.5C10 5 6.5 4.5 3 5v13.5c3.5-.5 7 0 9 1.5 2-1.5 5.5-2 9-1.5V5c-3.5-.5-7 0-9 1.5zM12 6.5V20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
      </svg>
      <span>{{ t('saved') }}</span>
    </a>
    <a :href="link('/message/')" :class="{ on: on('/message') }">
      <svg viewBox="0 0 24 24" width="28" height="26" aria-hidden="true">
        <path d="M9.5 4C5.4 4 2.5 6.6 2.5 9.8c0 1.8.9 3.3 2.3 4.4L4.3 17l3.1-1.6c.7.2 1.4.3 2.1.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        <path d="M15 9c3.6 0 6.5 2.3 6.5 5.2 0 1.5-.8 2.9-2 3.8l.5 2.5-2.8-1.4c-.7.2-1.4.3-2.2.3-3.6 0-6.5-2.3-6.5-5.2S11.4 9 15 9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        <circle cx="7" cy="9.5" r=".9" fill="currentColor" /><circle cx="10.5" cy="9" r=".9" fill="currentColor" />
        <circle cx="13" cy="14" r=".9" fill="currentColor" /><circle cx="17" cy="14" r=".9" fill="currentColor" />
      </svg>
      <span>{{ t('message') }}</span>
    </a>
  </nav>
</template>
