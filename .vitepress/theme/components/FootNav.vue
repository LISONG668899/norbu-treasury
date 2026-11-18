<script setup lang="ts">
// 页面最底部：金刚杵 + 版权，下面一条明黄色带，放 关于我们 · 收藏 · 词典 · 留言。
// 图标下方一律显示文字，任何设备都一样。
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
  <footer class="pk-footer">
    <img class="pk-footer-icon" :src="withBase('/logo-vajra.png')" alt="" />
    <div class="pk-footer-text">© 2026 PUNDARIKA</div>
  </footer>
  <div class="pk-band pk-band-bottom" :class="`ui-${lang}`">
    <nav class="pk-nav pk-footnav" :aria-label="t('about')">
      <a class="pk-nav-btn" :class="{ on: on('/about') }" :href="link('/about/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="7.25" r="3.25" /><path d="M2.75 20v-1.5a6.25 6.25 0 0 1 12.5 0V20ZM16 4.25a3.25 3.25 0 0 1 0 6.5M17.75 13a5.5 5.5 0 0 1 3.5 5.15V20h-3" />
        </svg>
        <span>{{ t('about') }}</span>
      </a>
      <a class="pk-nav-btn" :class="{ on: on('/saved') }" :href="link('/saved/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6.25 3.25h11.5v17.5L12 16.5l-5.75 4.25Z" />
        </svg>
        <span>{{ t('saved') }}</span>
      </a>
      <a class="pk-nav-btn" :class="{ on: on('/dictionary') }" :href="link('/dictionary/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <!-- 词典图标：打开的书（管理员提供，2026-11-18） -->
          <path d="M3.75 4.5C7.1 4.1 9.85 5.05 12 7.15c2.15-2.1 4.9-3.05 8.25-2.65v14.1c-3.35-.4-6.1.55-8.25 2.15-2.15-1.6-4.9-2.55-8.25-2.15ZM12 7.15v13.6" />
        </svg>
        <span>{{ t('dictionary') }}</span>
      </a>
      <a class="pk-nav-btn" :class="{ on: on('/message') }" :href="link('/message/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <!-- 留言图标：对话框（管理员提供，2026-11-18） -->
          <path d="M6 4.25h12a2.75 2.75 0 0 1 2.75 2.75v8A2.75 2.75 0 0 1 18 17.75H8l-4.75 3V7A2.75 2.75 0 0 1 6 4.25Z" />
          <path d="M7.75 9h8.5M7.75 13h5.5" />
        </svg>
        <span>{{ t('message') }}</span>
      </a>
    </nav>
  </div>
</template>
